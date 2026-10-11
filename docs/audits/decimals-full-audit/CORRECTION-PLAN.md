# Correction Plan

**Status:** proposed. **Nothing below has been implemented. It needs owner approval.**

Every item maps to a defect in [DEFECT-REGISTER.md](DEFECT-REGISTER.md). Items are ordered by their effect on learning and on the reliability of Test results.

## Ground rules for the fixes

- **Preserve progress.** Existing saved progress must keep working. Test against progress saved by the live `79abadc` build, as earlier releases did.
- **Track Teach screen positions.** Teach screens added to d01, d03 and d09 change screen numbers. Saved "steps revealed" state and `#/dNN/teach/N` links must still resolve. "Review in Teach" links use screen ids, so they are safe.
- **One step at a time.** Each step is its own commit, with its regression tests. `npm test` and `npm run test:browser` must pass after every step.
- **Review and approval.** After all steps: one independent review of the fixes, then owner approval before merge and deploy, then the live suite again.

## Step 1: Test integrity in shared code (MAJOR first)

**Files:** `js/practice.js`, `js/test.js`, `js/storage.js`, `js/app.js`. **Risk:** medium, because it touches the stored-progress format.

| Order | Defect | Correction | Regression test |
|---|---|---|---|
| 1a | D-01 (major) | Practice also leaves out the questions of an open (started, unsubmitted) Test of the same lesson. | Start a Test, build 50 Practice sessions, assert no shared question. |
| 1b | D-02 (major) | Re-read the stored Test draft before saving and submitting. If it was already submitted, or holds a different set, show the stored state instead. Add a `storage` listener. | Two pages sharing storage: one recorded result; the stale tab shows results. |
| 1c | D-15 | Keep a lasting `testsTaken` count and `masteredOn` date, separate from the trimmed 20-Test history. Older saved progress gets them filled in when loaded. | One mastered Test + 20 more: still mastered, count shows 21. Progress saved by `79abadc` still loads. |
| 1d | D-16 | Leave out the last 3 Tests' questions from a retake, falling back when a small bank runs out. | 3 consecutive Tests for d01/d09 over 200 seeds have no repeats. |
| 1e | D-14 | Show "All lessons complete" only when every lesson is mastered; otherwise point to the lowest unmastered lesson. | Only d10 mastered: the text is absent. |

## Step 2: Fair questions in the banks (MAJOR first)

**Files:** `curriculum/decimals/d01–d10/bank.js`. **Risk:** low to medium. Changing wrong choices doesn't change answer keys, but every changed template must still pass the existing 500-seed independent recomputation.

| Order | Defect | Correction | Regression test |
|---|---|---|---|
| 2a | D-03 (major) | Rewrite the wrong choices in d01 C4, d02 F1/Z2, d03 Y1/Y3, d08 W3 and d09 C2 (d10 RC3 follows from d03 Y1) to match the correct choice in length and form. | A new **answer-clue test across all banks**: no multiple-choice template has its correct choice uniquely longest or uniquely shortest in more than 50% of seeds. |
| 2b | D-12, D-13 | d05 K2: add a wrong choice with the same whole part as the answer. d03 E1: make "=" the answer about half the time. | Added to the answer-clue test. |
| 2c | D-07 | Say the required number of decimal places in rounding prompts ("give 1 decimal place, like 3.0"). | Every template with `places` names them in its prompt. |
| 2d | D-08, D-09, D-10 | Fix the misleading feedback and hints: halfway rounding (d05/d10), SL3 hints built from the columns that actually regroup (d07), the AM2 sum-of-1 feedback (d06). | One test per defect, as in the register. |
| 2e | D-29 | Fix "1 tenths" (singular/plural helper). | Covered by the existing grammar checks. |

## Step 3: Teach what is assessed (MAJOR first)

**Files:** `curriculum/decimals/dNN/lesson.js`, possibly `js/models.js`. **Risk:** medium, because screen numbers shift (see the ground rules) and it adds instructional content.

This step adds Teach screens and steps to existing lessons. It is a correction of instructional gaps, not a new feature, but it changes lesson content, so **the owner should approve each addition**. The alternative for D-04 is to move the questions instead of adding teaching.

| Order | Defect | Correction | Regression test |
|---|---|---|---|
| 3a | D-04 (major) | d01: add a "Decimals on a number line" screen (0–1 in tenths, plus a zoom from 0.9 to 1) with a guided check on M7. **Or** move M7/M8 into d03 `cmpLine`. | A new **format-coverage test**: every Practice/Test format appears in that lesson's or an earlier lesson's Teach visuals or guided checks. |
| 3b | D-05 (major) | d03 "place" screen: a worked step on a missing digit, plus a guided check using S5. | Format-coverage test. |
| 3c | D-18 | d01: a guided check on comparing, and a one-line reminder of the <, > and = symbols. | Every skill has at least one guided-check screen. |
| 3d | D-20, D-21 | Number-line pictures with jumps for d06 and d07 Teach screen 1; a worked example of area with tenths for d08. | Format-coverage test. |
| 3e | D-22, D-23 | d09: a division-layout visual, one hundredths example, a related-fact step, and on-screen definitions of quotient and divisor. | Format-coverage test. |
| 3f | D-19 | Switch the guided checks to the typed formats (d01 PL5, d02 F3). | Format-coverage test. |
| 3g | D-24 | "Show me how" for column addition and subtraction: a column calculation with carry and regroup marks and 2–3 steps. | The solution for computation templates contains a column visual or at least 2 steps. |
| 3h | D-30 | d09 wording: "7 ÷ 3 is 2 r 1". | Equation scan of Teach screens. |

## Step 4: Accessibility in shared components (MAJOR first)

**Files:** `js/models.js`, `js/coach.js`, `js/teach.js`, `css/styles.css`, and the AL2/SL2 bank templates. **Risk:** low.

| Order | Defect | Correction | Regression test |
|---|---|---|---|
| 4a | D-06 (major) | Number-line screen-reader text gives exact positions (half jumps), never rounded. | For every `M.line` output, the described position equals the drawn value. |
| 4b | D-11 | Neutral, column-by-column descriptions for the alignment choices. | Choice labels don't contain "lined up". |
| 4c | D-25, D-26 | Move focus after a correct answer or the last hint; announce revealed steps (live region or focus). | Browser: focus isn't `body`; steps have `aria-live`. |
| 4d | D-27, D-28 | Higher-contrast focus ring; darker diagram fills or outlines. | Contrast unit test on the CSS colour tokens (at least 3:1). |
| 4e | D-32, D-33 | Topic-specific guided-check titles; remove the double step numbers. | DOM assertions. |

## Step 5: Layout and docs

| Order | Defect | Correction | Regression test |
|---|---|---|---|
| 5a | D-17 | Full-width expanded-form input. | `scrollWidth <= clientWidth` at 320 and 1366 px. |
| 5b | D-31 | Larger number-line label text in the d05 reminder. | Smallest SVG text is at least 10 px at 320. |
| 5c | D-34 | Correct the Lesson 7 screen count in STATUS.md. | — |

## Suggested sequence and effort

| Order | Step | Fixes | Effort | Risk |
|---|---|---|---|---|
| 1 | Step 1 | D-01, D-02 (major), D-14, D-15, D-16 | Small to medium | Medium |
| 2 | Step 2 | D-03 (major), D-07 to D-10, D-12, D-13, D-29 | Medium | Low to medium |
| 3 | Step 4a | D-06 (major) | Small | Low |
| 4 | Steps 3a–3b | D-04, D-05 (major) | Medium | Medium |
| 5 | Rest of Step 3, Steps 4 and 5 | Remaining minor and cosmetic defects | Medium | Low to medium |

Steps 1, 2 and 4a can ship together as a "Test integrity" release, because they don't change lesson content. Step 3 changes Teach content and is best reviewed lesson by lesson.

**Open choices for the owner**
- D-04: add number-line teaching to Lesson 1, or move those questions to Lesson 3?
- Should the Test record that it was interrupted, or block leaving mid-Test? Currently it is open-book (observation, not a defect).
- Should Lesson 8–9 "supplemental" labelling stay as it is, until the official GaDOE wording of 5.NR.1.2 is confirmed?
