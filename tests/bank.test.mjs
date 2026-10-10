// Deterministic verification of the D01 question bank: every generated question (thousands of seeds per
// template) has a correct answer key, consistent pictures, valid choices, three hints that do not give the
// answer away, and feedback for wrong answers. Run: npm test
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadGML } from './lib/load.mjs';

const G = loadGML();
const { D, engine, words: W } = G;
const bank = engine.banks.d01;
const SEEDS = 600;
const strip = (h) => String(h || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ');

test('exact decimal helpers', () => {
  assert.equal(D.cmp('0.4', '0.35'), 1);
  assert.equal(D.cmp('0.5', '0.50'), 0);
  assert.equal(D.cmp('0.05', '0.5'), -1);
  assert.equal(D.cmp('.5', '0.5'), 0);
  assert.equal(D.cmp('10.1', '9.99'), 1);
  assert.equal(D.toThousandths('0.35'), 350);
  assert.equal(D.toThousandths('1.007'), 1007);
  assert.equal(D.fromThousandths(70, 2), '0.07');
  assert.equal(D.fromThousandths(500, 1), '0.5');
  assert.equal(D.fromThousandths(500, 3), '0.500');
  assert.throws(() => D.fromThousandths(75, 1));
  for (const bad of ['', ' ', 'abc', '1..2', '0,5', '-0.5', '.', '1.2.3', '0.5a', '½']) assert.equal(D.parse(bad), null, bad);
  assert.deepEqual(D.digits('2.07'), { ones: '2', tenths: '0', hundredths: '7', thousandths: '0' });
  assert.equal(D.canonical('0.500'), '0.5');
});

test('number words', () => {
  assert.equal(W.intWords(207), 'two hundred seven');
  assert.equal(W.intWords(43), 'forty-three');
  assert.equal(W.decimalWords('0.43'), 'forty-three hundredths');
  assert.equal(W.decimalWords('0.207'), 'two hundred seven thousandths');
  assert.equal(W.decimalWords('3.04'), 'three and four hundredths');
  assert.equal(W.decimalWords('0.1'), 'one tenth');
  assert.equal(W.decimalWords('0.001'), 'one thousandth');
  assert.equal(W.decimalWords('0.50'), 'fifty hundredths');
});

test('bank has at least 25 templates covering every skill', () => {
  assert.ok(bank.templates.length >= 25, `only ${bank.templates.length} templates`);
  for (const sk of Object.keys(bank.skills)) assert.ok(bank.templates.some((t) => t.skill === sk), sk);
  assert.equal(Object.values(bank.plan).reduce((a, b) => a + b, 0), 10);
});

function correctResponse(q) {
  if (q.type === 'chart') return D.digits(q.answer);
  return q.answer;
}

function countOn(svg) { return (svg.match(/class="m-on"/g) || []).length; }

for (const t of bank.templates) {
  test(`template ${t.id}: ${SEEDS} seeds verified`, () => {
    const sigs = new Set();
    for (let seed = 1; seed <= SEEDS; seed++) {
      const q = engine.make('d01', t.id, seed);
      const ctx = `${t.id} seed ${seed} sig ${q.sig}`;
      sigs.add(q.sig);
      assert.ok(['mc', 'number', 'build', 'chart'].includes(q.type), ctx);
      assert.ok(strip(q.prompt).trim().length > 10, ctx + ' prompt');
      assert.ok(q.why && strip(q.why).trim(), ctx + ' why');
      assert.ok(q.answerText, ctx + ' answerText');
      assert.equal(q.hints.length, 3, ctx + ' hints');
      q.hints.forEach((h, i) => assert.ok(strip(h).trim().length > 10, `${ctx} hint ${i + 1}`));
      assert.equal(new Set(q.hints).size, 3, ctx + ' hints differ');
      q.hints.forEach((h, i) => assert.ok(!strip(q.prompt).includes(strip(h).trim().slice(0, 40)), `${ctx} hint ${i + 1} only repeats the question`));

      // The correct answer is accepted.
      assert.equal(engine.check(q, correctResponse(q)).status, 'correct', ctx + ' correct answer accepted');

      // Hints never contain the final answer (unless the answer is already printed in the question).
      if ((q.type === 'number' || (q.type === 'mc' && D.parse(q.answer) && D.parse(q.answer).places)) && !strip(q.prompt).includes(q.answer)) {
        const forms = [q.answer, D.canonical(q.answer)];
        for (const h of q.hints) for (const form of forms.filter((x) => !strip(q.prompt).includes(x))) {
          const re = new RegExp('(^|[^0-9.])' + form.replace('.', '\\.') + '(?![0-9])');
          assert.ok(!re.test(strip(h)), `${ctx}: hint reveals ${form}: ${strip(h)}`);
        }
      }

      if (q.type === 'mc') {
        const vals = q.choices.map((c) => c.value);
        assert.ok(q.choices.length >= 2, ctx);
        assert.equal(new Set(vals).size, vals.length, ctx + ' unique values');
        assert.equal(new Set(q.choices.map((c) => c.text)).size, vals.length, ctx + ' unique texts');
        assert.equal(vals.filter((v) => v === q.answer).length, 1, ctx + ' answer is a choice');
        // No other numeric choice equals the answer in value (e.g. 0.4 and 0.40 both offered).
        if (D.parse(q.answer)) for (const v of vals) if (v !== q.answer && D.parse(v)) assert.notEqual(D.cmp(v, q.answer), 0, ctx + ' equal-valued choices');
        for (const v of vals) if (v !== q.answer) {
          const r = engine.check(q, v);
          assert.equal(r.status, 'wrong', ctx);
          assert.ok(r.message && r.message.length > 10, `${ctx} feedback for ${v}`);
        }
        assert.equal(engine.check(q, null).status, 'empty');
      }
      if (q.type === 'number') {
        assert.ok(D.parse(q.answer), ctx + ' answer parses');
        assert.equal(engine.check(q, ' ' + q.answer + ' ').status, 'correct', ctx + ' spaces ok');
        if (q.places == null) {
          if (D.parse(q.answer).places) assert.equal(engine.check(q, q.answer + '0').status, 'correct', ctx + ' trailing zero accepted');
          if (q.answer.startsWith('0.')) assert.equal(engine.check(q, q.answer.slice(1)).status, 'correct', ctx + ' leading-dot accepted');
        } else {
          assert.equal(engine.check(q, D.canonical(q.answer)).status, 'wrong', ctx + ' places enforced');
        }
        const k = D.toThousandths(q.answer);
        for (const wrong of [k + 1, k + 10, k + 100, k * 10, Math.max(0, k - 10)]) {
          if (wrong === k) continue;
          const r = engine.check(q, D.fromThousandths(wrong, 3));
          assert.equal(r.status, 'wrong', `${ctx} wrong ${wrong}`);
          assert.ok(r.message && r.message.length > 10, `${ctx} feedback for ${wrong}`);
        }
        assert.equal(engine.check(q, '').status, 'empty');
        assert.equal(engine.check(q, 'abc').status, 'invalid');
      }
      if (q.type === 'build') {
        const max = q.model === 'strip' ? 10 : 100;
        assert.ok(q.answer >= 1 && q.answer < max, ctx);
        for (const w of [q.answer - 1, q.answer + 1]) if (w > 0 && w <= max) {
          const r = engine.check(q, w);
          assert.equal(r.status, 'wrong', ctx);
          assert.ok(r.message.length > 10, ctx);
        }
        const shown = strip(q.prompt).match(/(\d+\.\d+)/)[1];
        assert.equal(D.toThousandths(shown), q.answer * (q.model === 'strip' ? 100 : 10), ctx + ' prompt number matches answer');
      }
      if (q.type === 'chart') {
        const d = D.digits(q.answer);
        const wrongD = { ...d, tenths: String((Number(d.tenths) + 1) % 10) };
        assert.equal(engine.check(q, wrongD).status, 'wrong', ctx);
        assert.equal(engine.check(q, { ...d, tenths: 'x' }).status, 'invalid', ctx);
      }

      // Pictures show exactly the numbers in the answer.
      const th = q.type === 'number' ? D.toThousandths(q.answer) : null;
      if (t.id === 'M1') assert.equal(countOn(q.visual), th / 100, ctx + ' strip');
      if (t.id === 'M2' || t.id === 'M3') assert.equal(countOn(q.visual), th / 10, ctx + ' grid');
      if (t.id === 'M9') assert.equal(countOn(q.visual), Math.floor(th / 10) + 2 * (th % 10), ctx + ' zoom grid');
      if (t.id === 'M7' || t.id === 'M8') {
        const cx = Number(q.visual.match(/<circle cx="([\d.]+)"/)[1]);
        const left = t.id === 'M7' ? 0 : Math.floor(th / 100) * 100;
        assert.ok(Math.abs(cx - (24 + ((th - left) / 100) * (t.id === 'M7' ? 29.2 : 292))) < 0.01, ctx + ' point position');
        const labels = [...q.visual.matchAll(/m-bold" text-anchor="middle">([^<]+)</g)].map((m) => m[1]);
        assert.equal(D.toThousandths(labels[0]), left, ctx + ' left label');
        assert.equal(D.toThousandths(labels[1]), left + (t.id === 'M7' ? 1000 : 100), ctx + ' right label');
      }
      if (t.id === 'M4') {
        const c = q.choices.find((x) => x.value === q.answer);
        assert.equal(countOn(c.html), D.toThousandths(strip(q.prompt).match(/(\d\.\d+)/)[1]) / 10, ctx + ' model choice');
        assert.equal(new Set(q.choices.map((x) => countOn(x.html))).size, 4, ctx + ' distinct models');
      }
      if (t.id === 'E4') {
        const [bar, grid] = q.visual.split('Grid');
        const same = D.equal(D.fromThousandths(countOn(bar) * 100, 1), D.fromThousandths(countOn(grid) * 10, 2));
        assert.equal(q.answer.startsWith('Yes'), same, ctx + ' same-amount models');
      }
      if (t.id === 'PL4') {
        const cells = [...q.visual.matchAll(/<td class="">(\d)<\/td>/g)].map((m) => m[1]).join('');
        const d = D.digits(q.answer);
        assert.equal(cells, d.ones + d.tenths + d.hundredths + d.thousandths, ctx + ' chart digits');
      }
      if (t.id === 'C1' || t.id === 'C3') {
        const [x, y] = strip(q.prompt).match(/\d\.\d+/g);
        const greater = D.cmp(x, y) > 0 ? x : y;
        const want = /greater/.test(q.prompt) ? greater : (greater === x ? y : x);
        assert.equal(q.answer, want, ctx + ' comparison');
      }
      if (t.id === 'C2') {
        const [x, y] = strip(q.prompt).match(/\d\.\d+/g);
        const c = D.cmp(x, y);
        assert.equal(q.answer, c < 0 ? '<' : c > 0 ? '>' : '=', ctx);
      }
      if (t.id === 'E2') {
        const [x, y] = strip(q.prompt).match(/\d\.\d+/g);
        assert.equal(q.answer === 'Equal', D.equal(x, y), ctx);
      }
      if (t.id === 'E1' || t.id === 'E5') {
        const x = strip(q.prompt).match(/\d\.\d+/)[1] || strip(q.prompt).match(/\d\.\d+/)[0];
        const target = strip(q.prompt).match(/\d\.\d+/)[0];
        for (const c of q.choices) {
          const v = /tenth/.test(c.value) ? D.fromThousandths(Number(c.value.split(' ')[0]) * 100, 1) : c.value;
          const eq = D.equal(v, target);
          assert.equal(c.value === q.answer, t.id === 'E1' ? eq : !eq, `${ctx} choice ${c.value} vs ${x}`);
        }
      }
      if (t.id === 'W1') assert.equal(W.decimalWords(q.answer), strip(q.prompt).replace(/^Write\s+|\s+as a decimal\.\s*$/g, '').trim(), ctx);
      if (t.id === 'W2' || t.id === 'W3') assert.equal(q.answer, W.decimalWords(strip(q.prompt).match(/\d\.\d+/)[0]), ctx);
      if (t.id === 'PL3') {
        const num = strip(q.prompt).match(/\d\.\d+/)[0], d = strip(q.prompt).match(/digit\s+(\d)/)[1];
        const pl = D.parse(num).frac.indexOf(d) + 1;
        assert.equal(D.toThousandths(q.answer), Number(d) * Math.pow(10, 3 - pl), ctx);
      }
      if (t.id === 'PL1') {
        const num = strip(q.prompt).match(/\d\.\d+/)[0], place = strip(q.prompt).match(/(tenths|hundredths|thousandths)/)[1];
        assert.equal(q.answer, D.digits(num)[place], ctx);
      }
      if (t.id === 'PL6') {
        const terms = [...strip(q.prompt).matchAll(/(\d) (tenth|hundredth|thousandth)s?/g)];
        const k = terms.reduce((acc, m) => acc + Number(m[1]) * { tenth: 100, hundredth: 10, thousandth: 1 }[m[2]], 0);
        assert.equal(D.toThousandths(q.answer), k, ctx);
      }
      if (t.id === 'P3') {
        const m = strip(q.prompt).match(/How many (\w+)s are equal to (\d) (\w+?)s?\?/);
        const size = { tenth: 100, hundredth: 10, thousandth: 1 };
        assert.equal(Number(q.answer), Number(m[2]) * size[m[3]] / size[m[1]], ctx);
      }
      if (t.id === 'P5') {
        const n = Number(strip(q.prompt).match(/into (\d+) equal/)[1]), k = Number(strip(q.prompt).match(/names\s+(\d+)/)[1]);
        assert.equal(D.toThousandths(q.answer), k * 1000 / n, ctx);
      }
    }
    assert.ok(sigs.size >= 3, `${t.id} variety: ${sigs.size}`);
  });
}

test('teach checks build fixed questions that are correct', () => {
  const L = G.lessonContent.d01;
  const checks = L.screens.filter((s) => s.check);
  assert.ok(checks.length >= 3);
  for (const s of checks) {
    const q = engine.make('d01', s.check.t, 1, s.check.params);
    assert.equal(engine.check(q, correctResponse(q)).status, 'correct', s.id);
    assert.ok(s.reteach, s.id + ' has a reteach explanation');
  }
  for (const sk of Object.keys(bank.skills)) assert.ok(L.screens.some((s) => s.id === L.skillScreen[sk]), sk);
});

test('question sets: 10 questions, balanced, no repeats, no excluded questions', () => {
  const L = G.lessonContent.d01;
  for (let seed = 1; seed <= 300; seed++) {
    const ex = new Set(L.teachSigs);
    const set = engine.buildSet('d01', { plan: bank.plan, seed, exclude: ex });
    assert.equal(set.length, 10);
    assert.equal(new Set(set.map((x) => x.sig)).size, 10, 'unique');
    for (const x of set) assert.ok(!ex.has(x.sig), 'excluded sig used');
    const bySkill = {};
    set.forEach((x) => { const sk = bank.byId[x.id].skill; bySkill[sk] = (bySkill[sk] || 0) + 1; });
    assert.deepEqual(bySkill, bank.plan);
    // Rebuilding from (id, seed) gives the same question.
    for (const x of set) assert.equal(engine.make('d01', x.id, x.seed).sig, x.sig);
    // A test built after this practice set shares none of its questions.
    const test2 = engine.buildSet('d01', { plan: bank.plan, seed: seed + 100000, exclude: new Set([...ex, ...set.map((x) => x.sig)]) });
    for (const x of test2) assert.ok(!set.some((y) => y.sig === x.sig));
  }
});

test('word problem and reasoning templates have correct answers', () => {
  for (let seed = 1; seed <= 600; seed++) {
    const q = engine.make('d01', 'P6', seed);
    const n = Number(strip(q.prompt).match(/(10|100|1,000) /)[1].replace(',', ''));
    const k = Number(strip(q.prompt).match(/(?:eats|uses|beads\.) (\d+)|\. (\d+) of the beads/).slice(1).find(Boolean));
    assert.equal(D.toThousandths(q.answer), k * 1000 / n, `P6 ${seed}`);
    const c = engine.make('d01', 'C4', seed);
    const [y, x] = strip(c.prompt).match(/\d\.\d+/g);
    assert.equal(D.cmp(x, y), 1, `C4 ${seed}: ${x} should be greater than ${y}`);
    assert.ok(c.answer.startsWith('No.') && c.answer.includes('more than'), `C4 ${seed}`);
  }
});

test('reviewer regressions: feedback matches the actual mistake', () => {
  const msg = (id, params, resp) => engine.check(engine.make('d01', id, 1, params), resp).message;
  assert.match(msg('M9', { a: 0, b: 5, c: 3 }, '0.53'), /placeholder/);
  assert.match(msg('M9', { a: 4, b: 0, c: 2 }, '0.42'), /placeholder/);
  assert.match(msg('E1', { variant: 'ab', a: 5, b: 8 }, '0.85'), /switched/);
  assert.match(msg('M7', { k: 7 }, '0.8'), /too many/);
  assert.match(msg('M7', { k: 7 }, '0.6'), /too few/);
  assert.doesNotMatch(msg('M1', { k: 4 }, '0'), /which is good/);
  assert.match(msg('E3', { variant: 'a2', a: 1 }, '1.00'), /more than one whole/);
  const eq = engine.make('d01', 'C2', 1, { variant: 'equal', a: 6 });
  for (const h of eq.hints) assert.doesNotMatch(strip(h), /0\.60|60 hundredths|does not change/, 'C2 equal hints give the answer');
  assert.doesNotMatch(engine.check(eq, '<').message, /does not change/);
  assert.doesNotMatch(strip(engine.make('d01', 'C2', 1, { variant: 'trap', a: 9, b: 1, c: 2 }).hints.join(' ')), /\b0\d hundredths/);
});

test('Teach worked examples and two-choice questions stay out of the Test', () => {
  const L = G.lessonContent.d01;
  const ex = new Set(L.teachSigs);
  for (const sig of ['M1:3', 'M9:153', 'W2:0.43', 'W2:0.207', 'W1:2.5', 'P3:0:4', 'M3:4']) assert.ok(ex.has(sig), sig);
  for (let seed = 1; seed <= 200; seed++) {
    const set = engine.buildSet('d01', { plan: bank.plan, seed, exclude: ex, skip: bank.practiceOnly });
    assert.ok(set.every((x) => !bank.practiceOnly.includes(x.id) && !ex.has(x.sig)));
    for (const x of set) assert.ok(engine.make('d01', x.id, x.seed).choices === undefined || engine.make('d01', x.id, x.seed).choices.length >= 3, x.id);
  }
});
