// D06 Adding Decimals — question bank.
// Add decimals to hundredths with models, by lining up the decimal points and regrouping, with different
// numbers of places, with estimates, and in word problems (5.NR.4.4). Answers are exact decimal strings.
(function (G) {
  'use strict';
  const D = G.D, M = G.models, K = G.kit;
  const { f, num, s, list, cap, textChoices } = K;
  const templates = [];
  const T = (id, skill, make) => templates.push({ id, skill, make });

  const add = (a, b) => num(D.toThousandths(a) + D.toThousandths(b));
  /** A decimal with exactly `places` places (1 or 2), whole part up to `maxW`, last digit not 0. */
  function dec(r, places, maxW) {
    const w = r.int(0, maxW);
    const k = places === 1 ? w * 1000 + r.int(1, 9) * 100 : w * 1000 + r.int(0, 9) * 100 + r.int(1, 9) * 10;
    return num(k);
  }
  const roundWhole = (x) => Math.floor((D.toThousandths(x) + 500) / 1000);

  /** Feedback for a typed sum that names the likely mistake. */
  function sumDiag(a, b, info) {
    const got = info.th, ans = D.toThousandths(a) + D.toThousandths(b);
    if (got === null) return 'Sums of hundredths have at most two decimal places.';
    const mis = K.misaligned(a, b, '+');
    if (mis && D.parse(a).places !== D.parse(b).places && got === D.toThousandths(mis)) return 'It looks like the digits were lined up from the right, like whole numbers. Line up the decimal points instead, and write a zero to fill the empty place.';
    if (got === D.toThousandths(K.noCarryAdd(a, b)) && got !== ans) return 'Check your regrouping. When a column adds up to ten or more, write the ones digit and carry one to the next column on the left.';
    if (Math.abs(got - ans) === 1000 || Math.abs(got - ans) === 100 || Math.abs(got - ans) === 10) return 'Very close! One column is off by one. Check each column again, especially any carried 1.';
    if (got === ans * 10 || got * 10 === ans) return 'The digits look right, but the decimal point is in the wrong place. In the answer, the decimal point lines up with the decimal points above it.';
    return 'Line up the decimal points, add each column from the right (hundredths first), and carry when a column makes ten or more.';
  }

  function sumQuestion(a, b, extra = {}) {
    const ans = add(a, b);
    const P = Math.max(D.parse(a).places, D.parse(b).places);
    return Object.assign({
      type: 'number', sig: [a, b].sort().join('+'),
      prompt: `Add: <span class="expr">${a} + ${b}</span>`,
      visual: M.vertical([a, b], '+', { answer: '' }),
      answer: ans, answerText: ans,
      hints: [
        'Line up the decimal points so that each place is under the same place: hundredths under hundredths, tenths under tenths.',
        P === 2 && (D.parse(a).places < 2 || D.parse(b).places < 2) ? 'Write a zero at the end of the number with fewer decimal places, so both have two places. Then start with the hundredths column.' : 'Start with the column on the right (the smallest place) and add the digits in that column.',
        'If a column adds up to ten or more, write the ones digit and carry one to the next column. Bring the decimal point straight down into the answer.'
      ],
      why: `Lined up: ${f(D.toThousandths(a), P)} + ${f(D.toThousandths(b), P)} = <b>${f(D.toThousandths(ans), P)}</b>${D.parse(f(D.toThousandths(ans), P)).frac.endsWith('0') && P ? ` (= ${ans})` : ''}.`,
      diagnose: (resp, info) => sumDiag(a, b, info)
    }, extra);
  }

  // ───────────────────────── Skill: adding with models (addModel) ─────────────────────────

  T('AM1', 'addModel', (r, p) => {
    let ka = p.ka, kb = p.kb;
    if (!ka) for (;;) { ka = r.int(11, 79); kb = r.int(11, 89 - ka); if (ka % 10 && kb % 10 && ka + kb <= 99) break; }
    const a = f(ka * 10, 2), b = f(kb * 10, 2), ans = f((ka + kb) * 10, 2);
    return {
      type: 'number', sig: ka + '+' + kb,
      prompt: 'Each grid is one whole. What decimal do the two shaded parts make <b>altogether</b>?',
      visual: `<div class="model-pair"><div><p class="model-cap">First grid</p>${M.grid(ka)}</div><div><p class="model-cap">Second grid</p>${M.grid(kb)}</div></div>`,
      answer: ans, answerText: ans,
      hints: [
        'Write a decimal for each grid. Each small square is one hundredth.',
        'Count each grid: full columns are tenths and extra squares are hundredths. Write both decimals.',
        'Now add the two numbers of hundredths (or add tenths with tenths and hundredths with hundredths).'
      ],
      why: `The grids show ${a} and ${b}. ${ka} hundredths + ${kb} hundredths = ${ka + kb} hundredths = <b>${ans}</b>.`,
      diagnose(resp, info) {
        if (info.th === ka * 10 || info.th === kb * 10) return 'That is only one of the grids. Add the shaded parts of both grids.';
        if (info.th % 10) return 'Each square is one hundredth, so the answer has two decimal places.';
        return sumDiag(a, b, info);
      }
    };
  });

  T('AM2', 'addModel', (r, p) => {
    const ta = p.ta || r.int(2, 8), tb = p.tb || r.int(2, 8);
    const a = f(ta * 100, 1), b = f(tb * 100, 1), ans = num((ta + tb) * 100);
    return {
      type: 'number', sig: [ta, tb].sort().join('+'),
      prompt: `Each bar is one whole cut into tenths. Add: <span class="expr">${a} + ${b}</span>`,
      visual: `<div class="model-pair"><div><p class="model-cap">${a}</p>${M.strip(ta)}</div><div><p class="model-cap">${b}</p>${M.strip(tb)}</div></div>`,
      answer: ans, answerText: ans,
      hints: [
        'Adding tenths is like adding whole things: count all the shaded tenths.',
        `${a} is ${s(ta, 'tenth')} and ${b} is ${s(tb, 'tenth')}. Add the numbers of tenths.`,
        'If you have ten tenths or more, ten of them make one whole. Write the wholes before the decimal point and the leftover tenths after it.'
      ],
      why: `${ta} tenths + ${tb} tenths = ${ta + tb} tenths${ta + tb >= 10 ? ` = 1 whole and ${ta + tb - 10} tenths` : ''} = <b>${ans}</b>.`,
      diagnose(resp, info) {
        if (info.th === (ta + tb - 10) * 100 && ta + tb > 10) return 'You found the leftover tenths, but 10 tenths make 1 whole. Don\'t forget the whole.';
        if (info.th === (ta + tb) * 10) return `That would be ${ta + tb} hundredths. These are tenths, so ${ta + tb} tenths is written with the tenths place right after the point${ta + tb >= 10 ? ' (and 10 tenths make 1 whole)' : ''}.`;
        return `Count the tenths in both bars: ${ta} + ${tb}. Then write that many tenths as a decimal.`;
      }
    };
  });

  T('AM3', 'addModel', (r, p) => {
    const w = p.w !== undefined ? p.w : r.int(0, 8);
    const sx = p.sx || r.int(1, 6), jy = p.jy || r.int(2, 9 - sx);
    const start = num(w * 1000 + sx * 100), jump = f(jy * 100, 1), ans = num(w * 1000 + (sx + jy) * 100);
    return {
      type: 'number', sig: start + '+' + jump,
      prompt: `Point A is at <b>${start}</b>. Add <b>${jump}</b> by jumping to the right. What number do you land on?`,
      visual: M.line({ from: w * 1000, to: w * 1000 + 1000, point: w * 1000 + sx * 100, labels: [String(w), String(w + 1)], tickLabels: true }),
      answer: ans, answerText: ans,
      hints: [
        'Adding on a number line means jumping to the right.',
        `Each tick mark on this line is one tenth (0.1). ${jump} is ${s(jy, 'tenth')}.`,
        `Start at A and count ${jy} tick marks to the right.`
      ],
      why: `From ${start}, jumping ${s(jy, 'tenth')} to the right lands on <b>${ans}</b>: ${start} + ${jump} = ${ans}.`,
      diagnose(resp, info) {
        if (info.th === w * 1000 + (sx - jy) * 100) return 'Adding means jumping to the RIGHT, toward bigger numbers.';
        if (info.th === w * 1000 + (sx + jy) * 100 + 100 || info.th === w * 1000 + (sx + jy) * 100 - 100) return 'Almost! Count the jumps (spaces), not the tick marks. Start counting after point A.';
        return `Count ${s(jy, 'tenth')} to the right of ${start}. Each tick is 0.1.`;
      }
    };
  });

  // ───────────────────────── Skill: line up and regroup (addAlign) ─────────────────────────

  T('AL1', 'addAlign', (r, p) => {
    let a = p.a, b = p.b;
    if (!a) for (;;) {
      a = dec(r, 2, 20); b = dec(r, 2, 20);
      const da = K.aligned(a, b).da, db = K.aligned(a, b).db;
      if (da[da.length - 1] + db[db.length - 1] >= 10 || r.next() < 0.3) break; // usually a regroup in the hundredths
    }
    return sumQuestion(a, b);
  });

  T('AL2', 'addAlign', (r, p) => {
    let a = p.a, b = p.b;
    // Different lengths (12.35 and 3.4), so lining up from the left and from the right both look different.
    if (!a) { a = num(r.int(10, 40) * 1000 + r.int(0, 9) * 100 + r.int(1, 9) * 10); b = num(r.int(1, 9) * 1000 + r.int(1, 9) * 100); }
    const opts = [
      { key: 'ok', html: M.vertical([a, b], '+', {}) },
      { key: 'right', html: M.vertical([a, b], '+', { misaligned: true }) },
      { key: 'left', html: (() => { const L = Math.max(a.length, b.length); const pad = (x) => x.padEnd(L, ' '); return `<table class="vcalc-model" role="img" aria-label="${a} plus ${b} with the first digits lined up on the left"><tbody>${[a, b].map((x, k) => `<tr class="${k === 1 ? 'v-last' : ''}"><td class="v-op">${k === 1 ? '+' : ''}</td>${pad(x).split('').map((c) => `<td class="${c === '.' ? 'v-pt' : ''}">${c === ' ' ? '' : c}</td>`).join('')}</tr>`).join('')}</tbody></table>`; })() }
    ];
    const order = r.shuffle([0, 1, 2]);
    const letters = ['A', 'B', 'C'];
    const choices = order.map((i, pos) => ({ value: letters[pos], text: 'Way ' + letters[pos], html: opts[i].html, key: opts[i].key }));
    const ans = choices.find((c) => c.key === 'ok').value;
    return {
      type: 'mc', layout: 'models', sig: a + '+' + b,
      prompt: `Which way of writing <b>${a} + ${b}</b> is lined up correctly?`,
      choices, answer: ans, answerText: 'Way ' + ans,
      hints: [
        'To add decimals, each place must be under the same place.',
        'Look at the decimal points in each way. Are they in a straight line, one above the other?',
        'When the decimal points line up, tenths are under tenths and ones are under ones.'
      ],
      why: `In Way ${ans} the decimal points are lined up, so ones are under ones and tenths are under tenths. The sum is ${add(a, b)}.`,
      diagnose(resp) {
        const c = choices.find((x) => x.value === resp);
        return c && c.key === 'right' ? 'That way lines the digits up from the right, like whole numbers. Then tenths end up under hundredths.'
          : 'That way lines up the first digits on the left, so the ones and tens are mixed up. Line up the decimal points.';
      }
    };
  });

  T('AL3', 'addAlign', (r, p) => {
    let a = p.a, b = p.b;
    if (!a) { a = num(r.int(1, 9) * 1000 + r.int(1, 9) * 100); b = num(r.int(1, 9) * 1000 + r.int(1, 9) * 100 + r.int(1, 9) * 10); if (r.next() < 0.5) [a, b] = [b, a]; }
    const wrong = f(D.toThousandths(K.misaligned(a, b, '+')), 2);
    const name = p.name || r.pick(['Sam', 'Ana', 'Leo', 'Mia', 'Eli']);
    return sumQuestion(a, b, {
      sig: 'fix' + [a, b].sort().join('+'),
      prompt: `${name} added <span class="expr">${a} + ${b}</span> and got <b>${wrong}</b>, because the digits were lined up from the right. What is the <b>correct</b> sum?`,
      visual: M.vertical([a, b], '+', { misaligned: true, answer: wrong, label: `${name}'s work: ${a} plus ${b} with the digits lined up from the right, equals ${wrong}.` }),
      hints: [
        `${name}'s mistake: the decimal points are not lined up, so tenths were added to hundredths.`,
        `Write the numbers again with the decimal points lined up. Write ${D.parse(a).places < 2 ? a : b} with a zero at the end so both have two decimal places.`,
        'Now add column by column from the right, carrying when a column makes ten or more.'
      ]
    });
  });

  // ───────────────────────── Skill: different numbers of places (addMixed) ─────────────────────────

  T('MX1', 'addMixed', (r, p) => {
    let a = p.a, b = p.b;
    if (!a) { a = dec(r, 1, 30); b = dec(r, 2, 30); if (r.next() < 0.5) [a, b] = [b, a]; }
    return sumQuestion(a, b);
  });

  T('MX2', 'addMixed', (r, p) => {
    const kind = p.kind || r.pick(['whole', 'three']);
    if (kind === 'whole') {
      const a = p.a || String(r.int(2, 40)), b = p.b || dec(r, r.int(1, 2), 9);
      return sumQuestion(a, b, { sig: 'w' + [a, b].sort().join('+'), hints: [
        `A whole number has its decimal point at the end: ${a} = ${a}.0 = ${a}.00.`,
        `Write ${a} as ${a}.00 and line up the decimal points with ${b}.`,
        'Now add each column. The decimal digits come from the decimal number; the whole numbers add in the ones (and tens) places.'
      ] });
    }
    const xs = p.xs || [dec(r, 2, 9), dec(r, 1, 9), dec(r, 2, 9)];
    const ans = num(xs.reduce((t, x) => t + D.toThousandths(x), 0));
    return {
      type: 'number', sig: '3:' + xs.slice().sort().join('+'),
      prompt: `Add: <span class="expr">${xs.join(' + ')}</span>`,
      answer: ans, answerText: ans,
      hints: [
        'Line up all three decimal points in a column.',
        'Write zeros at the end so every number has two decimal places.',
        'Add the hundredths column first, then the tenths, then the ones, carrying when a column makes ten or more.'
      ],
      why: `With two places each: ${xs.map((x) => f(D.toThousandths(x), 2)).join(' + ')} = <b>${f(D.toThousandths(ans), 2)}</b>.`,
      diagnose(resp, info) {
        const two = num(D.toThousandths(xs[0]) + D.toThousandths(xs[1]));
        if (info.th === D.toThousandths(two)) return 'That is the sum of only the first two numbers. Add all three.';
        return sumDiag(two, xs[2], { th: info.th - 0, value: info.value, raw: info.raw });
      }
    };
  });

  // ───────────────────────── Skill: estimate and check (addEstimate) ─────────────────────────

  T('ES1', 'addEstimate', (r, p) => {
    let a = p.a, b = p.b;
    if (!a) for (;;) { a = dec(r, 2, 15); b = dec(r, 2, 15); const fa = D.toThousandths(a) % 1000, fb = D.toThousandths(b) % 1000; if (fa !== 500 && fb !== 500) break; }
    const est = roundWhole(a) + roundWhole(b);
    const exact = add(a, b);
    const wrongs = [...new Set([String(Math.floor(D.toThousandths(a) / 1000) + Math.floor(D.toThousandths(b) / 1000)), String(est + 2), String(est * 10)])].filter((x) => x !== String(est));
    while (wrongs.length < 3) wrongs.push(String(est + wrongs.length + 3));
    return {
      type: 'mc', sig: [a, b].sort().join('+'),
      prompt: `Estimate <span class="expr">${a} + ${b}</span> by rounding each number to the nearest <b>whole number</b>. Which is the best estimate?`,
      choices: textChoices(r, String(est), wrongs.slice(0, 3)), answer: String(est), answerText: String(est),
      hints: [
        'Round each number to the nearest whole number first, then add the rounded numbers.',
        `To round to the nearest whole number, look at the tenths digit: five or more rounds up.`,
        `Round ${a} and ${b}, then add the two whole numbers.`
      ],
      why: `${a} rounds to ${roundWhole(a)} and ${b} rounds to ${roundWhole(b)}, so the estimate is ${roundWhole(a)} + ${roundWhole(b)} = <b>${est}</b>. (The exact sum is ${exact}, which is close.)`,
      diagnose(resp) {
        if (resp === String(Math.floor(D.toThousandths(a) / 1000) + Math.floor(D.toThousandths(b) / 1000))) return 'That just drops the decimal parts. Round each number to the NEAREST whole number: look at the tenths digit.';
        if (resp === String(est * 10)) return 'That is 10 times too big. Round each number to a whole number first, then add.';
        return `Round each number separately: ${a} and ${b}. Then add the rounded numbers.`;
      }
    };
  });

  T('ES2', 'addEstimate', (r, p) => {
    let a = p.a, b = p.b;
    if (!a) { a = num(r.int(3, 9) * 1000 + r.int(1, 9) * 100); b = dec(r, 2, 9); } // whole part 3+ keeps the misaligned sum far from the estimate
    const right = f(D.toThousandths(add(a, b)), 2);
    const mis = f(D.toThousandths(K.misaligned(a, b, '+')), 2);
    const claimRight = p.claim !== undefined ? p.claim === 'right' : r.next() < 0.4;
    const said = claimRight ? right : mis;
    const name = p.name || r.pick(['Leo', 'Ava', 'Jordan', 'Mia', 'Sam']);
    const est = roundWhole(a) + roundWhole(b);
    const ans = claimRight ? `Yes. ${a} + ${b} is about ${est}, and ${said} is close to ${est}.` : `No. ${a} + ${b} is about ${est}, but ${said} is far from ${est}.`;
    const wrongs = claimRight
      ? [`No. ${said} has too many digits to be right.`, `No. The sum must be more than ${est + 5}.`, `Yes, because ${said} has two decimal places.`]
      : [`Yes. ${said} has two decimal places, so it must be right.`, `Yes, because it uses all the same digits.`, `No. The sum must be less than ${Math.max(1, est - 4)}.`];
    return {
      type: 'mc', sig: [a, b].sort().join('+') + (claimRight ? 'r' : 'w'),
      prompt: `${name} added <span class="expr">${a} + ${b}</span> and got <b>${said}</b>. Is that answer reasonable?`,
      choices: textChoices(r, ans, wrongs), answer: ans, answerText: ans,
      hints: [
        'Estimate first: round each number to the nearest whole number and add.',
        `${a} is about ${roundWhole(a)} and ${b} is about ${roundWhole(b)}.`,
        `Compare ${said} with your estimate. A reasonable answer is close to the estimate.`
      ],
      why: `${a} + ${b} is about ${roundWhole(a)} + ${roundWhole(b)} = ${est}. The exact sum is ${right}. ${claimRight ? 'So the answer is reasonable.' : `So ${said} is not reasonable; it probably came from not lining up the decimal points.`}`,
      diagnose(resp) {
        if (/decimal places|digits/.test(resp)) return 'The number of digits does not tell you if a sum is reasonable. Compare the answer with an estimate.';
        return `Round both numbers to whole numbers, add them, and compare that estimate with ${said}.`;
      }
    };
  });

  // ───────────────────────── Skill: word problems (addWord) ─────────────────────────

  const MONEY = [['notebook', 'pen'], ['sandwich', 'juice'], ['book', 'bookmark'], ['ball', 'water bottle'], ['kite', 'string']];
  T('WP1', 'addWord', (r, p) => {
    const [x, y] = MONEY[p.m !== undefined ? p.m : r.int(0, MONEY.length - 1)];
    const a = p.a || num(r.int(1, 15) * 1000 + r.int(0, 9) * 100 + r.int(1, 9) * 10);
    const b = p.b || num(r.int(0, 9) * 1000 + r.int(0, 9) * 100 + r.int(1, 9) * 10);
    const money = (v) => '$' + f(D.toThousandths(v), 2);
    const q = sumQuestion(a, b);
    return Object.assign(q, {
      sig: 'm' + [a, b].sort().join('+'),
      prompt: `A ${x} costs <b>${money(a)}</b> and a ${y} costs <b>${money(b)}</b>. How much do they cost <b>together</b>?`,
      visual: undefined,
      answerText: money(q.answer),
      hints: [
        '"Together" means add the two prices.',
        `Write ${money(a)} and ${money(b)} in a column with the decimal points lined up.`,
        'Add the cents (hundredths) first, then the dimes (tenths), then the dollars, carrying when a column makes ten or more.'
      ],
      why: `${money(a)} + ${money(b)} = <b>${money(q.answer)}</b>.`
    });
  });

  const LENGTHS = [
    { t: (a, b) => `Maya walked ${a} km in the morning and ${b} km in the afternoon. How far did she walk in all?`, unit: 'km', wa: 5, wb: 5 },
    { t: (a, b) => `A plant was ${a} m tall. It grew ${b} m. How tall is it now?`, unit: 'm', wa: 2, wb: 0 },
    { t: (a, b) => `One bag of rice weighs ${a} kg and another weighs ${b} kg. What is the total weight?`, unit: 'kg', wa: 9, wb: 9 }
  ];
  T('WP2', 'addWord', (r, p) => {
    const st = LENGTHS[p.story !== undefined ? p.story : r.int(0, LENGTHS.length - 1)];
    let a = p.a, b = p.b;
    if (!a) { a = dec(r, r.int(1, 2), st.wa); b = dec(r, r.int(1, 2), st.wb); }
    const q = sumQuestion(a, b);
    return Object.assign(q, {
      sig: 'w' + st.unit + [a, b].sort().join('+'),
      prompt: st.t(a, b), visual: undefined,
      answerText: `${q.answer} ${st.unit}`,
      hints: ['"In all", "now" and "total" mean put the amounts together: add.', q.hints[1], q.hints[2]],
      why: `${a} + ${b} = <b>${q.answer} ${st.unit}</b>.`
    });
  });

  const remind = {
    addModel: `<p><b>Remember:</b> add hundredths to hundredths: 0.30 + 0.45 = 75 hundredths = 0.75. Ten tenths make one whole.</p>`,
    addAlign: `<p><b>Remember:</b> line up the decimal points, add from the right, and carry when a column makes ten or more.</p>${M.vertical(['3.48', '2.75'], '+', { answer: '6.23', carry: { 0: '1', 2: '1' } })}`,
    addMixed: '<p><b>Remember:</b> write zeros at the end so both numbers have the same number of places: 2.5 + 1.37 → 2.50 + 1.37. A whole number like 6 is 6.00.</p>',
    addEstimate: '<p><b>Remember:</b> round each number to the nearest whole number and add. The real answer should be close to that estimate.</p>',
    addWord: '<p><b>Remember:</b> words like "together", "in all" and "total" mean add. Line up the decimal points.</p>'
  };

  G.engine.register({
    lessonId: 'd06',
    skills: {
      addModel: 'Adding with models',
      addAlign: 'Lining up decimal points and regrouping',
      addMixed: 'Adding decimals with different numbers of places',
      addEstimate: 'Estimating to check a sum',
      addWord: 'Addition word problems'
    },
    plan: { addModel: 2, addAlign: 3, addMixed: 2, addEstimate: 1, addWord: 2 },
    practiceOnly: [],
    templates, remind
  });
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
