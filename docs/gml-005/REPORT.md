# GML-005 owner review

Status: Lesson 5-1 implemented and audited; proposed as a draft PR for owner review. Production has not been merged or replaced. The broader responsive gate has pre-existing failures described below, so the assignment's entire definition of done is not claimed complete.

## Implementation

A separate, buildless viewer preserves the source document and existing workbook. It adds compact page selection, first/last boundaries, hash-based browser history, automatic resume, typed answers, mouse/touch/stylus pointer writing, segment erasing, page-specific undo/redo, selective clearing, normalized zoom/pan, staged assistance, question completion, local saving, JSON backup/restore and four-page printing. The home page links to the proposed viewer. Shared application styles and lesson content are unchanged.

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
| New Lesson 5-1 browser checks, Google Chrome and Microsoft Edge | PASS; logs included |
| Desktop, tablet (820 × 1180), phone (390 × 844) layouts | PASS in automated browser viewports and screenshot inspection |
| Mouse handwriting at top/center/bottom, touch handwriting, erasing, undo/redo, clear/undo | PASS |
| Answer alignment under zoom and resize; panning; fit width/page/reset | PASS |
| Page selector, first/last, Back/Forward, start, question selector and completion | PASS |
| Save/refresh, navigation, close/reopen application, full browser process restart | PASS |
| JSON file export/restore and retained pre-restore recovery copy | PASS |
| Four-page print-to-PDF: original pages plus sample typed/handwritten work | PASS; four 612 × 792-point pages; screenshot/PDF inspection |
| Legacy application browser regression | PASS: 829 checks |
| Chapter 4 browser regression | PASS: 162 checks |
| Whole-application responsive suite | FAIL: 665 pass, 3 reports at 320 px; see below |
| Physical iPad/iPhone, hardware stylus, physical printer | NOT TESTED; touch and device viewports emulated |
| Managed preview relay | UNAVAILABLE (`preview relay unavailable: No such file or directory`) |
| Owner review / production approval | PENDING |

The responsive suite flags existing Test links in `#/learn` (10 links) and `#/chapter4` (8 links): 42.859375 px wide against its 44 px touch target rule. Its third failure is the resulting suite-abort report. The same link widths/heights were measured on the unchanged base commit `b3e7229` and on this branch. This is a baseline accessibility issue, not a Lesson 5-1 regression; no shared CSS was changed to expand assignment scope. The repository-wide responsive gate remains incomplete. No known critical/high-severity Lesson 5-1 defect remains after the reported fixes.

Browser versions used: Google Chrome 157.0.8103.38; Microsoft Edge 157.0.4341.42; Chromium for the pre-existing regression suites. Browser sandbox flags were supplied only by workspace-local test wrappers for the container; application source does not alter browser security settings. Device results describe emulation, not Safari or physical hardware certification.

Screenshots include desktop, tablet, phone, assistance, and all four original-only pages. `completed-test.pdf` contains sample test work, not Gabriella's personal answers. Source audit command: `python tools/audit-lesson51-source.py`. Browser commands and raw logs are included alongside this report. CI runs the new unit and browser checks as well as existing gates.

## Review and next lesson

Branch: `codex/gml-005-lesson-5-1`. See the PR for the commit reference and any successfully verified immutable test URL. A preview host uses separate browser storage from production. No claim is made that the managed preview relay is running.

The asset/data/controller separation, normalized SVG writing, storage migration, assistance drawer and print renderer are reusable. Lesson 5-2 remains outside scope and must wait for owner review of this lesson. Before calling the entire assignment complete, resolve or explicitly disposition the documented baseline responsive gate and complete owner review.
