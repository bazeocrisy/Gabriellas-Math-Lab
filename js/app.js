// App shell: hash routes, home page, Lesson Notes and Parent Progress.
// Routes: #/  #/d01/teach/3  #/d01/practice  #/d01/test  #/d01/notes  #/parent
(function (G) {
  'use strict';
  const app = document.getElementById('app');
  const unit = G.unit;
  const ready = (id) => unit.available(id);
  const lessonName = (id) => `Lesson ${unit.find(id).n}`;
  const fmtDate = (iso) => { try { return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); } catch (e) { return ''; } };

  const DOC_ICON = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 2h8l5 5v15H6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M14 2v5h5M9 12h7M9 16h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  /** Short progress facts for a lesson card: Teach, Practice and Test, each with text (not color alone). */
  function progressChips(l) {
    const p = G.store.lesson(l.id);
    const L = G.lessonContent[l.id];
    const last = p.tests[p.tests.length - 1];
    const teach = p.teach.done ? 'Finished ✓' : p.teach.furthest > 0 ? `Screen ${p.teach.furthest + 1} of ${L.screens.length}` : 'Not started';
    const practice = p.practice.sessions ? `${p.practice.sessions} session${p.practice.sessions === 1 ? '' : 's'}` : 'Not started';
    const test = last ? `${last.correct} of ${last.total}${last.mastered ? ' ★' : last.assisted ? ' (lesson pages opened)' : ''}` : 'Not taken';
    return `<ul class="lc-progress" aria-label="Lesson ${l.n} progress">
      <li class="chip chip-teach"><span class="chip-k">Teach</span> ${teach}</li>
      <li class="chip chip-practice"><span class="chip-k">Practice</span> ${practice}</li>
      <li class="chip chip-test"><span class="chip-k">Test</span> ${test}</li></ul>`;
  }

  /** Unfinished lesson Practice (started, not finished), or null. */
  function practiceInProgress(id) {
    const d = G.store.getDraft('practice-' + id);
    if (!d || typeof d !== 'object' || d.finished || !Array.isArray(d.states)) return null;
    const touched = d.i > 0 || d.states.some((s) => s && (s.solved || s.attempts || s.hints || s.resp != null));
    return touched ? d : null;
  }

  /**
   * The one recommended next step for a lesson, from its saved progress (nothing is changed):
   * { label, href, detail, kind, started }. kind is used for styling; started is false for an untouched lesson.
   */
  function nextStep(l) {
    const p = G.store.lesson(l.id), L = G.lessonContent[l.id], n = L.screens.length;
    const last = p.tests[p.tests.length - 1];
    const pd = practiceInProgress(l.id);
    const started = p.teach.furthest > 0 || p.teach.done || p.practice.sessions > 0 || p.tests.length > 0 || !!pd || !!G.store.openTest(l.id);
    const base = '#/' + l.id;
    if (G.store.openTest(l.id)) return { label: 'Continue the Test', href: base + '/test', detail: 'Test started, not handed in yet', kind: 'test', started };
    if (p.masteredOn) return { label: 'Review', href: base + '/teach/1', detail: 'Mastered ★', kind: 'review', started };
    if (pd) return { label: 'Continue Practice', href: base + '/practice', detail: `Practice, question ${pd.i + 1} of ${pd.set.length}`, kind: 'practice', started };
    if (p.teach.furthest > 0 && !p.teach.done) return { label: 'Continue Teach', href: `${base}/teach/${Math.min(p.teach.furthest + 1, n)}`, detail: `Teach, screen ${Math.min(p.teach.furthest + 1, n)} of ${n}`, kind: 'teach', started };
    if (!started) return { label: 'Start', href: base + '/teach/1', detail: 'Not started', kind: 'teach', started };
    if (!p.practice.sessions && !last) return { label: 'Practice', href: base + '/practice', detail: 'Teach finished', kind: 'practice', started };
    if (!last) return { label: 'Take the Test', href: base + '/test', detail: `${p.practice.sessions} practice session${p.practice.sessions === 1 ? '' : 's'} done`, kind: 'test', started };
    // A test without ★: an assisted 9 or 10 only needs a retake on its own; after practicing since the Test, take it
    // again; with Teach never opened, start there; otherwise practice first.
    const score = `${last.correct} of ${last.total}${last.assisted ? ' (pages opened)' : ''}`;
    if (last.assisted && last.correct >= 9) return { label: 'Take the Test again', href: base + '/test', detail: `Last Test ${last.correct} of ${last.total}, with lesson pages opened`, kind: 'test', started };
    if (Date.parse(p.practice.lastDate || '') > Date.parse(last.date || '')) return { label: 'Take the Test again', href: base + '/test', detail: `Practiced since your last Test (${score})`, kind: 'test', started };
    if (!p.teach.done && !p.teach.furthest) return { label: 'Review Teach', href: base + '/teach/1', detail: `Last Test ${score}: go through Teach, then practice`, kind: 'teach', started };
    return { label: 'Practice again', href: base + '/practice', detail: `Last Test ${score}: practice, then take the Test again`, kind: 'practice', started };
  }

  /** Where the student left off: the furthest lesson that is started but not mastered (an open Test first). */
  function resumeLesson() {
    const avail = unit.lessons.filter((l) => ready(l.id));
    const openT = avail.filter((l) => G.store.openTest(l.id));
    const active = avail.filter((l) => !G.store.lesson(l.id).masteredOn && nextStep(l).started);
    const l = openT.pop() || active.pop();
    if (l) return { l, s: nextStep(l), fresh: false };
    const first = avail.find((x) => !G.store.lesson(x.id).masteredOn);
    return first ? { l: first, s: nextStep(first), fresh: true } : null;
  }

  /** "Pick up where you left off" (Home) and the Learn banner. */
  function continueCard(cls) {
    const r = resumeLesson();
    if (!r) return '';
    const head = r.fresh ? (r.l.n === 1 ? 'Start here' : 'Up next') : 'Pick up where you left off';
    return `<section class="continue-card ${cls}" aria-labelledby="cont-h-${cls}">
      <div class="cont-text"><h2 id="cont-h-${cls}">${head}</h2>
        <p><b>Lesson ${r.l.n}: ${r.l.title}</b><br><span class="cont-detail">${r.s.detail}</span></p></div>
      <a class="btn btn-primary btn-big cont-go" href="${r.s.href}">${r.s.label}<span class="sr-only">: Lesson ${r.l.n}</span> <span aria-hidden="true">→</span></a>
    </section>`;
  }

  // Icons for the four main sections (drawn here, so no extra files or network requests).
  const PILLAR_ICONS = {
    learn: '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M6 11c7-3 13-2 18 2 5-4 11-5 18-2v26c-7-3-13-2-18 2-5-4-11-5-18-2z" fill="#fff" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M24 13v26" stroke="currentColor" stroke-width="3"/><path d="M11 18h7M11 24h7M30 18h7M30 24h7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
    practice: '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><circle cx="22" cy="26" r="16" fill="#fff" stroke="currentColor" stroke-width="3"/><circle cx="22" cy="26" r="9" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="22" cy="26" r="3" fill="currentColor"/><path d="M24 24l15-15M33 8h7v7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    guides: '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M13 6h17l8 8v26H13z" fill="#fff" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M30 6v8h8" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M8 12v30h24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 22h12M19 28h12M19 34h8" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
    parent: '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><rect x="6" y="8" width="36" height="32" rx="5" fill="#fff" stroke="currentColor" stroke-width="3"/><path d="M13 32V24M21 32V18M29 32v-9M37 32V14" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>'
  };
  const PILLARS = [
    { key: 'learn', href: '#/learn', title: 'Learn', text: '10 interactive decimal lessons. Each one has Teach, Practice and Test.', go: 'Start learning' },
    { key: 'practice', href: '#/practice', title: 'Practice', text: 'Pick a skill and 10, 25 or 50 questions. Get hints and step-by-step help.', go: 'Start practicing' },
    { key: 'guides', href: '#/guides', title: 'Study Guides', text: '8 colorful printable decimal workbooks to open, download and print.', go: 'Open the guides' },
    { key: 'parent', href: '#/parent', title: 'Parent Progress', text: 'Test results, mastery, practice activity and skills to review.', go: 'See progress' }
  ];

  /** The NumberNova landing page: brand, a welcome, and the four main sections. */
  function decimalHome() {
    const pausedHtml = G.practiceCenter && G.practiceCenter.pausedSummary ? G.practiceCenter.pausedSummary() : '';
    app.innerHTML = `
      <section class="nn-hero">
        <img class="nn-hero-logo" src="assets/brand/numbernova-logo.svg" alt="NumberNova. Learn. Practice. Shine." width="200" height="46">
        <div class="nn-hero-words">
          <h1 tabindex="-1">Ready to make your next math discovery?</h1>
          <p class="nn-hero-text">Learn step by step, sharpen your skills, and see how far you can go.</p>
        </div>
      </section>
      <div class="home-continue">${continueCard('cont-home')}${pausedHtml}</div>
      <nav class="nn-pillars" aria-label="Main sections">
        ${PILLARS.map((p) => `<a class="pillar pillar-${p.key}" href="${p.href}">
          <span class="pillar-icon">${PILLAR_ICONS[p.key]}</span>
          <span class="pillar-title">${p.title}</span>
          <span class="pillar-text">${p.text}</span>
          <span class="pillar-go">${p.go} <span aria-hidden="true">→</span></span>
        </a>`).join('')}
      </nav>`;
    app.classList.add('page-home');
    document.title = 'NumberNova · Learn. Practice. Shine.';
  }

  function landing() {
    app.innerHTML = `<section class="nn-hero"><img class="nn-hero-logo" src="assets/brand/numbernova-logo.svg" alt="NumberNova. Learn. Practice. Shine." width="200" height="46"><div><h1 tabindex="-1">Ready to make your next math discovery?</h1><p>Choose your learning path.</p></div></section>
      <nav class="c4-home" aria-label="Learning paths"><a class="pillar pillar-learn" href="#/decimals"><span class="pillar-title">Decimal Skills — Georgia Standards</span><span class="pillar-text">All 10 decimal lessons, Practice Center, Study Guides and Parent Progress.</span><span class="pillar-go">Open Decimal Skills →</span></a><a class="pillar pillar-practice" href="#/chapter4"><span class="pillar-title">Chapter 4 — Add and Subtract Decimals</span><span class="pillar-text">Eight textbook lessons, chapter review and final assessment. Learn, practice and show what you know.</span><span class="pillar-go">Open Chapter 4 →</span></a></nav>`;
    app.classList.add('page-home'); document.title = 'NumberNova · Learn. Practice. Shine.';
  }

  /** Learn: the ten decimal lessons, each with Teach, Practice, Test and Lesson Notes. */
  function learn() {
    const firstNew = unit.lessons.find((l) => ready(l.id) && !nextStep(l).started);
    const cards = unit.lessons.filter((l) => ready(l.id)).map((l) => {
      const mastered = !!G.store.lesson(l.id).masteredOn;
      const s = nextStep(l);
      if (!s.started && l !== firstNew) s.kind = 'quiet';
      return `<article class="lesson-card${mastered ? ' is-mastered' : ''}" aria-labelledby="lc-${l.id}">
        <div class="lc-head">
          <span class="lc-num" aria-hidden="true">${l.n}</span>
          <div class="lc-titles"><p class="lesson-num">Lesson ${l.n}</p><h3 id="lc-${l.id}">${l.title}</h3></div>
          ${mastered ? '<span class="lc-badge">★ Mastered</span>' : ''}${l.supplemental ? '<span class="lc-extra">Extra: beyond Grade 5</span>' : ''}
        </div>
        <p class="lc-blurb">${l.blurb}</p>
        ${progressChips(l)}
        <a class="btn btn-big lc-next lc-next-${s.kind}" href="${s.href}">${s.label}<span class="sr-only">: Lesson ${l.n}</span> <span aria-hidden="true">→</span></a>
        <nav class="lc-links" aria-label="Lesson ${l.n} parts">
          <a class="lc-link lc-teach" href="#/${l.id}/teach/1">Teach</a>
          <a class="lc-link lc-practice" href="#/${l.id}/practice">Practice</a>
          <a class="lc-link lc-test" href="#/${l.id}/test">Test</a>
          <a class="lc-link btn-notes" href="#/${l.id}/notes">${DOC_ICON}<span>Notes</span><span class="sr-only"> for Lesson ${l.n} (printable)</span></a>
        </nav>
      </article>`;
    }).join('');
    const later = unit.lessons.filter((l) => !ready(l.id)).map((l) => `<li><span class="later-num">Lesson ${l.n}</span><span class="later-title">${l.title}${/supplemental/.test(l.blurb) ? '<span class="later-note">Includes supplemental skills</span>' : ''}</span><span class="later-tag">Coming later</span></li>`).join('');
    app.innerHTML = `
      <div class="crumbs"><a href="#/">← Home</a></div>
      <section class="hero hero-learn">
        <p class="section-kicker">Learn</p>
        <h1 tabindex="-1">Decimal lessons</h1>
        <p class="hero-sub">Grade 5 Mathematics · Georgia Milestones Preparation</p>
        <p class="hero-sub2">Each lesson explains an idea, shows how, guides you through it, lets you practice with hints, and ends with a test you do on your own.</p>
      </section>
      ${continueCard('cont-learn')}
      <section aria-labelledby="unit-h">
        <h2 id="unit-h" class="unit-title">${unit.title} <span class="unit-count">${unit.lessons.length} lessons</span></h2>
        <p class="legend"><span class="legend-item legend-teach">Teach: learn it</span><span class="legend-item legend-practice">Practice: try it with hints</span><span class="legend-item legend-test">Test: show what you know</span></p>
        <div class="lesson-grid">${cards}</div>
        ${later ? `<h3 class="later-h">Coming later</h3>\n        <ul class="later-list">${later}</ul>` : ''}
      </section>`;
    app.classList.add('page-home');
    document.title = 'Learn · NumberNova';
  }

  function notes(lessonId) {
    const L = G.lessonContent[lessonId];
    app.innerHTML = `
      <div class="crumbs no-print"><a href="#/learn">← Lesson menu</a></div>
      <article class="notes">
        <p class="mode-label">${lessonName(lessonId)} · Lesson Notes</p>
        <h1 tabindex="-1">${L.title}</h1>
        <p class="no-print"><button type="button" class="btn" data-act="print">Print these notes</button></p>
        ${L.notes}
      </article>
      <div class="no-print">${G.guides ? G.guides.link(G.guides.forLesson(lessonId), 'Matching printable study guide') : ''}</div>
      <div class="done-actions no-print">
        <a class="btn btn-big btn-teach" href="#/${lessonId}/teach/1">Teach</a>
        <a class="btn btn-big btn-practice" href="#/${lessonId}/practice">Practice</a>
        <a class="btn btn-big btn-test" href="#/${lessonId}/test">Test</a>
      </div>`;
    app.querySelector('[data-act="print"]').addEventListener('click', () => window.print());
    document.title = `${L.title} · Lesson Notes · NumberNova`;
  }

  /** Parent Progress: Practice Center activity (practice only, never mastery). */
  function practiceCenterBlock() {
    const PC = G.practiceCenter, PG = G.practiceGen;
    if (!PC || !PG) return '';
    const h = PC.history(), list = h.sessions.slice().reverse();
    const done = list.reduce((a, s) => a + (s.completed || 0), 0), right = list.reduce((a, s) => a + (s.correct || 0), 0);
    const clean = list.reduce((a, s) => a + (s.clean || 0), 0), hints = list.reduce((a, s) => a + (s.hints || 0), 0);
    const weak = PC.weakSkills();
    const paused = PC.loadSession();
    const pct = (a, b) => (b ? Math.round((a / b) * 100) + '%' : '-');
    return `<section class="card parent-practice" aria-labelledby="pp-h">
      <h2 id="pp-h">Practice Center <span class="fine">(practice only: never counts as a Test or for ★ Mastered)</span></h2>
      ${list.length ? `<dl class="facts-dl">
          <dt>Sessions finished</dt><dd>${list.length}</dd>
          <dt>Questions answered</dt><dd>${done}</dd>
          <dt>Correct</dt><dd>${right} of ${done} (${pct(right, done)})</dd>
          <dt>Correct on the first try with no hints</dt><dd>${clean} of ${done} (${pct(clean, done)})</dd>
          <dt>Hints used</dt><dd>${hints}</dd>
        </dl>
        <h3>Recent practice</h3>
        <div class="table-wrap"><table class="skills-table pp-table"><thead><tr><th scope="col">Date</th><th scope="col">Practice</th><th scope="col">Questions</th><th scope="col">Correct</th><th scope="col">No hints</th><th scope="col">Hints</th></tr></thead><tbody>
          ${list.slice(0, 10).map((s) => `<tr><td>${fmtDate(s.date)}</td><td>${G.models.esc(s.label)}</td><td>${s.completed} of ${s.n}</td><td>${s.correct}</td><td>${s.clean}</td><td>${s.hints}</td></tr>`).join('')}
        </tbody></table></div>` : '<p>No Practice Center sessions finished yet.</p>'}
      ${paused && !paused.finished ? `<p>In progress: ${G.models.esc(paused.label)}, question ${paused.i + 1} of ${paused.n}.</p>` : ''}
      <h3>Skills to review <span class="fine">(from practice mistakes)</span></h3>
      ${weak.length ? `<ul>${weak.map((w) => `<li>${G.models.esc(PG.SKILLS[w.skill].name)} <span class="fine">(${G.models.esc(w.from)})</span></li>`).join('')}</ul><p><a class="btn" href="#/practice">Practice these in the Practice Center</a> <span class="fine">(choose Practice My Misses)</span></p>` : '<p>None recorded yet.</p>'}
    </section>`;
  }

  /** Parent Progress overview: five tiles, from the same saved data as the details below. */
  function parentOverview(shown, done) {
    const esc = G.models.esc, week = Date.now() - 7 * 864e5;
    const inWeek = (iso) => { const t = Date.parse(iso || ''); return Number.isFinite(t) && t >= week; };
    const r = resumeLesson();
    const current = done.length === shown.length ? 'All lessons mastered ★' : r ? `Lesson ${r.l.n}: ${esc(r.l.title)}` : '-';
    const currentSub = r && done.length !== shown.length ? esc(r.s.detail) : '';
    let latest = null;
    shown.forEach((l) => { const p = G.store.lesson(l.id), t = p.tests[p.tests.length - 1]; if (t && (!latest || Date.parse(t.date) > Date.parse(latest.t.date))) latest = { l, t }; });
    const pcWeek = G.practiceCenter ? G.practiceCenter.history().sessions.filter((s) => inWeek(s.date)).length : 0;
    const lessonsWeek = shown.filter((l) => inWeek(G.store.lesson(l.id).practice.lastDate)).length;
    // Skills to review: missed on the latest test of lessons not mastered yet, then Practice Center misses.
    const review = [];
    shown.forEach((l) => {
      const p = G.store.lesson(l.id), t = p.tests[p.tests.length - 1], bank = G.engine.banks[l.id];
      if (!t || p.masteredOn) return;
      Object.keys(bank.skills).forEach((sk) => { if (t.skills[sk] && t.skills[sk].correct < t.skills[sk].total) review.push(`${bank.skills[sk]} <span class="fine">(Lesson ${l.n})</span>`); });
    });
    if (G.practiceCenter && G.practiceGen) G.practiceCenter.weakSkills().forEach((w) => review.push(`${esc(G.practiceGen.SKILLS[w.skill].name)} <span class="fine">(practice)</span>`));
    const tile = (k, v, sub, cls) => `<li class="pp-tile ${cls}"><span class="pp-k">${k}</span><span class="pp-v">${v}</span>${sub ? `<span class="pp-sub">${sub}</span>` : ''}</li>`;
    return `<section class="pp-overview" aria-labelledby="po-h"><h2 id="po-h" class="sr-only">Overview</h2><ul class="pp-tiles">
      ${tile('Lessons mastered', `${done.length} of ${shown.length}`, done.length ? '★ 9 of 10 on a Test done on its own' : 'None yet', 'pt-mastered')}
      ${tile('Current lesson', current, currentSub, 'pt-current')}
      ${tile('Latest Test', latest ? `${latest.t.correct} of ${latest.t.total}${latest.t.mastered ? ' ★' : ''}` : 'None yet', latest ? `Lesson ${latest.l.n}, ${fmtDate(latest.t.date)}` : '', 'pt-test')}
      ${tile('Practice this week', pcWeek + lessonsWeek ? `${lessonsWeek} lesson${lessonsWeek === 1 ? '' : 's'}, ${pcWeek} Center` : 'None yet', pcWeek + lessonsWeek ? `Lessons practiced and Practice Center sessions, last 7 days` : 'In the last 7 days', 'pt-practice')}
      <li class="pp-tile pt-review"><span class="pp-k">Skills to review</span>${review.length ? `<ol class="pp-review">${review.slice(0, 3).map((x) => `<li>${x}</li>`).join('')}</ol>` : '<span class="pp-v">None right now</span>'}</li>
    </ul></section>`;
  }

  /** One row per lesson: Teach, Practice, Test and ★, in words. */
  function parentTable(shown) {
    return `<section class="card pp-lessons" aria-labelledby="plt-h"><h2 id="plt-h">Lessons at a glance</h2>
      <div class="table-wrap"><table class="skills-table plt-table"><thead><tr><th scope="col">Lesson</th><th scope="col">Teach</th><th scope="col">Practice</th><th scope="col">Test</th><th scope="col"><span aria-hidden="true">★</span><span class="sr-only">Mastered</span></th></tr></thead><tbody>
      ${shown.map((l) => {
        const p = G.store.lesson(l.id), L = G.lessonContent[l.id], t = p.tests[p.tests.length - 1];
        const teach = p.teach.done ? 'Finished' : p.teach.furthest > 0 ? `Screen ${p.teach.furthest + 1} of ${L.screens.length}` : '-';
        return `<tr><th scope="row">${l.n}. ${l.title}</th><td>${teach}</td><td>${p.practice.sessions ? `${p.practice.sessions} session${p.practice.sessions === 1 ? '' : 's'}` : '-'}</td><td>${t ? `${t.correct} of ${t.total}${t.assisted && !t.mastered ? ' (pages opened)' : ''}` : '-'}</td><td>${p.masteredOn ? '<span aria-hidden="true">★</span><span class="sr-only">Yes</span>' : '<span class="sr-only">Not yet</span>'}</td></tr>`;
      }).join('')}
      </tbody></table></div>
      <p class="fine">"-" means not started. Lessons ${shown.filter((l) => l.supplemental).map((l) => l.n).join(' and ')} are supplemental (beyond the Grade 5 Georgia standards).</p></section>`;
  }

  function parent() {
    const persistent = G.store.persistent();
    const shown = unit.lessons.filter((l) => ready(l.id));
    const done = shown.filter((l) => G.store.lesson(l.id).masteredOn);
    const isStarted = (l) => nextStep(l).started || !!G.store.lesson(l.id).masteredOn;
    const block = (l) => {
      const bank = G.engine.banks[l.id];
      const L = G.lessonContent[l.id];
      const p = G.store.lesson(l.id);
      const last = p.tests[p.tests.length - 1];
      const skills = Object.keys(bank.skills);
      const mastered = last ? skills.filter((sk) => last.skills[sk] && last.skills[sk].correct === last.skills[sk].total) : [];
      const needs = last ? skills.filter((sk) => last.skills[sk] && last.skills[sk].correct < last.skills[sk].total) : [];
      const everMastered = !!p.masteredOn;
      const teachState = p.teach.done ? 'Finished' : p.teach.furthest > 0 ? `In progress (reached screen ${p.teach.furthest + 1} of ${L.screens.length})` : 'Not started';
      const practiceSkills = skills.filter((sk) => p.practice.skills[sk]).map((sk) => {
        const s = p.practice.skills[sk];
        return `<li>${bank.skills[sk]}: ${s.c} of ${s.t} right on the first try (hints allowed)${s.it ? `; ${s.i} of ${s.it} right on the first try with no hints` : ''}</li>`;
      }).join('');
      let next;
      if (!p.teach.done && !p.tests.length) next = `Work through <a href="#/${l.id}/teach/1">Lesson ${l.n} Teach</a>.`;
      else if (!p.tests.length) next = `Do a <a href="#/${l.id}/practice">practice session</a>, then take the <a href="#/${l.id}/test">Lesson ${l.n} Test</a>.`;
      else if (!last.mastered && last.goalMet && last.assisted) next = `The last test met the goal, but lesson pages were opened during it. Take a <a href="#/${l.id}/test">new test</a> on your own to earn ★ Mastered.`;
      else if (!last.mastered) next = `Review ${needs.map((sk) => `<a href="#/${l.id}/teach/${L.screens.findIndex((x) => x.id === L.skillScreen[sk]) + 1}">${bank.skills[sk].toLowerCase()}</a>`).join(', ') || 'the lesson'} and practice, then take a new test (goal: 9 of 10).`;
      else {
        const nl = unit.lessons.find((x) => x.n === l.n + 1);
        // After the last lesson, point to the first lesson not mastered yet (if any) instead of declaring the unit complete.
        const open = shown.find((x) => !G.store.lesson(x.id).masteredOn);
        next = nl ? (ready(nl.id) ? `Start <a href="#/${nl.id}/teach/1">Lesson ${nl.n}: ${nl.title}</a>. An occasional Lesson ${l.n} practice session keeps skills fresh.`
          : `Lesson ${nl.n}: ${nl.title} (coming later). Until then, an occasional Lesson ${l.n} practice session keeps skills fresh.`)
          : open ? `Lesson ${open.n}: ${open.title} is not mastered yet. <a href="#/${open.id}/teach/1">Go to Lesson ${open.n}</a>.` : 'All lessons complete.';
      }
      const testLine = (t) => `${t.correct} of ${t.total} (${t.percent}%)${t.mastered ? ' · mastered' : t.assisted ? ` · ${t.goalMet ? 'goal met, but ' : ''}lesson pages opened during the test (${t.assisted.join(', ')})` : ' · not mastered yet'}`;
      return `<section class="card parent-lesson" aria-labelledby="pl-${l.id}">
        <h2 id="pl-${l.id}">Lesson ${l.n}: ${l.title}${everMastered ? ' ★' : ''}${l.supplemental ? ' <span class="lc-extra">Extra: beyond Grade 5</span>' : ''}</h2>
        <dl class="facts-dl">
          <dt>Lesson completed (mastered)</dt><dd>${everMastered ? '<b>Yes ★</b>' : 'Not yet'}</dd>
          <dt>Teach</dt><dd>${teachState}</dd>
          <dt>Practice sessions</dt><dd>${p.practice.sessions}${p.practice.lastDate ? ` (last on ${fmtDate(p.practice.lastDate)})` : ''}</dd>
          <dt>Most recent test</dt><dd>${last ? `${testLine(last)} on ${fmtDate(last.date)}` : 'No test taken yet'}</dd>
          <dt>Tests taken</dt><dd>${p.testsTaken}</dd>
        </dl>
        <h3>Skills correct on the most recent test</h3>
        ${last ? (mastered.length ? `<ul>${mastered.map((sk) => `<li>${bank.skills[sk]}</li>`).join('')}</ul>` : '<p>None yet.</p>') : '<p>No test taken yet.</p>'}
        <h3>Skills needing more practice <span class="fine">(missed on the most recent test)</span></h3>
        ${last ? (needs.length ? `<ul>${needs.map((sk) => `<li>${bank.skills[sk]}</li>`).join('')}</ul>` : '<p>None. Nice work!</p>') : '<p>No test taken yet.</p>'}
        ${practiceSkills ? `<details><summary>Practice details (all sessions)</summary><ul>${practiceSkills}</ul></details>` : ''}
        ${p.tests.length > 1 ? `<details><summary>Test history</summary><ol>${p.tests.slice().reverse().slice(0, 10).map((t) => `<li>${fmtDate(t.date)}: ${testLine(t)}${t.mastered ? ' ★' : ''}</li>`).join('')}</ol></details>` : ''}
        <h3>Suggested next step</h3>
        <p class="next-step">${next}</p>
      </section>`;
    };
    const startedL = shown.filter(isStarted), restL = shown.filter((l) => !isStarted(l));
    const blocks = `<h2 class="pp-details-h">Lesson details</h2>
      ${startedL.length ? startedL.map(block).join('') : '<p>No lesson started yet. Lesson details appear here once a lesson is started.</p>'}
      ${restL.length ? `<details class="pp-more"><summary>Show all lessons (${restL.length} not started yet)</summary>${restL.map(block).join('')}</details>` : ''}`;
    app.innerHTML = `
      <div class="crumbs"><a href="#/">← Home</a></div>
      <h1 tabindex="-1">Parent Progress</h1>
      <div class="fb fb-info">
        <p><b>Progress is saved only in this browser on this device.</b> It does not transfer to other devices or browsers, and clearing browser data erases it. No account, name or personal information is collected or sent anywhere.</p>
        ${persistent ? '' : '<p><b>This browser cannot save progress right now (storage is blocked or full, for example in a private window), so progress will be lost when the page is closed.</b></p>'}
      </div>
      ${G.chapter4 ? G.chapter4.parentBlock() : ''}
      ${parentOverview(shown, done)}
      ${parentTable(shown)}
      ${blocks}
      ${practiceCenterBlock()}
      <section class="card pp-rules-card" aria-labelledby="rules-h"><h2 id="rules-h">How Tests and mastery work</h2>
      <details class="pp-rules"><summary>Show the rules</summary>
        <ul>
          <li><b>★ Mastered</b> means at least 9 of 10 correct on a Lesson Test done on its own. This is the app's learning benchmark, not an official Georgia Milestones score.</li>
          <li>A student may leave a Test and come back later; answers are saved.</li>
          <li>If Teach, Practice or Lesson Notes is opened in this app while a Test is unfinished, the Test is still scored and shown here, marked "lesson pages opened during the test", but it does not count for ★ Mastered. This is not treated as cheating: looking back at a lesson is a good way to learn. It just means the score is not an independent result.</li>
          <li>The app only knows about pages opened in this app. Refreshing the page or closing the browser is not counted, and help from outside the app cannot be seen. Tests taken before this rule was added have no such record and are shown as they were.</li>
          <li>Practice shows two numbers: right on the first try (hints allowed), and right on the first try with no hints. The second number is counted only for practice sessions finished since it was added.</li>
          <li><b>Practice Center</b> sessions are practice: they are shown in their own section and never count as a Test or for ★ Mastered. Opening the Practice Center or the Study Guides while a lesson Test is unfinished is noted on that Test, like opening Teach.</li>
        </ul>
      </details></section>
      <section class="reset">
        <button type="button" class="btn" data-act="reset">Erase all progress on this device</button>
        <div class="confirm" hidden><p>Erase all saved progress? This cannot be undone.</p>
          <button type="button" class="btn btn-danger" data-act="really">Yes, erase</button>
          <button type="button" class="btn" data-act="cancel">Cancel</button></div>
      </section>`;
    const conf = app.querySelector('.confirm');
    app.querySelector('[data-act="reset"]').addEventListener('click', () => { conf.hidden = false; });
    app.querySelector('[data-act="cancel"]').addEventListener('click', () => { conf.hidden = true; });
    app.querySelector('[data-act="really"]').addEventListener('click', () => { G.store.resetAll(); parent(); });
    app.classList.add('page-home');
    document.title = 'Parent Progress · NumberNova';
  }

  const ASSIST = { teach: 'Teach', practice: 'Practice', notes: 'Lesson Notes', center: 'the Practice Center', guides: 'the Study Guides' };
  /** Opening Teach, Practice or Lesson Notes while a Test is unfinished is noted on that Test (only pages in this app). */
  function noteAssist(lessonId, mode) {
    const label = lessonId ? `${lessonName(lessonId)} ${ASSIST[mode]}` : ASSIST[mode];
    unit.lessons.filter((l) => ready(l.id)).forEach((l) => {
      const d = G.store.openTest(l.id);
      if (!d) return;
      const a = Array.isArray(d.assist) ? d.assist.filter((x) => typeof x === 'string') : [];
      if (a.includes(label) || a.length >= 12) return;
      d.assist = a.concat(label);
      G.store.setDraft('test-' + l.id, d);
    });
  }

  if (G.chapter4) G.chapter4.noteResults = () => { G.chapter4.assist(); noteAssist(null, 'center'); };

  function route() {
    const h = location.hash || '#/';
    let m;
    app.classList.remove('page-home', 'page-question');
    const am = h.match(/^#\/(d\d\d)\/(teach|practice|notes)(?:\/\d+)?$/);
    if (am && ready(am[1])) noteAssist(am[1], am[2]);
    else if (/^#\/practice(\/(session|results))?$/.test(h)) noteAssist(null, 'center');
    else if (h === '#/guides') noteAssist(null, 'guides');
    const instructional = /^#\/chapter4\/(4-[1-8]|review)\/(learn|practice)/.test(h) || /^#\/(d\d\d)\/(teach|practice|notes)/.test(h) || /^#\/(practice|guides)/.test(h);
    if ((instructional || /^#\/d\d\d\/test$/.test(h) && !G.store.openTest(h.split('/')[1])) && G.chapter4) G.chapter4.assist();
    if (/^#\/chapter4\/(4-[1-8]|review)\/(learn|practice)/.test(h)) noteAssist(null, 'center');
    try {
      if (G.chapter4 && G.chapter4.route(app, h)) { /* Chapter route rendered. */ }
      else if (h === '#/decimals') decimalHome();
      else if ((m = h.match(/^#\/(d\d\d)\/teach(?:\/(\d+))?$/)) && ready(m[1])) G.views.teach(app, m[1], Number(m[2] || 1));
      else if ((m = h.match(/^#\/(d\d\d)\/practice$/)) && ready(m[1])) G.views.practice(app, m[1]);
      else if ((m = h.match(/^#\/(d\d\d)\/test$/)) && ready(m[1])) G.views.test(app, m[1]);
      else if ((m = h.match(/^#\/(d\d\d)\/notes$/)) && ready(m[1])) notes(m[1]);
      else if (h === '#/parent') parent();
      else if (h === '#/learn') learn();
      else if (h === '#/guides' && G.views.guides) G.views.guides(app);
      else if ((m = h.match(/^#\/practice(?:\/(session|results))?$/)) && G.views.practiceCenter) G.views.practiceCenter(app, m[1] || '');
      else landing();
    } catch (e) {
      console.error(e);
      app.innerHTML = '<h1 tabindex="-1">Something went wrong</h1><p>Please go back to the <a href="#/">home page</a>.</p>';
    }
    const mm = h.match(/^#\/d\d\d\/(teach|practice|test|notes)/);
    app.dataset.mode = mm && app.innerHTML.indexOf('Something went wrong') < 0 ? mm[1] : '';
    const shownHome = !!app.querySelector('.nn-hero');
    const section = /^#\/chapter4/.test(h) ? 'chapter4' : shownHome ? 'home' : /^#\/(d\d\d|learn)\b/.test(h) ? 'learn' : /^#\/practice\b/.test(h) ? 'practice' : h === '#/guides' ? 'guides' : h === '#/parent' ? 'parent' : 'home';
    document.body.dataset.section = section;
    window.scrollTo(0, 0);
    const h1 = app.querySelector('h1');
    if (h1 && document.activeElement !== h1 && route.started) h1.focus({ preventScroll: true });
    route.started = true;
    document.querySelectorAll('.site-nav a').forEach((a) => { if (a.dataset.nav === section) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    setMenu(false);
  }

  // Small screens: the main navigation opens from a Menu button.
  const toggle = document.querySelector('.nav-toggle');
  function setMenu(open) {
    if (!toggle) return;
    toggle.setAttribute('aria-expanded', String(open));
    document.querySelector('.site-header').classList.toggle('nav-open', open);
  }
  if (toggle) toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  document.querySelectorAll('.site-nav a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', (e) => { if (toggle && toggle.getAttribute('aria-expanded') === 'true' && !e.target.closest('.site-header')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && toggle && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); } });

  window.addEventListener('hashchange', route);
  route();
})(window.GML = window.GML || {});
