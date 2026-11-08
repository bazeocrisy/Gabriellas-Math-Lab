# GML-007: The whole Chapter 5 book in the approved design

The owner approved the GML-006 Lesson 5-1 design (one slim bar, a "?" beside each problem, the solution in a right-hand pane) and asked for the entire book to be done the same way, using multiple agents.

Open it at `chapter-5/` (for example `chapter-5/#page=149`). `lesson-5-1/` is unchanged and still works.

## What is in the book
| Section | Title | Printed pages | Questions |
|---|---|---|---|
| Unit 5 Opener | Multiply Multi-Digit Whole Numbers | 141–142 | 7 |
| Lesson 5-1 | Understand Powers and Exponents | 143–146 | 25 |
| Lesson 5-2 | Patterns When Multiplying a Whole Number by Powers of 10 | 147–150 | 30 |
| Lesson 5-3 | Estimate Products of Multi-Digit Factors | 151–154 | 19 |
| Lesson 5-4 | Use Area Models to Multiply Multi-Digit Factors | 155–158 | 19 |
| Lesson 5-5 | Use Partial Products to Multiply Multi-Digit Factors | 159–162 | 19 |
| Lesson 5-6 | Relate Partial Products to an Algorithm | 163–166 | 20 |
| Unit 5 Check | Multiplication of 2-Digit Numbers | 167–168 | 4 |
| Lesson 5-7 | Multiply Multi-Digit Factors Fluently | 169–172 | 21 |
| Unit Review | Unit Review | 173–176 | 22 |
| Fluency Practice | Fluency Practice | 177–178 | 15 |

38 pages and 201 questions. Page 141 (the unit cover) has nothing to answer.

## How it was built
1. **Pages.** `tools/render-chapter5.py` renders every PDF page exactly as Lesson 5-1 was rendered (PyMuPDF 3x, full page, rotation honoured), then compresses each PNG losslessly. `tools/audit-chapter5-source.py` confirms every page is pixel-identical to the PDF render; pages 143-146 match the Lesson 5-1 files.
2. **Viewer.** `chapter-5/` is the approved Lesson 5-1 viewer, made data-driven: the page picker is grouped by section, the bar shows the current section, and Print prints the open lesson.
3. **Content (7 agents in parallel).** Each agent wrote one part in `chapter-5/data/parts/`: answer boxes, "?" positions, a hint, kid-friendly steps and an answer for every problem. Each computed every answer in Python and checked it a second way, compared placement on overlay previews (`tools/preview-chapter5-page.py`) and passed `tools/validate-chapter5-part.py`. Lesson 5-1's audited data is reused unchanged. `tools/build-chapter5.py` merges everything into `chapter-5/data/`.
4. **Independent check (3 agents).** Fresh agents solved every problem from the page images before reading the authored answers.
   - **Real error fixed:** page 177 problem 3 had been misread as 4,279 + 2,398. The page says 4,279 + 2,368 = 6,647.
   - **Explanation tightened:** page 162 problem 11. Raya's partial products are for 218 × 17.
   - **Placement fixes:** pages 148, 154, 159, 161, 165 and 176.
   - **Everything else:** confirmed.

The old 5-1 to 5-4 workbook's draft answers had three misreadings, now correct: 304 × 68 = 20,672; 14 × 128 = 1,792; 452 × 273 = 123,396.

## Saved work
One store, `gml:chapter-5:v1`. On the first visit it copies:
- Lesson 5-1 work (`gml:lesson-5-1:v2`), including the last page;
- the original workbook's handwriting for every page;
- workbook typed answers wherever the same answer box exists. Field ids were kept for pages 147-158.

The older keys are read, never changed. Backup and restore use the same format.

## Judgement calls for the owner
- **Page 142 (Mile-High Pennies):** the picture's stacks are not perfectly consistent. The answer uses 17 pennies per inch.
- **Page 161 problem 7:** the bike price ($249) is only on the price tag in the photo.
- **Page 172 problem 12:** a "7-day stay" is read as 7 nights ($1,351).
- **Page 175 problem 17:** "5 weeks" is read as 35 running days (4,410 miles).
- **Page 176 Part B:** uses 52 weeks in a year.
- **Page 167:** says "four students", but the probe shows three.
- **Answer boxes without a printed blank:** some prompts (Mindset, some Learn examples) have no printed blank, so their boxes sit in nearby white space.

## Verification
| Suite | Result |
|---|---|
| `npm test` (includes new `chapter5.test.mjs`) | 278 / 278 |
| `test:chapter5:browser` (every page, every "?", phone-width overlap, saving, migration, print, touch targets) | 328 / 328 |
| `test:lesson51:browser` | 77 / 77 |
| `python tools/audit-chapter5-source.py` | 38 / 38 pages pixel-identical |

Screenshots: `desktop-147.png`, `desktop-171.png`, `mobile-149.png`.
