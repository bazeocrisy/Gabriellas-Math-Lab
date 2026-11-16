// Pieces shared by the hub's pages.
import { html } from '../lib/html.js';
import { icon } from '../icons.js';
import { countdown, daysBetween, longDate, weekdayShort, monthDay, addDays, weekLabel, schoolDays } from '../lib/dates.js';
import { checks } from '../lib/store.js';

export const KIND = { test: 'Test', quiz: 'Quiz', project: 'Project due', benchmark: 'Benchmark' };
export const subjectHref = (id) => `#/${id}`;

/** A subject's name with its icon, in its colour. Colour is never the only signal: the name is always written. */
export const subjectChip = (s) => html`<span class="chip s-${s.id}">${icon(s.id)}<span>${s.name}</span></span>`;

export function crumbs(items) {
  return html`<nav class="crumbs" aria-label="Breadcrumb"><ol>${items.map((it, i) => i === items.length - 1
    ? html`<li><span aria-current="page">${it.label}</span></li>`
    : html`<li><a href="${it.href}">${it.label}</a></li>`)}</ol></nav>`;
}

/** An empty state: says what will appear here and what to do meanwhile. */
export function empty(title, text, extra = '') {
  return html`<div class="empty">${icon('sparkle', 'ico empty-ico')}<div><p class="empty-title">${title}</p><p>${text}</p>${extra}</div></div>`;
}

/** A section with no material yet. */
export function soon(subject) {
  return html`<div class="soon">
    <svg class="soon-art" viewBox="0 0 64 40" aria-hidden="true" focusable="false"><path class="orbit" d="M6 26c8-12 44-20 52-8"/><circle class="planet" cx="22" cy="22" r="9"/><path class="spark" d="M50 6l1.4 3.6L55 11l-3.6 1.4L50 16l-1.4-3.6L45 11l3.6-1.4z"/></svg>
    <p><b>Coming soon.</b> This fills in when the ${subject.role}'s material is ready.</p>
  </div>`;
}

export function countdownBadge(date, now) {
  const n = daysBetween(now, date);
  const cls = n < 0 ? 'past' : n === 0 ? 'today' : n <= 2 ? 'soon' : 'later';
  return html`<span class="count count-${cls}">${countdown(date, now)}</span>`;
}

export function assessmentItem(a, s, now, { showSubject = true } = {}) {
  return html`<li class="assess s-${s.id}">
    <div class="assess-date" aria-hidden="true"><span>${weekdayShort(a.date)}</span><b>${monthDay(a.date).split(' ')[1]}</b></div>
    <div class="assess-body">
      ${countdownBadge(a.date, now)}
      <p class="assess-title">${a.title}</p>
      <p class="meta">${showSubject ? html`${subjectChip(s)} ` : ''}<span>${KIND[a.kind]} on ${longDate(a.date)}</span></p>
      ${a.covers ? html`<p class="covers">Covers: ${a.covers}</p>` : ''}
      ${a.studyTips.length ? html`<ul class="tips">${a.studyTips.map((t) => html`<li>${t}</li>`)}</ul>` : ''}
    </div>
  </li>`;
}

/** Every assessment / homework in some weeks, tagged with its subject. */
export function collect(weeks, subjects) {
  const out = { assessments: [], homework: [] };
  for (const w of weeks) {
    if (!w) continue;
    for (const s of subjects) {
      const b = w.subjects[s.id];
      b.assessments.forEach((a) => out.assessments.push({ a, s, week: w.id }));
      b.homework.forEach((h) => out.homework.push({ h, s, week: w.id }));
    }
  }
  out.assessments.sort((x, y) => x.a.date.localeCompare(y.a.date));
  out.homework.sort((x, y) => (x.h.due || '9').localeCompare(y.h.due || '9'));
  return out;
}

export const weekIsEmpty = (w) => !w.events.length && !w.notes && Object.values(w.subjects).every((b) =>
  !b.unit && !b.topics.length && !b.vocabulary.length && !b.homework.length && !b.assessments.length && !b.notes);

/** Homework checkbox row. data-week/data-key are read by app.js to save the tick. */
export function homeworkItem(h, s, weekId, { showSubject = false } = {}) {
  const key = `${s.id}:${h.id}`;
  const done = !!checks(weekId)[key];
  const id = `hw-${weekId}-${key}`.replace(/[^a-z0-9-]/gi, '-');
  return html`<li class="hw${done ? ' done' : ''}">
    <input type="checkbox" id="${id}" data-week="${weekId}" data-key="${key}"${done ? ' checked' : ''}>
    <label for="${id}"><span class="box" aria-hidden="true">${icon('check')}</span>
      <span class="hw-text"><span class="hw-title">${h.title}</span>
      <span class="meta">${showSubject ? html`${subjectChip(s)} ` : ''}${h.due ? `Due ${weekdayShort(h.due)}, ${monthDay(h.due)}` : 'No due day given'}</span>
      ${h.details ? html`<span class="hw-details">${h.details}</span>` : ''}</span>
    </label>
    ${h.href ? html`<a class="hw-link" href="${h.href}">Open<span class="sr-only"> ${h.title}</span></a>` : ''}
  </li>`;
}

/** Previous / next week, plus a jump back to this week. base is "#/week" or "#/math" etc. */
export function weekPicker(base, monday, ctx) {
  const prev = addDays(monday, -7), next = addDays(monday, 7);
  const posted = ctx.index.weeks.some((w) => w.id === monday);
  const label = ctx.index.weeks.find((w) => w.id === monday)?.label || weekLabel(monday);
  return html`<div class="picker" role="group" aria-label="Choose a week">
    <a class="btn btn-icon" href="${base}/${prev}" aria-label="Previous week, ${weekLabel(prev)}">${icon('prev')}</a>
    <p class="picker-label"><b>${label}</b><span>${monday === ctx.thisWeek ? 'This week' : posted ? 'Posted' : 'Nothing posted'}</span></p>
    <a class="btn btn-icon" href="${base}/${next}" aria-label="Next week, ${weekLabel(next)}">${icon('next')}</a>
    ${monday !== ctx.thisWeek ? html`<a class="btn btn-quiet" href="${base}">Back to this week</a>` : ''}
  </div>`;
}

export const days = schoolDays;

export function problemsNote(problems) {
  if (!problems.length) return '';
  return html`<details class="notice"><summary>${icon('info')} Some of this week's information could not be shown (${problems.length})</summary>
    <ul>${problems.map((p) => html`<li>${p}</li>`)}</ul><p>A grown-up can fix this in the week's data file.</p></details>`;
}
