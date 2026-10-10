# Decimals Workbook

A printable, color fifth-grade decimals workbook that goes with the Math Lab app. It teaches through
examples and practice. Each section is one HTML source file, and a build script turns it into a
US Letter PDF.

| Section | PDF | Pages | Practice problems | Status |
|---|---|---|---|---|
| 1. Decimal Place Value | [Decimals-Section-1-Decimal-Place-Value.pdf](pdf/decimals/Decimals-Section-1-Decimal-Place-Value.pdf) | 24 | 82 | Approved 2026-10-10 |
| 2. Reading, Writing, and Comparing Decimals | [Decimals-Section-2-Reading-Writing-and-Comparing-Decimals.pdf](pdf/decimals/Decimals-Section-2-Reading-Writing-and-Comparing-Decimals.pdf) | 20 | 66 | Built and reviewed |
| 3. Rounding Decimals | [Decimals-Section-3-Rounding-Decimals.pdf](pdf/decimals/Decimals-Section-3-Rounding-Decimals.pdf) | 14 | 48 | Built and reviewed |
| 4. Adding Decimals | [Decimals-Section-4-Adding-Decimals.pdf](pdf/decimals/Decimals-Section-4-Adding-Decimals.pdf) | 17 | 56 | Built and reviewed |
| 5. Subtracting Decimals | [Decimals-Section-5-Subtracting-Decimals.pdf](pdf/decimals/Decimals-Section-5-Subtracting-Decimals.pdf) | 15 | 48 | Built and reviewed |
| 6. Multiplying Decimals (supplemental) | [Decimals-Section-6-Multiplying-Decimals.pdf](pdf/decimals/Decimals-Section-6-Multiplying-Decimals.pdf) | 19 | 64 | Built and reviewed |
| 7. Dividing Decimals (supplemental) | [Decimals-Section-7-Dividing-Decimals.pdf](pdf/decimals/Decimals-Section-7-Dividing-Decimals.pdf) | 19 | 60 | Built and reviewed |
| 8. Mixed Decimal Practice | [Decimals-Section-8-Mixed-Decimal-Practice.pdf](pdf/decimals/Decimals-Section-8-Mixed-Decimal-Practice.pdf) | 11 | 46 | Built and reviewed |
| **Total** | | **139** | **470** (+ 47 Let's Try One) | |

## How every skill is laid out

Each skill takes two pages: a teaching page, then a practice page.

| Part | Color | What it has |
|---|---|---|
| Skill heading | navy | Skill number, name, and one goal |
| **Show How** | blue | A real problem solved in numbered steps, with diagrams and a one-line "Why it works" |
| **Let's Try One** | green | A similar problem with some steps filled in, plus room to work |
| **Your Turn** | purple | 8 problems, from easier to harder, on that one skill. Each has its own work space and answer line |
| **Parent Answer Key** | slate | At the end of the section, built automatically from the questions |

Each place value always has the same color: tens are brown, ones red, tenths orange, hundredths teal
and thousandths pink.

## Files

```
study-guides/
  assets/workbook.css     design system: page, skill banner, Show How / Try / Your Turn boxes, cards, charts, key
  assets/practice.js      numbers the questions, works out every answer exactly, and builds the answer key
  assets/models.js        draws grids, strips, number lines and place-value charts from exact values
  assets/fonts/           Lexend and Caveat (SIL Open Font License)
  lessons/decimals/section-NN-*.html   the section sources (edit these)
  pdf/decimals/           the built PDFs (committed)
  tests/                  unit tests for the answer calculators
  tools/build.mjs         builds and checks the PDFs, and renders every page to PNG
  reviews/                review record for each section
```

## Writing problems

A practice problem is one card. Give it a calculator, and the answer is worked out for the key:

```html
<div class="card q" data-calc="value 4.735 7" data-ans="Value">What is the value of the <b>7</b> in 4.735?</div>
```

Calculators in `assets/practice.js`:

| Calculator | What it answers |
|---|---|
| `whole`, `decpart`, `between` | The whole-number part, the part less than one, or the two whole numbers it falls between |
| `place`, `value`, `digit` | The place of a digit, its value, or which digit is in a given place |
| `convert 3 t h` | How many hundredths are in 3 tenths |
| `times 0.7 0.07` | How many times as much the first value is |
| `expanded`, `standard` | Expanded form, or standard form from expanded form |
| `chart`, `model` | The number shown by the chart or model in the question |
| `same`, `cmp` | Whether two decimals are equal, or how they compare (>, <, =) |
| `order asc …`, `order desc …` | A list in order, least to greatest or greatest to least |
| `words`, `fromwords`, `expwords` | Word form, a decimal from its word form, or word form from expanded form |
| `round 4.735 t` | Rounding to `whole`, `t` (tenths) or `h` (hundredths) |
| `add`, `sub` | Column addition and subtraction, with every carry and regroup explained |
| `mul`, `mulg`, `mula`, `x10` | Multiplying: written method, equal groups, area model, or by 10, 100, 1,000 |
| `div`, `divg`, `d10` | Dividing: long division (digit by digit), equal groups, or by 10, 100, 1,000 |
| `est + a b`, `est x a b` | Estimates by rounding to whole numbers |
| `opw add a b` | Choose the operation, then solve |

Multiple choice: put choices in `<div class="mc"><span data-c="A">0.8</span>…</div>`. The build checks that exactly one choice equals the computed answer, and the key shows that letter.

Diagrams: `data-model="column"` (stacked +, −, ×; `data-show` shows carries and regrouping), `longdiv`, `area` (decimal × decimal), `disks` (place-value disks), plus the grids, strips, number lines and charts from Section 1.

All arithmetic is exact: no floating point. For a written-answer question, use
`data-answer="..."` with `data-why="..."` instead of a calculator.

## Build and test

You need Node 18+ and Chrome or Edge (set `CHROME_PATH` if the browser isn't found).

```
cd study-guides
npm install
npm test            # unit tests for the calculators
npm run build       # builds every PDF in pdf/, and PNGs of every page in qa/
```

The build fails if any of these happen:

- A question has no answer.
- A key entry doesn't match its question.
- A model can't be drawn.
- Anything runs into the margins or the footer, sticks out of its box, or is clipped.
- The page count doesn't match.

Look at every PNG in `qa/` before you publish.
