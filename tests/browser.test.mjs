// End-to-end browser test (headless Chrome/Edge, no dependencies). Serves the repo under
// /Gabriellas-Math-Lab/ like GitHub Pages and drives every mode the way a student would.
// Run: npm run test:browser   (set CHROME_PATH if Chrome/Edge is not found)
// Live site: LIVE_URL=https://bazeocrisy.github.io/Gabriellas-Math-Lab/ npm run test:browser
import path from 'node:path';
import { ROOT, BASE, startServer, startBrowser } from './lib/harness.mjs';

const SHOTS = path.join(ROOT, 'tests', 'screenshots');
const results = [];
function check(name, ok, detail) {
  results.push({ name, ok: !!ok });
  console.log(`${ok ? '✔' : '✖'} ${name}${!ok && detail !== undefined ? ' — ' + JSON.stringify(detail).slice(0, 500) : ''}`);
}

const LIVE = process.env.LIVE_URL;
const server = LIVE ? { origin: '', missing: [], close() {} } : await startServer();
const b = await startBrowser();
const URL = LIVE ? LIVE.replace(/\/?$/, '/') : server.origin + BASE;
if (LIVE) console.log('Testing the live site: ' + URL);
const { js } = b;

// In-page helpers: build the question on screen from saved state and answer it right or wrong.
const H = `
  const E = GML.engine, D = GML.D;
  const draft = (n) => JSON.parse(localStorage.getItem('gml:v1:draft:' + n) || 'null');
  const right = (q) => q.type === 'chart' ? D.digits(q.answer) : q.answer;
  const wrong = (q) => {
    if (q.type === 'mc') return q.choices.find((c) => c.value !== q.answer).value;
    if (q.type === 'build') return q.answer === 1 ? 2 : q.answer - 1;
    if (q.type === 'chart') { const d = D.digits(q.answer); return { ...d, tenths: String((Number(d.tenths) + 1) % 10) }; }
    return D.fromThousandths(D.toThousandths(q.answer) + 1, 3);
  };
  const fire = (el, t) => el.dispatchEvent(new Event(t, { bubbles: true }));
  function fill(host, q, resp) {
    if (q.type === 'mc') { const i = [...host.querySelectorAll('input[type=radio]')].find((x) => x.value === resp); i.click(); }
    else if (q.type === 'number') { const i = host.querySelector('.num-input'); i.value = resp; fire(i, 'input'); }
    else if (q.type === 'chart') host.querySelectorAll('.pv-cell').forEach((i) => { i.value = resp[i.dataset.k]; fire(i, 'input'); });
    else if (q.type === 'build') {
      const steps = [...host.querySelectorAll('.stepper')];
      const target = q.model === 'grid' ? [Math.floor(resp / 10), resp % 10] : [resp];
      steps.forEach((s, k) => { for (let n = 0; n < 12; n++) { const m = s.querySelector('[data-d="-1"]'); if (!m.disabled) m.click(); } });
      steps.forEach((s, k) => { for (let n = 0; n < target[k]; n++) s.querySelector('[data-d="1"]').click(); });
    }
  }
  const practiceQ = () => { const d = draft('practice-d01'); const x = d.set[d.i]; return E.make('d01', x.id, x.seed); };
  const testQ = () => { const d = draft('test-d01'); const x = d.set[d.i]; return E.make('d01', x.id, x.seed); };
  const text = () => document.getElementById('app').innerText;
`;

async function noOverflow(label) {
  const r = await js(`
    const doc = document.documentElement;
    const wide = [...document.querySelectorAll('#app *, header *')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.right > doc.clientWidth + 1 || r.left < -1); })
      .slice(0, 3).map((e) => e.tagName + '.' + (e.getAttribute('class') || ''));
    return { sw: doc.scrollWidth, cw: doc.clientWidth, wide };`);
  check(`no horizontal overflow: ${label}`, r.sw <= r.cw && r.wide.length === 0, r);
}
async function bigTargets(label) {
  const r = await js(`return [...document.querySelectorAll('.btn, .qnav-btn, .choice-body, .site-nav a, .crumbs a')].filter((e) => e.offsetParent && !e.closest('[hidden]'))
    .map((e) => ({ t: (e.innerText || '').trim().slice(0, 24), h: Math.round(e.getBoundingClientRect().height), w: Math.round(e.getBoundingClientRect().width) }))
    .filter((x) => x.h < 43.5 || x.w < 43.5);`);
  check(`tap targets at least 44px: ${label}`, r.length === 0, r);
}

try {
  await b.viewport(390, 844);
  await b.load(URL + 'index.html');
  await js('localStorage.clear();');
  await b.load(URL + 'index.html#/');

  // ── Home ──
  let r = await js(`${H} return { t: text(), modes: [...document.querySelectorAll('.btn-mode')].map((a) => a.textContent + '>' + a.getAttribute('href')),
    later: document.querySelectorAll('.later-list li').length, laterButtons: document.querySelectorAll('.later-list a, .later-list button').length,
    avail: GML.unit.lessons.filter((l) => GML.unit.available(l.id)).map((l) => l.id), total: GML.unit.lessons.length };`);
  check('home shows title and subtitles', /Gabriella's Math Lab/.test(r.t) && /Grade 5 Mathematics/.test(r.t) && /Georgia Milestones Preparation/.test(r.t), r.t.slice(0, 200));
  check('home: every available lesson has TEACH | PRACTICE | TEST', JSON.stringify(r.modes) === JSON.stringify(r.avail.flatMap((id) => [`TEACH>#/${id}/teach/1`, `PRACTICE>#/${id}/practice`, `TEST>#/${id}/test`])), r.modes);
  check('home: all 10 lessons listed; the rest say Coming later with no buttons', r.total === 10 && r.later === r.total - r.avail.length && r.laterButtons === 0, r);
  check('home: Lesson Notes button for each available lesson', (await js(`return document.querySelectorAll('.btn-notes').length;`)) === r.avail.length);

  // ── Teach: every screen, step reveal, guided checks with wrong then right answers ──
  await b.load(URL + 'index.html#/d01/teach/1');
  const total = await js(`return GML.lessonContent.d01.screens.length;`);
  let teachOk = true, checksSeen = 0, wrongCoached = 0, gated = 0, stepsGated = 0;
  for (let i = 1; i <= total; i++) {
    const s = await js(`return { h: location.hash, step: !!document.querySelector('[data-act=step]:not([hidden])'), next: document.querySelector('[data-act=next]').disabled, check: !!document.querySelector('.check-host') };`);
    if (s.h !== `#/d01/teach/${i}`) { teachOk = false; check('teach screen order', false, s); break; }
    if (s.step) { if (s.next) stepsGated++; await js(`let g = 0; while (document.querySelector('[data-act=step]:not([hidden])') && g++ < 10) document.querySelector('[data-act=step]').click();`); }
    if (s.check) {
      checksSeen++;
      const c = await js(`${H}
        const sc = GML.lessonContent.d01.screens[${i - 1}];
        const q = E.make('d01', sc.check.t, 1, sc.check.params);
        const host = document.querySelector('.check-host');
        const gatedBefore = document.querySelector('[data-act=next]').disabled;
        fill(host, q, wrong(q)); host.querySelector('[data-act=check]').click();
        const fb = host.querySelector('.fb-wrong'); const re = !!host.querySelector('.fb-wrong .remind');
        const stillGated = document.querySelector('[data-act=next]').disabled;
        fill(host, q, right(q)); host.querySelector('[data-act=check]').click();
        return { gatedBefore, wrong: !!fb, re, stillGated, right: !!host.querySelector('.fb-right'), open: !document.querySelector('[data-act=next]').disabled };`);
      if (c.wrong && c.re) wrongCoached++;
      if (c.gatedBefore && c.stillGated && c.right && c.open) gated++;
      else check(`teach check on screen ${i}`, false, c);
    }
    if (i < total) await js(`document.querySelector('[data-act=next]').click();`);
    await b.wait(120);
  }
  check(`teach: walked all ${total} screens in order`, teachOk);
  check('teach: Next waits until worked-example steps are shown', stepsGated >= 10, stepsGated);
  check('teach: guided checks coach wrong answers with a reteach example', checksSeen >= 5 && wrongCoached === checksSeen, { checksSeen, wrongCoached });
  check('teach: guided checks unlock Next only after a correct answer', gated === checksSeen, { gated, checksSeen });
  r = await js(`return { t: document.getElementById('app').innerText, p: JSON.parse(localStorage.getItem('gml:v1:progress')).lessons.d01.teach };`);
  check('teach: last screen offers Practice and Notes, progress marked done', /Start Practice/.test(r.t) && /Lesson Notes/.test(r.t) && r.p.done === true, r.p);
  await js(`document.querySelector('.pager a').click();`); await b.wait(150);
  check('teach: Back goes to the previous screen', await js(`return location.hash;`) === `#/d01/teach/${total - 1}`);

  // ── Practice ──
  await b.load(URL + 'index.html#/d01/practice');
  r = await js(`${H} const q = practiceQ(); const host = document.querySelector('.coach-host');
    const hb = host.querySelector('[data-act=hint]'); const out = { n: draft('practice-d01').set.length, labels: [], hints: [] };
    for (let k = 0; k < 3; k++) { out.labels.push(hb.textContent); hb.click(); out.hints.push([...host.querySelectorAll('.hint')].map((h) => h.querySelector('.hint-title').textContent)); }
    out.disabled = hb.disabled; out.last = hb.textContent;
    const txt = (h) => { const e = document.createElement('div'); e.innerHTML = h; return e.textContent; }; out.match = [...host.querySelectorAll('.hint > div')].map((d) => d.textContent).join('|') === q.hints.map(txt).join('|');
    out.noAnswerYet = !host.querySelector('.fb-right, .fb-solution');
    return out;`);
  check('practice: 10 questions per session', r.n === 10, r.n);
  check('practice: hints appear one at a time, in order, max 3', JSON.stringify(r.hints) === JSON.stringify([['Hint 1 of 3'], ['Hint 1 of 3', 'Hint 2 of 3'], ['Hint 1 of 3', 'Hint 2 of 3', 'Hint 3 of 3']]) && r.disabled && r.match, r);
  check('practice: hints do not reveal the answer screen', r.noAnswerYet);
  r = await js(`${H} const q = practiceQ(); const host = document.querySelector('.coach-host');
    host.querySelector('[data-act=check]').click();
    const blank = host.querySelector('.feedback').innerText; const att0 = draft('practice-d01').states[0].attempts || 0;
    fill(host, q, wrong(q)); host.querySelector('[data-act=check]').click();
    const w = { wrong: !!host.querySelector('.fb-wrong'), msg: host.querySelector('.fb-wrong p:nth-of-type(2)').textContent, next: host.querySelector('.coach-next').innerHTML.trim(), idx: draft('practice-d01').i };
    fill(host, q, wrong(q)); host.querySelector('[data-act=check]').click();
    fill(host, q, wrong(q)); host.querySelector('[data-act=check]').click();
    w.sol = !!host.querySelector('[data-act=solution]');
    return { blank, att0, ...w };`);
  check('practice: blank answer asks for an answer and is not counted', /first|Choose|shade|Type/.test(r.blank) && r.att0 === 0, r);
  check('practice: wrong answer says not correct, explains, stays on the question', r.wrong && r.msg.length > 15 && r.next === '' && r.idx === 0, r);
  check('practice: "Show me how" appears only after 3 wrong tries', r.sol);
  // Refresh in the middle: same question, same hints and attempts.
  await b.reload();
  r = await js(`${H} return { idx: draft('practice-d01').i, hints: document.querySelectorAll('.hint').length, wrongShown: !!document.querySelector('.fb-wrong') };`);
  check('practice: refresh keeps the session, hints and feedback', r.idx === 0 && r.hints === 3 && r.wrongShown, r);
  r = await js(`${H} const q = practiceQ(); const host = document.querySelector('.coach-host');
    fill(host, q, right(q)); host.querySelector('[data-act=check]').click();
    return { right: !!host.querySelector('.fb-right'), why: host.querySelector('.fb-right').innerText.length, next: !!host.querySelector('.coach-next button'), firstTry: draft('practice-d01').states[0].firstTry };`);
  check('practice: correct answer explains why and offers Next', r.right && r.why > 20 && r.next && r.firstTry === false, r);
  // Enter key checks a typed answer.
  for (let k = 1; k < 10; k++) {
    await js(`document.querySelector('.coach-next button').click();`);
    await b.wait(60);
    await js(`${H} const q = practiceQ(); const host = document.querySelector('.coach-host'); fill(host, q, right(q));
      const inp = host.querySelector('.num-input, .pv-cell');
      if (inp) inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); else host.querySelector('[data-act=check]').click();`);
  }
  r = await js(`${H} return { allRight: draft('practice-d01').states.every((s) => s.solved), firsts: draft('practice-d01').states.filter((s) => s.firstTry).length };`);
  check('practice: all 10 answered (Enter key works for typed answers)', r.allRight && r.firsts === 9, r);
  await js(`document.querySelector('.coach-next button').click();`); await b.wait(100);
  r = await js(`${H} return { t: text(), p: JSON.parse(localStorage.getItem('gml:v1:progress')).lessons.d01.practice };`);
  check('practice: summary shows first-try score and saves the session', /9 of 10/.test(r.t) && r.p.sessions === 1 && r.p.recentSigs.length === 10, { s: r.p.sessions });
  const practiceSigs = r.p.recentSigs;
  await js(`document.querySelector('[data-act=again]').click();`); await b.wait(100);
  r = await js(`${H} return draft('practice-d01').set.map((x) => x.sig);`);
  check('practice: a new session uses different questions', r.length === 10 && r.every((s) => !practiceSigs.includes(s)), r);
  const practice2 = r;
  await b.shot(path.join(SHOTS, 'practice-390.png'), false);

  // ── Test ──
  await b.load(URL + 'index.html#/d01/test');
  await js(`document.querySelector('[data-act=start]').click();`); await b.wait(100);
  r = await js(`${H} const d = draft('test-d01'); return { n: d.set.length, sigs: d.set.map((x) => x.sig), teach: GML.lessonContent.d01.teachSigs };`);
  check('test: exactly 10 questions', r.n === 10);
  check('test: fresh questions (none from the open or last practice session, none from Teach)', r.sigs.every((s) => !practiceSigs.includes(s) && !practice2.includes(s)) &&
    r.sigs.every((s) => !r.teach.includes(s)), r.sigs);
  const test1 = r.sigs;
  // Answer: questions 1-8 right, 9 wrong, 10 blank. Check for leaks on every screen.
  let leaks = [];
  for (let k = 0; k < 10; k++) {
    const leak = await js(`${H} const q = testQ(); const app = document.getElementById('app');
      const bad = [];
      if (app.querySelector('.btn-hint, [data-act=hint], .hints, .hint, .feedback, .fb-right, .fb-wrong, [data-act=check]')) bad.push('hint/feedback UI');
      const plain = (h) => h.replace(/<[^>]*>/g, '').replace(/\\s+/g, ' ').trim();
      if (text().replace(/\\s+/g, ' ').includes(plain(q.why))) bad.push('why');
      q.hints.forEach((h, i) => { if (text().replace(/\\s+/g, ' ').includes(plain(h).slice(0, 40))) bad.push('hint' + i + ' ' + q.template + ': ' + plain(h).slice(0, 60)); });
      if (/Correct|Not quite|answer is/i.test(text())) bad.push('verdict words');
      if (${k} < 8) fill(app.querySelector('.test-q'), q, right(q)); else if (${k} === 8) fill(app.querySelector('.test-q'), q, wrong(q));
      return bad;`);
    if (leak.length) leaks.push({ k, leak });
    if (k === 4) { await b.reload(); }
    await js(`document.querySelector('[data-act=next]').click();`); await b.wait(60);
  }
  check('test: no hints, feedback or answers shown before submitting', leaks.length === 0, leaks);
  r = await js(`${H} const d = draft('test-d01'); return { answered: d.answers.filter((a) => a !== null && a !== '' && a !== 0).length, t: text(), review: d.review };`);
  check('test: refresh mid-test keeps answers; review lists the unanswered question', r.review && r.answered === 9 && /9 of 10/.test(r.t) && /Question 10/.test(r.t), { answered: r.answered });
  r = await js(`document.querySelector('[data-act=submit]').click(); return { confirm: !document.querySelector('.confirm').hidden, sub: JSON.parse(localStorage.getItem('gml:v1:draft:test-d01')).submitted };`);
  check('test: submitting with a blank asks for confirmation first', r.confirm && !r.sub, r);
  await js(`document.querySelector('[data-act=really]').click();`); await b.wait(100);
  r = await js(`${H} const p = JSON.parse(localStorage.getItem('gml:v1:progress')).lessons.d01; return { t: text(), last: p.tests[p.tests.length - 1], links: [...document.querySelectorAll('.skills-table a')].map((a) => a.getAttribute('href')) };`);
  check('test: score 8 of 10 (80%), not mastered', /Your score: 8 out of 10 \(80%\)/.test(r.t) && /Not mastered yet/.test(r.t) && r.last.correct === 8 && r.last.mastered === false, r.t.slice(0, 300));
  check('test: missed skills listed with links to Teach', r.last.missedSkills.length >= 1 && r.links.length === r.last.missedSkills.length && r.links.every((h) => /^#\/d01\/teach\/\d+$/.test(h)), r);
  r.tc = await js(`return document.getElementById('app').textContent;`);
  check('test: results explain every question (right ones folded away)', (r.tc.match(/Your answer:/g) || []).length === 10 && /\(no answer\)/.test(r.tc) && (r.tc.match(/Correct answer:/g) || []).length === 2 && /Questions you got right \(8\)/.test(r.t), null);
  await b.reload();
  check('test: results survive a refresh', /Your score: 8 out of 10/.test(await js(`return document.getElementById('app').innerText;`)));
  await b.shot(path.join(SHOTS, 'test-results-390.png'), false);

  // Retake: fresh questions; answer all right -> mastered. Then a 9/10 test is also mastered.
  for (const [nRight, label] of [[10, '10 of 10'], [9, '9 of 10']]) {
    await js(`document.querySelector('[data-act=new]').click();`); await b.wait(60);
    await js(`document.querySelector('[data-act=start]').click();`); await b.wait(60);
    const sigs = await js(`${H} return draft('test-d01').set.map((x) => x.sig);`);
    if (nRight === 10) check('test: retake gives fresh questions', sigs.every((s) => !test1.includes(s)), sigs);
    for (let k = 0; k < 10; k++) {
      await js(`${H} const q = testQ(); fill(document.querySelector('.test-q'), q, ${k} < ${nRight} ? right(q) : wrong(q)); document.querySelector('[data-act=next]').click();`);
      await b.wait(40);
    }
    await js(`document.querySelector('[data-act=submit]').click();`); await b.wait(80);
    r = await js(`return document.getElementById('app').innerText;`);
    check(`test: ${label} scores ${nRight * 10}% and counts as mastered`, r.includes(`Your score: ${nRight} out of 10 (${nRight * 10}%)`) && /Lesson 1 mastered/.test(r), r.slice(0, 200));
  }

  // Equivalent decimal typed in a test counts as correct.
  await js(`localStorage.removeItem('gml:v1:draft:test-d01');`);
  await b.reload();
  await js(`document.querySelector('[data-act=start]').click();`);
  r = await js(`${H} const d = draft('test-d01');
    d.set.forEach((x, k) => { const q = E.make('d01', x.id, x.seed); d.answers[k] = q.type === 'number' && q.places == null && D.parse(q.answer).places ? q.answer + '0' : right(q); });
    d.started = true; d.review = true; localStorage.setItem('gml:v1:draft:test-d01', JSON.stringify(d)); return true;`);
  await b.reload();
  await js(`document.querySelector('[data-act=submit]').click();`); await b.wait(80);
  check('test: equivalent decimals with extra zeros are scored correct', /Your score: 10 out of 10/.test(await js(`return document.getElementById('app').innerText;`)));

  // ── Parent Progress ──
  await b.load(URL + 'index.html#/parent');
  r = await js(`return document.getElementById('app').innerText;`);
  check('parent: shows lesson completed, recent score, skills, next step and device notice',
    /Lesson completed \(mastered\)\s*Yes/.test(r) && /Most recent test\s*10 of 10 \(100%\)/.test(r) && /Skills correct on the most recent test/.test(r) && /Skills needing more practice/.test(r) &&
    /Suggested next step/.test(r) && /Lesson 2: Decimal Place Value/.test(r) && /only in this browser on this device/.test(r), r.slice(0, 600));
  check('parent: practice sessions and tests counted', /Practice sessions\s*1/.test(r) && /Tests taken\s*4/.test(r));
  await b.reload();
  check('parent: progress survives a refresh', /Tests taken\s*4/.test(await js(`return document.getElementById('app').innerText;`)));
  await b.load(URL + 'index.html#/');
  check('home: lesson card shows mastered status', /Mastered/.test(await js(`return document.querySelector('.lesson-card').innerText;`)));

  // ── Layout on phone, tablet, laptop, desktop ──
  const pages = ['#/', '#/d01/teach/5', '#/d01/teach/7', '#/d01/teach/10', '#/d01/practice', '#/d01/test', '#/d01/notes', '#/parent'];
  for (const [w, h, name] of [[375, 667, 'iPhone SE'], [390, 844, 'iPhone 14'], [768, 1024, 'tablet'], [1366, 768, 'laptop'], [1920, 1080, 'desktop']]) {
    await b.viewport(w, h);
    for (const p of pages) {
      await b.load(URL + 'index.html' + p);
      await noOverflow(`${name} ${p}`);
      if (w <= 768) await bigTargets(`${name} ${p}`);
    }
    // Test results page with all question pictures.
    await b.load(URL + 'index.html#/d01/test');
    await noOverflow(`${name} test results`);
    await b.load(URL + 'index.html#/');
    await b.shot(path.join(SHOTS, `home-${w}.png`), false);
  }
  // A model-choice question and a chart-entry question on the phone.
  await b.viewport(375, 667);
  for (const id of ['M4', 'PL5', 'M5', 'M9', 'C2', 'E4']) {
    await js(`const q = GML.engine.make('d01', '${id}', 3); localStorage.setItem('gml:v1:draft:practice-d01', JSON.stringify({ set: Array.from({ length: 10 }, () => ({ id: '${id}', seed: 3, sig: q.sig })), i: 0, states: Array.from({ length: 10 }, () => ({})), finished: false }));`);
    await b.load(URL + 'index.html#/d01/practice');
    await noOverflow(`iPhone SE practice ${id}`);
    await bigTargets(`iPhone SE practice ${id}`);
    await b.shot(path.join(SHOTS, `practice-${id}-375.png`), false);
  }

  // ── QA regressions: damaged saved data, bad Teach URLs, saved steps, unreadable test input, double submit ──
  await b.viewport(390, 844);
  const bad = {
    'gml:v1:draft:practice-d01': JSON.stringify({ set: Array.from({ length: 10 }, () => ({ id: 'ZZ9', seed: 1, sig: 'x' })), i: 42, states: [] }),
    'gml:v1:draft:test-d01': JSON.stringify({ set: 5, started: true, submitted: true }),
    'gml:v1:progress': JSON.stringify({ lessons: { d01: { practice: { recentSigs: 5, skills: null }, tests: [{}], teach: 'x' } } })
  };
  await js(`localStorage.clear(); const bad = ${JSON.stringify(bad)}; for (const k in bad) localStorage.setItem(k, bad[k]);`);
  for (const route of ['#/', '#/d01/practice', '#/d01/test', '#/parent']) {
    await b.load(URL + 'index.html' + route);
    const t = await js(`return document.getElementById('app').innerText;`);
    check(`damaged saved data does not break ${route}`, !/Something went wrong|undefined|NaN/.test(t), t.slice(0, 120));
  }
  await b.load(URL + 'index.html#/d01/teach/99');
  r = await js(`return { h: location.hash, done: JSON.parse(localStorage.getItem('gml:v1:progress')).lessons.d01.teach.done };`);
  check('teach: out-of-range screen redirects and does not mark Teach done', r.h === '#/d01/teach/19' && r.done === false, r);
  await b.load(URL + 'index.html#/d01/teach/2');
  await js(`let g = 0; while (document.querySelector('[data-act=step]:not([hidden])') && g++ < 9) document.querySelector('[data-act=step]').click();`);
  await b.reload();
  r = await js(`return { steps: document.querySelectorAll('.steps li').length, next: document.querySelector('[data-act=next]').disabled };`);
  check('teach: revealed steps survive a refresh', r.steps === 3 && r.next === false, r);
  for (const junk of ['5', '"abc"', '{"d01:whole":"abc"}', '{"d01:whole":-3}']) {
    await js(`localStorage.setItem('gml:v1:draft:teach-steps', ${JSON.stringify(junk)});`);
    await b.load(URL + 'index.html#/d01/teach/1'); await b.reload();
    r = await js(`const a = document.querySelectorAll('.steps li').length; document.querySelector('[data-act=step]').click(); return { a, b: document.querySelectorAll('.steps li').length, next: document.querySelector('[data-act=next]').disabled };`);
    check(`teach: damaged saved steps (${junk}) start at step 1 and still work`, r.a === 1 && r.b === 2 && r.next === true, r);
  }
  await js(`localStorage.removeItem('gml:v1:draft:test-d01');`);
  await b.reload();
  await b.load(URL + 'index.html#/d01/test');
  await js(`document.querySelector('[data-act=start]').click();`);
  r = await js(`${H} const d = draft('test-d01'); const k = d.set.findIndex((x) => E.make('d01', x.id, x.seed).type === 'number');
    if (k < 0) return { skip: true }; document.querySelector('.qnav-btn[data-k="' + k + '"]').click();
    const i = document.querySelector('.num-input'); i.value = '0,5'; fire(i, 'input');
    return { note: !document.querySelector('.test-note').hidden, text: document.querySelector('.test-note').textContent, done: document.querySelector('.qnav-btn[data-k="' + k + '"]').classList.contains('is-done') };`);
  check('test: unreadable typed answer gets a note and counts as not answered', r.skip || (r.note && /digits/.test(r.text) && !r.done), r);
  await js(`${H} const d = draft('test-d01'); d.review = true; localStorage.setItem('gml:v1:draft:test-d01', JSON.stringify(d));`);
  await b.reload();
  r = await js(`document.querySelector('[data-act=submit]').click(); const y = document.querySelector('[data-act=really]'); y.click(); y.click();
    return JSON.parse(localStorage.getItem('gml:v1:progress')).lessons.d01.tests.length;`);
  check('test: clicking Submit twice records one result', r === 1, r);
  await b.load(URL + 'index.html#/d01/practice');
  r = await js(`${H} const q = practiceQ(); const host = document.querySelector('.coach-host'); fill(host, q, right(q)); host.querySelector('[data-act=check]').click();
    const nb = host.querySelector('.coach-next button'); nb.click(); nb.click(); return draft('practice-d01').i;`);
  check('practice: clicking Next twice moves only one question', r === 1, r);

  // ── Unknown routes and reset ──
  await b.load(URL + 'index.html#/d02/teach/1');
  check('unready lesson route falls back to home', /Gabriella's Math Lab/.test(await js(`return document.querySelector('h1').innerText;`)));
  await b.load(URL + 'index.html#/parent');
  await js(`document.querySelector('[data-act=reset]').click(); document.querySelector('[data-act=really]').click();`);
  check('parent: erase progress works', /No test taken yet/.test(await js(`return document.getElementById('app').innerText;`)) && (await js(`return Object.keys(localStorage).filter((k) => k.startsWith('gml:')).length;`)) === 0);

  check('no console errors', b.errors.length === 0, b.errors);
  if (LIVE) {
    await b.load(URL + 'index.html');
    const st = await js(`return Promise.all([...document.scripts].map((x) => x.src).concat([...document.querySelectorAll('link[rel=stylesheet]')].map((x) => x.href))
      .map((u) => fetch(u, { cache: 'no-store' }).then((r) => [u, r.status])));`);
    check(`live: all ${st.length} scripts and styles load (HTTP 200)`, st.length >= 10 && st.every((x) => x[1] === 200), st.filter((x) => x[1] !== 200));
  } else check('no missing files', server.missing.length === 0, server.missing);
} catch (e) {
  check('browser test crashed', false, String(e && e.stack || e));
} finally {
  b.close();
  server.close();
}
const failed = results.filter((x) => !x.ok).length;
console.log(`\n${results.length - failed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
