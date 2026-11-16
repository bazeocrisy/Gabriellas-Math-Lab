// Privacy, security and repository hygiene checks on the source files (DECISIONS D6, D7).
// The rules themselves live in scripts/privacy.js, shared with the build verifier.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { REPO, walk, ALLOW, SOURCES } from '../../scripts/build-site.js';
import { findBlockedName, hashName, BLOCKED_NAME_HASHES, SCAN_NAME, PHOTO_EXT, ANALYTICS, EXTERNAL_LOAD, insecureLinks, SECRETS } from '../../scripts/privacy.js';

const read = (p) => fs.readFileSync(path.join(REPO, p), 'utf8');
/** Every file the build could publish (on the allowlist, in a source folder). */
const PUBLISHABLE = SOURCES.flatMap((s) => walk(REPO, s)).filter((f) => ALLOW.some((re) => re.test(f)));
const TEXT = /\.(?:html|css|js|mjs|cjs|json|svg|webmanifest|txt|md|yml|yaml)$/;
/** Files committed to the (public) repository, apart from build output and tooling folders. */
const SKIP_DIRS = new Set(['.git', 'node_modules', '_site', '_preview', 'private']);
const ALL = walk(REPO).filter((f) => !SKIP_DIRS.has(f.split('/')[0]) && !f.includes('/node_modules/') && !f.startsWith('tests/screenshots/') && !f.startsWith('tests/math/screenshots/'));
/** Documents written for this repository by the infrastructure (the rules for future sessions, docs, agents). */
const OWN_DOCS = ['CLAUDE.md', 'README.md', 'STATUS.md', ...ALL.filter((f) => (f.startsWith('docs/') || f.startsWith('.claude/')))];
// Code without its comments, so a comment that explains a rule (e.g. "no analytics") is not a violation.
const code = (text) => text.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:"'\\])\/\/.*$/gm, '$1');

const refute = (found, label) => assert.ok(!found, `${label}: found ${JSON.stringify(found)}`);

test('the rules catch what they are meant to catch', () => {
  // The real list is stored as hashes so this public repository does not spell the names out; test the matcher with a
  // made-up name instead, then check the real list is in place.
  const test = new Set([hashName('Zorbin')]);
  assert.equal(findBlockedName('Practice with Zorbin today', test), 'Zorbin');
  assert.equal(findBlockedName("Zorbin's homework", test), 'Zorbin');
  assert.equal(findBlockedName('the ZORBIN family', test), 'ZORBIN');
  assert.equal(findBlockedName('from Zorbins-Math-Lab', test), 'Zorbins');
  assert.equal(findBlockedName('Zorbinmas break and zorb', test), null);
  assert.ok(BLOCKED_NAME_HASHES.size >= 4 && [...BLOCKED_NAME_HASHES].every((h) => /^[0-9a-f]{64}$/.test(h)));
  assert.ok(SCAN_NAME.test('math/assets/page-012.png') && SCAN_NAME.test('images/IMG_1234.jpg') && !SCAN_NAME.test('assets/brand/icon-192.png'));
  assert.deepEqual(insecureLinks('<svg xmlns="http://www.w3.org/2000/svg"> <a href="http://example.com">'), ['http://example.com']);
  assert.ok(EXTERNAL_LOAD.some((re) => re.test('<script src="https://cdn.example.com/x.js"></script>')));
  assert.ok(EXTERNAL_LOAD.some((re) => re.test('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=X">')));
  assert.ok(!EXTERNAL_LOAD.some((re) => re.test('<a href="https://www.gadoe.org/">Georgia standards</a>')));
});

test('there is something to check (the hub and Math sources are present)', () => {
  assert.ok(PUBLISHABLE.length > 0, 'no publishable files found');
  assert.ok(PUBLISHABLE.includes('data/subjects.json'));
});

test('no personal names in anything the site could publish', () => {
  for (const f of PUBLISHABLE.filter((p) => TEXT.test(p))) refute(findBlockedName(read(f)), f);
});

test('no personal names in the repository documents and agent instructions', () => {
  for (const f of OWN_DOCS.filter((p) => TEXT.test(p))) refute(findBlockedName(read(f)), f);
});

test('no personal names in any file of the (public) repository, including tests and scripts', () => {
  for (const f of ALL.filter((p) => TEXT.test(p))) refute(findBlockedName(read(f)), f);
});

test('no textbook scans or photos anywhere in the repository', () => {
  for (const f of ALL) {
    refute(SCAN_NAME.test(f) && f, 'scanned page');
    refute(PHOTO_EXT.test(f) && f, 'photo or scan format');
  }
  // The pages the earlier Math site built on scans were not moved (DECISIONS D3).
  for (const p of ['chapter-5', 'lesson-5-1', 'math/chapter-5', 'math/lesson-5-1']) assert.ok(!fs.existsSync(path.join(REPO, p)), `${p} must not be in the repository`);
});

test('PDFs are only the Math study guides StudyNova printed itself', () => {
  for (const f of ALL.filter((p) => p.toLowerCase().endsWith('.pdf'))) {
    assert.match(f, /^math\/study-guides\/pdf\//, `${f}: PDFs belong only in math/study-guides/pdf`);
    const pdf = fs.readFileSync(path.join(REPO, f)).toString('latin1');
    assert.match(pdf, /\/Producer \(Skia\/PDF/, `${f} must be printed from a StudyNova page, never a scan`);
    refute(findBlockedName(pdf), f);
  }
});

test('no external scripts, stylesheets, fonts or analytics in published pages, styles and code', () => {
  for (const f of PUBLISHABLE.filter((p) => /\.(?:html|css|js|svg)$/.test(p))) {
    const text = code(read(f));
    for (const re of EXTERNAL_LOAD) refute(re.exec(text)?.[0], f);
    refute(ANALYTICS.exec(text)?.[0], f);
  }
});

test('no insecure http:// links (licence texts quote their own address and are not links)', () => {
  for (const f of PUBLISHABLE.filter((p) => TEXT.test(p) && !p.endsWith('.txt'))) assert.deepEqual(insecureLinks(read(f)), [], f);
});

test('the hub stores nothing and makes no requests to other sites', () => {
  for (const f of PUBLISHABLE.filter((p) => /^(?:index\.html|js\/)/.test(p))) {
    const text = code(read(f));
    refute(/sessionStorage|indexedDB|document\.cookie|serviceWorker|sendBeacon/.exec(text)?.[0], f);
    refute(/fetch\(\s*['"`]https?:/.exec(text)?.[0], f);
    refute(/\beval\(|new Function\(/.exec(text)?.[0], f);
  }
});

test('no credentials or keys are committed', () => {
  for (const f of ALL.filter((p) => TEXT.test(p))) refute(SECRETS.exec(read(f))?.[0], f);
});

test('private material stays out of the repository', () => {
  const ignore = read('.gitignore');
  for (const p of ['_site/', 'node_modules/', 'tests/screenshots/', 'private/']) assert.ok(ignore.includes(p), `.gitignore lists ${p}`);
});
