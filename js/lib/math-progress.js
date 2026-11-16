// Read-only summary of the math app's saved progress (localStorage "gml:v1:progress" and Chapter 4's
// "gml:v1:draft:c4-progress-<id>"). Anything missing or damaged counts as "no activity". Never writes.
export const DECIMAL_LESSONS = ['d01', 'd02', 'd03', 'd04', 'd05', 'd06', 'd07', 'd08', 'd09', 'd10'];
export const CHAPTER4_LESSONS = ['4-1', '4-2', '4-3', '4-4', '4-5', '4-6', '4-7', '4-8'];

const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
function read(key) {
  try {
    const s = window.localStorage.getItem(key);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

/** Pure part, testable: summarise the parsed records. */
export function summarise(progress, c4 = {}) {
  const lessons = isObj(progress) && isObj(progress.lessons) ? progress.lessons : {};
  let mastered = 0, started = 0, tests = 0, last = null;
  for (const id of DECIMAL_LESSONS) {
    const l = lessons[id];
    if (!isObj(l)) continue;
    const t = isObj(l.teach) ? l.teach : {}, p = isObj(l.practice) ? l.practice : {};
    const list = Array.isArray(l.tests) ? l.tests.filter((x) => isObj(x) && Number.isInteger(x.percent)) : [];
    const taken = Math.max(Number.isInteger(l.testsTaken) ? l.testsTaken : 0, list.length);
    const isMastered = typeof l.masteredOn === 'string' || list.some((x) => x.mastered === true);
    if (isMastered) mastered++;
    if (isMastered || t.done === true || (Number(t.furthest) > 0) || (Number(p.sessions) > 0) || taken > 0) started++;
    tests += taken;
    for (const x of list) {
      const d = typeof x.date === 'string' ? Date.parse(x.date) : NaN;
      if (Number.isFinite(d) && (!last || d > last.time)) last = { time: d, percent: x.percent, lesson: id };
    }
  }
  let c4Started = 0;
  for (const id of CHAPTER4_LESSONS) {
    const d = c4[id];
    if (isObj(d) && (d.learn === true || (Array.isArray(d.history) && d.history.length > 0))) c4Started++;
  }
  return {
    decimals: { total: DECIMAL_LESSONS.length, mastered, started, tests },
    chapter4: { total: CHAPTER4_LESSONS.length, started: c4Started },
    lastTest: last,
    any: started > 0 || c4Started > 0,
  };
}

export function mathProgress() {
  try {
    const c4 = {};
    for (const id of CHAPTER4_LESSONS) c4[id] = read('gml:v1:draft:c4-progress-' + id);
    return summarise(read('gml:v1:progress'), c4);
  } catch {
    return summarise(null);
  }
}
