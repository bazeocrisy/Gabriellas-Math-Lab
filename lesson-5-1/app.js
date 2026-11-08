import { KEY, LEGACY, blank, load, valid, backup } from './lib/storage.js';
import { paint, point, hit } from './lib/ink.js';
const $=id=>document.getElementById(id);
const fetchJSON=async p=>{const r=await fetch(p);if(!r.ok)throw new Error(`Could not load ${p}`);return r.json();};
try {
const [manifest,fields,questions]=await Promise.all(['manifest','fields','questions'].map(n=>fetchJSON(`data/${n}.json`)));
const numbers=manifest.pages.map(p=>p.number), questionKeys=Object.entries(questions).flatMap(([p,qs])=>qs.map(q=>p+'_'+q.id));let state,blocked=false;
try {state=load(localStorage);}catch(e){state=blank();blocked=true;$('saveStatus').textContent=e.message;document.body.dataset.error='true';}
let page=state.page,mode='type',width=700,scaleMode='width',selected=null,current=null,gesture=null,pan=null,lastFocus=null;
const undo={},redo={};
function save(){if(blocked)return false;try{localStorage.setItem(KEY,backup(state));$('saveStatus').textContent='Saved in this browser';document.body.dataset.error='false';return true;}catch(e){$('saveStatus').textContent='Could not save. Export a backup now.';document.body.dataset.error='true';return false;}}
function snapshot(){return JSON.stringify({answers:Object.fromEntries(Object.entries(state.answers).filter(([k])=>k.startsWith(page+'_'))),ink:state.ink[page]||[]});}
function checkpoint(previous=snapshot()){(undo[page]??=[]).push(previous);if(undo[page].length>100)undo[page].shift();redo[page]=[];updateHistory();}
function updateHistory(){$('undo').disabled=!undo[page]?.length;$('redo').disabled=!redo[page]?.length;}
function historyStep(from,to){if(!from[page]?.length)return;(to[page]??=[]).push(snapshot());const s=JSON.parse(from[page].pop());for(const k of Object.keys(state.answers))if(k.startsWith(page+'_'))delete state.answers[k];Object.assign(state.answers,s.answers);state.ink[page]=s.ink;save();render();}
function progress(){const count=questionKeys.filter(k=>state.completed[k]).length;$('completion').textContent=`${count} / ${questionKeys.length} questions completed`;$('pageProgress').textContent=`${numbers.indexOf(page)+1} / ${numbers.length} pages`;}
function asset(p){return manifest.pages.find(x=>x.number===p).asset;}
function sheet(p,printing=false){
 const host=document.createElement('div');host.className='sheet';host.dataset.page=p;
 const img=document.createElement('img');img.className='source';img.src=asset(p);img.alt=`Original textbook page ${p} · Lesson 5-1`;img.draggable=false;host.append(img);
 const layer=document.createElement('div');layer.className='layer';
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('ink');svg.setAttribute('viewBox','0 0 612 792');svg.setAttribute('aria-label',`Handwriting on page ${p}`);paint(svg,state.ink[p]||[]);layer.append(svg);
 const responses=document.createElement('div');responses.className='responses';
 for(const f of fields[p]){
  const el=document.createElement(printing?'div':'textarea');el.className='response';el.dataset.id=f.id;const [x,y,w,h]=f.rect;Object.assign(el.style,{left:x*100+'%',top:y*100+'%',width:w*100+'%',height:h*100+'%',fontSize:'calc(var(--page-width) * .015)'});
  const key=p+'_'+f.id;
  if(printing)el.textContent=state.answers[key]||'';
  else {el.setAttribute('aria-label',`Page ${p}, answer ${f.id}`);el.spellcheck=false;el.value=state.answers[key]||'';let before;
   el.addEventListener('focus',()=>{before=snapshot();});el.addEventListener('input',()=>{state.answers[key]=el.value;save();});el.addEventListener('change',()=>{if(before!==snapshot())checkpoint(before);before=snapshot();});
  }responses.append(el);
 }
 layer.append(responses);
 if(!printing){
  for(const q of questions[p]){const b=document.createElement('button');b.className='marker '+q.side+(state.completed[p+'_'+q.id]?' complete':'');b.style.top=q.anchor*100+'%';b.textContent=q.id.match(/^\d/)?q.id:'?';b.title=q.title;b.setAttribute('aria-label',`Help: page ${p}, ${q.title}`);b.onclick=()=>openQuestion(q,b);layer.append(b);}
  svg.addEventListener('pointerdown',e=>{if(!['pen','eraser'].includes(mode))return;e.preventDefault();svg.setPointerCapture(e.pointerId);gesture=snapshot();const pt=point(e,svg);if(mode==='pen'){current=[pt];(state.ink[page]??=[]).push(current);}else erase(pt);paint(svg,state.ink[page]||[]);});
  svg.addEventListener('pointermove',e=>{if(gesture===null)return;if(mode==='pen'&&current)current.push(point(e,svg));else if(mode==='eraser')erase(point(e,svg));paint(svg,state.ink[page]||[]);});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])svg.addEventListener(event,finish);
 }
 host.append(layer);return host;
}
function erase(pt){state.ink[page]=(state.ink[page]||[]).filter(st=>!hit(st,pt));}
function finish(){if(gesture===null)return;const before=gesture;gesture=null;current=null;if(before!==snapshot())checkpoint(before);save();}
function render(){finish();$('stage').replaceChildren(sheet(page));$('pages').value=page;$('prev').disabled=page===numbers[0];$('next').disabled=page===numbers.at(-1);progress();updateHistory();applyZoom();}
function applyZoom(){const viewer=$('viewer');const available=Math.max(160,viewer.clientWidth-(innerWidth<650?68:80));if(scaleMode==='width')width=available;else if(scaleMode==='page')width=Math.min(available,Math.max(160,(viewer.clientHeight-36)*612/792));else if(scaleMode==='actual')width=816;width=Math.max(160,Math.min(3264,width));$('stage').style.width=width+'px';$('stage').style.setProperty('--page-width',width+'px');$('zoomLabel').textContent=Math.round(width/816*100)+'%';}
function goto(p,history=true){if(!numbers.includes(p))p=numbers[0];finish();document.activeElement?.blur();page=p;state.page=p;save();if(history&&location.hash!==`#page=${p}`)location.hash=`page=${p}`;if($('drawer').open)$('drawer').close();render();$('viewer').scrollTo(0,0);}
function setMode(m){finish();mode=m;document.body.dataset.mode=m;document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===m)));}
function showDrawer(focus){lastFocus=focus||document.activeElement;document.body.classList.add('help-open');applyZoom();if(!$('drawer').open)$('drawer').show();$('closeDrawer').focus();}
function listQuestions(){selected=null;$('drawerTitle').textContent='Questions';$('identity').textContent=`Lesson 5-1 · Original page ${page}`;$('questionList').hidden=false;$('assistance').hidden=true;$('questionList').replaceChildren();for(const q of questions[page]){const b=document.createElement('button');b.textContent=(state.completed[page+'_'+q.id]?'✓ ':'')+q.title;b.onclick=()=>openQuestion(q,b);$('questionList').append(b);}showDrawer();}
function openQuestion(q,trigger){selected=q;$('identity').textContent=`Lesson 5-1 · Original page ${page} · ${q.title}`;$('drawerTitle').textContent=q.title;$('questionList').hidden=true;$('assistance').hidden=false;$('hint').textContent=q.hint;$('steps').replaceChildren(...q.steps.map(s=>{const li=document.createElement('li');li.textContent=s;return li;}));$('steps').hidden=true;$('answer').hidden=true;$('answer').textContent=(q.openEnded?'Sample response / valid possibilities: ':'Verified answer: ')+q.answer;$('done').checked=!!state.completed[page+'_'+q.id];
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),im=document.createElementNS(ns,'image');const [x,y,w,h]=q.crop;svg.setAttribute('viewBox',`${x*612} ${y*792} ${w*612} ${h*792}`);svg.setAttribute('role','img');svg.setAttribute('aria-label',`Unmodified source excerpt for ${q.title}`);im.setAttribute('href',asset(page));im.setAttribute('width','612');im.setAttribute('height','792');svg.append(im);$('sourceQuestion').replaceChildren(svg);showDrawer(trigger);
}
$('drawer').addEventListener('close',()=>{document.body.classList.remove('help-open');applyZoom();});
$('closeDrawer').onclick=()=>{document.body.classList.remove('help-open');applyZoom();$('drawer').close();if(lastFocus?.isConnected)lastFocus.focus();};document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('drawer').open)$('closeDrawer').click();});
$('showSteps').onclick=()=>{$('steps').hidden=false;};$('reveal').onclick=()=>{$('steps').hidden=false;$('answer').hidden=false;};$('done').onchange=()=>{if(selected){state.completed[page+'_'+selected.id]=$('done').checked;save();progress();const pos=$('viewer').scrollTop;render();$('viewer').scrollTop=pos;}};
for(const p of manifest.pages){const option=document.createElement('option');option.value=p.number;option.textContent=`Page ${p.number} · ${p.section}`;$('pages').append(option);}
$('pages').onchange=()=>goto($('pages').value);$('prev').onclick=()=>goto(numbers[numbers.indexOf(page)-1]);$('next').onclick=()=>goto(numbers[numbers.indexOf(page)+1]);$('begin').onclick=()=>goto('143');$('questions').onclick=listQuestions;
window.addEventListener('hashchange',()=>{const p=new URLSearchParams(location.hash.slice(1)).get('page');if(p!==page)goto(p,false);});
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
$('undo').onclick=()=>historyStep(undo,redo);$('redo').onclick=()=>historyStep(redo,undo);
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&!['TEXTAREA','INPUT'].includes(document.activeElement.tagName)){e.preventDefault();historyStep(e.shiftKey?redo:undo,e.shiftKey?undo:redo);}});
$('clear').onclick=()=>$('clearDialog').showModal();$('cancelClear').onclick=()=>$('clearDialog').close();$('confirmClear').onclick=()=>{checkpoint();if($('clearTyped').checked)for(const k of Object.keys(state.answers))if(k.startsWith(page+'_'))delete state.answers[k];if($('clearInk').checked)state.ink[page]=[];save();render();$('clearDialog').close();};
$('fit').onchange=()=>{scaleMode=$('fit').value;applyZoom();};function zoom(f){scaleMode='manual';width*=f;applyZoom();} $('zoomIn').onclick=()=>zoom(1.25);$('zoomOut').onclick=()=>zoom(.8);$('resetZoom').onclick=()=>{scaleMode='width';$('fit').value='width';applyZoom();};window.addEventListener('resize',applyZoom);
$('viewer').addEventListener('pointerdown',e=>{if(mode!=='pan'||e.target.closest('button'))return;e.preventDefault();$('viewer').setPointerCapture(e.pointerId);pan={x:e.clientX,y:e.clientY,left:$('viewer').scrollLeft,top:$('viewer').scrollTop};});$('viewer').addEventListener('pointermove',e=>{if(!pan)return;$('viewer').scrollLeft=pan.left-e.clientX+pan.x;$('viewer').scrollTop=pan.top-e.clientY+pan.y;});for(const ev of ['pointerup','pointercancel'])$('viewer').addEventListener(ev,()=>{pan=null;});
$('save').onclick=save;$('original').onchange=()=>document.body.classList.toggle('original',$('original').checked);
function download(content,name){const url=URL.createObjectURL(new Blob([content],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);}
$('export').onclick=()=>{if(blocked){try{download(JSON.stringify({saved:localStorage.getItem(KEY),legacy:localStorage.getItem(LEGACY)}),'gabriella-recovery.json');}catch{$('saveStatus').textContent='Browser storage is inaccessible.';}return;}finish();download(backup(state),'gabriella-lesson-5-1-backup.json');};
$('import').onchange=async()=>{try{const f=$('import').files[0];if(!f)return;if(f.size>25*1024*1024)throw new Error('Backup is too large.');const imported=JSON.parse(await f.text());if(!valid(imported))throw new Error('This is not a valid Lesson 5-1 backup.');if(!confirm('Replace Lesson 5-1 work with this backup? A recovery copy of current work will be retained.'))return;localStorage.setItem(KEY+':before-restore',blocked?(localStorage.getItem(KEY)||''):backup(state));state=imported;blocked=false;goto(state.page); }catch(e){alert('Restore failed: '+e.message);}finally{$('import').value='';}};
function buildPrint(){$('printRoot').replaceChildren(...numbers.map(p=>{const s=sheet(p,true);s.style.setProperty('--page-width','8.5in');return s;}));}
window.addEventListener('beforeprint',buildPrint);$('print').onclick=async()=>{finish();buildPrint();await Promise.all([...$('printRoot').querySelectorAll('img')].map(im=>im.decode()));window.print();};window.addEventListener('pagehide',()=>{finish();save();});
setMode('type');const initial=new URLSearchParams(location.hash.slice(1)).get('page');goto(numbers.includes(initial)?initial:state.page,false);history.replaceState(null,'',`#page=${page}`);
} catch(e) {$('saveStatus').textContent='The lesson could not load: '+e.message;document.body.dataset.error='true';}
