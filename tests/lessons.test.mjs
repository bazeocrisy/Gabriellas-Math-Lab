// Lessons 2–4: every template over hundreds of seeds passes the generic checks, and each answer key is
// recomputed independently from the question text. Plus Teach checks, notes, and question-set rules.
// Run: npm test
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadGML, LESSONS } from './lib/load.mjs';
import { checkTemplate, strip, correctResponse } from './lib/generic.mjs';

const G = loadGML([...(await import('./lib/load.mjs')).CORE, 'js/scoring.js']);
const { D, engine, kit } = G;
const SEEDS = 500;
const nums = (q) => strip(q.prompt).match(/\d+\.\d+|\d+/g) || [];
const PLACE_UNIT = { tens: 10000, ones: 1000, tenths: 100, hundredths: 10, thousandths: 1 };
const placeOfDigit = (n, d) => { const g = kit.digits5(n); return Object.keys(PLACE_UNIT).find((k) => g[k] === String(d)); };

// Independent answer checks: recompute the answer from what the student sees.
const VERIFY = {
  d02: {
    N1: (q) => { const [n, d] = nums(q); assert.equal(q.answer, placeOfDigit(n, d)); },
    N2: (q) => { const key = strip(q.prompt).match(/the (\w+) place/)[1]; const n = nums(q)[0]; assert.equal(q.answer, kit.digits5(n)[key]); },
    N3: (q) => { const d = nums(q)[0]; const key = strip(q.prompt).match(/the (\w+) place/)[1]; assert.equal(placeOfDigit(q.answer, d), key); },
    V1: (q) => { const [d, n] = nums(q); assert.equal(D.toThousandths(q.answer), Number(d) * PLACE_UNIT[placeOfDigit(n, d)]); },
    V2: (q) => { const [d, n] = nums(q); assert.equal(D.toThousandths(q.answer), Number(d) * PLACE_UNIT[placeOfDigit(n, d)]); },
    V3: (q) => { const [n, d] = nums(q); const k = placeOfDigit(n, d); assert.equal(q.answer, `${k} place, value ${kit.num(Number(d) * PLACE_UNIT[k])}`); },
    V4: (q) => { const n = nums(q)[0]; const fr = n.split('.')[1]; assert.equal(q.answer, /greatest/.test(q.prompt) ? fr[0] : fr[2]); },
    R1: (q) => {
      const t = strip(q.prompt); const d = t.match(/the (\d) in/)[1]; const [a, b] = t.match(/\d+\.\d+/g);
      const va = Number(d) * PLACE_UNIT[placeOfDigit(a, d)], vb = Number(d) * PLACE_UNIT[placeOfDigit(b, d)];
      assert.equal(q.answer, va === vb * 10 ? '10 times as much as' : va * 10 === vb ? '1/10 as much as' : 'none');
    },
    R2: (q) => { const base = nums(q).slice(-1)[0]; const k = D.toThousandths(base); assert.equal(D.toThousandths(q.answer), /10 times/.test(q.prompt) ? k * 10 : k / 10); },
    R3: (q) => assert.equal(q.answer, /to the left/.test(strip(q.prompt)) ? 'It becomes 10 times as much.' : 'It becomes 1/10 as much.'),
    F1: (q) => {
      const n = nums(q)[0];
      for (const c of q.choices) {
        const sum = c.value.split(' + ').reduce((a, t) => a + D.toThousandths(t), 0);
        const single = c.value.split(' + ').every((t) => /^[1-9]0*$/.test(String(D.toThousandths(t))));
        assert.equal(c.value === q.answer, sum === D.toThousandths(n) && single, `F1 choice ${c.value} for ${n}`);
      }
    },
    F2: (q) => { const expr = strip(q.prompt).split(':')[1]; const sum = expr.split('+').reduce((a, t) => a + D.toThousandths(t.trim()), 0); assert.equal(D.toThousandths(q.answer), sum); },
    F3: (q) => assert.equal(q.answer, nums(q)[0]),
    F4: (q) => assert.equal(G.words.decimalWords(q.answer), strip(q.prompt).replace(/^Write in standard form:\s*/, '').trim()),
    F5: (q) => assert.equal(q.answer, G.words.decimalWords(nums(q)[0])),
    F6: (q) => {
      const terms = [...strip(q.prompt).matchAll(/(\d) (thousandths?|hundredths?|tenths?|tens?|ones?)\b/g)];
      const unit = { ten: 10000, tens: 10000, one: 1000, ones: 1000, tenth: 100, tenths: 100, hundredth: 10, hundredths: 10, thousandth: 1, thousandths: 1 };
      assert.equal(D.toThousandths(q.answer), terms.reduce((a, m) => a + Number(m[1]) * unit[m[2]], 0));
    },
    Z1: (q) => { const [d] = nums(q); const key = strip(q.prompt).match(/the (\w+) place/)[1]; assert.equal(placeOfDigit(q.answer, d), key); for (const c of q.choices) if (c.value !== q.answer) assert.notEqual(c.value.includes('.') ? placeOfDigit(c.value, d) : 'ones', key); },
    Z2: (q) => { const n = nums(q).slice(-1)[0]; const fr = n.split('.')[1]; const zi = fr.indexOf('0'); assert.ok(q.answer.includes(['tenths', 'hundredths'][zi] + ' place')); },
    Z3: (q) => { const x = nums(q)[0]; for (const c of q.choices) assert.equal(c.value === q.answer, D.equal(c.value, x)); },
    Z4: (q) => { const cells = [...q.visual.matchAll(/<td class="[^"]*">(\d?)<\/td>/g)].map((m) => m[1]); assert.equal(D.toThousandths(q.answer), D.toThousandths(cells.slice(0, 2).join('') + '.' + cells.slice(2).join(''))); }
  },
  d03: {
    S1: (q) => symbolOk(q), S3: (q) => symbolOk(q), L1: (q) => symbolOk(q), E1: (q) => symbolOk(q),
    S2: (q) => greaterLess(q), L2: (q) => greaterLess(q),
    S4: (q) => {
      const [x, y] = decs(q); const a = pad(x), b = pad(y);
      const i = [...a].findIndex((ch, k) => ch !== b[k]);
      assert.equal(q.answer, ['ones', '.', 'tenths', 'hundredths', 'thousandths'][i]);
    },
    S5: (q) => {
      const t = strip(q.prompt).replace(/&gt;/g, '>').replace(/&lt;/g, '<'); const want = t.includes('>') ? 1 : -1; const [, a, d] = t.match(/0\.(\d)\?(\d)/) || t.match(/0\.(\d)\s*\?\s*(\d)/);
      const y = decs(q).slice(-1)[0];
      for (const c of q.choices) assert.equal(c.value === q.answer, D.cmp(`0.${a}${c.value}${d}`, y) === want, `S5 ${c.value}`);
    },
    L3: (q) => {
      const [lo, hi] = decs(q); const L = D.toThousandths(lo), H = D.toThousandths(hi);
      for (let k = Math.max(0, L - 30); k <= H + 30; k++) assert.equal(!!q.accept(D.parse(D.fromThousandths(k, 3))), k > L && k < H, `L3 ${k}`);
      assert.ok(q.accept(D.parse(q.answer)));
    },
    E2: (q) => { const x = decs(q)[0]; for (const c of q.choices) assert.equal(c.value === q.answer, D.equal(c.value, x)); },
    NL1: (q) => { const pts = linePoints(q.visual); assert.equal(D.toThousandths(q.answer), Math.max(...pts.map((p) => p.v))); },
    NL2: (q) => { const [x, y] = decs(q); assert.equal(q.answer, D.cmp(x, y) > 0 ? x : y); },
    NL3: (q) => { const target = D.toThousandths(decs(q)[0]); const pts = linePoints(q.visual); assert.equal(pts.find((p) => p.v === target).label, q.answer); },
    Y1: (q) => { const [a, b] = decs(q); assert.equal(q.answer.startsWith('Yes'), D.cmp(a, b) > 0); assert.equal(q.choices.filter((c) => c.value.startsWith('Yes')).length, 2); },
    Y2: (q) => { const [x, y] = decs(q); assert.equal(D.cmp(x, y), 1); const a = pad(x), b = pad(y); const i = [...a].findIndex((ch, k) => ch !== b[k]); assert.ok(q.answer.includes(['ones', '.', 'tenths', 'hundredths', 'thousandths'][i]), q.answer); },
    Y3: (q) => { const [x, y] = decs(q); assert.equal(D.cmp(x, y), -1, 'the student\'s claim is false'); assert.ok(q.answer.includes('place by place')); }
  },
  d04: {
    O1: (q) => orderOk(q), O2: (q) => orderOk(q), O3: (q) => orderOk(q), W2: (q) => orderOk(q),
    O4: (q) => {
      const dec = (l) => l.split(', ').every((x, i, a) => i === 0 || D.cmp(a[i - 1], x) > 0);
      for (const c of q.choices) assert.equal(c.value === q.answer, dec(c.value), c.value);
    },
    O5: (q) => { const xs = sorted(decs(q)); assert.equal(q.answer, xs[1]); },
    A1: (q) => { const xs = sorted(q.choices.map((c) => c.value)); assert.equal(q.answer, /least/.test(q.prompt) ? xs[0] : xs[xs.length - 1]); },
    A2: (q) => { const [x] = decs(q); const places = Number(strip(q.prompt).match(/with (\d) decimal places/)[1]); assert.ok(D.equal(q.answer, x) && D.parse(q.answer).places === places); },
    A3: (q) => { const [lo, hi] = decs(q); for (const c of q.choices) assert.equal(c.value === q.answer, D.cmp(c.value, lo) > 0 && D.cmp(c.value, hi) < 0, c.value); },
    NL1: (q) => { const xs = sorted(decs(q)); assert.equal(q.answer, /left/.test(q.prompt) ? xs[0] : xs[xs.length - 1]); },
    NL2: (q) => { const val = D.toThousandths(decs(q).slice(-1)[0]); const pts = linePoints(q.visual); assert.equal(pts.find((p) => p.v === val).label, q.answer); },
    W1: (q) => {
      const rows = [...q.visual.matchAll(/<tr><td>([^<]+)<\/td><td>([\d.]+)<\/td><\/tr>/g)].map((m) => ({ name: m[1], v: m[2] }));
      const least = /fastest|lightest/.test(q.prompt);
      const best = rows.slice().sort((a, b) => D.cmp(a.v, b.v))[least ? 0 : rows.length - 1];
      assert.equal(q.answer, best.name);
    },
    W3: (q) => { const xs = sorted(decs(q)); assert.equal(q.answer, xs[xs.length - 1]); }
  }
};
function sorted(xs) { return xs.slice().sort((a, b) => D.cmp(a, b)); }
function orderOk(q) {
  const val = (x) => x.split(' ')[0];
  const up = /least to greatest|shortest to/.test(strip(q.prompt));
  const want = sorted(q.items.map(val));
  if (!up) want.reverse();
  assert.deepEqual(q.answer.map(val), want);
}
// Lesson 5: rounding recomputed with whole-number thousandths (exactly halfway rounds up).
const rnd = (x, place) => { const k = D.toThousandths(x), u = place === 'tenth' ? 100 : 10, rm = k % u; return rm * 2 >= u ? k - rm + u : k - rm; };
const placeIn = (q) => (/nearest <b>?tenth|nearest tenth/.test(q.prompt) ? 'tenth' : 'hundredth');
const roundOk = (q) => { const x = decs(q)[0]; assert.equal(D.toThousandths(q.answer), rnd(x, placeIn(q)), `${x} ${placeIn(q)}`); };
VERIFY.d05 = {
  T1: roundOk, T2: roundOk, H1: roundOk, H2: roundOk, K1: roundOk, K3: roundOk, A2: roundOk,
  R1: (q) => { const x = decs(q)[0]; const fr = D.parse(x).frac; assert.equal(q.answer, fr[placeIn(q) === 'tenth' ? 1 : 2]); },
  R2: (q) => { const x = decs(q)[0]; const h = Number(D.parse(x).frac[1]); assert.ok(q.answer.startsWith(h >= 5 ? 'Round up' : 'Round down') && /hundredths digit/.test(q.answer)); },
  K2: (q) => { const x = decs(q)[0]; assert.equal(D.toThousandths(q.answer), rnd(x, 'tenth')); },
  A1: (q) => { const target = D.toThousandths(decs(q)[0]); for (const c of q.choices) assert.equal(c.value === q.answer, rnd(c.value, 'tenth') === target, c.value); },
  A3: (q) => { const [x, said] = decs(q); assert.equal(q.answer.startsWith('Yes'), rnd(x, 'tenth') === D.toThousandths(said)); assert.equal(q.choices.filter((c) => c.value.startsWith('Yes')).length, 2); }
};
// Lesson 6: sums recomputed from the numbers in the question.
const numbersIn = (q) => (strip(q.prompt).replace(/,/g, '').match(/\d+(\.\d+)?/g) || []);
const sumOf = (xs) => xs.reduce((t, x) => t + D.toThousandths(x), 0);
const pointCols = (html) => [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map((m) => [...m[1].matchAll(/<td[^>]*>([^<]*)<\/td>/g)].findIndex((c) => c[1] === '.'));
VERIFY.d06 = {
  AL1: (q) => assert.equal(D.toThousandths(q.answer), sumOf(numbersIn(q))),
  MX1: (q) => assert.equal(D.toThousandths(q.answer), sumOf(numbersIn(q))),
  MX2: (q) => assert.equal(D.toThousandths(q.answer), sumOf(numbersIn(q))),
  WP1: (q) => assert.equal(D.toThousandths(q.answer), sumOf(numbersIn(q))),
  WP2: (q) => assert.equal(D.toThousandths(q.answer), sumOf(numbersIn(q))),
  AL3: (q) => { const [a, b, wrong] = numbersIn(q); assert.equal(D.toThousandths(q.answer), sumOf([a, b])); assert.notEqual(D.toThousandths(wrong), sumOf([a, b])); },
  AM1: (q) => { const [g1, g2] = q.visual.split('Second grid'); assert.equal(D.toThousandths(q.answer), ((g1.match(/class="m-on"/g) || []).length + (g2.match(/class="m-on"/g) || []).length) * 10); },
  AM2: (q) => { assert.equal(D.toThousandths(q.answer), (q.visual.match(/class="m-on"/g) || []).length * 100); assert.equal(D.toThousandths(q.answer), sumOf(numbersIn(q))); },
  AL2: (q) => { for (const c of q.choices) { const cols = pointCols(c.html); assert.equal(c.value === q.answer, cols.every((x) => x === cols[0]), c.text); } },
  AM3: (q) => { const [start, jump] = decs(q); const pt = linePoints(q.visual.replace(/m-small/g, 'x'))[0]; assert.equal(pt.v, D.toThousandths(start)); assert.equal(D.toThousandths(q.answer), sumOf([start, jump])); },
  ES1: (q) => { const [a, b] = numbersIn(q); const rw = (x) => Math.floor((D.toThousandths(x) + 500) / 1000); assert.equal(q.answer, String(rw(a) + rw(b))); },
  ES2: (q) => { const [a, b, said] = numbersIn(q); assert.equal(q.answer.startsWith('Yes'), sumOf([a, b]) === D.toThousandths(said)); }
};
// Lesson 7: differences recomputed from the numbers in the question.
const diffOf = (a, b) => D.toThousandths(a) - D.toThousandths(b);
const firstTwoDiff = (q) => { const [a, b] = numbersIn(q); assert.equal(D.toThousandths(q.answer), diffOf(a, b)); assert.ok(diffOf(a, b) > 0); };
VERIFY.d07 = {
  SL1: firstTwoDiff, SZ1: firstTwoDiff, SZ2: firstTwoDiff, SW2: firstTwoDiff, SL3: firstTwoDiff,
  SW1: (q) => { const [cost, paid] = numbersIn(q); assert.equal(D.toThousandths(q.answer), diffOf(paid, cost)); },
  SM1: (q) => { const [a, b] = numbersIn(q); assert.equal((q.visual.match(/class="m-on"/g) || []).length * 10, D.toThousandths(a)); assert.equal((q.visual.match(/class="m-x"/g) || []).length * 10, D.toThousandths(b)); assert.equal(D.toThousandths(q.answer), diffOf(a, b)); },
  SM2: (q) => { const [start, jump] = decs(q); assert.equal(linePoints(q.visual)[0].v, D.toThousandths(start)); assert.equal(D.toThousandths(q.answer), diffOf(start, jump)); },
  SL2: (q) => { for (const c of q.choices) { const cols = pointCols(c.html); assert.equal(c.value === q.answer, cols.every((x) => x === cols[0]), c.text); } },
  SC1: (q) => { const [a, b, d] = numbersIn(q); const [x, y, z] = q.answer.match(/\d+(\.\d+)?/g); assert.equal(D.toThousandths(d), diffOf(a, b)); assert.ok(D.equal(x, d) && D.equal(y, b) && D.equal(z, a)); },
  SC2: (q) => { const [a, b, said] = numbersIn(q); assert.equal(q.answer.startsWith('Yes'), diffOf(a, b) === D.toThousandths(said)); },
  SC3: (q) => { const [a, b] = numbersIn(q); const rw = (x) => Math.floor((D.toThousandths(x) + 500) / 1000); assert.equal(q.answer, String(rw(a) - rw(b))); }
};
// Lesson 8: products recomputed with whole-number digits.
const prodTh = (a, b) => { const x = D.parse(a), y = D.parse(b); const P = x.places + y.places; return Number(x.whole + x.frac) * Number(y.whole + y.frac) * Math.pow(10, 3 - P); };
const twoProd = (q) => { const [a, b] = numbersIn(q); assert.equal(D.toThousandths(q.answer), prodTh(a, b)); };
VERIFY.d08 = {
  P1: twoProd, P2: twoProd, W1: twoProd, A2: twoProd, D1: (q) => { const n = numbersIn(q); assert.equal(Number(n[0]) * Number(n[1]), Number(n[2])); assert.equal(D.toThousandths(q.answer), prodTh(n[3], n[4])); },
  K1: (q) => { const [price, n] = numbersIn(q); assert.equal(D.toThousandths(q.answer), prodTh(price, n)); },
  K2: (q) => { const [a, b] = numbersIn(q); assert.equal(D.toThousandths(q.answer), prodTh(a, b)); },
  W2: (q) => { const n = numbersIn(q); const bars = (q.visual.match(/model-strip/g) || []).length; assert.equal(bars, Number(n[0])); assert.equal((q.visual.match(/class="m-on"/g) || []).length * 100, D.toThousandths(q.answer)); assert.equal(D.toThousandths(q.answer), prodTh(n[1], n[0])); },
  W3: (q) => { const [a, n] = numbersIn(q); for (const c of q.choices) { const parts = c.value.split(' + '); assert.equal(c.value === q.answer, parts.length === Number(n) && parts.every((x) => x === a), c.value); } },
  A1: (q) => { const [a, b] = numbersIn(q); assert.equal((q.visual.match(/class="m-on"/g) || []).length * 10, prodTh(a, b)); assert.equal(D.toThousandths(q.answer), prodTh(a, b)); },
  D2: (q) => { const [a, b] = numbersIn(q); const rw = (x) => Math.floor((D.toThousandths(x) + 500) / 1000); assert.equal(q.answer, String(rw(a) * rw(b))); },
  D3: (q) => { const [a, b] = numbersIn(q); assert.equal(Number(q.answer), D.parse(a).places + D.parse(b).places); }
};
// Lesson 9: quotients recomputed (dividend ÷ whole number) and checked by multiplying back.
const quot = (a, n) => { const k = D.toThousandths(a); assert.equal(k % Number(n), 0, `${a} ÷ ${n} exact`); return k / Number(n); };
const divOk = (q, ai, ni) => { const xs = numbersIn(q); assert.equal(D.toThousandths(q.answer), quot(xs[ai], xs[ni])); };
VERIFY.d09 = {
  P1: (q) => divOk(q, 0, 1), P2: (q) => divOk(q, 0, 1), W1: (q) => divOk(q, 0, 1), W2: (q) => divOk(q, 0, 1), K2: (q) => divOk(q, 0, 1), K1: (q) => divOk(q, 1, 0),
  P3: (q) => { const t = strip(q.prompt); const zeros = (t.match(/by (10+)/)[1].length - 1); const dir = /multiply/.test(t) ? 'left' : 'right'; assert.equal(q.answer, `Every digit moves ${['', 'one', 'two', 'three'][zeros]} place${zeros === 1 ? '' : 's'} to the ${dir}.`); },
  M1: (q) => { divOk(q, 0, 1); assert.equal((q.visual.match(/class="m-on"/g) || []).length * 100, D.toThousandths(numbersIn(q)[0])); },
  M2: (q) => { divOk(q, 0, 1); assert.equal((q.visual.match(/class="m-on"/g) || []).length * 10, D.toThousandths(numbersIn(q)[0])); },
  W3: (q) => { const [dg, n, whole, a] = numbersIn(q); assert.equal(Number(dg) / Number(n), Number(whole)); assert.equal(D.toThousandths(q.answer), quot(a, n)); },
  C1: (q) => { const [a, n, qq] = numbersIn(q); assert.equal(D.toThousandths(qq), quot(a, n)); assert.equal(q.answer, `${qq} × ${n} = ${a}`); },
  C2: (q) => { const [a, n, said] = numbersIn(q); assert.equal(q.answer.startsWith('Yes'), D.toThousandths(said) * Number(n) === D.toThousandths(a)); }
};
// Lesson 10: reused questions are checked by their own lesson's verifier; multi-step ones are recomputed here.
VERIFY.d10 = {
  RP1: (q) => VERIFY.d02.V2(q), RP2: (q) => VERIFY.d02.F3(q), RP3: (q) => VERIFY.d02.F4(q), RP4: (q) => { const k = D.toThousandths(q.answer); assert.equal((q.visual.match(/class="m-on"/g) || []).length, Math.floor(k / 10) + 2 * (k % 10)); },
  RC1: (q) => VERIFY.d03.L1(q), RC2: (q) => VERIFY.d04.O1(q), RC3: (q) => VERIFY.d03.Y1(q),
  RR1: (q) => VERIFY.d05.T1(q), RR2: (q) => VERIFY.d05.H1(q), RR3: (q) => VERIFY.d05.K1(q), RR4: (q) => VERIFY.d05.K3(q), RC4: (q) => VERIFY.d04.O3(q),
  RA1: (q) => VERIFY.d06.MX1(q), RA2: (q) => VERIFY.d07.SZ2(q), RA3: (q) => VERIFY.d07.SW1(q),
  X1: (q) => { const [a, b] = numbersIn(q); const k = sumOf([a, b]); const rm = k % 100; assert.equal(D.toThousandths(q.answer), rm * 2 >= 100 ? k - rm + 100 : k - rm); assert.equal(D.parse(q.answer).places, 1); },
  X2: (q) => { const [a, b, c] = numbersIn(q); const v = sumOf([a, b]) - D.toThousandths(c); assert.equal(q.answer, v < 0 ? '<' : v > 0 ? '>' : '='); },
  X3: (q) => { const [paid, a, b] = numbersIn(q); assert.equal(D.toThousandths(q.answer), Number(paid) * 1000 - sumOf([a, b])); assert.ok(D.toThousandths(q.answer) > 0); },
  X4: (q) => { const [a, b] = numbersIn(q); const d = f2(D.toThousandths(a) - D.toThousandths(b)); assert.equal(q.answer, /tenths place/.test(strip(q.prompt)) ? d[d.indexOf('.') + 1] : d[d.indexOf('.') + 2]); }
};
function f2(k) { return D.fromThousandths(k, 2); }
function decs(q) { return strip(q.prompt).match(/\d+\.\d+/g); }
function pad(x) { const v = D.parse(x); return v.whole.padStart(2, '0').slice(-1) + '.' + v.frac.padEnd(3, '0'); }
function symbolOk(q) { const [x, y] = decs(q); const c = D.cmp(x, y); assert.equal(q.answer, c < 0 ? '<' : c > 0 ? '>' : '='); }
function greaterLess(q) { const [x, y] = decs(q); const g = D.cmp(x, y) > 0 ? x : y, l = g === x ? y : x; assert.equal(q.answer, /greater/.test(q.prompt) ? g : l); }
/** Points on a number-line SVG: value from the dot's position between the two end labels. */
function linePoints(svg) {
  const ends = [...svg.matchAll(/m-bold" text-anchor="middle">([^<]+)</g)].map((m) => m[1]);
  const from = D.toThousandths(ends[0]), to = D.toThousandths(ends[1]);
  const cx = [...svg.matchAll(/<circle cx="([\d.]+)"/g)].map((m) => Number(m[1]));
  const labels = ends.slice(2);
  return cx.map((x, i) => ({ v: Math.round(from + ((x - 24) / 292) * (to - from)), label: labels[i] }));
}

for (const id of LESSONS.filter((x) => x !== 'd01')) {
  const bank = engine.banks[id];
  test(`${id}: bank covers every skill, plan adds to 10, at least 12 templates`, () => {
    assert.ok(bank.templates.length >= 12, `${bank.templates.length} templates`);
    for (const sk of Object.keys(bank.skills)) assert.ok(bank.templates.some((t) => t.skill === sk), sk);
    assert.equal(Object.values(bank.plan).reduce((a, b) => a + b, 0), 10);
    for (const t of bank.templates) assert.ok(VERIFY[id] && VERIFY[id][t.id], `${id}/${t.id} has an independent answer check`);
  });
  for (const t of bank.templates) {
    test(`${id}/${t.id}: ${SEEDS} seeds pass generic and answer checks`, () => {
      checkTemplate(G, id, t, SEEDS);
      for (let seed = 1; seed <= SEEDS; seed++) VERIFY[id][t.id](engine.make(id, t.id, seed));
    });
  }
  test(`${id}: Teach screens, guided checks, notes`, () => {
    const L = G.lessonContent[id];
    const checks = L.screens.filter((s) => s.check);
    assert.ok(checks.length >= Object.keys(bank.skills).length, 'a guided check for every skill');
    for (const s of checks) {
      const q = engine.make(id, s.check.t, 1, s.check.params);
      assert.equal(engine.check(q, correctResponse(G, q)).status, 'correct', s.id);
      VERIFY[id][s.check.t](q);
      assert.ok(s.reteach, s.id + ' reteach');
    }
    for (const sk of Object.keys(bank.skills)) assert.ok(L.screens.some((s) => s.id === L.skillScreen[sk]), 'skill screen ' + sk);
    for (const s of L.screens.filter((x) => x.steps)) assert.ok(s.why || s.kind, `${s.id} explains why`);
    assert.ok(L.notes.length > 500 && /<h2>(Vocabulary|Review sheet)<\/h2>/.test(L.notes));
    assert.equal(L.screens[L.screens.length - 1].kind, 'done');
  });
  test(`${id}: question sets are balanced, fresh and skip Teach examples`, () => {
    const L = G.lessonContent[id];
    for (let seed = 1; seed <= 200; seed++) {
      const ex = new Set(L.teachSigs);
      const set = engine.buildSet(id, { plan: bank.plan, seed, exclude: ex, skip: bank.practiceOnly });
      assert.equal(set.length, 10);
      assert.equal(new Set(set.map((x) => x.sig)).size, 10);
      for (const x of set) assert.ok(!ex.has(x.sig) && !(bank.practiceOnly || []).includes(x.id));
      const by = {};
      set.forEach((x) => { const sk = bank.byId[x.id].skill; by[sk] = (by[sk] || 0) + 1; });
      assert.deepEqual(by, bank.plan);
      assert.ok(engine.validSet(id, set, 10));
      const s = G.scoring.score(set.map((x) => engine.make(id, x.id, x.seed)), set.map((x) => correctResponse(G, engine.make(id, x.id, x.seed))));
      assert.equal(s.correct, 10);
    }
  });
}

test('curriculum review regressions (Lessons 2–4)', () => {
  // Lesson 4 order feedback never says "Positions 1 to 0".
  for (const id of ['O1', 'O2', 'O3', 'W2']) for (let seed = 1; seed <= 150; seed++) {
    const q = engine.make('d04', id, seed);
    const perms = [q.answer.slice().reverse(), [q.answer[1], q.answer[0], ...q.answer.slice(2)], [...q.answer.slice(1), q.answer[0]]];
    for (const w of perms) { const m = engine.check(q, w).message || ''; assert.doesNotMatch(m, /Positions 1 to [01]\b/, id + ' ' + m); }
  }
  // R2 says how many places the digit moved.
  const r2 = engine.make('d02', 'R2', 1, { d: 6, kind: 'times', ib: 3 });
  assert.match(engine.check(r2, '6').message, /3 places/);
  // F1 Hint 2 never prints "0.0." for a zero tenths digit.
  for (let seed = 1; seed <= 400; seed++) assert.doesNotMatch(strip(engine.make('d02', 'F1', seed).hints[1]), /written 0\.0\./);
  // Expanded form also accepts digit × place value.
  const f3 = engine.make('d02', 'F3', 1, { num: '6.208' });
  assert.equal(engine.check(f3, '6 × 1 + 2 × 0.1 + 8 × 0.001').status, 'correct');
  assert.equal(engine.check(f3, '6 x 1 + 2 x 0.1 + 8 x 0.001').status, 'correct');
  assert.equal(engine.check(f3, '6 × 1 + 2 × 0.3 + 8 × 0.001').status, 'invalid');
  assert.equal(engine.check(f3, '(6 × 1) + (2 × 0.1) + (8 × 0.001)').status, 'correct');
  // One meaning of "placeholder zero": Lesson 4 talks about zeros at the end.
  assert.doesNotMatch(G.lessonContent.d04.notes, /<dt>Placeholder zero<\/dt>/);
  assert.doesNotMatch(engine.banks.d04.skills.align, /placeholder/i);
  // Number-line questions without points say "imagine".
  for (let seed = 1; seed <= 50; seed++) {
    for (const [l, t] of [['d03', 'NL2'], ['d04', 'NL1']]) { const q = engine.make(l, t, seed); if (!/<circle/.test(q.visual)) assert.match(q.prompt, /Imagine/); }
  }
  // R1 stays with neighbouring places (5.NR.1.1).
  for (let seed = 1; seed <= 300; seed++) assert.ok(['10 times as much as', '1/10 as much as'].includes(engine.make('d02', 'R1', seed).answer));
  // "Between" is taught before it is practised.
  assert.ok(G.lessonContent.d03.screens.some((x) => x.id === 'between'));
  assert.match(engine.make('d03', 'L3', 1).prompt, /up to three decimal places/);
});

test('curriculum review regressions (Lessons 5–8)', () => {
  // L5: a rounded answer shows the rounding place (3.0, not 3), with a message that does not give it away.
  const k1 = engine.make('d05', 'K1', 1, { x: '2.96', place: 'tenth' });
  assert.equal(engine.check(k1, '3.0').status, 'correct');
  assert.equal(engine.check(k1, '3').status, 'wrong');
  assert.match(engine.check(k1, '3').message, /right amount/);
  assert.equal(engine.check(engine.make('d05', 'T1', 1, { x: '6.28' }), '6.30').status, 'wrong');
  assert.match(strip(engine.make('d05', 'K1', 1, { x: '6.997', place: 'hundredth' }).hints[2]), /keep regrouping/);
  // L6/L7: number-line hints talk about jumps, like the feedback.
  for (let seed = 1; seed <= 50; seed++) { assert.match(engine.make('d06', 'AM3', seed).hints[2], /jumps/); assert.match(engine.make('d07', 'SM2', seed).hints[2], /jumps/); }
  // L7: SZ1 hint regroups from the tens when the ones digit is 0, and mentions hundredths only when needed.
  const sz = engine.make('d07', 'SZ1', 1, { a: '10', b: '5.4' });
  assert.match(sz.hints[2], /taking one ten/); assert.doesNotMatch(sz.hints[2], /hundredths/);
  // L7: every equation offered in SC1 is true.
  for (let seed = 1; seed <= 300; seed++) {
    for (const c of engine.make('d07', 'SC1', seed).choices) {
      const m = c.value.match(/^(\S+) ([+−]) (\S+) = (\S+)$/);
      const v = m[2] === '+' ? D.toThousandths(m[1]) + D.toThousandths(m[3]) : D.toThousandths(m[1]) - D.toThousandths(m[3]);
      assert.equal(v, D.toThousandths(m[4]), c.value);
    }
  }
  // L8: P1 feedback for an unchanged number and for one place too few.
  const p1 = engine.make('d08', 'P1', 1, { x: '2.37', f: 100 });
  assert.match(engine.check(p1, '2.37').message, /started with/);
  assert.match(engine.check(p1, '23.7').message, /one place too few/);
  assert.match(engine.check(engine.make('d08', 'P1', 1, { x: '2.37', f: 1000 }), '237').message, /one place too few/);
  // L8: no "about 0" estimates; D1 products never end in 0 (so counting places always matches the answer).
  for (let seed = 1; seed <= 300; seed++) {
    for (const id of ['W1', 'K1']) { const q = engine.make('d08', id, seed); const w = num1(engine.check(q, D.fromThousandths(D.toThousandths(q.answer) * 10, 3)).message); assert.doesNotMatch(w + strip(q.why), /about 0(?![.\d])/, id); }
    const d1 = engine.make('d08', 'D1', seed); assert.equal(D.parse(d1.answer).places, D.parse(numbersIn(d1)[3]).places + D.parse(numbersIn(d1)[4]).places);
  }
});
function num1(x) { return String(x || ''); }

test('QA review regressions (Lessons 5–8)', () => {
  // The area model's screen-reader text never states the overlap count (the answer in a test question).
  for (let seed = 1; seed <= 200; seed++) assert.doesNotMatch(engine.make('d08', 'A1', seed).visual, /overlap in \d/);
  // Lesson 8 explanations show the counted decimal places before simplifying.
  assert.match(strip(engine.make('d08', 'A2', 1, { a: '0.4', b: '0.5' }).why), /0\.20 = 0\.2/);
  assert.match(strip(engine.make('d08', 'W1', 1, { a: '6.5', n: 8 }).why), /52\.0 = 52/);
  for (let seed = 1; seed <= 300; seed++) {
    for (const id of ['W1', 'A2']) {
      const q = engine.make('d08', id, seed); const t = strip(q.why);
      const P = Number((t.match(/(\d) decimal place/) || [])[1]);
      const shown = t.match(/= ([\d.]+)(?: = [\d.]+)?(?: \(|\.$)/)[1];
      assert.equal(D.parse(shown).places, P, `${id}/${seed}: ${t}`);
    }
  }
  // Stacked charts: no decimal point after a whole number when zeros are not written.
  assert.doesNotMatch(G.models.stack(['3.47', '347'], { pad: false }), /<td>7<\/td><td class="pv-point" aria-label="decimal point">\.<\/td><\/tr>/);
});

test('curriculum review regressions (Lessons 9–10)', () => {
  // L9: no dividend needs extra zeros written on it; every dividend has a decimal point.
  for (const id of ['W1', 'W2', 'K1', 'K2']) for (let seed = 1; seed <= 400; seed++) {
    const q = engine.make('d09', id, seed);
    const xs = numbersIn(q); const a = id === 'K1' ? xs[1] : xs[0];
    assert.ok(D.parse(a).places >= 1 && D.parse(a).places >= D.parse(q.answer).places, `${id}/${seed}: ${a} -> ${q.answer}`);
  }
  // L9: no division by a decimal among the C1 choices.
  for (let seed = 1; seed <= 200; seed++) for (const c of engine.make('d09', 'C1', seed).choices) assert.doesNotMatch(c.value, /÷/);
  // L10: X1 always needs a rounding step; the halfway case can appear.
  let halfway = 0;
  for (let seed = 1; seed <= 600; seed++) {
    const q = engine.make('d10', 'X1', seed); const [a, b] = numbersIn(q); const k = sumOf([a, b]);
    assert.notEqual(k % 100, 0, `X1/${seed}`); if (k % 100 === 50) halfway++;
  }
  assert.ok(halfway > 0, 'X1 includes the halfway case');
  // L10 reviews greatest-to-least ordering and halfway rounding.
  assert.ok(engine.banks.d10.byId.RC4 && engine.banks.d10.byId.RR4);
});

test('mathematics review regressions (Lessons 9–10, second pass)', () => {
  for (let seed = 1; seed <= 300; seed++) {
    // L9 C1: every choice is a multiplication; the last hint names no numbers from the right choice.
    const c1 = engine.make('d09', 'C1', seed);
    for (const c of c1.choices) assert.match(c.value, /×/);
    assert.doesNotMatch(c1.hints[2], /\d/);
    // L9 M1/M2: the "wrong unit" feedback does not name the answer's count.
    const m1 = engine.make('d09', 'M1', seed), m2 = engine.make('d09', 'M2', seed);
    assert.doesNotMatch(m1.diagnose(String(D.toThousandths(m1.answer) / 10000), { th: D.toThousandths(m1.answer) / 10 }), /each group gets/);
    assert.doesNotMatch(m2.diagnose('x', { th: D.toThousandths(m2.answer) * 10 }), /answer is/);
    // L9 K1: fallback feedback keeps dollars.
    const k1 = engine.make('d09', 'K1', seed);
    assert.match(k1.diagnose('1', { th: 1000 }), /should equal \$\d+\.\d\d\./);
    // L10 X4: the ones digit of the difference never equals the asked digit.
    const x4 = engine.make('d10', 'X4', seed); const [a, b] = numbersIn(x4); const k = D.toThousandths(a) - D.toThousandths(b);
    assert.notEqual(String(Math.floor(k / 1000) % 10), x4.answer, `X4/${seed}`);
  }
  // L9 C2: no wrong "Yes" choice has a true reason.
  for (let seed = 1; seed <= 300; seed++) for (const c of engine.make('d09', 'C2', seed).choices) assert.doesNotMatch(c.value, /^Yes, because .* has one decimal place/);
});

test('QA review regressions (Lessons 9–10)', () => {
  // L10 X4: always four choices, and the answer is not given away by its neighbouring digits.
  let middle = 0;
  for (let seed = 1; seed <= 2000; seed++) {
    const q = engine.make('d10', 'X4', seed); const vs = q.choices.map((c) => c.value);
    assert.equal(new Set(vs).size, 4, `X4/${seed}`);
    const n = Number(q.answer);
    if (vs.includes(String((n + 1) % 10)) && vs.includes(String((n + 9) % 10))) middle++;
  }
  assert.ok(middle < 2000 * 0.2, `X4 answer sits between its neighbours in ${middle} of 2000`);
});
