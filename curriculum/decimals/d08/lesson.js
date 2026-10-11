// D08 Multiplying Decimals (supplemental) — Teach screens, guided checks, and printable Lesson Notes.
(function (G) {
  'use strict';
  const M = G.models;

  const screens = [
    {
      id: 'pow', title: 'Multiplying by 10, 100 and 1000', skill: 'mPow',
      goal: 'what happens to the digits when you multiply by 10, 100 or 1000. (This lesson is extra: it goes beyond the Grade 5 Georgia decimal standards.)',
      body: '<p>In Lesson 2 you learned that each place is worth 10 times the place to its right. So multiplying by 10 moves every digit <b>one place to the left</b>.</p>',
      example: 'Worked example: 3.47 × 10, 3.47 × 100 and 3.47 × 1000',
      exampleVisual: M.stack(['3.47', '34.7', '347', '3470'], { labels: ['start', 'times 10', 'times 100', 'times 1000'], pad: false }),
      steps: [
        '<b>× 10:</b> every digit moves 1 place left: <b>34.7</b>.',
        '<b>× 100:</b> every digit moves 2 places left: <b>347</b>.',
        '<b>× 1000:</b> every digit moves 3 places left. There is no digit for the last empty place, so write a zero: <b>3470</b>.',
        'Shortcut: count the zeros in 10, 100 or 1000. That is how many places the digits move (the decimal point seems to move that many places to the right).'
      ],
      why: 'Each place is worth 10 times the place to its right, so making every digit worth 10 times as much shifts it one place left. 100 = 10 × 10 shifts two places, and 1000 shifts three.'
    },
    {
      id: 'check-pow', title: 'Try it together', kind: 'check', skill: 'mPow',
      check: { t: 'P1', params: { x: '0.56', f: 100 } },
      reteach: '<p><b>Let\'s look again.</b> 0.29 × 100: 100 has two zeros, so the digits move two places left. 0.29 becomes 29.</p>'
    },
    {
      id: 'whole', title: 'A decimal times a whole number', skill: 'mWhole',
      goal: 'how to multiply a decimal by a whole number.',
      body: '<p>Multiplying by a whole number means adding equal groups. You can also multiply the digits like whole numbers and then place the decimal point.</p>',
      example: 'Worked examples: 0.4 × 3 and 2.35 × 4',
      exampleVisual: `<div class="bar-stack">${M.strip(4)}${M.strip(4)}${M.strip(4)}</div>`,
      steps: [
        '<b>0.4 × 3</b> means 3 groups of 0.4: 0.4 + 0.4 + 0.4 = 12 tenths = <b>1.2</b>.',
        '<b>2.35 × 4:</b> estimate first: about 2 × 4 = 8.',
        'Multiply the digits as whole numbers: 235 × 4 = 940.',
        '2.35 has two decimal places, so the answer does too: <b>9.40</b> = 9.4. That is close to the estimate of 8. ✓'
      ],
      why: '2.35 is 235 hundredths. 4 groups of 235 hundredths is 940 hundredths, which is 9.40. That is why the answer has as many decimal places as the decimal you started with.'
    },
    {
      id: 'check-whole', title: 'Try it together', kind: 'check', skill: 'mWhole',
      check: { t: 'W1', params: { a: '1.25', n: 3 } },
      reteach: '<p><b>Let\'s look again.</b> 1.5 × 4: 15 × 4 = 60, and 1.5 has one decimal place, so the answer is 6.0 = 6. Check: 1.5 is between 1 and 2, so the answer is between 4 and 8. 6 fits.</p>'
    },
    {
      id: 'area', title: 'Tenths times tenths', skill: 'mTenths',
      goal: 'why a tenth times a tenth is a hundredth, using an area model.',
      body: '<p>0.3 × 0.4 means "3 tenths of 4 tenths". On a hundredths grid, mark 3 tenths of the rows and 4 tenths of the columns. The overlap is the product.</p>',
      example: 'Worked example: 0.3 × 0.4',
      exampleVisual: M.area(3, 4),
      steps: [
        '<b>Step 1.</b> 3 of the 10 rows are marked (light blue) and 4 of the 10 columns are marked (light yellow).',
        '<b>Step 2.</b> They overlap in 3 × 4 = 12 dark squares.',
        '<b>Answer:</b> each square is one hundredth, so <span class="big-num">0.3 × 0.4 = 0.12</span>'
      ],
      why: 'One tenth of one tenth is one hundredth (one small square). So tenths × tenths always gives hundredths: the product has two decimal places.'
    },
    {
      id: 'check-area', title: 'Try it together', kind: 'check', skill: 'mTenths',
      check: { t: 'A1', params: { a: 2, b: 6 } },
      reteach: `<p><b>Let's look again.</b> For 0.5 × 0.3, the overlap is 5 rows by 3 columns = 15 squares = 0.15.</p>${M.area(5, 3)}`
    },
    {
      id: 'point', title: 'Where does the decimal point go?', skill: 'mPoint',
      goal: 'how to place the decimal point in a product.',
      body: '<p>Multiply the digits like whole numbers. Then <b>count the decimal places in both factors</b>; the product has that many. Check with an estimate.</p>',
      example: 'Worked example: 23 × 14 = 322. What is 2.3 × 1.4?',
      steps: [
        '<b>Step 1.</b> The digits of the answer are 3, 2, 2 (from 322).',
        '<b>Step 2.</b> 2.3 has 1 decimal place and 1.4 has 1, so the product has 1 + 1 = <b>2 decimal places</b>: 3.22.',
        '<b>Step 3.</b> Check: 2.3 × 1.4 is more than 2 × 1 = 2 and less than 3 × 2 = 6. 3.22 fits (32.2 or 0.322 would not).',
        '<b>Answer:</b> <span class="big-num">2.3 × 1.4 = 3.22</span>'
      ],
      why: '2.3 is 23 tenths and 1.4 is 14 tenths. Tenths × tenths gives hundredths, so 23 × 14 = 322 hundredths = 3.22.'
    },
    {
      id: 'check-point', title: 'Try it together', kind: 'check', skill: 'mPoint',
      check: { t: 'D1', params: { a: '3.1', b: '2.4' } },
      reteach: '<p><b>Let\'s look again.</b> 12 × 3 = 36, so 1.2 × 0.3 has 1 + 1 = 2 decimal places: 0.36. Estimate: about 1 × 0.3, which is a little more than 0.3. ✓</p>'
    },
    {
      id: 'word', title: 'Multiplication word problems', skill: 'mWord',
      goal: 'how to solve word problems that need multiplying decimals.',
      body: '<p>Words like <b>each</b>, <b>groups of</b>, <b>laps of</b>, and <b>length × width</b> (area) tell you to multiply.</p>',
      example: 'Worked example: pencils cost $0.35 each. How much do 6 pencils cost?',
      steps: [
        '<b>Step 1.</b> 6 pencils at $0.35 each: 6 × $0.35.',
        '<b>Step 2.</b> 35 × 6 = 210. $0.35 has two decimal places, so the answer is $2.10.',
        '<b>Answer:</b> <span class="big-num">$2.10</span> Check: about 6 × $0.40 = $2.40, close. ✓'
      ],
      why: 'Buying several of the same item is adding equal groups, and multiplication is the fast way to add equal groups.'
    },
    {
      id: 'check-word', title: 'Try it together', kind: 'check', skill: 'mWord',
      check: { t: 'K1', params: { price: '0.45', n: 4, item: 'stickers' } },
      reteach: '<p><b>Let\'s look again.</b> Erasers at $0.25 each: 3 erasers cost 3 × $0.25 = 75 cents = $0.75.</p>'
    },
    {
      id: 'done', title: 'Lesson review', kind: 'done',
      body: `<ul class="facts">
          <li>× 10, × 100, × 1000 move every digit 1, 2 or 3 places to the left: 3.47 × 100 = 347.</li>
          <li>Decimal × whole number: multiply the digits, then use the same number of decimal places: 2.35 × 4 = 9.40.</li>
          <li>Tenths × tenths = hundredths: 0.3 × 0.4 = 0.12.</li>
          <li>Add the decimal places of both factors to place the point, and check with an estimate.</li>
        </ul>
        <p>You finished Lesson 8! This lesson was extra practice beyond the Grade 5 standards. Next, practice with hints, or read the Lesson Notes.</p>`
    }
  ];

  const skillScreen = { mPow: 'pow', mWhole: 'whole', mTenths: 'area', mPoint: 'point', mWord: 'word' };

  const notes = `
    <p class="fine"><b>Supplemental lesson:</b> Georgia's Grade 5 standards do not require multiplying decimals. This lesson extends 5.NR.1.2 (multiplying by powers of 10) for students who are ready.</p>
    <h2>Vocabulary</h2>
    <dl class="vocab">
      <dt>Product</dt><dd>The answer to a multiplication problem. The product of 0.3 and 0.4 is 0.12.</dd>
      <dt>Factor</dt><dd>A number being multiplied. In 2.3 × 1.4, the factors are 2.3 and 1.4.</dd>
      <dt>Power of 10</dt><dd>10, 100, 1000 … Multiplying by them moves the digits to the left.</dd>
    </dl>

    <h2>Rules to remember</h2>
    <ol>
      <li>× 10, × 100, × 1000: move every digit 1, 2 or 3 places to the left.</li>
      <li>Otherwise, multiply the digits like whole numbers.</li>
      <li>The product has as many decimal places as both factors together.</li>
      <li>Check with an estimate.</li>
    </ol>
    ${M.area(3, 4)}
    <p>0.3 × 0.4: the overlap is 12 squares = 0.12.</p>

    <h2>Worked examples</h2>
    <div class="note-ex"><h3>Powers of 10</h3><p>3.47 × 10 = 34.7 · 3.47 × 100 = 347 · 3.47 × 1000 = 3470.</p></div>
    <div class="note-ex"><h3>Decimal × whole number</h3><p>2.35 × 4: 235 × 4 = 940 → <b>9.40</b>.</p></div>
    <div class="note-ex"><h3>Decimal × decimal</h3><p>2.3 × 1.4: 23 × 14 = 322, 1 + 1 = 2 decimal places → <b>3.22</b>.</p></div>
    <div class="note-ex"><h3>Money</h3><p>6 pencils at $0.35: 35 × 6 = 210 → <b>$2.10</b>.</p></div>

    <h2>Common mistakes</h2>
    <ul>
      <li><b>Writing a zero at the end instead of moving the digits.</b> 0.56 × 10 is 5.6, not 0.560.</li>
      <li><b>Forgetting the decimal point.</b> 2.35 × 4 is 9.4, not 940.</li>
      <li><b>0.3 × 0.4 = 1.2?</b> No: tenths × tenths is hundredths, so it is 0.12.</li>
    </ul>`;

  G.lessonContent.d08 = {
    id: 'd08',
    title: 'Multiplying Decimals',
    screens, skillScreen, notes,
    teachSigs: screens.filter((s) => s.check).map((s) => G.engine.make('d08', s.check.t, 1, s.check.params).sig)
      .concat(['P1:3.47*10', 'P1:3.47*100', 'P1:3.47*1000', 'P2:3.47*10', 'P2:3.47*100', 'P2:3.47*1000', 'P1:0.29*100', 'P2:0.29*100', 'W1:0.4*3', 'W1:2.35*4', 'W1:1.5*4',
        'W2:4*3', 'W3:0.4*3', 'A1:3*4', 'A1:5*3', 'A2:0.3*0.4', 'A2:0.5*0.3', 'A2:2.3*1.4', 'A2:1.2*0.3', 'D1:2.3*1.4', 'D1:1.2*0.3', 'D2:2.3*1.4', 'D3:0.3*0.4',
        'K1:buy0.35*6', 'K1:buy0.25*3'])
  };
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
