// Original line icons (24×24, stroke = currentColor). Always paired with a visible text label.
import { raw } from './lib/html.js';

const wrap = (body, cls = 'ico') => raw(`<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`);

const P = {
  // Subjects
  math: '<path d="M4 20V5.5L18.5 20Z"/><path d="M8 16h3.5V12.5"/><path d="M4 9h2M4 12.5h2.5"/><circle cx="17" cy="7" r="3"/><path d="M15.6 8.4l2.8-2.8"/>',
  ela: '<path d="M4 6.5h9M4 10.5h6M4 14.5h4M4 18.5h5"/><path d="M19.5 4.5l1 1a1.4 1.4 0 0 1 0 2L13 15l-3 1 1-3 7.5-7.5a1.4 1.4 0 0 1 2 0z"/>',
  'social-studies': '<circle cx="12" cy="12" r="8.5"/><path d="M14.8 9.2l-1.6 4-4 1.6 1.6-4z"/><path d="M12 3.5v1.6M12 18.9v1.6M3.5 12h1.6M18.9 12h1.6"/>',
  science: '<path d="M9.5 3.5h5M10.5 3.5v5.2L5.3 18a1.7 1.7 0 0 0 1.5 2.5h10.4a1.7 1.7 0 0 0 1.5-2.5l-5.2-9.3V3.5"/><path d="M7.6 14h8.8"/><circle cx="10.5" cy="17" r=".6" fill="currentColor"/><circle cx="13.6" cy="16.2" r=".6" fill="currentColor"/>',
  // Interface
  home: '<path d="M4 11l8-6.5 8 6.5"/><path d="M6 9.5V20h4.5v-5h3v5H18V9.5"/>',
  week: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><path d="M7.5 13.5h2M11 13.5h2M14.5 13.5h2M7.5 17h2M11 17h2"/>',
  parent: '<circle cx="8.5" cy="8" r="3"/><path d="M3 19.5c.6-3.3 2.7-5 5.5-5s4.9 1.7 5.5 5"/><circle cx="17" cy="10" r="2.3"/><path d="M15 14.9c.6-.3 1.3-.4 2-.4 2.2 0 3.6 1.4 4 4"/>',
  star: '<path d="M12 3.5l2.4 5.6 6 .5-4.6 3.9 1.4 5.9L12 16.3l-5.2 3.1 1.4-5.9-4.6-3.9 6-.5z"/>',
  sparkle: '<path d="M12 3c.7 4.6 2.4 6.3 7 7-4.6.7-6.3 2.4-7 7-.7-4.6-2.4-6.3-7-7 4.6-.7 6.3-2.4 7-7z"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  prev: '<path d="M14.5 6l-6 6 6 6"/>',
  next: '<path d="M9.5 6l6 6-6 6"/>',
  print: '<path d="M7 9V3.5h10V9"/><rect x="3.5" y="9" width="17" height="8" rx="2"/><path d="M7 14h10v6.5H7z"/>',
  book: '<path d="M12 6.5c-2.2-1.6-5-2-8-1.6v13.6c3-.4 5.8 0 8 1.6 2.2-1.6 5-2 8-1.6V4.9c-3-.4-5.8 0-8 1.6zM12 6.5v13.6"/>',
  pencil: '<path d="M4 20l1-4.5L16 4.5a2.1 2.1 0 0 1 3 3L8 18.5z"/><path d="M14 6.5l3 3"/>',
  test: '<rect x="5" y="3.5" width="14" height="17" rx="2"/><path d="M8.5 9l1.5 1.5 3-3M8.5 15.5l1.5 1.5 3-3M15.5 9.5h.5M15.5 16h.5"/>',
  guide: '<path d="M6 3.5h9l3.5 3.5v13.5H6z"/><path d="M14.5 3.5V7.5h4M9 12h6M9 15.5h6"/>',
  play: '<circle cx="12" cy="12" r="8.5"/><path d="M10.5 8.8l4.6 3.2-4.6 3.2z"/>',
  chart: '<path d="M4 20h16"/><path d="M7 16.5v-4M12 16.5V7.5M17 16.5v-6.5"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.1"/>',
  reset: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3L4.5 9"/><path d="M4.5 4.5V9H9"/>',
  out: '<path d="M14 4.5h5.5V10M19.5 4.5L11 13"/><path d="M17 14v5.5H4.5V7H10"/>',
};

export const icon = (name, cls) => wrap(P[name] || P.star, cls);
