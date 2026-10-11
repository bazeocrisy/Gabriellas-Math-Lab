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
  function landing() {
    const pausedHtml = G.practiceCenter && G.practiceCenter.pausedSummary ? G.practiceCenter.pausedSummary() : '';
    app.innerHTML = `
      <section class="nn-hero">
        <img class="nn-hero-logo" src="assets/brand/numbernova-logo.svg" alt="NumberNova. Learn. Practice. Shine." width="330" height="76">
        <h1 tabindex="-1">Ready to make your next math discovery?</h1>
        <p class="nn-hero-text">Learn step by step, sharpen your skills, and see how far you can go.</p>
        <p class="nn-hero-tags"><span>Grade 5 Mathematics</span><span>Decimals</span><span>Georgia Milestones Preparation</span></p>
      </section>
      ${pausedHtml}
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

  /** Learn: the ten decimal lessons, each with Teach, Practice, Test and Lesson Notes. */
  function learn() {
    const cards = unit.lessons.filter((l) => ready(l.id)).map((l) => {
      const mastered = !!G.store.lesson(l.id).masteredOn;
      return `<article class="lesson-card" aria-labelledby="lc-${l.id}">
        <div class="lc-head">
          <span class="lc-num" aria-hidden="true">${l.n}</span>
          <div class="lc-titles"><p class="lesson-num">Lesson ${l.n}</p><h3 id="lc-${l.id}">${l.title}</h3></div>
          ${mastered ? '<span class="lc-badge">★ Mastered</span>' : ''}${l.supplemental ? '<span class="lc-extra">Extra: beyond Grade 5</span>' : ''}
        </div>
        <p class="lc-blurb">${l.blurb}</p>
        ${progressChips(l)}
        <div class="mode-buttons">
          <a class="btn btn-mode btn-teach" href="#/${l.id}/teach/1">TEACH</a>
          <a class="btn btn-mode btn-practice" href="#/${l.id}/practice">PRACTICE</a>
          <a class="btn btn-mode btn-test" href="#/${l.id}/test">TEST</a>
        </div>
        <a class="btn btn-notes" href="#/${l.id}/notes">${DOC_ICON}<span>Lesson Notes</span><span class="sr-only"> for Lesson ${l.n} (printable)</span></a>
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

  function parent() {
    const persistent = G.store.persistent();
    const shown = unit.lessons.filter((l) => ready(l.id));
    const done = shown.filter((l) => G.store.lesson(l.id).masteredOn);
    const blocks = shown.map((l) => {
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
        <h2 id="pl-${l.id}">Lesson ${l.n}: ${l.title}${l.supplemental ? ' <span class="lc-extra">Extra: beyond Grade 5</span>' : ''}</h2>
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
    }).join('');
    app.innerHTML = `
      <div class="crumbs"><a href="#/">← Home</a></div>
      <h1 tabindex="-1">Parent Progress</h1>
      <div class="fb fb-info">
        <p><b>Progress is saved only in this browser on this device.</b> It does not transfer to other devices or browsers, and clearing browser data erases it. No account, name or personal information is collected or sent anywhere.</p>
        ${persistent ? '' : '<p><b>This browser cannot save progress right now (storage is blocked or full, for example in a private window), so progress will be lost when the page is closed.</b></p>'}
      </div>
      <section class="card parent-summary" aria-labelledby="ps-h">
        <h2 id="ps-h">Completed lessons</h2>
        ${done.length ? `<ul>${done.map((l) => `<li>Lesson ${l.n}: ${l.title} ★</li>`).join('')}</ul>` : '<p>No lesson mastered yet.</p>'}
        <p class="fine">Lessons available now: ${shown.map((l) => l.n).join(', ')}.${unit.lessons.some((l) => !ready(l.id)) ? ` Lessons ${unit.lessons.filter((l) => !ready(l.id)).map((l) => l.n).join(', ')} are coming later.` : ' All lessons in this unit are available.'}${shown.some((l) => l.supplemental) ? ` Lessons ${shown.filter((l) => l.supplemental).map((l) => l.n).join(' and ')} are supplemental (beyond the Grade 5 Georgia standards).` : ''}</p>
      </section>
      ${practiceCenterBlock()}
      ${blocks}
      <section class="card" aria-labelledby="rules-h">
        <h2 id="rules-h">How Tests and mastery work</h2>
        <ul>
          <li><b>★ Mastered</b> means at least 9 of 10 correct on a Lesson Test done on its own. This is the app's learning benchmark, not an official Georgia Milestones score.</li>
          <li>A student may leave a Test and come back later; answers are saved.</li>
          <li>If Teach, Practice or Lesson Notes is opened in this app while a Test is unfinished, the Test is still scored and shown here, marked "lesson pages opened during the test", but it does not count for ★ Mastered. This is not treated as cheating: looking back at a lesson is a good way to learn. It just means the score is not an independent result.</li>
          <li>The app only knows about pages opened in this app. Refreshing the page or closing the browser is not counted, and help from outside the app cannot be seen. Tests taken before this rule was added have no such record and are shown as they were.</li>
          <li>Practice shows two numbers: right on the first try (hints allowed), and right on the first try with no hints. The second number is counted only for practice sessions finished since it was added.</li>
          <li><b>Practice Center</b> sessions are practice: they are shown in their own section and never count as a Test or for ★ Mastered. Opening the Practice Center or the Study Guides while a lesson Test is unfinished is noted on that Test, like opening Teach.</li>
        </ul>
      </section>
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

  function route() {
    const h = location.hash || '#/';
    let m;
    app.classList.remove('page-home', 'page-question');
    const am = h.match(/^#\/(d\d\d)\/(teach|practice|notes)(?:\/\d+)?$/);
    if (am && ready(am[1])) noteAssist(am[1], am[2]);
    else if (/^#\/practice(\/(session|results))?$/.test(h)) noteAssist(null, 'center');
    else if (h === '#/guides') noteAssist(null, 'guides');
    try {
      if ((m = h.match(/^#\/(d\d\d)\/teach(?:\/(\d+))?$/)) && ready(m[1])) G.views.teach(app, m[1], Number(m[2] || 1));
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
    const section = shownHome ? 'home' : /^#\/(d\d\d|learn)\b/.test(h) ? 'learn' : /^#\/practice\b/.test(h) ? 'practice' : h === '#/guides' ? 'guides' : h === '#/parent' ? 'parent' : 'home';
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
