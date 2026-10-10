// Scoring and answer-checking edge cases. Run: npm test
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadGML, CORE } from './lib/load.mjs';

const G = loadGML([...CORE, 'js/scoring.js']);
const { engine, scoring, D } = G;
const bank = engine.banks.d01;

function testSet(seed) {
  const set = engine.buildSet('d01', { plan: bank.plan, seed });
  return set.map((x) => engine.make('d01', x.id, x.seed));
}
const right = (q) => (q.type === 'chart' ? D.digits(q.answer) : q.answer);
const wrong = (q) => {
  if (q.type === 'mc') return q.choices.find((c) => c.value !== q.answer).value;
  if (q.type === 'build') return q.answer === 1 ? 2 : q.answer - 1;
  if (q.type === 'chart') { const d = D.digits(q.answer); return { ...d, thousandths: String((Number(d.thousandths) + 1) % 10) }; }
  return D.fromThousandths(D.toThousandths(q.answer) + 1, 3);
};

test('scores every count from 0 to 10 exactly; mastery needs 9', () => {
  for (let seed = 1; seed <= 40; seed++) {
    const qs = testSet(seed);
    for (let k = 0; k <= 10; k++) {
      const answers = qs.map((q, i) => (i < k ? right(q) : wrong(q)));
      const s = scoring.score(qs, answers);
      assert.equal(s.correct, k);
      assert.equal(s.total, 10);
      assert.equal(s.percent, k * 10);
      assert.equal(s.mastered, k >= 9, `k=${k}`);
      const missed = new Set(qs.filter((_, i) => i >= k).map((q) => q.skill));
      assert.deepEqual(new Set(s.missedSkills), missed);
      const sum = Object.values(s.skills).reduce((a, b) => a + b.total, 0);
      assert.equal(sum, 10);
    }
  }
});

test('blank answers count as incorrect, not as errors', () => {
  const qs = testSet(7);
  const s = scoring.score(qs, qs.map(() => null));
  assert.equal(s.correct, 0);
  assert.ok(s.items.every((x) => !x.answered));
  assert.deepEqual(new Set(s.missedSkills), new Set(Object.keys(bank.plan)));
  for (const q of qs) assert.equal(engine.describe(q, null), '(no answer)');
});

test('equivalent typed decimals are accepted when the question does not ask for a form', () => {
  const q = engine.make('d01', 'M3', 1, { c: 4 });
  for (const r of ['0.4', '0.40', '.4', '0.400', ' 0.4 ']) assert.equal(engine.check(q, r).status, 'correct', r);
  for (const r of ['0.04', '4', '0.44']) assert.equal(engine.check(q, r).status, 'wrong', r);
  assert.equal(engine.check(q, '0,4').status, 'invalid');
  // A question that asks for exactly 2 decimal places enforces the form.
  const e = engine.make('d01', 'E3', 1, { variant: 'a2', a: 4 });
  assert.equal(engine.check(e, '0.40').status, 'correct');
  assert.equal(engine.check(e, '0.4').status, 'wrong');
  assert.match(engine.check(e, '0.4').message, /right amount/);
});

test('every wrong answer type gets feedback that does not state the answer', () => {
  for (const t of bank.templates) {
    for (let seed = 1; seed <= 200; seed++) {
      const q = engine.make('d01', t.id, seed);
      const r = engine.check(q, wrong(q));
      assert.equal(r.status, 'wrong');
      if (q.type === 'number' && !q.prompt.includes(q.answer)) {
        const re = new RegExp('(^|[^0-9.])' + q.answer.replace('.', '\\.') + '(?![0-9])');
        assert.ok(!re.test(r.message), `${t.id}/${seed}: feedback reveals ${q.answer}: ${r.message}`);
      }
    }
  }
});

test('test and practice sets differ and retakes are fresh', () => {
  const ex = new Set(G.lessonContent.d01.teachSigs);
  const practice = engine.buildSet('d01', { plan: bank.plan, seed: 11, exclude: ex });
  const t1 = engine.buildSet('d01', { plan: bank.plan, seed: 12, exclude: new Set([...ex, ...practice.map((x) => x.sig)]) });
  const t2 = engine.buildSet('d01', { plan: bank.plan, seed: 13, exclude: new Set([...ex, ...practice.map((x) => x.sig), ...t1.map((x) => x.sig)]) });
  const sigs = (s) => new Set(s.map((x) => x.sig));
  for (const x of t1) assert.ok(!sigs(practice).has(x.sig));
  for (const x of t2) assert.ok(!sigs(t1).has(x.sig) && !sigs(practice).has(x.sig));
});
