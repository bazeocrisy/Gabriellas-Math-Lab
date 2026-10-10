// Decimals unit: the lesson list shown on the home page. Only lessons marked ready get Teach/Practice/Test buttons.
(function (G) {
  'use strict';
  G.unit = {
    title: 'Decimals',
    standards: 'Georgia K-12 Mathematics Standards, Grade 5 Numerical Reasoning: 5.NR.4 (with 5.NR.1.1)',
    lessons: [
      { id: 'd01', n: 1, title: 'Understanding Decimals', blurb: 'Tenths, hundredths and thousandths, decimal models, the place-value chart, and equivalent decimals like 0.5 = 0.50.', ready: true },
      { id: 'd02', n: 2, title: 'Decimal Place Value', blurb: 'Digit values, standard form and expanded form.', ready: false },
      { id: 'd03', n: 3, title: 'Comparing Decimals', blurb: 'Greater than, less than, equal to.', ready: false },
      { id: 'd04', n: 4, title: 'Ordering Decimals', blurb: 'Least to greatest and greatest to least.', ready: false },
      { id: 'd05', n: 5, title: 'Rounding Decimals', blurb: 'Rounding to the nearest tenth and hundredth.', ready: false },
      { id: 'd06', n: 6, title: 'Adding Decimals', blurb: 'Place value, regrouping and word problems.', ready: false },
      { id: 'd07', n: 7, title: 'Subtracting Decimals', blurb: 'Regrouping, zeros and word problems.', ready: false },
      { id: 'd08', n: 8, title: 'Mixed Decimal Problems', blurb: 'Application and reasoning.', ready: false }
    ]
  };
  G.lessonContent = G.lessonContent || {};
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
