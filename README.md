# Gabriella's Math Lab

A simple fifth-grade mathematics learning app supporting classroom understanding and Georgia Milestones preparation.

## Goal
Teach the concept clearly, provide meaningful practice, and assess independent mastery.

## Learning flow
**Teach → Practice → Test**

- **Teach:** one idea per screen, place-value visuals, worked examples revealed step by step, shade-it-yourself models, and guided "Try it together" questions with coaching.
- **Practice:** 10 varied questions per session, three progressive hints per question, misconception-specific feedback, unlimited retries; attempts are not graded.
- **Test:** 10 fresh questions with no hints and no feedback until submission, then score, percent, per-skill results and explanations. Mastery benchmark: 9 of 10 (an app benchmark, not an official Milestones score).
- **Parent Progress:** lesson status, most recent test, skills correct / needing practice, suggested next step. Stored only in this browser.

## Status
**Decimals Lessons 1–8 are live** at https://bazeocrisy.github.io/Gabriellas-Math-Lab/ (Lesson 8, Multiplying, is supplemental). Lessons 9–10 (Dividing Decimals, supplemental, and Mixed Decimal Review) are built and tested on branch `claude/decimals-d09-d10`, awaiting approval to merge and deploy. See [docs/STATUS.md](docs/STATUS.md).

## Run it
It is a static site with no build step and no dependencies.

- Serve the folder with any static web server (for example `npx serve .` or VS Code Live Server), or publish the repository with GitHub Pages. All paths are relative, so it works under `/Gabriellas-Math-Lab/`.
- Routes: `#/` home, `#/d01/teach/1`, `#/d01/practice`, `#/d01/test`, `#/d01/notes` (printable Lesson Notes), `#/parent`; the same for `d02` through `d10`.

## Tests (Node 22+, no npm install needed)
- `npm test` — verifies every question template in every lesson over hundreds of seeds, recomputing each answer independently (answer keys, pictures match numbers, valid choices, hints never contain the answer, feedback for wrong answers), scoring, and question-set rules.
- `npm run test:browser` — drives headless Chrome/Edge through Home, all Teach screens, Practice, Test, Parent Progress, refreshes, damaged saved data, and five viewport sizes. Set `CHROME_PATH` if the browser is not found. Screenshots go to `tests/screenshots/` (ignored by git).

## Project layout
- `index.html`, `css/styles.css`
- `js/decimal.js` exact decimal helpers (digit strings, no floating point) · `js/words.js` number names · `js/models.js` SVG models and place-value chart
- `js/kit.js` shared question-bank helpers · `js/engine.js` question generation, checking (typed, multiple choice, shade-a-model, chart, order, expanded form, ranges), question sets · `js/scoring.js` test scoring · `js/storage.js` local progress
- `js/question-ui.js` answer controls · `js/coach.js` hints and feedback · `js/teach.js`, `js/practice.js`, `js/test.js`, `js/app.js` (routes, home, notes, parent page)
- `curriculum/decimals/lessons.js` unit lesson list · `curriculum/decimals/dNN/bank.js` question templates · `curriculum/decimals/dNN/lesson.js` Teach screens and Lesson Notes (one folder per lesson)
- `tests/` unit and browser tests · `docs/` curriculum, status and audit

## Project principles
- Mobile-first, accessible, and usable on desktops and tablets.
- No account or login required; no analytics or network calls.
- Store progress on the device only; do not collect identifying student data.
- All answer keys, comparisons and feedback are verified by automated tests.
- Practice and Test stay behaviorally separate.
- Build and verify one lesson end-to-end before adding the next.
