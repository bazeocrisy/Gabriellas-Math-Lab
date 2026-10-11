// D09 Dividing Decimals (supplemental) — Teach screens, guided checks, and printable Lesson Notes.
(function (G) {
  'use strict';
  const M = G.models;

  const screens = [
    {
      id: 'pow', title: 'Dividing by 10, 100 and 1000', skill: 'dPow',
      goal: 'what happens to the digits when you divide by 10, 100 or 1000. (This lesson is extra: it goes beyond the Grade 5 Georgia decimal standards.)',
      body: '<p>Dividing by 10 makes every digit worth one tenth as much, so every digit moves <b>one place to the right</b>. It is the opposite of multiplying by 10.</p>',
      example: 'Worked example: 45 ÷ 10, 45 ÷ 100 and 45 ÷ 1000',
      exampleVisual: M.stack(['45', '4.5', '0.45', '0.045'], { labels: ['start', 'divided by 10', 'divided by 100', 'divided by 1000'], pad: false }),
      steps: [
        '<b>÷ 10:</b> every digit moves 1 place right: <b>4.5</b>.',
        '<b>÷ 100:</b> every digit moves 2 places right: <b>0.45</b>. Write a 0 in the ones place.',
        '<b>÷ 1000:</b> every digit moves 3 places right: <b>0.045</b>. A zero holds the tenths place.',
        'Shortcut: count the zeros in 10, 100 or 1000. That is how many places the digits move to the right.'
      ],
      why: 'Each place is worth one tenth of the place to its left. Dividing by 10 shifts every digit one place right; 100 = 10 × 10 shifts two places, and 1000 shifts three.'
    },
    {
      id: 'check-pow', title: 'Try it together', kind: 'check', skill: 'dPow',
      check: { t: 'P1', params: { x: '36', f: 100 } },
      reteach: '<p><b>Let\'s look again.</b> 52 ÷ 100: 100 has two zeros, so the digits move two places right. 52 becomes 0.52.</p>'
    },
    {
      id: 'model', title: 'Dividing is sharing', skill: 'dModel',
      goal: 'what dividing a decimal means, using models.',
      body: '<p>Dividing means sharing equally. To divide a decimal by a whole number, share its tenths (or hundredths) into equal groups.</p>',
      example: 'Worked example: 0.8 ÷ 4',
      exampleVisual: M.strip(8),
      steps: [
        '<b>Step 1.</b> 0.8 is 8 tenths.',
        '<b>Step 2.</b> Share 8 tenths into 4 equal groups: each group gets 2 tenths.',
        '<b>Answer:</b> <span class="big-num">0.8 ÷ 4 = 0.2</span>',
        'With hundredths: 0.36 ÷ 4 is 36 hundredths (36 small squares) shared into 4 groups, so 9 hundredths each = <b>0.09</b>.' + M.grid(36)
      ],
      why: 'Thinking in tenths or hundredths turns the decimal into a whole number of equal pieces, and sharing whole pieces is just whole-number division.'
    },
    {
      id: 'check-model', title: 'Try it together', kind: 'check', skill: 'dModel',
      check: { t: 'M1', params: { t: 6, n: 3 } },
      reteach: `<p><b>Let's look again.</b> 0.9 ÷ 3: 9 tenths shared into 3 groups is 3 tenths each, so 0.9 ÷ 3 = 0.3.</p>${M.strip(9)}`
    },
    {
      id: 'whole', title: 'A decimal divided by a whole number', skill: 'dWhole',
      goal: 'how to divide a decimal by a whole number, step by step.',
      body: `<p>Divide just like whole numbers. Put the decimal point in the answer <b>straight above</b> the decimal point in the number you are dividing.</p>
        <p>Words to know: in 7.5 ÷ 3 = 2.5, the number you divide (7.5) is the <b>dividend</b>, the number you divide by (3) is the <b>divisor</b>, and the answer (2.5) is the <b>quotient</b>.</p>`,
      example: 'Worked example: 7.5 ÷ 3',
      exampleVisual: M.longDiv('7.5', 3, '2.5'),
      steps: [
        '<b>Step 1.</b> Estimate: 7.5 is between 6 and 9, so 7.5 ÷ 3 is between 2 and 3.',
        '<b>Step 2.</b> Ones: 7 ÷ 3 is 2 with 1 left over (2 × 3 = 6). Write 2 above the 7, then the decimal point straight above the decimal point.',
        '<b>Step 3.</b> The 1 left over is 10 tenths. Add the 5 tenths: 15 tenths ÷ 3 = 5 tenths.',
        '<b>Answer:</b> <span class="big-num">7.5 ÷ 3 = 2.5</span> Check: 2.5 × 3 = 7.5 ✓'
      ],
      why: 'A leftover one is the same as ten tenths, so it can still be shared. Keeping the decimal point lined up makes sure every digit of the answer is in the right place.'
    },
    {
      id: 'check-whole', title: 'Try it together', kind: 'check', skill: 'dWhole',
      check: { t: 'W1', params: { a: '9.6', n: 4 } },
      reteach: '<p><b>Let\'s look again.</b> 8.4 ÷ 4: ones 8 ÷ 4 = 2; tenths 4 ÷ 4 = 1. The answer is 2.1. Check: 2.1 × 4 = 8.4.</p>'
    },
    {
      id: 'hundredths', title: 'Dividing hundredths', skill: 'dWhole',
      goal: 'how to divide a number with hundredths, and how to use a division fact you already know.',
      body: '<p>The same steps work for hundredths: divide one place at a time, from left to right, and keep the decimal point straight above.</p>',
      example: 'Worked example: 8.52 ÷ 4',
      exampleVisual: M.longDiv('8.52', 4, '2.13'),
      steps: [
        '<b>Step 1.</b> Estimate: 8.52 ÷ 4 is about 8 ÷ 4 = 2.',
        '<b>Step 2.</b> Ones: 8 ÷ 4 = 2. Write 2 above the 8 and the decimal point straight above the decimal point.',
        '<b>Step 3.</b> Tenths: 5 ÷ 4 is 1 with 1 left over. Write 1 in the tenths place. The 1 tenth left over is 10 hundredths.',
        '<b>Step 4.</b> Hundredths: 10 + 2 = 12 hundredths. 12 ÷ 4 = 3. Write 3 in the hundredths place.',
        '<b>Answer:</b> <span class="big-num">8.52 ÷ 4 = 2.13</span> Check: 2.13 × 4 = 8.52 ✓',
        '<b>Using a fact you know:</b> if you know 852 ÷ 4 = 213, then 8.52 ÷ 4 has the same digits, 2, 1, 3. The decimal point goes straight above the one in 8.52, so the answer is 2.13. The estimate (about 2) agrees.'
      ],
      why: 'A leftover tenth is 10 hundredths, so it can still be shared. 8.52 is 852 hundredths, so 8.52 ÷ 4 is 852 ÷ 4 = 213 hundredths, which is 2.13.'
    },
    {
      id: 'check-hundredths', title: 'Try it together', kind: 'check', skill: 'dWhole',
      check: { t: 'W3', params: { a: '31.32', n: 9 } },
      reteach: '<p><b>Let\'s look again.</b> 1248 ÷ 4 = 312, so 12.48 ÷ 4 has the digits 3, 1, 2. 12.48 ÷ 4 is about 12 ÷ 4 = 3, so the answer is 3.12. Check: 3.12 × 4 = 12.48.</p>'
    },
    {
      id: 'small', title: 'When the answer is less than 1', skill: 'dWhole',
      goal: 'how to divide when the number is smaller than the divisor.',
      body: '<p>If the number you divide is smaller than the number you divide by, the answer is less than 1. It starts with 0.</p>',
      example: 'Worked example: 2.4 ÷ 8',
      steps: [
        '<b>Step 1.</b> 2.4 is less than 8, so the answer is less than 1: write 0 and the decimal point.',
        '<b>Step 2.</b> Think of 2.4 as 24 tenths. 24 tenths ÷ 8 = 3 tenths.',
        '<b>Answer:</b> <span class="big-num">2.4 ÷ 8 = 0.3</span> Check: 0.3 × 8 = 2.4 ✓'
      ],
      why: 'Writing the number in tenths (or hundredths) gives a whole number of pieces to share. The answer is that many tenths (or hundredths).'
    },
    {
      id: 'check-small', title: 'Try it together', kind: 'check', skill: 'dWhole',
      check: { t: 'W2', params: { a: '0.56', n: 7 } },
      reteach: '<p><b>Let\'s look again.</b> 0.35 ÷ 5: 35 hundredths ÷ 5 = 7 hundredths = 0.07. The 0 holds the tenths place.</p>'
    },
    {
      id: 'check-by', title: 'Check by multiplying', skill: 'dCheck',
      goal: 'how to check a division answer.',
      body: '<p>Multiplication undoes division. Multiply your answer by the number you divided by. You should get the number you started with.</p>',
      example: 'Worked example: is 8.4 ÷ 4 = 2.1 right?',
      steps: [
        '<b>Step 1.</b> Multiply the answer by the divisor: 2.1 × 4.',
        '<b>Step 2.</b> 21 × 4 = 84, so 2.1 × 4 = 8.4.',
        '<b>Step 3.</b> 8.4 is the starting number, so the answer is right. ✓'
      ],
      why: 'If 4 equal groups of 2.1 make 8.4, then sharing 8.4 into 4 groups gives 2.1 in each.'
    },
    {
      id: 'check-check', title: 'Try it together', kind: 'check', skill: 'dCheck',
      check: { t: 'C1', params: { a: '6.3', n: 3 } },
      reteach: '<p><b>Let\'s look again.</b> To check 9.6 ÷ 3 = 3.2, multiply 3.2 × 3 = 9.6. It matches the starting number, so it is right.</p>'
    },
    {
      id: 'word', title: 'Division word problems', skill: 'dWord',
      goal: 'how to solve word problems that need dividing decimals.',
      body: '<p>Words like <b>share equally</b>, <b>split</b>, and <b>cut into equal pieces</b> tell you to divide.</p>',
      example: 'Worked example: 3 friends share $7.50 equally. How much does each get?',
      steps: [
        '<b>Step 1.</b> Share equally means divide: $7.50 ÷ 3.',
        '<b>Step 2.</b> 7 ÷ 3 is 2 with 1 left over; that 1 is 10 tenths, and 10 + 5 = 15 tenths ÷ 3 = 5 tenths; 0 hundredths ÷ 3 = 0.',
        '<b>Answer:</b> <span class="big-num">$2.50</span> each. Check: $2.50 × 3 = $7.50 ✓'
      ],
      why: 'Sharing a total equally into groups is exactly what division means, so the amount in each group is total ÷ number of groups.'
    },
    {
      id: 'check-word', title: 'Try it together', kind: 'check', skill: 'dWord',
      check: { t: 'K2', params: { a: '4.2', n: 6 } },
      reteach: '<p><b>Let\'s look again.</b> A 3.5 m rope cut into 5 equal pieces: 3.5 ÷ 5 = 35 tenths ÷ 5 = 7 tenths = 0.7 m each.</p>'
    },
    {
      id: 'done', title: 'Lesson review', kind: 'done',
      body: `<ul class="facts">
          <li>÷ 10, ÷ 100, ÷ 1000 move every digit 1, 2 or 3 places to the right: 45 ÷ 100 = 0.45.</li>
          <li>Dividing is sharing equally: 0.8 ÷ 4 = 0.2.</li>
          <li>Divide like whole numbers and keep the decimal point straight above: 7.5 ÷ 3 = 2.5 and 8.52 ÷ 4 = 2.13.</li>
          <li>The dividend is the number you divide, the divisor is the number you divide by, and the quotient is the answer.</li>
          <li>Check by multiplying: 2.5 × 3 = 7.5.</li>
        </ul>
        <p>You finished Lesson 9! This lesson was extra practice beyond the Grade 5 standards. Next, practice with hints, or read the Lesson Notes.</p>`
    }
  ];

  const skillScreen = { dPow: 'pow', dModel: 'model', dWhole: 'whole', dCheck: 'check-by', dWord: 'word' };

  const notes = `
    <p class="fine"><b>Supplemental lesson:</b> Georgia's Grade 5 standards do not require dividing decimals. This lesson extends 5.NR.1.2 (dividing by powers of 10) and 5.NR.2.2 (whole-number division) for students who are ready.</p>
    <h2>Vocabulary</h2>
    <dl class="vocab">
      <dt>Quotient</dt><dd>The answer to a division problem. In 7.5 ÷ 3 = 2.5, the quotient is 2.5.</dd>
      <dt>Divisor</dt><dd>The number you divide by. In 7.5 ÷ 3, the divisor is 3.</dd>
      <dt>Dividend</dt><dd>The number being divided. In 7.5 ÷ 3, the dividend is 7.5.</dd>
    </dl>

    <h2>Rules to remember</h2>
    <ol>
      <li>÷ 10, ÷ 100, ÷ 1000: move every digit 1, 2 or 3 places to the right.</li>
      <li>Otherwise, divide like whole numbers and put the decimal point straight above the one in the dividend.</li>
      <li>If the dividend is smaller than the divisor, the answer starts with 0.</li>
      <li>Check: quotient × divisor = dividend.</li>
    </ol>

    <h2>Worked examples</h2>
    <div class="note-ex"><h3>Powers of 10</h3><p>45 ÷ 10 = 4.5 · 45 ÷ 100 = 0.45 · 45 ÷ 1000 = 0.045.</p></div>
    <div class="note-ex"><h3>Sharing</h3><p>0.8 ÷ 4 = 8 tenths ÷ 4 = <b>0.2</b>.</p></div>
    <div class="note-ex"><h3>Step by step</h3><p>7.5 ÷ 3: 7 ÷ 3 = 2 r 1; 15 tenths ÷ 3 = 5 tenths → <b>2.5</b>. Check: 2.5 × 3 = 7.5.</p></div>
    <div class="note-ex"><h3>Money</h3><p>$7.50 shared by 3 friends = <b>$2.50</b> each.</p></div>

    <h2>Common mistakes</h2>
    <ul>
      <li><b>Moving the digits the wrong way.</b> Dividing makes a number smaller: the digits move right.</li>
      <li><b>Losing the decimal point.</b> 7.5 ÷ 3 is 2.5, not 25.</li>
      <li><b>Forgetting the 0.</b> 2.4 ÷ 8 is 0.3.</li>
    </ul>`;

  G.lessonContent.d09 = {
    id: 'd09',
    title: 'Dividing Decimals',
    screens, skillScreen, notes,
    teachSigs: screens.filter((s) => s.check).map((s) => G.engine.make('d09', s.check.t, 1, s.check.params).sig)
      .concat(['P1:45/10', 'P1:45/100', 'P1:45/1000', 'P2:45/10', 'P2:45/100', 'P2:45/1000', 'P1:52/100', 'M1:8/4', 'M1:9/3', 'M2:36/4', 'W1:7.5/3', 'W1:8.4/4', 'W2:z2.4/8', 'W2:z0.35/5',
        'C1:8.4/4', 'C1:9.6/3', 'K1:share7.5/3', 'K2:cut3.5/5',
        'W1:8.52/4', 'W3:8.52/4', 'W1:31.32/9', 'W3:12.48/4', 'W1:12.48/4'])
  };
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
