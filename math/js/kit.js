// Shared helpers for lesson question banks: exact formatting, place names, choice lists,
// and answer-preserving feedback helpers. Every lesson bank builds on these.
(function (G) {
  'use strict';
  const D = G.D, W = G.words;

  const f = (k, places) => D.fromThousandths(k, places);
  /** Shortest exact form of k thousandths: 4000 -> '4', 700 -> '0.7', 30 -> '0.03'. */
  const num = (k) => D.canonical(D.fromThousandths(k, 3));
  const ORD = ['', 'first', 'second', 'third'];
  const PL = [null,
    { n: 10, one: 'tenth', many: 'tenths', places: 1 },
    { n: 100, one: 'hundredth', many: 'hundredths', places: 2 },
    { n: 1000, one: 'thousandth', many: 'thousandths', places: 3 }];
  // Place names from tens to thousandths, with the value of a 1 in that place (in thousandths).
  const PLACES = [
    { key: 'tens', name: 'tens', one: 'ten', unit: 10000 },
    { key: 'ones', name: 'ones', one: 'one', unit: 1000 },
    { key: 'tenths', name: 'tenths', one: 'tenth', unit: 100 },
    { key: 'hundredths', name: 'hundredths', one: 'hundredth', unit: 10 },
    { key: 'thousandths', name: 'thousandths', one: 'thousandth', unit: 1 }];
  const s = (n, word) => n + ' ' + word + (n === 1 ? '' : 's');
  const list = (xs) => xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1];
  const cap = (t) => t[0].toUpperCase() + t.slice(1);

  /** Multiple-choice options from plain text; the correct one is first in the input. Throws on duplicates. */
  function textChoices(r, correct, wrongs) {
    const all = [correct, ...wrongs];
    if (new Set(all).size !== all.length) throw new Error('duplicate choices: ' + all.join(' | '));
    return r.shuffle(all).map((t) => ({ value: t, text: t }));
  }

  /** Digits that differ between a typed answer and the correct one, as advice that does not reveal the answer. */
  function placeCheck(resp, ans) {
    const r = D.parse(resp), a = D.parse(ans);
    if (!r) return null;
    if (r.places > 3) return 'Decimals in this lesson have at most three digits after the decimal point (thousandths).';
    const tips = [];
    if (r.whole !== a.whole) tips.push(a.whole === '0' ? 'The amount is less than one whole, so the number should start with 0 and a decimal point.' : 'Check the whole-number part, to the left of the decimal point.');
    const rd = r.frac.padEnd(3, '0'), ad = a.frac.padEnd(3, '0');
    const wrong = ['tenths', 'hundredths', 'thousandths'].filter((p, i) => rd[i] !== ad[i]);
    if (wrong.length) tips.push(`Check the digit${wrong.length > 1 ? 's' : ''} in the ${list(wrong)} place${wrong.length > 1 ? 's' : ''}.`);
    return tips.join(' ') || null;
  }

  /** "A zero holds a place" detector: the typed answer is the correct one with its inside zeros left out. */
  function droppedZero(resp, ans) {
    const r = D.parse(resp), a = D.parse(ans);
    if (!r || !a || !/0/.test(a.frac.replace(/0+$/, ''))) return false;
    return r.whole === a.whole && r.frac === a.frac.replace(/0+$/, '').replace(/0/g, '');
  }
  const ZERO_TIP = 'A zero is a placeholder. If you leave it out, the other digits slide into the wrong places. Keep every zero that comes before a nonzero digit.';

  /** Digits of a number below 100 by place: { tens, ones, tenths, hundredths, thousandths } ('' for an empty tens place). */
  function digits5(a) {
    const x = D.parse(a);
    const w = x.whole.padStart(2, ' '), fr = x.frac.padEnd(3, '0');
    return { tens: w[0] === ' ' ? '' : w[0], ones: w[1], tenths: fr[0], hundredths: fr[1], thousandths: fr[2] };
  }

  /** Expanded form "4 + 0.7 + 0.03 + 0.005" for a number (zero digits are left out). */
  function expanded(a) {
    const k = D.toThousandths(a);
    const terms = [];
    let rest = k;
    for (const p of PLACES) {
      const d = Math.floor(rest / p.unit);
      rest -= d * p.unit;
      if (d) terms.push(num(d * p.unit));
    }
    return terms.join(' + ') || '0';
  }

  /** Random number with distinct nonzero digits: whole part of `wholeDigits` digits (0 = "0.") and `places` decimals. */
  function distinctDigits(r, wholeDigits, places) {
    const ds = r.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const w = wholeDigits ? ds.slice(0, wholeDigits).join('') : '0';
    return w + '.' + ds.slice(wholeDigits, wholeDigits + places).join('');
  }


  /** Digits of a and b lined up by the decimal point: { da, db, W (whole digits), P (decimal places) }. */
  function aligned(a, b) {
    const x = D.parse(a), y = D.parse(b);
    const P = Math.max(x.places, y.places), W = Math.max(x.whole.length, y.whole.length);
    const dig = (v) => (v.whole.padStart(W, '0') + v.frac.padEnd(P, '0')).split('').map(Number);
    return { da: dig(x), db: dig(y), W, P };
  }
  const fromDigits = (ds, W, P) => D.canonical(ds.slice(0, ds.length - P).join('') + (P ? '.' + ds.slice(ds.length - P).join('') : '')) || '0';
  /** Common mistakes, so feedback can name them: adding each column without carrying. */
  function noCarryAdd(a, b) { const { da, db, W, P } = aligned(a, b); return fromDigits(da.map((d, i) => (d + db[i]) % 10), W, P); }
  /** Subtracting the smaller digit from the bigger one in every column (no regrouping). */
  function noBorrowSub(a, b) { const { da, db, W, P } = aligned(a, b); return fromDigits(da.map((d, i) => Math.abs(d - db[i])), W, P); }
  /** Lining the digits up from the right like whole numbers, then putting the point back for the longer number. */
  function misaligned(a, b, op) {
    const x = D.parse(a), y = D.parse(b), P = Math.max(x.places, y.places);
    const ia = Number(x.whole + x.frac), ib = Number(y.whole + y.frac);
    const v = op === '+' ? ia + ib : ia - ib;
    if (v < 0) return null;
    const str = String(v).padStart(P + 1, '0');
    return D.canonical(P ? str.slice(0, str.length - P) + '.' + str.slice(str.length - P) : str);
  }

  /**
   * A worked column calculation for "Show me how to solve it": the numbers lined up by the decimal point (zeros
   * written), carry or regroup marks, and one sentence per column from the right. nums: two or more numbers to
   * add (op '+'), or [top, bottom] with top > bottom to subtract (op '−').
   */
  function columnSolution(nums, op) {
    const minus = op !== '+';
    const ps = nums.map((x) => D.parse(x));
    const P = Math.max(...ps.map((x) => x.places)), W = Math.max(...ps.map((x) => x.whole.length));
    const rows = ps.map((v) => (v.whole.padStart(W, '0') + v.frac.padEnd(P, '0')).split('').map(Number));
    const n = W + P;
    const WHOLE = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands'], FRAC = ['tenths', 'hundredths', 'thousandths'];
    const name = (i) => (i >= W ? FRAC[i - W] : WHOLE[W - 1 - i]);
    const Cap = (t) => t[0].toUpperCase() + t.slice(1);
    const written = (r, i) => i >= W || ps[r].whole.length >= W - i; // false for an empty place left of a shorter number
    const total = minus ? D.toThousandths(nums[0]) - D.toThousandths(nums[1]) : ps.reduce((t, v) => t + D.toThousandths(v), 0);
    const answer = f(total, P), shift = Math.max(W, D.parse(answer).whole.length) - W;
    const cell = (i) => shift + (i < W ? i : i + 1); // column of digit i in the drawn calculation
    const marks = {}, steps = [];
    if (!minus) {
      let carry = 0;
      for (let i = n - 1; i >= 0; i--) {
        const shown = rows.map((r, k) => (written(k, i) ? r[i] : null)).filter((x) => x !== null);
        const sum = shown.reduce((a, b) => a + b, 0) + carry;
        const parts = shown.map(String).concat(carry ? [`${carry} carried`] : []);
        const next = Math.floor(sum / 10);
        let t = parts.length === 1 ? `${Cap(name(i))}: bring down the ${sum}.` : `${Cap(name(i))}: ${parts.join(' + ')} = ${sum}.`;
        if (next && parts.length > 1) t += ` Write ${sum % 10} and carry ${next} to the ${i ? name(i - 1) : WHOLE[W]}.`;
        steps.push(t);
        carry = next;
        if (carry && i) marks[cell(i - 1)] = String(carry);
      }
      if (carry) steps.push(`Write the carried ${carry} in the ${WHOLE[W]} place.`);
    } else {
      const t = rows[0].slice(), b = rows[1];
      for (let i = n - 1; i >= 0; i--) {
        if (!written(1, i)) {
          if (i === 0 && t[i] === 0) steps.push(`${Cap(name(i))}: nothing is left there.`);
          else if (written(0, i)) steps.push(`${Cap(name(i))}: bring down the ${t[i]}.`);
          continue;
        }
        if (t[i] < b[i]) {
          let k = i - 1;
          while (t[k] === 0) k--;
          const zeros = []; for (let m = k + 1; m < i; m++) zeros.push(name(m));
          const was = t[i];
          t[k] -= 1; for (let m = k + 1; m < i; m++) t[m] = 9; t[i] += 10;
          for (let m = k; m <= i; m++) marks[cell(m)] = String(t[m]);
          steps.push(`${Cap(name(i))}: ${was} is less than ${b[i]}, so regroup. ` + (zeros.length
            ? `The ${list(zeros)} digit${zeros.length > 1 ? 's are' : ' is'} 0, so regroup across ${zeros.length > 1 ? 'them' : 'it'}: take 1 from the ${name(k)} (it becomes ${t[k]}), each 0 becomes 9, and the ${name(i)} become ${t[i]}.`
            : `Take 1 from the ${name(k)} (it becomes ${t[k]}), which makes 10 more ${name(i)}: ${t[i]}.`) + ` ${t[i]} − ${b[i]} = ${t[i] - b[i]}.`);
        } else steps.push(`${Cap(name(i))}: ${t[i]} − ${b[i]} = ${t[i] - b[i]}.`);
      }
    }
    if (P) steps.push(`Bring the decimal point straight down into the answer: ${answer}.`);
    const padded = ps.some((v) => v.places < P);
    return `<div class="solution-work"><p>Line up the decimal points${padded ? ` and write zeros so every number has ${P} decimal place${P === 1 ? '' : 's'}` : ''}. Then work one column at a time, starting on the right:</p>` +
      G.models.vertical(nums, minus ? '−' : '+', { answer, pad: true, carry: marks, label: `${nums.join(minus ? ' minus ' : ' plus ')}, written in columns with the decimal points lined up, equals ${answer}.` }) +
      `<ol class="sol-steps">${steps.map((s) => `<li>${s}</li>`).join('')}</ol></div>`;
  }

  G.kit = { columnSolution, aligned, noCarryAdd, noBorrowSub, misaligned, f, num, ORD, PL, PLACES, s, list, cap, textChoices, placeCheck, droppedZero, ZERO_TIP, digits5, expanded, distinctDigits, words: W.decimalWords };
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
