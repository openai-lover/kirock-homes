# First-visit opening — actual validation

Date: **2026-10-31, Asia/Seoul**. This report covers the cinematic opening and quieter homepage implemented by Codex. Earlier game and Kiro contribution records retain their original attribution. The existing study illustration and detective cutout were reused; no new image-generation or Kiro run is claimed for this revision.

## Delivered behavior

- The study fills the browser viewport before the homepage appears. Kirock glides into view, the name and one translated caption appear, and the scene dissolves into the homepage.
- Animation lasts 5.2 seconds followed by a 0.5-second dissolve; image readiness has a bounded one-second wait. Skip, Enter the study and Escape dismiss immediately.
- Completion is remembered in optional local storage. Returning visitors and direct shared-case links bypass the sequence; the homepage can replay it.
- Reduced-motion visitors bypass automatic playback. Explicit replay shows a static scene until dismissed.
- The background is inert while the opening is visible, focus stays inside its controls, and closing restores the appropriate start/replay button. Timers and focus callbacks are cleaned up.
- The homepage removes the extra mascot quotation, seal, note, paperclip and folder decorations. Two start actions and the original sample photograph remain prominent.
- English is still the default. Opening copy is bundled in all ten supported languages. No mystery, official testimony, answer, sharing contract or photo coordinate system was changed.

## Executed checks

Environment: macOS; Node 25.9.0; npm 11.12.1; Next.js 16.4.3; React 19.3.1; TypeScript 5.9.3. Browser automation used installed Google Chrome through Playwright. The final browser runs reused the optimized production server at `http://127.0.0.1:3000` after a successful build, rather than a development server.

| Command / check | Observed result | Evidence |
| --- | --- | --- |
| `npm test` | 74 passed, 0 failed | [Unit/server/engine log](verification/opening-unit.txt) |
| `npm run typecheck` | Exit 0, including the final compact-layout test | [Type log](verification/opening-typecheck.txt) |
| `npm run build` | Exit 0; optimized production build completed | [Build log](verification/opening-build.txt) |
| `npm start` | Production server served the built application | Used by the final browser runs below and manual in-app inspection |
| `npm run test:e2e` | 47 passed, 0 failed, 4.1 minutes | [Full production browser log](verification/opening-e2e-production.txt) |
| Additional compact opening test | 1 passed; all ten locales at 360 × 640 | [Compact check record](verification/opening-compact.txt), `tests/e2e/opening.spec.ts` |

The additional compact test was appended after the full run had already collected its 47 tests. It was executed separately against the same production build. Together these runs cover all **48 current browser tests**; they are not described as one 48-test run.

Opening checks cover first-visit viewport coverage, Tab/Shift+Tab containment, Escape dismissal, remembered dismissal after reload, actual automatic completion, body-scroll restoration, replay focus return, and a cancelled timer not interrupting gameplay seven seconds later. They also cover blocked storage and failed artwork, direct shared-link bypass, and static Arabic replay under reduced motion.

The compact check measures the title/caption, character and both exit controls in all ten locales. They fit the 360 × 640 viewport without overlap; exit targets are at least 44 pixels tall. The tightest measured copy-to-character gap was approximately 47 pixels in Hindi, with approximately 44 pixels between the character and entry button.

The full suite also exercised sample correct/incorrect paths, keyboard play, portrait/landscape/EXIF/manual rotation, AI absence/timeout/invalid responses, cross-examinations, the manual hypothesis board, all ten languages, shared-case identity, hidden answers, independent friend play, one-shot verdicts and owner deletion. Unit/server tests cover expiry, concurrent accusation consistency and all approved six-world logic variants.

## Failures observed and resolved

An initial development-server opening run reported six passes and one failure. Its expired-case assertion used a page-wide `role=alert` locator, which matched both the application's error and Next.js's development route announcer. The assertion was scoped to `game-content`; the production run then passed. The initial output is retained in [development check](verification/opening-development-check.txt). This was a test-selector correction, not a claim that the initial run passed.

The compact check initially could not connect to localhost inside the execution sandbox. It was rerun with approved local browser access and passed. That environment error is not counted as an application result.

## Visual review and limits

The final production screenshots were opened and inspected for the desktop composition, mobile character placement and quieter homepage. The in-app browser also played the sequence and returned to the homepage with focus on its replay button.

- [Desktop opening, 1440 × 960](screenshots/victorian/opening-desktop.png)
- [Mobile opening, 360 × 800](screenshots/victorian/opening-mobile.png)
- [Homepage after automatic entry](screenshots/victorian/home-after-opening.png)

These are browser viewport simulations, not physical-phone tests. Safari, Firefox, VoiceOver, hardware keyboards on phones, slow physical networks and user research were not tested. No new live AI provider call, deployment, competition submission, credit approval, or Kiro execution occurred during this opening revision. Existing source-release exclusions continue to apply: private photos, runtime databases, credentials, dependencies and build caches are excluded.
