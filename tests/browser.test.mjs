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

  // ── NumberNova landing page ──
  let r = await js(`return { t: document.getElementById('app').innerText, h1: document.querySelector('h1').innerText, title: document.title,
    logo: (document.querySelector('.nn-hero-logo') || {}).complete && document.querySelector('.nn-hero-logo').naturalWidth > 0,
    headerIcon: (document.querySelector('.brand-icon') || {}).naturalWidth > 0, favicon: [...document.querySelectorAll('link[rel=icon]')].map((l) => l.getAttribute('href')),
    pillars: [...document.querySelectorAll('.pillar')].map((a) => a.querySelector('.pillar-title').innerText + '>' + a.getAttribute('href')),
    brand: document.querySelector('.brand').innerText.replace(/\s+/g, '') };`);
  check('NumberNova: brand name, tagline and welcome on the landing page', r.brand === 'NumberNova' && /Ready to make your next math discovery\?/.test(r.h1) && /NumberNova/.test(r.title) && !/Gabriella/.test(r.t + r.title), r);
  check('NumberNova: logo, header icon and favicon load', r.logo && r.headerIcon && r.favicon.includes('assets/brand/favicon.svg'), r);
  check('NumberNova: the four main sections are on the landing page', JSON.stringify(r.pillars) === JSON.stringify(['Learn>#/learn', 'Practice>#/practice', 'Study Guides>#/guides', 'Parent Progress>#/parent']), r.pillars);
  r = await js(`return Promise.all(['assets/brand/favicon.svg', 'assets/brand/favicon-32.png', 'assets/brand/numbernova-icon.svg', 'assets/brand/numbernova-logo.svg', 'assets/brand/apple-touch-icon.png', 'assets/brand/icon-192.png', 'assets/brand/icon-512.png', 'assets/brand/site.webmanifest']
    .map((u) => fetch(u, { cache: 'no-store' }).then((x) => u + ' ' + x.status)));`);
  check('NumberNova: every brand asset loads', r.every((x) => / 200$/.test(x)), r);
  await b.load(URL + 'index.html#/learn');

  // ── Learn (the ten lessons) ──
  r = await js(`${H} return { t: text(), modes: [...document.querySelectorAll('.btn-mode')].map((a) => a.textContent + '>' + a.getAttribute('href')),
    later: document.querySelectorAll('.later-list li').length, laterButtons: document.querySelectorAll('.later-list a, .later-list button').length,
    avail: GML.unit.lessons.filter((l) => GML.unit.available(l.id)).map((l) => l.id), total: GML.unit.lessons.length };`);
  check('learn: Decimal lessons page with grade and Milestones subtitles', /Decimal lessons/.test(r.t) && /Grade 5 Mathematics/.test(r.t) && /Georgia Milestones Preparation/.test(r.t), r.t.slice(0, 200));
  check('learn: every available lesson has TEACH | PRACTICE | TEST', JSON.stringify(r.modes) === JSON.stringify(r.avail.flatMap((id) => [`TEACH>#/${id}/teach/1`, `PRACTICE>#/${id}/practice`, `TEST>#/${id}/test`])), r.modes);
  check('learn: all 10 lessons listed; the rest say Coming later with no buttons', r.total === 10 && r.later === r.total - r.avail.length && r.laterButtons === 0, r);
  check('learn: Lesson Notes button for each available lesson', (await js(`return document.querySelectorAll('.btn-notes').length;`)) === r.avail.length);

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
  await b.load(URL + 'index.html#/learn');
  check('learn: lesson card shows mastered status', /Mastered/.test(await js(`return document.querySelector('.lesson-card').innerText;`)));


  // ── Lesson 1 progress saved by the earlier (deployed) version is kept ──
  await b.viewport(390, 844);
  await js(`localStorage.clear(); localStorage.setItem('gml:v1:progress', JSON.stringify({ lessons: { d01: { teach: { screen: 18, furthest: 18, done: true },
    practice: { sessions: 3, skills: { parts: { c: 2, t: 3 } }, recentSigs: ['M1:4'], lastDate: '2026-10-10T12:00:00.000Z' },
    tests: [{ date: '2026-10-10T12:30:00.000Z', correct: 9, total: 10, percent: 90, mastered: true, skills: { parts: { correct: 1, total: 1 } }, missedSkills: ['model'] }], lastTestSigs: [] } } }));`);
  await b.load(URL + 'index.html#/learn');
  await b.reload();
  r = await js(`return document.querySelector('.lesson-card').innerText;`);
  check('saved Lesson 1 progress from the earlier version still shows on the Learn page', /Mastered/.test(r) && /Finished/.test(r) && /3 sessions/.test(r) && /9 of 10/.test(r), r);
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
  await b.load(URL + 'index.html#/learn');
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
  // Wait until the second tab has loaded (slower on the live site than on the local test server).
  const tab2H1 = async () => { for (let k = 0; k < 50; k++) { const t = await js(`const f = document.getElementById('tab2'); const h = f && f.contentDocument && f.contentDocument.querySelector('h1'); return h ? h.innerText : null;`); if (t) return t; await b.wait(200); } return null; };
  r = await tab2H1();
  const tab2Before = r;
  await js(setAll('d06', 'right(q)'));
  await js(`document.getElementById('tab2').remove();`); await b.reload();
  await js(`const f = document.createElement('iframe'); f.id = 'tab2'; f.style.width = '380px'; f.style.height = '600px'; f.src = location.href.split('#')[0] + '#/d06/test'; document.body.appendChild(f);`);
  await tab2H1();
  await js(`document.querySelector('[data-act=submit]').click();`);
  for (let k = 0; k < 25 && !/Your score/.test(await tab2H1() || ''); k++) await b.wait(200);
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
  for (const [id, sid] of [['d01', 'check-line'], ['d01', 'check-compare'], ['d01', 'check-chart-typed'], ['d02', 'check-expanded-typed'], ['d03', 'check-missing'], ['d09', 'check-hundredths']]) {
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
  await b.load(URL + 'index.html#/learn');
  check('saved progress: Lesson 1 Teach finished before the new screens still shows as finished', /Teach Finished/.test(await js(`return document.querySelector('.lesson-card').innerText.replace(/\\s+/g, ' ');`)));

  // ── Keyboard focus and announcements (audit D-25, D-26) ──
  await js(`localStorage.clear();`);
  await b.load(URL + 'index.html#/d01/teach/3'); await b.reload();
  r = await js(`${H} const sc = GML.lessonContent.d01.screens[2]; const q = E.make('d01', sc.check.t, 1, sc.check.params); const host = document.querySelector('.check-host');
    const c = host.querySelector('[data-act=check]'); c.focus(); fill(host, q, right(q)); c.click();
    const a = document.activeElement; return { body: a === document.body, next: a.dataset.act === 'next' };`);
  check('a11y: after a correct guided check in Teach, keyboard focus moves to Next (not lost)', !r.body && r.next, r);
  await b.load(URL + 'index.html#/d01/practice');
  r = await js(`${H} const q = practiceQ(); const host = document.querySelector('.coach-host'); const c = host.querySelector('[data-act=check]'); c.focus(); fill(host, q, right(q)); c.click();
    const a = document.activeElement; return { body: a === document.body, inFeedback: !!a.closest('.feedback') };`);
  check('a11y: after a correct Practice answer, keyboard focus moves to the feedback (not lost)', !r.body && r.inFeedback, r);

  // ── Review regressions (upgrade from the previous version, second tab, small screens) ──
  await js(`localStorage.clear();`);
  // An unfinished test saved by the previous version with a choice whose wording changed: asked again, not scored wrong.
  await js(`${H} const E2 = GML.engine; let seed = 1, q; for (;; seed++) { q = E2.make('d03', 'Y1', seed); if (q) break; }
    const set = E2.buildSet('d03', { plan: E2.banks.d03.plan, seed: 5 }).filter((x) => x.id !== 'Y1').slice(0, 9); set.unshift({ id: 'Y1', seed, sig: q.sig });
    localStorage.setItem('gml:v1:draft:test-d03', JSON.stringify({ set, answers: ['Yes. An old wording of a choice.', ...set.slice(1).map(() => null)], i: 0, started: true, submitted: false, review: false }));`);
  await b.load(URL + 'index.html#/d03/test');
  r = await js(`return { note: (document.querySelector('.reset-note') || {}).innerText || '', a0: JSON.parse(localStorage.getItem('gml:v1:draft:test-d03')).answers[0] };`);
  check('upgrade: an old answer that matches no choice is asked for again (not scored as wrong)', /question 1 again/.test(r.note) && r.a0 === null, r);
  // An unfinished test the updated app cannot rebuild says so.
  await js(`localStorage.setItem('gml:v1:draft:test-d03', JSON.stringify({ set: [{ id: 'E1', seed: 1, sig: 'E1:old' }], answers: [null], i: 0, started: true, submitted: false, review: false }));`);
  await b.load(URL + 'index.html#/'); await b.load(URL + 'index.html#/d03/test');
  check('upgrade: an unfinished test that cannot be continued explains why', /could not be continued/.test(await js(`return document.getElementById('app').innerText;`)));
  // Old saved state for a guided check whose question type changed does not show on the new check.
  await js(`localStorage.setItem('gml:v1:draft:teach-d01-check-chart', JSON.stringify({ solved: true, fb: { kind: 'correct' }, resp: 'hundredths' }));`);
  await b.load(URL + 'index.html#/d01/teach/' + await screenOf('d01', 'check-chart-typed'));
  check('upgrade: the new typed-chart check starts fresh (old saved answer not shown)', await js(`return !document.querySelector('.check-host .fb-right') && !document.querySelector('.check-host input:disabled');`));
  // A practice session finished in two tabs is counted once.
  await js(`${H} const set = E.buildSet('d02', { plan: E.banks.d02.plan, seed: 3 });
    localStorage.setItem('gml:v1:draft:practice-d02', JSON.stringify({ id: 'dup1', set, i: 9, states: set.map(() => ({ solved: true, firstTry: true, hints: 0 })), finished: true, recorded: false }));
    localStorage.setItem('gml:v1:progress', JSON.stringify({ lessons: { d02: { teach: { screen: 0, furthest: 0, done: false }, practice: { sessions: 1, skills: {}, recentSigs: [], lastId: 'dup1' }, tests: [], lastTestSigs: [] } } }));`);
  await b.load(URL + 'index.html#/d02/practice');
  r = await progOf('d02');
  check('practice: a session already counted in another tab is not counted again', r.practice.sessions === 1, r.practice);
  // The expanded-form box grows so a long answer stays visible on a small screen.
  await b.viewport(320, 568);
  await b.load(URL + 'index.html#/d02/teach/' + await screenOf('d02', 'check-expanded-typed')); await b.reload();
  r = await js(`const i = document.querySelector('.exp-input'); i.value = '8 × 10 + 9 × 1 + 4 × 0.1 + 6 × 0.01 + 2 × 0.001'; i.dispatchEvent(new Event('input', { bubbles: true })); return { sh: i.scrollHeight, ch: i.clientHeight, sw: i.scrollWidth, cw: i.clientWidth };`);
  check('expanded form: a long answer is fully visible at 320px (the box grows)', r.sh <= r.ch + 2 && r.sw <= r.cw + 1, r);
  await b.viewport(390, 844);
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
    await b.load(URL + 'index.html#/d02/teach/' + await screenOf('d02', 'check-expanded-typed')); await b.reload();
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

  // ── NumberNova: Study Guides ──
  await b.load(URL + 'index.html#/guides');
  r = await js(`const cards = [...document.querySelectorAll('.guide-card')];
    return { h1: document.querySelector('h1').innerText, n: cards.length, titles: cards.map((c) => c.querySelector('h2').innerText),
      open: cards.map((c) => c.querySelector('.btn-guide').getAttribute('href')), dl: cards.map((c) => c.querySelector('[download]').getAttribute('download')),
      nav: document.querySelector('.site-nav a[aria-current]').dataset.nav, title: document.title };`);
  check('guides: eight numbered guide cards with titles', r.n === 8 && r.titles[0] === 'Decimal Place Value' && r.titles[7] === 'Mixed Decimal Practice' && r.nav === 'guides' && /Study Guides/.test(r.title), r);
  const pdfs = await js(`return Promise.all([...document.querySelectorAll('.btn-guide')].map((a) => fetch(a.href, { cache: 'no-store' }).then((x) => [a.getAttribute('href'), x.status, x.headers.get('content-type')])));`);
  check('guides: all eight PDFs load (HTTP 200, application/pdf)', pdfs.length === 8 && pdfs.every((x) => x[1] === 200 && /pdf/.test(x[2])), pdfs);
  check('guides: Download names each PDF file, and links are repository-relative', r.dl.every((d) => /^Decimals-Section-\d.*\.pdf$/.test(d)) && r.open.every((u) => /^study-guides\/pdf\/decimals\//.test(u)), r);
  r = await js(`document.querySelector('[data-print]').click(); const f = document.getElementById('pdf-print-frame');
    return { frame: !!f, src: f && f.getAttribute('src'), status: document.getElementById('guide-status').textContent };`);
  check('guides: Print loads the PDF into a print frame and tells the student what happens', r.frame && /Section-1/.test(r.src) && /print/.test(r.status), r);
  r = await js(`const f = document.getElementById('pdf-print-frame'); if (f) f.remove(); return true;`);
  await b.load(URL + 'index.html#/d06/notes');
  r = await js(`const a = document.querySelector('.guide-link a'); return a ? a.getAttribute('href') : null;`);
  check('guides: Lesson 6 Notes link to the matching guide (Section 4, Adding)', r === 'study-guides/pdf/decimals/Decimals-Section-4-Adding-Decimals.pdf', r);

  // ── NumberNova: Practice Center ──
  const pcDraft = () => js(`return JSON.parse(localStorage.getItem('gml:v1:draft:pc-session') || 'null');`);
  const pcStart = async (mode, n, op) => {
    await b.load(URL + 'index.html#/practice'); await b.reload();
    await js(`document.getElementById('pc-mode-${mode}').click(); document.querySelector('.pc-form button[type=submit]').click();`);
    await js(`${op ? `document.getElementById('pc-op-${op}').click();` : ''} document.getElementById('pc-n-${n}').click(); document.querySelector('.pc-form button[type=submit]').click();`);
    await js(`document.querySelector('[data-act=start]').click(); const y = document.querySelector('.pc-confirm [data-act=really]'); if (y && !y.closest('[hidden]')) y.click();`);
    await b.wait(150);
  };
  await js(`localStorage.clear();`);
  await b.load(URL + 'index.html#/practice');
  r = await js(`const n = document.querySelectorAll('[name=mode]').length; document.querySelector('.pc-form button[type=submit]').click();
    return { n, msg: document.querySelector('.pc-msg').textContent, h: location.hash, labels: [...document.querySelectorAll('.pc-card .pc-name')].map((x) => x.innerText) };`);
  check('practice center: seven skills to choose from, and nothing starts until a choice is made', r.n === 7 && /Choose a skill first/.test(r.msg) && r.h === '#/practice' &&
    JSON.stringify(r.labels) === JSON.stringify(['Adding Decimals', 'Subtracting Decimals', 'Multiplying Decimals', 'Dividing Decimals', 'Mixed Operations', 'Challenge Mode', 'Practice My Misses']), r);
  await js(`document.getElementById('pc-mode-add').click(); document.querySelector('.pc-form button[type=submit]').click();`);
  r = await js(`const lens = [...document.querySelectorAll('[name=n]')].map((x) => x.value); document.querySelector('.pc-form button[type=submit]').click();
    return { lens, msg: document.querySelector('.pc-msg').textContent, draft: localStorage.getItem('gml:v1:draft:pc-session') };`);
  check('practice center: step 2 offers 10, 25 and 50 questions and needs a choice; no session yet', r.lens.join() === '10,25,50' && /10, 25 or 50/.test(r.msg) && r.draft === null, r);
  const combos = [];
  for (const mode of ['add', 'sub', 'mul', 'div', 'mix', 'misses']) for (const n of [10, 25, 50]) combos.push([mode, n]);
  for (const op of ['add', 'sub', 'mul', 'div', 'mix']) for (const n of [10, 25, 50]) combos.push(['challenge', n, op]);
  let allOk = true; const pcBad = [];
  for (const [mode, n, op] of combos) {
    await pcStart(mode, n, op);
    const d = await pcDraft();
    const ui = await js(`return { h: location.hash, label: (document.querySelector('.mode-label') || {}).innerText || '' };`);
    const ok = d && d.set.length === n && d.mode === mode && ui.h === '#/practice/session' && new RegExp(`Question 1 of ${n}`).test(ui.label) && (!op || d.op === op);
    if (!ok) { allOk = false; pcBad.push({ mode, n, op, d: d && { n: d.n, len: d.set.length, mode: d.mode }, ui }); }
  }
  check(`practice center: all ${combos.length} mode and length choices start the right session (seven modes, 10/25/50, challenge per operation)`, allOk, pcBad);
  // With no history, Practice My Misses explains that and gives a general review.
  await js(`localStorage.clear();`);
  await b.load(URL + 'index.html#/practice');
  await js(`document.getElementById('pc-mode-misses').click(); document.querySelector('.pc-form button[type=submit]').click();`);
  r = await js(`return document.querySelector('.pc-misses').innerText;`);
  check('practice center: Practice My Misses with no history says so and offers a general review', /No misses recorded yet/.test(r) && /general review/.test(r), r);
  // A session: hints, a wrong answer, pause and resume.
  await pcStart('sub', 10);
  r = await js(`${H} const h = document.querySelector('[data-act=hint]'); h.click(); h.click(); h.click();
    const d = JSON.parse(localStorage.getItem('gml:v1:draft:pc-session')); const x = d.set[0]; const q = E.make('pc', x.id, x.seed);
    const host = document.querySelector('.coach-host'); fill(host, q, wrongN(q, 0)); host.querySelector('[data-act=check]').click();
    const gotWrong = !!host.querySelector('.fb-wrong'); fill(host, q, right(q)); host.querySelector('[data-act=check]').click();
    return { hints: document.querySelectorAll('.hint').length, wrong: gotWrong, right: !!host.querySelector('.fb-right'), next: !!host.querySelector('.coach-next button') };`);
  check('practice center: three hints, feedback for a wrong answer, a right answer unlocks Next', r.hints === 3 && r.wrong && r.right && r.next, r);
  await js(`document.querySelector('.coach-next button').click();`);
  await b.load(URL + 'index.html#/');
  r = await js(`return (document.querySelector('.pc-paused') || {}).innerText || '';`);
  check('practice center: a paused session shows on the home page', /question 2 of 10/.test(r) && /Resume/.test(r), r);
  await b.reload();
  await js(`document.querySelector('.pc-paused a').click();`); await b.wait(150);
  r = await js(`return { label: document.querySelector('.mode-label').innerText, first: JSON.parse(localStorage.getItem('gml:v1:draft:pc-session')).states[0] };`);
  check('practice center: resume returns to the same place with the earlier answer kept', /Question 2 of 10/.test(r.label) && r.first.solved === true && r.first.attempts === 1, r);
  // Start New Practice asks first, then clears only this session.
  r = await js(`document.querySelector('.pc-tools [data-act=new]').click(); const asked = !document.querySelector('.pc-new').hidden;
    document.querySelector('.pc-new [data-act=cancel]').click(); const kept = !!localStorage.getItem('gml:v1:draft:pc-session');
    return { asked, kept };`);
  check('practice center: Start New Practice asks for confirmation (No keeps the session)', r.asked && r.kept, r);
  await js(`document.querySelector('.pc-tools [data-act=new]').click(); document.querySelector('.pc-new [data-act=really]').click();`); await b.wait(100);
  check('practice center: confirming Start New Practice clears the session and returns to the wizard', (await pcDraft()) === null && /#\/practice$/.test(await js(`return location.hash;`)));
  // A full 10-question session through to the results, with one solution shown and one hint.
  await pcStart('mix', 10);
  for (let k = 0; k < 10; k++) {
    await js(`${H} const d = JSON.parse(localStorage.getItem('gml:v1:draft:pc-session')); const x = d.set[d.i]; const q = E.make('pc', x.id, x.seed); const host = document.querySelector('.coach-host');
      if (d.i === 0) { for (let j = 0; j < 3; j++) { fill(host, q, wrongN(q, j)); host.querySelector('[data-act=check]').click(); } host.querySelector('[data-act=solution]').click(); }
      else { if (d.i === 1) document.querySelector('[data-act=hint]').click(); fill(host, q, right(q)); host.querySelector('[data-act=check]').click(); }
      document.querySelector('.coach-next button').click();`);
    await b.wait(30);
  }
  await b.wait(150);
  r = await js(`return { h: location.hash, t: document.getElementById('app').innerText, hist: JSON.parse(localStorage.getItem('gml:v1:draft:pc-history')),
    actions: [...document.querySelectorAll('.done-actions .btn')].map((x) => x.innerText.trim()), lesson: (document.querySelector('.done-actions .btn-teach') || {}).getAttribute && document.querySelector('.done-actions .btn-teach').getAttribute('href') };`);
  check('practice center: results report completed, correct, no-hint, with-help, incorrect, hints and skills to review', r.h === '#/practice/results' && /You finished 10 of 10/.test(r.t) && /9\s*correct/.test(r.t) &&
    /8\s*correct on the first try with no hints/.test(r.t) && /1\s*correct with hints/.test(r.t) && /1\s*incorrect/.test(r.t) && /1\s*hints used/.test(r.t) && /Skills needing review/.test(r.t) && /By operation/.test(r.t), r.t.slice(0, 600));
  check('practice center: results offer Practice Again, Practice My Misses, the related lesson and the Practice Center', ['Practice Again', 'Practice My Misses', 'Back to Practice Center'].every((a) => r.actions.includes(a)) && r.actions.some((a) => /Review Related Lesson/.test(a)) && /^#\/d0[6-9]\/teach\/\d+$/.test(r.lesson), r);
  check('practice center: the finished session is saved to the practice history once', r.hist.sessions.length === 1 && r.hist.sessions[0].n === 10 && r.hist.sessions[0].missed === 1, r.hist);
  await b.reload();
  check('practice center: refreshing the results does not record the session twice', (await js(`return JSON.parse(localStorage.getItem('gml:v1:draft:pc-history')).sessions.length;`)) === 1);
  await js(`document.querySelector('[data-act=misses]').click();`); await b.wait(100);
  r = await js(`return (document.querySelector('.pc-misses') || {}).innerText || '';`);
  check('practice center: after a miss, Practice My Misses lists the skill to review', /Skills to review/.test(r) && /Practice Center/.test(r), r);
  // Small screens: no sideways scrolling and big tap targets on the new pages.
  await b.viewport(320, 640);
  for (const [route, label] of [['#/', 'home (320px)'], ['#/learn', 'learn (320px)'], ['#/guides', 'study guides (320px)'], ['#/practice', 'practice wizard (320px)'], ['#/practice/results', 'practice results (320px)']]) {
    await b.load(URL + 'index.html' + route);
    await noOverflow(label); await bigTargets(label);
  }
  await pcStart('div', 10);
  await noOverflow('practice question with a division layout (320px)'); await bigTargets('practice question (320px)');
  await b.viewport(390, 844);

  // ── NumberNova: restart controls and Parent Progress ──
  await js(`localStorage.clear(); localStorage.setItem('gml:v1:progress', JSON.stringify({ lessons: { d02: { teach: { screen: 5, furthest: 9, done: true }, practice: { sessions: 2, skills: {}, recentSigs: [] },
    tests: [{ id: 'old1', date: '2026-10-01T12:00:00Z', correct: 10, total: 10, percent: 100, mastered: true, goalMet: true, skills: {}, missedSkills: [] }], testsTaken: 1, masteredOn: '2026-10-01T12:00:00Z', lastTestSigs: [] } } }));
    localStorage.setItem('gml:v1:draft:teach-d02-check-place', JSON.stringify({ solved: true, fb: { kind: 'correct' }, resp: 'tenths' }));
    localStorage.setItem('gml:v1:draft:teach-d03-check-place', JSON.stringify({ solved: true, fb: { kind: 'correct' } }));
    localStorage.setItem('gml:v1:draft:teach-steps', JSON.stringify({ 'd02:place': 3, 'd02:value': 2, 'd03:place': 4 }));`);
  await b.load(URL + 'index.html#/d02/teach/3');
  r = await js(`document.querySelector('[data-act=restart]').click(); const asked = !document.querySelector('.restart-confirm').hidden;
    document.querySelector('[data-act=restart-yes]').click();
    const p = JSON.parse(localStorage.getItem('gml:v1:progress')).lessons.d02, steps = JSON.parse(localStorage.getItem('gml:v1:draft:teach-steps'));
    return { asked, h: location.hash, check: localStorage.getItem('gml:v1:draft:teach-d02-check-place'), other: !!localStorage.getItem('gml:v1:draft:teach-d03-check-place'), steps, teach: p.teach, tests: p.tests.length, mastered: p.masteredOn, sessions: p.practice.sessions };`);
  await b.wait(100);
  check('restart: Start Lesson Over asks first, then clears only this lesson\'s guided answers and revealed steps', r.asked && r.check === null && r.other && !r.steps['d02:place'] && !r.steps['d02:value'] && r.steps['d03:place'] === 4, r);
  check('restart: Start Lesson Over keeps tests, mastery, practice and "Teach finished", and goes to screen 1', r.tests === 1 && !!r.mastered && r.sessions === 2 && r.teach.done === true && r.teach.furthest === 0 && /teach\/1$/.test(await js(`return location.hash;`)), r);
  await b.load(URL + 'index.html#/d02/practice'); await b.reload();
  r = await js(`${H} const q = qIn('practice', 'd02'); const host = document.querySelector('.coach-host'); fill(host, q, wrongN(q, 0)); host.querySelector('[data-act=check]').click();
    const before = JSON.parse(localStorage.getItem('gml:v1:draft:practice-d02')).id;
    document.querySelector('.pc-tools [data-act=restart]').click(); const asked = !document.querySelector('.restart-confirm').hidden;
    document.querySelector('[data-act=restart-no]').click(); const kept = JSON.parse(localStorage.getItem('gml:v1:draft:practice-d02')).id === before;
    document.querySelector('.pc-tools [data-act=restart]').click(); document.querySelector('[data-act=restart-yes]').click();
    const d = JSON.parse(localStorage.getItem('gml:v1:draft:practice-d02'));
    return { asked, kept, fresh: d.id !== before && d.i === 0 && d.states.every((s) => !s.attempts), sessions: JSON.parse(localStorage.getItem('gml:v1:progress')).lessons.d02.practice.sessions };`);
  check('restart: lesson Start New Practice asks before discarding answers, then starts a fresh session (finished sessions kept)', r.asked && r.kept && r.fresh && r.sessions === 2, r);
  await b.load(URL + 'index.html#/d02/test'); await b.reload();
  await js(`document.querySelector('[data-act=start]').click();`);
  await js(setAll('d02', 'right(q)')); await b.reload();
  await js(`document.querySelector('[data-act=submit]').click();`); await b.wait(60);
  r = await js(`const btn = document.querySelector('[data-act=new]'); const label = btn.innerText; btn.click();
    const p = JSON.parse(localStorage.getItem('gml:v1:progress')).lessons.d02; return { label, tests: p.tests.length, mastered: p.masteredOn, intro: !!document.querySelector('[data-act=start]') };`);
  check('restart: Retake Test keeps earlier results and mastery and starts a new test', /Retake Test/.test(r.label) && r.tests === 2 && r.mastered === '2026-10-01T12:00:00Z' && r.intro, r);
  // Parent Progress: Practice Center activity is shown separately from Tests and mastery.
  await pcStart('add', 10);
  for (let k = 0; k < 10; k++) await js(`${H} const d = JSON.parse(localStorage.getItem('gml:v1:draft:pc-session')); const x = d.set[d.i]; const q = E.make('pc', x.id, x.seed); const host = document.querySelector('.coach-host');
    if (d.i === 3) { fill(host, q, wrongN(q, 0)); host.querySelector('[data-act=check]').click(); } fill(host, q, right(q)); host.querySelector('[data-act=check]').click(); document.querySelector('.coach-next button').click();`);
  await b.wait(150);
  await b.load(URL + 'index.html#/parent');
  r = await js(`const sec = document.querySelector('.parent-practice'); return { t: sec ? sec.innerText : '', rows: sec ? sec.querySelectorAll('tbody tr').length : 0, d02: document.querySelector('#pl-d02').closest('section').innerText, rules: document.querySelector('#rules-h').closest('section').innerText };`);
  check('parent: Practice Center section shows sessions, questions, accuracy, hints, recent practice and skills to review', /never counts as a Test/.test(r.t) && /Sessions finished\s*1/.test(r.t) && /Questions answered\s*10/.test(r.t) && /Correct\s*10 of 10/.test(r.t) && r.rows === 1 && /Skills to review/.test(r.t), r.t.slice(0, 400));
  check('parent: Practice Center results do not change lesson tests or mastery', /Tests taken\s*2/.test(r.d02) && /Yes ★/.test(r.d02) && /Practice Center/.test(r.rules), r.d02.slice(0, 300));
  // Opening the Practice Center during an unfinished lesson Test is noted on that Test.
  await b.load(URL + 'index.html#/d05/test'); await b.reload();
  await js(`document.querySelector('[data-act=start]').click();`);
  await b.load(URL + 'index.html#/practice'); await b.load(URL + 'index.html#/guides'); await b.load(URL + 'index.html#/d05/test');
  r = await js(`return JSON.parse(localStorage.getItem('gml:v1:draft:test-d05')).assist;`);
  check('integrity: opening the Practice Center or Study Guides during a lesson Test is noted on it', r.includes('the Practice Center') && r.includes('the Study Guides'), r);

  // ── NumberNova review regressions ──
  await js(`localStorage.setItem('gml:v1:draft:pc-history', JSON.stringify({ sessions: [{ n: 10, completed: 'abc', clean: 'x' }], skills: { 'add.basic': null, 'sub.basic': { r: 'xx' } } }));`);
  await b.load(URL + 'index.html#/parent');
  r = await js(`return document.getElementById('app').innerText;`);
  check('review: damaged practice history does not break Parent Progress (no NaN or junk)', !/Something went wrong|NaN|abc/.test(r) && /Practice Center/.test(r), r.slice(0, 200));
  await b.load(URL + 'index.html#/practice'); await b.reload();
  await js(`document.getElementById('pc-mode-misses').click(); document.querySelector('.pc-form button[type=submit]').click();`);
  check('review: damaged practice history does not break Practice My Misses', /Step 2 of 3/.test(await js(`return document.getElementById('app').innerText;`)));
  // A stale tab never writes its old session over a newer one.
  await pcStart('add', 10);
  r = await js(`const d = JSON.parse(localStorage.getItem('gml:v1:draft:pc-session')); const other = Object.assign({}, d, { id: 'newer-tab' }); localStorage.setItem('gml:v1:draft:pc-session', JSON.stringify(other));
    document.querySelector('[data-act=hint]').click(); return JSON.parse(localStorage.getItem('gml:v1:draft:pc-session')).id;`);
  check('review: a stale Practice Center tab does not overwrite a newer session', r === 'newer-tab', r);
  // The phone menu closes after choosing the current page, and unknown lesson routes highlight Home.
  await b.viewport(390, 844);
  await b.load(URL + 'index.html#/learn');
  r = await js(`document.querySelector('.nav-toggle').click(); const open = document.querySelector('.nav-toggle').getAttribute('aria-expanded');
    document.querySelector('.site-nav a[data-nav=learn]').click(); return { open, after: document.querySelector('.nav-toggle').getAttribute('aria-expanded') };`);
  check('review: the phone menu closes after tapping the current page', r.open === 'true' && r.after === 'false', r);
  await b.load(URL + 'index.html#/d11/teach/1');
  check('review: an unknown lesson route shows Home and highlights Home', (await js(`return document.querySelector('.site-nav a[aria-current]').dataset.nav;`)) === 'home');

  // ── Unknown routes and reset ──
  await b.load(URL + 'index.html#/d11/teach/1');
  check('unready lesson route falls back to home', /Ready to make your next math discovery/.test(await js(`return document.querySelector('h1').innerText;`)));
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
