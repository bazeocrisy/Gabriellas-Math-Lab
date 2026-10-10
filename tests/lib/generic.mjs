// Generic checks that every question template in every lesson must pass (structure, answer key accepted,
// equivalent forms, unique choices, hints that do not give the answer, feedback for wrong answers).
import assert from 'node:assert/strict';

export const strip = (h) => String(h || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ');

export function correctResponse(G, q) {
  if (q.type === 'chart') return G.D.digits(q.answer);
  if (q.type === 'expanded') return G.kit.expanded(q.answer);
  return q.answer;
}

/** Some wrong responses a student might give, for feedback checks. */
export function wrongResponses(G, q) {
  const D = G.D;
  if (q.type === 'mc') return q.choices.map((c) => c.value).filter((v) => v !== q.answer);
  if (q.type === 'order') {
    const rev = q.answer.slice().reverse();
    const swap = q.answer.slice(); [swap[0], swap[1]] = [swap[1], swap[0]];
    return [rev, swap].filter((x) => x.join() !== q.answer.join());
  }
  if (q.type === 'expanded') {
    const k = D.toThousandths(q.answer);
    return [G.kit.expanded(D.fromThousandths(k + 1, 3)), G.kit.expanded(D.fromThousandths(k + 10, 3))];
  }
  if (q.type === 'number') {
    const k = D.toThousandths(q.answer);
    return [k + 1, k + 10, k + 100, k * 10, Math.max(0, k - 10)].filter((x) => x !== k).map((x) => D.fromThousandths(x, 3))
      .filter((x) => !(q.accept && q.accept(D.parse(x), { th: D.toThousandths(x) })));
  }
  return [];
}

export function checkTemplate(G, lessonId, t, seeds) {
  const { D, engine } = G;
  const sigs = new Set();
  for (let seed = 1; seed <= seeds; seed++) {
    const q = engine.make(lessonId, t.id, seed);
    const ctx = `${lessonId}/${t.id} seed ${seed} sig ${q.sig}`;
    sigs.add(q.sig);
    assert.ok(['mc', 'number', 'build', 'chart', 'order', 'expanded'].includes(q.type), ctx);
    assert.ok(strip(q.prompt).trim().length > 10, ctx + ' prompt');
    assert.ok(q.why && strip(q.why).trim(), ctx + ' why');
    assert.ok(q.answerText, ctx + ' answerText');
    assert.equal(q.hints.length, 3, ctx + ' hints');
    q.hints.forEach((h, i) => assert.ok(strip(h).trim().length > 10, `${ctx} hint ${i + 1}`));
    assert.equal(new Set(q.hints).size, 3, ctx + ' hints differ');
    q.hints.forEach((h, i) => assert.ok(!strip(q.prompt).includes(strip(h).trim().slice(0, 40)), `${ctx} hint ${i + 1} only repeats the question`));
    assert.equal(engine.check(q, correctResponse(G, q)).status, 'correct', ctx + ' correct answer accepted');

    // Hints never contain the final numeric answer (unless the answer is already in the question).
    const numeric = q.type === 'number' || (q.type === 'mc' && D.parse(q.answer) && D.parse(q.answer).places);
    if (numeric && !q.accept) {
      const forms = [q.answer, D.canonical(q.answer)].filter((x) => !strip(q.prompt).includes(x));
      for (const h of q.hints) for (const form of forms) {
        const re = new RegExp('(^|[^0-9.])' + form.replace('.', '\\.') + '(?![0-9])');
        assert.ok(!re.test(strip(h)), `${ctx}: hint reveals ${form}: ${strip(h)}`);
      }
    }
    if (q.type === 'order') {
      assert.ok(q.answer.length >= 3 && q.items.length === q.answer.length, ctx);
      assert.deepEqual(q.items.slice().sort(), q.answer.slice().sort(), ctx + ' items = answer');
      assert.ok(q.orderText, ctx + ' orderText');
      assert.equal(new Set(q.items.map((x) => D.canonical(String(x).replace(/[^\d.]/g, '')))).size, q.items.length, ctx + ' no equal values to order');
      assert.notEqual(q.items.join(), q.answer.join(), ctx + ' items not already in order');
      assert.equal(engine.check(q, q.answer.slice(0, 1)).status, 'invalid', ctx + ' partial order');
      assert.equal(engine.check(q, []).status, 'empty');
    }
    if (q.type === 'mc') {
      const vals = q.choices.map((c) => c.value);
      assert.ok(q.choices.length >= 2, ctx);
      assert.equal(new Set(vals).size, vals.length, ctx + ' unique values');
      assert.equal(new Set(q.choices.map((c) => c.text)).size, vals.length, ctx + ' unique texts');
      assert.equal(vals.filter((v) => v === q.answer).length, 1, ctx + ' answer is a choice');
      if (D.parse(q.answer)) for (const v of vals) if (v !== q.answer && D.parse(v)) assert.notEqual(D.cmp(v, q.answer), 0, ctx + ' equal-valued choices');
      assert.equal(engine.check(q, null).status, 'empty');
    }
    if (q.type === 'number') {
      assert.ok(D.parse(q.answer), ctx + ' answer parses');
      assert.equal(engine.check(q, ' ' + q.answer + ' ').status, 'correct', ctx + ' spaces ok');
      if (q.places == null && !q.accept && D.parse(q.answer).places) assert.equal(engine.check(q, q.answer + '0').status, 'correct', ctx + ' trailing zero accepted');
      assert.equal(engine.check(q, '').status, 'empty');
      assert.equal(engine.check(q, 'abc').status, 'invalid');
    }
    if (q.type === 'expanded') {
      const ex = G.kit.expanded(q.answer);
      assert.equal(engine.check(q, ex.split(' + ').reverse().join('+')).status, 'correct', ctx + ' any order, no spaces');
      assert.equal(engine.check(q, q.answer).status, 'wrong', ctx + ' standard form is not expanded form');
      assert.equal(engine.check(q, 'abc').status, 'invalid');
    }
    for (const w of wrongResponses(G, q)) {
      const r = engine.check(q, w);
      assert.equal(r.status, 'wrong', `${ctx} wrong ${JSON.stringify(w)}`);
      assert.ok(r.message && r.message.length > 10, `${ctx} feedback for ${JSON.stringify(w)}`);
      if (q.type === 'number' && !strip(q.prompt).includes(q.answer) && !q.accept) {
        const re = new RegExp('(^|[^0-9.])' + q.answer.replace('.', '\\.') + '(?![0-9])');
        assert.ok(!re.test(r.message), `${ctx}: feedback reveals ${q.answer}: ${r.message}`);
      }
    }
  }
  assert.ok(sigs.size >= 3, `${lessonId}/${t.id} variety: ${sigs.size}`);
  return sigs.size;
}
