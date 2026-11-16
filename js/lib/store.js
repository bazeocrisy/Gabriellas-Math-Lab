// Hub storage: only keys that start with "sn:v1:". Math progress ("gml:" keys) belongs to the math app and is
// only ever read here, never written or removed. If storage is blocked, values live in memory for this visit.
export const PREFIX = 'sn:v1:';
const memory = new Map();
let blocked = false;

function ls() {
  try { return window.localStorage; } catch { return null; }
}
export function persistent() {
  const s = ls();
  if (!s) return false;
  try { s.setItem(PREFIX + '__probe', '1'); s.removeItem(PREFIX + '__probe'); return true; } catch { return false; }
}
export function get(name, fallback) {
  const k = PREFIX + name;
  let v = memory.has(k) ? memory.get(k) : null;
  if (v === null) { try { v = ls()?.getItem(k) ?? null; } catch { v = null; } }
  if (v === null) return fallback;
  try { return JSON.parse(v); } catch { return fallback; }
}
export function set(name, value) {
  const k = PREFIX + name, v = JSON.stringify(value);
  try { ls().setItem(k, v); memory.delete(k); } catch { memory.set(k, v); blocked = true; }
}
export const isBlocked = () => blocked || !persistent();

/** Every hub key (for the grown-up page). */
export function hubKeys() {
  const keys = new Set([...memory.keys()]);
  try {
    const s = ls();
    for (let i = 0; s && i < s.length; i++) { const k = s.key(i); if (k && k.startsWith(PREFIX)) keys.add(k); }
  } catch { /* blocked */ }
  return [...keys].filter((k) => k.startsWith(PREFIX));
}
/** Remove hub data only. Never touches any key outside "sn:v1:". Returns how many were removed. */
export function resetHub() {
  const keys = hubKeys();
  keys.forEach((k) => { try { ls()?.removeItem(k); } catch { /* blocked */ } memory.delete(k); });
  return keys.length;
}

// Homework checklist: one record per week, { "<subject>:<homeworkId>": true }.
export const checks = (week) => { const c = get('hw:' + week, {}); return c && typeof c === 'object' && !Array.isArray(c) ? c : {}; };
export function setCheck(week, key, done) {
  const c = checks(week);
  if (done) c[key] = true; else delete c[key];
  set('hw:' + week, c);
}
