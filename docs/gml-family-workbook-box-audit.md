# Chapter 5 Family Workbook — Answer Placement Audit

**Date:** 2026-11-08

**Page:** `chapter5-family-workbook.html`

**Source:** Original Chapter 5 PDF, pinned to commit `90510e9` at `lesson-5-1/assets/source.pdf`.

## Scope and evidence

Lesson 5-1 source printed pages 143–146 (PDF pages 3–6) is the only lesson with authoritative item-level answer-field and solution mappings. The workbook displays all 38 source-PDF pages; mapping every problem and verifying solutions on pages after 146 is **not complete**.

The latest input placement uses `lesson-5-1/data/fields.json` as the source of coordinates, rather than estimated additional vertical offsets. All 25 mapped prompts retain their original question IDs and verified solution records. Help markers are separate from input boxes and open a side solution panel only when selected.

| Printed page | PDF page | Question/response mappings | Field coordinate coverage |
|---|---:|---:|---:|
| 143 | 3 | 2 | 2/2 |
| 144 | 4 | 3 | 3/3 |
| 145 | 5 | 14 | 14/14 |
| 146 | 6 | 6 | 6/6 |
| **Total** | | **25** | **25/25** |

## Static audit checks

- 25/25 item IDs have original answer-field coordinates.
- Zero input rectangles extending beyond source-page coordinate boundaries.
- Zero overlapping pairs among source answer-field rectangles on the same page.
- All JavaScript parsed successfully.
- No missing referenced DOM IDs.
- Answer saving continues to use the existing local storage key.
- Help is conditional on selecting a question; the left textbook remains visible.
- Color-coded step presentation still uses original Lesson 5-1 solution data.
- The existing website is unchanged outside the single family-workbook HTML file.

## Not certified yet

- Pixel-level browser overlay verification against a newly rendered, unmodified PDF image at desktop, tablet, and phone sizes.
- Manual verification of whether a given source field partially covers printed words (non-overlap with other *fields* alone does not establish print non-overlap).
- Hardware pen/touch and printer tests.
- Full Chapter 5 question mapping and math-solution verification after Lesson 5-1.

## Follow-up acceptance gate

Before claiming the workbook is fully audited, use a browser to compare the original source and interactive overlays on **all four** Lesson 5-1 pages at zoom values 75%, 100%, 125%, and 150%; inspect all 25 items; type, refresh, navigate away and back; and verify that help panels open/close without losing answers. Then complete the same process for every later page, after its question map and solution audit are available.

This report intentionally separates completed deterministic checks from unperformed visual tests.