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
    const test = last ? `${last.correct} of ${last.total}${last.mastered ? ' ★' : ''}` : 'Not taken';
    return `<ul class="lc-progress" aria-label="Lesson ${l.n} progress">
      <li class="chip chip-teach"><span class="chip-k">Teach</span> ${teach}</li>
      <li class="chip chip-practice"><span class="chip-k">Practice</span> ${practice}</li>
      <li class="chip chip-test"><span class="chip-k">Test</span> ${test}</li></ul>`;
  }

  function home() {
    const cards = unit.lessons.filter((l) => ready(l.id)).map((l) => {
      const mastered = G.store.lesson(l.id).tests.some((t) => t.mastered);
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
      <section class="hero">
        <h1 tabindex="-1">Gabriella's Math Lab</h1>
        <p class="hero-sub">Grade 5 Mathematics</p>
        <p class="hero-sub2">Georgia Milestones Preparation</p>
      </section>
      <section aria-labelledby="unit-h">
        <h2 id="unit-h" class="unit-title">${unit.title} <span class="unit-count">${unit.lessons.length} lessons</span></h2>
        <p class="legend"><span class="legend-item legend-teach">Teach: learn it</span><span class="legend-item legend-practice">Practice: try it with hints</span><span class="legend-item legend-test">Test: show what you know</span></p>
        <div class="lesson-grid">${cards}</div>
        <h3 class="later-h">Coming later</h3>
        <ul class="later-list">${later}</ul>
      </section>`;
    app.classList.add('page-home');
    document.title = "Gabriella's Math Lab";
  }

  function notes(lessonId) {
    const L = G.lessonContent[lessonId];
    app.innerHTML = `
      <div class="crumbs no-print"><a href="#/">← Lesson menu</a></div>
      <article class="notes">
        <p class="mode-label">${lessonName(lessonId)} · Lesson Notes</p>
        <h1 tabindex="-1">${L.title}</h1>
        <p class="no-print"><button type="button" class="btn" data-act="print">Print these notes</button></p>
        ${L.notes}
      </article>
      <div class="done-actions no-print">
        <a class="btn btn-big btn-teach" href="#/${lessonId}/teach/1">Teach</a>
        <a class="btn btn-big btn-practice" href="#/${lessonId}/practice">Practice</a>
        <a class="btn btn-big btn-test" href="#/${lessonId}/test">Test</a>
      </div>`;
    app.querySelector('[data-act="print"]').addEventListener('click', () => window.print());
    document.title = `${L.title} · Lesson Notes`;
  }

  function parent() {
    const persistent = G.store.persistent();
    const shown = unit.lessons.filter((l) => ready(l.id));
    const done = shown.filter((l) => G.store.lesson(l.id).tests.some((t) => t.mastered));
    const blocks = shown.map((l) => {
      const bank = G.engine.banks[l.id];
      const L = G.lessonContent[l.id];
      const p = G.store.lesson(l.id);
      const last = p.tests[p.tests.length - 1];
      const skills = Object.keys(bank.skills);
      const mastered = last ? skills.filter((sk) => last.skills[sk] && last.skills[sk].correct === last.skills[sk].total) : [];
      const needs = last ? skills.filter((sk) => last.skills[sk] && last.skills[sk].correct < last.skills[sk].total) : [];
      const everMastered = p.tests.some((t) => t.mastered);
      const teachState = p.teach.done ? 'Finished' : p.teach.furthest > 0 ? `In progress (reached screen ${p.teach.furthest + 1} of ${L.screens.length})` : 'Not started';
      const practiceSkills = skills.filter((sk) => p.practice.skills[sk]).map((sk) => `<li>${bank.skills[sk]}: ${p.practice.skills[sk].c} of ${p.practice.skills[sk].t} right on the first try</li>`).join('');
      let next;
      if (!p.teach.done && !p.tests.length) next = `Work through <a href="#/${l.id}/teach/1">Lesson ${l.n} Teach</a>.`;
      else if (!p.tests.length) next = `Do a <a href="#/${l.id}/practice">practice session</a>, then take the <a href="#/${l.id}/test">Lesson ${l.n} Test</a>.`;
      else if (!last.mastered) next = `Review ${needs.map((sk) => `<a href="#/${l.id}/teach/${L.screens.findIndex((x) => x.id === L.skillScreen[sk]) + 1}">${bank.skills[sk].toLowerCase()}</a>`).join(', ') || 'the lesson'} and practice, then take a new test (goal: 9 of 10).`;
      else {
        const nl = unit.lessons.find((x) => x.n === l.n + 1);
        next = nl ? (ready(nl.id) ? `Start <a href="#/${nl.id}/teach/1">Lesson ${nl.n}: ${nl.title}</a>. An occasional Lesson ${l.n} practice session keeps skills fresh.`
          : `Lesson ${nl.n}: ${nl.title} (coming later). Until then, an occasional Lesson ${l.n} practice session keeps skills fresh.`) : 'All lessons complete.';
      }
      return `<section class="card parent-lesson" aria-labelledby="pl-${l.id}">
        <h2 id="pl-${l.id}">Lesson ${l.n}: ${l.title}</h2>
        <dl class="facts-dl">
          <dt>Lesson completed (mastered)</dt><dd>${everMastered ? '<b>Yes ★</b>' : 'Not yet'}</dd>
          <dt>Teach</dt><dd>${teachState}</dd>
          <dt>Practice sessions</dt><dd>${p.practice.sessions}${p.practice.lastDate ? ` (last on ${fmtDate(p.practice.lastDate)})` : ''}</dd>
          <dt>Most recent test</dt><dd>${last ? `${last.correct} of ${last.total} (${last.percent}%) on ${fmtDate(last.date)}${last.mastered ? ' · mastered' : ' · not mastered yet'}` : 'No test taken yet'}</dd>
          <dt>Tests taken</dt><dd>${p.tests.length}</dd>
        </dl>
        <h3>Skills correct on the most recent test</h3>
        ${last ? (mastered.length ? `<ul>${mastered.map((sk) => `<li>${bank.skills[sk]}</li>`).join('')}</ul>` : '<p>None yet.</p>') : '<p>No test taken yet.</p>'}
        <h3>Skills needing more practice <span class="fine">(missed on the most recent test)</span></h3>
        ${last ? (needs.length ? `<ul>${needs.map((sk) => `<li>${bank.skills[sk]}</li>`).join('')}</ul>` : '<p>None. Nice work!</p>') : '<p>No test taken yet.</p>'}
        ${practiceSkills ? `<details><summary>Practice details (all sessions)</summary><ul>${practiceSkills}</ul></details>` : ''}
        ${p.tests.length > 1 ? `<details><summary>Test history</summary><ol>${p.tests.slice().reverse().slice(0, 10).map((t) => `<li>${fmtDate(t.date)}: ${t.correct} of ${t.total} (${t.percent}%)${t.mastered ? ' ★' : ''}</li>`).join('')}</ol></details>` : ''}
        <h3>Suggested next step</h3>
        <p class="next-step">${next}</p>
      </section>`;
    }).join('');
    app.innerHTML = `
      <div class="crumbs"><a href="#/">← Lesson menu</a></div>
      <h1 tabindex="-1">Parent Progress</h1>
      <div class="fb fb-info">
        <p><b>Progress is saved only in this browser on this device.</b> It does not transfer to other devices or browsers, and clearing browser data erases it. No account, name or personal information is collected or sent anywhere.</p>
        ${persistent ? '' : '<p><b>This browser cannot save progress right now (storage is blocked or full, for example in a private window), so progress will be lost when the page is closed.</b></p>'}
      </div>
      <section class="card parent-summary" aria-labelledby="ps-h">
        <h2 id="ps-h">Completed lessons</h2>
        ${done.length ? `<ul>${done.map((l) => `<li>Lesson ${l.n}: ${l.title} ★</li>`).join('')}</ul>` : '<p>No lesson mastered yet.</p>'}
        <p class="fine">Lessons available now: ${shown.map((l) => l.n).join(', ')}. Lessons ${unit.lessons.filter((l) => !ready(l.id)).map((l) => l.n).join(', ')} are coming later.</p>
      </section>
      ${blocks}
      <p class="fine">Mastery means at least 9 of 10 correct on a Lesson Test. This is the app's learning benchmark, not an official Georgia Milestones score.</p>
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
    document.title = "Parent Progress · Gabriella's Math Lab";
  }

  function route() {
    const h = location.hash || '#/';
    let m;
    app.classList.remove('page-home');
    try {
      if ((m = h.match(/^#\/(d\d\d)\/teach(?:\/(\d+))?$/)) && ready(m[1])) G.views.teach(app, m[1], Number(m[2] || 1));
      else if ((m = h.match(/^#\/(d\d\d)\/practice$/)) && ready(m[1])) G.views.practice(app, m[1]);
      else if ((m = h.match(/^#\/(d\d\d)\/test$/)) && ready(m[1])) G.views.test(app, m[1]);
      else if ((m = h.match(/^#\/(d\d\d)\/notes$/)) && ready(m[1])) notes(m[1]);
      else if (h === '#/parent') parent();
      else home();
    } catch (e) {
      console.error(e);
      app.innerHTML = '<h1 tabindex="-1">Something went wrong</h1><p>Please go back to the <a href="#/">lesson menu</a>.</p>';
    }
    const mm = h.match(/^#\/d\d\d\/(teach|practice|test|notes)/);
    app.dataset.mode = mm && app.innerHTML.indexOf('Something went wrong') < 0 ? mm[1] : '';
    window.scrollTo(0, 0);
    const h1 = app.querySelector('h1');
    if (h1 && document.activeElement !== h1 && route.started) h1.focus({ preventScroll: true });
    route.started = true;
    document.querySelectorAll('.site-nav a').forEach((a) => a.toggleAttribute('aria-current', a.getAttribute('href') === (h === '#/parent' ? '#/parent' : '#/')));
  }

  window.addEventListener('hashchange', route);
  route();
})(window.GML = window.GML || {});
