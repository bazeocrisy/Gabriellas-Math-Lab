// Assessment integrity: no answer clues in multiple-choice banks, Practice never shows an open Test's questions,
// retakes avoid recently answered questions, and saved progress (old and new) keeps its count and mastery.
// The real storage, practice and test modules run here with in-memory storage (no browser). Run: npm test
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadGML, CORE, LESSONS } from './lib/load.mjs';
import { strip } from './lib/generic.mjs';

globalThis.window = globalThis;
const G = loadGML([...CORE, 'js/scoring.js', 'js/storage.js', 'js/practice.js', 'js/test.js', 'curriculum/chapter4/outline.js', 'curriculum/chapter4/content.js']);
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
  for (const id of [...LESSONS, ...G.chapter4.lessons.map(l => l.id)]) for (const t of engine.banks[id].templates) {
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

// ── Exact descriptions, clear feedback, contrast (audit D-06 to D-11, D-27, D-28, D-29) ──
import fs from 'node:fs';

/** Every point described in a number line's label is exactly where the dot is drawn. */
function checkLine(svg, ctx) {
  const label = (svg.match(/aria-label="([^"]*)"/) || [])[1] || '';
  const ends = [...svg.matchAll(/m-bold" text-anchor="middle">([^<]+)</g)].map((m) => m[1]);
  const from = G.D.toThousandths(ends[0]), to = G.D.toThousandths(ends[1]);
  const dots = [...svg.matchAll(/<circle cx="([\d.]+)"/g)].map((m) => Number(m[1]));
  const said = [...label.matchAll(/Point (\S+) is (\d+ and a half jumps|half a jump|\d+ jumps?) to the right/g)].map((m) => {
    const t = m[2]; const half = /half/.test(t); const w = half && t === 'half a jump' ? 0 : Number(t.match(/\d+/)[0]);
    return 2 * w + (half ? 1 : 0); // in half jumps
  });
  if (!said.length && dots.length && !/cut into 10 equal jumps/.test(label)) {
    // A written description names each point's value instead; it must be the drawn value.
    const step = (to - from) / 10;
    for (const x of dots) { const v = from + (Math.round(((x - 24) / 292) * 20) / 2) * step; assert.ok(label.includes(G.D.fromThousandths(v)), `${ctx}: ${G.D.fromThousandths(v)} not in: ${label}`); }
    return;
  }
  assert.equal(said.length, dots.length, `${ctx}: every point is described: ${label}`);
  dots.forEach((x, i) => {
    const halfJumps = Math.round(((x - 24) / 292) * 20); // 10 jumps across 292 px, counted in halves
    assert.equal(said[i], halfJumps, `${ctx}: point ${i + 1} is described at ${said[i] / 2} jumps but drawn at ${halfJumps / 2}: ${label}`);
  });
  void from; void to;
}

test('D-06: number-line descriptions give the exact position of every point (questions, Teach, Notes)', () => {
  let lines = 0;
  for (const id of LESSONS) {
    for (const t of engine.banks[id].templates) for (let seed = 1; seed <= 150; seed++) {
      const q = engine.make(id, t.id, seed);
      for (const svg of String(q.visual || '').match(/<svg class="model model-line[\s\S]*?<\/svg>/g) || []) { checkLine(svg, `${id}/${t.id}/${seed}`); lines++; }
    }
    const L = G.lessonContent[id];
    const html = L.notes + L.screens.map((s) => [s.body, s.visual, s.exampleVisual, ...(s.steps || []), s.reteach].join(' ')).join(' ');
    for (const svg of html.match(/<svg class="model model-line[\s\S]*?<\/svg>/g) || []) { checkLine(svg, `${id} Teach/Notes`); lines++; }
  }
  assert.ok(lines > 1000, `${lines} number lines checked`);
  // The audited example: 0.95 is 9 and a half jumps, not 10.
  assert.match(G.models.line({ from: 0, to: 1000, points: [{ v: 950, label: 'C' }] }), /Point C is 9 and a half jumps/);
});

test('D-07: answers that must show a set number of decimal places say so in the question', () => {
  for (const id of LESSONS) for (const t of engine.banks[id].templates) for (let seed = 1; seed <= 40; seed++) {
    const q = engine.make(id, t.id, seed);
    if (q.type === 'number' && q.places != null) assert.match(strip(q.prompt), /decimal place|after the decimal point/, `${id}/${t.id}`);
  }
  // The right amount with the wrong number of places is named as such (not as a wrong amount).
  const q = engine.make('d05', 'T1', 27);
  const r = engine.check(q, String(Number(q.answer)));
  if (q.answer !== String(Number(q.answer))) assert.match(r.message, /right amount/);
});

test('D-08: exactly-halfway rounding feedback never says "whichever it is closer to"', () => {
  let halfway = 0;
  for (const [id, t] of [['d05', 'K3'], ['d05', 'A2'], ['d10', 'RR4'], ['d05', 'T1'], ['d05', 'H1']]) for (let seed = 1; seed <= 400; seed++) {
    const q = engine.make(id, t, seed);
    // Only numbers exactly halfway between the two candidates, for the place this question rounds to.
    const x = strip(q.prompt).match(/\d+\.\d+/)[0], place = (strip(q.prompt).match(/nearest (tenth|hundredth|whole)/) || [])[1];
    const unit = place === 'hundredth' ? 10 : place === 'tenth' ? 100 : 1000;
    if (G.D.toThousandths(x) % unit !== unit / 2) continue;
    halfway++;
    const k = G.D.toThousandths(q.answer);
    for (const w of [k + 1, k - 1, k + 10, k - 10, k + 100, k - 100, k * 10].filter((x) => x > 0)) {
      const m = engine.check(q, G.D.fromThousandths(w, 3)).message || '';
      assert.doesNotMatch(m, /closer to/, `${id}/${t}/${seed}: ${m}`);
    }
  }
  assert.ok(halfway > 50, `${halfway} halfway questions checked`);
});

test('D-09: Lesson 7 SL3 hints describe the regrouping the problem really needs', () => {
  for (let seed = 1; seed <= 2000; seed++) {
    const q = engine.make('d07', 'SL3', seed);
    const [a, b] = strip(q.prompt).match(/\d+\.\d+/g);
    const { da, db } = G.kit.aligned(a, b), n = da.length;
    const hReg = da[n - 1] < db[n - 1];
    assert.equal(/so regroup|Regroup across/.test(q.hints[1]), hReg, `SL3/${seed} hint 2: ${q.hints[1]}`);
    if (hReg) assert.equal(/tenths digit is 0/.test(q.hints[1]), da[n - 2] === 0, `SL3/${seed}`);
    const top = hReg ? (da[n - 2] ? da[n - 2] - 1 : 9) : da[n - 2];
    assert.match(q.hints[2], new RegExp(`top digit is ${top}\\b`), `SL3/${seed} hint 3: ${q.hints[2]}`);
    assert.equal(/It is less than/.test(q.hints[2]), top < db[n - 2], `SL3/${seed}`);
  }
});

test('D-10, D-29: Lesson 6 AM2 feedback and explanation', () => {
  for (let seed = 1; seed <= 1500; seed++) {
    const q = engine.make('d06', 'AM2', seed);
    const t = Math.round(G.D.toThousandths(q.answer) / 100);
    const m = engine.check(q, G.D.fromThousandths(t * 10, 3)).message;
    assert.doesNotMatch(m, new RegExp(`(^|[^0-9.])${q.answer.replace('.', '\\.')}(?![0-9])`), `AM2/${seed}: ${m}`);
    assert.doesNotMatch(m, /make 1 whole\)|written with the tenths place right after/, `AM2/${seed}: ${m}`);
    assert.doesNotMatch(q.why, /\b1 tenths\b/, `AM2/${seed}: ${q.why}`);
  }
});

test('D-11: "lined up correctly?" choices are described neutrally, column by column', () => {
  for (const [id, t] of [['d06', 'AL2'], ['d07', 'SL2']]) for (let seed = 1; seed <= 200; seed++) {
    for (const c of engine.make(id, t, seed).choices) {
      const label = (c.html.match(/aria-label="([^"]*)"/) || [])[1];
      assert.ok(label && /column by column/.test(label), `${id}/${t}/${seed}`);
      assert.doesNotMatch(label, /lined up|line up/, `${id}/${t}/${seed}: ${label}`);
    }
  }
});

/** WCAG contrast ratio of two #rrggbb colors. */
function contrast(a, b) {
  const lum = (h) => { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

test('D-27, D-28: focus ring and diagram marks have at least 3:1 contrast', () => {
  const css = fs.readFileSync(new URL('../css/styles.css', import.meta.url), 'utf8');
  const ring = css.match(/--focus:\s*3px solid (#[0-9a-f]{6})/i)[1];
  for (const bg of ['#ffffff', '#f5f7fc', '#eaf1fd', '#e8f6ee', '#f1ecfb']) assert.ok(contrast(ring, bg) >= 3, `focus ring ${ring} on ${bg}: ${contrast(ring, bg).toFixed(2)}`);
  for (const cls of ['m-focus', 'm-mid', 'm-zoomline']) {
    const color = css.match(new RegExp(`\\.${cls} \\{[^}]*stroke: (#[0-9a-f]{6})`, 'i'))[1];
    assert.ok(contrast(color, '#ffffff') >= 3, `${cls} ${color}: ${contrast(color, '#ffffff').toFixed(2)}`);
  }
  const area = G.models.area(3, 4);
  for (const color of area.match(/stroke="(#[0-9a-f]{6})"/gi).map((s) => s.slice(8, 15))) assert.ok(contrast(color, '#ffffff') >= 3, `area hatch ${color}`);
  assert.match(G.models.grid(30, { cross: 5 }), /class="m-x-halo"/);
});

test('review regressions: d02 Z2 feedback, no true-fact-wrong-reason choices, ES2 feedback', () => {
  for (let seed = 1; seed <= 500; seed++) {
    const z = engine.make('d02', 'Z2', seed);
    const same = z.choices.find((c) => /same number as/.test(c.value));
    assert.match(engine.check(z, same.value).message, /different numbers/, `Z2/${seed}`);
    for (const [id, t] of [['d01', 'C4'], ['d03', 'Y1'], ['d10', 'RC3']]) {
      for (const c of engine.make(id, t, seed).choices) assert.doesNotMatch(c.value, /fewer digits, so it is greater|because it has fewer digits after/, `${id}/${t}/${seed}: ${c.value}`);
    }
    const e = engine.make('d06', 'ES2', seed);
    const digitsChoice = e.choices.find((c) => /same digits/.test(c.value));
    if (digitsChoice) assert.match(engine.check(e, digitsChoice.value).message, /same digits/, `ES2/${seed}`);
  }
});
