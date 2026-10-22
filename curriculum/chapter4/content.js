// Original problems aligned to Chapter 4. All arithmetic uses integer hundredths.
(function (G) {
  "use strict";
  const E = G.engine,
    K = G.kit,
    M = G.models,
    lessons = G.chapter4Curriculum.lessons;
  const f = (n) => G.D.canonical(G.D.fromThousandths(n * 10, 2));
  const grid = (n) =>
    `<div class="c4-models">${Array.from({ length: Math.max(1, Math.ceil(n / 100)) }, (_, i) => M.grid(Math.max(0, Math.min(100, n - i * 100)))).join("")}</div>`;
  const operands = (a, b, op) =>
    `<div class="c4-operands"><figure>${grid(a)}<figcaption>${f(a)}</figcaption></figure><b>${op}</b><figure>${grid(b)}<figcaption>${f(b)}</figcaption></figure></div><p class="fine">Each full grid is 1; each square is 0.01. ${op === "+" ? "Combine the amounts." : "Remove the second amount from the first."}</p>`;
  function line(a, b) {
    const end = Math.ceil(Math.max(a, b) / 100) * 1000;
    return (
      M.line({
        from: 0,
        to: end,
        points: [
          { v: a * 10, label: "" },
          { v: b * 10, label: "" },
        ],
        label: `Number line from 0 to ${end / 1000}, with points at ${f(b)} and ${f(a)}. Find their distance.`,
      }) +
      `<p>Left point: ${f(b)}. Right point: ${f(a)}. Find the distance between them.</p>`
    );
  }

  const kinds = ["calculate", "visual", "word", "reason", "error", "multi"];
  // Independently selected, comparable paraphrases keep sentence length from identifying the key.
  const alignmentErrors = [
    "Align the final digits instead of the decimal points, then calculate.",
    "Line up the rightmost digits, even when they represent different place values.",
    "Keep the last digits aligned, even if their decimal points fall in different columns.",
  ];
  const operationErrors = (sub) => sub ? [
    "Subtract the smaller digit from the larger in each column, without exchanges.",
    "In each column, subtract whichever digit is smaller from whichever digit is larger.",
    "Choose the larger digit in each column first so exchanges are never needed.",
  ] : [
    "Add each column separately and leave out any units that would be carried.",
    "Add matching digits, keeping only the last digit when a column totals ten or more.",
    "Combine each column but drop extra units instead of carrying to the next place.",
  ];
  const reasoning = (n, sub) => n === 4 || (n === 8 && !sub) ? [
    "Add matching whole-number and decimal parts, then combine the partial sums.",
    "Split both addends by place value, add like units, then combine the partial sums.",
    "Decompose the numbers into place-value parts, then add the matching units.",
  ] : n === 7 ? [
    "Subtract the whole-number part first, then remove the remaining decimal part.",
    "Split the amount being removed into whole-number and decimal parts, then subtract each.",
    "Remove whole units first, then decimal units; add the difference back to check.",
  ] : n === 8 && sub ? [
    "Count up from the smaller amount to the larger, then combine the jumps.",
    "Start at the smaller amount and add the jumps needed to reach the larger amount.",
    "Add the jumps between the smaller and larger numbers to find the difference.",
  ] : sub ? [
    "Rename the amounts in hundredths, then remove the second amount from the first.",
    "Rename the first amount in hundredths, then remove the hundredths in the second amount.",
    "Exchange tenths for hundredths as needed, then remove the second amount.",
  ] : [
    "Combine both amounts in hundredths, then exchange for whole units as needed.",
    "Rename both amounts in hundredths, combine them, and exchange each hundred for one whole.",
    "Combine like hundredths and exchange each group of one hundred for a whole.",
  ];
  const solutionSteps = (xs) => `<ol class="sol-steps">${xs.map(x => `<li>${x}</li>`).join('')}</ol>`;
  function strategySolution(n, a, b, sub, level, kind) {
    const v = sub ? a - b : a + b;
    if ([2, 3, 5, 6].includes(n)) {
      if (n === 5 && level > 1 && kind === 'visual') return line(a, b) + solutionSteps([
        `Start at ${f(b)} and find the distance to ${f(a)}.`,
        `The distance is ${a} − ${b} = ${v} hundredths, or ${f(v)}.`,
        `Check: ${f(b)} + ${f(v)} = ${f(a)}.`,
      ]);
      return solutionSteps([
        `Each small square is one hundredth. Rename ${f(a)} as ${a} hundredths and ${f(b)} as ${b} hundredths.`,
        sub ? `Start with ${a} hundredths. Remove ${b} hundredths; ${v} remain.` : `Combine ${a} + ${b} = ${v} hundredths.`,
        `${v} hundredths = ${f(v)}. ${sub ? `Add back to check: ${f(b)} + ${f(v)} = ${f(a)}.` : `Exchange each group of 100 hundredths for one whole; ${Math.floor(v / 100)} whole(s) and ${v % 100} hundredths remain.`}`,
      ]) + (sub ? `<p>Start with ${f(a)} and cross out ${f(b)}:</p><div class="c4-models">${Array.from({length:Math.ceil(a/100)}, (_, i) => M.grid(Math.min(100, a-i*100), {cross:Math.min(Math.max(b-i*100,0),Math.min(100,a-i*100))})).join('')}</div>` : `<p>The combined amount:</p>${grid(v)}`);
    }
    if (n === 7) {
      const whole = Math.floor(b / 100) * 100, part = b % 100;
      return solutionSteps([`Split ${f(b)} into ${f(whole)} + ${f(part)}.`, `First remove whole units: ${f(a)} − ${f(whole)} = ${f(a-whole)}.`, `Then remove the decimal part: ${f(a-whole)} − ${f(part)} = ${f(v)}.`, `Check: ${f(b)} + ${f(v)} = ${f(a)}.`]);
    }
    if (n === 8 && sub) {
      const middle = Math.min(a, Math.ceil(b/100)*100);
      return solutionSteps([`Start at ${f(b)}, the smaller amount.`, `Count up to ${f(middle)}: add ${f(middle-b)}. Then count up to ${f(a)}: add ${f(a-middle)}.`, `Combine the jumps: ${f(middle-b)} + ${f(a-middle)} = ${f(v)}.`, `The difference is ${f(v)}. Check: ${f(b)} + ${f(v)} = ${f(a)}.`]);
    }
    if (!sub) {
      const parts = [100,10,1].map(unit => (Math.floor(a/unit) % (unit===100?100:10) + Math.floor(b/unit) % (unit===100?100:10))*unit);
      return solutionSteps([`Split each addend into whole-number, tenth and hundredth parts.`, `Add whole-number parts: ${f(Math.floor(a/100)*100)} + ${f(Math.floor(b/100)*100)} = ${f(parts[0])}.`, `Add tenths: ${f(Math.floor(a%100/10)*10)} + ${f(Math.floor(b%100/10)*10)} = ${f(parts[1])}. Add hundredths: ${f(a%10)} + ${f(b%10)} = ${f(parts[2])}.`, `Combine the partial sums: ${parts.map(f).join(' + ')} = ${f(v)}.`]);
    }
    return K.columnSolution([f(a),f(b)], '−');
  }
  function task(n, kind, level, r) {
    const sub = n === 1 || n === 8 ? r.int(0, 1) === 1 : n >= 5 && n <= 7,
      op = sub ? "−" : "+";
    let a = r.int(12, level === 1 ? 89 : level === 2 ? 399 : 3999),
      b = r.int(11, level === 1 ? 79 : level === 2 ? 299 : 2999);
    if ([2, 3, 5, 6].includes(n)) {
      a = r.int(21, 99);
      b = r.int(11, 89);
    }
    if ([2, 5].includes(n) && level === 1) {
      a = r.int(3, 9) * 10;
      b = r.int(1, 8) * 10;
    }
    if (n === 3) {
      a =
        level === 1
          ? r.int(2, 5) * 10
          : level === 2
            ? r.int(6, 9) * 10
            : r.int(11, 19) * 10;
      b = level === 1 ? r.int(11, 39) : r.int(41, 89);
    }
    if (sub && a < b) [a, b] = [b, a];
    if (sub && a === b) b -= 10;
    if (n === 6) {
      a = (level === 3 ? r.int(11, 19) : r.int(5, 9)) * 10;
      b = level === 1 ? r.int(1, 4) * 10 : r.int(1, 4) * 10 + r.int(1, 9);
    }
    if ([2, 5].includes(n) && level === 3) a += 100;
    if ([4, 7, 8].includes(n) && kind === "calculate") {
      a = r.int(3, level === 1 ? 9 : 59) * 100;
      if (!sub) a += r.int(1, 9) * 10;
      b = r.int(11, Math.min(a - 1, 399));
    }
    const v = sub ? a - b : a + b,
      eq = `${f(a)} ${op} ${f(b)}`;
    const q = {
      type: "number",
      answer: f(v),
      answerText: f(v),
      prompt: `Find ${eq}.`,
      sig: `${n}:${kind}:${level}:${a}:${b}:${op}`,
      meta: { n, kind, level, a, b, op, value: v },
      hints: [
        "Decide whether to combine amounts or find a difference. Keep each place value in its own column.",
        `Write ${f(a)} as ${(a/100).toFixed(2)} and ${f(b)} as ${(b/100).toFixed(2)}. Line up their decimal points; hundredths go under hundredths.`,
        sub
          ? "Exchange a unit from the place to the left if a column has too few units. Subtract from right to left and add back to check."
          : "Combine like units. Exchange ten hundredths for one tenth, and ten tenths for one whole when needed.",
      ],
      why: `${eq} = ${f(v)}. ${sub ? `Check: ${f(b)} + ${f(v)} = ${f(a)}.` : `In hundredths: ${a} + ${b} = ${v}.`}`,
      solution: K.columnSolution([f(a), f(b)], op),
      diagnose(resp) {
        if (
          G.D.equal(
            resp,
            sub ? K.noBorrowSub(f(a), f(b)) : K.noCarryAdd(f(a), f(b)),
          )
        )
          return "Check regrouping. Subtracting the smaller digit from the larger in each column, or leaving out a carried unit, changes the value.";
        if (G.D.equal(resp, K.misaligned(f(a), f(b), op)))
          return "Line up decimal points, not the last digits. Use zeros to hold empty places.";
        return "Check the operation and each exchange. A tenth is ten hundredths.";
      },
    };
    // Wording uses its own stream: existing saved question signatures and numeric values stay stable.
    const wording = E.rng((a * 65537) ^ (b * 257) ^ (n * 4099) ^ (level * 131) ^ kinds.indexOf(kind));
    const mc = (answer, correct, wrongs) => {
      correct = Array.isArray(correct) ? wording.pick(correct) : correct;
      wrongs = wrongs.map(x => Array.isArray(x) ? wording.pick(x) : x);
      q.type = "mc";
      q.answer = answer;
      q.answerText = correct;
      q.choices = K.textChoices(r, correct, wrongs).map((c) => ({
        value: c.value === correct ? answer : c.value,
        text: c.text,
      }));
    };
    if (n === 1) {
      const unit = level === 1 ? 100 : 10,
        ra = Math.floor((a + unit / 2) / unit) * unit,
        rb = Math.floor((b + unit / 2) / unit) * unit,
        est = sub ? ra - rb : ra + rb;
      Object.assign(q.meta, { unit, ra, rb, value: est });
      q.answer = f(est);
      q.answerText = q.answer;
      q.prompt = `Estimate ${eq} by rounding EACH number to the nearest ${unit === 100 ? "whole number" : "tenth"} first.`;
      q.hints = [
        "This asks for an estimate. Round each operand before calculating.",
        `For ${f(a)}, look at the ${unit===100?"tenths":"hundredths"} digit: ${Math.floor(a/(unit/10))%10}. A digit 5 or greater rounds up; otherwise keep the rounding digit.`,
        `${f(a)} rounds to ${f(ra)} and ${f(b)} rounds to ${f(rb)}. Now ${sub?"subtract":"add"} these rounded numbers. Enter just the final number.`,
      ];
      q.why = `${f(a)} rounds to ${f(ra)}; ${f(b)} rounds to ${f(rb)}. ${f(ra)} ${op} ${f(rb)} = ${f(est)}. An estimate checks size; it need not equal the exact answer.`;
      q.solution = `<ol class="sol-steps"><li>Round each operand separately.</li><li>${f(a)} → ${f(ra)}; ${f(b)} → ${f(rb)}.</li><li>${f(ra)} ${op} ${f(rb)} = ${f(est)}.</li></ol>`;
      q.diagnose = () =>
        "Round each operand first, then calculate. Rounding only the exact result can give a different estimate.";
      if (kind === "visual")
        q.visual = M.line({
          from: Math.floor(a / 100) * 1000,
          to: (Math.floor(a / 100) + 1) * 1000,
          point: a * 10,
          pointLabel: f(a),
          mid: true,
          label: `Number line showing ${f(a)} between neighboring whole numbers.`,
        });
      if (kind === "word")
        q.prompt = `A trail is ${f(a)} km long. ${sub ? `${f(b)} km has been walked. Estimate the distance remaining` : `Another section is ${f(b)} km long. Estimate the combined length`} by rounding EACH length to the nearest ${unit === 100 ? "whole number" : "tenth"} first.`;
      if (kind === "reason" || kind === "error") {
        q.prompt = `Which method follows “estimate ${eq} by rounding each operand to the nearest ${unit === 100 ? "whole number" : "tenth"}”?`;
        mc("round", ["Round both numbers to the stated place, then calculate the estimate.", "Round each number to the stated place before calculating the sum or difference.", "First round both numbers separately, then add or subtract those rounded amounts."], [
          ["Calculate the exact answer first, then round only the result to the stated place.", "Find the exact sum or difference, then round that result to the stated place.", "Add or subtract the original numbers, then round the answer at the end."],
          ["Drop both decimal points and calculate with the whole-number digits left.", "Remove the decimal points first, then calculate with the whole numbers left.", "Treat the decimal digits as whole numbers, then calculate with those amounts."],
        ]);
      }
      if (kind === "multi") {
        q.prompt = `Which explanation helps judge whether an answer to ${eq} is reasonable?`;
        mc(
          "check",
          ["Use nearby easy numbers to estimate and check the size of the exact answer.", "Use nearby compatible numbers to check the size, then compute exactly if needed.", "Choose nearby easy numbers, calculate mentally, then compare the estimated size."],
          [
            ["An estimate must match the exact answer or it cannot check the answer's size.", "Reject every estimate that differs from the exact result of the calculation.", "Use estimates only if they give exactly the same amount as the original calculation."],
            ["Drop the decimal points before calculating to check the size of the answer.", "Ignore decimal points and use the whole-number digits to check the answer's size.", "Treat both decimals as whole numbers, then use that result to check the size."],
          ],
        );
        q.why =
          "Compatible numbers are nearby numbers that are easy to combine or subtract mentally. Estimates check reasonableness; exact calculation gives the precise amount.";
        q.solution =
          '<ol class="sol-steps"><li>Choose nearby easy numbers.</li><li>Calculate mentally and compare the size to the proposed result.</li></ol>';
      }
      if (kind === "multi" && level === 3) {
        const x = r.int(87, 99) * 10,
          y = r.int(1, 150),
          total = x + y,
          cmp = total < 1000 ? "less" : total > 1000 ? "greater" : "equal";
        const fx = G.D.canonical(G.D.fromThousandths(x, 3)),
          fy = G.D.canonical(G.D.fromThousandths(y, 3));
        q.prompt = `Is ${fx} + ${fy} less than, equal to, or greater than 1? Choose the correct comparison.`;
        mc(
          cmp,
          {
            less: "Less than 1",
            greater: "Greater than 1",
            equal: "Equal to 1",
          }[cmp],
          ["less", "equal", "greater"]
            .filter((k) => k !== cmp)
            .map(
              (k) =>
                ({
                  less: "Less than 1",
                  greater: "Greater than 1",
                  equal: "Equal to 1",
                })[k],
            ),
        );
        q.meta.thousandths = [x, y];
        q.sig += `:boundary:${x}:${y}`;
        q.hints = [
          "Use 1 as a benchmark. How much must be added to the first amount to make 1?",
          "Write equivalent decimals with three decimal places. Compare the second amount to the gap to 1.",
          "If the second amount is smaller than the gap, the sum is below 1. If it matches, the sum is 1; if larger, the sum is above 1.",
        ];
        q.why = `The gap from ${fx} to 1 is ${G.D.fromThousandths(1000 - x, 3)}. The sum is ${G.D.fromThousandths(total, 3)}, so it is ${cmp === "equal" ? "equal to" : cmp + " than"} 1.`;
        q.solution = `<ol class="sol-steps"><li>Find the gap between the first addend and 1.</li><li>Compare the second addend to this gap.</li><li>${q.why}</li></ol>`;
      }
    } else {
      if (kind === "visual")
        q.visual =
          n === 5 && level > 1
            ? line(a, b)
            : [2, 3, 5, 6].includes(n)
              ? operands(a, b, op)
              : M.vertical([f(a), f(b)], op, { pad: true });
      if (kind === "word")
        q.prompt = sub
          ? `A ribbon is ${f(a)} m long. ${f(b)} m is cut off. How many meters remain?`
          : `Nia walks ${f(a)} km, then ${f(b)} km. How many kilometers does she walk altogether?`;
      if (kind === "reason") {
        const correct = reasoning(n, sub);
        q.prompt = `Which strategy preserves place value when ${sub ? 'subtracting' : 'adding'} decimals, including ${eq}?`;
        mc("valid", correct, [operationErrors(sub), alignmentErrors]);
        q.why = `${q.answerText} ${q.why} Skipping exchanges changes the amount; aligning last digits can mix different place values.`;
        q.solution = strategySolution(n, a, b, sub, level, kind);
      }
      if (kind === "error") {
        const base = f(a),
          padded = base.includes(".") ? base + "0" : base + ".00";
        q.prompt = `A student says ${base} and ${padded} have different values. Which explanation corrects this mistake?`;
        mc(
          "place",
          ["A final decimal zero adds no extra value; existing digits keep their same places.", "A zero at the right end adds no value; all existing digits keep the same places.", "A zero after the last decimal digit leaves the amount unchanged; no other digit moves."],
          [
            ["A final decimal zero makes the amount ten times larger, like whole numbers.", "A zero at the right end multiplies the amount by ten, as it does for whole numbers.", "Appending a zero after the last decimal digit makes the original amount ten times larger."],
            ["More decimal places mean a larger amount, regardless of the digit values.", "The number with more decimal places has a larger value, regardless of the digits.", "Adding another decimal place always increases the amount, even when the new digit is zero."],
          ],
        );
        q.why = `${base} = ${padded}. A tenth is ten hundredths; trailing zeros do not change the quantity.`;
        q.solution = `<ol class="sol-steps"><li>Zeros on the right do not move existing digits.</li><li>${q.why}</li></ol>`;
      }
      if (kind === "multi") {
        const c = r.int(1, Math.max(1, Math.min(39, v))),
          result = v - c;
        Object.assign(q.meta, { c, value: sub ? result : c });
        q.answer = f(sub ? result : c);
        q.answerText = q.answer;
        q.prompt = sub
          ? `A bottle holds ${f(a)} L. First ${f(b)} L is used, then ${f(c)} L more is used. How many liters remain?`
          : `A runner travels ${f(a)} km, then ${f(b)} km. Her goal is ${f(a + b + c)} km. How many more kilometers must she travel?`;
        q.why = sub
          ? `First ${eq} = ${f(v)}. Then ${f(v)} − ${f(c)} = ${f(result)} L.`
          : `First ${eq} = ${f(v)}. Then ${f(a + b + c)} − ${f(v)} = ${f(c)} km.`;
        q.solution = `<ol class="sol-steps"><li>Write an equation for each of the two steps.</li><li>${eq} = ${f(v)}.</li><li>${q.why}</li></ol>`;
        if ([2, 3].includes(n)) {
          q.meta.value = a + b + c;
          q.answer = f(a + b + c);
          q.answerText = q.answer;
          q.prompt = `Three ribbons measure ${f(a)} m, ${f(b)} m and ${f(c)} m. What is their total length?`;
          q.why = `First ${eq} = ${f(v)}. Then ${f(v)} + ${f(c)} = ${f(a + b + c)} m.`;
          q.solution = `<ol class="sol-steps"><li>Add the first two amounts in hundredths.</li><li>${eq} = ${f(v)}.</li><li>${q.why}</li></ol>`;
        }
        q.hints = [
          "Find what is known and what must be found. This problem has two steps.",
          "First find the combined distance or the amount left after the first use.",
          [2, 3].includes(n)
            ? "Combine the first two lengths, then add the third length. Keep the same units."
            : "Subtract the amount already traveled from the goal, or remove the second amount used. Check units.",
        ];
      }
    }
    if(n!==1 && kind==='error') q.hints=[`Compare ${f(a)} with the same number followed by a zero.`, 'Check whether any existing digit moved to a different place.', 'A zero at the right end adds no tenths or hundredths. Choose the explanation that keeps the value unchanged.'];
    if(n!==1 && kind==='reason') q.hints=[`Look at ${eq}. Are you combining amounts or finding a difference?`, sub?'A valid subtraction strategy can remove parts or count up from the smaller amount.':'A valid addition strategy combines like place values and exchanges when needed.', 'Reject any explanation that misaligns decimal points or skips a needed exchange.'];
    if(n!==1 && kind==='visual') q.solution = strategySolution(n, a, b, sub, level, kind);
    if (q.type === "mc")
      q.diagnose = () =>
        "Read each explanation carefully. Check whether it preserves place value and matches the operation.";
    return q;
  }
  lessons.forEach((l, i) => {
    const templates = [];
    for (let level = 1; level <= 3; level++)
      for (const kind of kinds)
        templates.push({
          id: `${kind}-${level}`,
          skill: l.id + ":" + kind,
          make: (r) => task(i + 1, kind, level, r),
        });
    E.register({
      lessonId: l.id,
      skills: Object.fromEntries(kinds.map((k) => [l.id + ":" + k, k])),
      templates,
    });
  });
  function build(id, mode, serial, level = 2, avoid = []) {
    const ids =
        id === "final" || id === "review" ? lessons.map((l) => l.id) : [id],
      count = id === "final" ? 25 : id === "review" ? 24 : 10,
      r = E.rng(serial),
      used = new Set(avoid),
      out = [];
    for (let i = 0; i < count; i++) {
      const lid = ids.length > 1 && i === 24 ? "4-8" : ids[i % ids.length];
      const blueprints = [
        ["calculate", "multi", "word"],
        ["visual", "calculate", "reason"],
        ["visual", "word", "calculate"],
        ["calculate", "reason", "multi"],
        ["visual", "word", "calculate"],
        ["visual", "calculate", "reason"],
        ["calculate", "reason", "word"],
        ["reason", "word", "multi"],
      ];
      const kind =
        ids.length > 1
          ? i === 24
            ? "multi"
            : blueprints[i % 8][Math.floor(i / 8)]
          : kinds[i % kinds.length];
      let q, x;
      for (let tries = 0; tries < 1000; tries++) {
        const lv = mode === "practice" ? level : 1 + (i % 3);
        x = { lesson: lid, id: `${kind}-${lv}`, seed: r.int(1, 2147483646) };
        q = E.make(lid, x.id, x.seed);
        if (!used.has(q.sig)) break;
      }
      if (used.has(q.sig)) throw new Error("Unable to create fresh questions");
      used.add(q.sig);
      out.push({ ...x, sig: q.sig });
    }
    return r.shuffle(out);
  }
  G.chapter4 = {
    lessons,
    kinds,
    f,
    grid,
    operands,
    line,
    build,
    make: (x) => E.make(x.lesson, x.id, x.seed),
  };
})((window.GML = window.GML || {}));
