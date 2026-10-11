// D09 Dividing Decimals — question bank. SUPPLEMENTAL: Georgia's Grade 5 standards do not include dividing
// decimals; this lesson extends 5.NR.1.2 (patterns when dividing by powers of 10) and 5.NR.2.2 (whole-number
// division). Divisors are whole numbers; every quotient is exact and has at most two decimal places
// (three for ÷ 10, 100, 1000).
(function (G) {
  'use strict';
  const D = G.D, M = G.models, K = G.kit;
  const { f, num, s, list, cap, textChoices } = K;
  const templates = [];
  const T = (id, skill, make) => templates.push({ id, skill, make });

  const WORD = ['zero', 'one', 'two', 'three', 'four'];
  const ws = (n, w) => WORD[n] + ' ' + w + (n === 1 ? '' : 's');
  const places = (x) => D.parse(x).places;
  const digitsOnly = (x) => String(Number(x.replace('.', '')));
  const FACT = [10, 100, 1000];
  /** A division a ÷ n with an exact quotient q (q has 1 or 2 decimal places); built from q × n. */
  function exactDiv(r, opts = {}) {
    for (;;) {
      const n = opts.n || r.int(2, 9);
      const qp = opts.qp || r.int(1, 2);
      const w = opts.small ? 0 : r.int(0, 9);
      let fr = qp === 1 ? r.int(1, 9) : r.int(1, 99);
      if (qp === 2 && fr % 10 === 0) fr += 1;
      const qk = w * 1000 + fr * (qp === 1 ? 100 : 10);
      const ak = qk * n;
      if (ak % 10 !== 0) continue; // dividend within hundredths
      if (opts.small && qk >= 1000) continue;
      const A = D.parse(num(ak));
      if (A.places === 0 || A.places < qp) continue; // no zeros need to be written onto the dividend
      if (opts.decimalA && num(ak).indexOf('.') < 0) continue;
      if (opts.aPlaces && D.parse(num(ak)).places !== opts.aPlaces) continue;
      return { a: num(ak), n, q: num(qk) };
    }
  }

  // ───────────────────────── Skill: ÷ 10, 100, 1000 (dPow) ─────────────────────────

  T('P1', 'dPow', (r, p) => {
    let x = p.x, fac = p.f;
    if (!x) for (;;) {
      fac = r.pick(FACT);
      const shift = String(fac).length - 1;
      x = r.next() < 0.5 ? String(r.int(2, 999)) : num(r.int(1, 99) * 1000 + r.int(1, 9) * 100);
      if (places(x) + shift <= 3 && x !== '0') break;
    }
    const shift = String(fac).length - 1;
    const k = D.toThousandths(x), ans = num(k / fac);
    return {
      type: 'number', sig: x + '/' + fac,
      prompt: `Divide: <span class="expr">${x} ÷ ${fac}</span>`,
      answer: ans, answerText: ans,
      hints: [
        'Dividing by 10 makes every digit worth one tenth as much, so each digit moves one place to the RIGHT.',
        `${fac} has ${ws(shift, 'zero')}, so every digit moves ${ws(shift, 'place')} to the right (the decimal point seems to move ${WORD[shift]} to the left).`,
        `Move every digit ${ws(shift, 'place')} to the right. Write zeros to fill empty places between the decimal point and the digits.`
      ],
      why: `÷ ${fac} moves each digit ${s(shift, 'place')} to the right: ${x} ÷ ${fac} = <b>${ans}</b>.`,
      diagnose(resp, info) {
        if (info.th === k) return `That is the number you started with. Dividing by ${fac} moves every digit ${ws(shift, 'place')} to the right.`;
        if (info.th === k * fac) return 'That multiplied instead. Dividing by 10, 100 or 1000 makes the number SMALLER: the digits move to the right.';
        if (fac >= 100 && info.th === k * 10 / fac) return `That moved the digits one place too few. ${fac} has ${ws(shift, 'zero')}, so move ${ws(shift, 'place')}.`;
        if (info.th * 10 === k / fac) return 'That moved the digits one place too far.';
        return `Each digit moves ${ws(shift, 'place')} to the right. Write ${x} in a place-value chart and shift it.`;
      }
    };
  });

  T('P2', 'dPow', (r, p) => {
    let x = p.x, fac = p.f;
    if (!x) for (;;) { fac = r.pick(FACT); x = num(r.int(1, 99) * 1000 + (r.next() < 0.5 ? r.int(1, 9) * 100 : 0)); if (places(x) + String(fac).length - 1 <= 3) break; }
    const k = D.toThousandths(x), ans = num(k / fac);
    const pool = [num(k * fac), num(k / fac * 10)];
    if (Number.isInteger(k / fac / 10)) pool.push(num(k / fac / 10)); else pool.push(x);
    const wrongs = [...new Set(pool)].filter((y) => y !== ans).slice(0, 3);
    return {
      type: 'mc', sig: x + '/' + fac,
      prompt: `What is <b>${x} ÷ ${fac}</b>?`,
      choices: textChoices(r, ans, wrongs), answer: ans, answerText: ans,
      hints: [
        `Dividing by ${fac} makes a number smaller, so the answer is less than ${x}.`,
        `Count the zeros in ${fac}. That is how many places each digit moves to the right.`,
        'Move the digits that many places. Then pick the choice that matches.'
      ],
      why: `${fac} has ${s(String(fac).length - 1, 'zero')}, so each digit of ${x} moves ${s(String(fac).length - 1, 'place')} right: <b>${ans}</b>.`,
      diagnose(resp) {
        const v = D.toThousandths(resp);
        if (v >= k) return `That is not smaller than ${x}. Dividing by ${fac} makes a number smaller.`;
        return v > k / fac ? `That moved the digits too few places. ${fac} has ${s(String(fac).length - 1, 'zero')}.` : `That moved the digits too many places. ${fac} has ${s(String(fac).length - 1, 'zero')}.`;
      }
    };
  });

  T('P3', 'dPow', (r, p) => {
    const op = p.op || r.pick(['×', '÷']);
    const fac = p.f || r.pick(FACT);
    const shift = String(fac).length - 1;
    const dir = op === '×' ? 'left' : 'right';
    const ans = `Every digit moves ${ws(shift, 'place')} to the ${dir}.`;
    const other = op === '×' ? 'right' : 'left';
    const wrongs = [`Every digit moves ${ws(shift, 'place')} to the ${other}.`, `Every digit moves ${ws(shift === 1 ? 2 : shift - 1, 'place')} to the ${dir}.`, 'A zero is written at the end, and the digits stay where they are.'];
    return {
      type: 'mc', sig: op + fac,
      prompt: `What happens to the digits of a decimal when you <b>${op === '×' ? 'multiply' : 'divide'} by ${fac}</b>?`,
      choices: textChoices(r, ans, wrongs), answer: ans, answerText: ans,
      hints: [
        op === '×' ? 'Multiplying by 10 makes each digit worth 10 times as much.' : 'Dividing by 10 makes each digit worth one tenth as much.',
        'Places to the left are worth more; places to the right are worth less.',
        `Count the zeros in ${fac} to know how many places the digits move.`
      ],
      why: `${op === '×' ? 'Multiplying' : 'Dividing'} by ${fac} moves every digit ${ws(shift, 'place')} to the ${dir}. For example, 45 ${op} ${fac} = ${op === '×' ? num(45000 * fac) : num(45000 / fac)}.`,
      diagnose(resp) {
        if (/zero is written/.test(resp)) return 'Writing a zero at the end of a decimal does not change its value. The digits must move.';
        if (resp.includes(other)) return `${op === '×' ? 'Multiplying makes a number bigger' : 'Dividing makes a number smaller'}, so check the direction.`;
        return `Count the zeros in ${fac}: that is the number of places.`;
      }
    };
  });

  // ───────────────────────── Skill: sharing with models (dModel) ─────────────────────────

  T('M1', 'dModel', (r, p) => {
    let t = p.t, n = p.n;
    if (!t) for (;;) { n = r.int(2, 6); const g = r.int(1, 6); t = g * n; if (t <= 18 && t !== 10) break; }
    const a = f(t * 100, 1), ans = f(t / n * 100, 1);
    return {
      type: 'number', sig: t + '/' + n,
      prompt: `${t > 10 ? 'Each bar is one whole. The bars show' : 'The bar shows'} <b>${a}</b>. Share it equally into <b>${n} groups</b>. What is <span class="expr">${a} ÷ ${n}</span>?`,
      visual: t > 10 ? `<div class="bar-stack">${M.strip(10)}${M.strip(t - 10)}</div>` : M.strip(t), answer: ans, answerText: ans,
      hints: [
        `${a} ÷ ${n} means sharing ${a} equally into ${n} groups.`,
        `${a} is ${s(t, 'tenth')}. Share the ${t} shaded tenths into ${n} equal groups.`,
        'Count how many tenths go in each group. Write that many tenths as a decimal.'
      ],
      why: `${t} tenths shared into ${n} groups is ${s(t / n, 'tenth')} each: ${a} ÷ ${n} = <b>${ans}</b>.`,
      diagnose(resp, info) {
        if (info.th === t / n * 10) return `That is ${t / n} hundredths. The pieces are tenths, so each group gets ${t / n === 1 ? 'one tenth' : 'that many tenths'}, written with one decimal place.`;
        if (info.th === t * n * 100) return 'That multiplied. Sharing into groups makes each group smaller: divide.';
        return `Share the ${t} tenths into ${n} equal groups and count the tenths in one group.`;
      }
    };
  });

  T('M2', 'dModel', (r, p) => {
    let k = p.k, n = p.n;
    if (!k) for (;;) { n = r.int(2, 6); const g = r.int(2, 16); k = g * n; if (k < 100 && k % 10 && g % 10) break; }
    const a = f(k * 10, 2), ans = num(k / n * 10);
    return {
      type: 'number', sig: k + '/' + n,
      prompt: `The grid shows <b>${a}</b>. Share it equally into <b>${n} groups</b>. What is <span class="expr">${a} ÷ ${n}</span>?`,
      visual: M.grid(k), answer: ans, answerText: ans,
      hints: [
        'Each small square is one hundredth.',
        `${a} is ${k} hundredths. Share the ${k} squares into ${n} equal groups.`,
        `Divide the number of squares by ${n}, and write that many hundredths as a decimal.`
      ],
      why: `${k} hundredths ÷ ${n} = ${k / n} hundredths, so ${a} ÷ ${n} = <b>${ans}</b>.`,
      diagnose(resp, info) {
        if (info.th === k / n * 100) return `That is ${k / n} tenths. The squares are hundredths, so the answer is ${k / n} hundredths.`;
        return `Share the ${k} hundredths into ${n} groups: how many hundredths in each?`;
      }
    };
  });

  // ───────────────────────── Skill: decimal ÷ whole number (dWhole) ─────────────────────────

  function divQuestion(a, n, q, extra = {}) {
    const qp = places(q);
    return Object.assign({
      type: 'number', sig: a + '/' + n,
      prompt: `Divide: <span class="expr">${a} ÷ ${n}</span>`,
      answer: q, answerText: q,
      hints: [
        `Divide as you would with whole numbers, and keep the decimal point in the quotient straight above the decimal point in ${a}.`,
        `Start with the whole-number part of ${a}. How many groups of ${n} fit in it? Write that above it (write 0 if none fit).`,
        'Then bring down the next digit after the decimal point and keep dividing, one digit at a time. Check by multiplying your answer by ' + n + '.'
      ],
      why: `${a} is ${digitsOnly(a)} ${places(a) === 1 ? 'tenths' : 'hundredths'}, and ${digitsOnly(a)} ÷ ${n} = ${Number(digitsOnly(a)) / n}, so ${a} ÷ ${n} = <b>${q}</b> (the decimal point stays straight above). Check: ${q} × ${n} = ${a}.`,
      diagnose(resp, info) {
        const qk = D.toThousandths(q);
        if (info.th === qk * 10 || info.th === qk * 100 || info.th * 10 === qk) return 'The digits are right, but the decimal point is in the wrong place. In the quotient it goes straight above the decimal point in the number you are dividing.';
        if (info.th === D.toThousandths(a) * n) return 'That multiplied. This problem asks you to divide.';
        if (info.th !== null && info.th * n === D.toThousandths(a) + n * 10) return 'Very close! Check your last step by multiplying your answer by ' + n + '.';
        return `Divide one place at a time, keeping the decimal point lined up. Then check: your answer × ${n} should equal ${a}.`;
      }
    }, extra);
  }

  T('W1', 'dWhole', (r, p) => {
    const { a, n, q } = p.a ? { a: p.a, n: p.n, q: num(D.toThousandths(p.a) / p.n) } : exactDiv(r, { qp: r.int(1, 2) });
    return divQuestion(a, n, q);
  });

  T('W2', 'dWhole', (r, p) => {
    const { a, n, q } = p.a ? { a: p.a, n: p.n, q: num(D.toThousandths(p.a) / p.n) } : exactDiv(r, { small: true, qp: r.int(1, 2), decimalA: true });
    return divQuestion(a, n, q, {
      sig: 'z' + a + '/' + n,
      hints: [
        `${a} is less than ${n}, so the answer is less than 1. It starts with 0 and a decimal point.`,
        `Think of ${a} as ${digitsOnly(a)} ${places(a) === 1 ? 'tenths' : 'hundredths'}. Divide ${digitsOnly(a)} by ${n}.`,
        `Your answer is that many ${places(a) === 1 ? 'tenths' : 'hundredths'}. Write it as a decimal, using a zero to hold the tenths place if needed.`
      ]
    });
  });

  T('W3', 'dWhole', (r, p) => {
    let a = p.a, n = p.n;
    if (!a) for (;;) { const e = exactDiv(r, { qp: 2, aPlaces: 2 }); if (D.toThousandths(e.q) >= 1000) { a = e.a; n = e.n; break; } }
    const q = num(D.toThousandths(a) / n);
    const whole = Number(digitsOnly(a)) / n;
    const P = places(a);
    const cands = [0, 1, 2, 3].filter((k) => k !== P).map((k) => num(whole * Math.pow(10, 3 - k)));
    return {
      type: 'mc', sig: a + '/' + n,
      prompt: `${digitsOnly(a)} ÷ ${n} = ${whole}. Use this to find <b>${a} ÷ ${n}</b>.`,
      choices: textChoices(r, q, [...new Set(cands)].filter((x) => x !== q && D.toThousandths(x) !== null).slice(0, 3)), answer: q, answerText: q,
      hints: [
        'The digits of the answer are the same. Only the decimal point is different.',
        `When you divide by a whole number, the decimal point in the answer goes straight above the decimal point in ${a}.`,
        `Check by estimating: ${a} ÷ ${n} should be about ${Math.round(D.toThousandths(a) / 1000)} ÷ ${n}.`
      ],
      why: `The decimal point stays in the same place as in ${a}: ${a} ÷ ${n} = <b>${q}</b>. Check: ${q} × ${n} = ${a}.`,
      diagnose(resp) { return `Check it by multiplying: ${resp} × ${n} is not ${a}. Keep the decimal point above the decimal point in ${a}.`; }
    };
  });

  // ───────────────────────── Skill: check the answer (dCheck) ─────────────────────────

  T('C1', 'dCheck', (r, p) => {
    const { a, n, q } = p.a ? { a: p.a, n: p.n, q: num(D.toThousandths(p.a) / p.n) } : exactDiv(r, {});
    const right = `${q} × ${n} = ${a}`;
    const wrongs = [`${a} × ${n} = ${num(D.toThousandths(a) * n)}`, `${q} + ${n} = ${num(D.toThousandths(q) + n * 1000)}`, `${a} − ${q} = ${num(D.toThousandths(a) - D.toThousandths(q))}`];
    return {
      type: 'mc', sig: a + '/' + n,
      prompt: `${a} ÷ ${n} = ${q}. Which multiplication <b>checks</b> this answer?`,
      choices: textChoices(r, right, wrongs), answer: right, answerText: right,
      hints: [
        'Multiplication and division undo each other.',
        `If ${n} equal groups of ${q} make ${a}, the division is right.`,
        `So multiply the answer (${q}) by the number you divided by (${n}).`
      ],
      why: `${n} groups of ${q} make ${a}: ${q} × ${n} = ${a}, so ${a} ÷ ${n} = ${q} is right.`,
      diagnose(resp) {
        if (resp.includes('+')) return 'A division is checked with multiplication, not addition.';
        if (resp.includes('−')) return 'A division is checked with multiplication, not subtraction.';
        return 'Multiply the ANSWER by the number you divided by, not the starting number.';
      }
    };
  });

  T('C2', 'dCheck', (r, p) => {
    const { a, n, q } = p.a ? { a: p.a, n: p.n, q: num(D.toThousandths(p.a) / p.n) } : exactDiv(r, { qp: 1 });
    const qk = D.toThousandths(q);
    const wrong = num(qk * 10);
    const claimRight = p.claim !== undefined ? p.claim === 'right' : r.next() < 0.4;
    const said = claimRight ? q : wrong;
    const back = num(D.toThousandths(said) * n);
    const name = p.name || r.pick(['Ava', 'Leo', 'Mia', 'Sam', 'Eli']);
    const ans = claimRight ? `Yes. ${said} × ${n} = ${a}.` : `No. ${said} × ${n} = ${back}, not ${a}.`;
    const wrongs = claimRight
      ? [`No. ${said} × ${a} should be ${n}.`, `No. The answer must be bigger than ${a}.`, `Yes, because ${said} has one decimal place.`]
      : [`Yes, because ${said} has the same digits as ${q}.`, `Yes, because division answers are always bigger.`, `No. The answer must be bigger than ${a}.`];
    return {
      type: 'mc', sig: a + '/' + n + (claimRight ? 'r' : 'w'),
      prompt: `${name} worked out <span class="expr">${a} ÷ ${n}</span> and got <b>${said}</b>. Check by multiplying. Is ${name} right?`,
      choices: textChoices(r, ans, [...new Set(wrongs)].filter((t) => t !== ans)), answer: ans, answerText: ans,
      hints: [
        'To check a division, multiply the answer by the number you divided by.',
        `Work out ${said} × ${n}.`,
        `If the product is ${a}, the answer is right.`
      ],
      why: `${said} × ${n} = ${back}. ${claimRight ? 'That matches, so the answer is right.' : `That is not ${a}, so the answer is wrong. The correct answer is ${q}.`}`,
      diagnose(resp) {
        if (/bigger/.test(resp)) return 'Dividing by a whole number bigger than 1 makes a number smaller, not bigger.';
        return `Multiply ${said} by ${n} and compare with ${a}.`;
      }
    };
  });

  // ───────────────────────── Skill: word problems (dWord) ─────────────────────────

  T('K1', 'dWord', (r, p) => {
    let a = p.a, n = p.n;
    if (!a) for (;;) { n = r.int(2, 6); const qk = r.int(1, 20) * 1000 + r.int(0, 99) * 10; const ak = qk * n; if (qk % 1000 && ak <= 60000 && D.parse(num(ak)).places >= D.parse(num(qk)).places) { a = num(ak); break; } }
    const q = num(D.toThousandths(a) / n);
    const money = (v) => '$' + f(D.toThousandths(v), 2);
    const qq = divQuestion(a, n, q);
    return Object.assign(qq, {
      sig: 'share' + a + '/' + n,
      prompt: `${n} friends share <b>${money(a)}</b> equally. How much does each friend get?`,
      answerText: money(q),
      hints: [`"Share equally" means divide: ${money(a)} ÷ ${n}.`, `Start with the whole dollars in ${money(a)}. How many groups of ${n} fit? Write that, then the decimal point straight above the one in ${money(a)}.`, `Then share the dimes (tenths) and the cents (hundredths), one place at a time. Check by multiplying your answer by ${n}.`],
      why: `${money(a)} ÷ ${n} = <b>${money(q)}</b>. Check: ${money(q)} × ${n} = ${money(a)}.`
    });
  });

  T('K2', 'dWord', (r, p) => {
    const { a, n, q } = p.a ? { a: p.a, n: p.n, q: num(D.toThousandths(p.a) / p.n) } : exactDiv(r, { qp: 1, small: r.next() < 0.5 });
    const qq = divQuestion(a, n, q);
    return Object.assign(qq, {
      sig: 'cut' + a + '/' + n,
      prompt: `A ribbon is <b>${a} m</b> long. It is cut into <b>${n} equal pieces</b>. How long is each piece?`,
      answerText: `${q} m`,
      hints: [`Cutting into equal pieces means divide: ${a} ÷ ${n}.`, qq.hints[1], qq.hints[2]],
      why: `${a} ÷ ${n} = <b>${q} m</b>. Check: ${q} × ${n} = ${a}.`
    });
  });

  const remind = {
    dPow: '<p><b>Remember:</b> ÷ 10, ÷ 100, ÷ 1000 move every digit 1, 2 or 3 places to the right. 45 ÷ 100 = 0.45.</p>',
    dModel: '<p><b>Remember:</b> dividing is sharing equally. 0.8 ÷ 4: 8 tenths shared into 4 groups is 2 tenths each = 0.2.</p>',
    dWhole: '<p><b>Remember:</b> divide like whole numbers and keep the decimal point in the answer straight above the decimal point in the number you divide.</p>',
    dCheck: '<p><b>Remember:</b> check a division by multiplying: answer × the number you divided by = the starting number.</p>',
    dWord: '<p><b>Remember:</b> "share equally", "split", "cut into equal pieces" and "each" (with a total) mean divide.</p>'
  };

  G.engine.register({
    lessonId: 'd09',
    skills: {
      dPow: 'Dividing by 10, 100 and 1000',
      dModel: 'Sharing decimals with models',
      dWhole: 'A decimal divided by a whole number',
      dCheck: 'Checking a quotient by multiplying',
      dWord: 'Division word problems'
    },
    plan: { dPow: 2, dModel: 2, dWhole: 3, dCheck: 1, dWord: 2 },
    practiceOnly: [],
    templates, remind
  });
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
