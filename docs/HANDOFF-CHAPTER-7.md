# Handoff: Chapter 7 (Fractions) Unit Review support for Study Scoop

**For:** the next Claude Code session, working unattended up to the Study Scoop preview.
**Student:** the owner's son (3rd grade).
**Target site:** Study Scoop. Repo: `bazeocrisy/Study-Scoop`. Production: https://bazeocrisy.github.io/Study-Scoop/ · Preview: https://bazeocrisy.github.io/Study-Scoop/preview/
**Model to copy:** the Chapter 5 Unit Review support built for Gabriella in `bazeocrisy/Gabriellas-Math-Lab`: the review quiz (`chapter-5/review/`, PR #30) and the printable review packet (title, study guide, Unit Review, answer key).
**Owner input:** the Chapter 7 textbook PDF, used as a private reference only.

---

## 0. Kickoff prompt (the owner pastes this, with the PDF attached)

> You are working on Study Scoop (repo `bazeocrisy/Study-Scoop`). First read `docs/HANDOFF-CHAPTER-7.md` from `bazeocrisy/Gabriellas-Math-Lab` (attached), then Study Scoop's own `CLAUDE.md`, `STATUS.md`, `docs/DECISIONS.md`, `docs/CHAPTER-7-BUILD.md`, `docs/TEACHING-QUALITY-ACCEPTANCE.md`, `docs/VISUAL-TEACHING-PATTERN.md`, `.claude/skills/build-chapter/SKILL.md` and `.claude/agents/`.
>
> Add Unit 7 Review support for my son, the same kind I got for Chapter 5 in Gabriella's Math Lab:
> 1. a Unit 7 Review Quiz;
> 2. a printable Unit 7 Review Study Guide;
> 3. a private review packet PDF for me.
>
> Do not change any existing Chapter 7 content; only add. The Chapter 7 PDF is attached as a private reference: never commit or publish it, its pages, or copied text.
>
> Work unattended with multiple agents (Agent tool; you may run a Workflow) for authoring, independent checking, design audit and verification, as the handoff describes. You may merge your feature PR into `develop` so it appears on the preview once every check passes. Do not merge to `main` (production): stop and give me the preview link and the PR for my approval. Send me the private packet PDF as a file. My son's name for the packet title page is: ___.

**Before starting, the owner should:**
1. Attach the Chapter 7 PDF to the first message. Do not upload it to either repository; both are public.
2. Be ready to approve the merge into `develop` if the permission checker blocks it. In past sessions, merges were treated as deploys.

---

## 1. Rules (non-negotiable)

These are Study Scoop's own permanent rules (`CLAUDE.md`, "Security / privacy / copyright") plus the owner's instruction.

1. **Never commit or publish the textbook.** That means no PDF, no page images, no copied problems or text, and no answer keys copied from the book. The PDF is a private reference kept outside the repo, for example in the session scratchpad.
2. **Do not change any existing Chapter 7 content:**
   - `data/lessons/7-1.json` … `7-7.json`
   - `data/chapters/7.json` (vocabulary, guide, practice, test, performance, fluency)
   - the fraction engine
   - the November 9 week

   Add new files and registrations only. Prove it: `git diff --stat develop` must show no changes to those files, and their tests still pass.
3. **Everything published is original:**
   - It follows the Unit Review's skills and order (reference pages 33–35, the cumulative review).
   - It uses new numbers, shapes and wording, at Grade 3 scope (`docs/CHAPTER-7-BUILD.md` "Scope": partitioning, unit fractions, fractions of a whole and of a set, number lines, wholes as fractions, fractions greater than 1).
   - It covers no fraction arithmetic and no simplification.
   - The teacher's vocabulary words stay word for word, from the week file.
4. **Math is verified:**
   - Derive answers from the model geometry with `js/lib/fractions.js` and the validators.
   - Use Python `fractions.Fraction` for any extra check.
   - An independent checker agent re-solves every item.
5. **Follow Study Scoop's workflow:**
   - Work on a feature branch from `develop`.
   - Open a PR into `develop` (preview).
   - Production (`main`) only with the owner's explicit approval of that PR.
   - No GitHub Pages setting changes.
   - Record every design choice in `docs/DECISIONS.md` (next D-number).
6. **Quality bar:**
   - Layouts for phone, tablet, Chromebook and desktop.
   - Keyboard use, accessible labels, black-and-white printing.
   - Hints only in learn/practice, never in scored tests (Study Scoop rule).
   - Follow `TEACHING-QUALITY-ACCEPTANCE.md` and `VISUAL-TEACHING-PATTERN.md`.
   - No storage of student data. Study Scoop keeps misses only in the current tab's memory, so do not add localStorage progress unless a new decision is approved.

---

## 2. Deliverables

| # | What | Where | Notes |
|---|---|---|---|
| 1 | **Unit 7 Review Quiz** | New Chapter 7 activity (see 3.2) | 24 original questions: 8 multiple choice, 8 fill in the blank (fraction entry via the existing answer policies), 8 true/false. They follow the Unit Review's skills in order. Show the result, the correct answer and the explanation after each answer, plus Practice My Misses. No hints in the scored quiz. |
| 2 | **Unit 7 Review Study Guide** (printable, black and white) | New Chapter 7 activity (see 3.2) | One section per Unit Review item, in order: what it asks, a "Remember" tip, a worked example with new numbers and original SVG models, and a "Try it". Self-check answers at the end. It must print cleanly with no section split across pages. |
| 3 | **Private review packet PDF** for the owner | Sent as a file only; never committed | **Title page** (son's name, date, contents), the **Study Guide**, the **Unit Review pages copied unchanged** from the owner's PDF (`insert_pdf`, rotation kept), and an **Answer Key** for those pages, marked "for the parent". All Letter size, with bookmarks. Personal use only. |
| 4 | Decision record, STATUS, report | `docs/DECISIONS.md`, `STATUS.md`, `docs/reviews/UNIT-7-REVIEW-SUPPORT.md` | Include test counts and the judgement calls. |
| 5 | Tests | `tests/` | Unit: keys recomputed. Browser: full quiz journey, guide print layout, registry. Built site: `npm run test:site`. |

---

## 3. Build plan

### 3.1 Phase 0: Setup (lead)

**Clone and branch**
- Clone `bazeocrisy/Study-Scoop` with push access.
- Create a branch from `develop`: `feature/chapter7-unit-review`.

**Chrome as root**
- Chrome refuses to run as root without `--no-sandbox`.
- Make a wrapper script and pass it to the tests via `CHROME_PATH`, the way `docs/TESTING.md` expects.

**Baseline**
- Run `npm test`, `npm run test:browser` and `npm run test:site` to record the starting counts.

**GitHub CLI**
- Use `gh api` REST calls for pull requests, check-runs and job logs. GraphQL is blocked.
- For each branch you push, add a fetch refspec.

### 3.2 Phase 1: Design (lead + `study-scoop-lead` + `elementary-instructional-designer` + `educational-ui-designer` agents)

**Where the two new activities go**
- D26: chapters own their content, with fixed roles (`vocab`, `vocabpractice`, `lessons`, `practice`, `guide`, `test`).
- Propose how to add the two activities **without changing existing Chapter 7 content**, for example sub-activities under the existing Chapter 7 Study Guide and Chapter Test menus, or a new role.
- Record the choice as a new decision.
- Prefer the option that needs the fewest shared-code changes and keeps Chapters 5 and 6 byte-identical.

**Coverage map**
- Map the Unit Review items (reference pages 33–35) to skills and lessons in a private note: skill names and item numbers only, never copied text.
- Every published item must trace to one of those skills.

### 3.3 Phase 2: Authoring (lead)

**Where the content goes**
- Add an author script, `scripts/author/chapter7-review.mjs`, following `chapter7-resources.mjs`.
- It generates `data/chapters/7-review.json` (or the agreed file).
- Original items only, with models from `fraction-models.js` (area bars, circles, sets, number lines).

**Answers**
- Fill-in answers use `answerPolicy` `partition` or `value` exactly as the lessons do.
- Multiple choice has exactly one correct option.
- True/false statements must be unambiguous.

**Study guide:** use the existing guide renderer and print CSS (`css/fractions.css`), extended only for the new pages.

### 3.4 Phase 3: Independent checks (parallel agents)

- **`grade3-curriculum-developer` and an independent math checker:**
  - Re-derive every key from the geometry.
  - Check scope against Grade 3 and the Unit Review coverage.
  - Check that nothing is copied from the book. Compare against the private PDF for wording and number reuse, and report any overlap.
- **`interactive-learning-engineer`:** answer policies, misses and the quiz state flow.
- **`accessibility-child-usability`:** labels, focus, keyboard, contrast, reading level, touch targets.
- **`qa-browser-tester`:**
  - Every page at 360, 390, 768, 1024, 1366 and 1920.
  - The quiz end to end, with right and wrong answers and Practice My Misses.
  - Printing the guide (no split sections).
  - The built site.
- **Print auditor:**
  - The study guide prints in black and white.
  - Page breaks are clean: render the PDF pages and look at them.

The lead applies all findings. Then **two fresh verifier agents** re-check each fixed item (PASS/FAIL with evidence) and look for regressions.

### 3.5 Phase 4: Private packet (lead + 1 print-audit agent)

**Where it is built:** with a script in the **scratchpad**, not the repo.

**Parts**
1. Title page.
2. The study guide PDF (printed from the preview or the built site).
3. The Unit Review pages copied with `insert_pdf` from the owner's PDF.
4. The answer key, computed with `Fraction` and model checks, and verified by an independent agent that solves from the page images.

**Audit**
- Page count and order are right, and every page is Letter.
- The Unit Review pages are pixel-identical to the PDF and upright. Some scans have pages rotated 180°; keep the rotation flag.
- No section is split.
- Bookmarks are present.

**Delivery:** send it with SendUserFile. Never commit it.

### 3.6 Phase 5: Ship to preview (lead)

**Before opening the PR**
- `npm test`, `npm run test:browser` and `npm run test:site` all pass.
- The allowlist build (`scripts/build-site.js`) includes the new files and excludes everything private.

**Pull request into `develop`**
- Include: a diff summary, test evidence, a screenshot set, remaining issues, and an approval request (CLAUDE.md rule 5).

**When the checks finish**
- If CI fails, read the job logs and fix the root cause.
- When CI is green, merge into `develop`, wait for the Pages run, and confirm the preview.

**Stop there.** Give the owner the preview link, the PR and the packet. Production is the owner's call.

---

## 4. Acceptance checklist

- [ ] No existing Chapter 7 file changed. Chapters 5 and 6 are unchanged. All previous tests pass.
- [ ] No textbook PDF, image, copied text or copied key is in the repo or the built site. Check with a grep for distinctive phrases from the private PDF.
- [ ] 24 quiz items (8/8/8), all original, in scope, keys re-derived. The independent checker found 0 open issues.
- [ ] The study guide covers every Unit Review skill in order, prints in black and white, and no section is split.
- [ ] All design, accessibility, browser and print findings are fixed. Both verifiers pass.
- [ ] DECISIONS, STATUS and the review report are written.
- [ ] CI is green, the PR is merged into `develop`, and the preview is live. **`main` is untouched.**
- [ ] The private packet was sent: correct order and Letter size, the Unit Review pages identical and upright, the answer key verified.

---

## 5. Lessons learned in the Chapter 5 work (Gabriella's Math Lab)

- **Agents misread digits** (2,368 read as 2,398). Always run an independent checker that solves from the source, not from the author's notes.
- **Answer-key fill-ins:** accept every fair form the policy allows. Spell out the accepted forms in each item, and test them.
- **Fonts and wrapping:** GitHub's test machines use wider fonts, so bars and buttons that fit locally wrapped in CI. Test with wide simulated fonts.
- **iPad:**
  - Small inputs trigger iOS auto-zoom (the `maximum-scale=1` viewport, or 16px inputs).
  - Fraction entry needs a `/` key or separate numerator/denominator boxes. Study Scoop already uses labelled boxes.
- **Printing:**
  - Use `break-inside: avoid` per section.
  - Render every page and look; some pages end with white space instead of splitting.
  - Copy book pages with `insert_pdf`; never re-render them.
- **Permissions and GitHub:**
  - Merges may be blocked as a "production deploy" by the permission checker. Stop with a green PR and report.
  - Shallow clones need fetch refspecs, or stop hooks report "no remote branch".
- **Owner preferences:** simple and uncluttered, plain language, and the student should never be stuck (show the answer and the explanation).

---

## 6. Not in scope (owner decision needed)

- **An interactive copy of the actual textbook pages for Chapter 7** (like Gabriella's Chapter 5 book) cannot go on Study Scoop or any other public site: it would publish the textbook. If the owner wants one for personal use, it needs private hosting, which GitHub Pages cannot provide for this account. Discuss that separately before building it.
