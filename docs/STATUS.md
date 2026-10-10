# Project status

Updated: 2026-10-10 · Live: https://bazeocrisy.github.io/Gabriellas-Math-Lab/ · Full audit: [LESSON-1-AUDIT.md](LESSON-1-AUDIT.md)

## Confirmed
- [x] GitHub repository initialized
- [x] Product goal documented: Teach → Practice → Test
- [x] Decimal curriculum outline written, updated to the 8-lesson sequence with standard IDs ([CURRICULUM.md](CURRICULUM.md))
- [x] Grade 5 decimal standards wording checked (5.NR.1.1, 5.NR.4.1–4.4) against a secondary source that reproduces them. **Still to do:** confirm against the official GaDOE document and Milestones blueprint.
- [x] App structure: static HTML/CSS/vanilla JS, relative paths, no dependencies, no build step
- [x] **D01 Teach:** 19 screens, one idea each; worked examples revealed step by step (Next waits until the steps are shown); shade-it-yourself strip and grid; 6 guided checks with hints, coaching and a reteach example after a wrong answer; Back on every screen; printable Lesson Notes
- [x] **D01 Practice:** 10 questions per session from 34 seeded templates in 6 skills; 3 progressive hints; misconception-specific feedback; unlimited retries; worked solution offered only after 3 wrong tries; refresh-safe; new sessions avoid the last practice and last test
- [x] **D01 Test:** 10 fresh questions; no hints or feedback before submit; answers editable and refresh-safe; unanswered/unreadable answers flagged; score, percent, mastery (9 of 10), per-skill results with links back to Teach; explanations for every question; retakes are fresh
- [x] **Parent Progress:** lesson completed, Teach status, practice sessions, most recent test, skills correct / needing practice, suggested next step, test history, device-only storage notice, erase button
- [x] Math and curriculum review, student-experience review, and QA review run as three independent reviewers; all confirmed findings fixed and re-verified (see audit)
- [x] Automated tests: `npm test` 47/47 pass; `npm run test:browser` 135/135 pass (headless Chrome, 5 viewport sizes)
- [x] **Deployed and verified live (2026-10-10).**
  - PR #2 merged into `main` (merge commit `a236b32`).
  - GitHub Pages enabled from `main` / root; the Pages build of `a236b32` succeeded.
  - The full browser suite ran twice against the live URL: **135/135 pass both times**.
  - Coverage: Teach, Practice hints and answer checking, Test scoring (8/10, 9/10, 10/10), progress after refresh, navigation, layouts from 375 to 1920 px wide, no console errors, and all 16 scripts and styles loading with HTTP 200.
  - Command: `LIVE_URL=https://bazeocrisy.github.io/Gabriellas-Math-Lab/ npm run test:browser`

## Not done yet
- [ ] Test on a real iPhone/iPad (Safari). Mobile layouts were checked only with Chrome device emulation.
- [ ] Check with a real screen reader (labels and roles are in place but untested with assistive technology)
- [ ] Check the printed Lesson Notes on paper (print styles exist; only on-screen rendering was checked)
- [ ] Lessons D02–D08 (intentionally not started)

## Definition of done for each lesson
- Instruction and answer explanations mathematically audited
- Every skill has at least one teaching example and several practice/test variations
- Practice and Test remain behaviorally separate
- Progress is visible to parent without storing private student identifiers online
- Navigation verified on mobile and desktop
- No regressions to previous lessons

## Working rules for Claude
Review this file and CURRICULUM.md before editing. Make changes incrementally; document exactly what changed, tests performed, and any unresolved limitations. Do not claim live verification until the deployed site has been checked.
