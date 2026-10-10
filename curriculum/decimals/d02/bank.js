// D02 Decimal Place Value — question bank.
// Place vs value, relationships between places (×10, 1/10), standard / expanded / word form, and placeholder zeros.
// Numbers go up to tens and thousandths (5.NR.4.1, 5.NR.1.1). Answers are exact decimal strings.
(function (G) {
  'use strict';
  const D = G.D, M = G.models, W = G.words;
  const { f, num, ORD, PL, PLACES, s, list, cap, textChoices, placeCheck, droppedZero, ZERO_TIP, digits5, expanded, distinctDigits, words } = G.kit;
  const BY = Object.fromEntries(PLACES.map((p) => [p.key, p]));
  const KEYS = PLACES.map((p) => p.key);
  const templates = [];
  const T = (id, skill, make) => templates.push({ id, skill, make });

  /** Number with distinct nonzero digits (1–2 whole digits, 3 decimals); sometimes one inside zero. */
  function pvNum(r, p, opts = {}) {
    if (p.num) return p.num;
    const wd = opts.whole !== undefined ? opts.whole : r.pick([1, 1, 2]);
    let n = distinctDigits(r, wd, opts.places || 3);
    if (opts.zero && r.next() < opts.zero) {
      const [w, fr] = n.split('.');
      const a = fr.split(''); a[r.int(0, a.length - 2)] = '0';
      n = w + '.' + a.join('');
    }
    return n;
  }
  const placeOf = (n, d) => { const dg = digits5(n); return KEYS.find((k) => dg[k] === String(d)); };
  const valueOf = (d, key) => num(Number(d) * BY[key].unit);
  const wordsOf = (key, d) => s(Number(d), BY[key].one);
  const CHART_HINT = M.chart(null, { tens: true });
  const placeWhere = (key) => key === 'tens' ? 'two places to the left of the decimal point' : key === 'ones' ? 'just to the left of the decimal point'
    : `the ${ORD[KEYS.indexOf(key) - 1]} place to the right of the decimal point`;
  /** Where a digit sits: 'in the second place to the right of the decimal point'. */
  const placeAt = (key) => KEYS.indexOf(key) < 2 ? placeWhere(key) : 'in ' + placeWhere(key);

  // ───────────────────────── Skill: places (place2) ─────────────────────────

  T('N1', 'place2', (r, p) => {
    const n = pvNum(r, p);
    const ds = (n.replace('.', '').split('')).filter((x) => x !== '0');
    const d = p.d || r.pick(ds);
    const ans = placeOf(n, d);
    return {
      type: 'mc', sig: n + d,
      prompt: `In <b>${n}</b>, what is the <b>place</b> of the digit <b>${d}</b>?`,
      choices: KEYS.map((k) => ({ value: k, text: k })), answer: ans, answerText: ans,
      hints: [
        'Find the decimal point first. Places to its left are wholes (ones, tens). Places to its right are parts of a whole (tenths, hundredths, thousandths).',
        'The digit just left of the decimal point is in the ones place. The digit just right of it is in the tenths place.',
        `Count from the decimal point to the ${d}. Going right: tenths, hundredths, thousandths. Going left: ones, then tens.` + CHART_HINT
      ],
      why: `The ${d} is ${placeAt(ans)}, so it is in the <b>${ans}</b> place.`,
      diagnose(resp) {
        const mirror = { tenths: 'thousandths', thousandths: 'tenths' };
        if (mirror[ans] === resp) return 'It looks like you counted from the right end of the number. Start at the decimal point and count to the right: tenths, hundredths, thousandths.';
        if ((ans === 'ones' && resp === 'tenths') || (ans === 'tenths' && resp === 'ones')) return 'Check which side of the decimal point the digit is on. Left of the point is ones; right of the point is tenths.';
        const there = digits5(n)[resp];
        return there ? `In ${n}, the digit in the ${resp} place is ${there}. Find the ${d} and count its place from the decimal point.` : `${n} has no digit in the ${resp} place. Find the ${d} and count its place from the decimal point.`;
      }
    };
  });

  T('N2', 'place2', (r, p) => {
    const n = pvNum(r, p);
    const dg = digits5(n);
    const options = KEYS.filter((k) => dg[k] && dg[k] !== '0');
    const key = p.place || r.pick(options.filter((k) => k !== 'ones' || dg.tens));
    const ans = dg[key];
    return {
      type: 'mc', sig: n + key,
      prompt: `Which digit is in the <b>${key}</b> place in <b>${n}</b>?`,
      choices: textChoices(r, ans, options.map((k) => dg[k]).filter((x) => x !== ans)), answer: ans, answerText: ans,
      hints: [
        'Use the decimal point as your starting place. Every place is named by where it is compared with the point.',
        `The ${key} place is ${placeWhere(key)}.`,
        `Start at the decimal point and move one digit at a time until you reach the ${key} place.` + CHART_HINT
      ],
      why: `In ${n}, the digit ${placeAt(key)} is <b>${ans}</b>, so ${ans} is in the ${key} place.`,
      diagnose(resp) { return `${resp} is in the ${placeOf(n, resp)} place. The ${key} place is ${placeWhere(key)}.`; }
    };
  });

  T('N3', 'place2', (r, p) => {
    const d = p.d || r.int(1, 9);
    const target = p.place || r.pick(['ones', 'tenths', 'hundredths', 'thousandths']);
    const others = r.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => x !== d));
    // Four numbers 0–9 ones and 3 decimals, each with the digit d in a different place.
    const build = (key) => {
      const pos = { ones: 0, tenths: 1, hundredths: 2, thousandths: 3 }[key];
      const ds = others.slice(0, 3); ds.splice(pos, 0, d);
      return ds[0] + '.' + ds.slice(1).join('');
    };
    const keys = ['ones', 'tenths', 'hundredths', 'thousandths'];
    const nums = keys.map(build);
    const ans = build(target);
    return {
      type: 'mc', sig: d + target + others.slice(0, 3).join(''),
      prompt: `In which number is the <b>${d}</b> in the <b>${target}</b> place?`,
      choices: textChoices(r, ans, nums.filter((x) => x !== ans)), answer: ans, answerText: ans,
      hints: [
        `For each number, find where the ${d} is compared with the decimal point.`,
        `The ${target} place is ${placeWhere(target)}.`,
        `Check each choice: start at the decimal point and count to the ${d}. Pick the one where the ${d} lands in the ${target} place.`
      ],
      why: `In <b>${ans}</b>, the ${d} is ${placeAt(target)}, the ${target} place.`,
      diagnose(resp) { return `In ${resp}, the ${d} is in the ${placeOf(resp, d)} place. Look for the number where it is ${placeAt(target)}.`; }
    };
  });

  // ───────────────────────── Skill: value of a digit (value) ─────────────────────────

  function valueChoices(d, key) {
    const i = KEYS.indexOf(key);
    const near = [i - 1, i + 1, i + 2, i - 2].filter((j) => j >= 0 && j < KEYS.length).slice(0, 3);
    return { ans: valueOf(d, key), wrongs: near.map((j) => valueOf(d, KEYS[j])) };
  }

  T('V1', 'value', (r, p) => {
    const n = pvNum(r, p, { zero: 0.3 });
    const ds = n.replace('.', '').split('').filter((x) => x !== '0');
    const d = p.d || r.pick(ds);
    const key = placeOf(n, d);
    const { ans, wrongs } = valueChoices(d, key);
    // A worked example in Hint 3 that never matches this question's digit or place.
    const exKey = key === 'hundredths' ? 'thousandths' : 'hundredths', exD = d === '8' ? '3' : '8';
    return {
      type: 'mc', sig: n + d,
      prompt: `What is the <b>value</b> of the digit <b>${d}</b> in <b>${n}</b>?`,
      choices: textChoices(r, ans, wrongs), answer: ans, answerText: `${ans} (${wordsOf(key, d)})`,
      hints: [
        'A digit\'s value depends on its place. First find the place of the digit.',
        `The ${d} is ${placeAt(key)}. Name that place.`,
        `The value is ${d} of that place. For example, ${exD} in the ${exKey} place is worth ${wordsOf(exKey, exD)} = ${valueOf(exD, exKey)}. Write the ${d} in its place with zeros in front if needed.`
      ],
      why: `The ${d} is in the ${key} place, so its value is ${wordsOf(key, d)} = <b>${ans}</b>.`,
      diagnose(resp) {
        const k = KEYS.find((x) => valueOf(d, x) === resp);
        return `${resp} would be the value if the ${d} were in the ${k} place. In ${n} the ${d} is ${placeAt(key)}.`;
      }
    };
  });

  T('V2', 'value', (r, p) => {
    const n = pvNum(r, p, { zero: 0.3 });
    const ds = n.split('.')[1].split('').filter((x) => x !== '0');
    const d = p.d || r.pick(ds);
    const key = placeOf(n, d);
    const ans = valueOf(d, key);
    return {
      type: 'number', sig: n + d,
      prompt: `Write the <b>value</b> of the digit <b>${d}</b> in <b>${n}</b> as a decimal.`,
      answer: ans, answerText: `${ans} (${wordsOf(key, d)})`,
      hints: [
        'The value of a digit is how much it is worth because of its place, not just the digit itself.',
        `The ${d} is ${placeAt(key)}. That is the ${key} place.`,
        `Write ${wordsOf(key, d)} as a decimal: put the ${d} in the ${key} place and fill the places before it with zeros.`
      ],
      why: `The ${d} is in the ${key} place, so it is worth ${wordsOf(key, d)} = <b>${ans}</b>.`,
      diagnose(resp, info) {
        if (info.th === Number(d) * 1000) return `${d} is the digit itself. Its value depends on its place: it is after the decimal point, so it is worth less than 1.`;
        const k = KEYS.find((x) => Number(d) * BY[x].unit === info.th);
        if (k) return `${resp} would be the value if the ${d} were in the ${k} place. Count again from the decimal point.`;
        return `The value should have just the digit ${d} in its place and zeros before it. Find the place of the ${d} first.`;
      }
    };
  });

  T('V3', 'value', (r, p) => {
    const n = pvNum(r, p);
    const ds = n.split('.')[1].split('');
    const d = p.d || r.pick(ds);
    const key = placeOf(n, d);
    const i = KEYS.indexOf(key);
    const other = KEYS[i === 4 ? 3 : i + 1];
    const ans = `${key} place, value ${valueOf(d, key)}`;
    const wrongs = [`${key} place, value ${d}`, `${other} place, value ${valueOf(d, other)}`, `${key} place, value ${valueOf(d, KEYS[i === 2 ? 3 : i - 1])}`];
    return {
      type: 'mc', sig: n + d,
      prompt: `In <b>${n}</b>, what are the <b>place</b> and the <b>value</b> of the digit <b>${d}</b>?`,
      choices: textChoices(r, ans, wrongs), answer: ans, answerText: ans,
      hints: [
        'Place and value are different. The place is WHERE the digit is. The value is HOW MUCH it is worth there.',
        `Find the place first: the ${d} is ${placeAt(key)}.`,
        `Now the value: ${d} in that place is worth ${d} of that place, written with zeros in front of the ${d}.`
      ],
      why: `The ${d} is in the ${key} place, and its value is ${wordsOf(key, d)} = <b>${valueOf(d, key)}</b>.`,
      diagnose(resp) {
        if (resp.endsWith(`value ${d}`)) return `The place is right, but ${d} is just the digit. Its value in the ${key} place is less than 1.`;
        if (resp.startsWith(other)) return `Check the place again. Count from the decimal point to the ${d}.`;
        return `The place is right, but the value does not match it. A digit in the ${key} place is worth that many ${key}.`;
      }
    };
  });

  T('V4', 'value', (r, p) => {
    const dir = p.dir || r.pick(['greatest', 'least']);
    let ds;
    for (;;) {
      ds = r.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3);
      // The trap: the biggest (or smallest) digit is not the one with the biggest (or smallest) value.
      if (dir === 'greatest' && Math.max(...ds) !== ds[0]) break;
      if (dir === 'least' && Math.min(...ds) !== ds[2]) break;
    }
    if (p.ds) ds = p.ds;
    const n = '0.' + ds.join('');
    const ans = String(dir === 'greatest' ? ds[0] : ds[2]);
    return {
      type: 'mc', sig: n + dir,
      prompt: `Which digit has the <b>${dir} value</b> in <b>${n}</b>?`,
      choices: textChoices(r, ans, ds.map(String).filter((x) => x !== ans)), answer: ans, answerText: ans,
      hints: [
        'A digit\'s value depends on its place, not only on how big the digit is.',
        `Find each digit's value: the first digit after the point is tenths, the next is hundredths, the last is thousandths.`,
        `Compare the values: tenths are worth more than hundredths, and hundredths are worth more than thousandths.`
      ],
      why: `In ${n}: ${ds[0]} is worth ${valueOf(ds[0], 'tenths')}, ${ds[1]} is worth ${valueOf(ds[1], 'hundredths')}, ${ds[2]} is worth ${valueOf(ds[2], 'thousandths')}. The ${dir} value is <b>${ans}</b>.`,
      diagnose(resp) {
        const k = placeOf(n, resp);
        return `${resp} is in the ${k} place, so its value is ${valueOf(resp, k)}. Compare the values, not just the digits.`;
      }
    };
  });

  // ───────────────────────── Skill: relationships between places (relate) ─────────────────────────

  const DEC = ['ones', 'tenths', 'hundredths', 'thousandths'];

  T('R1', 'relate', (r, p) => {
    const d = p.d || r.int(2, 9);
    let ia = p.pa ? DEC.indexOf(p.pa) : r.int(0, 2);
    let ib = p.pb ? DEC.indexOf(p.pb) : Math.min(3, ia + r.pick([1, 1, 2]));
    if (ib === ia) ib = ia + 1;
    const A = valueOf(d, DEC[ia]), B = valueOf(d, DEC[ib]);
    const ans = String(Math.pow(10, ib - ia));
    return {
      type: 'number', sig: `${d}${ia}${ib}`,
      prompt: `The ${d} in <b>${A}</b> is how many times the value of the ${d} in <b>${B}</b>?`,
      answer: ans, answerText: ans,
      hints: [
        'A digit is worth more when it is farther to the left. Think about how many of one place make one of the place to its left.',
        `The ${d} in ${A} is in the ${DEC[ia]} place. The ${d} in ${B} is in the ${DEC[ib]} place.`,
        'Use what you know: how many hundredths make one tenth? If the digits are two places apart, use that fact twice (multiply).'
      ],
      why: `${DEC[ia]} are ${ib - ia === 1 ? '10' : '100'} times ${DEC[ib]}: ${A} = ${ans} × ${B}. The answer is <b>${ans}</b>.`,
      diagnose(resp, info) {
        const v = info.th / 1000;
        if (info.th === 100 || info.th === 10) return `That is a fraction less than 1. The ${d} in ${A} is worth MORE, because it is farther left. How many times more?`;
        if (v === 10 && ans === '100') return `They are two places apart, not one. Each place is 10 times the next, so two places is 10 × 10.`;
        if (v === 100 && ans === '10') return 'They are only one place apart, so use the fact for one place just once, not twice.';
        return 'Count the places between the two digits, and remember how many of one place make one of the place to its left.';
      }
    };
  });

  T('R2', 'relate', (r, p) => {
    const d = p.d || r.int(1, 9);
    const kind = p.kind || r.pick(['times', 'tenth']);
    let base, ans, wrongs;
    if (kind === 'times') {
      const ib = p.ib !== undefined ? p.ib : r.int(2, 3); // hundredths or thousandths
      base = valueOf(d, DEC[ib]); ans = valueOf(d, DEC[ib - 1]);
      wrongs = [ib < 3 ? valueOf(d, DEC[ib + 1]) : valueOf(d, DEC[ib - 2]), valueOf(d, DEC[ib - 2 >= 0 && ib < 3 ? ib - 2 : 0]), base];
    } else {
      const ib = p.ib !== undefined ? p.ib : r.int(0, 2); // ones, tenths or hundredths
      base = valueOf(d, DEC[ib]); ans = valueOf(d, DEC[ib + 1]);
      wrongs = [ib > 0 ? valueOf(d, DEC[ib - 1]) : num(d * 10000), ib + 2 <= 3 ? valueOf(d, DEC[ib + 2]) : valueOf(d, 'ones'), base];
    }
    wrongs = [...new Set(wrongs)].filter((x) => x !== ans);
    if (wrongs.length < 3) wrongs.push(num(D.toThousandths(ans) * 100));
    const phrase = kind === 'times' ? '10 times as much as' : '1/10 of';
    return {
      type: 'mc', sig: d + kind + base,
      prompt: `Which number is <b>${phrase}</b> ${base}?`,
      choices: textChoices(r, ans, wrongs.slice(0, 3)), answer: ans, answerText: ans,
      hints: [
        kind === 'times' ? 'Multiplying by 10 moves every digit one place to the LEFT, so each digit is worth 10 times as much.'
          : 'Taking 1/10 of a number moves every digit one place to the RIGHT, so each digit is worth 1/10 as much.',
        `In ${base}, the ${d} is in the ${placeOf(base, d)} place.`,
        `Move the ${d} one place ${kind === 'times' ? 'left' : 'right'} and name the new value.`
      ],
      why: `${kind === 'times' ? `10 × ${base}` : `1/10 of ${base}`} = <b>${ans}</b>: the ${d} moves one place ${kind === 'times' ? 'left' : 'right'}.`,
      diagnose(resp) {
        if (resp === base) return 'That is the same number. The digit has to move to a different place.';
        const k = D.toThousandths(resp), b = D.toThousandths(base);
        if ((kind === 'times' && k < b) || (kind === 'tenth' && k > b)) return `That moved the ${d} the wrong way. ${kind === 'times' ? '10 times as much is BIGGER, so the digit moves left.' : '1/10 of a number is SMALLER, so the digit moves right.'}`;
        return `That moved the ${d} two places. ${cap(phrase)} moves it only one place.`;
      }
    };
  });

  T('R3', 'relate', (r, p) => {
    const dir = p.dir || r.pick(['left', 'right']);
    const d = p.d || r.int(1, 9);
    const i = dir === 'left' ? r.int(1, 3) : r.int(0, 2);
    const from = DEC[i], to = DEC[dir === 'left' ? i - 1 : i + 1];
    const ans = dir === 'left' ? 'It becomes 10 times as much.' : 'It becomes 1/10 as much.';
    const wrongs = [dir === 'left' ? 'It becomes 1/10 as much.' : 'It becomes 10 times as much.', 'It stays the same, because the digit is the same.', dir === 'left' ? 'It becomes 100 times as much.' : 'It becomes 1/100 as much.'];
    return {
      type: 'mc', sig: dir + d + i,
      prompt: `A digit <b>${d}</b> moves one place to the <b>${dir}</b>, from the ${from} place to the ${to} place. What happens to its value?`,
      choices: textChoices(r, ans, wrongs), answer: ans, answerText: ans,
      hints: [
        'Remember the place-value pattern: 10 of one place make 1 of the place to its left.',
        `Find the value before and after: ${s(d, from.slice(0, -1))} is ${valueOf(d, from)}, and ${s(d, to.slice(0, -1))} is ${valueOf(d, to)}.`,
        'Compare the two values. Is the new value bigger or smaller, and by how much?'
      ],
      why: `${valueOf(d, from)} becomes ${valueOf(d, to)}. Moving one place ${dir} makes a digit worth ${dir === 'left' ? '10 times as much' : '1/10 as much'}.`,
      diagnose(resp) {
        if (/same/.test(resp)) return 'The digit is the same, but its place changed, and a digit\'s value depends on its place.';
        if (/100/.test(resp)) return 'Moving ONE place changes the value by 10 times (or 1/10), not 100.';
        return `Check the direction. Places to the left are worth more; places to the right are worth less.`;
      }
    };
  });

  // ───────────────────────── Skill: standard, expanded and word form (forms) ─────────────────────────

  T('F1', 'forms', (r, p) => {
    const n = pvNum(r, p, { whole: p.num ? undefined : r.pick([1, 1, 2]), zero: 0.5 });
    const ans = expanded(n);
    const dg = digits5(n);
    const whole = [dg.tens ? dg.tens + '0' : '', dg.ones].filter((x) => x && x !== '0').join(' + ');
    const fr = ['tenths', 'hundredths', 'thousandths'].map((k) => dg[k]);
    const asWholes = [whole, ...fr.filter((x) => x !== '0')].join(' + ');
    const allTenths = [whole, ...fr.filter((x) => x !== '0').map((x) => '0.' + x)].join(' + ');
    let third;
    if (fr.slice(0, 2).includes('0')) {
      third = expanded(D.canonical(n.split('.')[0] + '.' + fr.join('').replace(/0(?=.*[1-9])/, ''))); // the zero dropped
    } else {
      third = [whole, '0.' + fr[0], '0.0' + fr[1], '0.0' + fr[2]].join(' + ');
    }
    return {
      type: 'mc', sig: n,
      prompt: `Which shows <b>${n}</b> in <b>expanded form</b>?`,
      choices: textChoices(r, ans, [asWholes, allTenths, third]), answer: ans, answerText: ans,
      hints: [
        'Expanded form writes a number as the sum of the values of its digits.',
        `Start with the whole part. Then the first digit after the point is tenths, so it is written 0.${fr[0]}.`,
        'Write the value of each nonzero digit (hundredths look like 0.0_, thousandths look like 0.00_) and skip the zeros. Which choice matches?'
      ],
      why: `Each part is the value of one digit: ${n} = <b>${ans}</b>.`,
      diagnose(resp) {
        if (resp === asWholes) return 'Those parts use the digits as if they were whole numbers. The digits after the point are worth less than 1.';
        if (resp === allTenths) return 'That treats every decimal digit as tenths. Only the first digit after the point is in the tenths place.';
        return 'One part has a digit in the wrong place. Check each part against the place-value chart, and remember that a zero holds a place.';
      }
    };
  });

  T('F2', 'forms', (r, p) => {
    const n = pvNum(r, p, { zero: 0.6 });
    const parts = expanded(n).split(' + ');
    const mixed = p.order === 'mixed' || (p.order === undefined && r.next() < 0.5);
    const shown = mixed ? (() => { const sh = r.shuffle(parts); if (sh.join() === parts.join()) sh.reverse(); return sh; })() : parts;
    return {
      type: 'number', sig: n + (mixed ? 'm' : ''),
      prompt: `Write this number in <b>standard form</b>: <span class="expr">${shown.join(' + ')}</span>`,
      answer: n, answerText: n,
      hints: [
        'Standard form is the usual way to write a number with digits. Each part tells you one digit and its place.',
        mixed ? 'The parts are not in order. Sort them by place, starting with the biggest place.' : 'Start with the whole part, then the decimal point.',
        'Put each digit in its place: tenths, hundredths, thousandths. Write 0 in any place between that has no part.'
      ],
      why: `Putting each digit in its place gives <b>${n}</b>.`,
      diagnose(resp) {
        if (droppedZero(resp, n)) return ZERO_TIP;
        return placeCheck(resp, n);
      }
    };
  });

  T('F3', 'forms', (r, p) => {
    const n = pvNum(r, p, { whole: p.num ? undefined : r.pick([1, 1, 2]), zero: 0.4 });
    const ans = expanded(n);
    return {
      type: 'expanded', sig: n,
      prompt: `Write <b>${n}</b> in <b>expanded form</b>.`,
      answer: n, answerText: ans,
      hints: [
        'Expanded form adds up the value of each digit, like 3 + 0.4 + 0.05.',
        'Start with the whole part. Then write the value of the first digit after the point (tenths).',
        'Keep going: hundredths look like 0.0_, thousandths look like 0.00_. Skip any zero digits, and put + between the parts.'
      ],
      why: `${n} = <b>${ans}</b>: one part for each nonzero digit.`,
      diagnose(resp, info) {
        if (info.parts) {
          const asWholes = digits5(n);
          const wholeDigits = [asWholes.tens ? asWholes.tens + '0' : '', asWholes.ones, asWholes.tenths, asWholes.hundredths, asWholes.thousandths].filter((x) => x && x !== '0').map(Number);
          if (info.sum === wholeDigits.reduce((a, b) => a + b, 0) * 1000) return 'Those parts use the digits as whole numbers. Digits after the point are worth less than 1: tenths, hundredths, thousandths.';
        }
        return 'Check the value of each part. Each digit should keep its place: tenths (0._), hundredths (0.0_), thousandths (0.00_).';
      }
    };
  });

  T('F4', 'forms', (r, p) => {
    const pl = p.places || r.int(2, 3);
    let k = p.k;
    while (!k) { const c = r.int(1, PL[pl].n - 1); if (c % 10) k = c; }
    const w = p.w !== undefined ? p.w : r.int(1, 99);
    const n = f(w * 1000 + k * (1000 / PL[pl].n), pl);
    const name = words(n);
    return {
      type: 'number', sig: n,
      prompt: `Write in standard form: <b>${name}</b>`,
      answer: n, answerText: n,
      hints: [
        'In word form, the word "and" stands for the decimal point.',
        `The words before "and" are the whole number: ${w}. The last word, "${W.placeName(pl, k)}", tells you the place of the LAST digit.`,
        `After the decimal point, write ${W.intWords(k)} so that its last digit is in the ${PL[pl].many} place. Use zeros as placeholders if you need them.`
      ],
      why: `"${name}": ${w} before the point, and ${W.intWords(k)} ${W.placeName(pl, k)} after it: <b>${n}</b>.`,
      diagnose(resp, info) {
        const v = info.value;
        if (v.whole !== String(w)) return 'Check the whole-number part. The words before "and" give the number to the left of the decimal point.';
        if (v.places !== pl && v.places <= 3) return `The last word, "${W.placeName(pl, k)}", tells you how many digits go after the decimal point.`;
        if (droppedZero(resp, n)) return ZERO_TIP;
        return placeCheck(resp, n);
      }
    };
  });

  T('F5', 'forms', (r, p) => {
    const w = p.w || r.int(2, 30);
    const pl = p.places || r.int(2, 3);
    let k = p.k;
    while (!k) { const c = r.int(1, PL[pl].n - 1); if (c % 10) k = c; }
    const n = f(w * 1000 + k * (1000 / PL[pl].n), pl);
    const correct = words(n);
    const pool = [1, 2, 3].filter((x) => x !== pl).map((x) => `${W.intWords(w)} and ${W.intWords(k)} ${W.placeName(x, k)}`);
    pool.push(`${W.intWords(w)} ${W.intWords(k)} ${W.placeName(pl, k)}`);
    return {
      type: 'mc', sig: n,
      prompt: `Which is the <b>word form</b> of <b>${n}</b>?`,
      choices: textChoices(r, correct, pool), answer: correct, answerText: correct,
      hints: [
        'Read the whole number, say "and" for the decimal point, then read the decimal part.',
        `The decimal part is ${n.split('.')[1]}, read as the number ${W.intWords(k)}.`,
        'Finish with the place of the LAST digit. Count how many digits are after the point.'
      ],
      why: `${W.intWords(w)}, "and" for the point, then ${W.intWords(k)} ${W.placeName(pl, k)}: <b>${correct}</b>.`,
      diagnose(resp) {
        if (!/ and /.test(resp)) return 'The decimal point must be read as "and". Without it, the number sounds like one big whole number.';
        return `Count the digits after the decimal point in ${n}. The place of the last digit is the last word of the name.`;
      }
    };
  });

  T('F6', 'forms', (r, p) => {
    let pick = p.pick;
    if (!pick) {
      const ds = KEYS.map(() => r.int(0, 9));
      ds[r.int(2, 3)] = 0; // a missing place, so a placeholder zero is needed
      ds[4] = r.int(1, 9);
      if (!ds[0] && !ds[1]) ds[1] = r.int(1, 9);
      pick = ds;
    }
    const n = num(pick.reduce((a, d, i) => a + d * PLACES[i].unit, 0));
    const terms = pick.map((d, i) => ({ d, k: KEYS[i] })).filter((x) => x.d);
    const mixed = r.next() < 0.4;
    const shown = mixed ? r.shuffle(terms) : terms;
    return {
      type: 'number', sig: pick.join('') + (mixed ? 'm' : ''),
      prompt: `Write the number that has <b>${list(shown.map((x) => `${x.d} ${x.d === 1 ? BY[x.k].one : BY[x.k].name}`))}</b>.`,
      answer: n, answerText: n,
      hints: [
        'Picture a place-value chart: tens, ones, decimal point, tenths, hundredths, thousandths.',
        mixed ? 'The parts are not listed in order. Put each digit in its own place.' : 'Put each digit in its own place, starting with the biggest place.',
        'Any place that is not mentioned gets a 0, so the other digits stay in their places.'
      ],
      why: `Placing each digit in its place (with 0 in empty places) gives <b>${n}</b>.`,
      diagnose(resp) {
        if (droppedZero(resp, n)) return ZERO_TIP;
        return placeCheck(resp, n);
      }
    };
  });

  // ───────────────────────── Skill: placeholder zeros (zeros) ─────────────────────────

  T('Z1', 'zeros', (r, p) => {
    const d = p.d || r.int(1, 9);
    let w = p.w !== undefined ? p.w : r.int(1, 9);
    if (w === d) w = d === 9 ? 1 : d + 1; // keep the digit easy to find
    const target = p.place || r.pick(['tenths', 'hundredths', 'thousandths']);
    const at = { tenths: `${w}.${d}`, hundredths: `${w}.0${d}`, thousandths: `${w}.00${d}` };
    const ans = at[target];
    const wrongs = Object.keys(at).filter((k) => k !== target).map((k) => at[k]).concat([`${w}${d}`]);
    return {
      type: 'mc', sig: `${w}${d}${target}`,
      prompt: `Which number has a <b>${d}</b> in the <b>${target}</b> place?`,
      choices: textChoices(r, ans, wrongs), answer: ans, answerText: ans,
      hints: [
        'Zeros between the decimal point and a digit push that digit into a smaller place.',
        `The ${target} place is ${placeWhere(target)}.`,
        `For each choice, count from the decimal point to the ${d}, counting the zeros too.`
      ],
      why: `In <b>${ans}</b>, the ${d} is ${placeAt(target)}${target === 'tenths' ? '' : ', because the zero' + (target === 'thousandths' ? 's hold' : ' holds') + ' the place' + (target === 'thousandths' ? 's' : '') + ' before it'}.`,
      diagnose(resp) {
        if (!resp.includes('.')) return `${resp} is a whole number, so the ${d} is in the ones place.`;
        return `In ${resp}, the ${d} is in the ${placeOf(resp, d)} place. Count the zeros as places too.`;
      }
    };
  });

  T('Z2', 'zeros', (r, p) => {
    const w = p.w || r.int(1, 9);
    const b = p.b || r.int(1, 9);
    const zeroAt = p.zeroAt || r.pick(['tenths', 'hundredths']);
    const n = zeroAt === 'tenths' ? `${w}.0${b}` : `${w}.${r.int(1, 9)}0${b}`;
    const digitPlace = zeroAt === 'tenths' ? 'hundredths' : 'thousandths';
    const without = n.replace(/\.(\d*)0(\d)$/, '.$1$2');
    const ans = `It holds the ${zeroAt} place, so the ${b} stays in the ${digitPlace} place.`;
    const wrongs = ['It makes the number 10 times greater.', `It does nothing, so ${n} is the same as ${without}.`, `It means the ${b} is worth 0.`];
    return {
      type: 'mc', sig: n,
      prompt: `What does the <b>0</b> do in <b>${n}</b>?`,
      choices: textChoices(r, ans, wrongs), answer: ans, answerText: ans,
      hints: [
        'A zero has a value of zero, but it still takes up a place.',
        `Find the place of the 0, then the place of the ${b}.`,
        `Imagine taking the zero out: where would the ${b} move? Is that the same number?`
      ],
      why: `The 0 is in the ${zeroAt} place. Without it, the ${b} would slide left into the ${zeroAt} place and the number would change (${without} is not ${n}).`,
      diagnose(resp) {
        if (/same as/.test(resp)) return `Without the zero, the ${b} moves one place to the left and is worth 10 times as much. ${without} and ${n} are different numbers.`;
        if (/10 times/.test(resp)) return 'This zero is between the decimal point and a digit. It does not multiply the number; it keeps the digits in their places.';
        return `The zero itself is worth nothing, but the ${b} still has a value. The zero just keeps it in its place.`;
      }
    };
  });

  T('Z3', 'zeros', (r, p) => {
    const w = p.w || r.int(1, 9);
    const a = p.a || r.int(1, 9);
    const two = p.two !== undefined ? p.two : r.next() < 0.5;
    let b = p.b || r.int(1, 9);
    if (b === a) b = a === 9 ? 1 : a + 1;
    const x = two ? `${w}.${a}${b}` : `${w}.${a}`;
    const ans = x + '0';
    const wrongs = two ? [`${w}.${a}0${b}`, `${w}.0${a}${b}`, `${w}.${b}${a}`] : [`${w}.0${a}`, `${w}.00${a}`, `${w}${a}`];
    return {
      type: 'mc', sig: x,
      prompt: `Which number is <b>equal</b> to <b>${x}</b>?`,
      choices: textChoices(r, ans, wrongs), answer: ans, answerText: ans,
      hints: [
        'Equal numbers have every digit in the same place.',
        'A zero at the END of a decimal does not move any digit.',
        'A zero between the decimal point and a digit DOES move that digit. Check each choice with a place-value chart.'
      ],
      why: `${ans} has the same digits in the same places as ${x}, plus a zero at the end, so they are equal.`,
      diagnose(resp) {
        if (!resp.includes('.')) return `${resp} has no decimal point, so it is a whole number much bigger than ${x}.`;
        return `In ${resp}, at least one digit is in a different place than in ${x}. Compare them place by place.`;
      }
    };
  });

  T('Z4', 'zeros', (r, p) => {
    let n = p.num;
    if (!n) {
      const t = r.int(1, 9), o = r.int(0, 9);
      const fr = [r.int(1, 9), r.int(1, 9), r.int(1, 9)];
      fr[r.int(0, 1)] = 0;
      if (r.next() < 0.3) fr[2] = 0;
      if (!fr[0] && !fr[1] && !fr[2]) fr[1] = r.int(1, 9);
      n = D.canonical(`${t}${o}.${fr.join('')}`);
    }
    return {
      type: 'number', sig: n,
      prompt: 'Write the number shown in the place-value chart in standard form.',
      visual: M.chart(digits5(n), { tens: true }), answer: n, answerText: n,
      hints: [
        'Read the chart from left to right: tens, ones, decimal point, tenths, hundredths, thousandths.',
        'Write the tens and ones digits, then the decimal point.',
        'Write every digit after the point in order, including zeros that come before other digits.'
      ],
      why: `Reading the chart left to right gives <b>${n}</b>.` + (digits5(n).thousandths === '0' ? ' (A zero at the very end can be left off.)' : ''),
      diagnose(resp) {
        if (droppedZero(resp, n)) return ZERO_TIP;
        return placeCheck(resp, n);
      }
    };
  });

  const remind = {
    place2: `<p><b>Remember:</b> places are counted from the decimal point. Left: ones, tens. Right: tenths, hundredths, thousandths.</p>${CHART_HINT}`,
    value: '<p><b>Remember:</b> the <b>place</b> is where a digit is; the <b>value</b> is what it is worth there. In 4.735 the 7 is in the tenths place and its value is 0.7.</p>',
    relate: '<p><b>Remember:</b> each place is worth 10 times the place to its right. Moving a digit one place left makes it worth 10 times as much; one place right makes it worth 1/10 as much.</p>',
    forms: '<p><b>Remember:</b> standard form 4.735 · expanded form 4 + 0.7 + 0.03 + 0.005 · word form "four and seven hundred thirty-five thousandths". The word "and" is the decimal point.</p>',
    zeros: '<p><b>Remember:</b> a zero between the point and a digit holds a place (3.04 is not 3.4). A zero at the end changes nothing (3.40 = 3.4).</p>'
  };

  G.engine.register({
    lessonId: 'd02',
    skills: {
      place2: 'Naming the place of a digit',
      value: 'Finding the value of a digit',
      relate: 'How places relate (×10 and 1/10)',
      forms: 'Standard, expanded and word form',
      zeros: 'Placeholder zeros and equal decimals'
    },
    plan: { place2: 2, value: 2, relate: 2, forms: 3, zeros: 1 },
    practiceOnly: [],
    templates, remind
  });
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
