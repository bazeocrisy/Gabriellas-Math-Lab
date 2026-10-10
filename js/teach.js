// Teach mode: one idea per screen, worked examples revealed step by step, shade-it-yourself models,
// and guided "Try it together" checks with coaching. Back and Next move between screens.
(function (G) {
  'use strict';
  const STEPS_KEY = 'teach-steps';

  function view(app, lessonId, n) {
    const L = G.lessonContent[lessonId];
    const total = L.screens.length;
    const i = Math.min(Math.max((n || 1) - 1, 0), total - 1);
    if (i + 1 !== n) { location.replace(`#/${lessonId}/teach/${i + 1}`); return; }
    const sc = L.screens[i];
    G.store.update(lessonId, (p) => {
      p.teach.screen = i;
      // Progress only counts when screens are reached in order (not by jumping in from a link).
      if (i <= p.teach.furthest + 1) {
        p.teach.furthest = Math.max(p.teach.furthest, i);
        if (sc.kind === 'done') p.teach.done = true;
      }
    });
    const steps = sc.steps || [];
    const saved = G.store.getDraft(STEPS_KEY);
    const revealed = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
    const was = revealed[lessonId + ':' + sc.id];
    let shown = Math.min(steps.length, Number.isInteger(was) && was > 0 ? was : (steps.length ? 1 : 0));
    let checkSolved = false;
    const WHY = sc.why ? `<div class="why-box" hidden><p class="why-title">Why it works</p><p>${sc.why}</p></div>` : '';
    const STEPBTN = '<button type="button" class="btn btn-primary step-btn" data-act="step">Show next step</button>';

    app.innerHTML = `
      <div class="crumbs"><a href="#/">← Lesson menu</a></div>
      <p class="mode-label">Lesson ${G.unit.find(lessonId).n} · Teach <span class="screen-count">Screen ${i + 1} of ${total}</span></p>
      <div class="progress" role="progressbar" aria-label="Lesson progress" aria-valuemin="1" aria-valuemax="${total}" aria-valuenow="${i + 1}"><span style="width:${((i + 1) / total) * 100}%"></span></div>
      <h1 tabindex="-1">${sc.title}</h1>
      ${sc.goal ? `<p class="goal"><b>You will learn:</b> ${sc.goal}</p>` : ''}
      <div class="teach-body">${sc.body || ''}</div>
      ${sc.visual ? `<div class="teach-visual">${sc.visual}</div>` : ''}
      ${sc.example || sc.exampleVisual ? `<section class="example">${sc.example ? `<h2>${sc.example}</h2>` : ''}${sc.exampleVisual ? `<div class="teach-visual">${sc.exampleVisual}</div>` : ''}<ol class="steps"></ol>${STEPBTN}${WHY}</section>`
        : steps.length ? `<section class="example"><ol class="steps"></ol>${STEPBTN}${WHY}</section>` : ''}
      ${sc.widget ? `<details class="try-it"><summary>Try it yourself: shade a model</summary><p>Use the + and − buttons to shade the model. Watch how the decimal changes.</p><div class="widget"></div></details>` : ''}
      ${sc.kind === 'check' ? '<section class="guided"><p class="guided-intro">Let\'s check that idea. Answer this question. You can use hints.</p><div class="check-host"></div></section>' : ''}
      ${sc.kind === 'done' ? `<div class="done-actions">
          <a class="btn btn-primary btn-big" href="#/${lessonId}/practice">Start Practice</a>
          <a class="btn btn-big" href="#/${lessonId}/notes">Lesson Notes</a>
          <a class="btn btn-big" href="#/">Lesson menu</a></div>` : ''}
      <p class="step-note fine" hidden>Show all the steps of the example to go on.</p>
      <nav class="pager" aria-label="Teach screens">
        <a class="btn" href="#/${lessonId}/teach/${i}" ${i === 0 ? 'hidden' : ''}>← Back</a>
        <button type="button" class="btn btn-primary" data-act="next"></button>
      </nav>`;

    const stepsEl = app.querySelector('.steps');
    const nextBtn = app.querySelector('[data-act="next"]');
    function drawSteps() {
      if (!stepsEl) return;
      stepsEl.innerHTML = steps.slice(0, shown).map((s) => `<li>${s}</li>`).join('');
      // "Why it works" appears once the whole example has been shown.
      const why = app.querySelector('.why-box');
      if (why) why.hidden = shown < steps.length;
    }
    const stepBtn = app.querySelector('[data-act="step"]');
    const stepNote = app.querySelector('.step-note');
    function drawNext() {
      if (stepBtn) stepBtn.hidden = shown >= steps.length;
      if (stepBtn) stepBtn.textContent = `Show next step (${shown + 1} of ${steps.length})`;
      stepNote.hidden = !(shown < steps.length && i < total - 1);
      if (i === total - 1) { nextBtn.hidden = true; return; }
      if (shown < steps.length) { nextBtn.textContent = 'Next →'; nextBtn.disabled = true; return; }
      if (sc.kind === 'check' && !checkSolved) { nextBtn.textContent = 'Answer to go on'; nextBtn.disabled = true; return; }
      nextBtn.textContent = 'Next →';
      nextBtn.disabled = false;
    }
    if (stepBtn) stepBtn.addEventListener('click', () => {
      shown++;
      revealed[lessonId + ':' + sc.id] = shown;
      G.store.setDraft(STEPS_KEY, revealed);
      drawSteps();
      drawNext();
      const last = stepsEl.lastElementChild;
      if (last && last.scrollIntoView) last.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      if (shown >= steps.length) nextBtn.focus({ preventScroll: true });
    });
    nextBtn.addEventListener('click', () => { location.hash = `#/${lessonId}/teach/${i + 2}`; });

    if (sc.widget) G.qui.builder(app.querySelector('.widget'), sc.widget === 'grid' ? 'grid' : 'strip', { showDecimal: true });

    if (sc.kind === 'check') {
      const q = G.engine.make(lessonId, sc.check.t, 1, sc.check.params);
      const draftKey = `teach-${lessonId}-${sc.id}`;
      G.coach(app.querySelector('.check-host'), q, {
        state: G.store.getDraft(draftKey) || {},
        remind: sc.reteach,
        onChange: (st) => G.store.setDraft(draftKey, st),
        onSolved: () => { checkSolved = true; drawNext(); }
      });
    }
    drawSteps();
    drawNext();
    document.title = `${sc.title} · Teach · Gabriella's Math Lab`;
  }

  G.views = G.views || {};
  G.views.teach = view;
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
