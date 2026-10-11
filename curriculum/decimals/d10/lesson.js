// D10 Mixed Decimal Review — Teach screens (a guided review of Lessons 1–7), checks, and printable notes.
(function (G) {
  'use strict';
  const M = G.models;

  const screens = [
    {
      id: 'map', title: 'What you have learned', skill: 'rvPlace',
      goal: 'how the decimal skills fit together, and how this review works.',
      body: `<p>This lesson reviews the Grade 5 decimal skills from Lessons 1–7:</p>
        <ul class="facts">
          <li><b>Place value:</b> what each digit is worth (Lessons 1–2).</li>
          <li><b>Comparing and ordering</b> (Lessons 3–4).</li>
          <li><b>Rounding</b> to tenths and hundredths (Lesson 5).</li>
          <li><b>Adding and subtracting</b> to hundredths (Lessons 6–7).</li>
        </ul>
        <p>Each screen reminds you of one skill, shows one example, and gives you one problem to try. Then you will solve <b>multi-step</b> problems that use more than one skill.</p>`
    },
    {
      id: 'place', title: 'Review: place value', skill: 'rvPlace',
      goal: 'how to find the value of a digit and write expanded form.',
      body: '<p>A digit\'s <b>value</b> depends on its <b>place</b>.</p>',
      exampleVisual: M.chart({ tens: '', ones: '4', tenths: '7', hundredths: '3', thousandths: '5' }, { tens: true, highlight: 'tenths', caption: '4.735' }),
      example: 'Worked example: 4.735',
      steps: [
        'The 7 is in the tenths place, so its value is <b>0.7</b>.',
        'Expanded form: <b>4 + 0.7 + 0.03 + 0.005</b>.',
        'Word form: <b>four and seven hundred thirty-five thousandths</b>.'
      ],
      why: 'Each place is worth 10 times the place to its right, so the same digit is worth a different amount in each place.'
    },
    {
      id: 'check-place', title: 'Try it together', kind: 'check', skill: 'rvPlace',
      check: { t: 'RP1', params: { num: '8.362', d: '6' } },
      reteach: '<p><b>Let\'s look again.</b> In 5.214, the 1 is the second digit after the point, in the hundredths place. Its value is 0.01.</p>'
    },
    {
      id: 'compare', title: 'Review: comparing and ordering', skill: 'rvCompare',
      goal: 'how to compare and order decimals.',
      body: '<p>Line up the decimal points, write zeros so every number has the same number of places, and compare from the left.</p>',
      exampleVisual: M.stack(['0.7', '0.67', '0.705'], { highlight: 'tenths' }),
      example: 'Worked example: order 0.7, 0.67 and 0.705 from least to greatest.',
      steps: [
        'With three places: 0.700, 0.670, 0.705.',
        'Tenths: 6 is least, so 0.67 comes first. Then 0.700 &lt; 0.705.',
        'Order: <b>0.67, 0.7, 0.705</b>.'
      ],
      why: 'Zeros at the end do not change a number, but they make the places line up so you compare tenths with tenths and hundredths with hundredths.'
    },
    {
      id: 'check-compare', title: 'Try it together', kind: 'check', skill: 'rvCompare',
      check: { t: 'RC2', params: { xs: ['0.6', '0.58', '0.605'] } },
      reteach: '<p><b>Let\'s look again.</b> 0.4, 0.38, 0.401 with three places: 0.400, 0.380, 0.401. Least to greatest: 0.38, 0.4, 0.401.</p>'
    },
    {
      id: 'round', title: 'Review: rounding', skill: 'rvRound',
      goal: 'how to round to the nearest tenth and hundredth.',
      body: '<p>Look at the digit just to the right of the rounding place: <b>five or more</b> rounds up, <b>four or less</b> rounds down.</p>',
      exampleVisual: M.line({ from: 6200, to: 6300, point: 6280, mid: true, labels: ['6.2', '6.3'] }),
      example: 'Worked examples',
      steps: [
        '6.28 to the nearest tenth: the hundredths digit is 8, so round up: <b>6.3</b>.',
        '5.286 to the nearest hundredth: the thousandths digit is 6, so round up: <b>5.29</b>.',
        '2.96 to the nearest tenth: rounding up the 9 regroups: <b>3.0</b>.'
      ],
      why: 'The digit to the right shows whether the number is past the halfway point between the two possible answers.'
    },
    {
      id: 'check-round', title: 'Try it together', kind: 'check', skill: 'rvRound',
      check: { t: 'RR1', params: { x: '7.46' } },
      reteach: '<p><b>Let\'s look again.</b> 3.62 to the nearest tenth: the hundredths digit is 2 (four or less), so it rounds down to 3.6.</p>'
    },
    {
      id: 'addsub', title: 'Review: adding and subtracting', skill: 'rvAddSub',
      goal: 'how to add and subtract decimals.',
      body: '<p>Line up the decimal points, write zeros to fill empty places, and regroup when you need to. Check subtraction by adding.</p>',
      exampleVisual: M.vertical(['12.5', '3.75'], '−', { answer: '8.75', pad: true }),
      example: 'Worked example: 12.5 − 3.75',
      steps: [
        'Write 12.5 as 12.50 and line up the decimal points.',
        'Hundredths: 0 &lt; 5, so take 1 tenth (5 tenths become 4): 10 − 5 = 5.',
        'Tenths: 4 &lt; 7, so take 1 one (2 ones become 1): 14 − 7 = 7. Ones: 1 &lt; 3, so take 1 ten (1 ten becomes 0): 11 − 3 = 8. Answer: 8.75.',
        'Check: 8.75 + 3.75 = 12.50 ✓'
      ],
      why: 'Lining up the decimal points makes sure you add or subtract digits that are in the same place.'
    },
    {
      id: 'check-addsub', title: 'Try it together', kind: 'check', skill: 'rvAddSub',
      check: { t: 'RA2', params: { a: '9.3', b: '4.56' } },
      reteach: '<p><b>Let\'s look again.</b> 7.2 − 3.45: write 7.20. Regroup to subtract the hundredths and tenths: 7.20 − 3.45 = 3.75. Check: 3.75 + 3.45 = 7.20.</p>'
    },
    {
      id: 'multi', title: 'Multi-step problems', skill: 'rvMulti',
      goal: 'how to solve a problem that needs more than one step.',
      body: '<p>Read the whole problem. Decide what the steps are, do them <b>one at a time</b>, and check that your answer makes sense.</p>',
      example: 'Worked example: Maya has $10. She buys a book for $3.75 and a pen for $2.40. How much money is left?',
      steps: [
        '<b>Step 1.</b> Find how much she spends: $3.75 + $2.40 = <b>$6.15</b>.',
        '<b>Step 2.</b> Find what is left: $10.00 − $6.15 = <b>$3.85</b>.',
        '<b>Check:</b> $3.85 + $6.15 = $10.00 ✓, and about $10 − $6 = $4, which is close.'
      ],
      why: 'Breaking a problem into steps means each step uses one skill you already know. Checking at the end catches mistakes in any step.'
    },
    {
      id: 'check-multi', title: 'Try it together', kind: 'check', skill: 'rvMulti',
      check: { t: 'X3', params: { m: 1, paid: '20', a: '6.85', b: '1.79' } },
      reteach: '<p><b>Let\'s look again.</b> With $5 for a $1.25 snack and a $2.30 drink: spend $1.25 + $2.30 = $3.55, then $5.00 − $3.55 = $1.45 left.</p>'
    },
    {
      id: 'tips', title: 'Test tips', kind: 'info', skill: 'rvMulti',
      goal: 'habits that help on tests like the Georgia Milestones.',
      body: `<ul class="facts">
          <li><b>Read the whole question</b> and underline what it asks for (the least? the total? what is left?).</li>
          <li><b>Line up the decimal points</b> every time you add, subtract or compare.</li>
          <li><b>Estimate first</b>, then check that your answer is close to the estimate.</li>
          <li><b>Check subtraction by adding.</b></li>
          <li><b>Watch the units</b> (dollars, meters, kilograms) in your answer.</li>
        </ul>`
    },
    {
      id: 'done', title: 'Review complete', kind: 'done',
      body: `<ul class="facts">
          <li>Place value: the 7 in 4.735 is worth 0.7.</li>
          <li>Compare and order: line up, add zeros, compare from the left.</li>
          <li>Round: five or more rounds up.</li>
          <li>Add and subtract: line up the decimal points and regroup.</li>
          <li>Multi-step: one step at a time, then check.</li>
        </ul>
        <p>You finished the decimals review! Next, practice the mixed problems, then take the review test.</p>`
    }
  ];

  const skillScreen = { rvPlace: 'place', rvCompare: 'compare', rvRound: 'round', rvAddSub: 'addsub', rvMulti: 'multi' };

  const notes = `
    <h2>Review sheet</h2>
    <p>Every decimal skill from Lessons 1–7 on one page.</p>
    <dl class="vocab">
      <dt>Place value</dt><dd>4.735 = 4 + 0.7 + 0.03 + 0.005 (four and seven hundred thirty-five thousandths).</dd>
      <dt>Compare</dt><dd>Line up the decimal points and compare from the left: 0.8 = 0.80 &gt; 0.75.</dd>
      <dt>Order</dt><dd>0.7, 0.67, 0.705 → 0.700, 0.670, 0.705 → 0.67, 0.7, 0.705.</dd>
      <dt>Round</dt><dd>The digit to the right decides: 6.28 → 6.3; 5.286 → 5.29; 2.96 → 3.0.</dd>
      <dt>Add</dt><dd>Line up the decimal points and carry: 3.48 + 2.75 = 6.23.</dd>
      <dt>Subtract</dt><dd>Line up, write zeros, regroup: 5 − 2.37 = 2.63. Check: 2.63 + 2.37 = 5.</dd>
    </dl>
    ${M.vertical(['3.48', '2.75'], '+', { answer: '6.23', carry: { 0: '1', 2: '1' } })}

    <h2>Worked examples</h2>
    <div class="note-ex"><h3>Two steps: add, then round</h3><p>4.38 + 2.47 = 6.85. Rounded to the nearest tenth: <b>6.9</b>.</p></div>
    <div class="note-ex"><h3>Two steps: money left</h3><p>$10 − ($3.75 + $2.40) = $10.00 − $6.15 = <b>$3.85</b>.</p></div>

    <h2>Test tips</h2>
    <ul>
      <li>Read the whole question. What does it ask for?</li>
      <li>Line up the decimal points.</li>
      <li>Estimate, then check that your answer is close.</li>
      <li>Check subtraction by adding.</li>
    </ul>`;

  G.lessonContent.d10 = {
    id: 'd10',
    title: 'Mixed Decimal Review',
    screens, skillScreen, notes,
    teachSigs: screens.filter((s) => s.check).map((s) => G.engine.make('d10', s.check.t, 1, s.check.params).sig)
      .concat(['X3:10:2.4+3.75', 'X3:5:1.25+2.3', 'X1:2.47+4.38'])
      // Review questions never repeat a Teach example from the lesson they come from.
      .concat(Object.entries(G.engine.banks.d10.reused).flatMap(([id, [lesson, src]]) =>
        G.lessonContent[lesson].teachSigs.filter((x) => x.startsWith(src + ':')).map((x) => id + ':' + x)))
  };
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
