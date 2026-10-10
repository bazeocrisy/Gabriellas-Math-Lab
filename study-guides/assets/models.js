// Draws the decimal models for a study guide. Write a placeholder in the lesson HTML, e.g.
//   <div data-model="grid" data-value="0.34"></div>
// and this script replaces its contents with an SVG built from that exact value, so a picture can never
// disagree with its number. Values are parsed as strings into whole thousandths (no floating point).
//
// Models
//   strip  data-value (tenths, 0–1)        a bar cut into 10 equal parts, the first parts shaded
//   bar    data-value (tenths)             same as strip, drawn as a chocolate bar
//   grid   data-value (to thousandths)     10x10 grid; shades one column (one tenth) at a time, top to bottom.
//                                          A thousandths digit splits the next square into 10 slices, with a zoom.
//   line   data-from, data-to, data-point  number line cut into 10 equal jumps; data-ticks="1" labels each tick
//   chart  data-value                      place-value chart (ones . tenths hundredths thousandths)
// Common options: data-size (px width of the main shape), data-blank="1" (no shading: for students to shade),
//   data-color="2" (second shading color), data-cols (chart columns, e.g. "ones,t,h").
(function () {
  'use strict';

  function parse(s) {
    const m = /^(\d+)(?:\.(\d{1,3}))?$/.exec(String(s).trim());
    if (!m) throw new Error('Not a decimal (max 3 places): ' + s);
    const frac = (m[2] || '').padEnd(3, '0');
    return { thou: Number(m[1]) * 1000 + Number(frac), whole: m[1], frac: m[2] || '', places: (m[2] || '').length };
  }
  const fromThou = (k, places) => {
    const w = Math.floor(k / 1000), f = String(k % 1000).padStart(3, '0');
    const p = places == null ? f.replace(/0+$/, '').length : places;
    return p ? w + '.' + f.slice(0, p) : String(w);
  };
  // A second compared amount (class on2) is hatched with diagonal lines, so it differs from the first even
  // in grayscale. The lines are real vectors (an SVG <pattern> becomes bitmap tiles in Chrome's PDF).
  // They follow X + Y = k*S across the whole drawing, so the stripes line up from cell to cell.
  const S = 4;
  function hatchRect(x, y, w, h) {
    let out = '';
    for (let k = Math.ceil((x + y) / S) * S; k < x + y + w + h; k += S) {
      const x1 = Math.max(x, k - (y + h)), x2 = Math.min(x + w, k - y);
      if (x2 - x1 > 0.05) out += `<line class="hatch" x1="${x1.toFixed(2)}" y1="${(k - x1).toFixed(2)}" x2="${x2.toFixed(2)}" y2="${(k - x2).toFixed(2)}"/>`;
    }
    return out;
  }
  const svg = (w, h, body, label, extra = '') => {
    body = body.replace(/<rect class="([^"]*\bon2\b[^"]*)" x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"\/>/g,
      (m, c, x, y, w2, h2) => m + hatchRect(+x, +y, +w2, +h2));
    return `<svg class="m" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" ${extra}>${body}</svg>`;
  };

  function strip(el, v) {
    const k = v.thou;
    if (k % 100 || k > 1000) throw new Error('strip needs tenths from 0 to 1: ' + el.dataset.value);
    const n = el.dataset.blank ? 0 : k / 100, W = +(el.dataset.size || 300), cw = W / 10, H = +(el.dataset.h || Math.max(34, cw * 1.25));
    const cls = el.dataset.color === '2' ? 'on2' : 'on';
    let b = '';
    for (let i = 0; i < 10; i++) b += `<rect class="cell ${i < n ? cls : 'off'}" x="${2 + i * cw}" y="2" width="${cw}" height="${H}"/>`;
    for (let i = 1; i < 10; i++) b += `<line class="col" x1="${2 + i * cw}" y1="2" x2="${2 + i * cw}" y2="${H + 2}"/>`;
    b += `<rect class="m-frame" x="2" y="2" width="${W}" height="${H}"/>`;
    if (el.dataset.labels) for (let i = 0; i < 10; i++) b += `<text x="${2 + i * cw + cw / 2}" y="${H + 16}" text-anchor="middle" font-size="9">0.1</text>`;
    return svg(W + 4, H + (el.dataset.labels ? 22 : 4), b, `A bar cut into 10 equal parts with ${n} shaded`);
  }

  function bar(el, v) {
    const k = v.thou;
    if (k % 100 || k > 1000) throw new Error('bar needs tenths: ' + el.dataset.value);
    const n = k / 100, W = +(el.dataset.size || 300), cw = W / 10, H = cw * 1.6;
    const light = !!el.dataset.light; // light pieces a pencil mark shows up on (worksheet items)
    let b = `<rect x="0" y="0" width="${W + 8}" height="${H + 8}" rx="6" fill="${light ? '#a8754a' : '#7a4a2a'}"/>`;
    for (let i = 0; i < 10; i++) {
      const eaten = i >= 10 - (+(el.dataset.eaten || 0));
      b += `<rect x="${4 + i * cw + 1.5}" y="5.5" width="${cw - 3}" height="${H - 3}" rx="3" fill="${eaten ? '#fff' : light ? '#f1dcc2' : (i < n ? '#a8683f' : '#8d5531')}" stroke="${eaten ? '#c9b2a0' : '#5e351c'}" stroke-width="1" ${eaten ? 'stroke-dasharray="3 2"' : ''}/>`;
      if (!eaten && !light) b += `<rect x="${4 + i * cw + 5}" y="9" width="${cw - 10}" height="${H * 0.28}" rx="2" fill="#ffffff" opacity="0.13"/>`;
    }
    return svg(W + 8, H + 8, b, 'A chocolate bar made of 10 equal pieces');
  }

  function grid(el, v) {
    const k = v.thou;
    if (k > 1000) throw new Error('grid needs a value from 0 to 1: ' + el.dataset.value);
    const S = +(el.dataset.size || 180), c = S / 10;
    const blank = !!el.dataset.blank;
    const sq = blank ? 0 : Math.floor(k / 10), slices = blank ? 0 : k % 10;
    const cls = el.dataset.color === '2' ? 'on2' : 'on';
    let b = '';
    for (let i = 0; i < 100; i++) {
      const col = Math.floor(i / 10), row = i % 10;
      b += `<rect class="cell ${i < sq ? cls : 'off'}" x="${2 + col * c}" y="${2 + row * c}" width="${c}" height="${c}"/>`;
    }
    for (let i = 1; i < 10; i++) b += `<line class="col" x1="${2 + i * c}" y1="2" x2="${2 + i * c}" y2="${S + 2}"/>`;
    let W = S + 4;
    if (slices) {
      const col = Math.floor(sq / 10), row = sq % 10, x = 2 + col * c, y = 2 + row * c;
      for (let s = 0; s < slices; s++) b += `<rect class="${cls}" x="${x + s * c / 10}" y="${y}" width="${c / 10}" height="${c}"/>`;
      b += `<rect class="focus" x="${x}" y="${y}" width="${c}" height="${c}"/>`;
      const Z = S * 0.55, zx = S + 34, zy = (S - Z) / 2 + 2;
      for (let s = 0; s < 10; s++) b += `<rect class="cell ${s < slices ? cls : 'off'}" x="${zx + s * Z / 10}" y="${zy}" width="${Z / 10}" height="${Z}"/>`;
      b += `<rect class="focus" x="${zx}" y="${zy}" width="${Z}" height="${Z}"/>`;
      b += `<line class="zoom" x1="${x + c}" y1="${y}" x2="${zx}" y2="${zy}"/><line class="zoom" x1="${x + c}" y1="${y + c}" x2="${zx}" y2="${zy + Z}"/>`;
      // Caption under the zoom; the SVG is widened so the caption is never wider than the drawing.
      const fs = Math.max(8, Math.min(9.5, S / 13)), half = Z / 2; // fit() widens the SVG to the caption
      b += `<text x="${zx + Z / 2}" y="${zy + Z + fs + 5}" text-anchor="middle" font-size="${fs}">1 square, zoomed:</text>`;
      b += `<text x="${zx + Z / 2}" y="${zy + Z + 2 * fs + 8}" text-anchor="middle" font-size="${fs}" font-weight="600">10 thousandths</text>`;
      W = zx + Z / 2 + half + 4;
    }
    b += `<rect class="m-frame" x="2" y="2" width="${S}" height="${S}"/>`;
    return svg(W, S + 4, b, blank ? 'An empty 10 by 10 grid' : `A 10 by 10 grid with ${sq} squares${slices ? ' and ' + slices + ' thousandths' : ''} shaded`);
  }

  function line(el) {
    const a = parse(el.dataset.from).thou, z = parse(el.dataset.to).thou;
    const step = (z - a) / 10;
    if (!Number.isInteger(step) || step <= 0) throw new Error('line needs 10 whole-thousandth jumps');
    const W = +(el.dataset.size || 420), x0 = 18, x1 = W - 18, y = 34;
    const X = (t) => x0 + (t - a) / (z - a) * (x1 - x0);
    const places = Math.max(parse(el.dataset.from).places, parse(el.dataset.to).places) + 1;
    let b = `<line class="axis" x1="${x0 - 12}" y1="${y}" x2="${x1 + 12}" y2="${y}"/>`;
    b += `<path d="M${x1 + 16} ${y} l-7 -4.5 v9z" fill="var(--ink)"/><path d="M${x0 - 16} ${y} l7 -4.5 v9z" fill="var(--ink)"/>`;
    for (let i = 0; i <= 10; i++) {
      const t = a + i * step, x = X(t), big = i === 0 || i === 10 || i === 5;
      b += `<line class="tick" x1="${x}" y1="${y - (big ? 10 : 6)}" x2="${x}" y2="${y + (big ? 10 : 6)}"/>`;
      const lab = i === 0 || i === 10 || el.dataset.ticks;
      if (lab) b += `<text x="${x}" y="${y + 26}" text-anchor="middle" class="${i % 10 ? '' : 'lbl'}" font-size="${i % 10 ? 9.5 : 11.5}">${fromThou(t, i % 10 ? places : undefined)}</text>`;
    }
    // One point (data-point + data-point-label) or several (data-points="0.35:A,0.4:B").
    const pts = el.dataset.points ? el.dataset.points.split(',').map((s) => s.split(':'))
      : el.dataset.point ? [[el.dataset.point, el.dataset.pointLabel || 'P']] : [];
    if (!el.dataset.blank) pts.forEach(([v, label], i) => {
      const p = parse(v).thou;
      if (p < a || p > z || (p - a) % step) throw new Error('point not on a tick: ' + v);
      b += `<circle class="${i % 2 ? 'dot2' : 'dot'}" cx="${X(p)}" cy="${y}" r="6.5"/><text x="${X(p)}" y="${y - 14}" text-anchor="middle" class="lbl" font-size="12">${label}</text>`;
    });
    return svg(W, 66, b, `A number line from ${el.dataset.from} to ${el.dataset.to} cut into 10 equal jumps`);
  }

  // Place-value chart. data-value fills the digits from a number; data-digits="ones:4,h:3" fills chosen cells
  // (empty cells stay blank, for chart-reading questions). data-cols picks columns (default ones,t,h,th; add "tens").
  // data-hi="t" highlights one place; data-values="1" adds a row with each digit's value (7 tenths = 0.7).
  const COLS = {
    tens: ['Tens', '10', 'pv-tens', 10000], ones: ['Ones', '1', 'pv-ones', 1000], t: ['Tenths', '0.1', 'pv-t', 100],
    h: ['Hundredths', '0.01', 'pv-h', 10], th: ['Thousandths', '0.001', 'pv-th', 1],
  };
  const UNIT = { tens: ['ten', 'tens'], ones: ['one', 'ones'], t: ['tenth', 'tenths'], h: ['hundredth', 'hundredths'], th: ['thousandth', 'thousandths'] };
  function chart(el) {
    const cols = (el.dataset.cols || 'ones,t,h,th').split(',');
    let digits = {};
    if (el.dataset.value && !el.dataset.blank) {
      const v = parse(el.dataset.value), f = v.frac, w = v.whole.padStart(2, ' ');
      if (v.whole.length > 2) throw new Error('chart supports up to tens: ' + el.dataset.value);
      digits = { tens: w[0].trim(), ones: w[1], t: f[0] || '', h: f[1] || '', th: f[2] || '' };
      if (digits.tens && !cols.includes('tens')) throw new Error('number needs a tens column: ' + el.dataset.value);
    }
    if (el.dataset.digits) for (const kv of el.dataset.digits.split(',')) { const [k, d] = kv.split(':'); digits[k] = d; }
    const hi = el.dataset.hi;
    const dot = (c, i) => c !== 'tens' && c !== 'ones' && (cols[i - 1] === 'ones');
    const cls = (c) => COLS[c][2] + (hi ? (hi === c ? ' pv-on' : ' pv-dim') : '');
    const head = cols.map((c, i) => (dot(c, i) ? '<th class="pv-dot"></th>' : '') + `<th class="${cls(c)}">${COLS[c][0]}<small>${COLS[c][1]}</small></th>`).join('');
    const row = cols.map((c, i) => (dot(c, i) ? '<td class="pv-dot">.</td>' : '') + `<td class="${cls(c)}">${digits[c] ?? ''}</td>`).join('');
    let vals = '';
    if (el.dataset.values) {
      vals = '<tr class="pv-vals">' + cols.map((c, i) => {
        const d = digits[c];
        const txt = d === '' || d == null ? '' : `${d} ${UNIT[c][d === '1' ? 0 : 1]}<b>${fromThou(+d * COLS[c][3])}</b>`;
        return (dot(c, i) ? '<td class="pv-dot"></td>' : '') + `<td class="${cls(c)}">${txt}</td>`;
      }).join('') + '</tr>';
    }
    return `<table class="pv${el.dataset.xs ? ' xs' : ''}${el.dataset.sm ? ' sm' : ''}${el.dataset.blank ? ' empty' : ''}"><thead><tr>${head}</tr></thead><tbody><tr>${row}</tr>${vals}</tbody></table>`;
  }

  // Column (stacked) arithmetic. data-op="+" | "-" | "x", data-nums="3.45,2.27".
  // data-show="1" shows carries / regrouping and the answer (Show How); otherwise the answer row is empty boxes.
  // data-pad="1" shows placeholder zeros (in gray) so every number has the same number of places.
  // + and − line up on the decimal point; × lines up on the right (multiply as whole numbers first).
  function column(el) {
    const SM = window.StudyMath;
    // Without data-nums/data-op, use the question's own calculation (data-calc="add 3.45 2.27").
    let nums = el.dataset.nums && el.dataset.nums.split(','), op = el.dataset.op;
    if (!nums) {
      const [name, ...args] = el.closest('[data-calc]').dataset.calc.trim().split(/\s+/);
      op = { add: '+', sub: '-', mul: 'x' }[name]; nums = args;
    }
    const show = !!el.dataset.show;
    const sym = { '+': '+', '-': '−', x: '×' }[op];
    if (!sym) throw new Error('column op ' + op);
    const cell = (c, cls = '') => `<td class="${cls}">${c}</td>`;
    let rowsHtml = [], top = '', ans = '';
    if (op === 'x') {
      if (nums.length !== 2) throw new Error('column × needs two numbers');
      const prod = SM.CALC.mul(nums[0], nums[1])[0];
      const P = nums[0].split('.')[1]?.length || 0, Q = nums[1].split('.')[1]?.length || 0;
      const placed = SM.fmt(SM.D(prod), P + Q);
      const width = Math.max(...nums.map((n) => n.length), placed.length) + 1;
      const row = (s, first = '') => '<tr>' + cell(first, 'op') + [...s.padStart(width - 1, ' ')].map((ch) => cell(ch === ' ' ? '' : ch, ch === '.' ? 'pt' : '')).join('') + '</tr>';
      rowsHtml.push(row(nums[0]), row(nums[1], sym));
      ans = show ? row(placed).replace('<tr>', '<tr class="res">') : '<tr class="res">' + cell('', 'op') + Array(width - 1).fill('<td class="box"></td>').join('') + '</tr>';
    } else {
      const al = SM.align(nums), F = al.F;
      const result = op === '+' ? SM.CALC.add(...nums)[0] : SM.CALC.sub(nums[0], nums[1])[0];
      const W = Math.max(al.W, SM.parts(result).w.length);
      const pad = !!el.dataset.pad;
      const digitsRow = (n, first) => {
        const { w, f } = SM.parts(n);
        let h = cell(first || '', 'op');
        for (let i = 0; i < W; i++) { const k = i - (W - w.length); h += cell(k >= 0 ? w[k] : ''); }
        h += cell('.', 'pt');
        for (let i = 0; i < F; i++) h += i < f.length ? cell(f[i]) : cell(pad ? '0' : '', pad ? 'padz' : '');
        return h;
      };
      if (show) {
        let marks = Array(W + F).fill('');
        if (op === '+') {
          const c = SM.colAdd(nums), off = W - al.W;
          c.carries.forEach((v, i) => { if (v) marks[i + off] = String(v); });
          if (c.finalCarry && off) marks[0] = '';
          top = '<tr class="carry">' + cell('', 'op') + marks.slice(0, W).map((m) => cell(m)).join('') + cell('', 'pt') + marks.slice(W).map((m) => cell(m)).join('') + '</tr>';
        } else {
          const c = SM.colSub(nums[0], nums[1]), off = W - al.W;
          c.used.forEach((u, i) => { if (u !== c.top[i]) marks[i + off] = String(u); });
          top = '<tr class="carry">' + cell('', 'op') + marks.slice(0, W).map((m) => cell(m)).join('') + cell('', 'pt') + marks.slice(W).map((m) => cell(m)).join('') + '</tr>';
          // strike the regrouped digits in the top number
          el.dataset.strike = marks.map((m, i) => (m ? i : '')).filter((x) => x !== '').join(',');
        }
      }
      rowsHtml = nums.map((n, i) => '<tr>' + digitsRow(n, i === nums.length - 1 ? sym : '') + '</tr>');
      if (show && op === '-' && el.dataset.strike) {
        const strike = el.dataset.strike.split(',').map(Number);
        rowsHtml[0] = rowsHtml[0].replace(/<td class="([^"]*)">([^<]*)<\/td>/g, (() => { let j = -1; return (m, c, v) => {
          if (c === 'op') return m; if (c === 'pt') return m; j++; return strike.includes(j) ? `<td class="${c} struck">${v}</td>` : m; }; })());
      }
      if (show) {
        ans = '<tr class="res">' + digitsRow(result, '') + '</tr>';
      } else {
        ans = '<tr class="res">' + cell('', 'op') + Array(W).fill('<td class="box"></td>').join('') + cell('.', 'pt') + Array(F).fill('<td class="box"></td>').join('') + '</tr>';
      }
    }
    return `<table class="colm${show ? ' show' : ''}">${top}${rowsHtml.join('')}${ans}</table>`;
  }

  // Long division: data-a = dividend as written (e.g. "7.00"), data-b = divisor. data-show="1" writes the quotient.
  function longdiv(el) {
    const SM = window.StudyMath, a = el.dataset.a, b = el.dataset.b;
    const places = (a.split('.')[1] || '').length;
    const q = SM.CALC.div(a, b)[0];
    const qs = SM.fmt(SM.D(q), places);
    if ((qs.split('.')[1] || '').length !== places || SM.D(qs) !== SM.D(q)) throw new Error(`longdiv: write ${a} with enough places for ${q}`);
    const top = qs.padStart(a.length, ' ');
    const cells = (s, cls) => [...s].map((ch) => `<td class="${ch === '.' ? 'pt' : ''} ${cls}">${ch === ' ' ? '' : ch}</td>`).join('');
    const qrow = el.dataset.show ? cells(top, 'q') : [...a].map((ch) => `<td class="q ${ch === '.' ? 'pt' : 'qbox'}">${ch === '.' ? '.' : ''}</td>`).join('');
    return `<table class="ldiv"><tr><td class="dv"></td>${qrow}</tr><tr><td class="dv">${b}</td>${cells(a, 'dd')}</tr></table>`;
  }

  // Area model for decimal × decimal: a 10×10 grid. data-a tenths = columns (blue), data-b tenths = rows (hatched).
  // The overlap (dark) is the product.
  function area(el) {
    const a = parse(el.dataset.a).thou, b = parse(el.dataset.b).thou;
    if (a % 100 || b % 100 || a > 1000 || b > 1000) throw new Error('area model needs tenths from 0 to 1');
    const ca = a / 100, rb = b / 100, S = +(el.dataset.size || 160), c = S / 10;
    let body = '';
    for (let i = 0; i < 100; i++) {
      const col = Math.floor(i / 10), row = i % 10, inA = col < ca, inB = row < rb;
      const fill = inA && inB ? '#2d4f74' : inA ? 'var(--shade)' : inB ? 'var(--shade-2-wash)' : '#fff';
      body += `<rect class="cell" x="${2 + col * c}" y="${2 + row * c}" width="${c}" height="${c}" style="fill:${fill}"/>`;
    }
    body += `<rect class="m-frame" x="2" y="2" width="${S}" height="${S}"/>`;
    body += `<text x="${2 + ca * c / 2}" y="${S + 16}" text-anchor="middle" font-size="10" class="lbl">${el.dataset.a}</text>`;
    body += `<text x="${S + 8}" y="${2 + rb * c / 2 + 4}" font-size="10" class="lbl">${el.dataset.b}</text>`;
    return svg(S + 36, S + 22, body, `Area model: ${el.dataset.a} by ${el.dataset.b}; the overlap is ${ca * rb} hundredths`);
  }

  const MODELS = { strip, bar, grid, line, chart, column, longdiv, area };
  const errors = [];
  // Fit an SVG's box to everything drawn in it (labels included), so nothing can stick out of it.
  function fit(s) {
    const bb = s.getBBox(), w = +s.getAttribute('width'), h = +s.getAttribute('height');
    const x0 = Math.min(0, bb.x - 2), y0 = Math.min(0, bb.y - 2);
    const x1 = Math.max(w, bb.x + bb.width + 2), y1 = Math.max(h, bb.y + bb.height + 2);
    s.setAttribute('viewBox', `${x0} ${y0} ${x1 - x0} ${y1 - y0}`);
    s.setAttribute('width', x1 - x0); s.setAttribute('height', y1 - y0);
  }

  function draw() {
  document.querySelectorAll('[data-model]').forEach((el) => {
    try {
      const fn = MODELS[el.dataset.model];
      if (!fn) throw new Error('Unknown model ' + el.dataset.model);
      el.innerHTML = fn(el, el.dataset.value != null ? parse(el.dataset.value) : null);
      el.querySelectorAll('svg.m').forEach(fit);
    } catch (e) {
      errors.push(e.message);
      el.innerHTML = `<b style="color:red">MODEL ERROR: ${e.message}</b>`;
    }
  });
  window.__modelErrors = errors;
  window.__modelsReady = true;
  }
  // Text is measured to fit each SVG, so draw once the fonts have loaded.
  document.fonts.ready.then(draw);
  window.StudyGuide = { parse, fromThou };
})();
