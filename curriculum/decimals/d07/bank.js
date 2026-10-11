// D07 Subtracting Decimals — question bank.
// Subtract decimals to hundredths with models, by lining up the decimal points and regrouping, across zeros
// and whole numbers, checking with addition and estimates, and in word problems (5.NR.4.4).
(function (G) {
  'use strict';
  const D = G.D, M = G.models, K = G.kit;
  const { f, num, s, list, cap, textChoices } = K;
  const templates = [];
  const T = (id, skill, make) => templates.push({ id, skill, make });

  const sub = (a, b) => num(D.toThousandths(a) - D.toThousandths(b));
  const add = (a, b) => num(D.toThousandths(a) + D.toThousandths(b));
  const two = (x) => f(D.toThousandths(x), 2);
  function dec(r, places, minW, maxW) {
    const w = r.int(minW, maxW);
    const k = places === 1 ? w * 1000 + r.int(1, 9) * 100 : w * 1000 + r.int(0, 9) * 100 + r.int(1, 9) * 10;
    return num(k);
  }
  const roundWhole = (x) => Math.floor((D.toThousandths(x) + 500) / 1000);
  /** True when some column needs regrouping (a digit of a is smaller than the digit of b below it). */
  const needsRegroup = (a, b) => { const { da, db } = K.aligned(a, b); return da.some((d, i) => d < db[i]); };

  /** Feedback for a typed difference that names the likely mistake. */
  function diffDiag(a, b, info) {
    const got = info.th, ans = D.toThousandths(a) - D.toThousandths(b);
    if (got === null) return 'Differences of hundredths have at most two decimal places.';
    if (got === D.toThousandths(a) + D.toThousandths(b)) return 'That is the sum. This problem asks you to subtract (take away).';
    const mis = K.misaligned(a, b, '-');
    if (mis && D.parse(a).places !== D.parse(b).places && got === D.toThousandths(mis)) return 'It looks like the digits were lined up from the right, like whole numbers. Line up the decimal points instead, and write zeros to fill empty places.';
    if (got === D.toThousandths(K.noBorrowSub(a, b)) && got !== ans) return 'Check your regrouping. When the top digit is smaller than the digit below it, take 1 from the next place to the left: it becomes ten of this place. Don\'t subtract the top digit from the bottom digit.';
    if ([1000, 100, 10].includes(Math.abs(got - ans))) return 'Very close! One column is off by one. Check where you regrouped: did you take one away from the place you borrowed from?';
    if (got === ans * 10 || got * 10 === ans) return 'The digits look right, but the decimal point is in the wrong place. It lines up with the decimal points above it.';
    return 'Line up the decimal points, write zeros so both numbers have two places, and subtract each column from the right, regrouping when you need to.';
  }

  function diffQuestion(a, b, extra = {}) {
    const ans = sub(a, b);
    const P = Math.max(D.parse(a).places, D.parse(b).places);
    return Object.assign({
      type: 'number', sig: a + '-' + b,
      prompt: `Subtract: <span class="expr">${a} − ${b}</span>`,
      visual: M.vertical([a, b], '−', { answer: '' }),
      answer: ans, answerText: ans,
      hints: [
        'Line up the decimal points, with the bigger number on top. Write zeros so both numbers have the same number of places.',
        'Start with the column on the right. If the top digit is smaller than the bottom digit, you need to regroup.',
        'To regroup, take one from the next place to the left; it becomes ten of the place you are working on. Then subtract each column and bring the decimal point straight down.'
      ],
      why: `Lined up: ${f(D.toThousandths(a), P)} − ${f(D.toThousandths(b), P)} = <b>${f(D.toThousandths(ans), P)}</b>. Check: ${f(D.toThousandths(ans), P)} + ${f(D.toThousandths(b), P)} = ${f(D.toThousandths(a), P)}.`,
      diagnose: (resp, info) => diffDiag(a, b, info)
    }, extra);
  }

  // ───────────────────────── Skill: subtracting with models (subModel) ─────────────────────────

  T('SM1', 'subModel', (r, p) => {
    let ka = p.ka, kb = p.kb;
    if (!ka) for (;;) { ka = r.int(30, 99); kb = r.int(11, ka - 5); if (ka % 10 && kb % 10) break; }
    const a = f(ka * 10, 2), b = f(kb * 10, 2), ans = num((ka - kb) * 10);
    return {
      type: 'number', sig: ka + '-' + kb,
      prompt: `The grid shows <b>${a}</b>. Take away <b>${b}</b> (the crossed-out squares). What decimal is left?`,
      visual: M.grid(ka, { cross: kb }), answer: ans, answerText: ans,
      hints: [
        'Subtracting is taking away. Each small square is one hundredth.',
        `${a} is ${ka} hundredths and ${b} is ${kb} hundredths.`,
        'Subtract the numbers of hundredths (or count the shaded squares that are not crossed out), then write the result as a decimal.'
      ],
      why: `${ka} hundredths − ${kb} hundredths = ${ka - kb} hundredths = <b>${ans}</b>.`,
      diagnose(resp, info) {
        if (info.th === (ka + kb) * 10) return 'That adds the two amounts. Take away the crossed-out squares instead.';
        if (info.th === kb * 10) return 'That is the part taken away. The question asks what is left.';
        return diffDiag(a, b, info);
      }
    };
  });

  T('SM2', 'subModel', (r, p) => {
    const w = p.w !== undefined ? p.w : r.int(0, 8);
    const sx = p.sx || r.int(4, 9), jy = p.jy || r.int(2, sx - 2); // answer at least 0.2 past the whole (hint 2 names 0.1)
    const start = num(w * 1000 + sx * 100), jump = f(jy * 100, 1), ans = num(w * 1000 + (sx - jy) * 100);
    return {
      type: 'number', sig: start + '-' + jump,
      prompt: `Point A is at <b>${start}</b>. Subtract <b>${jump}</b> by jumping to the left. What number do you land on?`,
      visual: M.line({ from: w * 1000, to: w * 1000 + 1000, point: w * 1000 + sx * 100, labels: [String(w), String(w + 1)], tickLabels: true }),
      answer: ans, answerText: ans,
      hints: [
        'Subtracting on a number line means jumping to the left.',
        `Each tick mark is one tenth (0.1). ${jump} is ${s(jy, 'tenth')}.`,
        `Start at A and count ${jy} jumps (spaces between tick marks) to the left.`
      ],
      why: `From ${start}, jumping ${s(jy, 'tenth')} to the left lands on <b>${ans}</b>: ${start} − ${jump} = ${ans}.`,
      diagnose(resp, info) {
        if (info.th === w * 1000 + (sx + jy) * 100) return 'Subtracting means jumping to the LEFT, toward smaller numbers.';
        if (Math.abs(info.th - (w * 1000 + (sx - jy) * 100)) === 100) return 'Almost! Count the jumps (spaces), not the tick marks. Start counting after point A.';
        return `Count ${s(jy, 'tenth')} to the left of ${start}. Each tick is 0.1.`;
      }
    };
  });

  // ───────────────────────── Skill: line up and regroup (subAlign) ─────────────────────────

  T('SL1', 'subAlign', (r, p) => {
    let a = p.a, b = p.b;
    if (!a) for (;;) {
      a = dec(r, 2, 2, 20); b = dec(r, 2, 0, 9);
      if (D.cmp(a, b) > 0 && (needsRegroup(a, b) || r.next() < 0.25)) break;
    }
    return diffQuestion(a, b);
  });

  T('SL2', 'subAlign', (r, p) => {
    let a = p.a, b = p.b;
    if (!a) { a = num(r.int(10, 40) * 1000 + r.int(0, 9) * 100 + r.int(1, 9) * 10); b = num(r.int(1, 9) * 1000 + r.int(1, 9) * 100); }
    const leftHtml = (() => { const L = Math.max(a.length, b.length); const pad = (x) => x.padEnd(L, ' '); return `<table class="vcalc-model" role="img" aria-label="${a} minus ${b} with the first digits lined up on the left"><tbody>${[a, b].map((x, k) => `<tr class="${k === 1 ? 'v-last' : ''}"><td class="v-op">${k === 1 ? '−' : ''}</td>${pad(x).split('').map((c) => `<td class="${c === '.' ? 'v-pt' : ''}">${c === ' ' ? '' : c}</td>`).join('')}</tr>`).join('')}</tbody></table>`; })();
    const opts = [{ key: 'ok', html: M.vertical([a, b], '−', {}) }, { key: 'right', html: M.vertical([a, b], '−', { misaligned: true }) }, { key: 'left', html: leftHtml }];
    const order = r.shuffle([0, 1, 2]);
    const letters = ['A', 'B', 'C'];
    const choices = order.map((i, pos) => ({ value: letters[pos], text: 'Way ' + letters[pos], html: opts[i].html, key: opts[i].key }));
    const ans = choices.find((c) => c.key === 'ok').value;
    return {
      type: 'mc', layout: 'models', sig: a + '-' + b,
      prompt: `Which way of writing <b>${a} − ${b}</b> is lined up correctly?`,
      choices, answer: ans, answerText: 'Way ' + ans,
      hints: [
        'To subtract decimals, each place must be under the same place.',
        'Look at the decimal points in each way. Are they in a straight line, one above the other?',
        'When the decimal points line up, tenths are under tenths and ones are under ones.'
      ],
      why: `In Way ${ans} the decimal points are lined up. The difference is ${sub(a, b)}.`,
      diagnose(resp) {
        const c = choices.find((x) => x.value === resp);
        return c && c.key === 'right' ? 'That way lines the digits up from the right, like whole numbers. Then tenths end up under hundredths.'
          : 'That way lines up the first digits on the left, so the ones and tens are mixed up. Line up the decimal points.';
      }
    };
  });

  T('SL3', 'subAlign', (r, p) => {
    let a = p.a, b = p.b;
    if (!a) for (;;) { a = dec(r, 2, 3, 9); b = dec(r, 2, 1, 2); if (needsRegroup(a, b) && K.noBorrowSub(a, b) !== sub(a, b)) break; }
    const wrong = two(K.noBorrowSub(a, b));
    const name = p.name || r.pick(['Ana', 'Sam', 'Leo', 'Mia', 'Eli']);
    return diffQuestion(a, b, {
      sig: 'fix' + a + '-' + b,
      prompt: `${name} subtracted <span class="expr">${a} − ${b}</span> and got <b>${wrong}</b>. In each column, ${name} took the smaller digit from the bigger one. What is the <b>correct</b> difference?`,
      visual: M.vertical([a, b], '−', { answer: wrong, label: `${name}'s work: ${a} minus ${b} equals ${wrong}.` }),
      hints: [
        `${name}'s mistake: when the top digit is smaller, you cannot just flip the subtraction. You have to regroup.`,
        'Start with the hundredths. If the top digit is smaller, take one tenth from the tenths place: it becomes ten hundredths.',
        'Remember that the tenths digit is now one less. Keep going column by column.'
      ]
    });
  });

  // ───────────────────────── Skill: zeros and whole numbers (subZeros) ─────────────────────────

  T('SZ1', 'subZeros', (r, p) => {
    const a = p.a || String(r.int(2, 20));
    let b = p.b;
    if (!b) for (;;) { b = dec(r, r.int(1, 2), 0, Number(a) - 1); if (D.cmp(b, a) < 0) break; }
    return diffQuestion(a, b, {
      sig: 'w' + a + '-' + b,
      hints: [
        `A whole number has its decimal point at the end: ${a} = ${a}.00.`,
        `Write ${a} as ${a}.00 and line up the decimal points with ${b}. The top has zeros, so you will need to regroup.`,
        (Number(a) % 10 === 0 ? 'The ones digit is 0 too, so start by taking one ten: it makes ten ones. Then take one of those ones, which makes ten tenths' : 'Regroup across the zeros: take one from the ones, which makes ten tenths') + (D.parse(b).places === 2 ? '; then take one tenth, which makes ten hundredths.' : '.') + ' Then subtract each column.'
      ]
    });
  });

  T('SZ2', 'subZeros', (r, p) => {
    let a = p.a, b = p.b;
    if (!a) for (;;) {
      const top0 = r.next() < 0.5;
      a = top0 ? num(r.int(2, 15) * 1000 + r.int(1, 9) * 10) : dec(r, 1, 2, 15); // like 4.06, or like 7.3
      b = top0 ? dec(r, 1, 0, 9) : dec(r, 2, 0, 9);
      if (D.cmp(a, b) > 0 && D.parse(a).places !== D.parse(b).places) break;
    }
    return diffQuestion(a, b);
  });

  // ───────────────────────── Skill: check the answer (subCheck) ─────────────────────────

  T('SC1', 'subCheck', (r, p) => {
    let a = p.a, b = p.b;
    if (!a) for (;;) { a = dec(r, r.int(1, 2), 3, 12); b = dec(r, 2, 0, 3); if (D.cmp(a, b) > 0) break; }
    const d = sub(a, b);
    const right = `${d} + ${b} = ${a}`;
    const wrongs = [`${d} + ${a} = ${add(d, a)}`, `${a} + ${b} = ${add(a, b)}`, D.cmp(d, b) > 0 ? `${d} − ${b} = ${sub(d, b)}` : `${a} − ${d} = ${b}`];
    return {
      type: 'mc', sig: a + '-' + b,
      prompt: `${a} − ${b} = ${d}. Which addition <b>checks</b> this answer?`,
      choices: textChoices(r, right, [...new Set(wrongs)].filter((t) => t !== right)), answer: right, answerText: right,
      hints: [
        'Subtraction and addition undo each other.',
        'If you take an amount away and then add it back, you get the number you started with.',
        `So add the answer (${d}) and the amount taken away. You should get the first number.`
      ],
      why: `Adding back what was taken away gives the starting number: ${d} + ${b} = ${a}, so ${a} − ${b} = ${d} is right.`,
      diagnose(resp) {
        if (resp.startsWith(`${a} + ${b}`)) return 'That adds the two numbers from the problem. To check, add the ANSWER and the number that was taken away.';
        if (resp.includes('−')) return 'A check for subtraction uses addition, which undoes it.';
        return 'Add the answer to the number that was taken away, not to the starting number.';
      }
    };
  });

  T('SC2', 'subCheck', (r, p) => {
    let a = p.a, b = p.b;
    if (!a) for (;;) { a = dec(r, 2, 4, 15); b = dec(r, 2, 1, 3); if (needsRegroup(a, b) && K.noBorrowSub(a, b) !== sub(a, b)) break; }
    const right = two(sub(a, b)), wrong = two(K.noBorrowSub(a, b));
    const claimRight = p.claim !== undefined ? p.claim === 'right' : r.next() < 0.4;
    const said = claimRight ? right : wrong;
    const name = p.name || r.pick(['Leo', 'Ava', 'Jordan', 'Mia', 'Sam']);
    const back = add(said, b);
    const ans = claimRight ? `Yes. ${said} + ${b} = ${a}, so the answer checks.` : `No. ${said} + ${b} = ${back}, not ${a}.`;
    const wrongs = claimRight
      ? [`No. ${said} + ${a} should equal ${b}.`, `No. A difference can't have two decimal places.`, `Yes, because ${said} is less than ${a}.`]
      : [`Yes. ${said} is less than ${a}, so it must be right.`, `Yes. ${said} + ${a} is a big number.`, `No. ${a} − ${b} must be more than ${a}.`];
    return {
      type: 'mc', sig: a + '-' + b + (claimRight ? 'r' : 'w'),
      prompt: `${name} worked out <span class="expr">${a} − ${b}</span> and got <b>${said}</b>. Use addition to check. Is ${name} right?`,
      choices: textChoices(r, ans, wrongs), answer: ans, answerText: ans,
      hints: [
        'To check a subtraction, add the answer and the number taken away.',
        `Add ${said} + ${b}.`,
        `If the sum is ${a}, the answer is right. If not, it is wrong.`
      ],
      why: `${said} + ${b} = ${back}. ${claimRight ? `That is ${a}, so the answer is right.` : `That is not ${a}, so the answer is wrong. The correct difference is ${right}.`}`,
      diagnose(resp) {
        if (/less than/.test(resp)) return 'Being less than the first number does not prove a difference is right. Check it by adding.';
        return `Add ${said} and ${b}, and compare the sum with ${a}.`;
      }
    };
  });

  T('SC3', 'subCheck', (r, p) => {
    let a = p.a, b = p.b;
    if (!a) for (;;) { a = dec(r, 2, 6, 20); b = dec(r, 2, 1, 5); const fa = D.toThousandths(a) % 1000, fb = D.toThousandths(b) % 1000; if (fa !== 500 && fb !== 500 && roundWhole(a) > roundWhole(b)) break; }
    const est = roundWhole(a) - roundWhole(b);
    const pool = [String(roundWhole(a) + roundWhole(b)), String(est + 2), String(Math.max(0, est - 3)), String(est * 10)].filter((x) => x !== String(est));
    const wrongs = [...new Set(pool)].slice(0, 3);
    return {
      type: 'mc', sig: a + '-' + b,
      prompt: `Estimate <span class="expr">${a} − ${b}</span> by rounding each number to the nearest <b>whole number</b>. Which is the best estimate?`,
      choices: textChoices(r, String(est), wrongs), answer: String(est), answerText: String(est),
      hints: [
        'Round each number to the nearest whole number first, then subtract.',
        'To round to the nearest whole number, look at the tenths digit: five or more rounds up.',
        `Round ${a} and ${b}, then subtract the rounded numbers.`
      ],
      why: `${a} rounds to ${roundWhole(a)} and ${b} rounds to ${roundWhole(b)}, so the estimate is ${roundWhole(a)} − ${roundWhole(b)} = <b>${est}</b>. (The exact difference is ${sub(a, b)}.)`,
      diagnose(resp) {
        if (resp === String(roundWhole(a) + roundWhole(b))) return 'That adds the rounded numbers. This problem is a subtraction.';
        return `Round each number to the nearest whole number (${a} and ${b}), then subtract.`;
      }
    };
  });

  // ───────────────────────── Skill: word problems (subWord) ─────────────────────────

  T('SW1', 'subWord', (r, p) => {
    const paid = p.paid || String(r.pick([5, 10, 20]));
    const cost = p.cost || num(r.int(1, Number(paid) - 1) * 1000 + r.int(0, 9) * 100 + r.int(1, 9) * 10);
    const money = (v) => '$' + f(D.toThousandths(v), 2);
    const item = p.item || r.pick(['a book', 'a toy car', 'a lunch', 'a puzzle', 'a T-shirt']);
    const q = diffQuestion(paid, cost);
    return Object.assign(q, {
      sig: 'change' + paid + '-' + cost,
      prompt: `You buy ${item} that costs <b>${money(cost)}</b>. You pay with a <b>$${paid}</b> bill. How much <b>change</b> do you get?`,
      visual: undefined, answerText: money(q.answer),
      hints: ['Change is what is left after you pay: subtract the cost from the money you gave.', `Write $${paid} as $${paid}.00 and line up the decimal points with ${money(cost)}.`, q.hints[2]],
      why: `$${paid}.00 − ${money(cost)} = <b>${money(q.answer)}</b>. Check: ${money(q.answer)} + ${money(cost)} = $${paid}.00.`
    });
  });

  const COMPARE = [
    { t: (a, b) => `A blue ribbon is ${a} m long. A red ribbon is ${b} m long. How much longer is the blue ribbon?`, unit: 'm' },
    { t: (a, b) => `A puppy weighs ${a} kg and a kitten weighs ${b} kg. How much heavier is the puppy?`, unit: 'kg' },
    { t: (a, b) => `Jada ran ${a} km. Omar ran ${b} km. How much farther did Jada run?`, unit: 'km' }
  ];
  T('SW2', 'subWord', (r, p) => {
    const st = COMPARE[p.story !== undefined ? p.story : r.int(0, COMPARE.length - 1)];
    let a = p.a, b = p.b;
    if (!a) for (;;) { a = dec(r, r.int(1, 2), 2, 9); b = dec(r, r.int(1, 2), 0, 3); if (D.cmp(a, b) > 0) break; }
    const q = diffQuestion(a, b);
    return Object.assign(q, {
      sig: 'cmp' + st.unit + a + '-' + b,
      prompt: st.t(a, b), visual: undefined, answerText: `${q.answer} ${st.unit}`,
      hints: ['"How much longer (heavier, farther)" asks for the difference: subtract the smaller amount from the bigger one.', q.hints[0], q.hints[2]],
      why: `${a} − ${b} = <b>${q.answer} ${st.unit}</b>.`
    });
  });

  const remind = {
    subModel: '<p><b>Remember:</b> subtracting is taking away. 0.75 − 0.30 = 75 hundredths − 30 hundredths = 45 hundredths = 0.45.</p>',
    subAlign: `<p><b>Remember:</b> line up the decimal points. When the top digit is smaller, take one from the next place to the left (it becomes ten of this place).</p>${M.vertical(['5.32', '2.67'], '−', { answer: '2.65' })}`,
    subZeros: '<p><b>Remember:</b> write a whole number with zeros: 5 = 5.00. Then regroup across the zeros.</p>',
    subCheck: '<p><b>Remember:</b> check a subtraction by adding: answer + amount taken away = the starting number.</p>',
    subWord: '<p><b>Remember:</b> "how much change", "how much more", "how much longer" and "what is left" mean subtract.</p>'
  };

  G.engine.register({
    lessonId: 'd07',
    skills: {
      subModel: 'Subtracting with models',
      subAlign: 'Lining up decimal points and regrouping',
      subZeros: 'Subtracting across zeros and from whole numbers',
      subCheck: 'Checking a difference (addition and estimates)',
      subWord: 'Subtraction word problems'
    },
    plan: { subModel: 2, subAlign: 3, subZeros: 2, subCheck: 1, subWord: 2 },
    practiceOnly: [],
    templates, remind
  });
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
