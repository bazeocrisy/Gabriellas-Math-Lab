// All base screens at six sizes, plus active learning, immediate help and saved question review.
import path from 'node:path';
import { ROOT, BASE, startServer, startBrowser } from './lib/harness.mjs';
const server=await startServer();
let b,passed=0,failed=0;
function check(name,ok,detail){ok?passed++:failed++;console.log((ok?'✔ ':'✖ ')+name+(!ok?' '+JSON.stringify(detail):''));}
const viewports=[[320,568],[375,667],[390,844],[768,1024],[1366,768],[1920,1080]];
try {
 b=await startBrowser();const url=process.env.LIVE_URL||server.origin+BASE;
 const load=async route=>b.load(url+'index.html'+route);
 await load('#/');await b.js('localStorage.clear();');await b.reload();
 const routes=await b.js(`
 const ids=Object.keys(GML.lessonContent);
 return ['#/','#/decimals','#/learn','#/practice','#/guides','#/parent','#/practice/session','#/practice/results',
 ...ids.flatMap(id=>[...GML.lessonContent[id].screens.map((_,i)=>'#/'+id+'/teach/'+(i+1)),'#/'+id+'/notes','#/'+id+'/practice','#/'+id+'/test']),
 '#/chapter4',...GML.chapter4.lessons.flatMap(l=>['#/chapter4/'+l.id,...GML.chapter4.screens[GML.chapter4.lessons.indexOf(l)].map((_,i)=>'#/chapter4/'+l.id+'/learn/'+(i+1)),...['practice','independent','test'].map(m=>'#/chapter4/'+l.id+'/'+m)]),
 '#/chapter4/review/practice','#/chapter4/final/test'];`);
 check('260 distinct base destinations',routes.length===260&&new Set(routes).size===260,routes.length);
 await b.js(`const set=GML.practiceGen.buildSession({mode:'add',n:10,seed:991});GML.store.setDraft('pc-session',{id:'responsive-pc',mode:'add',n:10,set,i:0,states:set.map(()=>({})),label:'Adding decimals',finished:false});`);
 async function fits(label){
  const data=await b.js(`const doc=document.documentElement;const visible=e=>e.getClientRects().length&&!e.closest('[hidden]');return {
   error:/Something went wrong/.test(document.getElementById('app').textContent),overflow:doc.scrollWidth>doc.clientWidth+1,
   small:[...document.querySelectorAll('#app .btn,#app .lc-link')].filter(visible).filter(e=>{const r=e.getBoundingClientRect();return r.height<43.5||r.width<43.5}).map(e=>e.textContent.trim().slice(0,35)),
   clipped:[...document.querySelectorAll('#app .card,#app .lesson-card,#app .coach-main,#app .coach-help,#app .q-visual')].filter(visible).filter(e=>{const r=e.getBoundingClientRect();return r.left < -1 || r.right>doc.clientWidth+1;}).map(e=>e.className)
  };`);
  check(label,!data.error&&!data.overflow&&!data.small.length&&!data.clipped.length,data);
 }
 for(const [width,height]of viewports){
  await b.viewport(width,height);
  for(const route of routes){
   if(route==='#/practice/session'||route==='#/practice/results'){
    await b.js(`const d=GML.store.getDraft('pc-session');d.finished=${route.endsWith('results')};d.recorded=false;d.states=d.set.map(()=>${route.endsWith('results')?'{solved:true,firstTry:true,hints:0}':'{}'});GML.store.setDraft('pc-session',d);`);
   }
   await load(route);
   const actual=await b.js(`return {route:location.hash,heading:document.querySelector('h1')?.textContent,coach:!!document.querySelector('.coach-host'),results:!!document.querySelector('.pc-stats')};`);
   check('expected screen '+route+' @'+width,actual.route===route&&!!actual.heading&&(route!=='#/practice/session'||actual.coach)&&(route!=='#/practice/results'||actual.results),actual);
   await fits(route+' @'+width);
   if(width===390||width===1366)await b.shot(path.join(ROOT,'tests/screenshots',`all-${route.replace(/[^a-z0-9]/gi,'_')}-${width}.png`));
   if(/chapter4\/4-[1-8]\/learn\/[1-4]$/.test(route)){
    const pos=await b.js(`return {top:document.querySelector('.c4-learn').getBoundingClientRect().top,height:innerHeight};`);
    check('instruction visible in first view '+route+' @'+width,pos.top<pos.height-80,pos);
   }
  }
  for(const id of [...Array.from({length:10},(_,i)=>'d'+String(i+1).padStart(2,'0')),'pc',...Array.from({length:8},(_,i)=>'4-'+(i+1))]){
   const chapter=id.startsWith('4-'),route=chapter?'#/chapter4/'+id+'/practice':id==='pc'?'#/practice/session':'#/'+id+'/practice';
   const key=chapter?'c4-session-'+id+'-practice':id==='pc'?'pc-session':'practice-'+id;
   await b.js(`
    const id=${JSON.stringify(id)};
    if(id.startsWith('4-')){GML.store.clearDraft('c4-session-'+id+'-practice');}
    else if(id==='pc'){const set=GML.practiceGen.buildSession({mode:'add',n:10,seed:88});GML.store.setDraft('pc-session',{id:'help-pc',mode:'add',n:10,set,i:0,states:set.map(()=>({})),label:'Adding decimals',finished:false});}
    else{GML.store.clearDraft('practice-'+id);GML.views.practice.newSession(id);}
   `);
   await load(route);await b.reload();
   if(chapter)await b.js(`document.querySelector('[data-c4=start]').click();`);
   check('active coached question '+id+' @'+width,await b.js(`return !!document.querySelector('.coach-q .q-prompt')&&!!document.querySelector('[data-act=solution]')&&!document.querySelector('.fb-solution');`));
   await fits('active '+id+' @'+width);
   await b.js(`document.querySelector('[data-act=solution]').click();const all=document.querySelector('[data-act=sol-all]');if(all)all.click();`);
   check('immediate help is assisted '+id+' @'+width,await b.js(`const d=GML.store.getDraft(${JSON.stringify(key)});return d.states[0].shown===true&&d.states[0].firstTry===false&&d.states[0].attempts===0&&!!document.querySelector('.fb-solution')&&!document.querySelector('.sol-end').hidden;`));
   await fits('expanded solution '+id+' @'+width);
   await b.shot(path.join(ROOT,'tests/screenshots',`help-${id}-${width}.png`));
   await b.js(chapter?`document.querySelector('[data-c4=next]').click();`:`document.querySelector('.coach-next button').click();`);
   await b.js(`document.querySelector('[data-act=hint]').click();`);
   await b.js(chapter?`document.querySelector('[data-c4=prev]').click();`:`document.querySelector('[data-act=previous]').click();`);
   await b.reload();
   check('Previous and refresh retain assisted review '+id+' @'+width,await b.js(`const d=GML.store.getDraft(${JSON.stringify(key)});return d.i===0&&d.states[0].shown===true&&d.states[0].firstTry===false&&!!document.querySelector('.fb-solution')&&!document.querySelector('.sol-end').hidden;`));
   await b.js(chapter?`document.querySelector('[data-c4=next]').click();`:`document.querySelector('.coach-next button').click();`);
   check('forward review retains next question hint '+id+' @'+width,await b.js(`const d=GML.store.getDraft(${JSON.stringify(key)});return d.i===1&&d.states[1].hints===1&&!!document.querySelector('.hint');`));
  }
 }
 check('No console errors',b.errors.length===0,b.errors);
 check('No missing files',server.missing.length===0,server.missing);
} catch(e){check('Responsive suite completed',false,e.stack);}
finally{if(b)b.close();server.close();}
console.log(JSON.stringify({passed,failed}));process.exitCode=failed?1:0;

