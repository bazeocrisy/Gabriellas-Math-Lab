import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
// Browser modules loaded as data modules (the project is buildless).
const storage = await import('data:text/javascript;base64,' + fs.readFileSync(new URL('../chapter-5/lib/storage.js', import.meta.url)).toString('base64'));
const read = (n) => JSON.parse(fs.readFileSync(new URL('../chapter-5/data/' + n + '.json', import.meta.url)));
const m = read('manifest'), fields = read('fields'), questions = read('questions');
const pages = m.pages.map((p) => p.number);

test('all 38 printed pages 141-178, in order, with unchanged image hashes', () => {
  assert.equal(m.sourcePages, 38);
  assert.deepEqual(pages, Array.from({ length: 38 }, (_, i) => String(141 + i)));
  for (const p of m.pages) {
    assert.equal(p.pdfPage, Number(p.number) - 140);
    assert.equal(p.width / p.height, 612 / 792);
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(new URL('../chapter-5/' + p.asset, import.meta.url))).digest('hex'), p.sha256, p.number);
  }
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(new URL('../lesson-5-1/assets/source.pdf', import.meta.url))).digest('hex'), m.sourceSha256);
});
test('sections cover every page exactly once', () => {
  const all = m.sections.flatMap((s) => s.pages);
  assert.deepEqual(all, pages);
  for (const s of m.sections) assert.ok(s.label);
});
test('Lesson 5-1 data is carried over unchanged', () => {
  const f51 = JSON.parse(fs.readFileSync(new URL('../lesson-5-1/data/fields.json', import.meta.url)));
  const q51 = JSON.parse(fs.readFileSync(new URL('../lesson-5-1/data/questions.json', import.meta.url)));
  for (const p of ['143', '144', '145', '146']) { assert.deepEqual(fields[p], f51[p]); assert.deepEqual(questions[p], q51[p]); }
});
test('every question has an answer field, verified help and in-range geometry', () => {
  const inRange = (r) => r.length === 4 && r.every((n) => n >= 0 && n <= 1) && r[0] + r[2] <= 1.0001 && r[1] + r[3] <= 1.0001;
  for (const p of pages) {
    const fids = (fields[p] || []).map((f) => f.id);
    assert.equal(new Set(fids).size, fids.length, p + ' duplicate field ids');
    for (const f of fields[p] || []) assert.ok(inRange(f.rect), p + ' ' + f.id);
    const qids = (questions[p] || []).map((q) => q.id);
    assert.equal(new Set(qids).size, qids.length, p + ' duplicate question ids');
    for (const q of questions[p] || []) {
      assert.ok(fids.includes(q.id), `${p} ${q.id} has no answer field`);
      assert.equal(q.verified, true);
      assert.ok(q.hint && q.answer && q.steps.length && q.title, `${p} ${q.id} help text`);
      assert.ok(inRange(q.crop) && q.anchor >= 0 && q.anchor <= 1 && ['left', 'right'].includes(q.side), `${p} ${q.id} geometry`);
    }
  }
});
test('first visit copies Lesson 5-1 work and workbook handwriting, leaving both originals untouched', () => {
  const l51 = JSON.stringify({ version: 2, lesson: '5-1', page: '145', answers: { '145_1': '10 × 10 × 10 × 10' }, ink: { '145': [[[0.1, 0.2], [0.3, 0.4]]] }, completed: { '145_1': true } });
  const legacy = JSON.stringify({ answers: { '149_1a': 'kept', 'zzz_9': 'no field' }, ink: { '150': [[{ x: 490, y: 633.5 }]], '145': [[{ x: 1, y: 1 }]] } });
  const map = new Map([[storage.LESSON51, l51], [storage.LEGACY, legacy]]);
  const s = storage.load({ getItem: (k) => map.get(k) ?? null }, pages, ['149_1a']);
  assert.equal(s.page, '145');
  assert.equal(s.answers['145_1'], '10 × 10 × 10 × 10');
  assert.deepEqual(s.ink['145'], [[[0.1, 0.2], [0.3, 0.4]]], 'Lesson 5-1 ink wins over workbook ink');
  assert.equal(s.answers['149_1a'], 'kept');
  assert.equal(s.answers['zzz_9'], undefined);
  assert.deepEqual(s.ink['150'], [[[0.5, 0.5]]]);
  assert.equal(s.completed['145_1'], true);
  assert.equal(map.get(storage.LESSON51), l51); assert.equal(map.get(storage.LEGACY), legacy);
  assert.ok(storage.valid(s, pages));
});
test('a fresh start opens on page 141; corrupt saved work is refused, not replaced', () => {
  assert.equal(storage.load({ getItem: () => null }, pages).page, '141');
  assert.throws(() => storage.load({ getItem: (k) => (k === storage.KEY ? JSON.stringify({ version: 1, book: 'chapter-5', page: '999' }) : null) }, pages));
  assert.ok(!storage.valid({ version: 1, book: 'chapter-5', page: '141', answers: {}, ink: { '141': [[[2, 0]]] }, completed: {} }, pages));
});
