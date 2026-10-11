# NumberNova: implementation report

| | |
|---|---|
| Branch | `claude/numbernova`, from verified production `main` `d623166` |
| Status | Built, tested and independently reviewed. **Not merged or deployed.** |
| Live site | Still the previous build, under the old name |
| Repository | Not renamed; the deployment path is unchanged |

## Commits

| Stage | Commit | What |
|---|---|---|
| A | `c42dc5a` | The original Decimal Lab is kept as reference source (`reference/decimal-lab/`), with a reuse analysis. |
| B | `a82d978` | Brand identity: logo, icon, favicon, app icons, manifest; landing page, Learn page, navigation and footer. |
| C | `194c9a9` | Study Guides library. |
| D | `c8466b0` | Practice Center. |
| E–F | `f4de1a9` | Lesson restart controls; Practice Center in Parent Progress; student-profile proposal. |
| Review fixes | `77d7325` | Fixes for the findings of both independent reviews. |
| Docs | the commit that adds this file | README, STATUS, this report. |

## Features

| Area | Status | Notes |
|---|---|---|
| NumberNova name, tagline | Done | Header, page titles, landing page, footer, metadata. No student name on any public screen of the app (the study-guide PDFs are an exception; see Limitations). |
| Logo and icons | Done | Original SVGs plus PNG app icons rendered from them (next table). |
| Landing page | Done | Hero (logo, welcome, short text, topic tags), a resume banner when a practice session is paused, and four section cards. |
| Navigation | Done | Home, Learn, Practice, Study Guides, Parent Progress on every page, marking the current section. On small screens it becomes a Menu button (keyboard, Escape, closes after choosing). |
| Learn | Done | The ten lessons, unchanged, at `#/learn`. All audited Teach, Practice and Test protections are kept. |
| Start Lesson Over | Done | Clears only that lesson's guided answers and revealed steps; keeps tests, mastery, practice and "Teach finished". |
| Start New Practice (lessons) | Done | Confirms before discarding unfinished work; finished sessions are kept. |
| Retake Test | Done | New questions; earlier results and mastery are kept; an unfinished test still cannot be cleared. |
| Practice Center | Done | 7 modes × 10/25/50 questions, wizard, sessions, results, history (see below). |
| Study Guides | Done | 8 existing PDFs; Open, Download, Print; lesson and practice links. |
| Parent Progress | Done | Existing lesson data unchanged, plus a separate Practice Center section and updated rules. |
| Separate student profiles | **Proposal only** | `docs/STUDENT-PROFILES-PROPOSAL.md`. Progress is still one record per browser. |

### Branding assets (`assets/brand/`)

| File | Use |
|---|---|
| `numbernova-logo.svg` | Full horizontal logo with wordmark and tagline |
| `numbernova-icon.svg` | Square icon: a geometric N, a teal orbit and a gold nova star on a blue-to-purple tile |
| `favicon.svg`, `favicon-32.png` | Simplified tab icon (bolder N and star, no orbit) |
| `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png` | App icons |
| `site.webmanifest` | Web app manifest |

**Palette.** Learn blue, Practice green, Study Guides purple, Parent Progress teal. Operations: adding green, subtracting coral-pink, multiplying purple, dividing blue, Mixed multicolor, Challenge gold, Misses teal.

## Practice Center question generation (`js/practice-gen.js`)

There are 33 seeded templates, rebuilt from a template id and seed, so a paused session resumes exactly. All arithmetic is exact.

| Operation | Level 1 | Level 2 | Level 3 | Level 4 | Level 5 | Challenge tiers 1–3 |
|---|---|---|---|---|---|---|
| Adding | tenths, no regrouping | hundredths with regrouping | different numbers of places | whole + decimal, or three numbers | money and measurement stories | three mixed-length numbers; bigger whole parts; carries across the point |
| Subtracting | tenths, no regrouping | hundredths with regrouping | different numbers of places | from whole numbers; across a zero | change and "how much longer" | across several zeros; from 50, 100, 200; two-step money |
| Multiplying | × 10, 100, 1000 | tenths × whole | hundredths × whole | tenths × tenths | prices and area | two-digit whole × decimal; hundredths × tenths (thousandths); larger tenths × tenths |
| Dividing | ÷ 10, 100, 1000 | sharing tenths | decimal ÷ whole number | answers less than 1; a related whole-number fact | money sharing | a zero in the answer; two-digit divisors 11–25; a two-digit sharing story |

**Every question:**
- three hints, none of which contains the answer;
- feedback that names the likely mistake: lined up from the right, no carry, no regrouping, wrong operation, decimal point misplaced, a dropped zero;
- a worked solution: column work with carry and regroup marks; multiplication steps; long division with the division layout.

**Ranges:**
- Adding and subtracting stay within hundredths.
- Products stay within thousandths.
- Division uses whole-number divisors with exact answers, as in Lesson 9. The challenge tier also uses two-digit divisors, with a hint to try multiples.

**Sessions:**
- Questions get harder through the session. A 50-question session is five blocks of ten, and a 10-question session covers all five levels twice.
- Mixed sessions balance the four operations.
- Challenge covers levels 4–5, then the three challenge tiers, for the chosen operation or a mix.
- No problem repeats in a session, and no two questions in a row have the same answer.

**Practice My Misses:**
- **Where weak skills come from:** saved Practice Center results (a miss in the last 10 tries with under 80% right, or a miss last time), and lesson Practice in Lessons 6–9 (under 70% right on the first try, with at least 3 questions).
- **What it gives:** fresh questions on those skills.
- **With no misses recorded:** it says so and offers a general review.

**Results** show:
- questions completed and correct;
- correct on the first try with no hints, and correct with hints or another try;
- incorrect (solution shown) and hints used;
- skills needing review, and accuracy by operation;
- Practice Again, Practice My Misses, Review Related Lesson, and a study-guide link.

**Separation from Tests.** Practice Center results never count as a Test or for ★ Mastered. Opening the Practice Center or Study Guides while a lesson Test is unfinished is noted on that Test (Decision 2).

## Saved-data compatibility

**Unchanged:** lesson progress, tests, mastery and drafts use the same keys (`gml:v1:progress`, `gml:v1:draft:*`). The second reviewer confirmed that data written by the live build loads unchanged.

**New keys:**
- `gml:v1:draft:pc-session`: the current practice session.
- `gml:v1:draft:pc-history`: the last 40 sessions, plus the last 10 results per skill.

Both are repaired field by field when read. "Erase all progress" clears them too.

**Start Lesson Over** uses the existing keys and removes only that lesson's Teach drafts.

## Study guides

- The eight existing PDFs in `study-guides/pdf/decimals/` are linked with repository-relative paths and were not modified or regenerated.
- Tests confirm all eight exist, are real PDFs, and load with HTTP 200 as `application/pdf`. The live site already serves them that way.

## Tests

| Suite | Before (main `d623166`) | After |
|---|---|---|
| `npm test` | 226 | **236/236** |
| `npm run test:browser` | 658 | **705/705** |

**New unit tests** (`tests/numbernova.test.mjs`):
- the study-guide library;
- every Practice Center template, with generic checks plus an independent answer check over 400 seeds each;
- worked solutions;
- every mode and length;
- Practice My Misses;
- history;
- the review regressions.

**New browser checks:**
- branding and assets;
- the four destinations;
- the Learn page;
- Study Guides (all PDFs);
- the wizard (all 33 mode and length choices), sessions, hints, pause and resume, Start New Practice, results, history and misses;
- restart controls;
- Parent Progress practice reporting;
- noting the Practice Center during a Test;
- damaged data, a stale tab, and the phone menu;
- 320 px layouts.

All device results come from headless Chrome emulation.

## Independent reviews

**Reviewer 1: mathematics and instruction**
- Recomputed 66,000 answers and 66,000 worked solutions with its own arithmetic: **0 mismatches**.
- Built 4,500 sessions across all modes and lengths.
- Findings: 0 critical, 1 major (a Practice My Misses session on one small skill could not be built), 7 minor. All fixed in `77d7325` with regression tests.

**Reviewer 2: UX, functional QA and accessibility**
- Branding, navigation, the wizard, sessions, integrity noting, saved-data compatibility, restart controls and responsive layouts (320–1920 px) all passed.
- Findings: 0 critical; 2 major, 4 minor and 5 cosmetic.
- **Major 1** (damaged practice history broke pages): fixed.
- **Major 2** (the study-guide PDFs still carry the old name): not changed, by instruction; see Limitations.
- All minor issues and 3 of the 5 cosmetic ones were fixed in `77d7325`. The other 2 are design choices; see Limitations.

## Limitations

- **Study-guide PDFs still say "Gabriella's Math Lab · Decimals Workbook"** on their covers and footers. This assignment said not to change or regenerate the PDFs or touch the separate study-guide project. Rebranding them needs the owner's decision: edit the HTML sources in `study-guides/lessons/decimals/` and rebuild the PDFs.
- **Original Decimal Lab reference** (`reference/decimal-lab/index.html`) says "Hi, Gabriella!". It is kept unchanged on purpose; no page links to it, but GitHub Pages would serve it at its path. Move it out of the published folder, or delete it after review, if that matters.
- **Separate student profiles are not built.** A proposal is in `docs/STUDENT-PROFILES-PROPOSAL.md`.
- **Whole-number answers.** Add, subtract, multiply and divide answers are never whole numbers, except multiplying and dividing by 10, 100 and 1000. This keeps estimate hints from giving answers away, but a student could notice it.
- **Repository name.** The URL is still `/Gabriellas-Math-Lab/`; renaming the repository needs approval.
- **Testing.** No physical-device, real screen reader, Safari or Firefox testing; device results are simulated in Chrome. No real student has used the Practice Center yet.
