// Study Guides: the eight printable decimal workbooks (existing PDFs in study-guides/pdf/decimals/), with Open,
// Download and Print, and a map from lessons and practice skills to the guide that matches them.
(function (G) {
  'use strict';
  const DIR = 'study-guides/pdf/decimals/';
  const GUIDES = [
    { n: 1, title: 'Decimal Place Value', file: 'Decimals-Section-1-Decimal-Place-Value.pdf',
      text: 'Tenths, hundredths and thousandths, the place and value of a digit, the place-value chart, and expanded form.', lessons: ['d01', 'd02'] },
    { n: 2, title: 'Reading, Writing and Comparing Decimals', file: 'Decimals-Section-2-Reading-Writing-and-Comparing-Decimals.pdf',
      text: 'Decimals in words and in standard, word and expanded form; comparing with >, < and =; number lines; ordering.', lessons: ['d03', 'd04'] },
    { n: 3, title: 'Rounding Decimals', file: 'Decimals-Section-3-Rounding-Decimals.pdf',
      text: 'Rounding on a number line, to the nearest whole number, tenth and hundredth, and rounding word problems.', lessons: ['d05'] },
    { n: 4, title: 'Adding Decimals', file: 'Decimals-Section-4-Adding-Decimals.pdf',
      text: 'Lining up the decimal points, regrouping, different numbers of places, estimating, and word problems.', lessons: ['d06'], ops: ['add'] },
    { n: 5, title: 'Subtracting Decimals', file: 'Decimals-Section-5-Subtracting-Decimals.pdf',
      text: 'Lining up, regrouping, placeholder zeros, checking by adding, and subtraction word problems.', lessons: ['d07'], ops: ['sub'] },
    { n: 6, title: 'Multiplying Decimals', file: 'Decimals-Section-6-Multiplying-Decimals.pdf',
      text: 'Multiplying by 10, 100 and 1,000, a decimal times a whole number, area models, placing the point, and estimates.', lessons: ['d08'], ops: ['mul'] },
    { n: 7, title: 'Dividing Decimals', file: 'Decimals-Section-7-Dividing-Decimals.pdf',
      text: 'Dividing by 10, 100 and 1,000, sharing equally, long division with decimals, and checking by multiplying.', lessons: ['d09'], ops: ['div'] },
    { n: 8, title: 'Mixed Decimal Practice', file: 'Decimals-Section-8-Mixed-Decimal-Practice.pdf',
      text: 'Choosing the right operation and solving mixed decimal problems, with a parent answer key.', lessons: ['d10'], ops: ['mix'] }
  ];
  GUIDES.forEach((g) => { g.url = DIR + g.file; });
  const forLesson = (id) => GUIDES.find((g) => g.lessons.includes(id)) || null;
  const forOp = (op) => GUIDES.find((g) => (g.ops || []).includes(op)) || null;
  const esc = (s) => G.models.esc(s);

  /** A short link to the matching study guide, for lesson pages and practice results. */
  function link(g, lead) {
    if (!g) return '';
    return `<p class="guide-link"><span class="guide-link-badge" aria-hidden="true">${g.n}</span><span>${lead || 'Printable study guide'}: <a href="${esc(g.url)}" target="_blank" rel="noopener">Section ${g.n}, ${esc(g.title)}<span class="sr-only"> (PDF, opens in a new tab)</span></a></span></p>`;
  }

  /** Print a PDF from a hidden frame; if the browser cannot, open it so it can be printed from its own viewer. */
  function printPdf(url, status) {
    const old = document.getElementById('pdf-print-frame');
    if (old) old.remove();
    const f = document.createElement('iframe');
    f.id = 'pdf-print-frame';
    f.className = 'print-frame';
    f.title = 'Study guide for printing';
    f.setAttribute('aria-hidden', 'true');
    f.tabIndex = -1;
    f.src = url;
    f.addEventListener('load', () => {
      try { f.contentWindow.focus(); f.contentWindow.print(); } catch (e) { window.open(url, '_blank', 'noopener'); }
    });
    document.body.appendChild(f);
    if (status) status.textContent = 'Opening the print window. If nothing appears, choose Open PDF and print from there.';
  }

  // The guides in two groups, in section order.
  const GROUPS = [{ key: 'numbers', title: 'Numbers and place value', from: 1, to: 3 }, { key: 'ops', title: 'Operations', from: 4, to: 8 }];
  const lessonNums = (g) => g.lessons.map((id) => G.unit.find(id).n);

  function card(g) {
    const ns = lessonNums(g);
    return `
        <li class="guide-card">
          <div class="guide-head"><span class="guide-num" aria-hidden="true">${g.n}</span>
            <div><p class="guide-sec">Section ${g.n} <span class="guide-ls">${ns.length > 1 ? 'Lessons ' + ns.join('–') : 'Lesson ' + ns[0]}</span></p><h3 id="guide-${g.n}">${esc(g.title)}</h3></div></div>
          <p class="guide-text">${esc(g.text)}</p>
          <p class="guide-lessons"><span>Goes with</span> ${g.lessons.map((id) => `<a class="guide-chip" href="#/${id}/teach/1">Lesson ${G.unit.find(id).n}</a>`).join(' ')}</p>
          <div class="guide-actions" role="group" aria-labelledby="guide-${g.n}">
            <a class="btn btn-guide" href="${esc(g.url)}" target="_blank" rel="noopener">Open PDF<span class="sr-only">: ${esc(g.title)} (opens in a new tab)</span></a>
            <a class="btn btn-guide-sub" href="${esc(g.url)}" download="${esc(g.file)}">Download<span class="sr-only"> ${esc(g.title)} PDF</span></a>
            <button type="button" class="btn btn-guide-sub" data-print="${esc(g.url)}">Print<span class="sr-only"> ${esc(g.title)}</span></button>
          </div>
        </li>`;
  }

  function view(app) {
    app.innerHTML = `
      <div class="crumbs"><a href="#/">← Home</a></div>
      <section class="hero hero-guides">
        <p class="section-kicker">Study Guides</p>
        <h1 tabindex="-1">Decimal study guides</h1>
        <p class="hero-sub2">Eight colorful printable workbooks that match the lessons. Open one to read on screen, download it, or print it.</p>
      </section>
      <p class="sr-only" role="status" id="guide-status"></p>
      ${GROUPS.map((gr) => `<section class="guide-group" aria-labelledby="gg-${gr.key}">
        <h2 class="guide-group-h" id="gg-${gr.key}">${gr.title} <span class="unit-count">Sections ${gr.from}–${gr.to}</span></h2>
        <ol class="guide-grid" start="${gr.from}">${GUIDES.filter((g) => g.n >= gr.from && g.n <= gr.to).map(card).join('')}
        </ol></section>`).join('')}
      <p class="fine">The guides are PDF files. Printing uses your browser's PDF viewer; on some phones and tablets, open the PDF and print or share it from there.</p>`;
    app.classList.add('page-home');
    const status = app.querySelector('#guide-status');
    app.querySelectorAll('[data-print]').forEach((b) => b.addEventListener('click', () => printPdf(b.dataset.print, status)));
    document.title = 'Study Guides · NumberNova';
  }

  G.guides = { list: GUIDES, forLesson, forOp, link, printPdf };
  G.views = G.views || {};
  G.views.guides = view;
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
