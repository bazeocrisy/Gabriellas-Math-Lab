import path from "node:path";
import { ROOT, BASE, startServer, startBrowser } from "./lib/harness.mjs";
const server = await startServer(),
  b = await startBrowser(),
  url = process.env.LIVE_URL || server.origin + BASE;
let passed = 0,
  failed = 0;
const check = (name, ok, detail) => {
  if (ok) passed++;
  else failed++;
  console.log(
    `${ok ? "✔" : "✖"} ${name}${ok ? "" : " " + JSON.stringify(detail)}`,
  );
};
const js = b.js,
  load = async (h) => b.load(url + "index.html" + h);
const fill = `const inp=document.querySelector('.c4-question .num-input');if(inp){inp.value=q.answer;inp.dispatchEvent(new Event('input',{bubbles:true}));}else{[...document.querySelectorAll('.c4-question input[type=radio]')].find(x=>x.value===q.answer).click();}`;
async function start(id, mode) {
  await load(`#/chapter4/${id}/${mode}`);
  await js(`document.querySelector('[data-c4=start]').click();`);
}
async function answerAll(id, mode, miss = 0) {
  for (let i = 0; i < (id === "final" ? 25 : 10); i++) {
    await js(
      `const d=GML.store.getDraft('c4-session-${id}-${mode}'),q=GML.chapter4.make(d.set[d.i]);${fill}${i < miss ? `if(inp){inp.value='99999';inp.dispatchEvent(new Event('input',{bubbles:true}));}else{[...document.querySelectorAll('.c4-question input[type=radio]')].find(x=>x.value!==q.answer).click();}` : ""}`,
    );
    if (i < (id === "final" ? 24 : 9))
      await js(`document.querySelector('[data-c4=next]').click();`);
  }
  await js(
    `document.querySelector('[data-c4=submit]').click();document.querySelector('[data-c4=confirm]').click();`,
  );
}
try {
  await load("#/");
  check(
    "Two learning paths on home",
    await js(
      `return document.querySelectorAll('.c4-home .pillar').length===2;`,
    ),
  );
  await js(
    `localStorage.clear();localStorage.setItem('gml:v1:progress',JSON.stringify({lessons:{d02:{teach:{screen:2,furthest:3,done:true},practice:{sessions:4,skills:{}},tests:[],testsTaken:0}}}));`,
  );
  const legacy = await js(`return localStorage.getItem('gml:v1:progress');`);
  await load("#/chapter4");
  check(
    "All eight lessons open with four modes",
    await js(
      `return document.querySelectorAll('.lesson-card').length===8&&document.querySelectorAll('.c4-mode-nav a').length===32;`,
    ),
  );
  for (let n = 1; n <= 8; n++) {
    const id = `4-${n}`;
    for (let page = 1; page <= 5; page++) {
      await load(`#/chapter4/${id}/learn/${page}`);
      check(
        `${id} Learn screen ${page} renders`,
        await js(
          `return !/Something went wrong/.test(document.body.innerText)&&!!document.querySelector('.c4-learn');`,
        ),
      );
      if (page < 5) { await js(`document.querySelector('[data-c4=next]').click();`); await b.wait(50); }
    }
    await js(
      `const q=GML.chapter4.make({lesson:'${id}',id:'calculate-2',seed:31415});const host=document.querySelector('.c4-guided'),inp=host.querySelector('.num-input');inp.value=q.answer;inp.dispatchEvent(new Event('input',{bubbles:true}));host.querySelector('[data-act=check]').click();document.querySelector('[data-c4=next]').click();`,
    );
    check(
      `${id} Learn completion retained`,
      await js(`return GML.chapter4.progress('${id}').learn;`),
    );
    await start(id, "test");
    check(
      `${id} Test has no hints or solutions`,
      await js(
        `return !document.querySelector('[data-act=hint],.fb,.sol-steps')&&document.querySelectorAll('.c4-question').length===1;`,
      ),
    );
    await answerAll(id, "test", n === 1 ? 1 : 0);
    check(
      `${id} score and mastery`,
      await js(
        `const p=GML.chapter4.progress('${id}'),t=p.history.at(-1);return t.correct===${n === 1 ? 9 : 10}&&t.total===10&&!t.assisted&&document.querySelector('h1').textContent.includes('Results');`,
      ),
    );
    await b.reload();
    check(
      `${id} saved results survive reload`,
      await js(
        `return /Results/.test(document.querySelector('h1').textContent);`,
      ),
    );
  }
  check(
    "Original progress remains byte-for-byte unchanged",
    await js(
      `return localStorage.getItem('gml:v1:progress')===${JSON.stringify(legacy)};`,
    ),
  );
  // Fresh retake, no feedback before submit, refresh saves response, assessment-assisted integrity.
  await js(
    `document.querySelector('[data-c4=new]').click();document.querySelector('[data-c4=start]').click();`,
  );
  const before = await js(
    `return GML.store.getDraft('c4-session-4-8-test').set.map(x=>x.sig);`,
  );
  await js(
    `const d=GML.store.getDraft('c4-session-4-8-test'),q=GML.chapter4.make(d.set[0]);${fill}`,
  );
  await b.reload();
  check(
    "Unsubmitted test response survives refresh without feedback",
    await js(
      `const d=GML.store.getDraft('c4-session-4-8-test');return !!d.states[0].resp&&!document.querySelector('.fb,.sol-steps');`,
    ),
  );
  await load("#/chapter4/4-1/learn");
  await load("#/chapter4/4-8/test");
  await answerAll("4-8", "test");
  check(
    "Assisted perfect test retains score but no mastery award",
    await js(
      `const t=GML.chapter4.progress('4-8').history.at(-1);return t.correct===10&&t.assisted&&/does not award/.test(document.body.innerText);`,
    ),
  );
  await js(
    `document.querySelector('[data-c4=new]').click();document.querySelector('[data-c4=start]').click();`,
  );
  check(
    "Retake has fresh question signatures",
    await js(
      `return GML.store.getDraft('c4-session-4-8-test').set.every(x=>!${JSON.stringify(before)}.includes(x.sig));`,
    ),
  );
  // Simulate another tab marking assistance; local page save must merge it.
  await js(
    `const k='c4-session-4-8-test',d=GML.store.getDraft(k);d.assist=['External tab opened Learn'];GML.store.setDraft(k,d);const q=GML.chapter4.make(d.set[0]);${fill}`,
  );
  check(
    "Cross-tab assistance is merged on save",
    await js(
      `return GML.store.getDraft('c4-session-4-8-test').assist.includes('External tab opened Learn');`,
    ),
  );
  // An external completion must never be overwritten by a stale page's next input.
  check('Completed session rejects stale same-ID writes', await js(`const k='c4-session-4-8-test',d=GML.store.getDraft(k),original=JSON.stringify(d);d.done=true;GML.store.setDraft(k,d);const frozen=JSON.stringify(GML.store.getDraft(k)),q=GML.chapter4.make(d.set[0]);document.querySelectorAll('.c4-question input[type=radio]').forEach(x=>x.checked=false);${fill}const ok=JSON.stringify(GML.store.getDraft(k))===frozen&&/newer session/.test(document.querySelector('.c4-status').textContent);GML.store.setDraft(k,JSON.parse(original));return ok;`));
  // Opening an old saved result also marks active old and new assessments assisted.
  await load("#/d04/test");
  await js(`document.querySelector('[data-act=start]').click();`);
  const resultId = await js(
    `return GML.chapter4.progress('4-1').history[0].id;`,
  );
  await load("#/chapter4/4-1/test/result/" + resultId);
  check(
    "Old result review marks both assessment systems assisted",
    await js(
      `return GML.store.openTest('d04').assist.length>0&&GML.store.getDraft('c4-session-4-8-test').assist.length>0;`,
    ),
  );
  // Independent mode and weak skill breakdown.
  await start("4-3", "independent");
  await answerAll("4-3", "independent", 3);
  check(
    "Independent results report weak skills without mastery",
    await js(
      `const t=GML.chapter4.progress('4-3').history.at(-1);return t.mode==='independent'&&t.correct===7&&/Performance and next steps/.test(document.body.innerText);`,
    ),
  );
  // Practice: three hints, three distinct mistakes, solution, keyboard Next.
  await start("4-4", "practice");
  await js(
    `for(let i=0;i<3;i++)document.querySelector('[data-act=hint]').click();`,
  );
  check(
    "Practice has three progressive hints",
    await js(`return document.querySelectorAll('.hint').length===3;`),
  );
  await js(
    `const d=GML.store.getDraft('c4-session-4-4-practice');d.set.sort((a,b)=>Number(!a.id.startsWith('calculate'))-Number(!b.id.startsWith('calculate')));GML.store.setDraft('c4-session-4-4-practice',d);`,
  );
  await b.reload();
  await js(
    `const d=GML.store.getDraft('c4-session-4-4-practice'),q=GML.chapter4.make(d.set[d.i]);${fill}`,
  );
  await b.key("Enter");
  // Focus input first: render's keyboard handler should complete without a pointer click.
  await js(`document.querySelector('.num-input').focus();`);
  await b.key("Enter");
  check(
    "Correct answer via keyboard creates Next",
    await js(`return !!document.querySelector('[data-c4=next]');`),
  );
  await js(`document.querySelector('[data-c4=next]').click();`);
  check(
    "Practice advances and focuses an answer or heading",
    await js(
      `return GML.store.getDraft('c4-session-4-4-practice').i===1&&['INPUT','H1'].includes(document.activeElement.tagName);`,
    ),
  );
  await js(`const host=document.querySelector('.c4-question');for(const value of ['99999','99998','99997']){const input=host.querySelector('.num-input');input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));host.querySelector('[data-act=check]').click();}`);
  check('Three distinct unsuccessful attempts offer worked solution', await js(`return !!document.querySelector('[data-act=solution]');`));
  await js(`document.querySelector('[data-act=solution]').click();let i=0;while(document.querySelector('[data-act=sol-next]:not([hidden])')&&i++<20)document.querySelector('[data-act=sol-next]').click();document.querySelector('[data-c4=next]').click();`);
  for(let i=2;i<10;i++){await js(`const d=GML.store.getDraft('c4-session-4-4-practice'),q=GML.chapter4.make(d.set[d.i]);${fill}document.querySelector('[data-act=check]').click();document.querySelector('[data-c4=next]').click();`);}
  check('Finished practice records one coached session without changing tests', await js(`const p=GML.chapter4.progress('4-4');return p.history.filter(x=>x.mode==='practice').length===1&&p.history.filter(x=>x.mode==='test').length===1&&/Practice complete/.test(document.body.innerText);`));
  // Final complete and by-lesson report.
  await start("final", "test");
  await answerAll("final", "test", 2);
  check(
    "Final assessment scores 25 with all lesson results",
    await js(
      `const d=GML.chapter4.progress('final').history.at(-1);return d.correct===23&&d.total===25&&GML.scoring.score(d.set.map(GML.chapter4.make),d.states.map(x=>x.resp)).total===25&&document.querySelector('.card ul').children.length>=8;`,
    ),
  );
  await load("#/parent");
  check(
    "Parent has Chapter history alongside existing decimal progress",
    await js(
      `return !!document.getElementById('chapter4-progress')&&/Lesson 2:/.test(document.body.innerText);`,
    ),
  );
  await js(
    `GML.store.setDraft('c4-progress-4-2',{history:[{correct:1,total:10,set:[],states:[]}]});`,
  );
  await b.reload();
  check(
    "Damaged Chapter history cannot break existing Parent Progress",
    await js(
      `return !/Something went wrong|NaN/.test(document.body.innerText)&&!!document.getElementById('chapter4-progress');`,
    ),
  );
  // Stuck-student flow: every lesson provides immediate teaching help without guessing.
  for(let n=1;n<=8;n++){
    const id=`4-${n}`;
    await js(`GML.store.clearDraft('c4-learn-${id}');`);
    await load(`#/chapter4/${id}/learn/5`);
    check(`${id} has visible back navigation and immediate worked help`,await js(`return !!document.querySelector('.c4-back .btn')&&!!document.querySelector('[data-act=solution]')&&document.querySelector('[data-c4=next]').disabled;`));
    await js(`document.querySelector('[data-act=solution]').click();document.querySelector('[data-act=sol-all]').click();`);
    check(`${id} can finish Learn after a supported walkthrough`,await js(`const d=GML.store.getDraft('c4-learn-${id}');return d.check.shown&&!d.check.firstTry&&!document.querySelector('[data-c4=next]').disabled&&!document.querySelector('.sol-end').hidden;`));
  }
  await start('4-2','practice');
  // A last-page deep link must not count the earlier teaching screens as reviewed.
  await js(`const p=GML.chapter4.progress('4-1');p.learn=false;GML.store.setDraft('c4-progress-4-1',p);GML.store.clearDraft('c4-learn-4-1');`);
  await load('#/chapter4/4-1/learn/5');
  await js(`document.querySelector('[data-act=solution]').click();document.querySelector('[data-act=sol-all]').click();document.querySelector('[data-c4=next]').click();`);
  await b.wait(100);
  check('Last-page deep link returns to missing instruction without awarding completion',await js(`return location.hash==='#/chapter4/4-1/learn/1'&&!GML.chapter4.progress('4-1').learn;`));
  for(let page=1;page<=4;page++){await load('#/chapter4/4-1/learn/'+page);await js(`document.querySelector('[data-c4=next]').click();`);await b.wait(50);}
  await js(`document.querySelector('[data-c4=next]').click();`);
  check('Reviewing all earlier screens then finishing awards Learn completion',await js(`return GML.chapter4.progress('4-1').learn;`));
  const historyBeforeRestart=await js(`return JSON.stringify(GML.chapter4.progress('4-1').history);`);
  await load('#/chapter4/4-1/learn/1');
  await js(`document.querySelector('[data-c4=restart]').click();`);
  check('Restart clears current Learn completion and retains assessment history',await js(`return !GML.chapter4.progress('4-1').learn&&JSON.stringify(GML.chapter4.progress('4-1').history)===${JSON.stringify(historyBeforeRestart)};`));
  await load('#/chapter4/4-2/practice');
  check('Practice can ask for help before any wrong answer',await js(`const d=GML.store.getDraft('c4-session-4-2-practice');return !d.states[0].attempts&&!!document.querySelector('[data-act=solution]')&&document.querySelector('[data-c4=prev]').disabled;`));
  await js(`document.querySelector('[data-act=solution]').click();document.querySelector('[data-act=sol-all]').click();document.querySelector('[data-c4=next]').click();document.querySelector('[data-c4=prev]').click();`);
  await b.reload();
  check('Previous question and refresh preserve the supported answer without first-try credit',await js(`const d=GML.store.getDraft('c4-session-4-2-practice');return d.i===0&&d.states[0].shown&&!d.states[0].firstTry&&!document.querySelector('.sol-end').hidden&&document.querySelector('[data-act=sol-all]').hidden;`));
  await js(`document.querySelector('.c4-back a').click();`);
  check('Back to lesson opens an activity menu without discarding work',await js(`return /Choose your activity/.test(document.body.innerText)&&document.querySelectorAll('.c4-mode-nav a').length===4;`));
  await load('#/chapter4/4-2/practice');
  check('Returning from the lesson menu resumes the same question',await js(`return GML.store.getDraft('c4-session-4-2-practice').i===0&&!!document.querySelector('.fb-solution');`));
  await load('#/chapter4/4-1/learn/3');
  await load('#/chapter4/4-1');
  check('Lesson menu resumes the last Learn screen',await js(`return document.querySelector('a.btn-primary').hash==='#/chapter4/4-1/learn/3';`));
  await load('#/chapter4');
  await b.viewport(1440,900);
  check('Chapter cards use three compact columns with aligned activity links',await js(`const cards=[...document.querySelectorAll('.c4-lesson-card')],top=cards[0].getBoundingClientRect().top;return cards.filter(c=>Math.abs(c.getBoundingClientRect().top-top)<2).length===3&&cards.every(c=>cards.filter(x=>Math.abs(x.getBoundingClientRect().top-c.getBoundingClientRect().top)<2).every(x=>Math.abs(x.querySelector('.c4-card-links').getBoundingClientRect().top-c.querySelector('.c4-card-links').getBoundingClientRect().top)<2))&&cards.every(c=>c.querySelectorAll('.lc-progress .chip').length===3&&c.querySelectorAll('.lc-links .lc-link').length===4);`));
  await b.shot(path.join(ROOT,'tests/screenshots','chapter4-aligned-cards.png'));
  await load('#/chapter4/4-2/practice');
  await b.shot(path.join(ROOT,'tests/screenshots','chapter4-worked-help.png'));
  for (const width of [320, 375, 768, 1024, 1440]) {
    await b.viewport(width, 900);
    for (const h of [
      "#/",
      "#/decimals",
      "#/chapter4",
      "#/chapter4/4-3/learn/3",
      "#/chapter4/4-5/learn/2",
      "#/chapter4/4-4/practice",
      "#/chapter4/4-8/test",
      "#/parent",
    ]) {
      await load(h);
      if(h==='#/chapter4/4-4/practice'){
        await js(`GML.store.clearDraft('c4-session-4-4-practice');`);
        await b.reload();
        await js(`document.querySelector('[data-c4=start]').click();`);
        check(`Responsive Practice is an active question at ${width}px`,await js(`return !!document.querySelector('.c4-question .q-prompt')&&!/Practice complete/.test(document.querySelector('h1').textContent);`));
      }
      const bad = await js(
        `return {overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,small:[...document.querySelectorAll('.btn,.c4-parent summary,.choice,.c4-crumbs a')].filter(x=>x.offsetParent&&!x.closest('[hidden]')&&x.getBoundingClientRect().height<44).map(x=>x.innerText.slice(0,25))};`,
      );
      if([320,1440].includes(width))await b.shot(path.join(ROOT,'tests/screenshots',`c4-${h.replace(/[^a-z0-9]/gi,'_')}-${width}.png`));
      check(
        `${h} at ${width}px: fits, touch targets ≥44px`,
        !bad.overflow && !bad.small.length,
        bad,
      );
    }
    await load("#/chapter4/4-3/learn/3");
    await b.shot(path.join(ROOT, "tests/screenshots", `chapter4-${width}.png`));
  }
  check("No browser console errors", b.errors.length === 0, b.errors);
  check("No missing files", server.missing.length === 0, server.missing);
} catch (e) {
  check("Browser execution", false, e.stack);
} finally {
  b.close();
  server.close();
}
console.log(`${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
