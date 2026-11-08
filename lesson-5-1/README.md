# Lesson 5-1 viewer

Open `lesson-5-1/index.html` through any static HTTP server. No build step or runtime dependencies; compatible with the repository's GitHub Pages base path. The original 5-1–5-4 workbook remains at its existing URL, with its storage and content unchanged.

## Layers

- `assets/source.pdf`: exact supplied 38-page document, fingerprinted in `data/manifest.json`.
- `assets/page-143.png`–`page-146.png`: full-page 216 dpi renders of PDF pages 3–6. PDF orientation is honored. No cropping, retouching, redrawing, OCR replacement, or scan cleanup.
- `data/manifest.json`: source identity, printed/PDF numbering, dimensions, hashes and boundary with Lesson 5-2.
- `data/fields.json`: answer rectangles in normalized source-page coordinates; IDs preserve migration compatibility.
- `data/questions.json`: original-question excerpt rectangles, margin anchors, assistance, answer verification and open-ended labels. Source excerpts use the original page image directly.
- `lib/ink.js`: normalized SVG strokes and segment erasure; proportions remain tied to the source page.
- `lib/storage.js`: versioned persistence, nondestructive import of legacy Lesson 5-1 work, backup validation.
- `app.js`, `index.html`, `style.css`: controller and card-based responsive UI (GML-006). Design tokens live at the top of `style.css`.

Layout (GML-006): header card, navigation/progress card, a per-page question navigator card, the textbook card with one compact toolbar (mode · undo/redo · zoom · Original only · More), and a question-assistance card. Question markers sit in the page margin, outside the artwork; selecting a question outlines it with a non-destructive overlay. Original only hides every overlay. Assistance shows the Hint first; Show Me How and the Answer are explicit student actions. At ≥1180px assistance is a side panel; on tablets it is a right-hand drawer and on phones a bottom sheet (Close or Escape). See `docs/gml-006/REPORT.md`.

## Work and recovery

The new storage namespace is `gml:lesson-5-1:v2`. The first visit copies eligible answers and normalized ink from `gabriella_original_unit5_lessons_51_to_54_v1`. It never changes or removes that original key, including work in 5-2–5-4. Existing browser data is origin-specific: a preview host has different storage from GitHub Pages. No device synchronization is implemented.

Typing saves on input; drawing saves when a stroke finishes and on page exit. Navigation, completion and the last page save automatically. Storage failures show an error; unrecognized saved data blocks writes rather than replacing it. Export backup downloads JSON. Restore validates the file, asks before replacement, and retains a recovery copy at `gml:lesson-5-1:v2:before-restore`. Corrupt data can be downloaded separately for recovery.

Undo/redo covers ink additions, erasing, typed editing sessions and selected clearing on each page. History is session-local; saved answers and strokes persist across browser restarts. Clear affects only selected work on the current page. Printing creates all four original pages with typed and handwritten work, omitting the UI. Save PDF is the browser's print destination.

## Validation

- `npm test`
- `npm run test:lesson51:browser` (Chrome/Edge; set `CHROME_PATH` if needed)
- `python tools/audit-lesson51-source.py` (requires PyMuPDF; reads only)
- Existing browser suites: `test:browser`, `test:chapter4:browser`, `test:responsive:browser`

See `docs/gml-005/REPORT.md` for results, the resolved responsive issue, and remaining owner/hardware review limits. The original asset hashes must not be updated as a side effect of UI changes. For another lesson, reuse the viewer/controller, SVG writing model, print renderer and backup workflow, supplying separately audited page/question metadata and a distinct storage namespace. Lesson 5-2 has not been implemented here.
