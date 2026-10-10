// D02 Decimal Place Value — Teach screens, guided checks, and printable Lesson Notes.
// Each skill: what you will learn, a short explanation, a real problem solved step by step, why it works, then a guided problem.
(function (G) {
  'use strict';
  const M = G.models, K = G.kit;
  const chart = (n, hi) => M.chart(K.digits5(n), { tens: K.digits5(n).tens !== '', highlight: hi });
  const pair = (a, b, capA, capB) => `<div class="model-pair"><div><p class="model-cap">${capA}</p>${a}</div><div><p class="model-cap">${capB}</p>${b}</div></div>`;
  const valueTable = `<table class="place-table"><caption class="sr-only">Place and value of each digit in 4.735</caption>
    <thead><tr><th scope="col">Digit</th><th scope="col">Place</th><th scope="col">Value</th></tr></thead>
    <tbody><tr><td>4</td><td>ones</td><td>4</td></tr><tr><td>7</td><td>tenths</td><td>0.7</td></tr>
    <tr><td>3</td><td>hundredths</td><td>0.03</td></tr><tr><td>5</td><td>thousandths</td><td>0.005</td></tr></tbody></table>`;

  const screens = [
    {
      id: 'place', title: 'Naming the places', skill: 'place2',
      goal: 'how to name the place of any digit, from tens to thousandths.',
      body: `<p>In Lesson 1 you met tenths, hundredths and thousandths. Numbers can also have <b>ones</b> and <b>tens</b> to the left of the decimal point.</p>
        <p>Every place is named by where it is compared with the <b>decimal point</b>.</p>`,
      visual: M.chart(null, { tens: true }),
      example: 'Worked example: in 52.716, what is the place of the 1?',
      exampleVisual: chart('52.716', 'hundredths'),
      steps: [
        '<b>Step 1.</b> Find the decimal point. It sits between the 2 and the 7.',
        '<b>Step 2.</b> Move right from the point, one digit at a time: the 7 is in the <b>tenths</b> place, the next digit is in the <b>hundredths</b> place.',
        '<b>Step 3.</b> That next digit is the 1, so the 1 is in the <b>hundredths</b> place.'
      ],
      why: 'Places are counted from the decimal point, not from the end of the number. The first place right of the point is always tenths, then hundredths, then thousandths. Left of the point come ones, then tens.'
    },
    {
      id: 'check-place', title: 'Try it together', kind: 'check', skill: 'place2',
      check: { t: 'N1', params: { num: '38.406', d: '6' } },
      reteach: `<p><b>Let's look again.</b> In 4.29, start at the decimal point and move right: 2 is tenths, 9 is hundredths.</p>${chart('4.29', 'hundredths')}
        <p>Do the same with 38.406: start at the point and count the places until you reach the 6. Count the 0 as a place too.</p>`
    },
    {
      id: 'value', title: 'Place and value are different', skill: 'value',
      goal: 'how to find the value of a digit.',
      body: `<p>Every digit has a <b>place</b>: <i>where</i> it is. It also has a <b>value</b>: <i>how much it is worth</i> in that place.</p>`,
      example: 'Worked example: what is the value of the 7 in 4.735?',
      exampleVisual: chart('4.735', 'tenths'),
      steps: [
        '<b>Step 1.</b> 4 is in the ones place. Its value is four ones = <b>4</b>.',
        '<b>Step 2.</b> 7 is in the tenths place. Its value is seven tenths = <b>0.7</b>.',
        '<b>Step 3.</b> 3 is in the hundredths place. Its value is three hundredths = <b>0.03</b>.',
        '<b>Step 4.</b> 5 is in the thousandths place. Its value is five thousandths = <b>0.005</b>.' + valueTable,
        '<b>Answer:</b> the value of the 7 in 4.735 is <span class="big-num">0.7</span>'
      ],
      why: 'A digit\'s value depends on its position. The same digit 7 is worth 0.7 in the tenths place but only 0.07 in the hundredths place. To write a value, put the digit in its place and fill the places before it with zeros.'
    },
    {
      id: 'check-value', title: 'Try it together', kind: 'check', skill: 'value',
      check: { t: 'V1', params: { num: '2.358', d: '5' } },
      reteach: `<p><b>Let's look again.</b> In 6.482, the 8 is the second digit after the point, so it is in the hundredths place. Its value is 8 hundredths = 0.08.</p>
        <p>Find the place of the 5 in 2.358 the same way, then write its value.</p>`
    },
    {
      id: 'relate', title: 'Each place is 10 times the next', skill: 'relate',
      goal: 'how the value of a digit changes when it moves one place.',
      body: '<p>10 thousandths make 1 hundredth. 10 hundredths make 1 tenth. 10 tenths make 1 whole. So each place is worth <b>10 times</b> the place to its right.</p>',
      example: 'Worked example: the 3 in 0.3 is how many times the value of the 3 in 0.03?',
      exampleVisual: pair(M.grid(30), M.grid(3), '0.3', '0.03'),
      steps: [
        '<b>Step 1.</b> 0.3 is 3 tenths: 3 full columns of the grid. 0.03 is 3 hundredths: 3 small squares.',
        '<b>Step 2.</b> 1 tenth = 10 hundredths, so 3 tenths = 30 hundredths (30 small squares).',
        '<b>Step 3.</b> 30 is 10 times 3. So the 3 in 0.3 is worth <b>10 times</b> as much as the 3 in 0.03.',
        'Going the other way, the 3 in 0.03 is worth <b>1/10</b> of the 3 in 0.3.'
      ],
      why: 'Every place is made of 10 of the place to its right. Moving a digit one place to the left makes it worth 10 times as much; moving it one place to the right makes it worth 1/10 as much.'
    },
    {
      id: 'check-relate', title: 'Try it together', kind: 'check', skill: 'relate',
      check: { t: 'R1', params: { d: 6, pa: 'ones', pb: 'tenths' } },
      reteach: `<p><b>Let's look again.</b> 1 whole is 10 tenths. So 6 wholes are 60 tenths, and 60 tenths is 10 times 6 tenths.</p>
        <p>The 6 in 6 is one place to the left of the 6 in 0.6. How many times as much is it worth?</p>`
    },
    {
      id: 'expanded', title: 'Expanded form', skill: 'forms',
      goal: 'how to write a decimal in expanded form.',
      body: '<p><b>Standard form</b> is the usual way to write a number, like 6.208. <b>Expanded form</b> writes it as the sum of the values of its digits.</p>',
      example: 'Worked example: write 6.208 in expanded form.',
      exampleVisual: chart('6.208'),
      steps: [
        '<b>Step 1.</b> 6 is in the ones place: <b>6</b>.',
        '<b>Step 2.</b> 2 is in the tenths place: <b>0.2</b>.',
        '<b>Step 3.</b> 0 is in the hundredths place. Its value is zero, so there is nothing to add.',
        '<b>Step 4.</b> 8 is in the thousandths place: <b>0.008</b>.',
        '<b>Answer:</b> 6.208 = <span class="big-num">6 + 0.2 + 0.008</span>'
      ],
      why: 'Each part is the value of one digit. Adding all the values gives back the original number, so expanded form shows exactly what every digit is worth.'
    },
    {
      id: 'check-expanded', title: 'Try it together', kind: 'check', skill: 'forms',
      check: { t: 'F1', params: { num: '3.406' } },
      reteach: `<p><b>Let's look again.</b> 5.17 = 5 + 0.1 + 0.07: the 1 is in the tenths place (0.1) and the 7 is in the hundredths place (0.07).</p>
        <p>For 3.406, write the value of each digit the same way. The 0 adds nothing, but it keeps the 6 in the thousandths place.</p>`
    },
    {
      id: 'standard', title: 'From expanded form back to standard form', skill: 'forms',
      goal: 'how to turn expanded form into standard form.',
      body: '<p>Each part of expanded form tells you one digit and its place. Put every digit in its place.</p>',
      example: 'Worked example: write 5 + 0.09 + 0.002 in standard form.',
      exampleVisual: chart('5.092'),
      steps: [
        '<b>Step 1.</b> 5 goes in the ones place. Write 5 and the decimal point.',
        '<b>Step 2.</b> There is no tenths part, so write <b>0</b> in the tenths place.',
        '<b>Step 3.</b> 0.09 is 9 hundredths: 9 goes in the hundredths place.',
        '<b>Step 4.</b> 0.002 is 2 thousandths: 2 goes in the thousandths place.',
        '<b>Answer:</b> <span class="big-num">5.092</span>'
      ],
      why: 'The 0 in the tenths place holds that place. Without it, you would write 5.92, and the 9 and 2 would move into the wrong places.'
    },
    {
      id: 'check-standard', title: 'Try it together', kind: 'check', skill: 'forms',
      check: { t: 'F2', params: { num: '7.046', order: 'mixed' } },
      reteach: `<p><b>Let's look again.</b> 0.003 + 2 + 0.04 sorted by place is 2 + 0.04 + 0.003. There is no tenths part, so the number is 2.043.</p>
        <p>Sort your parts by place first, then write a 0 in any empty place.</p>`
    },
    {
      id: 'word', title: 'Word form', skill: 'forms',
      goal: 'how to read and write decimals in words.',
      body: '<p><b>Word form</b> writes a number in words. The decimal point is read as "<b>and</b>".</p>',
      example: 'Worked examples',
      steps: [
        '<b>12.06:</b> read the whole number (twelve), say "and" for the point, read 06 as six, then name the place of the last digit (hundredths): <b>twelve and six hundredths</b>.',
        '<b>4.735:</b> four <b>and</b> seven hundred thirty-five <b>thousandths</b>.',
        '<b>Writing it back:</b> "nine and forty-one thousandths" ends in thousandths, so there are 3 digits after the point: <b>9.041</b>.'
      ],
      why: 'The last word names the place of the last digit, so it tells you how many digits go after the decimal point. Zeros fill any places in front.'
    },
    {
      id: 'check-word', title: 'Try it together', kind: 'check', skill: 'forms',
      check: { t: 'F4', params: { places: 2, k: 4, w: 12 } },
      reteach: '<p><b>Let\'s look again.</b> "Three and seven tenths" is 3.7: one digit after the point. "Three and seven hundredths" is 3.07: two digits after the point, so a 0 holds the tenths place.</p>'
    },
    {
      id: 'zeros', title: 'Placeholder zeros', skill: 'zeros',
      goal: 'when a zero changes a number and when it does not.',
      body: '<p>A zero is worth nothing, but it can still hold a place.</p>',
      exampleVisual: M.stack(['3.4', '3.40', '3.04'], { pad: false, labels: ['A', 'B', 'C'] }),
      example: 'Worked example: which of 3.4, 3.40 and 3.04 are equal?',
      steps: [
        '<b>Step 1.</b> 3.4 has 4 in the tenths place.',
        '<b>Step 2.</b> 3.40 also has 4 in the tenths place. The zero at the end is in the hundredths place and adds nothing. So <b>3.40 = 3.4</b>.',
        '<b>Step 3.</b> In 3.04, the zero holds the tenths place, so the 4 is in the hundredths place. 3.04 is 4 hundredths, not 4 tenths, so <b>3.04 is not equal to 3.4</b>.'
      ],
      why: 'A zero at the end of a decimal does not move any digit, so the value stays the same. A zero between the decimal point and a digit pushes that digit into a smaller place, so the value changes.'
    },
    {
      id: 'check-zeros', title: 'Try it together', kind: 'check', skill: 'zeros',
      check: { t: 'Z1', params: { d: 6, w: 2, place: 'hundredths' } },
      reteach: `<p><b>Let's look again.</b> In 5.8 the 8 is in the tenths place. In 5.08 a zero holds the tenths place, so the 8 is in the hundredths place. In 5.008 two zeros push it to the thousandths place.</p>`
    },
    {
      id: 'done', title: 'Lesson review', kind: 'done',
      body: `<ul class="facts">
          <li>The <b>place</b> is where a digit is; the <b>value</b> is what it is worth there. In 4.735, the 7 is in the tenths place and is worth 0.7.</li>
          <li>Each place is worth <b>10 times</b> the place to its right.</li>
          <li>Standard form 6.208 · expanded form 6 + 0.2 + 0.008 · word form "six and two hundred eight thousandths".</li>
          <li>A zero between the point and a digit holds a place (3.04 is not 3.4). A zero at the end changes nothing (3.40 = 3.4).</li>
        </ul>
        <p>You finished Lesson 2! Next, practice with hints, or read the Lesson Notes.</p>`
    }
  ];

  const skillScreen = { place2: 'place', value: 'value', relate: 'relate', forms: 'expanded', zeros: 'zeros' };

  const notes = `
    <h2>Vocabulary</h2>
    <dl class="vocab">
      <dt>Place</dt><dd>Where a digit is in a number: tens, ones, tenths, hundredths or thousandths.</dd>
      <dt>Value</dt><dd>How much a digit is worth because of its place. The 7 in 4.735 has a value of 0.7.</dd>
      <dt>Standard form</dt><dd>The usual way to write a number with digits: 4.735.</dd>
      <dt>Expanded form</dt><dd>A number written as the sum of the values of its digits: 4 + 0.7 + 0.03 + 0.005.</dd>
      <dt>Word form</dt><dd>A number written in words: four and seven hundred thirty-five thousandths. "And" is the decimal point.</dd>
      <dt>Placeholder zero</dt><dd>A zero that holds an empty place so the other digits stay in their places, like the 0 in 3.04.</dd>
    </dl>

    <h2>The place-value chart</h2>
    ${M.chart({ tens: '', ones: '4', tenths: '7', hundredths: '3', thousandths: '5' }, { tens: true, caption: '4.735' })}
    ${valueTable}
    <p>Each place is worth 10 times the place to its right, and 1/10 of the place to its left.</p>

    <h2>Worked examples</h2>
    <div class="note-ex">
      <h3>Value of a digit</h3>
      <p>What is the value of the 7 in 4.735? The 7 is in the tenths place, so its value is seven tenths = <b>0.7</b>.</p>
    </div>
    <div class="note-ex">
      <h3>Expanded form</h3>
      <p>6.208 = <b>6 + 0.2 + 0.008</b>. The 0 in the hundredths place adds nothing, so it is left out.</p>
      <p>5 + 0.09 + 0.002 = <b>5.092</b>. There are no tenths, so a 0 holds the tenths place.</p>
    </div>
    <div class="note-ex">
      <h3>Word form</h3>
      <p>12.06 = <b>twelve and six hundredths</b>. 9.041 = nine and forty-one thousandths.</p>
    </div>
    <div class="note-ex">
      <h3>10 times</h3>
      <p>The 3 in 0.3 is worth 10 times the 3 in 0.03. The 3 in 0.03 is worth 1/10 of the 3 in 0.3.</p>
    </div>

    <h2>How to find a digit's value</h2>
    <ol>
      <li>Find the decimal point.</li>
      <li>Count places from the point to the digit to name its place.</li>
      <li>Write the digit in that place, with zeros in the places before it. That is its value.</li>
    </ol>`;

  G.lessonContent.d02 = {
    id: 'd02',
    title: 'Decimal Place Value',
    screens, skillScreen, notes,
    teachSigs: screens.filter((s) => s.check).map((s) => G.engine.make('d02', s.check.t, 1, s.check.params).sig)
      // Worked examples on Teach screens, reteach cards and Lesson Notes.
      .concat(['N1:52.7161', 'N2:52.716hundredths', 'V1:4.7357', 'V2:4.7357', 'V3:4.7357', 'V1:6.4828', 'V2:6.4828', 'F1:6.208', 'F3:6.208',
        'F1:5.17', 'F3:5.17', 'F2:5.092', 'F2:5.092m', 'F2:2.043', 'F2:2.043m', 'F4:12.06', 'F5:12.06', 'F4:9.041', 'F5:9.041', 'F4:3.07', 'F5:3.07',
        'R1:312', 'Z3:3.4', 'Z1:58tenths', 'Z1:58hundredths', 'Z1:58thousandths'])
  };
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
