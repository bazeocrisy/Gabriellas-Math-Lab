// Home: greeting, the week as a row of stars, what's coming up, and the four subject dividers.
import { html } from '../lib/html.js';
import { icon } from '../icons.js';
import { longDate, weekdayShort, weekdayName, dayNum, monthDay, daysBetween } from '../lib/dates.js';
import { checks } from '../lib/store.js';
import { collect, assessmentItem, empty, subjectChip, days, KIND } from './parts.js';
import { mathCardExtra } from './math-links.js';

// Star heights (px from the top of the sky strip) for Monday..Friday: a gentle, uneven line like a constellation.
const SKY_Y = [40, 18, 34, 12, 28];

function sky(ctx, week, all) {
  const list = days(ctx.thisWeek);
  const info = list.map((d) => ({
    d,
    tests: all.assessments.filter((x) => x.a.date === d),
    due: all.homework.filter((x) => x.h.due === d && x.week === ctx.thisWeek),
  }));
  const pts = list.map((_, i) => `${10 + i * 20},${SKY_Y[i]}`).join(' ');
  return html`<ol class="sky" aria-label="This week, day by day">
    <svg class="sky-lines" viewBox="0 0 100 56" preserveAspectRatio="none" aria-hidden="true" focusable="false"><polyline points="${pts}"/></svg>
    ${info.map(({ d, tests, due }, i) => {
      const rel = daysBetween(ctx.now, d);
      const state = rel === 0 ? 'today' : rel < 0 ? 'past' : 'future';
      const bits = [];
      if (tests.length) bits.push(tests.length === 1 ? KIND[tests[0].a.kind] : `${tests.length} tests`);
      if (due.length) bits.push(`${due.length} due`);
      const said = [state === 'today' ? 'today' : '', ...bits.map((b) => b.toLowerCase())].filter(Boolean).join(', ');
      return html`<li class="sky-day ${state}${tests.length ? ' has-test' : ''} y${i}">
        <span class="sky-star" aria-hidden="true">${icon('sparkle', 'ico')}</span>
        <span class="sky-name" aria-hidden="true"><abbr>${weekdayShort(d)}</abbr><b>${dayNum(d)}</b></span>
        <span class="sky-note" aria-hidden="true">${state === 'today' ? html`<b>Today</b>` : ''}${bits.length ? html`<span>${bits.join(', ')}</span>` : ''}</span>
        <span class="sr-only">${weekdayName(d)}, ${monthDay(d)}${said ? `: ${said}` : ''}</span>
      </li>`;
    })}
  </ol>`;
}

export function homeView(ctx, { week, nextWeek }) {
  const all = collect([week, nextWeek], ctx.subjects);
  const upcoming = all.assessments.filter((x) => daysBetween(ctx.now, x.a.date) >= 0).slice(0, 5);
  const ticks = checks(ctx.thisWeek);
  const due = all.homework.filter((x) => x.week === ctx.thisWeek);
  const open = due.filter((x) => !ticks[`${x.s.id}:${x.h.id}`]);

  return html`
  <section class="hero" aria-labelledby="hello">
    <div class="hero-text">
      <h1 id="hello" tabindex="-1">Welcome back</h1>
      <p class="hero-date">${longDate(ctx.now)}</p>
      <p class="hero-sum">${upcoming.length
        ? html`Next up: <b>${upcoming[0].s.name} ${KIND[upcoming[0].a.kind].toLowerCase()}</b>, ${upcoming[0].a.date === ctx.now ? 'today' : `in ${daysBetween(ctx.now, upcoming[0].a.date)} day${daysBetween(ctx.now, upcoming[0].a.date) === 1 ? '' : 's'}`}.`
        : 'No tests on the calendar yet.'} ${open.length ? `${open.length} homework ${open.length === 1 ? 'item' : 'items'} left this week.` : ''}</p>
    </div>
    ${sky(ctx, week, all)}
  </section>

  <div class="glance">
    <section class="panel" aria-labelledby="up-h">
      <div class="panel-head"><h2 id="up-h">${icon('test')} Coming up</h2><a class="more" href="#/week">This week</a></div>
      ${upcoming.length ? html`<ul class="assess-list compact">${upcoming.map((x) => assessmentItem(x.a, x.s, ctx.now))}</ul>`
        : empty('No tests or quizzes posted', 'Check your planner. Tests show up here with a countdown once they are added.')}
    </section>
    <section class="panel" aria-labelledby="hw-h">
      <div class="panel-head"><h2 id="hw-h">${icon('pencil')} Homework</h2><a class="more" href="#/week">Checklist</a></div>
      ${due.length ? html`<ul class="due-list">${due.map((x) => {
          const done = !!ticks[`${x.s.id}:${x.h.id}`];
          return html`<li class="${done ? 'done' : ''}">${subjectChip(x.s)}<span class="due-title">${x.h.title}</span>
            <span class="due-when">${done ? html`${icon('check')} Done` : x.h.due ? `${weekdayShort(x.h.due)} ${monthDay(x.h.due)}` : 'This week'}</span></li>`;
        })}</ul>`
        : empty('No homework posted this week', 'Check your planner or ask your teacher. Homework shows up here once it is added.')}
    </section>
  </div>

  <section class="subjects" aria-labelledby="sub-h">
    <h2 id="sub-h">Subjects</h2>
    <ul class="dividers">${ctx.subjects.map((s) => {
      const b = week.subjects[s.id];
      const unit = b.unit || s.currentUnit;
      const nTests = all.assessments.filter((x) => x.s.id === s.id && x.week === ctx.thisWeek).length;
      const nHw = b.homework.length;
      const dueText = nTests || nHw ? [nHw && `${nHw} homework`, nTests && `${nTests} ${nTests === 1 ? 'test' : 'tests'}`].filter(Boolean).join(', ') : 'Nothing due yet';
      return html`<li class="divider s-${s.id}">
        <span class="divider-tab">${icon(s.id)}<span class="sr-only">${s.name}</span></span>
        <div class="divider-body">
          <h3><a class="stretch" href="#/${s.id}">${s.name}</a></h3>
          <p class="role">${s.role}</p>
          <dl class="facts">
            <div><dt>Unit</dt><dd>${unit || html`<span class="muted">Not posted yet</span>`}</dd></div>
            <div><dt>This week</dt><dd>${dueText}</dd></div>
          </dl>
          ${s.id === 'math' ? mathCardExtra(ctx.math) : ''}
        </div>
      </li>`;
    })}</ul>
  </section>`;
}
