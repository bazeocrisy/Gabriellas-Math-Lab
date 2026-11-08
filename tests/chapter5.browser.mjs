// Chapter 5 whole-book viewer: every page, every ? button, saving, migration, print, layout.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { ROOT, BASE, startServer, startBrowser } from './lib/harness.mjs';
const server = await startServer(), profile = fs.mkdtempSync(path.join(os.tmpdir(), 'gml-ch5-'));
let b = await startBrowser({ profile });
const url = server.origin + BASE + 'chapter-5/';
let passed = 0;
const check = (name, ok) => { assert.ok(ok, name); passed++; console.log('PASS ' + name); };
const value = (expr) => b.js('return ' + expr);
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'chapter-5/data/manifest.json')));
const questions = JSON.parse(fs.readFileSync(path.join(ROOT, 'chapter-5/data/questions.json')));
fs.mkdirSync(path.join(ROOT, 'docs/gml-007'), { recursive: true });
const shot = (name) => b.shot(path.join(ROOT, 'docs/gml-007', name + '.png'), false);
try {
  await b.viewport(1280, 800, false);
  // Existing Lesson 5-1 work must come across on first visit.
  await b.load(server.origin + BASE + 'chapter-5/data/pages.json'); // same origin, no app running
  await b.js(`localStorage.setItem('gml:lesson-5-1:v2', JSON.stringify({version:2,lesson:'5-1',page:'145',answers:{'145_1':'10 × 10 × 10 × 10'},ink:{},completed:{}}))`);
  await b.load(url);
  check('first visit resumes Lesson 5-1 work on page 145', await value(`document.querySelector('.sheet').dataset.page==='145'&&document.querySelector('[data-id="1"]').value==='10 × 10 × 10 × 10'&&document.getElementById('sectionLabel').textContent==='Lesson 5-1'`));
  check('page picker lists all 38 pages grouped by section', await value(`document.querySelectorAll('#pages option').length===38&&document.querySelectorAll('#pages optgroup').length===${manifest.sections.length}`));
  let total = 0;
  for (const sec of manifest.sections) for (const p of sec.pages) {
    await b.hash('page=' + p); await b.wait(60);
    check(`page ${p}: exact image, aspect ratio and section label`, await value(`(()=>{const s=document.querySelector('.sheet'),r=s.getBoundingClientRect(),i=s.querySelector('.source');return s.dataset.page==='${p}'&&i.src.endsWith('page-${p}.png')&&Math.abs(r.width/r.height-612/792)<.001&&document.getElementById('sectionLabel').textContent===${JSON.stringify(sec.label)};})()`));
    const n = (questions[p] || []).length; total += n;
    check(`page ${p}: ${n} ? buttons`, await value(`document.querySelectorAll('.marker').length===${n}`));
    for (let i = 0; i < n; i++) {
      await b.js(`document.querySelectorAll('.marker')[${i}].click()`);
      check(`page ${p} ? ${i + 1}: own solution in the right pane, button beside the page`, await value(`(()=>{const m=document.querySelectorAll('.marker')[${i}],r=m.getBoundingClientRect(),s=document.querySelector('.source').getBoundingClientRect(),h=document.getElementById('help'),hr=h.getBoundingClientRect(),k=document.querySelector('.book-card').getBoundingClientRect();return !h.hidden&&h.dataset.question===m.dataset.question&&document.getElementById('answer').textContent.length>0&&document.querySelectorAll('#steps li').length>0&&(r.right<=s.left+1||r.left>=s.right-1)&&hr.left>=k.right-1;})()`));
    }
    if (n) await b.js(`document.getElementById('closeHelp').click()`);
    await b.js(`document.querySelectorAll('.marker').length&&0`);
  }
  check(`all ${total} questions in the book were opened`, total === Object.values(questions).flat().length);
  // Overlapping ? buttons on any page at phone width.
  await b.viewport(390, 844, true);
  for (const p of manifest.pages.map((x) => x.number)) {
    await b.hash('page=' + p); await b.wait(40);
    check(`page ${p} at 390px: no overlapping ? buttons, no horizontal overflow`, await value(`(()=>{const r=[...document.querySelectorAll('.marker')].map(m=>({l:m.classList.contains('left'),r:m.getBoundingClientRect()}));for(let i=0;i<r.length;i++)for(let j=i+1;j<r.length;j++){if(r[i].l!==r[j].l)continue;const a=r[i].r,c=r[j].r;if(a.top<c.bottom-.5&&c.top<a.bottom-.5)return false;}return document.documentElement.scrollWidth<=innerWidth;})()`));
  }
  await b.viewport(1280, 800, false);
  // Typing on a new lesson page saves under the chapter key and survives a reload.
  const q = Object.entries(questions).find(([p, qs]) => Number(p) > 146 && qs.length);
  if (q) {
    const [p, qs] = q;
    await b.hash('page=' + p); await b.wait(60);
    await b.js(`const e=document.querySelector('[data-id=${JSON.stringify(qs[0].id)}]');e.value='my answer';e.dispatchEvent(new Event('input'))`);
    await b.reload();
    check(`typed answer on page ${p} survives reload`, await value(`document.querySelector('.sheet').dataset.page==='${p}'&&document.querySelector('[data-id=${JSON.stringify(qs[0].id)}]').value==='my answer'&&JSON.parse(localStorage.getItem('gml:chapter-5:v1')).answers['${p}_${qs[0].id}']==='my answer'`));
    check('Lesson 5-1 saved work is left untouched', await value(`JSON.parse(localStorage.getItem('gml:lesson-5-1:v2')).answers['145_1']==='10 × 10 × 10 × 10'`));
    await b.js(`document.querySelectorAll('.marker')[0].click()`); await b.wait(150); await shot('desktop-' + p);
  }
  await b.hash('page=171'); await b.wait(80); await shot('desktop-171');
  await b.viewport(390, 844, true); await b.hash('page=149'); await b.wait(80); await shot('mobile-149');
  await b.viewport(1280, 800, false);
  // Print: only the open lesson's pages, with no controls.
  await b.hash('page=149'); await b.wait(60);
  await b.send('Emulation.setEmulatedMedia', { media: 'print' });
  const pdf = await b.send('Page.printToPDF', { printBackground: true, preferCSSPageSize: true }); assert.ok(pdf.result?.data);
  check('printing gives the open lesson\'s four original pages and no controls', await value(`(()=>{const s=[...document.querySelectorAll('#printRoot .sheet')].map(x=>x.dataset.page);return s.join()==='147,148,149,150'&&!document.querySelector('#printRoot button');})()`));
  await b.send('Emulation.setEmulatedMedia', { media: '' });
  for (const w of [320, 390, 820, 1280, 1440]) {
    await b.viewport(w, 900, w < 1024); await b.wait(60);
    check(`controls at least 44px on touch (36px with a mouse), no overflow at ${w}px`, await value(`document.documentElement.scrollWidth<=innerWidth&&[...document.querySelectorAll('header a,header select,nav button,.toolbar button,.toolbar summary,.toolbar .toggle-chip,.marker')].filter(e=>e.getClientRects().length).every(e=>{const r=e.getBoundingClientRect(),min=matchMedia('(pointer: coarse)').matches?43.5:35.5;return r.width>=min&&r.height>=min;})`));
  }
  check('no runtime errors', b.errors.length === 0);
  check('no missing files', server.missing.length === 0);
  console.log(`All ${passed} Chapter 5 browser checks passed.`);
} finally { await b.close(); server.close(); }
