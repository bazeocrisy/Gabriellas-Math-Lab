# GML-006 — Lesson 5-1 card-based redesign

**Scope:** Lesson 5-1 only (printed pages 143–146). Lesson 5-2 onward has not been started and is waiting for owner approval of this design.
**Base:** branch `codex/gml-005-lesson-5-1` (PR #23, unmerged). Its history is kept; this work is on `claude/gml-006-card-redesign`.

## What changed

Only the UI layer was replaced: `lesson-5-1/index.html`, `style.css`, `app.js`.
These files are **unchanged**: `assets/` (source PDF and the four page renders), `data/` (manifest, fields and all 25 question-assistance entries) and `lib/` (storage and ink).

| Owner problem | Fix |
|---|---|
| A. Too many controls of equal weight | Three rows of buttons were replaced by one toolbar inside the textbook card: input mode as a segmented control, then Undo/Redo, then Zoom. Less-used actions (save, print, backup, restore, reset zoom, clear) moved into a **More** menu. Icons are consistent and labels hide automatically when space is tight. |
| B. The textbook lacks prominence | The textbook card takes most of the screen. The page sits centred on a calm canvas. Nothing is drawn over the artwork except the existing answer boxes and handwriting. **Original only** (eye icon) hides every overlay. |
| C. Question controls look scattered | A **Questions on this page** card lists only the current page's questions, with completion ticks. Small numbered markers stay in the margin beside the page and never cover the artwork. Selecting a question outlines it on the page (an overlay only) and scrolls it into view. |
| D. Bulky explanation panel | The assistance card has a header (*Page 145 · On My Own / Question 7*), an excerpt of the original question and three colour-coded cards: **Hint** (shown first), **Show Me How** (numbered steps, revealed on request) and **Answer** (hidden until requested, marked *Verified* or *Sample answer*). It also has a "finished" toggle and Previous / All questions / Next. |
| E. Navigation is cumbersome | One navigation card shows *Page 145 of 146*, Previous / page selector / Next, a 4-step page progress bar and a questions-done bar. There are no rows of page buttons. |
| F. No modern styling | Design tokens for colour, radius, shadow, spacing and type at the top of `style.css`. The palette follows the main site's brand blue. Cards use 18px radii and soft shadows. |

### Responsive behaviour
- **≥1180px:** three columns (rail · textbook · assistance). Assistance is a non-modal side panel, so the page stays usable while help is open.
- **681–1179px (tablet):** the rail becomes a compact navigation bar with a **Questions** button. Assistance is a modal drawer that slides in from the right.
- **≤680px (phone):** the header is compact, the toolbar is icon-only on two rows, and assistance is a bottom sheet.
- The toolbar adapts to the **textbook card's own width** (container queries), so it stays on one row on desktop even with the panel open.
- Every interactive control is at least 44px. The only exception is the in-margin markers, which have 44px equivalents in the Questions list. No horizontal overflow at 320, 390, 768, 820 or 1440px.

### Accessibility
- Assistance is a `<dialog>`: Escape closes it, and the modal form traps focus on small screens.
- Closing it returns focus to that question's marker in the textbook.
- Reveal buttons expose `aria-expanded` and the save status is `role=status`.
- `prefers-reduced-motion` is respected.

## Fidelity and data safety
- Asset SHA-256 hashes still match `data/manifest.json` (unit test).
- Storage key and format `gml:lesson-5-1:v2` are unchanged, so no migration is needed and existing saved work loads as before.
- Print/Save PDF still produces exactly four letter-size original pages with typed answers and handwriting, and no app UI (`completed-test.pdf`).

## Verification (run in this session, headless Chromium 1243)
| Suite | Result |
|---|---|
| `npm test` (unit) | 272 / 272 passed |
| `test:lesson51:browser` | 153 / 153 passed (the 144 inherited checks plus 9 new card-layout checks) |
| `test:browser` (legacy app) | 829 / 829 passed |
| `test:chapter4:browser` | 162 / 162 passed |
| `test:responsive:browser` | see PR description |

The inherited GML-005 claims were re-verified on the Codex branch before any change: 272 unit and 144 Lesson 5-1 browser checks passed.

### Lesson 5-1 test changes
- The marker-to-question check now compares `data-question` instead of the visible title, because the title now reads "Question 7".
- The 44px touch-target check now also covers header links, the Original-only toggle and the question-list items.
- Evidence is now written to `docs/gml-006/`, so the GML-005 evidence is left intact.

New checks:
- the card layout is present and the textbook card is the largest area;
- the page label reads *Page 143 of 146*;
- the navigator lists only the current page's questions;
- desktop assistance is a side panel, and tablet assistance is a modal drawer;
- the selected question is highlighted;
- Original only hides every overlay;
- closing assistance clears the highlight and returns focus to the textbook.

## Screenshots
`desktop.png`, `desktop-assistance.png`, `desktop-more-menu.png`, `tablet.png`, `mobile.png`, `mobile-assistance.png`, `assistance.png`, `original-143…146.png`.

## For owner review
- Hint shows automatically when a question opens (as in GML-005). Steps and Answer stay hidden until requested. Revealing the answer also reveals the steps, as before.
- The lesson selector lists 5-2 to 5-4 as disabled "coming soon" entries.
- The Codex "Start over at page 143" button was removed; the page selector covers it.
