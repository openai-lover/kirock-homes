# English default and ten-language validation

Recorded 2026-10-31 (Asia/Seoul). This report covers the ten-language revision; earlier reports retain their original scope. The supplied plan and contest forms are not test evidence.

## Delivered behavior

- Fresh visitors use English, including browsers configured for Korean. Explicit selections persist in `kirock:locale`; invalid saved values fall back to English.
- English, Korean, Spanish, French, German, Portuguese, Japanese, Simplified Chinese, Arabic and Hindi are selectable in the game and credits/privacy page.
- Main UI, official evidence, object banter, confrontations, detective guidance, confession and proof use authored static catalogues. No runtime translation service or key is needed.
- Locale changes preserve the draft, face coordinates, heard statements, confrontation progress, notebook choices, eliminated hypotheses and accusation. Sample object names translate through explicit markers; custom names stay unchanged.
- New shares freeze all ten language snapshots and all verdicts. Legacy Korean/English shares retain their stored words and serve their stored English content for unavailable languages, with a visible notice and correct content `lang`/`dir` boundaries.
- Shared verdict translation errors hide stale proof/confession and offer a retry using the same recorded accusation. Arabic changes reading direction without mirroring photograph coordinates.

## Environment and commands actually run

macOS, Node 25.9.0, npm 11.12.1, installed Google Chrome; Next.js 16.4.3, React 19.3.1, TypeScript 5.9.3. Browser tests use simulated viewports, synthetic photo fixtures, the licensed sample and explicitly mocked AI failure/success responses.

| Command | Observed result |
| --- | --- |
| `npm test` | 74 passed, 0 failed, 0 skipped; [output](validation-ten-languages-unit.log) |
| `npm run typecheck` | Exit 0; [output](validation-ten-languages-typecheck.log) |
| `npm run build` | Exit 0; [output](validation-ten-languages-build.log) |
| `npm run start` | Final production server started at `127.0.0.1:3000`; ready in 59 ms |
| `npm run test:e2e` against production | 35 passed, one keyboard-helper timing failure; [complete output](validation-ten-languages-browser.log), [per-scenario results](ten-languages-browser-results.json) |
| `npm run test:e2e -- tests/e2e/game.spec.ts -g 'only keyboard'` | After waiting for the actual scheduled focus: one passed, exit 0; [output](validation-ten-languages-keyboard.log) |
| `npm run test:e2e -- tests/e2e/languages.spec.ts -g 'in de at\|keyboard language'` | Final German-label polish and native keyboard language selection: two passed, exit 0; [output](validation-ten-languages-final-targeted.log) |

All **36 distinct browser scenarios** have passing executions after the fixes. This is the full run plus the scoped reruns above, not a claim that the first full run was green. The final two-word German UI polish was followed by another 74-test run, type check, build and focused browser check; unaffected browser flows were not repeatedly rerun.

Browser coverage includes all ten language sample completions at 390 px, correct/wrong verdicts, keyboard-only completion, persisted language choice, invalid saved language, 360/390/768 px layouts, landscape/portrait/EXIF/manual rotation, missing/malformed/late AI, share consent and deletion, independent friend play, frozen evidence, retrying a failed translation without a second accusation, legacy English evidence within Arabic UI, note/hypothesis/coordinate preservation, and ten-language credits/privacy.

Visual inspection: [English desktop](screenshots/ten-languages-english.png), [English mobile](screenshots/ten-languages-en-mobile.png), [German mobile](screenshots/ten-languages-de-mobile.png), [Arabic mobile](screenshots/ten-languages-ar-mobile.png). The final German steps use concise “Befragen” / “Folgern” labels in addition to responsive wrapping. The photo coordinate plane remains left-to-right while Arabic text reads right-to-left.

The engine tests exercise 144 approved variants × ten languages, all six worlds and all three omitted-statement cases. Tests compare evidence/proof semantics, exact confrontation quotations, fixed fact subjects and each possible accusation. Server tests cover all ten frozen snapshots, public answer exclusion, legacy fallback, independent sessions, duplicate/concurrent accusations, deletion and expiry.

## Failures found and addressed

1. The first sandboxed browser run could not bind the local port (`EPERM`) and did not execute scenarios. Browser/server launch was retried through the approved execution boundary; no system security settings were changed.
2. Initial development-server run: 29 passed, four failed. German's long journey label overflowed the mobile viewport; mobile steps now wrap in a four-column grid. The new notebook test attempted to operate a closed disclosure; it now opens the disclosure through its summary. macOS native select did not choose the last option with the tested End sequence; the keyboard test now uses native letter search (`f`, Tab), and independently passed. A malformed-AI scenario returned to the landing screen during concurrent hot reload; the final regression uses the stable production build.
3. Integration review found silent shared-verdict translation failures and missing direction/language boundaries for older shared evidence. Both were corrected, with a simulated HTTP 503/retry scenario and a legacy-response UI fixture. Real SQLite fallback/no-rewrite behavior is tested separately in the server suite.
4. The production keyboard-only scenario exposed a test timing race: the helper sent its next key before the component's scheduled exchange focus. The helper now waits for that observable focus before continuing keyboard navigation. This does not bypass a control or set focus itself.

## Actual Kiro contribution

Kiro CLI 2.37.0 wrote/extended the secondary UI catalogues, stage guidance, three components, focused tests and requirements/design. Its first focused test failed on a French apostrophe; Kiro repaired it and reran **19 passing tests**. It later ended with process exit 1 due to service throttling while writing documentation. Codex completed the integration, remaining task record, broader verification and packaging. [Exact scope and evidence](kiro/ten-languages-README.md) distinguish the partial CLI run from successful focused test execution and subsequent Codex edits.

## Limits

No native-speaker review of all ten languages, physical iPhone/Android test, full screen-reader session, real paid vision-provider call, public deployment or contest project submission was performed in this revision. Tests establish executable flows and structural consistency, not professional linguistic review. The local share URL still requires a reachable persistent host and HTTPS for friends on other devices.

The user reports that the credit request was submitted. Approval, identity-verification completion, receipt/redemption of the credit code and final project submission are not inferred from that report. [Credit status record](kiro-credits-2026.md).
