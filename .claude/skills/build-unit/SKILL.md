---
name: build-unit
description: "Build a StudyNova unit for any subject (Math, ELA, Social Studies, Science): Learn, Practice and Test with original questions aligned to the Georgia Standards of Excellence for grade 5, every answer checked, reviewed and released through the preview."
---
# Build Unit

Units own learning material (D8, D10). Weeks only point at it.

## 1. Plan
- Subject, unit title, GSE grade 5 standards covered, and the class's pacing (from the week files and the owner).
- Add the unit to `data/subjects.json` (`units[]`: `id`, `title`, `status`, `href`).
- Math: build inside the Math app (`math/`, its engine and `tests/math/`); keep its storage keys (`gml:v1:*`). Do not add Chapter 5 from scans; write original problems.
- ELA, Social Studies, Science: until a subject app exists, propose the page structure to the owner first (a new folder must be added to the allowlist in `scripts/build-site.js` and covered by tests and browser checks).

## 2. Write original content (with `grade5-curriculum-developer`)
- **Learn:** short explanations, worked examples, pictures or diagrams drawn for StudyNova.
- **Practice:** at least 20 questions per skill, a reason for every wrong answer, step-by-step help that never states the answer outright.
- **Test:** a mixed set with no hints; results show what to practise next.
- Never copy textbook pages, worksheet items, answer keys or long passages. No real names; neutral fictional first names only.

## 3. Check every answer automatically
Add unit tests that recompute each answer key and check one correct option, unique choices and valid links. Data must pass `scripts/validate-data.js`; pages must pass `scripts/build-site.js` verification.

## 4. Link it from the weeks
In the relevant week files, set the subject's `unit` and add `resources.learn / practice / guides / tests` entries with relative links.

## 5. Review
Send the work, without your conclusions, to `grade5-curriculum-developer`, `educational-ui-designer`, `accessibility-child-usability` and `qa-browser-tester`. Fix findings and re-run the tests.

## 6. Release
`npm run test:all`, push to `develop`, the owner checks the preview, PR `develop` → `main`, wait for explicit approval, confirm the Pages deployment.
