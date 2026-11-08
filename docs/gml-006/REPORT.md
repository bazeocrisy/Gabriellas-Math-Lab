# GML-006: Lesson 5-1 simplified redesign

**Scope:** Lesson 5-1 only (printed pages 143-146). Base: `codex/gml-005-lesson-5-1` (PR #23).

## Design (revised after owner feedback)
The owner asked for it to be simple: no left pane, no right pane, and a question mark beside each problem that shows the solution when tapped.

- **Top bar:** title, Previous / page selector / Next, save status, Home.
- **Textbook card:** the full width of the screen. One toolbar: Type, Pencil, Eraser, Pan, Undo, Redo, Zoom, Original only, and a More menu (save, print, backup, restore, reset zoom, clear page).
- **A "?" beside each problem** (in the margin, never on the artwork). Tapping it outlines the problem on the page and opens a card at the bottom with Hint, Show Me How and Answer, all visible. Close with the X or Escape; focus returns to that "?".
- **Original only** hides every "?" and the outline.
- On phones the "?" buttons are spaced so they never overlap, and the card is a bottom sheet.

Removed from the earlier version: the left navigation card, the questions list, the right-hand panel, "I finished this question" ticks, and the lesson selector. Saved "finished" data in existing browsers is left untouched.

## Unchanged
Source PDF and page renders, all 25 question entries, storage format `gml:lesson-5-1:v2`, ink, backup/restore and printing (four original pages with the student's work, no app UI).

## Verification (headless Chromium)
| Suite | Result |
|---|---|
| `npm test` | 272 / 272 |
| `test:lesson51:browser` | 76 / 76 |

The Lesson 5-1 suite has fewer checks than before because the question-list, completion and side-panel checks no longer apply. It still covers all four pages, all 25 "?" buttons, handwriting, typing, undo/redo, zoom and pan alignment, backup/restore, printing, browser history and resume, and 44px touch targets at 320-1440px with no overflow.

The legacy, Chapter 4 and responsive suites passed on the previous commit; this change touches only `lesson-5-1/`, so they were not re-run.

Screenshots: `desktop.png`, `desktop-assistance.png`, `tablet.png`, `tablet-assistance.png`, `mobile.png`, `mobile-assistance.png`, `original-143...146.png`.
