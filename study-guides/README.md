# Study Guides

Printable color workbooks that go with the Math Lab app. Each lesson has one HTML source file, and a
build script turns it into a US Letter PDF. The guides use the same objectives, words, examples and
skills as the app lesson.

| Guide | App lesson | PDF | Status |
|---|---|---|---|
| Decimals, Lesson 1: Understanding Decimals | D01 | [pdf/decimals/Decimals-Lesson-1-Understanding-Decimals.pdf](pdf/decimals/Decimals-Lesson-1-Understanding-Decimals.pdf) | Reviewed ([review log](reviews/decimals-lesson-01.md)) |

## What is in a guide

Every guide has the same sections, in this order, with one color for each:

| Section | Color | Purpose |
|---|---|---|
| Cover | navy | Title, a hero picture, contents, how to use the guide, standards |
| Learn | teal | "I can" goals, Words to Know, the big idea |
| See It | blue | Labeled pictures: place-value charts, models, common mistakes |
| Worked Examples | purple | Numbered steps with a handwritten check |
| Try It Together | amber | Guided practice with blanks to fill in and hints |
| On Your Own | rose | Independent practice with no hints, in a mix of question types |
| Answer Key | slate | Every answer with the reason, and pictures where they help |
| For Parents | plum | Mastery checklist matching the app's skills, common mistakes, next steps |

Each place value always has the same color: ones are purple, tenths blue, hundredths green and thousandths orange.

## Files

```
study-guides/
  assets/workbook.css     design system: page frame, colors, type, boxes, questions, key, checklist
  assets/models.js        draws the grids, bars, number lines and place-value charts from exact values
  assets/fonts/           Lexend (text) and Caveat (handwritten notes), both under the SIL Open Font License
  lessons/<unit>/lesson-NN.html   the lesson source: edit this file
  pdf/<unit>/*.pdf        the built PDF (committed)
  reviews/                review log for each lesson
  tools/build.mjs         builds the PDFs, checks them, and renders every page to PNG
  tools/render.html       renders PDF pages with pdf.js, used by build.mjs
```

## Build

You need Node 18 or newer and Google Chrome or Microsoft Edge. Set `CHROME_PATH` if the browser is not found.

```
cd study-guides
npm install
npm run build                              # every lesson
node tools/build.mjs decimals/lesson-01    # one lesson
```

The build stops with an error if any of these checks fails:

1. A model can't be drawn, for example a value that isn't a decimal with up to 3 places.
2. Something on a page runs into the footer or the margins, or sticks out of its box and overlaps
   something next to it.
3. The PDF doesn't have exactly one page per `<section class="page">`, or the Lexend font didn't load.
4. A question (`data-q`) has no answer-key entry (`data-for`), or a key entry has no question.
5. A key doesn't show the question's `data-answer`.
6. With `data-model-answer`, the question's model wasn't drawn from that same value.

After building, each page of the PDF is drawn with pdf.js to `qa/<unit>/<lesson>/page-NN.png`.
Look at every one of these images before you publish. The `qa/` folder is not committed.

## Writing a new lesson

1. Copy `lessons/decimals/lesson-01.html`. Keep the section order and the `t-*` theme classes.
2. Put each page in its own `<section class="page">`. Pages never flow onto the next one, so a page
   that is too full fails the build and you fix it on purpose.
3. Draw pictures with `data-model`, never with images:
   - `<div data-model="grid" data-value="0.34">`
   - `strip` / `bar` for tenths
   - `line` with `data-from`, `data-to`, `data-point`
   - `chart`
   - `data-blank="1"` gives an empty model for the student to shade or fill in.
4. Give every question `data-q`, and its key entry `data-for` with the answer in `<span class="ka">`.
   Add `data-answer` (and `data-model-answer`) so the build can check the key.
5. Use the app lesson's skills, words and teaching examples, and keep the parent checklist's skill
   names the same as the app's.
6. Run the curriculum, design and PDF reviews, then record them in `reviews/`.
