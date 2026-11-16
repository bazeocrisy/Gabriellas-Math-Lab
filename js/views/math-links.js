// Links into the math app (math/index.html, moved from NumberNova) and its saved-progress summary.
import { html } from '../lib/html.js';
import { icon } from '../icons.js';

export const MATH_APP = [
  { key: 'decimals', href: 'math/index.html#/decimals', title: 'Decimal Skills', text: '10 lessons, each with Teach, Practice and a Test.', icon: 'star' },
  { key: 'chapter4', href: 'math/index.html#/chapter4', title: 'Chapter 4', text: 'Add and subtract decimals, Lessons 4-1 to 4-8, review and final.', icon: 'book' },
  { key: 'practice', href: 'math/index.html#/practice', title: 'Practice Center', text: 'Mixed practice that focuses on skills that need work.', icon: 'play' },
  { key: 'guides', href: 'math/index.html#/guides', title: 'Study Guides', text: 'Printable decimal study guides by section.', icon: 'guide' },
  { key: 'parent', href: 'math/index.html#/parent', title: 'Parent Progress', text: 'Lesson-by-lesson results for grown-ups.', icon: 'chart' },
];

export function meter(n, total, label) {
  const pct = total ? Math.round((n / total) * 100) : 0;
  return html`<div class="meter"><span class="meter-label">${label}</span>
    <span class="meter-bar" aria-hidden="true"><span class="w${Math.round(pct / 5) * 5}"></span></span>
    <span class="meter-num">${n} of ${total}</span></div>`;
}

export function mathSummaryText(m) {
  if (!m.any) return 'No math activity on this device yet.';
  return `${m.decimals.mastered} of ${m.decimals.total} decimal lessons mastered, ${m.chapter4.started} of ${m.chapter4.total} Chapter 4 lessons started.`;
}

/** Extra lines on the Math divider on Home: mastery and two quick links that sit above the card's main link. */
export function mathCardExtra(m) {
  return html`<div class="math-extra">
    ${m.any ? meter(m.decimals.mastered, m.decimals.total, 'Decimal lessons mastered') : html`<p class="muted small">No math practice saved on this device yet.</p>`}
    <p class="quick"><a class="btn btn-small" href="math/index.html#/decimals">${icon('star')}Decimal Skills</a><a class="btn btn-small" href="math/index.html#/chapter4">${icon('book')}Chapter 4</a></p>
  </div>`;
}
