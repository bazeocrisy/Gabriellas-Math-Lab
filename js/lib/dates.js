// Dates are plain "YYYY-MM-DD" strings, read as local calendar days (never UTC), so a test on Tuesday stays Tuesday.
const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY = 86400000;

export function parseISO(s) {
  const m = typeof s === 'string' && ISO.exec(s);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.getMonth() === Number(m[2]) - 1 ? d : null;
}
export const isISO = (s) => parseISO(s) !== null;
export function toISO(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
export function addDays(iso, n) {
  const d = parseISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}
export function mondayOf(iso) {
  const d = parseISO(iso);
  const back = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - back);
  return toISO(d);
}
/** Whole calendar days from a to b (b later = positive). Rounded, so daylight-saving changes do not matter. */
export const daysBetween = (a, b) => Math.round((parseISO(b) - parseISO(a)) / DAY);
export const schoolDays = (monday) => [0, 1, 2, 3, 4].map((i) => addDays(monday, i));

/** Today, as ISO. ?today=YYYY-MM-DD in the address overrides it (for checking a future week; nothing is saved). */
export function today() {
  try {
    const q = new URLSearchParams(location.search).get('today');
    if (isISO(q)) return q;
  } catch { /* no location (tests) */ }
  return toISO(new Date());
}

const fmtCache = {};
function f(opts) {
  const k = JSON.stringify(opts);
  return (fmtCache[k] ||= new Intl.DateTimeFormat('en-US', opts));
}
export const weekdayName = (iso) => f({ weekday: 'long' }).format(parseISO(iso));
export const weekdayShort = (iso) => f({ weekday: 'short' }).format(parseISO(iso));
export const monthDay = (iso) => f({ month: 'short', day: 'numeric' }).format(parseISO(iso));
export const longDate = (iso) => f({ weekday: 'long', month: 'long', day: 'numeric' }).format(parseISO(iso));
export const dayNum = (iso) => parseISO(iso).getDate();

/** "Week of November 16–20" (or across months: "Week of Nov 30 – Dec 4"). */
export function weekLabel(monday) {
  const fri = addDays(monday, 4);
  const a = parseISO(monday), b = parseISO(fri);
  if (a.getMonth() === b.getMonth()) return `Week of ${f({ month: 'long' }).format(a)} ${a.getDate()}–${b.getDate()}`;
  return `Week of ${monthDay(monday)} – ${monthDay(fri)}`;
}

/** Friendly countdown text for a date compared with today. */
export function countdown(iso, now = today()) {
  const n = daysBetween(now, iso);
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n > 1) return `In ${n} days`;
  if (n === -1) return 'Yesterday';
  return `${-n} days ago`;
}
