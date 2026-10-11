// NumberNova Practice Center: seeded question generators for adding, subtracting, multiplying and dividing decimals.
// Each operation has five levels (foundational to word problems) and three challenge tiers. Questions are rebuilt
// from (template id, seed) like lesson questions, so a paused session resumes exactly. All arithmetic is exact
// (thousandths, as integers). Questions plug into the app's coaching: three hints, feedback that names the mistake,
// retries, and a worked solution.
(function (G) {
  'use strict';
  const D = G.D, M = G.models, K = G.kit;
  const { num, f, s: plural } = K;
  const templates = [];
  const META = {};

  // ───────── Skills: names for results and Parent Progress, and the lesson screen to review ─────────
  const SKILLS = {
    'add.basic': { name: 'Adding tenths', lesson: 'd06', ls: 'addModel' },
    'add.regroup': { name: 'Adding with regrouping', lesson: 'd06', ls: 'addAlign' },
    'add.places': { name: 'Adding decimals with different numbers of places', lesson: 'd06', ls: 'addMixed' },
    'add.whole': { name: 'Adding whole numbers and decimals, and three numbers', lesson: 'd06', ls: 'addMixed', screen: 'whole' },
    'add.word': { name: 'Addition word problems', lesson: 'd06', ls: 'addWord' },
    'add.chal': { name: 'Challenge: adding', lesson: 'd06', ls: 'addAlign' },
    'sub.basic': { name: 'Subtracting tenths', lesson: 'd07', ls: 'subModel' },
    'sub.regroup': { name: 'Subtracting with regrouping', lesson: 'd07', ls: 'subAlign' },
    'sub.places': { name: 'Subtracting decimals with different numbers of places', lesson: 'd07', ls: 'subZeros' },
    'sub.zeros': { name: 'Subtracting across zeros and from whole numbers', lesson: 'd07', ls: 'subZeros' },
    'sub.word': { name: 'Subtraction word problems', lesson: 'd07', ls: 'subWord' },
    'sub.chal': { name: 'Challenge: subtracting', lesson: 'd07', ls: 'subZeros' },
    'mul.pow10': { name: 'Multiplying by 10, 100 and 1000', lesson: 'd08', ls: 'mPow' },
    'mul.whole': { name: 'A decimal times a whole number', lesson: 'd08', ls: 'mWhole' },
    'mul.dec': { name: 'A decimal times a decimal', lesson: 'd08', ls: 'mPoint', alsoLs: ['mTenths'] },
    'mul.word': { name: 'Multiplication word problems', lesson: 'd08', ls: 'mWord' },
    'mul.chal': { name: 'Challenge: multiplying', lesson: 'd08', ls: 'mPoint' },
    'div.pow10': { name: 'Dividing by 10, 100 and 1000', lesson: 'd09', ls: 'dPow' },
    'div.share': { name: 'Sharing tenths equally', lesson: 'd09', ls: 'dModel' },
    'div.whole': { name: 'A decimal divided by a whole number', lesson: 'd09', ls: 'dWhole' },
    'div.small': { name: 'Division answers less than 1', lesson: 'd09', ls: 'dWhole', screen: 'small' },
    'div.fact': { name: 'Using a related whole-number fact', lesson: 'd09', ls: 'dWhole' },
    'div.word': { name: 'Division word problems', lesson: 'd09', ls: 'dWord' },
    'div.chal': { name: 'Challenge: dividing', lesson: 'd09', ls: 'dWhole' }
  };
  const OPS = { add: { name: 'Adding', sym: '+', verb: 'add' }, sub: { name: 'Subtracting', sym: '−', verb: 'subtract' },
    mul: { name: 'Multiplying', sym: '×', verb: 'multiply' }, div: { name: 'Dividing', sym: '÷', verb: 'divide' } };

  // ───────── Number helpers (k = an amount in thousandths) ─────────
  const tenths = (r, w0, w1) => r.int(w0, w1) * 1000 + r.int(1, 9) * 100;
  const hund = (r, w0, w1) => r.int(w0, w1) * 1000 + r.int(0, 9) * 100 + r.int(1, 9) * 10;
  const placesOf = (k) => (k % 10 ? 3 : k % 100 ? 2 : k % 1000 ? 1 : 0);
  const whole = (k) => k % 1000 === 0;
  const round1 = (k) => Math.floor((k + 500) / 1000);
  const digitsOf = (k) => { const p = placesOf(k); return Number(String(Math.round(k / 10 ** (3 - p))).replace(/^0+(?=\d)/, '')); };
  const PLACE = ['ones', 'tenths', 'hundredths', 'thousandths'];
  const money = (k) => '$' + f(k, 2);
  const contains = (text, ans) => new RegExp('(^|[^0-9.])' + ans.replace('.', '\\.') + '(?![0-9])').test(String(text).replace(/<[^>]*>/g, ''));

  /** Register a template. make returns a question, or null to draw new numbers. Hints never contain the answer. */
  function T(id, skill, op, level, make) {
    META[id] = { op, level, skill };
    templates.push({ id, skill, make: (r, p) => {
      for (let tries = 0; tries < 60; tries++) {
        const q = make(r, p);
        if (!q) continue;
        if (q.hints.some((h) => contains(h, q.answer))) continue;
        q.pcOp = op; q.pcLevel = level;
        return q;
      }
      throw new Error('could not build ' + id);
    } });
  }

  // ───────── Adding and subtracting ─────────
  function addSub(op, ks, o = {}) {
    const plus = op === 'add', sym = plus ? '+' : '−';
    const total = plus ? ks.reduce((a, b) => a + b, 0) : ks[0] - ks[1];
    if (total <= 0 || whole(total) || placesOf(total) > 2) return null; // whole answers would let an estimate give them away
    const nums = ks.map(num), ans = num(total), P = Math.max(...ks.map(placesOf));
    const notes = ks.map((k, i) => (placesOf(k) < P ? (whole(k) ? `${nums[i]} is a whole number, so it becomes ${f(k, P)}` : `${nums[i]} becomes ${f(k, P)}`) : '')).filter((x) => x);
    const ests = ks.map(round1), est = plus ? ests.reduce((a, b) => a + b, 0) : ests[0] - ests[1];
    const small = ks.every((k) => k < 1000);
    const col = PLACE[P], digs = ks.map((k) => Math.floor(k / 10 ** (3 - P)) % 10);
    const expr = nums.join(` ${sym} `);
    const hints = [
      (o.word ? `This is ${plus ? 'an addition' : 'a subtraction'} problem: ${expr}. ` : '') + `Line up the decimal points${notes.length ? `, and write zeros so every number has ${plural(P, 'decimal place')}: ${notes.join('; ')}` : ''}.`,
      small ? (plus ? `Estimate: every number is less than 1, so the sum is less than ${ks.length}.` : `Estimate: both numbers are less than 1, so the difference is less than 1.`)
        : `Estimate first: about ${ests.join(` ${sym} `)} = ${est}, so your answer should be close to ${est}.`,
      plus ? `Start with the ${col} column: ${digs.join(' + ')}. If a column makes 10 or more, write the ones digit and carry 1 to the next place to the left. Then bring the decimal point straight down.`
        : `Start with the ${col} column: ${digs[0]} − ${digs[1]}.${digs[0] < digs[1] ? ` ${digs[0]} is less than ${digs[1]}, so regroup first: take 1 from the next place to the left.` : ''} Work left one column at a time, then bring the decimal point straight down.`
    ];
    const ansText = o.money ? money(total) : o.unit ? `${ans} ${o.unit}` : ans;
    return {
      type: 'number', sig: (o.sigPrefix || '') + expr,
      prompt: o.prompt || `${plus ? 'Add' : 'Subtract'}: <span class="expr">${expr}</span>`,
      visual: o.vertical ? M.vertical(nums, sym, { answer: '' }) : undefined,
      // "Show me a picture": the same numbers written in columns (only when the question does not already show them).
      picture: o.vertical ? undefined : M.vertical(nums, sym, { answer: '', label: `${nums.join(plus ? ' plus ' : ' minus ')}, written in columns with the decimal points lined up.` }),
      answer: ans, answerText: ansText, hints,
      why: `${expr} = <b>${o.money ? money(total) : ans}</b>${plus ? '' : `. Check by adding: ${ans} + ${nums[1]} = ${nums[0]}`}.`,
      solution: K.columnSolution(nums, sym),
      diagnose(resp, info) {
        const got = info.th;
        if (got === null) return 'Sums and differences here have at most two decimal places.';
        if (plus && ks.length === 2 && got === Math.abs(ks[0] - ks[1])) return 'That is the difference. This problem asks you to add (put the amounts together).';
        // A no-regrouping answer can equal the sum (100 − 13.65 → 113.65); name the regrouping mistake first.
        if (!plus && got === D.toThousandths(K.noBorrowSub(nums[0], nums[1])) && got !== total) return 'Check your regrouping. When the top digit is smaller (a 0 counts too), take 1 from the next place to the left; do not subtract the top digit from the bottom one.';
        if (!plus && got === ks[0] + ks[1]) return 'That is the sum. This problem asks you to subtract (take away, or find the difference).';
        if (ks.length === 2 && placesOf(ks[0]) !== placesOf(ks[1])) {
          const mis = K.misaligned(nums[0], nums[1], plus ? '+' : '-');
          if (mis && got === D.toThousandths(mis)) return 'It looks like the digits were lined up from the right, like whole numbers. Line up the decimal points instead, and write zeros to fill the empty places.';
        }
        if (ks.length === 2 && plus && got === D.toThousandths(K.noCarryAdd(nums[0], nums[1]))) return 'Check your carrying. When a column makes 10 or more, write the ones digit and carry 1 to the next column on the left.';
        if (!plus && got === D.toThousandths(K.noBorrowSub(nums[0], nums[1]))) return 'Check your regrouping. When the top digit is smaller, take 1 from the next place to the left; do not subtract the top digit from the bottom one.';
        if (got === total * 10 || got * 10 === total || got === total * 100 || got * 100 === total) return 'The digits look right, but the decimal point is in the wrong place. Bring it straight down from the lined-up points.';
        if ([1000, 100, 10].includes(Math.abs(got - total))) return `Very close! One column is off by one. Check each place where you ${plus ? 'carried' : 'regrouped'}.`;
        return `Line up the decimal points and work one column at a time from the right.${small ? '' : ` Your answer should be close to your estimate (about ${est}).`}`;
      }
    };
  }

  // Adding: level 1 tenths without regrouping, 2 regrouping, 3 different numbers of places, 4 whole numbers or three
  // numbers, 5 word problems.
  T('A1', 'add.basic', 'add', 1, (r) => {
    const a = tenths(r, 0, 9), b = tenths(r, 0, 9);
    if ((a % 1000) / 100 + (b % 1000) / 100 >= 10) return null;
    return addSub('add', [a, b], { vertical: true });
  });
  T('A2', 'add.regroup', 'add', 2, (r) => {
    const a = hund(r, 0, 20), b = hund(r, 0, 20);
    if ((a % 100) / 10 + (b % 100) / 10 < 10) return null;
    return addSub('add', [a, b], { vertical: true });
  });
  T('A3', 'add.places', 'add', 3, (r) => { const x = [tenths(r, 0, 30), hund(r, 0, 30)]; return addSub('add', r.next() < 0.5 ? x : x.reverse()); });
  T('A4', 'add.whole', 'add', 4, (r) => {
    if (r.next() < 0.5) { const x = [r.int(2, 40) * 1000, r.next() < 0.5 ? tenths(r, 0, 9) : hund(r, 0, 9)]; return addSub('add', r.next() < 0.5 ? x : x.reverse()); }
    return addSub('add', r.shuffle([hund(r, 0, 9), tenths(r, 0, 9), hund(r, 0, 9)]));
  });
  const ADD_STORIES = [
    (a, b) => ({ prompt: `A notebook costs <b>${money(a)}</b> and a set of markers costs <b>${money(b)}</b>. How much do they cost <b>together</b>?`, money: true }),
    (a, b) => ({ prompt: `Maya walked <b>${num(a)} km</b> in the morning and <b>${num(b)} km</b> in the afternoon. How many kilometers did she walk <b>in all</b>?`, unit: 'km' }),
    (a, b) => ({ prompt: `One bag of apples weighs <b>${num(a)} kg</b> and another weighs <b>${num(b)} kg</b>. What is the <b>total</b> weight in kilograms?`, unit: 'kg' }),
    (a, b) => ({ prompt: `A plant was <b>${num(a)} m</b> tall. It grew <b>${num(b)} m</b>. How tall is it <b>now</b>, in meters?`, unit: 'm' })
  ];
  // Sensible amounts for each story: prices of at least $1, walks and bags of at least 1, a plant that grows less than its height.
  T('A5', 'add.word', 'add', 5, (r) => {
    const k = r.int(0, ADD_STORIES.length - 1);
    const any = (w0, w1) => (r.next() < 0.5 ? tenths(r, w0, w1) : hund(r, w0, w1));
    const a = k === 0 ? hund(r, 1, 15) : k === 3 ? any(1, 3) : any(1, 9);
    const b = k === 0 ? hund(r, 1, 9) : k === 3 ? hund(r, 0, 0) : hund(r, 1, 9);
    const st = ADD_STORIES[k](a, b);
    return addSub('add', [a, b], Object.assign({ word: true, sigPrefix: 'w' + k + ':' }, st));
  });
  // Challenge: three numbers of different lengths, bigger whole parts, and carries across the decimal point.
  T('AC1', 'add.chal', 'add', 6, (r) => addSub('add', r.shuffle([hund(r, 0, 20), tenths(r, 0, 20), hund(r, 0, 20)])));
  T('AC2', 'add.chal', 'add', 7, (r) => addSub('add', r.shuffle([r.int(10, 99) * 1000, hund(r, 0, 30), tenths(r, 0, 30)])));
  T('AC3', 'add.chal', 'add', 8, (r) => {
    const a = hund(r, 20, 150), b = hund(r, 10, 99), c = tenths(r, 1, 50);
    if (((a % 1000) + (b % 1000) + (c % 1000)) < 1000) return null; // the decimal parts carry into the ones
    return addSub('add', r.shuffle([a, b, c]));
  });

  // Subtracting: level 1 tenths without regrouping, 2 regrouping, 3 different numbers of places, 4 from whole numbers
  // and across zeros, 5 word problems.
  T('S1', 'sub.basic', 'sub', 1, (r) => {
    const a = tenths(r, 1, 9), b = tenths(r, 0, 9);
    if (b >= a || (a % 1000) < (b % 1000)) return null;
    return addSub('sub', [a, b], { vertical: true });
  });
  T('S2', 'sub.regroup', 'sub', 2, (r) => {
    const a = hund(r, 2, 20), b = hund(r, 0, 9);
    if (b >= a || (a % 100) >= (b % 100)) return null;
    return addSub('sub', [a, b], { vertical: true });
  });
  T('S3', 'sub.places', 'sub', 3, (r) => {
    const top = r.next() < 0.5;
    const a = top ? tenths(r, 2, 20) : hund(r, 2, 20), b = top ? hund(r, 0, 12) : tenths(r, 0, 12);
    return b < a ? addSub('sub', [a, b]) : null;
  });
  T('S4', 'sub.zeros', 'sub', 4, (r) => {
    if (r.next() < 0.5) { const a = r.int(2, 20) * 1000, b = r.next() < 0.5 ? hund(r, 0, 19) : tenths(r, 0, 19); return b < a ? addSub('sub', [a, b]) : null; }
    const a = r.int(2, 20) * 1000 + r.int(1, 9) * 10, b = hund(r, 0, 9); // like 5.03: regroup across the zero tenths
    return b < a && (a % 100) < (b % 100) ? addSub('sub', [a, b]) : null;
  });
  T('S5', 'sub.word', 'sub', 5, (r) => {
    if (r.next() < 0.5) {
      const paid = r.pick([5, 10, 20]) * 1000, cost = hund(r, 1, paid / 1000 - 1);
      return addSub('sub', [paid, cost], { word: true, money: true, sigPrefix: 'c:', prompt: `You buy a book that costs <b>${money(cost)}</b> and pay with a <b>$${paid / 1000}</b> bill. How much <b>change</b> do you get?` });
    }
    const a = r.next() < 0.5 ? hund(r, 2, 9) : tenths(r, 2, 9), b = hund(r, 0, 3);
    return b < a ? addSub('sub', [a, b], { word: true, unit: 'm', sigPrefix: 'r:', prompt: `A blue ribbon is <b>${num(a)} m</b> long and a red ribbon is <b>${num(b)} m</b> long. How much <b>longer</b> is the blue ribbon, in meters?` }) : null;
  });
  // Challenge: regrouping across several zeros, and a two-step money problem.
  T('SC1', 'sub.chal', 'sub', 6, (r) => {
    const a = r.int(10, 90) * 1000 + r.int(1, 9) * 10, b = hund(r, 1, 9) + r.int(0, 2) * 10000; // like 40.05 − 17.68
    return b < a && (a % 100) < (b % 100) ? addSub('sub', [a, b]) : null;
  });
  T('SC2', 'sub.chal', 'sub', 7, (r) => { const a = r.pick([50, 100, 200]) * 1000, b = hund(r, 10, a / 1000 - 1); return addSub('sub', [a, b]); });
  T('SC3', 'sub.chal', 'sub', 8, (r) => {
    const paid = 20000, x = hund(r, 1, 7), y = hund(r, 1, 7), spent = x + y;
    if (spent >= paid || whole(paid - spent) || whole(spent)) return null;
    const left = paid - spent, ans = num(left);
    const q = addSub('sub', [paid, spent], { money: true });
    if (!q) return null;
    return Object.assign(q, {
      sig: 'two:' + num(x) + '+' + num(y),
      prompt: `You have <b>$20</b>. You buy a puzzle for <b>${money(x)}</b> and a ball for <b>${money(y)}</b>. How much money do you have <b>left</b>?`,
      hints: [
        'This takes two steps: first find how much you spent (add), then subtract that from $20.',
        `Step 1: add ${money(x)} + ${money(y)} with the decimal points lined up.`,
        'Step 2: write $20 as $20.00, line up the decimal points with the amount spent, and subtract, regrouping across the zeros.'
      ],
      why: `Spent: ${money(x)} + ${money(y)} = ${money(spent)}. Left: $20.00 − ${money(spent)} = <b>${money(left)}</b>.`,
      solution: `<p><b>Step 1:</b> find how much was spent.</p>${K.columnSolution([num(x), num(y)], '+')}<p><b>Step 2:</b> subtract it from $20.</p>${K.columnSolution(['20', num(spent)], '−')}`,
      answer: ans, answerText: money(left)
    });
  });

  // ───────── Multiplying ─────────
  /** Worked steps for a × b: multiply as whole numbers, count decimal places, place the point. */
  function mulSolution(ka, kb) {
    const pa = placesOf(ka), pb = placesOf(kb), A = digitsOf(ka), B = digitsOf(kb), prod = A * B, P = pa + pb;
    const raw = P ? String(prod).padStart(P + 1, '0').replace(new RegExp(`(\\d{${P}})$`), '.$1') : String(prod);
    const ans = num(ka * kb / 1000);
    return `<ol class="sol-steps">
      <li>Multiply as if there were no decimal points: ${A} × ${B} = ${prod}.</li>
      <li>Count the decimal places: ${num(ka)} has ${pa} and ${num(kb)} has ${pb}, so the product has ${P}.</li>
      <li>Start at the right end of ${prod} and move the decimal point ${plural(P, 'place')} to the left${String(prod).length <= P ? ' (write zeros in front, because there are not enough digits)' : ''}: ${raw}${raw !== ans ? ` = ${ans}` : ''}.</li>
      <li>${ka < 1000 || kb < 1000 ? `Check: ${ka < 1000 && kb < 1000 ? 'both factors are less than 1, so the answer is smaller than both of them' : `one factor is less than 1, so the answer is smaller than ${num(Math.max(ka, kb))}`}.` : `Check with an estimate: about ${round1(ka)} × ${round1(kb)} = ${round1(ka) * round1(kb)}, and ${ans} is close to that.`}</li></ol>`;
  }
  function mul(ka, kb, o = {}) {
    const prodK = ka * kb / 1000;
    if (!Number.isInteger(prodK) || placesOf(prodK) > 3 || whole(prodK) && !o.pow) return null;
    const a = num(ka), b = num(kb), ans = num(prodK), pa = placesOf(ka), pb = placesOf(kb);
    const pow = o.pow;
    const z = pow ? String(kb / 1000).length - 1 : 0;
    const hints = pow ? [
      `Multiplying by ${b} makes a number ${b} times as large: every digit moves ${plural(z, 'place')} to the left.`,
      `Count the zeros in ${b}: there ${z === 1 ? 'is 1' : `are ${z}`}. So the decimal point in ${a} moves ${plural(z, 'place')} to the right.`,
      `Move the point one place at a time, writing a zero if you run out of digits. The answer is bigger than ${a}.`
    ] : [
      (o.word ? `This is a multiplication problem: ${a} × ${b}. ` : '') + `Multiply as if there were no decimal points: ${digitsOf(ka)} × ${digitsOf(kb)}.`,
      `Count the decimal places in both numbers: ${a} has ${pa} and ${b} has ${pb}, so the answer has ${pa + pb}.`,
      `Start at the right end of your whole-number answer and move the decimal point ${plural(pa + pb, 'place')} to the left. Check: ${ka < 1000 || kb < 1000 ? 'multiplying by a number less than 1 makes the answer smaller than the other number' : `the answer should be about ${round1(ka)} × ${round1(kb)}`}.`
    ];
    return {
      type: 'number', sig: (o.sigPrefix || '') + a + '*' + b,
      prompt: o.prompt || `Multiply: <span class="expr">${a} × ${b}</span>`,
      answer: ans, answerText: o.money ? money(prodK) : o.unit ? `${ans} ${o.unit}` : ans, hints,
      why: `${a} × ${b} = <b>${o.money ? money(prodK) : ans}</b>.`,
      solution: pow ? `<ol class="sol-steps"><li>× ${b} moves every digit ${plural(z, 'place')} to the left (the decimal point moves ${plural(z, 'place')} to the right).</li><li>${a} becomes ${ans}.</li></ol>` : mulSolution(ka, kb),
      diagnose(resp, info) {
        const got = info.th;
        if (got === null) return 'Products here have at most three decimal places.';
        if (got === ka + kb) return 'That adds the numbers. This problem asks you to multiply.';
        if (pow && got === Math.round(ka / (kb / 1000))) return `That made the number smaller. Multiplying by ${b} makes it bigger: move the decimal point to the right.`;
        if ([10, 100, 1000].some((m) => got === prodK * m || got * m === prodK)) return pow ? `The digits are right, but the point moved the wrong number of places. ${b} has ${z} zero${z === 1 ? '' : 's'}.` : 'The digits look right, but the decimal point is in the wrong place. Count the decimal places in both numbers and use that many in the answer.';
        return pow ? `Move every digit ${plural(z, 'place')} to the left (the point moves right).` : 'Multiply the digits as whole numbers first, then count the decimal places in both numbers to place the point.';
      }
    };
  }
  T('M1', 'mul.pow10', 'mul', 1, (r) => mul(r.next() < 0.5 ? tenths(r, 0, 9) : hund(r, 0, 9), r.pick([10, 100, 1000]) * 1000, { pow: true }));
  T('M2', 'mul.whole', 'mul', 2, (r) => { const a = tenths(r, 0, 9), n = r.int(2, 9) * 1000; return mul(a, n); });
  T('M3', 'mul.whole', 'mul', 3, (r) => { const a = hund(r, 0, 9), n = r.int(2, 9) * 1000; return mul(a, n); });
  T('M4', 'mul.dec', 'mul', 4, (r) => r.next() < 0.5 ? mul(tenths(r, 0, 0), tenths(r, 0, 0)) : mul(tenths(r, 1, 4), tenths(r, 0, 2)));
  T('M5', 'mul.word', 'mul', 5, (r) => {
    if (r.next() < 0.5) {
      const p = hund(r, 0, 4), n = r.int(3, 9);
      return mul(p, n * 1000, { word: true, money: true, sigPrefix: 'buy:', prompt: `Stickers cost <b>${money(p)}</b> each. How much do <b>${n} stickers</b> cost?` });
    }
    const a = tenths(r, 0, 0), b = tenths(r, 0, 0);
    return mul(a, b, { word: true, unit: 'square meters', sigPrefix: 'area:', prompt: `A tile is <b>${num(a)} m</b> long and <b>${num(b)} m</b> wide. What is its <b>area</b> in square meters?` });
  });
  T('MC1', 'mul.chal', 'mul', 6, (r) => mul(r.int(11, 25) * 1000, r.next() < 0.5 ? tenths(r, 1, 9) : hund(r, 1, 6)));
  T('MC2', 'mul.chal', 'mul', 7, (r) => mul(hund(r, 0, 9), tenths(r, 0, 0)));
  T('MC3', 'mul.chal', 'mul', 8, (r) => r.next() < 0.5 ? mul(tenths(r, 1, 9), tenths(r, 1, 5)) : mul(hund(r, 1, 4), tenths(r, 0, 1)));

  // ───────── Dividing (whole-number divisors, exact answers, as in Lesson 9) ─────────
  /** Worked long-division steps for a ÷ n = q, one place at a time, with the layout drawn. */
  function divSolution(ka, n, kq) {
    const a = num(ka), A = D.parse(a), digits = A.whole.split('').concat(A.frac.split('')), W = A.whole.length;
    const steps = []; let rem = 0, started = false;
    digits.forEach((dg, i) => {
      const place = i < W ? (W - 1 - i === 0 ? 'ones' : ['ones', 'tens', 'hundreds'][W - 1 - i]) : PLACE[i - W + 1];
      const cur = rem * 10 + Number(dg), qd = Math.floor(cur / n), was = rem; rem = cur - qd * n;
      if (i === W && i > 0) steps.push({ k: W - 0.5, t: 'Write the decimal point in the answer straight above the decimal point.' });
      const Place = place[0].toUpperCase() + place.slice(1);
      // A leading zero before the ones place is not written; the ones place gets its 0 so the answer starts "0.".
      const skip = !started && qd === 0 && i < W - 1;
      if (qd || i >= W - 1) started = true;
      steps.push({ k: i, t: `${Place}: ${was ? `the ${was} left over makes ${was * 10} ${place}, and with the ${dg} that is ${cur}` : cur} ÷ ${n} is ${qd}${rem ? ` with ${rem} left over` : ''}. ${skip ? `Leave this place empty and carry the ${rem} to the next place.` : `Write ${qd} above the ${dg}.`}` });
    });
    if (W === digits.length) steps.push('There are no decimal places, so the answer has none either.');
    const q = num(kq);
    steps.push(`Check by multiplying: ${q} × ${n} = ${a}.`);
    return `<div class="solution-work">${M.longDiv(a, n, q, { work: true })}<ol class="sol-steps">${steps.map((s) => (typeof s === 'string' ? `<li>${s}</li>` : `<li data-k="${s.k}">${s.t}</li>`)).join('')}</ol></div>`;
  }
  function div(ka, n, o = {}) {
    if (ka % n) return null;
    const kq = ka / n;
    if (placesOf(kq) > 3 || kq === 0) return null;
    const a = num(ka), q = num(kq), pa = placesOf(ka);
    if (!o.pow && (placesOf(kq) > pa || whole(kq) && !o.allowWhole)) return null; // no zeros need to be written onto the dividend
    const pow = o.pow, z = pow ? String(n).length - 1 : 0;
    const hints = o.hints || (pow ? [
      `Dividing by ${n} makes a number ${n} times smaller: every digit moves ${plural(z, 'place')} to the right.`,
      `Count the zeros in ${n}: ${z}. So the decimal point in ${a} moves ${plural(z, 'place')} to the left.`,
      `Move the point one place at a time, writing zeros in front if you run out of digits. The answer is smaller than ${a}.`
    ] : [
      (o.word ? `This is a division problem: ${a} ÷ ${n}. ` : '') + `Divide as with whole numbers, and put the decimal point in the answer straight above the decimal point in ${a}.`,
      n >= 10 ? `With a two-digit divisor, try multiples of ${n} at each step: ${n} × 2 = ${n * 2}, ${n} × 3 = ${n * 3}, ${n} × 4 = ${n * 4}, and so on, to see how many groups of ${n} fit.`
        : ka < n * 1000 ? `${a} is less than ${n}, so the answer is less than 1: it starts with 0 and a decimal point.` : `Estimate: ${a} ÷ ${n} is about ${Math.max(1, Math.round(ka / 1000 / n))}.`,
      `Start with the ${ka >= 1000 ? 'whole-number part' : 'first digit after the point'}: how many groups of ${n} fit? Bring down one digit at a time, and check by multiplying your answer by ${n}.`
    ]);
    return {
      type: 'number', sig: (o.sigPrefix || '') + a + '/' + n,
      prompt: o.prompt || `Divide: <span class="expr">${a} ÷ ${n}</span>`,
      visual: o.layout ? M.longDiv(a, n, '') : undefined,
      picture: o.layout || pow ? undefined : M.longDiv(a, n, ''),
      answer: q, answerText: o.money ? money(kq) : q, hints,
      why: `${a} ÷ ${n} = <b>${o.money ? money(kq) : q}</b>. Check: ${q} × ${n} = ${a}.`,
      solution: pow ? `<ol class="sol-steps"><li>÷ ${n} moves every digit ${plural(z, 'place')} to the right (the decimal point moves ${plural(z, 'place')} to the left).</li><li>${a} becomes ${q}.</li></ol>` : divSolution(ka, n, kq),
      diagnose(resp, info) {
        const got = info.th;
        if (got === null) return 'Answers here have at most three decimal places.';
        if (got === ka * n) return pow ? `That made the number bigger. Dividing by ${n} makes it smaller: move the decimal point to the left.` : 'That multiplied. This problem asks you to divide (share equally), so the answer is smaller.';
        if (!pow && info.raw && K.droppedZero(info.raw, q)) return 'A zero is missing in your answer. When the number of groups does not fit into a place, write 0 in that place of the answer, then keep dividing.';
        if ([10, 100, 1000].some((m) => got === kq * m || got * m === kq)) return pow ? `The digits are right, but the point moved the wrong number of places. ${n} has ${z} zero${z === 1 ? '' : 's'}.` : 'The digits look right, but the decimal point is in the wrong place. In the answer it goes straight above the decimal point in the number you are dividing.';
        return `Divide one place at a time, keeping the decimal point lined up. Then check: your answer × ${n} should equal ${a}.`;
      }
    };
  }
  T('D1', 'div.pow10', 'div', 1, (r) => {
    const n = r.pick([10, 100, 1000]), x = r.next() < 0.5 ? r.int(1, 999) * 1000 : tenths(r, 0, 99);
    return placesOf(x) + String(n).length - 1 <= 3 ? div(x, n, { pow: true }) : null;
  });
  T('D2', 'div.share', 'div', 2, (r) => {
    const n = r.int(2, 9), g = r.int(1, 9), t = g * n;
    if (t % 10 === 0) return null;
    const ka = t * 100;
    return div(ka, n, { sigPrefix: 'share:', prompt: `Share <b>${num(ka)}</b> equally into <b>${n} groups</b>. How much is in each group? <span class="expr">${num(ka)} ÷ ${n}</span>`,
      hints: [`Think in tenths: ${num(ka)} is ${t} tenths.`, `Share the ${t} tenths into ${n} equal groups. How many tenths go in each group?`, 'Write that many tenths as a decimal, with one digit after the decimal point.'] });
  });
  T('D3', 'div.whole', 'div', 3, (r) => { const n = r.int(2, 9), kq = r.next() < 0.5 ? tenths(r, 1, 9) : hund(r, 1, 9); return div(kq * n, n, { layout: true }); });
  T('D4', 'div.small', 'div', 4, (r) => {
    const n = r.int(2, 9), kq = r.next() < 0.5 ? r.int(1, 9) * 100 : r.int(0, 9) * 100 + r.int(1, 9) * 10;
    return kq * n < n * 1000 ? div(kq * n, n, { layout: true }) : null;
  });
  T('D4F', 'div.fact', 'div', 4, (r) => {
    const n = r.int(2, 9), kq = hund(r, 1, 9), ka = kq * n;
    if (placesOf(ka) !== 2) return null;
    const A = digitsOf(ka), Q = digitsOf(kq), a = num(ka);
    return div(ka, n, { sigPrefix: 'fact:', prompt: `${A} ÷ ${n} = ${Q}. Use this to find <span class="expr">${a} ÷ ${n}</span>.`,
      hints: [`The digits of the answer are the same as in ${Q}. Only the decimal point is different.`, `When you divide by a whole number, the decimal point in the answer goes straight above the decimal point in ${a}.`, `Check with an estimate: ${a} ÷ ${n} is about ${Math.max(1, Math.round(ka / 1000 / n))}.`] });
  });
  T('D5', 'div.word', 'div', 5, (r) => {
    const n = r.int(2, 6), kq = hund(r, 1, 15), ka = kq * n;
    if (placesOf(ka) < placesOf(kq)) return null;
    return div(ka, n, { word: true, money: true, sigPrefix: 'friends:', prompt: `<b>${n} friends</b> share <b>${money(ka)}</b> equally. How much does each friend get?` });
  });
  T('DC1', 'div.chal', 'div', 6, (r) => { const n = r.int(2, 9), kq = r.int(1, 9) * 1000 + r.int(1, 9) * 10; return div(kq * n, n, { layout: true }); }); // a zero in the answer, like 1.04
  T('DC2', 'div.chal', 'div', 7, (r) => { const n = r.int(11, 25), kq = r.next() < 0.5 ? tenths(r, 0, 9) : hund(r, 0, 4); return div(kq * n, n, { layout: true }); });
  T('DC3', 'div.chal', 'div', 8, (r) => {
    const n = r.int(11, 20), kq = hund(r, 1, 12), ka = kq * n;
    return placesOf(ka) >= placesOf(kq) ? div(ka, n, { word: true, money: true, sigPrefix: 'club:', prompt: `A club of <b>${n} students</b> shares a prize of <b>${money(ka)}</b> equally. How much does each student get?` }) : null;
  });

  // ───────── Sessions: which template goes in each position ─────────
  const BY_LEVEL = {}; // op -> level -> [template ids]
  templates.forEach((t) => { const m = META[t.id]; ((BY_LEVEL[m.op] = BY_LEVEL[m.op] || {})[m.level] = BY_LEVEL[m.op][m.level] || []).push(t.id); });
  const LENGTHS = [10, 25, 50];
  /** Level (1-5) for position k of n: questions get harder through the session; 50 questions are five blocks of ten. */
  const levelAt = (k, n) => 1 + Math.floor((k * 5) / n);
  /** Templates for a position: a normal level, or for Challenge, levels 4-5 then challenge tiers 1-3. */
  function choicesFor(op, k, n, challenge) {
    const L = levelAt(k, n);
    if (!challenge) return BY_LEVEL[op][L];
    return BY_LEVEL[op][L + 3]; // levels 4 and 5, then challenge tiers 1, 2 and 3
  }
  /** Balanced operations for Mixed: each operation appears equally often (within one), shuffled within each block. */
  function mixedOps(r, n) {
    const ops = [];
    const order = r.shuffle(['add', 'sub', 'mul', 'div']);
    for (let k = 0; k < n; k++) ops.push(order[k % 4]);
    // Shuffle inside each block of ten so the order is not predictable, keeping the balance.
    for (let b = 0; b < n; b += 10) { const part = r.shuffle(ops.slice(b, b + 10)); part.forEach((x, i) => { ops[b + i] = x; }); }
    return ops;
  }
  /**
   * Build a session: [{ id, seed, sig }] of length n. mode: add|sub|mul|div|mix|challenge|misses. op: for challenge,
   * the operation (or 'mix'). skills: for misses, the skills to target (strongest need first).
   */
  function buildSession({ mode, op, n, skills, seed }) {
    if (!LENGTHS.includes(n)) throw new Error('length must be 10, 25 or 50');
    const r = G.engine.rng(seed);
    const challenge = mode === 'challenge';
    const baseOp = challenge ? op : mode;
    let plan;
    if (mode === 'misses') {
      const targets = skills && skills.length ? skills : null;
      if (!targets) throw new Error('no skills to practice');
      // Spread the positions over the skills (round robin).
      const ids = targets.map((sk) => templates.filter((t) => t.skill === sk).map((t) => t.id)).filter((x) => x.length);
      plan = Array.from({ length: n }, (_, k) => ids[k % ids.length]);
    } else {
      const ops = baseOp === 'mix' ? mixedOps(r, n) : Array(n).fill(baseOp);
      plan = ops.map((o, k) => choicesFor(o, k, n, challenge));
    }
    // A question is a repeat if its numbers match an earlier one, even from another template (4.4 × 1.9 is one problem).
    const key = (sig) => sig.replace(/^[A-Z0-9]+:/, '');
    const used = new Set(), out = [];
    let lastAnswer = null;
    plan.forEach((ids) => {
      let chosen = null;
      // If a small skill runs out of new questions (Practice My Misses on one skill, 50 questions), widen to the other
      // regular levels of the same operation rather than fail.
      const op = META[ids[0]].op, wider = [1, 2, 3, 4, 5].flatMap((L) => BY_LEVEL[op][L]);
      for (let tries = 0; tries < 240 && !chosen; tries++) {
        const pool = tries < 120 ? ids : wider;
        const id = r.pick(pool), sd = r.int(1, 2147483646);
        const q = G.engine.make('pc', id, sd);
        if (used.has(key(q.sig))) continue;
        if (tries < 60 && q.answer === lastAnswer) continue; // no two questions in a row with the same answer
        chosen = { id, seed: sd, sig: q.sig, answer: q.answer };
      }
      if (!chosen) throw new Error('could not build a practice question');
      used.add(key(chosen.sig));
      lastAnswer = chosen.answer;
      out.push({ id: chosen.id, seed: chosen.seed, sig: chosen.sig });
    });
    return out;
  }

  G.engine.register({ lessonId: 'pc', skills: Object.fromEntries(Object.entries(SKILLS).map(([k, v]) => [k, v.name])), templates, plan: {} });
  G.practiceGen = { SKILLS, OPS, META, LENGTHS, levelAt, buildSession, templates };
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
