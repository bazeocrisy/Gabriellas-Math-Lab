# Decimals Full Audit: Summary

**Audit date:** 2026-10-10
**Mode:** read-only. No application code was changed, and nothing was merged or deployed.
**Audited build:** `79abadc` ("Merge PR #9: Decimals Lessons 9-10"). This is the tip of `main` and the live deployment.

**Reports**
- [INSTRUCTIONAL-COVERAGE.md](INSTRUCTIONAL-COVERAGE.md)
- [DEFECT-REGISTER.md](DEFECT-REGISTER.md)
- [DEVICE-AND-STATE-MATRIX.md](DEVICE-AND-STATE-MATRIX.md)
- [CORRECTION-PLAN.md](CORRECTION-PLAN.md)

## 1. Baseline and deployment

| Item | Finding |
|---|---|
| Repository | github.com/bazeocrisy/Gabriellas-Math-Lab |
| `main` | `79abadc` |
| GitHub Pages | Latest build `built`, commit `79abadc`, 2026-10-11 01:56 UTC |
| Live vs `main` | All 64 non-doc, non-test files compared byte-for-byte with the live site (line endings normalised). 63 are identical. The 1 difference is `study-guides/.gitignore`, a dotfile GitHub Pages does not serve. **No mismatch.** |
| Lessons available live | 10 of 10 (`ready: true` for d01–d10 in the live `lessons.js`) |
| Open work, not audited | PR #10 (`claude/status-d09-d10-live`, docs only) and the study-guide worktree (`claude/decimals-study-guide-d01`). Neither was touched. |
| Audit workspace | Separate worktree on branch `claude/audit-decimals-full`, created from `79abadc` |

## 2. Automated tests (baseline, unchanged code)

| Suite | Result | Environment |
|---|---|---|
| `npm test` (unit) | 208 tests: **208 passed, 0 failed, 0 skipped** | Node 26.5.0, Windows 11 |
| `npm run test:browser` (local copy) | **609 passed, 0 failed** | Headless Chrome 155.0.8059.39 over CDP |
| `npm run test:browser` against the live URL | **609 passed, 0 failed** | Same |

**Limits of the automated suites**
- Browser checks run in headless Chrome with device emulation only.
- They do not cover multi-tab use, Practice opened while a Test is in progress, retakes beyond the previous test, or answer clues from choice length. The audit found defects in each of these areas.

## 3. Review coverage

| Reviewer | Coverage |
|---|---|
| **Mathematics and curriculum** | <ul><li>**488,268 generated questions recomputed independently, 0 mismatches.** That is every template in all 10 lessons, seeds 1–3000 plus 14 boundary seeds. The reviewer used its own BigInt decimal arithmetic, word parser and SVG/table parsers, never the app's helpers.</li><li>62/62 Teach guided checks correct.</li><li>2,876,736 wrong responses scored and their feedback checked.</li><li>Every Teach screen, the Notes and the reminder cards scanned for false equations.</li><li>The answer-position and answer-clue distribution measured.</li></ul> |
| **Instructional UX and accessibility** | <ul><li>All 139 screens, including 59 guided checks, and all 162 templates (486 hints).</li><li>59,436 likely wrong answers probed for specific coaching.</li><li>1,500 generated Tests per lesson to measure format exposure.</li><li>Keyboard-only runs: every answer type and a full Test.</li><li>Accessibility tree for 8 question types, 49 colour-contrast pairs, and screenshots at 390 and 1920 px.</li></ul> |
| **Functional QA and devices** | <ul><li>Every lesson walked through 28 states (282 checks).</li><li>15 transition and leakage scenarios, a storage-blocked run, and 6,000 simulated sessions in Node.</li><li>10 viewports × 104 states = 1,040 renders (6,240 checks).</li><li>Print emulation and PDF output of all 10 Notes.</li><li>Console and network checks, and a 41-route confirmation run on the live site.</li></ul> |
| **Lead auditor** | <ul><li>Re-checked the baseline above.</li><li>Independently reproduced D-01, D-03, D-04, D-05 and D-06 from code or generated output.</li><li>Confirmed the cause of D-14 and D-15 in code.</li><li>Measured how often D-03 questions appear in Tests.</li></ul> |

**Screens examined:** 139 screens across 10 lessons (59 guided checks and 243 worked-example steps) and 162 question templates.

## 4. Severity totals (consolidated and de-duplicated)

| Critical | Major | Minor | Cosmetic |
|---|---|---|---|
| **0** | **6** | **22** | **6** |

**No incorrect mathematics was found** in any answer key, worked example, guided check or Note. Every major defect concerns assessment integrity, an untaught format, or the screen-reader version of a diagram.

## 5. The six major findings

1. **D-01. Practice can show the answer to a question in the student's open Test.**
   - When a Test is in progress and the student opens Practice for the same lesson, the session can contain the same question. "Show me how" then reveals its answer.
   - This happens in 14–15% of such Practice sessions in Lessons 1 and 9. It was reproduced on the live site.
2. **D-02. A second tab can re-submit a Test after the answers are revealed.**
   - Result: 0/10 followed by 10/10 "mastered", and the first result is overwritten. Reproduced on the live site.
3. **D-03. In 8 reasoning templates the correct choice can be found by its length alone.**
   - The correct choice is always uniquely the longest (or, in d09/C2, the shortest): 3000 of 3000 seeds each.
   - These items appear in **100% of Lesson 3 Tests** (1.34 per Test on average), 64% of Lesson 2, 65% of Lesson 8, 51% of Lesson 10, 49% of Lesson 9 and 26% of Lesson 1 Tests.
4. **D-04. Lesson 1 tests reading a point on a number line, but no Lesson 1 Teach screen or Note has a number line.** The format appears in 60% of Lesson 1 Tests.
5. **D-05. Lesson 3 tests "which digit can go in the box", but Teach never shows it.** It appears in 59% of Lesson 3 Tests.
6. **D-06. The screen-reader description of number lines rounds point positions.**
   - Example: 0.95 is described as "10 jumps" from 0, which is the position of 1.
   - Affected: 87% of Lesson 4 NL2 items, plus two Teach examples. The drawn picture is correct.

## 6. Release readiness: **READY WITH LIMITATIONS**

**Evidence for using it now, with care**
- There are no critical defects.
- Mathematical correctness is exceptionally well supported: 0 mismatches in 488,268 independent recomputations, every guided check correct, and no false statements in Teach or the Notes.
- Every taught skill has Practice and Test coverage, and every template has mistake-specific coaching.
- All 10 lessons work in every mode at every simulated viewport, with no console errors. Live matches `main`.
- The Explain → Show how → Guide → Practice sequence is present and sound in all 10 lessons. Gaps exist only for the specific formats listed in INSTRUCTIONAL-COVERAGE.md.

**Why not READY**
- The six major defects mean a Test "Mastered" result is not yet fully reliable as evidence of independent mastery:
  - D-01 and D-02 need unusual actions: leaving a Test unsubmitted, or using two tabs.
  - D-03 affects the many Tests listed above. With mastery at 9 of 10, one guessable item matters.
  - D-04 and D-05 assess formats that were never taught.
- Screen-reader users get a wrong description of some number lines (D-06).

**Mitigations until the corrections are made**
- An adult should make sure each Test is finished in one sitting, in one tab, without opening Practice or Teach in between.
- Treat Lessons 1 and 3 Test results with caution until D-04 and D-05 are fixed; for example, briefly show Gabriella a number line and a missing-digit comparison first.
- Treat "Mastered" in Lessons 2, 3, 8, 9 and 10 as provisional until D-03 is fixed.

**Not demonstrated:** real learning outcomes. No student was observed, and this audit makes no claim about learning gains.

## 7. Testing limitations

- **Devices.** Every device result is **simulated** with Chrome device emulation. Nothing ran on a physical iPhone, iPad, Android device or projector, or in Safari or Firefox.
- **Screen readers.** No real screen reader was used (NVDA, JAWS, VoiceOver or TalkBack). Accessibility findings come from the DOM, the accessibility tree and keyboard runs.
- **Print.** Print was checked by print-media emulation and PDF generation only, not on paper.
- **Standards.** The official GaDOE standards document could not be reached; georgiastandards.org redirects to a "sunset" page. Alignment was checked against a secondary source that reproduces the Georgia Grade 5 standards (goblinsapp.com, Georgia Grade 5 print view, fetched 2026-10-10). The Milestones assessment boundaries were not checked.
- **Coverage of generated questions.** It was sampled, not exhaustive: 3,014 seeds per template. Templates with small variation were effectively covered in full, but not every possible question was verified.
- **Teaching quality.** The instructional judgements are expert review, not observed student use.
- **Evidence files.** Reviewer scripts, screenshots and raw JSON are in the session's scratchpad and are not committed. Each defect has steps to reproduce it from the repository alone.
