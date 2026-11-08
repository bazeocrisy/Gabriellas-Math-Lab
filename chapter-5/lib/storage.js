// Chapter 5 saved work: one store for the whole book, keyed by printed page number.
// First visit copies Lesson 5-1 work (gml:lesson-5-1:v2) and the original workbook's handwriting and
// matching answers. Those older keys are only read, never changed or removed.
export const KEY = 'gml:chapter-5:v1';
export const LESSON51 = 'gml:lesson-5-1:v2';
export const LEGACY = 'gabriella_original_unit5_lessons_51_to_54_v1';
export const blank = (page) => ({ version: 1, book: 'chapter-5', page, answers: {}, ink: {}, completed: {} });
const isObj = (o) => o && typeof o === 'object' && !Array.isArray(o);
const validInk = (strokes) => Array.isArray(strokes) && strokes.every((st) => Array.isArray(st) && st.every((pt) => Array.isArray(pt) && pt.length === 2 && pt.every((n) => Number.isFinite(n) && n >= 0 && n <= 1)));
export function valid(s, pages) {
  if (!s || s.version !== 1 || s.book !== 'chapter-5' || !pages.includes(s.page)) return false;
  for (const key of ['answers', 'ink', 'completed']) if (!isObj(s[key])) return false;
  if (!Object.values(s.answers).every((v) => typeof v === 'string' && v.length < 100000)) return false;
  if (!Object.values(s.completed).every((v) => typeof v === 'boolean')) return false;
  return Object.entries(s.ink).every(([p, strokes]) => pages.includes(p) && validInk(strokes));
}
export function load(storage, pages, fieldKeys = []) {
  const raw = storage.getItem(KEY);
  if (raw) {
    const state = JSON.parse(raw);
    if (!valid(state, pages)) throw new Error('Saved work has an unrecognized format. Export it before changing it.');
    return state;
  }
  const state = blank(pages[0]);
  const l51raw = storage.getItem(LESSON51);
  if (l51raw) {
    try {
      const old = JSON.parse(l51raw);
      if (old && old.version === 2 && old.lesson === '5-1') {
        for (const [k, v] of Object.entries(old.answers || {})) if (typeof v === 'string') state.answers[k] = v;
        for (const [p, strokes] of Object.entries(old.ink || {})) if (pages.includes(p) && validInk(strokes)) state.ink[p] = strokes;
        for (const [k, v] of Object.entries(old.completed || {})) if (typeof v === 'boolean') state.completed[k] = v;
        if (pages.includes(old.page)) state.page = old.page;
      }
    } catch { /* unreadable Lesson 5-1 data is left in place and skipped */ }
  }
  const legacyRaw = storage.getItem(LEGACY);
  if (legacyRaw) {
    try {
      const old = JSON.parse(legacyRaw), keys = new Set(fieldKeys);
      for (const [k, v] of Object.entries(old.answers || {})) if (keys.has(k) && typeof v === 'string' && !(k in state.answers)) state.answers[k] = v;
      for (const p of pages) if (!state.ink[p] && Array.isArray(old.ink?.[p])) state.ink[p] = old.ink[p].map((st) => st.map((pt) => [Math.max(0, Math.min(1, pt.x / 980)), Math.max(0, Math.min(1, pt.y / 1267))]));
    } catch { /* unreadable workbook data is left in place and skipped */ }
  }
  if (!valid(state, pages)) throw new Error('Existing work could not be imported safely. The original data has been retained.');
  return state;
}
export function backup(state) { return JSON.stringify(state, null, 2); }
