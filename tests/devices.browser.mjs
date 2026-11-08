// Chapter 5 on real phone, tablet, laptop and desktop screen sizes (touch emulated on phones/tablets).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, BASE, startServer, startBrowser } from './lib/harness.mjs';
const DEVICES = [
  ['iPhone SE', 375, 667, true], ['iPhone 15', 393, 852, true], ['iPhone 15 Pro Max', 430, 932, true], ['Pixel 7', 412, 915, true],
  ['iPad mini portrait', 768, 1024, true], ['iPad Air portrait', 820, 1180, true], ['iPad Air landscape', 1180, 820, true],
  ['iPad Pro 12.9 portrait', 1024, 1366, true], ['iPad Pro 12.9 landscape', 1366, 1024, true],
  ['Galaxy Tab landscape', 1280, 800, true],
  ['Laptop 1280x800', 1280, 800, false], ['Laptop 1366x768', 1366, 768, false], ['Laptop 1440x900', 1440, 900, false], ['Desktop 1920x1080', 1920, 1080, false],
];
const server = await startServer();
const b = await startBrowser();
const url = server.origin + BASE + 'chapter-5/';
let passed = 0;
const check = (name, ok, info) => { assert.ok(ok, name + (info ? ' ' + JSON.stringify(info) : '')); passed++; console.log('PASS ' + name); };
const value = (expr) => b.js('return ' + expr);
const out = path.join(ROOT, 'docs/gml-008'); fs.mkdirSync(out, { recursive: true });
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const tap = async (x, y) => {
  await b.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  await b.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
};
const click = async (x, y) => {
  await b.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await b.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
};
const center = (sel, i = 0) => value(`(()=>{const r=document.querySelectorAll(${JSON.stringify(sel)})[${i}].getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
try {
  await b.viewport(1280, 800, false); await b.load(url);
  check('viewport meta stops iPhone Safari zooming the app when an answer box is tapped', await value(`/maximum-scale=1/.test(document.querySelector('meta[name=viewport]').content)`));
  for (const [name, w, h, touch] of DEVICES) {
    await b.viewport(w, h, touch); await b.hash('page=145'); await b.js(`localStorage.removeItem('gml:chapter-5:view')`); await b.reload(); await b.wait(250);
    const press = touch ? tap : click;
    if (w <= 760) {
      // Phones open one problem at a time: the original page framed on that problem, with a bottom bar.
      check(`${name}: opens in problem view with the bottom bar`, await value(`document.body.classList.contains('problem-view')&&!document.getElementById('probBar').hidden&&document.getElementById('probCount').textContent.startsWith('1 of 14')`));
      const framed = `(()=>{const q=document.querySelector('.q-focus').getBoundingClientRect(),v=document.getElementById('viewer').getBoundingClientRect(),bar=document.getElementById('probBar').getBoundingClientRect();return q.top>=v.top-1&&q.bottom<=bar.top+1&&q.left>=v.left-1&&q.right<=v.right+1&&q.width>=v.width*.6;})()`;
      check(`${name}: problem 1 is framed large, fully on screen above the bar`, await value(framed));
      check(`${name}: bottom bar buttons big enough to tap`, await value(`[...document.querySelectorAll('#probBar button')].every(e=>{const r=e.getBoundingClientRect();return r.width>=43.5&&r.height>=43.5&&r.right<=innerWidth+.5;})`));
      let nb = await center('#probNext'); await press(nb.x, nb.y); await b.wait(250);
      check(`${name}: Next moves to problem 2, framed on screen`, await value(`document.getElementById('probCount').textContent.startsWith('2 of 14')`) && await value(framed));
      const vc = await center('#viewer');
      await b.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: vc.x + 80, y: vc.y }] });
      for (let s = 1; s <= 4; s++) await b.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: vc.x + 80 - s * 40, y: vc.y + 2 }] });
      await b.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await b.wait(250);
      check(`${name}: swiping left moves to the next problem`, await value(`document.getElementById('probCount').textContent.startsWith('3 of 14')`));
      const hb = await center('#probHelp'); await press(hb.x, hb.y); await b.wait(400);
      check(`${name}: ? in the bar shows this problem's answer, problem still visible above it`, await value(`(()=>{const h=document.getElementById('help'),r=h.getBoundingClientRect(),q=document.querySelector('.q-focus').getBoundingClientRect();return !h.hidden&&h.dataset.question==='3'&&document.getElementById('answer').textContent.length>0&&r.bottom<=innerHeight+.5&&q.top<r.top-20&&q.top>=document.getElementById('viewer').getBoundingClientRect().top-2;})()`));
      const xb = await center('#closeHelp'); await press(xb.x, xb.y); await b.wait(200);
      const fb = await center('[data-id="3"]'); await press(fb.x, fb.y); await b.wait(100);
      await b.send('Input.insertText', { text: '10 × 10 × 10' }); await b.wait(100);
      check(`${name}: typing in the framed problem saves`, await value(`JSON.parse(localStorage.getItem('gml:chapter-5:v1')).answers['145_3']==='10 × 10 × 10'`));
      await b.js(`document.activeElement.blur();const e=document.querySelector('[data-id="3"]');e.value='';e.dispatchEvent(new Event('input'))`);
      await b.shot(path.join(out, slug(name) + '-problem.png'), false);
      const pb = await center('#probPage'); await press(pb.x, pb.y); await b.wait(300);
      check(`${name}: Whole page shows the full page with a way back`, await value(`!document.body.classList.contains('problem-view')&&!document.getElementById('toProblems').hidden&&document.querySelectorAll('.marker').length===14&&document.querySelector('.marker').getClientRects().length===1`));
    }
    check(`${name}: app fits the screen exactly (no page scroll either way)`, await value(`document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight+1`));
    if (w >= 1000) check(`${name}: top bar is a single row`, await value(`document.querySelector('.app-header').getBoundingClientRect().height<80`), await value(`document.querySelector('.app-header').getBoundingClientRect().height`));
    check(`${name}: top bar uses at most 20% of the height`, await value(`document.querySelector('.app-header').getBoundingClientRect().bottom<=innerHeight*.2`), await value(`document.querySelector('.app-header').getBoundingClientRect().bottom`));
    check(`${name}: whole page width visible at start, page fills most of the width`, await value(`(()=>{const v=document.getElementById('viewer').getBoundingClientRect(),s=document.querySelector('.sheet').getBoundingClientRect();return s.left>=v.left-1&&s.right<=v.right+1&&s.width>=Math.min(v.width*.7,1000*.95);})()`));
    check(`${name}: every control big enough to ${touch ? 'tap (44px)' : 'click (36px)'}`, await value(`[...document.querySelectorAll('header a,header select,nav button,.toolbar button,.toolbar summary,.toolbar .toggle-chip,.marker')].filter(e=>e.getClientRects().length).every(e=>{const r=e.getBoundingClientRect(),m=${touch ? 43.5 : 35.5};return r.width>=m&&r.height>=m&&r.right<=innerWidth+.5&&r.left>=-.5;})`));
    check(`${name}: ? buttons beside the page, none overlapping`, await value(`(()=>{const s=document.querySelector('.source').getBoundingClientRect(),r=[...document.querySelectorAll('.marker')].map(m=>({l:m.classList.contains('left'),r:m.getBoundingClientRect()}));if(!r.every(o=>o.r.right<=s.left+1||o.r.left>=s.right-1))return false;for(let i=0;i<r.length;i++)for(let j=i+1;j<r.length;j++){if(r[i].l!==r[j].l)continue;const a=r[i].r,c=r[j].r;if(a.top<c.bottom-.5&&c.top<a.bottom-.5)return false;}return true;})()`));
    await b.shot(path.join(out, slug(name) + '.png'), false);
    // Tap / click a ? (problem 13: low on the page, the hardest case for a bottom sheet).
    const idx = await value(`[...document.querySelectorAll('.marker')].findIndex(m=>m.dataset.question==='13')`);
    await b.js(`document.querySelectorAll('.marker')[${idx}].scrollIntoView({block:'center'})`); await b.wait(80);
    const m = await center('.marker', idx); await press(m.x, m.y); await b.wait(500);
    const sidePane = w >= 1000;
    check(`${name}: tapping ? shows the answer as a ${sidePane ? 'right-hand pane' : 'bottom sheet'} that fits the screen`, await value(`(()=>{const h=document.getElementById('help'),r=h.getBoundingClientRect(),k=document.querySelector('.book-card').getBoundingClientRect();return !h.hidden&&h.dataset.question==='13'&&document.getElementById('answer').textContent.length>0&&r.left>=-.5&&r.right<=innerWidth+.5&&r.bottom<=innerHeight+.5&&r.top>=0&&(${sidePane}?r.left>=k.right-1:r.top>innerHeight*.45);})()`));
    check(`${name}: the outlined problem stays visible beside or above the answer`, await value(`(()=>{const q=document.querySelector('.q-focus').getBoundingClientRect(),v=document.getElementById('viewer').getBoundingClientRect(),h=document.getElementById('help').getBoundingClientRect(),bottom=${sidePane}?v.bottom:Math.min(v.bottom,h.top);return q.top>=v.top-2&&q.top<bottom-20;})()`));
    check(`${name}: answer text readable (at least 16px) and not cut off sideways`, await value(`(()=>{const a=document.getElementById('answer');return parseFloat(getComputedStyle(a).fontSize)>=16&&a.scrollWidth<=a.clientWidth+1;})()`));
    await b.shot(path.join(out, slug(name) + '-answer.png'), false);
    const x = await center('#closeHelp'); await press(x.x, x.y); await b.wait(200);
    check(`${name}: X closes the answer`, await value(`document.getElementById('help').hidden`));
    // Type an answer with the on-screen keyboard path (focus + text input).
    await b.js(`document.getElementById('viewer').scrollTo(0,0)`); await b.wait(60);
    const f = await center('[data-id="1"]'); await press(f.x, f.y); await b.wait(100);
    await b.send('Input.insertText', { text: '10 × 10 × 10 × 10' }); await b.wait(100);
    check(`${name}: typing in an answer box works and saves`, await value(`document.querySelector('[data-id="1"]').value.endsWith('10 × 10 × 10 × 10')&&JSON.parse(localStorage.getItem('gml:chapter-5:v1')).answers['145_1'].endsWith('10 × 10 × 10 × 10')`));
    await b.js(`document.activeElement.blur();const e=document.querySelector('[data-id="1"]');e.value='';e.dispatchEvent(new Event('input'))`);
    // Zoom the page only: pinch on touch screens, trackpad pinch (ctrl + wheel) on laptops.
    const before = await value(`({w:document.getElementById('stage').getBoundingClientRect().width,hh:document.querySelector('.app-header').getBoundingClientRect().height})`);
    const v = await center('#viewer');
    if (touch) {
      await b.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: v.x - 30, y: v.y, id: 1 }, { x: v.x + 30, y: v.y, id: 2 }] });
      for (let s = 1; s <= 6; s++) await b.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: v.x - 30 - s * 12, y: v.y, id: 1 }, { x: v.x + 30 + s * 12, y: v.y, id: 2 }] });
      await b.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    } else {
      for (let s = 0; s < 10; s++) await b.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: v.x, y: v.y, deltaX: 0, deltaY: -20, modifiers: 2 });
    }
    await b.wait(150);
    const after = await value(`({w:document.getElementById('stage').getBoundingClientRect().width,hh:document.querySelector('.app-header').getBoundingClientRect().height,scale:window.visualViewport?window.visualViewport.scale:1,sw:document.documentElement.scrollWidth})`);
    check(`${name}: ${touch ? 'pinch' : 'trackpad pinch'} zooms only the page (bars unchanged, no app zoom, no overflow)`, after.w > before.w * 1.3 && Math.abs(after.hh - before.hh) < 1 && after.scale === 1 && after.sw <= w, { before, after });
  }
  check('no runtime errors', b.errors.length === 0, b.errors);
  check('no missing files', server.missing.length === 0, server.missing);
  console.log(`All ${passed} device checks passed.`);
} finally { await b.close(); server.close(); }
