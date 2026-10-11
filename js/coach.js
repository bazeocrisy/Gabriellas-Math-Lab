// Coached question (Practice and Teach "Try it together"): Check answer, three progressive hints,
// misconception-specific feedback, unlimited retries, and a worked solution only after several tries.
(function (G) {
  'use strict';
  const SOLUTION_AFTER = 3; // wrong attempts before "Show me how to solve it" is offered

  /**
   * host: element; q: question; opts: { state (saved and mutated), remind (html), onChange(state), onSolved(state) }
   */
  function coach(host, q, opts) {
    const st = Object.assign({ hints: 0, attempts: 0, solved: false, firstTry: null, shown: false, resp: null, fb: null }, opts.state || {});
    host.innerHTML = `<div class="coach">
      <div class="coach-q"></div>
      <div class="coach-actions">
        <button type="button" class="btn btn-primary" data-act="check">Check answer</button>
        <button type="button" class="btn btn-hint" data-act="hint">Get a hint</button>
      </div>
      <div class="hints" aria-live="polite"></div>
      <div class="feedback" aria-live="polite"></div>
      <div class="coach-next"></div></div>`;
    const $ = (s) => host.querySelector(s);
    const save = () => opts.onChange && opts.onChange(st);
    const ctl = G.qui.render(q, $('.coach-q'), { response: st.resp, onChange: (r) => { st.resp = r; if (st.fb && st.fb.kind === 'info') { st.fb = null; drawFeedback(); } save(); }, onEnter: () => doCheck() });

    function drawHints() {
      $('.hints').innerHTML = q.hints.slice(0, st.hints).map((h, i) =>
        `<div class="hint"><p class="hint-title">Hint ${i + 1} of 3</p><div>${h}</div></div>`).join('');
      const b = $('[data-act="hint"]');
      b.textContent = st.hints === 0 ? 'Get a hint' : st.hints < 3 ? `Next hint (${st.hints + 1} of 3)` : 'No more hints';
      b.disabled = st.hints >= 3;
    }

    function drawFeedback() {
      const fb = st.fb, el = $('.feedback');
      if (!fb) { el.innerHTML = ''; return; }
      if (fb.kind === 'info') { el.innerHTML = `<div class="fb fb-info"><p>${G.models.esc(fb.msg)}</p></div>`; return; }
      if (fb.kind === 'correct') {
        el.innerHTML = `<div class="fb fb-right"><p class="fb-title"><span aria-hidden="true">✓</span> Correct!</p><p>${q.why}</p></div>`;
        return;
      }
      if (fb.kind === 'solution') {
        el.innerHTML = `<div class="fb fb-solution"><p class="fb-title">Here is how to solve it</p>${q.solution || ''}<p>${q.why}</p>
          <p>The answer is <b>${G.models.esc(q.answerText)}</b>. Read the steps again, then try the next one on your own.</p></div>`;
        return;
      }
      // Wrong answer: say so, explain the likely mistake, show a reminder, and invite another try.
      const tip = st.hints < 3 ? 'If you are stuck, press <b>' + (st.hints ? 'Next hint' : 'Get a hint') + '</b>.' : '';
      el.innerHTML = `<div class="fb fb-wrong">
        <p class="fb-title"><span aria-hidden="true">✗</span> Not quite. That answer is not correct yet.</p>
        <p>${G.models.esc(fb.msg)}</p>
        ${(q.remind || opts.remind) ? `<details class="remind"><summary>Show me a reminder</summary>${q.remind || opts.remind}</details>` : ''}
        <p><b>Try again:</b> change your answer, then press Check answer. ${tip}</p>
        ${st.attempts >= SOLUTION_AFTER ? '<button type="button" class="btn btn-link" data-act="solution">Show me how to solve it</button>' : ''}
      </div>`;
      const sol = el.querySelector('[data-act="solution"]');
      if (sol) sol.addEventListener('click', showSolution);
    }

    function finish(moveFocus) {
      ctl.disable(true);
      $('.coach-actions').hidden = true;
      if (opts.onSolved) opts.onSolved(st);
      // The button that was pressed is now hidden. Put keyboard focus on the feedback (Tab then reaches Next).
      const fb = moveFocus && $('.feedback .fb');
      if (fb) { fb.tabIndex = -1; fb.focus({ preventScroll: true }); }
    }

    function doCheck() {
      if (st.solved) return;
      const r = G.engine.check(q, ctl.get());
      st.resp = ctl.get();
      if (r.status === 'empty' || r.status === 'invalid') {
        st.fb = { kind: 'info', msg: r.message };
      } else if (r.status === 'correct') {
        st.solved = true;
        st.firstTry = st.attempts === 0;
        st.fb = { kind: 'correct' };
      } else {
        // Checking the same wrong answer again is not a new try, so tapping Check cannot unlock the solution.
        const key = JSON.stringify(st.resp);
        if (st.lastWrong === key) {
          st.fb = { kind: 'wrong', msg: 'That is the same answer you already checked. Change your answer before you check again. ' + r.message };
        } else {
          st.attempts++;
          st.lastWrong = key;
          st.fb = { kind: 'wrong', msg: r.message };
        }
      }
      save();
      drawFeedback();
      if (st.solved) finish(true);
      else $('.feedback .fb') && $('.feedback .fb').scrollIntoView && $('.feedback .fb').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    function showSolution() {
      st.shown = true;
      st.solved = true;
      st.firstTry = false;
      st.fb = { kind: 'solution' };
      save();
      drawFeedback();
      finish(true);
    }

    $('[data-act="check"]').addEventListener('click', doCheck);
    $('[data-act="hint"]').addEventListener('click', () => {
      if (st.hints < 3) st.hints++;
      save();
      drawHints();
      if (st.fb && st.fb.kind === 'wrong') drawFeedback();
      const all = host.querySelectorAll('.hint');
      if (all.length) all[all.length - 1].scrollIntoView && all[all.length - 1].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      // After the last hint the hint button is disabled; move focus to that hint so keyboard users keep their place.
      if (st.hints >= 3 && all.length) { const h = all[all.length - 1]; h.tabIndex = -1; h.focus({ preventScroll: true }); }
    });
    drawHints();
    drawFeedback();
    if (st.solved) finish();
    return { state: st, next: $('.coach-next'), focus: () => ctl.focus() };
  }

  G.coach = coach;
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
