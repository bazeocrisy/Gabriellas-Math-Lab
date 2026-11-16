---
name: update-week
description: "Turn the material the parent supplies for any StudyNova subject (newsletter, homework, test announcements, vocabulary) into a privacy-reviewed data/weeks/<Monday>.json, list it, test it and release it through the preview."
---
# Update Week

Weeks own what was sent home: topics, homework, tests and quizzes, vocabulary, teacher notes and events (D8). Format: `data/SCHEMA.md`. Guide: `docs/CONTENT-GUIDE.md`.

## 1. Privacy review (before typing anything)
- Keep raw photos and scans in `private/<week>/` (git-ignored). Never commit or publish them.
- Find and leave out: student, teacher, school, staff and family names; grades and scores; emails, phone numbers, class codes, portal links; textbook pages, worksheet items, answer keys, long passages.
- Teachers are named by role only ("Science teacher"). If something might be private, leave it out and ask the owner.

## 2. Read the material, per subject
For each subject sent (math, ela, social-studies, science): unit, topics, homework (with due dates), tests/quizzes/projects/benchmarks (with dates and what they cover), vocabulary (term, meaning, our own example), the teacher's note, and whole-week events (no school, early release).

## 3. Write `data/weeks/<Monday>.json`
- File name and `id` are that week's Monday (`YYYY-MM-DD`). Missing subjects are left out or left empty.
- Homework and assessments get stable ids (`m-1`, `e-t1`). `assessments[].date` is required; `kind` is test, quiz, project or benchmark.
- Add `studyTips` that point at StudyNova material (e.g. a Math app chapter) and `resources` with relative links only.
- A test announced for next week: post next week's file too.
- Never change an earlier week's meaning. Never copy the EXAMPLE in `data/SCHEMA.md`.

## 4. List it
Add `{ "id", "label" }` at the top of `data/weeks/index.json` and set `current` to the newest week. If a new unit started, add it to `data/subjects.json` (`units[]`, `status`).

## 5. Test
`npm test` (schema, privacy, blocked names), `npm run build` (allowlist, links, data), `npm run test:site` (browser). Fix every failure; never weaken a check.

## 6. Review and release
Ask `grade5-curriculum-developer` to check vocabulary and study tips, then push to `develop`. Ask the owner to compare https://bazeocrisy.github.io/StudyNova/preview/ with the papers (dates, definitions, nothing private). Open the PR `develop` → `main` and wait for explicit approval.
