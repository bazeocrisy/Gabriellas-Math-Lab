# Project status

Updated: 2026-10-10 · Live (Lessons 1–8): https://bazeocrisy.github.io/Gabriellas-Math-Lab/ · Lessons 9–10: branch `claude/decimals-d09-d10` · Lesson 1 audit: [LESSON-1-AUDIT.md](LESSON-1-AUDIT.md)

## Branch `claude/decimals-d09-d10`: Lessons 9–10, built and tested, NOT merged or deployed (awaiting approval)
- [x] **Lesson 9, Dividing Decimals: SUPPLEMENTAL** (beyond the Grade 5 Georgia standards; extends 5.NR.1.2 and 5.NR.2.2):
  - Labelled on the home card ("Extra: beyond Grade 5"), in the lesson description, on the first Teach screen, in the Notes, on the review screen and on its Parent Progress block.
  - 13 screens: 6 Teach screens and 6 guided checks, plus the review screen. Topics: ÷10/100/1000; sharing with tenths bars (up to 1.8, two stacked bars) and hundredths grids; a decimal ÷ a whole number with the decimal point lined up; answers less than 1; checking by multiplying; sharing word problems with money.
  - 12 templates in 5 skills. Divisors are whole numbers (2–9, or 10/100/1000), every quotient is exact, there is no division by a decimal, and no dividend needs zeros written onto it.
- [x] **Lesson 10, Mixed Decimal Review** (5.NR.4.1–4.4, 5.NR.1.1):
  - Reviews Lessons 1–7 only (place value, comparing and ordering, rounding, adding and subtracting). Supplemental Lessons 8–9 are not reviewed.
  - 13 screens: a map of the unit, 5 Teach screens, 5 guided checks, test tips and the review screen.
  - 19 templates in 5 skills: 15 reused, already-verified question types from Lessons 1–7 (including ordering greatest to least and exactly-halfway rounding), plus 4 new multi-step ones (add then round, add then compare, money change, subtract then read a place).
- [x] With all ten lessons available, the home page hides the empty "Coming later" section and Parent Progress says Lessons 8 and 9 are supplemental.
- [x] **Automated tests:**
  - `npm test` **208/208** pass. Every template of every lesson is checked over 500 seeds with independent answer recomputation, plus regression tests for every review below.
  - `npm run test:browser` **609/609** pass (headless Chrome). It runs Teach → Practice → Test → Notes → Parent for all ten lessons, at layouts from 375 to 1920 px.
- [x] **Independent reviews** (after the build commit):
  - Curriculum review, first pass: fixed in `348dded`. The fixes cover dividends needing written zeros, the model range, distractors, money hints, rounding in X1, the reviewed skills, the regrouping example and the notes.
  - Mathematics review, second pass: recomputed 135,000 answers with 0 mismatches. It found no critical or major issues, and its 9 minor findings are all fixed (feedback or hints that hinted at the answer, distractors, money wording, an estimate hint, the standards reference).
  - QA in a real browser: Teach, Practice (hints, feedback, equivalent answers), Test scoring 0–10 with mastery at 9, retakes, Review-in-Teach links, notes and print styles, saved progress, home and parent, all 40 lesson links for Lessons 1–10, 375 px layouts and the console. It found 1 medium defect, introduced by `348dded`: X4's wrong choices were neighbouring digits, so the answer could be guessed. It also suggested a parent label. Both are fixed.
  - The fixes were re-checked by regression tests and the full suites, not by another review round.

## Live site (main)
- **Lessons 1–4 and the new homepage are live:** https://bazeocrisy.github.io/Gabriellas-Math-Lab/
- PR #5 merged into `main` (merge commit `b61b65e`, 2026-10-10). The GitHub Pages build of `b61b65e` succeeded.
- **Verified live:** the full browser suite ran against the live URL with **297/297 pass**. It covers Teach, Practice, Test, Notes and Parent Progress for Lessons 1–4, the homepage, saved Lesson 1 progress, layouts at 375–1920 px, no console errors, and all scripts and styles loading with HTTP 200.

## Lessons 5–8: live
- **Deployed and verified live (2026-10-10).**
  - PR #7 merged into `main` (merge commit `882a1bf`); the GitHub Pages build of `882a1bf` succeeded.
  - The full browser suite ran against the live URL with **505/505 pass**. It covers every lesson from 1 to 8, the homepage and saved progress, layouts at 375–1920 px, no console errors, and all 31 scripts and styles loading with HTTP 200.
- [x] **Lesson 5, Rounding Decimals** (5.NR.4.3):
  - 14 Teach screens and 6 guided checks: what rounding is, nearest tenth with a halfway mark, the rounding rule (also to the nearest whole number), nearest hundredth, rounding up 9s (2.96 → 3.0, 4.996 → 5.00), exactly halfway, working backward.
  - 12 templates. Answers must show the rounding place (3.0, not 3).
- [x] **Lesson 6, Adding Decimals** (5.NR.4.4, to hundredths):
  - 13 Teach screens and 6 guided checks: grids, tenths bars and number-line jumps; lining up decimal points and regrouping (3.48 + 2.75); different numbers of places (2.5 + 1.37, plus the lined-up-from-the-right mistake); whole numbers and three addends; estimating; money.
  - 12 templates.
- [x] **Lesson 7, Subtracting Decimals** (5.NR.4.4, to hundredths):
  - 14 Teach screens and 6 guided checks: taking away on grids and number lines; regrouping (5.32 − 2.67 with regrouping marks); across zeros (5 − 2.37); different numbers of places (4.06 − 1.8); checking by adding; change and comparison problems.
  - 12 templates.
- [x] **Lesson 8, Multiplying Decimals: SUPPLEMENTAL** (beyond the Grade 5 Georgia standards; extends 5.NR.1.2):
  - Labelled on the home card ("Extra: beyond Grade 5"), in the lesson description, on the first Teach screen, in the Notes and on the review screen.
  - 11 Teach screens and 5 guided checks: ×10/100/1000, a decimal × a whole number, tenths × tenths with an area model, placing the decimal point, word problems.
  - 12 templates, all products within thousandths.
- [x] **New pictures:**
  - a number-line halfway mark
  - column addition and subtraction (with carry and regroup marks, and the misaligned mistake)
  - an area model
  - crossed-out grid squares
  - stacked charts up to thousands
- [x] Number answers accept a leading "$".
- [x] **Automated tests:**
  - `npm test` **168/168** pass. Every template of every lesson is checked over 500 seeds, with independent answer recomputation and regression tests for both reviews.
  - `npm run test:browser` **505/505** pass (headless Chrome). It runs Teach → Practice → Test → Notes → Parent for every lesson, at layouts from 375 to 1920 px.
- [x] **Independent reviews:**
  - Mathematics curriculum: 13 findings, 4 of them major; all fixed. It recomputed 75,000 answers with 0 mismatches.
  - QA: 3 content and accessibility defects, all fixed. It checked 144,000 generated questions, scoring in all lessons, saved progress carried over from the live version, 2,914 layout checks and keyboard access.
  - The fixes were re-checked by regression tests, not by a second review round.

## Lessons 2–4 and homepage (merged from `claude/decimals-d02-d04`)
- [x] **Homepage:** Teach blue, Practice green, Test purple (cards, buttons, mode labels, progress bars); progress chips per lesson (Teach / Practice / Test, always in words); Lesson Notes as a resource button; all ten decimal lessons listed. Lessons 1–4 have working controls; Lessons 5–10 say "Coming later" with no controls or statuses. Lessons 8–9 are marked as including supplemental skills (no Grade 5 Georgia standard covers multiplying or dividing decimals).
- [x] **Lesson 2, Decimal Place Value** (5.NR.4.1, 5.NR.1.1):
  - 15 Teach screens and 7 guided checks: places from tens to thousandths; place vs value (required example: the value of 7 in 4.735); ×10 and 1/10 between neighbouring places; expanded form both ways; word form; placeholder zeros.
  - 20 templates in 5 skills; at least 163,000 distinct questions.
- [x] **Lesson 3, Comparing Decimals** (5.NR.4.2):
  - 16 Teach screens and 7 guided checks: symbols; place by place; different numbers of digits (required example: 0.8 = 0.80 > 0.75); the "more digits" misconception; decimals in between; equal decimals; number lines; explaining why.
  - 16 templates in 5 skills; at least 166,000 distinct questions.
- [x] **Lesson 4, Ordering Decimals** (5.NR.4.2):
  - 12 Teach screens and 5 guided checks: least to greatest; the line up / zeros at the end / compare method (required example: 0.7, 0.67, 0.705 → 0.67, 0.7, 0.705); greatest to least; least and greatest; number lines; word problems.
  - 13 templates in 5 skills; at least 206,000 distinct questions.
- [x] Each new lesson has: Teach (goal, worked example step by step, "Why it works", guided check after every skill); Practice (10 questions, 3 hints, coaching, retries); Test (10 fresh questions, no help before submit, 9/10 mastery as an app benchmark); printable Lesson Notes; Parent Progress block.
- [x] **New answer types and shared code:**
  - Tap-to-order answers, keyboard friendly.
  - Typed expanded form, in either style: "4 + 0.7" or "4 × 1 + 7 × 0.1".
  - "Any decimal between" answers.
  - Number lines with several points, place-value charts with a tens column, and stacked "line up the decimal points" charts.
  - Shared bank helpers in `js/kit.js`; Lesson 1 questions verified unchanged.
- [x] **Saved progress:** Lesson 1 progress saved by the live version still appears, checked by an automated test and by the QA reviewer using real progress from the main build.
- [x] **Automated tests:** `npm test` **106/106** pass; `npm run test:browser` **297/297** pass (headless Chrome).
  - Unit tests cover every template of Lessons 2–4 over 500 seeds, with an independent answer recomputation, plus regression tests for the review findings.
  - The browser suite covers a full Teach → Practice → Test → Notes → Parent run for Lessons 2–4, and layouts at 375, 390, 768, 1366 and 1920 px.
- [x] **Independent reviews:**
  - Mathematics curriculum: 4 major and 8 minor findings, all fixed.
  - QA: 1 keyboard defect, 2 small polish items and 4 suspected issues, all fixed or addressed.
  - Fixes are covered by regression tests; there was no second review round.

## Lesson 1: confirmed (live)
- [x] GitHub repository initialized; product goal documented (Teach → Practice → Test); curriculum roadmap with standard IDs ([CURRICULUM.md](CURRICULUM.md))
- [x] Grade 5 decimal standards wording checked (5.NR.1.1, 5.NR.4.1–4.4) against a secondary source that reproduces them. **Still to do:** confirm against the official GaDOE document and Milestones blueprint.
- [x] App structure: static HTML/CSS/vanilla JS, relative paths, no dependencies, no build step
- [x] **D01 Teach:** 19 screens, one idea each; worked examples revealed step by step; shade-it-yourself strip and grid; 6 guided checks with coaching; printable Lesson Notes
- [x] **D01 Practice / Test / Parent Progress** as audited in [LESSON-1-AUDIT.md](LESSON-1-AUDIT.md)
- [x] **Deployed and verified live (2026-10-10).**
  - PR #2 merged (`a236b32`); GitHub Pages from `main` / root.
  - The full browser suite passed against the live URL (135/135 at that time).
  - Command: `LIVE_URL=https://bazeocrisy.github.io/Gabriellas-Math-Lab/ npm run test:browser`

## Not done yet
- [ ] Test on a real iPhone/iPad (Safari). Mobile layouts were checked only with Chrome device emulation.
- [ ] Check with a real screen reader. Labels, roles and keyboard focus are in place but untested with assistive technology.
- [ ] Check the printed Lesson Notes on paper. Print styles exist; only on-screen rendering was checked.
- [ ] Known limitations:
  - Answers can be worked out from the browser console.
  - Number-line "imagine placing" questions show the line without points, on purpose.
  - Expanded form does not accept fraction style (2/10).
- [ ] Merge `claude/decimals-d09-d10` and deploy Lessons 9–10: **waiting for owner approval**; re-run the live suite after deploying.

## Definition of done for each lesson
- Instruction and answer explanations mathematically audited
- Every skill has at least one teaching example and several practice/test variations
- Practice and Test remain behaviorally separate
- Progress is visible to parent without storing private student identifiers online
- Navigation verified on mobile and desktop
- No regressions to previous lessons

## Working rules for Claude
Review this file and CURRICULUM.md before editing. Make changes incrementally; document exactly what changed, tests performed, and any unresolved limitations. Do not claim live verification until the deployed site has been checked.
