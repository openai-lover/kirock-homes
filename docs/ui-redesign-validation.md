# UI redesign validation

Date: 2026-10-31, Asia/Seoul. Reviewer: Codex. This document tracks the new visual pass separately from the earlier implementation verification.

## Current status

**The visual redesign baseline passed its development-server checks.** On 2026-10-31, the unchanged original 13 browser cases passed against the redesigned development server. Three additional UI regressions passed separately, and a supplemental run completed 17 checks with 12 screenshots. The later cross-examination/hypothesis-board work has its own [final production validation report](gameplay-depth-validation.md): 18 browser cases and 18 supplemental checks passed. That newer scope is not attributed to this baseline run.

No server or deduction-engine behavior change was intended in this visual pass. Artwork did not change the uploaded-photo coordinate plane. Asset provenance belongs in `assets.md`. The original baseline captures used the development server; shared screenshot paths have since been replaced with the final production captures documented in the newer report.

## Executed checks on the visual redesign baseline

| Check | Required observation | New UI status |
| --- | --- | --- |
| Desktop start, awakening, investigation, verdict | Primary action, photo faces, captions and evidence visually inspected | Pass on pre-expansion UI |
| 360 / 390 px phone layouts | No horizontal overflow; text/action layout inspected | Pass; decorative lens overlap noted below |
| 768 px tablet layout | Responsive original browser case and portrait ratio/overflow check | Pass |
| Own landscape and portrait photos | Synthetic 600×400 / 400×600; natural and rendered ratios agree | Pass |
| EXIF and manual rotation | Original orientation/pixel/coordinate test preserved | Pass |
| Keyboard-only play | Existing Tab/Enter/Space completion test preserved | Pass |
| Reduced motion and captions | Complete captioned play; reduced motion still uses the full 8.5-second story sequence | Pass |
| Share preview | Consent initially unchecked; forward/reverse Tab trapped; Escape restores opener | Pass |
| Bilingual screens | English game case passes; 360 px English landing visually inspected | Pass |
| Original 13 browser cases | All cases preserved without selector changes | 13 passed, 0 failed, 3.1 minutes |
| Three additional UI regressions | Dialog focus, normalized duplicate/long names, cancelled pointer drag | 3 passed, 0 failed, 2.8 seconds |
| Console and resource errors | Supplemental capture run recorded no page errors or failed requests | Pass |

## Selector stability

Keep the existing behavior anchors `face-s0..s2`, `statement-s0..s2`, `choose-s0..s2`, and `accuse`. Accessible action names should stay meaningful in both languages. Existing tests also use `.scene-column`, `.testimony p`, `.proof li`, `.caption p`, `.cast-tabs`, `.suspect-options`, `.reveal-panel`, and `.verdict-tag`; retaining these classes avoids coupling checks to the new visual wrappers.

The current culprit helper assumes each choice's text is one digit followed immediately by its name (`slice(1)`). If extra decoration or whitespace is added, update only that lookup to use stable test IDs or explicit name text; retain the underlying correct/incorrect verdict assertions. Do not weaken the checks to make a redesigned screen pass.

## Review observations and follow-up

- Photo aspect ratio was preserved: landscape 1.5 exactly, portrait 0.666667, and sample 0.663056 rendered versus 0.663050 natural.
- Three 28-character custom names fit the 360 px layout. Labels remain inside the photo horizontally with intentional ellipsis, and full names wrap in testimony and choices. Extreme user-selected face positions can still put part of a face outside the photo; this is visible while editing.
- Share focus restoration and pointer-cancel cleanup were implemented by the frontend agent and passed the new regression checks.
- The new normalized duplicate-name check rejects `Cup`, `cup`, and full-width `ＣＵＰ` equivalently, before starting a case.
- Shared landing alternative text is now generic for a friend's photo (source reviewed).
- A decorative magnifying glass overlapped part of the landing quote at narrow widths. This was reported and moved below the caption. The later gameplay-depth screenshot pass independently inspected that correction. The shared screenshot paths now contain those newer captures; the baseline's JSON/log results remain preserved.

No application source or original test file was modified by this reviewer. Three regressions were added in `tests/e2e/ui-redesign.spec.ts`; the repeatable supplemental screenshot script is `scripts/qa-ui-redesign.mjs`.

The initial new pointer-cancel test failed because its synthetic cancellation was followed by an unrelated native stage click on mouse release. The harness now records the actual pointer ID, dispatches a real `PointerEvent`, checks movement before release, and releases over the original actor. The initial failure log is retained; no application behavior was weakened to pass it.

## Evidence and reproducibility

Environment: local development server at `http://127.0.0.1:3000`, Google Chrome **156.0.8078.74**, reduced-motion browser preference, macOS. The screenshot/check run took place at **15:02:26–15:02:48 Asia/Seoul**. Source hashes for Game, PhotoStage and CSS were identical at the start and end of that run and are stored in its JSON report.

Executed commands:

```bash
npm run test:e2e
node scripts/qa-ui-redesign.mjs
npm run test:e2e -- tests/e2e/ui-redesign.spec.ts
node_modules/.bin/tsc --noEmit
```

The first browser command used the original 13 cases before the supplemental file was added. The second browser command ran just the 3 new cases. They are two executed runs, not a claimed single 16-case consolidated run. TypeScript checking also passed after adding the new tests. An initial sandbox-only server-connect attempt failed with `EPERM`; it is preserved separately and is not counted as a test pass.

| Evidence | Result / path |
| --- | --- |
| Production build used | This baseline used development; the newer report records the actual final production run |
| Original 13-case redesign run | [Log](validation-browser-redesign.log), [JSON](ui-redesign-browser-results.json) |
| Additional 3-case run | [Log](validation-browser-redesign-additional.log), [JSON](ui-redesign-additional-browser-results.json) |
| Supplemental 17 checks / source hashes | [JSON](ui-redesign-targeted-results.json), [log](validation-ui-redesign-targeted.log) |
| Desktop / 390 px landing | [Desktop](screenshots/desktop.png), [mobile](screenshots/mobile.png) |
| 360 px and English landing | [360 px](screenshots/mobile-360.png), [English](screenshots/mobile-english.png) |
| Awakening and investigation | [Awakening](screenshots/awakening-desktop.png), [desktop investigation](screenshots/investigation-desktop.png), [mobile investigation](screenshots/investigation-mobile.png) |
| Long names and portrait casting | [Long names](screenshots/long-names-investigation-mobile.png), [portrait](screenshots/portrait-casting-mobile.png) |
| Share dialog keyboard review | [Screenshot](screenshots/share-dialog-mobile.png); regression passed |
| Initial additional-test failure | [Retained log](validation-browser-redesign-additional-initial.log) |
| Initial sandbox restriction | [Retained log](validation-browser-redesign-sandbox-attempt.log) |

Real phone hardware, Safari, and a screen reader were not tested. The later gameplay expansion and final production checks are tracked in [gameplay-depth-validation.md](gameplay-depth-validation.md).
