# StudyNova data files

The hub (`index.html`) reads three kinds of JSON file. All dates are `YYYY-MM-DD` and are read as local calendar
days. Weeks are named by their **Monday**. Every list may be empty and every text field may be `null`: the site then
shows a friendly "nothing posted yet" or "coming soon" state. Never put student, teacher or school names, textbook
scans or copied answer keys in these files.

```
data/
  subjects.json          the four subjects (always math, ela, social-studies, science)
  weeks/index.json       which weeks have a file, and which week is "current"
  weeks/<YYYY-MM-DD>.json one file per posted week (the Monday's date)
```

If a file cannot be loaded, the page says which file and why, and offers "Try again". If one item in a week is
broken (for example a test with no date), that item is skipped and a yellow note lists what was skipped; the rest of
the page still shows.

## `data/subjects.json`

```jsonc
{
  "version": 1,
  "subjects": [
    {
      "id": "math",                 // one of: math, ela, social-studies, science (required)
      "name": "Math",               // shown on cards and chips
      "longName": null,             // optional, e.g. "English Language Arts"
      "role": "Math teacher",       // the teacher is shown by role only, never by name
      "currentUnit": null,          // fallback unit when a week does not name one
      "units": [                    // the year's units, in order
        { "id": "decimals", "title": "Decimal Skills", "status": null, "dates": null, "href": "math/index.html#/decimals" }
      ]
    }
  ]
}
```

- `units[].status`: `"current"`, `"done"`, `"upcoming"` or `null` (no label shown).
- `units[].href` and every other link: a relative link inside this site, or an `https://` link. Anything else is ignored.

## `data/weeks/index.json`

```json
{
  "version": 1,
  "current": "2026-11-16",
  "weeks": [ { "id": "2026-11-16", "label": "Week of November 16–20" } ]
}
```

- The hub shows the week that contains today (on Saturday and Sunday, the coming week). `current` is used only when
  the list is otherwise ambiguous; keep it set to the newest posted week.
- A week that is not listed here is shown as "Nothing posted for this week" without trying to load a file.
- Home and the subject pages also look one week ahead for upcoming tests, so post next week's file early when a test
  is announced.

## `data/weeks/<YYYY-MM-DD>.json`

| Field | Type | Notes |
|---|---|---|
| `version` | `1` | |
| `id` | date | must match the file name (the Monday) |
| `label` | text or null | e.g. "Week of November 16–20"; made from the date when null |
| `notes` | text or null | a note for the whole week, shown on This Week |
| `events` | list | `{ "date": date or null, "text": "..." }` such as no-school days or early release |
| `subjects` | object | one block per subject id; a missing block counts as empty |

Each subject block:

| Field | Type | Notes |
|---|---|---|
| `unit` | text or null | the unit this week; shown on Home and the subject page |
| `topics` | list | `"text"` or `{ "title": "...", "detail": "..." }` |
| `vocabulary` | list | `{ "term", "meaning", "example" }`; shown as cards |
| `homework` | list | `{ "id", "title", "due", "details", "href" }`; `due` is a date or null. `id` keeps the checkmark attached when the title is edited; without it the title is used |
| `assessments` | list | `{ "id", "kind", "title", "date", "covers", "studyTips" }`; `kind` is `test`, `quiz`, `project` or `benchmark`; `date` is required |
| `notes` | text or null | a note from that subject's teacher |
| `resources` | object | `learn`, `practice`, `guides`, `tests`: lists of `{ "title", "href", "detail" }`. Empty lists show "Coming soon" |

Homework checkmarks are saved in the browser under `sn:v1:hw:<week>` as `{ "<subject>:<homeworkId>": true }`.
The Grown-ups page can clear every `sn:v1:` key. Math progress (`gml:v1:*`, owned by `math/`) is only read.

## EXAMPLE (not loaded by the site)

This is a made-up example to show every field filled in. It is **not** real class material and must not be copied
into `data/weeks/` as if it were.

```json
{
  "version": 1,
  "id": "2026-11-30",
  "label": "Week of Nov 30 – Dec 4",
  "notes": "EXAMPLE ONLY. Library books are due back on Thursday.",
  "events": [
    { "date": "2026-12-04", "text": "EXAMPLE: Early release at noon" }
  ],
  "subjects": {
    "math": {
      "unit": "EXAMPLE: Add and Subtract Decimals",
      "topics": [
        { "title": "Estimate sums and differences", "detail": "Round to the nearest whole number first." },
        "Subtract decimals with regrouping"
      ],
      "vocabulary": [
        { "term": "estimate", "meaning": "A number close to the exact answer.", "example": "4.8 + 3.1 is about 5 + 3 = 8." }
      ],
      "homework": [
        { "id": "ex-m1", "title": "EXAMPLE: Practice page, problems 1–10", "due": "2026-12-01", "details": "Show the lined-up decimal points.", "href": null },
        { "id": "ex-m2", "title": "EXAMPLE: 15 minutes in the Practice Center", "due": null, "details": null, "href": "math/index.html#/practice" }
      ],
      "assessments": [
        { "id": "ex-m-t1", "kind": "quiz", "title": "EXAMPLE: Lessons 4-1 to 4-4 quiz", "date": "2026-12-03",
          "covers": "Estimating, and adding decimals with models and strategies.",
          "studyTips": ["Redo the Chapter 4 practice for Lessons 4-1 to 4-4.", "Check each answer with an estimate."] }
      ],
      "notes": null,
      "resources": {
        "learn": [],
        "practice": [ { "title": "EXAMPLE: Chapter 4 practice", "href": "math/index.html#/chapter4", "detail": null } ],
        "guides": [],
        "tests": []
      }
    },
    "ela": {
      "unit": "EXAMPLE: Informational Writing",
      "topics": ["Main idea and key details"],
      "vocabulary": [ { "term": "summarize", "meaning": "Tell the most important ideas in a few sentences.", "example": null } ],
      "homework": [ { "id": "ex-e1", "title": "EXAMPLE: Read for 20 minutes each night", "due": "2026-12-04", "details": null, "href": null } ],
      "assessments": [],
      "notes": null,
      "resources": { "learn": [], "practice": [], "guides": [], "tests": [] }
    },
    "social-studies": {
      "unit": null, "topics": [], "vocabulary": [], "homework": [],
      "assessments": [ { "id": "ex-s-t1", "kind": "test", "title": "EXAMPLE: Unit test", "date": "2026-12-04", "covers": null, "studyTips": [] } ],
      "notes": null,
      "resources": { "learn": [], "practice": [], "guides": [], "tests": [] }
    },
    "science": {
      "unit": null, "topics": [], "vocabulary": [], "homework": [], "assessments": [], "notes": null,
      "resources": { "learn": [], "practice": [], "guides": [], "tests": [] }
    }
  }
}
```
