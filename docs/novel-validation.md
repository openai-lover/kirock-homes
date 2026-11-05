# Mystery-novel interface — actual validation

Date: **2026-10-31, Asia/Seoul**. This report covers the replacement of the Victorian-room presentation with a cleaner, playful detective-novel interface. The restyling, opening integration and checks are Codex work; existing Kiro authorship and evidence remain unchanged.

## What changed

The UI no longer loads the study-room backdrop. It uses pale paper, blue-black ink, a restrained red action color and larger, more readable text. The first-visit opening keeps the arriving ghost detective on a clean title page. Home presents the original photograph like a book cover. Investigation, dialogue, deductions, photo editing, results and sharing use the same reading-oriented palette.

Removed redundant case badges, floating file tabs, the repeated suspect-count label, gold borders, leather/folder styling, lined-paper textures, ornamental stamps and the home photograph's second caption. Controls remain live HTML. The photograph retains its source aspect ratio and normalized face coordinates. No official statement, solution, engine logic or server adjudication was changed.

Old screenshots used by the Victorian and earlier opening reports are preserved under `screenshots/victorian/`. Historical reports now link to those preserved copies.

## Environment and executed checks

macOS, Node 25.9.0, npm 11.12.1, Next.js 16.4.3, React 19.3.1 and TypeScript 5.9.3. Browser tests used installed Google Chrome through Playwright against the optimized production server at `127.0.0.1:3000`. No live AI credentials were used.

| Check | Actual result | Evidence |
| --- | --- | --- |
| `npm run typecheck` | Exit 0, after final test changes | [Type log](verification/novel-typecheck.txt) |
| `npm test` | 74 passed, 0 failed | [Unit/server/engine log](verification/novel-unit.txt) |
| `npm run build` | Exit 0, production build completed | [Build log](verification/novel-build.txt) |
| `npm start` | Built application served successfully; startup cleanup status `ok` | Used for the checks below |
| Focused opening suite | 8 passed, 0 failed, 35.7 seconds | [Opening log](verification/novel-opening.txt) |
| Focused novel-layout suite | 4 passed, 0 failed, 4.0 seconds | [Layout log](verification/novel-visual.txt) |
| `npm run test:e2e` — full browser regression suite | 52 passed, 0 failed, 4.1 minutes | [Full production browser log](verification/novel-e2e-production.txt) |

The new layout checks cover keyboard access from home, reachable controls at least 44 pixels high, all ten languages at 360px, readable statements and rebuttals through saving a comparison, and unchanged photo source, aspect ratio and face positions across desktop/mobile and language changes.

The opening suite covers automatic entry, skip/Escape, focus containment and return, persisted dismissal, replay, cleanup of timers, failed artwork, blocked storage, shared-case bypass and reduced motion. It also measures the title, caption, character and controls in all ten locales at 360 × 640. These elements remain inside the viewport and do not overlap.

The final 52-test run includes both focused suites and the existing game regression tests. It verifies correct/incorrect sample verdicts, keyboard completion, photo upload and EXIF/manual rotation, AI absence/invalid output/real client timeout, all ten languages, shared-case identity, private answers, independent friend play, and owner deletion. The 74 unit/server tests include all 144 approved six-world variants, exact evidence/explanation agreement, expiry and stable duplicate-accusation outcomes. Focused reruns are not added to the final test count.

## Initial test correction

The first novel-layout run had two passes and two failures. The helper incorrectly treated display-font glyphs extending beyond a tight line-height as clipped content, even though the element had visible overflow. Visual inspection showed the text was present. The helper now checks vertical content fit for actual clipping/scrolling containers and retains width, visibility, control-size and viewport checks. All four then passed. [The first output is retained](verification/novel-visual-initial.txt); it is not counted as a successful run.

## Visual review

The following rendered screenshots were opened and inspected. The homepage and opening were also inspected in the in-app browser. The new composition has no room image behind text, no heavy decorative frame around the investigation, and no horizontal overflow in the tested languages/viewports.

- [Desktop home](screenshots/novel/novel-home-desktop.png)
- [English mobile home](screenshots/novel/novel-home-en-mobile.png)
- [Korean mobile home](screenshots/novel/novel-home-ko-mobile.png)
- [Arabic mobile home](screenshots/novel/novel-home-ar-mobile.png)
- [Hindi mobile home](screenshots/novel/novel-home-hi-mobile.png)
- [Desktop evidence](screenshots/novel/novel-evidence-desktop.png)
- [Mobile evidence](screenshots/novel/novel-evidence-mobile.png)
- [Mobile confrontation](screenshots/novel/novel-confrontation-mobile.png)
- [New title-page opening](screenshots/novel/opening-desktop.png)
- [New mobile opening](screenshots/novel/opening-mobile.png)

Mobile confrontation remains a scrolling reading flow; the active spoken line is also retained beneath the photo for caption accessibility. This revision does not replace the game with paginated scenes or invent additional evidence.

These are simulated mobile browser viewports. Physical phones, Safari, Firefox, VoiceOver, user studies and live AI recognition were not tested. No new Kiro run, image generation, public deployment, competition submission or credit approval is claimed. The local server is accessible on this computer; remote sharing still requires a reachable host as described in README.
