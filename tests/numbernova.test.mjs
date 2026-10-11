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
