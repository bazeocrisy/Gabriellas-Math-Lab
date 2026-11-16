# StudyNova build plan (initial build)

StudyNova is a free 5th-grade study hub: four subjects (Math, ELA, Social Studies, Science), each with its own teacher,
units and week, plus one combined This Week view. Static site on GitHub Pages, no build step, no dependencies,
no accounts, no tracking. Progress is saved only in this browser.

## Folder ownership during the initial build (three parallel agents)
| Owner | Paths |
|---|---|
| Hub/design | `index.html`, `css/hub.css`, `js/` (hub only), `data/` (except nothing in math), `assets/brand/` |
| Math port | `math/**`, `tests/math/**` |
| Infrastructure | `package.json`, `scripts/`, `.github/`, `tests/unit/`, `tests/lib/`, `tests/hub.browser.mjs`, `CLAUDE.md`, `README.md`, `STATUS.md`, `docs/` (except this file), `.claude/`, `.gitignore` |
| Shared, read-only | `css/tokens.css` (design tokens; every page loads it first) |

## Fixed decisions
- Routes (hash): `#/` home, `#/week` This Week, `#/math`, `#/ela`, `#/social-studies`, `#/science`, `#/parent`.
  Math links to the moved NumberNova app at `math/index.html`.
- Data model: `data/subjects.json` (four subjects, teacher shown by role e.g. "Math teacher", never a real name),
  `data/weeks/index.json` (list of week start dates, Mondays, ISO), `data/weeks/<YYYY-MM-DD>.json`
  with one block per subject (topics, homework, assessments with dates, vocabulary, notes). Any subject may be missing
  from a week. Empty weeks show friendly "nothing posted yet" states.
- Math progress keeps NumberNova's localStorage keys (`gml:v1:*`). The new site will live on the same origin
  (bazeocrisy.github.io), so existing progress carries over.
- NOT moved: `chapter-5/` and `lesson-5-1/` from the earlier Math site. They are built on scanned textbook pages,
  which must not be published. Chapter 5 returns later as original problems.
- Privacy: no student, teacher or school names; no textbook scans; no copied answer keys. Tests enforce this.
- Site path for local serving and Pages: `/StudyNova/`.
