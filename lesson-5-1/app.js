// Lesson 5-1 controller · GML-006 card-based redesign.
// Storage format (gml:lesson-5-1:v2), ink model and data files are unchanged from GML-005.
import { KEY, LEGACY, blank, load, valid, backup } from './lib/storage.js';
import { paint, point, hit } from './lib/ink.js';

const $ = (id) => document.getElementById(id);
const SVG_NS = 'http://www.w3.org/2000/svg';
const WIDE = matchMedia('(min-width: 1180px)');
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
  const questionKeys = Object.entries(questions).flatMap(([p, qs]) => qs.map((q) => p + '_' + q.id));
  const pageInfo = (p) => manifest.pages.find((x) => x.number === p);
  const asset = (p) => pageInfo(p).asset;

  /* ---------- State + persistence ---------- */
  let state, blocked = false;
  try { state = load(localStorage); }
  catch (e) { state = blank(); blocked = true; setStatus(e.message, true); }
  let page = state.page, mode = 'type', width = 700, scaleMode = 'width';
  let selected = null, current = null, gesture = null, pan = null, lastFocus = null, quietClose = false;
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
  const done = (q) => !!state.completed[page + '_' + q.id];

  /* ---------- Progress + navigation card ---------- */
  function progress() {
    const count = questionKeys.filter((k) => state.completed[k]).length, idx = numbers.indexOf(page);
    $('completion').textContent = `${count} of ${questionKeys.length} questions done`;
    $('completionBar').style.width = (count / questionKeys.length * 100) + '%';
    $('pageProgress').textContent = `Page ${idx + 1} of ${numbers.length} in this lesson`;
    $('pageLabel').textContent = `Page ${page}`;
    $('pageOf').textContent = `of ${numbers.at(-1)}`;
    $('pageSection').textContent = pageInfo(page).section;
    $('pageSteps').replaceChildren(...numbers.map((n, i) => el('span', i < idx ? 'seen' : i === idx ? 'current' : '')));
    const n = questions[page].length;
    $('questionCount').textContent = n; $('qnavCount').textContent = n;
  }

  /* ---------- Question navigator (rail card + drawer list) ---------- */
  function questionItem(q, onClick) {
    const li = el('li'), b = el('button', 'qitem' + (done(q) ? ' complete' : ''));
    const { heading, detail } = label(q);
    const badge = el('span', 'qbadge'); badge.setAttribute('aria-hidden', 'true');
    if (isNumbered(q)) badge.textContent = q.id.toUpperCase(); else badge.append(icon('star'));
    const text = el('span', 'qtext'); text.append(el('strong', '', heading)); if (detail) text.append(el('span', '', detail));
    const st = el('span', 'qstate'); st.append(icon('check'));
    b.append(badge, text, st);
    b.dataset.question = q.id;
    b.setAttribute('aria-label', `${heading}${detail ? ', ' + detail : ''}${done(q) ? ', completed' : ''}`);
    if (selected?.id === q.id) b.setAttribute('aria-current', 'true');
    b.onclick = () => onClick(q, b);
    li.append(b); return li;
  }
  function renderRail() { $('pageQuestions').replaceChildren(...questions[page].map((q) => questionItem(q, openQuestion))); }

  /* ---------- Textbook page ---------- */
  function sheet(p, printing = false) {
    const host = el('div', 'sheet'); host.dataset.page = p;
    const img = el('img', 'source'); img.src = asset(p); img.alt = `Original textbook page ${p} · Lesson 5-1`; img.draggable = false; host.append(img);
    const layer = el('div', 'layer');
    const svg = document.createElementNS(SVG_NS, 'svg'); svg.classList.add('ink'); svg.setAttribute('viewBox', '0 0 612 792'); svg.setAttribute('aria-label', `Handwriting on page ${p}`);
    paint(svg, state.ink[p] || []); layer.append(svg);
    const responses = el('div', 'responses');
    for (const f of fields[p]) {
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
      for (const q of questions[p]) {
        const { heading, detail } = label(q);
        const b = el('button', 'marker ' + q.side + (state.completed[p + '_' + q.id] ? ' complete' : ''));
        b.style.top = q.anchor * 100 + '%';
        if (isNumbered(q)) b.textContent = q.id.toUpperCase(); else b.append(icon('star'));
        b.title = q.title; b.dataset.question = q.id;
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
    $('pages').value = page;
    $('prev').disabled = page === numbers[0]; $('next').disabled = page === numbers.at(-1);
    progress(); renderRail(); updateHistory(); applyZoom();
    if (selected) highlight(selected, false);
  }

  /* ---------- Zoom + pan ---------- */
  function applyZoom() {
    const viewer = $('viewer'), cs = getComputedStyle(viewer);
    const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight), padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const available = Math.max(160, viewer.clientWidth - padX);
    if (scaleMode === 'width') width = available;
    else if (scaleMode === 'page') width = Math.min(available, Math.max(160, (viewer.clientHeight - padY) * 612 / 792));
    else if (scaleMode === 'actual') width = 816;
    width = Math.max(160, Math.min(3264, width));
    $('stage').style.width = width + 'px'; $('stage').style.setProperty('--page-width', width + 'px');
    $('zoomLabel').textContent = Math.round(width / 816 * 100) + '%';
  }
  function zoom(f) { scaleMode = 'manual'; width *= f; applyZoom(); }

  /* ---------- Page navigation ---------- */
  function goto(p, pushHistory = true) {
    if (!numbers.includes(p)) p = numbers[0];
    finish(); document.activeElement?.blur?.();
    page = p; state.page = p; save();
    if (pushHistory && location.hash !== `#page=${p}`) location.hash = `page=${p}`;
    if ($('drawer').open) { quietClose = true; $('drawer').close(); }
    selected = null;
    render(); $('viewer').scrollTo(0, 0);
  }
  function setMode(m) {
    finish(); mode = m; document.body.dataset.mode = m;
    document.querySelectorAll('[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
  }

  /* ---------- Question assistance card ---------- */
  function showDrawer(trigger) {
    const d = $('drawer');
    if (trigger) lastFocus = trigger; else if (!d.open) lastFocus = document.activeElement;
    // Side panel when wide (page stays usable); modal drawer on smaller screens.
    if (d.open && d.matches(':modal') === WIDE.matches) { quietClose = true; d.close(); }
    document.body.classList.add('help-open');
    if (!d.open) { if (WIDE.matches) d.show(); else d.showModal(); }
    applyZoom();
    $('drawerTitle').focus({ preventScroll: true });
  }
  function listQuestions() {
    clearHighlight(); selected = null;
    $('drawer').dataset.question = '';
    $('identity').textContent = `Page ${page} · ${pageInfo(page).section}`;
    $('drawerTitle').textContent = 'Questions';
    $('drawerDetail').textContent = `${questions[page].length} on this page. Choose one for a hint, steps and the answer.`;
    $('questionList').replaceChildren(...questions[page].map((q) => questionItem(q, openQuestion)));
    $('questionList').hidden = false; $('assistance').hidden = true; $('assistFoot').hidden = true;
    renderRail(); showDrawer();
  }
  function openQuestion(q, trigger) {
    selected = q;
    const { heading, detail } = label(q), list = questions[page], i = list.indexOf(q);
    $('drawer').dataset.question = q.id;
    $('identity').textContent = `Page ${page} · ${pageInfo(page).section}`;
    $('drawerTitle').textContent = heading;
    $('drawerDetail').textContent = detail;
    $('questionList').hidden = true; $('assistance').hidden = false; $('assistFoot').hidden = false;
    $('hint').textContent = q.hint;
    $('steps').replaceChildren(...q.steps.map((s) => el('li', '', s)));
    setReveal('showSteps', 'steps', false); setReveal('reveal', 'answer', false);
    $('answer').textContent = q.answer;
    $('answerBadge').textContent = q.openEnded ? 'Sample answer' : 'Verified';
    $('answerBadge').title = q.openEnded ? 'Other answers can also be correct when well explained.' : q.verification || '';
    $('done').checked = done(q);
    $('prevQuestion').disabled = i <= 0; $('nextQuestion').disabled = i >= list.length - 1;
    // Unmodified excerpt of the original page, cropped by viewBox only.
    const svg = document.createElementNS(SVG_NS, 'svg'), im = document.createElementNS(SVG_NS, 'image');
    const [x, y, w, h] = q.crop;
    svg.setAttribute('viewBox', `${x * 612} ${y * 792} ${w * 612} ${h * 792}`); svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', `Unmodified source excerpt for ${q.title}`);
    im.setAttribute('href', asset(page)); im.setAttribute('width', '612'); im.setAttribute('height', '792');
    svg.append(im); $('sourceQuestion').replaceChildren(svg);
    $('drawer').querySelector('.assist-body').scrollTop = 0;
    renderRail(); highlight(q, true);
    showDrawer(trigger);
  }
  function setReveal(btnId, targetId, open) {
    const b = $(btnId), t = $(targetId);
    t.hidden = !open; b.setAttribute('aria-expanded', String(open));
    b.textContent = btnId === 'showSteps' ? (open ? 'Hide the steps' : 'Show the steps') : (open ? 'Hide the answer' : 'Reveal the answer');
  }
  // Outline the question on the page (overlay only) and bring it into view.
  function highlight(q, scroll) {
    clearHighlight();
    const layer = $('stage').querySelector('.layer'); if (!layer) return;
    const [x, y, w, h] = q.crop, ring = el('div', 'q-focus');
    Object.assign(ring.style, { left: x * 100 + '%', top: y * 100 + '%', width: w * 100 + '%', height: h * 100 + '%' });
    ring.setAttribute('aria-hidden', 'true'); layer.append(ring);
    layer.querySelector(`.marker[data-question="${q.id}"]`)?.classList.add('active');
    if (scroll) requestAnimationFrame(() => {
      const v = $('viewer'), vr = v.getBoundingClientRect(), rr = ring.getBoundingClientRect();
      if (rr.top < vr.top || rr.bottom > vr.bottom) v.scrollBy({ top: rr.top - vr.top - 24, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
  }
  function clearHighlight() {
    $('stage').querySelectorAll('.q-focus').forEach((n) => n.remove());
    $('stage').querySelectorAll('.marker.active').forEach((n) => n.classList.remove('active'));
  }
  function refreshCompletion() {
    $('stage').querySelectorAll('.marker').forEach((m) => m.classList.toggle('complete', !!state.completed[page + '_' + m.dataset.question]));
    renderRail(); progress();
  }

  // 'close' is dispatched asynchronously: ignore it if the panel was reopened in another mode.
  $('drawer').addEventListener('close', () => {
    if ($('drawer').open) { quietClose = false; return; }
    document.body.classList.remove('help-open');
    const q = selected; clearHighlight(); applyZoom();
    if (quietClose) { quietClose = false; renderRail(); return; }
    selected = null; renderRail();
    // Return focus to the textbook: the question's marker, else the original trigger, else the page.
    const marker = q && $('stage').querySelector(`.marker[data-question="${q.id}"]`);
    const target = marker || (lastFocus?.isConnected ? lastFocus : $('viewer'));
    target.focus({ preventScroll: !marker });
  });
  $('closeDrawer').onclick = () => $('drawer').close();
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && $('drawer').open && !$('drawer').matches(':modal')) $('drawer').close(); });
  $('showSteps').onclick = () => setReveal('showSteps', 'steps', $('steps').hidden);
  $('reveal').onclick = () => { const open = $('answer').hidden; setReveal('reveal', 'answer', open); if (open) setReveal('showSteps', 'steps', true); };
  $('done').onchange = () => { if (!selected) return; state.completed[page + '_' + selected.id] = $('done').checked; save(); refreshCompletion(); };
  const stepQuestion = (d) => { const list = questions[page], q = list[list.indexOf(selected) + d]; if (q) openQuestion(q, $('stage').querySelector(`.marker[data-question="${q.id}"]`)); };
  $('prevQuestion').onclick = () => stepQuestion(-1);
  $('nextQuestion').onclick = () => stepQuestion(1);
  $('allQuestions').onclick = listQuestions;
  $('questions').onclick = listQuestions;
  WIDE.addEventListener('change', () => { if ($('drawer').open) showDrawer(lastFocus); applyZoom(); });

  /* ---------- Wiring: navigation, tools, menu ---------- */
  for (const p of manifest.pages) { const o = el('option', '', `Page ${p.number}`); o.value = p.number; $('pages').append(o); }
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
      try { download(JSON.stringify({ saved: localStorage.getItem(KEY), legacy: localStorage.getItem(LEGACY) }), 'gabriella-recovery.json'); }
      catch { setStatus('Browser storage is inaccessible.', true); }
      return;
    }
    finish(); download(backup(state), 'gabriella-lesson-5-1-backup.json');
  };
  $('import').onchange = async () => {
    try {
      const f = $('import').files[0]; if (!f) return;
      menu.removeAttribute('open');
      if (f.size > 25 * 1024 * 1024) throw new Error('Backup is too large.');
      const imported = JSON.parse(await f.text());
      if (!valid(imported)) throw new Error('This is not a valid Lesson 5-1 backup.');
      if (!confirm('Replace Lesson 5-1 work with this backup? A recovery copy of current work will be retained.')) return;
      localStorage.setItem(KEY + ':before-restore', blocked ? (localStorage.getItem(KEY) || '') : backup(state));
      state = imported; blocked = false; goto(state.page);
    } catch (e) { alert('Restore failed: ' + e.message); }
    finally { $('import').value = ''; }
  };
  function buildPrint() { $('printRoot').replaceChildren(...numbers.map((p) => { const s = sheet(p, true); s.style.setProperty('--page-width', '8.5in'); return s; })); }
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
