// Runs every browser test, one after another: the hub (tests/hub.browser.mjs) and the Math app's own suites
// (tests/math/*.browser.mjs and tests/math/browser.test.mjs, found by name so new Math suites are picked up).
//   node scripts/run-browser-tests.mjs                 test the repository as it is
//   node scripts/run-browser-tests.mjs --site _site    test a built site folder, exactly as it would be published
//   add --quick to leave out the slow suites in HEAVY (the publish job does; pull requests run everything)
// With --site, the Math suites are pointed at the built site through LIVE_URL (each Math suite that supports it);
// a Math suite that cannot take LIVE_URL runs against the repository and says so.
// Exits 1 if any suite fails. Set CHROME_PATH if Chrome/Edge is not found.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = process.argv.indexOf('--site');
const site = arg < 0 ? null : path.resolve(process.argv[arg + 1] || '_site');
if (site && !fs.existsSync(path.join(site, 'index.html'))) {
  console.error(`${site} has no index.html; run npm run build first.`);
  process.exit(1);
}

const quick = process.argv.includes('--quick');
/** Suites left out with --quick: the long layout sweep (about 11 minutes). Pull requests always run them. */
export const HEAVY = ['tests/math/responsive.browser.mjs'];

/** Browser suites, hub first. */
export function browserSuites(repo = REPO, { skipHeavy = false } = {}) {
  const math = path.join(repo, 'tests/math');
  const found = fs.existsSync(math) ? fs.readdirSync(math).filter((f) => /\.browser\.m?js$|^browser\.test\.m?js$/.test(f)).sort() : [];
  return ['tests/hub.browser.mjs', ...found.map((f) => `tests/math/${f}`)].filter((s) => !(skipHeavy && HEAVY.includes(s)));
}

// Chrome will not start as root (e.g. in a container) without --no-sandbox. The hub harness adds the flag itself;
// for the Math harness, give it a small wrapper as CHROME_PATH.
const env = { ...process.env };
if (typeof process.getuid === 'function' && process.getuid() === 0 && !env.CHROME_PATH) {
  const exe = ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find((p) => fs.existsSync(p));
  if (exe) {
    const wrapper = path.join(os.tmpdir(), 'studynova-chrome-no-sandbox.sh');
    fs.writeFileSync(wrapper, `#!/bin/sh\nexec "${exe}" --no-sandbox "$@"\n`, { mode: 0o755 });
    env.CHROME_PATH = wrapper;
  }
}

let server = null;
if (site) {
  const { startServer, BASE } = await import('../tests/lib/harness.js');
  server = await startServer({ root: site });
  server.url = server.origin + BASE;
}

const results = [];
if (quick) console.log(`--quick: leaving out ${HEAVY.join(', ')} (pull requests run it).`);
for (const suite of browserSuites(REPO, { skipHeavy: quick })) {
  const file = path.join(REPO, suite);
  const args = [file];
  const suiteEnv = { ...env };
  let note = '';
  if (site) {
    if (suite === 'tests/hub.browser.mjs') args.push('--site', site);
    else if (/LIVE_URL/.test(fs.readFileSync(file, 'utf8'))) suiteEnv.LIVE_URL = server.url + 'math/';
    else note = ' (repository: this suite cannot test a built site)';
  }
  console.log(`\n=== ${suite}${site ? ` against ${path.relative(REPO, site) || site}` : ''}${note} ===`);
  const started = Date.now();
  // Asynchronous on purpose: with --site, this process serves the built site while the suite runs.
  const status = await new Promise((resolve) => {
    const child = spawn(process.execPath, args, { cwd: REPO, env: suiteEnv, stdio: 'inherit' });
    const timer = setTimeout(() => { console.log(`${suite} took longer than 30 minutes; stopping it.`); child.kill(); }, 30 * 60 * 1000);
    child.on('exit', (code) => { clearTimeout(timer); resolve(code); });
    child.on('error', (e) => { clearTimeout(timer); console.log(String(e)); resolve(1); });
  });
  results.push({ suite: suite + note, ok: status === 0, secs: Math.round((Date.now() - started) / 1000) });
}
server?.close();

console.log('\nBrowser suites:');
for (const r of results) console.log(`  ${r.ok ? 'PASS' : 'FAIL'}  ${r.suite}  (${r.secs} s)`);
const failed = results.filter((r) => !r.ok).length;
console.log(failed ? `${failed} of ${results.length} browser suites failed.` : `All ${results.length} browser suites passed.`);
process.exit(failed ? 1 : 0);
