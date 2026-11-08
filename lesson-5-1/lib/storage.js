export const KEY = 'gml:lesson-5-1:v2';
export const LEGACY = 'gabriella_original_unit5_lessons_51_to_54_v1';
export const blank = () => ({ version: 2, lesson: '5-1', page: '143', answers: {}, ink: {}, completed: {} });
export function valid(s) {
  if (!s || s.version !== 2 || s.lesson !== '5-1' || !['143','144','145','146'].includes(s.page)) return false;
  for (const key of ['answers','ink','completed']) if (!s[key] || typeof s[key] !== 'object' || Array.isArray(s[key])) return false;
  if (!Object.values(s.answers).every(v => typeof v === 'string' && v.length < 100000)) return false;
  if (!Object.values(s.completed).every(v => typeof v === 'boolean')) return false;
  return Object.entries(s.ink).every(([p, strokes]) => ['143','144','145','146'].includes(p) && Array.isArray(strokes) && strokes.every(st => Array.isArray(st) && st.every(pt => Array.isArray(pt) && pt.length===2 && pt.every(n => Number.isFinite(n) && n>=0 && n<=1))));
}
export function load(storage) {
  const raw = storage.getItem(KEY);
  if (raw) {
    const state = JSON.parse(raw);
    if (!valid(state)) throw new Error('Saved work has an unrecognized format. Export it before changing it.');
    return state;
  }
  const state = blank(), legacyRaw = storage.getItem(LEGACY);
  if (legacyRaw) {
    const old = JSON.parse(legacyRaw);
    for (const [k,v] of Object.entries(old.answers || {})) if (/^14[3-6]_/.test(k) && typeof v === 'string') state.answers[k]=v;
    for (const p of ['143','144','145','146']) if (Array.isArray(old.ink?.[p])) state.ink[p]=old.ink[p].map(st=>st.map(pt=>[Math.max(0,Math.min(1,pt.x/980)),Math.max(0,Math.min(1,pt.y/1267))]));
    if (!valid(state)) throw new Error('Existing work could not be imported safely. The original data has been retained.');
  }
  return state;
}
export function backup(state) { return JSON.stringify(state, null, 2); }
