// D08 Multiplying Decimals — question bank. SUPPLEMENTAL: Georgia's Grade 5 standards do not include multiplying
// decimals; this lesson extends 5.NR.1.2 (patterns when multiplying by powers of 10) and 5.NR.2.1 (whole-number
// multiplication). All products are exact and stay within thousandths.
(function (G) {
  'use strict';
  const D = G.D, M = G.models, K = G.kit;
  const { f, num, s, list, cap, textChoices } = K;
  const templates = [];
  const T = (id, skill, make) => templates.push({ id, skill, make });

  const times = (x, n) => num(D.toThousandths(x) * n); // decimal × whole number
  /** Product of two decimals with at most 3 places in all, using whole-number digits (exact). */
  function mul(a, b) {
    const x = D.parse(a), y = D.parse(b);
    const ia = Number(x.whole + x.frac), ib = Number(y.whole + y.frac), P = x.places + y.places;
    if (P > 3) throw new Error('too many places');
    return num(ia * ib * Math.pow(10, 3 - P));
  }
  const places = (x) => D.parse(x).places;
  const digitsOnly = (x) => String(Number(x.replace('.', '')));
  const roundWhole = (x) => Math.floor((D.toThousandths(x) + 500) / 1000);
  /** A friendly estimate of x × n: round x to a whole number, or to a tenth when x is less than 1. */
  const estimate = (x, n) => { const k = D.toThousandths(x); const r = k >= 500 ? Math.floor((k + 500) / 1000) * 1000 : Math.floor((k + 50) / 100) * 100; return num(Math.max(100, r) * n); };
  /** Words for the estimate in feedback; a range when the estimate would equal the exact answer. */
  const estPhrase = (x, n) => { const e = estimate(x, n), exact = num(D.toThousandths(x) * n); const k = D.toThousandths(x); return D.equal(e, exact) ? `between ${Math.floor(k / 1000) * n} and ${Math.ceil(k / 1000 + 0.0001) * n}` : `about ${e}`; };
  /** The product written with all its counted decimal places, then simplified if that changes it: '0.20 = 0.2'. */
  const full = (ans, P) => { const w = f(D.toThousandths(ans), P); return w === ans ? `<b>${ans}</b>` : `${w} = <b>${ans}</b>`; };
  const roundFriendly = (x) => { const k = D.toThousandths(x); return k >= 500 ? String(Math.floor((k + 500) / 1000)) : num(Math.max(100, Math.floor((k + 50) / 100) * 100)); };
  const FACT = [10, 100, 1000];
  const WORD = ['zero', 'one', 'two', 'three', 'four'];
  const ws = (n, w) => WORD[n] + ' ' + w + (n === 1 ? '' : 's');
  /** True when the product is a small whole number (like 0.5 × 2 = 1); generated questions skip these. */
  const smallWhole = (th) => th % 1000 === 0 && th < 10000;
  /** A decimal with 'pl' decimal places (last digit not 0) and a whole part from 0 to maxW. */
  function decimal(r, pl, maxW) {
    const w = r.int(0, maxW);
    let fr = r.int(1, Math.pow(10, pl) - 1);
    if (fr % 10 === 0) fr += 1;
    return num(w * 1000 + fr * Math.pow(10, 3 - pl));
  }

  // ───────────────────────── Skill: × 10, 100, 1000 (mPow) ─────────────────────────

  T('P1', 'mPow', (r, p) => {
    const fac = p.f || r.pick(FACT);
    let x = p.x;
    if (!x) x = decimal(r, r.int(1, 3), 9);
    const ans = times(x, fac), shift = String(fac).length - 1;
    return {
      type: 'number', sig: x + '*' + fac,
      prompt: `Multiply: <span class="expr">${x} × ${fac}</span>`,
      answer: ans, answerText: ans,
      hints: [
        'Multiplying by 10 makes every digit worth 10 times as much, so each digit moves one place to the LEFT.',
        `${fac} has ${ws(shift, 'zero')}, so every digit moves ${ws(shift, 'place')} to the left (the decimal point seems to move ${WORD[shift]} to the right).`,
        `Move every digit ${ws(shift, 'place')} to the left. If you run out of digits, write zeros to fill the empty places.`
      ],
      why: `× ${fac} moves each digit ${s(shift, 'place')} to the left: ${x} × ${fac} = <b>${ans}</b>.`,
      diagnose(resp, info) {
        const k = D.toThousandths(x);
        if (info.th === k) return `That is the number you started with. Multiplying by ${fac} moves every digit ${ws(shift, 'place')} to the left.`;
        if (fac >= 100 && info.th === k * fac / 10) return `That moved the digits one place too few. ${fac} has ${ws(shift, 'zero')}, so move ${ws(shift, 'place')}.`;
        if (info.th === k * fac * 10) return `That moved the digits too far. ${fac} has ${s(shift, 'zero')}, so move ${s(shift, 'place')}.`;
        if (fac > 1 && D.toThousandths(x) % fac === 0 && info.th === k / fac) return 'That moved the digits to the right, which makes the number smaller. Multiplying by 10, 100 or 1000 makes it bigger.';
        if (info.value && info.value.frac === D.parse(x).frac + '0'.repeat(shift)) return 'Writing zeros at the end of a decimal does not change its value. The digits themselves must move to the left.';
        return `Each digit moves ${s(shift, 'place')} to the left. Try writing ${x} in a place-value chart and shifting it.`;
      }
    };
  });

  T('P2', 'mPow', (r, p) => {
    let x = p.x, fac = p.f;
    if (!x) { fac = r.pick(FACT); x = decimal(r, r.int(1, 2), 9); }
    const k = D.toThousandths(x);
    const ans = num(k * fac);
    const pool = [num(k * fac / 10), num(k * fac * 10)];
    if (Number.isInteger(k / fac)) pool.push(num(k / fac)); else pool.push(num(k * fac * 100));
    const wrongs = [...new Set(pool)].filter((y) => y !== ans).slice(0, 3);
    return {
      type: 'mc', sig: x + '*' + fac,
      prompt: `What is <b>${x} × ${fac}</b>?`,
      choices: textChoices(r, ans, wrongs), answer: ans, answerText: ans,
      hints: [
        'Multiplying by 10, 100 or 1000 makes a number bigger, so the answer is greater than ' + x + '.',
        `Count the zeros in ${fac}. That is how many places each digit moves to the left.`,
        'Move the digits that many places. Then pick the choice that matches.'
      ],
      why: `${fac} has ${s(String(fac).length - 1, 'zero')}, so each digit of ${x} moves ${s(String(fac).length - 1, 'place')} left: <b>${ans}</b>.`,
      diagnose(resp) {
        const v = D.toThousandths(resp);
        if (v < k) return 'That is smaller than ' + x + '. Multiplying by ' + fac + ' makes a number bigger.';
        return v < k * fac ? `That moved the digits too few places. ${fac} has ${s(String(fac).length - 1, 'zero')}.` : `That moved the digits too many places. ${fac} has ${s(String(fac).length - 1, 'zero')}.`;
      }
    };
  });

  // ───────────────────────── Skill: decimal × whole number (mWhole) ─────────────────────────

  T('W1', 'mWhole', (r, p) => {
    let a = p.a, n = p.n;
    while (!a || (p.a === undefined && smallWhole(D.toThousandths(a) * n))) { a = decimal(r, r.int(1, 2), 9); n = r.int(2, 9); }
    const ans = times(a, n);
    const pl = places(a);
    return {
      type: 'number', sig: a + '*' + n,
      prompt: `Multiply: <span class="expr">${a} × ${n}</span>`,
      answer: ans, answerText: ans,
      hints: [
        `Estimate first: round ${a} to ${D.toThousandths(a) >= 500 ? 'the nearest whole number' : 'the nearest tenth'} and multiply by ${n}.`,
        `Multiply as if there were no decimal point: ${digitsOnly(a)} × ${n}.`,
        `${a} has ${ws(pl, 'decimal place')}, so the answer needs ${ws(pl, 'decimal place')} too. Put the point in, then check it is close to your estimate.`
      ],
      why: `${digitsOnly(a)} × ${n} = ${Number(digitsOnly(a)) * n}. ${a} has ${s(pl, 'decimal place')}, so ${a} × ${n} = ${full(ans, pl)} (about ${roundFriendly(a)} × ${n} = ${estimate(a, n)}).`,
      diagnose(resp, info) {
        const whole = Number(digitsOnly(a)) * n * 1000;
        if (info.th === whole) return `That is ${digitsOnly(a)} × ${n} without the decimal point. ${a} has ${s(pl, 'decimal place')}, so the answer needs ${pl === 1 ? 'one' : pl}.`;
        if (info.th === whole / 10 || info.th === whole / 100 || info.th === whole / 1000) return `The digits are right, but the decimal point is in the wrong place. Use an estimate to check: the answer should be ${estPhrase(a, n)}.`;
        if (info.th === D.toThousandths(a) + n * 1000) return 'That adds the two numbers. This problem asks you to multiply.';
        return `Multiply ${digitsOnly(a)} × ${n} first, then place the decimal point so the answer is ${estPhrase(a, n)}.`;
      }
    };
  });

  T('W2', 'mWhole', (r, p) => {
    const t = p.t || r.int(2, 8), n = p.n || r.int(2, 4);
    const a = f(t * 100, 1), ans = num(t * n * 100);
    return {
      type: 'number', sig: t + '*' + n,
      prompt: `Each bar is one whole. There are <b>${n} bars</b>, each with <b>${a}</b> shaded. What is <span class="expr">${a} × ${n}</span>?`,
      visual: `<div class="bar-stack">${Array.from({ length: n }, () => M.strip(t)).join('')}</div>`,
      answer: ans, answerText: ans,
      hints: [
        `${a} × ${n} means ${n} groups of ${a}: add ${a} ${n} times.`,
        `${a} is ${s(t, 'tenth')}, so ${n} groups make ${n} × ${t} tenths.`,
        'Count all the shaded tenths. Ten tenths make one whole.'
      ],
      why: `${n} × ${t} tenths = ${t * n} tenths = <b>${ans}</b>.`,
      diagnose(resp, info) {
        if (info.th === t * n * 10) return `That is ${t * n} hundredths. These are tenths: ${t * n} tenths${t * n >= 10 ? ', and ten tenths make one whole' : ''}.`;
        if (info.th === (t + n) * 100 || info.th === t * 100 + n * 1000) return 'That adds instead of multiplying. Count the shaded tenths in all the bars.';
        return `Count the shaded tenths in all ${n} bars, then write that many tenths as a decimal.`;
      }
    };
  });

  T('W3', 'mWhole', (r, p) => {
    const a = p.a || f(r.int(2, 9) * 100, 1), n = p.n || r.int(3, 5);
    const ans = Array(n).fill(a).join(' + ');
    const wrongs = [`${a} + ${n}`, Array(n).fill(digitsOnly(a)).join(' + '), Array(n - 1).fill(a).join(' + ')];
    return {
      type: 'mc', sig: a + '*' + n,
      prompt: `Which is the same as <b>${a} × ${n}</b>?`,
      choices: textChoices(r, ans, [...new Set(wrongs)].filter((x) => x !== ans)), answer: ans, answerText: ans,
      hints: [
        'Multiplying by a whole number means adding equal groups.',
        `${a} × ${n} means ${n} groups of ${a}.`,
        `Look for the choice that adds ${a} exactly ${n} times.`
      ],
      why: `${a} × ${n} is ${n} groups of ${a}: ${ans} = ${times(a, n)}.`,
      diagnose(resp) {
        if (resp === `${a} + ${n}`) return `That adds ${n} once. ${a} × ${n} means ${n} groups of ${a}.`;
        if (!resp.includes('.')) return 'Those numbers lost their decimal points. Each group is ' + a + '.';
        return `Count the groups in that choice. You need exactly ${n} groups of ${a}.`;
      }
    };
  });

  // ───────────────────────── Skill: tenths × tenths (mTenths) ─────────────────────────

  T('A1', 'mTenths', (r, p) => {
    const a = p.a || r.int(2, 9), b = p.b || r.int(2, 9);
    const x = f(a * 100, 1), y = f(b * 100, 1), ans = f(a * b * 10, 2);
    return {
      type: 'number', sig: a + '*' + b,
      prompt: `The grid is one whole. ${x} of the rows and ${y} of the columns are marked. Use the overlap to find <span class="expr">${x} × ${y}</span>.`,
      visual: M.area(a, b), answer: ans, answerText: ans,
      hints: [
        `${x} × ${y} means ${x} OF ${y}. On the grid, it is the part where the ${x} rows and the ${y} columns overlap.`,
        'Each small square is one hundredth. Count the dark squares where the rows and columns overlap.',
        `The overlap is ${a} rows by ${b} columns, so you can multiply ${a} × ${b} to count the squares. Then write that many hundredths.`
      ],
      why: `The overlap is ${a} × ${b} = ${a * b} squares. Each is one hundredth, so ${x} × ${y} = <b>${ans}</b>.`,
      diagnose(resp, info) {
        if (info.th === a * b * 100) return `That is ${a * b} tenths. Each small square is one hundredth, so ${a * b} squares is ${a * b} hundredths.`;
        if (info.th === (a + b) * 100) return 'That adds the two numbers. Count the overlapping squares instead.';
        return `Count only the dark squares where the marked rows and columns overlap: ${a} rows by ${b} columns.`;
      }
    };
  });

  T('A2', 'mTenths', (r, p) => {
    let a = p.a, b = p.b;
    while (!a || (p.a === undefined && smallWhole(D.toThousandths(mul(a, b))))) { a = r.next() < 0.5 ? f(r.int(2, 9) * 100, 1) : num(r.int(1, 4) * 1000 + r.int(1, 9) * 100); b = f(r.int(2, 9) * 100, 1); }
    const ans = mul(a, b);
    return {
      type: 'number', sig: a + '*' + b,
      prompt: `Multiply: <span class="expr">${a} × ${b}</span>`,
      answer: ans, answerText: ans,
      hints: [
        'A tenth of a tenth is a hundredth, so tenths × tenths gives hundredths.',
        `Multiply the digits as whole numbers: ${digitsOnly(a)} × ${digitsOnly(b)}.`,
        `Count the decimal places in both numbers (${WORD[places(a)]} and ${WORD[places(b)]}) and add them. The answer has that many decimal places.`
      ],
      why: `${digitsOnly(a)} × ${digitsOnly(b)} = ${Number(digitsOnly(a)) * Number(digitsOnly(b))}, and there are ${places(a) + places(b)} decimal places in all, so ${a} × ${b} = ${full(ans, places(a) + places(b))}.`,
      diagnose(resp, info) {
        const prod = Number(digitsOnly(a)) * Number(digitsOnly(b));
        if (info.th === prod * 100) return `The digits are right, but tenths × tenths makes hundredths. The answer needs ${places(a) + places(b)} decimal places.`;
        if (info.th === prod * 1000) return 'You multiplied the digits, but forgot the decimal point. Count the decimal places in both numbers.';
        if (info.th === D.toThousandths(a) + D.toThousandths(b)) return 'That adds the two numbers. This problem asks you to multiply.';
        return `Multiply ${digitsOnly(a)} × ${digitsOnly(b)}, then give the answer ${places(a) + places(b)} decimal places.`;
      }
    };
  });

  // ───────────────────────── Skill: placing the decimal point (mPoint) ─────────────────────────

  T('D1', 'mPoint', (r, p) => {
    let a = p.a, b = p.b;
    if (!a) for (;;) { a = num(r.int(1, 9) * 1000 + r.int(1, 9) * 100); b = r.next() < 0.7 ? num(r.int(1, 9) * 1000 + r.int(1, 9) * 100) : f(r.int(1, 9) * 100, 1); if ((Number(digitsOnly(a)) * Number(digitsOnly(b))) % 10 !== 0) break; }
    const ia = digitsOnly(a), ib = digitsOnly(b), prod = Number(ia) * Number(ib);
    const ans = mul(a, b);
    const P = places(a) + places(b);
    const cands = [0, 1, 2, 3].filter((k) => k !== P).map((k) => num(prod * Math.pow(10, 3 - k)));
    return {
      type: 'mc', sig: a + '*' + b,
      prompt: `${ia} × ${ib} = ${prod}. Use this to find <b>${a} × ${b}</b>.`,
      choices: textChoices(r, ans, [...new Set(cands)].filter((x) => x !== ans).slice(0, 3)), answer: ans, answerText: ans,
      hints: [
        'The digits of the answer are the same as in the whole-number product. Only the decimal point is different.',
        `Count the decimal places: ${a} has ${places(a)}, ${b} has ${places(b)}.`,
        `Add the two counts to get the number of decimal places in the answer. Check: the answer must be between ${Math.floor(D.toThousandths(a) / 1000)} × ${Math.floor(D.toThousandths(b) / 1000)} and ${Math.ceil(D.toThousandths(a) / 1000)} × ${Math.ceil(D.toThousandths(b) / 1000)}.`
      ],
      why: `${a} has ${s(places(a), 'decimal place')} and ${b} has ${s(places(b), 'decimal place')}, so the product has ${P}: <b>${ans}</b>.`,
      diagnose(resp) { return `${resp} has ${s(places(resp), 'decimal place')}. Count the decimal places in ${a} and ${b} and add them.`; }
    };
  });

  T('D2', 'mPoint', (r, p) => {
    let a = p.a, b = p.b;
    if (!a) for (;;) { a = num(r.int(2, 9) * 1000 + r.int(1, 9) * 100); b = num(r.int(2, 9) * 1000 + r.int(1, 9) * 100); if (D.toThousandths(a) % 1000 !== 500 && D.toThousandths(b) % 1000 !== 500) break; }
    const est = roundWhole(a) * roundWhole(b);
    const wrongs = [String(est * 10), String(Math.max(1, Math.round(est / 10))), String(est * 100)].filter((x) => x !== String(est));
    return {
      type: 'mc', sig: a + '*' + b,
      prompt: `Without working it out exactly, which is the best <b>estimate</b> for <span class="expr">${a} × ${b}</span>?`,
      choices: textChoices(r, String(est), [...new Set(wrongs)]), answer: String(est), answerText: String(est),
      hints: [
        'Round each number to the nearest whole number, then multiply.',
        'To round to the nearest whole number, look at the tenths digit: five or more rounds up.',
        `Round ${a} and ${b} and multiply the two whole numbers.`
      ],
      why: `${a} is about ${roundWhole(a)} and ${b} is about ${roundWhole(b)}, so the product is about ${roundWhole(a)} × ${roundWhole(b)} = <b>${est}</b>. (Exactly: ${mul(a, b)}.)`,
      diagnose(resp) { return `Round ${a} and ${b} to whole numbers and multiply. ${resp} is ${Number(resp) > est ? 'much too big' : 'much too small'}.`; }
    };
  });

  T('D3', 'mPoint', (r, p) => {
    let a = p.a, b = p.b;
    if (!a) for (;;) { a = r.next() < 0.5 ? f(r.int(2, 9) * 100, 1) : f(r.int(11, 99) * 10, 2); b = r.next() < 0.4 ? String(r.int(2, 9)) : f(r.int(2, 9) * 100, 1); if (places(a) + places(b) <= 3) break; }
    const P = places(a) + places(b);
    const ans = String(P);
    return {
      type: 'mc', sig: a + '*' + b,
      prompt: `How many <b>decimal places</b> will the product <span class="expr">${a} × ${b}</span> have (before dropping any zeros at the end)?`,
      choices: ['0', '1', '2', '3'].map((t) => ({ value: t, text: t })), answer: ans, answerText: ans,
      hints: [
        'Count the digits after the decimal point in each number you multiply.',
        `${a} has ${s(places(a), 'decimal place')}.`,
        `Add the decimal places of both numbers.`
      ],
      why: `${a} has ${places(a)} and ${b} has ${places(b)} decimal places, so the product has ${places(a)} + ${places(b)} = <b>${P}</b>. (${a} × ${b} = ${f(D.toThousandths(mul(a, b)), P)}.)`,
      diagnose(resp) { return Number(resp) === Math.max(places(a), places(b)) ? 'Add the decimal places of BOTH numbers, not just the bigger count.' : 'Count the digits after the decimal point in each number, and add the two counts.'; }
    };
  });

  // ───────────────────────── Skill: word problems (mWord) ─────────────────────────

  T('K1', 'mWord', (r, p) => {
    let price = p.price || f(r.int(11, 95) * 10, 2);
    let n = p.n || r.int(3, 9);
    while (!p.price && smallWhole(D.toThousandths(price) * n)) { price = f(r.int(11, 95) * 10, 2); n = r.int(3, 9); }
    const item = p.item || r.pick(['pencils', 'stickers', 'erasers', 'apples', 'bookmarks']);
    const q = templates.find((t) => t.id === 'W1').make(r, { a: price, n });
    const money = '$' + f(D.toThousandths(q.answer), 2);
    return Object.assign(q, {
      sig: 'buy' + price + '*' + n,
      prompt: `${cap(item)} cost <b>$${price}</b> each. How much do <b>${n} ${item}</b> cost?`,
      answerText: money,
      why: `${n} × $${price} = <b>${money}</b>. (${digitsOnly(price)} × ${n} = ${Number(digitsOnly(price)) * n} cents.)`,
      hints: [`"Each" and "how much do ${n} cost" means multiply: ${n} × $${price}.`, q.hints[1], q.hints[2]]
    });
  });

  T('K2', 'mWord', (r, p) => {
    const kind = p.kind || r.pick(['laps', 'area']);
    if (kind === 'laps') {
      let a = p.a || f(r.int(2, 9) * 100, 1), n = p.n || r.int(3, 9);
      while (!p.a && smallWhole(D.toThousandths(a) * n)) { a = f(r.int(2, 9) * 100, 1); n = r.int(3, 9); }
      const q = templates.find((t) => t.id === 'W1').make(r, { a, n });
      return Object.assign(q, {
        sig: 'laps' + a + '*' + n,
        prompt: `One lap around the park is <b>${a} km</b>. Mia runs <b>${n} laps</b>. How far does she run?`,
        answerText: `${q.answer} km`,
        hints: [`${n} laps of ${a} km each means multiply: ${n} × ${a}.`, q.hints[1], q.hints[2]]
      });
    }
    const a = p.a || r.int(2, 9), b = p.b || r.int(2, 9);
    const q = templates.find((t) => t.id === 'A2').make(r, { a: f(a * 100, 1), b: f(b * 100, 1) });
    return Object.assign(q, {
      sig: 'area' + a + '*' + b,
      prompt: `A tile is <b>${f(a * 100, 1)} m</b> long and <b>${f(b * 100, 1)} m</b> wide. What is its area in square meters?`,
      answerText: `${q.answer} square meters`,
      hints: ['The area of a rectangle is length × width.', q.hints[1], q.hints[2]]
    });
  });

  const remind = {
    mPow: '<p><b>Remember:</b> × 10 moves every digit one place left, × 100 two places, × 1000 three places. 3.47 × 100 = 347.</p>',
    mWhole: '<p><b>Remember:</b> multiply the digits like whole numbers, then give the answer as many decimal places as the decimal had. 2.35 × 4: 235 × 4 = 940 → 9.40.</p>',
    mTenths: `<p><b>Remember:</b> a tenth of a tenth is a hundredth. 0.3 × 0.4 = 12 hundredths = 0.12.</p>${M.area(3, 4)}`,
    mPoint: '<p><b>Remember:</b> add the decimal places of both factors to place the point, then check with an estimate.</p>',
    mWord: '<p><b>Remember:</b> "each", "groups of", "laps of" and "length × width" mean multiply.</p>'
  };

  G.engine.register({
    lessonId: 'd08',
    skills: {
      mPow: 'Multiplying by 10, 100 and 1000',
      mWhole: 'A decimal times a whole number',
      mTenths: 'Tenths times tenths (area model)',
      mPoint: 'Placing the decimal point',
      mWord: 'Multiplication word problems'
    },
    plan: { mPow: 2, mWhole: 2, mTenths: 2, mPoint: 2, mWord: 2 },
    practiceOnly: [],
    templates, remind,
    helpers: { mul }
  });
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
