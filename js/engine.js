// Question engine: seeded generation, exact answer checking, and balanced question sets.
// Lesson banks register templates; a question is always rebuilt from (template id, seed), so a saved
// session can be restored after a refresh without storing answers in the page.
(function (G) {
  'use strict';
  const D = G.D;

  /** Small seeded random generator (mulberry32). */
  function rng(seed) {
    let a = seed >>> 0;
    const next = () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const r = {
      next,
      int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
      pick: (arr) => arr[Math.floor(next() * arr.length)],
      shuffle: (arr) => {
        const a2 = arr.slice();
        for (let i = a2.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [a2[i], a2[j]] = [a2[j], a2[i]]; }
        return a2;
      }
    };
    return r;
  }

  const banks = {};

  /** Register a lesson bank: { lessonId, skills: {id: name}, templates: [{ id, skill, make(r, params) }] }. */
  function register(bank) {
    bank.byId = {};
    bank.templates.forEach((t) => { bank.byId[t.id] = t; });
    banks[bank.lessonId] = bank;
  }

  /** Build one question. params (optional) fix the numbers, for teaching examples. */
  function make(lessonId, templateId, seed, params) {
    const t = banks[lessonId].byId[templateId];
    if (!t) throw new Error('unknown template ' + templateId);
    const q = t.make(rng(seed), params || {});
    q.template = templateId;
    q.seed = seed;
    q.skill = t.skill;
    q.lesson = lessonId;
    q.sig = templateId + ':' + q.sig;
    // A typed answer that must show a set number of decimal places says so (unless the prompt already does).
    if (q.type === 'number' && q.places != null && !/decimal place|after the decimal point/.test(q.prompt)) {
      const n = ['no', 'one', 'two', 'three'][q.places];
      q.prompt += ` <span class="fmt-note">(Write your answer with ${n} digit${q.places === 1 ? '' : 's'} after the decimal point, even if ${q.places === 1 ? 'it is' : 'the last one is'} a zero.)</span>`;
    }
    return q;
  }

  const DEFAULT_RETRY = 'Look at the picture and the hints again, then try once more.';

  /** Check a response. Returns { status: 'empty' | 'invalid' | 'correct' | 'wrong', message }. */
  function check(q, resp) {
    let ok = false, info = {};
    if (q.type === 'number') {
      // A leading dollar sign is fine on money answers.
      const s = String(resp == null ? '' : resp).trim().replace(/^\$\s*/, '');
      if (!s) return { status: 'empty', message: 'Type your answer in the box first.' };
      const v = D.parse(s);
      if (!v) return { status: 'invalid', message: 'Type a number using only digits and a decimal point, like 0.25.' };
      info = { value: v, th: D.toThousandths(v), raw: s };
      ok = q.accept ? q.accept(v, info) : D.equal(v, q.answer);
      if (ok && q.places != null && v.places !== q.places) {
        return { status: 'wrong', message: `That is the right amount, but this question asks for exactly ${q.places} digit${q.places === 1 ? '' : 's'} after the decimal point. Count the digits after the point.` };
      }
    } else if (q.type === 'mc') {
      if (resp == null || resp === '') return { status: 'empty', message: 'Choose an answer first.' };
      ok = resp === q.answer;
    } else if (q.type === 'build') {
      if (resp == null || resp === 0) return { status: 'empty', message: 'Use the + buttons to shade the model first.' };
      ok = resp === q.answer;
    } else if (q.type === 'order') {
      const arr = Array.isArray(resp) ? resp : [];
      if (!arr.length) return { status: 'empty', message: 'Tap the numbers to put them in order first.' };
      if (arr.length < q.answer.length) return { status: 'invalid', message: 'Put all of the numbers in order before you check.' };
      ok = arr.length === q.answer.length && arr.every((x, i) => x === q.answer[i]);
      info = { order: arr };
    } else if (q.type === 'expanded') {
      const s = String(resp == null ? '' : resp).trim();
      if (!s) return { status: 'empty', message: 'Type your answer in the box first.' };
      const parts = s.split('+').map((t) => t.trim().replace(/^\((.*)\)$/, '$1').trim());
      // A part may be a value (0.07) or digit × place value (7 × 0.01).
      const vals = parts.map((t) => {
        const m = /^(\d)\s*[×xX*]\s*(\d*\.?\d+)$/.exec(t);
        if (!m) return D.parse(t);
        const pv = D.toThousandths(m[2]);
        if (pv === null || !/^10*$/.test(String(pv))) return null;
        return D.parse(D.fromThousandths(Number(m[1]) * pv, 3));
      });
      if (parts.length > 8 || vals.some((v) => !v || v.places > 3)) return { status: 'invalid', message: 'Write each part as a number with + signs between the parts, like 4 + 0.7 + 0.03 (or 4 × 1 + 7 × 0.1 + 3 × 0.01).' };
      const ths = vals.map((v) => D.toThousandths(v));
      const sum = ths.reduce((a, b) => a + b, 0);
      // In expanded form every part is one digit times a place value (like 0.03), each place used once.
      const single = ths.every((k) => k === 0 || /^[1-9]0*$/.test(String(k)));
      const placesUsed = ths.filter((k) => k).map((k) => String(k).length);
      const distinct = new Set(placesUsed).size === placesUsed.length;
      info = { parts, sum, single, distinct };
      ok = sum === D.toThousandths(q.answer) && single && distinct;
      if (!ok && sum === D.toThousandths(q.answer)) {
        return { status: 'wrong', message: single ? 'Those parts add up to the right number, but each place should appear only once. Combine parts that are in the same place.'
          : 'Those parts add up to the right number, but in expanded form each part has just one nonzero digit, like 0.03. Split the parts by place.' };
      }
    } else if (q.type === 'chart') {
      const r = resp || {};
      const keys = ['ones', 'tenths', 'hundredths', 'thousandths'];
      const vals = keys.map((k) => String(r[k] == null ? '' : r[k]).trim());
      if (vals.every((v) => v === '')) return { status: 'empty', message: 'Type the digits into the chart first.' };
      if (vals.some((v) => !/^\d?$/.test(v))) return { status: 'invalid', message: 'Each box holds just one digit (0 to 9).' };
      const want = D.digits(q.answer);
      ok = keys.every((k, i) => (vals[i] || '0') === want[k]);
      info = { digits: Object.fromEntries(keys.map((k, i) => [k, vals[i] || '0'])) };
    }
    if (ok) return { status: 'correct' };
    const msg = (q.diagnose && q.diagnose(resp, info)) || DEFAULT_RETRY;
    return { status: 'wrong', message: msg };
  }

  /** Human-readable version of a response (for test results). */
  function describe(q, resp) {
    if (resp == null || resp === '' || resp === 0) return '(no answer)';
    if (q.type === 'mc') {
      const c = q.choices.find((x) => x.value === resp);
      return c ? (c.text || c.label) : '(no answer)';
    }
    if (q.type === 'build') {
      if (q.model === 'strip') return `${resp} of 10 parts shaded`;
      return `${Math.floor(resp / 10)} column${Math.floor(resp / 10) === 1 ? '' : 's'} and ${resp % 10} square${resp % 10 === 1 ? '' : 's'} shaded`;
    }
    if (q.type === 'order') return Array.isArray(resp) && resp.length ? resp.join(', ') : '(no answer)';
    if (q.type === 'chart') {
      const r = resp || {};
      const d = (k) => String(r[k] == null || r[k] === '' ? '_' : r[k]);
      if (['ones', 'tenths', 'hundredths', 'thousandths'].every((k) => !r[k])) return '(no answer)';
      return `${d('ones')} . ${d('tenths')} ${d('hundredths')} ${d('thousandths')}`;
    }
    return String(resp).trim() || '(no answer)';
  }

  /** Answered = something checkable was entered (blank or unreadable input does not count). */
  function isAnswered(q, resp) {
    const st = check(q, resp).status;
    return st !== 'empty' && st !== 'invalid';
  }

  /**
   * Choose `count` questions for a session as [{ id, seed }], spread across skills by `plan`
   * ({ skill: count }), varied templates, and no repeated question (by signature) in the set or in `exclude`.
   * `avoid` lists questions to leave out when possible (recently seen ones); a small bank may still reuse them
   * rather than fail.
   */
  function buildSet(lessonId, { plan, seed, exclude, avoid, skip }) {
    const bank = banks[lessonId];
    const r = rng(seed);
    const ex = exclude || new Set();
    const soft = avoid || new Set();
    const used = new Set();
    const usedTemplates = {};
    const slots = [];
    Object.keys(plan).forEach((skill) => { for (let i = 0; i < plan[skill]; i++) slots.push(skill); });
    const out = [];
    for (const skill of r.shuffle(slots)) {
      const ts = bank.templates.filter((t) => t.skill === skill && !(skip && skip.includes(t.id)));
      let chosen = null;
      for (let tries = 0; tries < 300 && !chosen; tries++) {
        const fresh = ts.filter((t) => !usedTemplates[t.id]);
        const t = r.pick(tries < 100 && fresh.length ? fresh : ts);
        const s = r.int(1, 2147483646);
        const q = make(lessonId, t.id, s);
        if (used.has(q.sig) || ex.has(q.sig) || (tries < 200 && soft.has(q.sig))) continue;
        chosen = { id: t.id, seed: s, sig: q.sig };
      }
      if (!chosen) throw new Error('could not build a question for ' + skill);
      used.add(chosen.sig);
      usedTemplates[chosen.id] = true;
      out.push(chosen);
    }
    // Avoid two questions of the same template back to back where possible.
    for (let i = 1; i < out.length; i++) {
      if (out[i].id === out[i - 1].id) {
        const j = out.findIndex((x, k) => k > i && x.id !== out[i].id && (k + 1 >= out.length || out[k + 1].id !== out[i].id) && out[k - 1].id !== out[i].id);
        if (j > 0) [out[i], out[j]] = [out[j], out[i]];
      }
    }
    return out;
  }

  /** True if a saved question list still matches the bank (e.g. after an app update renamed a template). */
  function validSet(lessonId, set, count) {
    const bank = banks[lessonId];
    if (!Array.isArray(set) || set.length !== count) return false;
    return set.every((x) => {
      if (!x || typeof x !== 'object' || !bank.byId[x.id] || !Number.isInteger(x.seed)) return false;
      try { return make(lessonId, x.id, x.seed).sig === x.sig; } catch (e) { return false; }
    });
  }

  G.engine = { rng, register, make, check, describe, isAnswered, buildSet, validSet, banks };
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
