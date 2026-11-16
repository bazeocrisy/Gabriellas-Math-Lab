# StudyNova status

_Last updated: 2026-11-16_

## Current phase: infrastructure built, no class material yet
- The hub (Home, This Week, four subject pages, For grown-ups) is built and shows friendly "nothing posted yet" and
  "coming soon" states. `data/weeks/` holds one empty week (2026-11-16) so the pages have a current week.
- **No class material has been added yet** for any subject. The first real week follows `docs/CONTENT-GUIDE.md`
  once the owner supplies newsletters/homework.
- Publishing is preview-first (`develop` → `/preview/`, owner-approved `main` → production) through
  `.github/workflows/pages.yml`, from an allowlist build that refuses names, scans, external loads and broken links.
- Tests: unit (privacy, data schema, build, workflow, Math), hub browser smoke test, Math browser suites, and the same
  browser suites against the built site.

## Math
- **Moved from NumberNova** into `math/` with its tests in `tests/math/`: decimal lessons (Teach / Practice / Test),
  Chapter 4 (add and subtract decimals), Practice Center, printable study guides, Parent Progress.
- Progress keeps NumberNova's browser keys (`gml:v1:*`) on the same origin, so earlier progress carries over.
- **Chapter 5 was not moved** (nor its Lesson 5-1 page): it was built on scanned textbook pages, which must not be
  published. It returns later as original problems.

## ELA, Social Studies, Science
- Subject pages exist with unit, homework, tests and vocabulary sections and Learn / Practice / Study guides / Tests
  panels that say "Coming soon". No units are defined yet (`data/subjects.json`).

## Next
1. First real week from the owner's material (privacy review first).
2. Units for ELA, Social Studies and Science (`.claude/skills/build-unit`), aligned to the Georgia Standards of
   Excellence for grade 5, with original questions.
3. Chapter 5 for Math as original problems.

## Open items
- Create the `develop` branch and set the `github-pages` environment to allow deployments from `main` and `develop`
  (Settings → Environments), and Settings → Pages → Source: GitHub Actions. Owner action.
