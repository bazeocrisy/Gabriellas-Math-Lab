// D10 Mixed Decimal Review — question bank.
// Cumulative review of the Grade 5 decimal standards (5.NR.4.1–4.4): verified question types from Lessons 1–7,
// plus new multi-step problems that combine skills. Supplemental Lessons 8–9 are not included.
(function (G) {
  'use strict';
  const D = G.D, K = G.kit;
  const { f, num, s, list, textChoices } = K;
  const templates = [];
  const T = (id, skill, make) => templates.push({ id, skill, make });

  /** A review question that reuses a template from an earlier lesson (same answer key, hints and feedback). */
  const reuse = (id, skill, lesson, src) => T(id, skill, (r, p) => {
    const q = G.engine.make(lesson, src, r.int(1, 2147483646), p);
    q.from = `${lesson}/${src}`;
    return q;
  });

  // Place value and reading decimals (Lessons 1–2).
  reuse('RP1', 'rvPlace', 'd02', 'V2'); // value of a digit
  reuse('RP2', 'rvPlace', 'd02', 'F3'); // expanded form
  reuse('RP3', 'rvPlace', 'd02', 'F4'); // word form to standard form
  reuse('RP4', 'rvPlace', 'd01', 'M9'); // thousandths model
  // Comparing and ordering (Lessons 3–4).
  reuse('RC1', 'rvCompare', 'd03', 'L1'); // symbols with different lengths
  reuse('RC2', 'rvCompare', 'd04', 'O1'); // order three decimals
  reuse('RC3', 'rvCompare', 'd03', 'Y1'); // explain a comparison
  reuse('RC4', 'rvCompare', 'd04', 'O3'); // order greatest to least
  // Rounding (Lesson 5).
  reuse('RR1', 'rvRound', 'd05', 'T1');
  reuse('RR2', 'rvRound', 'd05', 'H1');
  reuse('RR3', 'rvRound', 'd05', 'K1');
  reuse('RR4', 'rvRound', 'd05', 'K3'); // exactly halfway
  // Adding and subtracting (Lessons 6–7).
  reuse('RA1', 'rvAddSub', 'd06', 'MX1');
  reuse('RA2', 'rvAddSub', 'd07', 'SZ2');
  reuse('RA3', 'rvAddSub', 'd07', 'SW1');

  const dec2 = (r, minW, maxW) => num(r.int(minW, maxW) * 1000 + r.int(0, 9) * 100 + r.int(1, 9) * 10);
  const roundK = (k, unit) => Math.floor((k + unit / 2) / unit) * unit;
  const money = (v) => '$' + f(D.toThousandths(v), 2);

  // ───────────────────────── New: multi-step problems (rvMulti) ─────────────────────────

  T('X1', 'rvMulti', (r, p) => {
    let a = p.a, b = p.b;
    if (!a) for (;;) { a = dec2(r, 1, 20); b = dec2(r, 1, 20); const sk = D.toThousandths(a) + D.toThousandths(b); if (sk % 100 !== 0) break; } // the sum always has a hundredths digit to round
    const sum = num(D.toThousandths(a) + D.toThousandths(b));
    const ans = f(roundK(D.toThousandths(sum), 100), 1);
    return {
      type: 'number', places: 1, sig: [a, b].sort().join('+'),
      prompt: `Add <span class="expr">${a} + ${b}</span>. Then round the sum to the nearest <b>tenth</b>.`,
      answer: ans, answerText: ans,
      hints: [
        'This problem has two steps: first add, then round.',
        'Step 1: line up the decimal points and add. Write the exact sum.',
        'Step 2: round the sum to the nearest tenth. Look at its hundredths digit: five or more rounds up.'
      ],
      why: `Step 1: ${a} + ${b} = ${sum}. Step 2: ${sum} rounded to the nearest tenth is <b>${ans}</b>.`,
      diagnose(resp, info) {
        if (info.th === D.toThousandths(sum)) return 'That is the exact sum. Now do step 2: round it to the nearest tenth.';
        if (info.th === roundK(D.toThousandths(a), 100) + roundK(D.toThousandths(b), 100) && info.th !== roundK(D.toThousandths(sum), 100)) return 'That rounds each number first. The problem says to add first, then round the sum.';
        return `Add first (line up the decimal points), then round the sum to one decimal place.`;
      }
    };
  });

  T('X2', 'rvMulti', (r, p) => {
    let a = p.a, b = p.b, c = p.c;
    if (!a) for (;;) {
      a = num(r.int(1, 9) * 1000 + r.int(1, 9) * 100); b = dec2(r, 0, 5);
      const sk = D.toThousandths(a) + D.toThousandths(b);
      c = num(sk + r.pick([-90, -40, -10, 10, 40, 90, 0]));
      if (c !== num(sk) || r.next() < 0.4) break;
    }
    const sum = num(D.toThousandths(a) + D.toThousandths(b));
    const cmp = D.cmp(sum, c);
    const hs = (x) => (x === '<' ? '&lt;' : x === '>' ? '&gt;' : x);
    const ans = cmp < 0 ? '<' : cmp > 0 ? '>' : '=';
    return {
      type: 'mc', layout: 'symbols', sig: a + '+' + b + '?' + c,
      prompt: `Choose the symbol that makes this true: <span class="cmp">${a} + ${b} <span class="cmp-box" aria-label="blank">?</span> ${c}</span>`,
      choices: ['<', '>', '='].map((t) => ({ value: t, text: t, sr: { '<': 'is less than', '>': 'is greater than', '=': 'is equal to' }[t] })), answer: ans, answerText: `${a} + ${b} ${ans} ${c}`,
      hints: [
        'Two steps: work out the sum, then compare it with the other number.',
        `Step 1: add ${a} + ${b}, lining up the decimal points.`,
        'Step 2: compare the sum with the number on the right, place by place from the left.'
      ],
      why: `${a} + ${b} = ${sum}, and ${sum} ${hs(ans)} ${c}.`,
      diagnose(resp) {
        if (resp === '=' && ans !== '=') return 'The sum is not exactly equal. Add carefully, then compare each place.';
        return 'Work out the sum first, then compare it with the other number, starting with the biggest place.';
      }
    };
  });

  const ITEMS = [['a book', 'a pen'], ['a sandwich', 'a juice'], ['a puzzle', 'some stickers'], ['a ball', 'a water bottle']];
  T('X3', 'rvMulti', (r, p) => {
    const [i1, i2] = ITEMS[p.m !== undefined ? p.m : r.int(0, ITEMS.length - 1)];
    const paid = p.paid || String(r.pick([10, 20]));
    let a = p.a, b = p.b;
    if (!a) for (;;) { a = dec2(r, 1, 8); b = dec2(r, 0, 5); if (D.toThousandths(a) + D.toThousandths(b) < Number(paid) * 1000 - 200) break; }
    const spent = num(D.toThousandths(a) + D.toThousandths(b));
    const ans = num(Number(paid) * 1000 - D.toThousandths(spent));
    return {
      type: 'number', sig: paid + ':' + [a, b].sort().join('+'),
      prompt: `Maya has <b>$${paid}</b>. She buys ${i1} for <b>${money(a)}</b> and ${i2} for <b>${money(b)}</b>. How much money does she have <b>left</b>?`,
      answer: ans, answerText: money(ans),
      hints: [
        'This takes two steps: find how much she spends, then how much is left.',
        `Step 1: add the two prices, ${money(a)} + ${money(b)}.`,
        `Step 2: subtract the total from $${paid}.00. Regroup across the zeros if you need to.`
      ],
      why: `Step 1: ${money(a)} + ${money(b)} = ${money(spent)}. Step 2: $${paid}.00 − ${money(spent)} = <b>${money(ans)}</b>.`,
      diagnose(resp, info) {
        if (info.th === D.toThousandths(spent)) return 'That is how much she spends. The question asks how much is LEFT: subtract that from her money.';
        if (info.th === Number(paid) * 1000 - D.toThousandths(a) || info.th === Number(paid) * 1000 - D.toThousandths(b)) return 'That subtracts only one of the prices. She buys both things.';
        return `Add both prices first, then subtract the total from $${paid}.00.`;
      }
    };
  });

  T('X4', 'rvMulti', (r, p) => {
    let a = p.a, b = p.b;
    if (!a) for (;;) { a = dec2(r, 2, 12); b = dec2(r, 1, 9); if (D.cmp(a, b) > 0) break; }
    const diff = num(D.toThousandths(a) - D.toThousandths(b));
    const dg = D.parse(f(D.toThousandths(diff), 2)).frac;
    const place = p.place || r.pick(['tenths', 'hundredths']);
    const ans = place === 'tenths' ? dg[0] : dg[1];
    const other = place === 'tenths' ? dg[1] : dg[0];
    const nb = D.parse(f(D.toThousandths(K.noBorrowSub(a, b)), 2)).frac;
    const flip = place === 'tenths' ? nb[0] : nb[1];
    const pool = [other, flip, String((Number(ans) + 1) % 10), String((Number(ans) + 9) % 10)];
    const wrongDigits = [...new Set(pool)].filter((d) => d !== ans).slice(0, 3);
    return {
      type: 'mc', sig: a + '-' + b + place,
      prompt: `Subtract <span class="expr">${a} − ${b}</span>. Which digit is in the <b>${place}</b> place of the answer?`,
      choices: textChoices(r, ans, wrongDigits),
      answer: ans, answerText: ans,
      hints: [
        'Two steps: subtract, then find the place in your answer.',
        'Step 1: line up the decimal points and subtract, regrouping when you need to.',
        `Step 2: in your answer, the tenths are the first digit after the decimal point and the hundredths the second.`
      ],
      why: `${a} − ${b} = ${f(D.toThousandths(diff), 2)}, so the ${place} digit is <b>${ans}</b>.`,
      diagnose(resp) {
        if (resp === other && other !== flip) return `That is the digit in the ${place === 'tenths' ? 'hundredths' : 'tenths'} place. Tenths are the first digit after the decimal point; hundredths are the second.`;
        if (resp === flip) return 'It looks like a column was flipped instead of regrouped. When the top digit is smaller, take one from the next place to the left.';
        return 'Subtract carefully (check by adding), then count places from the decimal point in your answer.';
      }
    };
  });

  const remind = {
    rvPlace: '<p><b>Remember:</b> the place is where a digit is; the value is what it is worth. In 4.735 the 7 is worth 0.7. Expanded form: 4 + 0.7 + 0.03 + 0.005.</p>',
    rvCompare: '<p><b>Remember:</b> line up the decimal points, write zeros so numbers have the same number of places, and compare from the left.</p>',
    rvRound: '<p><b>Remember:</b> the digit to the right of the rounding place decides: five or more rounds up. 2.96 → 3.0.</p>',
    rvAddSub: '<p><b>Remember:</b> line up the decimal points, write zeros to fill empty places, and regroup when you need to. Check subtraction by adding.</p>',
    rvMulti: '<p><b>Remember:</b> read the whole problem, decide the steps, do them one at a time, and check that the answer makes sense.</p>'
  };

  G.engine.register({
    lessonId: 'd10',
    skills: {
      rvPlace: 'Place value, forms and models (Lessons 1–2)',
      rvCompare: 'Comparing and ordering (Lessons 3–4)',
      rvRound: 'Rounding (Lesson 5)',
      rvAddSub: 'Adding and subtracting (Lessons 6–7)',
      rvMulti: 'Multi-step problems'
    },
    plan: { rvPlace: 2, rvCompare: 2, rvRound: 2, rvAddSub: 2, rvMulti: 2 },
    practiceOnly: [],
    templates, remind
  });
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
