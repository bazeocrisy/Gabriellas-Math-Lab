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
  const right = (q) => q.type === 'chart' ? D.digits(q.answer) : q.type === 'expanded' ? GML.kit.expanded(q.answer) : q.answer;
  const wrong = (q) => {
    if (q.type === 'mc') return q.choices.find((c) => c.value !== q.answer).value;
    if (q.type === 'build') return q.answer === 1 ? 2 : q.answer - 1;
    if (q.type === 'chart') { const d = D.digits(q.answer); return { ...d, tenths: String((Number(d.tenths) + 1) % 10) }; }
    if (q.type === 'order') return q.answer.slice().reverse();
    if (q.type === 'expanded') return GML.kit.expanded(D.fromThousandths(D.toThousandths(q.answer) + 1, 3));
    if (q.accept) { for (let k = 0; ; k += 7) { const v = D.fromThousandths(k, 3); if (!q.accept(D.parse(v), {})) return v; } }
    return D.fromThousandths(D.toThousandths(q.answer) + 1, 3);
  };
  // A k-th different wrong answer (null when the question has only one wrong choice).
  const wrongN = (q, k) => {
    if (q.type === 'mc') { const ws = q.choices.filter((c) => c.value !== q.answer).map((c) => c.value); return ws.length > 1 ? ws[k % ws.length] : k ? null : ws[0]; }
    if (q.type === 'build') { const m = q.model === 'grid' ? 100 : 10; return [q.answer - 1, q.answer + 1].filter((x) => x >= 1 && x <= m)[k % 2] ?? (q.answer === 1 ? 2 + k : q.answer - 1 - k); }
    if (q.type === 'chart') { const d = D.digits(q.answer); return { ...d, tenths: String((Number(d.tenths) + 1 + k) % 10) }; }
    if (q.type === 'order') { const a = q.answer.slice(); return k % 2 ? [a[1], a[0], ...a.slice(2)] : a.reverse(); }
    if (q.type === 'expanded') return GML.kit.expanded(D.fromThousandths(D.toThousandths(q.answer) + 1 + k, 3));
    if (q.accept) { let n = 0; for (let v = 0; ; v += 7) { const s = D.fromThousandths(v, 3); if (!q.accept(D.parse(s), {}) && n++ === k) return s; } }
    return D.fromThousandths(D.toThousandths(q.answer) + 1 + k, 3);
  };
  const fire = (el, t) => el.dispatchEvent(new Event(t, { bubbles: true }));
  function fill(host, q, resp) {
    if (q.type === 'mc') { const i = [...host.querySelectorAll('input[type=radio]')].find((x) => x.value === resp); i.click(); }
    else if (q.type === 'number' || q.type === 'expanded') { const i = host.querySelector('.num-input'); i.value = resp; fire(i, 'input'); }
    else if (q.type === 'order') { host.querySelector('.order-clear').click(); resp.forEach((v) => [...host.querySelectorAll('.order-pool [data-v]')].find((x) => x.dataset.v === v).click()); }
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
  const qIn = (mode, id) => { const d = draft(mode + '-' + id); const x = d.set[d.i]; return E.make(id, x.id, x.seed); };
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
    fill(host, q, wrongN(q, 0)); host.querySelector('[data-act=check]').click();
    const w = { wrong: !!host.querySelector('.fb-wrong'), msg: host.querySelector('.fb-wrong p:nth-of-type(2)').textContent, next: host.querySelector('.coach-next').innerHTML.trim(), idx: draft('practice-d01').i };
    // The same wrong answer checked again is not a new try.
    host.querySelector('[data-act=check]').click(); host.querySelector('[data-act=check]').click();
    w.sameAgain = draft('practice-d01').states[0].attempts;
    w.solEarly = !!host.querySelector('[data-act=solution]');
    w.skip = wrongN(q, 1) === null;
    if (!w.skip) { fill(host, q, wrongN(q, 1)); host.querySelector('[data-act=check]').click(); fill(host, q, wrongN(q, 0)); host.querySelector('[data-act=check]').click(); }
    w.sol = !!host.querySelector('[data-act=solution]');
    return { blank, att0, ...w };`);
  check('practice: blank answer asks for an answer and is not counted', /first|Choose|shade|Type/.test(r.blank) && r.att0 === 0, r);
  check('practice: wrong answer says not correct, explains, stays on the question', r.wrong && r.msg.length > 15 && r.next === '' && r.idx === 0, r);
  check('practice: checking the same wrong answer again is not counted and cannot unlock the solution', r.sameAgain === 1 && !r.solEarly, r);
  check('practice: "Show me how" appears only after 3 different wrong tries', r.skip || r.sol, r);
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


  // ── Lesson 1 progress saved by the earlier (deployed) version is kept ──
  await b.viewport(390, 844);
  await js(`localStorage.clear(); localStorage.setItem('gml:v1:progress', JSON.stringify({ lessons: { d01: { teach: { screen: 18, furthest: 18, done: true },
    practice: { sessions: 3, skills: { parts: { c: 2, t: 3 } }, recentSigs: ['M1:4'], lastDate: '2026-10-10T12:00:00.000Z' },
    tests: [{ date: '2026-10-10T12:30:00.000Z', correct: 9, total: 10, percent: 90, mastered: true, skills: { parts: { correct: 1, total: 1 } }, missedSkills: ['model'] }], lastTestSigs: [] } } }));`);
  await b.load(URL + 'index.html#/');
  await b.reload();
  r = await js(`return document.querySelector('.lesson-card').innerText;`);
  check('saved Lesson 1 progress from the earlier version still shows on the home page', /Mastered/.test(r) && /Finished/.test(r) && /3 sessions/.test(r) && /9 of 10/.test(r), r);
  await b.load(URL + 'index.html#/parent');
  r = await js(`return document.getElementById('app').innerText;`);
  check('saved Lesson 1 progress shows on Parent Progress, other lessons start empty', /Lesson 1: Understanding Decimals ★/.test(r) && /9 of 10 \(90%\)/.test(r) && /Lesson 2: Decimal Place Value[\s\S]*No test taken yet/.test(r), r.slice(0, 400));

  // ── Lessons 2+: full Teach, Practice, Test, Notes and Parent run for each lesson ──
  await b.viewport(390, 844);
  const more = await js(`return GML.unit.lessons.filter((l) => GML.unit.available(l.id) && l.id !== 'd01').map((l) => l.id);`);
  for (const id of more) {
    await js('localStorage.clear();');
    await b.load(URL + 'index.html#/' + id + '/teach/1');
    const n = await js(`return GML.lessonContent['${id}'].screens.length;`);
    let order = true, checksN = 0, coachedN = 0, gatedN = 0, whyShown = 0, whyN = 0, goals = 0;
    for (let i = 1; i <= n; i++) {
      const st = await js(`return { h: location.hash, step: !!document.querySelector('[data-act=step]:not([hidden])'), why: !!document.querySelector('.why-box'), whyHidden: (document.querySelector('.why-box') || {}).hidden, goal: !!document.querySelector('.goal'), check: !!document.querySelector('.check-host') };`);
      if (st.h !== `#/${id}/teach/${i}`) { order = false; check(`${id} teach order`, false, st); break; }
      if (st.goal) goals++;
      if (st.step) await js(`let g = 0; while (document.querySelector('[data-act=step]:not([hidden])') && g++ < 10) document.querySelector('[data-act=step]').click();`);
      if (st.why) { whyN++; if (st.whyHidden && !(await js(`return document.querySelector('.why-box').hidden;`))) whyShown++; }
      if (st.check) {
        checksN++;
        const c = await js(`${H}
          const sc = GML.lessonContent['${id}'].screens[${i - 1}];
          const q = E.make('${id}', sc.check.t, 1, sc.check.params);
          const host = document.querySelector('.check-host');
          const before = document.querySelector('[data-act=next]').disabled;
          fill(host, q, wrong(q)); host.querySelector('[data-act=check]').click();
          const w = !!host.querySelector('.fb-wrong'), re = !!host.querySelector('.fb-wrong .remind'), still = document.querySelector('[data-act=next]').disabled;
          fill(host, q, right(q)); host.querySelector('[data-act=check]').click();
          return { before, w, re, still, right: !!host.querySelector('.fb-right'), open: !document.querySelector('[data-act=next]').disabled };`);
        if (c.w && c.re) coachedN++;
        if (c.before && c.still && c.right && c.open) gatedN++; else check(`${id} teach check on screen ${i}`, false, c);
      }
      if (i < n) { await js(`document.querySelector('[data-act=next]').click();`); await b.wait(100); }
    }
    check(`${id} teach: walked all ${n} screens in order`, order);
    check(`${id} teach: every skill screen says what you will learn and explains why after the steps`, goals >= 5 && whyN >= 5 && whyShown === whyN, { goals, whyN, whyShown });
    check(`${id} teach: ${checksN} guided checks coach wrong answers and unlock Next only after a right answer`, checksN >= 5 && coachedN === checksN && gatedN === checksN, { checksN, coachedN, gatedN });
    check(`${id} teach: marked finished`, await js(`return JSON.parse(localStorage.getItem('gml:v1:progress')).lessons['${id}'].teach.done;`) === true);

    // Practice: 3 hints in order on question 1; every question answered wrong first (odd ones) then right.
    await b.load(URL + 'index.html#/' + id + '/practice');
    let rr = await js(`${H} const q = qIn('practice', '${id}'); const host = document.querySelector('.coach-host'); const hb = host.querySelector('[data-act=hint]');
      hb.click(); hb.click(); hb.click(); hb.click();
      return { n: host.querySelectorAll('.hint').length, titles: [...host.querySelectorAll('.hint-title')].map((x) => x.textContent).join('|'), dis: hb.disabled, noAns: !host.querySelector('.fb-right, .fb-solution') };`);
    check(`${id} practice: exactly 3 hints, in order, no answer shown`, rr.n === 3 && rr.titles === 'Hint 1 of 3|Hint 2 of 3|Hint 3 of 3' && rr.dis && rr.noAns, rr);
    let feedbackOk = 0, types = new Set();
    for (let k = 0; k < 10; k++) {
      const res = await js(`${H} const q = qIn('practice', '${id}'); const host = document.querySelector('.coach-host'); let msg = '';
        if (${k} % 2 === 1 || ${k} === 0) { fill(host, q, wrong(q)); host.querySelector('[data-act=check]').click();
          const fb = host.querySelector('.fb-wrong'); msg = fb ? fb.querySelector('p:nth-of-type(2)').textContent : '';
          if (host.querySelector('.coach-next button')) return { bad: 'advanced after wrong' }; }
        fill(host, q, right(q)); host.querySelector('[data-act=check]').click();
        const ok = !!host.querySelector('.fb-right'); const nb = host.querySelector('.coach-next button'); if (nb) nb.click();
        return { ok, msg, type: q.type, wrongTried: ${k} % 2 === 1 || ${k} === 0 };`);
      if (res.bad) { check(`${id} practice question ${k + 1}`, false, res); break; }
      types.add(res.type);
      if (res.ok && (!res.wrongTried || res.msg.length > 15)) feedbackOk++;
      await b.wait(40);
    }
    check(`${id} practice: 10 questions; wrong answers get an explanation and do not advance; right answers explain why`, feedbackOk === 10, { feedbackOk, types: [...types] });
    rr = await js(`return { t: document.getElementById('app').innerText, p: JSON.parse(localStorage.getItem('gml:v1:progress')).lessons['${id}'].practice };`);
    check(`${id} practice: summary and saved session`, /Practice complete/.test(rr.t) && /4 of 10/.test(rr.t) && rr.p.sessions === 1, { s: rr.p.sessions });

    // Test: no help on any screen; 8 right, 1 wrong, 1 blank -> 80%, not mastered; retake all right -> mastered.
    await b.load(URL + 'index.html#/' + id + '/test');
    await js(`document.querySelector('[data-act=start]').click();`);
    const t1 = await js(`${H} return draft('test-${id}').set.map((x) => x.sig);`);
    const leak = [];
    for (let k = 0; k < 10; k++) {
      const l = await js(`${H} const q = qIn('test', '${id}'); const app = document.getElementById('app'); const bad = [];
        if (app.querySelector('[data-act=hint], .hint, .feedback, .fb-right, .fb-wrong, [data-act=check]')) bad.push('help UI');
        const plain = (h) => h.replace(/<[^>]*>/g, '').replace(/\\s+/g, ' ').trim();
        if (text().replace(/\\s+/g, ' ').includes(plain(q.why))) bad.push('why');
        if (${k} < 8) fill(app.querySelector('.test-q'), q, right(q)); else if (${k} === 8) fill(app.querySelector('.test-q'), q, wrong(q));
        document.querySelector('[data-act=next]').click(); return bad;`);
      if (l.length) leak.push({ k, l });
      await b.wait(40);
    }
    check(`${id} test: no hints, feedback or explanations before submitting`, leak.length === 0, leak);
    await js(`document.querySelector('[data-act=submit]').click(); document.querySelector('[data-act=really]').click();`); await b.wait(80);
    rr = await js(`return { t: document.getElementById('app').innerText, links: [...document.querySelectorAll('.skills-table a')].map((a) => a.getAttribute('href')) };`);
    check(`${id} test: 8 of 10 scores 80%, not mastered, missed skills link to this lesson's Teach`, /Your score: 8 out of 10 \(80%\)/.test(rr.t) && /Not mastered yet/.test(rr.t) && rr.links.length >= 1 && rr.links.every((h) => h.startsWith(`#/${id}/teach/`)), rr.t.slice(0, 200));
    await js(`document.querySelector('[data-act=new]').click();`); await b.wait(40);
    await js(`document.querySelector('[data-act=start]').click();`); await b.wait(40);
    const t2 = await js(`${H} return draft('test-${id}').set.map((x) => x.sig);`);
    for (let k = 0; k < 10; k++) { await js(`${H} const q = qIn('test', '${id}'); fill(document.querySelector('.test-q'), q, right(q)); document.querySelector('[data-act=next]').click();`); await b.wait(30); }
    await js(`document.querySelector('[data-act=submit]').click();`); await b.wait(80);
    rr = await js(`return document.getElementById('app').innerText;`);
    check(`${id} test: retake is fresh; 10 of 10 is mastered`, t2.every((x) => !t1.includes(x)) && /Your score: 10 out of 10 \(100%\)/.test(rr) && /mastered!/.test(rr), rr.slice(0, 150));

    await b.load(URL + 'index.html#/' + id + '/notes');
    rr = await js(`return { h: document.querySelector('h1').innerText, t: document.getElementById('app').innerText };`);
    check(`${id} notes: printable notes with vocabulary and worked examples`, rr.h === await js(`return GML.lessonContent['${id}'].title;`) && /Vocabulary|Review sheet/.test(rr.t) && /Worked example/.test(rr.t));
    await b.load(URL + 'index.html#/parent');
    rr = await js(`return document.getElementById('app').innerText;`);
    const ln = await js(`return GML.unit.find('${id}').n;`);
    check(`${id} parent: shows the lesson as completed with the latest score`, new RegExp(`Lesson ${ln}: [^\\n]+★`).test(rr) && rr.includes('10 of 10 (100%)'), rr.slice(0, 300));
  }

  // ── Layout on phone, tablet, laptop, desktop ──
  const pages = ['#/', '#/d01/teach/5', '#/d01/teach/7', '#/d01/teach/10', '#/d01/practice', '#/d01/test', '#/d01/notes', '#/parent',
    ...more.flatMap((id) => [`#/${id}/teach/3`, `#/${id}/teach/5`, `#/${id}/practice`, `#/${id}/test`, `#/${id}/notes`])];
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
  r = await js(`return { h: location.hash, last: GML.lessonContent.d01.screens.length, done: JSON.parse(localStorage.getItem('gml:v1:progress')).lessons.d01.teach.done };`);
  check('teach: out-of-range screen redirects and does not mark Teach done', r.h === '#/d01/teach/' + r.last && r.done === false, r);
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

  // Order widget keeps keyboard focus; "answer first" notes clear when the child answers; result links are 44px on tablet.
  await js(`localStorage.clear();`);
  await b.load(URL + 'index.html#/d04/teach/3'); await b.reload();
  r = await js(`const host = document.querySelector('.check-host');
    host.querySelector('[data-act=check]').click();
    const noteShown = !!host.querySelector('.fb-info');
    const out = { noteShown, focus: [] };
    for (let k = 0; k < 3; k++) { const c = host.querySelector('.order-pool [data-v]'); c.focus(); c.click(); out.focus.push(document.activeElement === document.body ? 'BODY' : document.activeElement.className); }
    out.noteGone = !host.querySelector('.fb-info');
    const placed = host.querySelector('.order-slots [data-k="1"]'); placed.focus(); placed.click();
    out.afterBack = document.activeElement === document.body ? 'BODY' : document.activeElement.className;
    return out;`);
  check('order widget: keyboard focus never falls back to the page after placing or taking back a number', r.focus.every((x) => x !== 'BODY') && r.afterBack !== 'BODY', r);
  check('practice/teach: the "answer first" note disappears once the child answers', r.noteShown && r.noteGone, r);
  await b.viewport(768, 1024);
  await js(`localStorage.removeItem('gml:v1:draft:test-d02');`);
  await b.load(URL + 'index.html#/d02/test'); await b.reload();
  await js(`document.querySelector('[data-act=start]').click();`);
  await js(`${H} const d = draft('test-d02'); d.set.forEach((x, k) => { const q = E.make('d02', x.id, x.seed); d.answers[k] = k < 5 ? right(q) : wrong(q); }); d.review = true; localStorage.setItem('gml:v1:draft:test-d02', JSON.stringify(d));`);
  await b.reload();
  await js(`document.querySelector('[data-act=submit]').click();`); await b.wait(80);
  r = await js(`return [...document.querySelectorAll('.skills-table a')].map((a) => Math.round(a.getBoundingClientRect().height));`);
  check('tablet: "Review in Teach" links in test results are at least 44px tall', r.length > 0 && r.every((h) => h >= 44), r);
  await b.viewport(390, 844);

  // ── Assessment integrity (audit D-01, D-02, D-14, D-15, Decision 2) ──
  const setAll = (id, how) => `${H} const d = draft('test-${id}'); d.set.forEach((x, k) => { const q = E.make('${id}', x.id, x.seed); d.answers[k] = ${how}; }); d.review = true; localStorage.setItem('gml:v1:draft:test-${id}', JSON.stringify(d));`;
  const progOf = (id) => js(`const p = JSON.parse(localStorage.getItem('gml:v1:progress') || '{}'); return (p.lessons || {})['${id}'] || null;`);
  await js(`localStorage.clear();`);
  // D-01: Practice opened during an unfinished Test never shows one of its questions.
  await b.load(URL + 'index.html#/d09/test'); await b.reload();
  await js(`document.querySelector('[data-act=start]').click();`);
  await b.load(URL + 'index.html#/d09/practice');
  r = await js(`${H} const open = draft('test-d09').set.map((x) => x.sig); let bad = draft('practice-d09').set.filter((x) => open.includes(x.sig)).length;
    for (let k = 0; k < 50; k++) { localStorage.removeItem('gml:v1:draft:practice-d09'); bad += GML.views.practice.newSession('d09').set.filter((x) => open.includes(x.sig)).length; }
    return bad;`);
  check('integrity: Practice opened during an unfinished Test never repeats its questions (51 sessions)', r === 0, r);
  // Decision 2: the Practice visit above is noted on the open test; it is scored but not mastered.
  await b.load(URL + 'index.html#/d09/test');
  r = await js(`return { note: (document.querySelector('.assist-note') || {}).innerText || '', assist: JSON.parse(localStorage.getItem('gml:v1:draft:test-d09')).assist };`);
  check('integrity: opening Practice during a Test is noted on the Test, with a friendly message', /Lesson 9 Practice/.test(r.note) && !/cheat/i.test(r.note) && r.assist.includes('Lesson 9 Practice'), r);
  await js(setAll('d09', 'right(q)')); await b.reload();
  await js(`document.querySelector('[data-act=submit]').click();`); await b.wait(60);
  r = { t: await js(`return document.getElementById('app').innerText;`), p: await progOf('d09') };
  check('integrity: 10 of 10 with a lesson page opened keeps the score but is not ★ Mastered', /Your score: 10 out of 10/.test(r.t) && /counts as practice/.test(r.t) &&
    r.p.tests[0].goalMet === true && r.p.tests[0].mastered === false && !r.p.masteredOn, r.p);
  await b.load(URL + 'index.html#/');
  check('integrity: the home card shows no ★ Mastered for a test with lesson pages opened', !/Mastered/.test(await js(`return [...document.querySelectorAll('.lesson-card')][8].innerText;`)));
  await b.load(URL + 'index.html#/parent');
  r = await js(`return document.getElementById('app').innerText;`);
  check('integrity: Parent Progress explains the rule and labels the test', /How Tests and mastery work/.test(r) && /lesson pages opened during the test/.test(r) && /goal met, but/.test(r), r.slice(0, 300));
  // A refresh during a test is not counted as opening a lesson page; a test done on its own is mastered.
  await b.load(URL + 'index.html#/d09/test');
  await js(`document.querySelector('[data-act=new]').click(); document.querySelector('[data-act=start]').click();`);
  await b.reload(); await b.load(URL + 'index.html#/'); await b.load(URL + 'index.html#/d09/test');
  r = await js(`return JSON.parse(localStorage.getItem('gml:v1:draft:test-d09')).assist;`);
  check('integrity: refreshing, or visiting Home, during a test is not counted', Array.isArray(r) && r.length === 0, r);
  await js(setAll('d09', 'right(q)')); await b.reload();
  await js(`document.querySelector('[data-act=submit]').click();`); await b.wait(60);
  r = await progOf('d09');
  check('integrity: a test done on its own with 10 of 10 is ★ Mastered', r.tests[1].mastered === true && !!r.masteredOn && r.testsTaken === 2, r);

  // D-02: a stale page (another tab submitted the same test) cannot change or re-submit it.
  await b.load(URL + 'index.html#/d05/test'); await b.reload();
  await js(`document.querySelector('[data-act=start]').click();`);
  await js(`${H} const d = draft('test-d05'); d.submitted = true; d.result = { id: d.id, date: new Date().toISOString(), correct: 3, total: 10, percent: 30, goalMet: false, mastered: false, skills: {}, missedSkills: [] };
    localStorage.setItem('gml:v1:draft:test-d05', JSON.stringify(d));
    const p = JSON.parse(localStorage.getItem('gml:v1:progress')); p.lessons.d05 = Object.assign(p.lessons.d05 || {}, { tests: [d.result], testsTaken: 1 }); localStorage.setItem('gml:v1:progress', JSON.stringify(p));`);
  r = await js(`${H} const q = qIn('test', 'd05'); fill(document.querySelector('.test-q'), q, right(q)); const nb = document.querySelector('[data-act=next]'); if (nb) nb.click();
    return { h: document.querySelector('h1').innerText, n: JSON.parse(localStorage.getItem('gml:v1:progress')).lessons.d05.tests.length, sub: JSON.parse(localStorage.getItem('gml:v1:draft:test-d05')).result.correct };`);
  check('integrity: a stale tab shows the submitted result instead of changing it', /Your score: 3 out of 10/.test(r.h) && r.n === 1 && r.sub === 3, r);
  // The same on the review screen: Submit in a stale tab records nothing new.
  await js(`document.querySelector('[data-act=new]').click(); document.querySelector('[data-act=start]').click();`);
  await js(setAll('d05', 'right(q)')); await b.reload();
  await js(`${H} const d = draft('test-d05'); d.submitted = true; d.result = { id: d.id, date: new Date().toISOString(), correct: 2, total: 10, percent: 20, goalMet: false, mastered: false, skills: {}, missedSkills: [] };
    localStorage.setItem('gml:v1:draft:test-d05', JSON.stringify(d));
    const p = JSON.parse(localStorage.getItem('gml:v1:progress')); p.lessons.d05.tests.push(d.result); p.lessons.d05.testsTaken = 2; localStorage.setItem('gml:v1:progress', JSON.stringify(p));`);
  r = await js(`document.querySelector('[data-act=submit]').click(); return { h: document.querySelector('h1').innerText, p: JSON.parse(localStorage.getItem('gml:v1:progress')).lessons.d05 };`);
  check('integrity: Submit in a stale tab records no second result and keeps the first', r.p.tests.length === 2 && r.p.tests[1].correct === 2 && /Your score: 2 out of 10/.test(r.h) && !r.p.masteredOn, r);
  // A real second tab (a same-site frame shares storage and storage events): it switches to the results when this tab submits.
  await b.load(URL + 'index.html#/d06/test'); await b.reload();
  await js(`document.querySelector('[data-act=start]').click();
    const f = document.createElement('iframe'); f.id = 'tab2'; f.style.width = '380px'; f.style.height = '600px'; f.src = location.href.split('#')[0] + '#/d06/test'; document.body.appendChild(f);`);
  await b.wait(700);
  r = await js(`return document.getElementById('tab2').contentDocument.querySelector('h1').innerText;`);
  const tab2Before = r;
  await js(setAll('d06', 'right(q)'));
  await js(`document.getElementById('tab2').remove(); location.reload();`); await b.wait(400);
  await js(`const f = document.createElement('iframe'); f.id = 'tab2'; f.style.width = '380px'; f.style.height = '600px'; f.src = location.href.split('#')[0] + '#/d06/test'; document.body.appendChild(f);`);
  await b.wait(700);
  await js(`document.querySelector('[data-act=submit]').click();`); await b.wait(500);
  r = await js(`return { tab2: document.getElementById('tab2').contentDocument.querySelector('h1').innerText, n: JSON.parse(localStorage.getItem('gml:v1:progress')).lessons.d06.tests.length };`);
  check('integrity: a second open tab switches to the results when the test is submitted elsewhere', /Question 1/.test(tab2Before) && /Your score: 10 out of 10/.test(r.tab2) && r.n === 1, { tab2Before, ...r });
  await js(`const f = document.getElementById('tab2'); if (f) f.remove();`);

  // D-14 / D-15 and saved progress from the previous build (no attempt ids, counts or mastery dates).
  await js(`localStorage.clear();
    const t = (c, day) => ({ date: '2026-09-' + String(day).padStart(2, '0') + 'T12:00:00Z', correct: c, total: 10, percent: c * 10, mastered: c >= 9, skills: {}, missedSkills: [] });
    const d03 = []; for (let k = 0; k < 20; k++) d03.push(t(k === 0 ? 10 : 4, k + 1));
    localStorage.setItem('gml:v1:progress', JSON.stringify({ lessons: { d03: { teach: { screen: 0, furthest: 15, done: true }, practice: { sessions: 1, skills: {}, recentSigs: [] }, tests: d03, lastTestSigs: [] },
      d10: { teach: { screen: 0, furthest: 12, done: true }, practice: { sessions: 0, skills: {}, recentSigs: [] }, tests: [t(10, 25)], lastTestSigs: [] } } }));`);
  await b.load(URL + 'index.html#/parent');
  r = await js(`return { l10: document.querySelector('#pl-d10').closest('section').innerText, l3: document.querySelector('#pl-d03').closest('section').innerText };`);
  check('integrity: with only Lessons 3 and 10 mastered, Lesson 10 does not say "All lessons complete"', !/All lessons complete/.test(r.l10) && /Lesson 1: Understanding Decimals is not mastered yet/.test(r.l10), r.l10);
  check('integrity: older saved progress keeps its mastery and test count', /Yes ★/.test(r.l3) && /Tests taken\s*20/.test(r.l3), r.l3);
  await b.load(URL + 'index.html#/d03/test'); await b.reload();
  await js(`document.querySelector('[data-act=start]').click();`);
  await js(setAll('d03', 'wrong(q)')); await b.reload();
  await js(`document.querySelector('[data-act=submit]').click();`); await b.wait(60);
  await b.load(URL + 'index.html#/parent');
  r = await js(`return document.querySelector('#pl-d03').closest('section').innerText;`);
  check('integrity: mastery and the count survive when the mastered test leaves the 20-test history', /Yes ★/.test(r) && /Tests taken\s*21/.test(r), r);
  // A test that was in progress when the app was updated (saved without an attempt id) can still be finished once.
  await js(`${H} const set = E.buildSet('d04', { plan: E.banks.d04.plan, seed: 99 });
    localStorage.setItem('gml:v1:draft:test-d04', JSON.stringify({ set, answers: set.map(() => null), i: 0, started: true, submitted: false, review: false }));`);
  await b.load(URL + 'index.html#/d04/test');
  await js(setAll('d04', 'right(q)')); await b.reload();
  r = await js(`const b1 = document.querySelector('[data-act=submit]'); b1.click(); return { h: document.querySelector('h1').innerText, p: JSON.parse(localStorage.getItem('gml:v1:progress')).lessons.d04 };`);
  check('integrity: a test saved by the previous version can be finished and is recorded once', /10 out of 10/.test(r.h) && r.p.tests.length === 1 && !!r.p.tests[0].id && r.p.testsTaken === 1, r.p);

  // ── Teaching corrections (audit D-04, D-05, D-18 to D-24) ──
  const screenOf = (id, sid) => js(`return GML.lessonContent['${id}'].screens.findIndex((s) => s.id === '${sid}') + 1;`);
  await js(`localStorage.clear();`);
  for (const [id, sid, sel, label] of [['d01', 'line', '.model-line', 'Lesson 1 number line (tenths)'], ['d01', 'zoom', '.model-line', 'Lesson 1 zoomed number line (hundredths)'],
    ['d03', 'missing', '.pv-chart', 'Lesson 3 missing digit'], ['d06', 'models', '.m-hop', 'Lesson 6 number-line jumps'], ['d07', 'models', '.m-hop', 'Lesson 7 number-line jumps'],
    ['d08', 'word', '.model-grid', 'Lesson 8 area example'], ['d09', 'whole', '.ldiv-model', 'Lesson 9 division layout'], ['d09', 'hundredths', '.ldiv-model', 'Lesson 9 hundredths and related fact']]) {
    await b.load(URL + `index.html#/${id}/teach/${await screenOf(id, sid)}`);
    r = await js(`for (let k = 0; k < 8; k++) { const s = document.querySelector('[data-act=step]'); if (s && !s.hidden) s.click(); }
      return { n: document.querySelectorAll('${sel}').length, h: document.querySelector('h1').innerText, why: !!document.querySelector('.why-box:not([hidden])'), next: !document.querySelector('[data-act=next]').disabled };`);
    check(`teach: ${label} screen draws its picture and explains why`, r.n > 0 && r.next && (r.why || sid === 'models' || sid === 'word'), r);
  }
  // The new guided checks work like the others: a wrong answer coaches, a right answer unlocks Next.
  for (const [id, sid] of [['d01', 'check-line'], ['d01', 'check-compare'], ['d01', 'check-chart'], ['d02', 'check-expanded'], ['d03', 'check-missing'], ['d09', 'check-hundredths']]) {
    await b.load(URL + `index.html#/${id}/teach/${await screenOf(id, sid)}`); await b.reload();
    r = await js(`${H} const sc = GML.lessonContent['${id}'].screens.find((s) => s.id === '${sid}'); const q = E.make('${id}', sc.check.t, 1, sc.check.params);
      const host = document.querySelector('.check-host'); const nb = document.querySelector('[data-act=next]');
      fill(host, q, wrong(q)); host.querySelector('[data-act=check]').click(); const coached = !!host.querySelector('.fb-wrong') && nb.disabled;
      fill(host, q, right(q)); host.querySelector('[data-act=check]').click(); return { coached, right: !!host.querySelector('.fb-right'), open: !nb.disabled };`);
    check(`teach: new guided check ${id}/${sid} coaches a wrong answer and unlocks Next when right`, r.coached && r.right && r.open, r);
  }
  // D-24: "Show me how" for column work shows the lined-up columns, carry or regroup marks and steps.
  for (const [id, t, seed] of [['d06', 'AL1', 5], ['d07', 'SZ1', 3]]) {
    await js(`${H} const q = E.make('${id}', '${t}', ${seed}); const set = E.buildSet('${id}', { plan: E.banks['${id}'].plan, seed: 7 }).filter((x) => x.id !== '${t}').slice(0, 9);
      set.unshift({ id: '${t}', seed: ${seed}, sig: q.sig }); localStorage.setItem('gml:v1:draft:practice-${id}', JSON.stringify({ id: 'x', set, i: 0, states: set.map(() => ({})), finished: false, recorded: false }));`);
    await b.load(URL + `index.html#/${id}/practice`); await b.reload();
    r = await js(`${H} const q = qIn('practice', '${id}'); const host = document.querySelector('.coach-host');
      for (let k = 0; k < 3; k++) { fill(host, q, wrongN(q, k)); host.querySelector('[data-act=check]').click(); }
      host.querySelector('[data-act=solution]').click();
      const w = host.querySelector('.solution-work'); return { work: !!w, cols: !!(w && w.querySelector('.vcalc-model')), steps: w ? w.querySelectorAll('.sol-steps li').length : 0, marks: w ? w.querySelector('.v-carry') !== null : false };`);
    check(`practice: "Show me how" for ${id}/${t} shows the columns, ${id === 'd06' ? 'carries' : 'regrouping'} and each step`, r.work && r.cols && r.steps >= 3 && r.marks, r);
  }
  // Lesson 1 progress saved before the new screens were added still shows as finished.
  await js(`localStorage.setItem('gml:v1:progress', JSON.stringify({ lessons: { d01: { teach: { screen: 18, furthest: 18, done: true }, practice: { sessions: 0, skills: {}, recentSigs: [] }, tests: [], lastTestSigs: [] } } }));`);
  await b.load(URL + 'index.html#/');
  check('saved progress: Lesson 1 Teach finished before the new screens still shows as finished', /Teach Finished/.test(await js(`return document.querySelector('.lesson-card').innerText.replace(/\\s+/g, ' ');`)));

  // ── Keyboard focus and announcements (audit D-25, D-26) ──
  await js(`localStorage.clear();`);
  await b.load(URL + 'index.html#/d01/teach/3'); await b.reload();
  r = await js(`${H} const sc = GML.lessonContent.d01.screens[2]; const q = E.make('d01', sc.check.t, 1, sc.check.params); const host = document.querySelector('.check-host');
    const c = host.querySelector('[data-act=check]'); c.focus(); fill(host, q, right(q)); c.click();
    const a = document.activeElement; return { body: a === document.body, inFeedback: !!a.closest('.feedback') };`);
  check('a11y: after a correct guided check, keyboard focus moves to the feedback (not lost)', !r.body && r.inFeedback, r);
  await b.load(URL + 'index.html#/d01/practice');
  r = await js(`const h = document.querySelector('[data-act=hint]'); h.focus(); h.click(); h.click(); h.click();
    const a = document.activeElement; return { body: a === document.body, hint: a.classList.contains('hint'), disabled: h.disabled };`);
  check('a11y: after the last hint, keyboard focus moves to that hint (not lost)', !r.body && r.hint && r.disabled, r);
  await b.load(URL + 'index.html#/d02/teach/1');
  r = await js(`const live = document.querySelector('.steps').getAttribute('aria-live'); const s = document.querySelector('[data-act=step]'); s.focus();
    for (let k = 0; k < 8; k++) if (!s.hidden) s.click();
    const a = document.activeElement; return { live, why: a.classList.contains('why-box'), body: a === document.body };`);
  check('a11y: new worked-example steps are announced, and focus goes to "Why it works" after the last step', r.live === 'polite' && r.why && !r.body, r);

  // ── Usability and cosmetic corrections (audit D-17, D-31, D-32, D-33) ──
  await js(`localStorage.clear();`);
  for (const [w, h] of [[320, 568], [1366, 768]]) {
    await b.viewport(w, h);
    await b.load(URL + 'index.html#/d02/teach/' + await screenOf('d02', 'check-expanded')); await b.reload();
    r = await js(`const i = document.querySelector('.exp-input'); i.value = '80 + 6 + 0.7 + 0.02 + 0.003'; i.dispatchEvent(new Event('input', { bubbles: true })); return { sw: i.scrollWidth, cw: i.clientWidth };`);
    check(`expanded form: a five-part answer fits in the box at ${w}px`, r.sw <= r.cw + 1, r);
  }
  await b.viewport(320, 568);
  const smallest = `let m = 99; document.querySelectorAll('#app svg text').forEach((t) => { if (t.getBoundingClientRect().height) m = Math.min(m, parseFloat(getComputedStyle(t).fontSize) * t.getScreenCTM().a); }); return +m.toFixed(1);`;
  for (const [id, sid] of [['d01', 'zoom'], ['d06', 'models'], ['d07', 'models'], ['d05', 'tenths']]) {
    await b.load(URL + `index.html#/${id}/teach/${await screenOf(id, sid)}`);
    await js(`for (let k = 0; k < 8; k++) { const s = document.querySelector('[data-act=step]'); if (s && !s.hidden) s.click(); }`);
    r = await js(smallest);
    check(`number-line labels are at least 10px on a 320px screen: ${id}/${sid}`, r >= 10, r);
  }
  await b.viewport(390, 844);
  r = await js(`return GML.unit.lessons.map((l) => l.id);`);
  const titles = [];
  for (const id of r) {
    const L = await js(`return GML.lessonContent['${id}'].screens.map((s, k) => s.kind === 'check' ? k + 1 : 0).filter(Boolean);`);
    for (const n of L.slice(0, 2)) { await b.load(URL + `index.html#/${id}/teach/${n}`); titles.push(await js(`return document.querySelector('h1').innerText + ' | ' + document.title;`)); }
  }
  check('guided checks are titled with their topic, and page titles differ', titles.every((t) => /^Try it together: \S/.test(t)) && new Set(titles.map((t) => t.split(' | ')[0])).size >= titles.length - 2, titles.slice(0, 6));
  await b.load(URL + 'index.html#/d01/teach/2');
  r = await js(`for (let k = 0; k < 5; k++) { const s = document.querySelector('[data-act=step]'); if (s && !s.hidden) s.click(); }
    const ol = document.querySelector('.steps'); return { style: getComputedStyle(ol).listStyleType, first: ol.querySelector('li').innerText.slice(0, 7) };`);
  check('worked-example steps labelled "Step 1." are not numbered twice', r.style === 'none' && /^Step 1/.test(r.first), r);

  // ── Unknown routes and reset ──
  await b.load(URL + 'index.html#/d11/teach/1');
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
