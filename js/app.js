// StudyNova hub: hash routes over static JSON. No accounts, no network calls beyond this site's own files.
// Routes: #/  #/week[/YYYY-MM-DD]  #/math|ela|social-studies|science[/YYYY-MM-DD]  #/parent
import { html } from './lib/html.js';
import { icon } from './icons.js';
import { today, mondayOf, addDays, isISO, parseISO } from './lib/dates.js';
import { loadJSON, loadWeek, normaliseIndex, normaliseSubjects, SUBJECT_IDS, LoadError } from './lib/data.js';
import { setCheck, resetHub } from './lib/store.js';
import { mathProgress } from './lib/math-progress.js';
import { collect } from './views/parts.js';
import { homeView } from './views/home.js';
import { weekView } from './views/week.js';
import { subjectView } from './views/subject.js';
import { parentView } from './views/parent.js';

const main = document.getElementById('main');
const live = document.getElementById('live');
let ctx = null;
let renders = 0;
let first = true;

export function parseRoute(hash) {
  const parts = String(hash || '').replace(/^#\/?/, '').split('/').filter(Boolean);
  const [page = '', arg] = parts;
  if (parts.length > 2) return { page: 'missing' };
  if (page === '') return parts.length ? { page: 'missing' } : { page: 'home' };
  if (page === 'week' || SUBJECT_IDS.includes(page)) {
    if (arg !== undefined && !isISO(arg)) return { page: 'missing' };
    return { page, week: arg ? mondayOf(arg) : null };
  }
  if (page === 'parent' && !arg) return { page };
  return { page: 'missing' };
}

/** The week a student cares about: this Monday, or next Monday on a weekend. */
function studentWeek(now) {
  const dow = parseISO(now).getDay();
  return mondayOf(dow === 0 || dow === 6 ? addDays(now, 2) : now);
}

async function boot() {
  const [subjectsRaw, indexRaw] = await Promise.all([loadJSON('data/subjects.json'), loadJSON('data/weeks/index.json')]);
  const { subjects } = normaliseSubjects(subjectsRaw);
  const index = normaliseIndex(indexRaw);
  const now = today();
  ctx = { subjects, index, now, thisWeek: studentWeek(now), math: mathProgress() };
}

/** Weeks to look in for upcoming tests: the shown week and the one after it. */
async function upcomingFrom(monday) {
  const [a, b] = await Promise.all([loadWeek(ctx.index, monday), loadWeek(ctx.index, addDays(monday, 7)).catch(() => null)]);
  return { a, b, list: collect([a.week, b?.week], ctx.subjects).assessments };
}

const TITLES = { home: 'Home', week: 'This week', parent: 'For grown-ups', missing: 'Page not found' };

async function render() {
  const n = ++renders;
  const route = parseRoute(location.hash.startsWith('#/') ? location.hash : '');
  let view;
  try {
    if (!ctx) await boot();
    ctx.math = mathProgress(); // re-read: math may have been practised in another tab
    if (route.page === 'home') {
      const { a, b } = await upcomingFrom(ctx.thisWeek);
      view = homeView(ctx, { week: a.week, nextWeek: b?.week });
    } else if (route.page === 'week') {
      const monday = route.week || ctx.thisWeek;
      const w = await loadWeek(ctx.index, monday);
      view = weekView(ctx, { monday, ...w });
    } else if (SUBJECT_IDS.includes(route.page)) {
      const monday = route.week || ctx.thisWeek;
      const { a, list } = await upcomingFrom(monday);
      const s = ctx.subjects.find((x) => x.id === route.page);
      view = subjectView(ctx, s, { monday, week: a.week, problems: a.problems, upcoming: list });
    } else if (route.page === 'parent') {
      const { a, list } = await upcomingFrom(ctx.thisWeek);
      view = parentView(ctx, { week: a.week, upcoming: list });
    } else {
      view = html`<h1 tabindex="-1">Page not found</h1><div class="panel"><p>There's no page at this address.</p>
        <p class="links"><a class="btn" href="#/">${icon('home')}Home</a><a class="btn" href="#/week">${icon('week')}This week</a></p></div>`;
    }
  } catch (e) {
    console.error(e);
    view = problem(e);
  }
  if (n !== renders) return;
  main.innerHTML = view.s;
  const subj = ctx?.subjects.find((x) => x.id === route.page);
  document.title = `${subj ? subj.name : TITLES[route.page] || 'StudyNova'} | StudyNova`;
  document.body.dataset.page = SUBJECT_IDS.includes(route.page) ? 'subject' : route.page;
  markNav(route.page);
  if (!first) {
    window.scrollTo(0, 0);
    main.querySelector('h1')?.focus({ preventScroll: true });
  }
  first = false;
}

function problem(e) {
  const known = e instanceof LoadError;
  return html`<h1 tabindex="-1">This page couldn't load</h1>
    <div class="panel problem" role="alert">
      <p><b>${known ? e.message : 'Something went wrong while building this page.'}</b></p>
      <p>${known ? e.detail : 'Reloading usually fixes it.'}</p>
      <p class="links"><button type="button" class="btn" data-action="retry">${icon('reset')}Try again</button>
        <a class="btn btn-quiet" href="math/index.html">${icon('math')}Open Math practice</a></p>
      <p class="small muted">Math practice works even when the weekly plans can't load.</p>
    </div>`;
}

function markNav(page) {
  document.querySelectorAll('.site-nav a').forEach((a) => {
    if (a.dataset.nav === page) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
}

function say(msg) {
  live.textContent = '';
  setTimeout(() => { live.textContent = msg; }, 30);
}

// Homework ticks (This Week and subject pages).
main.addEventListener('change', (e) => {
  const box = e.target.closest('input[type="checkbox"][data-key]');
  if (!box) return;
  const { week, key } = box.dataset;
  setCheck(week, key, box.checked);
  box.closest('.hw')?.classList.toggle('done', box.checked);
  const sid = key.split(':')[0];
  const tally = main.querySelector(`[data-tally="${CSS.escape(sid)}"]`);
  if (tally) {
    const group = tally.closest('.check-group');
    const all = group.querySelectorAll('input[data-key]');
    const n = [...all].filter((x) => x.checked).length;
    tally.textContent = `${n} of ${all.length} done`;
  }
  const title = box.closest('.hw')?.querySelector('.hw-title')?.textContent || 'Homework';
  say(`${title}: ${box.checked ? 'marked done' : 'not done'}`);
});

main.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const act = btn.dataset.action;
  const box = btn.closest('[data-reset]');
  if (act === 'print') window.print();
  else if (act === 'retry') { ctx = null; render(); }
  else if (act === 'reset-ask') { box.querySelector('.confirm').hidden = false; btn.hidden = true; box.querySelector('[data-action="reset-yes"]').focus(); }
  else if (act === 'reset-no') { box.querySelector('.confirm').hidden = true; const ask = box.querySelector('[data-action="reset-ask"]'); ask.hidden = false; ask.focus(); }
  else if (act === 'reset-yes') {
    const n = resetHub();
    render().then(() => say(`Cleared ${n} saved ${n === 1 ? 'item' : 'items'}. Math progress was kept.`));
  }
});

// Small screens: the subject links fold into a Menu button.
const toggle = document.querySelector('.nav-toggle');
const header = document.querySelector('.site-header');
function setMenu(open) { toggle.setAttribute('aria-expanded', String(open)); header.classList.toggle('nav-open', open); }
toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
document.querySelectorAll('.site-nav a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); } });

// Only "#/..." addresses are pages. Any other fragment (like the skip link's "#main") is left alone.
window.addEventListener('hashchange', () => { if (!location.hash || location.hash.startsWith('#/')) render(); });
document.querySelector('.skip')?.addEventListener('click', (e) => { e.preventDefault(); main.focus(); main.scrollIntoView(); });
window.addEventListener('storage', (e) => { if (e.key && (e.key.startsWith('gml:') || e.key.startsWith('sn:'))) render(); });
render();
