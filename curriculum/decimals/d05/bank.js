// D05 Rounding Decimals — question bank.
// Round decimals to the nearest tenth and hundredth with place value and number lines (5.NR.4.3),
// including rounding up through 9s, exactly-halfway numbers, and simple measurement problems.
(function (G) {
  'use strict';
  const D = G.D, M = G.models;
  const { f, num, s, list, cap, textChoices } = G.kit;
  const templates = [];
  const T = (id, skill, make) => templates.push({ id, skill, make });

  const UNIT = { tenth: 100, hundredth: 10 };
  const PLACES = { tenth: 1, hundredth: 2 };
  const NEXT = { tenth: 'hundredths', hundredth: 'thousandths' };
  /** Round k thousandths to the nearest unit (100 = tenth, 10 = hundredth); exactly halfway rounds up. */
  const roundK = (k, unit) => Math.floor((k + unit / 2) / unit) * unit;
  const fmt = (k, place) => f(k, PLACES[place]);
  /** The two candidates and the halfway point, written with one more decimal place than the answer. */
  function bracket(k, place) {
    const unit = UNIT[place], lo = Math.floor(k / unit) * unit, hi = lo + unit, p = PLACES[place] + 1;
    return { lo, hi, mid: lo + unit / 2, loS: f(lo, p), hiS: f(hi, p), midS: f(lo + unit / 2, p) };
  }
  const deciding = (x, place) => D.parse(x).frac[PLACES[place]] || '0';

  /** Feedback for a typed rounding answer that names the likely mistake. */
  function roundDiag(x, place, info) {
    const k = D.toThousandths(x), unit = UNIT[place], ans = roundK(k, unit);
    const v = info.value, got = info.th;
    if (got === null) return 'Use at most three decimal places.';
    const b = bracket(k, place), dg = deciding(x, place);
    if (got % unit !== 0) return `Rounding to the nearest ${place} means the answer stops at the ${place}s place: ${s(PLACES[place], 'digit')} after the decimal point.`;
    if (got % 1000 === 0 && ans % 1000 !== 0 && place === 'tenth') return 'That is rounded to a whole number. Round to the nearest tenth instead: keep one digit after the decimal point.';
    if (got === b.lo && ans === b.hi) return `The ${NEXT[place]} digit is ${dg}, which is five or more, so round UP to the bigger ${place}.`;
    if (got === b.hi && ans === b.lo) return `The ${NEXT[place]} digit is ${dg}, which is four or less, so keep the smaller ${place} (round down).`;
    if (/10$/.test(info.raw) && ans % (unit * 10) === 0) return `When a 9 rounds up, it becomes 10 of that place, which is 1 of the next place to the left. Regroup instead of writing 10.`;
    return `${x} is between ${b.loS} and ${b.hiS}. Round to whichever ${place} it is closer to.`;
  }

  function roundQuestion(x, place, extra = {}) {
    const k = D.toThousandths(x), ans = fmt(roundK(k, UNIT[place]), place), b = bracket(k, place);
    return Object.assign({
      type: 'number', places: PLACES[place], sig: x + place,
      prompt: `Round <b>${x}</b> to the nearest <b>${place}</b>.`,
      answer: ans, answerText: ans,
      hints: [
        `Rounding to the nearest ${place} means finding the closest number that stops at the ${place}s place.`,
        `${x} is between ${b.loS} and ${b.hiS}. The halfway point is ${b.midS}.`,
        `Look at the ${NEXT[place]} digit of ${x}. If it is five or more, round up to the bigger one; if it is four or less, keep the smaller one.`
      ],
      why: `The ${NEXT[place]} digit is ${deciding(x, place)}, ${Number(deciding(x, place)) >= 5 ? 'which is five or more, so round up' : 'which is four or less, so round down'}. ${x} rounds to <b>${ans}</b>.`,
      diagnose: (resp, info) => roundDiag(x, place, info)
    }, extra);
  }

  /** A number to round: no 9 in the rounding place (those are the "tricky" questions), and not already exact. */
  function plainNumber(r, place) {
    for (;;) {
      const w = r.int(0, 30);
      const k = place === 'tenth' ? w * 1000 + r.int(0, 8) * 100 + r.int(1, 9) * 10 + (r.next() < 0.3 ? r.int(1, 9) : 0)
        : w * 1000 + r.int(0, 9) * 100 + r.int(0, 8) * 10 + r.int(1, 9);
      const x = num(k);
      if (deciding(x, place) !== '5' || r.next() < 0.3) return x;
    }
  }

  // ───────────────────────── Skill: nearest tenth (rTenth) ─────────────────────────

  T('T1', 'rTenth', (r, p) => roundQuestion(p.x || plainNumber(r, 'tenth'), 'tenth'));

  T('T2', 'rTenth', (r, p) => {
    let k = p.k;
    if (!k) for (;;) { k = r.int(0, 9) * 1000 + r.int(0, 8) * 100 + r.int(1, 9) * 10; if (k % 100 !== 50) break; }
    const x = num(k), b = bracket(k, 'tenth');
    return roundQuestion(x, 'tenth', {
      sig: 'line' + x,
      prompt: `Point A shows <b>${x}</b>. Use the number line to round it to the nearest <b>tenth</b>.`,
      visual: M.line({ from: b.lo, to: b.hi, point: k, mid: true, labels: [f(b.lo, 1), f(b.hi, 1)] }),
      hints: [
        'Rounding to the nearest tenth means finding the closer of the two tenths at the ends of the line.',
        `The orange mark is halfway, at ${b.midS}. Is point A before or past the halfway mark?`,
        'If A is past halfway (or exactly on it), round up to the right end. If A is before halfway, round down to the left end.'
      ]
    });
  });

  // ───────────────────────── Skill: nearest hundredth (rHund) ─────────────────────────

  T('H1', 'rHund', (r, p) => roundQuestion(p.x || plainNumber(r, 'hundredth'), 'hundredth'));

  T('H2', 'rHund', (r, p) => {
    let k = p.k;
    if (!k) for (;;) { k = r.int(0, 9) * 1000 + r.int(0, 9) * 100 + r.int(0, 8) * 10 + r.int(1, 9); if (k % 10 !== 5) break; }
    const x = num(k), b = bracket(k, 'hundredth');
    return roundQuestion(x, 'hundredth', {
      sig: 'line' + x,
      prompt: `Point A shows <b>${x}</b>. Use the number line to round it to the nearest <b>hundredth</b>.`,
      visual: M.line({ from: b.lo, to: b.hi, point: k, mid: true, labels: [f(b.lo, 2), f(b.hi, 2)] }),
      hints: [
        'The ends of this line are two hundredths next to each other. Each small jump is one thousandth.',
        `The orange mark is halfway, at ${b.midS}. Is point A before or past it?`,
        'Past halfway (or exactly on it) rounds up to the right end; before halfway rounds down to the left end.'
      ]
    });
  });

  // ───────────────────────── Skill: the rounding rule (rRule) ─────────────────────────

  T('R1', 'rRule', (r, p) => {
    const place = p.place || r.pick(['tenth', 'hundredth']);
    const ds = r.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4);
    const x = p.x || `${ds[0]}.${ds[1]}${ds[2]}${ds[3]}`;
    const ans = deciding(x, place);
    const others = [...new Set(x.replace('.', '').split(''))].filter((d) => d !== ans);
    return {
      type: 'mc', sig: x + place,
      prompt: `To round <b>${x}</b> to the nearest <b>${place}</b>, which digit tells you whether to round up or down?`,
      choices: textChoices(r, ans, others.slice(0, 3)), answer: ans, answerText: ans,
      hints: [
        'The digit that decides is never the digit in the rounding place itself. It is the next digit to the right.',
        `First find the ${place}s place in ${x}.`,
        `Now move one place to the right of the ${place}s place. That digit decides.`
      ],
      why: `The ${place}s digit is ${D.parse(x).frac[PLACES[place] - 1]}; the digit just to its right, in the ${NEXT[place]} place, is <b>${ans}</b>. It decides whether to round up (5–9) or down (0–4).`,
      diagnose(resp) {
        if (resp === D.parse(x).frac[PLACES[place] - 1]) return `That digit is in the ${place}s place, the place you are rounding to. The deciding digit is the one just to its right.`;
        return `Find the ${place}s place first, then look one place to the right of it.`;
      }
    };
  });

  T('R2', 'rRule', (r, p) => {
    let x = p.x;
    if (!x) {
      // Traps: a big tenths digit with a small hundredths digit, or the other way around.
      const w = r.int(1, 9);
      const up = r.next() < 0.5;
      const t = up ? r.int(1, 4) : r.int(5, 8);
      const h = up ? r.int(5, 9) : r.int(0, 4);
      x = `${w}.${t}${h}`;
    }
    const h = Number(deciding(x, 'tenth'));
    const yes = h >= 5;
    const right = yes ? 'Round up, because the hundredths digit is five or more.' : 'Round down, because the hundredths digit is four or less.';
    const wrongs = yes ? ['Round down, because the hundredths digit is four or less.', 'Round down, because the tenths digit is four or less.', 'Round up, because the tenths digit is five or more.']
      : ['Round up, because the hundredths digit is five or more.', 'Round up, because the tenths digit is five or more.', 'Round down, because the tenths digit is four or less.'];
    return {
      type: 'mc', sig: x,
      prompt: `You are rounding <b>${x}</b> to the nearest <b>tenth</b>. Should you round up or down, and why?`,
      choices: textChoices(r, right, wrongs), answer: right, answerText: right,
      hints: [
        'When you round to the nearest tenth, the digit to the RIGHT of the tenths place decides.',
        `The hundredths digit of ${x} is the second digit after the decimal point.`,
        'Use the rule: a digit of five or more means round up; four or less means round down. Check that the reason uses the right digit.'
      ],
      why: `The hundredths digit is ${h}, so <b>${yes ? 'round up' : 'round down'}</b>: ${x} rounds to ${f(roundK(D.toThousandths(x), 100), 1)}.`,
      diagnose(resp) {
        if (/tenths digit/.test(resp)) return 'The tenths digit is the place you are rounding to; it does not decide. Look at the digit to its right.';
        return `Check the hundredths digit of ${x} again and use the rule: five or more rounds up, four or less rounds down.`;
      }
    };
  });

  // ───────────────────────── Skill: tricky cases (rTricky) ─────────────────────────

  T('K1', 'rTricky', (r, p) => {
    const place = p.place || r.pick(['tenth', 'tenth', 'hundredth']);
    let x = p.x;
    if (!x) {
      const w = r.int(0, 20);
      x = place === 'tenth' ? `${w}.9${r.int(5, 9)}` : `${w}.${r.int(0, 8)}9${r.int(5, 9)}`;
      if (place === 'hundredth' && r.next() < 0.35) x = `${w}.99${r.int(5, 9)}`;
    }
    const ans = fmt(roundK(D.toThousandths(x), UNIT[place]), place);
    return roundQuestion(x, place, {
      sig: 'K' + x + place,
      hints: [
        `Look at the ${NEXT[place]} digit to decide whether to round up or down.`,
        `Is that digit five or more? If so, the ${place}s digit goes up by one. Here the ${place}s digit is a 9.`,
        `Nine plus one makes ten. Ten ${place}s make one of the next place to the left, so regroup: write 0 in the ${place}s place and add one to the place on its left. If that place is also a 9, keep regrouping the same way.`
      ],
      why: `The ${NEXT[place]} digit is ${deciding(x, place)}, so round up. The 9 ${place}s become 10 ${place}s, which regroups into the next place: <b>${ans}</b>. Keep the zero${PLACES[place] > 1 ? 's' : ''} to show the number was rounded to the nearest ${place}.`
    });
  });

  T('K2', 'rTricky', (r, p) => {
    const w = p.w !== undefined ? p.w : r.int(1, 9);
    const h = p.h || r.int(5, 9);
    const x = `${w}.9${h}`;
    const ans = `${w + 1}.0`;
    const wrongs = [`${w}.10`, `${w}.9`, `${w + 1}.1`];
    return {
      type: 'mc', sig: x,
      prompt: `What is <b>${x}</b> rounded to the nearest <b>tenth</b>?`,
      choices: textChoices(r, ans, wrongs), answer: ans, answerText: ans,
      hints: [
        'Find the two tenths that the number is between.',
        `Which two tenths is ${x} between? Picture them on a number line and decide which one is closer.`,
        `The hundredths digit is ${h}, so round up. Think: what do nine tenths and one more tenth make?`
      ],
      why: `The hundredths digit is ${h}, so round up. 9 tenths becomes 10 tenths = 1 whole, so ${x} rounds to <b>${ans}</b>.`,
      diagnose(resp) {
        if (resp === `${w}.10`) return `${w}.10 is less than ${x}. 9 tenths + 1 tenth is 10 tenths, which is 1 whole: regroup into the ones place.`;
        if (resp === `${w}.9`) return `The hundredths digit is ${h}, which is five or more, so round up, not down.`;
        if (resp === `${w + 1}.1`) return 'You regrouped the 10 tenths into 1 whole, which is right. Now count how many tenths are left over.';
        return `That is too small. ${x} is very close to ${w + 1}.`;
      }
    };
  });

  T('K3', 'rTricky', (r, p) => {
    const place = p.place || r.pick(['tenth', 'hundredth']);
    let x = p.x;
    if (!x) {
      const w = r.int(0, 20);
      x = place === 'tenth' ? `${w}.${r.int(0, 8)}5` : `${w}.${r.int(0, 9)}${r.int(0, 8)}5`;
    }
    return roundQuestion(x, place, {
      sig: 'half' + x + place,
      hints: [
        `Find the two ${place}s that ${x} is between.`,
        `${x} is exactly halfway between two ${place}s. The digit to check is a 5.`,
        'The rule says five or more rounds up, so a number exactly halfway rounds UP.'
      ]
    });
  });

  // ───────────────────────── Skill: using rounding (rApply) ─────────────────────────

  T('A1', 'rApply', (r, p) => {
    const w = p.w !== undefined ? p.w : r.int(1, 9);
    const t = p.t !== undefined ? p.t : r.int(1, 8);
    const target = `${w}.${t}`;
    const T0 = w * 1000 + t * 100;
    // One choice rounds to the target; the others are just outside (including the halfway trap).
    const inside = num(T0 + r.pick([-40, -30, -20, -10, 10, 20, 30, 40]));
    const outs = [num(T0 + 50), num(T0 - 60), num(T0 + 100 + r.int(1, 4) * 10), num(T0 - 51)].filter((x) => roundK(D.toThousandths(x), 100) !== T0);
    const wrongs = r.shuffle([...new Set(outs)]).slice(0, 3);
    return {
      type: 'mc', sig: target + inside,
      prompt: `Which number rounds to <b>${target}</b> when you round to the nearest tenth?`,
      choices: textChoices(r, inside, wrongs), answer: inside, answerText: inside,
      hints: [
        `A number rounds to ${target} if ${target} is the closest tenth to it.`,
        `The numbers that round to ${target} go from ${num(T0 - 50)} up to (but not including) ${num(T0 + 50)}.`,
        'Round each choice to the nearest tenth and see which one gives ' + target + '.'
      ],
      why: `<b>${inside}</b> rounds to ${target}: it is between ${num(T0 - 50)} and ${num(T0 + 50)}.`,
      diagnose(resp) { return `${resp} rounds to ${f(roundK(D.toThousandths(resp), 100), 1)}, not ${target}.`; }
    };
  });

  const STORIES = [
    { t: (x) => `A pencil is ${x} cm long. How long is it to the nearest tenth of a centimeter?`, place: 'tenth', unit: 'cm', make: (r) => num(r.int(8, 19) * 1000 + r.int(0, 8) * 100 + r.int(1, 9) * 10) },
    { t: (x) => `A bag of apples weighs ${x} kg. What is its weight to the nearest tenth of a kilogram?`, place: 'tenth', unit: 'kg', make: (r) => num(r.int(1, 5) * 1000 + r.int(0, 8) * 100 + r.int(1, 9) * 10 + r.int(0, 9)) },
    { t: (x) => `A bag of flour weighs ${x} kg on a kitchen scale. What is its weight to the nearest hundredth of a kilogram?`, place: 'hundredth', unit: 'kg', make: (r) => num(r.int(1, 4) * 1000 + r.int(0, 9) * 100 + r.int(0, 8) * 10 + r.int(1, 9)) },
    { t: (x) => `A bottle holds ${x} liters of water. How much is that to the nearest hundredth of a liter?`, place: 'hundredth', unit: 'L', make: (r) => num(r.int(1, 2) * 1000 + r.int(0, 9) * 100 + r.int(0, 8) * 10 + r.int(1, 9)) }
  ];

  T('A2', 'rApply', (r, p) => {
    const st = STORIES[p.story !== undefined ? p.story : r.int(0, STORIES.length - 1)];
    const x = p.x || st.make(r);
    const q = roundQuestion(x, st.place);
    return Object.assign(q, { sig: 'story' + x + st.unit, prompt: st.t(x), answerText: `${q.answer} ${st.unit}` });
  });

  T('A3', 'rApply', (r, p) => {
    let x = p.x;
    if (!x) x = plainNumber(r, 'tenth');
    const k = D.toThousandths(x), right = f(roundK(k, 100), 1);
    const b = bracket(k, 'tenth');
    const otherRound = roundK(k, 100) === b.hi ? f(b.lo, 1) : f(b.hi, 1);
    const claimRight = p.claim !== undefined ? p.claim === 'right' : r.next() < 0.5;
    const said = claimRight ? right : otherRound;
    const name = p.name || r.pick(['Ava', 'Leo', 'Sam', 'Zoe', 'Eli']);
    const h = deciding(x, 'tenth');
    const ans = claimRight ? `Yes. The hundredths digit is ${h}, so ${x} rounds to ${right}.` : `No. The hundredths digit is ${h}, so ${x} rounds to ${right}.`;
    const wrongs = claimRight
      ? [`No. The tenths digit decides, so ${x} rounds to ${otherRound}.`, `No. ${otherRound} is closer to ${x}.`, `Yes, because ${said} has fewer digits.`]
      : [`Yes. The tenths digit decides, so ${x} rounds to ${said}.`, `Yes, because ${said} is closer to ${x}.`, `No. ${x} cannot be rounded to the nearest tenth.`];
    return {
      type: 'mc', sig: x + (claimRight ? 'r' : 'w'),
      prompt: `${name} rounded <b>${x}</b> to the nearest tenth and got <b>${said}</b>. Is ${name} right?`,
      choices: textChoices(r, ans, [...new Set(wrongs)].filter((t) => t !== ans).slice(0, 3)), answer: ans, answerText: ans,
      hints: [
        'Round the number yourself first, then compare with the answer given.',
        `To round to the nearest tenth, look at the hundredths digit of ${x}.`,
        'five or more rounds up; four or less rounds down. Then pick the choice with the right answer AND the right reason.'
      ],
      why: `The hundredths digit of ${x} is ${h}, so it rounds to ${right}. ${claimRight ? `${name} is right.` : `${name} is not right.`}`,
      diagnose(resp) {
        if (/tenths digit decides/.test(resp)) return 'The tenths digit is the place you round to. The digit to its right (hundredths) decides.';
        return `Round ${x} yourself using the hundredths digit, then check both the answer and the reason.`;
      }
    };
  });

  const remind = {
    rTenth: `<p><b>Remember:</b> to round to the nearest tenth, find the two tenths the number is between and see which one it is closer to. Halfway or past halfway rounds up.</p>${M.line({ from: 3400, to: 3500, point: 3470, mid: true, labels: ['3.4', '3.5'] })}`,
    rHund: '<p><b>Remember:</b> to round to the nearest hundredth, look at the thousandths digit: five or more rounds up, four or less rounds down. Example: 5.286 → 5.29.</p>',
    rRule: '<p><b>Remember:</b> the digit just to the RIGHT of the rounding place decides. 5, 6, 7, 8, 9 → round up. 0, 1, 2, 3, 4 → round down.</p>',
    rTricky: '<p><b>Remember:</b> rounding up a 9 makes 10, so regroup: 2.96 → 3.0. A number exactly halfway rounds up: 3.45 → 3.5.</p>',
    rApply: '<p><b>Remember:</b> the numbers that round to 4.3 (nearest tenth) go from 4.25 up to, but not including, 4.35.</p>'
  };

  G.engine.register({
    lessonId: 'd05',
    skills: {
      rTenth: 'Rounding to the nearest tenth',
      rHund: 'Rounding to the nearest hundredth',
      rRule: 'Which digit decides (the rounding rule)',
      rTricky: 'Tricky cases: 9s and exactly halfway',
      rApply: 'Using rounding'
    },
    plan: { rTenth: 2, rHund: 2, rRule: 2, rTricky: 2, rApply: 2 },
    practiceOnly: [],
    templates, remind,
    helpers: { roundK }
  });
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
