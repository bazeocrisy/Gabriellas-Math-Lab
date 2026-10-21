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
      const bad = await js(
        `return {overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,small:[...document.querySelectorAll('.btn,.c4-parent summary,.choice')].filter(x=>x.offsetParent&&!x.closest('[hidden]')&&x.getBoundingClientRect().height<44).map(x=>x.innerText.slice(0,25))};`,
      );
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
