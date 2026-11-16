// The hub's data files match data/SCHEMA.md (scripts/validate-data.js), weeks are listed exactly once, and the
// schema's made-up example is never posted as a real week.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { REPO } from '../../scripts/build-site.js';
import { validateSubjects, validateWeekIndex, validateWeek, isSafeLink, isMonday, SUBJECT_IDS } from '../../scripts/validate-data.js';

const readJSON = (rel) => JSON.parse(fs.readFileSync(path.join(REPO, rel), 'utf8'));
const has = (rel) => fs.existsSync(path.join(REPO, rel));
const WEEK_DIR = path.join(REPO, 'data/weeks');
const weekFiles = has('data/weeks') ? fs.readdirSync(WEEK_DIR).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)) : [];

test('data/subjects.json has the four subjects, shown by teacher role only', () => {
  const doc = readJSON('data/subjects.json');
  assert.deepEqual(validateSubjects(doc), []);
  assert.deepEqual(doc.subjects.map((s) => s.id).sort(), [...SUBJECT_IDS].sort());
  for (const s of doc.subjects) assert.match(s.role, /^[A-Za-z ]+ teacher$/, `${s.id}: role, never a name`);
});

test('data/weeks/index.json is valid and lists only weeks that have a file', () => {
  const index = readJSON('data/weeks/index.json');
  assert.deepEqual(validateWeekIndex(index), []);
  for (const w of index.weeks) assert.ok(has(`data/weeks/${w.id}.json`), `data/weeks/${w.id}.json is listed but missing`);
  const ids = index.weeks.map((w) => w.id);
  assert.deepEqual(ids, [...ids].sort().reverse(), 'weeks are listed newest first');
  if (ids.length) assert.equal(index.current, ids[0], '"current" is the newest posted week');
});

test('every week file is valid (empty lists and null notes allowed)', () => {
  for (const f of weekFiles) {
    const id = f.slice(0, -'.json'.length);
    assert.deepEqual(validateWeek(readJSON(`data/weeks/${f}`), id), [], f);
  }
});

test('no week file is the schema example or a leftover draft', () => {
  const listed = new Set(readJSON('data/weeks/index.json').weeks.map((w) => `${w.id}.json`));
  for (const f of weekFiles) {
    assert.doesNotMatch(fs.readFileSync(path.join(WEEK_DIR, f), 'utf8'), /EXAMPLE/, `${f} contains the schema's EXAMPLE text`);
    // Drafts are allowed (the build leaves them out), but say so in the test output.
    if (!listed.has(f)) console.log(`  note: data/weeks/${f} is a draft (not listed in index.json, not published)`);
  }
});

test('the example in data/SCHEMA.md passes the same checks (so the schema and the validator agree)', { skip: !has('data/SCHEMA.md') && 'no data/SCHEMA.md' }, () => {
  const md = fs.readFileSync(path.join(REPO, 'data/SCHEMA.md'), 'utf8');
  const example = /## EXAMPLE[\s\S]*?```json\n([\s\S]*?)```/.exec(md);
  assert.ok(example, 'SCHEMA.md has an EXAMPLE json block');
  const doc = JSON.parse(example[1]);
  assert.deepEqual(validateWeek(doc, doc.id), []);
});

test('the validator rejects what the schema forbids', () => {
  assert.ok(validateSubjects({ version: 1, subjects: [{ id: 'math', name: 'Math', role: 'Mrs. Smith', units: [] }] }).some((p) => /role|missing/.test(p)));
  assert.ok(validateWeekIndex({ version: 1, current: '2026-11-17', weeks: [{ id: '2026-11-17', label: null }] }).some((p) => /Monday/.test(p)));
  const bad = { version: 1, id: '2026-11-16', subjects: {
    math: { assessments: [{ kind: 'exam', title: 'X' }], homework: [{ title: 'A', due: '11/20' }], resources: { learn: [{ title: 'L', href: 'javascript:alert(1)' }] } },
    art: {},
  } };
  const problems = validateWeek(bad, '2026-11-16').join('\n');
  for (const re of [/kind/, /"date" is required/, /"due"/, /"href"/, /unknown subject "art"/]) assert.match(problems, re);
  // Everything empty is fine.
  assert.deepEqual(validateWeek({ version: 1, id: '2026-11-16', label: null, notes: null, events: [], subjects: {} }, '2026-11-16'), []);
});

test('link and date helpers', () => {
  for (const ok of ['math/index.html#/chapter4', 'https://www.gadoe.org/', null]) assert.ok(isSafeLink(ok), ok);
  for (const bad of ['/StudyNova/math/', 'http://example.com', 'javascript:alert(1)', '//cdn.example.com', '../secret.html', '']) assert.ok(!isSafeLink(bad), bad);
  assert.ok(isMonday('2026-11-16') && !isMonday('2026-11-17') && !isMonday('2026-02-30'));
});
