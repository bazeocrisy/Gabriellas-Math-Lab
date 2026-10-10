// Shared helpers for lesson question banks: exact formatting, place names, choice lists,
// and answer-preserving feedback helpers. Every lesson bank builds on these.
(function (G) {
  'use strict';
  const D = G.D, W = G.words;

  const f = (k, places) => D.fromThousandths(k, places);
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
      if (d) terms.push(f(d * p.unit));
    }
    return terms.join(' + ') || '0';
  }

  /** Random number with distinct nonzero digits: whole part of `wholeDigits` digits (0 = "0.") and `places` decimals. */
  function distinctDigits(r, wholeDigits, places) {
    const ds = r.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const w = wholeDigits ? ds.slice(0, wholeDigits).join('') : '0';
    return w + '.' + ds.slice(wholeDigits, wholeDigits + places).join('');
  }

  G.kit = { f, ORD, PL, PLACES, s, list, cap, textChoices, placeCheck, droppedZero, ZERO_TIP, digits5, expanded, distinctDigits, words: W.decimalWords };
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
