# Lesson 1 Audit — Understanding Decimals (D01)

Date: 2026-10-10 · Branch: `claude/decimals-d01`

**Starting point.** When the audit was requested, the repository held only planning documents (README, CURRICULUM, STATUS, the D01 brief). Lesson 1 had not been built, so it was built first to the brief and then audited. Three independent reviewers did the audit: Mathematics and Curriculum, Student Experience, and Quality Assurance. They only read and tested; they did not edit files. The lead developer fixed what they found, and each reviewer then re-checked its own findings against the fixed code. Lesson 2 was not started.

## 1. Features implemented

| Area | What exists | Where |
|---|---|---|
| Home | "Gabriella's Math Lab / Grade 5 Mathematics / Georgia Milestones Preparation"; Lesson 1 card with **TEACH · PRACTICE · TEST** and Lesson Notes link; Lessons 2–8 listed as "Coming later" with no buttons | `js/app.js` |
| Teach | 19 screens with one idea each: what a decimal is, tenths, decimal point, hundredths, thousandths (zoom model), ten-to-one relationships, place-value chart, 0.6 vs 0.06, zero placeholders, equivalent decimals, 0.4 vs 0.35, reading and writing decimals, review. Worked examples are revealed one step at a time, and Next waits until all steps are shown. Two screens have an optional "shade a model" tool. There are 6 guided "Try it together" checks: hints, specific feedback, a reteach example with different numbers after a wrong answer, and Next unlocks only after a correct answer or a shown solution. Back works on every screen; revealed steps survive a refresh. | `curriculum/decimals/d01/lesson.js`, `js/teach.js` |
| Lesson Notes | Vocabulary, place-value chart, worked examples with models, common mistakes; print button and print styles | `lesson.js`, `js/app.js` |
| Practice | 10 questions per session, balanced by skill (parts 1, models 3, place value 2, reading/writing 1, equivalence 2, comparing 1), drawn from **34 templates**. Question types: typed decimal, multiple choice, choose-the-model, shade-the-model, place-value chart entry, number lines, a word problem and a reasoning item. 3 progressive hints per question, misconception-specific feedback, a reminder card, and unlimited retries. "Show me how to solve it" appears only after 3 wrong tries. Each correct answer gets a short "why". Results summary at the end; new sessions avoid the last practice and the last test. | `curriculum/decimals/d01/bank.js`, `js/coach.js`, `js/practice.js` |
| Test | 10 fresh questions with no hints, no feedback and no answers in the page before submit. Two-choice question types are excluded. Previous/Next and a question-number strip; answers are editable and survive a refresh. Unreadable input (like "0,5") gets a note and counts as unanswered. A review screen confirms before submitting with blanks. Results show raw score and percent, mastery (at least 9 of 10), a per-skill table with "Review in Teach" links, and every question with your answer, the correct answer and an explanation. Retakes are fresh. | `js/test.js`, `js/scoring.js` |
| Parent Progress | Lesson completed (mastered), Teach status, practice sessions, most recent test, tests taken, skills correct and skills needing practice on the latest test, practice details, test history, suggested next step. A notice says progress stays in this browser only. Erase button with confirmation. | `js/app.js`, `js/storage.js` |
| Math engine | Exact decimal arithmetic on digit strings (no floating point); number names; SVG models drawn from the exact numbers | `js/decimal.js`, `js/words.js`, `js/models.js`, `js/engine.js` |

## 2. Mathematical accuracy results

**Method.** Automated tests generate every template for 600 seeds. They check that:
- the correct answer is accepted and equivalent forms are accepted (0.4 = 0.40 = .4);
- a required number of decimal places is enforced where a question asks for it;
- no multiple-choice question has two choices with the same value;
- pictures match the numbers: shaded cells are counted in the SVG, number-line point positions and labels are checked, and chart digits are read back;
- comparisons and equal/not-equal answers are recomputed independently;
- number words are re-derived;
- no hint contains the answer and no hint merely repeats the question;
- wrong answers get feedback that does not state the answer.

The math reviewer separately generated every template for 3000 seeds and probed typical mistakes: ×10, ÷10, a dropped zero, a whole number, swapped digits.

**Verified correct:**
- **Models.** The grid fills one column (one tenth) at a time. `grid(27)` shows 2 columns and 7 squares; the 0.153 zoom model shows 1 column, 5 squares and 3 of 10 slices. Number lines have 10 equal jumps with exact point positions. The place-value chart reads Ones . Tenths Hundredths Thousandths.
- **Teach and Notes.** Every number on the Teach screens and in the Lesson Notes matches its picture.
- **Number words.** "forty-three hundredths", "two hundred seven thousandths", "three and four hundredths" are all correct.
- **Answer keys.** All answer formulas are correct.

**Findings and fixes:** see sections 7 and 8.

## 3. Teaching effectiveness findings
- **What a decimal means:** yes. The chocolate-bar whole leads to tenths, then hundredths, then thousandths, with a model at each step.
- **How and why, not just definitions:** each concept screen has a worked example revealed step by step (count parts, name the unit, place the digit), plus why-explanations after answers.
- **Logical order:** the whole, tenths, the decimal point, hundredths, thousandths, ten-to-one relationships, the chart, digit value (0.6 vs 0.06), zeros, equivalence, the 0.4/0.35 misconception, reading and writing, review.
- **Moving backward:** Back is on every screen; "← Lesson menu" is on every page.
- **Guided questions:** 6 checks. A wrong answer gets specific feedback plus a reteach example with different numbers, and the student must answer correctly (or see the worked solution) to continue.
- **Without adult help:** the student-experience reviewer judged the text short and readable. Fixes made: some screens were overloaded (the shade-it tool is now folded away), side-by-side wholes were different sizes, and the reminder card was confusing (now folded behind "Show me a reminder").

## 4. Practice and hint verification
- **Variety:** every set has 10 questions with no repeats; sessions differ from the last practice and the last test (tested over 300 seeded sets, and in the browser).
- **Hints:** exactly 3, shown one at a time in order, capped at 3, and they survive a refresh. Hint 1 names the concept, Hint 2 gives the first step, Hint 3 gives the method and leaves the final step to the student. Automated checks confirm no hint contains the answer for typed and numeric multiple-choice questions. The math reviewer read hints across all templates; the one variant that gave the answer away (C2 "0.6 ? 0.60") was rewritten.
- **Wrong answers:** the student is told the answer is not correct, gets a specific explanation (for example "You counted the full columns. Now add the extra single squares."), a reminder card, and an invitation to try again. A wrong answer never advances the question, and blank or unreadable input is not counted as an attempt.
- **Correct answers:** a short "why" is shown.

## 5. Test scoring verification
- Exactly 10 questions every time; no hint, feedback, "why" text, or answer text or attributes in the page before submit. The browser test checks every question screen; QA also checked 5 full runs.
- **Scoring:**
  - Every score from 0 to 10 was checked over 40 sets (440 cases), including percent, mastery (9 and 10 count, 8 does not) and missed skills.
  - QA compared 3000 random answer patterns against its own independent calculation and found 0 mismatches.
  - In the browser, an 8/10 test (one wrong, one blank) scored 80% and not mastered; a 10/10 test scored 100% and mastered; a 9/10 test scored 90% and mastered.
- **Edge cases:** blank answers count as incorrect and trigger a confirmation; typing equivalent decimals (0.40 for 0.4) scores correct; unreadable input is flagged as not answered; repeated submit clicks record one result; results survive a refresh.
- **Review links:** "Review in Teach" goes to the screen for that skill.
- **Retakes:** no question repeats from the previous test, the current or last practice, or Teach examples.

## 6. Mobile and desktop findings
Tested with headless Chrome at 375×667 (iPhone SE), 390×844 (iPhone 14), 768×1024 (tablet), 1366×768 (laptop) and 1920×1080 (desktop). Pages tested: home, Teach screens, Practice, Test and results, Notes and Parent.
- No horizontal scrolling on any tested page.
- Every button and link is at least 44 px tall at phone and tablet sizes.
- The content column is capped at 760 px on desktop.
- Right and wrong are shown with ✓/✗ and words, not color alone; answered test questions are underlined as well as tinted.

Fixed during the audit:
- Gridlines between shaded squares were nearly invisible.
- Place-value headings broke mid-word ("Thousandth/s").
- Back wrapped onto two lines on guided-check screens.
- Folded sections had no arrow.

**Not done:** real iPhone/iPad Safari, real screen reader, paper printout.

## 7. Problems discovered
Severity follows the reviewers' labels. "Lead" means found by the lead developer's own tests.

| # | Found by | Sev. | Problem |
|---|---|---|---|
| 1 | Lead | major | Hints named the unit (0.1, 0.01), which *was* the answer when the count was 1 (M1, M2, M7, M8, E1). |
| 2 | Lead | minor | P2 feedback mentioned "10" when the answer was 10; an M2 hint only repeated the question. |
| 3 | Math | major | C2 "0.6 ? 0.60": hints and feedback stated that the numbers are equal. |
| 4 | Math | major | M9: a dropped placeholder zero (0.53 for 0.053) got "don't forget the slices". |
| 5 | Math | major | E1: choosing swapped digits (0.85 for 0.58) got a message about zeros. |
| 6 | Math | minor | Inaccurate wording in E1, E2, E3, M7/M8 (over- and under-counts got the same message), M1 "0", W2/W3 feedback that named the place, C3 "1 tenths", M8 "0.00", M5 one-place hint, PL6 explanation. |
| 7 | Math | minor | Teach worked examples could reappear in Practice and Test. |
| 8 | Math | minor | Two-choice questions (P4, E2, E4) gave a 50% guess in the Test. |
| 9 | Math | minor | A W3 distractor could equal the answer (masked only by list order); PL5 never used two-place numbers. |
| 10 | Math | minor | No word problems or reasoning items (required by CURRICULUM.md); docs did not match the build. |
| 11 | UX | major | The wrong-answer box was a full phone screen tall, and its 0.34 reminder grid looked like an answer choice. |
| 12 | UX | major | The skill-level reminder missed the point for thousandths questions. |
| 13 | UX | major | Shaded squares were hard to count (dark lines on blue). |
| 14 | UX | major | Side-by-side wholes were drawn at different sizes. |
| 15 | UX | minor | Overloaded Teach screens, stale "press Get a hint" text, broken chart headings, wrapping Back button, no "no hints" reminder in the Test, color-only answered state, a repetitive review page, very long results with adult wording, "Skills mastered" after one question, perfect practice still pointing to more practice, Teach steps lost on refresh, skip and brand links under 44 px. |
| 16 | QA | major | Damaged or outdated saved data (valid JSON with the wrong shape, unknown template ids) crashed Practice, Test or Parent on every reload. |
| 17 | QA | minor | Clicking Submit twice in a script recorded two results; clicking Next twice skipped a question. |
| 18 | QA | minor | Progress was lost in-session when storage reads worked but writes failed (storage full). |
| 19 | QA | minor | `#/d01/teach/99` and review links marked Teach finished or advanced. |
| 20 | QA | minor | Unreadable test input ("0,5") counted as answered and was silently marked wrong. |
| 21 | QA | minor | Practice could repeat questions from the test just taken; unsolved questions were labelled "After another try". |
| 22 | Math re-check | minor | New E3 message called 1.00 "more than one whole"; new P4 feedback revealed which piece is bigger; the new C4 had a guessable pattern (always "No", only one believable "No"). |
| 23 | UX re-check | minor | Folded sections lost their ▸ arrow. |
| 24 | QA re-check | minor | A damaged saved Teach-steps entry could freeze Teach. |

## 8. Corrections made
All 24 were fixed, and each reviewer re-checked its own findings against the fixed code. Fixes for #22–#24 were checked by the automated tests added for them, not by a further reviewer round.
- **Hints and feedback (#1–#6, #22):**
  - Templates no longer generate counts where a unit hint equals the answer.
  - C2 hints are generic.
  - Feedback is checked in a precise order (dropped zero before "forgot slices", swapped digits, separate over- and under-counts).
  - All the wording issues listed above were corrected.
  - C4 now mixes true and false claims, with two "Yes" and two "No" choices.
- **Question pools (#7–#10):**
  - Teach and Notes example questions are excluded from Practice and Test.
  - P4 has a third choice; E2 and E4 are Practice-only.
  - The equal-valued W3 distractor was removed; chart questions can use two-place numbers.
  - New templates: **P6** (word problem: chocolate bar, stickers, beads) and **C4** (judge a classmate's reasoning about 0.4 vs 0.35-type comparisons).
  - README, CURRICULUM and STATUS were updated.
- **Layout (#11–#15, #23):**
  - The reminder is folded behind "Show me a reminder", and thousandths questions have their own reminder.
  - White gridlines on shaded cells; equal-size side-by-side wholes; the shade-it tool is folded.
  - Hint advice refreshes when hints change; soft hyphens in chart headings; Back no longer wraps.
  - Test label says "no hints"; answered bubbles are underlined; the review page shows only unanswered links.
  - Results show missed questions first and fold the right ones; the benchmark note is kept for the Parent page.
  - Parent heading reads "Skills correct on the most recent test"; perfect practice highlights Take the Test.
  - Teach steps are saved across refreshes; 44 px skip and brand links; disclosure arrows restored.
- **Saved data and controls (#16–#21, #24):**
  - Saved progress is repaired field by field, and saved question lists are validated against the bank and discarded if stale.
  - Submit and Next ignore a second click; failed writes are kept in memory and read back first.
  - Bad Teach URLs redirect without recording progress, and only in-order visits count.
  - Unreadable test input shows a note and counts as unanswered.
  - Practice avoids the last test; unsolved questions show "Not finished"; saved Teach steps are validated.

## 9. Tests performed

| Test | Result |
|---|---|
| `npm test`: decimal helpers, number words, 34 templates × 600 seeds (answer keys, equivalent and leading-dot forms, place enforcement, unique choices with no equal values, hint leaks, hint ≠ question, feedback for wrong answers, pictures match numbers), Teach checks, set building (300 seeds), word-problem and reasoning answers, reviewer regressions, Test exclusions | **47 / 47 pass** |
| `npm test`: scoring of every count 0–10 over 40 sets, blanks, equivalent typed decimals, feedback never states the answer (200 seeds × 34 templates), fresh retakes | included above, **pass** |
| `npm run test:browser`: home; all 19 Teach screens in order with step gating and guided checks (wrong, then right); Back; Practice hints in order and capped, blank and wrong and right answers, solution after 3 tries, refresh mid-session, Enter key, summary, new session freshness; Test with no leaks on every screen, refresh mid-test, blank confirmation, 8/10, 10/10 and 9/10 scoring, results after refresh, fresh retake, equivalent decimals; Parent values and persistence; layout at 5 sizes (no overflow, 44 px targets); 6 question types at phone width; damaged saved data; bad Teach URL; saved and damaged step counts; unreadable test input; double Submit and double Next; reset; no console errors; no missing files | **135 / 135 pass.** The browser suite passed on 4 separate runs during the final round, with random question sets each time; the newest checks were added along the way, so the run count grew from 131 to 135. |
| Math reviewer: 34 templates × 3000 seeds, typical-mistake probes, read-through of all Teach, Notes, hints and feedback | 13 findings; all fixed and re-checked; 3 new minor findings, also fixed |
| Student-experience reviewer: about 60 screenshots per round at 375, 390, 768, 1366 and 1920 | 15 findings; all fixed and re-checked; 1 new minor finding, also fixed |
| QA reviewer: 24 routes, back/forward and refresh, input edge cases, steppers, hint sequences, DOM leak inspection, 3000 scoring patterns, corrupted and blocked storage, double activation | 6 defects and 2 suspected issues; all fixed and re-checked; 1 new minor defect, also fixed |
| Live site (GitHub Pages), after the merge on 2026-10-10 | **135 / 135 pass, on two runs** of the full browser suite against https://bazeocrisy.github.io/Gabriellas-Math-Lab/ (merge commit `a236b32`) |

## 10. Remaining limitations
- **Standards:** the wording was checked against a secondary source. Confirm with the official GaDOE document and the Milestones blueprint before claiming full alignment. D01 is a foundations lesson; it does not by itself meet 5.NR.4.1–4.4.
- **Left for later lessons (by design):** expanded-form practice and "×10" digit-value questions (D02), full comparing and ordering (D03–D04), rounding, and adding and subtracting.
- **Not tested on real devices:** Safari on a real iPhone or iPad, a screen reader, and a paper printout of the Lesson Notes.
- **Progress is per browser and device** (localStorage). Clearing site data erases it. In private windows it lasts only for the visit, and the Parent page says so.
- **Answers can be worked out from the browser console** (the question generator runs in the page). This is fine for a home learning app, but it is not secure testing.
- **Guided Teach checks stay answered:** revisiting a check shows it as already solved, and there is no "try again" for a check.
- **E2 and E4** (equal / same-amount yes-or-no questions) appear only in Practice.
