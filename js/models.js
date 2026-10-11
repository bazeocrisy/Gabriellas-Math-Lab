// Visual models as SVG/HTML strings: tenths strip, hundredths grid (with optional thousandths zoom),
// number line, and place-value chart. Every picture is drawn from the exact numbers it is given.
(function (G) {
  'use strict';

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /** A bar cut into 10 equal parts, the first k shaded. */
  function strip(k, o = {}) {
    if (!(k >= 0 && k <= 10)) throw new Error('strip k: ' + k);
    const cells = [];
    for (let i = 0; i < 10; i++) {
      cells.push(`<rect x="${i * 30}" y="0" width="30" height="40" class="${i < k ? 'm-on' : 'm-off'}"/>`);
    }
    const label = o.label || `A bar cut into 10 equal parts. ${k} of the parts ${k === 1 ? 'is' : 'are'} shaded.`;
    return `<svg class="model model-strip" viewBox="-2 -2 304 44" role="img" aria-label="${esc(label)}">` +
      cells.join('') + `<rect x="0" y="0" width="300" height="40" class="m-frame"/></svg>`;
  }

  /**
   * A 10 x 10 grid (one whole). The first k small squares are shaded, filling one column (one tenth) at a time,
   * top to bottom. With o.thou = c (1-9), the next square is split into 10 thin slices with c shaded,
   * and a zoomed copy of that square is drawn to the right.
   */
  function grid(k, o = {}) {
    const c = o.thou || 0;
    if (!(k >= 0 && k <= 100) || (c && k >= 100)) throw new Error('grid k: ' + k);
    const parts = [];
    for (let i = 0; i < 100; i++) {
      const col = Math.floor(i / 10), row = i % 10;
      parts.push(`<rect x="${col * 20}" y="${row * 20}" width="20" height="20" class="${i < k ? 'm-on' : 'm-off'}"/>`);
      if (o.cross && i < k && i >= k - o.cross) parts.push(`<path d="M${col * 20 + 4} ${row * 20 + 4}L${col * 20 + 16} ${row * 20 + 16}M${col * 20 + 16} ${row * 20 + 4}L${col * 20 + 4} ${row * 20 + 16}" class="m-x"/>`);
    }
    // Column lines drawn thicker so each tenth (column) is easy to see.
    for (let col = 1; col < 10; col++) parts.push(`<line x1="${col * 20}" y1="0" x2="${col * 20}" y2="200" class="m-col"/>`);
    let width = 200;
    if (c) {
      const col = Math.floor(k / 10), row = k % 10, x = col * 20, y = row * 20;
      for (let s = 0; s < c; s++) parts.push(`<rect x="${x + s * 2}" y="${y}" width="2" height="20" class="m-on"/>`);
      parts.push(`<rect x="${x}" y="${y}" width="20" height="20" class="m-focus"/>`);
      // Zoom panel: the same square, ten times bigger, cut into 10 slices.
      const zx = 240, zy = 50;
      for (let s = 0; s < 10; s++) parts.push(`<rect x="${zx + s * 10}" y="${zy}" width="10" height="100" class="${s < c ? 'm-on' : 'm-off'}"/>`);
      parts.push(`<rect x="${zx}" y="${zy}" width="100" height="100" class="m-focus"/>`);
      parts.push(`<line x1="${x + 20}" y1="${y}" x2="${zx}" y2="${zy}" class="m-zoomline"/>`);
      parts.push(`<line x1="${x + 20}" y1="${y + 20}" x2="${zx}" y2="${zy + 100}" class="m-zoomline"/>`);
      parts.push(`<text x="${zx + 50}" y="${zy + 120}" class="m-text" text-anchor="middle">1 square,</text><text x="${zx + 50}" y="${zy + 138}" class="m-text" text-anchor="middle">zoomed in</text>`);
      width = 345;
    }
    const cols = Math.floor(k / 10), extra = k % 10;
    const label = o.label || `A grid of 100 equal squares. ${cols} full column${cols === 1 ? '' : 's'} and ${extra} more square${extra === 1 ? '' : 's'} ${k === 1 ? 'is' : 'are'} shaded` +
      (c ? `, and ${c} of the 10 thin slices of the next square ${c === 1 ? 'is' : 'are'} shaded.` : '.') + (o.cross ? ` ${o.cross} of the shaded squares are crossed out.` : '');
    return `<svg class="model model-grid${c ? ' model-zoom' : ''}" viewBox="-2 -2 ${width + 4} 204" role="img" aria-label="${esc(label)}">` +
      parts.join('') + `<rect x="0" y="0" width="200" height="200" class="m-frame"/></svg>`;
  }

  /**
   * Number line from `from` to `to` (in thousandths) cut into 10 equal jumps.
   * o.point (thousandths) marks a dot labelled o.pointLabel. o.labels: [left, right] text. o.tickLabels: label every tick.
   */
  function line(o) {
    const { from, to } = o;
    const step = (to - from) / 10;
    if (!Number.isInteger(step) || step <= 0) throw new Error('line step');
    const x0 = 24, x1 = 316, y = 46;
    const X = (v) => x0 + ((v - from) / (to - from)) * (x1 - x0);
    const parts = [`<line x1="${x0 - 14}" y1="${y}" x2="${x1 + 14}" y2="${y}" class="m-axis"/>`];
    for (let i = 0; i <= 10; i++) {
      const v = from + i * step, x = X(v), big = i === 0 || i === 10;
      parts.push(`<line x1="${x}" y1="${y - (big ? 12 : 8)}" x2="${x}" y2="${y + (big ? 12 : 8)}" class="m-tick"/>`);
      if (o.tickLabels && !big) parts.push(`<text x="${x}" y="${y + 26}" class="m-text m-small" text-anchor="middle">${esc(G.D.fromThousandths(v))}</text>`);
      if (o.mid && i === 5) {
        parts.push(`<line x1="${x}" y1="${y - 16}" x2="${x}" y2="${y + 16}" class="m-mid"/>`);
        if (!o.tickLabels) parts.push(`<text x="${x}" y="${y + 32}" class="m-text m-small" text-anchor="middle">halfway ${esc(G.D.fromThousandths(v))}</text>`);
      }
    }
    const [l, r] = o.labels || [G.D.fromThousandths(from), G.D.fromThousandths(to)];
    parts.push(`<text x="${x0}" y="${y + 30}" class="m-text m-bold" text-anchor="middle">${esc(l)}</text>`);
    parts.push(`<text x="${x1}" y="${y + 30}" class="m-text m-bold" text-anchor="middle">${esc(r)}</text>`);
    if (o.point !== undefined) {
      const x = X(o.point);
      parts.push(`<circle cx="${x}" cy="${y}" r="6" class="m-dot"/>`);
      parts.push(`<text x="${x}" y="${y - 18}" class="m-text m-bold" text-anchor="middle">${esc(o.pointLabel || 'A')}</text>`);
    }
    (o.points || []).forEach((pt) => {
      if (pt.v < from || pt.v > to) throw new Error('point off the line');
      const x = X(pt.v);
      parts.push(`<circle cx="${x}" cy="${y}" r="6" class="m-dot"/>`);
      parts.push(`<text x="${x}" y="${y - 18}" class="m-text m-bold" text-anchor="middle">${esc(pt.label)}</text>`);
    });
    const label = o.label || `A number line from ${l} to ${r} cut into 10 equal jumps` +
      (o.point !== undefined ? `. Point ${o.pointLabel || 'A'} is ${Math.round((o.point - from) / step)} jumps to the right of ${l}.` : '') +
      (o.points ? ' ' + o.points.map((pt) => `Point ${pt.label} is ${Math.round((pt.v - from) / step)} jumps to the right of ${l}.`).join(' ') : '') + (o.point === undefined && !o.points ? '.' : '') +
      (o.mid ? ` The halfway mark is at ${G.D.fromThousandths(from + 5 * step)}.` : '');
    return `<svg class="model model-line" viewBox="0 0 340 84" role="img" aria-label="${esc(label)}">${parts.join('')}</svg>`;
  }

  const PLACES = ['ones', 'tenths', 'hundredths', 'thousandths'];
  const PLACES_T = ['tens', 'ones', 'tenths', 'hundredths', 'thousandths'];
  // Soft hyphens (­) let long headings break cleanly in narrow charts.
  const PLACE_TITLES = { thousands: 'Thou­sands', hundreds: 'Hun­dreds', tens: 'Tens', ones: 'Ones', tenths: 'Tenths', hundredths: 'Hun­dredths', thousandths: 'Thou­sandths' };
  const PLACE_VALUES = { tens: '10', ones: '1', tenths: '0.1', hundredths: '0.01', thousandths: '0.001' };

  /** Place-value chart. d = { ones, tenths, hundredths, thousandths } (strings; '' leaves a cell empty). */
  function chart(d, o = {}) {
    const cols = o.tens ? PLACES_T : PLACES, pt = cols.indexOf('tenths');
    const head = cols.map((p, i) => (i === pt ? '<th class="pv-point" aria-hidden="true"></th>' : '') +
      `<th scope="col" class="${o.highlight === p ? 'pv-hi' : ''}">${PLACE_TITLES[p]}<span class="pv-val">${PLACE_VALUES[p]}</span></th>`).join('');
    const row = d ? '<tr>' + cols.map((p, i) => (i === pt ? '<td class="pv-point" aria-label="decimal point">.</td>' : '') +
      `<td class="${o.highlight === p ? 'pv-hi' : ''}">${esc(d[p] == null ? '' : d[p])}</td>`).join('') + '</tr>' : '';
    const cap = o.caption ? `<caption>${esc(o.caption)}</caption>` : '';
    return `<table class="pv-chart">${cap}<thead><tr>${head}</tr></thead><tbody>${row}</tbody></table>`;
  }

  /**
   * Numbers lined up by place value, one row each. Zeros added to fill empty places are shown lighter.
   * o.highlight: a place to highlight; o.pad: write the filler zeros (default true); o.labels: row labels.
   */
  function stack(nums, o = {}) {
    const pad = o.pad !== false;
    const ps = nums.map((n) => G.D.parse(n));
    // As many whole-number columns as the longest whole part needs (ones, tens, hundreds, thousands).
    const wl = Math.min(4, Math.max(1, ...ps.map((x) => x.whole.length)));
    const wholeCols = ['thousands', 'hundreds', 'tens', 'ones'].slice(4 - wl);
    // Show places only as far as the longest number (or o.places), so 0.8 and 0.75 line up as 0.80 and 0.75.
    const maxP = Math.max(1, o.places || Math.max(...ps.map((x) => x.places)));
    const cols = wholeCols.concat(['tenths', 'hundredths', 'thousandths'].slice(0, maxP)), pt = cols.indexOf('tenths');
    const head = (o.labels ? '<th scope="col"><span class="sr-only">Number</span></th>' : '') + cols.map((p, i) => (i === pt ? '<th class="pv-point" aria-hidden="true"></th>' : '') +
      `<th scope="col" class="${o.highlight === p ? 'pv-hi' : ''}">${PLACE_TITLES[p]}</th>`).join('');
    const rows = ps.map((x, r) => {
      const w = x.whole.padStart(wl, ' ');
      const cells = cols.map((p, i) => {
        let v, filler = false;
        if (i < wl) v = w[i] === ' ' ? '' : w[i];
        else { v = x.frac[i - pt]; if (v === undefined) { v = pad ? '0' : ''; filler = pad; } }
        const point = x.places === 0 && !pad ? '<td class="pv-point"></td>' : '<td class="pv-point" aria-label="decimal point">.</td>';
        return (i === pt ? point : '') +
          `<td class="${[o.highlight === p ? 'pv-hi' : '', filler ? 'pv-pad' : ''].join(' ').trim()}">${esc(v)}</td>`;
      }).join('');
      return `<tr>${o.labels ? `<th scope="row">${esc(o.labels[r])}</th>` : ''}${cells}</tr>`;
    }).join('');
    const cap = o.caption ? `<caption>${esc(o.caption)}</caption>` : '';
    return `<table class="pv-chart pv-stack">${cap}<thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`;
  }

  /**
   * Numbers written in columns for adding or subtracting, lined up by the decimal point.
   * nums: [top, bottom]; op: '+' or '−'. o.answer: bottom line (string; '' leaves it blank).
   * o.pad: write filler zeros (shown lighter). o.misaligned: line the digits up from the right like whole
   * numbers (to show a common mistake). o.carry: small digits above the top row, keyed by column index.
   */
  function vertical(nums, op, o = {}) {
    const rows = nums.concat(o.answer !== undefined ? [o.answer] : []);
    const ps = rows.filter((x) => x !== '').map((x) => G.D.parse(x));
    const W = Math.max(...ps.map((x) => x.whole.length)), P = Math.max(...ps.map((x) => x.places));
    const cells = (x) => {
      if (x === '') return Array(W + 1 + P).fill({ c: '' });
      if (o.misaligned) {
        const str = x.split('');
        return Array(W + 1 + P - str.length).fill({ c: '' }).concat(str.map((c) => ({ c })));
      }
      const v = G.D.parse(x);
      const w = v.whole.padStart(W, ' ').split('').map((c) => ({ c: c === ' ' ? '' : c }));
      const fr = [];
      for (let i = 0; i < P; i++) fr.push(v.frac[i] !== undefined ? { c: v.frac[i] } : { c: o.pad ? '0' : '', pad: !!o.pad });
      return w.concat([{ c: P ? '.' : '' }], fr);
    };
    const tr = (x, k) => {
      const sign = k === 1 ? op : '';
      return `<tr class="${k === nums.length ? 'v-ans' : k === nums.length - 1 ? 'v-last' : ''}"><td class="v-op">${sign}</td>${cells(x).map((c) => `<td class="${c.pad ? 'pv-pad' : ''}${c.c === '.' ? ' v-pt' : ''}">${esc(c.c)}</td>`).join('')}</tr>`;
    };
    const carry = o.carry ? `<tr class="v-carry"><td></td>${Array.from({ length: W + 1 + P }, (_, i) => `<td>${o.carry[i] ? esc(o.carry[i]) : ''}</td>`).join('')}</tr>` : '';
    const label = o.label || `${nums[0]} ${op === '+' ? 'plus' : 'minus'} ${nums[1]}, written in columns${o.misaligned ? ' with the digits lined up from the right' : ' with the decimal points lined up'}${o.answer ? ', equals ' + o.answer : ''}.`;
    return `<table class="vcalc-model" role="img" aria-label="${esc(label)}"><tbody>${carry}${rows.map(tr).join('')}</tbody></table>`;
  }

  /** Area model on a hundredths grid: a tenths of the rows and b tenths of the columns; the overlap is a × b. */
  function area(a, b, o = {}) {
    const parts = [];
    for (let i = 0; i < 100; i++) {
      const col = Math.floor(i / 10), row = i % 10;
      const inA = row < a, inB = col < b;
      parts.push(`<rect x="${col * 20}" y="${row * 20}" width="20" height="20" class="${inA && inB ? 'm-on' : inA ? 'm-a' : inB ? 'm-b' : 'm-off'}"/>`);
    }
    for (let k = 1; k < 10; k++) parts.push(`<line x1="${k * 20}" y1="0" x2="${k * 20}" y2="200" class="m-col"/>`);
    const label = o.label || `A grid of 100 squares. ${a} of the 10 rows and ${b} of the 10 columns are marked; the squares where they overlap are dark.`;
    return `<svg class="model model-grid" viewBox="-2 -2 204 204" role="img" aria-label="${esc(label)}">${parts.join('')}<rect x="0" y="0" width="200" height="200" class="m-frame"/></svg>`;
  }

  G.models = { strip, grid, line, chart, stack, vertical, area, esc, PLACES, PLACE_TITLES };
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
