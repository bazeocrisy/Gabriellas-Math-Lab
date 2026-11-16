// The publishing build (scripts/build-site.js): only allowlisted files are copied, drafts stay out, and the verifier
// refuses names, scans, external loads, broken links and oversize sites (DECISIONS D5, D6).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildSite, verifySite, REPO, walk } from '../../scripts/build-site.js';
import { hashName, BLOCKED_NAME_HASHES } from '../../scripts/privacy.js';

const tmp = (name) => fs.mkdtempSync(path.join(os.tmpdir(), `sn-${name}-`));
const write = (root, rel, text) => { fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); fs.writeFileSync(path.join(root, rel), text); };

/** A tiny but complete source tree that passes verification. */
function fixture() {
  const src = tmp('src');
  write(src, 'index.html', '<!doctype html><html lang="en"><head><link rel="stylesheet" href="css/tokens.css"><link rel="stylesheet" href="css/hub.css"><script type="module" src="js/app.js"></script></head><body><main id="app"><a href="math/index.html">Math</a> <a href="#/week">Week</a></main></body></html>');
  write(src, 'css/tokens.css', ':root { --bg: #fff; }');
  write(src, 'css/hub.css', 'body { background: var(--bg); }');
  write(src, 'js/app.js', "import { x } from './lib/x.js';\nexport const y = x;");
  write(src, 'js/lib/x.js', 'export const x = 1;');
  write(src, 'data/subjects.json', JSON.stringify({ version: 1, subjects: ['math', 'ela', 'social-studies', 'science'].map((id) => ({ id, name: id, role: `${id} teacher`, currentUnit: null, units: [] })) }));
  write(src, 'data/weeks/index.json', JSON.stringify({ version: 1, current: '2026-11-16', weeks: [{ id: '2026-11-16', label: 'Week of November 16–20' }] }));
  write(src, 'data/weeks/2026-11-16.json', JSON.stringify({ version: 1, id: '2026-11-16', label: 'Week of November 16–20', notes: null, events: [], subjects: {} }));
  write(src, 'data/weeks/2026-11-23.json', JSON.stringify({ version: 1, id: '2026-11-23', subjects: {} }));
  write(src, 'data/SCHEMA.md', '# schema');
  write(src, 'math/index.html', '<!doctype html><html lang="en"><head><link rel="stylesheet" href="css/styles.css"></head><body><script src="js/app.js"></script><a href="../index.html#/math">Back</a></body></html>');
  write(src, 'math/css/styles.css', 'body{}');
  write(src, 'math/js/app.js', 'window.GML = {};');
  write(src, 'math/study-guides/package.json', '{}');
  write(src, 'math/study-guides/tests/practice.test.cjs', '');
  write(src, 'tests/x.test.js', '');
  write(src, 'docs/NOTES.md', 'notes');
  return src;
}

test('the fixture builds and verifies cleanly; drafts, docs, tests and tooling are left out', () => {
  const src = fixture(), out = tmp('out');
  const { copied, skipped } = buildSite(out, src);
  assert.deepEqual(verifySite(out), []);
  assert.ok(copied.includes('data/weeks/2026-11-16.json'));
  assert.ok(!copied.includes('data/weeks/2026-11-23.json'), 'an unlisted (draft) week is not published');
  assert.ok(skipped.some((s) => s.startsWith('data/weeks/2026-11-23.json (not listed')));
  for (const f of walk(out)) assert.doesNotMatch(f, /^(?:tests|docs)\/|SCHEMA\.md|study-guides\/(?:package\.json|tests)/, f);
});

test('the build refuses to write into the repository or a source folder', () => {
  const src = fixture();
  assert.throws(() => buildSite(src, src), /Refusing/);
  assert.throws(() => buildSite(path.join(src, 'math'), src), /Refusing/);
});

const problemsWith = (change) => {
  const src = fixture(), out = tmp('out');
  buildSite(out, src);
  change(out);
  return verifySite(out).join('\n');
};

test('the verifier refuses personal names in any published text file', () => {
  // The real names are stored only as hashes; add a made-up one for this test and take it out again.
  const h = hashName('Zorbin');
  BLOCKED_NAME_HASHES.add(h);
  try {
    assert.match(problemsWith((o) => write(o, 'data/subjects.json', fs.readFileSync(path.join(o, 'data/subjects.json'), 'utf8').replace('"math teacher"', `"Zorbin's teacher"`))), /personal name/);
  } finally { BLOCKED_NAME_HASHES.delete(h); }
});

test('the verifier refuses scans, files off the allowlist and forbidden folders', () => {
  assert.match(problemsWith((o) => write(o, 'assets/brand/page-012.png', 'x')), /scanned page/);
  assert.match(problemsWith((o) => write(o, 'math/chapter-5/index.html', 'x')), /not on the publishing allowlist/);
  assert.match(problemsWith((o) => write(o, 'docs/NOTES.md', 'x')), /docs must not be published/);
  assert.match(problemsWith((o) => write(o, 'data/weeks/2026-11-23.json', '{}')), /not listed in data\/weeks\/index\.json/);
});

test('the verifier refuses external scripts, fonts, analytics and http:// links', () => {
  const page = (extra) => (o) => write(o, 'index.html', fs.readFileSync(path.join(o, 'index.html'), 'utf8').replace('</head>', `${extra}</head>`));
  assert.match(problemsWith(page('<script src="https://cdn.example.com/x.js"></script>')), /another site/);
  assert.match(problemsWith(page('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=X">')), /another site/);
  assert.match(problemsWith((o) => write(o, 'js/lib/x.js', "gtag('config', 'x'); export const x = 1;")), /analytics/);
  assert.match(problemsWith(page('<a href="http://example.com">x</a>')), /insecure http/);
  // A plain https link to another site (e.g. the state standards) is fine.
  assert.equal(problemsWith(page('<a href="https://www.gadoe.org/">Standards</a>')), '');
});

test('the verifier refuses broken, absolute and escaping links', () => {
  const page = (extra) => (o) => write(o, 'index.html', fs.readFileSync(path.join(o, 'index.html'), 'utf8').replace('</main>', `${extra}</main>`));
  assert.match(problemsWith(page('<a href="ela/index.html">x</a>')), /ela\/index\.html, which is missing/);
  assert.match(problemsWith(page('<img src="/StudyNova/assets/brand/logo.svg" alt="">')), /breaks under \/StudyNova\//);
  assert.match(problemsWith(page('<a href="../secret.html">x</a>')), /outside the site/);
  assert.match(problemsWith((o) => write(o, 'js/app.js', "import { z } from './lib/missing.js';")), /js\/lib\/missing\.js, which is missing/);
});

test('the verifier refuses invalid data', () => {
  assert.match(problemsWith((o) => write(o, 'data/subjects.json', '{ not json')), /not valid JSON/);
  assert.match(problemsWith((o) => write(o, 'data/weeks/index.json', JSON.stringify({ version: 1, current: '2026-11-16', weeks: [{ id: '2026-11-17' }] }))), /Monday|missing/);
});

test('the real repository builds and verifies (once the hub and Math files are present)', { skip: !fs.existsSync(path.join(REPO, 'index.html')) && 'hub index.html not present yet' }, () => {
  const out = tmp('site');
  const { copied } = buildSite(out);
  const problems = verifySite(out);
  assert.deepEqual(problems, [], problems.join('\n'));
  assert.ok(copied.includes('index.html') && copied.includes('math/index.html'));
  fs.rmSync(out, { recursive: true, force: true });
});
