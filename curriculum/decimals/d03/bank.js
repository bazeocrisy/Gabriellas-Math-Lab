// D03 Comparing Decimals — question bank.
// Compare decimals to thousandths with >, <, = by lining up places (5.NR.4.2), including different numbers of
// digits, equal decimals, number lines and explaining a comparison. Answers are exact decimal strings.
(function (G) {
  'use strict';
  const D = G.D, M = G.models;
  const { f, num, s, list, cap, textChoices } = G.kit;
  const FR = ['tenths', 'hundredths', 'thousandths'];
  const SYM_NAMES = { '<': 'is less than', '>': 'is greater than', '=': 'is equal to' };
  const templates = [];
  const T = (id, skill, make) => templates.push({ id, skill, make });

  /** A comparison symbol written safely inside HTML. */
  const hs = (c) => (c === '<' ? '&lt;' : c === '>' ? '&gt;' : c);
  const sym = (x, y) => { const c = D.cmp(x, y); return c < 0 ? '<' : c > 0 ? '>' : '='; };
  const pad3 = (x) => { const v = D.parse(x); return v.whole + '.' + v.frac.padEnd(3, '0'); };
  /** Where two decimals first differ: { place, dx, dy } (place 'ones' when the whole parts differ, null when equal). */
  function decide(x, y) {
    const a = D.parse(x), b = D.parse(y);
    if (a.whole !== b.whole) return { place: 'whole number', dx: a.whole, dy: b.whole };
    const fa = a.frac.padEnd(3, '0'), fb = b.frac.padEnd(3, '0');
    for (let i = 0; i < 3; i++) if (fa[i] !== fb[i]) return { place: FR[i], dx: fa[i], dy: fb[i] };
    return { place: null };
  }
  /** One-sentence reason a comparison is true, from place value. */
  function reason(x, y) {
    const d = decide(x, y);
    if (!d.place) return `${x} and ${y} have the same digit in every place (zeros at the end do not change a decimal), so ${x} = ${y}.`;
    const [g, l] = D.cmp(x, y) > 0 ? [x, y] : [y, x];
    if (d.place === 'whole number') return `The whole-number parts are different: ${D.parse(g).whole} is more than ${D.parse(l).whole}, so ${g} is greater.`;
    const dd = decide(g, l);
    const i = FR.indexOf(d.place);
    return (i ? `The digits match until the ${d.place} place. ` : '') + `In the ${d.place} place, ${g} has ${dd.dx} and ${l} has ${dd.dy}. So ${g} is greater: ${x} ${hs(sym(x, y))} ${y}.`;
  }
  const lineUp = (x, y) => M.stack([x, y], { pad: true });
  const symbolChoices = () => ['<', '>', '='].map((t) => ({ value: t, text: t, sr: SYM_NAMES[t] }));
  const SYM_HINT3 = 'Find the first place where the digits are different. The number with the bigger digit there is greater. The open side of < or > faces the greater number.';

  /**
   * Two decimals with the same whole part that first differ in place index `at` (0 tenths, 1 hundredths, 2 thousandths).
   * la, lb: number of decimal places of each. Digits after `at` are random; each number's last digit is not 0.
   */
  function pair(r, at, la, lb, w) {
    for (;;) {
      const whole = w !== undefined ? w : r.int(0, 9);
      const common = Array.from({ length: at }, () => r.int(0, 9));
      const a = r.int(0, 9), b = r.int(0, 9);
      if (a === b) continue;
      const build = (len, dig) => {
        const ds = common.concat([dig]);
        while (ds.length < len) ds.push(r.int(0, 9));
        return ds;
      };
      const A = build(la, a), B = build(lb, b);
      if (A[A.length - 1] === 0 || B[B.length - 1] === 0) continue;
      return [`${whole}.${A.join('')}`, `${whole}.${B.join('')}`];
    }
  }

  function symbolQuestion(x, y, extra = {}) {
    const ans = sym(x, y);
    return Object.assign({
      type: 'mc', layout: 'symbols', sig: x + '|' + y,
      prompt: `Choose the symbol that makes this true: <span class="cmp">${x} <span class="cmp-box" aria-label="blank">?</span> ${y}</span>`,
      choices: symbolChoices(), answer: ans, answerText: `${x} ${ans} ${y}`,
      hints: [
        'Compare decimals place by place, starting with the biggest place. Line up the decimal points first.',
        'Here they are lined up, with zeros added so both have the same number of places:' + lineUp(x, y),
        SYM_HINT3
      ],
      why: reason(x, y),
      diagnose(resp) {
        if (ans === '=') return 'Look again at the lined-up numbers. Is any place different, or is the only difference a zero at the end?';
        if (resp === '=') return 'These numbers are not equal: at least one place has different digits. Find the first place where they differ.';
        const d = decide(x, y);
        const px = D.parse(x).places, py = D.parse(y).places;
        // The answer someone gives if they think the decimal with more digits is greater.
        if (px !== py && resp === (px > py ? '>' : '<')) return 'Careful: more digits does not mean a greater number. Line up the decimal points and compare the biggest places first.';
        return `Check the ${d.place} place, where the digits first differ, and make the open side of the symbol face the greater number.`;
      }
    }, extra);
  }

  // ───────────────────────── Skill: compare by place value (cmpPlace) ─────────────────────────

  T('S1', 'cmpPlace', (r, p) => {
    let x = p.x, y = p.y;
    if (!x) { const len = r.int(2, 3); [x, y] = pair(r, r.int(0, len - 1), len, len); }
    return symbolQuestion(x, y);
  });

  T('S2', 'cmpPlace', (r, p) => {
    let x = p.x, y = p.y;
    if (!x) [x, y] = pair(r, r.int(1, 2), 3, 3);
    const dir = p.dir || r.pick(['greater', 'less']);
    const ans = (D.cmp(x, y) > 0) === (dir === 'greater') ? x : y;
    const d = decide(x, y);
    return {
      type: 'mc', sig: x + y + dir,
      prompt: `Which decimal is <b>${dir}</b>: ${x} or ${y}?`,
      choices: textChoices(r, ans, [ans === x ? y : x, 'They are equal']), answer: ans, answerText: ans,
      hints: [
        'Line up the decimal points and compare one place at a time, from left to right.',
        `Start with the tenths. ${d.place === 'tenths' ? 'Are the tenths digits the same?' : `Both numbers have ${D.parse(x).frac[0]} tenths, so the tenths do not decide.`}`,
        'Keep moving right until you find a place where the digits are different. The bigger digit there belongs to the greater number.'
      ],
      why: reason(x, y) + ` The ${dir} one is <b>${ans}</b>.`,
      diagnose(resp) {
        if (resp === 'They are equal') return `They are not equal. In the ${d.place} place the digits are different.`;
        return `Look at the ${d.place} place, where the digits first differ. Which number has the bigger digit there? Then decide which is ${dir}.`;
      }
    };
  });

  T('S3', 'cmpPlace', (r, p) => {
    const wholeTip = (x, y) => `Compare the whole-number parts first: ${D.parse(x).whole} and ${D.parse(y).whole}. When they are different, they decide.`;
    let x = p.x, y = p.y;
    if (!x) {
      const w = r.int(1, 9);
      const lo = r.int(0, w - 1);
      // The smaller whole number gets the bigger-looking decimal part (2.09 vs 1.98).
      const fa = [r.int(0, 3), r.int(1, 9)], fb = [r.int(6, 9), r.int(1, 9)];
      x = `${w}.${fa.join('')}`; y = `${lo}.${fb.join('')}`;
      if (r.next() < 0.5) [x, y] = [y, x];
    }
    return symbolQuestion(x, y, {
      hints: [
        'Compare the biggest places first. The whole-number part is bigger than any part after the decimal point.',
        `Look at the whole-number parts: ${D.parse(x).whole} and ${D.parse(y).whole}.`,
        'If the whole numbers are different, they decide. You do not need to look at the digits after the point. The open side of the symbol faces the greater number.'
      ],
      diagnose: (resp) => (resp === '=' ? 'These numbers are not equal. ' : '') + wholeTip(x, y)
    });
  });

  T('S4', 'cmpPlace', (r, p) => {
    let x = p.x, y = p.y;
    if (!x) [x, y] = pair(r, r.int(0, 2), 3, 3);
    const d = decide(x, y);
    return {
      type: 'mc', sig: x + y,
      prompt: `To compare <b>${x}</b> and <b>${y}</b>, which place decides which number is greater?`,
      choices: ['ones', 'tenths', 'hundredths', 'thousandths'].map((t) => ({ value: t, text: `the ${t} place` })), answer: d.place, answerText: `the ${d.place} place`,
      hints: [
        'Compare from the left. The first place where the digits are different decides.',
        `Both numbers have the same ones digit (${D.parse(x).whole}). Now look at the tenths.`,
        'Move right one place at a time. Stop at the first place where the two digits are not the same.'
      ],
      why: `${reason(x, y)} So the <b>${d.place}</b> place decides.`,
      diagnose(resp) {
        if (resp === 'thousandths' && d.place !== 'thousandths') return 'The last place does not always decide. Compare from the LEFT and stop at the first place where the digits differ.';
        if (resp === 'ones') return `The ones digits are the same (${D.parse(x).whole}), so they cannot decide. Look to the right of the decimal point.`;
        return `In the ${resp} place, ${FR.indexOf(resp) > FR.indexOf(d.place) ? 'you have gone too far: an earlier place already has different digits' : 'the digits are the same, so keep looking to the right'}.`;
      }
    };
  });

  T('S5', 'cmpPlace', (r, p) => {
    const want = p.want || r.pick(['>', '<']);
    const W = hs(want);
    const a = p.a || r.int(1, 9);
    const b = p.b !== undefined ? p.b : (want === '>' ? r.int(3, 8) : r.int(1, 6));
    const c = p.c !== undefined ? p.c : r.int(1, 9);
    const d = p.d !== undefined ? p.d : r.int(1, 9);
    const y = `0.${a}${b}${c}`;
    // Exactly one choice makes it true: the blank digit decides (equal digits are never offered).
    const big = [...Array(10).keys()].filter((k) => k > b), small = [...Array(10).keys()].filter((k) => k < b);
    const good = String(want === '>' ? r.pick(big) : r.pick(small));
    const bad = r.shuffle(want === '>' ? small : big).slice(0, 3).map(String);
    return {
      type: 'mc', sig: `${want}${a}${b}${c}${d}`,
      prompt: `Which digit can go in the box to make this true? <span class="cmp">0.${a}<span class="cmp-box" aria-label="missing digit">?</span>${d} ${W} ${y}</span>`,
      choices: textChoices(r, good, bad), answer: good, answerText: good,
      hints: [
        'Compare place by place from the left. The first place where the digits differ decides.',
        `The tenths are the same (${a}). So the box, in the hundredths place, decides the comparison. Compare it with the ${b} in ${y}.`,
        'Try each choice in the box. Compare it with the hundredths digit of the other number, and keep the one that makes the sentence true.'
      ],
      why: `With ${good} in the box, the hundredths digit ${good} is ${want === '>' ? 'greater' : 'less'} than ${b}, so 0.${a}${good}${d} ${W} ${y}.`,
      diagnose(resp) { return `With ${resp} in the box, the hundredths digits are ${resp} and ${b}, so 0.${a}${resp}${d} would be ${Number(resp) > b ? 'greater' : 'less'} than ${y}. You need it to be ${want === '>' ? 'greater' : 'less'}.`; }
    };
  });

  // ───────────────────────── Skill: different numbers of digits (cmpLength) ─────────────────────────

  function lengthPair(r) {
    const la = r.int(1, 2), lb = r.int(la + 1, 3);
    const at = r.int(0, la - 1);
    let [x, y] = pair(r, at, la, lb);
    // Most often the shorter number is the greater one, which is where the "more digits" mistake shows up.
    const shortGreater = r.next() < 0.65;
    if ((D.cmp(x, y) > 0) !== shortGreater) {
      const [w, fx] = x.split('.'), fy = y.split('.')[1];
      x = `${w}.${fx.slice(0, at)}${fy[at]}${fx.slice(at + 1)}`; y = `${w}.${fy.slice(0, at)}${fx[at]}${fy.slice(at + 1)}`;
      if (/0$/.test(x) || /0$/.test(y)) return lengthPair(r);
    }
    return r.next() < 0.5 ? [x, y] : [y, x];
  }

  T('L1', 'cmpLength', (r, p) => {
    let x = p.x, y = p.y;
    if (!x) [x, y] = lengthPair(r);
    return symbolQuestion(x, y, { hints: [
      'A decimal with more digits is NOT always greater. Compare place by place.',
      'Give both numbers the same number of decimal places by writing zeros at the end, and line them up:' + lineUp(x, y),
      SYM_HINT3
    ] });
  });

  T('L2', 'cmpLength', (r, p) => {
    let x = p.x, y = p.y;
    if (!x) [x, y] = lengthPair(r);
    const dir = p.dir || r.pick(['greater', 'less']);
    const ans = (D.cmp(x, y) > 0) === (dir === 'greater') ? x : y;
    const longer = D.parse(x).places > D.parse(y).places ? x : y;
    return {
      type: 'mc', sig: x + y + dir,
      prompt: `Which decimal is <b>${dir}</b>: ${x} or ${y}?`,
      choices: textChoices(r, ans, [ans === x ? y : x, 'They are equal']), answer: ans, answerText: ans,
      hints: [
        'Don\'t decide by counting digits. Compare the values place by place.',
        `Write both with ${D.parse(longer).places} decimal places by adding zeros at the end of the shorter one: ${pad3(x).slice(0, 2 + D.parse(longer).places)} and ${pad3(y).slice(0, 2 + D.parse(longer).places)}.`,
        'Now compare from the left. The first place with different digits decides.'
      ],
      why: reason(x, y) + ` The ${dir} one is <b>${ans}</b>.`,
      diagnose(resp) {
        if (resp === 'They are equal') return 'They are not equal. Write both with the same number of decimal places and compare.';
        if ((resp === longer) === (dir === 'greater')) return `${longer} has more digits, but more digits does not make a decimal greater. Compare the tenths first.`;
        return `Compare place by place from the left, after writing both with the same number of decimal places.`;
      }
    };
  });

  T('L3', 'cmpLength', (r, p) => {
    const lvl = p.lvl || r.pick([1, 1, 2]);
    let lo;
    if (p.lo) lo = p.lo;
    else if (lvl === 1) { const w = r.int(0, 5); const a = r.int(1, 8); lo = `${w}.${a}`; }
    else { const w = r.int(0, 5); const a = r.int(1, 9), b = r.int(1, 8); lo = `${w}.${a}${b}`; }
    const step = lvl === 1 ? 100 : 10;
    const loK = D.toThousandths(lo), hiK = loK + step;
    const hi = f(hiK, lvl === 1 ? 1 : 2);
    const example = num(loK + step / 2);
    return {
      type: 'number', sig: lo,
      accept: (v) => { const k = D.toThousandths(v); return k !== null && k > loK && k < hiK; },
      prompt: `Write a decimal that is <b>greater than ${lo}</b> and <b>less than ${hi}</b>. Use up to three decimal places.`,
      answer: example, answerText: `any decimal between ${lo} and ${hi}, such as ${example}`,
      hints: [
        'There are many decimals between two decimals. Use one more decimal place to find them.',
        `Write both numbers with one more decimal place: ${f(loK, lvl + 1)} and ${f(hiK, lvl + 1)}.`,
        `Now choose a number of ${lvl === 1 ? 'hundredths' : 'thousandths'} that is between those two and write it as a decimal.`
      ],
      why: `${lo} = ${f(loK, lvl + 1)} and ${hi} = ${f(hiK, lvl + 1)}. Any decimal in between works, such as <b>${example}</b>.`,
      diagnose(resp, info) {
        const k = info.th;
        if (k === null) return 'Use at most three decimal places.';
        if (k === loK) return `${resp} is equal to ${lo}, not greater. Add one more decimal place and pick a bigger digit.`;
        if (k === hiK) return `${resp} is equal to ${hi}, not less. Pick a number between them.`;
        if (k < loK) return `${resp} is less than ${lo}. Your number must be greater than ${lo}.`;
        return `${resp} is greater than ${hi}. Your number must be less than ${hi}.`;
      }
    };
  });

  // ───────────────────────── Skill: equal decimals (cmpEqual) ─────────────────────────

  T('E1', 'cmpEqual', (r, p) => {
    let x = p.x, y = p.y;
    if (!x) {
      const w = r.int(0, 9), a = r.int(1, 9);
      const b = r.int(0, 9);
      const base = b ? `${w}.${a}${b}` : `${w}.${a}`;
      const kind = r.pick(['eq', 'eq', 'eq2', 'ne']);
      x = base;
      y = kind === 'eq' ? base + '0' : kind === 'eq2' ? base + (base.split('.')[1].length === 1 ? '00' : '0') : (b ? `${w}.${a}0${b}` : `${w}.0${a}`);
      if (r.next() < 0.5) [x, y] = [y, x];
    }
    return symbolQuestion(x, y, { hints: [
      'Two decimals are equal when every place has the same digit. An empty place counts as 0.',
      'Write both numbers with the same number of decimal places by adding zeros at the end, and line up the decimal points.',
      'Compare every place. If all the digits match, use =. If not, find the first place that is different. Lined up:' + lineUp(x, y)
    ] });
  });

  T('E2', 'cmpEqual', (r, p) => {
    const w = p.w !== undefined ? p.w : r.int(0, 12);
    const a = p.a || r.int(1, 9);
    let b = p.b !== undefined ? p.b : r.int(1, 9);
    if (b === a) b = a === 9 ? 1 : a + 1;
    const x = `${w}.${a}${b}`;
    const ans = x + '0';
    const wrongs = [`${w}.${a}0${b}`, `${w}.0${a}${b}`, `${w}.${b}${a}`];
    return {
      type: 'mc', sig: x,
      prompt: `Which decimal is <b>equal</b> to <b>${x}</b>?`,
      choices: textChoices(r, ans, wrongs), answer: ans, answerText: ans,
      hints: [
        'Equal decimals have the same digit in every place.',
        `Write ${x} in a place-value chart. Then write each choice under it, lining up the decimal points.`,
        'Check each choice place by place against ' + x + '. Which one has every digit in the same place?'
      ],
      why: `${ans} has the same digits in the same places as ${x}; only a zero at the end was added, so ${x} = ${ans}.`,
      diagnose(resp) {
        if (resp === `${w}.${b}${a}`) return 'That one has the digits switched, so the tenths are different. Equal decimals have the same digit in every place.';
        return `In ${resp}, a zero comes before a digit and pushes it into a smaller place, so it is not equal to ${x}.`;
      }
    };
  });

  // ───────────────────────── Skill: number lines (cmpLine) ─────────────────────────

  T('NL1', 'cmpLine', (r, p) => {
    const a = p.a !== undefined ? p.a : r.int(0, 9);
    let u = p.u, v = p.v;
    if (u === undefined) { u = r.int(1, 9); do { v = r.int(1, 9); } while (v === u); }
    const from = a * 100, to = from + 100;
    const pts = r.shuffle([{ label: 'P', v: from + u * 10 }, { label: 'Q', v: from + v * 10 }]);
    if (p.u !== undefined) { pts[0] = { label: 'P', v: from + u * 10 }; pts[1] = { label: 'Q', v: from + v * 10 }; }
    const gk = Math.max(from + u * 10, from + v * 10);
    const ans = f(gk, 2);
    const L = a === 0 ? '0' : f(from, 1), R = a === 9 ? '1' : f(to, 1);
    return {
      type: 'number', sig: `${a}:${Math.min(u, v)}${Math.max(u, v)}`,
      prompt: 'Points P and Q show two decimals. Write the decimal for the point that shows the <b>greater</b> number.',
      visual: M.line({ from, to, labels: [L, R], points: pts }), answer: ans, answerText: ans,
      hints: [
        'On a number line, numbers get greater as you move to the RIGHT.',
        'First decide which point is farther to the right.',
        `Then read that point: the line from ${L} to ${R} has 10 equal jumps, and each jump is 0.01. Count the jumps from ${L}.`
      ],
      why: `The point farther right shows the greater number. It is at <b>${ans}</b>.`,
      diagnose(resp, info) {
        const lk = Math.min(from + u * 10, from + v * 10);
        if (info.th === lk) return 'That is the point farther to the LEFT, which is the smaller number. Numbers get greater to the right.';
        if (info.th === gk + 10 || info.th === gk - 10) return 'You found the right point, but check the count. Count the jumps (spaces) from the left end; each jump is 0.01.';
        return `Each jump on this line is 0.01. Start at ${L} and count the jumps to the point farther to the right.`;
      }
    };
  });

  T('NL2', 'cmpLine', (r, p) => {
    let x = p.x, y = p.y;
    if (!x) { [x, y] = lengthPair(r); const w = 0; x = `${w}.${x.split('.')[1]}`; y = `${w}.${y.split('.')[1]}`; }
    const g = D.cmp(x, y) > 0 ? x : y;
    return {
      type: 'mc', sig: x + y,
      prompt: `Imagine placing ${x} and ${y} on this number line from 0 to 1. Which one would be <b>farther to the right</b>?`,
      visual: M.line({ from: 0, to: 1000, labels: ['0', '1'], tickLabels: true }),
      choices: textChoices(r, g, [g === x ? y : x, 'They are at the same point']), answer: g, answerText: g,
      hints: [
        'Numbers get greater as you move right on a number line. So the greater number is farther right.',
        `Find each number's tenths digit. That tells you which tick mark it is at or just past.`,
        'If the tenths digits are the same, compare the hundredths, then the thousandths.'
      ],
      why: `${reason(x, y)} The greater number, <b>${g}</b>, is farther to the right.`,
      diagnose(resp) {
        if (/same point/.test(resp)) return 'Different numbers are at different points. Compare them place by place.';
        return 'Farther right means greater. Compare the tenths digits first: which number is closer to 1?';
      }
    };
  });

  T('NL3', 'cmpLine', (r, p) => {
    const a = p.a !== undefined ? p.a : r.int(0, 9);
    let ks = p.ks;
    if (!ks) ks = r.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3).sort((m, n) => m - n);
    const from = a * 100;
    const labels = ['A', 'B', 'C'];
    const target = p.t !== undefined ? p.t : r.int(0, 2);
    const ans = labels[target];
    const val = f(from + ks[target] * 10, 2);
    const L = a === 0 ? '0' : f(from, 1), R = a === 9 ? '1' : f(from + 100, 1);
    return {
      type: 'mc', sig: `${a}:${ks.join('')}:${target}`,
      prompt: `Which point shows <b>${val}</b>?`,
      visual: M.line({ from, to: from + 100, labels: [L, R], points: ks.map((k, i) => ({ label: labels[i], v: from + k * 10 })) }),
      choices: labels.map((t) => ({ value: t, text: 'Point ' + t })), answer: ans, answerText: 'Point ' + ans,
      hints: [
        `The line goes from ${L} to ${R}, one tenth, cut into 10 equal jumps.`,
        'Each jump is one hundredth (0.01).',
        `${val} is ${val.split('.')[1][1]} hundredths past ${L}. Count that many jumps from ${L}.`
      ],
      why: `${val} is ${s(ks[target], 'jump')} of 0.01 past ${L}: that is Point ${ans}.`,
      diagnose(resp) {
        const k = ks[labels.indexOf(resp)];
        return `Point ${resp} is ${s(k, 'jump')} past ${L}, so it shows ${f(from + k * 10, 2)}. Count the jumps again.`;
      }
    };
  });

  // ───────────────────────── Skill: explain a comparison (cmpWhy) ─────────────────────────

  T('Y1', 'cmpWhy', (r, p) => {
    let x = p.x, y = p.y;
    if (!x) {
      // A short decimal and a longer one that is smaller, e.g. 0.45 and 0.405.
      const a = r.int(1, 9), b = r.int(2, 9), c = r.int(1, 9);
      x = `0.${a}${b}`; y = `0.${a}0${c}`;
    }
    const name = p.name || r.pick(['Ana', 'Leo', 'Jordan', 'Mia', 'Sam']);
    const claimTrue = p.claim !== undefined ? p.claim === 'true' : r.next() < 0.5;
    const xs = x.split('.')[1], ys = y.split('.')[1];
    const prompt = claimTrue
      ? `${name} says <b>${x} &gt; ${y}</b> because ${x} has ${D.parse(x).frac[1]} hundredths and ${y} has ${D.parse(y).frac[1] === '0' ? 'no' : 'only ' + D.parse(y).frac[1]} hundredths. Is ${name} right?`
      : `${name} says <b>${y} &gt; ${x}</b> because ${Number(ys)} is greater than ${Number(xs)}. Is ${name} right?`;
    const right = claimTrue ? `Yes. The tenths are the same, and ${D.parse(x).frac[1]} hundredths is more than ${D.parse(y).frac[1]} hundredths.`
      : `No. Line them up as ${pad3(x)} and ${pad3(y)}: ${x} has more hundredths, so ${x} is greater.`;
    const wrongs = claimTrue
      ? [`No. ${y} has more digits, so it is greater.`, `No. ${Number(ys)} is greater than ${Number(xs)}, so ${y} is greater.`, `Yes. ${x} has fewer digits, so it is greater.`]
      : [`Yes. ${Number(ys)} is greater than ${Number(xs)}, so ${y} is greater.`, `Yes. ${y} has more digits, so it is greater.`, `No. ${x} is greater because it has fewer digits.`];
    return {
      type: 'mc', sig: x + y + (claimTrue ? 't' : 'f'),
      prompt, choices: textChoices(r, right, wrongs), answer: right, answerText: right,
      hints: [
        'Check the reason with place value. A true answer needs a true reason.',
        'Line up the two numbers by their decimal points and write zeros so both have three decimal places.',
        'Compare place by place from the left. Then choose the answer whose reason matches what you found.'
      ],
      why: reason(x, y) + ' Counting digits, or comparing the digits as whole numbers, does not work.',
      diagnose(resp) {
        if (/digits/.test(resp)) return 'The number of digits does not decide which decimal is greater. Compare place by place from the left.';
        return `${Number(ys)} and ${Number(xs)} cannot be compared as whole numbers, because their digits are in different places. Line up the decimal points first.`;
      }
    };
  });

  T('Y2', 'cmpWhy', (r, p) => {
    let x = p.x, y = p.y;
    if (!x) { [x, y] = lengthPair(r); if (D.cmp(x, y) < 0) [x, y] = [y, x]; }
    const d = decide(x, y);
    const right = d.place === 'tenths' ? `${x} has ${d.dx} tenths and ${y} has only ${d.dy} tenths.` : `The tenths are the same, but in the ${d.place} place ${x} has ${d.dx} and ${y} has ${d.dy}.`;
    const longer = D.parse(x).places > D.parse(y).places ? x : y;
    const wrongs = [
      longer === x ? `${x} has more digits than ${y}.` : `${x} has fewer digits than ${y}.`,
      `The last digit of ${x} is ${x.slice(-1)} and the last digit of ${y} is ${y.slice(-1)}.`,
      `${Number(x.split('.')[1])} is ${Number(x.split('.')[1]) > Number(y.split('.')[1]) ? 'greater' : 'less'} than ${Number(y.split('.')[1])}.`
    ];
    return {
      type: 'mc', sig: x + y,
      prompt: `<b>${x} &gt; ${y}</b> is true. Which reason explains why?`,
      choices: textChoices(r, right, [...new Set(wrongs)].filter((t) => t !== right)), answer: right, answerText: right,
      hints: [
        'A good reason uses place value: it compares digits in the same place.',
        'Line up the decimal points. Start comparing at the tenths place.',
        'The reason should name the FIRST place where the digits are different.'
      ],
      why: `The first place where the digits differ is the ${d.place} place, and ${x} has the bigger digit there. ${reason(x, y)}`,
      diagnose(resp) {
        if (/digits than/.test(resp)) return 'Counting digits does not explain a comparison. Some shorter decimals are greater, and some are less.';
        if (/last digit/.test(resp)) return 'The last digits are in different places (or come after the deciding place), so they do not decide the comparison.';
        return 'The digits after the point are not whole numbers, so they cannot be compared that way. Compare place by place.';
      }
    };
  });

  T('Y3', 'cmpWhy', (r, p) => {
    let x = p.x, y = p.y;
    if (!x) {
      // The student wrote x > y, which is false: x looks bigger as a whole number but has fewer tenths.
      const a = r.int(1, 8);
      const t = r.int(a + 1, 9);
      x = `0.0${r.int(a + 1, 9)}`; y = `0.${a}`; // e.g. 0.09 > 0.1 because 9 > 1
      if (r.next() < 0.5) { x = `0.${a}${r.int(1, 9)}${r.int(1, 9)}`; y = `0.${t}`; }
    }
    const name = p.name || r.pick(['Maria', 'Ben', 'Ava', 'Noah', 'Zoe']);
    const right = `${name} did not compare place by place. ${y} has more tenths, so ${x} < ${y}.`;
    const wrongs = [`There is no mistake. ${x} > ${y} is true.`, `${name} should have compared the last digits.`, `${name} should have counted the digits after the decimal point.`];
    return {
      type: 'mc', sig: x + y,
      prompt: `${name} wrote <b>${x} &gt; ${y}</b>. What mistake did ${name} make?`,
      choices: textChoices(r, right, wrongs), answer: right, answerText: right,
      hints: [
        'First check whether the comparison is true by lining up the decimal points.',
        `Compare the tenths: ${x} has ${s(Number(D.parse(x).frac[0]), 'tenth')} and ${y} has ${s(Number(D.parse(y).frac[0]), 'tenth')}.`,
        'If the comparison is false, think about how someone might have gotten it: what did they compare instead of place value?'
      ],
      why: `${reason(x, y)} The digits after the point cannot be compared as whole numbers.`,
      diagnose(resp) {
        if (/no mistake/.test(resp)) return `Line them up: ${pad3(x)} and ${pad3(y)}. Compare the tenths. Is ${x} > ${y} really true?`;
        return 'The last digits and the number of digits do not decide a comparison. The correct way is to compare place by place from the left.';
      }
    };
  });

  const remind = {
    cmpPlace: `<p><b>Remember:</b> line up the decimal points and compare from the left. The first place with different digits decides.</p>${M.stack(['0.364', '0.371'], { highlight: 'hundredths' })}`,
    cmpLength: '<p><b>Remember:</b> more digits does not mean greater. Write zeros at the end so both have the same number of places: 0.8 = 0.80, and 0.80 &gt; 0.75.</p>',
    cmpEqual: '<p><b>Remember:</b> zeros at the end do not change a decimal (1.5 = 1.50). A zero before a digit does (1.05 is not 1.5).</p>',
    cmpLine: '<p><b>Remember:</b> on a number line, numbers get greater as you move right. Count the equal jumps to read a point.</p>',
    cmpWhy: '<p><b>Remember:</b> a good reason names the first place where the digits differ, like "0.62 has 6 tenths and 0.586 has only 5 tenths."</p>'
  };

  G.engine.register({
    lessonId: 'd03',
    skills: {
      cmpPlace: 'Comparing place by place',
      cmpLength: 'Comparing decimals with different numbers of digits',
      cmpEqual: 'Equal decimals',
      cmpLine: 'Comparing on a number line',
      cmpWhy: 'Explaining a comparison'
    },
    plan: { cmpPlace: 3, cmpLength: 2, cmpEqual: 1, cmpLine: 2, cmpWhy: 2 },
    practiceOnly: [],
    templates, remind,
    helpers: { sym, decide, reason }
  });
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
