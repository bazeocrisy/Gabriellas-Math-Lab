// Local progress, kept only in this browser (localStorage). No accounts, no names, no network.
// If storage is blocked (private mode), everything still works for the current visit.
(function (G) {
  'use strict';
  const KEY = 'gml:v1:progress';
  const DRAFT = 'gml:v1:draft:';
  const memory = {};

  // If saving fails (storage blocked or full), keep the value in memory for this visit and read it from there.
  function rawGet(k) {
    if (k in memory) return memory[k];
    try { return window.localStorage.getItem(k); } catch (e) { return null; }
  }
  function rawSet(k, v) {
    try { window.localStorage.setItem(k, v); delete memory[k]; } catch (e) { memory[k] = v; }
  }
  function rawDel(k) {
    try { window.localStorage.removeItem(k); } catch (e) { /* blocked */ }
    delete memory[k];
  }
  function read(k, fallback) {
    const s = rawGet(k);
    if (!s) return fallback;
    try { return JSON.parse(s); } catch (e) { return fallback; }
  }

  function blankLesson() {
    return {
      teach: { screen: 0, furthest: 0, done: false },
      practice: { sessions: 0, skills: {}, recentSigs: [] },
      tests: [],
      lastTestSigs: []
    };
  }

  function all() {
    const p = read(KEY, null);
    return p && typeof p === 'object' && p.lessons ? p : { lessons: {} };
  }

  const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
  const num = (x, d) => (Number.isFinite(x) && x >= 0 ? x : d);
  const strings = (a) => (Array.isArray(a) ? a.filter((x) => typeof x === 'string') : []);
  const validTest = (t) => isObj(t) && Number.isInteger(t.correct) && Number.isInteger(t.total) && Number.isInteger(t.percent) && t.total > 0 &&
    t.correct >= 0 && t.correct <= t.total && isObj(t.skills) && Array.isArray(t.missedSkills);

  /** One lesson's progress, repaired field by field so damaged or old saved data can never break a page. */
  function lesson(id) {
    const lessons = all().lessons;
    const l = isObj(lessons) && isObj(lessons[id]) ? lessons[id] : {};
    const b = blankLesson();
    const t = isObj(l.teach) ? l.teach : {}, p = isObj(l.practice) ? l.practice : {};
    const skills = {};
    if (isObj(p.skills)) Object.keys(p.skills).forEach((k) => { const s = p.skills[k]; if (isObj(s) && Number.isInteger(s.c) && Number.isInteger(s.t)) skills[k] = { c: s.c, t: s.t }; });
    return {
      teach: { screen: num(t.screen, 0), furthest: num(t.furthest, 0), done: t.done === true },
      practice: { sessions: num(p.sessions, 0), skills, recentSigs: strings(p.recentSigs), lastDate: typeof p.lastDate === 'string' ? p.lastDate : undefined },
      tests: Array.isArray(l.tests) ? l.tests.filter(validTest) : b.tests,
      lastTestSigs: strings(l.lastTestSigs)
    };
  }

  function update(id, fn) {
    const p = all();
    if (!isObj(p.lessons)) p.lessons = {};
    const l = lesson(id);
    fn(l);
    p.lessons[id] = l;
    rawSet(KEY, JSON.stringify(p));
    return l;
  }

  function persistent() {
    try { const k = '__gml_test__'; window.localStorage.setItem(k, '1'); window.localStorage.removeItem(k); return true; } catch (e) { return false; }
  }

  G.store = {
    lesson, update, persistent,
    getDraft: (name) => read(DRAFT + name, null),
    setDraft: (name, v) => rawSet(DRAFT + name, JSON.stringify(v)),
    clearDraft: (name) => rawDel(DRAFT + name),
    resetAll() {
      try {
        Object.keys(window.localStorage).filter((k) => k.startsWith('gml:')).forEach((k) => window.localStorage.removeItem(k));
      } catch (e) { /* blocked */ }
      Object.keys(memory).forEach((k) => delete memory[k]);
    }
  };
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
