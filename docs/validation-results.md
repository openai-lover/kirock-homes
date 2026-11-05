> Current 2026-11-05 group-chat revision: [actual Kiro routing contribution and runtime connection](kiro/group-chat-README.md), [latest validation](group-chat-validation.md). Codex integrated the live chat and photo-first story; earlier notebook/comic descriptions below are historical. Contest-credit approval remains unverified.

# 실제 검증 결과 · Actual validation results

Date: **2026-10-31, Asia/Seoul**. This document preserves the **original Codex implementation baseline**, before the visual and gameplay expansion. Test counts, timing and reproduction results below belong to that earlier revision. The supplied plan is a specification, not execution evidence.

**Latest revision (2026-11-05):** see [comic and game validation](story-validation.md). The [character-led entry validation](simple-entry-validation.md) records the preceding revision. [Detective attraction validation](themepark-validation.md) records the earlier theme revision. The [previous detective invitation](detective-validation.md) is historical. The [mystery-novel interface](novel-validation.md), [first-visit opening](opening-validation.md), [ten-language validation](ten-languages-validation.md), [Sherlock visual redesign](sherlock-validation.md), and [UI/gameplay expansion validation](ui-redesign-validation.md) remain historical; [actual Kiro development](kiro-usage.md) retains its attribution. Original screenshots are preserved under `screenshots/v1/`; the Victorian presentation under `screenshots/victorian/`; the previous novel presentation under `screenshots/novel/`.

## Original baseline environment and result

- macOS / Darwin, Node **25.9.0**, npm **11.12.1**.
- Next.js **16.4.3**, React/React DOM **19.3.1**, TypeScript **5.9.3**; resolved dependencies in `package-lock.json`.
- Desktop Google Chrome **156.0.8078.74**, including simulated 360, 390 and 768 px viewports. Browser suite targets `http://127.0.0.1:3000`.
- No runtime AI key or external storage account used. Browser AI fault/success tests deliberately mock responses; they are not live recognition evidence.

| Check | Actual result | Evidence |
| --- | --- | --- |
| `npm run typecheck` (`next typegen && tsc --noEmit`) | PASS | [Type log](validation-typecheck.log) |
| `npm test` | **32 passed, 0 failed, 0 skipped** | [Test log](validation-unit.log) |
| `npm run build` | PASS, optimized production build | [Build log](validation-build.log) |
| `npm start` | Production server started and served the game | Used for final browser suite; startup cleanup emitted status `ok` |
| `npm run test:e2e` | **13 passed, 0 failed, 0 skipped**, production server, 54.2 seconds | [Browser log](validation-browser.log) |
| `npm run cleanup` | PASS, status `ok` | Executed against local SQLite; returned counts only |
| ZIP extraction / fresh install / fresh build | PASS in a new extracted directory | [Fresh install log](validation-fresh-install.log) |

## Milestone acceptance evidence

### M1 — a complete keyless sample

The sample photo wakes three SVG faces, shows authored banter and official testimony separately, requires all three statements before accusation, and resolves one final choice. Correct and incorrect routes are exercised by browser tests. The root agent also manually inspected the start, awakening, all testimony cards, correct verdict, and three-step explanation in the in-app browser. Pre-verdict animation receives no culprit field.

One approved logic family has two fictional story contexts, not two distinct puzzle mechanics. The exhaustive test runs **6 role permutations × 2 fact inversions × 6 display orders × 2 stories = 144 variants**. Each evaluates all six worlds, has exactly one solution world, and leaves at least two culprit candidates when any statement is removed. Tests also reject deliberately malformed, ambiguous and redundant cases, verify fixed lamp fact subjects, and check Korean/English explanations against the solution.

### M2 — own photo and manual casting

Browser tests use synthetic landscape, portrait and JPEG EXIF orientation-6 images; server/image tests check dimensions, EXIF removal, corrupt inputs, unsupported inputs and limits. Manual placement, normalized coordinate movement, clockwise rotation, names, types and face scale are exercised. Images use their own aspect-ratio coordinate plane. HEIC is explicitly unsupported and offers the sample alternative.

No personal photo was used as a test fixture. No physical iPhone or Android camera image was tested in this session. Browser EXIF fixtures are not a substitute for those device tests.

### M3 — optional AI with a complete fallback

Tests exercise missing configuration, provider failure, real timer timeout and late completion, malformed JSON, invalid coordinates, validated candidate names, immutable manual edits, and completion through manual casting. Invalid `ready` responses are also checked at the browser boundary. AI selects only permitted object/style fields; approved dialogue, official statements, the answer and explanations come from code.

Persistent request caps, repeated-request deduplication, zero-budget no-call behavior, and a two-attempt image limit are tested. Actual provider/model access, billing and retention policies remain unverified because no live credentials were used.

### M4 — same case, server verdict, deletion and expiry

Unit/integration tests exercise frozen bilingual snapshots, independent friend sessions, owner and play authorization, hidden solution fields, bounded body/image validation, same-origin checks, cookie attributes, and data survival across a SQLite reopen. Duplicate accusations return the first committed result. An additional test starts **two separate Node processes** with different simultaneous accusations and verifies one stable result.

Browser tests create a share only after the preview checkbox, compare photo bytes and public content across friend contexts, inspect JSON/HTML for private solution fields, play correct and incorrect independent sessions, retry an accusation, reject unauthorized deletion, and verify owner deletion blocks both case and image requests.

Expiry tests advance an injected server clock across the seven-day boundary; they do **not** wait seven wall-clock days. They check blocked public/image/play/verdict access, cascading removal of play records, actual database cleanup, and absence of the fixture's private bytes in the SQLite file after removal. Startup instrumentation is invoked in a test with already-expired persisted data. Hourly cleanup is installed while the server runs; continuous cleanup during host downtime needs the external scheduler described in `.env.example`. No external scheduler or remote deployment was installed.

### M5 — language and access

Browser tests cover Korean and English, keyboard-only selection and accusation, reduced motion, captions, sound controls, mobile viewport layout and no horizontal overflow. Screenshots were visually inspected after capture:

- [Desktop investigation](screenshots/v1/desktop.png)
- [390 px mobile investigation](screenshots/v1/mobile.png)

The sound is a short synthesized effect after user interaction; all information remains in text. No speech recognition or TTS is claimed. Real screen-reader, Safari, physical-phone and human usability testing remain outstanding.

### M6 — build, documentation and release

Source includes exact dependency lock, `.env.example`, bilingual README, tests, license/asset attribution, implementation notes, an English submission draft and a concrete Kiro handoff. Release packaging uses an explicit source allow-list and includes a SHA-256 source manifest. Runtime databases, private photos, keys, `node_modules`, `.next`, test caches and Git internals are excluded.

## Release reproduction

Extracted the source ZIP into a new temporary directory and ran:

```bash
npm ci --offline --cache /private/tmp/room-suspects-npm-cache --no-audit --no-fund
npm run typecheck
npm test
npm run build
```

All commands exited 0; the fresh run passed all 32 unit/integration tests and built the production application. This reused the populated npm download cache on the same macOS host; it was a clean source/dependency directory, not a clean operating-system installation. These commands verified the original source release before the later UI/interrogation/hypothesis changes. This is not a fresh-install check of the expanded revision. The ZIP contains a source SHA-256 manifest and is checked for excluded runtime directories and environment-secret files.

## First-eye timing: one limited measurement

[Recorded measurement](awakening-measurement.json): **868.5 ms**, one local desktop Chrome run with full motion, measured from sample-button click capture to open-eye DOM detection plus two animation frames. A browser test suite was running concurrently. This is a DOM/frame proxy for visible onset, **not** a cross-device performance guarantee or an upload-latency measurement. The approximate three-minute play duration is still a product target; no human session duration study was conducted.

## Defects actually found and repaired

- AI request omitted consent and consumed `name` instead of validated `displayName`; fixed and exercised in the browser.
- Clockwise photo rotation used a counterclockwise coordinate mapping; corrected and regression-tested.
- Face pointer-up and click both invoked testimony; removed the duplicate invocation.
- Local/shared display order differed; both now render the same ordered public snapshot.
- A preview max-height could distort the portrait photo; removed the height clamp and visually checked the result.
- Next's internal local URL differed from the incoming host, causing valid same-origin requests to fail; corrected Host/Origin comparison without trusting forwarded-host values.
- Production route bundles used different `ServiceError` constructors, converting expected authorization/expiry errors to 500 responses; replaced identity checks with a validated shared brand and added cross-bundle regression coverage.
- A browser expectation assumed unlimited AI retries; updated to test the intended two-attempt cap and preserved manual input.

Initial production browser failures are retained in [initial production log](validation-browser-initial-production.log). The result above is the corrected result for that baseline. The expansion report owns the newer status. Early `tsx` CLI invocation also hit a sandbox IPC restriction; package scripts use Node's `--import tsx` loader and the real tests were rerun. Local server/browser network permissions were needed for execution. No failed or unrun check is counted as passed.

## Outstanding external work

1. Kiro now has a recorded implementation/test contribution for the hypothesis board. Additional work packages and unperformed hooks are in [KIRO_HANDOFF.md](../KIRO_HANDOFF.md). Codex-created files remain Codex work.
2. A persistent reachable HTTPS host, domain if desired, and monitored cleanup scheduling for remote friend play. Default loopback links work only on this computer while running.
3. Optional actual AI provider configuration and live contract/cost/privacy verification.
4. Physical iPhone/Android and Safari/screen-reader testing, human usability sessions, a recorded demo video and competition submission.

한국어 요약: 로컬 게임·추리·공유·삭제·만료를 구현하고 실제 검사했습니다. 휴대폰 화면 크기를 흉내 낸 검사는 실기기 검사와 다릅니다. AI 응답 모의 검사는 실제 API 사용이 아닙니다. 이 초기 기준 검사 이후 Kiro가 가설 보드를 실제 개발·검증했습니다. 외부 공개 배포·실기기·사용자 연구·영상 제출은 남아 있습니다.
