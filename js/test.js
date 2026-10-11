// Test mode: 10 fresh questions, no hints, no feedback until the whole test is submitted.
// Answers stay editable until Submit. Results show score, missed skills and explanations.
// A test may be left and resumed. If Teach, Practice or Lesson Notes is opened while it is unfinished (noted by app.js),
// the test is still scored but does not count for ★ Mastered. Each attempt has an id, so a second tab can never
// record it twice or overwrite a submitted test.
(function (G) {
  'use strict';
  const draftName = (id) => 'test-' + id;
  const esc = (s) => G.models.esc(s);
  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const labels = (a) => (Array.isArray(a) ? a.filter((x) => typeof x === 'string') : []);
  const listText = (a) => (a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]);

  function newTest(lessonId) {
    const bank = G.engine.banks[lessonId];
    const L = G.lessonContent[lessonId];
    const prog = G.store.lesson(lessonId);
    const practiceDraft = G.store.getDraft('practice-' + lessonId);
    const exclude = new Set([...L.teachSigs, ...(practiceDraft && Array.isArray(practiceDraft.set) ? practiceDraft.set.map((x) => x.sig) : [])]);
    // Questions from recent practice and from the last few tests (whose answers were shown) are left out when possible.
    const avoid = new Set([...prog.practice.recentSigs, ...prog.recentTestSigs]);
    // Two-choice questions (a coin-flip guess) are kept for Practice only.
    const set = G.engine.buildSet(lessonId, { plan: bank.plan, seed: (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0, exclude, avoid, skip: bank.practiceOnly });
    return { id: newId(), set, answers: set.map(() => null), i: 0, started: false, submitted: false, review: false, assist: [] };
  }

  /** Add a submitted attempt d to lesson progress p, once. The count and first mastery outlive the 20-test history. */
  function record(p, d) {
    if (p.tests.some((t) => t.id === d.id)) return; // this attempt is already recorded
    p.tests.push(d.result);
    if (p.tests.length > 20) p.tests = p.tests.slice(-20);
    p.testsTaken++;
    if (d.result.mastered && !p.masteredOn) p.masteredOn = d.result.date;
    p.lastTestSigs = d.set.map((x) => x.sig);
    // The last three tests' questions (their answers were shown on the results page) are avoided in new sets.
    p.recentTestSigs = [...p.lastTestSigs, ...p.recentTestSigs.filter((x) => !p.lastTestSigs.includes(x))].slice(0, 30);
  }

  function view(app, lessonId) {
    const bank = G.engine.banks[lessonId];
    const L = G.lessonContent[lessonId];
    let d = G.store.getDraft(draftName(lessonId));
    const okDraft = d && G.engine.validSet(lessonId, d.set, 10) && Array.isArray(d.answers) && d.answers.length === 10 &&
      Number.isInteger(d.i) && d.i >= 0 && d.i < 10 && (!d.submitted || (d.result && Number.isInteger(d.result.correct) && d.result.skills && Array.isArray(d.result.missedSkills)));
    const lost = !okDraft && d && d.started && !d.submitted; // an unfinished test the updated app cannot rebuild
    if (!okDraft) { if (d) G.store.clearDraft(draftName(lessonId)); d = null; }
    if (d && !d.id) { d.id = newId(); G.store.setDraft(draftName(lessonId), d); } // a test saved before attempts had ids
    // An app update can reword a choice, so an answer saved before it may match no choice now. Ask for that answer
    // again instead of scoring it as wrong.
    if (d && d.started && !d.submitted) {
      const reset = [];
      d.set.forEach((x, k) => {
        const q = G.engine.make(lessonId, x.id, x.seed), a = d.answers[k];
        if (q.type === 'mc' && a != null && a !== '' && !q.choices.some((c) => c.value === a)) { d.answers[k] = null; reset.push(k); }
      });
      if (reset.length) { d.reset = [...new Set([...(Array.isArray(d.reset) ? d.reset : []), ...reset])]; G.store.setDraft(draftName(lessonId), d); }
    }
    let qs = d ? d.set.map((x) => G.engine.make(lessonId, x.id, x.seed)) : null;
    const top = () => { window.scrollTo(0, 0); const h = app.querySelector('h1'); if (h) h.focus(); };
    // Another tab may have submitted, restarted or replaced this test since this page was drawn.
    const stale = () => { const s = G.store.getDraft(draftName(lessonId)); return !s || s.id !== d.id || (!!s.submitted && !d.submitted); };
    const reload = () => { view(app, lessonId); top(); };
    /** Save the test. If another tab changed it, show what is stored instead and return false. */
    const save = () => {
      if (d.started && !d.submitted) {
        if (stale()) { reload(); return false; }
        d.assist = [...new Set([...labels(d.assist), ...labels(G.store.getDraft(draftName(lessonId)).assist)])];
      }
      G.store.setDraft(draftName(lessonId), d);
      return true;
    };
    const resetNote = () => {
      const ks = (Array.isArray(d && d.reset) ? d.reset : []).filter((k) => Number.isInteger(k) && k >= 0 && k < 10 && !G.engine.isAnswered(qs[k], d.answers[k]));
      return ks.length ? `<div class="fb fb-info reset-note"><p>The app was updated and the wording of some choices changed. Please answer ${ks.length === 1 ? 'question' : 'questions'} ${listText(ks.map((k) => String(k + 1)))} again.</p></div>` : '';
    };
    const assistNote = () => {
      const a = labels(d && d.assist);
      return a.length ? `<div class="fb fb-info assist-note"><p><b>Heads up:</b> ${listText(a)} ${a.length === 1 ? 'was' : 'were'} opened while this test was unfinished.
        You can still finish it and see your score. Because ★ Mastered means a test done on your own, this test will not count for it.</p></div>` : '';
    };

    if (!d || !d.started) intro();
    else if (d.submitted) results();
    else if (d.review) review();
    else question();

    function intro() {
      app.innerHTML = `
        <div class="crumbs"><a href="#/learn">← Lesson menu</a></div>
        <p class="mode-label">Lesson ${G.unit.find(lessonId).n} · Test</p>
        <h1 tabindex="-1">Lesson ${G.unit.find(lessonId).n} Test</h1>
        ${lost ? '<div class="fb fb-info"><p>The app was updated, and your unfinished test could not be continued. Please start a new test. Your earlier results are still saved.</p></div>' : ''}
        <div class="card">
          <ul class="facts">
            <li>There are <b>10 questions</b>.</li>
            <li>Work on your own. There are <b>no hints</b> in the test.</li>
            <li>You will not see if an answer is right until you submit the whole test.</li>
            <li>You can go back and change answers before you submit.</li>
            <li>There is no time limit. You can leave and come back later: your answers are saved.</li>
            <li>To earn ★ Mastered, do the test on your own. If you open Teach, Practice or Lesson Notes before you submit, you still get a score, but that test will not count for ★ Mastered.</li>
          </ul>
        </div>
        <div class="done-actions">
          <button type="button" class="btn btn-primary btn-big" data-act="start">Start the test</button>
          <a class="btn btn-big" href="#/${lessonId}/practice">Practice first</a>
        </div>`;
      app.querySelector('[data-act="start"]').addEventListener('click', () => {
        if (G.store.openTest(lessonId)) { reload(); return; } // another tab already started this test: continue that one
        d = newTest(lessonId);
        d.started = true;
        qs = d.set.map((x) => G.engine.make(lessonId, x.id, x.seed));
        G.store.setDraft(draftName(lessonId), d);
        question();
        top();
      });
      document.title = `Test · NumberNova`;
    }

    function answered(k) { return G.engine.isAnswered(qs[k], d.answers[k]); }

    function question() {
      const q = qs[d.i];
      app.innerHTML = `
        <div class="crumbs"><a href="#/learn">← Lesson menu</a> <span class="crumb-note">(your answers are saved)</span></div>
        <p class="mode-label">Lesson ${G.unit.find(lessonId).n} · Test (no hints, work on your own) <span class="screen-count">Question ${d.i + 1} of 10</span></p>
        <nav class="qnav" aria-label="Test questions">${qs.map((_, k) =>
          `<button type="button" class="qnav-btn${k === d.i ? ' is-current' : ''}${answered(k) ? ' is-done' : ''}" data-k="${k}" aria-label="Question ${k + 1}${answered(k) ? ', answered' : ', not answered'}"${k === d.i ? ' aria-current="step"' : ''}>${k + 1}</button>`).join('')}</nav>
        <h1 tabindex="-1" class="q-heading">Question ${d.i + 1}</h1>
        ${resetNote()}${assistNote()}
        <div class="test-q"></div>
        <p class="fb fb-info test-note" role="status" hidden></p>
        <nav class="pager" aria-label="Move between questions">
          <button type="button" class="btn" data-act="prev" ${d.i === 0 ? 'hidden' : ''}>← Previous</button>
          <button type="button" class="btn btn-primary" data-act="next">${d.i === 9 ? 'Review my answers' : 'Next →'}</button>
        </nav>`;
      G.qui.render(q, app.querySelector('.test-q'), {
        response: d.answers[d.i],
        onChange: (r) => {
          d.answers[d.i] = r;
          if (!save()) return;
          note();
          const b = app.querySelector(`.qnav-btn[data-k="${d.i}"]`);
          b.classList.toggle('is-done', answered(d.i));
          b.setAttribute('aria-label', `Question ${d.i + 1}${answered(d.i) ? ', answered' : ', not answered'}`);
        },
        onEnter: () => app.querySelector('[data-act="next"]').click()
      });
      // Unreadable input (like "0,5") gets a note; it does not say whether an answer is right.
      function note() {
        const c = G.engine.check(q, d.answers[d.i]);
        const el = app.querySelector('.test-note');
        el.hidden = c.status !== 'invalid';
        el.textContent = c.status === 'invalid' ? c.message + ' Until then, this question counts as not answered.' : '';
      }
      note();
      app.querySelectorAll('.qnav-btn').forEach((b) => b.addEventListener('click', () => { d.i = Number(b.dataset.k); if (save()) { question(); top(); } }));
      app.querySelector('[data-act="prev"]').addEventListener('click', () => { d.i--; if (save()) { question(); top(); } });
      app.querySelector('[data-act="next"]').addEventListener('click', () => {
        if (d.i === 9) d.review = true; else d.i++;
        if (!save()) return;
        if (d.review) review(); else question();
        top();
      });
      document.title = `Test question ${d.i + 1} · NumberNova`;
    }

    function review() {
      const missing = qs.map((_, k) => k).filter((k) => !answered(k));
      app.innerHTML = `
        <div class="crumbs"><a href="#/learn">← Lesson menu</a></div>
        <p class="mode-label">Lesson ${G.unit.find(lessonId).n} · Test</p>
        <h1 tabindex="-1">Ready to submit?</h1>
        ${resetNote()}${assistNote()}
        <p>You answered <b>${10 - missing.length} of 10</b> questions.${missing.length ? '' : ' You can still go back and check your answers, or submit now.'}</p>
        ${missing.length ? `<div class="fb fb-info"><p>Not answered yet: ${missing.map((k) => `<button type="button" class="btn btn-link" data-k="${k}">Question ${k + 1}</button>`).join(' ')}</p><p>A question with no answer counts as incorrect.</p></div>` : ''}
        <div class="done-actions">
          <button type="button" class="btn btn-primary btn-big" data-act="submit">Submit test</button>
          <button type="button" class="btn btn-big" data-act="back">Go back to my answers</button>
        </div>
        <div class="confirm" hidden>
          <p><b>You still have ${missing.length} unanswered question${missing.length === 1 ? '' : 's'}.</b> Submit anyway?</p>
          <button type="button" class="btn btn-primary" data-act="really">Yes, submit</button>
          <button type="button" class="btn" data-act="cancel">No, keep working</button>
        </div>`;
      const go = (k) => { d.review = false; d.i = k; if (save()) { question(); top(); } };
      app.querySelectorAll('[data-k]').forEach((b) => b.addEventListener('click', () => go(Number(b.dataset.k))));
      app.querySelector('[data-act="back"]').addEventListener('click', () => go(missing.length ? missing[0] : 9));
      app.querySelector('[data-act="submit"]').addEventListener('click', () => {
        if (missing.length) { app.querySelector('.confirm').hidden = false; app.querySelector('[data-act="really"]').focus(); } else submit();
      });
      app.querySelector('[data-act="really"]').addEventListener('click', submit);
      app.querySelector('[data-act="cancel"]').addEventListener('click', () => { app.querySelector('.confirm').hidden = true; });
      document.title = `Submit test · NumberNova`;
    }

    function submit() {
      if (d.submitted) return; // a second click must not record a second result
      if (stale()) { reload(); return; } // already submitted or replaced in another tab
      const assist = [...new Set([...labels(d.assist), ...labels(G.store.getDraft(draftName(lessonId)).assist)])];
      const s = G.scoring.score(qs, d.answers);
      d.submitted = true;
      d.assist = assist;
      // goalMet: 9 or more correct. mastered: the goal was met with no lesson pages opened during the test.
      d.result = { id: d.id, date: new Date().toISOString(), correct: s.correct, total: s.total, percent: s.percent, goalMet: s.mastered, mastered: s.mastered && !assist.length, skills: s.skills, missedSkills: s.missedSkills };
      if (assist.length) d.result.assisted = assist;
      G.store.update(lessonId, (p) => record(p, d));
      G.store.setDraft(draftName(lessonId), d);
      results();
      top();
    }

    function results() {
      const r = d.result;
      const okAt = (k) => G.engine.check(qs[k], d.answers[k]).status === 'correct';
      const missedIdx = qs.map((_, k) => k).filter((k) => !okAt(k)), rightIdx = qs.map((_, k) => k).filter(okAt);
      const item = (k) => {
        const q = qs[k], ok = okAt(k);
        return `<li class="res-item ${ok ? 'res-ok' : 'res-miss'}">
            <p class="res-head"><b>Question ${k + 1}</b> ${ok ? '<span class="tag tag-ok">✓ Correct</span>' : '<span class="tag tag-miss">✗ Missed</span>'} <span class="sum-skill">${bank.skills[q.skill]}</span></p>
            <div class="res-prompt">${q.prompt}</div>
            ${q.visual ? `<div class="res-visual">${q.visual}</div>` : ''}
            <p>Your answer: <b>${esc(G.engine.describe(q, d.answers[k]))}</b></p>
            ${ok ? '' : `<p>Correct answer: <b>${esc(q.answerText)}</b></p>`}
            ${!ok && /right amount/.test(G.engine.check(q, d.answers[k]).message || '') ? `<p class="fine">${esc(G.engine.check(q, d.answers[k]).message)}</p>` : ''}
            <p class="res-why">${q.why}</p></li>`;
      };
      const teachLink = (sk) => `#/${lessonId}/teach/${L.screens.findIndex((x) => x.id === L.skillScreen[sk]) + 1}`;
      app.innerHTML = `
        <div class="crumbs"><a href="#/learn">← Lesson menu</a></div>
        <p class="mode-label">Lesson ${G.unit.find(lessonId).n} · Test results</p>
        <h1 tabindex="-1">Your score: ${r.correct} out of ${r.total} (${r.percent}%)</h1>
        <div class="card ${r.mastered ? 'card-ok' : 'card-warn'}">
          ${r.mastered ? `<p class="fb-title"><span aria-hidden="true">★</span> Lesson ${G.unit.find(lessonId).n} mastered!</p>` + '<p>You got at least 9 out of 10 correct on your own.</p>'
            : r.goalMet && r.assisted ? `<p class="fb-title">Great score! This time it counts as practice</p><p>${listText(r.assisted)} ${r.assisted.length === 1 ? 'was' : 'were'} opened during this test, so it does not count for ★ Mastered. When you are ready, take a new test on your own to earn it.</p>`
            : '<p class="fb-title">Not mastered yet</p><p>The goal is at least 9 out of 10 correct. Review the skills below, practice, and then try a new test.</p>' +
              (r.assisted ? `<p class="fine">${listText(r.assisted)} ${r.assisted.length === 1 ? 'was' : 'were'} opened during this test.</p>` : '')}
        </div>
        <h2>Skills</h2>
        <table class="skills-table"><thead><tr><th scope="col">Skill</th><th scope="col">Correct</th><th scope="col">Review</th></tr></thead><tbody>
          ${Object.keys(r.skills).map((sk) => `<tr><td>${bank.skills[sk]}</td><td>${r.skills[sk].correct} of ${r.skills[sk].total}</td>
            <td>${r.missedSkills.includes(sk) ? `<a href="${teachLink(sk)}">Review in Teach</a>` : '<span class="tag tag-ok">✓</span>'}</td></tr>`).join('')}
        </tbody></table>
        ${missedIdx.length ? `<h2>Questions to look at again</h2><ol class="results-list">${missedIdx.map(item).join('')}</ol>` : ''}
        ${rightIdx.length ? `<details class="res-right"><summary>Questions you got right (${rightIdx.length})</summary><ol class="results-list">${rightIdx.map(item).join('')}</ol></details>` : ''}
        <div class="done-actions">
          ${r.missedSkills.length ? `<a class="btn btn-primary btn-big" href="${teachLink(r.missedSkills[0])}">Review in Teach</a>` : ''}
          <a class="btn btn-big ${r.missedSkills.length ? '' : 'btn-primary'}" href="#/${lessonId}/practice">Practice</a>
          <button type="button" class="btn btn-big" data-act="new">Take a new test</button>
          <a class="btn btn-big" href="#/learn">Lesson menu</a>
        </div>`;
      app.querySelector('[data-act="new"]').addEventListener('click', () => {
        const s = G.store.getDraft(draftName(lessonId));
        if (s && s.id !== d.id && s.started && !s.submitted) { reload(); return; } // another tab already started a new test
        G.store.clearDraft(draftName(lessonId)); d = null; intro(); top();
      });
      document.title = `Test results · NumberNova`;
    }
  }

  // Keep tabs in step: when another tab changes this lesson's test, redraw it from what is stored.
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('storage', (e) => {
      const m = (location.hash || '').match(/^#\/(d\d\d)\/test$/);
      if (!m || e.key !== 'gml:v1:draft:' + draftName(m[1]) || !G.unit.available(m[1])) return;
      const app = document.getElementById('app');
      view(app, m[1]);
      const h = app.querySelector('h1'); if (h) h.focus({ preventScroll: true });
    });
  }

  G.views = G.views || {};
  G.views.test = view;
  view.newTest = newTest; // for tests
  view.record = record;
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
