# Review record: Decimals Section 2, Reading, Writing, and Comparing Decimals

- **Source:** `lessons/decimals/section-02-read-write-compare.html`
- **PDF:** `pdf/decimals/Decimals-Section-2-Reading-Writing-and-Comparing-Decimals.pdf` (20 US Letter pages)
- **Standards:** Georgia 5.NR.4.1 and 5.NR.4.2
- **Approval:** Phase 1 (Section 1) was approved on 2026-10-10.

## Contents

The PDF has one cover page, two pages for each of the 7 skills, two review pages and three answer-key
pages (20 pages in all). It has 66 practice problems (8 per skill and 10 in the review) and 7 Let's Try
One problems.

| Skill | Show How problem | Let's Try One |
|---|---|---|
| 2.1 Reading decimals in words | 4.735 → “four and seven hundred thirty-five thousandths” | 12.05 |
| 2.2 Writing decimals from words | “six and eight hundredths” → 6.08 | 0.312 |
| 2.3 Standard, word, expanded form | 2.406 in all three forms, plus going backward | 5.38 |
| 2.4 Comparing with >, <, = | **0.8 > 0.75** (required example: place-value charts and grids) | 3.42 vs 3.408 |
| 2.5 Comparing on a number line | 0.32 vs 0.37 | 1.6 vs 1.3 |
| 2.6 Least to greatest | 0.405, 0.45, 0.5 | 2.03, 2.3, 2.33 |
| 2.7 Greatest to least | 1.202, 1.2, 1.02 | 0.7, 0.67, 0.076 |

## Checks

- **Unit tests:** 8 tests, all passing. New this section: word form, comparing (including 0.8 > 0.75),
  ordering in both directions, and a check that ordering lists have different values.
- **Generated text:** word forms in the prompts are filled in from the number, and expanded forms are
  computed. A prompt can't disagree with its answer.
- **Build:** all 73 questions are answered. There is no layout overflow, and the overflow check now also
  catches inline answer lines.

## Mathematics and instruction review (independent): PASS

The reviewer recomputed all 73 answers and the Show How problems. Every word form, number-line point
and ordering list is correct, and there are no math errors.

**Fixed after the review:**

- **Answer-key wording:**
  - "1 decimal places" and "1 wholes" are now singular.
  - Writing-from-words keys show the writing steps, including placeholder zeros.
  - Expanded-to-word keys show the standard form first.
  - Number-line keys give the jump size and read each point.
- **Show How additions:**
  - 2.3 now models going backward.
  - 2.4 uses place-value charts and states the equal case (0.7 = 0.70).
  - 2.5 mentions 0.001 jumps.
- **Layout (Review 8–9):** the answer labels are fixed.

## Layout review (lead)

Every page of the final PDF was inspected. Defects found and fixed:

- **Answer labels overflowed the card's left edge** (pages 3, 7 and 17). Long answer lines now stretch
  to fit the card, and the build check catches this case.
- **Number-line cards on page 11 were too tall.** The dotted work area was removed from them; the line
  itself is the work space.
- **Wrapped blanks:** the 2.4 Show How and the 2.6 and 2.7 Try layouts had blanks wrapping onto new lines.

The shared CSS change also affects Section 1's expanded-form answer lines. Section 1 still builds
cleanly, and page 15 was re-checked.
