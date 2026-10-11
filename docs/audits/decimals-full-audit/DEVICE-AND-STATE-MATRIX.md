# Device, Accessibility and State Matrix

Build `79abadc`.

**All device results are SIMULATED.** They come from headless Chrome 155 with device-metrics and touch emulation on Windows 11. Nothing was physically verified: no iPhone, iPad, Android device, Safari, Firefox or projector, and no real screen reader.

## 1. Screen and state inventory (simulated at 390×844)

Every lesson was walked like a student would:
- Home card → every Teach screen, revealing steps, and every guided check tried with invalid, wrong and then right answers, using Back and Next.
- → Practice: 8 hint clicks, wrong answer, retry, right answer, refresh mid-session, finish.
- → Test: start, refresh, 7 right / 2 wrong / 1 blank, review, confirm, submit.
- → Results → every "Review in Teach" link → Notes → Home → reload.

The run covered 139 Teach screens with 282 checks.

| State | d01–d10 |
|---|---|
| Lesson entry from the Home card | Pass in all 10 |
| Teach intro, explanations, worked examples (steps gate Next), visuals | Pass in all 10 |
| Guided check: wrong feedback (Next stays locked), right feedback (Next unlocks), "abc" gives a note and isn't counted | Pass in all 10 |
| Back / Next keeps state | Pass in all 10 |
| Practice question; hints 1, 2, 3 (button disabled after 3, saved) | Pass in all 10 |
| Wrong answer, retry, right answer with explanation, completion summary | Pass in all 10 |
| Practice refresh mid-session (same question and position) | Pass in all 10 |
| Test entry; refresh doesn't re-roll questions; no help shown during the Test | Pass in all 10 |
| Review screen (blank answers listed), single submission, results 7/10 not mastered, missed skills | Pass in all 10 |
| "Review in Teach" links land on the right screen | Pass in all 10 (all 30 links valid) |
| Results kept after leaving; Notes; return Home (chips correct); persistence after reload | Pass in all 10 |
| Cross-lesson isolation after all 10 runs (Parent lists each lesson correctly) | Pass |

## 2. Transitions and state leakage

| Scenario | Result |
|---|---|
| Teach → Practice → Test → Results → Parent | Pass |
| Test in progress → Practice of the same lesson | **Fail: D-01.** Open-Test questions can appear in Practice with their solutions. |
| Same Test open in two tabs | **Fail: D-02.** Re-submitted after the answers were revealed; result overwritten. |
| Browser Back from Teach and from results | Pass. Back from results leaves the Test route; Forward shows the same results with no second record. |
| Refresh on Test intro, mid-Test and review | Pass. The same question set is kept; no way to re-roll found in a single tab. |
| Answers present in the Test page's HTML (30 seeds × every template × 10 lessons) | Pass. The one hit was a false match on `maxlength="12"`. |
| Invalid input: "abc", "1..2", ".", "-1", "0,5", "1/2", "5e-1", "½", markup, full-width digits | Pass. Each gets a note, isn't counted, and is escaped when shown back. |
| Spaces, "$0.5", very long input | Pass. Spaces are trimmed, "$" is accepted for money, and input stops at 12 characters (the longest valid answer is 6). |
| Switch lessons after using hints | Pass. No hints or feedback leak into the other lesson; they are restored on return. |
| Lesson 1 → Lesson 10, completed lesson → new lesson | Pass |
| Double submit, double Next, repeated hint clicks | Pass |
| Only Lesson 10 mastered → Parent next step | **Fail: D-14.** Says "All lessons complete." |
| 21st Test after one mastered Test | **Fail: D-15.** Mastery and the test count are lost. |
| Third Test vs first Test | **D-16.** Questions already answered on a results page come back. |
| Unanswered questions and mastery | 9 right + 1 blank = mastered, after a confirmation prompt (observation) |
| Storage blocked (like private mode) | Pass. Works for the visit, and Parent shows a "cannot save progress" warning. |
| Malformed routes (`#/d01/teach/abc`, `#/d11/practice`, …) | Pass. Silently goes Home; out-of-range Teach screen numbers are clamped. |

## 3. Responsive matrix (simulated)

Each cell covers about 9–13 states per lesson:
- Teach screens with visuals and guided checks.
- Practice for every answer type, with the widest question shown with hints and feedback open.
- Test for every answer type.
- Results with all details open, and the Notes.

Six checks ran per state: horizontal overflow, answer controls off-screen, overlapping controls, tap targets at least 44 px, clipped content, smallest SVG text.

| Viewport | Home/Parent | d01 | d02 | d03 | d04 | d05 | d06 | d07 | d08 | d09 | d10 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 320×568 small phone | P | P | m | P | P | c | P | P | P | P | m |
| 390×844 phone | P | P | m | P | P | P | P | P | P | P | m |
| 430×932 large phone | P | P | m | P | P | P | P | P | P | P | m |
| 768×1024 tablet portrait | P | P | m | P | P | P | P | P | P | P | m |
| 1024×768 tablet landscape | P | P | m | P | P | P | P | P | P | P | m |
| 1366×768 laptop | P | P | m | P | P | P | P | P | P | P | m |
| 1920×1080 desktop | P | P | m | P | P | P | P | P | P | P | m |
| 390×600 short | P | P | m | P | P | P | P | P | P | P | m |
| 844×390 phone landscape | P | P | m | P | P | P | P | P | P | P | m |
| 640×800 (≈200% zoom) | P | P | m | P | P | P | P | P | P | P | m |

- **P:** no overflow, no off-screen or overlapping controls, all tap targets at least 44×44 px, nothing clipped. In total: 1,040 renders and 6,240 checks.
- **m:** D-17. The expanded-form answer box cuts off 5-part answers at every width.
- **c:** D-31. Lesson 5 reminder number-line labels are 8.5 px at 320 px.
- **Control check:** a deliberately injected 900 px element was caught, which confirms the overflow check works.
- **Smallest HTML text:** place-value chart headers, 10.6 px at 480 px wide and below.

**Classroom distance** (judgement): at 1920 px the content is a 760 px column with 18 px text and number lines at most 480 px wide. That is readable at a desk but small for a projector or a TV across a room. Browser zoom reflows cleanly.

## 4. Print (simulated)

Print media emulation and `printToPDF` on US Letter were run for all 10 Notes: **pass**.
- Header, skip link, print button, breadcrumbs and mode buttons are hidden.
- Nothing extends past the printable width.
- d01 prints on 3 pages; the others on 2.
- Paper printing was not checked.

## 5. Console and assets

- **Console:** 0 errors or exceptions on every route, locally and live.
- **Files:** 0 missing local files; 35/35 live scripts and styles return HTTP 200.
- **Favicon:** none is declared, so `/favicon.ico` returns 404 (observation).

## 6. Accessibility

Checked from the DOM, the accessibility tree and keyboard-only runs. **No real screen reader was used.**

| Area | Result |
|---|---|
| Keyboard-only completion | Pass for every answer type: multiple choice (arrow keys), steppers, order widget (with a polite live announcement), chart cells, typed number, typed expanded form, and a full Test through submit. |
| Focus after a correct answer or after the third hint | **Fail: D-25.** Focus drops to `<body>`. |
| Focus indicator contrast | **Fail: D-27.** #f2a900 is 1.77–2.01:1 against the backgrounds; at least 3:1 is required. |
| Announcing newly revealed worked-example steps | **Fail: D-26.** The steps list isn't a live region. |
| Feedback and hints announced | Pass. They are in `aria-live="polite"`; the Test uses `role=status` for unreadable input. |
| Control names | Pass, for example "Question 1, not answered" and "< (is less than)". |
| Diagram text alternatives | Pass in general: they describe what is drawn without stating the answer. **Except:** D-06 (number-line positions rounded) and D-11 (alignment labels give the answer away). |
| Headings | Pass. One h1 per screen, h2 for examples, and Home goes h1 > h2 > h3. The guided-check titles are all the same (D-32). |
| Text contrast in the Teach / Practice / Test colours | Pass: buttons 6.09, 5.39 and 7.38:1; mode labels 7.2–8.7:1. Each mode is always named in words as well as by colour. |
| Contrast between diagram parts | **Fail (minor): D-28.** Area-model fills, the halfway mark and the crossed-out ✗. |
| Reduced motion | No `prefers-reduced-motion` handling for the smooth scrolling (observation). |
