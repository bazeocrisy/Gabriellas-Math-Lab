# Claude Build Brief — Decimals MVP (D01)

## Objective
Build a simple, polished **working** fifth-grade math web app in this repository. The priority is actual instruction: **Teach → Practice → Test**, with excellent progressive hints in Practice. Begin with **D01 Understanding Decimals** only; do not build eight shallow placeholder lessons.

Read `README.md`, `docs/CURRICULUM.md`, and `docs/STATUS.md` first.

## Curriculum and scope
Georgia Grade 5 decimal study: decimal models, place value (tenths, hundredths, thousandths), representations, comparing, ordering, rounding, addition and subtraction. Georgia's standards are the authority; IXL is a secondary coverage reference, not content to copy. This issue implements prerequisite lesson **D01**, not the complete standards.

D01 skills:
- Understand a whole divided into **10**, **100**, or **1000** equal parts.
- Identify tenths, hundredths, and thousandths in a decimal.
- Match a shaded visual to decimal notation and decimal notation to a model.
- Understand equivalence such as 0.5 = 0.50 and zero placeholders.
- Read a decimal place-value chart and explain what each digit represents.
- Identify a typical misconception: 0.4 is not smaller than 0.35 because 4 < 35.

Define lesson vocabulary plainly: decimal point, decimal, whole, tenth, hundredth, thousandth, equivalent decimals, place value.

## Interaction contract
Home: one prominent Decimals section, a D01 lesson card, and three explicit buttons **Teach**, **Practice**, **Test**. Other lessons may show 'Coming later' without nonfunctional buttons. Responsive for iPhone and desktop; light, simple, high contrast; keyboard-friendly, large tap targets. No login/settings/backend.

### Teach
A sequenced four-stage lesson:
1. WHAT: definition and everyday illustration (e.g., one chocolate bar cut into ten equal pieces).
2. SEE IT: interactive 10-part strip, 10x10 hundredths grid, 1000 shown via layered place-value depiction rather than 1000 tiny inaccessible squares; chart labels.
3. HOW: worked examples with narration in short text and clear reasoning; explicitly show 0.6 = 6 tenths and 0.06 = 6 hundredths, plus 0.5 = 0.50.
4. TRY TOGETHER: at least 3 guided checks; correct feedback and specific coaching after errors. Finish with a next-step button to Practice.

No autoplay, animations required, or external network assets. Visual figures must match numerical answers exactly.

### Practice
At least 25 **original, verified** problem templates/variants spanning tenths/hundredths/thousandths, visual-to-number, number-to-model, digit place value, equivalence, simple explanations, and comparisons as transfer practice. Deliver 10 questions per session, balanced across skills with no repeats in one session. Never show the answer before attempting.
- Hints progressively reveal reasoning without immediately revealing final answer:
  1. What to pay attention to.
  2. First solving step/model highlighting.
  3. Detailed strategy and partial worked step, but allow the learner to finish.
- On wrong answers, provide a misconception-specific explanation; do not advance automatically.
- Correct answers include a short 'why'.
- Reset and new practice session available.
- Handle equivalent numeric answers sensibly, e.g., 0.6 and 0.60 when relevant.
- Use buttons to select visualization/model answers where appropriate; avoid making typing the only interaction.

### Test
10 fresh, independently answerable items, no hints, no coaching until submission; include multiple-choice, typed numbers, model interpretation and reasoning checks. Score and item-by-item results at the end, tagging missed skills and linking back to relevant Teach stage or Practice. No answer leakage; do not reuse exact displayed Practice questions. No timer. Passing benchmark 85% is an **app-specific suggestion**, not an official Georgia threshold; with a 10-question test, require at least 9 correct for 'mastered' and show raw score.

### Parent review / privacy
Local-only progress using localStorage (test date, score, missed skills). Clearly say progress is specific to the current browser/device. No child's surname, personal account, analytics, tracking, or network calls. Add a simple 'Parent Progress' page or panel with recent test results and mastered/needs-practice status.

## Engineering expectations
- Static HTML/CSS/vanilla JS is sufficient; no heavy framework or build system needed.
- All asset links relative for GitHub Pages project path.
- Separate validated curriculum/question data from interface code.
- Represent decimal answers exactly using scaled integers/strings; no fragile direct floating equality.
- Accessible labels for inputs and graphics; visible focus and color-independent correctness cues.
- Keep JS injection-safe and resilient to invalid inputs.
- No copying IXL prompts, screenshots, explanations, or proprietary illustrations.
- Include automated or deterministic verification of question-answer correctness; provide concise test instructions.

## Acceptance checks
1. All three modes fully work on desktop and narrow mobile viewport.
2. Teach contains accurate tenth, hundredth, thousandth models and equivalent decimals.
3. Hints progress in order; Test has absolutely no hint access.
4. Wrong answers get clear coaching in Practice; no answer disclosure in Test before submit.
5. Ten-question Test produces correct scores and missed-skill recommendations.
6. Refresh retains locally stored results; no login needed.
7. No console errors or broken navigation; no dead buttons.
8. Update README and STATUS.md with truthful implementation and test details.
9. Commit changes with clear summary. Do **not** claim live deployment unless checked.

## Development workflow
Create branch `claude/decimals-d01` if your environment supports it; implement D01, test, and commit. Prefer a PR for review over publishing immediately. Report file changes, commit SHA, test results, and known limitations. Never declare all decimals complete when only D01 is implemented.
