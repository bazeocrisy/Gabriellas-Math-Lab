# StudyNova

A free 5th-grade study hub: one place to see this week's homework, tests and vocabulary for **Math, ELA, Social
Studies and Science**, plus a full Math practice app. Static site on GitHub Pages: no accounts, no tracking, no
dependencies. Progress is saved only in the browser you use.

- **Site:** https://bazeocrisy.github.io/StudyNova/
- **Preview of upcoming changes:** https://bazeocrisy.github.io/StudyNova/preview/

## What is on it
| Page | Address |
|---|---|
| Home: what's due, upcoming tests, the four subjects | `#/` |
| This Week: everything for the week in one view (earlier weeks: `#/week/2026-11-16`) | `#/week` |
| Subject pages: unit, homework, tests, vocabulary, Learn / Practice / Study guides / Tests | `#/math`, `#/ela`, `#/social-studies`, `#/science` |
| For grown-ups: progress summary, upcoming tests, what the site saves | `#/parent` |
| Math app: decimal lessons, Chapter 4, Practice Center, study guides | `math/index.html` |

Weekly content is JSON in `data/` (format: `data/SCHEMA.md`; how material becomes a week: `docs/CONTENT-GUIDE.md`).

## Run it locally
Needs Node 22 or newer (no `npm install`; there are no packages).
```
npm run serve         # http://127.0.0.1:<port>/StudyNova/
npm test              # unit tests
npm run test:browser  # browser tests (Chrome or Edge; set CHROME_PATH if it is not found)
npm run build         # build and verify the publishable copy in _site
npm run test:site     # build, then browser tests against the built copy
npm run test:all      # everything
```

## How it is published
Pushes to `develop` update the preview; an owner-approved merge into `main` updates the site. Both are built from an
allowlist and only published when every test passes. See `docs/DEPLOYMENT.md`.

## Privacy
The repository is public. It contains no student, teacher or school names, no textbook scans and no copied answer
keys, and the tests and build refuse them. All practice content is original.

## Docs
`STATUS.md` (where things stand) · `CLAUDE.md` (rules for contributors and Claude sessions) ·
`docs/DEPLOYMENT.md` · `docs/CONTENT-GUIDE.md` · `docs/DECISIONS.md` · `docs/BUILD-PLAN.md`
