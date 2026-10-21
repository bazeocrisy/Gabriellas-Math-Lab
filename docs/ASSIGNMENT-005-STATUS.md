# Assignment 005 — implementation and release evidence

## Implementation

All eight Chapter 4 lessons are implemented in `curriculum/chapter4/` and `js/chapter4.js`. Each has five short Learn screens including a coached guided check, ten-question Practice sessions with three levels, ten Independent Questions, and ten-question independent tests. Tests award mastery only at 9/10 without recorded assistance. Earlier scores are retained. Chapter Review has 24 coached questions; the final assessment has 25 independent questions.

The homepage provides Decimal Skills and Chapter 4 paths. The original ten decimal lessons, Practice Center, printable guides, Parent Progress, scoring, and legacy storage schema are retained. Chapter records use the shared storage service under separate `gml:v1:draft:c4-*` names. Existing records are not migrated or rewritten by Chapter use. Reset removes both curricula's data.

## Source and curriculum audit

The supplied 42-page ordered PDF spans printed pp.99–140. All eight lesson titles and starting pages were checked against scanned pages: 101,107,111,115,119,123,127,131; review begins p135. Content uses original examples and problems rather than reproducing textbook pages. Models consistently define a grid as one whole, a column as a tenth and a square as a hundredth. Whole grids are preserved above one. Number-line coordinates use exact scaled values and distinct captions to avoid overlapping labels.

Instruction covers whole/tenth estimation, compatible numbers, reasonableness (including a thousandths benchmark extension), decimal grids, equivalent decimals, exchanging, partial sums, column arithmetic, decomposition, counting up, compensation, word problems and multistep reasoning. Explicit review/final blueprints ensure model coverage and strategy explanation in the appropriate lessons.

## Independent review

Separate curriculum, QA, UX and regression reviewers audited the implementation. Corrected findings include initialization of arbitrary decimal number-line points, keyboard Practice progression, focus after question transitions, overlapping labels, early-lesson assessment alignment, meaningful difficulty differences, balanced final sampling, weak-skill reporting, result-page assistance tracking, stale-tab assistance preservation, completed-session immutability, and damaged-history rejection.

Curriculum and QA re-review reported no remaining high/critical defects. Independent reviewer arithmetic sweeps included 432,000 generated questions and separate BigInt recomputation. The committed automated suite includes 43,200 generated task cases plus benchmark, model, mastery and variation checks.

## Verification status

Local Node suite: 264 passed, 0 failed. The Chapter 4 real-Chrome browser suite passed 132 checks. GitHub Actions records the complete regression and current-commit gate results. Local Chrome could be installed but this workspace blocks its required process socket; local browser launch cannot provide verification. The GitHub-hosted job uses real headless Chrome, existing end-to-end tests, Chapter tests, all eight Learn/Test flows, refresh/retakes, independent scores, assistance, legacy fixtures and 320/375/768/1024/1440px layouts. Screenshots are uploaded as a workflow artifact for visual review.

**Release rule:** both browser suites must pass and screenshots must be reviewed before merge. Current-commit results are recorded in PR #17 and GitHub Actions; those results are authoritative. No merge is permitted on an unresolved failing gate. The owner explicitly authorized merging after acceptance criteria pass in Assignment 005; this supersedes older approval wording.

## Limitations

Strategy explanations are selected from original explanations and supported by oral explanation prompts; written responses are not automatically graded. Storage is browser-local and cannot detect outside help. No accounts, backend, analytics, names or identifying data were added. A blocked/full storage environment falls back to shared in-memory storage for the current visit.

## Visual review

The UX reviewer inspected nine representative desktop, tablet and mobile screenshots. No critical/high visual defects remained after correcting breadcrumb spacing. The existing Parent Progress at-a-glance table now wraps within narrow phone containers instead of extending beyond its bounds. Post-deployment production browser checks are configured to verify that deployed source matches main and rerun both end-to-end suites.
