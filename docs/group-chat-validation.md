# Photo-first group-chat validation

Executed 2026-11-05 (Asia/Seoul), local macOS, Node 25.9.0, installed Google Chrome through Playwright and Codex in-app browser. Next.js 16.4.3 / React 19.3.1 / TypeScript 5.9.3. These results apply to the photo/chat revision, not the historical comic/notebook interface.

## Actual results

| Check | Observed outcome | Evidence |
| --- | --- | --- |
| Unit/server/route suite | **169 passed, 0 failed** | [full output](verification/group-chat-unit.txt) |
| Type checking | Exit 0 | [output](verification/group-chat-typecheck.txt) |
| Production build | Exit 0; local production server started successfully | [output](verification/group-chat-build.txt) |
| Current complete browser suite | **43 passed** | [full output](verification/group-chat-browser.txt) |
| Final chat/layout checks | **20 passed** after the last footer spacing correction (subset of the 43, not 20 additional unique tests) | [output](verification/group-chat-layout-final.txt) |
| Actual Kiro implementation | Exit 0, 84 focused tests; owned files and hashes retained | [Kiro record](kiro/group-chat-README.md) |
| Actual runtime Kiro call | Validated `kiro` response in 6,138 ms | [machine-readable result](verification/group-chat-live.json) |

The first complete browser run had 38 passes and three failures. One exposed a real opening-focus race: focus was restored before React removed `inert`. Two tests still used the removed notebook's controls. The focus logic was fixed and those test actions migrated to the sequential chat. [Initial output](verification/group-chat-browser-before-fixes.txt). A subsequent 42-test run passed; direct-address coverage then increased the complete suite to 43, all passing. The last CSS-only correction removed inherited footer padding that caused unnecessary page scrolling; the related chat/layout suite was rerun against a newly built production server. No failed or unrun checks are counted as passes.

## Covered behavior

- Both approved logic versions: **144 variants each**, 288 total. For each, all six worlds are evaluated; exactly one solution survives, only that culprit's statement is false, and omitting any statement leaves at least two culprit candidates. v2 has conditionals rather than an unqualified direct accusation. v1 compatibility remains.
- Ten-language snapshots and proof selection match the solved world; fixed event/lamp targets survive role shuffles. Tampered conditional polarity, target and version are rejected. A factual witness does not misdescribe its own statement as conditional.
- Sequential introduction and three evidence messages, direct typing, recent-chat context, explicit recipient and typed name addressing, referenced quotes/interjections, immutable official text, separate accusation confirmation, correct/wrong reactions and explanation.
- Missing provider, provider failure, malformed/extra fields, a hanging provider timeout, client cancellation and wrong-speaker output all fall back to bounded authored dialogue. Provider input contains public text/roles only; no image, draft, confession or solution fields. Real route tests cover same-origin checks, invalid input, zero-call budgets and deleted-share denial.
- SQLite request deduplication, pending requests, persistent daily/total caps and cache expiry. These are call counts, not a measured financial budget.
- All ten language game flows, English default and persistent preference, Arabic direction, keyboard-only play, accusation focus/cancellation, subtitles/mute, reduced-motion and opening-focus handling.
- 360, 390, 768 and 1440 px viewports; composer reachability, faces inside the viewport, photo expansion and coordinate preservation. Screenshots are [here](screenshots/group-chat/).
- One real-photo Story screen, focus containment, Escape/return focus, and shutter transition into the actual game using exactly the same sample image. No comic atlas is used by this screen.
- Landscape, portrait, EXIF rotation and manual rotation use synthetic fixtures with corner-pixel and normalized-coordinate checks. Invalid/unsupported uploads preserve a playable sample path.
- Existing optional vision behavior: no key, malformed output, real client timeout, valid mocked candidates, stale suggestion protection and manual completion.
- Real local share creation requires photo consent. Independently opened friend browsers receive identical photo bytes, faces, official text and authored content, no pre-verdict answer/confession/proof, separate plays and an immutable first accusation. Owner deletion succeeds; non-owner deletion fails. Deleted JSON/photo endpoints return not found. Expiry/storage cleanup is exercised with the injectable clock in actual SQLite storage tests; no seven-day wall-clock wait was claimed.

## Live Kiro and attribution

Kiro implemented the routing module/tests/specs. Codex implemented integration, v2 logic, runtime adapters, UI, copy and verification. Authorship hashes for Kiro-owned files were rechecked unchanged. Browser questions actually called Kiro in addition to the recorded isolated provider check. A wrong automatic recipient during exploratory testing led to the direct-address correction; the final addressed mug/lamp question returned the expected first speaker and interjection, marked as Kiro-interpreted.

AI selects a structured action; authored lines and exact evidence are rendered by code. It is **not unrestricted generated dialogue**. The game has no public player Kiro-login flow. Runtime calls use the explicitly configured local developer session. No contest-credit balance, approval, redemption or billing source was established.

## Limits and unrun checks

No physical iPhone/Android, Safari/Firefox, screen-reader user study, native-speaker review, human difficulty/fun study, production load test, public deployment, recorded demo or project submission was performed. Repeated players may learn the small set of logic templates. AI interpretation can fall back or misunderstand indirect questions; choosing an explicit recipient helps, and direct-name addressing is enforced. Hosted compatible chat and live vision adapters were not tested with paid credentials. Sample photo and screenshots are licensed sample/synthetic material; no personal-photo test is claimed. Camera-styled Story is not a live camera or spatial AR implementation.

Historical UI tests remain under `tests/legacy-e2e` and are not executed or counted. Current game/photo/share tests were migrated, with new chat/photo-story coverage. The packaged source excludes secrets, authenticated Kiro state, personal photos, databases, dependencies, build caches and local browser traces. Package integrity and every manifest hash are checked by `scripts/verify-package.mjs`, which writes its actual result to `dist/PACKAGE_VERIFICATION.json` after packaging.
