// Chapter 5 controller: the whole book in the GML-006 design (one slim bar, ? beside each problem,
// solution pane on the right). Data comes from data/*.json, built by tools/build-chapter5.py.
import { KEY, LESSON51, LEGACY, blank, load, valid, backup } from './lib/storage.js';
import { paint, point, hit } from './lib/ink.js';

const $ = (id) => document.getElementById(id);
const SVG_NS = 'http://www.w3.org/2000/svg';
const fetchJSON = async (p) => { const r = await fetch(p); if (!r.ok) throw new Error(`Could not load ${p}`); return r.json(); };

function icon(name, cls = 'icon') {
  const svg = document.createElementNS(SVG_NS, 'svg'), use = document.createElementNS(SVG_NS, 'use');
  svg.setAttribute('class', cls); svg.setAttribute('aria-hidden', 'true'); use.setAttribute('href', '#i-' + name);
  svg.append(use); return svg;
}
function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

try {
  const [manifest, fields, questions] = await Promise.all(['manifest', 'fields', 'questions'].map((n) => fetchJSON(`data/${n}.json`)));
  const numbers = manifest.pages.map((p) => p.number);
  const pageInfo = (p) => manifest.pages.find((x) => x.number === p);
  const sectionOf = (p) => manifest.sections.find((s) => s.pages.includes(p));
  const fieldKeys = Object.entries(fields).flatMap(([p, fs]) => fs.map((f) => p + '_' + f.id));
  const asset = (p) => pageInfo(p).asset;

  /* ---------- State + persistence ---------- */
  let state, blocked = false;
  try { state = load(localStorage, numbers, fieldKeys); }
  catch (e) { state = blank(numbers[0]); blocked = true; setStatus(e.message, true); }
  let page = state.page, mode = 'type', width = 700, scaleMode = 'width';
  let selected = null, current = null, gesture = null, pan = null, lastFocus = null;
  const undo = {}, redo = {};

  function setStatus(text, error = false) { $('saveStatus').textContent = text; document.body.dataset.error = String(error); }
  function save() {
    if (blocked) return false;
    try { localStorage.setItem(KEY, backup(state)); setStatus('Saved in this browser'); return true; }
    catch { setStatus('Could not save. Export a backup now.', true); return false; }
  }

  /* ---------- Undo / redo (per page, session-local) ---------- */
  function snapshot() { return JSON.stringify({ answers: Object.fromEntries(Object.entries(state.answers).filter(([k]) => k.startsWith(page + '_'))), ink: state.ink[page] || [] }); }
  function checkpoint(previous = snapshot()) { (undo[page] ??= []).push(previous); if (undo[page].length > 100) undo[page].shift(); redo[page] = []; updateHistory(); }
  function updateHistory() { $('undo').disabled = !undo[page]?.length; $('redo').disabled = !redo[page]?.length; }
  function historyStep(from, to) {
    if (!from[page]?.length) return;
    (to[page] ??= []).push(snapshot());
    const s = JSON.parse(from[page].pop());
    for (const k of Object.keys(state.answers)) if (k.startsWith(page + '_')) delete state.answers[k];
    Object.assign(state.answers, s.answers); state.ink[page] = s.ink; save(); render();
  }

  /* ---------- Question labels ---------- */
  const isNumbered = (q) => /^\d/.test(q.id);
  function label(q) {
    const [first, ...rest] = q.title.split(' · ');
    // Number as printed: "Problem 7 · …" / "13 · …" / "15A · …" give 7 / 13 / 15A (ids like "1total" are internal).
    const printed = q.title.match(/^(?:Problem\s+)?(\d+[A-Za-z]?)\b/);
    if (isNumbered(q) || printed) return { heading: `Question ${(printed ? printed[1] : q.id).toUpperCase()}`, detail: rest.join(' · ') };
    return { heading: first, detail: rest.join(' · ') };
  }

  /* ---------- Page label ---------- */
  function updateNav() {
    $('pages').value = page; $('prev').disabled = page === numbers[0]; $('next').disabled = page === numbers.at(-1);
    const sec = sectionOf(page); $('sectionLabel').textContent = sec.label; $('sectionLabel').title = sec.title || sec.label;
    document.title = `${sec.label} · Gabriella's Math Lab`;
  }

  /* ---------- Textbook page ---------- */
  function sheet(p, printing = false) {
    const host = el('div', 'sheet'); host.dataset.page = p;
    const img = el('img', 'source'); img.src = asset(p); img.alt = `Original textbook page ${p} · ${sectionOf(p).label}`; img.draggable = false; host.append(img);
    const layer = el('div', 'layer');
    const svg = document.createElementNS(SVG_NS, 'svg'); svg.classList.add('ink'); svg.setAttribute('viewBox', '0 0 612 792'); svg.setAttribute('aria-label', `Handwriting on page ${p}`);
    paint(svg, state.ink[p] || []); layer.append(svg);
    const responses = el('div', 'responses');
    for (const f of fields[p] || []) {
      const r = el(printing ? 'div' : 'textarea', 'response'); r.dataset.id = f.id;
      const [x, y, w, h] = f.rect;
      Object.assign(r.style, { left: x * 100 + '%', top: y * 100 + '%', width: w * 100 + '%', height: h * 100 + '%', fontSize: 'calc(var(--page-width) * .015)' });
      const key = p + '_' + f.id;
      if (printing) r.textContent = state.answers[key] || '';
      else {
        r.setAttribute('aria-label', `Page ${p}, answer ${f.id}`); r.spellcheck = false; r.value = state.answers[key] || '';
        r.placeholder = ' '; if (f.multi) r.dataset.multi = '';
        let before;
        r.addEventListener('focus', () => { before = snapshot(); });
        r.addEventListener('input', () => { state.answers[key] = r.value; save(); });
        r.addEventListener('change', () => { if (before !== snapshot()) checkpoint(before); before = snapshot(); });
      }
      responses.append(r);
    }
    layer.append(responses);
    if (!printing) {
      for (const q of questions[p] || []) {
        const { heading, detail } = label(q);
        const b = el('button', 'marker ' + q.side);
        b.style.top = q.anchor * 100 + '%'; b.dataset.y = q.anchor;
        b.textContent = '?';
        b.title = `Help with ${heading}`; b.dataset.question = q.id;
        b.setAttribute('aria-label', `Help with ${heading}${detail ? ', ' + detail : ''}`);
        b.onclick = () => openQuestion(q, b);
        layer.append(b);
      }
      svg.addEventListener('pointerdown', (e) => {
        if (!['pen', 'eraser'].includes(mode) || !e.isPrimary) return;  // a second finger means pinch, not a stroke
        e.preventDefault(); svg.setPointerCapture(e.pointerId); gesture = snapshot();
        const pt = point(e, svg);
        if (mode === 'pen') { current = [pt]; (state.ink[page] ??= []).push(current); } else erase(pt);
        paint(svg, state.ink[page] || []);
      });
      svg.addEventListener('pointermove', (e) => {
        if (gesture === null || !e.isPrimary) return;
        if (mode === 'pen' && current) current.push(point(e, svg)); else if (mode === 'eraser') erase(point(e, svg));
        paint(svg, state.ink[page] || []);
      });
      for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) svg.addEventListener(ev, finish);
    }
    host.append(layer); return host;
  }
  function erase(pt) { state.ink[page] = (state.ink[page] || []).filter((st) => !hit(st, pt)); }
  function finish() { if (gesture === null) return; const before = gesture; gesture = null; current = null; if (before !== snapshot()) checkpoint(before); save(); }

  function render() {
    finish();
    $('stage').replaceChildren(sheet(page));
    updateNav(); updateHistory(); applyZoom();
    setTimeout(prefetchSection, 1500);
    if (selected) highlight(selected, false);
  }

  /* ---------- Zoom + pan ---------- */
  function applyZoom() {
    const viewer = $('viewer'), cs = getComputedStyle(viewer);
    const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight), padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const available = Math.max(160, viewer.clientWidth - padX);
    if (scaleMode === 'width') width = Math.min(available, 1000);
    else if (scaleMode === 'page') width = Math.min(available, Math.max(160, (viewer.clientHeight - padY) * 612 / 792));
    else if (scaleMode === 'actual') width = 816;
    width = Math.max(160, Math.min(3264, width));
    $('stage').style.width = width + 'px'; $('stage').style.setProperty('--page-width', width + 'px');
    $('zoomLabel').textContent = Math.round(width / 816 * 100) + '%';
    spaceMarkers();
  }
  // Keep neighbouring ? buttons from overlapping when the page is small: push apart from the top down.
  function spaceMarkers() {
    const sheetEl = $('stage').querySelector('.sheet'); if (!sheetEl) return;
    const H = sheetEl.clientHeight, size = 44, gap = 48;
    for (const side of ['left', 'right']) {
      const ms = [...sheetEl.querySelectorAll('.marker.' + side)].sort((a, b) => a.dataset.y - b.dataset.y);
      let prev = -Infinity;
      for (const m of ms) { const y = Math.max(m.dataset.y * H, prev + gap, size / 2); m.style.top = y + 'px'; prev = y; }
      for (let i = ms.length - 1, next = Infinity; i >= 0; i--) { const y = Math.min(parseFloat(ms[i].style.top), next - gap, H - size / 2); ms[i].style.top = y + 'px'; next = y; }
    }
  }
  function zoom(f) { scaleMode = 'manual'; width *= f; applyZoom(); }

  /* ---------- Page navigation ---------- */
  function goto(p, pushHistory = true, landing = 'first') {
    if (!numbers.includes(p)) p = numbers[0];
    finish(); document.activeElement?.blur?.();
    page = p; state.page = p; save();
    if (pushHistory && location.hash !== `#page=${p}`) location.hash = `page=${p}`;
    if (!$('help').hidden) hideHelp(false);
    selected = null;
    render(); $('viewer').scrollTo(0, 0);
    if (problemView) focusProblem(landing === 'last' ? (questions[page] || []).length - 1 : 0);
  }
  function setMode(m) {
    finish(); mode = m; document.body.dataset.mode = m;
    document.querySelectorAll('[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
  }

  /* ---------- Solution card ---------- */
  function openQuestion(q, trigger) {
    selected = q; lastFocus = trigger || lastFocus;
    const { heading, detail } = label(q);
    $('helpTitle').textContent = heading; $('helpDetail').textContent = detail;
    $('help').dataset.question = q.id;
    $('hint').textContent = q.hint;
    $('steps').replaceChildren(...q.steps.map((s) => el('li', '', s)));
    $('answer').textContent = q.answer;
    $('answerBadge').textContent = q.openEnded ? 'Sample answer' : 'Verified';
    $('answerBadge').title = q.openEnded ? 'Other answers can also be correct when well explained.' : q.verification || '';
    $('help').scrollTop = 0;
    $('help').hidden = false;
    document.body.classList.add('help-open');
    // Only the phone bottom sheet overlaps the page; reserve room under the page for it.
    if (getComputedStyle($('help')).position === 'fixed') document.body.style.setProperty('--help-h', ($('help').offsetHeight + 12) + 'px');
    applyZoom(); highlight(q, true);
    $('helpTitle').focus({ preventScroll: true });
  }
  function hideHelp(restoreFocus = true) {
    const q = selected; selected = null;
    $('help').hidden = true; document.body.classList.remove('help-open'); document.body.style.removeProperty('--help-h');
    clearHighlight(); applyZoom();
    if (problemView) { const cq = (questions[page] || [])[qi]; if (cq) highlight(cq, false); if (restoreFocus) $('probHelp').focus(); syncHelpButton(); return; }
    if (!restoreFocus) return;
    // Return focus to the textbook: the question's ? button, else the page.
    const marker = q && $('stage').querySelector(`.marker[data-question="${q.id}"]`);
    (marker || $('viewer')).focus({ preventScroll: !marker });
  }
  // Outline the question on the page (overlay only) and bring it into view above the card.
  function highlight(q, scroll) {
    clearHighlight();
    const layer = $('stage').querySelector('.layer'); if (!layer) return;
    const [x, y, w, h] = q.crop, ring = el('div', 'q-focus');
    Object.assign(ring.style, { left: x * 100 + '%', top: y * 100 + '%', width: w * 100 + '%', height: h * 100 + '%' });
    ring.setAttribute('aria-hidden', 'true'); layer.append(ring);
    layer.querySelector(`.marker[data-question="${q.id}"]`)?.classList.add('active');
    if (scroll) requestAnimationFrame(() => {
      const v = $('viewer'), vr = v.getBoundingClientRect(), rr = ring.getBoundingClientRect();
      const helpTop = $('help').hidden ? vr.bottom : Math.min(vr.bottom, $('help').getBoundingClientRect().top);
      if (rr.top < vr.top || rr.bottom > helpTop) v.scrollBy({ top: rr.top - vr.top - 24, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
  }
  function clearHighlight() {
    $('stage').querySelectorAll('.q-focus').forEach((n) => n.remove());
    $('stage').querySelectorAll('.marker.active').forEach((n) => n.classList.remove('active'));
  }
  $('closeHelp').onclick = () => hideHelp();
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('help').hidden) hideHelp(); });

  /* ---------- Wiring: navigation, tools, menu ---------- */
  for (const sec of manifest.sections) {
    const g = document.createElement('optgroup'); g.label = sec.title ? `${sec.label} · ${sec.title}` : sec.label;
    for (const n of sec.pages) { const o = el('option', '', `Page ${n}`); o.value = n; g.append(o); }
    $('pages').append(g);
  }
  $('pages').onchange = () => goto($('pages').value);
  $('prev').onclick = () => goto(numbers[numbers.indexOf(page) - 1]);
  $('next').onclick = () => goto(numbers[numbers.indexOf(page) + 1]);
  window.addEventListener('hashchange', () => { const p = new URLSearchParams(location.hash.slice(1)).get('page'); if (p !== page) goto(p, false); });

  document.querySelectorAll('[data-mode]').forEach((b) => { b.onclick = () => setMode(b.dataset.mode); });
  $('undo').onclick = () => historyStep(undo, redo);
  $('redo').onclick = () => historyStep(redo, undo);
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !['TEXTAREA', 'INPUT'].includes(document.activeElement.tagName)) {
      e.preventDefault(); historyStep(e.shiftKey ? redo : undo, e.shiftKey ? undo : redo);
    }
  });

  $('fit').onchange = () => { scaleMode = $('fit').value; applyZoom(); };
  $('zoomIn').onclick = () => zoom(1.25);
  $('zoomOut').onclick = () => zoom(0.8);
  $('resetZoom').onclick = () => { scaleMode = 'width'; $('fit').value = 'width'; applyZoom(); };
  window.addEventListener('resize', () => { if (problemView) focusProblem(qi); else applyZoom(); });
  const viewer = $('viewer');
  viewer.addEventListener('pointerdown', (e) => {
    if (mode !== 'pan' || e.target.closest('button')) return;
    e.preventDefault(); viewer.setPointerCapture(e.pointerId);
    pan = { x: e.clientX, y: e.clientY, left: viewer.scrollLeft, top: viewer.scrollTop };
  });
  viewer.addEventListener('pointermove', (e) => { if (!pan) return; viewer.scrollLeft = pan.left - e.clientX + pan.x; viewer.scrollTop = pan.top - e.clientY + pan.y; });
  for (const ev of ['pointerup', 'pointercancel']) viewer.addEventListener(ev, () => { pan = null; });

  // Pinch to zoom the PAGE only (touchscreens), keeping the spot under the fingers in place.
  // The browser's own pinch is switched off for the viewer (CSS touch-action), so the bars never zoom.
  function zoomAround(newWidth, cx, cy, from) {
    const st = $('stage'), r0 = from || st.getBoundingClientRect(), k = newWidth / r0.width;
    const px = cx - r0.left, py = cy - r0.top;
    scaleMode = 'manual'; width = newWidth; applyZoom();
    const r1 = st.getBoundingClientRect(), kk = r1.width / r0.width;
    viewer.scrollLeft += r1.left + px * kk - cx; viewer.scrollTop += r1.top + py * kk - cy;
    return k;
  }
  function cancelStroke() {
    if (gesture === null) return;
    const s0 = JSON.parse(gesture); state.ink[page] = s0.ink; gesture = null; current = null;
    const svg = $('stage').querySelector('.ink'); if (svg) paint(svg, state.ink[page] || []);
  }
  let pinch = null;
  const mid = (t) => ({ x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2, d: Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY) });
  viewer.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 2) return;
    cancelStroke(); pan = null;
    const m = mid(e.touches); pinch = { d: m.d, w: width, x: m.x, y: m.y };
  }, { passive: true });
  viewer.addEventListener('touchmove', (e) => {
    if (!pinch || e.touches.length !== 2) return;
    e.preventDefault();
    const m = mid(e.touches), target = Math.max(160, Math.min(3264, pinch.w * m.d / pinch.d));
    viewer.scrollLeft -= m.x - pinch.x; viewer.scrollTop -= m.y - pinch.y; pinch.x = m.x; pinch.y = m.y;  // two-finger pan
    if (Math.abs(target - width) > 0.5) zoomAround(target, m.x, m.y);
  }, { passive: false });
  viewer.addEventListener('touchend', (e) => { if (e.touches.length < 2) pinch = null; });
  viewer.addEventListener('touchcancel', () => { pinch = null; });
  // Trackpad pinch on laptops arrives as ctrl + wheel: zoom the page around the cursor, not the browser.
  viewer.addEventListener('wheel', (e) => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    zoomAround(Math.max(160, Math.min(3264, width * Math.exp(-e.deltaY * 0.01))), e.clientX, e.clientY);
  }, { passive: false });

  function setOriginal(on) { $('original').checked = on; document.body.classList.toggle('original', on); $('originalMenu').setAttribute('aria-pressed', String(on)); }
  $('original').onchange = () => setOriginal($('original').checked);
  $('originalMenu').onclick = () => setOriginal(!$('original').checked);

  // "More" menu: close after an action, on outside click and on Escape.
  const menu = document.querySelector('.menu');
  menu.querySelectorAll('button.menu-item').forEach((b) => b.addEventListener('click', () => menu.removeAttribute('open')));
  document.addEventListener('pointerdown', (e) => { if (menu.open && !menu.contains(e.target)) menu.removeAttribute('open'); });
  menu.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.open) { e.stopPropagation(); menu.removeAttribute('open'); menu.querySelector('summary').focus(); } });

  $('save').onclick = save;
  $('clear').onclick = () => $('clearDialog').showModal();
  $('cancelClear').onclick = () => $('clearDialog').close();
  $('confirmClear').onclick = () => {
    checkpoint();
    if ($('clearTyped').checked) for (const k of Object.keys(state.answers)) if (k.startsWith(page + '_')) delete state.answers[k];
    if ($('clearInk').checked) state.ink[page] = [];
    save(); render(); $('clearDialog').close();
  };

  /* ---------- Backup, restore, print ---------- */
  function download(content, name) {
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json' })), a = document.createElement('a');
    a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  $('export').onclick = () => {
    if (blocked) {
      try { download(JSON.stringify({ saved: localStorage.getItem(KEY), lesson51: localStorage.getItem(LESSON51), legacy: localStorage.getItem(LEGACY) }), 'gabriella-chapter-5-recovery.json'); }
      catch { setStatus('Browser storage is inaccessible.', true); }
      return;
    }
    finish(); download(backup(state), 'gabriella-chapter-5-backup.json');
  };
  $('import').onchange = async () => {
    try {
      const f = $('import').files[0]; if (!f) return;
      menu.removeAttribute('open');
      if (f.size > 25 * 1024 * 1024) throw new Error('Backup is too large.');
      const imported = JSON.parse(await f.text());
      if (!valid(imported, numbers)) throw new Error('This is not a valid Chapter 5 backup.');
      if (!confirm('Replace Chapter 5 work with this backup? A recovery copy of current work will be retained.')) return;
      localStorage.setItem(KEY + ':before-restore', blocked ? (localStorage.getItem(KEY) || '') : backup(state));
      state = imported; blocked = false; goto(state.page);
    } catch (e) { alert('Restore failed: ' + e.message); }
    finally { $('import').value = ''; }
  };
  // Print the lesson (section) that is open, with the student's work.
  function buildPrint() { $('printRoot').replaceChildren(...sectionOf(page).pages.map((p) => { const s = sheet(p, true); s.style.setProperty('--page-width', '8.5in'); return s; })); }
  window.addEventListener('beforeprint', buildPrint);
  $('print').onclick = async () => { finish(); buildPrint(); await Promise.all([...$('printRoot').querySelectorAll('img')].map((im) => im.decode())); window.print(); };
  window.addEventListener('pagehide', () => { finish(); save(); });

  /* ---------- Phone problem view: the original page framed on one problem at a time ---------- */
  const PHONE = matchMedia('(max-width: 760px)');
  let problemView = false, qi = 0, VIEW_KEY = 'gml:chapter-5:view';
  const prefersPage = () => { try { return localStorage.getItem(VIEW_KEY) === 'page'; } catch { return false; } };
  const rememberView = (v) => { try { localStorage.setItem(VIEW_KEY, v); } catch { /* convenience only */ } };
  // The answer boxes that belong to a question: its own id, ids that extend it (3b, 1total, 1-r1c2), or boxes inside its crop.
  function frameOf(q) {
    const [cx, cy, cw, ch] = q.crop, inside = (r) => { const mx = r[0] + r[2] / 2, my = r[1] + r[3] / 2; return mx > cx - .03 && mx < cx + cw + .03 && my > cy - .03 && my < cy + ch + .06; };
    const own = (fields[page] || []).filter((f) => f.id === q.id || (f.id.startsWith(q.id) && !/^\d/.test(f.id.slice(q.id.length))) || inside(f.rect));
    let x0 = cx, y0 = cy, x1 = cx + cw, y1 = cy + ch;
    for (const f of own) { const [x, y, w, h] = f.rect; x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x + w); y1 = Math.max(y1, y + h); }
    const pad = .02; x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(1, x1 + pad); y1 = Math.min(1, y1 + pad);
    return [x0, y0, x1 - x0, y1 - y0];
  }
  function syncHelpButton() { $('probHelp').setAttribute('aria-pressed', String(!$('help').hidden)); }
  function focusProblem(i) {
    const list = questions[page] || [], n = list.length;
    document.body.classList.remove('free-zoom');
    if (!n) {  // nothing to answer on this page: show it whole
      qi = 0; scaleMode = 'width'; applyZoom(); clearHighlight();
      $('probTitle').textContent = sectionOf(page).label; $('probCount').textContent = `Page ${page} · nothing to answer here`;
      $('probHelp').disabled = true; $('probPrev').disabled = page === numbers[0]; $('probNext').disabled = page === numbers.at(-1);
      return;
    }
    qi = Math.max(0, Math.min(n - 1, i)); const q = list[qi], [fx, fy, fw] = frameOf(q);
    const v = $('viewer'), cs = getComputedStyle(v), avail = v.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    scaleMode = 'manual'; width = Math.min(3264, avail * 4, avail / fw); applyZoom();
    const sr = $('stage').getBoundingClientRect(), vr = v.getBoundingClientRect();
    v.scrollLeft += sr.left + fx * sr.width - vr.left - Math.max(0, (avail - fw * sr.width) / 2);
    v.scrollTop += sr.top + fy * sr.height - vr.top - 12;
    highlight(q, false);
    const { heading, detail } = label(q);
    $('probTitle').textContent = detail && heading.startsWith('Question') ? `${heading} · ${detail}` : heading;
    $('probCount').textContent = `${qi + 1} of ${n} · Page ${page}`;
    $('probHelp').disabled = false;
    $('probPrev').disabled = qi === 0 && page === numbers[0]; $('probNext').disabled = qi === n - 1 && page === numbers.at(-1);
    if (!$('help').hidden) openQuestion(q, null);
    syncHelpButton();
  }
  function stepProblem(d) {
    const n = (questions[page] || []).length;
    if (qi + d >= 0 && qi + d < n) { if (!$('help').hidden) hideHelp(false); focusProblem(qi + d); return; }
    const i = numbers.indexOf(page) + d;
    if (i >= 0 && i < numbers.length) goto(numbers[i], true, d < 0 ? 'last' : 'first');
  }
  function setProblemView(on, remember = true) {
    on = on && PHONE.matches; problemView = on;
    document.body.classList.toggle('problem-view', on);
    $('probBar').hidden = !on; $('toProblems').hidden = on || !PHONE.matches;
    if (remember && PHONE.matches) rememberView(on ? 'problem' : 'page');
    if (!$('help').hidden) hideHelp(false);
    if (on) focusProblem(qi); else { clearHighlight(); scaleMode = 'width'; applyZoom(); }
  }
  $('probPrev').onclick = () => stepProblem(-1);
  $('probNext').onclick = () => stepProblem(1);
  $('probPage').onclick = () => setProblemView(false);
  $('toProblems').onclick = () => setProblemView(true);
  $('probHelp').onclick = () => { const q = (questions[page] || [])[qi]; if (!q) return; if ($('help').hidden) openQuestion(q, $('probHelp')); else hideHelp(); syncHelpButton(); };
  PHONE.addEventListener('change', () => setProblemView(PHONE.matches && !prefersPage(), false));
  // Swipe left/right between problems (not while drawing, and not after a pinch-zoom).
  let swipe = null;
  viewer.addEventListener('touchstart', (e) => { swipe = problemView && e.touches.length === 1 && !['pen', 'eraser'].includes(mode) ? { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() } : null; }, { passive: true });
  viewer.addEventListener('touchmove', (e) => { if (e.touches.length > 1) { swipe = null; if (problemView) document.body.classList.add('free-zoom'); } }, { passive: true });
  viewer.addEventListener('touchend', (e) => {
    if (!swipe || e.touches.length) return;
    const t = e.changedTouches[0], dx = t.clientX - swipe.x, dy = t.clientY - swipe.y; swipe = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > 2 * Math.abs(dy) && !document.body.classList.contains('free-zoom')) stepProblem(dx < 0 ? 1 : -1);
  });

  /* ---------- Offline + app install ---------- */
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
  // Keep the open lesson's pages for offline use (the service worker saves each image once).
  function prefetchSection() {
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) return;
    for (const p of sectionOf(page).pages) if (p !== page) fetch(asset(p)).catch(() => {});
  }

  /* ---------- Start ---------- */
  setMode('type');
  const initial = new URLSearchParams(location.hash.slice(1)).get('page');
  if (PHONE.matches && !prefersPage()) { problemView = true; document.body.classList.add('problem-view'); $('probBar').hidden = false; }
  else $('toProblems').hidden = !PHONE.matches;
  goto(numbers.includes(initial) ? initial : state.page, false);
  history.replaceState(null, '', `#page=${page}`);
} catch (e) {
  $('saveStatus').textContent = 'The lesson could not load: ' + e.message;
  document.body.dataset.error = 'true';
}
