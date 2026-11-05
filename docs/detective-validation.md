# Detective case invitation — actual validation

Date: **2026-10-31, Asia/Seoul**. This revision responds to the loss of detective identity in the previous plain-paper interface. UI, artwork and validation in this revision are Codex work. Existing Kiro implementation records retain their original attribution; no new Kiro run is claimed.

## Implemented and reviewed

- Kirock offers a question-mark case folder, wearing the recognizable deerstalker, cape and scarf and holding an ordinary magnifier. The new transparent illustration is used on home and in the first-visit opening. [Generation provenance](detective-art.md).
- A deep teal work surface, amber controls and one cream case folder replace the plain-paper homepage. The original photo remains inside the folder, at its original aspect ratio. There is no furnished-room background.
- The sample's three suspect controls and photo faces trigger brief, neutral comic responses. Preview state lives inside `CaseInvitation`; it does not call an API, generate a case, mark evidence heard or select an accused suspect. A new game starts with zero statements heard.
- Shared-case home uses the stored photograph and suspects without adding the sample's preview controls or jokes. Official statements, answers, explanations and server adjudication are unchanged.
- Investigation retains its readable notebook, with a case-file header and progression from awakening through testimony, confrontation and deduction. The existing actual rebuttal flow remains functional.
- All new copy is bundled in ten languages. Keyboard focus uses amber on the dark surface and red on paper; utility-button hover and owner controls have explicit dark-surface colors.

[Design plan and critique](detective-design.md) preceded implementation. Desktop and mobile captures were inspected: the detective and folder form the visual focus, the actual photograph remains visible, controls fit their containers, and the testimony panel stays readable. The in-app browser was also used to reload the production build, select the keyboard suspect and replay the opening. Earlier novel screenshots are preserved under `screenshots/novel/`.

## Executed checks

Runtime: macOS, Node 25.9.0, npm 11.12.1, Next.js 16.4.3, React 19.3.1, TypeScript 5.9.3. Browser checks use the installed Google Chrome through Playwright against `npm start` at `127.0.0.1:3000`. No live AI credentials were used.

| Check | Actual result | Evidence |
| --- | --- | --- |
| `npm run typecheck` | Exit 0 after final source and screenshot-helper changes | [Type log](verification/detective-typecheck.txt) |
| `npm test` | 74 passed, 0 failed | [Unit/engine/server log](verification/detective-unit.txt) |
| `npm run build` | Exit 0 after final focus/hover contrast changes | [Final production build](verification/detective-build.txt) |
| Focused detective UI tests | 4 passed, 0 failed, 5.7 seconds | [Focused UI log](verification/detective-visual.txt) |
| Focused opening tests | 8 passed, 0 failed, 35.5 seconds | [Focused opening log](verification/detective-opening.txt) |
| Additional tablet layout inspection | 768px and 1024px, English and Korean: no horizontal overflow or character obstruction of copy/actions; all 45 sampled control points per view hit the intended controls | [Measured geometry and hit tests](verification/detective-breakpoints.json) |
| Full `npm run test:e2e` against final production build | **56 passed, 0 failed, 4.2 minutes** | [Full browser log](verification/detective-e2e-production.txt) |

The new UI tests verify keyboard activation and selected states for all three preview suspects, absence of API requests and verdict content during preview, fresh game state afterward, ten languages at 1440px and 360px, at least 44px-high main controls, readable content, and real confrontation progression before deduction becomes available. The opening suite covers timing, skipping, focus, storage/image failure, shared-link bypass, reduced motion and all ten locales at 360 × 640.

The final 56-test run includes the focused suites; these are not added again to the total. It also covers correct/incorrect sample verdicts, keyboard completion, photo upload and EXIF/manual rotation, absent/invalid/timed-out AI fallback, complete play in all ten languages, shared-case identity and independent play, hidden answers, stable duplicate accusations and owner deletion. The 74 unit/engine/server checks include all 144 approved six-world variants, testimony necessity, exact explanation agreement and expiry. Full browser screenshots were regenerated after the capture-helper and final contrast changes.

## Corrections during validation

The initial production build failed because a CSS color declaration contained an extra closing parenthesis. The error was repaired before browser checks; [the failed build log is retained](verification/detective-build-initial.txt). An attempted start before a successful build also failed; it was not treated as a running or validated release.

Visual inspection prompted clearer focus rings on the dark surface and explicit hover colors for settings and owner controls. A full-page confrontation screenshot initially placed the sticky photograph low because the test had scrolled to a control. The capture helper now scrolls to the top before taking a full-page image. This changes capture framing, not gameplay.

## Screenshots

- [Desktop home](screenshots/detective-previous/detective-home-desktop.png)
- [English mobile home](screenshots/detective-previous/detective-home-mobile.png)
- [Korean mobile home](screenshots/detective-previous/detective-home-ko-mobile.png)
- [Arabic mobile home](screenshots/detective-previous/detective-home-ar-mobile.png)
- [Hindi mobile home](screenshots/detective-previous/detective-home-hi-mobile.png)
- [Official statements](screenshots/detective-previous/detective-evidence.png)
- [Confrontation](screenshots/detective-previous/detective-confrontation.png)
- [Deduction](screenshots/detective-previous/detective-deduction.png)
- [Desktop opening](screenshots/detective-previous/opening-desktop.png)
- [Mobile opening](screenshots/detective-previous/opening-mobile.png)

## Scope and limits

Mobile checks use simulated browser viewports. Physical phones, Safari, Firefox, VoiceOver, live AI recognition and human playtesting were not run for this revision. This is a photograph-based game, not camera-tracked AR. There is no new puzzle logic family or runtime AI-authored evidence in this visual update.

No public deployment, competition submission or credit approval is claimed. Local sharing requires this computer's running server; sharing with remote friends still needs the persistent reachable host described in README. Historical fresh-install results apply to their recorded revision, not this revision.
