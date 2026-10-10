// D04 Ordering Decimals — Teach screens, guided checks, and printable Lesson Notes.
(function (G) {
  'use strict';
  const M = G.models;

  const screens = [
    {
      id: 'meaning', title: 'What ordering means', skill: 'ordLG',
      goal: 'what "least to greatest" and "greatest to least" mean.',
      body: `<p><b>Least to greatest</b> means the smallest number comes first and each number after it is bigger.</p>
        <p><b>Greatest to least</b> means the biggest number comes first.</p>`,
      example: 'Worked example: order 0.6, 0.2 and 0.9 from least to greatest.',
      exampleVisual: M.line({ from: 0, to: 1000, labels: ['0', '1'], points: [{ label: '0.2', v: 200 }, { label: '0.6', v: 600 }, { label: '0.9', v: 900 }] }),
      steps: [
        '<b>Step 1.</b> All three are tenths, so compare the tenths digits: 2, 6 and 9.',
        '<b>Step 2.</b> The least is 0.2, then 0.6, then 0.9.',
        '<b>Answer:</b> <span class="big-num">0.2, 0.6, 0.9</span> From greatest to least, it is the same list backward: 0.9, 0.6, 0.2.'
      ],
      why: 'Ordering is comparing again and again. Once you can tell which of two decimals is greater, you can put any list in order.'
    },
    {
      id: 'method', title: 'Line up, fill with zeros, compare', skill: 'ordLG',
      goal: 'a step-by-step method for ordering decimals with different numbers of digits.',
      body: '<p>When the decimals have different numbers of digits, line up the decimal points and write <b>zeros at the end</b> so every number has the same number of places.</p>',
      example: 'Worked example: order 0.7, 0.67 and 0.705 from least to greatest.',
      exampleVisual: M.stack(['0.7', '0.67', '0.705'], { highlight: 'tenths' }),
      steps: [
        '<b>Step 1.</b> Line up the decimal points and write zeros so each has three places: <b>0.700</b>, <b>0.670</b>, <b>0.705</b>.',
        '<b>Step 2.</b> Compare the tenths: 7, 6, 7. Six tenths is the least, so <b>0.67 comes first</b>.',
        '<b>Step 3.</b> Compare the other two, 0.700 and 0.705. Tenths: 7 and 7. Hundredths: 0 and 0. Thousandths: 0 and 5. So 0.700 &lt; 0.705.',
        '<b>Answer:</b> <span class="big-num">0.67, 0.7, 0.705</span>'
      ],
      why: 'The zeros at the end do not change any value, so 0.7 and 0.700 are the same number. Writing them makes every number the same length, and then you can compare the same places, from the biggest place to the smallest.'
    },
    {
      id: 'check-method', title: 'Try it together', kind: 'check', skill: 'ordLG',
      check: { t: 'O1', params: { xs: ['0.5', '0.45', '0.502'] } },
      reteach: `<p><b>Let's look again.</b> Order 0.3, 0.28 and 0.31. With the same number of places: 0.30, 0.28, 0.31.</p>${M.stack(['0.3', '0.28', '0.31'])}
        <p>Tenths: 3, 2, 3. So 0.28 is least. Then 0.30 &lt; 0.31. The order is 0.28, 0.3, 0.31. Use the same steps for your numbers.</p>`
    },
    {
      id: 'greatest', title: 'Greatest to least', skill: 'ordGL',
      goal: 'how to order from greatest to least.',
      body: '<p>Use the same method, but find the <b>greatest</b> number first.</p>',
      example: 'Worked example: order 2.3, 2.03 and 2.33 from greatest to least.',
      exampleVisual: M.stack(['2.3', '2.03', '2.33'], { highlight: 'tenths' }),
      steps: [
        '<b>Step 1.</b> Write each with two places: 2.30, 2.03, 2.33. The ones are all 2.',
        '<b>Step 2.</b> Tenths: 3, 0, 3. 2.03 has the fewest tenths, so it is the least and goes <b>last</b>.',
        '<b>Step 3.</b> Compare 2.30 and 2.33. Hundredths: 0 and 3, so 2.33 is greater and goes <b>first</b>.',
        '<b>Answer:</b> <span class="big-num">2.33, 2.3, 2.03</span>'
      ],
      why: 'Greatest to least is just least to greatest read backward. Finding the greatest first (or the least last) keeps you from mixing up the direction.'
    },
    {
      id: 'check-greatest', title: 'Try it together', kind: 'check', skill: 'ordGL',
      check: { t: 'O3', params: { xs: ['1.4', '1.04', '1.44'] } },
      reteach: `<p><b>Let's look again.</b> Greatest to least for 5.6, 5.06 and 5.66: with two places they are 5.60, 5.06, 5.66. 5.66 is greatest, then 5.6, then 5.06.</p>`
    },
    {
      id: 'zeros', title: 'Finding the least and the greatest', skill: 'align',
      goal: 'how writing zeros at the end helps you find the least or greatest number.',
      body: '<p>Writing every number with the same number of places turns a tricky list into an easy one.</p>',
      example: 'Worked example: which is least, 0.09, 0.1 or 0.091?',
      exampleVisual: M.stack(['0.09', '0.1', '0.091'], { highlight: 'tenths' }),
      steps: [
        '<b>Step 1.</b> Write each with three places: 0.090, 0.100, 0.091.',
        '<b>Step 2.</b> Tenths: 0, 1, 0. 0.1 has the most tenths, so it is the greatest.',
        '<b>Step 3.</b> Compare 0.090 and 0.091. They match until the thousandths: 0 and 1. So 0.090 is less.',
        '<b>Answer:</b> the least is <span class="big-num">0.09</span>',
        '<b>The same trick finds a number between two others.</b> Between 0.4 and 0.45, write them as 0.400 and 0.450. Then 0.42 (0.420) fits, because 400 &lt; 420 &lt; 450 thousandths.'
      ],
      why: '0.1 looks small because it is short, and 0.091 looks big because it is long. With the same number of places, the digits line up and the real sizes are easy to see.'
    },
    {
      id: 'check-zeros', title: 'Try it together', kind: 'check', skill: 'align',
      check: { t: 'A1', params: { xs: ['0.8', '0.78', '0.807', '0.087'], dir: 'greatest' } },
      reteach: `<p><b>Let's look again.</b> Which is greatest: 0.4, 0.39 or 0.399? With three places: 0.400, 0.390, 0.399. Tenths: 4, 3, 3. So 0.4 is the greatest.</p>`
    },
    {
      id: 'line', title: 'Ordering on a number line', skill: 'ordLine',
      goal: 'how a number line shows the order of decimals.',
      body: '<p>On a number line, the <b>least</b> number is farthest <b>left</b> and the <b>greatest</b> is farthest <b>right</b>.</p>',
      example: 'Worked example: place 0.25, 0.7 and 0.4, then order them.',
      exampleVisual: M.line({ from: 0, to: 1000, labels: ['0', '1'], tickLabels: true, points: [{ label: 'A', v: 250 }, { label: 'B', v: 400 }, { label: 'C', v: 700 }] }),
      steps: [
        '<b>Step 1.</b> 0.25 is halfway between 0.2 and 0.3 (point A).',
        '<b>Step 2.</b> 0.4 is on the 0.4 tick mark (point B), and 0.7 is on the 0.7 tick mark (point C).',
        '<b>Step 3.</b> Read the points from left to right: <span class="big-num">0.25, 0.4, 0.7</span> That is least to greatest.'
      ],
      why: 'A number line is already in order. Placing the numbers on it and reading from left to right gives least to greatest.'
    },
    {
      id: 'check-line', title: 'Try it together', kind: 'check', skill: 'ordLine',
      check: { t: 'NL2', params: { ks: [300, 650, 850], t: 1 } },
      reteach: '<p><b>Let\'s look again.</b> If the points show 0.2, 0.55 and 0.9, put the numbers in order first: 0.2, 0.55, 0.9. The leftmost point is 0.2, the middle point is 0.55 and the rightmost point is 0.9.</p>'
    },
    {
      id: 'word', title: 'Ordering in real life', skill: 'ordWord',
      goal: 'how to use ordering to solve word problems.',
      body: '<p>First decide what the question wants: the <b>least</b> number or the <b>greatest</b>. Then order the numbers.</p>',
      example: 'Worked example: in a race, the times were 12.45 s, 12.4 s and 12.504 s. Who was fastest?',
      exampleVisual: M.stack(['12.45', '12.4', '12.504'], { labels: ['Ana', 'Ben', 'Cami'] }),
      steps: [
        '<b>Step 1.</b> The fastest runner takes the <b>least</b> time.',
        '<b>Step 2.</b> Write each time with three places: 12.450, 12.400, 12.504.',
        '<b>Step 3.</b> Tens and ones are the same. Tenths: 4, 4, 5. So 12.504 is the greatest (slowest). Compare 12.450 and 12.400: hundredths 5 and 0, so 12.400 is least.',
        '<b>Answer:</b> Ben was fastest with <span class="big-num">12.4 s</span>'
      ],
      why: 'Words like "fastest", "lightest" and "shortest" mean the least number; "longest", "heaviest" and "tallest" mean the greatest. Once you know which one you need, the ordering method finds it.'
    },
    {
      id: 'check-word', title: 'Try it together', kind: 'check', skill: 'ordWord',
      check: { t: 'W3', params: { story: 1 } },
      reteach: '<p><b>Let\'s look again.</b> Jumps of 3.2 m, 3.15 m and 3.205 m: with three places they are 3.200, 3.150 and 3.205. The longest jump is the greatest number, 3.205 m.</p>'
    },
    {
      id: 'done', title: 'Lesson review', kind: 'done',
      body: `<ul class="facts">
          <li>Least to greatest: smallest first. Greatest to least: biggest first.</li>
          <li>Line up the decimal points and write zeros so all numbers have the same number of places.</li>
          <li>Compare from the left: whole numbers, then tenths, hundredths, thousandths.</li>
          <li>0.7, 0.67, 0.705 in order from least to greatest is 0.67, 0.7, 0.705.</li>
          <li>On a number line, least is on the left and greatest is on the right.</li>
        </ul>
        <p>You finished Lesson 4! Next, practice with hints, or read the Lesson Notes.</p>`
    }
  ];

  const skillScreen = { ordLG: 'method', ordGL: 'greatest', align: 'zeros', ordLine: 'line', ordWord: 'word' };

  const notes = `
    <h2>Vocabulary</h2>
    <dl class="vocab">
      <dt>Order</dt><dd>To list numbers from least to greatest, or from greatest to least.</dd>
      <dt>Least to greatest</dt><dd>The smallest number first: 0.67, 0.7, 0.705.</dd>
      <dt>Greatest to least</dt><dd>The biggest number first: 0.705, 0.7, 0.67.</dd>
      <dt>Zeros at the end</dt><dd>Zeros written at the end so numbers have the same number of places. They do not change the value: 0.7 = 0.700. (A placeholder zero is different: it holds a place inside a number, like the 0 in 3.04.)</dd>
    </dl>

    <h2>How to order decimals</h2>
    <ol>
      <li>Line up the decimal points.</li>
      <li>Write zeros at the end so every number has the same number of places.</li>
      <li>Compare from the left: whole numbers, then tenths, hundredths, thousandths.</li>
      <li>Write the numbers in the order asked for (check: least first, or greatest first?).</li>
    </ol>
    ${M.stack(['0.7', '0.67', '0.705'], { caption: '0.7, 0.67 and 0.705 lined up: 0.700, 0.670, 0.705' })}

    <h2>Worked examples</h2>
    <div class="note-ex">
      <h3>Least to greatest</h3>
      <p>0.7, 0.67, 0.705 → 0.700, 0.670, 0.705 → <b>0.67, 0.7, 0.705</b>.</p>
    </div>
    <div class="note-ex">
      <h3>Greatest to least</h3>
      <p>2.3, 2.03, 2.33 → 2.30, 2.03, 2.33 → <b>2.33, 2.3, 2.03</b>.</p>
    </div>
    <div class="note-ex">
      <h3>Word problem</h3>
      <p>Race times 12.45 s, 12.4 s, 12.504 s. Fastest = least time = <b>12.4 s</b>.</p>
    </div>

    <h2>Common mistakes</h2>
    <ul>
      <li><b>Ordering by the number of digits.</b> 0.705 is not the greatest just because it is longest; compare place by place.</li>
      <li><b>Mixing up the direction.</b> Read the question: least first or greatest first?</li>
      <li><b>"Fastest" means least time</b>, not the greatest number.</li>
    </ul>`;

  G.lessonContent.d04 = {
    id: 'd04',
    title: 'Ordering Decimals',
    screens, skillScreen, notes,
    teachSigs: (() => {
      const sets = [['0.6', '0.2', '0.9'], ['0.7', '0.67', '0.705'], ['0.3', '0.28', '0.31'], ['2.3', '2.03', '2.33'], ['5.6', '5.06', '5.66'],
        ['0.09', '0.1', '0.091'], ['0.4', '0.39', '0.399'], ['12.45', '12.4', '12.504'], ['3.2', '3.15', '3.205']];
      const sigs = screens.filter((s) => s.check).map((s) => G.engine.make('d04', s.check.t, 1, s.check.params).sig);
      for (const xs of sets) {
        const key = xs.slice().sort().join('|');
        sigs.push(`O1:${key}up`, `O3:${key}down`, `O5:${key}`, `NL1:${key}left`, `NL1:${key}right`, `A1:${key}least`, `A1:${key}greatest`);
      }
      return sigs;
    })()
  };
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
