// Unit 5 Review Quiz: take it on iPad, phone and laptop sizes.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, BASE, startServer, startBrowser } from './lib/harness.mjs';
const server = await startServer(), b = await startBrowser();
const url = server.origin + BASE + 'chapter-5/review/';
const quiz = JSON.parse(fs.readFileSync(path.join(ROOT, 'chapter-5/review/quiz.json')));
let passed = 0;
const check = (name, ok, info) => { assert.ok(ok, name + (info ? ' ' + JSON.stringify(info) : '')); passed++; console.log('PASS ' + name); };
const value = (expr) => b.js('return ' + expr);
const out = path.join(ROOT, 'docs/gml-009'); fs.mkdirSync(out, { recursive: true });
async function answerCurrent(right) {
  const id = await value(`JSON.parse(localStorage.getItem('gml:unit5-review-quiz:v1')).order[JSON.parse(localStorage.getItem('gml:unit5-review-quiz:v1')).i]`);
  const q = quiz.questions.find((x) => x.id === id);
  if (q.type === 'fill') {
    const v = right ? q.answer.replace(/,/g, '') : '1';   // also proves commas are optional
    await b.js(`const i=document.getElementById('fillInput');i.value=${JSON.stringify(v)};document.getElementById('checkBtn').click()`);
  } else {
    const want = q.type === 'mc' ? String(right ? q.answer : (q.answer + 1) % 4) : String(right ? q.answer : !q.answer);
    await b.js(`[...document.querySelectorAll('.choice')].find(c=>c.dataset.value===${JSON.stringify(want)}).click()`);
  }
  return q;
}
try {
  for (const [name, w, h, touch] of [['iPad Air', 820, 1180, true], ['iPhone 15', 393, 852, true], ['Laptop', 1280, 800, false]]) {
    await b.viewport(w, h, touch); await b.load(url); await b.js(`localStorage.removeItem('gml:unit5-review-quiz:v1')`); await b.reload(); await b.wait(200);
    check(`${name}: start screen lists the three question types`, await value(`!document.getElementById('intro').hidden&&document.querySelectorAll('.intro-list li').length===3`));
    await b.js(`document.getElementById('start').click()`); await b.wait(50);
    check(`${name}: question 1 shows with four choices`, await value(`document.getElementById('count').textContent==='Question 1 of 24'&&document.querySelectorAll('.choice').length===4`));
    check(`${name}: buttons big enough to tap, nothing off screen`, await value(`document.documentElement.scrollWidth<=innerWidth&&[...document.querySelectorAll('button:not([hidden]),a.link-btn,a.brand')].filter(e=>e.getClientRects().length).every(e=>{const r=e.getBoundingClientRect();return r.height>=43.5&&r.width>=43.5})`));
    if (name === 'iPad Air') await b.shot(path.join(out, 'quiz-question.png'), false);
    // Hint, then a wrong answer on question 1.
    await b.js(`document.getElementById('hintBtn').click()`);
    check(`${name}: hint shows`, await value(`!document.getElementById('hintBox').hidden&&document.getElementById('hintBox').textContent.length>5`));
    await answerCurrent(false);
    check(`${name}: wrong answer shows the right one and the explanation, and locks the question`, await value(`(()=>{const f=document.getElementById('feedback');return !f.hidden&&f.classList.contains('bad')&&f.textContent.includes('B. 10 × 10 × 10 × 10 × 10')&&[...document.querySelectorAll('.choice')].every(c=>c.disabled)&&document.querySelector('.choice.correct')&&document.querySelector('.choice.wrong');})()`));
    if (name === 'iPad Air') await b.shot(path.join(out, 'quiz-feedback.png'), false);
    await b.js(`document.getElementById('nextBtn').click()`);
    // Answer the rest correctly; reload half way to prove resume works.
    for (let n = 2; n <= 24; n++) {
      if (n === 12) { await b.reload(); await b.wait(150); check(`${name}: reload offers to continue`, await value(`!document.getElementById('resume').hidden`)); await b.js(`document.getElementById('resume').click()`); check(`${name}: continues at question 12`, await value(`document.getElementById('count').textContent==='Question 12 of 24'`)); }
      const q = await answerCurrent(true);
      const ok = await value(`document.getElementById('feedback').classList.contains('ok')`);
      if (!ok) throw new Error(`${name}: correct answer to ${q.id} was marked wrong`);
      await b.js(`document.getElementById('nextBtn').click()`);
    }
    check(`${name}: all 23 correct answers accepted (fill-ins without commas too)`, true);
    check(`${name}: score 23 of 24 with the missed question listed`, await value(`!document.getElementById('results').hidden&&document.getElementById('scoreText').textContent==='You got 23 of 24'&&document.querySelectorAll('#missed li').length===1&&document.querySelectorAll('.part').length===3`));
    if (name === 'iPad Air') await b.shot(path.join(out, 'quiz-results.png'), false);
    await b.js(`document.getElementById('retryMissed').click()`);
    check(`${name}: practise the missed question only`, await value(`document.getElementById('count').textContent==='Question 1 of 1'`));
    await answerCurrent(true); await b.js(`document.getElementById('nextBtn').click()`);
    check(`${name}: then a perfect round`, await value(`document.getElementById('scoreText').textContent==='You got 1 of 1'&&document.getElementById('missedWrap').hidden`));
  }
  await b.viewport(1280, 800, false); await b.load(server.origin + BASE + 'index.html#/'); await b.wait(400);
  check('home page has the quiz card', await value(`document.querySelector('.pillar-quiz')?.getAttribute('href')==='chapter-5/review/'`));
  await b.load(server.origin + BASE + 'chapter-5/'); await b.wait(400);
  check('Chapter 5 More menu links to the quiz', await value(`document.querySelector('.menu-card a[href="review/"]')!==null`));
  check('no runtime errors', b.errors.length === 0, b.errors);
  check('no missing files', server.missing.length === 0, server.missing);
  console.log(`All ${passed} review quiz checks passed.`);
} finally { await b.close(); server.close(); }
