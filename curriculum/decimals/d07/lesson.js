// D07 Subtracting Decimals — Teach screens, guided checks, and printable Lesson Notes.
(function (G) {
  'use strict';
  const M = G.models;

  const screens = [
    {
      id: 'models', title: 'Subtracting with models', skill: 'subModel',
      goal: 'what it means to subtract decimals, using a grid.',
      body: '<p>Subtracting decimals is <b>taking away</b> part of an amount. On a hundredths grid, take away squares.</p>',
      example: 'Worked example: 0.75 − 0.3',
      exampleVisual: M.grid(75, { cross: 30 }),
      steps: [
        '<b>Step 1.</b> 0.75 is 75 shaded squares. 0.3 is 3 columns = 30 hundredths. Cross out 30 squares.',
        '<b>Step 2.</b> 75 hundredths − 30 hundredths = 45 hundredths.',
        '<b>Answer:</b> <span class="big-num">0.75 − 0.3 = 0.45</span>'
      ],
      why: 'Like adding, subtracting works on parts of the same size. Writing 0.3 as 30 hundredths lets you take hundredths away from hundredths.'
    },
    {
      id: 'check-models', title: 'Try it together', kind: 'check', skill: 'subModel',
      check: { t: 'SM1', params: { ka: 68, kb: 23 } },
      reteach: `<p><b>Let's look again.</b> A grid with 57 squares shaded is 0.57. Crossing out 14 of them leaves 57 − 14 = 43 squares = 0.43.</p>${M.grid(57, { cross: 14 })}`
    },
    {
      id: 'line-up', title: 'Line up and regroup', skill: 'subAlign',
      goal: 'how to subtract decimals in columns, regrouping when a digit is too small.',
      body: '<p>Line up the decimal points, bigger number on top. Subtract from the right. If a top digit is smaller than the one below it, <b>regroup</b>: take one from the next place to the left, which becomes ten of this place.</p>',
      example: 'Worked example: 5.32 − 2.67',
      exampleVisual: M.vertical(['5.32', '2.67'], '−', { answer: '2.65' }),
      steps: [
        '<b>Step 1.</b> Hundredths: 2 is less than 7. Take 1 tenth from the 3 tenths (leaving 2 tenths); it becomes 10 hundredths. 12 − 7 = <b>5</b>.',
        '<b>Step 2.</b> Tenths: now 2 is less than 6. Take 1 one from the 5 ones (leaving 4 ones); it becomes 10 tenths. 12 − 6 = <b>6</b>.',
        '<b>Step 3.</b> Ones: 4 − 2 = <b>2</b>. Bring the decimal point straight down.',
        '<b>Answer:</b> <span class="big-num">2.65</span> Check: 2.65 + 2.67 = 5.32 ✓'
      ],
      why: 'Regrouping changes how the top number is written, not how much it is: 5.32 is still 4 ones, 12 tenths and 12 hundredths. That lets every column subtract a smaller digit from a bigger one.'
    },
    {
      id: 'check-line-up', title: 'Try it together', kind: 'check', skill: 'subAlign',
      check: { t: 'SL1', params: { a: '7.41', b: '3.26' } },
      reteach: `<p><b>Let's look again.</b> 6.52 − 2.38: hundredths 2 &lt; 8, so take 1 tenth (5 tenths become 4) and make 12 hundredths: 12 − 8 = 4. Tenths 4 − 3 = 1. Ones 6 − 2 = 4. Answer 4.14.</p>`
    },
    {
      id: 'zeros', title: 'Subtracting with zeros', skill: 'subZeros',
      goal: 'how to subtract from a whole number or a number with fewer places.',
      body: '<p>Write zeros so both numbers have the same number of places. A whole number like 5 is <b>5.00</b>. Then regroup across the zeros.</p>',
      example: 'Worked example: 5 − 2.37',
      exampleVisual: M.vertical(['5', '2.37'], '−', { answer: '2.63', pad: true }),
      steps: [
        '<b>Step 1.</b> Write 5 as <b>5.00</b> and line up the decimal points.',
        '<b>Step 2.</b> Hundredths: 0 is less than 7, and the tenths place has 0 too. Take 1 one (5 ones become 4): that makes 10 tenths. Take 1 of those tenths (leaving 9 tenths): that makes 10 hundredths.',
        '<b>Step 3.</b> Now subtract: hundredths 10 − 7 = 3, tenths 9 − 3 = 6, ones 4 − 2 = 2.',
        '<b>Answer:</b> <span class="big-num">2.63</span>'
      ],
      why: '5 ones is the same amount as 4 ones, 9 tenths and 10 hundredths. Regrouping across the zeros rewrites 5.00 that way, so each column can be subtracted.'
    },
    {
      id: 'check-zeros', title: 'Try it together', kind: 'check', skill: 'subZeros',
      check: { t: 'SZ1', params: { a: '8', b: '3.45' } },
      reteach: `<p><b>Let's look again.</b> 4 − 1.25: write 4.00. Regroup: 3 ones, 9 tenths, 10 hundredths. Then 10 − 5 = 5, 9 − 2 = 7, 3 − 1 = 2. Answer 2.75.</p>`
    },
    {
      id: 'places', title: 'Different numbers of places', skill: 'subZeros',
      goal: 'how to line up numbers like 4.06 and 1.8.',
      body: '<p>When the numbers have different numbers of decimal places, write zeros at the end first.</p>',
      example: 'Worked example: 4.06 − 1.8',
      exampleVisual: M.vertical(['4.06', '1.8'], '−', { answer: '2.26', pad: true }),
      steps: [
        '<b>Step 1.</b> Write 1.8 as <b>1.80</b> and line up the decimal points.',
        '<b>Step 2.</b> Hundredths: 6 − 0 = 6. Tenths: 0 is less than 8, so take 1 one (4 becomes 3): 10 − 8 = 2. Ones: 3 − 1 = 2.',
        '<b>Answer:</b> <span class="big-num">2.26</span>'
      ],
      why: 'The zero at the end of 1.80 does not change its value. It just fills the hundredths column so you do not line the digits up the wrong way.'
    },
    {
      id: 'check', title: 'Check by adding', skill: 'subCheck',
      goal: 'how to check a subtraction answer.',
      body: '<p>Addition undoes subtraction. To check, <b>add the answer and the number you took away</b>. You should get the number you started with. You can also estimate.</p>',
      example: 'Worked example: is 6.4 − 2.75 = 3.65 right?',
      exampleVisual: M.vertical(['3.65', '2.75'], '+', { answer: '6.40' }),
      steps: [
        '<b>Step 1.</b> Add the answer and the number taken away: 3.65 + 2.75.',
        '<b>Step 2.</b> 3.65 + 2.75 = 6.40, and 6.40 = 6.4, the starting number. ✓',
        '<b>Step 3.</b> Estimate too: 6.4 − 2.75 is about 6 − 3 = 3, and 3.65 is close to 3.'
      ],
      why: 'If you take an amount away and then put it back, you are back where you started. So answer + amount taken away must equal the first number.'
    },
    {
      id: 'check-check', title: 'Try it together', kind: 'check', skill: 'subCheck',
      check: { t: 'SC1', params: { a: '9.3', b: '4.56' } },
      reteach: '<p><b>Let\'s look again.</b> To check 8.5 − 3.2 = 5.3, add 5.3 + 3.2. That is 8.5, the starting number, so the subtraction is right.</p>'
    },
    {
      id: 'word', title: 'Subtraction word problems', skill: 'subWord',
      goal: 'how to solve word problems that need subtracting decimals.',
      body: '<p>Words like <b>change</b>, <b>how much more</b>, <b>how much longer</b>, <b>difference</b> and <b>left</b> tell you to subtract.</p>',
      example: 'Worked example: you buy a book for $6.35 and pay with a $10 bill. How much change do you get?',
      exampleVisual: M.vertical(['10', '6.35'], '−', { answer: '3.65', pad: true }),
      steps: [
        '<b>Step 1.</b> Change = money given − cost: $10.00 − $6.35.',
        '<b>Step 2.</b> Regroup across the zeros: 10.00 becomes 9 ones, 9 tenths, 10 hundredths. Then 10 − 5 = 5, 9 − 3 = 6, 9 − 6 = 3.',
        '<b>Answer:</b> <span class="big-num">$3.65</span> Check: $3.65 + $6.35 = $10.00 ✓'
      ],
      why: 'Change is the part of your money that is left after the cost is taken away, so it is a subtraction. Adding the change back to the cost must give the money you paid.'
    },
    {
      id: 'check-word', title: 'Try it together', kind: 'check', skill: 'subWord',
      check: { t: 'SW1', params: { paid: '20', cost: '12.49', item: 'a puzzle' } },
      reteach: '<p><b>Let\'s look again.</b> Paying $5 for a snack that costs $2.80: $5.00 − $2.80 = $2.20 change. Check: $2.20 + $2.80 = $5.00.</p>'
    },
    {
      id: 'done', title: 'Lesson review', kind: 'done',
      body: `<ul class="facts">
          <li>Subtracting is taking away: hundredths from hundredths, tenths from tenths.</li>
          <li>Line up the decimal points. Write zeros so both numbers have the same number of places (5 = 5.00).</li>
          <li>When a top digit is smaller, regroup: take one from the next place to the left.</li>
          <li>Check by adding: answer + amount taken away = starting number.</li>
        </ul>
        <p>You finished Lesson 7! Next, practice with hints, or read the Lesson Notes.</p>`
    }
  ];

  const skillScreen = { subModel: 'models', subAlign: 'line-up', subZeros: 'zeros', subCheck: 'check', subWord: 'word' };

  const notes = `
    <h2>Vocabulary</h2>
    <dl class="vocab">
      <dt>Difference</dt><dd>The answer to a subtraction problem. The difference of 5.32 and 2.67 is 2.65.</dd>
      <dt>Regroup (borrow)</dt><dd>Take 1 from the next place to the left; it becomes 10 of the place you are working on.</dd>
      <dt>Check</dt><dd>Add the answer and the amount taken away. You should get the starting number.</dd>
    </dl>

    <h2>How to subtract decimals</h2>
    <ol>
      <li>Write the bigger number on top and line up the decimal points.</li>
      <li>Write zeros so both numbers have the same number of places.</li>
      <li>Subtract from the right. Regroup when the top digit is smaller.</li>
      <li>Bring the decimal point straight down. Check by adding.</li>
    </ol>
    ${M.vertical(['5.32', '2.67'], '−', { answer: '2.65' })}

    <h2>Worked examples</h2>
    <div class="note-ex"><h3>With a model</h3><p>0.75 − 0.3 = 75 hundredths − 30 hundredths = <b>0.45</b>.</p></div>
    <div class="note-ex"><h3>Across zeros</h3><p>5 − 2.37 → 5.00 − 2.37 = <b>2.63</b>.</p></div>
    <div class="note-ex"><h3>Different places</h3><p>4.06 − 1.8 → 4.06 − 1.80 = <b>2.26</b>.</p></div>
    <div class="note-ex"><h3>Change</h3><p>$10.00 − $6.35 = <b>$3.65</b>. Check: $3.65 + $6.35 = $10.00.</p></div>

    <h2>Common mistakes</h2>
    <ul>
      <li><b>Flipping a column.</b> In 5.32 − 2.67 you cannot do 7 − 2 in the hundredths. Regroup instead.</li>
      <li><b>Forgetting the place you borrowed from is one less.</b></li>
      <li><b>Lining up the digits from the right.</b> Line up the decimal points and write zeros.</li>
    </ul>`;

  G.lessonContent.d07 = {
    id: 'd07',
    title: 'Subtracting Decimals',
    screens, skillScreen, notes,
    teachSigs: screens.filter((s) => s.check).map((s) => G.engine.make('d07', s.check.t, 1, s.check.params).sig)
      .concat([['5.32', '2.67'], ['6.52', '2.38'], ['5', '2.37'], ['4', '1.25'], ['4.06', '1.8'], ['6.4', '2.75'], ['8.5', '3.2'], ['10', '6.35'], ['5', '2.8']]
        .flatMap(([a, b]) => [`SL1:${a}-${b}`, `SZ1:w${a}-${b}`, `SZ2:${a}-${b}`, `SL3:fix${a}-${b}`, `SC1:${a}-${b}`, `SC2:${a}-${b}r`, `SC2:${a}-${b}w`, `SC3:${a}-${b}`, `SW1:change${a}-${b}`]), ['SM1:75-30', 'SM1:57-14'])
  };
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
