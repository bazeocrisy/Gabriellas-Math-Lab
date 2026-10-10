// D04 Ordering Decimals — question bank.
// Order sets of decimals (to thousandths) least to greatest and greatest to least by lining up places and writing
// zeros at the end (5.NR.4.2), on number lines, and in short word problems. Answers are exact decimal strings.
(function (G) {
  'use strict';
  const D = G.D, M = G.models;
  const { f, num, s, list, cap, textChoices } = G.kit;
  const templates = [];
  const T = (id, skill, make) => templates.push({ id, skill, make });

  const asc = (xs) => xs.slice().sort((a, b) => D.cmp(a, b));
  const desc = (xs) => asc(xs).reverse();
  const short = (k) => num(k);

  /**
   * n different decimals that look tricky to order: mixed numbers of digits around the same tenths
   * (like 0.7, 0.67, 0.705). wholes: how many different whole numbers may appear (1 = all the same).
   */
  function trapSet(r, n, wholes = 1) {
    for (let tries = 0; tries < 200; tries++) {
      const w = r.int(0, 9);
      const t = r.int(2, 8);
      const pool = [
        t * 100, // 0.7
        t * 100 + r.int(1, 9) * 10, // 0.74
        t * 100 + r.int(1, 9), // 0.705
        t * 100 + r.int(1, 9) * 10 + r.int(1, 9), // 0.746
        (t - 1) * 100 + r.int(1, 9) * 10 + r.int(1, 9), // 0.6xy (looks big, is small)
        (t + 1) * 100, // 0.8
        (t - 1) * 100 + 90 + r.int(1, 9) // 0.69x
      ];
      const picked = [...new Set(r.shuffle(pool))].slice(0, n);
      if (picked.length < n) continue;
      let ks = picked.map((k) => w * 1000 + k);
      if (wholes > 1) ks = ks.map((k, i) => (i % 2 ? k + 1000 : k));
      const xs = ks.map(short);
      if (new Set(xs).size < n) continue;
      if (n > 2 && (xs.join() === asc(xs).join() || xs.join() === desc(xs).join())) continue;
      return xs;
    }
    throw new Error('trapSet');
  }
  const fracNum = (x) => Number(D.parse(x).frac || '0');
  const byLength = (xs) => xs.slice().sort((a, b) => D.parse(a).places - D.parse(b).places || D.cmp(a, b));
  const asWhole = (xs) => xs.slice().sort((a, b) => Number(D.parse(a).whole) - Number(D.parse(b).whole) || fracNum(a) - fracNum(b));

  /** Feedback for a wrong order that names the likely mistake without giving the order. */
  function orderDiag(resp, ans, dirText) {
    const r = resp.join(), a = ans.join();
    if (r === ans.slice().reverse().join()) return `Those are in the opposite order. This question asks for ${dirText}.`;
    const lenAsc = byLength(ans).join(), lenDesc = byLength(ans).reverse().join();
    if ((r === lenAsc || r === lenDesc) && r !== a) return 'It looks like the numbers were ordered by how many digits they have. More digits does not mean greater. Line up the decimal points and compare place by place.';
    const wAsc = asWhole(ans).join(), wDesc = asWhole(ans).reverse().join();
    if ((r === wAsc || r === wDesc) && r !== a) return 'It looks like the digits after the point were compared as whole numbers. Write zeros so every number has the same number of places, then compare.';
    const k = resp.findIndex((x, i) => x !== ans[i]);
    if (k === 0) return `Check which number should come first. Compare all of them place by place, starting with the tenths.`;
    return `${k === 1 ? 'The first number is' : `The first ${k} numbers are`} right. Check position ${k + 1}: compare the numbers that are left, place by place.`;
  }

  function orderQuestion(r, xs, dir, extra = {}) {
    // Never hand out a list that is already in order (either direction).
    if (xs.join() === asc(xs).join() || xs.join() === desc(xs).join()) xs = xs.slice(1).concat(xs[0]);
    const ans = dir === 'up' ? asc(xs) : desc(xs);
    const dirText = dir === 'up' ? 'from least to greatest' : 'from greatest to least';
    return Object.assign({
      type: 'order', sig: xs.slice().sort().join('|') + dir,
      prompt: `Put these decimals in order <b>${dirText}</b>.`,
      items: xs, answer: ans, orderText: dirText,
      slotLabels: xs.map((_, i) => (i === 0 ? (dir === 'up' ? 'least' : 'greatest') : i === xs.length - 1 ? (dir === 'up' ? 'greatest' : 'least') : '')),
      answerText: ans.join(', '),
      hints: [
        'Line up the decimal points. Write zeros at the end so every number has the same number of decimal places.',
        'Here they are lined up:' + M.stack(xs),
        `Compare the biggest place first (the whole numbers, then the tenths). Find the ${dir === 'up' ? 'least' : 'greatest'} number, then compare the rest place by place.`
      ],
      why: `Lined up with three places: ${xs.map((x) => (D.parse(x).places < 3 ? `${x} = ${f(D.toThousandths(x), 3)}` : x)).join(', ')}. In order ${dirText}: <b>${ans.join(', ')}</b>.`,
      diagnose: (resp) => orderDiag(resp, ans, dirText)
    }, extra);
  }

  // ───────────────────────── Skill: least to greatest (ordLG) ─────────────────────────

  T('O1', 'ordLG', (r, p) => orderQuestion(r, p.xs || trapSet(r, 3), 'up'));
  T('O2', 'ordLG', (r, p) => orderQuestion(r, p.xs || trapSet(r, 4, 2), 'up'));

  T('O5', 'ordLG', (r, p) => {
    const xs = p.xs || r.shuffle(trapSet(r, 3));
    const mid = asc(xs)[1];
    return {
      type: 'mc', sig: xs.slice().sort().join('|'),
      prompt: `If you put ${list(xs)} in order from least to greatest, which number is in the <b>middle</b>?`,
      choices: textChoices(r, mid, xs.filter((x) => x !== mid)), answer: mid, answerText: mid,
      hints: [
        'Line up the decimal points and write zeros so all three have three decimal places.',
        `Written with three places: ${xs.map((x) => f(D.toThousandths(x), 3)).join(', ')}.`,
        'Find the least and the greatest. The number left over is in the middle.'
      ],
      why: `In order: ${asc(xs).join(', ')}. The middle number is <b>${mid}</b>.`,
      diagnose(resp) {
        return resp === asc(xs)[0] ? `${resp} is the least of the three, not the middle.` : `${resp} is the greatest of the three, not the middle.`;
      }
    };
  });

  // ───────────────────────── Skill: greatest to least (ordGL) ─────────────────────────

  T('O3', 'ordGL', (r, p) => orderQuestion(r, p.xs || trapSet(r, 3), 'down'));

  T('O4', 'ordGL', (r, p) => {
    const xs = p.xs || trapSet(r, 4);
    const right = desc(xs);
    const cands = [asc(xs), byLength(xs).reverse(), asWhole(xs).reverse(), byLength(xs)].map((l) => l.join(', '));
    const wrongs = [...new Set(cands)].filter((l) => l !== right.join(', ')).slice(0, 3);
    while (wrongs.length < 3) { const sh = r.shuffle(xs).join(', '); if (sh !== right.join(', ') && !wrongs.includes(sh)) wrongs.push(sh); }
    return {
      type: 'mc', sig: xs.slice().sort().join('|'),
      prompt: 'Which list is in order from <b>greatest to least</b>?',
      choices: textChoices(r, right.join(', '), wrongs), answer: right.join(', '), answerText: right.join(', '),
      hints: [
        'Greatest to least means the biggest number comes first.',
        'Line up the decimal points and write zeros so every number has three decimal places:' + M.stack(xs),
        'Find the greatest number first by comparing the tenths. Then check that each list goes down at every step.'
      ],
      why: `With three places each: ${right.map((x) => f(D.toThousandths(x), 3)).join(' > ')}. So the order is <b>${right.join(', ')}</b>.`,
      diagnose(resp) {
        if (resp === asc(xs).join(', ')) return 'That list goes from least to greatest. This question asks for greatest to least.';
        if (resp === byLength(xs).reverse().join(', ') || resp === byLength(xs).join(', ')) return 'That list is ordered by the number of digits, not by value. More digits does not mean greater.';
        return 'Check each step of that list: line up two neighbors and compare place by place. Is every number greater than the one after it?';
      }
    };
  });

  // ───────────────────────── Skill: lining up places and zeros (align) ─────────────────────────

  T('A1', 'align', (r, p) => {
    const xs = p.xs || trapSet(r, 4);
    const dir = p.dir || r.pick(['least', 'greatest']);
    const ans = dir === 'least' ? asc(xs)[0] : desc(xs)[0];
    return {
      type: 'mc', sig: xs.slice().sort().join('|') + dir,
      prompt: `Which number is the <b>${dir}</b>?`,
      choices: textChoices(r, ans, xs.filter((x) => x !== ans)), answer: ans, answerText: ans,
      hints: [
        'Write zeros at the end so all the numbers have three decimal places. Then they are easy to compare.',
        (() => { const ex = xs.find((x) => x !== ans && D.parse(x).places < 3) || xs.find((x) => x !== ans); return `For example, ${ex} written with three places is ${f(D.toThousandths(ex), 3)}. Do the same with every number.`; })(),
        `Compare the tenths first. If some tenths tie, compare those numbers' hundredths, then thousandths. Find the ${dir}.`
      ],
      why: `With three places each, ${f(D.toThousandths(ans), 3)} is the ${dir}, so the answer is <b>${ans}</b>.`,
      diagnose(resp) {
        const longest = xs.slice().sort((a, b) => D.parse(b).places - D.parse(a).places)[0];
        if (dir === 'greatest' && resp === longest) return `${resp} has the most digits, but that does not make it greatest. Compare the tenths first.`;
        return `Write ${resp} with three places (${f(D.toThousandths(resp), 3)}) and compare it with the others, starting at the tenths.`;
      }
    };
  });

  T('A2', 'align', (r, p) => {
    let xs = p.xs;
    while (!xs) { const c = trapSet(r, 2); if (D.parse(c[0]).places !== D.parse(c[1]).places) xs = c; } // different lengths
    const x = D.parse(xs[0]).places < D.parse(xs[1]).places ? xs[0] : xs[1];
    const other = x === xs[0] ? xs[1] : xs[0];
    const places = D.parse(other).places;
    const ans = f(D.toThousandths(x), places);
    return {
      type: 'number', places, sig: x + '|' + other,
      prompt: `To compare <b>${x}</b> with <b>${other}</b>, write ${x} with <b>${places}</b> decimal places.`,
      answer: ans, answerText: ans,
      hints: [
        'Writing zeros at the END of a decimal does not change its value.',
        `${x} has ${s(D.parse(x).places, 'decimal place')}. You need ${places}.`,
        'Add zeros at the end until there are enough digits after the decimal point. Do not put a zero between the point and a digit.'
      ],
      why: `${x} = <b>${ans}</b>. Now it has as many places as ${other}, so the two are easy to compare.`,
      diagnose(resp, info) {
        const v = info.value;
        if (!D.equal(v, x)) return `${resp} is not equal to ${x}. A zero between the decimal point and a digit moves the digit. Put the zeros at the end.`;
        return null;
      }
    };
  });

  T('A3', 'align', (r, p) => {
    let lo = p.lo, hi = p.hi;
    if (!lo) {
      const w = r.int(0, 5), t = r.int(1, 8);
      lo = `${w}.${t}`; hi = `${w}.${t}${r.int(5, 9)}`;
      if (r.next() < 0.5) { const h = r.int(1, 7); lo = `${w}.${t}${h}`; hi = `${w}.${t}${h + 2}`; }
    }
    const L = D.toThousandths(lo), H = D.toThousandths(hi);
    // A number strictly between: a whole number of hundredths when there is room, otherwise thousandths.
    const between = num(H - L >= 20 ? L + 10 * Math.floor((H - L) / 20) : L + Math.floor((H - L) / 2));
    const pool = [H + 10, H + 100, L - 10, L - 100].filter((k) => k > 0).map(num);
    const wrongs = [...new Set(pool)].filter((x) => x !== between).slice(0, 3);
    return {
      type: 'mc', sig: lo + '|' + hi,
      prompt: `Which number is <b>between</b> ${lo} and ${hi}?`,
      choices: textChoices(r, between, wrongs), answer: between, answerText: between,
      hints: [
        'A number between them must be greater than the first number and less than the second.',
        `Write both with three decimal places: ${f(L, 3)} and ${f(H, 3)}.`,
        'Write each choice with three decimal places too, and check that it is bigger than the first and smaller than the second.'
      ],
      why: `${lo} = ${f(L, 3)} and ${hi} = ${f(H, 3)}. <b>${between}</b> = ${f(D.toThousandths(between), 3)} is between them.`,
      diagnose(resp) {
        const k = D.toThousandths(resp);
        return k <= L ? `${resp} is less than ${lo}, so it is not between them.` : `${resp} is greater than ${hi}, so it is not between them.`;
      }
    };
  });

  // ───────────────────────── Skill: number lines (ordLine) ─────────────────────────

  T('NL1', 'ordLine', (r, p) => {
    const xs = p.xs || r.shuffle(trapSet(r, 3).map((x) => '0.' + D.parse(x).frac));
    const side = p.side || r.pick(['left', 'right']);
    const ans = side === 'left' ? asc(xs)[0] : desc(xs)[0];
    return {
      type: 'mc', sig: xs.slice().sort().join('|') + side,
      prompt: `Imagine placing ${list(xs)} on this number line from 0 to 1. Which one would be farthest to the <b>${side}</b>?`,
      visual: M.line({ from: 0, to: 1000, labels: ['0', '1'], tickLabels: true }),
      choices: textChoices(r, ans, xs.filter((x) => x !== ans)), answer: ans, answerText: ans,
      hints: [
        'On a number line, numbers go from least on the left to greatest on the right.',
        `So the number farthest to the ${side} is the ${side === 'left' ? 'least' : 'greatest'} one.`,
        'Compare the numbers place by place, starting with the tenths, to find it.'
      ],
      why: `In order: ${asc(xs).join(', ')}. The ${side === 'left' ? 'least' : 'greatest'}, <b>${ans}</b>, is farthest to the ${side}.`,
      diagnose(resp) { return `${resp} is not the ${side === 'left' ? 'least' : 'greatest'} of the three. Farther ${side} means ${side === 'left' ? 'less' : 'greater'}; compare the tenths first.`; }
    };
  });

  T('NL2', 'ordLine', (r, p) => {
    let ks = p.ks;
    if (!ks) for (;;) { ks = r.shuffle([...Array(19).keys()].map((i) => (i + 1) * 50)).slice(0, 3); const sorted = ks.slice().sort((a, b) => a - b); if (sorted[1] - sorted[0] >= 100 && sorted[2] - sorted[1] >= 100) break; }
    const labels = ['A', 'B', 'C'];
    const order = ks.map((k, i) => ({ k, label: labels[i] })).sort((a, b) => a.k - b.k);
    // Points are labelled A, B, C from left to right; the values are listed in a mixed order.
    const pts = order.map((o, i) => ({ label: labels[i], v: o.k }));
    const target = p.t !== undefined ? p.t : r.int(0, 2);
    const val = num(pts[target].v);
    const shown = r.shuffle(pts.map((x) => num(x.v)));
    return {
      type: 'mc', sig: ks.slice().sort((a, b) => a - b).join('|') + target,
      prompt: `Points A, B and C show the numbers ${list(shown)} (not in that order). Which point shows <b>${val}</b>?`,
      visual: M.line({ from: 0, to: 1000, labels: ['0', '1'], tickLabels: true, points: pts }),
      choices: labels.map((t) => ({ value: t, text: 'Point ' + t })), answer: labels[target], answerText: 'Point ' + labels[target],
      hints: [
        'Points farther to the right show greater numbers.',
        `Put the three numbers in order from least to greatest. The least goes with the point farthest left.`,
        `Find where ${val} is in your order (first, second or third), and match it to the points from left to right.`
      ],
      why: `In order: ${pts.map((x) => num(x.v)).join(', ')}, which match A, B, C from left to right. So ${val} is at <b>Point ${labels[target]}</b>.`,
      diagnose(resp) { return `Point ${resp} shows ${num(pts[labels.indexOf(resp)].v)}. Order the three numbers first, then match them to the points from left to right.`; }
    };
  });

  // ───────────────────────── Skill: word problems (ordWord) ─────────────────────────

  const STORIES = [
    { what: 'race times (in seconds)', unit: 's', ask: 'fastest', pick: 'least', names: ['Ana', 'Ben', 'Cami', 'Dev'], scale: [9, 14] },
    { what: 'long jumps (in meters)', unit: 'm', ask: 'longest jump', measure: 'length', pick: 'greatest', names: ['Eli', 'Fay', 'Gus', 'Hana'], scale: [2, 4] },
    { what: 'package weights (in kilograms)', unit: 'kg', ask: 'lightest package', pick: 'least', names: ['Box A', 'Box B', 'Box C', 'Box D'], scale: [1, 6] },
    { what: 'plant heights (in meters)', unit: 'm', ask: 'tallest plant', measure: 'height', pick: 'greatest', names: ['Plant 1', 'Plant 2', 'Plant 3', 'Plant 4'], scale: [0, 1] }
  ];
  function storySet(r, p, n) {
    const st = STORIES[p.story !== undefined ? p.story : r.int(0, STORIES.length - 1)];
    const w = r.int(st.scale[0], st.scale[1]);
    const xs = trapSet(r, n).map((x) => `${w}.${D.parse(x).frac || '0'}`);
    return { st, xs: xs.map((x) => D.canonical(x)) };
  }

  T('W1', 'ordWord', (r, p) => {
    const { st, xs } = storySet(r, p, 4);
    const names = st.names;
    const ans = st.pick === 'least' ? asc(xs)[0] : desc(xs)[0];
    const who = names[xs.indexOf(ans)];
    const table = `<table class="place-table"><thead><tr><th scope="col">Name</th><th scope="col">${cap(st.what.split(' (')[0])} (${st.unit})</th></tr></thead><tbody>${xs.map((x, i) => `<tr><td>${names[i]}</td><td>${x}</td></tr>`).join('')}</tbody></table>`;
    return {
      type: 'mc', sig: st.unit + xs.join('|'),
      prompt: `Here are four ${st.what}. Which one is the <b>${st.ask}</b>?`,
      visual: table,
      choices: names.map((nm) => ({ value: nm, text: nm })), answer: who, answerText: `${who} (${ans} ${st.unit})`,
      hints: [
        st.ask === 'fastest' ? 'The fastest runner takes the LEAST time.' : `The ${st.ask} has the ${st.pick} number.`,
        'Line up the decimal points and write zeros so all the numbers have three decimal places.',
        `Compare the numbers place by place to find the ${st.pick} one.`
      ],
      why: `In order from least to greatest: ${asc(xs).join(', ')}. The ${st.pick} is ${ans}, so the answer is <b>${who}</b>.`,
      diagnose(resp) {
        const v = xs[names.indexOf(resp)];
        if (st.ask === 'fastest' && v === desc(xs)[0]) return 'That runner took the MOST time, so they were the slowest. The fastest runner has the least time.';
        return `${resp} has ${v} ${st.unit}. Is that the ${st.pick}? Compare all four place by place.`;
      }
    };
  });

  T('W2', 'ordWord', (r, p) => {
    const { st, xs } = storySet(r, Object.assign({ story: p.story !== undefined ? p.story : r.pick([1, 3]) }, p), 3);
    const q = orderQuestion(r, xs, 'up');
    const numAns = q.answer.slice();
    const ans = numAns.map((x) => `${x} ${st.unit}`);
    const noun = st.unit === 'm' && st.what.startsWith('plant') ? ['shortest', 'tallest'] : ['shortest', 'longest'];
    return Object.assign(q, {
      sig: 'W' + st.unit + xs.slice().sort().join('|'),
      prompt: `Order these ${st.what} from <b>${noun[0]} to ${noun[1]}</b>.`,
      items: q.items.map((x) => `${x} ${st.unit}`), answer: ans, answerText: ans.join(', '), orderText: `from ${noun[0]} to ${noun[1]}`,
      slotLabels: q.items.map((_, i) => (i === 0 ? noun[0] : i === q.items.length - 1 ? noun[1] : '')),
      why: q.why.replace(/<b>[^<]*<\/b>/, `<b>${ans.join(', ')}</b>`),
      diagnose: (resp) => orderDiag(resp.map((x) => x.split(' ')[0]), numAns, `from ${noun[0]} to ${noun[1]}`)
    });
  });

  T('W3', 'ordWord', (r, p) => {
    const { st, xs } = storySet(r, Object.assign({ story: p.story !== undefined ? p.story : r.pick([1, 3]) }, p), 3);
    const ans = desc(xs)[0];
    return {
      type: 'number', sig: 'W3' + st.unit + xs.slice().sort().join('|'),
      prompt: `Three ${st.what}: ${list(xs.map((x) => `${x} ${st.unit}`))}. Write the ${st.measure} of the <b>${st.ask}</b> as a decimal.`,
      answer: ans, answerText: `${ans} ${st.unit}`,
      hints: [
        `The ${st.ask} is the greatest number.`,
        'Write all three with three decimal places so they line up.',
        'Compare place by place, starting with the whole number, then the tenths.'
      ],
      why: `With three places: ${xs.map((x) => f(D.toThousandths(x), 3)).join(', ')}. The greatest is <b>${ans}</b>.`,
      diagnose(resp, info) {
        const k = info.th;
        const longest = xs.slice().sort((a, b) => D.parse(b).places - D.parse(a).places)[0];
        if (k === D.toThousandths(longest)) return `${longest} has the most digits, but that does not make it the greatest. Compare the tenths first.`;
        if (xs.some((x) => D.toThousandths(x) === k)) return `${resp} is one of the measurements, but not the greatest. Line them up and compare place by place.`;
        return 'Your answer should be one of the three measurements: the greatest one.';
      }
    };
  });

  const remind = {
    ordLG: `<p><b>Remember:</b> line up the decimal points and write zeros so all have the same number of places. Then compare from the left.</p>${M.stack(['0.7', '0.67', '0.705'])}<p>0.670 &lt; 0.700 &lt; 0.705</p>`,
    ordGL: '<p><b>Remember:</b> greatest to least means the biggest number first. Find the greatest by comparing the tenths, then keep going.</p>',
    align: '<p><b>Remember:</b> zeros at the end do not change a decimal (0.7 = 0.700). They make numbers easy to compare.</p>',
    ordLine: '<p><b>Remember:</b> on a number line, the least number is farthest left and the greatest is farthest right.</p>',
    ordWord: '<p><b>Remember:</b> decide whether the question wants the least or the greatest number. The fastest time is the least time.</p>'
  };

  G.engine.register({
    lessonId: 'd04',
    skills: {
      ordLG: 'Ordering from least to greatest',
      ordGL: 'Ordering from greatest to least',
      align: 'Lining up places with zeros at the end',
      ordLine: 'Ordering on a number line',
      ordWord: 'Ordering word problems'
    },
    plan: { ordLG: 2, ordGL: 2, align: 2, ordLine: 2, ordWord: 2 },
    practiceOnly: [],
    templates, remind
  });
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
