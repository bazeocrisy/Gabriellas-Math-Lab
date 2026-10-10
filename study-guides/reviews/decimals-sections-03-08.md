# Review record: Decimals Sections 3–8

All six sections use the format approved in Phase 1: skill heading → Show How → Let's Try One →
Your Turn, with a parent answer key at the end of each section. The key is generated from the
questions, and every answer is worked out exactly (no floating-point arithmetic).

| Section | Pages | Practice | Let's Try One | Standards |
|---|---|---|---|---|
| 3. Rounding Decimals | 14 | 48 | 5 | 5.NR.4.3 |
| 4. Adding Decimals | 17 | 56 | 6 | 5.NR.4.4 |
| 5. Subtracting Decimals | 15 | 48 | 5 | 5.NR.4.4 |
| 6. Multiplying Decimals (supplemental) | 19 | 64 | 7 | Grade 6 (6.NR.1); 6.1 connects to 5.NR.1.2 |
| 7. Dividing Decimals (supplemental) | 19 | 60 | 7 | Grade 6 (6.NR.1); 7.1 connects to 5.NR.1.2 |
| 8. Mixed Decimal Practice | 11 | 46 | 1 | Part A: 5.NR.1.1 and 5.NR.4 core; Part B: supplemental |

The four required examples are all included:

| Example | Where |
|---|---|
| 3.45 + 2.27 = 5.72 (the five steps) | 4.3 |
| 8.20 − 3.76 = 4.44 (regrouping across places) | 5.2 |
| 2.4 × 3 = 7.2 (equal groups first, then the written method) | 6.2, 6.3 |
| 6.4 ÷ 2 = 3.2 (64 tenths ÷ 2 = 32 tenths, then long division) | 7.2 |

## Automatic checks

- **Unit tests (`npm test`):** 13 tests, all passing. They cover rounding, adding, subtracting,
  multiplying, dividing, choosing the operation, and the four required examples.
- **Build (`npm run build`):** every question has an answer. Each multiple-choice question has exactly
  one choice equal to the computed answer. Footer page numbers and table-of-contents page numbers match
  the real pages. Nothing is clipped, overlapping, or outside the margins.

## Independent reviews

Three read-only reviewers each took two sections. For each section they recomputed every answer,
checked every diagram, and viewed every page.

**First pass:** no math errors in any section. The findings were about teaching and layout:

| Section | Result | Major findings (all fixed) |
|---|---|---|
| 3 | PASS | none |
| 4 | FAIL | No carry boxes on practice problems; practice used kinds of regrouping that were never taught; one problem added three numbers |
| 5 | FAIL | Regrouping across a zero appeared before it was taught |
| 6 | PASS | none |
| 7 | FAIL | The 6.4 ÷ 2 written method was missing; too little room under the long-division brackets |
| 8 | PASS | none |

**Minor fixes applied** (about 30 in total), including:

- Thousandths changed to hundredths in Sections 4 and 5, to match 5.NR.4.4.
- Money answers in the key always show two decimal places, and units are added to answers.
- Long-division Show How examples show every subtract and bring-down row, including zero remainders.
- Carry marks added to multiplication; carry boxes appear only on problems that regroup.
- Equivalent division expressions practiced in 7.5.
- Section 8 Part A gained an add-or-subtract choice item; standards labels corrected.
- Numbers never break across lines; "(Supplemental)" added to the page headers in Sections 6 and 7.

**Verification pass:** all six sections PASS. The remaining minor wording and format items were fixed.
Every changed page was looked at again after the final build.

## Known limitations

- The 4.1 answer key says "line up the points" before 4.2 teaches it. A reviewer marked this as not
  blocking.
- Long-division work rows keep the decimal-point column, so 15 tenths is written "1 5" with a gap.
