// Checks the hub's data files against data/SCHEMA.md. Used by scripts/build-site.js (before publishing) and by
// tests/unit/data.test.js. Every function returns a list of plain-English problems; an empty list means valid.
// Empty lists and null text are always allowed (the site shows "nothing posted yet").

export const SUBJECT_IDS = ['math', 'ela', 'social-studies', 'science'];
export const UNIT_STATUS = ['current', 'done', 'upcoming', null];
export const ASSESSMENT_KINDS = ['test', 'quiz', 'project', 'benchmark'];
export const RESOURCE_LISTS = ['learn', 'practice', 'guides', 'tests'];

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isText = (v) => typeof v === 'string' && v.trim().length > 0;
const textOrNull = (v) => v === null || v === undefined || typeof v === 'string';

/** A real calendar date in YYYY-MM-DD form. */
export function isDate(s) {
  if (typeof s !== 'string' || !DATE.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
}
export const isMonday = (s) => isDate(s) && new Date(`${s}T00:00:00Z`).getUTCDay() === 1;

/** A link the hub will follow: relative inside the site (no leading slash, no ..-escape past the root) or https://. */
export function isSafeLink(href) {
  if (href === null || href === undefined) return true;
  if (typeof href !== 'string' || !href.trim()) return false;
  if (/^https:\/\//i.test(href)) return true;
  if (/^[a-z][a-z0-9+.-]*:|^\/\/|^\//i.test(href)) return false;
  return !href.split(/[?#]/)[0].startsWith('../');
}

export function validateSubjects(doc) {
  const p = [];
  if (!isObj(doc)) return ['must be an object'];
  if (doc.version !== 1) p.push('"version" must be 1');
  if (!Array.isArray(doc.subjects)) return [...p, '"subjects" must be a list'];
  const ids = doc.subjects.map((s) => s?.id);
  for (const id of SUBJECT_IDS) if (!ids.includes(id)) p.push(`subject "${id}" is missing`);
  if (new Set(ids).size !== ids.length) p.push('a subject id is listed twice');
  doc.subjects.forEach((s, i) => {
    const at = `subjects[${i}]${s?.id ? ` (${s.id})` : ''}`;
    if (!isObj(s)) { p.push(`${at} must be an object`); return; }
    if (!SUBJECT_IDS.includes(s.id)) p.push(`${at}: id must be one of ${SUBJECT_IDS.join(', ')}`);
    if (!isText(s.name)) p.push(`${at}: "name" is required`);
    if (!textOrNull(s.longName)) p.push(`${at}: "longName" must be text or null`);
    if (!isText(s.role)) p.push(`${at}: "role" is required (the teacher is shown by role, e.g. "Math teacher")`);
    else if (!/teacher$/i.test(s.role.trim())) p.push(`${at}: "role" must be a role such as "Math teacher", never a name`);
    if (!textOrNull(s.currentUnit)) p.push(`${at}: "currentUnit" must be text or null`);
    if (!Array.isArray(s.units)) { p.push(`${at}: "units" must be a list (it may be empty)`); return; }
    const unitIds = s.units.map((u) => u?.id);
    if (new Set(unitIds).size !== unitIds.length) p.push(`${at}: a unit id is listed twice`);
    if (s.currentUnit && !unitIds.includes(s.currentUnit) && !s.units.some((u) => u?.title === s.currentUnit)) p.push(`${at}: "currentUnit" ${JSON.stringify(s.currentUnit)} is not one of its units`);
    s.units.forEach((u, j) => {
      const uat = `${at} units[${j}]`;
      if (!isObj(u)) { p.push(`${uat} must be an object`); return; }
      if (!isText(u.id) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(u.id)) p.push(`${uat}: "id" must be lower-case words joined by hyphens`);
      if (!isText(u.title)) p.push(`${uat}: "title" is required`);
      if (!UNIT_STATUS.includes(u.status ?? null)) p.push(`${uat}: "status" must be current, done, upcoming or null`);
      if (u.dates !== undefined && !textOrNull(u.dates) && !isObj(u.dates)) p.push(`${uat}: "dates" must be text, an object or null`);
      if (!isSafeLink(u.href)) p.push(`${uat}: "href" must be a relative link inside the site or an https:// link`);
    });
  });
  return p;
}

export function validateWeekIndex(doc) {
  const p = [];
  if (!isObj(doc)) return ['must be an object'];
  if (doc.version !== 1) p.push('"version" must be 1');
  if (!Array.isArray(doc.weeks)) return [...p, '"weeks" must be a list (it may be empty)'];
  const ids = [];
  doc.weeks.forEach((w, i) => {
    if (!isObj(w)) { p.push(`weeks[${i}] must be an object`); return; }
    if (!isMonday(w.id)) p.push(`weeks[${i}]: "id" ${JSON.stringify(w.id)} must be a Monday's date (YYYY-MM-DD)`);
    if (!textOrNull(w.label)) p.push(`weeks[${i}]: "label" must be text or null`);
    ids.push(w.id);
  });
  if (new Set(ids).size !== ids.length) p.push('a week is listed twice');
  if (doc.current !== null && doc.current !== undefined) {
    if (!ids.includes(doc.current)) p.push(`"current" ${JSON.stringify(doc.current)} is not one of the listed weeks`);
  } else if (ids.length) p.push('"current" must name a listed week');
  return p;
}

function validateList(list, at, check) {
  if (list === undefined || list === null) return [];
  if (!Array.isArray(list)) return [`${at} must be a list (it may be empty)`];
  return list.flatMap((item, i) => check(item, `${at}[${i}]`));
}

function validateLinkItem(item, at) {
  if (!isObj(item)) return [`${at} must be an object`];
  const p = [];
  if (!isText(item.title)) p.push(`${at}: "title" is required`);
  if (!isSafeLink(item.href)) p.push(`${at}: "href" must be a relative link inside the site or an https:// link`);
  if (!textOrNull(item.detail)) p.push(`${at}: "detail" must be text or null`);
  return p;
}

export function validateSubjectBlock(b, at) {
  if (b === undefined || b === null) return [];
  if (!isObj(b)) return [`${at} must be an object`];
  const p = [];
  if (!textOrNull(b.unit)) p.push(`${at}: "unit" must be text or null`);
  if (!textOrNull(b.notes)) p.push(`${at}: "notes" must be text or null`);
  p.push(...validateList(b.topics, `${at}.topics`, (t, a) => (isText(t) || (isObj(t) && isText(t.title) && textOrNull(t.detail)) ? [] : [`${a} must be text or { "title", "detail" }`])));
  p.push(...validateList(b.vocabulary, `${at}.vocabulary`, (v, a) => {
    if (!isObj(v)) return [`${a} must be an object`];
    const q = [];
    if (!isText(v.term)) q.push(`${a}: "term" is required`);
    if (!textOrNull(v.meaning)) q.push(`${a}: "meaning" must be text or null`);
    if (!textOrNull(v.example)) q.push(`${a}: "example" must be text or null`);
    return q;
  }));
  const hwIds = [];
  p.push(...validateList(b.homework, `${at}.homework`, (h, a) => {
    if (!isObj(h)) return [`${a} must be an object`];
    const q = [];
    if (!isText(h.title)) q.push(`${a}: "title" is required`);
    if (h.due !== null && h.due !== undefined && !isDate(h.due)) q.push(`${a}: "due" must be a date (YYYY-MM-DD) or null`);
    if (!textOrNull(h.details)) q.push(`${a}: "details" must be text or null`);
    if (!isSafeLink(h.href)) q.push(`${a}: "href" must be a relative link inside the site or an https:// link`);
    if (h.id !== undefined && h.id !== null) { if (!isText(h.id)) q.push(`${a}: "id" must be text`); hwIds.push(h.id); }
    return q;
  }));
  if (new Set(hwIds).size !== hwIds.length) p.push(`${at}.homework: an id is used twice`);
  p.push(...validateList(b.assessments, `${at}.assessments`, (t, a) => {
    if (!isObj(t)) return [`${a} must be an object`];
    const q = [];
    if (!ASSESSMENT_KINDS.includes(t.kind)) q.push(`${a}: "kind" must be ${ASSESSMENT_KINDS.join(', ')}`);
    if (!isText(t.title)) q.push(`${a}: "title" is required`);
    if (!isDate(t.date)) q.push(`${a}: "date" is required (YYYY-MM-DD)`);
    if (!textOrNull(t.covers)) q.push(`${a}: "covers" must be text or null`);
    if (t.studyTips !== undefined && t.studyTips !== null && (!Array.isArray(t.studyTips) || !t.studyTips.every(isText))) q.push(`${a}: "studyTips" must be a list of text`);
    return q;
  }));
  if (b.resources !== undefined && b.resources !== null) {
    if (!isObj(b.resources)) p.push(`${at}.resources must be an object`);
    else {
      for (const k of Object.keys(b.resources)) if (!RESOURCE_LISTS.includes(k)) p.push(`${at}.resources: unknown list "${k}" (use ${RESOURCE_LISTS.join(', ')})`);
      for (const k of RESOURCE_LISTS) p.push(...validateList(b.resources[k], `${at}.resources.${k}`, validateLinkItem));
    }
  }
  return p;
}

export function validateWeek(doc, id) {
  const p = [];
  if (!isObj(doc)) return ['must be an object'];
  if (doc.version !== 1) p.push('"version" must be 1');
  if (doc.id !== id) p.push(`"id" ${JSON.stringify(doc.id)} must match the file name (${id})`);
  if (!isMonday(doc.id)) p.push('"id" must be a Monday\'s date');
  if (!textOrNull(doc.label)) p.push('"label" must be text or null');
  if (!textOrNull(doc.notes)) p.push('"notes" must be text or null');
  p.push(...validateList(doc.events, 'events', (e, a) => {
    if (!isObj(e)) return [`${a} must be an object`];
    const q = [];
    if (!isText(e.text)) q.push(`${a}: "text" is required`);
    if (e.date !== null && e.date !== undefined && !isDate(e.date)) q.push(`${a}: "date" must be a date (YYYY-MM-DD) or null`);
    return q;
  }));
  if (doc.subjects !== undefined && doc.subjects !== null) {
    if (!isObj(doc.subjects)) p.push('"subjects" must be an object with one block per subject id');
    else {
      for (const [sid, block] of Object.entries(doc.subjects)) {
        if (!SUBJECT_IDS.includes(sid)) p.push(`subjects: unknown subject "${sid}" (use ${SUBJECT_IDS.join(', ')})`);
        else p.push(...validateSubjectBlock(block, `subjects.${sid}`));
      }
    }
  }
  return p;
}
