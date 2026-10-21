# Development Assignment 005 — audited handoff / incomplete

## Verified
- Repository architecture includes legacy decimal lessons d01–d10, a shared app shell, decimal arithmetic helpers, lesson/test/coaching engines, local progress and browser tests.
- The Chapter 4 implementation contract exists on the feature branch.
- The originating textbook attachment *Front(2).pdf* was located in the user's files. Its scanned lesson content and unit review support the documented printed page sequence: 4-1 p101; 4-2 p107; 4-3 p111; 4-4 p115; 4-5 p119; 4-6 p123; 4-7 p127; 4-8 p131; review p135; fluency p139. The companion *Back(2).pdf* has not been comprehensively audited.
- Original Chapter 4 lesson-outline metadata added as `curriculum/chapter4/outline.js`. This file is intentionally not loaded by the production app and does not claim finished lessons.

## Required before ready
- Implement dual-card homepage and playable eight lessons with Learn / Practice / Independent Questions / Test as requested.
- Implement original generators and visual-model checks for each skill, a 25-question final, and parent-progress integration, keeping the legacy localStorage schema untouched.
- Verify textbook pages visually and confirm worked-example alignment.
- Run `npm test` and `npm run test:browser`; verify 320/375/768/1024/1440 widths and keyboard/touch.
- Independently recalculate answers, assess hint leakage, retakes, score integrity, and old-saved-data regression.
- Independent reviewer passes and full final diff review.
- Only then mark PR ready, merge, and verify production Pages deployment.

## Current quality gate
**BLOCKED / NOT READY TO MERGE.** The working tool environment cannot clone the remote repository to execute its Node and Playwright browser tests, and no Chapter 4 runtime has been completed yet. Passing counts cannot be truthfully reported. No production changes authorized from these incomplete commits.

## Security and privacy
Keep Chapter 4 records in separate namespaced localStorage keys, do not introduce student names, accounts, telemetry, or external tracking.
