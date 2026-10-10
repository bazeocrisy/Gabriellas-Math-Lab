// D05 Rounding Decimals — Teach screens, guided checks, and printable Lesson Notes.
(function (G) {
  'use strict';
  const M = G.models;

  const screens = [
    {
      id: 'what', title: 'What rounding means', skill: 'rTenth',
      goal: 'what it means to round a decimal.',
      body: '<p><b>Rounding</b> replaces a number with a simpler number that is <b>close</b> to it. We round when an exact number has more digits than we need.</p>',
      example: 'Worked example: a ribbon is 3.47 m long. About how long is it, in tenths of a meter?',
      exampleVisual: M.line({ from: 3400, to: 3500, point: 3470, labels: ['3.4', '3.5'] }),
      steps: [
        '<b>Step 1.</b> 3.47 is between two tenths: <b>3.4</b> and <b>3.5</b>.',
        '<b>Step 2.</b> On the number line, point A (3.47) is much closer to 3.5 than to 3.4.',
        '<b>Answer:</b> the ribbon is about <span class="big-num">3.5 m</span> long.'
      ],
      why: 'Rounding keeps a number close to its real size while making it easier to use. The rounded number is always the closest one with the number of places you want.'
    },
    {
      id: 'tenths', title: 'Rounding to the nearest tenth', skill: 'rTenth',
      goal: 'how to use a number line and the halfway point to round to the nearest tenth.',
      body: '<p>To round to the nearest tenth, find the two tenths the number is between. The <b>halfway point</b> between them decides.</p>',
      example: 'Worked example: round 6.24 to the nearest tenth.',
      exampleVisual: M.line({ from: 6200, to: 6300, point: 6240, mid: true, labels: ['6.2', '6.3'] }),
      steps: [
        '<b>Step 1.</b> 6.24 is between <b>6.2</b> and <b>6.3</b> (6.20 and 6.30).',
        '<b>Step 2.</b> Halfway between them is <b>6.25</b>.',
        '<b>Step 3.</b> 6.24 is less than 6.25, so it is before the halfway mark and closer to 6.2.',
        '<b>Answer:</b> 6.24 rounds to <span class="big-num">6.2</span>'
      ],
      why: 'Numbers before the halfway point are closer to the smaller tenth; numbers past it are closer to the bigger tenth. So the halfway point is the dividing line.'
    },
    {
      id: 'check-tenths', title: 'Try it together', kind: 'check', skill: 'rTenth',
      check: { t: 'T2', params: { k: 2630 } },
      reteach: `<p><b>Let's look again.</b> For 4.18: it is between 4.1 and 4.2, and halfway is 4.15. 4.18 is past halfway, so it rounds up to 4.2.</p>${M.line({ from: 4100, to: 4200, point: 4180, mid: true, labels: ['4.1', '4.2'] })}`
    },
    {
      id: 'rule', title: 'The rounding rule', skill: 'rRule',
      goal: 'a quick rule for rounding, using place value.',
      body: `<p>Look at the digit just to the <b>right</b> of the place you are rounding to:</p>
        <ul class="facts"><li><b>5, 6, 7, 8 or 9</b>: round <b>up</b> (add 1 to the rounding digit).</li><li><b>0, 1, 2, 3 or 4</b>: round <b>down</b> (keep the rounding digit).</li></ul>
        <p>Then drop the digits after the rounding place.</p>`,
      example: 'Worked examples: round 6.28 and 5.73 to the nearest tenth.',
      exampleVisual: M.chart({ ones: '6', tenths: '2', hundredths: '8', thousandths: '' }, { highlight: 'hundredths', caption: '6.28: the hundredths digit decides' }),
      steps: [
        '<b>6.28:</b> the tenths digit is 2. The digit to its right (hundredths) is <b>8</b>, which is 5 or more, so round up: <b>6.3</b>.',
        '<b>5.73:</b> the tenths digit is 7. The hundredths digit is <b>3</b>, which is 4 or less, so keep the 7: <b>5.7</b>.',
        'Notice: for 5.73 the tenths digit (7) is big, but it does not decide. Only the digit to its right decides.'
      ],
      why: 'The digit to the right tells you whether the number is past the halfway point. A 5 or more in that place means at least halfway, so the number is closer to the bigger value.'
    },
    {
      id: 'check-rule', title: 'Try it together', kind: 'check', skill: 'rRule',
      check: { t: 'R2', params: { x: '8.64' } },
      reteach: '<p><b>Let\'s look again.</b> Rounding 3.71 to the nearest tenth: the tenths digit is 7, the hundredths digit is 1. The 1 decides: it is 4 or less, so round down to 3.7.</p>'
    },
    {
      id: 'hundredths', title: 'Rounding to the nearest hundredth', skill: 'rHund',
      goal: 'how to round to the nearest hundredth.',
      body: '<p>Rounding to the nearest hundredth works the same way. Now the <b>thousandths</b> digit decides.</p>',
      example: 'Worked example: round 5.286 to the nearest hundredth.',
      exampleVisual: M.line({ from: 5280, to: 5290, point: 5286, mid: true, labels: ['5.28', '5.29'] }),
      steps: [
        '<b>Step 1.</b> 5.286 is between <b>5.28</b> and <b>5.29</b> (5.280 and 5.290). Halfway is 5.285.',
        '<b>Step 2.</b> The thousandths digit is <b>6</b>, which is 5 or more.',
        '<b>Answer:</b> round up: 5.286 rounds to <span class="big-num">5.29</span>'
      ],
      why: 'The thousandths digit shows how far the number is past 5.28. A 6 means 6 thousandths past it, which is beyond halfway (5 thousandths), so 5.29 is closer.'
    },
    {
      id: 'check-hundredths', title: 'Try it together', kind: 'check', skill: 'rHund',
      check: { t: 'H1', params: { x: '4.731' } },
      reteach: '<p><b>Let\'s look again.</b> 2.648 to the nearest hundredth: it is between 2.64 and 2.65. The thousandths digit is 8 (5 or more), so it rounds up to 2.65.</p>'
    },
    {
      id: 'nines', title: 'Rounding up a 9', skill: 'rTricky',
      goal: 'what to do when rounding up turns a 9 into 10.',
      body: '<p>Sometimes the digit you round up is a 9. Then 9 + 1 = 10, and you have to <b>regroup</b>.</p>',
      example: 'Worked example: round 2.96 to the nearest tenth.',
      exampleVisual: M.line({ from: 2900, to: 3000, point: 2960, mid: true, labels: ['2.9', '3.0'] }),
      steps: [
        '<b>Step 1.</b> The hundredths digit is 6, so round up.',
        '<b>Step 2.</b> 9 tenths + 1 tenth = 10 tenths. Ten tenths make <b>1 whole</b>.',
        '<b>Step 3.</b> So the 2 ones become 3 ones, and the tenths digit becomes 0.',
        '<b>Answer:</b> <span class="big-num">3.0</span> Writing the 0 shows the number was rounded to the nearest tenth.'
      ],
      why: 'Rounding up adds one unit of the rounding place. When that place already has 9, the 10 regroups into the next place to the left, just like carrying in addition.'
    },
    {
      id: 'check-nines', title: 'Try it together', kind: 'check', skill: 'rTricky',
      check: { t: 'K1', params: { x: '6.97', place: 'tenth' } },
      reteach: '<p><b>Let\'s look again.</b> 4.98 to the nearest tenth: the 8 means round up. 9 tenths + 1 tenth = 10 tenths = 1 whole, so the answer is 5.0 (not 4.10).</p>'
    },
    {
      id: 'halfway', title: 'Exactly halfway', skill: 'rTricky',
      goal: 'how to round a number that is exactly halfway.',
      body: '<p>A number like 3.45 is <b>exactly halfway</b> between 3.4 and 3.5. The rule says <b>5 rounds up</b>.</p>',
      example: 'Worked examples',
      exampleVisual: M.line({ from: 3400, to: 3500, point: 3450, mid: true, labels: ['3.4', '3.5'] }),
      steps: [
        '<b>3.45</b> to the nearest tenth: the hundredths digit is 5, so round up: <b>3.5</b>.',
        '<b>1.375</b> to the nearest hundredth: the thousandths digit is 5, so round up: <b>1.38</b>.',
        '<b>6.30</b> to the nearest tenth: the hundredths digit is 0, so it stays <b>6.3</b>. It was already a tenth.'
      ],
      why: 'Mathematicians agreed on one rule so everyone gets the same answer: a number exactly halfway rounds up.'
    },
    {
      id: 'check-halfway', title: 'Try it together', kind: 'check', skill: 'rTricky',
      check: { t: 'K3', params: { x: '1.25', place: 'tenth' } },
      reteach: '<p><b>Let\'s look again.</b> 7.65 to the nearest tenth is exactly halfway between 7.6 and 7.7. Halfway rounds up, so the answer is 7.7.</p>'
    },
    {
      id: 'apply', title: 'Using rounding', skill: 'rApply',
      goal: 'how rounding helps with measurements and how to work backward.',
      body: '<p>Measurements are often rounded. You can also work backward: which numbers round to a given answer?</p>',
      example: 'Worked examples',
      exampleVisual: M.line({ from: 4200, to: 4400, mid: true, labels: ['4.2', '4.4'], tickLabels: true }),
      steps: [
        '<b>A pencil is 14.68 cm long.</b> To the nearest tenth: the hundredths digit is 8, so round up: <b>14.7 cm</b>.',
        '<b>Which numbers round to 4.3?</b> Halfway below 4.3 is 4.25, and halfway above is 4.35.',
        'So every number from <b>4.25</b> up to (but not including) <b>4.35</b> rounds to 4.3. For example 4.26 and 4.34 do; 4.35 rounds to 4.4.'
      ],
      why: 'Each rounded value "owns" the numbers that are closer to it than to any other tenth: half a tenth below it and half a tenth above it.'
    },
    {
      id: 'check-apply', title: 'Try it together', kind: 'check', skill: 'rApply',
      check: { t: 'A1', params: { w: 6, t: 2 } },
      reteach: '<p><b>Let\'s look again.</b> The numbers that round to 2.8 go from 2.75 up to, but not including, 2.85. So 2.79 rounds to 2.8, but 2.85 rounds to 2.9 and 2.74 rounds to 2.7.</p>'
    },
    {
      id: 'done', title: 'Lesson review', kind: 'done',
      body: `<ul class="facts">
          <li>Rounding finds the closest number with fewer decimal places.</li>
          <li>Look at the digit just to the right of the rounding place: 5–9 round up, 0–4 round down.</li>
          <li>Nearest tenth: the hundredths digit decides (6.28 → 6.3). Nearest hundredth: the thousandths digit decides (5.286 → 5.29).</li>
          <li>Rounding up a 9 regroups: 2.96 → 3.0.</li>
          <li>Exactly halfway rounds up: 3.45 → 3.5.</li>
        </ul>
        <p>You finished Lesson 5! Next, practice with hints, or read the Lesson Notes.</p>`
    }
  ];

  const skillScreen = { rTenth: 'tenths', rHund: 'hundredths', rRule: 'rule', rTricky: 'nines', rApply: 'apply' };

  const notes = `
    <h2>Vocabulary</h2>
    <dl class="vocab">
      <dt>Round</dt><dd>To replace a number with a close, simpler number. 3.47 rounded to the nearest tenth is 3.5.</dd>
      <dt>Nearest tenth</dt><dd>The closest number with one decimal place.</dd>
      <dt>Nearest hundredth</dt><dd>The closest number with two decimal places.</dd>
      <dt>Halfway point</dt><dd>The number exactly in the middle, like 6.25 between 6.2 and 6.3.</dd>
    </dl>

    <h2>How to round</h2>
    <ol>
      <li>Find the place you are rounding to.</li>
      <li>Look at the digit just to its right.</li>
      <li>5, 6, 7, 8 or 9: add 1 to the rounding digit. 0, 1, 2, 3 or 4: keep it.</li>
      <li>Drop the digits after the rounding place. If a 9 becomes 10, regroup.</li>
    </ol>
    ${M.line({ from: 6200, to: 6300, point: 6240, mid: true, labels: ['6.2', '6.3'] })}
    <p>6.24 is before the halfway point (6.25), so it rounds to 6.2.</p>

    <h2>Worked examples</h2>
    <div class="note-ex"><h3>Nearest tenth</h3><p>6.28 → the hundredths digit is 8 → <b>6.3</b>. 5.73 → the hundredths digit is 3 → <b>5.7</b>.</p></div>
    <div class="note-ex"><h3>Nearest hundredth</h3><p>5.286 → the thousandths digit is 6 → <b>5.29</b>.</p></div>
    <div class="note-ex"><h3>Rounding up a 9</h3><p>2.96 to the nearest tenth → 9 tenths + 1 tenth = 1 whole → <b>3.0</b>.</p></div>
    <div class="note-ex"><h3>Exactly halfway</h3><p>3.45 to the nearest tenth → 5 rounds up → <b>3.5</b>.</p></div>

    <h2>Common mistakes</h2>
    <ul>
      <li><b>Looking at the wrong digit.</b> For the nearest tenth, the hundredths digit decides, not the tenths digit.</li>
      <li><b>Writing 2.10 for 2.96.</b> 9 tenths + 1 tenth is 10 tenths = 1 whole, so the answer is 3.0.</li>
      <li><b>Keeping extra digits.</b> 6.28 rounded to the nearest tenth is 6.3, not 6.30 or 6.38.</li>
    </ul>`;

  G.lessonContent.d05 = {
    id: 'd05',
    title: 'Rounding Decimals',
    screens, skillScreen, notes,
    teachSigs: screens.filter((s) => s.check).map((s) => G.engine.make('d05', s.check.t, 1, s.check.params).sig)
      .concat(['3.47', '6.24', '4.18', '6.28', '5.73', '3.71', '5.286', '2.648', '2.96', '4.98', '3.45', '1.375', '6.3', '7.65', '14.68']
        .flatMap((x) => [`T1:${x}tenth`, `H1:${x}hundredth`, `T2:line${x}`, `H2:line${x}`, `K1:K${x}tenth`, `K1:K${x}hundredth`, `K3:half${x}tenth`, `K3:half${x}hundredth`, `R2:${x}`, `A3:${x}r`, `A3:${x}w`, `K2:${x}`]),
      ['A1:4.34.26', 'A1:4.34.34', 'A1:2.82.79'])
  };
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
