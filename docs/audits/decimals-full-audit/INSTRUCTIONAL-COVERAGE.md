# Instructional Coverage

Build `79abadc`. This file maps every lesson skill through **Explain → Show how → Guide → Practice → Test**.

**How to read the tables**
- Teach and guided-check columns use screen ids from `curriculum/decimals/dNN/lesson.js`. Template ids come from `bank.js`.
- **Worked example:** the steps, plus their reasoning or "Why it works".
- **P/T:** the number of questions from that skill in each Practice and Test session. Both use the same plan.
- **Feedback:** whether a wrong answer gets coaching aimed at the specific mistake. All 162 templates do (0 generic fallbacks in 59,436 probes), so the column is omitted unless there is a problem.
- **Result:** Full, Partial, Missing or N/A. Defect IDs refer to [DEFECT-REGISTER.md](DEFECT-REGISTER.md).

## Inventory

| Lesson | Screens (total) | Teach | Guided checks | Worked-example steps | Templates | Skills | Supplemental |
|---|---|---|---|---|---|---|---|
| d01 Understanding Decimals | 19 | 12 | 6 | 43 | 34 | 6 | |
| d02 Decimal Place Value | 15 | 7 | 7 | 28 | 20 | 5 | |
| d03 Comparing Decimals | 16 | 8 | 7 | 27 | 16 | 5 | |
| d04 Ordering Decimals | 12 | 6 | 5 | 23 | 13 | 5 | |
| d05 Rounding Decimals | 14 | 7 | 6 | 25 | 12 | 5 | |
| d06 Adding Decimals | 13 | 6 | 6 | 21 | 12 | 5 | |
| d07 Subtracting Decimals | 13 | 6 | 6 | 21 | 12 | 5 | |
| d08 Multiplying Decimals | 11 | 5 | 5 | 18 | 12 | 5 | yes |
| d09 Dividing Decimals | 13 | 6 | 6 | 21 | 12 | 5 | yes |
| d10 Mixed Decimal Review | 13 | 6 (including a map and test tips) | 5 | 16 | 19 (15 reused from d01–d07) | 5 | |
| **Total** | **139** | | **59** | **243** | **162** | **51** | |

Each lesson's screen total also includes its end-of-lesson review screen.

## Objective matrices

### d01 Understanding Decimals
| Objective | Teach | Worked Example | Guided Check | Practice | Test | Result |
|---|---|---|---|---|---|---|
| Tenths, hundredths, thousandths as parts | ✓ | ✓ | ✓ P3 | P1–P6 (1/session) | 1 | Full |
| Decimal models: bars, grids, number lines | ✓ bars and grids | ✓ | ✓ M1, M2 | M1–M9 (3) | 3 | **Partial**: number lines (M7, M8) are never taught (D-04). Shade-a-model (M5, M6) is only in an optional widget. |
| Place value of digits | ✓ | ✓ | ✓ PL3 (multiple choice) | PL1–PL6 (2) | 2 | Full. The typed chart (PL5) is first met in Practice (D-19). |
| Reading and writing in words | ✓ | ✓ | ✓ W1 | W1–W4 (1) | 1 | Full |
| Equivalent decimals and zeros | ✓ | ✓ | ✓ E5 | E1–E5 (2) | 2 | Full |
| Comparing (the 0.4 vs 0.35 misconception) | ✓ | ✓ | ✗ | C1–C4 (1) | 1 | **Partial**: no guided check, and the <, > and = symbols aren't taught until d03 (D-18). |

### d02 Decimal Place Value
| Objective | Teach | Worked Example | Guided Check | Practice | Test | Result |
|---|---|---|---|---|---|---|
| Naming places (tens to thousandths) | ✓ | ✓ + why | ✓ N1 | N1–N3 (2) | 2 | Full |
| Value of a digit | ✓ | ✓ + why | ✓ V1 | V1–V4 (2) | 2 | Full |
| ×10 and 1/10 between places | ✓ | ✓ + why | ✓ R1 | R1–R3 (2) | 2 | Full |
| Standard, expanded and word form | ✓ | ✓ + why | ✓ F1, F2, F4 | F1–F6 (3) | 3 | Full. Typed expanded form (F3) is first met in Practice (D-19), and its input box is cut off (D-17). The F1 answer is the longest choice (D-03). |
| Placeholder zeros | ✓ | ✓ + why | ✓ Z1 | Z1–Z4 (1) | 1 | Full. Z2 answer is the longest choice (D-03). |

### d03 Comparing Decimals
| Objective | Teach | Worked Example | Guided Check | Practice | Test | Result |
|---|---|---|---|---|---|---|
| Comparing place by place, symbols | ✓ | ✓ + why | ✓ S1, S2 | S1–S5 (3) | 3 | **Partial**: the missing-digit format (S5) is never taught (D-05). |
| Different numbers of digits | ✓ | ✓ + why | ✓ L1, L3 | L1–L3 (2) | 2 | Full |
| Equal decimals | ✓ | ✓ + why | ✓ E1 | E1–E2 (1) | 1 | Full. "=" is the answer 75% of the time (D-13). |
| Number lines | ✓ | ✓ + why | ✓ NL1 | NL1–NL3 (2) | 2 | Full |
| Explaining a comparison | ✓ | ✓ + why | ✓ Y2 | Y1–Y3 (2) | 2 | Full. Answers can be found by length (D-03). |

### d04 Ordering Decimals
| Objective | Teach | Worked Example | Guided Check | Practice | Test | Result |
|---|---|---|---|---|---|---|
| Least to greatest | ✓ | ✓ + why | ✓ O1 (order widget) | O1, O2, O5 (2) | 2 | Full |
| Greatest to least | ✓ | ✓ + why | ✓ O3 | O3, O4 (2) | 2 | Full |
| Line up with zeros; decimals in between | ✓ | ✓ + why | ✓ A1 | A1–A3 (2) | 2 | Full |
| Number lines | ✓ | ✓ + why | ✓ NL2 | NL1, NL2 (2) | 2 | Full. Screen-reader description is wrong (D-06). |
| Word problems | ✓ | ✓ + why | ✓ W3 | W1–W3 (2) | 2 | Full |

### d05 Rounding Decimals
| Objective | Teach | Worked Example | Guided Check | Practice | Test | Result |
|---|---|---|---|---|---|---|
| Round to the nearest tenth | ✓ number line with halfway mark | ✓ + why | ✓ T2 | T1, T2 (2) | 2 | Full. Answer format isn't stated (D-07). |
| Round to the nearest hundredth | ✓ | ✓ + why | ✓ H1 | H1, H2 (2) | 2 | Full |
| The rounding rule | ✓ | ✓ + why | ✓ R2 | R1, R2 (2) | 2 | Full |
| Tricky cases: 9s, exactly halfway | ✓ | ✓ + why | ✓ K1, K3 | K1–K3 (2) | 2 | Full. Halfway feedback is misleading (D-08); K2 has an answer clue (D-12). |
| Applying and working backward | ✓ | ✓ + why | ✓ A1 | A1–A3 (2) | 2 | Full |

### d06 Adding Decimals
| Objective | Teach | Worked Example | Guided Check | Practice | Test | Result |
|---|---|---|---|---|---|---|
| Adding with models | ✓ grids and bars; number line in words only | ✓ + why | ✓ AM1 | AM1–AM3 (2) | 2 | **Partial**: number-line jumps (AM3) first appear in Practice (D-20). AM2 feedback gives the answer away (D-10). |
| Lining up decimal points | ✓ | ✓ + why | ✓ AL1 | AL1–AL3 (3) | 3 | Full. AL2's screen-reader text gives the answer away (D-11). |
| Different numbers of places | ✓ | ✓ + why | ✓ MX1, MX2 | MX1, MX2 (2) | 2 | Full |
| Estimating | ✓ | ✓ + why | ✓ ES1 | ES1, ES2 (1) | 1 | Full |
| Word problems | ✓ | ✓ + why | ✓ WP1 | WP1, WP2 (2) | 2 | Full |

### d07 Subtracting Decimals
| Objective | Teach | Worked Example | Guided Check | Practice | Test | Result |
|---|---|---|---|---|---|---|
| Subtracting with models | ✓ crossed-out grid; number line in words only | ✓ + why | ✓ SM1 | SM1, SM2 (2) | 2 | **Partial**: the SM2 number line appears in 100% of Tests without a Teach picture (D-20). |
| Lining up and regrouping | ✓ | ✓ + why | ✓ SL1 | SL1–SL3 (3) | 3 | Full. SL3 hints are sometimes false (D-09); SL2 screen-reader text gives the answer away (D-11). |
| Subtracting across zeros | ✓ | ✓ + why | ✓ SZ1, SZ2 | SZ1, SZ2 (2) | 2 | Full |
| Checking by adding | ✓ | ✓ + why | ✓ SC1 | SC1–SC3 (1) | 1 | Full |
| Word problems | ✓ | ✓ + why | ✓ SW1 | SW1, SW2 (2) | 2 | Full |

### d08 Multiplying Decimals (supplemental)
| Objective | Teach | Worked Example | Guided Check | Practice | Test | Result |
|---|---|---|---|---|---|---|
| ×10, ×100, ×1000 | ✓ | ✓ + why | ✓ P1 | P1, P2 (2) | 2 | Full |
| Decimal × whole number | ✓ | ✓ + why | ✓ W1 | W1–W3 (2) | 2 | Full. W3 answer is the longest choice (D-03). |
| Tenths × tenths (area model) | ✓ | ✓ + why | ✓ A1 | A1, A2 (2) | 2 | Full. Low diagram contrast (D-28). |
| Placing the decimal point | ✓ | ✓ + why | ✓ D1 | D1–D3 (2) | 2 | Full |
| Word problems | ✓ | ✓ + why | ✓ K1 | K1, K2 (2) | 2 | **Partial**: area in square meters (K2) is in 100% of Tests but never modelled (D-21). |

### d09 Dividing Decimals (supplemental)
| Objective | Teach | Worked Example | Guided Check | Practice | Test | Result |
|---|---|---|---|---|---|---|
| ÷10, ÷100, ÷1000 | ✓ | ✓ + why | ✓ P1 | P1–P3 (2) | 2 | Full |
| Sharing with models | ✓ | ✓ + why | ✓ M1 | M1, M2 (2) | 2 | Full |
| Decimal ÷ whole number | ✓ text only, tenths only | ~ | ✓ W1, W2 | W1–W3 (3) | 3 | **Partial**: no division layout and no hundredths example (D-22); the related-fact format (W3) is untaught (D-23). |
| Checking by multiplying | ✓ | ✓ + why | ✓ C1 | C1, C2 (1) | 1 | Full. C2 answer is the shortest choice (D-03). |
| Word problems | ✓ | ✓ + why | ✓ K2 | K1, K2 (2) | 2 | Full |

### d10 Mixed Review (Lessons 1–7)
| Objective | Teach (review) | Worked Example | Guided Check | Practice | Test | Result |
|---|---|---|---|---|---|---|
| Place value | ✓ | ✓ + why | ✓ RP1 | RP1–RP4 (2) | 2 | Full |
| Comparing and ordering | ✓ | ✓ + why | ✓ RC2 | RC1–RC4 (2) | 2 | Full. RC3 answer is the longest choice (D-03). |
| Rounding | ✓ | ✓ + why | ✓ RR1 | RR1–RR4 (2) | 2 | Full (D-07 and D-08 apply) |
| Adding and subtracting | ✓ | ✓ + why | ✓ RA2 | RA1–RA3 (2) | 2 | Full |
| Multi-step problems | ✓ | ✓ one pattern (money) | ✓ X3 | X1–X4 (2) | 2 | Full for a review. The X1, X2 and X4 patterns are not modelled but combine skills already taught. |

## Formats first met in Practice or Test

"Tests" is the share of generated Tests that include the format.

| Lesson | Template | Format | Tests | Defect |
|---|---|---|---|---|
| d01 | M7, M8 | Read a point on a number line | 60% | D-04 (major) |
| d03 | S5 | Missing digit in a comparison | 59% | D-05 (major) |
| d07 | SM2 | Subtract by jumps on a number line | 100% | D-20 |
| d08 | K2 | Area in square meters | 100% | D-21 |
| d09 | W3 | Use a related whole-number fact | 100% | D-23 |
| d06 | AM3 | Add by jumps on a number line | 66% | D-20 |
| d02 | F3 | Typed expanded form | 51% | D-19 |
| d01 | PL5 | Type digits into a place-value chart | 32% | D-19 |
| d09 | W1 | Divide hundredths (no layout ever drawn) | high | D-22 |
| d01 | C2 | Choose <, > or = | low | D-18 |

## Curriculum alignment

**Source.** Georgia K-12 Mathematics Standards, Grade 5, as reproduced by a secondary source (goblinsapp.com, Georgia Grade 5 print view, fetched 2026-10-10). The official GaDOE document could not be reached (georgiastandards.org redirects to a "sunset" page), so alignment is provisional.

| Lesson | Standard(s) | Scope check |
|---|---|---|
| d01 | 5.NR.4.1, 5.NR.4.2 (foundations), 5.NR.1.1 | to thousandths ✓ |
| d02 | 5.NR.4.1, 5.NR.1.1 | tens to thousandths ✓; word form is assessed but not named in the standard (observation) |
| d03, d04 | 5.NR.4.2 | to thousandths ✓ |
| d05 | 5.NR.4.3 | rounds only to the tenth, hundredth or whole number ✓ |
| d06, d07 | 5.NR.4.4 | every number has at most 2 decimal places ✓ |
| d08, d09 | Supplemental (related to 5.NR.1.2; d09 also 5.NR.2.2) | labelled "Extra: beyond Grade 5" in every place checked ✓. Multiplying and dividing by powers of 10 may fall within 5.NR.1.2 (observation). |
| d10 | 5.NR.4.1–4.4, 5.NR.1.1 | reuses only d01–d07 question types ✓ |

- No core lesson assesses content beyond the standard's limits.
- Every skill taught has Practice and Test coverage.
- Common misconceptions are covered: longer is larger, comparing the decimal parts as whole numbers, dropped zeros, misaligned columns, no carrying, flipped columns, rounding by the wrong digit, regrouping 9s, and the halfway case.
- Not assessed (judgement): comparing on number lines with values that need thousandths.

## Answer to the key question

*Can Gabriella understand the explanation, follow the worked example, solve a guided problem, practice independently, receive meaningful coaching, and demonstrate mastery without being shown the answer?*

| Part of the learning sequence | Answer | Evidence |
|---|---|---|
| Explanations, worked examples and guided problems | **Yes**: 44 of the 51 skills are fully covered, and 7 are partial (none missing) | Every lesson has step-by-step examples. d02–d10 also have "Why it works", and there is a guided check after almost every skill. The language is short and simple (estimated reading grade 2–3), and the vocabulary is the main load. |
| Practice with coaching | **Yes** | Three hints that build on each other, feedback aimed at the specific mistake for every template, a reminder, and a solution after three tries. |
| Column-calculation solutions | **Weaker** | The "Show me how" solution for column addition and subtraction gives no carrying or regrouping steps (D-24). |
| Demonstrating mastery without being shown the answer | **Not yet reliable** | Until D-01 to D-05 are fixed: untaught formats in Lessons 1 and 3, length clues in 8 templates, and two ways to see answers before a Test is recorded. |
