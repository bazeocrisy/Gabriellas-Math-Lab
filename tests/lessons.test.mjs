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
    assert.ok(L.notes.length > 500 && /<h2>Vocabulary<\/h2>/.test(L.notes));
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
    for (const w of perms) { const m = engine.check(q, w).message || ''; assert.doesNotMatch(m, /Positions 1 to [01]/, id + ' ' + m); }
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
