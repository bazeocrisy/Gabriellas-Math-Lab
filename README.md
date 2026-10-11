# NumberNova

**Learn. Practice. Shine.**

NumberNova (formerly Gabriella's Math Lab) is a friendly Grade 5 mathematics platform for classroom understanding and Georgia Milestones preparation. It starts with decimals and is for any student; no student name is built in.

## Four parts

| Part | Route | What it is |
|---|---|---|
| **Learn** | `#/learn` | Ten interactive decimal lessons, each with Teach, Practice, Test and printable Lesson Notes. |
| **Practice** | `#/practice` | The Practice Center: pick a skill, pick 10, 25 or 50 questions, and practice with hints and step-by-step help. |
| **Study Guides** | `#/guides` | Eight colorful printable decimal workbooks to open, download or print. |
| **Parent Progress** | `#/parent` | Test results and mastery, lesson practice, Practice Center activity, and skills to review. |

## Learning flow (lessons)

**Explain → Show how → Guide → Practice → Test**

- **Teach:** one idea per screen, models and charts, worked examples revealed step by step, and guided "Try it together" questions with coaching. "Start Lesson Over" clears this lesson's guided answers and revealed steps only.
- **Practice:** 10 varied questions per session, with the problem in its own panel and, on wide screens, hints and solutions beside it.
  - Each question has three progressive hints, feedback that names the likely mistake, retries, and a worked solution after three different tries, shown one step at a time.
  - "Start New Practice" asks before it discards unfinished work.
- **Test:** 10 fresh questions, with no hints and no feedback until you submit.
  - **Results:** score, per-skill results and explanations.
  - **Mastery:** 9 of 10 on a test done on its own. This is an app benchmark, not an official Milestones score.
  - **Leaving a test:** a test can be left and resumed. If Teach, Practice, Lesson Notes, the Practice Center or the Study Guides is opened while it is unfinished, it is still scored but does not count for ★ Mastered.
  - **Retaking:** "Retake Test" gives new questions and keeps earlier results.

## Practice Center

| Feature | Details |
|---|---|
| Skills | Seven choices: Adding, Subtracting, Multiplying, Dividing, Mixed Operations, Challenge Mode (choose an operation or a mix), and Practice My Misses. |
| Length | 10 (Quick), 25 (Good) or 50 (Full) questions. |
| Difficulty | Questions get harder through the session. A 50-question session is five blocks of ten, and even 10 questions cover all five levels. |
| Help | The same coaching as the lessons. Sessions save automatically, so they can be paused, resumed or restarted (with confirmation). |
| Practice My Misses | Uses saved practice mistakes, from the Practice Center and from lesson Practice in Lessons 6–9. With none recorded, it says so and offers a general review. |
| Results | Correct, first try with no hints, correct with help, incorrect, hints used, skills to review, and links to the related lesson and study guide. |
| Mastery | Practice Center results never count as a Test or for mastery. |

## Status

NumberNova is live at https://bazeocrisy.github.io/Gabriellas-Math-Lab/: all ten decimal lessons with the audit corrections, the Practice Center, Study Guides and Parent Progress. See [docs/STATUS.md](docs/STATUS.md), [docs/NUMBERNOVA-IMPLEMENTATION.md](docs/NUMBERNOVA-IMPLEMENTATION.md) and [docs/UX-IMPROVEMENTS.md](docs/UX-IMPROVEMENTS.md) (the layout and usability improvements on the `claude/numbernova-ux` branch).

## Run it

It is a static site with no build step and no dependencies.

- Serve the folder with any static web server (for example `npx serve .` or VS Code Live Server), or publish the repository with GitHub Pages. All paths are relative, so it works under `/Gabriellas-Math-Lab/`.
- **Routes:**
  - Home: `#/`
  - Lessons: `#/learn`, `#/d01/teach/1`, `#/d01/practice`, `#/d01/test`, `#/d01/notes`, and the same for `d02` through `d10`.
  - Practice Center: `#/practice`, `#/practice/session`, `#/practice/results`
  - Study Guides: `#/guides`
  - Parent Progress: `#/parent`

## Tests (Node 22+, no npm install needed)

### `npm test`

- Every question template in every lesson and in the Practice Center is checked over hundreds of seeds, and each answer is recomputed independently. The checks cover:
  - answer keys and that pictures match the numbers;
  - valid choices;
  - hints that never contain the answer;
  - feedback for wrong answers.
- Scoring and question-set rules.
- `tests/integrity.test.mjs` holds the audit checks: answer clues, Test integrity, saved-progress compatibility, "teach what is tested", number-line descriptions, and contrast.
- `tests/numbernova.test.mjs` covers:
  - the study-guide library (all eight PDFs present);
  - Practice Center generators, with an independent answer check;
  - session rules for every mode and length;
  - Practice My Misses and the practice history.

### `npm run test:browser`

- Drives headless Chrome or Edge through every part of the app, including:
  - the landing page and branding;
  - the Learn lessons;
  - the Practice Center wizard (every mode and length), session and results;
  - Study Guides;
  - restart controls;
  - Parent Progress.
- It also checks Test integrity, saved progress from earlier versions, keyboard focus, and viewport sizes from 320 to 1920 px.
- Set `CHROME_PATH` if the browser is not found.

## Project layout

- **Page and styles:** `index.html`, `css/styles.css`. Brand assets are in `assets/brand/`: the logo, icon, favicon, app icons and web manifest.
- **Helpers:**
  - `js/decimal.js`: exact decimal helpers (no floating point)
  - `js/words.js`: number names
  - `js/models.js`: SVG models, number lines, place-value charts, column and division layouts
- **Question engine:**
  - `js/kit.js`: shared question-bank helpers, including worked column solutions
  - `js/engine.js`: question generation, answer checking and question sets
  - `js/scoring.js`: test scoring
  - `js/storage.js`: local progress
- **Lesson modes:** `js/question-ui.js`, `js/coach.js` (hints and feedback), `js/teach.js`, `js/practice.js`, `js/test.js`
- **New sections:**
  - `js/practice-gen.js`: Practice Center question generators
  - `js/practice-center.js`: Practice Center wizard, session, results and history
  - `js/guides.js`: Study Guides
  - `js/app.js`: routes, landing page, Learn, Notes, Parent Progress
- **Curriculum:**
  - `curriculum/decimals/lessons.js`: the lesson list
  - `curriculum/decimals/dNN/bank.js`: question templates
  - `curriculum/decimals/dNN/lesson.js`: Teach screens and Lesson Notes
- **Study guides:** `study-guides/`, with the printable PDFs in `study-guides/pdf/decimals/` and their editable sources.
- **Reference:** `reference/decimal-lab/` is the original standalone practice app. It is kept unchanged and is not loaded by the site.
- **Tests and docs:** `tests/` holds the unit and browser tests; `docs/` holds the curriculum, status, audits, the NumberNova implementation report and proposals.

## Project principles

- Mobile-first, accessible, and usable on desktops and tablets; reduced-motion preferences are respected.
- No account or login, no analytics, and no network calls.
- Progress is stored on the device only, and no identifying student data is collected.
- All answer keys, comparisons and feedback are verified by automated tests.
- Practice and Test stay separate, and practice never awards mastery.
