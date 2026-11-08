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
    return isNumbered(q) ? { heading: `Question ${q.id.toUpperCase()}`, detail: rest.join(' · ') } : { heading: first, detail: rest.join(' · ') };
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
        if (!['pen', 'eraser'].includes(mode)) return;
        e.preventDefault(); svg.setPointerCapture(e.pointerId); gesture = snapshot();
        const pt = point(e, svg);
        if (mode === 'pen') { current = [pt]; (state.ink[page] ??= []).push(current); } else erase(pt);
        paint(svg, state.ink[page] || []);
      });
      svg.addEventListener('pointermove', (e) => {
        if (gesture === null) return;
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
  function goto(p, pushHistory = true) {
    if (!numbers.includes(p)) p = numbers[0];
    finish(); document.activeElement?.blur?.();
    page = p; state.page = p; save();
    if (pushHistory && location.hash !== `#page=${p}`) location.hash = `page=${p}`;
    if (!$('help').hidden) hideHelp(false);
    selected = null;
    render(); $('viewer').scrollTo(0, 0);
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
  window.addEventListener('resize', applyZoom);
  const viewer = $('viewer');
  viewer.addEventListener('pointerdown', (e) => {
    if (mode !== 'pan' || e.target.closest('button')) return;
    e.preventDefault(); viewer.setPointerCapture(e.pointerId);
    pan = { x: e.clientX, y: e.clientY, left: viewer.scrollLeft, top: viewer.scrollTop };
  });
  viewer.addEventListener('pointermove', (e) => { if (!pan) return; viewer.scrollLeft = pan.left - e.clientX + pan.x; viewer.scrollTop = pan.top - e.clientY + pan.y; });
  for (const ev of ['pointerup', 'pointercancel']) viewer.addEventListener(ev, () => { pan = null; });

  $('original').onchange = () => document.body.classList.toggle('original', $('original').checked);

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

  /* ---------- Start ---------- */
  setMode('type');
  const initial = new URLSearchParams(location.hash.slice(1)).get('page');
  goto(numbers.includes(initial) ? initial : state.page, false);
  history.replaceState(null, '', `#page=${page}`);
} catch (e) {
  $('saveStatus').textContent = 'The lesson could not load: ' + e.message;
  document.body.dataset.error = 'true';
}
