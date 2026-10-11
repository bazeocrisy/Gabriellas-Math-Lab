# Reference: the original Decimal Lab practice app

`index.html` is an unchanged copy of the original standalone practice app, `Gabriella's Decimal Lab.html` (29,174 bytes, SHA-1 starting `3f0815f06ae4`). It was copied from the owner's Downloads folder on 2026-10-11.

**It is reference material only.** The NumberNova app does not load it, link to it or deploy it as a page. Keep it unchanged so later work can be compared with the original.

## What the original does

| Area | Original Decimal Lab |
|---|---|
| Operations | Adding, subtracting, multiplying, and "Mix it up" (all three, shuffled). **No division.** |
| Session | Always 25 problems; no choice of length. |
| Difficulty | Five generator tiers per operation, easiest to hardest, spread evenly across the 25 problems. |
| Problems | Integer-scaled decimals (no floating-point errors); add/subtract drawn vertically with the points lined up; repeats avoided within a round. |
| Help | Two hints (a method reminder, then an estimate) plus a "How to do it" overlay per operation. |
| Feedback | Right or wrong only. A wrong answer shows the answer and steps at once; there is no retry, and the feedback does not name the mistake. |
| Results | Score, a list of missed problems, "Try the missed again", "New round". |
| Motivation | Stars, a streak counter, a progress-dot strip, confetti (turned off under reduced motion). |
| Saving | None: refreshing the page loses the round. |
| Brand and privacy | "Hi, Gabriella!" and "Nice work, Gabriella!" are hard-coded. Google Fonts are loaded from the internet. |

## What NumberNova's Practice Center reuses

| Reused idea | How it is used in the Practice Center |
|---|---|
| A color for each operation | Adding green, subtracting coral, multiplying purple, dividing blue, Mixed multicolor, Challenge gold, Practice My Misses teal (the NumberNova palette). |
| Problems ordered easy to hard (five tiers) | Five difficulty levels for each operation, spread through every session. A 50-question session runs as five blocks of ten, and even a 10-question session covers all five levels. |
| Integer-scaled exact arithmetic | Done with the app's existing, already-tested `js/decimal.js` helpers (exact thousandths), not the original code. |
| Vertical layout with the points lined up | The existing `models.vertical`, plus `models.longDiv` for division. |
| The method hint and the estimate hint | Kept as hints 1 and 2. A third, step-specific hint is added (NumberNova uses three progressive hints). |
| Worked steps after a miss | The existing worked column solution (`kit.columnSolution`), plus new step-by-step multiplication and division solutions. |
| "Try the missed again" | Becomes **Practice My Misses**: weak skills are taken from saved practice history, and the questions are fresh, not the same ones repeated. |
| Progress indicator | "Question 12 of 50" with a progress bar (a strip of 50 dots would be too small on a phone). |
| Reduced-motion respect | Kept. No confetti or other movement. |

## What is not reused, and why

| Not reused | Reason |
|---|---|
| The original JavaScript | It uses `Math.random` with no seed, so a session could not be saved and resumed. It has no division and no feedback that names a mistake. The Practice Center uses seeded generators that plug into the app's audited question engine and coaching. |
| Showing the answer right after one wrong try | The audited coaching flow is used instead: hints, feedback that names the mistake, retries, and a worked solution only after several different tries. |
| Hard-coded "Gabriella" | NumberNova is for any student, so the wording is general. |
| Google Fonts | The app makes no network calls; it uses system fonts. |
| Stars, streaks and confetti | Left out for now, so the focus stays on accuracy and help used. They could be added later behind a setting. |
