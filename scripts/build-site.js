// Builds the publishable website from an explicit allowlist, then verifies it (docs/DEPLOYMENT.md, DECISIONS D5).
// Only student-facing runtime files are copied. Tests, docs, scripts, drafts and anything not listed below never
// reach the site. Run: node scripts/build-site.js [outDir]   (default _site; exits 1 if verification finds a problem)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { findBlockedName, SCAN_NAME, PHOTO_EXT, ANALYTICS, EXTERNAL_LOAD, insecureLinks } from './privacy.js';
import { validateSubjects, validateWeekIndex, validateWeek } from './validate-data.js';

export const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** The only files that may be published. A path must match one pattern exactly. */
export const ALLOW = [
  // Hub
  /^index\.html$/,
  /^css\/[a-z0-9-]+\.css$/,
  /^js\/(?:[a-z0-9-]+\/)*[a-z0-9-]+\.js$/,
  /^data\/subjects\.json$/,
  /^data\/weeks\/index\.json$/,
  /^data\/weeks\/\d{4}-\d{2}-\d{2}\.json$/,
  /^assets\/brand\/[a-z0-9-]+\.(?:svg|png|ico|webmanifest)$/,
  // Math (the app moved from NumberNova, DECISIONS D3)
  /^math\/index\.html$/,
  /^math\/css\/[a-z0-9-]+\.css$/,
  /^math\/js\/[a-z0-9-]+\.js$/,
  /^math\/curriculum\/(?:[a-z0-9-]+\/)*[a-z0-9-]+\.js$/,
  /^math\/assets\/brand\/[a-z0-9-]+\.(?:svg|png|ico|webmanifest)$/,
  /^math\/study-guides\/lessons\/(?:[a-z0-9-]+\/)*[a-z0-9-]+\.html$/,
  /^math\/study-guides\/assets\/[a-z0-9-]+\.(?:css|js)$/,
  /^math\/study-guides\/assets\/fonts\/[A-Za-z0-9-]+\.(?:ttf|woff2|txt)$/,
  /^math\/study-guides\/pdf\/(?:[a-z0-9-]+\/)*[A-Za-z0-9-]+\.pdf$/,
];
/** Where the build looks. Nothing outside these is ever read. */
export const SOURCES = ['index.html', 'css', 'js', 'data', 'assets', 'math'];
/** Runtime files the site cannot work without. */
export const REQUIRED = ['index.html', 'css/tokens.css', 'data/subjects.json', 'data/weeks/index.json', 'math/index.html'];
/** Named so a check proves they are absent (the allowlist already excludes them). */
export const FORBIDDEN = [
  'tests', 'docs', 'scripts', '.github', '.claude', '.git', 'node_modules', 'private', 'chapter-5', 'lesson-5-1',
  'math/chapter-5', 'math/lesson-5-1', 'math/study-guides/tests', 'math/study-guides/tools', 'math/study-guides/package.json',
  'data/SCHEMA.md', 'package.json', 'README.md', 'STATUS.md', 'CLAUDE.md', '.gitignore',
];
/** The whole published site (production) must stay under this size. The preview is a second copy of the same size. */
export const MAX_BYTES = 40 * 1024 * 1024;
/** Text files that are checked for personal names and external loads. */
export const TEXT = /\.(?:html|css|js|json|svg|webmanifest|txt|md)$/;

const isAllowed = (rel) => ALLOW.some((re) => re.test(rel));
const readJSON = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

export function walk(root, dir = '') {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) return [];
  if (!fs.statSync(full).isDirectory()) return [dir];
  const out = [];
  for (const e of fs.readdirSync(full, { withFileTypes: true })) out.push(...walk(root, dir ? `${dir}/${e.name}` : e.name));
  return out;
}

/** The week files named by data/weeks/index.json (drafts not listed there are never published). */
export function listedWeeks(src) {
  const file = path.join(src, 'data/weeks/index.json');
  if (!fs.existsSync(file)) return new Set();
  try { return new Set((readJSON(file).weeks || []).map((w) => `data/weeks/${w.id}.json`)); } catch { return new Set(); }
}

/** Copies allowed files from `src` into a fresh `out`. Returns what was copied and what was left out (and why). */
export function buildSite(out, src = REPO) {
  out = path.resolve(out);
  src = path.resolve(src);
  // The output folder is deleted first, so never let it be the repository, a source folder or anything above them.
  const inside = (a, b) => a === b || a.startsWith(b + path.sep);
  if (inside(src, out) || SOURCES.some((s) => inside(out, path.resolve(src, s)))) throw new Error(`Refusing to build into ${out}`);
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  const listed = listedWeeks(src);
  const copied = [], skipped = [];
  for (const rel of SOURCES.flatMap((s) => walk(src, s))) {
    let why = null;
    if (!isAllowed(rel)) why = 'not on the allowlist';
    else if (/^data\/weeks\/\d/.test(rel) && !listed.has(rel)) why = 'not listed in data/weeks/index.json (draft)';
    if (why) { skipped.push(`${rel} (${why})`); continue; }
    fs.mkdirSync(path.dirname(path.join(out, rel)), { recursive: true });
    fs.copyFileSync(path.join(src, rel), path.join(out, rel));
    copied.push(rel);
  }
  return { copied, skipped };
}

// Local references in pages, stylesheets and modules. Each must resolve inside the site.
const htmlRefs = (text) => [...text.replace(/<!--[\s\S]*?-->/g, '').matchAll(/\s(?:src|href)\s*=\s*["']([^"']*)["']/gi)].map((m) => m[1]);
const cssRefs = (text) => [...text.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)].map((m) => m[1]);
const jsRefs = (text) => [...text.matchAll(/(?:^|[\s;])(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|(?:^|[\s;])import\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/gm)]
  .map((m) => m[1] || m[2] || m[3]);
const manifestRefs = (text) => { try { const m = JSON.parse(text); return [...(m.icons || []), ...(m.screenshots || [])].map((i) => i.src).filter(Boolean); } catch { return []; } };

/** Returns plain-English problems with a built site folder; an empty list means it is safe to publish. */
export function verifySite(dir) {
  dir = path.resolve(dir);
  const problems = [];
  const files = walk(dir);
  const has = (rel) => fs.existsSync(path.join(dir, rel)) && fs.statSync(path.join(dir, rel)).isFile();
  const read = (rel) => fs.readFileSync(path.join(dir, rel), 'utf8');

  // 1. Only allowlisted files, nothing forbidden, everything required.
  for (const rel of files) if (!isAllowed(rel)) problems.push(`${rel} is not on the publishing allowlist`);
  for (const rel of FORBIDDEN) if (fs.existsSync(path.join(dir, rel))) problems.push(`${rel} must not be published`);
  for (const rel of REQUIRED) if (!has(rel)) problems.push(`${rel} is required but missing`);

  // 2. No textbook scans or photos.
  for (const rel of files) {
    if (SCAN_NAME.test(rel)) problems.push(`${rel} looks like a scanned page and must not be published`);
    if (PHOTO_EXT.test(rel)) problems.push(`${rel} is a photo or scan format and must not be published`);
  }
  // PDFs: only study guides StudyNova printed itself from its own pages (Chrome/Skia), never a scan.
  for (const rel of files.filter((f) => f.endsWith('.pdf'))) {
    const pdf = fs.readFileSync(path.join(dir, rel)).toString('latin1');
    if (!pdf.startsWith('%PDF') || !/\/Producer \(Skia\/PDF/.test(pdf)) problems.push(`${rel} must be a PDF printed from a StudyNova page (Skia/PDF), never a scan`);
    const name = findBlockedName(pdf);
    if (name) problems.push(`${rel} contains the personal name ${JSON.stringify(name)}`);
  }

  // 3. No personal names, no external scripts/fonts/analytics, no http:// links in any published text file.
  for (const rel of files.filter((f) => TEXT.test(f))) {
    const text = read(rel);
    const name = findBlockedName(text);
    if (name) problems.push(`${rel} contains the personal name ${JSON.stringify(name)}`);
    for (const re of EXTERNAL_LOAD) { const m = re.exec(text); if (m) problems.push(`${rel} loads something from another site: ${m[0].slice(0, 80)}`); }
    const a = ANALYTICS.exec(text);
    if (a) problems.push(`${rel} contains analytics or tracking (${a[0]})`);
    // License texts (e.g. the fonts' OFL) quote the licence's own http:// address; they are not links.
    if (!rel.endsWith('.txt')) for (const u of insecureLinks(text)) problems.push(`${rel} has an insecure http:// link ${u}`);
    if (rel.endsWith('.svg') && /<script|\son[a-z]+\s*=|<foreignObject/i.test(text)) problems.push(`${rel} contains a script`);
  }

  // 4. Every local reference in every published page, stylesheet, module and manifest resolves inside the site.
  for (const from of files.filter((f) => /\.(?:html|css|js|webmanifest)$/.test(f))) {
    const text = read(from);
    let refs;
    if (from.endsWith('.html')) refs = [...htmlRefs(text), ...[...text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].flatMap((m) => cssRefs(m[1]))];
    else if (from.endsWith('.css')) refs = cssRefs(text);
    else if (from.endsWith('.webmanifest')) refs = manifestRefs(text);
    else refs = jsRefs(text);
    for (const ref of refs) {
      if (!ref || ref.startsWith('#') || /^(?:data|mailto|tel|javascript|blob):/i.test(ref)) continue;
      if (/^[a-z]+:|^\/\//i.test(ref)) {
        // Plain links to other sites are allowed from pages (https only); anything loaded must be local.
        if (from.endsWith('.html') && /^https:\/\//i.test(ref)) continue;
        problems.push(`${from} loads ${ref} from another site`);
        continue;
      }
      if (ref.startsWith('/')) { problems.push(`${from} uses ${ref}, which breaks under /StudyNova/ and /StudyNova/preview/; use a relative path`); continue; }
      if (from.endsWith('.js') && !ref.startsWith('.')) { problems.push(`${from} imports ${ref}; use a relative path`); continue; }
      const clean = decodeURI(ref.split(/[?#]/)[0]);
      if (!clean) continue;
      let target = path.posix.normalize(path.posix.join(path.posix.dirname(from), clean));
      if (target.startsWith('..')) { problems.push(`${from} refers to ${ref}, outside the site`); continue; }
      if (target.endsWith('/') || target === '.') target = path.posix.join(target, 'index.html');
      if (fs.existsSync(path.join(dir, target)) && fs.statSync(path.join(dir, target)).isDirectory()) target = path.posix.join(target, 'index.html');
      if (!has(target)) problems.push(`${from} refers to ${target}, which is missing`);
    }
  }

  // 5. Data: valid, and exactly the listed weeks are published.
  if (has('data/subjects.json')) {
    try { problems.push(...validateSubjects(JSON.parse(read('data/subjects.json'))).map((p) => `data/subjects.json: ${p}`)); }
    catch (e) { problems.push(`data/subjects.json is not valid JSON: ${e.message}`); }
  }
  if (has('data/weeks/index.json')) {
    let index = null;
    try { index = JSON.parse(read('data/weeks/index.json')); } catch (e) { problems.push(`data/weeks/index.json is not valid JSON: ${e.message}`); }
    if (index) {
      problems.push(...validateWeekIndex(index).map((p) => `data/weeks/index.json: ${p}`));
      const ids = new Set((index.weeks || []).map((w) => w.id));
      for (const rel of files.filter((f) => /^data\/weeks\/\d/.test(f))) {
        if (!ids.has(rel.slice('data/weeks/'.length, -'.json'.length))) problems.push(`${rel} is published but not listed in data/weeks/index.json`);
      }
      for (const id of ids) {
        const rel = `data/weeks/${id}.json`;
        if (!has(rel)) { problems.push(`${rel} is listed in data/weeks/index.json but missing`); continue; }
        try { problems.push(...validateWeek(JSON.parse(read(rel)), id).map((p) => `${rel}: ${p}`)); }
        catch (e) { problems.push(`${rel} is not valid JSON: ${e.message}`); }
      }
    }
  }

  // 6. Size cap.
  const bytes = files.reduce((n, f) => n + fs.statSync(path.join(dir, f)).size, 0);
  if (bytes > MAX_BYTES) problems.push(`the site is ${(bytes / 1048576).toFixed(1)} MB, over the ${MAX_BYTES / 1048576} MB cap`);
  return problems;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const out = path.resolve(process.argv[2] || path.join(REPO, '_site'));
  const { copied, skipped } = buildSite(out);
  const bytes = copied.reduce((n, f) => n + fs.statSync(path.join(out, f)).size, 0);
  console.log(`Built ${path.relative(REPO, out) || out}: ${copied.length} files published (${(bytes / 1048576).toFixed(1)} MB), ${skipped.length} left out.`);
  for (const s of skipped) console.log(`  left out: ${s}`);
  const problems = verifySite(out);
  if (problems.length) {
    console.log(`\nNOT SAFE TO PUBLISH (${problems.length} problem${problems.length > 1 ? 's' : ''}):`);
    for (const p of problems) console.log(`  - ${p}`);
    process.exit(1);
  }
  console.log('Verified: only approved files, no scans, no personal names, no external loads, every reference resolves, data valid.');
}
