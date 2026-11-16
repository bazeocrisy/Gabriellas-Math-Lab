// For grown-ups: progress across subjects, the week's tests, and a reset for hub data only.
import { html } from '../lib/html.js';
import { icon } from '../icons.js';
import { daysBetween } from '../lib/dates.js';
import { checks, hubKeys, isBlocked } from '../lib/store.js';
import { assessmentItem, empty, crumbs } from './parts.js';
import { meter } from './math-links.js';

export function parentView(ctx, { week, upcoming }) {
  const m = ctx.math;
  const ticks = checks(ctx.thisWeek);
  const tests = upcoming.filter((x) => daysBetween(ctx.now, x.a.date) >= 0);
  const nKeys = hubKeys().length;

  return html`
  ${crumbs([{ href: '#/', label: 'Home' }, { label: 'For grown-ups' }])}
  <header class="page-head"><div><h1 tabindex="-1">For grown-ups</h1>
    <p class="lede">How things are going, what's coming up, and what this site saves. Nothing leaves this device: there are no accounts and no tracking.</p></div></header>

  <section class="panel" aria-labelledby="prog-h">
    <h2 id="prog-h">${icon('chart')} Progress by subject</h2>
    <ul class="progress">${ctx.subjects.map((s) => {
      const hw = week.subjects[s.id].homework;
      const done = hw.filter((h) => ticks[`${s.id}:${h.id}`]).length;
      return html`<li class="prog s-${s.id}">
        <span class="divider-tab">${icon(s.id)}</span>
        <div class="prog-body">
          <h3>${s.name} <span class="role">${s.role}</span></h3>
          ${s.id === 'math' ? (m.any ? html`<div class="meters">${meter(m.decimals.mastered, m.decimals.total, 'Decimal lessons mastered')}${meter(m.chapter4.started, m.chapter4.total, 'Chapter 4 lessons started')}</div>
              <p class="small">${m.decimals.tests} decimal ${m.decimals.tests === 1 ? 'test' : 'tests'} taken${m.lastTest ? `, latest score ${m.lastTest.percent}%` : ''}. <a href="math/index.html#/parent">Open Parent Progress</a> for lesson-by-lesson detail.</p>`
            : html`<p class="muted">No activity yet. Math practice is saved once a lesson is started in <a href="math/index.html#/decimals">Decimal Skills</a>.</p>`)
            : html`<p class="muted">No activity yet.</p>`}
          <p class="small">Homework this week: ${hw.length ? `${done} of ${hw.length} checked off` : 'none posted'}.</p>
        </div>
      </li>`;
    })}</ul>
  </section>

  <section class="panel" aria-labelledby="ptests-h">
    <h2 id="ptests-h">${icon('test')} Tests and quizzes coming up</h2>
    ${tests.length ? html`<ul class="assess-list">${tests.map((x) => assessmentItem(x.a, x.s, ctx.now))}</ul>`
      : empty('Nothing scheduled', 'Tests from this week and next will appear here once they are posted.')}
  </section>

  <section class="panel" aria-labelledby="data-h">
    <h2 id="data-h">${icon('info')} Saved on this device</h2>
    <p>${isBlocked() ? 'This browser is not allowing the site to save, so checkmarks last only until the page is closed.'
      : 'Homework checkmarks are saved in this browser. Math lessons save their own progress separately.'}</p>
    <div class="reset" data-reset>
      <p><b>Reset hub data</b> clears homework checkmarks on this device (${nKeys} saved ${nKeys === 1 ? 'item' : 'items'}). Math progress is kept.</p>
      <button type="button" class="btn" data-action="reset-ask"${nKeys ? '' : ' disabled'}>${icon('reset')}Reset hub data</button>
      <div class="confirm" hidden>
        <p id="confirm-q"><b>Clear all homework checkmarks?</b> This can't be undone. Math progress stays.</p>
        <button type="button" class="btn btn-danger" data-action="reset-yes" aria-describedby="confirm-q">Yes, clear them</button>
        <button type="button" class="btn btn-quiet" data-action="reset-no">Keep them</button>
      </div>
    </div>
  </section>`;
}
