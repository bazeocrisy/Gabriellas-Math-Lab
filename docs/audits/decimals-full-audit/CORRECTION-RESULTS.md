# Correction Results

| | |
|---|---|
| Audited baseline | `79abadc` (main and the live site) |
| Correction branch | `claude/decimals-audit-corrections` |
| Status | Built, tested and reviewed. **Not merged or deployed.** It is waiting for owner approval. |

## Commits

| Stage | Commit | Defects |
|---|---|---|
| A: Test integrity | `98b63b8` | D-01, D-02, D-03, D-12–D-16, Decision 2, Practice observations |
| B: Teach what is tested | `00f89c4` | D-04, D-05, D-18–D-24, D-30 |
| C: Feedback and accessibility | `ba3e871` | D-06–D-11, D-25–D-28, D-29 |
| D: Usability and cosmetic | `7130d89` | D-17, D-31–D-33 |
| Fixes from the reviews | `079c67a` | Reviewer findings (see the reviewer conclusions section) |
| Docs | the commit that adds this file | D-34, STATUS, CURRICULUM, README |

**Owner decisions applied**
1. Number lines are taught in Lesson 1.
2. A Test may be left and resumed. Opening lesson pages during a Test keeps the score but does not earn ★ Mastered.
3. The supplemental label for Lessons 8–9 stays until the official standards can be checked.

## Test results

| Suite | Before (79abadc) | After |
|---|---|---|
| `npm test` | 208/208 | **226/226** |
| `npm run test:browser` (headless Chrome 155, simulated devices) | 609/609 | **658/658** |

**New tests**
- `tests/integrity.test.mjs` has 18 tests. They cover:
  - answer clues across every multiple-choice bank;
  - Practice versus an open Test in all 10 lessons;
  - retakes;
  - recording each attempt once, and the 20-test history;
  - old saved progress;
  - every assessed format is taught first, and every skill has a guided check;
  - exact number-line descriptions;
  - the feedback fixes;
  - contrast;
  - the reviewers' findings.
- About 50 new browser checks.
- Two existing tests were repaired:
  - an older Lesson 4 test whose regex contained a backspace character, so it could never fail;
  - a test that hard-coded Lesson 1's old screen count.
- One existing check was updated: "Show me how" now needs three *different* wrong answers.

## All 34 findings

FIXED means the correction is in the code and an automated test checks it. "Test" is the regression test (`I:` = integrity unit test, `B:` = browser check).

| ID | Sev. | Status | Correction | Main files | Test |
|---|---|---|---|---|---|
| D-01 | Major | **FIXED** | Practice leaves out every question of the lesson's unfinished Test. Tests already left out the open Practice set. | practice.js, storage.js | I: 50 sessions × 10 lessons; B: 51 sessions in the browser |
| D-02 | Major | **FIXED** | Each attempt has an id. Saving and submitting re-read storage first, so a stale tab shows the stored state instead of writing. An attempt is recorded once, and tabs stay in step through storage events. | test.js | I: recorded once; B: stale tab, stale Submit, real second tab |
| D-03 | Major | **FIXED** | Wrong choices rewritten to match the correct one in length and form: d01 C4, d02 F1/Z2, d03 Y1/Y3 (d10 RC3 follows), d08 W3, d09 C2, plus d06 ES2. | d01–d09 bank.js | I: answer-clue test over every multiple-choice template (length, "clearly longer", position) |
| D-04 | Major | **FIXED** | New Lesson 1 screens: "Decimals on a number line", "Zooming in on a number line" (0.9 to 1) and a guided check (M8). Number lines added to the Notes and review. | d01/lesson.js | I: format-coverage; B: screens and check |
| D-05 | Major | **FIXED** | New Lesson 3 screen, "A missing digit": worked example, place-by-place reasoning including the equal-digit case, and a guided check (S5). | d03/lesson.js | I: format-coverage; B |
| D-06 | Major | **FIXED** | Number-line descriptions are exact ("9 and a half jumps") and never rounded. | models.js | I: every number line in banks, Teach and Notes (more than 1,000) |
| D-07 | Minor | **FIXED** | Rounding prompts say how many digits to write ("one digit after the decimal point, even if it is a zero"). The requirement is kept. Feedback and Test results call a right amount with the wrong number of places a notation slip, not a wrong amount. | engine.js, test.js | I |
| D-08 | Minor | **FIXED** | Exactly-halfway numbers get the halfway rule. | d05/bank.js | I: no "closer to" for halfway values |
| D-09 | Minor | **FIXED** | d07 SL3 hints are built from the columns that really need regrouping, including across a zero. | d07/bank.js | I: 2,000 seeds |
| D-10 | Minor | **FIXED** | d06 AM2 feedback no longer gives the total or the false "tenths place" claim. | d06/bank.js | I |
| D-11 | Minor | **FIXED** | AL2/SL2 choice pictures are described column by column, without saying whether they line up. | models.js, d06/d07 bank.js | I |
| D-12 | Minor | **FIXED** | d05 K2 has a wrong choice with the same whole part as the answer. | d05/bank.js | I |
| D-13 | Minor | **FIXED** | d03 E1: "=" is the answer about half the time (51%), and the unequal pairs are still near misses. | d03/bank.js | I |
| D-14 | Minor | **FIXED** | After Lesson 10, Parent Progress points to the first lesson not yet mastered. | app.js | B |
| D-15 | Minor | **FIXED** | A lasting test count and first-mastery date sit outside the 20-test history and are filled in from older data. | storage.js, test.js, app.js | I, B: 21 tests |
| D-16 | Minor | **FIXED** | Retakes avoid the last 3 tests' questions where possible, so small banks never fail. | engine.js, test.js | I: 0 repeats over 3 tests × 40 runs × 10 lessons |
| D-17 | Minor | **FIXED** | The expanded-form answer box is full width, wraps and grows with the answer. Enter still checks. | question-ui.js, styles.css | B: 320 and 1366 px, long answer at 320 px |
| D-18 | Minor | **FIXED** | Lesson 1 explains >, < and = and adds a guided comparison check (C2). | d01/lesson.js | I: a guided check for every skill |
| D-19 | Minor | **FIXED** | The typed chart (d01 PL5) and typed expanded form (d02 F3) are now the guided checks. | d01/d02 lesson.js | I: format-coverage |
| D-20 | Minor | **FIXED** | Lessons 6 and 7 draw number-line jump arrows; Lesson 6 also draws its tenths bars. | models.js, d06/d07 lesson.js | I: format-coverage; B |
| D-21 | Minor | **FIXED** | Lesson 8 adds a worked area example in square meters (0.3 m × 0.6 m = 0.18 m²). | d08/lesson.js | I: format-coverage |
| D-22 | Minor | **FIXED** | Lesson 9 adds a division layout and defines dividend, divisor and quotient on screen. A new "Dividing hundredths" screen covers 8.52 ÷ 4. A hundredths grid is drawn for sharing. | models.js, d09/lesson.js | I, B |
| D-23 | Minor | **FIXED** | Lesson 9 shows how to use a related whole-number fact, with a guided check (W3). | d09/lesson.js | I, B |
| D-24 | Minor | **FIXED** | "Show me how" for column addition and subtraction shows the lined-up columns with zeros, carry or regroup marks, and one step per column. | kit.js, coach.js, d06/d07/d10 bank.js | B; independently recomputed by Reviewer 1 |
| D-25 | Minor | **FIXED** | After a correct answer, focus moves to Next (Teach) or the feedback (Practice). After the last hint it moves to that hint. | coach.js, teach.js | B |
| D-26 | Minor | **FIXED** | Revealed steps are a polite live region, and focus goes to "Why it works" before Next. | teach.js | B |
| D-27 | Minor | **FIXED** | Two-tone focus ring: a dark outline (#1d2433) with an amber halo. It is at least 3:1 on every background. | styles.css | I: contrast computed from the CSS |
| D-28 | Minor | **FIXED** | Darker halfway mark and zoom box, hatched area-model rows and columns, white halos under crossed-out squares. | styles.css, models.js | I: contrast |
| D-29 | Cosmetic | **FIXED** | "1 tenth" is singular. | d06/bank.js | I |
| D-30 | Cosmetic | **FIXED** | "7 ÷ 3 is 2 with 1 left over" instead of an equation. | d09/lesson.js | Reviewer 1 |
| D-31 | Cosmetic | **FIXED** | Under 480 px, number lines show every other tick label at a larger size. Every label is at least 10 px at 320 px (it was 7.8–8.5 px). | models.js, styles.css | B: 4 screens |
| D-32 | Cosmetic | **FIXED** | Guided checks are titled with their topic ("Try it together: Tenths"). | teach.js | B |
| D-33 | Cosmetic | **FIXED** | Steps labelled "Step 1." are not numbered twice. | teach.js, styles.css | B |
| D-34 | Cosmetic | **FIXED** | STATUS.md gives Lesson 7's real screen count (13). | docs/STATUS.md | Checked by hand |

**Totals:** 34 FIXED, 0 partially fixed, 0 deferred, 0 not reproducible.

## Changes to Tests, mastery and progress

**Interruptions (Decision 2)**
- What counts: opening Teach, Practice or Lesson Notes (any lesson) in this app while a Test is unfinished. It is noted on that Test.
- What happens to the Test:
  - The score is kept and shown.
  - A Test that met the goal is marked "goal met, but lesson pages opened during the test" and does not count for ★ Mastered.
  - A later Test done on its own can be mastered.
- What does not count:
  - refreshing, closing the browser;
  - visiting Home or Parent;
  - Back or Forward to a non-lesson page.
- Wording: the messages are friendly, and Parent Progress explains the rules ("not treated as cheating").
- Older Tests are not relabelled.

**Practice**
- Practice reports "right on the first try (hints allowed)" and "right on the first try with no hints". The second figure is counted only from now on; older sessions are not guessed at.
- Checking the same wrong answer again is not a new try, so tapping Check cannot unlock the solution.

**Lesson 10** review questions skip the Teach examples of the lessons they come from.

**Observations left as they are, on purpose**
- Never-correct options ("=", "They are equal") and the fixed order of the symbol choices `< > =` and of d02 R1's relation choices. These are standard formats; the clue test excludes these fixed label sets.
- A blank counts as wrong (after a confirmation prompt).
- Some multiple-choice third hints are strong (d07 SC1). d08 W3's hint was reworded.

## Saved progress and compatibility (browser-tested)

**Works unchanged**
- Progress from the previous version keeps its tests, mastery and count. Missing fields are filled in from the history.
- A Test that was unfinished at the upgrade can be finished once.
- Old Practice sessions resume.
- Revealed-steps drafts keep working, because they are keyed by screen id.

**How upgrade edge cases are handled**
- If an answer saved before choice wording changed matches no current choice, it is asked for again with a note. It is never scored as wrong.
- An unfinished Test whose question generator changed (about a quarter of in-progress d03 Tests, those containing E1 or NL2) cannot be rebuilt. The Test page now says so; it no longer disappears silently. Saved results are untouched.
- The two guided checks whose question type changed have new ids, so old answers to them are not shown.

## Reviewer conclusions

### Reviewer 1: mathematics and instruction

| Area | Result |
|---|---|
| Worked column solutions | 39,980 direct calls plus 21,000 generated questions recomputed independently, **0 mismatches**: carries, regrouping across zeros, whole numbers, 3 addends |
| Rewritten multiple-choice items | 36,000 questions: exactly one correct choice each |
| Feedback and hint fixes | Verified over thousands of seeds |
| New Teach content | All mathematically correct and suitable for Grade 5 |
| Supplemental classification | Unchanged |

Findings: 0 critical, 0 major, 2 minor, 2 cosmetic. All fixed in `079c67a`:
- the d02 Z2 feedback;
- the "fewer digits" wrong choices;
- a d06 caption;
- d06 ES2 feedback (this one predates the branch).

### Reviewer 2: functional QA and accessibility (simulated devices)

| Area | Result |
|---|---|
| Real second tab (D-02) | Passed |
| Practice vs open Test (D-01) | 0 overlaps in 400 runs |
| Interruption policy | Passed, including another tab |
| D-14 / D-15 / D-16 | Passed |
| Deep links, Review-in-Teach links | Passed |
| Keyboard use, live regions, focus ring | Passed |
| Exact number-line descriptions | Passed |
| 320–1366 px layouts, print | Passed |
| Console | No errors |

Findings, all fixed in `079c67a`:
- **1 major:** an old answer to a reworded choice could be scored as wrong after the upgrade. Now asked for again.
- **6 minor:**
  - a silently lost Test after the upgrade (now explained);
  - a Practice session counted twice from two tabs;
  - "Take a new test" on a stale page;
  - an old saved state shown on a changed guided check;
  - the expanded-form box too short at 320 px;
  - focus lost after a redraw caused by another tab.
- **1 cosmetic:** focus after a correct Teach check now goes to Next.

## Remaining limitations

- **Devices:** all device testing is simulated (headless Chrome). There was no physical iPhone, iPad, Android or projector testing, and no Safari or Firefox.
- **Screen readers:** no real screen reader was used. Accessibility was checked through the DOM, the accessibility tree and keyboard runs.
- **Print:** emulation only, not paper.
- **Standards:** the official GaDOE standards text could not be reached, so the 5.NR.1.2 question for Lessons 8–9 is unresolved and their classification is unchanged.
- **Teach position after the upgrade:** saved Teach positions (`furthest`) from the previous version are screen numbers. In Lessons 1, 3 and 9, which gained screens, an old position may point a few screens earlier or later than before, and the new screens may count as passed. "Teach finished" is kept.
- **Unfinished Tests:** about a quarter of unfinished Lesson 3 Tests saved by the previous version must be restarted (with a message).
- **Answers in the console:** answers can still be worked out from the browser console, as before.
- **Learning outcomes:** none were observed. The reviews are expert and automated checks, not student data.
