# Project status

Updated: 2026-10-10 · Live (Lessons 1–4): https://bazeocrisy.github.io/Gabriellas-Math-Lab/ · Lesson 1 audit: [LESSON-1-AUDIT.md](LESSON-1-AUDIT.md)

## Live site (main)
- **Lessons 1–4 and the new homepage are live:** https://bazeocrisy.github.io/Gabriellas-Math-Lab/
- PR #5 merged into `main` (merge commit `b61b65e`, 2026-10-10). The GitHub Pages build of `b61b65e` succeeded.
- **Verified live:** the full browser suite ran against the live URL with **297/297 pass**. It covers Teach, Practice, Test, Notes and Parent Progress for Lessons 1–4, the homepage, saved Lesson 1 progress, layouts at 375–1920 px, no console errors, and all scripts and styles loading with HTTP 200.

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
- [ ] Lessons 5–10 (intentionally not started)

## Definition of done for each lesson
- Instruction and answer explanations mathematically audited
- Every skill has at least one teaching example and several practice/test variations
- Practice and Test remain behaviorally separate
- Progress is visible to parent without storing private student identifiers online
- Navigation verified on mobile and desktop
- No regressions to previous lessons

## Working rules for Claude
Review this file and CURRICULUM.md before editing. Make changes incrementally; document exactly what changed, tests performed, and any unresolved limitations. Do not claim live verification until the deployed site has been checked.
