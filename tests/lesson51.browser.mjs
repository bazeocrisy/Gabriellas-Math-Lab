import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {ROOT,BASE,startServer,startBrowser} from './lib/harness.mjs';
const server=await startServer(),profile=fs.mkdtempSync(path.join(os.tmpdir(),'gml-lesson51-'));
let b=await startBrowser({profile});
const url=server.origin+BASE+'lesson-5-1/';
const check=(name,ok)=>{assert.ok(ok,name);console.log('PASS '+name);};
const click=id=>b.js(`document.getElementById(${JSON.stringify(id)}).click()`);
const value=expr=>b.js('return '+expr);
fs.mkdirSync(path.join(ROOT,'docs/gml-006'),{recursive:true});
const shot=name=>b.shot(path.join(ROOT,'docs/gml-006',name+'.png'),false);
try{
 await b.viewport(1440,1050,false);await b.load(url);
 check('lesson loads original first page and navigation boundary',await value(`document.querySelector('.source').naturalWidth===1836 && document.getElementById('prev').disabled && !document.getElementById('next').disabled`));
 await shot('desktop');
 // GML-006 simplified layout checks: top bar + textbook, a ? beside each problem, no side panes.
 check('only the top bar and textbook card are on screen; no side panes',await value(`!document.querySelector('.rail,.qnav-card,#drawer,.nav-card')&&['.app-header','.book-card'].every(s=>document.querySelector(s).getBoundingClientRect().width>0)&&document.getElementById('help').hidden`));
 check('textbook card fills the width and most of the height on desktop',await value(`(()=>{const r=document.querySelector('.book-card').getBoundingClientRect();return r.width>innerWidth-40&&r.height>innerHeight*.75;})()`));
 check('page controls: Page 143, previous, next',await value(`document.getElementById('pages').value==='143'&&document.getElementById('prev').disabled&&document.querySelectorAll('.pager button').length===2`));
 check('every problem has a ? button',await value(`[...document.querySelectorAll('.marker')].length===2&&[...document.querySelectorAll('.marker')].every(m=>m.textContent==='?')`));
 await b.js(`document.querySelector('.marker').click()`);
 check('tapping ? shows hint, steps and answer in the solution card',await value(`(()=>{const h=document.getElementById('help');return !h.hidden&&document.getElementById('hint').textContent.length>0&&document.querySelectorAll('#steps li').length>0&&document.getElementById('answer').textContent.length>0&&document.querySelectorAll('.layer .q-focus').length===1;})()`));
 check('desktop solution opens in a right-hand pane beside the page, not over it',await value(`(()=>{const h=document.getElementById('help').getBoundingClientRect(),k=document.querySelector('.book-card').getBoundingClientRect();return h.left>=k.right&&h.right<=innerWidth&&h.top<innerHeight*.3&&h.height>innerHeight*.6;})()`));
 await b.js(`document.getElementById('original').checked=true;document.getElementById('original').dispatchEvent(new Event('change'))`);
 check('original-only view hides every overlay including ? buttons and highlight',await value(`getComputedStyle(document.querySelector('.layer')).visibility==='hidden'&&getComputedStyle(document.querySelector('.q-focus')).visibility==='hidden'`));
 await b.js(`document.getElementById('original').checked=false;document.getElementById('original').dispatchEvent(new Event('change'))`);
 await click('closeHelp');await b.wait(50);
 check('closing the solution removes highlight and returns focus to that ? button',await value(`document.getElementById('help').hidden&&!document.querySelector('.q-focus')&&document.activeElement.matches('.marker[data-question="curious"]')`));
 for(const p of ['143','144','145','146']){
  await b.js(`document.getElementById('pages').value='${p}';document.getElementById('pages').dispatchEvent(new Event('change'));`);await b.wait(100);
  check('page '+p+' identity and preserved aspect ratio',await value(`(()=>{const s=document.querySelector('.sheet'),r=s.getBoundingClientRect();return s.dataset.page==='${p}'&&Math.abs(r.width/r.height-612/792)<.001;})()`));
  check('page '+p+' exact image loaded',await value(`document.querySelector('.source').src.endsWith('page-${p}.png')`));
  const n=await value(`document.querySelectorAll('.marker').length`);check('page '+p+' question count',n===({'143':2,'144':3,'145':14,'146':6}[p]));
  for(let i=0;i<n;i++){
   await b.js(`document.querySelectorAll('.marker')[${i}].click()`);
   check(`page ${p} ? button ${i+1} shows its own solution without covering the source`,await value(`(()=>{const m=document.querySelectorAll('.marker')[${i}],r=m.getBoundingClientRect(),s=document.querySelector('.source').getBoundingClientRect();return m.dataset.question===document.getElementById('help').dataset.question && document.getElementById('hint').textContent.length>0 && document.querySelectorAll('#steps li').length>0 && document.getElementById('answer').textContent.length>0 && document.querySelectorAll('.layer .q-focus').length===1 && m.classList.contains('active') && (r.right<=s.left+1||r.left>=s.right-1);})()`));
   if(p==='145'&&i===12)await shot('assistance');
  }
  await click('closeHelp');
  await b.js(`document.getElementById('original').checked=true;document.getElementById('original').dispatchEvent(new Event('change'));document.getElementById('fit').value='page';document.getElementById('fit').dispatchEvent(new Event('change'));document.getElementById('viewer').scrollTo(0,0);`);
  await shot('original-'+p);
  await b.js(`document.getElementById('original').checked=false;document.getElementById('original').dispatchEvent(new Event('change'));`);await click('resetZoom');
 }
 await b.hash('page=145');
 await b.js(`const e=document.querySelector('[data-id="1"]');e.focus();e.value='10 × 10 × 10 × 10';e.dispatchEvent(new Event('input',{bubbles:true}));e.blur();`);
 await click('save');await b.reload();check('typed answer restores after refresh',await value(`document.querySelector('[data-id="1"]').value==='10 × 10 × 10 × 10'`));
 await b.js(`document.querySelector('.marker').click();`);await click('closeHelp');check('typed answer survives assistance open and close',await value(`document.querySelector('[data-id="1"]').value==='10 × 10 × 10 × 10'`));
 await b.js(`document.querySelector('[data-mode="pen"]').click();`);
 const r=await value(`(()=>{const r=document.querySelector('.ink').getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}})()`);
 for(const y of [.08,.5,.90]){
  await b.js(`document.getElementById('viewer').scrollTop=${r.h*y-200}`);
  const p=await value(`(()=>{const r=document.querySelector('.ink').getBoundingClientRect();return{x:r.x+r.width*.4,y:r.y+r.height*${y}}})()`);
  await b.send('Input.dispatchMouseEvent',{type:'mousePressed',x:p.x,y:p.y,button:'left',clickCount:1});
  await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:p.x+25,y:p.y+10,button:'left',buttons:1});
  await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:p.x+25,y:p.y+10,button:'left',clickCount:1});
 }
 check('real mouse drawing top, center and bottom',await value(`document.querySelectorAll('.ink path').length===3`));
 await click('undo');check('undo ink',await value(`document.querySelectorAll('.ink path').length===2`));await click('redo');check('redo ink',await value(`document.querySelectorAll('.ink path').length===3`));
 await b.js(`document.querySelector('[data-mode="eraser"]').click();document.getElementById('viewer').scrollTop=0;`);
 const pt=await value(`(()=>{const r=document.querySelector('.ink').getBoundingClientRect();return{x:r.x+r.width*.4,y:r.y+r.height*.08}})()`);
 await b.send('Input.dispatchMouseEvent',{type:'mousePressed',x:pt.x,y:pt.y,button:'left',clickCount:1});await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:pt.x,y:pt.y,button:'left',clickCount:1});
 check('eraser removes selected stroke',await value(`document.querySelectorAll('.ink path').length===2`));await click('undo');check('erasing is undoable',await value(`document.querySelectorAll('.ink path').length===3`));
 const original=await value(`localStorage.getItem('gml:lesson-5-1:v2')`);
 await click('next');await click('prev');await b.reload();check('handwriting persists across pages and refresh',await value(`document.querySelectorAll('.ink path').length===3`));
 const inkBefore=await value(`document.querySelector('.ink path').getAttribute('d')`);
 const before=await value(`(()=>{const r=document.querySelector('.sheet').getBoundingClientRect(),f=document.querySelector('[data-id="1"]').getBoundingClientRect();return[(f.x-r.x)/r.width,(f.y-r.y)/r.height]})()`);
 await click('zoomIn');await b.viewport(820,1180,true);
 const after=await value(`(()=>{const r=document.querySelector('.sheet').getBoundingClientRect(),f=document.querySelector('[data-id="1"]').getBoundingClientRect();return[(f.x-r.x)/r.width,(f.y-r.y)/r.height]})()`);
 check('handwriting geometry remains unchanged on zoom and resize',await value(`document.querySelector('.ink path').getAttribute('d')`)===inkBefore);
 check('typed overlay remains aligned on zoom and resize',before.every((n,i)=>Math.abs(n-after[i])<.0001));
 await click('resetZoom');await b.js(`document.getElementById('viewer').scrollTo(0,0)`);await shot('tablet');
 await b.js(`document.querySelector('.marker').click()`);check('tablet solution card fits the screen',await value(`(()=>{const r=document.getElementById('help').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight;})()`));await click('closeHelp');
 await b.viewport(390,844,true);await click('resetZoom');await b.js(`document.getElementById('viewer').scrollTo(0,0)`);
 check('mobile chrome has no horizontal overflow',await value(`document.documentElement.scrollWidth<=390`));await shot('mobile');
 // Exercise the real backup file and restore picker, preserving a recovery copy.
 const downloads=fs.mkdtempSync(path.join(os.tmpdir(),'gml-backup-'));
 await b.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloads});
 await click('export');let backupFile=path.join(downloads,'gabriella-lesson-5-1-backup.json');
 for(let i=0;i<40&&!fs.existsSync(backupFile);i++)await b.wait(100);
 check('backup exports a valid file',fs.existsSync(backupFile)&&JSON.parse(fs.readFileSync(backupFile)).lesson==='5-1');
 await b.js(`document.querySelector('[data-id="1"]').value='temporary';document.querySelector('[data-id="1"]').dispatchEvent(new Event('input'));window.confirm=()=>true;`);
 const doc=await b.send('DOM.getDocument');const input=await b.send('DOM.querySelector',{nodeId:doc.result.root.nodeId,selector:'#import'});
 await b.send('DOM.setFileInputFiles',{nodeId:input.result.nodeId,files:[backupFile]});await b.wait(300);
 check('backup restores typed work and retains prior recovery copy',await value(`document.querySelector('[data-id="1"]').value==='10 × 10 × 10 × 10'&&localStorage.getItem('gml:lesson-5-1:v2:before-restore').includes('temporary')`));
 await b.viewport(820,1180,true);await click('resetZoom');await click('zoomIn');await click('zoomIn');await b.js(`document.querySelector('[data-mode="pan"]').click();document.getElementById('viewer').scrollTo(0,0)`);
 const drag=await value(`(()=>{const r=document.getElementById('viewer').getBoundingClientRect();return{x:r.x+200,y:r.y+150}})()`);
 await b.send('Input.dispatchMouseEvent',{type:'mousePressed',x:drag.x,y:drag.y,button:'left',clickCount:1});await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:drag.x-80,y:drag.y-80,button:'left',buttons:1});await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:drag.x-80,y:drag.y-80,button:'left',clickCount:1});
 check('zoomed page pans with a mouse',await value(`document.getElementById('viewer').scrollTop>0&&document.getElementById('viewer').scrollLeft>0`));await click('resetZoom');
 // Actual touch stroke on tablet (no synthetic pointer event).
 await b.viewport(820,1180,true);await b.js(`document.querySelector('[data-mode="pen"]').click();document.getElementById('viewer').scrollTo(0,0)`);
 const tp=await value(`(()=>{const r=document.querySelector('.ink').getBoundingClientRect();return{x:r.x+r.width*.3,y:r.y+r.height*.2}})()`);
 await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:tp.x,y:tp.y}]});await b.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:tp.x+20,y:tp.y+10}]});await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 check('touch handwriting',await value(`document.querySelectorAll('.ink path').length===4`));
 await click('clear');await click('confirmClear');check('clear selected handwriting preserves typing',await value(`document.querySelectorAll('.ink path').length===0&&document.querySelector('[data-id="1"]').value.length>0`));await click('undo');check('clear is undoable',await value(`document.querySelectorAll('.ink path').length===4`));
 await b.hash('page=143');await b.js(`const e=document.querySelector('[data-id="curious"]');e.value='Sample explanation';e.dispatchEvent(new Event('input'));`);
 await b.hash('page=146');await b.js(`const e=document.querySelector('[data-id="16"]');e.value='$1,000';e.dispatchEvent(new Event('input'));`);check('last page navigation boundary',await value(`document.getElementById('next').disabled`));const history=await b.send('Page.getNavigationHistory');const previous=history.result.entries[history.result.currentIndex-1];await b.send('Page.navigateToHistoryEntry',{entryId:previous.id});await b.wait(150);check('browser Back restores prior page',await value(`document.querySelector('.sheet').dataset.page==='143'`));const forward=(await b.send('Page.getNavigationHistory')).result.entries.find(x=>x.url.endsWith('#page=146'));await b.send('Page.navigateToHistoryEntry',{entryId:forward.id});await b.wait(150);check('browser Forward restores page',await value(`document.querySelector('.sheet').dataset.page==='146'`));await b.load('about:blank');await b.load(url);check('resume after closing and reopening application',await value(`document.querySelector('.sheet').dataset.page==='146'`));
 await b.send('Emulation.setEmulatedMedia',{media:'print'});
 // Page.printToPDF fires beforeprint, producing all lesson pages with work.
 const pdf=await b.send('Page.printToPDF',{printBackground:true,preferCSSPageSize:true});assert.ok(pdf.result?.data);fs.writeFileSync(path.join(ROOT,'docs/gml-006/completed-test.pdf'),Buffer.from(pdf.result.data,'base64'));
 check('four original print pages, no controls in print content',await value(`document.querySelectorAll('#printRoot .sheet').length===4&&document.querySelectorAll('#printRoot button').length===0&&document.querySelector('#printRoot [data-page="145"] [data-id="1"]').textContent.length>0`));
 await b.send('Emulation.setEmulatedMedia',{media:''});
 for(const width of [320,390,768,820,1440]){
  await b.viewport(width,1000,width<1024);await click('resetZoom');
  check(`lesson navigation and toolbar touch targets at least 44px with no overflow at ${width}`,await value(`document.documentElement.scrollWidth<=innerWidth&&[...document.querySelectorAll('header a,header select,nav button,nav select,.toolbar button,.toolbar select,.toolbar summary,.toolbar .toggle-chip,.marker')].filter(e=>e.getClientRects().length).every(e=>{const r=e.getBoundingClientRect();return r.width>=43.5&&r.height>=43.5;})`));
 }

 await b.close();b=await startBrowser({profile});await b.load(url);
 check('saved page and work survive full browser process restart',await value(`document.querySelector('.sheet').dataset.page==='146'&&document.querySelector('[data-id="16"]').value==='$1,000'&&JSON.parse(localStorage.getItem('gml:lesson-5-1:v2')).ink['145'].length===4`));
 check('no runtime exceptions',b.errors.length===0);check('no missing assets',server.missing.length===0);
 console.log('All Lesson 5-1 browser checks passed.');
}finally{await b.close();server.close();}
