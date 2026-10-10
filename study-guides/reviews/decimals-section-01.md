# Review record: Decimals Section 1, Decimal Place Value (Phase 1)

- **Source:** `lessons/decimals/section-01-place-value.html`
- **PDF:** `pdf/decimals/Decimals-Section-1-Decimal-Place-Value.pdf`. It has 24 US Letter pages.
- **Standards:** Georgia K-12 Mathematics Standards 5.NR.4.1, 5.NR.4.2 and 5.NR.1.1, with wording checked
  against the GaDOE Grade 5 curriculum map.
- **Replaces:** the earlier Lesson 1 draft guide. The owner called it too text-heavy, with too little practice.

## Contents

The PDF has one cover page, two pages for each of the 9 skills, two review pages and three answer-key
pages (24 pages in all). It has 82 practice problems (8 per skill and 10 in the review) and 9 Let's Try
One problems.

| Skill | Show How problem | Let's Try One | Your Turn |
|---|---|---|---|
| 1.1 The Decimal Point | 4.735: whole-number part, between 4 and 5 | 12.6 | 8 |
| 1.2 Tenths, Hundredths, Thousandths | grid showing 0.34 | grid showing 0.236 | 8 (strips, grids, thousandths, shade 0.62) |
| 1.3 Naming the Place of a Digit | place of the 3 in 4.735 (chart includes tens) | 2.618 | 8 |
| 1.4 Finding the Value of a Digit | **value of the 7 in 4.735** (required example) | 2.169 | 8 |
| 1.5 Reading a Place-Value Chart | chart showing 3.05 (placeholder 0) | 0.702 | 8 (read 5, fill 3) |
| 1.6 Each Place Is 10 Times the Next | 3 tenths = 30 hundredths; two places; grouping by 10s; "how many times" | 5 hundredths → thousandths | 8 |
| 1.7 Expanded Form | 4.735 = 4 + 0.7 + 0.03 + 0.005 | 3.62 | 8 |
| 1.8 Expanded → Standard Form | 5 + 0.2 + 0.009 = 5.209 | 0.6 + 0.04 + 0.003 | 8 |
| 1.9 Equivalent Decimals | 0.5 = 0.50 (strip and grid) | 0.7 and 0.70 | 8 |
| Section 1 Review | none | none | 10 mixed |

## Automatic checks (`npm test` and `npm run build`)

- **Unit tests:** 6 tests of the answer calculators, all passing. They include the required 4.735 values.
  All arithmetic is exact, using BigInt-scaled decimals.
- **Answers:** every one of the 91 questions has an answer, either computed or written. The key is
  generated from the questions, so its numbering always matches.
- **Diagrams:** every model is drawn from its own value. For each Show How chart and model, the key's
  answer is computed from that same diagram.
- **Layout:** the build fails if anything is clipped, sticks out of its box, runs into the margins or
  footer, or if the page count is wrong.

## Mathematics and instruction review (independent reviewer)

**First pass.** The math passed: the reviewer recomputed all 91 answers, and all 15 models and every
chart were correct. The instruction failed on findings 1–3 and 5–6, which were all fixed:

| # | Finding | Fix |
|---|---|---|
| 1 | 1.6 "how many times as much" was never modeled, and the key used decimal division | Added a Show How box explaining it with place moves (1 place = 10 times; 2 places = 10 × 10). The key now explains with place moves too |
| 2 | 1.6 two-place conversions and reverse conversions were not modeled | Added Show How steps for the chain (1 tenth = 10 hundredths = 100 thousandths) and for grouping by 10s |
| 3 | The tens place was used in practice but never taught | Added a Tens column and a "1st is ones, 2nd is tens" step to the 1.3 Show How |
| 4 | Word form was missing | **Not adopted.** The GaDOE 5.NR.4.1 text names standard and expanded form only, and the owner's plan puts reading decimals in Section 2. The reviewer agreed. |
| 5–6 | Key explanations were generic, with no intermediate steps | The key now shows working: columns, squares and slices; each chart digit; when an empty place gets a 0; each blank in Let's Try One |
| 7–12 | Minor items: an accepted 0.380 answer, accepted expanded forms, plurals, a reverse place question, the "times" answer line, and 1.7 #1 being only a single digit | All fixed |

**Verification pass: PASS.** All 91 answers still match. Two minor wording items (the one-tenth
direction in 1.6, and the 1.3 Try key wording) were fixed afterwards.

## PDF layout review (lead, every page)

All 24 pages were rendered with pdf.js and inspected. Defects found and fixed:

- **Page 11:** chart cards overflowed the right margin. Charts now sit under the prompt at full card width.
- **Page 5:** card 8 had no number badge.
- **"Orange square" wording:** the zoomed square is pink. The prompts now say "pink".
- **Let's Try One pages:** half the page was empty. The work space now fills the page.
- **1.2 Try:** the decimal answer blank wrapped onto its own line.
- **Page 21:** the reflection box squeezed the review problems.
- **Duplicate blanks:** 1.6 #1–5 and Review #6 had both a blank in the sentence and an answer line.
  The extra answer lines were removed.

In the final build there is no clipped text, no overlap, no blank or unnecessary page, no split
problem, and every problem has its work space on the same page as the problem.

## Known limitations

- **Word form:** reading and writing decimals in words is left for Section 2, as planned.
- **Answer-key pages:** pages 23–24 are about half full. Each skill's key is kept together rather than
  split across pages.
