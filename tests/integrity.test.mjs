// Assessment integrity: no answer clues in multiple-choice banks, Practice never shows an open Test's questions,
// retakes avoid recently answered questions, and saved progress (old and new) keeps its count and mastery.
// The real storage, practice and test modules run here with in-memory storage (no browser). Run: npm test
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadGML, CORE, LESSONS } from './lib/load.mjs';
import { strip } from './lib/generic.mjs';

const G = loadGML([...CORE, 'js/scoring.js', 'js/storage.js', 'js/practice.js', 'js/test.js']);
const { engine, store } = G;
// A stand-in for the browser's localStorage (saved items are its own properties, like the real one).
class FakeStorage {
  getItem(k) { return Object.prototype.hasOwnProperty.call(this, k) ? this[k] : null; }
  setItem(k, v) { this[k] = String(v); }
  removeItem(k) { delete this[k]; }
}
globalThis.window = { localStorage: new FakeStorage() };
const sigsOf = (set) => set.map((x) => x.sig);
function reset() { store.resetAll(); for (const id of LESSONS) { store.clearDraft('test-' + id); store.clearDraft('practice-' + id); } store.update('d01', () => {}); }

// Choice sets that are fixed labels in a fixed order (symbols, or the four "as much as" relations), where position
// and length say nothing about the answer.
const FIXED_LABELS = new Set(['d02/R1', 'd03/S1', 'd03/S3', 'd03/L1', 'd03/E1', 'd10/RC1', 'd10/X2', 'd01/E2', 'd01/E4']);

test('answer clues: no multiple-choice template gives its answer away by length or position', () => {
  const N = 1000;
  const report = [];
  for (const id of LESSONS) for (const t of engine.banks[id].templates) {
    let mc = 0, longest = 0, shortest = 0, clear = 0, n = 0;
    const pos = [0, 0, 0, 0, 0, 0];
    for (let seed = 1; seed <= N; seed++) {
      const q = engine.make(id, t.id, seed);
      if (q.type !== 'mc') break;
      mc++; n = q.choices.length;
      const L = q.choices.map((c) => strip(c.text || c.label || c.value).length);
      const ai = q.choices.findIndex((c) => c.value === q.answer), a = L[ai], others = L.filter((_, i) => i !== ai);
      if (others.every((x) => x < a)) longest++;
      if (others.every((x) => x > a)) shortest++;
      if (others.every((x) => a >= x * 1.15 && a - x >= 4) || others.every((x) => x >= a * 1.15 && x - a >= 4)) clear++;
      pos[ai]++;
    }
    if (!mc || n < 3 || FIXED_LABELS.has(`${id}/${t.id}`)) continue;
    const key = `${id}/${t.id}`;
    if (longest / mc > 0.55) report.push(`${key}: answer is the longest choice in ${longest}/${mc}`);
    if (shortest / mc > 0.55) report.push(`${key}: answer is the shortest choice in ${shortest}/${mc}`);
    if (clear / mc > 0.35) report.push(`${key}: answer is clearly longer or shorter than every other choice in ${clear}/${mc}`);
    if (Math.max(...pos) / mc > 0.55) report.push(`${key}: answer sits in one position in ${Math.max(...pos)}/${mc}`);
  }
  assert.deepEqual(report, []);
});

test('answer clues: the audited templates (D-03) and d05 K2 / d03 E1 (D-12, D-13)', () => {
  for (const key of ['d01/C4', 'd02/F1', 'd02/Z2', 'd03/Y1', 'd03/Y3', 'd08/W3', 'd09/C2', 'd10/RC3']) {
    const [id, t] = key.split('/');
    let longest = 0, shortest = 0;
    for (let seed = 1; seed <= 2000; seed++) {
      const q = engine.make(id, t, seed);
      const L = q.choices.map((c) => c.value.length), a = q.answer.length, others = L.filter((_, i) => q.choices[i].value !== q.answer);
      if (others.every((x) => x < a)) longest++;
      if (others.every((x) => x > a)) shortest++;
    }
    assert.ok(longest < 1000 && shortest < 1000, `${key}: longest ${longest}, shortest ${shortest} of 2000`);
  }
  for (let seed = 1; seed <= 2000; seed++) {
    const q = engine.make('d05', 'K2', seed);
    const whole = (v) => v.split('.')[0];
    assert.ok(q.choices.filter((c) => whole(c.value) === whole(q.answer)).length >= 2, `K2/${seed}`);
  }
  let eq = 0;
  for (let seed = 1; seed <= 3000; seed++) if (engine.make('d03', 'E1', seed).answer === '=') eq++;
  assert.ok(eq / 3000 > 0.35 && eq / 3000 < 0.65, `E1 "=" share ${eq}/3000`);
});

test('D-01: Practice never contains a question from the open Test, in every lesson (50 sessions each)', () => {
  for (const id of LESSONS) {
    reset();
    const t = G.views.test.newTest(id);
    t.started = true;
    store.setDraft('test-' + id, t);
    const open = new Set(sigsOf(t.set));
    for (let k = 0; k < 50; k++) {
      store.clearDraft('practice-' + id);
      const d = G.views.practice.newSession(id);
      assert.equal(d.set.length, 10, id);
      for (const sig of sigsOf(d.set)) assert.ok(!open.has(sig), `${id}: practice repeats open test question ${sig}`);
    }
    // Both directions: a Test started while a Practice session is open leaves out the practice questions.
    const p = store.getDraft('practice-' + id);
    store.clearDraft('test-' + id);
    for (let k = 0; k < 20; k++) {
      const t2 = G.views.test.newTest(id);
      for (const sig of sigsOf(t2.set)) assert.ok(!sigsOf(p.set).includes(sig), `${id}: test repeats practice question ${sig}`);
    }
  }
});

test('D-16: three tests in a row share no question, even in the smallest banks', () => {
  for (const id of LESSONS) {
    let repeats = 0;
    for (let run = 0; run < 40; run++) {
      reset();
      const seen = [];
      for (let k = 0; k < 3; k++) {
        const d = G.views.test.newTest(id);
        d.result = { id: d.id, date: new Date().toISOString(), correct: 5, total: 10, percent: 50, mastered: false, skills: {}, missedSkills: [] };
        store.update(id, (p) => G.views.test.record(p, d));
        for (const sig of sigsOf(d.set)) if (seen.includes(sig)) repeats++;
        seen.push(...sigsOf(d.set));
      }
    }
    assert.equal(repeats, 0, `${id}: ${repeats} repeated questions across 40 runs of 3 tests`);
  }
});

test('D-02 / D-15: an attempt is recorded once; count and mastery outlive the 20-test history', () => {
  reset();
  const make = (correct, mastered, n) => ({ id: 'a' + n, set: [{ sig: 'x' + n }], result: { id: 'a' + n, date: `2026-10-${String(1 + (n % 28)).padStart(2, '0')}T00:00:00Z`, correct, total: 10, percent: correct * 10, mastered, goalMet: mastered, skills: {}, missedSkills: [] } });
  const first = make(10, true, 0);
  store.update('d03', (p) => G.views.test.record(p, first));
  store.update('d03', (p) => G.views.test.record(p, first)); // the same attempt again (a second tab)
  assert.equal(store.lesson('d03').tests.length, 1);
  assert.equal(store.lesson('d03').testsTaken, 1);
  for (let n = 1; n <= 20; n++) store.update('d03', (p) => G.views.test.record(p, make(3, false, n)));
  const l = store.lesson('d03');
  assert.equal(l.tests.length, 20, 'history keeps 20');
  assert.equal(l.testsTaken, 21, 'count keeps going');
  assert.ok(l.masteredOn, 'mastery is kept after the mastered test leaves the history');
  assert.ok(!l.tests.some((t) => t.mastered));
});

test('Decision 2: a test with lesson pages opened keeps its score but does not set mastery', () => {
  reset();
  const d = { id: 'help1', set: [{ sig: 's1' }], result: { id: 'help1', date: '2026-10-11T00:00:00Z', correct: 10, total: 10, percent: 100, goalMet: true, mastered: false, assisted: ['Lesson 4 Teach'], skills: {}, missedSkills: [] } };
  store.update('d04', (p) => G.views.test.record(p, d));
  const l = store.lesson('d04');
  assert.equal(l.tests[0].correct, 10);
  assert.equal(l.masteredOn, undefined);
  assert.deepEqual(l.tests[0].assisted, ['Lesson 4 Teach']);
});

test('older saved progress loads: count and mastery are filled in, nothing is invented', () => {
  reset();
  // Progress written by the build before these fixes (no ids, counts, mastery date or hint-free practice numbers).
  const old = { lessons: { d02: {
    teach: { screen: 3, furthest: 14, done: true },
    practice: { sessions: 2, skills: { place2: { c: 7, t: 9 } }, recentSigs: ['N1:3'] },
    tests: [{ date: '2026-10-01T00:00:00Z', correct: 9, total: 10, percent: 90, mastered: true, skills: {}, missedSkills: [] },
      { date: '2026-10-02T00:00:00Z', correct: 6, total: 10, percent: 60, mastered: false, skills: {}, missedSkills: [] }],
    lastTestSigs: ['V1:9'] } } };
  store.resetAll();
  window.localStorage.setItem('gml:v1:progress', JSON.stringify(old));
  const l = store.lesson('d02');
  assert.equal(l.testsTaken, 2);
  assert.equal(l.masteredOn, '2026-10-01T00:00:00Z');
  assert.deepEqual(l.recentTestSigs, ['V1:9']);
  assert.deepEqual(l.practice.skills.place2, { c: 7, t: 9 }, 'no hint-free numbers are made up for old sessions');
  assert.equal(l.tests[0].assisted, undefined, 'old tests are not marked as assisted');
});

test('Lesson 10 review questions never repeat a Teach example from the lesson they come from', () => {
  const L10 = G.lessonContent.d10;
  for (const [id, [lesson, src]] of Object.entries(engine.banks.d10.reused)) {
    for (const sig of G.lessonContent[lesson].teachSigs.filter((x) => x.startsWith(src + ':'))) assert.ok(L10.teachSigs.includes(id + ':' + sig), `${id} ${sig}`);
  }
  for (let seed = 1; seed <= 200; seed++) {
    const set = engine.buildSet('d10', { plan: engine.banks.d10.plan, seed, exclude: new Set(L10.teachSigs) });
    for (const x of set) assert.ok(!L10.teachSigs.includes(x.sig));
  }
});

// ── Teach what is assessed (audit D-04, D-05, D-18 to D-23) ──
const visualKind = (html) => { const m = /class="(model model-\w+|vcalc-model|pv-chart pv-stack|pv-chart|ldiv-model)/.exec(html || ''); return m ? m[1].replace('model ', '') : 'none'; };
// Special formats: [name, test on a question, test on the Teach HTML that shows it].
const MARKERS = [
  ['missing digit', (q) => /missing digit/.test(q.prompt), (h) => /▢/.test(h)],
  ['area in square meters', (q) => /square meters/.test(q.prompt), (h) => /square meter/.test(h)],
  ['related whole-number fact', (q) => /Use this to find/.test(q.prompt), (h) => /\b\d{2,} [×÷] \d+ = \d+\b/.test(h)],
  ['jumps on a number line', (q) => /jump/i.test(q.prompt) && /model-line/.test(q.visual || ''), (h) => /m-hop/.test(h)],
  ['point on a number line', (q) => /at point/.test(q.prompt) && /model-line/.test(q.visual || ''), (h) => /model-line/.test(h) && /m-dot/.test(h)]
];
function teachHTML(id) {
  const L = G.lessonContent[id];
  return L.screens.map((s) => [s.body, s.visual, s.exampleVisual, s.example, ...(s.steps || [])].join(' ')).join(' ');
}
function checkTypes(id) {
  const L = G.lessonContent[id];
  return new Set(L.screens.filter((s) => s.check).map((s) => { const q = engine.make(id, s.check.t, 1, s.check.params); return q.type + (q.layout ? '/' + q.layout : ''); }));
}

test('every Practice and Test format is taught first (Teach screen or guided check)', () => {
  const missing = [];
  for (const id of LESSONS) {
    // Lesson 10 reviews Lessons 1-7, so their teaching counts for it too.
    const scope = id === 'd10' ? ['d01', 'd02', 'd03', 'd04', 'd05', 'd06', 'd07', 'd10'] : [id];
    const html = scope.map(teachHTML).join(' ');
    const types = new Set(scope.flatMap((x) => [...checkTypes(x)]));
    const kinds = new Set([...html.matchAll(/class="(model model-\w+|vcalc-model|pv-chart pv-stack|pv-chart|ldiv-model)/g)].map((m) => m[1].replace('model ', '')));
    for (const t of engine.banks[id].templates) {
      if ((engine.banks[id].practiceOnly || []).includes(t.id)) continue;
      for (let seed = 1; seed <= 60; seed++) {
        const q = engine.make(id, t.id, seed);
        const type = q.type + (q.layout ? '/' + q.layout : '');
        // Answer types beyond typing a number or picking a choice need a guided try in Teach.
        if (!['number', 'mc'].includes(q.type) && !types.has(type) && !(q.type === 'build' && scope.some((x) => G.lessonContent[x].screens.some((s) => s.widget)))) missing.push(`${id}/${t.id}: answer type ${type} has no guided check`);
        if (q.layout === 'symbols' && !types.has('mc/symbols') && !/&gt;/.test(html)) missing.push(`${id}/${t.id}: symbols not taught`);
        const kind = visualKind(q.visual);
        if (kind !== 'none' && !kinds.has(kind)) missing.push(`${id}/${t.id}: picture ${kind} not shown in Teach`);
        for (const [name, onQ, onTeach] of MARKERS) if (onQ(q) && !onTeach(html)) missing.push(`${id}/${t.id}: ${name} not taught`);
      }
    }
  }
  assert.deepEqual([...new Set(missing)], []);
});

test('every skill has a guided check in Teach', () => {
  for (const id of LESSONS) {
    const L = G.lessonContent[id];
    for (const sk of Object.keys(engine.banks[id].skills)) assert.ok(L.screens.some((s) => s.kind === 'check' && s.skill === sk), `${id}: ${sk}`);
  }
});
