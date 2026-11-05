# Kirock Homes language and presentation validation

Date: 2026-10-31, Asia/Seoul. Browser QA and this report: Codex. This report covers the new English name **Kirock Homes**, Korean **킬록 홈즈**, automatic/persisted language selection, revised presentation and Kiro's stage guidance integration.

## Result

The prepared **production server passed all 21 browser cases**: the existing 18 game/UI cases plus 3 new language cases. There were **0 failures, 0 skipped and 0 flaky cases**. The run lasted 3.3 minutes.

The separate visual/interaction run passed **22 checks and captured 13 screenshots**. It recorded no page errors or failed requests. The source hashes for Game, DetectiveAside, detective-voice, CSS, layout and credits matched at the start and end of that visual run.

The root agent also executed the actual final-scope **50 unit/integration tests**, type check and production build before starting this server; all passed. The logs are linked below. A fresh dependency install was not repeated for this revision.

## Language behavior

| Browser case | Actual observation | Result |
| --- | --- | --- |
| New `en-US` context | `navigator.language` is `en-US`; page language is `en`; heading is Kirock Homes; English sample action and Room of Suspects subtitle are visible | Pass |
| New `ko-KR` context | `navigator.language` is `ko-KR`; page language is `ko`; heading is 킬록 홈즈; Korean sample action and 범인은 내 방에 subtitle are visible | Pass |
| Explicit choice in an `en-US` context | Switching to Korean stores `kirock:locale=ko` and survives reload; switching back stores `en` and also survives reload | Pass |

The existing test configuration now explicitly uses `ko-KR`. Its two manually created friend contexts also specify `ko-KR`; the rest of the existing game assertions were preserved. The new language cases exercise real browser locale settings and user button clicks, without injecting application locale state.

## Gameplay and integration coverage

All existing 18 cases passed, including sample correct/wrong outcomes, keyboard-only completion, 360/390/768 px layouts, photo orientation and manual rotation, invalid uploads, missing AI key, controlled invalid/late AI responses, actual client timeout, English completion, shared frozen content, independent friend plays, idempotent accusation and owner deletion. Dialog focus restoration, verbatim confrontation quotations, reversible testimony notes, six-world hypothesis marks and pointer cancellation also passed.

The visual script confirmed that the new detective aside follows five sample-play stages—awakening, listening, confronting, deducing and reveal—using its `data-stage` attribute and nonempty English guidance. The scene retains exactly three suspect actors throughout. The manual board has six cards and no verdict appears before accusation. This inspection complements the preserved logic/server tests; it is not a new exhaustive proof of all engine variants.

## Visual inspection

Codex inspected the captured English desktop and 360 px landing pages, Korean 360/390 px landing pages, English 360 px rebuttal, and English 390 px hypothesis/verdict screens. The title, ghost detective, calls to action and photo remain distinct. There was no horizontal overflow or duplicated screenshot tiling. Kirock's notebook stays outside the photographed suspect group, and the verdict shows the case-closed caption. Production captures have no Next development indicator.

The capture script waits for fonts and two animation frames, scrolls to the top, and disables animations for the screenshot itself. All screenshots here are new files; earlier gameplay/branding screenshots and reports were not overwritten.

## Evidence

| Executed check | Evidence | Result |
| --- | --- | --- |
| Full production browser run, 15:50:32–15:53:48 Asia/Seoul | [Log](kirock-browser.log), [JSON](kirock-browser-results.json) | 21 passed; 0 failed/skipped/flaky |
| Production visual run, 15:50:35–15:50:48 Asia/Seoul | [Log](kirock-visual.log), [JSON with measurements and source hashes](kirock-visual-results.json) | 22 checks; 13 screenshots; no page/resource errors |
| Unit/integration suite, executed by root | [Actual output](validation-kirock-unit.log) | 50 passed; 0 failed |
| Type checking, executed by root | [Actual output](validation-kirock-typecheck.log) | Pass |
| Production build, executed by root | [Actual output](validation-kirock-build.log) | Pass |
| Final credits attribution and landing smoke check, executed by root after the prose update and rebuild | [Focused browser results](kirock-final-credits-results.json) | 5 checks passed |

Environment: macOS, Google Chrome **156.0.8078.74**, reduced-motion preference, `http://127.0.0.1:3000`. Playwright reused the prepared `next start` process; it did not start a development server for this run.

Commands actually executed:

```bash
node --check scripts/qa-kirock.mjs
npm run test:e2e -- --list
npm run test:e2e
QA_SERVER_MODE='production server' node scripts/qa-kirock.mjs
```

The first two are preparation checks, not additional browser passes. Test discovery found the expected 21 cases.

## Screenshots

- English landing: [1440 px](kirock-screenshots/en-landing-1440.png), [390 px](kirock-screenshots/en-landing-390.png), [360 px](kirock-screenshots/en-landing-360.png).
- Korean landing: [1440 px](kirock-screenshots/ko-landing-1440.png), [390 px](kirock-screenshots/ko-landing-390.png), [360 px](kirock-screenshots/ko-landing-360.png).
- English play: [awakening](kirock-screenshots/en-awakening-desktop.png), [official statements](kirock-screenshots/en-statements-desktop.png).
- Rebuttal: [desktop](kirock-screenshots/en-interrogation-desktop.png), [360 px](kirock-screenshots/en-interrogation-360.png).
- Final reasoning: [desktop hypotheses](kirock-screenshots/en-hypothesis-desktop.png), [390 px hypotheses](kirock-screenshots/en-hypothesis-390.png), [390 px verdict](kirock-screenshots/en-verdict-390.png).

## Scope and attribution

Kiro authored the new stage-copy module and DetectiveAside component and performed its recorded TypeScript check. Codex owns Game/CSS integration and the browser/build validation above. See [the actual new Kiro evidence](kiro/kirock-README.md) and [overall development provenance](kiro-usage.md). This browser report does not reattribute Codex work or screenshots to Kiro.

The root agent separately updated only the credits attribution prose to include the new Kiro component/copy work, then rebuilt and executed a focused browser check. All five checks passed: displayed Kiro hypothesis/guidance credit, Codex layout/art attribution, English landing, no 390 px overflow and no page errors. [The actual result](kirock-final-credits-results.json) records that follow-up separately from the 21-case run. Gameplay, locale and tested component behavior were unchanged by the prose update; the build log linked above is the final rebuilt version.

Real phone hardware, Safari and a screen reader were not tested. No real runtime AI provider call was made; AI failure-path browser responses were controlled fixtures. The recorded keyboard test covers full game completion, while visual screenshot checks are not a claim of a comprehensive assistive-technology audit.
