# Review log: Decimals, Lesson 1 (Understanding Decimals)

Source: `lessons/decimals/lesson-01.html`, which builds the 15-page US Letter PDF.
App lesson: D01. Standards: Georgia K-12 Mathematics Standards 5.NR.4.1 and 5.NR.4.2, connecting to
5.NR.1.1. The standard wording was checked against the GaDOE Grade 5 Mathematics Curriculum Map (2023).

The lead developer built the guide and made every change. Three independent reviewers were run as
subagents. They could only read files, and they reported findings without editing anything. Each one
reviewed the build, the lead fixed what it found, and then the same reviewer checked the next build again.

## Automated checks (run on every build: `npm run build`)

- Every model is drawn from its exact value. The build fails on a bad value.
- Nothing runs into the footer (there is a 0.08in gap), past the side margins, or out of its box.
- The PDF has 15 pages, one for each page section, and the Lexend font loaded.
- Each of the 25 questions (A–H, 1–17) has exactly one answer-key entry, and each key entry matches a question.
- Wherever `data-answer` is set, the key shows that answer. Where the question has a model, the build
  checks that the model was drawn from the same value.
- Every PDF page is rendered with pdf.js to PNG so it can be inspected by eye.

## Pass 1: Mathematics curriculum review (PASS with fixes)

The reviewer recomputed all answers and checked every diagram against its number. It found no wrong
answers. These findings were fixed:

| # | Severity | Finding | Fix |
|---|---|---|---|
| 1 | Critical | p.3 said decimals are amounts "smaller than one whole" (false: 2.35) | New subtitle: decimals use place value to show parts of a whole |
| 2 | Major | "worth 10 times less"; "zeros at the end" could be read as covering 8 → 80 | "one tenth as much"; "a zero added at the end, after the decimal digits" |
| 3 | Major | Number lines were used before they were taught | New number-line panel on p.5 (0 to 1 with 0.4; 0 to 0.1 with 0.03) |
| 4 | Major | Thousandths models were taught but never practiced | New guided item H (0.236); independent Q2 is now a 0.608 grid |
| 5 | Minor | Standards claims too broad; expanded form never practiced | Cover says "introduced" where it applies; Q8b asks for expanded form |
| 6 | Minor | "Point seven" was called wrong | Reworded as a preference for saying the place name |
| 7 | Minor | Skill label differed from the app | "Equivalent decimals and zero placeholders" |
| 8 | Minor | The rule for reading decimals was in the wrong order | Whole number and "and" come first |
| 9 | Minor | The term "placeholder zero" was used but never named | Named on p.5 |
| 10 | Minor | Q15 bar gave the student nothing to do | "Cross out the 4 pieces Sam eats" |
| 11 | Minor | Weak link to fractions | p.3: "As a fraction, it is 3/10" |
| 12 | Minor | App `bank.js` says "10 times smaller" | **Not changed here**: it belongs to the app session; passed on to the owner |

## Pass 2: Educational workbook design review (PASS with fixes)

| # | Severity | Finding | Fix |
|---|---|---|---|
| 1 | Major | Q15 dark chocolate bar: pencil marks would not show | Light worksheet version of the bar (`data-light`) |
| 2 | Major | Full-bleed navy cover band: printer edge limits and heavy ink | Band moved inside the 0.5in margins, with rounded corners and a shorter height |
| 3 | Major | 134 inline styles would carry over into future lessons | Utility classes added to the design system; repeated patterns converted (85 one-offs remain) |
| 4 | Minor | Zoom captions ran past their boxes | The model drawer fits each SVG to its drawn content; the build checks SVG bounds |
| 5 | Minor | Content touched the footer | Footer moved up; a 0.08in gap is enforced |
| 6 | Minor | Shading colors looked like place-value colors | Neutral steel-blue shading; the second compared amount is hatched (also readable in grayscale) |
| 7 | Minor | Low contrast for small amber and orange text | Darker amber section color and thousandths header; opacity removed |
| 8 | Minor | Grids to shade were small | At least 1.25in |
| 9 | Minor | Answer-key pages were unbalanced | Key items 1–9 moved to p.13, 10–17 to p.14; "My fix-it notes" box added |
| 10 | Minor | Key text misaligned next to diagrams | Key rows aligned to the top |
| 11 | Minor | Convention note ran on from the question | Note moved to its own line |
| 12 | Minor | Small work boxes on Q7 and Q10 | 1in work boxes |
| 13 | Minor | No rule for handwritten notes | Rule written in the `workbook.css` header |

## Pass 3: PDF quality assurance (PASS with fixes)

All 15 pages were rendered and viewed. The PDF has 15 Letter-size pages (612×792 pt) with embedded fonts.
The answer key was recomputed, every diagram was checked, and the cover contents page numbers are correct.

| # | Severity | Defect | Fix |
|---|---|---|---|
| 1 | Minor | p.10 zoom caption crossed the 0.5in margin by 1.8pt | SVGs fitted to their content; build check added |
| 2 | Minor | Footer was inside the 0.5in bottom margin | Footer moved up to 0.5in from the bottom |
| 3 | Minor | Key 17 text misaligned | Key rows aligned to the top |
| 4 | Minor | p.9 callout touched the footer | Callout text moved to the p.8 introduction |
| 5 | Minor | Zoom captions crowded the box edges | Same fix as defect 1 |

## Verification passes

Each reviewer was sent back to check the corrected build.

- **Curriculum: PASS.** All new and changed math was recomputed. The reviewer made three small suggestions, all applied:
  - The p.6 box shows five ways, so its title now says "One number, five ways".
  - The scoring note now says 8a and 8b count as one question.
  - The p.3 subtitle now mentions wholes as well as parts.
- **Design: PASS.** All 13 findings were confirmed fixed. Follow-ups applied:
  - The last inline font sizes became classes.
  - Shaded squares got lighter inner lines so they can still be counted.
- **PDF QA: PASS, 0 defects.** The reviewer viewed all 15 pages and re-worked all 25 answers.
  - Margins: the cover is 72 px (0.5in) from every edge. Pages 2–15 are at least 86 px from the sides and 79 px from the top, and the footer is exactly 72 px from the bottom.
- **Hatching changed to vector lines.** It was a pattern, which Chrome turned into bitmap tiles: 225 images and 4.6 MB. As vector lines, the PDF is 1.5 MB.
- **Final QA of the release build: PASS, 0 defects.** All 15 pages viewed again. Every hatched grid was counted cell by cell, and all 25 answers were re-worked. 15 Letter pages, fonts embedded, 1.55 MB.

## Known limitations

- Chrome embeds the variable Lexend font as Type 3 glyphs. The text still displays, prints and can be
  searched. Using fixed-weight font files instead would avoid this, if a print shop ever asks.
- Standards are cited from the GaDOE curriculum map. Milestones blueprint weightings were not checked.
- The app's D01 lesson was still being built by another session when this guide was written. The guide
  follows its skills, words and teaching examples as of 2026-10-10.
