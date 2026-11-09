# Handoff: build Chapter 7 (Fractions) exactly like Chapter 5

**For:** the next Claude Code session, working unattended.
**Student:** the owner's son. Gabriella's Chapter 5 is the reference build.
**Repository:** https://github.com/bazeocrisy/Gabriellas-Math-Lab (GitHub Pages: https://bazeocrisy.github.io/Gabriellas-Math-Lab/)
**Owner input you will receive:** the Chapter 7 textbook PDF.

---

## 0. Kickoff prompt (the owner pastes this, with the PDF attached)

> You are taking over Gabriella's Math Lab (repo `bazeocrisy/Gabriellas-Math-Lab`). Read `docs/HANDOFF-CHAPTER-7.md` in full and follow it exactly. Build Chapter 7 (Fractions) for my son the same way Chapter 5 was built: the interactive book, the review quiz, the printable Unit Review packet, and an entry in Study Guides.
>
> The Chapter 7 PDF is attached [or: is at `incoming/chapter-7.pdf` in the repo / Google Drive link: ___]. My son's name for the title pages is: ___.
>
> Work unattended. Use multiple agents (Agent tool; you may also run a Workflow) for authoring, independent checking, design audits and verification, as the handoff describes. Do not change any Chapter 7 textbook content: the pages must stay identical to the PDF.
>
> When everything passes, merge to main and confirm it is live. If a merge or deploy is blocked by permissions, stop at a green pull request and report the link. At the end, send me the live links and the Unit Review packet PDF.

**Before starting, the owner should:**
1. Attach the PDF, or upload it to the repo as `incoming/chapter-7.pdf`. A 17 MB PDF is too big to pull through the Google Drive connector reliably.
2. Allow merges, or be ready to approve them. In past sessions the permission checker blocked `gh api -X PUT .../pulls/N/merge` as a "production deploy". Adding a Bash permission rule for that command lets the session finish unattended.

---

## 1. What "done" means (deliverables)

| # | Deliverable | Where | Reference (Chapter 5) |
|---|---|---|---|
| 1 | **Interactive Chapter 7 book.** Every page exactly as printed, typed answer boxes, Pencil/eraser, a "?" beside every problem, and a hint, steps and answer in a right-hand pane. On phones it shows one problem at a time. It is installable as an app and works offline. | `chapter-7/` | `chapter-5/` |
| 2 | **Unit 7 Review Quiz.** 24 new questions (8 multiple choice, 8 fill in the blank, 8 true/false) on the Unit Review's skills, with hints, explanations, score, practice of missed questions, and saved progress. | `chapter-7/review/` | `chapter-5/review/` (PR #30) |
| 3 | **Unit Review packet PDF.** Title page, Study Guide, the Unit Review pages unchanged from the PDF, and the Answer Key, in one PDF with bookmarks. | `study-guides/pdf/fractions/` + sent to the owner | Section 7 below |
| 4 | **Home-page cards.** "Chapter 7: …" (book) and "Unit 7 Review Quiz". | `js/app.js`, `css/styles.css` | Chapter 5 cards |
| 5 | **Study Guides entry.** The packet (and the separate study guide) appear in Study Guides with Open/Download/Print. | `js/guides.js`, `study-guides/pdf/fractions/` | the decimals list in `js/guides.js` |
| 6 | **Tests and CI.** Unit, browser and device tests for Chapter 7, added to `.github/workflows/quality.yml`. | `tests/` | `chapter5.*`, `devices.*`, `review-quiz.*` |
| 7 | **Report.** What was built, how it was checked, the owner's judgement calls, and test counts. | `docs/gml-0NN/REPORT.md` | `docs/gml-007/REPORT.md` |

---

## 2. Rules that must not be broken

1. **The textbook is the authority. Do not change Chapter 7 content.**
   - Render pages exactly (PyMuPDF 3×, full page, PDF rotation honoured, no cropping or retouching), then compress them losslessly (oxipng).
   - Prove that every page is pixel-identical to the PDF render with an audit script.
   - Never retype, redraw or "clean up" a page.
   - Overlays (answer boxes, "?" buttons, outlines) are drawn on top of the page and never alter it.
   - "Original only" must hide all of them.
2. **The Unit Review pages in the printed packet are copied from the PDF unchanged** (`insert_pdf`; never re-rendered). Check that they are identical to the book and that rotated pages still display upright.
3. **Every answer must be verified.**
   - Compute it with Python. For fractions, use `fractions.Fraction`, never floats.
   - Confirm it a second way: an equivalent fraction, a model, an estimate, or the inverse operation.
   - Have an independent checker agent solve every problem from the page image before reading the authored answer. In Chapter 5 this caught a misread number (2,368 read as 2,398) that the author had "verified".
4. **Study-guide examples and quiz questions use new numbers**, with the same skills and the same order as the Unit Review. Never copy textbook wording or problems into the study guide or quiz. Explanations are original.
5. **Separate saved work.** Use the storage key `gml:chapter-7:v1` and the quiz key `gml:unit7-review-quiz:v1`. Never read or write the Chapter 5 keys. Two children may share one iPad.
6. **iPad first, with phones and computers also working.**
   - Touch targets are 44px or more. With a mouse, controls are 36px.
   - Nothing overflows sideways.
   - The `maximum-scale=1` viewport stops iOS zooming the page on input.
   - Pinch zooms only the page.
7. **Nothing is "done" until tests pass locally and in GitHub CI, and the audits are fixed and re-verified.**
8. **Owner-facing language is plain:** no jargon, and say what to tap.

---

## 3. Read this first: the reference implementation

Read these files before writing any code. Chapter 7 should copy their behaviour.

**Chapter 5 book: `chapter-5/`**
- `index.html`
  - One slim top bar: logo, page picker grouped by lesson, writing tools, zoom, Original only, a More menu, save status, Home.
  - Also: the workspace, the solution pane, the phone problem bar, and the More menu, which links to `review/`.
- `app.js`
  - **Storage, undo and drawing:** storage and migration; undo/redo per page; drawing with Pencil/palm rejection (a single pointer draws, stylus wins, Pencil + palm is not a pinch); the eraser.
  - **Zoom:** pinch-to-zoom around the fingers, and ctrl+wheel zoom.
  - **The "?" buttons and pane:** "?" spacing (`spaceMarkers`, which moves a "?" to the free margin when a line is crowded); the outline `frameOf(q, pad, strict)` around the problem and its own answer boxes; the right pane (1000px and wider) or bottom sheet (`syncHelpSpace`).
  - **Phone problem view:** `focusProblem`, `stepProblem`, swipe.
  - **Other:** the service worker registration; prefetch of the open lesson; tab sync across windows (`storage` event).
- `style.css`: design tokens; responsive rules (1000px+ never wraps the bar; touch tablets up to 1366px use a compact bar; phones get two rows); `--min-box` gives touch screens taller answer boxes; typed answers use a handwriting font.
- `lib/storage.js` (compact saves, robust migration), `lib/ink.js` (points rounded to 4 decimals).
- `sw.js`: network-first with `no-cache` for code and data, cache-first for page images; clone a response before using it; offline fallback only for navigations.
- `manifest.webmanifest`: scope `../` so Home stays inside the app.
- `data/`: `pages.json`, `manifest.json`, `fields.json`, `questions.json`, and `parts/*.json` (one per author).

**Tools: `tools/`**
- `render-chapter5.py`, `audit-chapter5-source.py`: render pages and check them pixel for pixel.
- `chapter5_sections.py`: the section map (page offset: printed = PDF page + 140).
- `validate-chapter5-part.py`: the data schema, documented in its docstring.
- `preview-chapter5-page.py`: overlay preview used by authors and checkers.
- `build-chapter5.py`: merges the parts into `data/`.

**Tests: `tests/`**
- `chapter5.test.mjs`, `chapter5.browser.mjs`: every page, every "?", overlaps, saving, migration, print.
- `devices.browser.mjs`: 14 phone, tablet and laptop sizes; problem view; pinch; one-row bar.
- `review-quiz.test.mjs`, `review-quiz.browser.mjs`.
- `lib/harness.mjs`: shared server and Chrome over CDP.

**Quiz: `chapter-5/review/index.html` + `quiz.json`.** This is on branch `claude/unit5-review-quiz`, PR #30. If PR #30 is still open, merge it first if allowed (its CI is green). Otherwise base the Chapter 7 quiz on that branch's files.

**Reports and evidence:** `docs/gml-006/`, `docs/gml-007/`, `docs/gml-008/`, `docs/gml-009/`.

---

## 4. Build plan

### Phase 0: Setup (lead)

**Clone and branch**
- Use the commands in the session's add-repo instructions to clone the repo.
- Create a branch `claude/chapter-7-fractions`.

**Chrome as root**
- Chrome refuses to run as root without `--no-sandbox`.
- Create the wrapper `$SCRATCH/chrome`: `exec /opt/pw-browsers/chromium-*/chrome-linux64/chrome --no-sandbox "$@"`
- Run the harness tests with `CHROME_PATH=$SCRATCH/chrome`.

**Python libraries:** `pip install pymupdf pyoxipng`.

**Baseline:** run `npm test` and each browser suite to record the starting counts.

**GitHub CLI**
- GraphQL is blocked, so use the REST API through `gh api` for pull requests: create, update, merge, check-runs, job logs.
- The clone is shallow. Add a fetch refspec for every branch you push, otherwise stop hooks report "no remote branch":
  - `git config --add remote.origin.fetch "+refs/heads/<b>:refs/remotes/origin/<b>"`
  - then `git fetch origin`.

### Phase 1: Source intake and section map (lead)

**Store and fingerprint**
- Put the PDF at `chapter-7/source/source.pdf` and record its SHA-256.
- Do not commit the PDF if the owner prefers not to. Chapter 5 kept its source at `lesson-5-1/assets/source.pdf`.

**Map the sections**
- Map every PDF page to its printed page number and section: unit opener, Lessons 7-1 … 7-N, any checkpoint or probe, Unit Review, Fluency.
- Use `page.get_text()` for "Lesson 7-x" and the page footers.
- Even pages are often rotated 180°; their OCR text is garbled, so look at the rendered images.

**Write `tools/chapter7_sections.py`**
- Prefer generalising the Chapter 5 tools with a `--chapter` argument.
- Chapter 5's outputs must stay byte-identical; its tests prove that.

**Render:** use the Chapter 5 render pipeline, then run the pixel audit. All pages must pass.

### Phase 2: Viewer scaffold (lead)

- Copy `chapter-5/` to `chapter-7/`.
- Change: the storage key, the manifest name and title ("Chapter 7"), the section labels, and the title texts. The app gets these from `data/manifest.json`.
- Keep every behaviour from Section 3.
- **Fractions in the "?" pane:** answers like `3/4`, `1 2/3` and `5/12` must read well. Consider a small renderer that stacks fractions, used only in the pane (never on the page image).

### Phase 3: Content authoring (parallel agents: one per lesson; the unit opener/probe and the review/fluency pages may be grouped)

**Write the brief from Section 5.1.** Each author writes `chapter-7/data/parts/<part>.json`:
- answer boxes over every blank;
- a "?" anchor and side for each problem;
- a crop around each problem;
- a hint, 2–4 steps, the answer, `openEnded`, and verification notes.

**Before reporting, each author must:**
- pass `validate-…-part.py`;
- check the overlay previews.

**Fraction rules for authors**
- Give answers in simplest form unless the problem asks otherwise.
- Write mixed numbers as `1 1/2` and improper fractions as `3/2`, matching what the page asks for.
- Name the model the page uses (fraction strips, number lines, area models).
- Use Python `Fraction` for every value.

### Phase 4: Independent math check (3 agents, Section 5.2)

**Checkers**
- Split all pages between them.
- Each solves every problem from the page image before reading the authored answer.
- Each reports only problems and exact fixes.

**The lead**
- Applies the fixes.
- Looks at every disputed item personally, by cropping the image.
- Re-runs the validators and the build.

### Phase 5: Design and device audit (5 agents in parallel, Section 5.3), then fixes, then 2 verifiers

**Auditors**
1. iPad: Air and mini, portrait and landscape; Pencil and touch; rotation; the pane and the sheet.
2. Laptop and desktop: 1024–2560px; keyboard and tab order; ctrl+wheel; print.
3. Visual check of every page: boxes on blanks, "?" level with the problem, outlines, typing fits.
4. Saving, offline and install: migration, backup and restore, two tabs, service worker, manifest, quota.
5. Code review: real bugs only, confirmed by reproduction.

**After the fixes**
- Two fresh verifier agents re-check every reported item and look for regressions.
- Loop until clean. One known limit is acceptable: crowded rows at 1024px with the pane open.

### Phase 6: Unit 7 Review Quiz (lead writes it, 1 checker agent)

**The quiz**
- 24 questions in `chapter-7/review/quiz.json`, with the same skills, order and coverage as the Chapter 7 Unit Review, but with new numbers.
- 8 multiple choice (exactly one correct option), 8 fill in the blank, 8 true/false.
- Each question has a hint that does not give the answer away, an explanation, and the lesson it belongs to.

**Grading fractions**
- Extend the quiz grader for fraction answers:
  - accept `3/4`, `6/8` (when the question allows equivalent forms), `1 1/2`, `3/2`, and spaces;
  - when the question says "simplest form", accept only simplest form;
  - store the accepted forms in each question as `accept`.
- The iPad keyboard for fractions needs `/`. Use `inputmode="text"` or a small on-screen fraction keypad, not `numeric`.

**Checking**
- `review-quiz.test.mjs`-style tests recompute every key with `Fraction`.
- One checker agent re-solves every question.

### Phase 7: Printable packet (lead, 1 checker agent, 1 print-audit agent)

**1. Study guide** (HTML printed to PDF with Playwright, Letter page, `break-inside: avoid` per question)
- One section per Unit Review question, in order, with:
  - what the question asks;
  - a "Remember" tip;
  - a worked example with new numbers;
  - a "Try it" problem.
- The Try-it answers go on the last page.
- Fraction visuals are original inline SVG: fraction strips and number lines.

**2. The parts**
- **Answer key:** one page, "For the parent: keep separate", built from the verified `questions.json` answers for the Unit Review pages.
- **Unit Review:** the pages copied unchanged with `insert_pdf`.
- **Title page:** the student's name and date lines, a table of contents with page ranges, and the four steps.

**3. Merge** into `Unit-7-Review-Packet.pdf` with bookmarks for each part. Also keep the separate Study Guide PDF.

**4. Print audit** (agent and lead)
- The page count matches the table of contents, and every page is Letter.
- No question section is split across pages: render every page and look.
- The Unit Review pages are pixel-identical to the PDF and upright.
- The file size is reasonable.

### Phase 8: Integration (lead)

**Home page (`js/app.js`)**
- Add the cards: "Chapter 7: <title from the book>" linking to `chapter-7/`, and "Unit 7 Review Quiz" linking to `chapter-7/review/`.
- Update the Chapter 4 home test, which counts the cards.
- Check the grid layout in `css/styles.css` (the `.c4-home` columns).

**Study Guides**
- Add a fractions group in `js/guides.js`, next to the decimals list, with files in `study-guides/pdf/fractions/`:
  - the Unit 7 Review Packet;
  - the Unit 7 Study Guide (without the answer key, so the student can use it alone).
- Open, Download and Print must work, as for the existing guides.

**Inside the book:** the Chapter 7 More menu links to the quiz.

**Tests and CI**
- Add `chapter7.test.mjs`, `chapter7.browser.mjs`, the device suite for Chapter 7, and the quiz suites.
- Add them to `package.json` and the `quality.yml` matrix.

### Phase 9: Ship (lead)

**Commit**
- Commit in logical commits.
- Before each commit, run `git checkout docs/gml-00*` for screenshots that tests rewrote, unless you meant to update them.

**Pull request**
- Push, then open the pull request with the REST API.
- Wait for every GitHub check. Poll the check-runs in a background loop.
- **If CI fails:** read the job log (`gh api repos/.../actions/jobs/<id>/logs`), fix the root cause, and push again.
- **Known trap:** GitHub's machines use wider fonts. Bars that fit locally wrapped in CI. The fix is a bar that never wraps at 1000px and wider, so text shrinks instead. Test with wider simulated fonts (letter-spacing and DejaVu Sans).

**Merge and confirm**
- Merge with `gh api -X PUT repos/bazeocrisy/Gabriellas-Math-Lab/pulls/N/merge`.
- Wait for the "pages build and deployment" run to succeed.
- The session's network cannot reach github.io. Use the deploy run and the repository's own "Verify production Pages" workflow as proof that the site is live.

**Deliver to the owner**
- The live links:
  - `https://bazeocrisy.github.io/Gabriellas-Math-Lab/chapter-7/`
  - `…/chapter-7/review/`
  - the home page.
- The packet PDF, sent as a file.
- A short summary in plain language.

---

## 5. Agent briefs (adapt these; each brief is the agent's only context)

### 5.1 Page author (one per lesson)

> **Your task**
> - Author data for a 5th-grade interactive textbook: Chapter 7, pages ___ (sections ___).
> - Output ONLY `chapter-7/data/parts/<part>.json`, following the schema in the docstring of `tools/validate-chapter7-part.py`.
>
> **Inputs**
> - Page images: `chapter-7/assets/page-NNN.png` (1836×2376, exact and upright). Read them with your Read tool and do not modify them.
> - Gold-standard style: `lesson-5-1/data/questions.json` and `chapter-5/data/parts/*.json`.
>
> **What to produce**
> - **Answer boxes:** put a box over every place the student writes, including the Name line. Use `multi:true` for work areas.
> - **One question per numbered problem or sub-part**, plus Be Curious / Work Together / Reflect / "Math is…" prompts.
> - **Each question has:**
>   - an id equal to its main answer box's id;
>   - a title like "Problem 7 · 3/4 + 1/8";
>   - a one-sentence hint that does not give the answer;
>   - 2–4 kid-friendly steps;
>   - the answer;
>   - `openEnded` (true for opinion prompts, with "Sample answer: …").
> - **Placement:**
>   - the anchor is the problem's vertical centre as a fraction of the page height;
>   - side left or right is the margin nearest the problem;
>   - the crop is the whole printed problem.
> - **Checking:** set `verified:true`, and write the verification as how you checked it.
>
> **Math rules**
> - Compute every value with Python `fractions.Fraction`.
> - Give answers in simplest form unless the page asks otherwise.
> - Check each answer a second way.
> - Never invent page content. If something is unreadable, say so.
>
> **Placement checks**
> - Run `python3 tools/preview-chapter7-page.py <part> <page> <out.png>` and Read the PNG. Boxes must sit on the blanks and never cover printed text or art.
> - Then run the validator until it prints PASS.
>
> **Limits**
> - Do not edit other files and do not commit.
> - Put scratch files in `$SCRATCH/agents/<part>/`.
>
> **Report (200 words or fewer):**
> - the file path, the validator result, and the counts per page;
> - the section title as printed;
> - anything uncertain or unreadable.

### 5.2 Independent math checker (3 agents; split the pages)

> **Your task:** check `chapter-7/data/parts/<parts>.json` against the page images. Do NOT edit files.
>
> **For every question**
> 1. Crop its `crop` rect from `chapter-7/assets/page-NNN.png` (upscale it) and Read it. If the problem isn't inside, that is a finding.
> 2. Solve it yourself with `fractions.Fraction` BEFORE reading the authored answer, then compare.
> 3. Check the hint doesn't give the answer away, the steps are right and suit a 10-year-old, and the title matches the number. For multiple choice, check every option.
>
> **For every page:** run the overlay preview. Every blank must have a box, no box may cover text or art, and each "?" must be level with its problem.
>
> **Report (300 words or fewer):** real math errors first, then the page, question id, problem and exact correction. Say "no findings" for clean pages.

### 5.3 Auditors (5 in parallel; all report only, never edit)

**General instructions for every auditor**
- Serve the repo with `python3 -m http.server <unique port>`.
- Use Playwright: `require('playwright')`, `chromium.launch()`.
- Read your screenshots.
- Report a prioritised list of concrete problems (what, where, the steps to reproduce, a suggested fix), and say plainly which areas are clean.

1. **iPad**
   - Sizes: 820×1180, 1180×820, 768×1024, 1024×768, and the 1024/1366 Pro, all with `hasTouch`/`isMobile`.
   - Check the bar, tapping "?" on top, middle and bottom problems, the pane versus the sheet, rotation, Pencil strokes, pinch, the eraser, undo, typing, the More menu, and the page picker.
2. **Laptop and desktop**
   - Sizes: 1024–2560px.
   - Check the layout, every "?" on several pages, tab order, Escape, ctrl+wheel, mouse drawing, Original only, Prev/Next across sections, print (`#printRoot` holds only the open lesson), and console errors.
3. **Visual check of every page**
   - At 1180×820 touch, on every page: boxes on blanks and off text and art; "?" level with its problem; no overlaps; the outline contains the problem and its boxes; typed text fits.
   - Give corrections as fractions measured on the 1836×2376 image.
4. **Saving, offline and install**
   - Persistence across reload and restart.
   - Old or corrupt data, the recovery export, backup and restore, two tabs.
   - The service worker: offline, updates with no stale code, no "body already used" error.
   - The manifest and iOS meta tags.
   - Storage full.
5. **Code review**
   - Real bugs only, each confirmed: event handling (Pencil, palm, pinch), state (undo, pane, problem view), iPad Safari quirks, the service worker, storage, performance.
   - Give `file:line` and the fix.

### 5.4 Verifiers (2, after the fixes)

- Give each verifier the exact list of fixed items.
- They mark each one PASS or FAIL with evidence, and report any regressions.
- One verifier covers UI and devices; the other covers saving, offline and data.

### 5.5 Quiz checker, study-guide checker and print auditor

- **Quiz checker:** re-solve all 24 questions. Check there is exactly one correct option for each multiple choice, that the fill-in answers are unambiguous (and accepted forms are listed), and that the hints are fair.
- **Study-guide checker:** check every example and Try-it answer, and that every Unit Review question is covered in order.
- **Print auditor:** the page count matches the table of contents; all pages are Letter; no section is split; the Unit Review pages are identical to the PDF and upright; the bookmarks are correct.

### 5.6 Final acceptance ("play the student")

- One agent uses the live preview, served locally, as a 10-year-old on an iPad (820×1180, touch):
  - opens the book;
  - does 3 problems on 3 different pages (types, draws, taps "?");
  - takes the quiz end to end;
  - opens the packet from Study Guides.
- It reports anything confusing or broken.

---

## 6. Acceptance checklist (all must be true before merging)

- [ ] `audit-chapter7-source.py`: every page is pixel-identical to the PDF.
- [ ] All parts PASS the validator. Every question has an answer box. The independent checkers report 0 open math errors.
- [ ] `npm test` and all browser suites pass locally: Chapter 7 book, devices, quiz, and the existing suites (legacy 829, Chapter 4, Lesson 5-1, responsive, Chapter 5, the Chapter 5 quiz).
- [ ] The 5 auditors' findings are fixed or listed as known limits. The 2 verifiers pass.
- [ ] The quiz has 24 questions (8/8/8), its keys are recomputed in tests, and its checker found nothing.
- [ ] The packet has the right page count and order. No section is split. The Unit Review pages are identical. The answer key is marked for the parent.
- [ ] The home cards and the Study Guides entry work. The Chapter 7 More menu links to the quiz.
- [ ] Chapter 5 is unchanged: its tests pass and its data hashes are the same.
- [ ] GitHub CI is green on the final commit. The pull request is merged. The Pages deploy succeeded.
- [ ] `docs/gml-0NN/REPORT.md` is written: what was built, the checks, the counts, and the judgement calls for the owner.

---

## 7. Lessons learned in Chapter 5 (avoid repeating them)

**Accuracy**
- **Agents misread digits.** Always run an independent checker that solves from the image. Drafts from the old workbook had 3 wrong answers; never trust earlier drafts.
- **Outline crops** often left out the answer box. The outline now covers the problem plus its own boxes (`frameOf(q, .006, true)`). Check crops still contain the whole printed problem: a few started too low or cut text off.
- **Questions with internal ids** such as "1total" showed as "Question 1TOTAL". Headings now take the printed number from the title.

**Phones and iPad**
- **iOS zoomed the whole app when a small box was tapped.** Fixed with `maximum-scale=1`. Pinch is handled by the app, with `touch-action: pan-x pan-y` on the viewer.
- **Apple Pencil:** iOS reports the Pencil as a Touch. Ignore stylus touches when deciding on a pinch. Track a single `drawPointer`.
- **Rotation:** recompute the bottom-sheet space (`--help-h`) on resize, and bring the outlined problem back into view.
- **A closed `<details>` menu still lays out its items** off screen in Chrome. Hide `.menu:not([open]) .menu-card`.

**Saving and offline**
- **Handwriting storage:** pretty-printed JSON with full-precision points filled localStorage. Save compact JSON, round points to 4 decimals, and skip near-duplicate points.
- **The service worker** must clone a response before returning it. Use `cache: 'no-cache'`, because GitHub Pages lets browsers reuse files for 10 minutes. The offline fallback is for navigations only.

**Testing and CI**
- **Fonts differ in CI:** bars wrapped at 1280 and at 1024 touch. Make the bar unable to wrap at 1000px and wider. Keep the logo a full tap target.
- **The test harness:** loading `lesson-5-1/` in a test overwrites its saved data on `pagehide`. Seed localStorage from a plain JSON URL on the same origin instead.
- **Owner screenshots:** look at real-device screenshots carefully. The owner caught phone problems that emulation missed.

**Owner preferences**
- Keep it simple:
  - no side panes or question lists;
  - just a "?" beside each problem, with the answer in a right-hand pane on iPad and computer;
  - one slim top bar.
- The owner rejected a dashboard-style card layout as too busy.

**Repo and GitHub mechanics**
- **Permissions:** merging is treated as a production deploy and may be blocked. Ask the owner to pre-authorise it, or stop at a green pull request.
- **GitHub API:** GraphQL is blocked, so use REST. Use `gh api` for pull-request creation, PATCH, merge, check-runs and logs.
- **Pages are public on GitHub Pages**, as Chapter 5's are. The owner chose this.

---

## 8. Current state at handoff (2026-11-09)

- **Live:** the Chapter 5 book (PR #24, #26 card, #27 devices, #28 app feel, #29 audit). The ChatGPT version was removed (#25).
- **Open:** **PR #30, the Unit 5 Review Quiz.** CI is green but it is not merged. Merge it first if allowed, or reuse its files.
- **Not in the repo:** the Unit 5 printable packet (title, study guide, unit review, answer key) was made with scripts in the session scratchpad and sent to the owner. For Chapter 7, rebuild it with a committed script, `tools/build-review-packet.py`, so it can be repeated.
