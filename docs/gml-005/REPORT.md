# GML-005 owner review

Status: Final QA is complete locally and the isolated private preview is deployed. Owner acceptance is pending; production has not been merged or replaced. The preview URL was opened and its owner sign-in gate verified; authenticated interaction behind that gate remains an owner check, explicitly documented below.

## Implementation

A separate, buildless viewer preserves the source document and existing workbook. It adds compact page selection, first/last boundaries, hash-based browser history, automatic resume, typed answers, mouse/touch/stylus pointer writing, segment erasing, page-specific undo/redo, selective clearing, normalized zoom/pan, staged assistance, question completion, local saving, JSON backup/restore and four-page printing. The home page links to the proposed viewer. A minimal shared lesson-card touch-target fix adds a 44 px minimum width; unrelated lesson content and the original workbook remain unchanged.

## Source inventory

Primary source: https://drive.google.com/file/d/1YobjzwCwrAlPgVpnrAcPUzwWm9N1Z2la/view

Downloaded successfully; PDF has 38 pages, each 612 × 792 points. Original orientation metadata is honored, including 180° rotated PDF pages. Rendered assets are 1836 × 2376 pixels. The scan's lines and marks remain intact. The source PDF and individual asset SHA-256 fingerprints are recorded in the manifest.

| PDF page (1-based) | Printed page | Digital page | Content | Assistance |
|---|---|---|---|---|
| 3 | 143 | `lesson-5-1/#page=143` | Be Curious; Mindset | 2 |
| 4 | 144 | `lesson-5-1/#page=144` | Learn example; Patterns; Work Together | 3 |
| 5 | 145 | `lesson-5-1/#page=145` | On My Own, problems 1–14 | 14 |
| 6 | 146 | `lesson-5-1/#page=146` | 15A, 15B, 16, 17; Reflect; Mindset | 6 |

PDF pages 1–2 are unit introductory material. PDF page 7, printed page 147, begins Lesson 5-2. Later pages contain subsequent lessons, review and fluency work; no official Lesson 5-1 answer key was found in the supplied document.

## Question audit

25 mapped prompts and 25 verified assistance entries; none missing. This includes 18 numbered questions/subparts and seven unnumbered instructional/reflection prompts. All original question locations and excerpts were visually checked against the source. Powers of ten were independently evaluated, including every exercise 1–12. Rachel's 10⁵ error, Grace's 10⁶ lines of code, Trevor's 10,000 steps, Jenny's $1,000 versus $500 choice, and the strict bounds in problem 17 were checked separately. Problem 17 permits multiple numbers between 10,000 and 1,000,000; 100,000 is a sample, not a unique solution. Personal reflections and other open-ended responses are labeled accordingly. No comparison to an official key is claimed.

## QA evidence

| Check | Result |
|---|---|
| Four original pages: numbering, proportions, full text/artwork and page sequence | PASS; original-page screenshots manually inspected |
| Protected rasters versus fresh source-PDF renders | PASS; zero differing raster samples on all four pages |
| Source PDF and PNG SHA-256 integrity | PASS |
| Unit tests, including six new source, math, mapping, migration and eraser tests | PASS: 272 tests |
| New Lesson 5-1 browser checks, Google Chrome and Microsoft Edge | PASS: 144 checks in each browser; logs included |
| Lesson navigation/toolbar at 320, 390, 768, 820 and 1440 px | PASS: controls at least 44 px, no horizontal overflow; compact page annotations have the full-size Questions-list alternative |
| Mouse handwriting at top/center/bottom, touch handwriting, erasing, undo/redo, clear/undo | PASS |
| Answer alignment under zoom and resize; panning; fit width/page/reset | PASS |
| Page selector, first/last, Back/Forward, start, question selector and completion | PASS |
| Save/refresh, navigation, close/reopen application, full browser process restart | PASS |
| JSON file export/restore and retained pre-restore recovery copy | PASS |
| Four-page print-to-PDF: original pages plus sample typed/handwritten work | PASS; four 612 × 792-point pages; screenshot/PDF inspection |
| Legacy application browser regression | PASS: 829 checks |
| Chapter 4 browser regression | PASS: 162 checks |
| Whole-application responsive suite | PASS: 4,665 checks, zero failures, all seven viewport widths completed |
| Physical iPad/iPhone, hardware stylus, physical printer | NOT TESTED; touch and device viewports emulated |
| Managed preview relay | Still unavailable; replaced with an isolated owner-only Sites deployment |
| Hosted private preview | Deployment succeeded; exact lesson URL opened in Chrome, owner sign-in gate verified. Authenticated remote viewer interaction is not claimed tested |
| Owner review / production approval | PENDING |

The previous responsive failure was resolved with a minimal `.lc-link` rule: `min-width: 44px` and centered content. The existing 44 px minimum height is preserved. The suite keeps every existing assertion and adds the 820 × 1180 viewport; it now covers 320, 375, 390, 768, 820, 1366 and 1920 px widths. No tests were skipped, removed or weakened.

The lesson's reading/writing/navigation controls and question list now also have 44 px minimum touch targets. Each of its 25 compact margin annotations is checked against its question title and source-image excerpt, is outside the artwork, and has a larger Questions-list alternative. Closing assistance now restores page width synchronously before immediate writing, preventing layout timing from changing a pointer target. The shared browser harness now waits for graceful browser shutdown before restarting a saved profile; the former immediate process kill could interrupt disk flushing. Both browsers pass the strengthened study-session and full-process-restart checks.

All 25 assistance entries were re-read against the source; personal reflection examples and hints now speak directly to the student. [QUESTION-AUDIT.md](QUESTION-AUDIT.md) records each prompt's verified answer/sample basis. No known critical or high-severity defect remains.

Browser versions used: Google Chrome 157.0.8103.38; Microsoft Edge 157.0.4341.42; Chromium for the pre-existing regression suites. Browser sandbox flags were supplied only by workspace-local test wrappers for the container; application source does not alter browser security settings. The remote entry check trusted only the environment proxy CA public-key pin in the test browser; the public Site retains normal HTTPS. Device results describe emulation, not Safari or physical hardware certification.

Screenshots include desktop, tablet, phone, assistance, and all four original-only pages. `completed-test.pdf` contains sample test work, not Gabriella's personal answers. Source audit command: `python tools/audit-lesson51-source.py`. Browser commands and raw logs are included alongside this report. CI runs the new unit and browser checks as well as existing gates.

## Private preview and owner review

Direct preview: https://gabriellas-math-lab-lesson-51-review.bazeocrisy.chatgpt.site/lesson-5-1/

This new owner-only Site is isolated from https://bazeocrisy.github.io/Gabriellas-Math-Lab/. Use **Continue with ChatGPT** and the account that owns the preview. The deployment succeeded, and Chrome opened this exact path and displayed **Sign in required / Log in to access**. No owner login is available to the headless test profile, and this environment offers no shared browser-control tool for an authenticated handoff. Thus remote interaction behind the sign-in gate is explicitly unverified. Local Chrome/Edge tests exercised byte-identical viewer files, and the uploaded static artifact preserves all original page hashes. No authentication bypass or public sharing was enabled.

The native deployment and source provenance are in [preview-deployment.json](preview-deployment.json). Source commit `c702f7f7ea1ebaa90d0f7142fb4272c2c5c6352d` contains the deployed static bundle, which was compared byte-for-byte with the viewer in this PR. The source PDF and protected page images remain unchanged. `preview-browser-check.json` and `preview-signin.png` record the entry-page check.

[OWNER-REVIEW.md](OWNER-REVIEW.md) provides the Gabriella/father checklist and a reproducible local fallback. Preview storage is separate from production and other devices. Physical iPad/iPhone Safari, hardware stylus and physical printing remain manual checks. Automated touch/viewport checks do not certify those hardware combinations.

Branch: `codex/gml-005-lesson-5-1`; existing PR: https://github.com/bazeocrisy/Gabriellas-Math-Lab/pull/23. Production was not merged or changed. The final local test counts are recorded above; GitHub Actions status should be checked on the updated PR rather than inferred from local runs.

The asset/data/controller separation, normalized SVG writing, storage migration, assistance drawer and print renderer remain reusable. Lesson 5-2 has not been started and awaits owner acceptance of Lesson 5-1.
