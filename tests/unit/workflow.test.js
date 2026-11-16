// Publishing workflow: production from main, preview from develop under /preview/, both tested before either is
// published (DECISIONS D5). Pull requests only check.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { REPO } from '../../scripts/build-site.js';

const YML = fs.readFileSync(path.join(REPO, '.github/workflows/pages.yml'), 'utf8').replace(/\r\n/g, '\n');
/** The text of one job, from its key to the next job. */
const job = (name) => {
  const m = YML.match(new RegExp(`\\n  ${name}:\\n([\\s\\S]*?)(?=\\n  [a-z-]+:\\n|$)`));
  assert.ok(m, `job ${name} exists`);
  return m[1];
};
/** Asserts each pattern appears in the text, in this order. */
const inOrder = (text, patterns) => {
  let at = -1;
  for (const p of patterns) {
    const i = text.slice(at + 1).search(p);
    assert.ok(i >= 0, `${p} appears after position ${at}`);
    at += 1 + i;
  }
};

test('pushes to main and develop publish; pull requests only check', () => {
  assert.match(YML, /\non:\n  pull_request:\n  push:\n    branches: \[main, develop\]\n  workflow_dispatch:\n/);
  assert.match(YML, /\npermissions: \{\}\n/);
  assert.match(job('check'), /if: github\.event_name == 'pull_request'/);
  assert.match(job('build'), /if: github\.event_name != 'pull_request'/);
  assert.doesNotMatch(job('check'), /upload-pages-artifact|deploy-pages|pages: write/);
  assert.doesNotMatch(job('build'), /deploy-pages|pages: write/);
  assert.match(job('deploy'), /needs: build/);
  assert.match(job('deploy'), /name: github-pages/);
  assert.match(job('deploy'), /uses: actions\/deploy-pages@v4/);
});

test('every job runs on ubuntu-latest with Node 22 and Chrome at /usr/bin/google-chrome', () => {
  for (const name of ['check', 'build', 'deploy']) assert.match(job(name), /runs-on: ubuntu-latest\n/, name);
  assert.match(YML, /\nenv:\n  CHROME_PATH: \/usr\/bin\/google-chrome\n/);
  for (const name of ['check', 'build']) {
    assert.match(job(name), /uses: actions\/checkout@v4\n/, name);
    assert.match(job(name), /uses: actions\/setup-node@v4\n\s+with:\n\s+node-version: 22\n/, name);
  }
});

test('pull requests run every browser suite (no --quick); only the publish job may leave out the slow layout sweep', () => {
  assert.doesNotMatch(job('check'), /--quick/);
  assert.match(fs.readFileSync(path.join(REPO, 'scripts/run-browser-tests.mjs'), 'utf8'), /HEAVY = \['tests\/math\/responsive\.browser\.mjs'\]/);
});

test('pull requests run unit tests, browser tests, the allowlist build and browser tests on the built site', () => {
  inOrder(job('check'), [/run: npm test\n/, /run: npm run test:browser\n/, /run: node scripts\/build-site\.js _site\n/,
    /run: node scripts\/run-browser-tests\.mjs --site _site\n/]);
});

test('production is built from main and the preview from develop, each tested before one publish', () => {
  inOrder(job('build'), [
    /ref: main\n\s+path: main\n/, /ref: \$\{\{ steps\.develop\.outputs\.ref \}\}\n\s+path: develop\n/,
    /working-directory: main\n\s+run: npm test\n/, /working-directory: develop\n\s+run: npm test\n/,
    /run: node main\/scripts\/build-site\.js "\$GITHUB_WORKSPACE\/_site"\n/,
    /run: node develop\/scripts\/build-site\.js "\$GITHUB_WORKSPACE\/_preview"\n/,
    /working-directory: main\n\s+run: node scripts\/run-browser-tests\.mjs --site "\$GITHUB_WORKSPACE\/_site" --quick\n/,
    /working-directory: develop\n\s+run: node scripts\/run-browser-tests\.mjs --site "\$GITHUB_WORKSPACE\/_preview" --quick\n/,
    /mv "\$GITHUB_WORKSPACE\/_preview" "\$GITHUB_WORKSPACE\/_site\/preview"\n/,
    /test -f "\$GITHUB_WORKSPACE\/_site\/index\.html" && test -f "\$GITHUB_WORKSPACE\/_site\/preview\/index\.html"/,
    /uses: actions\/upload-pages-artifact@v3\n\s+with:\n\s+path: _site\n/,
  ]);
  // The preview falls back to main only when develop does not exist yet.
  assert.match(job('build'), /branches\/develop.*echo "ref=develop".*else echo "ref=main"/);
});

test('credentials are not kept, only deploy may write to Pages, and nothing merges or writes to the repository', () => {
  assert.equal((YML.match(/persist-credentials: false/g) || []).length, (YML.match(/actions\/checkout@/g) || []).length);
  assert.equal((YML.match(/pages: write/g) || []).length, 1);
  assert.match(job('deploy'), /pages: write/);
  for (const u of [...YML.matchAll(/uses: (\S+)/g)].map((m) => m[1])) assert.match(u, /^actions\/[a-z-]+@v\d+$/, u);
  assert.doesNotMatch(YML.replace(/^\s*#.*$/gm, ''), /merge|contents: write|secrets\./i);
});

test('package.json scripts match what the workflow runs', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(REPO, 'package.json'), 'utf8'));
  assert.equal(pkg.type, 'module');
  assert.equal(pkg.dependencies, undefined, 'no runtime dependencies');
  assert.equal(pkg.devDependencies, undefined, 'no dev dependencies');
  for (const s of ['test', 'test:browser', 'build', 'test:site', 'test:all', 'serve']) assert.ok(pkg.scripts[s], `npm run ${s}`);
  assert.match(pkg.scripts.test, /tests\/unit\/\*\.test\.js/);
  assert.match(pkg.scripts.test, /tests\/math\//);
  assert.match(pkg.scripts['test:site'], /build-site\.js _site && node scripts\/run-browser-tests\.mjs --site _site/);
});
