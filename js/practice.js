// Practice mode: 10 varied questions with hints, coaching and retries. A session survives a page refresh.
(function (G) {
  'use strict';
  const draftName = (id) => 'practice-' + id;

  function newSession(lessonId) {
    const bank = G.engine.banks[lessonId];
    const L = G.lessonContent[lessonId];
    const prog = G.store.lesson(lessonId);
    // Never practice a question that is in this lesson's unfinished Test: the hints and solution would give its answer away.
    const open = G.store.openTest(lessonId);
    const exclude = new Set([...L.teachSigs, ...(open ? open.set.map((x) => x.sig) : [])]);
    const avoid = new Set([...prog.practice.recentSigs, ...prog.recentTestSigs]);
    const set = G.engine.buildSet(lessonId, { plan: bank.plan, seed: (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0, exclude, avoid });
    const d = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8), set, i: 0, states: set.map(() => ({})), finished: false, recorded: false };
    G.store.setDraft(draftName(lessonId), d);
    return d;
  }

  function view(app, lessonId) {
    let d = G.store.getDraft(draftName(lessonId));
    const ok = d && G.engine.validSet(lessonId, d.set, 10) && Number.isInteger(d.i) && d.i >= 0 && d.i < 10 &&
      Array.isArray(d.states) && d.states.length === 10 && d.states.every((x) => x && typeof x === 'object');
    if (!ok) d = newSession(lessonId);
    draw();

    function draw() {
      if (d.finished) return summary();
      const bank = G.engine.banks[lessonId];
      const item = d.set[d.i];
      const q = G.engine.make(lessonId, item.id, item.seed);
      app.innerHTML = `
        <div class="crumbs"><a href="#/learn">← Lesson menu</a></div>
        <p class="mode-label">Lesson ${G.unit.find(lessonId).n} · Practice <span class="screen-count">Question ${d.i + 1} of ${d.set.length}</span></p>
        <div class="progress" role="progressbar" aria-label="Practice progress" aria-valuemin="1" aria-valuemax="${d.set.length}" aria-valuenow="${d.i + 1}"><span style="width:${((d.i + 1) / d.set.length) * 100}%"></span></div>
        <h1 tabindex="-1" class="q-heading">Question ${d.i + 1}</h1>
        <p class="skill-tag">Skill: ${bank.skills[q.skill]}</p>
        <div class="coach-host"></div>
        <div class="pc-tools"><button type="button" class="btn" data-act="restart">Start New Practice</button></div>
        <div class="confirm restart-confirm" hidden><p><b>Start a new practice session?</b> Your answers, hints and feedback in this session will be cleared. Finished sessions and test results are kept.</p>
          <button type="button" class="btn btn-danger" data-act="restart-yes">Yes, start a new session</button> <button type="button" class="btn" data-act="restart-no">No, keep going</button></div>`;
      G.coach(app.querySelector('.coach-host'), q, {
        state: d.states[d.i],
        remind: bank.remind[q.skill],
        onChange: (st) => { d.states[d.i] = st; G.store.setDraft(draftName(lessonId), d); },
        onSolved: () => {
          const next = app.querySelector('.coach-next');
          const last = d.i === d.set.length - 1;
          next.innerHTML = `<button type="button" class="btn btn-primary btn-big">${last ? 'See my results' : 'Next question →'}</button>`;
          const at = d.i;
          next.querySelector('button').addEventListener('click', () => {
            if (d.i !== at || d.finished || !d.states[at].solved) return; // ignore a second click
            if (last) d.finished = true; else d.i++;
            G.store.setDraft(draftName(lessonId), d);
            draw();
            window.scrollTo(0, 0);
            const h = app.querySelector('h1'); if (h) h.focus();
          });
        }
      });
      const box = app.querySelector('.restart-confirm');
      const fresh = () => { d = newSession(lessonId); draw(); window.scrollTo(0, 0); const h = app.querySelector('h1'); if (h) h.focus(); };
      app.querySelector('[data-act="restart"]').addEventListener('click', () => {
        const touched = d.i > 0 || d.states.some((s) => s && (s.solved || s.attempts || s.hints || s.resp != null));
        if (!touched) { fresh(); return; }
        box.hidden = false; box.querySelector('[data-act="restart-yes"]').focus();
      });
      app.querySelector('[data-act="restart-no"]').addEventListener('click', () => { box.hidden = true; app.querySelector('[data-act="restart"]').focus(); });
      app.querySelector('[data-act="restart-yes"]').addEventListener('click', fresh);
      document.title = `Practice ${d.i + 1} of 10 · NumberNova`;
    }

    function summary() {
      const bank = G.engine.banks[lessonId];
      const L = G.lessonContent[lessonId];
      const qs = d.set.map((x) => G.engine.make(lessonId, x.id, x.seed));
      const noHints = (s) => s.firstTry && !s.hints;
      const first = d.states.filter((s) => s.firstTry).length, clean = d.states.filter(noHints).length;
      const bySkill = {};
      qs.forEach((q, k) => {
        const b = bySkill[q.skill] || (bySkill[q.skill] = { c: 0, t: 0, i: 0 });
        b.t++; if (d.states[k].firstTry) b.c++; if (noHints(d.states[k])) b.i++;
      });
      // Another tab may already have recorded this same session.
      const stored = G.store.getDraft(draftName(lessonId));
      if (!d.recorded && stored && d.id && stored.id === d.id && stored.recorded) d.recorded = true;
      if (!d.recorded) {
        G.store.update(lessonId, (p) => {
          if (d.id && p.practice.lastId === d.id) return; // this session was already counted (another tab)
          p.practice.lastId = d.id;
          p.practice.sessions++;
          p.practice.lastDate = new Date().toISOString();
          Object.keys(bySkill).forEach((sk) => {
            const s = p.practice.skills[sk] || (p.practice.skills[sk] = { c: 0, t: 0 });
            s.c += bySkill[sk].c; s.t += bySkill[sk].t;
            s.i = (s.i || 0) + bySkill[sk].i; s.it = (s.it || 0) + bySkill[sk].t;
          });
          p.practice.recentSigs = d.set.map((x) => x.sig);
        });
        d.recorded = true;
        G.store.setDraft(draftName(lessonId), d);
      }
      const review = Object.keys(bySkill).filter((sk) => bySkill[sk].c < bySkill[sk].t);
      app.innerHTML = `
        <div class="crumbs"><a href="#/learn">← Lesson menu</a></div>
        <p class="mode-label">Lesson ${G.unit.find(lessonId).n} · Practice</p>
        <h1 tabindex="-1">Practice complete</h1>
        <p class="score-line">You answered <b>${first} of ${qs.length}</b> correctly on the first try${first ? `, ${clean === first ? (clean === 1 ? 'with no hints' : 'all with no hints') : `${clean} of them with no hints`}` : ''}.</p>
        <p>Practice is for learning, so hints and second tries are a good thing. The Test checks what you can do on your own.</p>
        <ol class="sum-list">${qs.map((q, k) => {
          const s = d.states[k];
          const tag = !s.solved ? '<span class="tag tag-help">Not finished</span>' : noHints(s) ? '<span class="tag tag-ok">✓ First try, no hints</span>'
            : s.firstTry ? '<span class="tag tag-ok">✓ First try, with hints</span>' : s.shown ? '<span class="tag tag-help">Solution shown</span>' : '<span class="tag tag-help">✓ After another try</span>';
          return `<li>${tag} <span class="sum-skill">${bank.skills[q.skill]}</span>${s.hints ? ` <span class="sum-hints">(${s.hints} hint${s.hints === 1 ? '' : 's'})</span>` : ''}</li>`;
        }).join('')}</ol>
        ${review.length ? `<div class="card"><h2>Worth another look</h2><ul>${review.map((sk) => `<li>${bank.skills[sk]}: <a href="#/${lessonId}/teach/${L.screens.findIndex((x) => x.id === L.skillScreen[sk]) + 1}">review in Teach</a></li>`).join('')}</ul></div>` : '<div class="card"><p>Great work! Every skill was right on the first try. You may be ready for the Test.</p></div>'}
        <div class="done-actions">
          <button type="button" class="btn btn-big ${review.length ? 'btn-primary' : ''}" data-act="again">New practice session</button>
          <a class="btn btn-big ${review.length ? '' : 'btn-primary'}" href="#/${lessonId}/test">Take the Test</a>
          <a class="btn btn-big" href="#/learn">Lesson menu</a>
        </div>`;
      app.querySelector('[data-act="again"]').addEventListener('click', () => {
        d = newSession(lessonId);
        draw();
        window.scrollTo(0, 0);
        const h = app.querySelector('h1'); if (h) h.focus();
      });
      document.title = `Practice results · NumberNova`;
    }
  }

  G.views = G.views || {};
  G.views.practice = view;
  view.newSession = newSession; // for tests
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
