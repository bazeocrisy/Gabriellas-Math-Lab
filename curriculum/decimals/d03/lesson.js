// D03 Comparing Decimals — Teach screens, guided checks, and printable Lesson Notes.
(function (G) {
  'use strict';
  const M = G.models;
  const pair = (a, b, capA, capB) => `<div class="model-pair"><div><p class="model-cap">${capA}</p>${a}</div><div><p class="model-cap">${capB}</p>${b}</div></div>`;

  const screens = [
    {
      id: 'symbols', title: 'Greater than, less than, equal to', skill: 'cmpPlace',
      goal: 'how to read and write the symbols >, < and =.',
      body: `<ul class="facts">
          <li><b>&gt;</b> means "is greater than": 0.9 &gt; 0.4</li>
          <li><b>&lt;</b> means "is less than": 0.4 &lt; 0.9</li>
          <li><b>=</b> means "is equal to": 0.5 = 0.50</li>
        </ul>`,
      example: 'Worked example: compare 0.9 and 0.4.',
      exampleVisual: pair(M.strip(9), M.strip(4), '0.9', '0.4'),
      steps: [
        '<b>Step 1.</b> 0.9 is 9 tenths and 0.4 is 4 tenths. 9 tenths is more.',
        '<b>Step 2.</b> The open side of the symbol faces the greater number: <span class="big-num">0.9 &gt; 0.4</span>',
        '<b>Step 3.</b> Read it out loud: "nine tenths is greater than four tenths." You could also write 0.4 &lt; 0.9.'
      ],
      why: 'The symbol always opens toward the greater number and points at the smaller one, so 0.9 > 0.4 and 0.4 < 0.9 say the same thing.'
    },
    {
      id: 'check-symbols', title: 'Try it together', kind: 'check', skill: 'cmpPlace',
      check: { t: 'S1', params: { x: '0.3', y: '0.8' } },
      reteach: `<p><b>Let's look again.</b> 0.6 is 6 tenths and 0.2 is 2 tenths. 6 tenths is more, so 0.6 &gt; 0.2. The open side of the symbol faces 0.6, the greater number.</p>`
    },
    {
      id: 'place', title: 'Compare place by place', skill: 'cmpPlace',
      goal: 'how to compare two decimals using place value.',
      body: '<p>To compare decimals, <b>line up the decimal points</b> and compare one place at a time, starting with the biggest place on the left.</p>',
      example: 'Worked example: compare 0.364 and 0.371.',
      exampleVisual: M.stack(['0.364', '0.371'], { highlight: 'hundredths' }),
      steps: [
        '<b>Step 1.</b> Line up the decimal points (see the chart).',
        '<b>Step 2.</b> Ones: both 0. Tenths: both 3. These places do not decide.',
        '<b>Step 3.</b> Hundredths: 6 and 7. They are different, so this place decides. 6 hundredths is less than 7 hundredths.',
        '<b>Answer:</b> <span class="big-num">0.364 &lt; 0.371</span> The thousandths do not matter once a bigger place has decided.'
      ],
      why: 'A digit in a bigger place is worth more than everything in the smaller places after it. One hundredth (10 thousandths) is more than any number of thousandths left over (at most 9), so the first different place decides.'
    },
    {
      id: 'check-place', title: 'Try it together', kind: 'check', skill: 'cmpPlace',
      check: { t: 'S2', params: { x: '0.583', y: '0.538', dir: 'greater' } },
      reteach: `<p><b>Let's look again.</b> Line up 0.472 and 0.427:</p>${M.stack(['0.472', '0.427'], { highlight: 'hundredths' })}
        <p>The tenths are the same (4). In the hundredths, 7 is more than 2, so 0.472 is greater.</p>`
    },
    {
      id: 'missing', title: 'A missing digit', skill: 'cmpPlace',
      goal: 'how to find a digit that makes a comparison true.',
      body: '<p>Sometimes one digit is hidden in a box. Use place value to decide which digits can go in the box and still make the comparison true.</p>',
      example: 'Worked example: which digit can go in the box? 0.5▢8 &lt; 0.546. Choices: 7, 2, 9, 6',
      exampleVisual: `<div class="chart-stack">${M.chart({ ones: '0', tenths: '5', hundredths: '?', thousandths: '8' }, { caption: '0.5▢8 (the box is in the hundredths place)' })}${M.chart({ ones: '0', tenths: '5', hundredths: '4', thousandths: '6' }, { caption: '0.546' })}</div>`,
      steps: [
        '<b>Step 1.</b> Line up the two numbers by place value, as in the charts.',
        '<b>Step 2.</b> Compare from the left. Ones: both 0. Tenths: both 5. These places do not decide.',
        '<b>Step 3.</b> The next place is the hundredths, where the box is. For 0.5▢8 to be <b>less</b>, the box digit must be <b>less than 4</b>: 0, 1, 2 or 3.',
        '<b>Step 4.</b> Check the choices: 7, 9 and 6 are all greater than 4, so they make 0.5▢8 greater. Only <b>2</b> is less than 4.',
        '<b>Answer:</b> <span class="big-num">2</span> Check: 0.528 &lt; 0.546 ✓ (5 tenths = 5 tenths, and 2 hundredths &lt; 4 hundredths).'
      ],
      why: 'The first place where two decimals have different digits decides the comparison. The tenths are the same, so the hundredths place, where the box is, decides it. (If the box held the same digit, 4, the thousandths would decide instead: 0.548 is greater than 0.546.)'
    },
    {
      id: 'check-missing', title: 'Try it together', kind: 'check', skill: 'cmpPlace',
      check: { t: 'S5', params: { want: '>', a: 7, b: 4, c: 5, d: 2 } },
      reteach: `<p><b>Let's look again.</b> For 0.3▢1 &gt; 0.362, the tenths are the same (3), so the box (the hundredths place) decides. It must be greater than 6: 7, 8 or 9.</p>
        <p>Do the same with your problem: find the first place that is different, and compare the box with the digit in that place.</p>`
    },
    {
      id: 'zeros', title: 'Different numbers of digits', skill: 'cmpLength',
      goal: 'how to compare decimals that have different numbers of digits.',
      body: '<p>When two decimals have different numbers of digits, write <b>zeros at the end</b> so they have the same number of places. Zeros at the end do not change a decimal.</p>',
      example: 'Worked example: compare 0.8 and 0.75.',
      exampleVisual: M.stack(['0.8', '0.75'], { highlight: 'tenths' }) + pair(M.grid(80), M.grid(75), '0.8 = 0.80', '0.75'),
      steps: [
        '<b>Step 1.</b> Write 0.8 with two decimal places: <b>0.8 = 0.80</b>.',
        '<b>Step 2.</b> Now compare 0.80 with 0.75, place by place.',
        '<b>Step 3.</b> Tenths: 8 and 7. Eight tenths is greater than seven tenths, so this place decides.',
        '<b>Answer:</b> <span class="big-num">0.8 &gt; 0.75</span> The grids show it: 80 squares is more than 75 squares.'
      ],
      why: 'Writing 0.8 as 0.80 does not change its value, but it lets you compare the same places. Then the tenths decide: 8 tenths is more than 7 tenths, no matter what comes after.'
    },
    {
      id: 'more-digits', title: 'Watch out: more digits is not always greater', skill: 'cmpLength',
      goal: 'why counting digits does not work.',
      body: '<p>Some students think the decimal with more digits is always greater. Let\'s test that idea.</p>',
      example: 'Worked examples',
      exampleVisual: M.stack(['0.6', '0.599'], { highlight: 'tenths' }),
      steps: [
        '<b>0.6 and 0.599:</b> write 0.6 as 0.600. Tenths: 6 and 5. So <b>0.6 &gt; 0.599</b>, even though 0.599 has more digits.',
        '<b>2.1 and 1.987:</b> the whole numbers are different (2 and 1), so they decide first: <b>2.1 &gt; 1.987</b>.',
        '<b>0.45 and 0.4:</b> write 0.4 as 0.40. Hundredths: 5 and 0. Here the longer number is greater: <b>0.45 &gt; 0.4</b>.'
      ],
      why: 'The number of digits tells you nothing by itself. Sometimes the longer decimal is greater and sometimes it is smaller. Only comparing place by place, from the left, always works.'
    },
    {
      id: 'check-length', title: 'Try it together', kind: 'check', skill: 'cmpLength',
      check: { t: 'L1', params: { x: '0.7', y: '0.689' } },
      reteach: `<p><b>Let's look again.</b> Compare 0.5 and 0.498. Write 0.5 as 0.500:</p>${M.stack(['0.5', '0.498'], { highlight: 'tenths' })}<p>Tenths: 5 is more than 4, so 0.5 &gt; 0.498.</p>`
    },
    {
      id: 'between', title: 'Decimals in between', skill: 'cmpLength',
      goal: 'how to find a decimal between two decimals.',
      body: '<p>There are always more decimals between two decimals. Writing one more decimal place helps you find them.</p>',
      example: 'Worked example: find a decimal greater than 0.4 and less than 0.5.',
      exampleVisual: M.line({ from: 400, to: 500, labels: ['0.4', '0.5'], tickLabels: true }),
      steps: [
        '<b>Step 1.</b> Write both with one more decimal place: 0.4 = <b>0.40</b> and 0.5 = <b>0.50</b>.',
        '<b>Step 2.</b> Any number of hundredths between 40 and 50 works: 0.41, 0.42, … 0.49.',
        '<b>Answer:</b> for example, <span class="big-num">0.45</span> The number line shows all of them between 0.4 and 0.5.'
      ],
      why: 'Adding a zero at the end does not change a number, but it splits each tenth into 10 hundredths. That makes room to see the decimals in between.'
    },
    {
      id: 'check-between', title: 'Try it together', kind: 'check', skill: 'cmpLength',
      check: { t: 'L3', params: { lo: '0.6', lvl: 1 } },
      reteach: '<p><b>Let\'s look again.</b> Between 0.2 and 0.3: write them as 0.20 and 0.30. Then 0.21, 0.25 or 0.29 all fit. Do the same with 0.6 and 0.7.</p>'
    },
    {
      id: 'equal', title: 'Equal decimals', skill: 'cmpEqual',
      goal: 'how to tell when two decimals are equal.',
      body: '<p>Two decimals are <b>equal</b> when every place has the same digit. An empty place counts as 0.</p>',
      example: 'Worked example: compare 1.50 and 1.5.',
      exampleVisual: M.stack(['1.50', '1.5']),
      steps: [
        '<b>Step 1.</b> Line them up. Write 1.5 as 1.50.',
        '<b>Step 2.</b> Ones: 1 and 1. Tenths: 5 and 5. Hundredths: 0 and 0. Every place matches.',
        '<b>Answer:</b> <span class="big-num">1.50 = 1.5</span>',
        'Careful: 1.05 is <b>not</b> equal to 1.5. In 1.05 the zero holds the tenths place, so the 5 is in the hundredths place.'
      ],
      why: 'A zero at the end of a decimal is in an empty place and adds nothing, so the value does not change. A zero before a digit pushes that digit into a smaller place.'
    },
    {
      id: 'check-equal', title: 'Try it together', kind: 'check', skill: 'cmpEqual',
      check: { t: 'E1', params: { x: '2.40', y: '2.4' } },
      reteach: `<p><b>Let's look again.</b> 3.70 and 3.7: line them up as 3.70 and 3.70. Every place matches, so 3.70 = 3.7.</p>`
    },
    {
      id: 'line', title: 'Comparing on a number line', skill: 'cmpLine',
      goal: 'how to use a number line to compare decimals.',
      body: '<p>On a number line, numbers get <b>greater as you move to the right</b>.</p>',
      example: 'Worked example: which is greater, the number at A or the number at B?',
      exampleVisual: M.line({ from: 300, to: 400, labels: ['0.3', '0.4'], points: [{ label: 'A', v: 320 }, { label: 'B', v: 370 }] }),
      steps: [
        '<b>Step 1.</b> The line goes from 0.3 to 0.4 in 10 equal jumps, so each jump is 0.01.',
        '<b>Step 2.</b> A is 2 jumps past 0.3: <b>0.32</b>. B is 7 jumps past 0.3: <b>0.37</b>.',
        '<b>Step 3.</b> B is farther to the right, so <span class="big-num">0.37 &gt; 0.32</span>'
      ],
      why: 'A number line is in order: every step to the right adds a little more. So the number farther right is always the greater one.'
    },
    {
      id: 'check-line', title: 'Try it together', kind: 'check', skill: 'cmpLine',
      check: { t: 'NL1', params: { a: 5, u: 4, v: 8 } },
      reteach: `<p><b>Let's look again.</b> On a line from 0.7 to 0.8, a point 3 jumps past 0.7 is at 0.73 and a point 6 jumps past is at 0.76. The second one is farther right, so it is greater.</p>`
    },
    {
      id: 'explain', title: 'Explaining a comparison', skill: 'cmpWhy',
      goal: 'how to explain why one decimal is greater.',
      body: '<p>A good explanation names the <b>first place where the digits are different</b>.</p><p class="frame">"<b>___</b> is greater because in the <b>___</b> place it has <b>___</b>, and the other number has only <b>___</b>."</p>',
      example: 'Worked example: compare 3.405 and 3.45, and explain.',
      exampleVisual: M.stack(['3.405', '3.45'], { highlight: 'hundredths' }),
      steps: [
        '<b>Step 1.</b> Line them up: 3.405 and 3.450.',
        '<b>Step 2.</b> Ones: 3 and 3. Tenths: 4 and 4. Hundredths: 0 and 5. The hundredths decide.',
        '<b>Answer:</b> <span class="big-num">3.45 &gt; 3.405</span> because in the hundredths place, 3.45 has 5 and 3.405 has only 0.'
      ],
      why: 'Saying "405 is more than 45" would be wrong, because those digits are in different places. A place-value reason compares digits in the same place, so it is always correct.'
    },
    {
      id: 'check-explain', title: 'Try it together', kind: 'check', skill: 'cmpWhy',
      check: { t: 'Y2', params: { x: '0.62', y: '0.586' } },
      reteach: '<p><b>Let\'s look again.</b> For 0.9 &gt; 0.85, the reason is "0.9 has 9 tenths and 0.85 has only 8 tenths." It names the first place where the digits differ.</p>'
    },
    {
      id: 'done', title: 'Lesson review', kind: 'done',
      body: `<ul class="facts">
          <li>&gt; is greater than, &lt; is less than, = is equal to. The open side faces the greater number.</li>
          <li>Line up the decimal points and compare from the left. The first different place decides.</li>
          <li>Write zeros at the end to give both numbers the same number of places: 0.8 = 0.80 &gt; 0.75.</li>
          <li>More digits does not mean greater.</li>
          <li>On a number line, farther right means greater.</li>
        </ul>
        <p>You finished Lesson 3! Next, practice with hints, or read the Lesson Notes.</p>`
    }
  ];

  const skillScreen = { cmpPlace: 'place', cmpLength: 'zeros', cmpEqual: 'equal', cmpLine: 'line', cmpWhy: 'explain' };

  const notes = `
    <h2>Vocabulary</h2>
    <dl class="vocab">
      <dt>Greater than (&gt;)</dt><dd>0.9 &gt; 0.4 means 0.9 is greater than 0.4.</dd>
      <dt>Less than (&lt;)</dt><dd>0.4 &lt; 0.9 means 0.4 is less than 0.9.</dd>
      <dt>Equal to (=)</dt><dd>0.5 = 0.50 means both name the same amount.</dd>
      <dt>Equivalent decimals</dt><dd>Decimals that name the same amount, like 1.5 = 1.50 = 1.500.</dd>
    </dl>

    <h2>How to compare two decimals</h2>
    <ol>
      <li>Line up the decimal points.</li>
      <li>Write zeros at the end so both have the same number of places.</li>
      <li>Compare from the left. The first place with different digits decides.</li>
      <li>Write the symbol so its open side faces the greater number.</li>
    </ol>
    ${M.stack(['0.8', '0.75'], { highlight: 'tenths', caption: '0.8 = 0.80 and 0.75: the tenths decide, 8 > 7' })}

    <h2>Worked examples</h2>
    <div class="note-ex">
      <h3>Different numbers of digits</h3>
      <p>0.8 and 0.75: 0.8 = 0.80. Eight tenths is greater than seven tenths, so <b>0.8 &gt; 0.75</b>.</p>
    </div>
    <div class="note-ex">
      <h3>The first different place decides</h3>
      <p>0.364 and 0.371: tenths are the same; hundredths 6 &lt; 7, so <b>0.364 &lt; 0.371</b>.</p>
    </div>
    <div class="note-ex">
      <h3>Number line</h3>
      ${M.line({ from: 300, to: 400, labels: ['0.3', '0.4'], points: [{ label: 'A', v: 320 }, { label: 'B', v: 370 }] })}
      <p>A = 0.32, B = 0.37. B is farther right, so <b>0.37 &gt; 0.32</b>.</p>
    </div>

    <h2>Common mistakes</h2>
    <ul>
      <li><b>"0.599 is greater than 0.6 because it has more digits."</b> No: 0.6 = 0.600, and 6 tenths &gt; 5 tenths.</li>
      <li><b>"0.405 &gt; 0.45 because 405 &gt; 45."</b> No: compare place by place. In the hundredths, 0 &lt; 5, so 0.405 &lt; 0.45.</li>
      <li><b>"1.05 = 1.5."</b> No: in 1.05 the 5 is in the hundredths place.</li>
    </ul>`;

  G.lessonContent.d03 = {
    id: 'd03',
    title: 'Comparing Decimals',
    screens, skillScreen, notes,
    teachSigs: screens.filter((s) => s.check).map((s) => G.engine.make('d03', s.check.t, 1, s.check.params).sig)
      // Worked examples on Teach screens, reteach cards and Lesson Notes, in either order.
      .concat(...[['0.9', '0.4'], ['0.31', '0.36'], ['0.364', '0.371'], ['0.472', '0.427'], ['0.8', '0.75'], ['0.6', '0.599'], ['2.1', '1.987'],
        ['0.45', '0.4'], ['0.5', '0.498'], ['0.6', '0.2'], ['1.50', '1.5'], ['1.05', '1.5'], ['3.70', '3.7'], ['3.405', '3.45'], ['0.9', '0.85']]
        .map(([a, b]) => [`S1:${a}|${b}`, `S1:${b}|${a}`, `L1:${a}|${b}`, `L1:${b}|${a}`, `E1:${a}|${b}`, `E1:${b}|${a}`, `S3:${a}|${b}`, `S3:${b}|${a}`,
          `S4:${a}${b}`, `S4:${b}${a}`, `L2:${a}${b}greater`, `L2:${b}${a}greater`, `L2:${a}${b}less`, `L2:${b}${a}less`,
          `S2:${a}${b}greater`, `S2:${b}${a}greater`, `S2:${a}${b}less`, `S2:${b}${a}less`, `Y2:${a}${b}`, `Y2:${b}${a}`, `NL2:${a}${b}`, `NL2:${b}${a}`]),
      ['NL1:3:27', 'NL1:7:36', 'L3:0.4', 'L3:0.2', 'S5:<5468', 'S5:>3621'])
  };
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
