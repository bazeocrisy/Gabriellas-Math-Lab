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
const shot=name=>b.shot(path.join(ROOT,'docs/gml-005',name+'.png'),false);
try{
 await b.viewport(1440,1050,false);await b.load(url);
 check('lesson loads original first page and navigation boundary',await value(`document.querySelector('.source').naturalWidth===1836 && document.getElementById('prev').disabled && !document.getElementById('next').disabled`));
 await shot('desktop');
 for(const p of ['143','144','145','146']){
  await b.hash('page='+p);
  check('page '+p+' identity and preserved aspect ratio',await value(`(()=>{const s=document.querySelector('.sheet'),r=s.getBoundingClientRect();return s.dataset.page==='${p}'&&Math.abs(r.width/r.height-612/792)<.001;})()`));
  check('page '+p+' exact image loaded',await value(`document.querySelector('.source').src.endsWith('page-${p}.png')`));
  await click('questions');
  const n=await value(`document.querySelectorAll('#questionList button').length`);check('page '+p+' question count',n===({'143':2,'144':3,'145':14,'146':6}[p]));
  for(let i=0;i<n;i++){
   await click('questions');await b.js(`document.querySelectorAll('#questionList button')[${i}].click()`);
   check(`page ${p} question ${i+1} hint first`,await value(`!document.getElementById('steps').hidden===false && document.getElementById('answer').hidden && document.getElementById('hint').textContent.length>0 && getComputedStyle(document.getElementById('questionList')).display==='none' && document.querySelector('#sourceQuestion image').getAttribute('href').endsWith('page-${p}.png')`));
   await click('showSteps');await click('reveal');if(p==='145'&&i===12)await shot('assistance');check('solution can be revealed',await value(`!document.getElementById('steps').hidden&&!document.getElementById('answer').hidden`));
  }
  await click('closeDrawer');
  await b.js(`document.getElementById('original').checked=true;document.getElementById('original').dispatchEvent(new Event('change'));document.getElementById('fit').value='page';document.getElementById('fit').dispatchEvent(new Event('change'));document.getElementById('viewer').scrollTo(0,0);`);
  await shot('original-'+p);
  await b.js(`document.getElementById('original').checked=false;document.getElementById('original').dispatchEvent(new Event('change'));`);await click('resetZoom');
 }
 await b.hash('page=145');
 await b.js(`const e=document.querySelector('[data-id="1"]');e.focus();e.value='10 × 10 × 10 × 10';e.dispatchEvent(new Event('input',{bubbles:true}));e.blur();`);
 await click('save');await b.reload();check('typed answer restores after refresh',await value(`document.querySelector('[data-id="1"]').value==='10 × 10 × 10 × 10'`));
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
 const before=await value(`(()=>{const r=document.querySelector('.sheet').getBoundingClientRect(),f=document.querySelector('[data-id="1"]').getBoundingClientRect();return[(f.x-r.x)/r.width,(f.y-r.y)/r.height]})()`);
 await click('zoomIn');await b.viewport(820,1180,true);
 const after=await value(`(()=>{const r=document.querySelector('.sheet').getBoundingClientRect(),f=document.querySelector('[data-id="1"]').getBoundingClientRect();return[(f.x-r.x)/r.width,(f.y-r.y)/r.height]})()`);
 check('typed overlay remains aligned on zoom and resize',before.every((n,i)=>Math.abs(n-after[i])<.0001));
 await click('resetZoom');await b.js(`document.getElementById('viewer').scrollTo(0,0)`);await shot('tablet');
 await click('questions');await b.js(`document.querySelector('#questionList button').click();document.getElementById('done').click();`);await click('closeDrawer');await b.reload();check('completion state restores',await value(`JSON.parse(localStorage.getItem('gml:lesson-5-1:v2')).completed['145_1']===true`));
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
 const pdf=await b.send('Page.printToPDF',{printBackground:true,preferCSSPageSize:true});assert.ok(pdf.result?.data);fs.writeFileSync(path.join(ROOT,'docs/gml-005/completed-test.pdf'),Buffer.from(pdf.result.data,'base64'));
 check('four original print pages, no controls in print content',await value(`document.querySelectorAll('#printRoot .sheet').length===4&&document.querySelectorAll('#printRoot button').length===0&&document.querySelector('#printRoot [data-page="145"] [data-id="1"]').textContent.length>0`));
 await b.send('Emulation.setEmulatedMedia',{media:''});
 b.close();await new Promise(r=>setTimeout(r,1000));b=await startBrowser({profile});await b.load(url);
 check('saved page and work survive full browser process restart',await value(`document.querySelector('.sheet').dataset.page==='146'&&document.querySelector('[data-id="16"]').value==='$1,000'&&JSON.parse(localStorage.getItem('gml:lesson-5-1:v2')).ink['145'].length===4`));
 check('no runtime exceptions',b.errors.length===0);check('no missing assets',server.missing.length===0);
 console.log('All Lesson 5-1 browser checks passed.');
}finally{b.close();server.close();}
