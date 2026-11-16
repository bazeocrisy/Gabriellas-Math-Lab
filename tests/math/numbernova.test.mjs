// NumberNova: study-guide library and the Practice Center (question generation, sessions, history).
// Run: npm test
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { loadGML, CORE, ROOT, LESSONS } from './lib/load.mjs';

const G = loadGML([...CORE, 'js/scoring.js', 'js/storage.js', 'js/guides.js']);

test('study guides: all eight existing PDFs are listed, in order, and exist in the repository', () => {
  const list = G.guides.list;
  assert.equal(list.length, 8);
  assert.deepEqual(list.map((g) => g.n), [1, 2, 3, 4, 5, 6, 7, 8]);
  for (const g of list) {
    assert.match(g.url, /^study-guides\/pdf\/decimals\/Decimals-Section-\d-[\w-]+\.pdf$/, 'repository-relative path');
    const file = path.join(ROOT, g.url);
    assert.ok(fs.existsSync(file), g.url);
    assert.equal(fs.readFileSync(file).subarray(0, 5).toString(), '%PDF-', g.url + ' is a PDF');
  }
  // Exactly the eight PDFs in the folder: none missing, none invented.
  const onDisk = fs.readdirSync(path.join(ROOT, 'study-guides/pdf/decimals')).filter((f) => f.endsWith('.pdf')).sort();
  assert.deepEqual(list.map((g) => g.file).sort(), onDisk);
});

test('study guides: every lesson and every practice operation has a matching guide', () => {
  for (const id of LESSONS) assert.ok(G.guides.forLesson(id), id);
  for (const op of ['add', 'sub', 'mul', 'div', 'mix']) assert.ok(G.guides.forOp(op), op);
  assert.equal(G.guides.forOp('add').n, 4);
  assert.equal(G.guides.forOp('div').n, 7);
  assert.match(G.guides.link(G.guides.forLesson('d05')), /Section 3, Rounding Decimals/);
});

// ───────────────────────── Practice Center ─────────────────────────
import { checkTemplate, strip as stripHtml } from './lib/generic.mjs';
const P = loadGML([...CORE, 'js/scoring.js', 'js/storage.js', 'js/practice-gen.js', 'js/coach.js', 'js/practice-center.js', 'js/guides.js']);
class FakeStorage {
  getItem(k) { return Object.prototype.hasOwnProperty.call(this, k) ? this[k] : null; }
  setItem(k, v) { this[k] = String(v); }
  removeItem(k) { delete this[k]; }
}
globalThis.window = { localStorage: new FakeStorage() };
const { engine: E, D, practiceGen: PG } = P;
const PC_SEEDS = 400;

/** Independent answer for a Practice Center question, from the numbers the student sees (not the generator's values). */
function recompute(q) {
  const t = stripHtml(q.prompt).replace(/\$/g, '');
  const ns = (t.match(/\d+\.\d+|\d+/g) || []).map((x) => D.toThousandths(x));
  const id = q.template;
  if (/^A/.test(id)) return ns.reduce((a, b) => a + b, 0);
  if (id === 'S5') return /change/.test(t) ? ns[1] - ns[0] : ns[0] - ns[1];
  if (id === 'SC3') return ns[0] - ns[1] - ns[2];
  if (/^S/.test(id)) return ns[0] - ns[1];
  if (/^M/.test(id)) { const [a, b] = id === 'M5' && /each/.test(t) ? [ns[0], ns[1]] : ns; return a * b / 1000; }
  if (id === 'D4F') { const k = ns.length; return ns[k - 2] / (ns[k - 1] / 1000); } // "A ÷ n = Q. Use this to find a ÷ n."
  if (id === 'D5' || id === 'DC3') return ns[1] / (ns[0] / 1000); // "n friends share $a"
  if (id === 'D2') return ns[0] / (ns[1] / 1000);
  if (/^D/.test(id)) return ns[0] / (ns[1] / 1000);
  throw new Error('no verifier for ' + id);
}

test('Practice Center: every template passes the generic checks and an independent answer check', () => {
  assert.ok(E.banks.pc.templates.length >= 33);
  for (const t of E.banks.pc.templates) {
    checkTemplate(P, 'pc', t, PC_SEEDS);
    for (let seed = 1; seed <= PC_SEEDS; seed++) {
      const q = E.make('pc', t.id, seed);
      assert.equal(D.toThousandths(q.answer), recompute(q), `${t.id}/${seed}: ${stripHtml(q.prompt)} -> ${q.answer}`);
      assert.ok(q.solution && stripHtml(q.solution).length > 20, `${t.id}/${seed} worked solution`);
      assert.ok(D.parse(q.answer).places <= 3);
      if (/^(A|S)/.test(t.id)) assert.ok(D.parse(q.answer).places <= 2, 'add and subtract to hundredths');
    }
  }
});

test('Practice Center: worked column solutions end with the right answer', () => {
  for (const id of ['A1', 'A2', 'A3', 'A4', 'AC3', 'S2', 'S4', 'SC1', 'SC2']) for (let seed = 1; seed <= 200; seed++) {
    const q = E.make('pc', id, seed);
    const last = stripHtml(q.solution).match(/straight down into the answer: ([\d.]+)\./);
    assert.ok(last, `${id}/${seed}`);
    assert.equal(D.toThousandths(last[1]), D.toThousandths(q.answer), `${id}/${seed}`);
  }
  for (const id of ['D3', 'D4', 'DC1', 'DC2']) for (let seed = 1; seed <= 200; seed++) {
    const q = E.make('pc', id, seed);
    assert.match(stripHtml(q.solution), new RegExp(`Check by multiplying: ${q.answer.replace('.', '\\.')} ×`), `${id}/${seed}`);
  }
});

const MODE_OPS = { add: ['add'], sub: ['sub'], mul: ['mul'], div: ['div'] };
test('Practice Center: every mode builds 10, 25 and 50 valid, unique questions that get harder', () => {
  const modes = [['add'], ['sub'], ['mul'], ['div'], ['mix'], ...['add', 'sub', 'mul', 'div', 'mix'].map((op) => ['challenge', op])];
  for (const [mode, op] of modes) for (const n of [10, 25, 50]) for (let seed = 1; seed <= 15; seed++) {
    const set = PG.buildSession({ mode, op, n, seed });
    const ctx = `${mode}${op ? '/' + op : ''} ${n} seed ${seed}`;
    assert.equal(set.length, n, ctx);
    assert.equal(new Set(set.map((x) => x.sig)).size, n, ctx + ' unique');
    assert.ok(E.validSet('pc', set, n), ctx);
    const meta = set.map((x) => PG.META[x.id]);
    const levels = meta.map((m) => m.level);
    for (let k = 1; k < n; k++) assert.ok(levels[k] >= levels[k - 1], ctx + ' levels never go down');
    const ops = meta.map((m) => m.op);
    if (mode === 'challenge') {
      assert.ok(levels.every((l) => l >= 4), ctx + ' challenge is harder');
      assert.ok(levels.some((l) => l >= 6), ctx + ' includes challenge tiers');
      if (op !== 'mix') assert.ok(ops.every((o) => o === op), ctx + ' respects the chosen operation');
    } else {
      assert.deepEqual([...new Set(levels)].sort(), [1, 2, 3, 4, 5], ctx + ' covers all five levels');
    }
    if (MODE_OPS[mode]) assert.ok(ops.every((o) => o === mode), ctx);
    if (mode === 'mix' || op === 'mix') {
      const c = ['add', 'sub', 'mul', 'div'].map((o) => ops.filter((x) => x === o).length);
      assert.ok(Math.max(...c) - Math.min(...c) <= 1, ctx + ' balanced ' + c);
    }
    if (n === 50 && mode !== 'challenge') for (let b = 0; b < 5; b++) assert.ok(levels.slice(b * 10, b * 10 + 10).every((l) => l === b + 1), ctx + ' five blocks of ten');
  }
});

test('Practice Center: Practice My Misses targets exactly the given skills with fresh questions', () => {
  for (const skills of [['add.regroup'], ['sub.zeros', 'div.fact'], ['mul.dec', 'add.word', 'div.small']]) for (const n of [10, 25, 50]) {
    const set = PG.buildSession({ mode: 'misses', n, skills, seed: 3 });
    assert.equal(set.length, n);
    assert.equal(new Set(set.map((x) => x.sig)).size, n);
    const got = new Set(set.map((x) => PG.META[x.id].skill));
    assert.deepEqual([...got].sort(), skills.slice().sort(), 'every target skill, nothing else');
  }
  assert.throws(() => PG.buildSession({ mode: 'misses', n: 10, skills: [], seed: 1 }), /no skills/);
  assert.throws(() => PG.buildSession({ mode: 'add', n: 12, seed: 1 }), /10, 25 or 50/);
});

test('Practice Center: history, results and the review list (no invented misses)', () => {
  const C = P.practiceCenter;
  P.store.resetAll();
  assert.deepEqual(C.weakSkills(), [], 'no history: nothing to review');
  const set = PG.buildSession({ mode: 'add', n: 10, seed: 9 });
  const states = set.map((x, k) => (k === 0 ? { solved: true, shown: true, attempts: 3 } : k === 1 ? { solved: true, firstTry: false, attempts: 1 } : k === 2 ? { solved: true, firstTry: true, hints: 2 } : { solved: true, firstTry: true, hints: 0 }));
  const d = { id: 's1', mode: 'add', op: null, n: 10, label: 'Adding Decimals', set, i: 9, states, finished: true, recorded: false };
  const s = C.summarize(d);
  assert.deepEqual([s.completed, s.correct, s.clean, s.helped, s.missed, s.hints], [10, 9, 7, 2, 1, 2]);
  C.record(d);
  C.record(Object.assign({}, d, { recorded: false })); // the same session again (another tab): counted once
  assert.equal(C.history().sessions.length, 1);
  const weak = C.weakSkills().map((w) => w.skill);
  const missedSkills = [0, 1].map((k) => PG.META[set[k].id].skill);
  for (const sk of missedSkills) assert.ok(weak.includes(sk), sk + ' is on the review list');
  // Lesson Practice in Lessons 6-9 also counts: under 70% first-try right on a skill (3 or more questions).
  P.store.update('d09', (p) => { p.practice.skills.dWord = { c: 1, t: 4 }; });
  assert.ok(C.weakSkills().some((w) => w.skill === 'div.word' && /Lesson 9/.test(w.from)));
  // Practice Center history never touches lesson Test records.
  for (const id of LESSONS) assert.equal(P.store.lesson(id).tests.length, 0);
});

test('review regressions: sessions never fail, never repeat a problem, never repeat an answer back to back', () => {
  for (const n of [10, 25, 50]) for (let seed = 1; seed <= 40; seed++) {
    const set = PG.buildSession({ mode: 'misses', n, skills: ['div.share'], seed });
    assert.equal(set.length, n, `div.share misses ${n}/${seed}`);
  }
  const key = (sig) => sig.replace(/^[A-Z0-9]+:/, '');
  for (const [mode, op] of [['challenge', 'mul'], ['challenge', 'div'], ['mul'], ['div'], ['mix'], ['challenge', 'mix']]) for (const n of [25, 50]) for (let seed = 1; seed <= 60; seed++) {
    const set = PG.buildSession({ mode, op, n, seed });
    assert.equal(new Set(set.map((x) => key(x.sig))).size, n, `${mode}/${op}/${n}/${seed}: same problem twice`);
    const answers = set.map((x) => E.make('pc', x.id, x.seed).answer);
    for (let k = 1; k < n; k++) assert.notEqual(answers[k], answers[k - 1], `${mode}/${op}/${n}/${seed}: same answer twice in a row at ${k}`);
  }
});

test('review regressions: feedback, solutions and word problems', () => {
  for (let seed = 1; seed <= 400; seed++) {
    // A dropped internal zero (1.4 for 1.04) gets its own message.
    const q = E.make('pc', 'DC1', seed);
    const zeroless = q.answer.replace(/\.0/, '.');
    if (zeroless !== q.answer) assert.match(E.check(q, zeroless).message, /zero is missing/, `DC1/${seed}`);
    // Subtracting from a whole number without regrouping is named as a regrouping mistake, even when it equals the sum.
    const s = E.make('pc', 'SC2', seed);
    const [a, b] = stripHtml(s.prompt).match(/\d+\.\d+|\d+/g);
    const nb = D.toThousandths(P.kit.noBorrowSub(a, b));
    if (nb !== D.toThousandths(s.answer)) assert.match(E.check(s, D.fromThousandths(nb, 3)).message, /regroup/, `SC2/${seed}`);
    // No estimate of "about 0 × n".
    for (const id of ['M2', 'M3', 'M4', 'MC2']) assert.doesNotMatch(stripHtml(E.make('pc', id, seed).solution), /about 0 ×|× 0 =/, `${id}/${seed}`);
    // Two-digit divisors get a hint about trying multiples.
    assert.match(E.make('pc', 'DC2', seed).hints[1], /two-digit divisor/);
    // Plausible stories: the plant grows less than its height; walks, bags and prices are at least 1.
    const w = E.make('pc', 'A5', seed), ns = (stripHtml(w.prompt).replace(/\$/g, '').match(/\d+\.\d+|\d+/g) || []).map(Number);
    if (/plant/.test(w.prompt)) assert.ok(ns[1] < ns[0], `A5/${seed} ${stripHtml(w.prompt)}`);
    else assert.ok(ns.every((x) => x >= 1), `A5/${seed} ${stripHtml(w.prompt)}`);
  }
  // Review Related Lesson goes to the most exact screen; Lesson 8 area-model practice feeds Practice My Misses.
  assert.equal(PG.SKILLS['add.whole'].screen, 'whole');
  assert.equal(PG.SKILLS['div.small'].screen, 'small');
  P.store.resetAll();
  P.store.update('d08', (p) => { p.practice.skills.mTenths = { c: 1, t: 5 }; });
  assert.ok(P.practiceCenter.weakSkills().some((w) => w.skill === 'mul.dec'));
});

test('review regressions: damaged practice history is repaired, and a session is recorded once', () => {
  const C = P.practiceCenter;
  for (const junk of ['{"sessions":[],"skills":{"add.basic":null}}', '{"skills":{"add.basic":{"r":"xx"}}}', '{"skills":{"add.basic":{"r":5}}}', '[1,2]', 'not json',
    '{"sessions":[{"n":10,"completed":"abc","clean":"x","label":5}],"skills":{}}']) {
    P.store.resetAll();
    window.localStorage.setItem('gml:v1:draft:pc-history', junk);
    const h = C.history();
    assert.ok(Array.isArray(h.sessions) && typeof h.skills === 'object');
    assert.doesNotThrow(() => C.weakSkills(), junk);
    for (const s of h.sessions) { assert.ok(Number.isInteger(s.completed) && Number.isInteger(s.clean)); assert.equal(typeof s.label, 'string'); }
  }
  P.store.resetAll();
  const mk = (id, seed) => { const set = PG.buildSession({ mode: 'add', n: 10, seed }); return { id, mode: 'add', n: 10, label: 'Adding Decimals', set, i: 9, states: set.map(() => ({ solved: true, firstTry: true })), finished: true, recorded: false }; };
  const X = mk('X', 1), Y = mk('Y', 2);
  C.record(X); C.record(Y); C.record(Object.assign(mk('X', 1), { recorded: false })); // an old tab finishes X again
  assert.deepEqual(C.history().sessions.map((s) => s.id), ['X', 'Y']);
  // Junk in a saved question state is never counted as right or as hints.
  const s = C.summarize(Object.assign(mk('Z', 3), { states: Array(10).fill({ solved: 'yes', hints: 'many' }) }));
  assert.deepEqual([s.correct, s.hints], [0, 0]);
});
