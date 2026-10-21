# Chapter 4 — Add and Subtract Decimals: implementation contract

Status: runtime implemented; release evidence and quality gates are recorded in ASSIGNMENT-005-STATUS.md.

## Non-negotiables
- Keep all existing NumberNova decimal lessons, practice center, guides, parent progress, and saved data intact.
- New home choice: "Decimal Skills — Georgia Standards" and "Chapter 4 — Add and Subtract Decimals".
- New chapter navigation: eight lessons, all accessible independently; chapter review and final test.
- Each lesson: Learn with progressive guidance, Practice with progressive hints and retry, fresh 10-question sessions, independent no-hint test, results and mistake review.
- Reuse existing exact-decimal helpers, question engine, coaching, scoring, local storage and accessible UI.
- Avoid copying textbook pages/questions verbatim into publicly hosted code; write original aligned problems and explanations.
- Decimal grid visuals must correctly reflect place values and regrouping.
- Owner authorization in Assignment 005 permits merge and deployment only after all acceptance criteria pass.

## Textbook sequence (verified from provided pages)
4-1 Estimate Sums and Differences of Decimals — p.101
4-2 Represent Addition of Decimals — p.107
4-3 Represent Addition of Tenths and Hundredths — p.111
4-4 Strategies to Add Decimals — p.115
4-5 Represent Subtraction of Decimals — p.119
4-6 Represent Subtraction of Tenths and Hundredths — p.123
4-7 Strategies to Subtract Decimals — p.127
4-8 Explain Strategies to Add and Subtract Decimals — p.131
Unit Review — p.135; Fluency/Performance — p.139

## Validation gates
- Every lesson must have representative visual and nonvisual questions, explanatory hints that do not reveal the answer, and an independent test.
- Independently recompute every generated answer across many seeds, check hint and choice integrity.
- Test both new and existing navigation at 320, 375, 768, 1024, and 1440px; keyboard and touch behavior.
- Run npm test and npm run test:browser; preserve existing progress fixtures.
- Complete independent reviews and all required checks in the PR before merge.
