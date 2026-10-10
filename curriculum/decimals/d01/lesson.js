// D01 Understanding Decimals — Teach screens, guided checks, and printable Lesson Notes.
// One big idea per screen. Worked examples are revealed one step at a time ("steps").
(function (G) {
  'use strict';
  const M = G.models;
  const pair = (a, b, capA, capB) => `<div class="model-pair"><div><p class="model-cap">${capA}</p>${a}</div><div><p class="model-cap">${capB}</p>${b}</div></div>`;

  const screens = [
    {
      id: 'whole', title: 'What is a decimal?', skill: 'parts',
      body: `<p>Sometimes we need a number for <b>part of a whole</b>, not just whole things.</p>
        <p>Think of one chocolate bar. The whole bar is <b>1</b>.</p>`,
      visual: M.strip(10, { label: 'A whole bar, every part shaded. The whole bar is 1.' }),
      steps: [
        'If we cut the bar into <b>10 equal pieces</b> and eat <b>3</b> of them, we ate 3 out of 10 equal pieces.' + M.strip(3),
        'A <b>decimal</b> is a short way to write that amount: <span class="big-num">0.3</span>',
        'A decimal uses a <b>decimal point</b> and place value to show parts of a whole. In this lesson you will learn what each digit after the point means.'
      ]
    },
    {
      id: 'tenths', title: 'Tenths', skill: 'parts',
      body: `<p>When one whole is cut into <b>10 equal parts</b>, each part is <b>one tenth</b>.</p>
        <p>We write one tenth as <span class="big-num">0.1</span></p>`,
      visual: M.strip(1, { label: 'A bar cut into 10 equal parts with 1 part shaded: one tenth.' }),
      example: 'Worked example: what decimal names the shaded part?',
      exampleVisual: M.strip(3),
      steps: [
        '<b>Step 1.</b> Count the equal parts: there are 10. So each part is one tenth.',
        '<b>Step 2.</b> Count the shaded parts: 1, 2, 3. That is <b>3 tenths</b>.',
        '<b>Step 3.</b> Tenths go in the first place right after the decimal point. 3 tenths is written <span class="big-num">0.3</span>'
      ],
      widget: 'strip'
    },
    {
      id: 'check-tenths', title: 'Try it together', kind: 'check', skill: 'model',
      check: { t: 'M1', params: { k: 7 } },
      reteach: `<p><b>Let's look again.</b> Here is a different bar. It has 10 equal parts, so each part is one tenth (0.1).</p>
        ${M.strip(2)}<p>2 parts are shaded, so it shows 2 tenths, written 0.2. Now count the shaded parts in your bar the same way.</p>`
    },
    {
      id: 'point', title: 'The decimal point', skill: 'words',
      body: `<p>The <b>decimal point</b> separates <b>whole things</b> from <b>parts of a whole</b>.</p>
        <p>Digits to the <b>left</b> of the point are wholes. Digits to the <b>right</b> are parts.</p>`,
      example: 'Worked example: what number do these bars show? Each bar is one whole.',
      exampleVisual: pair(M.strip(10), M.strip(3), 'Bar 1', 'Bar 2'),
      steps: [
        '<b>Step 1.</b> Bar 1 is completely shaded: that is <b>1 whole</b>. The 1 goes to the left of the decimal point.',
        '<b>Step 2.</b> Bar 2 has <b>3 tenths</b> shaded. The 3 goes right after the decimal point.',
        '<b>Step 3.</b> Together: <span class="big-num">1.3</span> We read it "one <b>and</b> three tenths". The decimal point is read as "and".',
        'When there are no wholes, we write a 0 in front of the point: <b>0.3</b>. The 0 tells you there are no whole bars.'
      ]
    },
    {
      id: 'hundredths', title: 'Hundredths', skill: 'model',
      body: `<p>Now cut <b>each tenth</b> into 10 smaller equal parts. The whole is now cut into <b>100 equal squares</b>.</p>
        <p>Each square is <b>one hundredth</b>, written <span class="big-num">0.01</span></p>
        <p>One full column is 10 squares, so <b>1 column = 1 tenth = 10 hundredths</b>.</p>`,
      visual: M.grid(10, { label: 'A grid of 100 squares with one full column (10 squares) shaded: one tenth.' }),
      example: 'Worked example: what decimal names the shaded part?',
      exampleVisual: M.grid(27),
      steps: [
        '<b>Step 1.</b> Count the full columns: 2. Each column is one tenth, so that is <b>2 tenths</b>.',
        '<b>Step 2.</b> Count the extra single squares: 7. Each square is one hundredth, so that is <b>7 hundredths</b>.',
        '<b>Step 3.</b> Tenths go in the first place after the point and hundredths in the second: <span class="big-num">0.27</span> That is 27 hundredths (20 + 7 squares).'
      ],
      widget: 'grid'
    },
    {
      id: 'check-hundredths', title: 'Try it together', kind: 'check', skill: 'model',
      check: { t: 'M2', params: { k: 46 } },
      reteach: `<p><b>Let's look again.</b> In this grid, 1 full column and 3 extra squares are shaded.</p>
        ${M.grid(13)}<p>1 column = 1 tenth, and 3 squares = 3 hundredths, so it shows 0.13. Count your grid the same way: full columns first, then extra squares.</p>`
    },
    {
      id: 'thousandths', title: 'Thousandths', skill: 'model',
      body: `<p>Now cut <b>one hundredth</b> (one small square) into 10 thin equal slices. Each slice is <b>one thousandth</b>, written <span class="big-num">0.001</span></p>
        <p>A whole has 1000 thousandths. They are too small to draw all at once, so we <b>zoom in</b> on one square.</p>`,
      visual: M.grid(0, { thou: 1, label: 'A grid of 100 squares. The first square is zoomed in and cut into 10 thin slices; 1 slice is shaded: one thousandth.' }),
      example: 'Worked example: what decimal names all the shaded parts?',
      exampleVisual: M.grid(15, { thou: 3 }),
      steps: [
        '<b>Step 1.</b> Full columns: 1. That is <b>1 tenth</b>.',
        '<b>Step 2.</b> Extra single squares: 5. That is <b>5 hundredths</b>.',
        '<b>Step 3.</b> Thin slices in the zoomed square: 3. That is <b>3 thousandths</b>.',
        '<b>Step 4.</b> Tenths, hundredths, thousandths: <span class="big-num">0.153</span> We read it "one hundred fifty-three thousandths".'
      ]
    },
    {
      id: 'tenx', title: 'Ten of one place makes one of the next', skill: 'parts',
      body: `<p>Every place is made of <b>10</b> of the place to its right:</p>
        <ul class="facts">
          <li>10 thousandths = 1 hundredth</li>
          <li>10 hundredths = 1 tenth</li>
          <li>10 tenths = 1 whole</li>
        </ul>
        <p>So a digit in one place is worth <b>10 times</b> as much as the same digit one place to its right.</p>`,
      example: 'Worked example: how many hundredths are equal to 4 tenths?',
      exampleVisual: M.grid(40),
      steps: [
        '<b>Step 1.</b> One tenth is one full column of the grid, which is 10 hundredths.',
        '<b>Step 2.</b> 4 tenths is 4 full columns: 10 + 10 + 10 + 10.',
        '<b>Step 3.</b> 4 × 10 = <b>40 hundredths</b>. So 4 tenths = 40 hundredths, or 0.4 = 0.40.'
      ]
    },
    {
      id: 'check-tenx', title: 'Try it together', kind: 'check', skill: 'parts',
      check: { t: 'P3', params: { pair: 0, m: 6 } },
      reteach: `<p><b>Let's look again.</b> One tenth is one full column of a hundredths grid: 10 squares. So 2 tenths = 2 columns = 10 + 10 = 20 hundredths.</p>
        ${M.grid(20)}<p>Use the same idea for 6 tenths: how many squares are in 6 full columns?</p>`
    },
    {
      id: 'chart', title: 'The place-value chart', skill: 'place',
      body: `<p>A <b>place-value chart</b> shows what each digit is worth. After the decimal point come <b>tenths</b>, then <b>hundredths</b>, then <b>thousandths</b>.</p>`,
      visual: M.chart({ ones: '0', tenths: '6', hundredths: '2', thousandths: '7' }, { caption: 'The number 0.627 in a place-value chart' }),
      example: 'Worked example: what is each digit of 0.627 worth?',
      steps: [
        '<b>Step 1.</b> The <b>6</b> is the first digit after the point, in the tenths place. It is worth 6 tenths = <b>0.6</b>.',
        '<b>Step 2.</b> The <b>2</b> is in the hundredths place. It is worth 2 hundredths = <b>0.02</b>.',
        '<b>Step 3.</b> The <b>7</b> is in the thousandths place. It is worth 7 thousandths = <b>0.007</b>.',
        '<b>Step 4.</b> Put together: 0.6 + 0.02 + 0.007 = <span class="big-num">0.627</span> Read it "six hundred twenty-seven thousandths".'
      ]
    },
    {
      id: 'check-chart', title: 'Try it together', kind: 'check', skill: 'place',
      check: { t: 'PL3', params: { num: '0.481', pl: 2 } },
      reteach: `<p><b>Let's look again.</b> Put the number in a chart to see each digit's place.</p>
        ${M.chart({ ones: '0', tenths: '4', hundredths: '8', thousandths: '1' }, { caption: '0.481' })}
        <p>For example, the 4 is in the tenths place, so it is worth 4 tenths = 0.4. Now find the 8. Which place is it in, and what is it worth?</p>`
    },
    {
      id: 'sixvs', title: '0.6 and 0.06 are different', skill: 'place',
      body: '<p>The same digit can be worth different amounts. It depends on its <b>place</b>.</p>',
      exampleVisual: pair(M.strip(6), M.grid(6), '0.6', '0.06'),
      example: 'Worked example: compare 0.6 and 0.06.',
      steps: [
        '<b>0.6:</b> the 6 is in the <b>tenths</b> place. That is 6 tenths: 6 of the 10 parts of the bar.',
        '<b>0.06:</b> the 0 holds the tenths place, so the 6 is in the <b>hundredths</b> place. That is 6 hundredths: only 6 tiny squares of the grid.',
        '0.6 is 6 tenths = 60 hundredths, which is <b>10 times as much</b> as 0.06. Same digit, different place, different value.'
      ]
    },
    {
      id: 'zeros', title: 'Zero holds a place', skill: 'equiv',
      body: '<p>A zero between the decimal point and a digit is a <b>placeholder</b>. It keeps the other digits in their places.</p>',
      visual: `<div class="chart-stack">${M.chart({ ones: '0', tenths: '5', hundredths: '', thousandths: '' }, { caption: '0.5' })}${M.chart({ ones: '0', tenths: '0', hundredths: '5', thousandths: '' }, { caption: '0.05' })}${M.chart({ ones: '0', tenths: '0', hundredths: '0', thousandths: '5' }, { caption: '0.005' })}</div>`,
      steps: [
        '<b>0.5</b> = 5 tenths. The 5 is right after the point.',
        '<b>0.05</b> = 5 hundredths. One zero pushes the 5 one place to the right.',
        '<b>0.005</b> = 5 thousandths. Two zeros push the 5 two places to the right.',
        'If you leave out a placeholder zero, the number changes. 0.05 is <b>not</b> the same as 0.5.'
      ]
    },
    {
      id: 'equiv', title: 'Equivalent decimals', skill: 'equiv',
      body: '<p><b>Equivalent decimals</b> are decimals that name the <b>same amount</b>.</p>',
      exampleVisual: pair(M.strip(5), M.grid(50), '0.5', '0.50'),
      example: 'Worked example: is 0.5 equal to 0.50?',
      steps: [
        '<b>Step 1.</b> 0.5 is 5 tenths: 5 of the 10 parts of the bar, or 5 full columns of the grid.',
        '<b>Step 2.</b> 5 full columns are 50 small squares: 50 hundredths, written 0.50.',
        '<b>Step 3.</b> Both models show the same amount, so <span class="big-num">0.5 = 0.50</span>',
        'A zero at the <b>end</b> of a decimal does not move any digit, so it does not change the value: 0.5 = 0.50 = 0.500.'
      ]
    },
    {
      id: 'check-equiv', title: 'Try it together', kind: 'check', skill: 'equiv',
      check: { t: 'E5', params: { a: 3, show: 1 } },
      reteach: `<p><b>Let's look again.</b> Here 0.7 is the example.</p>
        ${M.chart({ ones: '0', tenths: '7', hundredths: '0', thousandths: '' }, { caption: '0.70: the 7 is still in the tenths place, so 0.70 = 0.7' })}
        ${M.chart({ ones: '0', tenths: '0', hundredths: '7', thousandths: '' }, { caption: '0.07: the 7 moved to the hundredths place, so 0.07 is not 0.7' })}
        <p>Check each choice the same way: where is the 3?</p>`
    },
    {
      id: 'careful', title: 'Watch out: 0.4 and 0.35', skill: 'compare',
      body: '<p>Some students think 0.35 is bigger than 0.4 because 35 is bigger than 4. Let\'s check with place value.</p>',
      exampleVisual: pair(M.grid(40), M.grid(35), '0.4', '0.35'),
      example: 'Worked example: which is greater, 0.4 or 0.35?',
      steps: [
        '<b>Step 1.</b> Give both the same number of decimal places: 0.4 = 0.40.',
        '<b>Step 2.</b> 0.40 is 40 hundredths. 0.35 is 35 hundredths.',
        '<b>Step 3.</b> 40 hundredths is more than 35 hundredths, so <span class="big-num">0.4 &gt; 0.35</span> The grids show it too.',
        'Or compare the tenths first: 0.4 has 4 tenths, 0.35 has only 3 tenths. More tenths means greater.'
      ]
    },
    {
      id: 'words', title: 'Reading and writing decimals', skill: 'words',
      body: '<p>To read a decimal, read the digits after the point as a whole number, then say the <b>place of the last digit</b>.</p>',
      example: 'Worked examples',
      steps: [
        '<b>0.43:</b> the digits make 43, and the last digit (3) is in the hundredths place. Read: "forty-three hundredths".',
        '<b>0.207:</b> the digits make 207, and the last digit (7) is in the thousandths place. Read: "two hundred seven thousandths".',
        '<b>2.5:</b> read the whole number, say "and" for the point, then the decimal part: "two and five tenths".',
        'Writing works backward. "Six hundredths" ends in hundredths, so it needs 2 digits after the point: <b>0.06</b>.'
      ]
    },
    {
      id: 'check-words', title: 'Try it together', kind: 'check', skill: 'words',
      check: { t: 'W1', params: { places: 2, k: 9, w: 0 } },
      reteach: `<p><b>Let's look again.</b> "Four tenths" ends in tenths, so there is 1 digit after the point: 0.4. "Four thousandths" ends in thousandths, so there are 3 digits after the point: 0.004.</p>
        <p>How many digits go after the point for hundredths? Use zeros to hold any empty places.</p>`
    },
    {
      id: 'done', title: 'Lesson review', kind: 'done',
      body: `<ul class="facts">
          <li>A decimal names part of a whole.</li>
          <li>10 equal parts are <b>tenths</b> (0.1), 100 are <b>hundredths</b> (0.01), 1000 are <b>thousandths</b> (0.001).</li>
          <li>After the decimal point: tenths, hundredths, thousandths.</li>
          <li>A zero after the point holds a place: 0.05 is not 0.5.</li>
          <li>A zero at the end does not change the value: 0.5 = 0.50.</li>
          <li>Compare place by place: 0.4 &gt; 0.35.</li>
        </ul>
        <p>You finished the lesson! Next, practice with hints, or read the Lesson Notes.</p>`
    }
  ];

  // Where to send a student who missed a skill (index into screens).
  const skillScreen = { parts: 'tenx', model: 'hundredths', place: 'chart', words: 'words', equiv: 'equiv', compare: 'careful' };

  const notes = `
    <h2>Vocabulary</h2>
    <dl class="vocab">
      <dt>Whole</dt><dd>One complete thing, like one whole chocolate bar. A whole is the number 1.</dd>
      <dt>Decimal</dt><dd>A number that uses a decimal point and place value to show parts of a whole, like 0.3 or 1.25.</dd>
      <dt>Decimal point</dt><dd>The dot that separates whole numbers (left) from parts of a whole (right). Read it as "and".</dd>
      <dt>Tenth</dt><dd>One of 10 equal parts of a whole. Written 0.1.</dd>
      <dt>Hundredth</dt><dd>One of 100 equal parts of a whole. Written 0.01. 10 hundredths = 1 tenth.</dd>
      <dt>Thousandth</dt><dd>One of 1000 equal parts of a whole. Written 0.001. 10 thousandths = 1 hundredth.</dd>
      <dt>Place value</dt><dd>The value of a digit depends on its place. The 6 in 0.6 is 6 tenths; the 6 in 0.06 is 6 hundredths.</dd>
      <dt>Equivalent decimals</dt><dd>Decimals that name the same amount, like 0.5 = 0.50 = 0.500.</dd>
    </dl>

    <h2>The place-value chart</h2>
    ${M.chart({ ones: '0', tenths: '6', hundredths: '2', thousandths: '7' }, { caption: '0.627 = 6 tenths + 2 hundredths + 7 thousandths' })}
    <p>Each place is worth 10 times the place to its right: 10 thousandths = 1 hundredth, 10 hundredths = 1 tenth, 10 tenths = 1 whole.</p>

    <h2>Worked examples</h2>
    <div class="note-ex">
      <h3>Tenths</h3>
      ${M.strip(3)}
      <p>10 equal parts, 3 shaded: 3 tenths = <b>0.3</b>.</p>
    </div>
    <div class="note-ex">
      <h3>Hundredths</h3>
      ${M.grid(27)}
      <p>2 full columns (2 tenths) and 7 extra squares (7 hundredths): <b>0.27</b>.</p>
    </div>
    <div class="note-ex">
      <h3>Thousandths</h3>
      ${M.grid(15, { thou: 3 })}
      <p>1 column (1 tenth), 5 squares (5 hundredths), 3 thin slices (3 thousandths): <b>0.153</b>.</p>
    </div>
    <div class="note-ex">
      <h3>Equivalent decimals</h3>
      <p>0.5 = 5 tenths = 50 hundredths = <b>0.50</b>. A zero at the end does not change the value.</p>
    </div>
    <div class="note-ex">
      <h3>Zero as a placeholder</h3>
      <p>0.5 is 5 tenths. 0.05 is 5 hundredths. 0.005 is 5 thousandths. The zeros hold places, so you can't leave them out.</p>
    </div>
    <div class="note-ex">
      <h3>Reading decimals</h3>
      <p>0.43 is "forty-three hundredths". 0.207 is "two hundred seven thousandths". 2.5 is "two and five tenths".</p>
    </div>

    <h2>Common mistakes</h2>
    <ul>
      <li><b>"0.35 is bigger than 0.4 because 35 &gt; 4."</b> Not true! Write 0.4 as 0.40: 40 hundredths &gt; 35 hundredths, so 0.4 &gt; 0.35.</li>
      <li><b>"A hundredth is bigger than a tenth because 100 &gt; 10."</b> Not true! More pieces means smaller pieces. 1 tenth = 10 hundredths.</li>
      <li><b>Leaving out a placeholder zero.</b> 0.05 and 0.5 are different numbers.</li>
    </ul>`;

  G.lessonContent.d01 = {
    id: 'd01',
    title: 'Understanding Decimals',
    screens, skillScreen, notes,
    // Sets used by Teach checks, so Practice and Test do not repeat them.
    teachSigs: screens.filter((s) => s.check).map((s) => G.engine.make('d01', s.check.t, 1, s.check.params).sig)
      // Worked examples on Teach screens, reteach cards and Lesson Notes.
      .concat(['M1:3', 'M1:2', 'M2:13', 'M3:4', 'M9:153', 'P3:0:4', 'P3:0:2', 'W1:0.06', 'W1:2.5', 'W1:0.4', 'W1:0.004', 'W2:0.43', 'W2:0.207', 'W4:0.43', 'W4:0.207', 'P6:1:3'])
  };
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
