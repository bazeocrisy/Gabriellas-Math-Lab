// StudyNova Math on real phone, tablet, laptop and desktop screen sizes (touch emulated on phones/tablets).
// Checks the StudyNova header (brand, Math label, "All subjects" link back to the hub), the menu, tap-target
// sizes and that the main Math pages fit the screen width.
// Run: CHROME_PATH=/usr/bin/google-chrome node tests/math/devices.browser.mjs
import assert from 'node:assert/strict';
import path from 'node:path';
import { SHOTS, BASE, SITE_BASE, startServer, startBrowser } from './lib/harness.mjs';
const DEVICES = [
  ['iPhone SE', 375, 667, true], ['iPhone 15', 393, 852, true], ['iPhone 15 Pro Max', 430, 932, true], ['Pixel 7', 412, 915, true],
  ['Small phone 320', 320, 640, true],
  ['iPad mini portrait', 768, 1024, true], ['iPad Air portrait', 820, 1180, true], ['iPad Air landscape', 1180, 820, true],
  ['iPad Pro 12.9 portrait', 1024, 1366, true], ['iPad Pro 12.9 landscape', 1366, 1024, true],
  ['Galaxy Tab landscape', 1280, 800, true],
  ['Laptop 1280x800', 1280, 800, false], ['Laptop 1366x768', 1366, 768, false], ['Laptop 1440x900', 1440, 900, false], ['Desktop 1920x1080', 1920, 1080, false],
];
const ROUTES = ['#/', '#/decimals', '#/learn', '#/d01/teach/2', '#/chapter4', '#/practice', '#/guides', '#/parent'];
const server = await startServer();
const b = await startBrowser();
const url = server.origin + BASE + 'index.html';
let passed = 0;
const check = (name, ok, info) => { assert.ok(ok, name + (info !== undefined ? ' ' + JSON.stringify(info) : '')); passed++; console.log('PASS ' + name); };
const value = (expr) => b.js('return ' + expr);
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const tap = async (x, y) => {
  await b.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  await b.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
};
const click = async (x, y) => {
  await b.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await b.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
};
const center = (sel) => value(`(()=>{const r=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
const header = `document.querySelector('.site-header')`;
try {
  await b.viewport(1280, 800, false); await b.load(url + '#/');
  await b.js('localStorage.clear();');
  for (const [name, w, h, touch] of DEVICES) {
    await b.viewport(w, h, touch); await b.load(url + '#/');
    const press = touch ? tap : click;
    const min = touch ? 43.5 : 35.5;
    const r = await value(`(()=>{const a=document.querySelector('.sn-back'),ar=a.getBoundingClientRect(),br=document.querySelector('.brand').getBoundingClientRect();
      return {back:{w:ar.width,h:ar.height,l:ar.left,r:ar.right,t:ar.top,b:ar.bottom,href:a.href,vis:a.getClientRects().length>0},
        brand:document.querySelector('.brand-name').innerText.replace(/\\s+/g,''),math:document.querySelector('.brand-math').getClientRects().length>0&&document.querySelector('.brand-math').innerText.trim(),
        brandTop:br.top,headerBottom:${header}.getBoundingClientRect().bottom}})()`);
    check(`${name}: brand reads StudyNova with a visible Math label`, r.brand === 'StudyNova' && r.math === 'Math', r);
    check(`${name}: "All subjects" is visible above the Math bar, on screen and big enough to ${touch ? 'tap (44px)' : 'click (36px)'}`,
      r.back.vis && r.back.w >= min && r.back.h >= min && r.back.l >= -.5 && r.back.r <= w + .5 && r.back.b <= r.brandTop + 1 && r.back.href === server.origin + SITE_BASE + 'index.html#/', r.back);
    check(`${name}: header uses at most a quarter of the screen height`, r.headerBottom <= h * .25, { bottom: r.headerBottom, h });
    if (w >= 1000) check(`${name}: brand and main nav share one row under the "All subjects" link`,
      await value(`(()=>{const b=document.querySelector('.brand').getBoundingClientRect(),n=[...document.querySelectorAll('.site-nav a')].map(a=>a.getBoundingClientRect());return n.every(x=>x.top<b.bottom&&x.bottom>b.top);})()`));
    if (w <= 760) {
      check(`${name}: Menu button is shown and big enough to tap`, await value(`(()=>{const t=document.querySelector('.nav-toggle'),r=t.getBoundingClientRect();return t.getClientRects().length>0&&r.width>=43.5&&r.height>=43.5&&r.right<=innerWidth+.5;})()`));
      const m = await center('.nav-toggle'); await press(m.x, m.y); await b.wait(150);
      check(`${name}: Menu opens the nav with full-width links`, await value(`document.querySelector('.nav-toggle').getAttribute('aria-expanded')==='true'&&[...document.querySelectorAll('.site-nav a')].every(a=>{const r=a.getBoundingClientRect();return a.getClientRects().length>0&&r.height>=43.5&&r.right<=innerWidth+.5;})`));
      await b.shot(path.join(SHOTS, 'devices', slug(name) + '-menu.png'), false);
      await press(m.x, m.y); await b.wait(150);
      check(`${name}: Menu closes again`, await value(`document.querySelector('.nav-toggle').getAttribute('aria-expanded')==='false'`));
    } else {
      check(`${name}: every nav link is visible and big enough to ${touch ? 'tap' : 'click'}`, await value(`[...document.querySelectorAll('.site-nav a')].every(a=>{const r=a.getBoundingClientRect();return a.getClientRects().length>0&&r.width>=${min}&&r.height>=${min}&&r.right<=innerWidth+.5;})`));
    }
    await b.shot(path.join(SHOTS, 'devices', slug(name) + '.png'), false);
    for (const route of ROUTES) {
      await b.hash(route);
      const o = await value(`(()=>{const d=document.documentElement;return{sw:d.scrollWidth,cw:d.clientWidth,h1:!!document.querySelector('h1')}})()`);
      check(`${name} ${route}: page fits the width (no sideways scroll) and has a heading`, o.sw <= o.cw && o.h1, o);
    }
  }
  check('no runtime errors', b.errors.length === 0, b.errors);
  check('no missing files', server.missing.length === 0, server.missing);
  console.log(`All ${passed} device checks passed.`);
} finally { await b.close(); server.close(); }
