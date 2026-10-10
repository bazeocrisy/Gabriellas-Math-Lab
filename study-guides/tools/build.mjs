// Builds print-ready PDFs from the lesson HTML files, checks them, and renders every PDF page to PNG.
//
//   cd study-guides && npm install && npm run build            # every lesson
//   node tools/build.mjs decimals/lesson-01                     # one lesson
//
// Uses the Chrome (or Edge) already installed on this computer; set CHROME_PATH to choose another.
// Checks (the build fails if any of these fail):
//   1. every model drew without an error;
//   2. nothing on a page runs past the margins or into the footer (no clipped content);
//   3. the PDF has exactly one page per <section class="page">;
//   4. every question (data-q) has exactly one answer-key entry (data-for), and vice versa;
//   5. when a question has data-answer, its key entry shows that answer, and if it also has
//      data-model-answer, the model inside the question was drawn from that same value.
// After building, each PDF page is rendered with pdf.js to qa/<lesson>/page-NN.png for visual inspection.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LESSONS = path.join(ROOT, 'lessons');
const OUT = path.join(ROOT, 'pdf');
const QA = path.join(ROOT, 'qa');

function findChrome() {
  const c = [process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean);
  const hit = c.find((p) => fs.existsSync(p));
  if (!hit) throw new Error('Chrome not found; set CHROME_PATH');
  return hit;
}

function listLessons(args) {
  if (args.length) return args.map((a) => path.join(LESSONS, a.replace(/\.html$/, '') + '.html'));
  const out = [];
  for (const d of fs.readdirSync(LESSONS)) for (const f of fs.readdirSync(path.join(LESSONS, d))) if (f.endsWith('.html')) out.push(path.join(LESSONS, d, f));
  return out;
}

// Static server so pdf.js can load as a module (file:// blocks module imports).
function serve() {
  const types = { '.mjs': 'text/javascript', '.js': 'text/javascript', '.pdf': 'application/pdf', '.html': 'text/html' };
  const srv = http.createServer((req, res) => {
    const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' });
    fs.createReadStream(p).pipe(res);
  });
  return new Promise((r) => srv.listen(0, '127.0.0.1', () => r(srv)));
}

async function checkLayout(page) {
  return page.evaluate(() => {
    const IN = 96, problems = [];
    const pages = [...document.querySelectorAll('.page')];
    pages.forEach((pg, i) => {
      const P = pg.getBoundingClientRect();
      const foot = pg.querySelector('.pg-foot');
      const bottomLimit = foot ? foot.getBoundingClientRect().top - 0.08 * IN : P.bottom - 0.5 * IN; // keep a gap above the footer
      const cover = pg.classList.contains('cover');
      for (const el of pg.querySelectorAll('*')) {
        if (foot && (el === foot || foot.contains(el))) continue;
        if (el.matches('.body, .inner')) continue; // stretchy layout containers; their children are checked
        const r = el.getBoundingClientRect();
        if (!r.width && !r.height) continue;
        const name = el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : '');
        if (r.bottom > bottomLimit + 0.5) problems.push(`page ${i + 1}: ${name} runs into the footer/bottom margin by ${(r.bottom - bottomLimit).toFixed(1)}px: "${el.textContent.trim().slice(0, 50)}"`);
        if (!cover && (r.right > P.right - 0.45 * IN + 0.5 || r.left < P.left + 0.45 * IN - 0.5)) problems.push(`page ${i + 1}: ${name} outside the side margins: "${el.textContent.trim().slice(0, 50)}"`);
      }
      // A child sticking out sideways past its parent's box overlaps its neighbor (e.g. a chart under text).
      for (const el of pg.querySelectorAll('.body *')) {
        const par = el.parentElement;
        if (!par || par.closest('svg') || par.tagName === 'TR' || getComputedStyle(par).display === 'inline') continue;
        const r = el.getBoundingClientRect(), p = par.getBoundingClientRect();
        if (!r.width) continue;
        const nm = el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.split(' ')[0] : '');
        if (r.right > p.right + 1.5 || r.left < p.left - 1.5) problems.push(`page ${i + 1}: ${nm} sticks out of its parent box by ${Math.max(r.right - p.right, p.left - r.left).toFixed(1)}px: "${el.textContent.trim().slice(0, 40)}"`);
      }
      // Text clipped inside its own box
      for (const el of pg.querySelectorAll('.body *')) {
        const cs = getComputedStyle(el);
        if (cs.overflow === 'hidden' && el.scrollHeight > el.clientHeight + 1) problems.push(`page ${i + 1}: content clipped inside ${el.className}`);
      }
    });
    return { problems, count: pages.length };
  });
}

async function checkAnswers(page) {
  return page.evaluate(() => {
    const problems = [], { parse } = window.StudyGuide;
    const qs = [...document.querySelectorAll('[data-q]')], keys = [...document.querySelectorAll('[data-for]')];
    const qIds = qs.map((q) => q.dataset.q), kIds = keys.map((k) => k.dataset.for);
    const dup = (a) => a.filter((x, i) => a.indexOf(x) !== i);
    for (const d of dup(qIds)) problems.push('duplicate question id ' + d);
    for (const d of dup(kIds)) problems.push('duplicate key entry ' + d);
    for (const id of qIds) if (!kIds.includes(id)) problems.push('question ' + id + ' has no answer-key entry');
    for (const id of kIds) if (!qIds.includes(id)) problems.push('key entry ' + id + ' has no question');
    for (const q of qs) {
      const a = q.dataset.answer;
      if (a == null) continue;
      const k = keys.find((x) => x.dataset.for === q.dataset.q);
      const shown = k && k.querySelector('.ka') ? k.querySelector('.ka').textContent.replace(/\s+/g, ' ') : '';
      if (!shown.includes(a)) problems.push(`key for ${q.dataset.q} should show "${a}" but shows "${shown}"`);
      if (q.dataset.modelAnswer) {
        const ms = [...q.querySelectorAll('[data-model][data-value]')].filter((m) => !m.dataset.blank);
        if (!ms.length) problems.push(q.dataset.q + ' has data-model-answer but no model');
        for (const m of ms) if (parse(m.dataset.value).thou !== parse(a).thou) problems.push(`${q.dataset.q}: model shows ${m.dataset.value} but answer is ${a}`);
      }
    }
    // Practice engine (assets/practice.js): every answer computed or written, with no errors.
    const P = window.__practice;
    if (P) {
      for (const e of P.errors) problems.push('answer: ' + e);
      if (!P.items.length) problems.push('no questions found');
    }
    return { problems, questions: qs.length, practice: P ? P.count : null, tries: P ? P.tries : null };
  });
}

async function renderPages(browser, base, pdfRel, outDir) {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const page = await browser.newPage();
  await page.goto(base + '/tools/render.html');
  await page.waitForFunction('typeof window.renderPdf === "function"');
  const pages = await page.evaluate(async (url) => window.renderPdf(url, 2), base + '/' + pdfRel);
  pages.forEach((dataUrl, i) => fs.writeFileSync(path.join(outDir, `page-${String(i + 1).padStart(2, '0')}.png`), Buffer.from(dataUrl.split(',')[1], 'base64')));
  await page.close();
  return pages.length;
}

const files = listLessons(process.argv.slice(2));
const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true, args: ['--allow-file-access-from-files'] });
const srv = await serve();
const base = `http://127.0.0.1:${srv.address().port}`;
let failed = false;
try {
  for (const file of files) {
    const rel = path.relative(LESSONS, file).replace(/\\/g, '/').replace(/\.html$/, '');
    const page = await browser.newPage();
    page.on('pageerror', (e) => { console.log('  ✖ page error: ' + e.message); failed = true; });
    await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
    await page.waitForFunction('window.__modelsReady === true');
    await page.evaluate(() => document.fonts.ready);
    const fonts = await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family));
    const modelErrors = await page.evaluate(() => window.__modelErrors);
    await page.emulateMediaType('print');
    const layout = await checkLayout(page);
    const answers = await checkAnswers(page);
    const title = await page.title();
    const pdfName = title.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.pdf';
    const pdfPath = path.join(OUT, path.dirname(rel), pdfName);
    fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
    await page.pdf({ path: pdfPath, preferCSSPageSize: true, printBackground: true, tagged: true });
    await page.close();
    const pdfRel = path.relative(ROOT, pdfPath).replace(/\\/g, '/');
    const rendered = await renderPages(browser, base, pdfRel, path.join(QA, rel));

    const problems = [...modelErrors.map((e) => 'model: ' + e), ...layout.problems, ...answers.problems];
    if (!fonts.includes('Lexend')) problems.push('Lexend font did not load');
    if (rendered !== layout.count) problems.push(`PDF has ${rendered} pages but the HTML has ${layout.count} page sections`);
    console.log(`${problems.length ? '✖' : '✔'} ${rel} → ${pdfRel}`);
    if (answers.practice != null) console.log(`  ${answers.practice} practice problems + ${answers.tries} Let's Try One problems, all answered in the key`);
    console.log(`  ${layout.count} pages, ${answers.questions} questions, fonts: ${[...new Set(fonts)].join(', ')}; PNGs in qa/${rel}/`);
    for (const p of problems) console.log('  ✖ ' + p);
    if (problems.length) failed = true;
  }
} finally {
  await browser.close();
  srv.close();
}
process.exit(failed ? 1 : 0);
