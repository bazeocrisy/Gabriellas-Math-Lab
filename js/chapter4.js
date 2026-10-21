// Chapter routes and persistence, isolated from the existing decimal curriculum's lesson records.
(function (G) {
  "use strict";
  const C = G.chapter4,
    M = G.models,
    esc = M.esc;
  const key = (id, mode) => `c4-session-${id}-${mode}`;
  const get = (id) => {
    const d = G.store.getDraft("c4-progress-" + id);
    return d && typeof d === "object"
      ? {
          learn: d.learn === true,
          history: Array.isArray(d.history)
            ? d.history.filter(
                (x) =>
                  x &&
                  Number.isInteger(x.correct) &&
                  x.correct >= 0 &&
                  x.correct <= x.total &&
                  typeof x.id === "string" &&
                  typeof x.date === "string" &&
                  ["practice", "independent", "test"].includes(x.mode) &&
                  valid(x, id, x.mode),
              )
            : [],
          recent: Array.isArray(d.recent)
            ? d.recent.filter((x) => typeof x === "string")
            : [],
        }
      : { learn: false, history: [], recent: [] };
  };
  const put = (id, d) => G.store.setDraft("c4-progress-" + id, d);
  const title = (id) =>
    id === "final"
      ? "Chapter 4 Final Assessment"
      : id === "review"
        ? "Chapter 4 Review"
        : C.lessons.find((l) => l.id === id).title;
  const homeLink =
    '<div class="crumbs"><a href="#/">Home</a><a href="#/chapter4">Chapter 4</a><a href="#/parent">Parent Progress</a></div>';
  const modes = [
    ["learn", "Learn"],
    ["practice", "Practice"],
    ["independent", "Independent Questions"],
    ["test", "Lesson Test"],
  ];
  function nav(id) {
    return `<nav class="c4-mode-nav" aria-label="Lesson ${id} modes">${modes.map(([m, t]) => `<a class="btn" href="#/chapter4/${id}/${m}">${t}</a>`).join("")}</nav>`;
  }
  const latest = (d, m) => d.history.filter((x) => x.mode === m).at(-1);
  const mastered = (d) =>
    d.history.some(
      (x) =>
        x.mode === "test" && x.total === 10 && x.correct >= 9 && !x.assisted,
    );
  const scoreText = (x) =>
    x
      ? `${x.correct}/${x.total}${x.assisted ? " (learning pages opened)" : ""}`
      : "Not taken";
  function menu(app) {
    app.innerHTML = `${homeLink}<section class="hero"><p class="section-kicker">Textbook learning path · printed pages 101–140</p><h1 tabindex="-1">Chapter 4 — Add and Subtract Decimals</h1><p>Choose any lesson. Learn, practice with hints, try independent questions, then take a test. No prerequisites.</p></section><div class="lesson-grid">${C.lessons
      .map((l) => {
        const d = get(l.id);
        return `<article class="lesson-card"><p class="lesson-num">Lesson ${l.id} · starts on p. ${l.page}</p><h2>${l.title}</h2><p>${l.goal}</p><p>Learn: ${d.learn ? "Finished" : "Not finished"} · Practice: ${d.history.filter((x) => x.mode === "practice").length} sessions</p><p>Independent: ${scoreText(latest(d, "independent"))} · Test: ${scoreText(latest(d, "test"))}${mastered(d) ? " · ★ Mastered" : ""}</p>${nav(l.id)}</article>`;
      })
      .join(
        "",
      )}</div><section class="card"><h2>Bring it all together</h2><p>Review all eight lessons with coaching, then take a fresh 25-question final assessment on your own.</p><a class="btn" href="#/chapter4/review/practice">Chapter Review · 24 questions</a> <a class="btn btn-primary" href="#/chapter4/final/test">Final Assessment · 25 questions</a></section>`;
  }
  function learn(app, id, page) {
    const ss = C.screens[C.lessons.findIndex((l) => l.id === id)],
      idx = Math.max(0, Math.min(ss.length - 1, (Number(page) || 1) - 1)),
      s = ss[idx];
    const dk = "c4-learn-" + id;
    let d = G.store.getDraft(dk);
    if (!d || typeof d !== "object") d = {};
    const save = () => G.store.setDraft(dk, d);
    const persist = G.store.persistent()
      ? ""
      : '<p class="fb fb-info">Saving is unavailable in this browser. Progress will last only for this visit.</p>';
    app.innerHTML = `${homeLink}${nav(id)}${persist}<p class="mode-label">Lesson ${id} · Learn · ${idx + 1} of ${ss.length}</p><h1 tabindex="-1">${s.title}</h1><section class="card c4-learn">${s.html}<div class="c4-guided"></div></section><div class="done-actions"><a class="btn" href="#/chapter4/${id}/learn/${Math.max(1, idx)}">Previous</a><button class="btn btn-primary" data-c4="next">${idx === ss.length - 1 ? "Finish Learn" : "Next screen"}</button><button class="btn" data-c4="restart">Restart Learn</button></div>`;
    const next = app.querySelector("[data-c4=next]");
    if (s.check) {
      const q = C.make({ lesson: id, id: "calculate-2", seed: 31415 });
      const coach = G.coach(app.querySelector(".c4-guided"), q, {
        state: d.check || {},
        onChange: (st) => {
          d.check = st;
          save();
        },
        onSolved: () => {
          next.disabled = false;
        },
      });
      next.disabled = !coach.state.solved;
    }
    next.onclick = () => {
      if (idx < ss.length - 1)
        location.hash = `#/chapter4/${id}/learn/${idx + 2}`;
      else {
        const p = get(id);
        p.learn = true;
        put(id, p);
        location.hash = `#/chapter4/${id}/practice`;
      }
    };
    app.querySelector("[data-c4=restart]").onclick = () => {
      d = {};
      save();
      if (idx === 0) learn(app, id, 1);
      else location.hash = `#/chapter4/${id}/learn/1`;
    };
  }
  function valid(d, id, mode) {
    const n = id === "final" ? 25 : id === "review" ? 24 : 10;
    return (
      d &&
      typeof d === "object" &&
      d.owner === id &&
      d.mode === mode &&
      typeof d.id === "string" &&
      Array.isArray(d.set) &&
      d.set.length === n &&
      Array.isArray(d.states) &&
      d.states.length === n &&
      d.states.every((s) => s && typeof s === "object" && !Array.isArray(s)) &&
      Array.isArray(d.assist) &&
      Number.isInteger(d.i) &&
      d.i >= 0 &&
      d.i < n &&
      d.set.every((x) => {
        try {
          return x && C.make(x).sig === x.sig;
        } catch {
          return false;
        }
      })
    );
  }
  function fresh(id, mode, level) {
    let serial = G.store.getDraft("c4-serial");
    serial = Number.isSafeInteger(serial) && serial >= 0 ? serial + 1 : 1;
    G.store.setDraft("c4-serial", serial);
    const seed = (Date.now() + serial * 1009) >>> 0,
      d = {
        id: `${Date.now()}-${serial}`,
        owner: id,
        mode,
        level,
        i: 0,
        set: C.build(id, mode, seed, level, get(id).recent.slice(-100)),
        states: [],
        started: new Date().toISOString(),
        assist: [],
      };
    d.states = d.set.map(() => ({}));
    G.store.setDraft(key(id, mode), d);
    return d;
  }
  function assist() {
    // Any instructional route, including the existing curriculum, marks unfinished Chapter tests.
    for (const id of [...C.lessons.map((l) => l.id), "final"]) {
      const d = G.store.getDraft(key(id, "test"));
      if (valid(d, id, "test") && !d.done) {
        d.assist = ["Learning pages opened during assessment"];
        G.store.setDraft(key(id, "test"), d);
      }
    }
  }
  function parentBlock() {
    const ids = [...C.lessons.map((l) => l.id), "review", "final"];
    return `<section class="card" id="chapter4-progress"><h2>Chapter 4 Progress</h2><p>Practice is coached learning. Independent Questions are recorded separately. ★ Mastered requires 9/10 on an unassisted Lesson Test. Scores and explanations stay on this device.</p>${ids
      .map((id) => {
        const d = get(id),
          tests = d.history.filter((x) => x.mode === "test"),
          t = tests.at(-1);
        return `<details class="c4-parent"><summary>${id === "review" ? "Chapter Review" : id === "final" ? "Final Assessment" : `Lesson ${id}: ${title(id)}`} · ${mastered(d) ? "★ Mastered" : scoreText(t)}</summary><p>Learn: ${d.learn ? "Finished" : "Not finished"} · Practice sessions: ${d.history.filter((x) => x.mode === "practice").length} · Independent sessions: ${d.history.filter((x) => x.mode === "independent").length}</p>${
          t
            ? `<p>Latest independent test: ${scoreText(t)}</p><ul>${Object.entries(
                G.scoring.score(
                  t.set.map(C.make),
                  t.states.map((s) => s.resp),
                ).skills,
              )
                .map(
                  ([tag, v]) =>
                    `<li>${esc(C.skillNames[tag.split(":")[1]])}: ${v.correct}/${v.total} · ${v.correct === v.total ? "Correct in this test" : "Needs practice"}</li>`,
                )
                .join("")}</ul>`
            : ""
        }${
          d.history.length
            ? `<ol>${d.history
                .slice()
                .reverse()
                .map(
                  (x) =>
                    `<li>${esc(x.date.slice(0, 10))}: ${esc(x.mode)} ${x.correct}/${x.total}${x.assisted ? " · learning pages opened" : ""} <a href="#/chapter4/${id}/${x.mode}/result/${encodeURIComponent(x.id)}">Results and skills to review</a></li>`,
                )
                .join("")}</ol>`
            : "<p>No sessions completed.</p>"
        }</details>`;
      })
      .join("")}</section>`;
  }
  function results(app, id, d) {
    if (C.noteResults) C.noteResults();
    const qs = d.set.map(C.make),
      answers = d.states.map((x) => x.resp),
      sc = G.scoring.score(qs, answers),
      isTest = d.mode === "test",
      practice = d.mode === "practice";
    const first = practice
      ? d.states.filter((x) => x.firstTry && !x.hints && !x.shown).length
      : sc.correct;
    app.innerHTML = `${homeLink}<h1 tabindex="-1">${title(id)} · Results</h1><section class="card"><h2>${practice ? "Practice complete" : `${sc.correct} of ${sc.total} correct (${sc.percent}%)`}</h2>${practice ? `<p>${first}/${sc.total} correct on the first try without hints. Coached work does not award mastery.</p>` : isTest ? `<p>${d.assisted ? "Learning pages were opened during this assessment. This score does not award independent mastery." : id === "final" ? "Final assessment complete. Review performance by lesson below." : sc.correct >= 9 ? "★ Mastered: at least 9/10 independently." : "Mastery goal: 9/10. Review missed skills and try a fresh test."}</p>` : "<p>Independent Questions are for checking readiness. Only Lesson Tests award mastery.</p>"}<h2>Performance and next steps</h2><ul>${Object.entries(
      sc.skills,
    )
      .map(([tag, v]) => {
        const [sk, kind] = tag.split(":");
        return `<li>Lesson ${sk} · ${esc(C.skillNames[kind] || kind)}: ${v.correct}/${v.total}. ${v.correct < v.total ? `Review <a href="#/chapter4/${sk}/learn">${title(sk)}</a>, then practice.` : "All correct in this session."}</li>`;
      })
      .join(
        "",
      )}</ul><button class="btn btn-primary" data-c4="new">Start fresh ${isTest ? "test" : "session"}</button> <a class="btn" href="#/chapter4">Chapter menu</a></section><h2>Question review</h2>${qs.map((q, i) => `<details class="card c4-result"><summary>${i + 1}. ${practice ? (d.states[i].firstTry ? "First try" : "Coached / retry") : sc.items[i].correct ? "Correct" : "Review"} · Lesson ${q.lesson}</summary><div>${q.prompt}</div>${q.visual || ""}<p>Your answer: ${esc(G.engine.describe(q, answers[i]))}</p><p>Answer: ${esc(q.answerText)}</p>${q.solution}<p>${q.why}</p></details>`).join("")}`;
    app.querySelector("h1").focus({ preventScroll: true });
    app.querySelector("[data-c4=new]").onclick = () => {
      G.store.clearDraft(key(id, d.mode));
      location.hash = `#/chapter4/${id}/${d.mode}`;
      session(app, id, d.mode);
    };
  }
  function session(app, id, mode, resultId) {
    const k = key(id, mode),
      progress = get(id);
    let d = G.store.getDraft(k);
    if (resultId) {
      d = progress.history.find((x) => x.id === resultId && x.mode === mode);
      if (d) {
        results(app, id, d);
        return;
      }
      app.innerHTML = `${homeLink}<h1 tabindex="-1">Result unavailable</h1><p>This result is not saved in this browser.</p>`;
      return;
    }
    if (!valid(d, id, mode)) d = null;
    if (d && d.done) {
      results(app, id, d);
      return;
    }
    if (!d) {
      app.innerHTML = `${homeLink}${C.lessons.some((l) => l.id === id) ? nav(id) : ""}<h1 tabindex="-1">${title(id)} · ${mode === "test" ? "Test" : mode === "independent" ? "Independent Questions" : "Practice"}</h1><section class="card"><p>${id === "final" ? 25 : id === "review" ? 24 : 10} fresh questions. ${mode === "practice" ? "Three progressive hints, retries and worked solutions are available." : "No hints, coaching or correctness feedback until you submit. Answers are saved as you go."}</p>${mode === "test" ? "<p>Work independently. Opening learning pages during a test is recorded; that attempt cannot award mastery. Earlier scores are retained.</p>" : ""}${mode === "practice" ? '<label for="c4-level">Difficulty</label><select id="c4-level"><option value="1">1 · Starting out</option><option value="2" selected>2 · Building skill</option><option value="3">3 · Challenge</option></select>' : ""}<button class="btn btn-primary" data-c4="start">Start ${mode === "test" ? "test" : "session"}</button></section>`;
      app.querySelector("h1").focus({ preventScroll: true });
      app.querySelector("[data-c4=start]").onclick = () => {
        fresh(id, mode, Number(app.querySelector("select")?.value) || 2);
        session(app, id, mode);
      };
      return;
    }
    // Refuse stale-tab writes over a new session. The student can reload the latest one.
    const save = () => {
      const current = G.store.getDraft(k);
      if (current?.id !== d.id || current.done) {
        const note = app.querySelector(".c4-status");
        if (note)
          note.textContent =
            "A newer session is open in another tab. Reload to continue it.";
        return false;
      }
      d.assist = [...new Set([...(d.assist || []), ...(current.assist || [])])];
      G.store.setDraft(k, d);
      return true;
    };
    const finish = () => {
      if (!save()) return;
      const sc = G.scoring.score(
        d.set.map(C.make),
        d.states.map((s) => s.resp),
      );
      d.done = true;
      d.date = new Date().toISOString();
      d.correct =
        mode === "practice"
          ? d.states.filter((s) => s.firstTry && !s.hints && !s.shown).length
          : sc.correct;
      d.total = d.set.length;
      d.assisted = mode === "test" && d.assist.length > 0;
      const p = get(id);
      if (!p.history.some((x) => x.id === d.id)) {
        p.history.push(d);
        p.recent = p.recent.concat(d.set.map((x) => x.sig)).slice(-200);
        put(id, p);
      }
      save();
      results(app, id, d);
    };
    const q = C.make(d.set[d.i]);
    const focus = () => app.querySelector("h1")?.focus({ preventScroll: true });
    queueMicrotask(focus);
    app.innerHTML = `${homeLink}<p class="mode-label">${mode === "test" ? "Assessment" : mode === "independent" ? "Independent Questions" : "Coached Practice"} · Lesson ${q.lesson} · ${d.i + 1} of ${d.set.length}</p><h1 tabindex="-1">${title(id)}</h1><p class="c4-status" role="status"></p><div class="c4-question"></div><div class="c4-session-nav"></div>`;
    const host = app.querySelector(".c4-question"),
      bar = app.querySelector(".c4-session-nav");
    if (mode === "practice") {
      const drawNext = () => {
        bar.innerHTML = `<button class="btn btn-primary" data-c4="next">${d.i === d.set.length - 1 ? "Finish practice" : "Next question"}</button>`;
        bar.querySelector("button").onclick = () => {
          if (d.i === d.set.length - 1) finish();
          else {
            d.i++;
            if (save()) {
              session(app, id, mode);
              G.coach.focusAnswer(app);
            }
          }
        };
      };
      G.coach(host, q, {
        state: d.states[d.i],
        onChange: (st) => {
          d.states[d.i] = st;
          save();
        },
        onSolved: drawNext,
      });
    } else {
      G.qui.render(q, host, {
        response: d.states[d.i].resp,
        onChange: (resp) => {
          d.states[d.i].resp = resp;
          save();
        },
      });
      const answered = d.states.filter((s, i) =>
        G.engine.isAnswered(C.make(d.set[i]), s.resp),
      ).length;
      bar.innerHTML = `<p>${answered} of ${d.set.length} answered. You may review and change answers before submitting.</p><div class="done-actions"><button class="btn" data-c4="prev" ${d.i === 0 ? "disabled" : ""}>Previous</button><button class="btn" data-c4="next" ${d.i === d.set.length - 1 ? "disabled" : ""}>Next</button><button class="btn btn-primary" data-c4="submit">Submit all answers</button></div><div class="c4-submit" hidden><p>Submit now? Unanswered questions count as missed. You cannot change answers after submitting.</p><button class="btn btn-primary" data-c4="confirm">Yes, submit</button> <button class="btn" data-c4="cancel">Keep working</button></div>`;
      for (const [act, delta] of [
        ["prev", -1],
        ["next", 1],
      ])
        bar.querySelector(`[data-c4=${act}]`).onclick = () => {
          d.i += delta;
          if (save()) session(app, id, mode);
        };
      bar.querySelector("[data-c4=submit]").onclick = () => {
        bar.querySelector(".c4-submit").hidden = false;
        bar.querySelector("[data-c4=confirm]").focus();
      };
      bar.querySelector("[data-c4=cancel]").onclick = () => {
        bar.querySelector(".c4-submit").hidden = true;
        bar.querySelector("[data-c4=submit]").focus();
      };
      bar.querySelector("[data-c4=confirm]").onclick = finish;
    }
  }
  function route(app, h) {
    const m = h.match(
      /^#\/chapter4(?:\/(4-[1-8]|review|final)\/(learn|practice|independent|test)(?:\/(\d+|result\/[^/]+))?)?$/,
    );
    if (!m) return false;
    if (!m[1]) menu(app);
    else if (m[2] === "learn" && m[1].startsWith("4-")) learn(app, m[1], m[3]);
    else if (
      (m[1] === "final" && m[2] !== "test") ||
      (m[1] === "review" && m[2] !== "practice")
    )
      menu(app);
    else
      session(
        app,
        m[1],
        m[2],
        m[3]?.startsWith("result/") ? decodeURIComponent(m[3].slice(7)) : null,
      );
    document.title = `${m[1] ? title(m[1]) : "Chapter 4"} · NumberNova`;
    return true;
  }
  C.skillNames = {
    calculate: "Calculation and regrouping",
    visual: "Visual models",
    word: "Word problems",
    reason: "Strategy explanation",
    error: "Equivalent decimals and error analysis",
    multi: "Multi-step reasoning",
  };
  C.progress = get;
  C.route = route;
  C.parentBlock = parentBlock;
  C.assist = assist;
  C.valid = valid;
})((window.GML = window.GML || {}));
