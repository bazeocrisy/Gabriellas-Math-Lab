// Hub smoke test in headless Chrome (no dependencies). Serves the site under /StudyNova/ like GitHub Pages and checks
// every route from docs/BUILD-PLAN.md: #/, #/week, each subject, #/parent (plus an unknown route), on desktop and at
// 390 px (phone). Checks: each page renders one heading and no load error, empty weeks show friendly states, the Math
// link opens math/index.html, nothing scrolls sideways at 390 px, and there are no console errors or missing files.
//   node tests/hub.browser.mjs               the repository
//   node tests/hub.browser.mjs --site _site  a built site folder (npm run test:site)
// Set CHROME_PATH if Chrome/Edge is not found.
import assert from 'node:assert/strict';
import path from 'node:path';
import { ROOT, BASE, startServer, startBrowser } from './lib/harness.js';

const arg = process.argv.indexOf('--site');
const root = arg < 0 ? ROOT : path.resolve(process.argv[arg + 1]);
const server = await startServer({ root });
const b = await startBrowser();

// A fixed "today" so the result does not depend on the date the test runs (the hub's ?today= override; nothing is saved).
const POSTED = '2026-11-16';     // listed in data/weeks/index.json
const UNPOSTED = '2026-12-07';   // a Monday with no week file (the hub must not even try to load one)
const SUBJECTS = [['math', 'Math'], ['ela', 'ELA'], ['social-studies', 'Social Studies'], ['science', 'Science']];
const ROUTES = [
  ['#/', 'Home', 'home'],
  ['#/week', 'This week', 'week'],
  ...SUBJECTS.map(([id, name]) => [`#/${id}`, name, id]),
  ['#/parent', 'For grown-ups', 'parent'],
];
const url = (hash, today = POSTED) => `${server.origin}${BASE}?today=${today}${hash}`;

let checks = 0;
const failures = [];
const check = (ok, label, detail) => {
  checks++;
  if (!ok) failures.push(label + (detail !== undefined ? ` (${JSON.stringify(detail).slice(0, 300)})` : ''));
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${!ok && detail !== undefined ? ` (${JSON.stringify(detail).slice(0, 300)})` : ''}`);
};

/** Opens a hub route fresh and waits until it has rendered (the title names the page, the loading line is gone). */
async function open(hash, title, today = POSTED) {
  await b.load(url(hash, today));
  await b.waitFor(`document.title === ${JSON.stringify(`${title} | StudyNova`)} && !document.querySelector('#main .loading') && !!document.querySelector('#main h1')`, 10000);
}
/** What a route shows: headings, alerts, empty states and layout facts. */
const facts = () => b.js(`
  const main = document.getElementById('main');
  return {
    h1: [...main.querySelectorAll('h1')].map((h) => h.textContent.trim()),
    problem: !!main.querySelector('.problem, [role="alert"]') && main.querySelector('.problem, [role="alert"]').textContent.trim().slice(0, 200),
    empties: [...main.querySelectorAll('.empty-title')].map((e) => e.textContent.trim()),
    text: main.innerText,
    current: document.querySelector('.site-nav a[aria-current="page"]')?.dataset.nav || null,
    mathLinks: [...main.querySelectorAll('a[href^="math/"]')].map((a) => a.getAttribute('href')),
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    wide: [...document.querySelectorAll('body *')].filter((el) => { const r = el.getBoundingClientRect(); return r.width && r.right > document.documentElement.clientWidth + 1 && getComputedStyle(el).position !== 'fixed' && !el.closest('.sr-only, [hidden]'); }).slice(0, 5).map((el) => el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).join('.') : '')),
  };`);

try {
  // 1. Every route renders on a desktop screen.
  await b.viewport(1280, 900, false);
  for (const [hash, title, nav] of ROUTES) {
    try {
      await open(hash, title);
      const f = await facts();
      check(f.h1.length === 1, `${hash}: exactly one main heading`, f.h1);
      check(!f.problem, `${hash}: no load error`, f.problem);
      check(f.current === nav, `${hash}: navigation marks the current page`, f.current);
    } catch (e) { check(false, `${hash}: renders`, e.message); }
  }

  // 2. Empty weeks show friendly states (the posted week has no class material yet; an unposted week has no file).
  await open('#/week', 'This week');
  let f = await facts();
  check(/Nothing has been added to this week yet|Nothing posted for this week/.test(f.text), '#/week: an empty posted week says nothing has been added yet', f.empties);
  await open(`#/week/${UNPOSTED}`, 'This week');
  f = await facts();
  check(/Nothing posted for this week/.test(f.text), `#/week/${UNPOSTED}: an unposted week says nothing is posted`, f.empties);
  check(!f.problem, `#/week/${UNPOSTED}: no load error for a week without a file`, f.problem);
  for (const [id, name] of SUBJECTS) {
    await open(`#/${id}`, name);
    f = await facts();
    check(f.empties.length > 0, `#/${id}: shows friendly empty states`, f.empties);
    if (id !== 'math') check(/Coming soon/i.test(f.text), `#/${id}: learning material says Coming soon`);
  }
  await open('#/', 'Home');
  f = await facts();
  check(f.empties.length > 0 || /Nothing (due|posted|yet)/.test(f.text), '#/: Home shows friendly empty states', f.empties);
  await open('#/nowhere', 'Page not found');
  f = await facts();
  check(f.h1[0] === 'Page not found', 'an unknown route says Page not found', f.h1);

  // 3. The Math page links to the Math app, and the link opens math/index.html.
  await open('#/math', 'Math');
  f = await facts();
  check(f.mathLinks.length > 0 && f.mathLinks.every((h) => h.startsWith('math/index.html')), '#/math: links go to math/index.html', f.mathLinks);
  if (f.mathLinks.length) {
    await b.js(`document.querySelector('#main a[href^="math/index.html"]').setAttribute('data-test-target', '1');`);
    await b.clickAt('[data-test-target]');
    try {
      await b.waitFor(`location.pathname.endsWith('/math/index.html') && document.readyState === 'complete' && !!document.getElementById('app') && document.getElementById('app').children.length > 0`, 10000);
      check(true, 'the Math link opens math/index.html');
      check(await b.js(`return document.title.includes('StudyNova') || document.title.includes('Math');`), 'the Math app page has its title');
    } catch (e) { check(false, 'the Math link opens math/index.html', e.message); }
  }

  // 4. Phone width (390 px): nothing scrolls sideways, on every route and with the menu open.
  await b.viewport(390, 844, true);
  for (const [hash, title] of [...ROUTES, [`#/week/${UNPOSTED}`, 'This week']]) {
    try {
      await open(hash, title);
      f = await facts();
      check(f.overflow <= 0, `${hash} at 390 px: no horizontal scroll`, { overflow: f.overflow, wide: f.wide });
    } catch (e) { check(false, `${hash} at 390 px: renders`, e.message); }
  }
  await open('#/', 'Home');
  const toggle = await b.js(`const t = document.querySelector('.nav-toggle'); return !!t && getComputedStyle(t).display !== 'none';`);
  if (toggle) {
    await b.clickAt('.nav-toggle');
    await b.waitFor(`document.querySelector('.nav-toggle').getAttribute('aria-expanded') === 'true'`);
    f = await facts();
    check(f.overflow <= 0, '390 px with the menu open: no horizontal scroll', { overflow: f.overflow, wide: f.wide });
    const visible = await b.js(`return [...document.querySelectorAll('.site-nav a')].filter((a) => a.getBoundingClientRect().height > 0).length;`);
    check(visible === ROUTES.length, '390 px menu shows every page link', visible);
  } else check(true, '390 px: navigation shown without a menu button');

  // 5. Clean run: no browser errors, no missing files, no failed requests, nothing loaded from another site.
  check(!b.errors.length, 'no console errors or uncaught exceptions', b.errors);
  check(!server.missing.length, 'no missing files', server.missing);
  check(!b.failures.length, 'no failed requests', b.failures);
  const foreign = b.requests.filter((u) => !u.startsWith(server.origin) && !/^(?:about|data|blob):/.test(u));
  check(!foreign.length, 'nothing is requested from another site', foreign);
} finally {
  b.close();
  server.close();
}

console.log(`\n${checks - failures.length} of ${checks} hub browser checks passed${arg < 0 ? '' : ` (built site: ${path.relative(ROOT, root) || root})`}.`);
if (failures.length) {
  console.log('Failures:\n' + failures.map((x) => '  - ' + x).join('\n'));
  process.exitCode = 1;
}
assert.ok(checks > 0);
