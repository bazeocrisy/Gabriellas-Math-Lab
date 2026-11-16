// One subject: its divider header, this week (topics, homework, vocabulary), tests, units, then
// Learn / Practice / Study guides / Tests, which say "coming soon" until there is material.
import { html } from '../lib/html.js';
import { icon } from '../icons.js';
import { daysBetween, weekLabel, countdown } from '../lib/dates.js';
import { assessmentItem, empty, soon, homeworkItem, weekPicker, crumbs, problemsNote } from './parts.js';
import { MATH_APP, meter } from './math-links.js';

const SECTIONS = [
  { key: 'learn', title: 'Learn', icon: 'book' },
  { key: 'practice', title: 'Practice', icon: 'play' },
  { key: 'guides', title: 'Study guides', icon: 'guide' },
  { key: 'tests', title: 'Tests', icon: 'test' },
];

// What the math app already offers in each section (always shown on the Math page).
const MATH_SECTIONS = {
  learn: [MATH_APP[0], MATH_APP[1]],
  practice: [MATH_APP[2]],
  guides: [MATH_APP[3]],
  tests: [
    { href: 'math/index.html#/learn', title: 'Decimal lesson tests', text: 'Each decimal lesson ends with its own test.' },
    { href: 'math/index.html#/chapter4', title: 'Chapter 4 review and final', text: 'A review and a final assessment for Chapter 4.' },
  ],
};

const STATUS = { current: 'Now', done: 'Finished', upcoming: 'Coming up' };

function mathFeature(m) {
  return html`<section class="feature s-math" aria-labelledby="app-h">
    <div class="feature-head">
      <h2 id="app-h">Math practice</h2>
      <p>Lessons, practice and tests you can do right here. Progress is saved on this device.</p>
      ${m.any ? html`<div class="meters">${meter(m.decimals.mastered, m.decimals.total, 'Decimal lessons mastered')}${meter(m.chapter4.started, m.chapter4.total, 'Chapter 4 lessons started')}</div>`
        : html`<p class="small">No practice saved on this device yet. Decimal Skills Lesson 1 is a good place to start.</p>`}
      <p class="small"><a href="${MATH_APP[4].href}">Parent Progress</a> shows lesson-by-lesson results for grown-ups.</p>
    </div>
    <ul class="app-links">${MATH_APP.slice(0, 4).map((l) => html`<li><a href="${l.href}">${icon(l.icon)}<span><b>${l.title}</b><span>${l.text}</span></span></a></li>`)}</ul>
  </section>`;
}

export function subjectView(ctx, s, { monday, week, problems, upcoming }) {
  const b = week.subjects[s.id];
  const unit = b.unit || s.currentUnit;
  const base = `#/${s.id}`;
  const isThis = monday === ctx.thisWeek;
  const tests = upcoming.filter((x) => x.s.id === s.id && daysBetween(ctx.now, x.a.date) >= 0);
  const nHw = b.homework.length, nT = b.assessments.length;
  const dueText = nHw || nT ? [nHw && `${nHw} homework`, nT && `${nT} ${nT === 1 ? 'test' : 'tests'}`].filter(Boolean).join(', ') : html`<span class="muted">Nothing yet</span>`;

  return html`<div class="subject-page s-${s.id}">
  ${crumbs([{ href: '#/', label: 'Home' }, { label: s.name }])}
  <header class="subject-head s-${s.id}">
    <span class="divider-tab big">${icon(s.id)}</span>
    <div>
      <h1 tabindex="-1">${s.name}</h1>
      ${s.longName ? html`<p class="long">${s.longName}</p>` : ''}
      <p class="role">${s.role}</p>
    </div>
    <dl class="head-facts">
      <div><dt>Unit</dt><dd>${unit || html`<span class="muted">Not posted yet</span>`}</dd></div>
      <div><dt>Due ${isThis ? 'this week' : 'that week'}</dt><dd>${dueText}</dd></div>
      <div><dt>Next test</dt><dd>${tests.length ? html`${tests[0].a.title} <span class="muted">(${countdown(tests[0].a.date, ctx.now).toLowerCase()})</span>` : html`<span class="muted">None posted</span>`}</dd></div>
    </dl>
  </header>
  ${problemsNote(problems)}

  ${s.id === 'math' ? mathFeature(ctx.math) : ''}

  <div class="subject-grid">
    <section class="panel" aria-labelledby="wk-h">
      <div class="panel-head"><h2 id="wk-h">${icon('week')} ${isThis ? 'This week' : weekLabel(monday)}</h2></div>
      ${weekPicker(base, monday, ctx)}
      <h3 class="sub-h">Topics</h3>
      ${b.topics.length ? html`<ul class="topics">${b.topics.map((t) => html`<li><b>${t.title}</b>${t.detail ? html`<span class="muted detail">${t.detail}</span>` : ''}</li>`)}</ul>`
        : html`<p class="muted small">No topics posted for this week.</p>`}
      <h3 class="sub-h">Homework</h3>
      ${b.homework.length ? html`<ul class="hw-list">${b.homework.map((h) => homeworkItem(h, s, monday))}</ul>`
        : html`<p class="muted small">No homework posted for this week.</p>`}
      ${b.notes ? html`<p class="note">${b.notes}</p>` : ''}
    </section>

    <div class="stack">
      <section class="panel" aria-labelledby="tests-h">
        <h2 id="tests-h">${icon('test')} Upcoming tests</h2>
        ${tests.length ? html`<ul class="assess-list">${tests.map((x) => assessmentItem(x.a, x.s, ctx.now, { showSubject: false }))}</ul>`
          : empty('No tests or quizzes posted', 'When one is scheduled, you’ll see it here with a countdown.')}
      </section>
      <section class="panel" aria-labelledby="units-h">
        <h2 id="units-h">${icon('guide')} Units</h2>
        ${s.units.length ? html`<ol class="units">${s.units.map((u) => html`<li class="${u.status ? 'u-' + u.status : ''}">
            ${u.href ? html`<a href="${u.href}">${u.title}</a>` : html`<span>${u.title}</span>`}
            ${u.dates ? html`<span class="muted small">${u.dates}</span>` : ''}
            ${u.status ? html`<span class="tag">${STATUS[u.status]}</span>` : ''}</li>`)}</ol>`
          : html`<p class="muted small">The ${s.role}'s units for the year will be listed here.</p>`}
      </section>
    </div>
  </div>

  <section class="panel" aria-labelledby="vocab-h">
    <h2 id="vocab-h">${icon('book')} Vocabulary</h2>
    ${b.vocabulary.length ? html`<ul class="vocab">${b.vocabulary.map((v) => html`<li class="vcard s-${s.id}"><p class="term">${v.term}</p>${v.meaning ? html`<p>${v.meaning}</p>` : ''}${v.example ? html`<p class="ex">${v.example}</p>` : ''}</li>`)}</ul>`
      : empty('No vocabulary words yet', 'New words for this week will show up here as cards.')}
  </section>

  <section class="panel" aria-labelledby="mat-h">
  <h2 id="mat-h">${icon('sparkle')} Study materials</h2>
  <div class="sections">${SECTIONS.map((sec) => {
    const own = b.resources[sec.key];
    const app = s.id === 'math' ? MATH_SECTIONS[sec.key] : [];
    return html`<section class="sec" aria-labelledby="sec-${sec.key}">
      <h3 id="sec-${sec.key}">${icon(sec.icon)} ${sec.title}</h3>
      ${own.length || app.length ? html`<ul class="res">
          ${app.map((r) => html`<li><a href="${r.href}"><b>${r.title}</b><span>${r.text}</span></a></li>`)}
          ${own.map((r) => html`<li><a href="${r.href}"><b>${r.title}</b>${r.detail ? html`<span>${r.detail}</span>` : ''}</a></li>`)}
        </ul>` : soon(s)}
    </section>`;
  })}</div>
  </section>
  </div>`;
}
