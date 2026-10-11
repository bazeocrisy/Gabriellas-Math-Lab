// Renders one question's prompt, picture and answer controls. Used by Teach checks, Practice and Test.
// It never shows correctness by itself; Practice/Teach add feedback through coach.js, and Test adds none.
(function (G) {
  'use strict';
  const M = G.models;
  let uid = 0;

  function stepper(key, label, max) {
    return `<div class="stepper" data-key="${key}">
      <span class="st-label" id="st-${key}-${uid}">${label}</span>
      <div class="st-row">
        <button type="button" class="btn st-btn" data-d="-1" aria-label="Remove one: ${label}">−</button>
        <output class="st-val" aria-live="polite" aria-labelledby="st-${key}-${uid}">0</output>
        <button type="button" class="btn st-btn" data-d="1" aria-label="Add one: ${label}">+</button>
      </div></div>`;
  }

  /**
   * A model you shade with + and − buttons.
   * kind 'grid': full columns (tenths) + single squares (hundredths); kind 'strip': tenths.
   * opts.showDecimal shows the decimal for the current shading (Teach only).
   */
  function builder(host, kind, opts) {
    uid++;
    const st = { cols: 0, sq: 0 };
    host.innerHTML = `<div class="builder">
      <div class="builder-model"></div>
      <div class="builder-controls">${kind === 'grid' ? stepper('cols', 'Full columns (tenths)') + stepper('sq', 'Single squares (hundredths)') : stepper('cols', 'Shaded parts (tenths)')}</div>
      <p class="builder-read" aria-live="polite"></p></div>`;
    const count = () => kind === 'grid' ? st.cols * 10 + st.sq : st.cols;
    function draw() {
      host.querySelector('.builder-model').innerHTML = kind === 'grid' ? M.grid(count()) : M.strip(count());
      host.querySelectorAll('.stepper').forEach((el) => {
        const k = el.dataset.key, v = st[k];
        el.querySelector('.st-val').textContent = v;
        const max = k === 'cols' ? 10 : (st.cols === 10 ? 0 : 9);
        el.querySelector('[data-d="1"]').disabled = v >= max;
        el.querySelector('[data-d="-1"]').disabled = v <= 0;
      });
      const n = count();
      let txt = kind === 'grid' ? `Shaded: ${st.cols} column${st.cols === 1 ? '' : 's'} and ${st.sq} square${st.sq === 1 ? '' : 's'} (${n} of 100 squares).` : `Shaded: ${n} of 10 parts.`;
      if (opts.showDecimal) {
        const dec = kind === 'grid' ? G.D.fromThousandths(n * 10, 2) : G.D.fromThousandths(n * 100, 1);
        txt += kind === 'grid' ? ` That is ${n} hundredths = <b>${dec}</b>` : ` That is ${n} tenth${n === 1 ? '' : 's'} = <b>${dec}</b>`;
      }
      host.querySelector('.builder-read').innerHTML = txt;
    }
    host.querySelectorAll('.st-btn').forEach((b) => b.addEventListener('click', () => {
      const k = b.closest('.stepper').dataset.key;
      st[k] += Number(b.dataset.d);
      if (st.cols === 10) st.sq = 0;
      draw();
      if (opts.onChange) opts.onChange(count());
    }));
    draw();
    return {
      get: count,
      set(n) { n = n || 0; if (kind === 'grid') { st.cols = Math.floor(n / 10); st.sq = n % 10; } else st.cols = n; draw(); },
      disable(d) { host.querySelectorAll('.st-btn').forEach((b) => { b.disabled = d || b.disabled; }); if (!d) draw(); }
    };
  }

  /** Render question q into host. opts: { response, onChange(resp), onEnter() }. Returns a controller. */
  function render(q, host, opts = {}) {
    uid++;
    const id = 'q' + uid;
    host.innerHTML = `<div class="q">
      <div class="q-prompt" id="${id}-p">${q.prompt}</div>
      ${q.visual ? `<div class="q-visual">${q.visual}</div>` : ''}
      <div class="q-answer"></div></div>`;
    const area = host.querySelector('.q-answer');
    const changed = () => opts.onChange && opts.onChange(ctl.get());
    let ctl;

    if (q.type === 'mc') {
      const cls = q.layout === 'models' ? 'choices choices-models' : q.layout === 'symbols' ? 'choices choices-symbols' : 'choices';
      area.innerHTML = `<fieldset class="${cls}" aria-describedby="${id}-p"><legend class="sr-only">Choose one answer</legend>` +
        q.choices.map((c, i) => `<label class="choice"><input type="radio" name="${id}" value="${M.esc(c.value)}">` +
          `<span class="choice-body">${c.html ? `<span class="choice-title">${M.esc(c.text)}</span>${c.html}` : `<span class="choice-text">${M.esc(c.text)}</span>`}` +
          `${c.sr ? `<span class="sr-only"> (${M.esc(c.sr)})</span>` : ''}</span></label>`).join('') + '</fieldset>';
      const inputs = Array.from(area.querySelectorAll('input'));
      inputs.forEach((inp) => inp.addEventListener('change', changed));
      ctl = {
        get: () => { const c = inputs.find((x) => x.checked); return c ? c.value : null; },
        set: (v) => inputs.forEach((x) => { x.checked = x.value === v; }),
        disable: (d) => inputs.forEach((x) => { x.disabled = d; }),
        focus: () => inputs[0].focus()
      };
    } else if (q.type === 'number') {
      area.innerHTML = `<label class="num-label" for="${id}-in">Your answer</label>
        <input id="${id}-in" class="num-input" type="text" inputmode="decimal" autocomplete="off" autocapitalize="off" spellcheck="false" aria-describedby="${id}-p" maxlength="12">`;
      const inp = area.querySelector('input');
      inp.addEventListener('input', changed);
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter' && opts.onEnter) { e.preventDefault(); opts.onEnter(); } });
      ctl = { get: () => inp.value, set: (v) => { inp.value = v == null ? '' : v; }, disable: (d) => { inp.disabled = d; }, focus: () => inp.focus() };
    } else if (q.type === 'build') {
      const b = builder(area, q.model, { onChange: changed });
      ctl = { get: b.get, set: b.set, disable: b.disable, focus: () => { const x = area.querySelector('[data-d="1"]'); if (x) x.focus(); } };
    } else if (q.type === 'expanded') {
      area.innerHTML = `<label class="num-label" for="${id}-in">Your answer</label>
        <textarea id="${id}-in" class="num-input exp-input" rows="2" inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-describedby="${id}-p ${id}-h" maxlength="60"></textarea>
        <p class="hint-small" id="${id}-h">Use a + sign between the parts, like 2 + 0.5 + 0.08 (or 2 × 1 + 5 × 0.1 + 8 × 0.01).</p>`;
      const inp = area.querySelector('textarea');
      const grow = () => { inp.style.height = 'auto'; inp.style.height = inp.scrollHeight + 4 + 'px'; };
      inp.addEventListener('input', () => { grow(); changed(); });
      // Enter checks the answer (a new line is never needed).
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); if (opts.onEnter) opts.onEnter(); } });
      ctl = { get: () => inp.value.replace(/\s*\n\s*/g, ' '), set: (v) => { inp.value = v == null ? '' : v; grow(); }, disable: (d) => { inp.disabled = d; }, focus: () => inp.focus() };
    } else if (q.type === 'order') {
      // Tap numbers in the order asked; tap a placed number to take it back.
      let placed = [], disabled = false;
      area.innerHTML = `<p class="hint-small" id="${id}-oh">Tap the numbers in order, ${M.esc(q.orderText)}. Tap a number in your list to take it back.</p>
        <p class="order-h" aria-hidden="true">Your order</p>
        <ol class="order-slots" aria-label="Your order" aria-describedby="${id}-oh"></ol>
        <p class="order-h" aria-hidden="true">Numbers to tap</p>
        <div class="order-pool" role="group" aria-label="Numbers to place"></div>
        <button type="button" class="btn btn-link order-clear">Start over</button>
        <p class="sr-only" aria-live="polite"></p>`;
      const slotsEl = area.querySelector('.order-slots'), poolEl = area.querySelector('.order-pool'), live = area.querySelector('[aria-live]');
      const draw = () => {
        slotsEl.innerHTML = q.items.map((_, k) => {
          const v = placed[k], lab = (q.slotLabels && q.slotLabels[k]) ? ` <span class="slot-lab">(${M.esc(q.slotLabels[k])})</span>` : '';
          return v != null ? `<li><button type="button" class="btn order-chip is-placed" data-k="${k}" aria-label="Position ${k + 1}: ${M.esc(v)}. Tap to take it back."${disabled ? ' disabled' : ''}>${M.esc(v)}</button>${lab}</li>`
            : `<li><span class="order-empty">${k + 1}</span>${lab}</li>`;
        }).join('');
        poolEl.innerHTML = q.items.filter((v) => !placed.includes(v)).map((v) => `<button type="button" class="btn order-chip" data-v="${M.esc(v)}"${disabled ? ' disabled' : ''}>${M.esc(v)}</button>`).join('') ||
          '<span class="hint-small">All numbers placed.</span>';
        slotsEl.querySelectorAll('[data-k]').forEach((b) => b.addEventListener('click', () => {
          const v = placed[Number(b.dataset.k)]; placed = placed.filter((x) => x !== v); live.textContent = `${v} taken back.`; draw(); changed();
          const back = [...poolEl.querySelectorAll('[data-v]')].find((x) => x.dataset.v === v); if (back) back.focus();
        }));
        poolEl.querySelectorAll('[data-v]').forEach((b) => b.addEventListener('click', () => {
          placed.push(b.dataset.v); live.textContent = `${b.dataset.v} placed in position ${placed.length}.`; draw(); changed();
          const next = poolEl.querySelector('[data-v]') || slotsEl.querySelector(`[data-k="${placed.length - 1}"]`); if (next) next.focus();
        }));
      };
      area.querySelector('.order-clear').addEventListener('click', () => { if (disabled) return; placed = []; live.textContent = 'Order cleared.'; draw(); changed(); const f = poolEl.querySelector('[data-v]'); if (f) f.focus(); });
      draw();
      ctl = {
        get: () => placed.slice(),
        set: (v) => { placed = Array.isArray(v) ? v.filter((x, i) => q.items.includes(x) && v.indexOf(x) === i) : []; draw(); },
        disable: (d) => { disabled = d; area.querySelector('.order-clear').disabled = d; draw(); },
        focus: () => { const b = poolEl.querySelector('[data-v]'); if (b) b.focus(); }
      };
    } else if (q.type === 'chart') {
      const keys = ['ones', 'tenths', 'hundredths', 'thousandths'];
      area.innerHTML = `<table class="pv-chart pv-input"><thead><tr>${keys.map((k, i) => (i === 1 ? '<th class="pv-point" aria-hidden="true"></th>' : '') + `<th scope="col" id="${id}-${k}">${M.PLACE_TITLES[k]}</th>`).join('')}</tr></thead>
        <tbody><tr>${keys.map((k, i) => (i === 1 ? '<td class="pv-point" aria-hidden="true">.</td>' : '') +
          `<td><input type="text" inputmode="numeric" maxlength="1" autocomplete="off" data-k="${k}" aria-labelledby="${id}-${k}" class="pv-cell"></td>`).join('')}</tr></tbody></table>
        <p class="hint-small">Type one digit in each box. An empty box counts as 0.</p>`;
      const inputs = Array.from(area.querySelectorAll('input'));
      inputs.forEach((inp, i) => {
        inp.addEventListener('input', () => { changed(); if (/^\d$/.test(inp.value) && inputs[i + 1]) inputs[i + 1].focus(); });
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter' && opts.onEnter) { e.preventDefault(); opts.onEnter(); } });
      });
      ctl = {
        get: () => Object.fromEntries(inputs.map((x) => [x.dataset.k, x.value])),
        set: (v) => inputs.forEach((x) => { x.value = v && v[x.dataset.k] != null ? v[x.dataset.k] : ''; }),
        disable: (d) => inputs.forEach((x) => { x.disabled = d; }),
        focus: () => inputs[0].focus()
      };
    }
    if (opts.response != null) ctl.set(opts.response);
    return ctl;
  }

  G.qui = { render, builder };
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
