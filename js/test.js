// Test mode: 10 fresh questions, no hints, no feedback until the whole test is submitted.
// Answers stay editable until Submit. Results show score, missed skills and explanations.
(function (G) {
  'use strict';
  const draftName = (id) => 'test-' + id;
  const esc = (s) => G.models.esc(s);

  function newTest(lessonId) {
    const bank = G.engine.banks[lessonId];
    const L = G.lessonContent[lessonId];
    const prog = G.store.lesson(lessonId);
    const practiceDraft = G.store.getDraft('practice-' + lessonId);
    const exclude = new Set([...L.teachSigs, ...prog.practice.recentSigs, ...prog.lastTestSigs,
      ...(practiceDraft && Array.isArray(practiceDraft.set) ? practiceDraft.set.map((x) => x.sig) : [])]);
    const set = G.engine.buildSet(lessonId, { plan: bank.plan, seed: (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0, exclude });
    return { set, answers: set.map(() => null), i: 0, started: false, submitted: false, review: false };
  }

  function view(app, lessonId) {
    const bank = G.engine.banks[lessonId];
    const L = G.lessonContent[lessonId];
    let d = G.store.getDraft(draftName(lessonId));
    if (!d || !Array.isArray(d.set) || d.set.length !== 10) d = null;
    let qs = d ? d.set.map((x) => G.engine.make(lessonId, x.id, x.seed)) : null;
    const save = () => G.store.setDraft(draftName(lessonId), d);
    const top = () => { window.scrollTo(0, 0); const h = app.querySelector('h1'); if (h) h.focus(); };

    if (!d || !d.started) intro();
    else if (d.submitted) results();
    else if (d.review) review();
    else question();

    function intro() {
      app.innerHTML = `
        <div class="crumbs"><a href="#/">← Lesson menu</a></div>
        <p class="mode-label">Lesson 1 · Test</p>
        <h1 tabindex="-1">Lesson 1 Test</h1>
        <div class="card">
          <ul class="facts">
            <li>There are <b>10 questions</b>.</li>
            <li>Work on your own. There are <b>no hints</b> in the test.</li>
            <li>You will not see if an answer is right until you submit the whole test.</li>
            <li>You can go back and change answers before you submit.</li>
            <li>There is no time limit.</li>
          </ul>
        </div>
        <div class="done-actions">
          <button type="button" class="btn btn-primary btn-big" data-act="start">Start the test</button>
          <a class="btn btn-big" href="#/${lessonId}/practice">Practice first</a>
        </div>`;
      app.querySelector('[data-act="start"]').addEventListener('click', () => {
        d = newTest(lessonId);
        d.started = true;
        qs = d.set.map((x) => G.engine.make(lessonId, x.id, x.seed));
        save();
        question();
        top();
      });
      document.title = `Test · Gabriella's Math Lab`;
    }

    function answered(k) { return G.engine.isAnswered(qs[k], d.answers[k]); }

    function question() {
      const q = qs[d.i];
      app.innerHTML = `
        <div class="crumbs"><a href="#/">← Lesson menu</a> <span class="crumb-note">(your answers are saved)</span></div>
        <p class="mode-label">Lesson 1 · Test <span class="screen-count">Question ${d.i + 1} of 10</span></p>
        <nav class="qnav" aria-label="Test questions">${qs.map((_, k) =>
          `<button type="button" class="qnav-btn${k === d.i ? ' is-current' : ''}${answered(k) ? ' is-done' : ''}" data-k="${k}" aria-label="Question ${k + 1}${answered(k) ? ', answered' : ', not answered'}"${k === d.i ? ' aria-current="step"' : ''}>${k + 1}</button>`).join('')}</nav>
        <h1 tabindex="-1" class="q-heading">Question ${d.i + 1}</h1>
        <div class="test-q"></div>
        <nav class="pager" aria-label="Move between questions">
          <button type="button" class="btn" data-act="prev" ${d.i === 0 ? 'hidden' : ''}>← Previous</button>
          <button type="button" class="btn btn-primary" data-act="next">${d.i === 9 ? 'Review my answers' : 'Next →'}</button>
        </nav>`;
      G.qui.render(q, app.querySelector('.test-q'), {
        response: d.answers[d.i],
        onChange: (r) => {
          d.answers[d.i] = r; save();
          const b = app.querySelector(`.qnav-btn[data-k="${d.i}"]`);
          b.classList.toggle('is-done', answered(d.i));
          b.setAttribute('aria-label', `Question ${d.i + 1}${answered(d.i) ? ', answered' : ', not answered'}`);
        },
        onEnter: () => app.querySelector('[data-act="next"]').click()
      });
      app.querySelectorAll('.qnav-btn').forEach((b) => b.addEventListener('click', () => { d.i = Number(b.dataset.k); save(); question(); top(); }));
      app.querySelector('[data-act="prev"]').addEventListener('click', () => { d.i--; save(); question(); top(); });
      app.querySelector('[data-act="next"]').addEventListener('click', () => {
        if (d.i === 9) { d.review = true; save(); review(); } else { d.i++; save(); question(); }
        top();
      });
      document.title = `Test question ${d.i + 1} · Gabriella's Math Lab`;
    }

    function review() {
      const missing = qs.map((_, k) => k).filter((k) => !answered(k));
      app.innerHTML = `
        <div class="crumbs"><a href="#/">← Lesson menu</a></div>
        <p class="mode-label">Lesson 1 · Test</p>
        <h1 tabindex="-1">Ready to submit?</h1>
        <p>You answered <b>${10 - missing.length} of 10</b> questions.</p>
        ${missing.length ? `<div class="fb fb-info"><p>Not answered yet: ${missing.map((k) => `<button type="button" class="btn btn-link" data-k="${k}">Question ${k + 1}</button>`).join(' ')}</p><p>A question with no answer counts as incorrect.</p></div>` : ''}
        <ol class="review-list">${qs.map((q, k) => `<li><button type="button" class="btn btn-link" data-k="${k}">Question ${k + 1}</button>: ${answered(k) ? 'answered' : '<b>not answered</b>'}</li>`).join('')}</ol>
        <div class="done-actions">
          <button type="button" class="btn btn-primary btn-big" data-act="submit">Submit test</button>
          <button type="button" class="btn btn-big" data-act="back">Go back to my answers</button>
        </div>
        <div class="confirm" hidden>
          <p><b>You still have ${missing.length} unanswered question${missing.length === 1 ? '' : 's'}.</b> Submit anyway?</p>
          <button type="button" class="btn btn-primary" data-act="really">Yes, submit</button>
          <button type="button" class="btn" data-act="cancel">No, keep working</button>
        </div>`;
      const go = (k) => { d.review = false; d.i = k; save(); question(); top(); };
      app.querySelectorAll('[data-k]').forEach((b) => b.addEventListener('click', () => go(Number(b.dataset.k))));
      app.querySelector('[data-act="back"]').addEventListener('click', () => go(missing.length ? missing[0] : 9));
      app.querySelector('[data-act="submit"]').addEventListener('click', () => {
        if (missing.length) { app.querySelector('.confirm').hidden = false; app.querySelector('[data-act="really"]').focus(); } else submit();
      });
      app.querySelector('[data-act="really"]').addEventListener('click', submit);
      app.querySelector('[data-act="cancel"]').addEventListener('click', () => { app.querySelector('.confirm').hidden = true; });
      document.title = `Submit test · Gabriella's Math Lab`;
    }

    function submit() {
      const s = G.scoring.score(qs, d.answers);
      d.submitted = true;
      d.result = { date: new Date().toISOString(), correct: s.correct, total: s.total, percent: s.percent, mastered: s.mastered, skills: s.skills, missedSkills: s.missedSkills };
      G.store.update(lessonId, (p) => {
        p.tests.push(d.result);
        if (p.tests.length > 20) p.tests = p.tests.slice(-20);
        p.lastTestSigs = d.set.map((x) => x.sig);
      });
      save();
      results();
      top();
    }

    function results() {
      const r = d.result;
      const teachLink = (sk) => `#/${lessonId}/teach/${L.screens.findIndex((x) => x.id === L.skillScreen[sk]) + 1}`;
      app.innerHTML = `
        <div class="crumbs"><a href="#/">← Lesson menu</a></div>
        <p class="mode-label">Lesson 1 · Test results</p>
        <h1 tabindex="-1">Your score: ${r.correct} out of ${r.total} (${r.percent}%)</h1>
        <div class="card ${r.mastered ? 'card-ok' : 'card-warn'}">
          ${r.mastered ? '<p class="fb-title"><span aria-hidden="true">★</span> Lesson 1 mastered!</p><p>You got at least 9 out of 10 correct on your own.</p>'
            : '<p class="fb-title">Not mastered yet</p><p>The goal is at least 9 out of 10 correct. Review the skills below, practice, and then try a new test.</p>'}
          <p class="fine">The 9-out-of-10 goal is this app's learning benchmark, not an official Georgia Milestones score.</p>
        </div>
        <h2>Skills</h2>
        <table class="skills-table"><thead><tr><th scope="col">Skill</th><th scope="col">Correct</th><th scope="col">Review</th></tr></thead><tbody>
          ${Object.keys(r.skills).map((sk) => `<tr><td>${bank.skills[sk]}</td><td>${r.skills[sk].correct} of ${r.skills[sk].total}</td>
            <td>${r.missedSkills.includes(sk) ? `<a href="${teachLink(sk)}">Review in Teach</a>` : '<span class="tag tag-ok">✓</span>'}</td></tr>`).join('')}
        </tbody></table>
        <h2>Every question, explained</h2>
        <ol class="results-list">${qs.map((q, k) => {
          const ok = G.engine.check(q, d.answers[k]).status === 'correct';
          return `<li class="res-item ${ok ? 'res-ok' : 'res-miss'}">
            <p class="res-head"><b>Question ${k + 1}</b> ${ok ? '<span class="tag tag-ok">✓ Correct</span>' : '<span class="tag tag-miss">✗ Missed</span>'} <span class="sum-skill">${bank.skills[q.skill]}</span></p>
            <div class="res-prompt">${q.prompt}</div>
            ${q.visual ? `<div class="res-visual">${q.visual}</div>` : ''}
            <p>Your answer: <b>${esc(G.engine.describe(q, d.answers[k]))}</b></p>
            ${ok ? '' : `<p>Correct answer: <b>${esc(q.answerText)}</b></p>`}
            <p class="res-why">${q.why}</p></li>`;
        }).join('')}</ol>
        <div class="done-actions">
          ${r.missedSkills.length ? `<a class="btn btn-primary btn-big" href="${teachLink(r.missedSkills[0])}">Review in Teach</a>` : ''}
          <a class="btn btn-big ${r.missedSkills.length ? '' : 'btn-primary'}" href="#/${lessonId}/practice">Practice</a>
          <button type="button" class="btn btn-big" data-act="new">Take a new test</button>
          <a class="btn btn-big" href="#/">Lesson menu</a>
        </div>`;
      app.querySelector('[data-act="new"]').addEventListener('click', () => { G.store.clearDraft(draftName(lessonId)); d = null; intro(); top(); });
      document.title = `Test results · Gabriella's Math Lab`;
    }
  }

  G.views = G.views || {};
  G.views.test = view;
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
