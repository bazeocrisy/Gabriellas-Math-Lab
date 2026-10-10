// Decimals unit: the ten-lesson roadmap shown on the home page.
// A lesson gets Teach/Practice/Test buttons only when it is marked ready AND its content and question bank are loaded.
(function (G) {
  'use strict';
  G.unit = {
    title: 'Decimals',
    standards: 'Georgia K-12 Mathematics Standards, Grade 5 Numerical Reasoning: 5.NR.4 (with 5.NR.1.1)',
    lessons: [
      { id: 'd01', n: 1, title: 'Understanding Decimals', blurb: 'Tenths, hundredths and thousandths, decimal models, the place-value chart, and equivalent decimals like 0.5 = 0.50.', ready: true },
      { id: 'd02', n: 2, title: 'Decimal Place Value', blurb: 'The place and the value of a digit, how places relate (×10), and standard, expanded and word form.', ready: true },
      { id: 'd03', n: 3, title: 'Comparing Decimals', blurb: 'Compare decimals to thousandths with >, < and =, using place value and number lines.', ready: true },
      { id: 'd04', n: 4, title: 'Ordering Decimals', blurb: 'Put decimals in order from least to greatest and greatest to least, and solve ordering problems.', ready: true },
      { id: 'd05', n: 5, title: 'Rounding Decimals', blurb: 'Round decimals to the nearest tenth and hundredth with number lines and the rounding rule.', ready: true },
      { id: 'd06', n: 6, title: 'Adding Decimals', blurb: 'Add decimals to hundredths with models, lined-up decimal points, regrouping, estimates and word problems.', ready: true },
      { id: 'd07', n: 7, title: 'Subtracting Decimals', blurb: 'Subtract decimals to hundredths with models, regrouping, zeros, checking by adding, and word problems.', ready: true },
      { id: 'd08', n: 8, title: 'Multiplying Decimals', blurb: 'Multiply decimals by 10, 100 and 1000, by whole numbers, and tenths by tenths. Includes supplemental skills beyond the Grade 5 Georgia decimal standards.', ready: true, supplemental: true },
      { id: 'd09', n: 9, title: 'Dividing Decimals', blurb: 'Includes supplemental skills beyond the Grade 5 Georgia decimal standards.', ready: false },
      { id: 'd10', n: 10, title: 'Mixed Decimal Review', blurb: 'Cumulative application and reasoning.', ready: false }
    ],
    /** The lesson entry for an id. */
    find(id) { return this.lessons.find((l) => l.id === id); },
    /** True when a lesson can actually be used (marked ready, content and question bank loaded). */
    available(id) {
      const l = this.find(id);
      return !!(l && l.ready && G.lessonContent && G.lessonContent[id] && G.engine && G.engine.banks[id]);
    }
  };
  G.lessonContent = G.lessonContent || {};
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
