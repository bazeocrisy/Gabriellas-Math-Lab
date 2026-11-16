# Content guide: from class material to a StudyNova week

Each week the parent (the owner) supplies whatever each subject sent home. Claude turns it into one JSON file,
`data/weeks/<Monday>.json`, following `data/SCHEMA.md`. Nothing from the original papers is published as-is.

## 1. What the parent supplies (any subset, any subject)
| Subject | Typical material |
|---|---|
| Math | the weekly newsletter section, homework sheet or practice page, test/quiz announcements, the chapter or unit name |
| ELA | reading focus, spelling or vocabulary list with the class definitions, writing assignment, reading log, test dates |
| Social Studies | unit topic, vocabulary, project or test dates, study guide topics |
| Science | unit topic, vocabulary, lab or project dates, test dates |

Send photos, PDFs or typed notes, whichever is easiest. Raw files are kept in `private/<week>/` (git-ignored, never
committed, never published). Missing subjects are fine: a week with only Math is a valid week.

## 2. Privacy review (always first)
Before anything is typed into a week file, read the material for:
- student, teacher, school, family or staff names (including in example sentences and signatures);
- grades, scores, reading levels, behaviour notes;
- emails, phone numbers, addresses, class codes, links to private class sites or portals;
- textbook pages, worksheet scans, copied answer keys, long copied passages.

None of these go into the repository. Teachers are referred to by role ("the Science teacher"). If a definition or
direction is needed, write it in plain words; short teacher vocabulary definitions may be kept word for word when the
class will be quizzed on that wording (no names in them). If anything is unclear, leave it out and ask the owner.

## 3. Turning material into the week file
| On the paper | In `data/weeks/<Monday>.json` (`subjects.<id>`) |
|---|---|
| "This week we are learning…" | `topics`: short phrases, or `{ "title", "detail" }` |
| Unit or chapter name | `unit` (and the unit in `data/subjects.json` if it is new) |
| Homework | `homework`: `{ "id", "title", "due", "details", "href" }`; `due` is a date or null; give each a stable `id` such as `m-1` |
| Test, quiz, project, benchmark | `assessments`: `{ "id", "kind", "title", "date", "covers", "studyTips" }`; `date` is required |
| Vocabulary / spelling words | `vocabulary`: `{ "term", "meaning", "example" }`; example sentences are our own |
| A note from the teacher | `notes` (no names) |
| No school, early release, field trip | top-level `events`: `{ "date", "text" }` |
| Study material StudyNova has built | `resources.learn / practice / guides / tests`: `{ "title", "href", "detail" }`, relative links inside the site |

Rules:
- The file name and `id` are that week's **Monday** (`2026-11-16.json`). Dates are `YYYY-MM-DD`.
- Subject ids: `math`, `ela`, `social-studies`, `science`. Leave out a subject, or leave its lists empty, when
  nothing was sent.
- A test announced for next week: also post next week's file early (Home looks one week ahead for tests).
- Never edit an earlier week's meaning; corrections are fine, recorded in the commit message.
- Do not copy the `EXAMPLE` in `data/SCHEMA.md`; it is made up.

## 4. List, check, publish
1. Add `{ "id": "<Monday>", "label": "Week of …" }` to the top of `data/weeks/index.json` and set `current` to it.
   A week file that is not listed is a draft and is not published.
2. `npm test` (schema, privacy) and `npm run test:site` (built site in a browser).
3. Push to `develop`; the owner checks https://bazeocrisy.github.io/StudyNova/preview/ against the papers
   (dates, definitions, nothing private).
4. On the owner's approval, merge `develop` → `main`.

## 5. Practice material
Weekly data only lists what is due and what to study. Learn / Practice / Test activities are built as units with
original questions (`.claude/skills/build-unit`), never as copies of class worksheets. Math activities live in the
Math app (`math/`); link them from a week with `resources` entries such as `math/index.html#/chapter4`.
