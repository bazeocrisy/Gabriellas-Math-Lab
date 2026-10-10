// D01 Understanding Decimals — question bank.
// Each template builds one question from a seeded random generator (or fixed params for teaching examples):
// prompt, optional visual, answer, three progressive hints, a short "why", a full explanation, and
// misconception-specific feedback for wrong answers. Answers are exact decimal strings (see js/decimal.js).
(function (G) {
  'use strict';
  const D = G.D, M = G.models, W = G.words;
  const f = (k, places) => D.fromThousandths(k, places);
  const words = W.decimalWords;
  const ORD = ['', 'first', 'second', 'third'];
  const PL = [null,
    { n: 10, one: 'tenth', many: 'tenths', places: 1 },
    { n: 100, one: 'hundredth', many: 'hundredths', places: 2 },
    { n: 1000, one: 'thousandth', many: 'thousandths', places: 3 }];
  const PLACE_KEYS = ['ones', 'tenths', 'hundredths', 'thousandths'];
  const s = (n, word) => n + ' ' + word + (n === 1 ? '' : 's');
  const list = (xs) => xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1];
  const textChoices = (r, correct, wrongs) => {
    const all = [correct, ...wrongs];
    if (new Set(all).size !== all.length) throw new Error('duplicate choices: ' + all.join(' | '));
    return r.shuffle(all).map((t) => ({ value: t, text: t }));
  };
  // Teaching examples (Teach screens and reminder cards) that generated questions avoid repeating.
  const RESERVED_HUNDREDTHS = new Set([27, 34, 50]);

  /** Digits that differ between a typed answer and the correct one, as advice that does not reveal the answer. */
  function placeCheck(resp, ans) {
    const r = D.parse(resp), a = D.parse(ans);
    if (!r) return null;
    if (r.places > 3) return 'Decimals in this lesson have at most three digits after the decimal point (thousandths).';
    const tips = [];
    if (r.whole !== a.whole) tips.push(a.whole === '0' ? 'The amount is less than one whole, so the number should start with 0 and a decimal point.' : 'Check the whole-number part, to the left of the decimal point.');
    const rd = r.frac.padEnd(3, '0'), ad = a.frac.padEnd(3, '0');
    const wrong = ['tenths', 'hundredths', 'thousandths'].filter((p, i) => rd[i] !== ad[i]);
    if (wrong.length) tips.push(`Check the digit${wrong.length > 1 ? 's' : ''} in the ${list(wrong)} place${wrong.length > 1 ? 's' : ''}.`);
    return tips.join(' ') || null;
  }

  /** "A zero holds a place" detector: the typed answer is the correct one with its zeros left out. */
  function droppedZero(resp, ans) {
    const r = D.parse(resp), a = D.parse(ans);
    if (!r || !a || !/0/.test(a.frac.replace(/0+$/, ''))) return false;
    return r.whole === a.whole && r.frac === a.frac.replace(/0+$/, '').replace(/0/g, '');
  }
  const ZERO_TIP = 'A zero is a placeholder. If you leave it out, the other digits slide into the wrong places. Keep every zero that comes before a nonzero digit.';

  const templates = [];
  const T = (id, skill, make) => templates.push({ id, skill, make });

  // ───────────────────────── Skill: equal parts (parts) ─────────────────────────

  T('P1', 'parts', (r, p) => {
    const pl = p.places || r.int(1, 3), P = PL[pl];
    const all = ['one tenth', 'one hundredth', 'one thousandth', 'one whole'];
    const ans = 'one ' + P.one;
    return {
      type: 'mc', sig: String(pl),
      prompt: `One whole is cut into <b>${P.n}</b> equal parts. What is the name for <b>one</b> of those parts?`,
      choices: textChoices(r, ans, all.filter((x) => x !== ans)), answer: ans, answerText: ans,
      hints: [
        'The name of a part tells how many equal parts make one whole.',
        `This whole is cut into ${P.n} equal parts, so one part is 1 out of ${P.n}.`,
        'Cut a whole into 10 equal parts and you get tenths. Cut every tenth into 10 and you get 100 parts. Cut every one of those into 10 and you get 1000 parts. Which name goes with ' + P.n + ' parts?'
      ],
      why: `A whole cut into ${P.n} equal parts makes ${P.many}, so one part is <b>one ${P.one}</b>, written ${f(1000 / P.n)}.`,
      diagnose(resp) {
        if (resp === 'one whole') return 'One whole is the entire thing before it is cut. The question asks for the name of one small part.';
        const n = { 'one tenth': 10, 'one hundredth': 100, 'one thousandth': 1000 }[resp];
        return `"${resp}" means a whole was cut into ${n} equal parts. This whole was cut into ${P.n} parts.`;
      }
    };
  });

  T('P2', 'parts', (r, p) => {
    const pl = p.places || r.int(1, 3), P = PL[pl];
    const hint2 = pl === 1 ? 'Picture a bar that is one whole. Each tenth is one of its equal parts.'
      : `Start with what you know: 10 tenths make one whole. ${P.many[0].toUpperCase() + P.many.slice(1)} are made by cutting smaller pieces into 10 more.`;
    const hint3 = pl === 1 ? 'Count the equal parts of the bar, one at a time, until you reach the end:<br>' + M.strip(0, { label: 'An empty bar cut into equal parts.' })
      : pl === 2 ? 'Each of the 10 tenths is cut into 10 hundredths. How many is 10 groups of 10?'
        : 'There are 100 hundredths in one whole, and each hundredth is cut into 10 thousandths. How many is 100 groups of 10?';
    return {
      type: 'number', sig: String(pl),
      prompt: `How many <b>${P.many}</b> make <b>one whole</b>?`,
      answer: String(P.n), answerText: String(P.n),
      hints: ['Think about how many equal parts the whole is cut into.', hint2, hint3],
      why: `One whole is cut into ${P.n} equal parts called ${P.many}, so ${P.n} ${P.many} = 1 whole.`,
      diagnose(resp, info) {
        const v = info.th;
        const name = { 10000: 'tenths', 100000: 'hundredths', 1000000: 'thousandths' }[v];
        if (name && name !== P.many) {
          return `${info.raw} is how many ${name} make one whole. ${P.many[0].toUpperCase() + P.many.slice(1)} are ${v < P.n * 1000 ? 'smaller' : 'bigger'} pieces, so it takes ${v < P.n * 1000 ? 'more' : 'fewer'} of them.`;
        }
        return pl === 1 ? 'Picture one whole bar cut into tenths, and count its equal parts one at a time.'
          : 'Count the equal parts that make one whole. Each smaller place cuts every piece into 10 more pieces.';
      }
    };
  });

  T('P3', 'parts', (r, p) => {
    const pairs = [['tenth', 'hundredth', 10], ['hundredth', 'thousandth', 10], ['tenth', 'thousandth', 100]];
    const pi = p.pair !== undefined ? p.pair : r.int(0, 2);
    const [big, small, factor] = pairs[pi];
    const m = p.m || r.int(2, 9);
    const ans = m * factor;
    return {
      type: 'number', sig: pi + ':' + m,
      prompt: `How many <b>${small}s</b> are equal to <b>${s(m, big)}</b>?`,
      answer: String(ans), answerText: String(ans),
      hints: [
        `Each ${big} can be cut into smaller equal pieces. First figure out how many ${small}s fit in one ${big}.`,
        factor === 10 ? `One ${big} is cut into 10 equal ${small}s, so 1 ${big} = 10 ${small}s.`
          : 'One tenth = 10 hundredths, and each hundredth = 10 thousandths. So one tenth = 10 groups of 10 thousandths = 100 thousandths.',
        `You have ${m} ${big}s. Each one is ${factor} ${small}s, so find ${m} groups of ${factor} (${m} × ${factor}).`
      ],
      why: `1 ${big} = ${factor} ${small}s, so ${m} ${big}s = ${m} × ${factor} = ${ans} ${small}s.`,
      diagnose(resp, info) {
        const v = info.th / 1000;
        if (v === m) return `${m} is the number of ${big}s. ${small[0].toUpperCase() + small.slice(1)}s are smaller pieces, so there are more of them.`;
        if (factor === 100 && v === m * 10) return `${info.raw} would be the number of hundredths. Thousandths are 10 times smaller than hundredths, so there are 10 times as many.`;
        if (factor === 10 && v === m * 100) return `That is too many. One ${big} is cut into just 10 ${small}s.`;
        return `First find how many ${small}s make one ${big}, then think about ${m} of them.`;
      }
    };
  });

  T('P4', 'parts', (r, p) => {
    const pairs = [[1, 2], [1, 3], [2, 3]];
    const [ia, ib] = pairs[p.pair !== undefined ? p.pair : r.int(0, 2)];
    const dir = p.dir || r.pick(['bigger', 'smaller']);
    const A = PL[ia], B = PL[ib]; // A is the bigger piece (fewer parts)
    const ans = 'one ' + (dir === 'bigger' ? A.one : B.one);
    const other = 'one ' + (dir === 'bigger' ? B.one : A.one);
    const ratio = B.n / A.n;
    return {
      type: 'mc', sig: ia + ib + dir,
      prompt: `Which is <b>${dir}</b>: one ${A.one} or one ${B.one}?`,
      choices: textChoices(r, ans, [other, 'They are the same size']), answer: ans, answerText: ans,
      hints: [
        'Think about how many equal parts the same whole is cut into for each one.',
        `One ${A.one} comes from cutting a whole into ${A.n} equal parts. One ${B.one} comes from cutting the same whole into ${B.n} equal parts.`,
        'When the same whole is cut into MORE pieces, each piece is SMALLER. Which one has more pieces?'
      ],
      why: `One ${A.one} (${f(1000 / A.n)}) is bigger than one ${B.one} (${f(1000 / B.n)}): it takes ${ratio} ${B.many} to make one ${A.one}.`,
      diagnose(resp) {
        if (resp === 'They are the same size') return `Two pieces are the same size only if the same whole is cut into the same number of parts. Here one whole is cut into ${A.n} parts and the other into ${B.n} parts.`;
        return `"${B.one[0].toUpperCase() + B.one.slice(1)}" sounds bigger because ${B.n} is bigger than ${A.n}. But it means the whole is cut into ${B.n} pieces instead of ${A.n}, and more pieces means each piece is smaller.`;
      }
    };
  });

  T('P5', 'parts', (r, p) => {
    const pl = p.places || r.int(1, 3), P = PL[pl];
    let k = p.k;
    while (!k) { const c = r.int(1, P.n - 1); if (pl === 1 || c % 10) k = c; }
    const scale = 1000 / P.n;
    const ans = f(k * scale, pl);
    const wrongs = [0, 1, 2, 3].filter((e) => e !== pl).map((e) => e === 0 ? String(k) : f(k * Math.pow(10, 3 - e), e));
    return {
      type: 'mc', sig: pl + ':' + k,
      prompt: `A whole is cut into ${P.n} equal parts. Which decimal names <b>${k}</b> of those parts?`,
      choices: textChoices(r, ans, wrongs), answer: ans, answerText: ans,
      hints: [
        'The number of equal parts tells you which place the last digit of the decimal goes in.',
        `${P.n} equal parts are ${P.many}. So the last digit must be in the ${P.many} place.`,
        `The ${P.many} place is the ${ORD[pl]} place after the decimal point. Write ${k} so that its last digit lands there, and use zeros as placeholders if you need them.`
      ],
      why: `${k} out of ${P.n} equal parts is ${s(k, P.one)}. The last digit sits in the ${P.many} place: <b>${ans}</b>.`,
      diagnose(resp) {
        const v = D.parse(resp);
        if (v.places === 0) return `${resp} is a whole number: ${resp} whole things. We have ${k} small parts of one whole, so the answer is less than 1.`;
        return `${resp} is read "${words(resp)}". Its last digit is in the ${W.placeName(v.places)} place, but these parts are ${P.many}.`;
      }
    };
  });

  // ───────────────────────── Skill: models (strip, grid, number line) ─────────────────────────

  T('M1', 'model', (r, p) => {
    const k = p.k || r.int(2, 9); // not 1: hint 2 names one tenth (0.1)
    const ans = f(k * 100, 1);
    return {
      type: 'number', sig: String(k),
      prompt: 'The bar is one whole cut into 10 equal parts. What decimal names the <b>shaded</b> part?',
      visual: M.strip(k), answer: ans, answerText: ans,
      hints: [
        'Count how many equal parts the whole bar has, and how many of them are shaded.',
        'The bar has 10 equal parts, so each part is one tenth (0.1).',
        'Count the shaded parts. That many tenths is written with that digit in the tenths place, right after the decimal point: 0.__'
      ],
      why: `${k} of the 10 equal parts are shaded. That is ${s(k, 'tenth')} = <b>${ans}</b>.`,
      diagnose(resp, info) {
        const th = info.th;
        if (th === k * 1000) return `${info.raw} would mean ${k} whole bars. The shaded part is less than one whole bar, so it needs a decimal point. Tenths go right after the decimal point.`;
        if (th === k * 10) return `${info.raw} is ${s(k, 'hundredth')}. The bar is cut into 10 parts, so each part is a tenth. Tenths are the first place after the decimal point.`;
        if (th === (10 - k) * 100) return 'It looks like you counted the parts that are NOT shaded. Count the shaded (colored) parts.';
        if (th !== null && th > 0 && th % 100 === 0 && th < 1000) return 'Your answer is in tenths, which is good. Count the shaded parts again, one at a time.';
        return 'Each part of this bar is one tenth, so the answer has one digit after the decimal point.';
      }
    };
  });

  function gridDiagnose(k, resp, info) {
    const th = info.th;
    if (th === null) return null;
    if (th >= 1000) return 'Your answer is more than one whole grid. The shaded part is less than one whole, so start with 0 and a decimal point.';
    if (th % 10) return 'Your answer has a digit in the thousandths place. Each square here is one hundredth, so you need only two digits after the decimal point.';
    const n = th / 10, c = Math.floor(k / 10), e = k % 10;
    if (c === 0 && n === e * 10) return `${info.raw} is ${s(e, 'tenth')}, which would be ${s(e, 'full column')}. Look again: no column is completely shaded. Each shaded square is one hundredth.`;
    if (n === 100 - k) return 'It looks like you counted the squares that are NOT shaded. Count the shaded (colored) squares.';
    if (n === e * 10 + c) return 'You have the right digits in the wrong places. Full columns are tenths (first digit after the point). Single squares are hundredths (second digit).';
    if (n === c * 10 && e) return 'You counted the full columns. Now add the extra single squares. Each one is a hundredth.';
    if (n === e && c) return 'You counted the extra single squares. Don\'t forget the full columns. Each full column is one tenth.';
    return 'Count again: first the full columns (each one is 10 squares, one tenth), then the extra single squares (hundredths).';
  }

  T('M2', 'model', (r, p) => {
    let k = p.k;
    while (!k) { const c = r.int(2, 99); if (c % 10 && !RESERVED_HUNDREDTHS.has(c)) k = c; } // not 1: hint 1 names 0.01
    const ans = f(k * 10, 2);
    return {
      type: 'number', sig: String(k),
      prompt: 'The grid is one whole cut into 100 equal squares. What decimal names the <b>shaded</b> part?',
      visual: M.grid(k), answer: ans, answerText: ans,
      hints: [
        'There are 100 equal squares in the whole grid, so each small square is one hundredth (0.01).',
        'Count the full shaded columns first. Each full column is 10 squares, which is one tenth.',
        'Now count the extra shaded squares that are not part of a full column. Full columns go in the tenths place, extra squares go in the hundredths place.'
      ],
      why: `${s(Math.floor(k / 10), 'full column')} (tenths) and ${s(k % 10, 'extra square')} (hundredths) are shaded. That is ${k} hundredths = <b>${ans}</b>.`,
      diagnose: (resp, info) => gridDiagnose(k, resp, info)
    };
  });

  T('M3', 'model', (r, p) => {
    const c = p.c || r.int(1, 9);
    const ans = f(c * 100, 1);
    return {
      type: 'number', sig: String(c),
      prompt: 'The grid is one whole cut into 100 equal squares. What decimal names the <b>shaded</b> part?',
      visual: M.grid(c * 10), answer: ans, answerText: `${ans} (or ${f(c * 100, 2)})`,
      hints: [
        'Look at the columns. Each column of the grid is 10 squares, which is one tenth of the whole.',
        'Count the full shaded columns.',
        'That many full columns is that many tenths. Tenths are the first place after the decimal point.'
      ],
      why: `${s(c, 'full column')} = ${s(c, 'tenth')} = <b>${ans}</b>. It is also ${c * 10} hundredths, ${f(c * 100, 2)}, which is the same amount.`,
      diagnose(resp, info) {
        const th = info.th;
        if (th === c * 10) return `${info.raw} is ${s(c, 'hundredth')}, just ${s(c, 'little square')}. Each shaded column is 10 squares, which is one tenth.`;
        if (th === c * 1000) return `${info.raw} would be ${c} whole grids. The shaded part is less than one whole, so start with 0 and a decimal point.`;
        return gridDiagnose(c * 10, resp, info);
      }
    };
  });

  T('M4', 'model', (r, p) => {
    const variant = p.variant || (r.next() < 0.65 ? 'ab' : '0b');
    let a = p.a, b = p.b, counts, ans, reasons;
    if (variant === 'ab') {
      while (!a || a === b || RESERVED_HUNDREDTHS.has(10 * a + b)) { a = r.int(1, 9); b = r.int(1, 9); }
      ans = f(100 * a + 10 * b, 2);
      counts = [10 * a + b, 10 * b + a, 10 * a, b];
      reasons = [null,
        'This model has the digits switched: its full columns match the hundredths digit. Full columns should match the tenths digit.',
        `This model shows only the tenths. ${ans} also has hundredths, so some single squares should be shaded too.`,
        `This model shows only the hundredths. ${ans} also has tenths, so some full columns should be shaded too.`];
    } else {
      b = b || r.int(1, 9);
      ans = f(10 * b, 2);
      counts = [b, 10 * b, 10 + b, 100 - b];
      reasons = [null,
        `This model shows ${s(b, 'full column')}. That is ${s(b, 'tenth')}. ${ans} has 0 tenths, so no full column should be shaded.`,
        `This model has one full column shaded. That is one tenth, but ${ans} has 0 in the tenths place.`,
        'This model shades the squares that would be left over. Look for the model with the right number of shaded squares.'];
    }
    const order = r.shuffle([0, 1, 2, 3]);
    const letters = ['A', 'B', 'C', 'D'];
    const choices = order.map((i, pos) => ({ value: letters[pos], text: 'Model ' + letters[pos], html: M.grid(counts[i]), idx: i }));
    const correct = choices.find((c) => c.idx === 0).value;
    return {
      type: 'mc', layout: 'models', sig: variant + ':' + counts[0],
      prompt: `Which model shows <b>${ans}</b>? Each grid is one whole.`,
      choices, answer: correct, answerText: 'Model ' + correct,
      hints: [
        `Read ${ans} place by place: which digit is in the tenths place, and which is in the hundredths place?`,
        'The tenths digit tells how many full columns (10 squares each) are shaded.',
        'The hundredths digit tells how many extra single squares are shaded. Find the model that matches both digits.'
      ],
      why: `${ans} = ${s(Math.floor(counts[0] / 10), 'tenth')} and ${s(counts[0] % 10, 'hundredth')}: ${s(Math.floor(counts[0] / 10), 'full column')} and ${s(counts[0] % 10, 'extra square')}. That is Model ${correct}.`,
      diagnose(resp) { const c = choices.find((x) => x.value === resp); return c ? reasons[c.idx] : null; }
    };
  });

  T('M5', 'model', (r, p) => {
    let k = p.k;
    while (!k) { const c = r.next() < 0.25 ? 10 * r.int(1, 9) : r.int(1, 99); if (!RESERVED_HUNDREDTHS.has(c)) k = c; }
    const shown = k % 10 ? f(k * 10, 2) : f(k * 10, 1);
    const c = Math.floor(k / 10), e = k % 10;
    return {
      type: 'build', model: 'grid', sig: String(k),
      prompt: `Shade the grid to show <b>${shown}</b>. Use the buttons to shade full columns (tenths) and single squares (hundredths).`,
      answer: k, answerText: `${s(c, 'column')} and ${s(e, 'square')} shaded`,
      hints: [
        (k % 10 ? `Read ${shown} place by place.` : `${shown} is the same as ${f(k * 10, 2)}. Read it place by place.`) + ' Which digit is in the tenths place? Which is in the hundredths place?',
        'The tenths digit tells you how many full columns to shade.',
        'The hundredths digit tells you how many extra single squares to shade. A 0 means shade none of that kind.'
      ],
      why: `${shown} = ${s(c, 'tenth')} and ${s(e, 'hundredth')}, so shade ${s(c, 'full column')} and ${s(e, 'extra square')} (${k} squares in all).`,
      diagnose(n) {
        const nc = Math.floor(n / 10), ne = n % 10;
        if (nc === e && ne === c) return 'You have the digits switched. Full columns go with the tenths digit (first after the point). Single squares go with the hundredths digit.';
        if (nc === c) return 'Your columns are right. Now check the single squares: the hundredths digit tells how many.';
        if (ne === e) return 'Your single squares are right. Now check the full columns: the tenths digit tells how many.';
        return 'The tenths digit tells how many full columns to shade, and the hundredths digit tells how many extra squares.';
      }
    };
  });

  T('M6', 'model', (r, p) => {
    const k = p.k || r.int(1, 9);
    const shown = f(k * 100, 1);
    return {
      type: 'build', model: 'strip', sig: String(k),
      prompt: `The bar is one whole cut into 10 equal parts. Shade the bar to show <b>${shown}</b>.`,
      answer: k, answerText: `${k} of 10 parts shaded`,
      hints: [
        'Each part of the bar is one tenth.',
        `Look at the digit right after the decimal point in ${shown}. That is the tenths digit.`,
        'Shade the same number of parts as the tenths digit.'
      ],
      why: `${shown} = ${s(k, 'tenth')}, so ${k} of the 10 parts are shaded.`,
      diagnose(n) {
        return `You shaded ${s(n, 'part')}, which is ${s(n, 'tenth')} = ${f(n * 100, 1)}. The tenths digit of ${shown} tells how many parts to shade.`;
      }
    };
  });

  T('M7', 'model', (r, p) => {
    const k = p.k || r.int(2, 9); // not 1: hint 2 names one tenth (0.1)
    const ans = f(k * 100, 1);
    return {
      type: 'number', sig: String(k),
      prompt: 'What decimal is at point <b>A</b>?',
      visual: M.line({ from: 0, to: 1000, point: k * 100, labels: ['0', '1'] }), answer: ans, answerText: ans,
      hints: [
        'The line from 0 to 1 is cut into 10 equal jumps.',
        '10 equal jumps make one whole, so each jump is one tenth (0.1).',
        'Start at 0 and count the jumps (the spaces, not the tick marks) to point A. That many tenths is the answer.'
      ],
      why: `Point A is ${s(k, 'jump')} from 0. Each jump is 0.1, so A is at ${s(k, 'tenth')} = <b>${ans}</b>.`,
      diagnose(resp, info) {
        const th = info.th;
        if (th === (k + 1) * 100) return 'Almost! You counted one too many. Count the jumps (the spaces between tick marks), starting at 0. Don\'t count the tick mark at 0 as a jump.';
        if (th === (k - 1) * 100) return 'Almost! You counted one too few. Count every jump from 0, including the last jump that lands on point A.';
        if (th === k * 1000) return `${info.raw} is a whole number. Point A is between 0 and 1, so it is less than one whole and needs a decimal point.`;
        if (th === k * 10) return `${info.raw} is in hundredths. Each jump on this line is one tenth, so the answer has one digit after the decimal point.`;
        if (th === (10 - k) * 100) return 'It looks like you counted from 1 back to A. Count from 0 forward to A.';
        return 'Count the equal jumps from 0 to point A. Each jump is one tenth.';
      }
    };
  });

  T('M8', 'model', (r, p) => {
    let a = p.a, b = p.b;
    while (a === undefined || RESERVED_HUNDREDTHS.has(10 * a + b) || 10 * a + b === 1) { a = r.int(0, 9); b = r.int(1, 9); }
    const L = a === 0 ? '0' : f(a * 100, 1), R = a === 9 ? '1' : f((a + 1) * 100, 1);
    const Lh = a === 0 ? '0' : f(a * 100, 2);
    const ans = f(a * 100 + b * 10, 2);
    return {
      type: 'number', sig: a + ':' + b,
      prompt: 'What decimal is at point <b>A</b>?',
      visual: M.line({ from: a * 100, to: a * 100 + 100, point: a * 100 + b * 10, labels: [L, R] }), answer: ans, answerText: ans,
      hints: [
        `The labels ${L} and ${R} are one tenth apart. The space between them is cut into 10 equal jumps.`,
        `10 jumps make one tenth, so each jump is one hundredth (0.01).` + (a ? ` In hundredths, the left end is ${Lh}.` : ''),
        a ? `Count the jumps from ${L} to point A. Add that many hundredths to ${Lh}.` : 'Count the jumps from 0 to point A. That many hundredths is the answer.'
      ],
      why: `Each jump is 0.01. Point A is ${s(b, 'jump')} past ${Lh}, so A is at <b>${ans}</b>.`,
      diagnose(resp, info) {
        const th = info.th;
        if (th === a * 100 + (b + 1) * 10) return 'Almost! You counted one too many. Count the jumps (spaces between tick marks) from the left end. Don\'t count the starting tick mark.';
        if (th === a * 100 + (b - 1) * 10) return 'Almost! You counted one too few. Count every jump from the left end, including the last jump that lands on point A.';
        if (a > 0 && th === b * 10) return `Don't forget where the line starts. The left end is ${L}, not 0. Start there and add the jumps.`;
        if (th === a * 100 + b * 100) return 'Each jump on this line is one hundredth, not one tenth. Ten jumps fill the space between the two labels.';
        if (th === a * 100 + b) return 'Each jump is one hundredth (0.01), not one thousandth. The answer has two digits after the decimal point.';
        return `Start at ${L} and count the jumps to A. Each jump adds 0.01.`;
      }
    };
  });

  T('M9', 'model', (r, p) => {
    let a = p.a, b = p.b, c = p.c;
    if (a === undefined) { a = r.int(0, 9); b = r.int(0, 9); c = r.int(1, 9); }
    const ans = f(100 * a + 10 * b + c, 3);
    return {
      type: 'number', sig: '' + a + b + c,
      prompt: 'The grid is one whole. One square has been zoomed in and cut into 10 thin slices. What decimal names <b>all</b> the shaded parts?',
      visual: M.grid(10 * a + b, { thou: c }), answer: ans, answerText: ans,
      hints: [
        'There are three kinds of pieces: full columns (tenths), single squares (hundredths), and thin slices of one square (thousandths).',
        'Count the full columns for the tenths digit, then the single shaded squares for the hundredths digit.',
        'The zoomed square is cut into 10 slices, so each slice is one thousandth. Count the shaded slices for the thousandths digit. Write 0 for any place that has none.'
      ],
      why: `${s(a, 'full column')} (tenths), ${s(b, 'single square')} (hundredths) and ${s(c, 'slice')} (thousandths): <b>${ans}</b>.`,
      remind: '<p><b>Remember:</b> full column = 1 tenth, single square = 1 hundredth, thin slice = 1 thousandth. Write 0 for a place with none. Example: 1 column, 0 squares and 2 slices = 0.102.</p>',
      diagnose(resp, info) {
        const v = D.parse(resp);
        if (droppedZero(resp, ans)) return ZERO_TIP;
        if (v.places < 3) return 'Don\'t forget the thin slices. Each slice is one thousandth, the third place after the decimal point.';
        return placeCheck(resp, ans);
      }
    };
  });

  // ───────────────────────── Skill: place value (place) ─────────────────────────

  /** A number with distinct nonzero digits: 0.xyz or w.xyz. */
  function distinctNumber(r, p, allowWhole) {
    if (p.num) return p.num;
    const ds = r.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    let frac = '' + ds[0] + ds[1] + ds[2];
    if (frac === '627') frac = '' + ds[1] + ds[0] + ds[2];
    const w = allowWhole && r.next() < 0.4 ? ds[3] : 0;
    return w + '.' + frac;
  }
  const placeOfDigit = (num, d) => { const x = D.parse(num); if (x.whole === d) return 'ones'; return PLACE_KEYS[x.frac.indexOf(d) + 1]; };
  const digitAt = (num, place) => place === 'ones' ? D.parse(num).whole : D.parse(num).frac[PLACE_KEYS.indexOf(place) - 1];

  T('PL1', 'place', (r, p) => {
    const num = distinctNumber(r, p, true);
    const hasWhole = D.parse(num).whole !== '0';
    const place = p.place || r.pick(['tenths', 'hundredths', 'thousandths']);
    const ans = digitAt(num, place);
    const ds = (hasWhole ? [D.parse(num).whole] : []).concat(D.parse(num).frac.split(''));
    return {
      type: 'mc', sig: num + place,
      prompt: `In <b>${num}</b>, which digit is in the <b>${place}</b> place?`,
      choices: textChoices(r, ans, ds.filter((d) => d !== ans)), answer: ans, answerText: ans,
      hints: [
        'Find the decimal point first. The places after it go in order: tenths, hundredths, thousandths.',
        'The first digit right after the decimal point is in the tenths place.',
        `Move one digit to the right for each next place: tenths, then hundredths, then thousandths. Stop at the ${place}.` + M.chart(null)
      ],
      why: `In ${num}, the digits after the point are in the tenths, hundredths and thousandths places, so <b>${ans}</b> is in the ${place} place.`,
      diagnose(resp) {
        const pl = placeOfDigit(num, resp);
        return pl === 'ones' ? `${resp} is to the LEFT of the decimal point, so it is in the ones place. The ${place} place is to the right of the point.`
          : `${resp} is in the ${pl} place. Count the places to the right of the decimal point: tenths, hundredths, thousandths.`;
      }
    };
  });

  T('PL2', 'place', (r, p) => {
    const num = distinctNumber(r, p, true);
    const x = D.parse(num);
    const hasWhole = x.whole !== '0';
    const opts = (hasWhole ? [x.whole] : []).concat(x.frac.split(''));
    const d = p.d || r.pick(opts);
    const ans = placeOfDigit(num, d);
    const names = ['ones', 'tenths', 'hundredths', 'thousandths'];
    return {
      type: 'mc', sig: num + d,
      prompt: `In <b>${num}</b>, what is the place of the digit <b>${d}</b>?`,
      choices: names.map((t) => ({ value: t, text: t })), answer: ans, answerText: ans,
      hints: [
        'Find the decimal point. Digits to its left are wholes; digits to its right are parts of a whole.',
        'The digit just left of the decimal point is in the ones place. The digit just right of it is in the tenths place.',
        `Keep moving right from the decimal point (tenths, then hundredths, then thousandths) until you reach the ${d}.` + M.chart(null)
      ],
      why: `In ${num}, the ${d} is ${ans === 'ones' ? 'just left of the decimal point, in the <b>ones</b> place' : `the ${ORD[names.indexOf(ans)]} digit after the decimal point, so it is in the <b>${ans}</b> place`}.`,
      diagnose(resp) {
        const mirror = { tenths: 'thousandths', thousandths: 'tenths' };
        if (ans !== 'ones' && mirror[ans] === resp) return 'It looks like you counted from the right end. Start at the decimal point and count to the right: first tenths, then hundredths, then thousandths.';
        const there = digitAt(num, resp);
        return `In ${num}, the digit in the ${resp} place is ${there}. Find the ${d} again and count its place from the decimal point.`;
      }
    };
  });

  T('PL3', 'place', (r, p) => {
    const num = distinctNumber(r, p, false);
    const pl = p.pl || r.int(1, 3);
    const d = Number(D.parse(num).frac[pl - 1]);
    const vals = [String(d), f(d * 100, 1), f(d * 10, 2), f(d, 3)];
    const ans = vals[pl];
    return {
      type: 'mc', sig: num + pl,
      prompt: `What is the <b>value</b> of the digit <b>${d}</b> in <b>${num}</b>?`,
      choices: textChoices(r, ans, vals.filter((v) => v !== ans)), answer: ans, answerText: `${ans} (${s(d, PL[pl].one)})`,
      hints: [
        `A digit's value depends on its place. First find which place the ${d} is in.`,
        `The ${d} is the ${ORD[pl]} digit after the decimal point.`,
        `Name its place (1st = tenths, 2nd = hundredths, 3rd = thousandths). Its value is ${d} of that place: write ${d} in that place and put zeros in the places before it.`
      ],
      why: `The ${d} is in the ${PL[pl].many} place, so its value is ${s(d, PL[pl].one)} = <b>${ans}</b>.`,
      diagnose(resp) {
        if (resp === String(d)) return `${d} by itself means ${d} ones. In ${num} the ${d} is after the decimal point, so it is worth less than one whole.`;
        const v = D.parse(resp);
        return `${resp} means ${s(d, PL[v.places].one)}. Check which place the ${d} is in.`;
      }
    };
  });

  function chartNumber(r, p) {
    if (p.num) return p.num;
    let t, h, th;
    do {
      t = r.int(0, 9); h = r.int(0, 9); th = r.next() < 0.2 ? 0 : r.int(1, 9);
      if (r.next() < 0.5) { if (r.next() < 0.5) t = 0; else h = 0; }
    } while ((!t && !h && r.next() < 0.7) || (!th && (!h || !t)));
    const ones = r.next() < 0.3 ? r.int(1, 9) : 0;
    return D.canonical(`${ones}.${t}${h}${th}`);
  }

  T('PL4', 'place', (r, p) => {
    const num = chartNumber(r, p);
    return {
      type: 'number', sig: num,
      prompt: 'Write the number shown in the place-value chart as a decimal.',
      visual: M.chart(D.digits(num)), answer: num, answerText: num,
      hints: [
        'Each column of the chart is a place. Write the digits in the same order, left to right.',
        'Write the ones digit, then the decimal point. The decimal point goes between the ones and the tenths.',
        'After the decimal point, write the tenths digit, then hundredths, then thousandths. Keep the zeros, because they hold places.'
      ],
      why: `Reading the chart left to right: ${D.digits(num).ones} one${D.digits(num).ones === '1' ? '' : 's'}, then the decimal point, then ${D.digits(num).tenths} tenths, ${D.digits(num).hundredths} hundredths, ${D.digits(num).thousandths} thousandths: <b>${num}</b>.`,
      diagnose(resp) {
        if (droppedZero(resp, num)) return ZERO_TIP;
        return placeCheck(resp, num);
      }
    };
  });

  T('PL5', 'place', (r, p) => {
    const num = chartNumber(r, p);
    const dg = D.digits(num);
    return {
      type: 'chart', sig: num,
      prompt: `Type each digit of <b>${num}</b> into its place in the chart.`,
      answer: num, answerText: `${dg.ones} . ${dg.tenths} ${dg.hundredths} ${dg.thousandths}`,
      hints: [
        'Find the decimal point first. The digit to its left is the ones. The digits to its right are parts of a whole.',
        'The digit just right of the decimal point goes in the Tenths box.',
        'Keep going right: the next digit goes in Hundredths, the next in Thousandths. Zeros go in the chart too.'
      ],
      why: `${num}: ${dg.ones} in the ones, ${dg.tenths} in the tenths, ${dg.hundredths} in the hundredths, ${dg.thousandths} in the thousandths.`,
      diagnose(resp, info) {
        const got = info.digits;
        const wrong = PLACE_KEYS.filter((k) => got[k] !== dg[k]);
        const fr = (got.tenths + got.hundredths + got.thousandths);
        if (wrong.length && fr.replace(/^0+/, '') === (dg.tenths + dg.hundredths + dg.thousandths).replace(/0+$/, '') && fr !== dg.tenths + dg.hundredths + dg.thousandths) {
          return 'It looks like the digits were lined up from the right, like a whole number. For decimals, start right after the decimal point: the first digit goes in Tenths.';
        }
        const tip = wrong.includes('ones') ? ' The ones digit is the one just left of the decimal point.' : '';
        return `Check the ${list(wrong.map((k) => M.PLACE_TITLES[k]))} box${wrong.length > 1 ? 'es' : ''}.${tip}`;
      }
    };
  });

  T('PL6', 'place', (r, p) => {
    let ds = p.ds;
    while (!ds) { const c = [r.int(0, 9), r.int(0, 9), r.int(0, 9)]; if (c.filter(Boolean).length >= 2) ds = c; }
    let terms = ds.map((d, i) => ({ d, i })).filter((x) => x.d);
    const shuffled = p.order === 'mixed' || (p.order === undefined && r.next() < 0.5);
    if (shuffled) { const sh = r.shuffle(terms); if (sh.every((x, i) => x === terms[i])) sh.reverse(); terms = sh; }
    const ans = f(ds[0] * 100 + ds[1] * 10 + ds[2], 3);
    const phrase = list(terms.map((x) => s(x.d, PL[x.i + 1].one)));
    const listedDigits = terms.map((x) => x.d).join('');
    return {
      type: 'number', sig: ds.join('') + (shuffled ? 'm' : ''),
      prompt: `Write the decimal that has <b>${phrase}</b>.`,
      answer: ans, answerText: D.canonical(ans),
      hints: [
        'Picture a place-value chart: tenths, hundredths, thousandths after the decimal point.',
        shuffled ? 'Put each digit in its own place. Careful: the parts are not listed in order!' : 'Put each digit in its own place: tenths first, then hundredths, then thousandths.',
        'Write 0 in any place that is not mentioned, so the other digits stay in their places.'
      ],
      why: `Put each digit in its place: ${ds[0]} tenths, ${ds[1]} hundredths, ${ds[2]} thousandths. That is <b>${D.canonical(ans)}</b>.`,
      diagnose(resp) {
        const v = D.parse(resp);
        if (shuffled && v.whole === '0' && v.frac === listedDigits) return 'You wrote the digits in the order they were listed. Put each one in its own place instead: tenths, hundredths, thousandths.';
        if (droppedZero(resp, ans)) return ZERO_TIP;
        return placeCheck(resp, ans);
      }
    };
  });

  // ───────────────────────── Skill: reading and writing decimals (words) ─────────────────────────

  function randomK(r, pl) {
    for (;;) { const c = r.int(1, PL[pl].n - 1); if (pl === 1 || c % 10) return c; }
  }

  T('W1', 'words', (r, p) => {
    const pl = p.places || r.int(1, 3);
    const k = p.k || randomK(r, pl);
    const w = p.w !== undefined ? p.w : (r.next() < 0.3 ? r.int(1, 9) : 0);
    const ans = f(w * 1000 + k * (1000 / PL[pl].n), pl);
    const name = words(ans);
    return {
      type: 'number', sig: ans,
      prompt: `Write <b>${name}</b> as a decimal.`,
      answer: ans, answerText: ans,
      hints: [
        `The last word, "${W.placeName(pl, k)}", tells you which place the LAST digit goes in.`,
        `${PL[pl].many[0].toUpperCase() + PL[pl].many.slice(1)} means the number ends in the ${PL[pl].many} place: ${s(pl, 'digit')} after the decimal point.` + (w ? ` The word "and" stands for the decimal point.` : ''),
        `Write ${W.intWords(k)} as digits and place them so the last digit is in the ${PL[pl].many} place. Use zeros as placeholders if you need them.` + (w ? ` Put ${W.intWords(w)} before the decimal point.` : '')
      ],
      why: `"${name}" ends in ${W.placeName(pl)}, so the last digit is in the ${PL[pl].many} place: <b>${ans}</b>.`,
      diagnose(resp, info) {
        const v = info.value;
        if (v.places <= 3 && v.places !== pl && v.whole.length < 4) return `${resp} is read "${words(resp)}". The last word, "${W.placeName(pl, k)}", tells you how many digits go after the decimal point.`;
        return placeCheck(resp, ans);
      }
    };
  });

  T('W2', 'words', (r, p) => {
    const pl = p.places || r.int(2, 3);
    const k = p.k || randomK(r, pl);
    const ans = f(k * (1000 / PL[pl].n), pl);
    const correct = words(ans);
    const wrongs = [1, 2, 3].filter((x) => x !== pl).map((x) => W.intWords(k) + ' ' + W.placeName(x, k));
    wrongs.push(W.intWords(k));
    return {
      type: 'mc', sig: ans,
      prompt: `How do you read <b>${ans}</b>?`,
      choices: textChoices(r, correct, wrongs), answer: correct, answerText: correct,
      hints: [
        'To read a decimal less than 1, read the digits after the point as a whole number, then say the place of the LAST digit.',
        `The digits after the decimal point make the number ${k}.`,
        `Now find the place of the last digit: it is the ${ORD[pl]} digit after the decimal point. Which place is that?`
      ],
      why: `Read the number after the point (${W.intWords(k)}), then the place of the last digit (${W.placeName(pl, k)}): <b>${correct}</b>.`,
      diagnose(resp) {
        if (resp === W.intWords(k)) return `That is how you read the whole number ${k}. A decimal also needs the name of the place of its last digit.`;
        return `Find the last digit of ${ans} and count how many places it is after the decimal point. The name must end with that place.`;
      }
    };
  });

  T('W3', 'words', (r, p) => {
    const w = p.w || r.int(1, 9);
    const zeroTenths = p.zero !== undefined ? p.zero : r.next() < 0.5;
    const b = p.b || r.int(1, 9);
    const a = zeroTenths ? 0 : (p.a || r.int(1, 9));
    const ans = `${w}.${a}${b}`;
    const correct = words(ans);
    const k = a * 10 + b;
    const pool = [
      `${W.intWords(w)} and ${W.intWords(k)} ${W.placeName(zeroTenths ? 1 : 3, k)}`,
      W.intWords(w * 100 + k),
      `${W.intWords(w)} and ${W.intWords(k)} ${W.placeName(zeroTenths ? 3 : 1, k)}`
    ].filter((x) => x !== correct);
    const wrongs = [...new Set(pool)].slice(0, 3);
    return {
      type: 'mc', sig: ans,
      prompt: `How do you read <b>${ans}</b>?`,
      choices: textChoices(r, correct, wrongs), answer: correct, answerText: correct,
      hints: [
        'Read the whole number part first. The decimal point is read as "and".',
        `So start with "${W.intWords(w)} and ..."`,
        `Then read the digits after the point as a number${zeroTenths ? ' (a zero in front does not change how the number is read)' : ''}, and finish with the place of the LAST digit.`
      ],
      why: `${w} is read "${W.intWords(w)}", the point is "and", and ${a}${b} after the point is ${W.intWords(k)} ${W.placeName(2, k)}: <b>${correct}</b>.`,
      diagnose(resp) {
        if (!/ and /.test(resp)) return 'The decimal point is read as "and". Read the whole number, say "and", then read the part after the point.';
        return `Count how many digits come after the decimal point in ${ans}. The place of the LAST digit is the last word of the name.`;
      }
    };
  });

  T('W4', 'words', (r, p) => {
    const pl = p.places || r.int(1, 3);
    const k = p.k || randomK(r, pl);
    const num = f(k * (1000 / PL[pl].n), pl);
    const ans = W.placeName(pl, k);
    return {
      type: 'mc', sig: num,
      prompt: `Finish reading <b>${num}</b>: "${W.intWords(k)} ____"`,
      choices: [1, 2, 3].map((x) => ({ value: W.placeName(x, k), text: W.placeName(x, k) })), answer: ans, answerText: ans,
      hints: [
        'The name of a decimal ends with the place of its LAST digit.',
        `Find the last digit of ${num}.`,
        'Count how many places it is after the decimal point: 1st = tenths, 2nd = hundredths, 3rd = thousandths.'
      ],
      why: `The last digit of ${num} is the ${ORD[pl]} digit after the point, in the ${PL[pl].many} place: "${W.intWords(k)} <b>${ans}</b>".`,
      diagnose() { return `Count the digits after the decimal point in ${num}. The last one decides the place name.`; }
    };
  });

  // ───────────────────────── Skill: equivalent decimals and zeros (equiv) ─────────────────────────

  T('E1', 'equiv', (r, p) => {
    const variant = p.variant || r.pick(['a', 'a', 'ab']);
    let x, correct, wrongs, h2, h3;
    if (variant === 'a') {
      const a = p.a || r.int(1, 9);
      x = f(a * 100, 1);
      correct = f(a * 100, r.next() < 0.6 ? 2 : 3);
      wrongs = [f(a * 10, 2), f(a, 3), a + '.0'];
      h2 = `Picture ${x} on a hundredths grid: ${s(a, 'full column')} shaded. How many hundredths (small squares) is that?`;
      h3 = `${s(a, 'column')} = ${a * 10} hundredths. Look for the choice that still has the ${a} in the tenths place. A digit only changes value if it moves to a different place.`;
    } else {
      let a = p.a, b = p.b;
      while (!a || a === b) { a = r.int(1, 9); b = r.int(1, 9); }
      x = `0.${a}${b}`;
      correct = `0.${a}${b}0`;
      wrongs = [`0.${a}0${b}`, `0.0${a}${b}`, `0.${b}${a}`];
      h2 = 'Write each choice in a place-value chart (tenths, hundredths, thousandths) and compare it digit by digit with ' + x + '.';
      h3 = 'A zero at the very END does not move any digit. A zero placed in front of a digit pushes it into a smaller place.';
    }
    return {
      type: 'mc', sig: variant + x + correct.length,
      prompt: `Which decimal is <b>equal</b> to ${x}?`,
      choices: textChoices(r, correct, wrongs), answer: correct, answerText: correct,
      hints: ['Equal (equivalent) decimals name exactly the same amount, even if they look different.', h2, h3],
      why: `${correct} has the same digits in the same places as ${x}, plus ${correct.length - x.length === 1 ? 'a zero' : 'zeros'} at the end, which does not change the value: ${x} = <b>${correct}</b>.`,
      diagnose(resp) {
        const v = D.parse(resp);
        if (variant === 'ab' && resp === `0.${x[3]}${x[2]}`) return `${resp} has the digits switched. Compare the tenths digits first: ${resp} has ${resp[2]} tenths, but ${x} has ${x[2]} tenths.`;
        if (v.places === 1 && v.frac === '0') return `${resp} means ${v.whole} whole${v.whole === '1' ? '' : 's'}. ${x} is less than one whole.`;
        return `${resp} is read "${words(resp)}", but ${x} is "${words(x)}". A zero placed between the decimal point and a digit moves that digit to a smaller place.`;
      }
    };
  });

  T('E2', 'equiv', (r, p) => {
    const a = p.a || r.int(1, 9);
    let b = p.b || r.int(1, 9);
    if (b === a) b = a === 9 ? 1 : a + 1;
    const pairs = [
      [f(a * 100, 1), f(a * 100, 2), true],
      [f(a * 100, 1), f(a * 10, 2), false],
      [`0.${a}${b}`, `0.${a}${b}0`, true],
      [f(a * 100, 2), f(a * 100, 3), true],
      [f(a * 10, 2), f(a, 3), false],
      [f(a * 100, 1), f(a * 100, 3), true],
      [`0.${a}${b}`, `0.${a}0${b}`, false]
    ];
    const pi = p.pair !== undefined ? p.pair : r.int(0, pairs.length - 1);
    let [x, y, same] = pairs[pi];
    if (r.next() < 0.5) [x, y] = [y, x];
    const ans = same ? 'Equal' : 'Not equal';
    return {
      type: 'mc', sig: x + '|' + y,
      prompt: `Are <b>${x}</b> and <b>${y}</b> equal?`,
      choices: [{ value: 'Equal', text: 'Equal' }, { value: 'Not equal', text: 'Not equal' }], answer: ans, answerText: ans,
      hints: [
        'Two decimals are equal when every digit is in the same place (extra zeros at the end are fine).',
        `Write ${x} and ${y} in a place-value chart, one above the other.`,
        'Compare place by place: tenths with tenths, hundredths with hundredths, thousandths with thousandths. An empty place counts as 0.'
      ],
      why: same ? `<b>Equal.</b> The digits are in the same places; ${x.length > y.length ? x : y} just has ${Math.abs(x.length - y.length) === 1 ? 'an extra zero' : 'extra zeros'} at the end, which does not change the value.`
        : `<b>Not equal.</b> In a place-value chart, the nonzero digits of ${x} and ${y} are not all in the same places. A zero in front of a digit pushes it into a smaller place.`,
      diagnose() {
        return same ? 'Put both numbers in a place-value chart. Check: is any digit in a different place, or is the only difference a zero at the end?'
          : 'Put both numbers in a place-value chart. Look carefully at which place each nonzero digit is in.';
      }
    };
  });

  T('E3', 'equiv', (r, p) => {
    const variant = p.variant || r.pick(['a2', 'a3', 'ab3']);
    let x, places, a = p.a || r.int(1, 9), b;
    if (variant === 'ab3') { b = p.b || r.int(1, 9); x = `0.${a}${b}`; places = 3; }
    else { x = f(a * 100, 1); places = variant === 'a2' ? 2 : 3; }
    const ans = D.fromThousandths(D.toThousandths(x), places);
    return {
      type: 'number', places, sig: variant + x,
      prompt: `Write a decimal that is <b>equal to ${x}</b> but has exactly <b>${places} digits</b> after the decimal point.`,
      answer: ans, answerText: ans,
      hints: [
        'Equal decimals keep every digit in the same place.',
        `${x} has ${D.parse(x).places} digit${D.parse(x).places === 1 ? '' : 's'} after the point. You need ${places}.`,
        'Think about where you can write a zero without moving any digit to a different place.'
      ],
      why: `Writing zeros at the end keeps every digit in its place: ${x} = <b>${ans}</b>.`,
      diagnose(resp, info) {
        const v = info.value;
        if (v.whole !== '0') return `${resp} is one whole or more, but ${x} is less than one. Keep the 0 before the decimal point and keep each digit in its place.`;
        if (v.frac.length > 1 && v.frac[0] === '0' && D.parse(x).frac[0] !== '0') return `In ${resp}, the zero is right after the decimal point, so it pushes the digits into smaller places. Where can a zero go without moving any digit?`;
        return `${resp} is not equal to ${x}. Line them up in a place-value chart and compare each place.`;
      }
    };
  });

  T('E4', 'equiv', (r, p) => {
    const a = p.a || r.int(1, 9);
    const variant = p.variant || r.pick(['same', 'same', 'squares', 'columns']);
    const gk = variant === 'same' ? 10 * a : variant === 'squares' ? a : 10 * (a === 9 ? 8 : a + 1);
    const yes = 'Yes, the same amount', no = 'No, different amounts';
    const ans = variant === 'same' ? yes : no;
    return {
      type: 'mc', sig: a + variant,
      prompt: 'Do these two models show the <b>same amount</b>? Each model is one whole.',
      visual: `<div class="model-pair"><div><p class="model-cap">Bar</p>${M.strip(a)}</div><div><p class="model-cap">Grid</p>${M.grid(gk)}</div></div>`,
      choices: [{ value: yes, text: yes }, { value: no, text: no }], answer: ans, answerText: ans,
      hints: [
        'Both models show one whole. Compare how much of each whole is shaded.',
        'Write each model as a decimal. The bar is cut into tenths. The grid is cut into hundredths.',
        'Compare using the same unit: one part of the bar is the same size as one full column (10 squares) of the grid.'
      ],
      why: `The bar shows ${f(a * 100, 1)} and the grid shows ${f(gk * 10, 2)}. ` + (variant === 'same' ? `${f(a * 100, 1)} = ${f(gk * 10, 2)}, so <b>yes</b>, they are equal.` : `These are <b>different</b> amounts.`),
      diagnose() {
        return 'Write a decimal for each model. Remember that one tenth (one part of the bar) = 10 hundredths (one column of the grid).';
      }
    };
  });

  T('E5', 'equiv', (r, p) => {
    const a = p.a || r.int(1, 9);
    const showTwo = p.show !== undefined ? p.show === 2 : r.next() < 0.5;
    const x = f(a * 100, showTwo ? 2 : 1);
    const ans = f(a * 10, 2);
    const equalForms = [f(a * 100, showTwo ? 1 : 2), f(a * 100, 3), s(a, 'tenth')];
    return {
      type: 'mc', sig: a + (showTwo ? 'b' : 'a'),
      prompt: `Which one is <b>NOT</b> equal to ${x}?`,
      choices: textChoices(r, ans, equalForms), answer: ans, answerText: ans,
      hints: [
        'Three of the choices name the same amount as ' + x + '. Find the one that is different.',
        `${x} has the digit ${a} in the tenths place. Check where the ${a} is in each choice.`,
        `Zeros at the end don't move the ${a}. A zero right after the decimal point does. Which choice has the ${a} in a different place?`
      ],
      why: `In <b>${ans}</b>, the zero after the decimal point pushes the ${a} into the hundredths place, so it is ${s(a, 'hundredth')}, not ${s(a, 'tenth')}.`,
      diagnose(resp) {
        return `${resp} is equal to ${x}: the ${a} is still in the tenths place${/tenth/.test(resp) ? '' : ' (zeros at the end do not change the value)'}. Look for the choice where the ${a} moved.`;
      }
    };
  });

  // ───────────────────────── Skill: comparing with place value (compare) ─────────────────────────

  function trapPair(r, p) {
    let a = p.a, b = p.b, c = p.c;
    while (!a || (a === 4 && b === 3 && c === 5)) { a = r.int(2, 9); b = r.int(1, a - 1); c = r.int(1, 9); }
    return { a, b, c, x: f(a * 100, 1), y: `0.${b}${c}` };
  }

  T('C1', 'compare', (r, p) => {
    const { a, b, c, x, y } = trapPair(r, p);
    const dir = p.dir || r.pick(['greater', 'less']);
    const ans = dir === 'greater' ? x : y;
    const order = r.next() < 0.5 ? [x, y] : [y, x];
    return {
      type: 'mc', sig: x + y + dir,
      prompt: `Which decimal is <b>${dir}</b>: ${order[0]} or ${order[1]}?`,
      choices: textChoices(r, ans, [ans === x ? y : x, 'They are equal']), answer: ans, answerText: ans,
      hints: [
        'Don\'t compare the digits as whole numbers. Compare them place by place, starting at the tenths.',
        `Give both numbers the same number of decimal places: ${x} = ${f(a * 100, 2)}.`,
        `Now both are in hundredths: compare ${a}0 hundredths and ${b}${c} hundredths.`
      ],
      why: `${x} = ${f(a * 100, 2)}. ${a * 10} hundredths is more than ${b * 10 + c} hundredths, so ${x} > ${y}. The ${dir} one is <b>${ans}</b>.`,
      diagnose(resp) {
        if (resp === 'They are equal') return 'They are not equal. Write both numbers with two decimal places and compare them.';
        return `${b}${c} is bigger than ${a} as whole numbers, but ${x} means ${s(a, 'tenth')} and ${y} means ${b * 10 + c} hundredths. Write ${x} with two decimal places and compare again.`;
      }
    };
  });

  T('C2', 'compare', (r, p) => {
    const variant = p.variant || r.pick(['equal', 'trap', 'zero']);
    let x, y, explainSame;
    if (variant === 'equal') { const a = p.a || r.int(1, 9); x = f(a * 100, 1); y = f(a * 100, 2); }
    else if (variant === 'trap') ({ x, y } = trapPair(r, p));
    else { const a = p.a || r.int(2, 9); const b = p.b || r.int(1, a - 1); x = f(a * 10, 2); y = f(b * 100, 1); }
    if (r.next() < 0.5) [x, y] = [y, x];
    const c = D.cmp(x, y);
    const ans = c < 0 ? '<' : c > 0 ? '>' : '=';
    const x2 = f(D.toThousandths(x), 2), y2 = f(D.toThousandths(y), 2);
    explainSame = `${x} = ${x2} and ${y} = ${y2}.`;
    const names = { '<': 'is less than', '>': 'is greater than', '=': 'is equal to' };
    return {
      type: 'mc', layout: 'symbols', sig: x + '|' + y,
      prompt: `Choose the symbol that makes this true: <span class="cmp">${x} <span class="cmp-box" aria-label="blank">?</span> ${y}</span>`,
      choices: ['<', '>', '='].map((t) => ({ value: t, text: t, sr: names[t] })), answer: ans, answerText: `${x} ${ans} ${y}`,
      hints: [
        'Compare decimals place by place, starting with the biggest place (the tenths).',
        'Write both numbers with two decimal places, so both are in hundredths. Add a zero at the end of a number that has only one decimal place.',
        'Then compare how many hundredths each number has. Remember: the open side of < or > faces the bigger number.'
      ],
      why: `${explainSame} So ${x} ${names[ans]} ${y}: <b>${x} ${ans} ${y}</b>.`,
      diagnose(resp) {
        if (ans === '=') return 'Line both numbers up in a place-value chart and compare each place, starting with the tenths.';
        if (resp === '=') return 'These two numbers are not the same amount. Write both with two decimal places and compare.';
        return 'Check your symbol. Write both numbers with two decimal places, compare the hundredths, and make the open side of the symbol face the bigger number.';
      }
    };
  });

  T('C3', 'compare', (r, p) => {
    let a = p.a, b = p.b;
    if (!a) { a = r.int(2, 9); b = r.int(1, a - 1); }
    const x = f(a * 10, 2), y = f(b * 100, 1);
    const dir = p.dir || r.pick(['less', 'greater']);
    const ans = dir === 'less' ? x : y;
    const order = r.next() < 0.5 ? [x, y] : [y, x];
    return {
      type: 'mc', sig: x + y + dir,
      prompt: `Which decimal is <b>${dir}</b>: ${order[0]} or ${order[1]}?`,
      choices: textChoices(r, ans, [ans === x ? y : x, 'They are equal']), answer: ans, answerText: ans,
      hints: [
        'A bigger digit does not always mean a bigger number. What matters is the digit\'s place.',
        `Look at the tenths place first. ${x} has 0 tenths. ${y} has ${s(b, 'tenth')}.`,
        'The number with more tenths is greater, no matter what comes after.'
      ],
      why: `${x} has 0 tenths (it is ${s(a, 'hundredth')}), and ${y} has ${s(b, 'tenth')} = ${b * 10} hundredths. So ${x} < ${y}, and the ${dir} one is <b>${ans}</b>.`,
      diagnose(resp) {
        if (resp === 'They are equal') return 'They are not equal. Compare the tenths digits first.';
        return `${a} is bigger than ${b}, but in ${x} the ${a} is in the hundredths place (the zero holds the tenths place). Compare the tenths digits first.`;
      }
    };
  });

  // ───────────────────────── Word problem and reasoning ─────────────────────────

  T('P6', 'parts', (r, p) => {
    const stories = [
      null,
      (k) => `A chocolate bar is cut into 10 equal pieces. Maya eats ${k} of the pieces. What decimal names the part of the bar that Maya eats?`,
      (k) => `A sheet has 100 stickers, all the same size. Leo uses ${k} of the stickers. What decimal names the part of the sheet that Leo uses?`,
      (k) => `A jar holds 1,000 beads, all the same size. ${k} of the beads are red. What decimal names the part of all the beads that is red?`
    ];
    const pl = p.places || r.int(1, 3), P = PL[pl];
    let k = p.k;
    while (!k) { const c = r.int(2, P.n - 1); if ((pl === 1 && c !== 3) || (pl > 1 && c % 10)) k = c; }
    const ans = f(k * (1000 / P.n), pl);
    return {
      type: 'number', sig: pl + ':' + k,
      prompt: stories[pl](k),
      answer: ans, answerText: ans,
      hints: [
        `Think of all ${P.n} together as one whole. Each one is one ${P.one} of the whole.`,
        `${P.n} equal parts are ${P.many}, so the last digit of your decimal goes in the ${P.many} place.`,
        `Write ${k} so that its last digit is in the ${P.many} place (the ${ORD[pl]} place after the decimal point). Use zeros as placeholders if you need them.`
      ],
      why: `${k} out of ${P.n} equal parts is ${s(k, P.one)} of the whole, written <b>${ans}</b>.`,
      diagnose(resp, info) {
        const v = info.value;
        if (v.places === 0) return `${resp} is a whole number. The answer is a part of one whole, so it is less than 1 and needs a decimal point.`;
        if (v.places !== pl && v.places <= 3 && v.whole.length < 4) return `${resp} is read "${words(resp)}". There are ${P.n} equal parts, so the answer should be in ${P.many}.`;
        if (droppedZero(resp, ans)) return ZERO_TIP;
        return placeCheck(resp, ans);
      }
    };
  });

  T('C4', 'compare', (r, p) => {
    const { a, b, c, x, y } = trapPair(r, p);
    const name = p.name || r.pick(['Sam', 'Ana', 'Jordan', 'Mia', 'Eli']);
    const claimTrue = p.claim !== undefined ? p.claim === 'true' : r.next() < 0.5;
    const bc = b * 10 + c;
    let prompt, right, wrongs;
    if (claimTrue) {
      prompt = `${name} says <b>${x}</b> is greater than <b>${y}</b> because ${s(a, 'tenth')} is more than ${s(b, 'tenth')}. Is ${name} right?`;
      right = `Yes. ${x} has ${s(a, 'tenth')} and ${y} has only ${s(b, 'tenth')}, so ${x} is greater.`;
      wrongs = [`No. ${b}${c} is greater than ${a}, so ${y} is greater.`, `No. ${y} has more digits, so it is greater.`, `Yes. ${x} has fewer digits, so it is greater.`];
    } else {
      prompt = `${name} says <b>${y}</b> is greater than <b>${x}</b> because ${b}${c} is greater than ${a}. Is ${name} right?`;
      right = `No. ${x} is ${a * 10} hundredths, which is more than ${bc} hundredths.`;
      wrongs = [`Yes. ${b}${c} is greater than ${a}, so ${y} is greater.`, `Yes. ${y} has more digits, so it is greater.`, `No. ${x} is greater because it has fewer digits.`];
    }
    return {
      type: 'mc', sig: x + y + (claimTrue ? 't' : 'f'),
      prompt, choices: textChoices(r, right, wrongs), answer: right, answerText: right,
      hints: [
        'Check the reason with place value. A true answer needs a true reason.',
        'Rewrite the two numbers so they have the same number of decimal places.',
        'Compare the numbers place by place, starting with the tenths. Then choose the answer whose reason matches what you found.'
      ],
      why: `${x} is ${s(a, 'tenth')} = ${a * 10} hundredths, and ${y} is ${bc} hundredths, so ${x} is greater. Comparing ${b}${c} with ${a} as whole numbers, or counting digits, does not work: compare place by place.`,
      diagnose(resp) {
        if (/fewer digits|more digits/.test(resp)) return 'The number of digits does not decide which decimal is greater. Compare place by place, starting with the tenths.';
        if (/equal/.test(resp)) return `Being less than 1 does not make two decimals equal. Compare the tenths: ${x} has ${s(a, 'tenth')}, ${y} has ${s(b, 'tenth')}.`;
        return `${b}${c} is bigger than ${a} as whole numbers, but ${x} means ${s(a, 'tenth')} and ${y} means ${bc} hundredths. Compare them in the same unit.`;
      }
    };
  });

  // Short reminder cards, shown with feedback after a wrong answer.
  const remind = {
    parts: `<p><b>Remember:</b> 1 whole = 10 tenths = 100 hundredths = 1000 thousandths. The more equal pieces a whole is cut into, the smaller each piece is.</p>`,
    model: `<p><b>Remember:</b> on a hundredths grid, one full column is one tenth and one single square is one hundredth. 3 full columns and 4 squares = 0.34.</p>${M.grid(34)}`,
    place: `<p><b>Remember:</b> after the decimal point the places go tenths, hundredths, thousandths.</p>${M.chart({ ones: '0', tenths: '6', hundredths: '2', thousandths: '7' }, { caption: '0.627' })}`,
    words: `<p><b>Remember:</b> read the digits after the point as a whole number, then say the place of the LAST digit. 0.43 is "forty-three hundredths". The decimal point is read as "and": 2.5 is "two and five tenths".</p>`,
    equiv: `<p><b>Remember:</b> a zero at the END does not change a decimal: 0.5 = 0.50. A zero right after the point moves the digits: 0.05 is NOT 0.5.</p>`,
    compare: `<p><b>Remember:</b> to compare 0.4 and 0.35, write 0.4 as 0.40. Now compare 40 hundredths and 35 hundredths: 0.4 &gt; 0.35.</p>`
  };

  G.engine.register({
    lessonId: 'd01',
    skills: {
      parts: 'Equal parts: tenths, hundredths, thousandths',
      model: 'Decimal models (bars, grids, number lines)',
      place: 'Place value of decimal digits',
      words: 'Reading and writing decimals',
      equiv: 'Equivalent decimals and zero placeholders',
      compare: 'Comparing with place value (like 0.4 and 0.35)'
    },
    plan: { parts: 1, model: 3, place: 2, words: 1, equiv: 2, compare: 1 },
    practiceOnly: ['E2', 'E4'],
    templates, remind
  });
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
