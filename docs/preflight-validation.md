# Submission preflight validation — 2026-11-05

This report describes the delivered opening/button/mobile revision, authored and verified by Codex. Previous Kiro contributions and execution records are preserved unchanged. No new Kiro development run, competition credit receipt, public deployment, or contest submission is claimed.

## Changes

- Opening preparation waits for the original desk photograph, detective artwork and title fonts. The first frame shows the brand while resources load; preparation is bounded to three seconds and broken media cannot trap a visitor.
- The animation and its completion clock pause when the document is hidden. The corrected introduction plays once for visitors who saw the earlier version. Shared links and reduced-motion automatic visits still bypass it; explicit reduced-motion replay is static.
- One bottom-left **Skip intro** / **스킵 인트로** control replaces the two exits. Label is centered at 18 px on mobile / 19 px desktop. Keyboard focus returns to the entry control or replay opener.
- Start/photo/story/preview controls have no decorative icons. Primary labels are independently centered, 17 px mobile / 18 px desktop.
- Mobile photo casting keeps a smaller photograph visible while adjusting controls, and form text is 16 px. Short chat layouts respond to `visualViewport`, shrink the photograph, preserve input/send access and provide 44 px primary touch targets.

## Executed results

| Check | Result | Evidence |
| --- | --- | --- |
| Type generation + TypeScript | Exit 0 | `verification/preflight-typecheck.txt` |
| Unit/server/solver suite | **169 passed**, none failed/skipped | `verification/preflight-unit.txt` |
| Production build | Exit 0 | `verification/preflight-build.txt` |
| Complete current browser suite against final production server | **63 passed**, 1.7 minutes, no retries | `verification/preflight-full-browser.txt`, `verification/preflight-browser-results.json` |
| Focused opening/mobile/real-photo suite during refinement | 8 passed | `verification/preflight-recheck.txt` (a subset of the final suite) |
| Actual in-app browser | Final opening and text-only entry visually inspected | Local app at `http://127.0.0.1:3000/` |

The browser suite covers sample correct/wrong paths; keyboard-only completion; manual photo upload and positioning; landscape/portrait, EXIF and manual clockwise rotation; malformed/unsupported photos; no-key, delayed and malformed AI fallback; unchanged testimony; share consent, frozen case identity, independent plays, server verdict privacy, duplicate accusation stability, deletion and expiry. The unit suite exhaustively checks all 144 variants of each logic version (288 total), six worlds per variant, unique solution and necessity of every statement, alongside exact explanation/answer consistency.

New checks explicitly delay the photograph 2.2 seconds, verify a visible first frame, abort the photo, simulate document visibility changes, verify old-version visitors see the corrected intro once, and measure centered labels at widths **320, 390, 768, 844 and 1440** with English, Korean, German and Arabic. Static opening and story checks cover all ten languages. A **390 × 480** viewport represents keyboard-reduced space and retains both input/send controls and at least 80 px of message scrolling area.

## Different real photographs

Both test photographs are licensed public stock, not user photos. [Sources and license](../tests/fixtures/photos/README.md).

1. **Dark desk** — portrait 1200 × 1800 input, normalized 1067 × 1600. Manually placed faces on mug, tablet and notebook. On 390 × 844: expanded photo preserved positions, returned to chat, asked an addressed question, received a reply/interjection, made the correct accusation and verified the three-step proof.
2. **Work desk** — landscape 1600 × 1067. Faces on laptop, headphones and plant. On 1440 × 960: asked an addressed question, preserved all official statements and the photo, intentionally accused an innocent object, and verified the culprit/proof still agreed.

These use the actual upload and placement controls, real normalized image data, real game logic and local authored dialogue. They do not demonstrate AI vision recognition. Screenshots are in `screenshots/preflight/`.

## Issues found and fixed

- Before the change, the cold-start first-frame check failed; the loading poster and full readiness gate resolve it. `verification/preflight-before-fix.txt` retains the failure.
- The reduced-height mobile check found the input reaching beyond the viewport. Removing fixed minimum chat height and responding to the visual viewport resolves it. `verification/mobile-keyboard-before-fix.txt` retains the failure.
- An inherited grid alignment rule offset entry text. A single full-width grid column and removal of decorative icons resolve it.
- Initial real-photo tests used a text-label selector that included a select element’s options. The tests now use its accessible combobox role. This was a test locator problem, not a failed upload.
- One later check counted hidden photo-face SVGs as button icons. It now scopes only to the actual entry controls. The failed run (62 passed, 1 failed) is retained in `verification/preflight-full-browser-before-selector-fix.txt`; the final full run passed all 63.

## Limits

- macOS Chrome and desktop-emulated viewports were used. No physical iPhone/Android, Safari/Firefox, real on-screen keyboard, screen-reader session, native-language editorial review or human playtest was performed. Hidden-tab testing uses a controlled visibility event; native OS suspension is not claimed.
- Build succeeds with the pre-existing dynamic filesystem tracing warning in the optional Kiro runtime provider. A hosted deployment must review its traced output and configure durable storage/cleanup. It was not deployed here.
- Automated AI error-path tests use mocks and authored fallback. Prior live Kiro results are separately recorded in `docs/kiro/`; no live vision-provider check is claimed.
- Local links are not reachable by remote judges. Public app/build, source repository and YouTube demo links are still required before final submission under the [official rules](https://kiroween.devpost.com/rules), rechecked November 5, 2026.

## Local review recording

`demo/kirock-homes-review.webm` is actual localhost gameplay with a labelled evidence-summary closing card. The container is **85.56 seconds**, **1280 × 900**, VP9. Chrome played it through the end at accelerated playback without a media error; `verification/preflight-video-playback.json` records the result. Extracted chat and evidence-card frames were visually inspected. English sidecar captions and exact chapter/provenance metadata are included. The typed Laptop/Plant question received the UI label **Kiro interpreted this question** during this real recording; the reply/interjection retained the official evidence. This is an additional real runtime use, not a new Kiro-authored development run or a credit-balance verification.

The first recording attempt found a missing Playwright video helper; the official helper was installed and recording then succeeded. The bundled ffmpeg lacks a null-output muxer, so that attempted full-decode command failed; the failed log is retained and not counted as success. Chrome playback and extracted-frame review are the successful media checks. No public upload has occurred.
