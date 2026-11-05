# Cross-examination and hypothesis-board validation

Date: 2026-10-31, Asia/Seoul. Reviewer: Codex. These results cover the deeper gameplay added after the visual redesign baseline. Kiro's actual component/specification/test authorship and executed commands are recorded separately in [kiro-usage.md](kiro-usage.md). The browser, type and build checks below are Codex validation.

## Current result

The final fresh **production server passed all 18 browser cases**, with **0 failures, 0 skipped and 0 flaky cases**, in 3.2 minutes. The previously failing sharing case passed in full: frozen dialogue/fact labels, matching images and statements, independent correct/wrong friend plays, duplicate accusation, unauthorized deletion rejection and owner deletion.

The final production visual/interaction run passed **18 checks and captured 15 screenshots**, with no page errors or failed requests. Its Game, PhotoStage, CrossExamination, HypothesisBoard and CSS hashes were identical before and after the run. Type checking, all **50 unit/integration tests**, and the production build also passed; their actual logs are linked below. A fresh dependency install was not rerun for this revision.

The initial development-server browser run was **17 passed, 1 failed**: a newly created share lacked `interrogations` in its public JSON. The development process had retained a global store instance across source hot reloads. The fresh production process returned the new frozen fields and the full test passed without weakening any assertion. The original failed results remain preserved separately.

## Executed behavior checks

The original 13 browser cases are retained. Their helpers now complete all three question → rebuttal → note routes before final accusation. The keyboard-only case uses Tab and Enter for all nine new actions, without programmatic focus.

| Check | Final production result |
| --- | --- |
| Sample correct and wrong verdicts | Pass |
| Keyboard-only full game, including all three confrontations | Pass |
| 360 / 390 / 768 px responsive game | Pass |
| Landscape, portrait, EXIF orientation and manual rotation | Pass |
| Unsupported/corrupt uploads still allow sample completion | Pass |
| No AI key, invalid output, actual client timeout and late response | Pass |
| English game and explanation | Pass |
| Shared frozen interrogations/fact labels, independent correct/wrong plays, duplicate verdict, no pre-accusation private fields and owner deletion | Pass; initial development failure retained below |
| Share dialog consent, bidirectional focus trap and focus restoration | Pass |
| Three confrontations gate final choice; each rebuttal names the actual other object and quotes its exact official testimony | Pass |
| Personal testimony notes remain reversible and do not reveal or submit a verdict | Pass |
| Six hypothesis cards: eliminate, undo, zero remaining, reset and locale persistence | Pass |
| One remaining hypothesis has a personal-note label, without automatic correctness or verdict | Pass |
| NFKC/case-normalized duplicate names, 28-character names and face edge labels | Pass |
| Pointer cancellation clears drag state | Pass |

The new regressions are in `tests/e2e/ui-redesign.spec.ts`; shared keyboard/action helpers are in `tests/e2e/helpers.ts`. The screenshot script is `scripts/qa-ui-redesign.mjs`. No application source was changed by this QA pass.

## Visual inspection

The 390 px confrontation screen was inspected after the first rebuttal and before saving its note. Named speakers, two verbatim official quotations and the note action fit the page. The final board displays all six manually editable worlds; the choice remains separate. Desktop screenshots were inspected at 1440 px. The decorative lens now sits below the landing photo caption. Long custom names wrap in the dialogue/controls and stay clipped inside photo labels.

An initial full-page screenshot taken immediately after resizing showed repeated compositor tiles. The capture harness now waits for fonts and two animation frames, scrolls to the top, and disables animations for the screenshot; recaptured images were visually inspected and the artifact is gone. This was a capture-harness correction, not an application change.

All screenshot links below now point to the final production captures, without the Next development indicator. The verdict caption was also inspected and correctly reads `사건 종결 · 자백`. Actual phone hardware, Safari and a screen reader were not tested. No real AI provider request was performed; provider failure cases use controlled test responses and unit mocks.

## Evidence

- Initial 18-case run, 15:14:46–15:17:45 Asia/Seoul: [log](validation-browser-gameplay-depth-initial.log), [JSON](gameplay-depth-browser-initial-results.json). Result: 17 passed, 1 failed, 0 skipped.
- Initial supplemental run, 15:17:36–15:17:59 Asia/Seoul: [log](validation-gameplay-depth-targeted.log), [JSON with source hashes](gameplay-depth-targeted-results.json). Result: 18 checks passed, 15 screenshots.
- **Final production 18-case run**, 15:20:12–15:23:26 Asia/Seoul: [log](validation-browser-gameplay-depth-production.log), [JSON](gameplay-depth-production-browser-results.json). Result: **18 passed, 0 failed, 0 skipped, 0 flaky**.
- **Final production supplemental run**, 15:20:15–15:20:37 Asia/Seoul: [log](validation-gameplay-depth-production-targeted.log), [JSON with source hashes](gameplay-depth-production-targeted-results.json). Result: **18 checks passed, 15 screenshots**, no page/resource errors.
- Final source checks executed by the root agent: [type checker](validation-expansion-typecheck.log), [50 unit/integration tests](validation-expansion-unit.log), [production build](validation-expansion-build.log). Logs inspected by this reviewer.
- New dialogue: [desktop](screenshots/interrogation-desktop.png), [390 px](screenshots/interrogation-mobile.png).
- Final six-world board: [desktop](screenshots/hypothesis-desktop.png), [390 px](screenshots/investigation-mobile.png).
- Landing: [desktop](screenshots/desktop.png), [390 px](screenshots/mobile.png), [360 px English](screenshots/mobile-english.png).
- Photo/editor limits: [long names](screenshots/long-names-investigation-mobile.png), [portrait](screenshots/portrait-casting-mobile.png).
- [Share dialog](screenshots/share-dialog-mobile.png).

Browser environment: macOS, Google Chrome **156.0.8078.74**, reduced-motion preference, localhost `http://127.0.0.1:3000`. The final suite reused the already running `next start` production process; it did not start a development server.

Commands executed against the development server and then the fresh production server:

```bash
npm run test:e2e
QA_REPORT_PREFIX=gameplay-depth node scripts/qa-ui-redesign.mjs
# After the production build and fresh next start:
npm run test:e2e
QA_REPORT_PREFIX=gameplay-depth-production QA_SERVER_MODE='production server' node scripts/qa-ui-redesign.mjs
```
