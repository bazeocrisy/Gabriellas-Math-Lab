# NumberNova UX improvements

Branch `claude/numbernova-ux` · Stage A (audit and design plan) approved by the owner on 2026-10-11 · Stage B (this work) is not merged or deployed.

## What changed

| Area | Change |
|---|---|
| **Home** | Slim welcome band with a smaller logo. A "Pick up where you left off" card (the furthest unfinished lesson and its next step) beside a paused Practice Center session. The four section cards go 4-across on desktop. The grade and Milestones tags move to the footer (Learn keeps its subtitle). Headings use a slightly rounder system font. |
| **Learn** | A Continue banner. Each card shows the number, title, blurb, a one-line Teach/Practice/Test progress strip, **one recommended step** and small Teach · Practice · Test · Notes links. Mastered lessons are compact. Up to 1200 px wide, with 3 cards per row. |
| **Practice questions** (lessons and Practice Center) | The prompt and picture sit in a problem panel with a large equation. The answer box and Check answer are emphasized. Pause and Start New Practice move into an **Options** menu below the question. After Next question, focus goes to the new answer box. At 1200 px and wider, hints, feedback and the worked solution sit beside the question. |
| **Worked solutions** | Solutions with several steps are shown **one step at a time** ("Show next step (2 of 5)"), with the current step highlighted and focused. Revealed steps are remembered. Practice Center division solutions show the **subtraction and bring-down rows**. |
| **Pictures** | "Show me a picture" before answering: Practice Center adding and subtracting questions show the numbers in columns, and dividing questions show the division layout, when the question does not already show them. Other questions offer "Show me a reminder" (the lesson's existing reminder card). |
| **Practice wizard** | Larger symbols and an example problem on each skill card. On phones the Next button stays in view. Step 3 is a compact summary, and its Back returns to step 2 with the choices kept. All 7 modes and 10/25/50 are unchanged; nothing is preselected. |
| **Parent Progress** | Five overview tiles (lessons mastered, current lesson, latest Test, practice this week, top 3 skills to review), a 10-row "Lessons at a glance" table, then lesson details for started lessons. Lessons not started yet are behind "Show all lessons", and "How Tests and mastery work" is collapsible. Erase stays at the bottom. |
| **Study Guides** | Two groups: Numbers and place value (Sections 1–3) and Operations (Sections 4–8). Each card shows its lessons next to the section number, Open PDF as the main button with smaller Download and Print, and the lesson links as 44 px chips. |
| **Test intro** | The ★ rule is shorter: "Do it on your own to earn ★. If you open lessons or practice during the test, you still get a score, but no ★ this time." The rule itself is unchanged. |

### The recommended next step (Learn and Home)

Worked out from saved progress only; nothing is written.

1. Test started but not handed in → **Continue the Test**
2. Mastered → **Review** (Teach from screen 1)
3. Practice started but not finished → **Continue Practice**
4. Teach started but not finished → **Continue Teach** (the furthest screen reached)
5. Nothing started → **Start**
6. Teach finished, no practice or test → **Practice**
7. Practiced, no test → **Take the Test**
8. After a test without ★:
   - a 9 or 10 with lesson pages opened → **Take the Test again**;
   - practiced since that test → **Take the Test again**;
   - Teach never opened → **Review Teach**;
   - otherwise → **Practice again**. A test with pages opened says "(pages opened)".

Only the first untouched lesson has a filled **Start** button; the other untouched lessons use an outline style.

"Pick up where you left off" shows the highest-numbered lesson with an unfinished Test, otherwise the highest-numbered lesson that is started but not mastered. With nothing started it shows "Start here" (Lesson 1) or "Up next".

## What did not change

- The ten lessons, question text, hints, answer checking, question generation and scoring. The only additions to question objects are the optional `picture` field (Practice Center), and the long-division working rows in the Practice Center division solutions.
- Test scores, mastery, saved progress, practice history and storage keys (no migration). Looking at a page writes nothing new.
- The Practice Center modes and the 10, 25 and 50 choices.
- The study-guide PDFs.

## Tests

- `npm test`: 236/236.
- `npm run test:browser`: 810/810. That is the 705 earlier checks, kept and adapted where the markup changed, plus 105 new checks:
  - next steps, the Continue banner and the Home card for many progress states;
  - Parent Progress tiles, table and folding;
  - the problem panel and Options;
  - Tab order from the answer box, and focus after Next;
  - step-by-step solutions with long-division rows, remembered after a refresh;
  - Show me a picture;
  - the wizard's Back;
  - the short test rule;
  - no sideways scrolling and 44 px tap targets on every main page and a practice question at 320, 390, 768, 1280 and 1920 px.
- Changes to existing tests:
  - Learn reads the new Teach/Practice/Test links.
  - Study Guide titles are now `h3`.
  - Parent Progress tests open the folded sections before reading the page text.

## Independent review

The UX agent reviewed the finished implementation on its own, without editing files. It worked at 320–1920 px, read the full diff, and checked 14 saved-progress states. It found 1 critical, 2 major, 5 minor and 3 cosmetic defects, plus 6 suggestions. All confirmed defects are fixed.

| ID | Finding | Fix |
|---|---|---|
| D1 Critical | The new "Show me a reminder" button appeared on Teach "Try it together" checks before answering, and those reteach notes can state the answer. | The reminder button is offered only on lesson Practice and Practice Center questions (`seeIt`). Teach is as before: the reminder appears only after a wrong answer. |
| D2 Major | After a test without ★, Learn always said "Practice again", even after more practice. | Practicing since the test now gives "Take the Test again". |
| D3 Major | Stepping through a solution was pointless: the finished division picture, the "why" line and "The answer is …" were visible from the start. | The answer lines wait for the last step. The quotient digits and the working rows of the division picture appear with the step that explains them. |
| D4 Minor | Two controls were both called "Show me a reminder" after a wrong answer. | The feedback no longer repeats the reminder that the button already shows. |
| D5 Minor | On the last step, focus jumped to Next question, and revealed steps were both focused and announced. | Focus moves to each revealed step, including the last one; the live region is removed. |
| D6 Minor | A heading sat inside `<summary>`. | "How Tests and mastery work" is a normal heading, followed by a "Show the rules" disclosure. |
| D7 Minor | The sticky wizard Next bar could cover a focused card on phones. | Scroll padding at the bottom on screens narrower than 700 px. |
| D8 Minor | The Learn detail line left out "pages opened" for low assisted scores. | Added. |
| D9 Cosmetic | At 768 px the fifth Parent tile sat alone on its row. | It spans the row. |
| D10 Cosmetic | The two Home continue cards used different layouts. | The paused-practice card uses the same layout. |
| D11 Cosmetic | A compact mastered card stretched and left a gap. | It keeps its own height. |

**Suggestions:**

- **Taken:**
  - S1: one filled Start button.
  - S3: "Review Teach" after a test taken without Teach.
  - S4: the practice tile leads with the total.
  - S5: no "− 0" row before the first digit that can be divided.
- **Not taken:**
  - S2: count "Show me a picture" like a hint in the no-hint figure. That would change how practice results are counted, which the owner reserved. The picture stays optional help, and its use is recorded with the question.
  - S6: pick the most recently active lesson for "Pick up where you left off". Teach progress has no timestamp, so this would need new saved data.

The review also confirmed the following are unchanged: storage keys, scoring, the PDFs, the question text and the hints. The only new saved fields are `model`, `usedModel` and `solStep`, kept with each question's state in practice drafts.
