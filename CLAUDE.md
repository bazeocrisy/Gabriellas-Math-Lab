# CLAUDE.md: StudyNova working rules

StudyNova is a free 5th-grade study hub for four subjects (Math, ELA, Social Studies, Science). It is a static
GitHub Pages site: no build step for the pages, no dependencies, no accounts, no tracking. Read `STATUS.md`,
`docs/DECISIONS.md` and `data/SCHEMA.md` before changing anything.

- Production: https://bazeocrisy.github.io/StudyNova/ (from `main`)
- Preview: https://bazeocrisy.github.io/StudyNova/preview/ (from `develop`)

## Roles
- **Product Owner (the parent)**: supplies class material, approves scope, and **approves every release**. Nothing
  reaches `main` (production) without the owner's explicit approval of that pull request.
- **Claude Code**: builds and tests on `develop` or a feature branch, reports evidence, asks for approval.

## Branch flow (DECISIONS D5)
1. Work on a feature branch from `develop` (or on `develop` for small content updates).
2. Run the tests (below). They must all pass before you push or open a pull request.
3. Push to `develop`. GitHub tests both branches and republishes; the preview updates within minutes.
4. The owner checks the preview on a computer and a phone.
5. Open a pull request `develop` → `main`. Report the PR number, head commit, and test counts.
6. **Wait for the owner's explicit approval.** Never merge into `main`, push to `main`, change Pages settings or
   skip the preview step without it. A merge is not a release: confirm the Pages deployment finished.

## Privacy rules (non-negotiable; DECISIONS D6, D7)
The repository and the site are **public**.
- No student, teacher, school or family names anywhere: not in data, pages, code, docs, commit messages or file names.
  Teachers are shown by role only ("Math teacher"). The blocked-name list lives in one place, `scripts/privacy.js`;
  the build and `tests/unit/privacy.test.js` enforce it. Add a name there, never weaken the check.
- No textbook scans, photos of worksheets or newsletters, or files named like `page-012.png`. No copied answer keys
  and no substantial copied textbook text. All questions, explanations and pictures are original.
- No grades, scores, contact details, addresses, or anything identifying from the class material.
- Raw material from the owner (newsletter photos, homework scans) goes in `private/` (git-ignored) and is never
  committed. If unsure whether something is private, leave it out and ask.
- No analytics, trackers, external scripts, external fonts, CDNs, logins or databases. Links to other sites must be
  `https://`. Saved progress stays in the browser (`sn:v1:*` for the hub, `gml:v1:*` for Math).

## Tests (run before every pull request)
```
npm test             # unit tests: privacy, data schema, build, workflow, and the Math app's unit tests
npm run test:browser # headless Chrome: hub smoke test + Math browser suites (set CHROME_PATH if needed)
npm run build        # allowlist build into _site and verify it (fails on names, scans, broken links, bad data)
npm run test:site    # build, then every browser suite against _site exactly as published
npm run test:all     # all of the above
```
Chrome running as root (containers) needs `--no-sandbox`: `scripts/run-browser-tests.mjs` and the hub harness add
it automatically. Never weaken an assertion to make a test pass; fix the cause or report it.

## How to add a week (skill: `.claude/skills/update-week`)
1. The owner supplies that week's newsletter/homework for any subject (see `docs/CONTENT-GUIDE.md`).
2. Privacy review first: strip every name, grade, contact detail and anything copied from a textbook.
3. Write `data/weeks/<Monday YYYY-MM-DD>.json` following `data/SCHEMA.md`. Any subject may be missing.
4. List it in `data/weeks/index.json` (newest first) and set `current` to the newest week. An unlisted week file is
   a draft: the build leaves it out.
5. `npm test && npm run test:site`, push to `develop`, ask the owner to check the preview, then request approval.

## How to add a unit (skill: `.claude/skills/build-unit`)
1. Name the unit in `data/subjects.json` (`units[]`, with `status`), and point the week's `unit` at it.
2. Build Learn / Practice / Test with original questions aligned to the Georgia Standards of Excellence for grade 5.
   Every answer key is checked by a test. Math units are built inside `math/` (the Math app); other subjects link
   their material through the week's `resources` lists until they have their own pages.
3. If a new folder or file type must be published, add it to the allowlist in `scripts/build-site.js` (and its test).
4. Curriculum, UI, accessibility and QA review (`.claude/agents`), then the normal branch flow.

## Where things are
| Path | What |
|---|---|
| `index.html`, `css/hub.css`, `js/`, `data/`, `assets/brand/` | The hub (routes `#/`, `#/week`, `#/math`, `#/ela`, `#/social-studies`, `#/science`, `#/parent`) |
| `css/tokens.css` | Shared design tokens; every page loads it first |
| `math/` | The Math app (moved from NumberNova); its tests are in `tests/math/` |
| `scripts/build-site.js`, `scripts/privacy.js`, `scripts/validate-data.js` | Allowlist build + verifier, privacy rules, data checks |
| `tests/unit/`, `tests/hub.browser.mjs`, `tests/lib/`, `tests/serve.js` | Hub tests, harness, local server (`npm run serve`) |
| `.github/workflows/pages.yml` | Tests and publishes production + preview |
| `docs/` | Deployment, content guide, decisions |

## Quality bar
Readable for a 10-year-old; works at 390 px phone width through desktop with no sideways scrolling; keyboard
usable with visible focus; one `h1` per view; colour never the only signal; friendly empty states; no console
errors. Never call something finished if it is a mockup or its tests have not passed.
