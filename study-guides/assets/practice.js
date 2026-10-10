// Practice engine: numbers the questions, computes every answer exactly, and builds the answer key.
//
// A question is any element with class "q" inside a skill (an element with data-skill="1.4").
// It gets its answer in one of two ways:
//   data-calc="value 4.735 7"   the answer is computed (see CALC below); the key shows the answer and one worked step
//   data-answer="..."           a written answer (for "explain" or "many answers are right" questions),
//                               optionally with data-why="...", shown in the key
// Questions with class "try" are the Let's Try One problem; the rest are numbered 1, 2, 3 ... per skill.
// Any element with data-key-for="1.4" (or "all") is filled with that skill's answer key.
// Decimals are exact: values are BigInts scaled by 10^9, never floating point.
(function () {
  'use strict';
  const SCALE = 9, ONE = 10n ** BigInt(SCALE);

  // ---------- exact decimals ----------
  function D(s) {
    const m = /^(-?)(\d+)(?:\.(\d+))?$/.exec(String(s).trim());
    if (!m || (m[3] || '').length > SCALE) throw new Error('not a decimal: ' + s);
    const v = BigInt(m[2]) * ONE + BigInt((m[3] || '').padEnd(SCALE, '0') || '0');
    return m[1] ? -v : v;
  }
  function fmt(v, places) {
    const neg = v < 0n; if (neg) v = -v;
    const w = v / ONE, f = (v % ONE).toString().padStart(SCALE, '0');
    const frac = places == null ? f.replace(/0+$/, '') : f.slice(0, places);
    return (neg ? '-' : '') + w + (frac ? '.' + frac : '');
  }
  const parts = (s) => { const [w, f = ''] = String(s).split('.'); return { w, f }; };

  // Places by position relative to the decimal point: index 0 = ones, -1 = tens, 1 = tenths ...
  const PLACE = { '-2': 'hundreds', '-1': 'tens', '0': 'ones', '1': 'tenths', '2': 'hundredths', '3': 'thousandths' };
  const PLACE_ONE = { hundreds: 'hundred', tens: 'ten', ones: 'one', tenths: 'tenth', hundredths: 'hundredth', thousandths: 'thousandth' };
  const UNIT_VALUE = { hundreds: '100', tens: '10', ones: '1', tenths: '0.1', hundredths: '0.01', thousandths: '0.001' };
  const KEY = { tens: 'tens', ones: 'ones', t: 'tenths', h: 'hundredths', th: 'thousandths' };

  // Finds the single digit d in number n and returns its place name.
  function locate(n, d) {
    const { w, f } = parts(n);
    const hits = [];
    [...w].forEach((c, i) => { if (c === d) hits.push(PLACE[String(i - (w.length - 1))]); });
    [...f].forEach((c, i) => { if (c === d) hits.push(PLACE[String(i + 1)]); });
    if (hits.length !== 1) throw new Error(`digit ${d} must appear exactly once in ${n}`);
    return hits[0];
  }
  const unitName = (d, place) => `${d} ${d === '1' ? PLACE_ONE[place] : place}`;
  const mul = (a, b) => a * b / ONE;
  const valueOf = (d, place) => fmt(mul(D(d), D(UNIT_VALUE[place])));
  function digitsOf(n) {
    const { w, f } = parts(n), out = [];
    [...w].forEach((c, i) => out.push([c, PLACE[String(i - (w.length - 1))]]));
    [...f].forEach((c, i) => out.push([c, PLACE[String(i + 1)]]));
    return out;
  }

  // ---------- column arithmetic (used by the calculators and by the column model) ----------
  // Lines numbers up on the decimal point. Returns digit strings with no point, all the same length.
  function align(xs) {
    const F = Math.max(...xs.map((x) => parts(x).f.length));
    const W = Math.max(...xs.map((x) => parts(x).w.length));
    const rows = xs.map((x) => { const { w, f } = parts(x); return w.padStart(W, '0') + f.padEnd(F, '0'); });
    const placeAt = (i) => PLACE[String(i - (W - 1))] || 'place';
    return { F, W, rows, placeAt };
  }
  // Column addition: per-column steps with carries.
  function colAdd(xs) {
    const { F, W, rows, placeAt } = align(xs);
    const steps = [], carries = new Array(W + F).fill(0);
    let carry = 0;
    for (let i = W + F - 1; i >= 0; i--) {
      const ds = rows.map((r) => Number(r[i]));
      const s = ds.reduce((a, b) => a + b, 0) + carry;
      steps.push({ place: placeAt(i), ds, carryIn: carry, sum: s, digit: s % 10, carryOut: Math.floor(s / 10) });
      carry = Math.floor(s / 10);
      if (i > 0) carries[i - 1] = carry;
    }
    return { F, W, steps, carries, finalCarry: carry };
  }
  // Column subtraction (top − bottom, top ≥ bottom): per-column steps and the regrouped top digits.
  function colSub(a, b) {
    const { F, W, rows, placeAt } = align([a, b]);
    const top = [...rows[0]].map(Number), bot = [...rows[1]].map(Number);
    const used = top.slice(), steps = [];
    let borrow = 0;
    for (let i = W + F - 1; i >= 0; i--) {
      let t = top[i] - borrow; const before = t;
      const regroup = t < bot[i];
      if (regroup) { t += 10; borrow = 1; } else borrow = 0;
      used[i] = t;
      steps.push({ place: placeAt(i), orig: top[i], before, t, b: bot[i], regroup, digit: t - bot[i] });
    }
    if (borrow) throw new Error(`colSub: ${a} < ${b}`);
    return { F, W, top, used, steps };
  }
  const placeCount = (s) => parts(s).f.length;
  const wholeDigits = (s) => String(s).replace('.', '').replace(/^0+(?=\d)/, '');
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  const pow10 = (k) => 10n ** BigInt(k);
  function roundTo(v, P) {               // round half up to P places (P = 0 → whole number)
    const unit = pow10(SCALE - P), down = v - (v % unit);
    return (v % unit) * 2n >= unit ? down + unit : down;
  }

  // ---------- calculators: each returns [answer, worked step] ----------
  const CALC = {
    whole: (n) => [parts(n).w, `The digits left of the decimal point are the whole-number part: ${parts(n).w}.`],
    decpart: (n) => ['0.' + parts(n).f, `The digits right of the decimal point are the part less than one: 0.${parts(n).f}.`],
    between: (n) => { const w = BigInt(parts(n).w); return [`${w} and ${w + 1n}`, `${n} is ${w} wholes and a part less than one, so it is between ${w} and ${w + 1n}.`]; },
    place: (n, d) => { const p = locate(n, d); return [p, `In ${n}, the ${d} is in the ${p} place.`]; },
    value: (n, d) => { const p = locate(n, d), v = valueOf(d, p); return [v, `The ${d} is in the ${p} place: ${unitName(d, p)} = ${v}.`]; },
    digit: (n, k) => { const want = KEY[k] || k; const hit = digitsOf(n).find(([, p]) => p === want); if (!hit) throw new Error(`${n} has no ${want} digit`); return [hit[0], `The ${want} digit of ${n} is ${hit[0]}.`]; },
    // value of the same digit in two numbers: how many times as much is the first?
    times: (a, b) => {
      const q = D(a) * ONE / D(b); if (q % ONE) throw new Error('times must be whole');
      const k = fmt(q).length - 1;
      if (!/^10*$/.test(fmt(q))) throw new Error('times must be a power of 10');
      const placeOf = (x) => { const ds = digitsOf(x).filter(([c]) => c !== '0'); return ds[0][1]; };
      const chain = Array(k).fill('10').join(' × ');
      return [fmt(q), `${placeOf(a)} vs ${placeOf(b)}: the digit is ${k} place${k > 1 ? 's' : ''} to the left, so ${k > 1 ? chain + ' = ' : ''}${fmt(q)} times as much.`];
    },
    // "3 t h" → how many hundredths are in 3 tenths
    convert: (n, from, to) => {
      const a = mul(D(n), D(UNIT_VALUE[KEY[from]])), q = a * ONE / D(UNIT_VALUE[KEY[to]]);
      const nm = (k, x) => (x === '1' ? PLACE_ONE[KEY[k]] : KEY[k]);
      const ORDER = ['tens', 'ones', 't', 'h', 'th'];
      const step = ORDER.indexOf(to) - ORDER.indexOf(from);
      if (step > 0) {
        const chain = [];
        for (let i = 0; i <= step; i++) { const unit = ORDER[ORDER.indexOf(from) + i]; const c = fmt(D(n) * 10n ** BigInt(i)); chain.push(`${c} ${nm(unit, c)}`); }
        return [fmt(q), `Each smaller place needs 10 times as many: ${chain.join(' = ')}.`];
      }
      return [fmt(q), `Group by 10s: ${n} ${nm(from, n)} = ${fmt(q)} group${fmt(q) === '1' ? '' : 's'} of 10 ${KEY[from]} = ${fmt(q)} ${nm(to, fmt(q))}.`];
    },
    expanded: (n) => {
      const ds = digitsOf(n), nz = ds.filter(([c]) => c !== '0');
      const zeroPlaces = ds.filter(([c, p], i) => c === '0' && !(p === 'ones' && i === 0)).map(([, p]) => p);
      return [nz.map(([c, p]) => valueOf(c, p)).join(' + '),
        nz.map(([c, p]) => unitName(c, p)).join(', ') + (zeroPlaces.length ? ` (${zeroPlaces.length > 1 ? 'the 0s' : 'the 0'} in the ${zeroPlaces.join(' and ')} place${zeroPlaces.length > 1 ? 's add' : ' adds'} nothing)` : '') + '.'];
    },
    standard: (...terms) => {
      const ts = terms.join('').split('+');
      const sum = ts.reduce((s, t) => s + D(t), 0n);
      return [fmt(sum), `Put each value in its place: ${ts.join(' + ')} = ${fmt(sum)}.`];
    },
    // a number from chart digits in the question (data-digits on its chart)
    chart: (q) => {
      const ch = q.querySelector('[data-model="chart"][data-digits]');
      if (!ch) throw new Error('chart question needs a chart with data-digits');
      const d = Object.fromEntries(ch.dataset.digits.split(',').map((kv) => kv.split(':')));
      const cols = (ch.dataset.cols || 'ones,t,h,th').split(',');
      let s = 0n;
      for (const c of cols) s += mul(D(d[c] || "0"), D(UNIT_VALUE[KEY[c]]));
      const last = Math.max(...cols.map((c, i) => (d[c] ? i : -1)));
      const places = Math.max(0, last - cols.indexOf('ones'));
      const used = cols.slice(0, cols.indexOf('ones') + places + 1);
      const parts2 = used.map((c) => (d[c] ? unitName(d[c], KEY[c]) : null)).filter(Boolean);
      const empty = used.filter((c) => !d[c] && c !== 'ones' && c !== 'tens').map((c) => KEY[c]);
      return [fmt(s, places), parts2.join(', ') + (empty.length ? `; the empty ${empty.join(' and ')} place gets a 0` : '') + ` → ${fmt(s, places)}.`];
    },
    model: (q) => {
      const m = q.querySelector('[data-model][data-value]:not([data-blank])');
      if (!m) throw new Error('model question needs a model');
      const v = D(m.dataset.value), th = Number(v / (ONE / 1000n));
      if (m.dataset.model === 'strip' || m.dataset.model === 'bar') return [m.dataset.value, `${th / 100} of 10 equal parts shaded = ${th / 100} tenths.`];
      const cols = Math.floor(th / 100), sq = Math.floor(th / 10) % 10, sl = th % 10;
      const bits = [`${cols} full column${cols === 1 ? '' : 's'} = ${cols} tenth${cols === 1 ? '' : 's'}`];
      if (sq || sl) bits.push(`${sq} extra square${sq === 1 ? '' : 's'} = ${sq} hundredth${sq === 1 ? '' : 's'}`);
      if (sl) bits.push(`${sl} slice${sl === 1 ? '' : 's'} = ${sl} thousandth${sl === 1 ? '' : 's'}`);
      return [m.dataset.value, bits.join(', ') + '.'];
    },
    same: (a, b) => (D(a) === D(b)
      ? ['yes', `${a} = ${b}: zeros added after the last decimal digit do not change the value.`]
      : ['no', `${a} ≠ ${b}: the digits are in different places.`]),
    // Compare: line up the places and find the first place where the digits differ.
    cmp: (a, b) => {
      const x = D(a), y = D(b); const s = x > y ? '>' : x < y ? '<' : '=';
      if (s === '=') return [s, `${a} = ${b}: written with the same number of places, the digits are all the same.`];
      const n = Math.max(parts(a).f.length, parts(b).f.length);
      const pa = fmt(x, n), pb = fmt(y, n);
      const da = digitsOf(pa), db = digitsOf(pb);
      if (da.length !== db.length) return [s, `${s === '>' ? a : b} has the bigger whole-number part.`];
      const i = da.findIndex(([c], k) => c !== db[k][0]);
      return [s, `Write ${pa} and ${pb}. First different place: ${da[i][1]}, ${da[i][0]} ${s} ${db[i][0]}. So ${a} ${s} ${b}.`];
    },
    // Order a list: "order asc 0.5 0.45 0.405"
    order: (dir, ...xs) => {
      if (new Set(xs.map((v) => String(D(v)))).size !== xs.length) throw new Error('order needs different values');
      const sorted = [...xs].sort((p, q) => (D(p) < D(q) ? -1 : D(p) > D(q) ? 1 : 0));
      if (dir === 'desc') sorted.reverse();
      const n = Math.max(...xs.map((v) => parts(v).f.length));
      return [sorted.join(', '), `With ${n} decimal place${n === 1 ? '' : 's'}: ${sorted.map((v) => fmt(D(v), n)).join(dir === 'desc' ? ' > ' : ' < ')}.`];
    },
    // Rounding: "round 4.735 t" (place = whole | t | h)
    round: (n, place) => {
      const P = { whole: 0, t: 1, h: 2 }[place];
      if (P == null) throw new Error('round place: ' + place);
      const name = ['ones', 'tenths', 'hundredths'][P];
      const { w, f } = parts(n);
      const rd = P === 0 ? w[w.length - 1] : f[P - 1], next = f[P] || '0';
      const r = fmt(roundTo(D(n), P), P);
      const up = Number(next) >= 5;
      return [r, `Rounding digit: ${rd} (${name}). Digit to its right: ${next}, ${up ? '5 or more, so round up' : 'less than 5, so keep'} → ${r}.`];
    },
    // Addition: "add 3.45 2.27"
    add: (...xs) => {
      const c = colAdd(xs), sum = fmt(xs.reduce((s, x) => s + D(x), 0n), c.F);
      const padNote = xs.some((x) => placeCount(x) < c.F) ? `Line up the points; write ${xs.map((x) => fmt(D(x), c.F)).join(' and ')}. ` : 'Line up the points. ';
      const cols = c.steps.filter((s, i) => i < c.F || s.sum > 0).map((s) =>
        `${s.place[0].toUpperCase() + s.place.slice(1)}: ${s.ds.join(' + ')}${s.carryIn ? ' + ' + s.carryIn + ' (carried)' : ''} = ${s.sum}${s.carryOut ? `, write ${s.digit}, carry ${s.carryOut}` : ''}.`);
      if (c.finalCarry) cols.push(`Write the carried ${c.finalCarry} in the next place on the left.`);
      const simple = fmt(D(sum));
      return [sum, padNote + cols.join(' ') + ` → ${sum}${simple !== sum ? ' = ' + simple : ''}.`];
    },
    // Subtraction: "sub 8.20 3.76"
    sub: (a, b) => {
      const c = colSub(a, b), diff = fmt(D(a) - D(b), c.F);
      const pad = placeCount(a) !== placeCount(b) ? `Line up the points; write ${fmt(D(a), c.F)} − ${fmt(D(b), c.F)}. ` : 'Line up the points. ';
      const cols = c.steps.filter((s, i) => i < c.F || s.t || s.b).map((s) => {
        const P = s.place[0].toUpperCase() + s.place.slice(1);
        if (s.before < 0) return `${P}: the 0 was regrouped to 10, then gave 1 away, so it is 9: ${s.t} − ${s.b} = ${s.digit}.`;
        const was = s.before !== s.orig ? ` (${s.orig} became ${s.before})` : '';
        return s.regroup ? `${P}${was}: ${s.before} < ${s.b}, regroup: ${s.t} − ${s.b} = ${s.digit}.` : `${P}${was}: ${s.t} − ${s.b} = ${s.digit}.`;
      });
      return [diff, pad + cols.join(' ') + ` → ${diff}.`];
    },
    // Multiplication: "mul 2.4 3"
    mul: (a, b) => {
      const p = mul(D(a), D(b)), P = placeCount(a) + placeCount(b);
      const A = wholeDigits(a), B = wholeDigits(b), prod = (BigInt(A) * BigInt(B)).toString();
      const placed = fmt(p, P), ans = fmt(p);
      const note = P ? ` Decimal places: ${placeCount(a)} + ${placeCount(b)} = ${P}, so ${prod} → ${placed}${placed !== ans ? ' = ' + ans : ''}.` : '';
      return [ans, `Multiply as whole numbers: ${A} × ${B} = ${prod}.${note}`];
    },
    // × or ÷ by 10, 100, 1000: "x10 3.45 100", "d10 34.5 100"
    x10: (n, p) => {
      const k = p.length - 1, ans = fmt(D(n) * BigInt(p));
      return [ans, `× ${p}: each digit moves ${plural(k, 'place')} to the left (the point moves ${k} right): ${n} → ${ans}.`];
    },
    d10: (n, p) => {
      const k = p.length - 1, q = D(n) / BigInt(p);
      if (q * BigInt(p) !== D(n)) throw new Error('d10 not exact');
      const ans = fmt(q);
      return [ans, `÷ ${p}: each digit moves ${plural(k, 'place')} to the right (the point moves ${k} left): ${n} → ${ans}.`];
    },
    // Division: "div 6.4 2"
    div: (a, b) => {
      const x = D(a), y = D(b);
      if ((x * ONE) % y) throw new Error(`div ${a} ÷ ${b} is not exact`);
      const q = x * ONE / y, ans = fmt(q);
      if (placeCount(ans) > 3) throw new Error('div answer has more than 3 places');
      const k = placeCount(b);
      if (k) {
        const a2 = fmt(x * pow10(k)), b2 = fmt(y * pow10(k));
        return [ans, `Multiply both numbers by ${10 ** k}: ${a} ÷ ${b} = ${a2} ÷ ${b2} = ${ans}. Check: ${ans} × ${b} = ${a}.`];
      }
      const zeros = placeCount(ans) > placeCount(a) ? `Write ${a} as ${fmt(x, placeCount(ans))} so you can keep dividing. ` : '';
      return [ans, `${zeros}${a} ÷ ${b} = ${ans}. Check: ${ans} × ${b} = ${fmt(x)}.`];
    },
    // Estimate by rounding each number to the nearest whole: "est + 3.45 2.27"
    est: (op, a, b) => {
      const ra = fmt(roundTo(D(a), 0), 0), rb = fmt(roundTo(D(b), 0), 0);
      const A = Number(ra), B = Number(rb);
      const v = { '+': A + B, '-': A - B, x: A * B }[op];
      if (v == null) throw new Error('est op');
      const sym = { '+': '+', '-': '−', x: '×' }[op];
      return [String(v), `Round each number to the nearest whole: ${a} ≈ ${ra}, ${b} ≈ ${rb}. ${ra} ${sym} ${rb} = ${v}.`];
    },
    // Word form and back
    words: (n) => [wordForm(n), wordWhy(n)],
    fromwords: (n) => {
      const { w, f } = parts(n), k = String(Number(f)), place = LAST[f.length][1];
      const whole = Number(w) ? `Before “and”: ${w}.` : 'No “and”, so 0 wholes.';
      const pad = k.length < f.length ? `; ${k} has ${k.length} digit${k.length > 1 ? 's' : ''}, so write ${f.length - k.length === 1 ? 'a 0' : (f.length - k.length) + ' zeros'} first` : `: ${k} fills them`;
      return [fmt(D(n), f.length), `${whole} ${place[0].toUpperCase() + place.slice(1)} = ${f.length} place${f.length > 1 ? 's' : ''} after the point${pad} → ${fmt(D(n), f.length)}.`];
    },
    // expanded form → word form: add the parts to get standard form, then read it
    expwords: (n) => [wordForm(n), `${CALC.expanded(n)[0]} = ${n}; ${wordWhy(n)[0].toLowerCase() + wordWhy(n).slice(1)}`],
  };

  // ---------- word form ----------
  const ONES_W = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen',
    'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const TENS_W = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  function intWords(n) {
    if (n < 20) return ONES_W[n];
    if (n < 100) return TENS_W[Math.floor(n / 10)] + (n % 10 ? '-' + ONES_W[n % 10] : '');
    if (n < 1000) return ONES_W[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + intWords(n % 100) : '');
    throw new Error('word form up to 999: ' + n);
  }
  const LAST = [null, ['tenth', 'tenths'], ['hundredth', 'hundredths'], ['thousandth', 'thousandths']];
  function wordForm(n) {
    const { w, f } = parts(n);
    if (!f) return intWords(Number(w));
    const k = Number(f), dec = `${intWords(k)} ${LAST[f.length][k === 1 ? 0 : 1]}`;
    return Number(w) ? `${intWords(Number(w))} and ${dec}` : dec;
  }
  function wordWhy(n) {
    const { w, f } = parts(n);
    const read = `read ${Number(f)}, then say the place of the last digit: ${LAST[f.length][1]}.`;
    return Number(w) ? `${Number(w)} whole${Number(w) === 1 ? '' : 's'}, then “and” for the point; ${read}` : read[0].toUpperCase() + read.slice(1);
  }
  // Fill any <span data-words="4.735"></span> with the number's word form.
  document.querySelectorAll('[data-words]').forEach((el) => { el.textContent = wordForm(el.dataset.words); });
  // Fill any <span data-expanded="0.34"></span> with the number's expanded form (0.3 + 0.04).
  document.querySelectorAll('[data-expanded]').forEach((el) => { el.textContent = CALC.expanded(el.dataset.expanded)[0]; });

  // ---------- expressions written from the calculation ----------
  // <span data-expr></span> inside a question shows that question's calculation ("3.45 + 2.27");
  // <span data-expr="add 3.45 2.27"></span> shows a given one. The printed problem can never differ from the answer.
  const EXPR = {
    add: (...xs) => xs.join(' + '), sub: (a, b) => `${a} − ${b}`, mul: (a, b) => `${a} × ${b}`, div: (a, b) => `${a} ÷ ${b}`,
    x10: (n, p) => `${n} × ${p}`, d10: (n, p) => `${n} ÷ ${p}`, round: (n) => n,
    est: (op, a, b) => `${a} ${{ '+': '+', '-': '−', x: '×' }[op]} ${b}`,
  };
  document.querySelectorAll('[data-expr]').forEach((el) => {
    const src = el.dataset.expr || (el.closest('[data-calc]') || {}).dataset?.calc;
    if (!src) throw new Error('data-expr without a calculation');
    const [name, ...args] = src.trim().split(/\s+/);
    if (!EXPR[name]) throw new Error('no expression for ' + name);
    el.textContent = EXPR[name](...args);
  });

  // ---------- compact cards ----------
  // <div class="card q" data-calc="...">prompt</div> becomes: number badge + prompt, work space, answer line.
  // Options: data-ans="Answer label" (default "Answer"), data-fill="ww" (a long answer line), data-ans="none" (no line),
  // data-work="none" (no dotted work space, e.g. when the card has a model to shade).
  document.querySelectorAll('.card.q').forEach((c) => {
    if (c.querySelector(':scope > .top')) return;
    // Children with class "below" (e.g. a chart) go under the prompt at full card width.
    const below = [...c.querySelectorAll(':scope > .below')].map((e) => { e.remove(); return e.outerHTML; }).join('');
    const prompt = c.innerHTML;
    const lbl = c.dataset.ans || 'Answer';
    c.innerHTML = `<div class="top"><span class="q-n"></span><div class="prompt">${prompt}</div></div>` + below +
      (c.dataset.work === 'none' ? '' : '<div class="work"></div>') +
      (lbl === 'none' ? '' : `<div class="ans">${lbl} <span class="fill ${c.dataset.fill || ''}"></span>${c.dataset.unit ? ' ' + c.dataset.unit : ''}</div>`);
  });

  // ---------- run ----------
  const errors = [], all = [];
  function solve(q) {
    if (q.dataset.calc) {
      const [name, ...args] = q.dataset.calc.trim().split(/\s+/);
      const fn = CALC[name];
      if (!fn) throw new Error('unknown calc ' + name);
      const [ans, why] = (name === 'chart' || name === 'model') ? fn(q) : fn(...args);
      if (q.dataset.answer && q.dataset.answer !== ans) throw new Error(`written answer "${q.dataset.answer}" ≠ computed "${ans}"`);
      return { ans, why: q.dataset.why || why };
    }
    if (q.dataset.answer) return { ans: q.dataset.answer, why: q.dataset.why || '' };
    throw new Error('no data-calc or data-answer');
  }

  document.querySelectorAll('[data-skill]').forEach((sk) => {
    let n = 0;
    sk.querySelectorAll('.q').forEach((q) => {
      const isTry = q.classList.contains('try');
      const label = isTry ? 'Try' : String(++n);
      q.dataset.q = sk.dataset.skill + '-' + label;
      const badge = q.querySelector('.q-n');
      if (badge && !isTry) badge.textContent = label;
      try {
        const r = solve(q);
        all.push({ skill: sk.dataset.skill, title: sk.dataset.title || '', label, isTry, ...r });
      } catch (e) {
        errors.push(`${q.dataset.q}: ${e.message}`);
        q.style.outline = '3px solid red';
      }
    });
  });

  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  document.querySelectorAll('[data-key-for]').forEach((box) => {
    const want = box.dataset.keyFor.split(',');
    const skills = [...new Set(all.map((a) => a.skill))].filter((s) => want.includes('all') || want.includes(s));
    box.innerHTML = skills.map((s) => {
      const items = all.filter((a) => a.skill === s);
      return `<section class="key-skill"><h4><span class="key-badge">${esc(s)}</span>${esc(items[0].title)}</h4><ol class="key-list">` +
        items.map((a) => `<li data-for="${esc(s)}-${esc(a.label)}"><span class="kn${a.isTry ? ' try' : ''}">${esc(a.label)}</span><span><b class="ka">${esc(a.ans)}</b>${a.why ? ' <span class="kw">' + esc(a.why) + '</span>' : ''}</span></li>`).join('') +
        '</ol></section>';
    }).join('');
  });

  window.__practice = { errors, count: all.filter((a) => !a.isTry).length, tries: all.filter((a) => a.isTry).length, items: all };
  window.StudyMath = { D, fmt, CALC, colAdd, colSub, align, parts };
})();
