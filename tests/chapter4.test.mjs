import test from "node:test";
import assert from "node:assert/strict";
import { loadGML, CORE } from "./lib/load.mjs";
globalThis.window = globalThis;
const G = loadGML([
  ...CORE,
  "js/scoring.js",
  "curriculum/chapter4/outline.js",
  "curriculum/chapter4/content.js",
  "curriculum/chapter4/learn.js",
]);
// Independent conversion: no production decimal helper used as the answer oracle.
const cents = (s) => {
  const [w, f = ""] = String(s).split(".");
  return BigInt(w) * 100n + BigInt(f.padEnd(2, "0"));
};
for (const [idx, l] of G.chapter4.lessons.entries()) {
  test(`${l.id}: source metadata and complete teaching screens`, () => {
    assert.equal(l.page, [101, 107, 111, 115, 119, 123, 127, 131][idx]);
    const ss = G.chapter4.screens[idx];
    assert.equal(ss.length, 5);
    assert.ok(ss.at(-1).check);
    for (const s of ss) assert.ok(s.html.length > 50);
  });
  test(`${l.id}: independently recompute 5400 generated tasks, choices and hints`, () => {
    for (const t of G.engine.banks[l.id].templates)
      for (let seed = 1; seed <= 300; seed++) {
        const q = G.engine.make(l.id, t.id, seed),
          m = q.meta;
        assert.equal(G.engine.check(q, q.answer).status, "correct");
        assert.equal(q.hints.length, 3);
        assert.ok(q.solution && q.why);
        if (q.type === "number") {
          let want =
            m.op === "+"
              ? BigInt(m.a) + BigInt(m.b)
              : BigInt(m.a) - BigInt(m.b);
          if (idx === 0) {
            const u = BigInt(m.unit),
              round = (x) => ((BigInt(x) + u / 2n) / u) * u;
            want =
              m.op === "+" ? round(m.a) + round(m.b) : round(m.a) - round(m.b);
          } else if (m.kind === "multi")
            want =
              m.op === "−"
                ? want - BigInt(m.c)
                : [2, 3].includes(m.n)
                  ? want + BigInt(m.c)
                  : BigInt(m.c);
          assert.equal(cents(q.answer), want, JSON.stringify(m));
          assert.ok(want >= 0n);
        } else {
          assert.equal(q.choices.filter((c) => c.value === q.answer).length, 1);
          assert.equal(
            new Set(q.choices.map((c) => c.text)).size,
            q.choices.length,
          );
          for (const c of q.choices)
            if (c.value !== q.answer)
              assert.equal(G.engine.check(q, c.value).status, "wrong");
        }
      }
  });
  test(`${l.id}: 10 questions, mixed kinds, fresh sessions and meaningful levels`, () => {
    const a = G.chapter4.build(l.id, "test", 100),
      b = G.chapter4.build(
        l.id,
        "test",
        101,
        2,
        a.map((x) => x.sig),
      );
    assert.equal(a.length, 10);
    assert.equal(new Set(a.map((x) => x.sig)).size, 10);
    assert.ok(b.every((x) => !a.some((y) => x.sig === y.sig)));
    assert.equal(new Set(a.map((x) => x.id.split("-")[0])).size, 6);
    const low = G.engine.make(l.id, "calculate-1", 111),
      high = G.engine.make(l.id, "calculate-3", 111);
    assert.notDeepEqual([low.meta.a, low.meta.b], [high.meta.a, high.meta.b]);
  });
}
test("Chapter blueprint: all lessons, models, strategy explanations, multistep and 25 total", () => {
  const set = G.chapter4.build("final", "test", 567);
  assert.equal(set.length, 25);
  for (const l of G.chapter4.lessons)
    assert.ok(set.filter((x) => x.lesson === l.id).length >= 3);
  for (const l of ["4-2", "4-3", "4-5", "4-6"])
    assert.ok(set.some((x) => x.lesson === l && x.id.startsWith("visual")));
  for (const l of ["4-4", "4-7", "4-8"])
    assert.ok(set.some((x) => x.lesson === l && x.id.startsWith("reason")));
  assert.ok(set.some((x) => x.lesson === "4-8" && x.id.startsWith("multi")));
  assert.equal(G.chapter4.build("review", "practice", 8).length, 24);
});
test("Mastery boundary: 8/10 not mastered, 9/10 mastered; granular weak skills", () => {
  const qs = G.chapter4.build("4-4", "test", 88).map(G.chapter4.make);
  const answers = qs.map((q) => q.answer);
  answers[0] = "wrong";
  assert.equal(G.scoring.score(qs, answers).mastered, true);
  answers[1] = "wrong";
  const s = G.scoring.score(qs, answers);
  assert.equal(s.mastered, false);
  assert.ok(Object.keys(s.skills).every((x) => x.startsWith("4-4:")));
});
test("Model grids have exactly 100 cells per whole and accurate shaded counts", () => {
  for (const n of [0, 1, 10, 99, 100, 101, 127, 199]) {
    const h = G.chapter4.grid(n);
    assert.equal((h.match(/class="m-on"/g) || []).length, n);
    assert.equal(
      (h.match(/class="m-(?:on|off)"/g) || []).length,
      100 * Math.max(1, Math.ceil(n / 100)),
    );
  }
});

test('Thousandths benchmark comparisons independently match the sum',()=>{for(let seed=1;seed<=500;seed++){const q=G.engine.make('4-1','multi-3',seed);const [a,b]=q.meta.thousandths;assert.equal(q.answer,a+b<1000?'less':a+b>1000?'greater':'equal');}});
