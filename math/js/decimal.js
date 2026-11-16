// Exact decimal helpers. Decimals are handled as digit strings, never binary floating point,
// so 0.1 + 0.2 style errors cannot creep into answer checking.
(function (G) {
  'use strict';

  const RE = /^(\d*)(?:\.(\d*))?$/;

  /** Parse "0.50", ".5", "3", "3." into { whole, frac, places }. Returns null for anything else. */
  function parse(input) {
    if (input && typeof input === 'object' && 'whole' in input) return input;
    const s = String(input == null ? '' : input).trim();
    if (s.length === 0 || s.length > 24) return null;
    const m = RE.exec(s);
    if (!m) return null;
    const fracRaw = m[2] || '';
    if (m[1] === '' && fracRaw === '') return null;
    const whole = m[1].replace(/^0+(?=\d)/, '') || '0';
    return { whole, frac: fracRaw, places: fracRaw.length };
  }

  /** Compare two decimals exactly: -1, 0 or 1. Returns NaN if either cannot be parsed. */
  function cmp(a, b) {
    const x = parse(a), y = parse(b);
    if (!x || !y) return NaN;
    if (x.whole.length !== y.whole.length) return x.whole.length < y.whole.length ? -1 : 1;
    if (x.whole !== y.whole) return x.whole < y.whole ? -1 : 1;
    const n = Math.max(x.frac.length, y.frac.length);
    const fx = x.frac.padEnd(n, '0'), fy = y.frac.padEnd(n, '0');
    if (fx === fy) return 0;
    return fx < fy ? -1 : 1;
  }

  const equal = (a, b) => cmp(a, b) === 0;

  /** Whole number of thousandths (e.g. "0.35" -> 350), or null if the value needs more than 3 places. */
  function toThousandths(a) {
    const x = parse(a);
    if (!x) return null;
    if (x.frac.length > 3 && /[1-9]/.test(x.frac.slice(3))) return null;
    if (x.whole.length > 9) return null;
    return Number(x.whole) * 1000 + Number((x.frac.slice(0, 3)).padEnd(3, '0'));
  }

  /** Format k thousandths with exactly `places` decimal places (0-3). Throws if that would lose digits. */
  function fromThousandths(k, places) {
    if (!Number.isInteger(k) || k < 0) throw new Error('bad thousandths: ' + k);
    if (places === undefined) places = k % 10 ? 3 : k % 100 ? 2 : 1;
    const whole = Math.floor(k / 1000);
    const frac = String(k % 1000).padStart(3, '0');
    if (/[1-9]/.test(frac.slice(places))) throw new Error(`${k} thousandths needs more than ${places} places`);
    return places === 0 ? String(whole) : whole + '.' + frac.slice(0, places);
  }

  /** Shortest form: "0.50" -> "0.5", "3.0" -> "3". */
  function canonical(a) {
    const x = parse(a);
    if (!x) return null;
    const f = x.frac.replace(/0+$/, '');
    return f ? x.whole + '.' + f : x.whole;
  }

  /** Digits by place for a number below 10: { ones, tenths, hundredths, thousandths } as single-digit strings. */
  function digits(a) {
    const x = parse(a);
    const f = x.frac.padEnd(3, '0');
    return { ones: x.whole.slice(-1), tenths: f[0], hundredths: f[1], thousandths: f[2] };
  }

  G.D = { parse, cmp, equal, toThousandths, fromThousandths, canonical, digits };
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
