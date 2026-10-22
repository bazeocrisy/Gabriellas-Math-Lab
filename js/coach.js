// Coached question (Practice and Teach "Try it together"): Check answer, three progressive hints,
// misconception-specific feedback, unlimited retries, and optional immediate worked help in learning modes.
(function (G) {
  'use strict';
  const SOLUTION_AFTER = 3; // wrong attempts before "Show me how to solve it" is offered

  /**
   * host: element; q: question; opts: { state (saved and mutated), remind (html), onChange(state), onSolved(state) }
   */
  function coach(host, q, opts) {
    const st = Object.assign({ hints: 0, attempts: 0, solved: false, firstTry: null, shown: false, resp: null, fb: null }, opts.state || {});
    // "See it": a picture of the problem (q.picture) or the lesson's reminder card, before answering. The reminder is
    // offered only when the page asks (opts.seeIt): Teach reteach notes can contain the answer, so they stay feedback-only.
    const model = q.picture || (opts.seeIt && opts.remind) || '';
    const modelLabel = q.picture ? 'Show me a picture' : 'Show me a reminder';
    // Two parts: the question and its controls, then the help (hints, feedback, Next). On wide screens they sit side
    // by side; on smaller screens the help follows the question, in the same order as the page is read.
    host.innerHTML = `<div class="coach">
      <div class="coach-main">
        <div class="coach-q"></div>
        <div class="coach-actions">
          <button type="button" class="btn btn-primary btn-check" data-act="check">Check answer</button>
          <button type="button" class="btn btn-hint" data-act="hint">Get a hint</button>
          ${opts.easyHelp ? `<button type="button" class="btn btn-help" data-act="solution">I don’t know — show me how</button>` : ""}
          ${model ? `<button type="button" class="btn btn-model" data-act="model" aria-expanded="false">${modelLabel}</button>` : ''}
        </div>
        ${model ? `<div class="coach-model" hidden>${model}</div>` : ''}
      </div>
      <div class="coach-help">
        <div class="hints" aria-live="polite"></div>
        <div class="feedback" aria-live="polite"></div>
        <div class="coach-next"></div>
      </div></div>`;
    const $ = (s) => host.querySelector(s);
    const save = () => opts.onChange && opts.onChange(st);
    const ctl = G.qui.render(q, $('.coach-q'), { response: st.resp, onChange: (r) => { st.resp = r; if (st.fb && st.fb.kind === 'info') { st.fb = null; drawFeedback(); } save(); }, onEnter: () => doCheck() });

    function drawHints() {
      const blocks = q.hints.slice(0, st.hints).map((h, i) =>
        `<div class="hint"><p class="hint-title">Hint ${i + 1} of 3</p><div>${h}</div></div>`);
      $('.hints').innerHTML = opts.easyHelp && blocks.length > 1 ? `<details class="c4-earlier-hints"><summary>Earlier hints (${blocks.length - 1})</summary>${blocks.slice(0,-1).join('')}</details>${blocks.at(-1)}` : blocks.join('');
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
        el.innerHTML = `<div class="fb fb-solution"><p class="fb-title">Here is how to solve it</p>${q.solution || ''}<div class="sol-end"><p>${q.why}</p>
          <p>The answer is <b>${G.models.esc(q.answerText)}</b>. Read the steps again, then try the next one on your own.</p></div></div>`;
        stepThrough(el);
        return;
      }
      // Wrong answer: say so, explain the likely mistake, show a reminder, and invite another try.
      const tip = st.hints < 3 ? 'If you are stuck, press <b>' + (st.hints ? 'Next hint' : 'Get a hint') + '</b>.' : '';
      el.innerHTML = `<div class="fb fb-wrong">
        <p class="fb-title"><span aria-hidden="true">✗</span> Not quite. That answer is not correct yet.</p>
        <p>${G.models.esc(fb.msg)}</p>
        ${(q.remind || opts.remind) && !(model && !q.picture && !q.remind) ? `<details class="remind"><summary>${model && !q.picture ? 'Reminder for this question' : 'Show me a reminder'}</summary>${q.remind || opts.remind}</details>` : ''}
        <p><b>Try again:</b> change your answer, then press Check answer. ${tip}</p>
        ${!opts.easyHelp && st.attempts >= SOLUTION_AFTER ? '<button type="button" class="btn btn-link" data-act="solution">Show me how to solve it</button>' : ''}
      </div>`;
      const sol = el.querySelector('[data-act="solution"]');
      if (sol) sol.addEventListener('click', showSolution);
    }

    /** Worked solutions with several steps are shown one step at a time ("Show next step"), like Teach examples. */
    function stepThrough(el) {
      const items = [...el.querySelectorAll('.sol-steps > li')];
      if (items.length < 2) return;
      const total = items.length;
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'btn btn-primary sol-next'; btn.dataset.act = 'sol-next';
      const end = el.querySelector('.sol-end');
      const parts = [...el.querySelectorAll('[data-k]')].filter((x) => !x.matches('li'));
      const draw = () => {
        const shown = Math.min(Math.max(Number.isInteger(st.solStep) ? st.solStep : 1, 1), total);
        items.forEach((li, k) => { li.hidden = k >= shown; li.classList.toggle('is-current', k === shown - 1); });
        btn.hidden = shown >= total;
        const all=el.querySelector("[data-act=sol-all]");if(all)all.hidden=shown>=total;
        btn.textContent = `Show next step (${shown + 1} of ${total})`;
        if (end) end.hidden = shown < total;
        // A worked layout (long division) fills in with the steps: digits and rows appear when their step does.
        const upTo = Math.max(-1, ...items.slice(0, shown).map((li) => (li.dataset.k !== undefined ? Number(li.dataset.k) : 99)));
        parts.forEach((x) => x.classList.toggle('sol-later', Number(x.dataset.k) > upTo));
      };
      btn.addEventListener('click', () => {
        st.solStep = Math.min((st.solStep || 1) + 1, total);
        save(); draw();
        const cur = items[st.solStep - 1];
        if (cur) { cur.tabIndex = -1; cur.focus({ preventScroll: true }); }
      });
      const lists = el.querySelectorAll('.sol-steps');
      lists[lists.length - 1].after(btn);
      draw();
      if (opts.easyHelp) {
        const all = document.createElement('button');
        all.type = 'button'; all.className = 'btn sol-all'; all.dataset.act = 'sol-all';
        all.textContent = 'Show all steps and answer';
        all.hidden=(st.solStep||1)>=total;
        btn.after(all);
        all.onclick = () => { st.solStep = total; save(); draw(); all.hidden = true; if(end){end.tabIndex=-1;end.focus({preventScroll:true});end.scrollIntoView({block:'nearest'});} };
      }
    }

    function finish(moveFocus) {
      ctl.disable(true);
      $('.coach-actions').hidden = true;
      if (opts.onSolved) opts.onSolved(st);
      // The button that was pressed is now hidden. Put keyboard focus on what comes next: the page's Next button when
      // the page says so (Teach), otherwise the feedback (Practice; Tab then reaches "Next question").
      if (!moveFocus) return;
      const next = opts.focusAfter && opts.focusAfter();
      const fb = $('.feedback .fb');
      if (next && !next.disabled) next.focus({ preventScroll: true });
      else if (fb) { fb.tabIndex = -1; fb.focus({ preventScroll: true }); }
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
    if(opts.easyHelp) $('[data-act="solution"]').addEventListener('click', showSolution);
    if (model) {
      const mb = $('[data-act="model"]'), panel = $('.coach-model');
      const drawModel = () => { panel.hidden = !st.model; mb.setAttribute('aria-expanded', String(!!st.model)); mb.textContent = st.model ? (q.picture ? 'Hide the picture' : 'Hide the reminder') : modelLabel; };
      // Opening the picture is remembered with the question; it does not change how the answer is scored.
      mb.addEventListener('click', () => { st.model = !st.model; if (st.model) st.usedModel = true; save(); drawModel(); });
      drawModel();
    }
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

  /** After "Next question": put keyboard focus in the new answer box, or on the heading for other kinds of question. */
  coach.focusAnswer = function (root) {
    const inp = root.querySelector('.coach-q input:not([type=radio]):not([type=checkbox]):not(:disabled), .coach-q textarea:not(:disabled)');
    const h = root.querySelector('h1');
    if (inp) inp.focus({ preventScroll: true }); else if (h) h.focus({ preventScroll: true });
  };

  G.coach = coach;
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
