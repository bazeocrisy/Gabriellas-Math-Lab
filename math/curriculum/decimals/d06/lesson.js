// D06 Adding Decimals — Teach screens, guided checks, and printable Lesson Notes.
(function (G) {
  'use strict';
  const M = G.models;
  const pair = (a, b, capA, capB) => `<div class="model-pair"><div><p class="model-cap">${capA}</p>${a}</div><div><p class="model-cap">${capB}</p>${b}</div></div>`;

  const screens = [
    {
      id: 'models', title: 'Adding with models', skill: 'addModel',
      goal: 'what it means to add decimals, using grids.',
      body: '<p>Adding decimals is putting parts of a whole together. On a hundredths grid, add <b>squares to squares</b>.</p>',
      example: 'Worked example: 0.3 + 0.45',
      exampleVisual: pair(M.grid(30), M.grid(45), '0.3', '0.45'),
      steps: [
        '<b>Step 1.</b> 0.3 is 3 columns = 30 hundredths. 0.45 is 45 hundredths.',
        '<b>Step 2.</b> 30 hundredths + 45 hundredths = 75 hundredths.',
        '<b>Answer:</b> <span class="big-num">0.3 + 0.45 = 0.75</span>',
        '<b>With tenths bars:</b> 0.7 + 0.6 is 7 tenths + 6 tenths = 13 tenths. Ten tenths make one whole, so 13 tenths = <b>1.3</b>.' + pair(M.strip(7), M.strip(6), '0.7', '0.6'),
        '<b>On a number line:</b> to add 0.3 to 2.4, start at 2.4 (point A) and make 3 jumps of 0.1 to the right to land on <b>2.7</b> (point B). The tick marks are one tenth apart, and you count the jumps (the spaces), not the tick marks.' +
          M.line({ from: 2000, to: 3000, labels: ['2', '3'], tickLabels: true, points: [{ v: 2400, label: 'A' }, { v: 2700, label: 'B' }], hops: { start: 2400, n: 3 }, label: 'A number line from 2 to 3 with tick marks every 0.1. Three arrows jump to the right from 2.4 to 2.7.' })
      ],
      why: 'You can only add parts of the same size: hundredths with hundredths, tenths with tenths. Writing 0.3 as 30 hundredths makes the parts the same size.'
    },
    {
      id: 'check-models', title: 'Try it together', kind: 'check', skill: 'addModel',
      check: { t: 'AM1', params: { ka: 24, kb: 51 } },
      reteach: `<p><b>Let's look again.</b> A grid with 2 columns and 3 squares is 0.23, and a grid with 4 columns and 1 square is 0.41. Together: 23 + 41 = 64 hundredths = 0.64.</p>`
    },
    {
      id: 'line-up', title: 'Line up the decimal points', skill: 'addAlign',
      goal: 'how to add decimals in columns, with regrouping.',
      body: '<p>Write the numbers in columns with the <b>decimal points lined up</b>. Then add like whole numbers, starting on the right.</p>',
      example: 'Worked example: 3.48 + 2.75',
      exampleVisual: M.vertical(['3.48', '2.75'], '+', { answer: '6.23', carry: { 0: '1', 2: '1' } }),
      steps: [
        '<b>Step 1.</b> Hundredths: 8 + 5 = 13. Write 3, carry 1 to the tenths.',
        '<b>Step 2.</b> Tenths: 4 + 7 + 1 = 12. Write 2, carry 1 to the ones.',
        '<b>Step 3.</b> Ones: 3 + 2 + 1 = 6. Bring the decimal point straight down.',
        '<b>Answer:</b> <span class="big-num">6.23</span>'
      ],
      why: 'Lining up the decimal points puts hundredths under hundredths and tenths under tenths, so you add parts of the same size. Ten hundredths make one tenth, which is why you carry.'
    },
    {
      id: 'check-line-up', title: 'Try it together', kind: 'check', skill: 'addAlign',
      check: { t: 'AL1', params: { a: '2.36', b: '4.57' } },
      reteach: `<p><b>Let's look again.</b> 1.68 + 2.24: hundredths 8 + 4 = 12, write 2 carry 1. Tenths 6 + 2 + 1 = 9. Ones 1 + 2 = 3. The answer is 3.92.</p>${M.vertical(['1.68', '2.24'], '+', { answer: '3.92', carry: { 2: '1' } })}`
    },
    {
      id: 'zeros', title: 'Different numbers of places', skill: 'addMixed',
      goal: 'how to add decimals that have different numbers of places.',
      body: '<p>If one number has fewer decimal places, write a <b>zero at the end</b>. It does not change the value, and it keeps the columns neat.</p>',
      example: 'Worked example: 2.5 + 1.37',
      exampleVisual: pair(M.vertical(['2.5', '1.37'], '+', { answer: '3.87', pad: true }), M.vertical(['2.5', '1.37'], '+', { misaligned: true, answer: '1.62' }), 'Right: points lined up', 'Wrong: lined up from the right'),
      steps: [
        '<b>Step 1.</b> Write 2.5 as <b>2.50</b> and line up the decimal points with 1.37.',
        '<b>Step 2.</b> Hundredths: 0 + 7 = 7. Tenths: 5 + 3 = 8. Ones: 2 + 1 = 3.',
        '<b>Answer:</b> <span class="big-num">3.87</span>',
        'Watch out: lining the digits up from the right (like whole numbers) gives 1.62, which is even less than 2.5. That cannot be right!'
      ],
      why: 'A sum of two positive numbers is always more than each of them. Lining up the decimal points keeps every digit in its place, so 5 tenths are added to 3 tenths, not to 7 hundredths.'
    },
    {
      id: 'check-zeros', title: 'Try it together', kind: 'check', skill: 'addMixed',
      check: { t: 'MX1', params: { a: '4.6', b: '3.25' } },
      reteach: `<p><b>Let's look again.</b> 1.4 + 2.35: write 1.4 as 1.40. Then 1.40 + 2.35 = 3.75.</p>${M.vertical(['1.4', '2.35'], '+', { answer: '3.75', pad: true })}`
    },
    {
      id: 'whole', title: 'Whole numbers and three numbers', skill: 'addMixed',
      goal: 'how to add a whole number to a decimal, and add three decimals.',
      body: '<p>A whole number has a decimal point at its end: <b>6 = 6.0 = 6.00</b>.</p>',
      example: 'Worked examples',
      exampleVisual: M.vertical(['6', '0.45'], '+', { answer: '6.45', pad: true }),
      steps: [
        '<b>6 + 0.45:</b> write 6 as 6.00. Then 6.00 + 0.45 = <b>6.45</b>.',
        '<b>1.25 + 2.4 + 0.3:</b> write them as 1.25, 2.40 and 0.30 in a column. Hundredths: 5. Tenths: 2 + 4 + 3 = 9. Ones: 1 + 2 = 3. Sum: <b>3.95</b>.'
      ],
      why: 'Every number can be written with the same number of decimal places by adding zeros at the end, so the same lining-up method works for whole numbers and for three or more numbers.'
    },
    {
      id: 'check-whole', title: 'Try it together', kind: 'check', skill: 'addMixed',
      check: { t: 'MX2', params: { kind: 'whole', a: '8', b: '0.36' } },
      reteach: '<p><b>Let\'s look again.</b> 5 + 0.72: write 5 as 5.00. Then 5.00 + 0.72 = 5.72.</p>'
    },
    {
      id: 'estimate', title: 'Estimate to check', skill: 'addEstimate',
      goal: 'how to check a sum with an estimate.',
      body: '<p>Before or after you add, <b>estimate</b>: round each number to the nearest whole number and add. Your answer should be close to the estimate.</p>',
      example: 'Worked example: is 7.99 a reasonable answer for 4.82 + 3.17?',
      steps: [
        '<b>Step 1.</b> 4.82 rounds to 5 (the tenths digit is 8). 3.17 rounds to 3 (the tenths digit is 1).',
        '<b>Step 2.</b> Estimate: 5 + 3 = 8.',
        '<b>Step 3.</b> 7.99 is very close to 8, so it is reasonable. An answer like 0.79 or 79.9 would not be.'
      ],
      why: 'Rounding gives numbers that are easy to add in your head. Since the rounded numbers are close to the real ones, their sum is close to the real sum, so a big difference means a mistake.'
    },
    {
      id: 'check-estimate', title: 'Try it together', kind: 'check', skill: 'addEstimate',
      check: { t: 'ES1', params: { a: '6.73', b: '2.18' } },
      reteach: '<p><b>Let\'s look again.</b> For 5.61 + 1.24: 5.61 rounds to 6 and 1.24 rounds to 1, so the estimate is 6 + 1 = 7.</p>'
    },
    {
      id: 'word', title: 'Addition word problems', skill: 'addWord',
      goal: 'how to solve word problems that need adding decimals.',
      body: '<p>Words like <b>together</b>, <b>in all</b>, <b>total</b> and <b>altogether</b> tell you to add. Money uses hundredths: cents.</p>',
      example: 'Worked example: a notebook costs $2.75 and a pen costs $1.49. How much do they cost together?',
      exampleVisual: M.vertical(['2.75', '1.49'], '+', { answer: '4.24', carry: { 0: '1', 2: '1' } }),
      steps: [
        '<b>Step 1.</b> "Together" means add: $2.75 + $1.49.',
        '<b>Step 2.</b> Line up the decimal points. Cents: 5 + 9 = 14, write 4 carry 1. Dimes: 7 + 4 + 1 = 12, write 2 carry 1. Dollars: 2 + 1 + 1 = 4.',
        '<b>Answer:</b> <span class="big-num">$4.24</span> Check: about $3 + $1 = $4. ✓'
      ],
      why: 'Dollars and cents are decimals: cents are hundredths of a dollar. So adding prices is adding decimals, with the same lining up and carrying.'
    },
    {
      id: 'check-word', title: 'Try it together', kind: 'check', skill: 'addWord',
      check: { t: 'WP1', params: { m: 2, a: '3.65', b: '0.89' } },
      reteach: '<p><b>Let\'s look again.</b> $1.35 + $2.80: cents 5 + 0 = 5, dimes 3 + 8 = 11 (write 1, carry 1), dollars 1 + 2 + 1 = 4. Total: $4.15.</p>'
    },
    {
      id: 'done', title: 'Lesson review', kind: 'done',
      body: `<ul class="facts">
          <li>Add parts of the same size: hundredths with hundredths, tenths with tenths.</li>
          <li>Line up the decimal points. Write zeros so both numbers have the same number of places.</li>
          <li>Add from the right and carry when a column makes 10 or more. Bring the decimal point straight down.</li>
          <li>A whole number like 6 is 6.00.</li>
          <li>Estimate to check: 4.82 + 3.17 is about 5 + 3 = 8.</li>
        </ul>
        <p>You finished Lesson 6! Next, practice with hints, or read the Lesson Notes.</p>`
    }
  ];

  const skillScreen = { addModel: 'models', addAlign: 'line-up', addMixed: 'zeros', addEstimate: 'estimate', addWord: 'word' };

  const notes = `
    <h2>Vocabulary</h2>
    <dl class="vocab">
      <dt>Sum</dt><dd>The answer to an addition problem. The sum of 2.5 and 1.37 is 3.87.</dd>
      <dt>Regroup (carry)</dt><dd>When a column adds to 10 or more, 10 of that place make 1 of the next place to the left.</dd>
      <dt>Estimate</dt><dd>A close answer found with rounded numbers, used to check the exact answer.</dd>
    </dl>

    <h2>How to add decimals</h2>
    <ol>
      <li>Write the numbers in a column with the decimal points lined up.</li>
      <li>Write zeros at the end so they have the same number of places.</li>
      <li>Add from the right. Carry 1 when a column makes 10 or more.</li>
      <li>Bring the decimal point straight down. Check with an estimate.</li>
    </ol>
    ${M.vertical(['3.48', '2.75'], '+', { answer: '6.23', carry: { 0: '1', 2: '1' } })}

    <h2>Worked examples</h2>
    <div class="note-ex"><h3>With models</h3><p>0.3 + 0.45 = 30 hundredths + 45 hundredths = <b>0.75</b>.</p></div>
    <div class="note-ex"><h3>Different places</h3><p>2.5 + 1.37 → 2.50 + 1.37 = <b>3.87</b>.</p></div>
    <div class="note-ex"><h3>Whole number</h3><p>6 + 0.45 → 6.00 + 0.45 = <b>6.45</b>.</p></div>
    <div class="note-ex"><h3>Money</h3><p>$2.75 + $1.49 = <b>$4.24</b>. Estimate: $3 + $1 = $4.</p></div>

    <h2>Common mistakes</h2>
    <ul>
      <li><b>Lining up the digits from the right.</b> 2.5 + 1.37 is not 1.62. Line up the decimal points.</li>
      <li><b>Forgetting to carry.</b> 3.48 + 2.75: 8 + 5 = 13, so write 3 and carry 1.</li>
      <li><b>Dropping the decimal point.</b> Bring it straight down into the answer.</li>
    </ul>`;

  G.lessonContent.d06 = {
    id: 'd06',
    title: 'Adding Decimals',
    screens, skillScreen, notes,
    teachSigs: screens.filter((s) => s.check).map((s) => G.engine.make('d06', s.check.t, 1, s.check.params).sig)
      .concat([['0.3', '0.45'], ['3.48', '2.75'], ['1.68', '2.24'], ['2.5', '1.37'], ['1.4', '2.35'], ['6', '0.45'], ['5', '0.72'], ['4.82', '3.17'], ['5.61', '1.24'], ['2.75', '1.49'], ['1.35', '2.8']]
        .flatMap(([a, b]) => { const k = [a, b].sort().join('+'); return [`AL1:${k}`, `MX1:${k}`, `MX2:w${k}`, `AL3:fix${k}`, `AL2:${a}+${b}`, `ES1:${k}`, `ES2:${k}r`, `ES2:${k}w`, `WP1:m${k}`]; }), ['AM1:30+45', 'AM1:23+41', 'AM2:3+4'])
  };
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
