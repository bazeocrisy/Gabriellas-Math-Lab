// Loads and checks the hub's JSON. Everything is normalised so a missing field becomes an empty list or null,
// and a broken item is dropped (and reported) instead of breaking the page.
import { isISO } from './dates.js';

export const SUBJECT_IDS = ['math', 'ela', 'social-studies', 'science'];
const cache = new Map();

export class LoadError extends Error {
  constructor(message, detail) { super(message); this.detail = detail; }
}

export async function loadJSON(path) {
  if (cache.has(path)) return cache.get(path);
  const p = (async () => {
    let res;
    try { res = await fetch(path, { cache: 'no-cache' }); } catch (e) {
      throw new LoadError(`Could not reach ${path}.`, location.protocol === 'file:'
        ? 'This page was opened as a file. Open it through a web address (for example the GitHub Pages link) instead.'
        : 'Check the internet connection, then try again.');
    }
    if (!res.ok) throw new LoadError(`${path} answered "${res.status} ${res.statusText}".`, 'The file may be missing or misnamed.');
    try { return await res.json(); } catch { throw new LoadError(`${path} is not valid JSON.`, 'Look for a missing comma or quote in the file.'); }
  })();
  cache.set(path, p);
  p.catch(() => cache.delete(path));
  return p;
}

const str = (x) => (typeof x === 'string' && x.trim() ? x.trim() : null);
const list = (x) => (Array.isArray(x) ? x : []);
const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);

export function normaliseSubjects(raw) {
  const problems = [];
  const given = isObj(raw) ? list(raw.subjects) : [];
  if (!isObj(raw)) problems.push('subjects.json is not an object.');
  const subjects = SUBJECT_IDS.map((id) => {
    const s = given.find((x) => isObj(x) && x.id === id) || {};
    if (!s.id) problems.push(`subjects.json has no "${id}" subject.`);
    const fallbackName = { math: 'Math', ela: 'ELA', 'social-studies': 'Social Studies', science: 'Science' }[id];
    return {
      id,
      name: str(s.name) || fallbackName,
      longName: str(s.longName),
      role: str(s.role) || `${fallbackName} teacher`,
      currentUnit: str(s.currentUnit),
      units: list(s.units).filter(isObj).map((u, i) => ({
        id: str(u.id) || `u${i}`, title: str(u.title), status: ['current', 'done', 'upcoming'].includes(u.status) ? u.status : null,
        dates: str(u.dates), href: safeHref(u.href),
      })).filter((u) => u.title),
    };
  });
  return { subjects, problems };
}

/** Only relative links inside this site, or https links. Anything else (javascript:, data:) is dropped. */
export function safeHref(h) {
  const s = str(h);
  if (!s) return null;
  if (/^https:\/\//i.test(s)) return s;
  if (/^[a-z][a-z0-9+.-]*:/i.test(s) || s.startsWith('//')) return null;
  return s;
}

function hashId(s) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.codePointAt(0)) >>> 0;
  return 'h' + h.toString(36);
}

function normaliseBlock(b, sid, problems) {
  const block = isObj(b) ? b : {};
  const where = (k, i) => `${sid} ${k} #${i + 1}`;
  const topics = list(block.topics).map((t) => (typeof t === 'string' ? { title: str(t), detail: null } : isObj(t) ? { title: str(t.title), detail: str(t.detail) } : {})).filter((t) => t.title);
  const vocabulary = list(block.vocabulary).filter(isObj).map((v) => ({ term: str(v.term), meaning: str(v.meaning), example: str(v.example) })).filter((v) => v.term);
  const homework = [];
  list(block.homework).forEach((h, i) => {
    if (!isObj(h) || !str(h.title)) return problems.push(`${where('homework', i)} has no title.`);
    if (h.due != null && !isISO(h.due)) problems.push(`${where('homework', i)} has a due date that is not YYYY-MM-DD.`);
    homework.push({ id: str(h.id) || hashId(h.title), title: str(h.title), due: isISO(h.due) ? h.due : null, details: str(h.details), href: safeHref(h.href) });
  });
  const assessments = [];
  list(block.assessments).forEach((a, i) => {
    if (!isObj(a) || !str(a.title)) return problems.push(`${where('assessments', i)} has no title.`);
    if (!isISO(a.date)) return problems.push(`${where('assessments', i)} needs a date (YYYY-MM-DD).`);
    assessments.push({ id: str(a.id) || hashId(a.title + a.date), kind: ['test', 'quiz', 'project', 'benchmark'].includes(a.kind) ? a.kind : 'test',
      title: str(a.title), date: a.date, covers: str(a.covers), studyTips: list(a.studyTips).map(str).filter(Boolean) });
  });
  const r = isObj(block.resources) ? block.resources : {};
  const res = (k) => list(r[k]).filter(isObj).map((x) => ({ title: str(x.title), href: safeHref(x.href), detail: str(x.detail) })).filter((x) => x.title && x.href);
  return {
    present: isObj(b), unit: str(block.unit), topics, vocabulary, homework, assessments, notes: str(block.notes),
    resources: { learn: res('learn'), practice: res('practice'), guides: res('guides'), tests: res('tests') },
  };
}

export function normaliseWeek(raw, id) {
  const problems = [];
  if (!isObj(raw)) return { week: null, problems: ['The week file is not an object.'] };
  if (raw.id !== id) problems.push(`The week file says "${raw.id}" but is named ${id}.json.`);
  const subjects = {};
  for (const sid of SUBJECT_IDS) subjects[sid] = normaliseBlock(isObj(raw.subjects) ? raw.subjects[sid] : null, sid, problems);
  const events = list(raw.events).filter((e) => isObj(e) && str(e.text)).map((e) => ({ date: isISO(e.date) ? e.date : null, text: str(e.text) }));
  return { week: { id, label: str(raw.label), notes: str(raw.notes), events, subjects }, problems };
}

export function normaliseIndex(raw) {
  if (!isObj(raw)) throw new LoadError('data/weeks/index.json is not an object.', 'It should list the weeks: { "current": "…", "weeks": [ … ] }.');
  const weeks = list(raw.weeks).filter((w) => isObj(w) && isISO(w.id)).map((w) => ({ id: w.id, label: str(w.label) })).sort((a, b) => a.id.localeCompare(b.id));
  return { current: isISO(raw.current) ? raw.current : weeks.at(-1)?.id || null, weeks };
}

/** An empty week (for a week that has nothing posted). */
export const emptyWeek = (id) => normaliseWeek({ id, subjects: {} }, id).week;

export async function loadWeek(index, id) {
  if (!index.weeks.some((w) => w.id === id)) return { week: emptyWeek(id), problems: [], posted: false };
  const { week, problems } = normaliseWeek(await loadJSON(`data/weeks/${id}.json`), id);
  if (!week) throw new LoadError(`data/weeks/${id}.json could not be read.`, problems.join(' '));
  return { week, problems, posted: true };
}
