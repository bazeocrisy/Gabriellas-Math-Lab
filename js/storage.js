// Local progress, kept only in this browser (localStorage). No accounts, no names, no network.
// If storage is blocked (private mode), everything still works for the current visit.
(function (G) {
  'use strict';
  const KEY = 'gml:v1:progress';
  const DRAFT = 'gml:v1:draft:';
  const memory = {};

  function rawGet(k) {
    try { return window.localStorage.getItem(k); } catch (e) { return k in memory ? memory[k] : null; }
  }
  function rawSet(k, v) {
    try { window.localStorage.setItem(k, v); } catch (e) { memory[k] = v; }
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

  function lesson(id) {
    const l = all().lessons[id] || {};
    const b = blankLesson();
    return {
      teach: Object.assign(b.teach, l.teach),
      practice: Object.assign(b.practice, l.practice),
      tests: Array.isArray(l.tests) ? l.tests : [],
      lastTestSigs: Array.isArray(l.lastTestSigs) ? l.lastTestSigs : []
    };
  }

  function update(id, fn) {
    const p = all();
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
