// This Week: every subject together for one week. Day by day, then a homework checklist per subject.
import { html } from '../lib/html.js';
import { icon } from '../icons.js';
import { weekdayName, monthDay, daysBetween, weekLabel } from '../lib/dates.js';
import { checks } from '../lib/store.js';
import { collect, empty, subjectChip, days, KIND, homeworkItem, weekPicker, weekIsEmpty, problemsNote, crumbs, countdownBadge } from './parts.js';

export function weekView(ctx, { monday, week, posted, problems }) {
  const all = collect([week], ctx.subjects);
  const blank = weekIsEmpty(week);
  const title = ctx.index.weeks.find((w) => w.id === monday)?.label || week.label || weekLabel(monday);
  const undated = all.homework.filter((x) => !x.h.due || !days(monday).includes(x.h.due));
  const offDay = all.assessments.filter((x) => !days(monday).includes(x.a.date));

  const head = html`
    ${crumbs([{ href: '#/', label: 'Home' }, { label: 'This week' }])}
    <header class="page-head">
      <div><h1 tabindex="-1">This week</h1><p class="lede">${title}. All four subjects in one place.</p></div>
      <div class="head-tools">${weekPicker('#/week', monday, ctx)}
        <button type="button" class="btn btn-quiet" data-action="print">${icon('print')}Print</button></div>
    </header>
    <p class="print-only">StudyNova: ${title}</p>
    ${problemsNote(problems)}`;

  if (blank) {
    return html`${head}
      <section class="panel">${empty(posted ? 'Nothing has been added to this week yet' : 'Nothing posted for this week',
        'When the teachers’ plans are added, homework, tests and quizzes will show up here, sorted by day.',
        html`<p class="links">${ctx.subjects.map((s) => html`<a class="btn btn-small s-${s.id}" href="#/${s.id}">${icon(s.id)}${s.name}</a>`)}</p>`)}</section>`;
  }

  const ticks = checks(monday);
  const dayRows = days(monday).map((d) => {
    const tests = all.assessments.filter((x) => x.a.date === d);
    const due = all.homework.filter((x) => x.h.due === d);
    const ev = week.events.filter((e) => e.date === d);
    const rel = daysBetween(ctx.now, d);
    return html`<li class="day${rel === 0 ? ' is-today' : ''}${rel < 0 ? ' is-past' : ''}">
      <h3 class="day-name">${weekdayName(d)} <span>${monthDay(d)}</span>${rel === 0 ? html` <em class="tag">Today</em>` : ''}</h3>
      ${tests.length || due.length || ev.length ? html`<ul class="day-items">
        ${ev.map((e) => html`<li class="ev">${icon('info')}<span>${e.text}</span></li>`)}
        ${tests.map((x) => html`<li class="it it-test s-${x.s.id}">${icon('test')}<span><b>${KIND[x.a.kind]}:</b> ${x.a.title}</span>${subjectChip(x.s)}${countdownBadge(d, ctx.now)}</li>`)}
        ${due.map((x) => html`<li class="it${ticks[`${x.s.id}:${x.h.id}`] ? ' done' : ''}">${icon('pencil')}<span><b>Due:</b> ${x.h.title}</span>${subjectChip(x.s)}</li>`)}
      </ul>` : html`<p class="muted small">Nothing due.</p>`}
    </li>`;
  });

  return html`${head}
  <div class="week-grid">
    <section class="panel" aria-labelledby="days-h">
      <h2 id="days-h">${icon('week')} Day by day</h2>
      <ol class="days">${dayRows}</ol>
      ${undated.length || offDay.length || week.events.some((e) => !e.date) ? html`<h3 class="sub-h">Also this week</h3><ul class="day-items">
        ${week.events.filter((e) => !e.date).map((e) => html`<li class="ev">${icon('info')}<span>${e.text}</span></li>`)}
        ${offDay.map((x) => html`<li class="it it-test">${icon('test')}<span><b>${KIND[x.a.kind]}:</b> ${x.a.title} (${monthDay(x.a.date)})</span>${subjectChip(x.s)}</li>`)}
        ${undated.map((x) => html`<li class="it">${icon('pencil')}<span>${x.h.title}${x.h.due ? ` (due ${monthDay(x.h.due)})` : ''}</span>${subjectChip(x.s)}</li>`)}
      </ul>` : ''}
      ${week.notes ? html`<p class="note">${week.notes}</p>` : ''}
    </section>

    <section class="panel" aria-labelledby="check-h">
      <h2 id="check-h">${icon('check')} Homework checklist</h2>
      <p class="small muted">Tick things off as you finish. Saved on this device only.</p>
      ${ctx.subjects.map((s) => {
        const hw = week.subjects[s.id].homework;
        const n = hw.filter((h) => ticks[`${s.id}:${h.id}`]).length;
        return html`<div class="check-group s-${s.id}">
          <h3>${subjectChip(s)}${hw.length ? html`<span class="tally" data-tally="${s.id}">${n} of ${hw.length} done</span>` : ''}</h3>
          ${hw.length ? html`<ul class="hw-list">${hw.map((h) => homeworkItem(h, s, monday))}</ul>` : html`<p class="muted small">No homework posted.</p>`}
        </div>`;
      })}
    </section>
  </div>

  <section class="panel learning" aria-labelledby="learn-h">
    <h2 id="learn-h">${icon('book')} What we're learning</h2>
    <div class="learn-grid">${ctx.subjects.map((s) => {
      const b = week.subjects[s.id];
      return html`<div class="learn-col s-${s.id}"><h3><a href="#/${s.id}/${monday}">${subjectChip(s)}</a></h3>
        ${b.unit ? html`<p class="unit">${b.unit}</p>` : ''}
        ${b.topics.length ? html`<ul>${b.topics.map((t) => html`<li>${t.title}${t.detail ? html`<span class="muted detail">${t.detail}</span>` : ''}</li>`)}</ul>` : html`<p class="muted small">No topics posted.</p>`}
      </div>`;
    })}</div>
  </section>`;
}
