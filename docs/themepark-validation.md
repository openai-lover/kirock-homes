# Detective attraction — actual validation

Date: **2026-11-04, Asia/Seoul**. This revision implements the requested Sherlock-style attraction, with a detailed entrance and tactile controls throughout the existing game. The [design plan](themepark-design.md) preceded implementation. [Artwork provenance](themepark-art.md) records Codex image generation; [Kiro provenance](kiro-usage.md) separately records the actual Kiro CLI work.

## Delivered changes

- A gaslit London frontage surrounds the entrance and first-visit opening. Kirock retains the case-offering pose. During investigation the backdrop is darkened to keep evidence readable.
- The sample action is a brass doorplate with a bell; photo casting uses a perforated ticket with a camera. All labels remain live, translated text. Solid-color fallbacks retain contrast when artwork cannot load.
- Utility dials, numbered suspect tabs, metal case frames, a clipped notebook, witness slips, objection stamps, pinned comparisons, hypothesis cards, verdict seals and an envelope-like share dialog use coordinated materials and pressed/selected states.
- The bell briefly swings on hover or keyboard focus. System and in-game reduced-motion preferences disable decorative motion. Decorative SVGs are hidden from the accessibility tree and never take focus.
- Actual photographs, editable SVG faces, static testimony, scripted confrontations, the six-world engine and server sharing contract are unchanged. Pre-verdict decoration has no access to guilt.
- The Kiro CLI authored seven decorative SVG prop variants and three specs. It repaired its initial JSX type error and reran the typecheck successfully. Codex reviewed two source details and integrated the component. Only six prop variants are displayed; footprints remain available but unused.

## Executed environment

macOS, Node **25.9.0**, npm **11.12.1**, Next.js **16.4.3**, React **19.3.1**, TypeScript **5.9.3**. Browser checks use the installed Google Chrome via Playwright against the production server (`npm start`) at `127.0.0.1:3000`. No runtime AI credentials were used. The authenticated Kiro development tool is separate from optional runtime photo analysis.

| Check | Actual outcome | Evidence |
| --- | --- | --- |
| `npm run typecheck` | Exit 0 after final source/test changes | [Type log](verification/themepark-typecheck.txt) |
| `npm test` | **74 passed, 0 failed, 0 skipped** | [Unit/engine/server log](verification/themepark-unit.txt) |
| `npm run build` | Exit 0, production build after final button fallback and spacing changes | [Build log](verification/themepark-build.txt) |
| Initial focused detective/opening tests | 12 passed, 0 failed, 46.7 seconds on the intermediate attraction build | [Initial focused log](verification/themepark-focused.txt) |
| Initial additional attraction tests | 2 passed, 0 failed, 7.3 seconds before opening-fallback coverage was extended | [Initial additional log](verification/themepark-extra-initial.txt) |
| Full final production browser suite | **58 passed, 0 failed, 4.4 minutes**, exit 0 after the opening-position repair | [Final full browser log](verification/themepark-e2e-production.txt) |

The focused suites are included in the full suite, not added again to its total. A previous full run was intentionally interrupted to finish mobile button spacing and the opening button's missing-image fallback; it is not claimed as a completed pass. [Interrupted output](verification/themepark-e2e-interrupted.txt).

The 74 unit/engine/server checks cover all **144 approved puzzle variants**, exhaustive six-world uniqueness and testimony necessity, explanation agreement, role/subject stability, AI validation/fallback, server snapshot safety, repeated accusations, deletion and expiration. Browser coverage includes both sample verdicts, complete keyboard play, synthetic landscape/portrait/EXIF and manual rotation, missing/invalid/timed-out AI fallback, ten-language play, shared-case identity and independent decisions, hidden answers and creator deletion.

All 58 checks passed on the final production build, including both previously failing opening cases. The two new attraction checks exercise missing material images on home and opening, fallback text contrast above 4.5:1, keyboard entry, and controls across **360 / 768 / 1024 / 1440px** in English, Korean and Arabic. They measure 44px minimum control height, viewport bounds, actual hit targets, SVG semantics, reduced motion and horizontal overflow. Existing ten-language visual checks and opening behavior tests are rerun as part of the full suite.

## Visual inspection and corrections

Desktop, tablet and narrow-phone screenshots, confrontation and verdict were inspected. The physical button artwork initially inherited a redundant rectangle shadow; that was removed. Mobile label padding was increased so text clears the decorative screw. Home and opening entry actions received solid-color fallback layers. The first completed full run found two mobile opening failures (56 passed, 2 failed): an added relative-position rule displaced the bottom-anchored entry button by 30px below the viewport. The redundant position override was removed, preserving the established absolute anchor. [Failure evidence](verification/themepark-e2e-before-opening-fix.txt). The original photograph is not cropped or painted into the entrance art.

The in-app browser was reloaded onto the production build and its rendered entrance inspected. Earlier detective screenshots were preserved in `screenshots/detective-previous/` and the historical validation links updated. Current screenshots are generated from the running app, not design mockups.

- [Desktop entrance](screenshots/themepark/attraction-home-1440-en.png)
- [Tablet entrance, 768px](screenshots/themepark/attraction-home-768-en.png)
- [Tablet entrance, 1024px](screenshots/themepark/attraction-home-1024-en.png)
- [English phone entrance](screenshots/themepark/attraction-home-360-en.png)
- [Korean phone entrance](screenshots/themepark/attraction-home-360-ko.png)
- [Official testimony](screenshots/themepark/detective-evidence.png)
- [Confrontation and objection](screenshots/themepark/detective-confrontation.png)
- [Deduction board](screenshots/themepark/detective-deduction.png)
- [Verdict and explanation](screenshots/themepark/sherlock-verdict.png)
- [Opening](screenshots/themepark/opening-desktop.png)
- [Phone opening](screenshots/themepark/opening-mobile.png)

## Packaging and limits

`npm run package` and `unzip -t dist/KIROCK_HOMES_SOURCE.zip` completed successfully on a preliminary archive. The archive is regenerated after the final browser record is saved and checked again before delivery. The source package uses an explicit allowlist and includes a SHA-256 file manifest. It excludes `.env.local`, API keys, user photos/database, `node_modules`, `.next` and test/browser caches.

This is local production verification, not public deployment. Public hosting, remote friend devices, physical iPhone/Android, Safari, Firefox, VoiceOver, native-speaker review, live photo-recognition credentials and human enjoyment/playtesting were not verified in this revision. No new logic family or runtime Kiro player-auth flow was added. No contest submission, credit award/redemption, Kiro browser test, Kiro production build or unperformed hook is claimed. A fresh extracted install was not rerun for this visual-only revision; earlier fresh-install evidence retains its original scope.
