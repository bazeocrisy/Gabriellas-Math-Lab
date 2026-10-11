// NumberNova Practice Center: a three-step wizard (choose a skill, choose 10, 25 or 50 questions, confirm), one question
// at a time with the app's coaching (three hints, feedback that names the mistake, retries, worked solutions), automatic
// saving with pause and resume, results, and a practice history used by "Practice My Misses".
// Practice Center results are practice only: they never change lesson Test scores or ★ Mastered.
(function (G) {
  'use strict';
  const SESSION = 'pc-session', HISTORY = 'pc-history';
  const esc = (s) => G.models.esc(s);
  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  const MODES = [
    { key: 'add', name: 'Adding Decimals', sym: '+', example: '4.6 + 2.35', text: 'Line up the points, regroup, word problems' },
    { key: 'sub', name: 'Subtracting Decimals', sym: '−', example: '10 − 4.65', text: 'Regroup, across zeros, making change' },
    { key: 'mul', name: 'Multiplying Decimals', sym: '×', example: '0.4 × 0.6', text: 'Powers of 10, equal groups, placing the point' },
    { key: 'div', name: 'Dividing Decimals', sym: '÷', example: '7.5 ÷ 3', text: 'Sharing, long division, related facts' },
    { key: 'mix', name: 'Mixed Operations', sym: '+ − × ÷', example: 'All four', text: 'A balanced mix of all four operations' },
    { key: 'challenge', name: 'Challenge Mode', sym: '★', example: 'Harder problems', text: 'Bigger numbers, more steps, more places' },
    { key: 'misses', name: 'Practice My Misses', sym: '↺', example: 'Your review list', text: 'Fresh questions on skills you missed' }
  ];
  const LENGTHS = [
    { n: 10, name: 'Quick Practice', text: 'About 10 minutes' },
    { n: 25, name: 'Good Practice', text: 'About 25 minutes' },
    { n: 50, name: 'Full Practice', text: 'Five blocks of ten' }
  ];
  const CHALLENGE_OPS = [{ key: 'add', name: 'Adding' }, { key: 'sub', name: 'Subtracting' }, { key: 'mul', name: 'Multiplying' }, { key: 'div', name: 'Dividing' }, { key: 'mix', name: 'Mixed' }];
  const OP_NAMES = { add: 'Adding', sub: 'Subtracting', mul: 'Multiplying', div: 'Dividing', mix: 'Mixed' };
  // Short "how to do it" reminders, shown with feedback (from the original Decimal Lab's lesson cards).
  const REMIND = {
    add: '<p><b>How to add decimals:</b> line up the decimal points, fill empty places with zeros, add like whole numbers (carry as always), and bring the point straight down.</p>',
    sub: '<p><b>How to subtract decimals:</b> line up the decimal points, write zeros (5 = 5.00), subtract like whole numbers (regroup as always), and bring the point straight down.</p>',
    mul: '<p><b>How to multiply decimals:</b> do not line up the points. Multiply like whole numbers, count the decimal places in both numbers, and give the answer that many places. × 10, 100, 1000 moves digits 1, 2, 3 places left.</p>',
    div: '<p><b>How to divide a decimal by a whole number:</b> divide like whole numbers and put the point in the answer straight above the point in the number you divide. Check by multiplying. ÷ 10, 100, 1000 moves digits 1, 2, 3 places right.</p>'
  };

  // ───────── Saved data: the current session and the practice history ─────────
  const gen = () => G.practiceGen;
  function loadSession() {
    const d = G.store.getDraft(SESSION);
    const ok = d && typeof d === 'object' && MODES.some((m) => m.key === d.mode) && [10, 25, 50].includes(d.n) &&
      G.engine.validSet('pc', d.set, d.n) && Number.isInteger(d.i) && d.i >= 0 && d.i < d.n && Array.isArray(d.states) && d.states.length === d.n;
    if (!ok) { if (d) G.store.clearDraft(SESSION); return null; }
    if (typeof d.label !== 'string' || !d.label) d.label = labelFor(d.mode, d.op, d.general === true);
    return d;
  }
  const saveSession = (d) => G.store.setDraft(SESSION, d);
  /** The practice history, repaired field by field so damaged saved data can never break a page. */
  function history() {
    const h = G.store.getDraft(HISTORY);
    const obj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
    const n0 = (x) => (Number.isInteger(x) && x >= 0 ? x : 0);
    const sessions = obj(h) && Array.isArray(h.sessions) ? h.sessions.filter((x) => obj(x) && [10, 25, 50].includes(x.n)).map((x) => ({
      id: typeof x.id === 'string' ? x.id : '', date: typeof x.date === 'string' ? x.date : '', mode: typeof x.mode === 'string' ? x.mode : '',
      op: typeof x.op === 'string' ? x.op : null, label: typeof x.label === 'string' && x.label ? x.label : 'Practice', n: x.n,
      completed: Math.min(n0(x.completed), x.n), correct: n0(x.correct), clean: n0(x.clean), helped: n0(x.helped), missed: n0(x.missed), hints: n0(x.hints) })) : [];
    const skills = {};
    if (obj(h) && obj(h.skills)) Object.keys(h.skills).forEach((sk) => {
      const v = h.skills[sk];
      if (obj(v) && Array.isArray(v.r)) skills[sk] = { r: v.r.filter((x) => x === 0 || x === 1).slice(-10), last: typeof v.last === 'string' ? v.last : undefined };
    });
    const ids = obj(h) && Array.isArray(h.ids) ? h.ids.filter((x) => typeof x === 'string').slice(-60) : [];
    return { sessions, skills, ids, lastId: obj(h) && typeof h.lastId === 'string' ? h.lastId : undefined };
  }

  /** How one question went: clean (first try, no hints), helped (right after hints or another try), or missed (solution shown). */
  function outcome(st) {
    if (!st || st.solved !== true) return 'unfinished';
    if (st.shown === true) return 'missed';
    return st.firstTry === true && !hintsOf(st) ? 'clean' : 'helped';
  }
  const hintsOf = (st) => (st && Number.isInteger(st.hints) && st.hints > 0 ? Math.min(st.hints, 3) : 0);
  /** A question counts as a miss for "Practice My Misses" when it needed a second try or the solution. */
  const isMiss = (st) => !!st && (st.shown === true || (Number.isInteger(st.attempts) && st.attempts > 0));

  function summarize(d) {
    const qs = d.set.map((x) => G.engine.make('pc', x.id, x.seed));
    const s = { completed: 0, clean: 0, helped: 0, missed: 0, hints: 0, bySkill: {}, byOp: {} };
    qs.forEach((q, k) => {
      const st = d.states[k] || {}, o = outcome(st);
      if (o !== 'unfinished') s.completed++;
      if (o === 'clean') s.clean++; else if (o === 'helped') s.helped++; else if (o === 'missed') s.missed++;
      s.hints += hintsOf(st);
      const b = s.bySkill[q.skill] || (s.bySkill[q.skill] = { t: 0, ok: 0, miss: 0 });
      b.t++; if (o === 'clean' || o === 'helped') b.ok++; if (isMiss(st)) b.miss++;
      const p = s.byOp[q.pcOp] || (s.byOp[q.pcOp] = { t: 0, ok: 0, clean: 0 });
      p.t++; if (o === 'clean' || o === 'helped') p.ok++; if (o === 'clean') p.clean++;
    });
    s.correct = s.clean + s.helped;
    return s;
  }

  /** Save a finished session to the history once (also when a second tab finishes the same session). */
  function record(d) {
    const h = history();
    if (d.recorded || h.lastId === d.id || h.ids.includes(d.id)) return; // recorded once, even from an old tab
    const s = summarize(d);
    h.sessions.push({ id: d.id, date: new Date().toISOString(), mode: d.mode, op: d.op || null, label: d.label, n: d.n,
      completed: s.completed, correct: s.correct, clean: s.clean, helped: s.helped, missed: s.missed, hints: s.hints });
    if (h.sessions.length > 40) h.sessions = h.sessions.slice(-40);
    d.set.forEach((x, k) => {
      const sk = G.engine.banks.pc.byId[x.id].skill;
      const rec = h.skills[sk] && Array.isArray(h.skills[sk].r) ? h.skills[sk] : (h.skills[sk] = { r: [] });
      rec.r.push(isMiss(d.states[k]) ? 0 : 1);
      if (rec.r.length > 10) rec.r = rec.r.slice(-10);
      rec.last = new Date().toISOString();
    });
    h.lastId = d.id;
    h.ids = [...h.ids, d.id].slice(-60);
    G.store.setDraft(HISTORY, h);
    d.recorded = true;
    saveSession(d);
  }

  /**
   * Skills to review: from Practice Center history (a miss in the last 10 tries and under 80% right, or a miss last
   * time) and from lesson Practice in Lessons 6-9 (under 70% right on the first try, at least 3 questions).
   * Nothing is invented: with no recorded misses the list is empty.
   */
  function weakSkills() {
    const out = [], h = history(), SK = gen().SKILLS;
    Object.keys(h.skills).filter((sk) => SK[sk]).forEach((sk) => {
      const r = (h.skills[sk].r || []).filter((x) => x === 0 || x === 1);
      if (!r.length) return;
      const rate = r.reduce((a, b) => a + b, 0) / r.length;
      if ((r.includes(0) && rate < 0.8) || r[r.length - 1] === 0) out.push({ skill: sk, rate, from: 'Practice Center' });
    });
    ['d06', 'd07', 'd08', 'd09'].forEach((id) => {
      const ps = G.store.lesson(id).practice.skills;
      Object.keys(ps).forEach((ls) => {
        const v = ps[ls];
        if (v.t < 3 || v.c / v.t >= 0.7) return;
        Object.keys(SK).filter((sk) => SK[sk].lesson === id && (SK[sk].ls === ls || (SK[sk].alsoLs || []).includes(ls)) && !/\.chal$/.test(sk) && !out.some((o) => o.skill === sk))
          .forEach((sk) => out.push({ skill: sk, rate: v.c / v.t, from: `Lesson ${G.unit.find(id).n} Practice` }));
      });
    });
    return out.sort((a, b) => a.rate - b.rate).slice(0, 6);
  }

  const modeOf = (key) => MODES.find((m) => m.key === key);
  function labelFor(mode, op, general) {
    if (mode === 'challenge') return `Challenge Mode: ${OP_NAMES[op]}`;
    if (mode === 'misses') return general ? 'General review' : 'Practice My Misses';
    return modeOf(mode).name;
  }

  // ───────── Views ─────────
  let wiz = { step: 1, mode: null, op: null, n: null };

  function view(app, sub) {
    if (sub === 'session') return session(app);
    if (sub === 'results') return results(app);
    return wizard(app);
  }

  function pausedSummary() {
    const d = loadSession();
    if (!d || d.finished) return '';
    return `<section class="pc-paused continue-card" aria-labelledby="pc-paused-h">
      <div class="cont-text"><h2 id="pc-paused-h">Continue your practice</h2>
      <p>${esc(d.label)} · question ${d.i + 1} of ${d.n}. Your place is saved.</p></div>
      <a class="btn btn-practice btn-big cont-go" href="#/practice/session">Resume practice</a></section>`;
  }

  function radios(name, items, current, render) {
    return items.map((it) => {
      const id = `pc-${name}-${it.key || it.n}`;
      const v = String(it.key || it.n);
      return `<div class="pc-choice"><input type="radio" class="pc-radio" name="${name}" id="${id}" value="${v}"${String(current) === v ? ' checked' : ''}>
        <label for="${id}" class="pc-card ${render.cls ? render.cls(it) : ''}">${render.html(it)}</label></div>`;
    }).join('');
  }

  function wizard(app) {
    const d = loadSession();
    const head = `
      <div class="crumbs"><a href="#/">← Home</a></div>
      <section class="hero hero-practice">
        <p class="section-kicker">Practice</p>
        <h1 tabindex="-1">Practice Center</h1>
        <p class="hero-sub2">Choose a skill, choose how many questions, and practice with hints and step-by-step help. Practice here never changes lesson test scores.</p>
      </section>
      ${d && !d.finished ? `<div class="pc-paused-inline fb fb-info"><p><b>You have a practice in progress:</b> ${esc(d.label)}, question ${d.i + 1} of ${d.n}. <a href="#/practice/session">Resume it</a>, or start something new below.</p></div>` : ''}
      <p class="pc-steps" aria-label="Progress">${[1, 2, 3].map((k) => `<span class="pc-step${k === wiz.step ? ' is-current' : k < wiz.step ? ' is-done' : ''}"${k === wiz.step ? ' aria-current="step"' : ''}>Step ${k}${k === 1 ? ': Skill' : k === 2 ? ': How many' : ': Ready'}</span>`).join('')}</p>`;
    if (wiz.step === 1) {
      app.innerHTML = head + `
        <form class="pc-form" novalidate>
          <fieldset class="pc-fieldset"><legend><span class="pc-legend">Step 1 of 3: Choose a skill</span></legend>
            <div class="pc-grid pc-grid-modes">${radios('mode', MODES, wiz.mode, { cls: (m) => 'op-' + m.key,
              html: (m) => `<span class="pc-top"><span class="pc-sym" aria-hidden="true">${m.sym}</span><span class="pc-sample">${m.example}</span></span><span class="pc-name">${m.name}</span><span class="pc-ex">${m.text}</span>` })}</div>
          </fieldset>
          <p class="pc-msg" role="status"></p>
          <div class="pc-actions"><button type="submit" class="btn btn-practice btn-big">Next: how many questions →</button></div>
        </form>`;
      const form = app.querySelector('form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const v = (form.querySelector('[name=mode]:checked') || {}).value;
        if (!v) { form.querySelector('.pc-msg').textContent = 'Choose a skill first.'; return; }
        if (v !== wiz.mode) { wiz.op = null; }
        wiz.mode = v; wiz.step = 2; wizard(app); focusH(app);
      });
    } else if (wiz.step === 2) {
      const m = modeOf(wiz.mode);
      let extra = '';
      if (wiz.mode === 'challenge') {
        extra = `<fieldset class="pc-fieldset"><legend><span class="pc-legend">Choose a challenge</span></legend>
          <div class="pc-grid pc-grid-ops">${radios('op', CHALLENGE_OPS, wiz.op, { cls: (o) => 'op-' + o.key, html: (o) => `<span class="pc-name">${o.name}</span>` })}</div></fieldset>`;
      } else if (wiz.mode === 'misses') {
        const weak = weakSkills();
        extra = weak.length
          ? `<div class="card pc-misses"><h2>Skills to review</h2><p>These come from your saved practice. You will get <b>new</b> questions on them, not the same ones again.</p>
              <ul>${weak.map((w) => `<li>${esc(gen().SKILLS[w.skill].name)} <span class="fine">(${esc(w.from)})</span></li>`).join('')}</ul></div>`
          : `<div class="card pc-misses"><h2>No misses recorded yet</h2><p>There are no saved practice mistakes on this device yet, so there is nothing to target. Here is a <b>general review</b> instead: a mix of adding, subtracting, multiplying and dividing. After you practice, this list will show the skills to work on.</p></div>`;
      }
      app.innerHTML = head + `
        <form class="pc-form" novalidate>
          <p class="pc-picked">Skill: <b>${esc(m.name)}</b></p>
          ${extra}
          <fieldset class="pc-fieldset"><legend><span class="pc-legend">Step 2 of 3: How many questions?</span></legend>
            <div class="pc-grid pc-grid-lengths">${radios('n', LENGTHS, wiz.n, { html: (l) => `<span class="pc-big">${l.n}</span><span class="pc-name">Questions · ${l.name}</span><span class="pc-ex">${l.text}</span>` })}</div>
          </fieldset>
          <p class="pc-msg" role="status"></p>
          <div class="pc-actions"><button type="button" class="btn btn-big" data-act="back">← Back</button><button type="submit" class="btn btn-practice btn-big">Next: review →</button></div>
        </form>`;
      const form = app.querySelector('form');
      form.querySelector('[data-act=back]').addEventListener('click', () => { wiz.step = 1; wizard(app); focusH(app); });
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const op = (form.querySelector('[name=op]:checked') || {}).value, n = Number((form.querySelector('[name=n]:checked') || {}).value);
        const msg = form.querySelector('.pc-msg');
        if (wiz.mode === 'challenge' && !op) { msg.textContent = 'Choose which challenge you want.'; return; }
        if (!n) { msg.textContent = 'Choose 10, 25 or 50 questions.'; return; }
        wiz.op = op || null; wiz.n = n; wiz.step = 3; wizard(app); focusH(app);
      });
    } else {
      const general = wiz.mode === 'misses' && !weakSkills().length;
      const label = labelFor(wiz.mode, wiz.op, general);
      const expect = wiz.mode === 'misses' && !general ? `Questions focus on: ${weakSkills().map((w) => gen().SKILLS[w.skill].name.toLowerCase()).join('; ')}.`
        : wiz.mode === 'challenge' ? 'These are harder than regular practice: bigger numbers, more decimal places and more steps. They still use the methods from the lessons.'
          : 'Questions start easier and get harder as you go.';
      app.innerHTML = head + `
        <section class="card pc-confirm" aria-labelledby="pc-confirm-h">
          <h2 id="pc-confirm-h">Step 3 of 3: Ready?</h2>
          <dl class="facts-dl"><dt>Skill</dt><dd>${esc(label)}</dd><dt>Questions</dt><dd>${wiz.n}${wiz.n === 50 ? ' (five blocks of ten)' : ''}</dd></dl>
          <p class="pc-expect">${esc(expect)}</p>
          <p class="pc-expect fine">Up to three hints per question, feedback on mistakes, and the steps after three different tries. Your place is saved, so you can pause any time.</p>
          <div class="confirm" hidden><p><b>You already have a practice in progress.</b> Starting a new one will replace it (your past results are kept). Start anyway?</p>
            <button type="button" class="btn btn-practice" data-act="really">Yes, start the new practice</button> <button type="button" class="btn" data-act="cancel">No, keep it</button></div>
          <div class="pc-actions"><button type="button" class="btn btn-big" data-act="choices">← Back</button><button type="button" class="btn btn-practice btn-big" data-act="start">Start Practice</button></div>
        </section>`;
      const start = () => {
        const weak = weakSkills();
        const general = wiz.mode === 'misses' && !weak.length;
        const set = gen().buildSession({ mode: general ? 'mix' : wiz.mode, op: wiz.op, n: wiz.n, skills: weak.map((w) => w.skill), seed: (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0 });
        saveSession({ id: newId(), mode: wiz.mode, op: wiz.op, n: wiz.n, general, label: labelFor(wiz.mode, wiz.op, general), set, i: 0, states: set.map(() => ({})), finished: false, recorded: false, created: new Date().toISOString() });
        wiz = { step: 1, mode: wiz.mode, op: wiz.op, n: wiz.n };
        location.hash = '#/practice/session';
      };
      const conf = app.querySelector('.confirm');
      app.querySelector('[data-act=choices]').addEventListener('click', () => { wiz.step = 2; wizard(app); focusH(app); });
      app.querySelector('[data-act=start]').addEventListener('click', () => {
        const cur = loadSession();
        if (cur && !cur.finished && cur.states.some((s) => s && (s.solved || s.attempts || s.hints))) { conf.hidden = false; conf.querySelector('[data-act=really]').focus(); } else start();
      });
      app.querySelector('[data-act=really]').addEventListener('click', start);
      app.querySelector('[data-act=cancel]').addEventListener('click', () => { conf.hidden = true; });
    }
    app.classList.add('page-home');
    document.title = 'Practice Center · NumberNova';
  }
  const focusH = (app) => { window.scrollTo(0, 0); const h = app.querySelector('h1'); if (h) h.focus({ preventScroll: true }); };

  function session(app) {
    const d = loadSession();
    if (!d) { location.replace('#/practice'); return; }
    if (d.finished) { location.replace('#/practice/results'); return; }
    const item = d.set[d.i], q = G.engine.make('pc', item.id, item.seed), SK = gen().SKILLS[q.skill];
    const level = q.pcLevel > 5 ? `Challenge ${q.pcLevel - 5} of 3` : `Level ${q.pcLevel} of 5`;
    const block = d.n === 50 ? `Block ${Math.floor(d.i / 10) + 1} of 5` : '';
    app.classList.add('page-question');
    const cheer = d.i > 0 && d.i % 10 === 0 ? `<p class="pc-cheer" role="status">${d.i} questions done${d.n === 50 ? `: block ${d.i / 10} of 5 finished` : ''}. Nice steady work!</p>` : '';
    app.innerHTML = `
      <div class="crumbs"><a href="#/practice">← Practice Center</a> <span class="crumb-note">(your place is saved)</span></div>
      <p class="mode-label pc-label op-${esc(q.pcOp)}">Practice Center · ${esc(d.label)} <span class="screen-count">Question ${d.i + 1} of ${d.n}${block ? ' · ' + block : ''}</span></p>
      <div class="progress pc-progress" role="progressbar" aria-label="Practice progress" aria-valuemin="1" aria-valuemax="${d.n}" aria-valuenow="${d.i + 1}" aria-valuetext="Question ${d.i + 1} of ${d.n}"><span style="width:${((d.i + 1) / d.n) * 100}%"></span></div>
      ${cheer}
      <h1 tabindex="-1" class="q-heading">Question ${d.i + 1}</h1>
      <p class="skill-tag">Skill: ${esc(SK.name)} · ${level}</p>
      <div class="coach-host"></div>
      <details class="q-options"><summary>Options</summary>
        <div class="pc-tools">
          <a class="btn" href="#/practice">Pause and go to Practice Center</a>
          <button type="button" class="btn" data-act="new">Start New Practice</button>
        </div>
      </details>
      <div class="confirm pc-new" hidden><p><b>Start a new practice?</b> This one (question ${d.i + 1} of ${d.n}) will be cleared. Your saved results from finished practices are kept.</p>
        <button type="button" class="btn btn-danger" data-act="really">Yes, start over</button> <button type="button" class="btn" data-act="cancel">No, keep going</button></div>`;
    G.coach(app.querySelector('.coach-host'), q, {
      state: d.states[d.i],
      remind: REMIND[q.pcOp], seeIt: true,
      onChange: (st) => {
        // Another tab may have started a different session: show that one instead of writing over it.
        const cur = G.store.getDraft(SESSION);
        if (!cur || cur.id !== d.id) { session(app); return; }
        d.states[d.i] = st; saveSession(d);
      },
      onSolved: () => {
        const next = app.querySelector('.coach-next'), last = d.i === d.n - 1, at = d.i;
        next.innerHTML = `<button type="button" class="btn btn-practice btn-big">${last ? 'See my results' : 'Next question →'}</button>`;
        next.querySelector('button').addEventListener('click', () => {
          if (d.i !== at || d.finished || !d.states[at].solved) return; // a second click does nothing
          const cur = G.store.getDraft(SESSION);
          if (!cur || cur.id !== d.id) { session(app); return; } // replaced in another tab
          if (last) { d.finished = true; saveSession(d); location.hash = '#/practice/results'; return; }
          d.i++; saveSession(d); session(app); window.scrollTo(0, 0); G.coach.focusAnswer(app);
        });
      }
    });
    const conf = app.querySelector('.pc-new');
    app.querySelector('[data-act=new]').addEventListener('click', () => { conf.hidden = false; conf.querySelector('[data-act=really]').focus(); });
    app.querySelector('[data-act=cancel]').addEventListener('click', () => { conf.hidden = true; app.querySelector('[data-act=new]').focus(); });
    app.querySelector('[data-act=really]').addEventListener('click', () => {
      G.store.clearDraft(SESSION);
      wiz = { step: 1, mode: d.mode, op: d.op, n: d.n };
      location.hash = '#/practice';
    });
    document.title = `Practice question ${d.i + 1} of ${d.n} · NumberNova`;
  }

  function results(app) {
    const d = G.store.getDraft(SESSION);
    const ok = d && d.finished && G.engine.validSet('pc', d.set, d.n) && Array.isArray(d.states);
    if (!ok) { location.replace('#/practice'); return; }
    record(d);
    const s = summarize(d), SK = gen().SKILLS;
    const review = Object.keys(s.bySkill).filter((sk) => s.bySkill[sk].miss > 0).sort((a, b) => s.bySkill[b].miss - s.bySkill[a].miss);
    const ops = Object.keys(s.byOp);
    const top = review[0] || Object.keys(s.bySkill)[0];
    const lessonLink = (() => {
      const m = SK[top]; if (!m) return '';
      const L = G.lessonContent[m.lesson], idx = L.screens.findIndex((x) => x.id === (m.screen || L.skillScreen[m.ls])) + 1;
      return `<a class="btn btn-big btn-teach" href="#/${m.lesson}/teach/${idx}">Review Related Lesson<span class="sr-only">: Lesson ${G.unit.find(m.lesson).n}, ${esc(m.name)}</span></a>`;
    })();
    const guideOp = ops.length === 1 ? ops[0] : 'mix';
    app.innerHTML = `
      <div class="crumbs"><a href="#/practice">← Practice Center</a></div>
      <p class="mode-label pc-label">Practice Center · ${esc(d.label)}</p>
      <h1 tabindex="-1">Practice complete!</h1>
      <p class="score-line">You finished <b>${s.completed} of ${d.n}</b> questions and got <b>${s.correct}</b> right.</p>
      <ul class="pc-stats">
        <li class="pc-stat"><span class="pc-stat-n">${s.completed}</span> questions completed</li>
        <li class="pc-stat stat-ok"><span class="pc-stat-n">${s.correct}</span> correct</li>
        <li class="pc-stat stat-clean"><span class="pc-stat-n">${s.clean}</span> correct on the first try with no hints</li>
        <li class="pc-stat stat-help"><span class="pc-stat-n">${s.helped}</span> correct with hints or another try</li>
        <li class="pc-stat stat-miss"><span class="pc-stat-n">${s.missed}</span> incorrect (solution shown)</li>
        <li class="pc-stat"><span class="pc-stat-n">${s.hints}</span> hints used</li>
      </ul>
      ${ops.length > 1 ? `<h2>By operation</h2><table class="skills-table"><thead><tr><th scope="col">Operation</th><th scope="col">Correct</th><th scope="col">First try, no hints</th></tr></thead><tbody>
        ${ops.map((o) => `<tr><td>${OP_NAMES[o]}</td><td>${s.byOp[o].ok} of ${s.byOp[o].t}</td><td>${s.byOp[o].clean}</td></tr>`).join('')}</tbody></table>` : ''}
      <h2>Skills needing review</h2>
      ${review.length ? `<ul>${review.map((sk) => `<li>${esc(SK[sk].name)}: ${s.bySkill[sk].miss} of ${s.bySkill[sk].t} needed another try or the solution</li>`).join('')}</ul>` : '<p>None this time. Every question was right on the first try. Great work!</p>'}
      ${G.guides ? G.guides.link(G.guides.forOp(guideOp), 'Printable study guide') : ''}
      <p class="fine">Practice Center results are for practice. They are saved on this device and shown in Parent Progress, but they never change lesson Test scores or ★ Mastered.</p>
      <div class="done-actions">
        <button type="button" class="btn btn-practice btn-big" data-act="again">Practice Again</button>
        <button type="button" class="btn btn-big" data-act="misses">Practice My Misses</button>
        ${lessonLink}
        <a class="btn btn-big" href="#/practice">Back to Practice Center</a>
      </div>`;
    app.querySelector('[data-act=again]').addEventListener('click', () => {
      const general = d.mode === 'misses' && !weakSkills().length;
      const set = gen().buildSession({ mode: general ? 'mix' : d.mode, op: d.op, n: d.n, skills: weakSkills().map((w) => w.skill), seed: (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0 });
      saveSession({ id: newId(), mode: d.mode, op: d.op, n: d.n, general, label: labelFor(d.mode, d.op, general), set, i: 0, states: set.map(() => ({})), finished: false, recorded: false, created: new Date().toISOString() });
      location.hash = '#/practice/session';
    });
    app.querySelector('[data-act=misses]').addEventListener('click', () => { wiz = { step: 2, mode: 'misses', op: null, n: d.n }; location.hash = '#/practice'; });
    document.title = 'Practice results · NumberNova';
  }

  G.practiceCenter = { pausedSummary, weakSkills, history, summarize, record, outcome, loadSession };
  G.views = G.views || {};
  G.views.practiceCenter = view;
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
