# Defect Register

**Build:** `79abadc` (main, the live build).

**Reproducing the question-level defects**
- Run in Node: `loadGML()` from `tests/lib/load.mjs`, then `GML.engine.make(lessonId, templateId, seed)`.

**How defects are classified**
- Reviewer IDs (M- mathematics, U- instruction and accessibility, Q- functional QA) are kept for traceability. Duplicates are merged.
- "Verified by lead" means the lead auditor reproduced the defect independently.
- Device results are simulated (headless Chrome 155).

| Severity | Count |
|---|---|
| Critical | 0 |
| Major | 6 |
| Minor | 22 |
| Cosmetic | 6 |

---

## MAJOR

### D-01 · All lessons (worst in d01, d09) · Practice opened while a Test is in progress · Practice can show the answer to an open Test question
- **Source:** Q-01. Verified by lead (code).
- **Student impact:** A student who leaves a Test unsubmitted and opens Practice can be shown the full solution to a question in that Test. The Test result is then compromised.
- **Steps to reproduce:**
  1. Clear storage.
  2. Open `#/d01/test` and press Start.
  3. Without submitting, open `#/d01/practice`.
  4. Compare the question signatures with the Test draft (`gml:v1:draft:test-d01`).
- **Expected:** Practice never contains a question from the open Test. The Test already excludes the open Practice set.
- **Actual:** Practice sessions containing at least one open-Test question: d01 14%, d09 15%, d08 7%, d05 3%, d02 2%, d06 2%, d03 1%, d04 and d07 0.3%, d10 0% (300 simulated sessions per lesson).
  - Browser example, d01: Practice question 6 was the same as Test question 1. Its solution showed "The answer is 1000".
- **Environment:** local copy and live site (reproduced on the first try).
- **Root cause:** `js/practice.js:10`. `newSession` excludes `teachSigs`, `recentSigs` and `lastTestSigs`, but not the signatures in an open Test draft. The other direction is handled in `js/test.js:12-14`.
- **Fix:** add the open Test draft's `set[].sig` to Practice's `exclude` when `started && !submitted`.
- **Regression test:** start a Test, build 50 Practice sessions, and assert that no Practice signature is in the open Test set.

### D-02 · All lessons · Test open in two tabs · A stale tab re-submits after the answers are revealed and overwrites the result
- **Source:** Q-02.
- **Student impact:** "Mastered" can be earned by copying answers from the first tab's results page. The real first result is replaced.
- **Steps to reproduce:**
  1. Tab A: start the Lesson 1 Test.
  2. Open the same Test in tab B.
  3. Tab A: submit. The results show the answers.
  4. Tab B: enter those answers and submit.
- **Expected:** tab B finds the Test already submitted and shows its results. Only one result is recorded.
- **Actual:** progress records 0/10 and then 10/10 mastered. Reloading tab A shows 10/10. Reproduced on the live site.
- **Root cause:**
  - `js/test.js:28`: `save()` writes the in-memory draft without re-reading storage.
  - `js/test.js:138`: the double-submit guard checks only the in-memory flag.
  - There is no `storage` event listener.
- **Fix:** re-read the stored draft before saving and submitting. If it is already submitted or holds a different set, render from storage instead. Add a `storage` listener.
- **Regression test:** two pages (or iframes) sharing storage: submit in A, edit and submit in B, and assert one result is recorded and B shows results.

### D-03 · d01 C4, d02 F1 and Z2, d03 Y1 and Y3, d08 W3, d09 C2, d10 RC3 · Multiple-choice items in Practice and Test · The correct choice can be found by its length
- **Source:** M-01. Verified by lead: 1000 of 1000 seeds for each template.
- **Student impact:** "Pick the longest choice" always works (for d09 C2, "pick the shortest"), so these items measure guessing strategy rather than understanding.
- **How often they appear in Tests** (2,000 generated Tests per lesson; lead measurement):

  | Lesson | Tests containing one | Average per Test |
  |---|---|---|
  | d03 | 100% | 1.34 |
  | d08 | 65% | — |
  | d02 | 64% | — |
  | d10 | 51% | — |
  | d09 | 49% | — |
  | d01 | 26% | — |
- **Steps to reproduce:** `make('d03','Y1',1)`. The correct choice, "No. Line them up as 0.620 and 0.605: 0.62 has more hundredths, so 0.62 is greater.", is the only long sentence. In `make('d02','F1',5)` the correct `60 + 4 + 0.8 + 0.003` is the longest choice.
- **Expected:** the length of a choice gives no clue to the answer.
- **Root cause:** each correct reason is a full place-value sentence, while the wrong choices are short slogans. In F1 and W3, the way the wrong choices are built always makes them shorter.
- **Fix:** rewrite the wrong choices to match the correct one in length and structure. Add a wrong choice that is as long or longer (for example `60 + 4 + 0.08 + 0.003` in F1).
- **Regression test:** for every multiple-choice template, over 2000 seeds, the correct choice is uniquely the longest (or uniquely the shortest) in under 50% of seeds.

### D-04 · d01 M7 and M8 (skill `model`) · Practice and Test · Number-line reading is assessed but never taught
- **Source:** U-01. Verified by lead: `lesson.js` for d01 contains no number line.
- **Student impact:** a Lesson 1 student must read a point on a 0–1 line in tenths, or on a zoomed 0.9–1 line in hundredths, without ever having seen one. The hints use the words "jumps" and "tick marks", which Lesson 1 never defines. In a Test there are no hints at all.
- **Steps to reproduce:**
  1. `make('d01','M7',1)` gives "What decimal is at point A?" with a number line.
  2. Search `curriculum/decimals/d01/lesson.js` for a number line (`M.line`, "line"): there are none.
  3. Number lines are first taught in d03 (screen "line").
- **Expected:** a Teach screen, a worked example and a guided check for reading decimals on a number line, before this is assessed. The skill name already promises "number lines".
- **Actual:** M7 or M8 appears in 60% of d01 Tests.
- **Fix:** add a "Decimals on a number line" screen to d01, with a guided check using M7. Alternatively, move M7 and M8 out of d01 (into d03, `cmpLine`).
- **Regression test:** a format-coverage test. Every Practice or Test format (type and visual kind) must appear in that lesson's Teach or guided checks, or in an earlier lesson's.

### D-05 · d03 S5 (skill `cmpPlace`) · Practice and Test · The "missing digit" comparison is assessed but never taught
- **Source:** U-02. Verified by lead.
- **Student impact:** "Which digit can go in the box to make this true? 0.5▢8 < 0.546" calls for reasoning about an unknown digit, which no Teach screen or guided check models.
- **Steps to reproduce:** run `make('d03','S5',1)`, then read the d03 screens `symbols`, `place` and `check-place`. None uses a box or an unknown digit.
- **Expected:** a worked example and a guided check before this is assessed.
- **Actual:** S5 appears in 59% of d03 Tests.
- **Fix:** add a worked step to the d03 "place" screen (for example "What digits could go in 0.3▢5 < 0.338?") and a guided check that uses S5.
- **Regression test:** the D-04 format-coverage test.

### D-06 · d04 NL2, the d04 Teach "line" screen, the d05 Teach "apply" screen · Number-line diagrams · The screen-reader description rounds point positions to whole jumps
- **Source:** M-03. Verified by lead.
- **Student impact:** screen-reader users are told mathematically wrong positions. For example, 0.95 is described as "10 jumps" from 0, which is where 1 is. Sighted users are not affected.
- **Steps to reproduce:** `make('d04','NL2',1)`. The prompt lists 0.65, 0.3 and 0.95. The `aria-label` says "Point A is 3 jumps… Point B is 7 jumps… Point C is 10 jumps to the right of 0."
- **Expected:** a point between tick marks is described exactly (for example "6 and a half jumps").
- **Actual:**
  - 2,616 of 3,000 NL2 questions are affected.
  - d04 Teach "line" screen: 0.25 is announced as 3 jumps.
  - d05 Teach "apply" screen: 4.25 and 4.35 are announced as 3 and 8 jumps.
- **Root cause:** `js/models.js` `line()` labels each point with `Math.round((pt.v - from) / step)`.
- **Fix:** describe half steps exactly, and never round.
- **Regression test:** for every `M.line` output in the banks, Teach and Notes, the jump count in the label × step + from equals the point's value.

---

## MINOR

| ID | Source | Lesson · state | Defect and evidence | Recommended fix | Regression test |
|---|---|---|---|---|---|
| D-07 | M-04 | d05 T1/T2/H1/H2/K1/A2, d10 RR1–RR3, X1 · typed rounding answers | <ul><li>The shortest form of the correct value is marked wrong, and the prompt never states the required number of decimal places.</li><li>Example: `make('d05','T1',27)` asks "Round 12.018 to the nearest tenth"; typing "12" is marked wrong.</li><li>Frequency: about 5% of seeds, 10% for X1, 100% for K1 and RR3.</li><li>The "3.0 not 3" convention is taught on d05 screen "nines" and in the Notes, but in a Test a correct value scores 0.</li></ul> | State the format in the prompt ("give 1 decimal place, like 3.0"). | For every template with `places`, the prompt names the required places. |
| D-08 | U-09 | d05 K3/A2, d10 RR4 · wrong-answer feedback | <ul><li>Feedback for a value exactly halfway says "round to whichever … it is closer to".</li><li>A halfway value is equally close to both, so the advice can't be followed.</li></ul> | Detect the halfway case and state the round-up rule. | The halfway feedback never contains "closer to". |
| D-09 | M-05 | d07 SL3 · hints 2–3 | <ul><li>"The tenths digit is now one less" is false in 35% of seeds (no hundredths regrouping happens).</li><li>In another 6%, the hint says to take a tenth from a tenths digit of 0.</li><li>Example: `make('d07','SL3',1)`, 7.05 − 2.93.</li></ul> | Build the hints from the columns that actually regroup, or restrict the numbers generated. | A regrouping claim in a hint is only made when that regrouping happens. |
| D-10 | M-06 | d06 AM2 · feedback when the sum is 1 | <ul><li>Feedback for the answer 0.1 says "10 tenths make 1 whole", which gives the answer away.</li><li>It also says 10 tenths are "written with the tenths place right after the point", which is false.</li><li>Frequency: 14.5% of seeds; example `make('d06','AM2',9)`.</li></ul> | "Ten tenths make one whole: write the wholes before the point…", without stating the total. | No wrong-answer message contains the answer. |
| D-11 | U-14 | d06 AL2, d07 SL2 · screen-reader choice labels | The label for the correct layout says "with the decimal points lined up", which is the very property being tested. | Describe each layout neutrally, column by column. | Choice `aria-label`s do not contain "lined up". |
| D-12 | M-02 | d05 K2 · multiple choice | <ul><li>The correct choice is the only one with whole part w+1 (3000 of 3000 seeds).</li><li>Example: seed 7, 1.95 → choices `2.0` (correct), `1.10`, `1.9`, `1.0`.</li></ul> | Add a wrong choice with whole part w+1. | At least 2 choices share the correct choice's whole part. |
| D-13 | M-08 | d03 E1 · multiple choice | "=" is the answer in 75% of seeds (the generator draws `['eq','eq','eq2','ne']`). | Balance the draw to about 50%. | Share of "=" stays between 0.35 and 0.65. |
| D-14 | Q-03 | d10 · Parent Progress | <ul><li>"All lessons complete." is shown when only Lesson 10 is mastered.</li><li>Reproduced on the live site.</li><li>Cause: `js/app.js:104`.</li></ul> | Show it only when every lesson is mastered; otherwise point to the lowest unmastered lesson. | Seed progress with only d10 mastered and assert the text is absent. |
| D-15 | Q-04 | All · progress after 20 Tests | <ul><li>The test history is trimmed to the last 20 (`js/test.js:144`).</li><li>An earlier mastery then disappears from Home and Parent, and "Tests taken" stays at 20.</li></ul> | Store `testsTaken` and `masteredOn` separately from the trimmed history. | 1 mastered test + 20 more: still mastered, and the count shows 21. |
| D-16 | Q-05 | d09, d01, d08 · retakes | <ul><li>Only the previous Test is excluded from a retake.</li><li>A 3rd Test repeats a 1st-Test question (whose answer was shown) in 20% of runs for d09, 16% for d01 and 10% for d08.</li></ul> | Keep a rolling history of the last 3 Tests, with a fallback when the bank runs out. | 3 consecutive Tests for d01/d09 over 200 seeds have no repeated signatures. |
| D-17 | Q-06 | d02 F3, d10 RP2 · expanded-form input | <ul><li>The box is 216 px wide at every viewport (`css/styles.css:266`, `.num-input` max-width), so "80 + 6 + 0.7 + 0.02 + 0.003" is cut off.</li><li>In a Test there is no feedback, so a typo past the visible edge goes unnoticed.</li></ul> | `.exp-input { width: 100%; max-width: 100% }`. | `scrollWidth <= clientWidth` at 320 and 1366 px. |
| D-18 | U-03 | d01 skill `compare` · Teach | <ul><li>The skill has no guided check.</li><li>C2 asks for <, > or =, but those symbols are only explained in d03.</li></ul> | Add a guided check and a one-line symbol reminder to d01 screen 16. | Every skill has at least one guided-check screen. |
| D-19 | U-04 | d01 PL5, d02 F3 · answer input | Typing into a place-value chart, and typed expanded form, are first met in Practice or Test. The guided checks are multiple choice. On-screen instructions reduce the risk. | Use PL5 and F3 as the guided checks. | Format-coverage test (D-04). |
| D-20 | U-05 | d06 AM3, d07 SM2 · number-line add/subtract | <ul><li>Jumps on a number line are only described in words; no line is drawn in Teach.</li><li>AM3 appears in 66% of d06 Tests and SM2 in 100% of d07 Tests.</li></ul> | Add a number-line visual with jumps to Teach screen 1 of each lesson. | Format-coverage test. |
| D-21 | U-06 | d08 K2 · area word problem | Area in square meters appears in 100% of d08 Tests, but Teach only mentions "length × width (area)". | Add a worked example of area with tenths. | Format-coverage test. |
| D-22 | U-07 | d09 W1 · dividing hundredths | <ul><li>No division layout is ever drawn, and all the worked examples use tenths.</li><li>"Quotient" and "divisor" are defined only in the Notes.</li></ul> | Add a division-layout visual and a hundredths example, and define the terms on screen. | Format-coverage test. |
| D-23 | U-08 | d09 W3 · related whole-number fact | "3132 ÷ 9 = 348. Use this to find 31.32 ÷ 9" appears in 100% of d09 Tests and is never modelled. | Add a related-fact step to d09 Teach. | Format-coverage test. |
| D-24 | U-10 | d06, d07, d10 · "Show me how to solve it" | <ul><li>For column computation it shows only "Lined up: 20.35 + 17.54 = 37.89", with no carrying or regrouping steps.</li><li>This weakens recovery after mistakes.</li></ul> | Add a column-calculation visual with carry marks and 2–3 steps. | The solution for a computation template contains a column visual or at least 2 steps. |
| D-25 | U-11 | All · Teach checks and Practice | <ul><li>Keyboard focus drops to `<body>` after a correct answer, or after the third hint disables the button.</li><li>The trigger button gets hidden or disabled.</li></ul> | Move focus to Next or the feedback. Use `aria-disabled` on the hint button. | `activeElement !== body` after both events. |
| D-26 | U-12 | All · Teach "Show next step" | <ul><li>Newly revealed steps are not announced: `.steps` is not a live region.</li><li>After the last step, focus skips past "Why it works".</li></ul> | Give `.steps` `aria-live="polite"`, or move focus to the new step. | DOM assertion. |
| D-27 | U-13 | All · focus indicator | The focus ring colour #f2a900 has contrast 1.77–2.01:1 against the backgrounds, below the 3:1 minimum (WCAG 1.4.11). | Use a two-tone or darker ring. | Contrast unit test on the CSS colour tokens. |
| D-28 | U-15 | d05, d07, d08 · diagrams | <ul><li>Low contrast between diagram parts: area-model fills 1.13–1.24:1, halfway mark 2.69:1, the crossed-out ✗ on shaded squares 1.78:1.</li><li>The answers can still be read from the overlap and the text.</li></ul> | Darker fills, hatching, or outlines. | Contrast unit test. |

## COSMETIC

| ID | Source | Defect | Fix |
|---|---|---|---|
| D-29 | M-07 | d06 AM2 explanation says "1 whole and 1 tenths" (12% of seeds) | Use the singular/plural helper `s()` |
| D-30 | M-09 | d09 Teach "whole" and "word" screens write "7 ÷ 3 = 2 with 1 left over" as an equation | "7 ÷ 3 is 2 with 1 left over" or "2 r 1" (as in the Notes) |
| D-31 | Q-07 | d05 reminder number-line labels are 8.5 px at 320 px wide (simulated) | Larger font size inside the SVG viewBox |
| D-32 | U-16 | All 59 guided-check screens have the same h1 and page title, "Try it together" | Add the topic: "Try it together: Tenths" |
| D-33 | U-17 | Worked-example steps are numbered twice ("1. Step 1. …") | Turn off the list numbering for labelled steps |
| D-34 | Lead | docs/STATUS.md says Lesson 7 has "14 Teach screens"; the code has 13 | Correct the docs |

---

## Observations (not confirmed defects; judgement calls or possibly intentional)

**Assessment design**
- The Test is effectively open-book: a student can leave mid-Test for Teach or Notes and return with answers kept. Nothing records the interruption.
- A blank answer counts as wrong, so 9 right + 1 blank = 9/10 = mastered (after a confirmation prompt).
- Practice counts an answer as "first try" even after all 3 hints (`coach.js:239`), so the Parent "right on the first try" figure overstates independence.
- Pressing Check three times on the same unchanged wrong answer unlocks the full solution.
- Teach guided checks stay solved, with the answer visible, until all progress is erased.

**Answer choices**
- Some wrong choices are never correct: "=" or "They are equal" in d01 C1/C3, d03 S1–S3/L1/L2/NL2 and d10 RC1; two options in d02 R1, whose answer is always choice 1 or 2.
- Some choices have the right verdict but a wrong reason (d01 C4, d03 Y1, d05 A3, d07 SC2, d09 C2).
- In d05 A3 and d06 ES2 the correct choice is uniquely the longest in 40–50% of seeds (chance is 25%).
- In d03 NL2 the shorter decimal is the answer in 64% of seeds.
- On some multiple-choice items the third hint all but names the answer (d08 W3, d07 SC1, d09 C1).

**Lesson content**
- Lesson 10 review items can repeat worked examples from Lessons 1–7, because only d10's own Teach examples are excluded.
- Some terms are defined only in the Notes: factors (d08), quotient and divisor (d09).
- d05 screen "rule" has 209 words, and d01 has 19 screens, which is long for one sitting. d01 has no "Why it works" boxes, unlike d02–d10.
- The d05 "halfway" text says "Mathematicians agreed on one rule". "The rule we use in school" would be more accurate.

**Standards**
- Word form is assessed under 5.NR.4.1, but the secondary-source wording names only standard and expanded form. The official text should be confirmed.
- Multiplying and dividing by 10, 100 and 1000 (d08 P1/P2, d09 P1–P3) may fall within 5.NR.1.2, so the "beyond Grade 5" label may be broader than necessary.

**Display and other**
- At 1920 px wide the content column is 760 px with 18 px text: fine at a desk, small at classroom distance (judgement).
- There is no `prefers-reduced-motion` handling and no favicon, so browsers get a 404 for it.
- Two tabs running the same Practice session could record it twice (by analogy with D-02; not tested).
