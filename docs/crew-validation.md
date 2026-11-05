# Kiro Crew release verification — 2026-11-05

Executed on macOS, Node 24, Kiro CLI 2.37.0 and official Kiro Crew 0.11.2. These are observed checks, not a claim of complete security or recognition accuracy.

| Check | Observed result |
| --- | --- |
| Main unit/server/solver suite | 284 tests passed |
| Main Chromium suite | 63 tests passed |
| Final chat UI regression after closing the AI settings popover by default | 20 tests passed, including ten locales and four widths |
| Final type check and production build | Passed; `/crew` included |
| Standalone Crew source install | Fresh `npm ci --ignore-scripts`, build and backend tests passed in the separate publication checkout |
| Updated public deployment | Home, Crew guide and AI status return 200; public providers remain disabled |
| Public API release rerun | 11 checks passed: consent, exact photo/evidence/dialogue, ten locales, no premature solution, independent friend sessions, concurrent/repeated verdict, ownership and deletion, manual fallback, guide and disabled public AI |
| Kiro-authored performance tests | 107 passed after one recorded correction |
| Final actual Kiro verification | 131 tests passed, including both engine families and live-performance integration |
| Real photo analysis | Licensed work-desk photo recognized as Laptop, Headphones and Potted Plant; approximate faces were editable |
| Real dialogue check | Five of five final questions produced accepted generated/reviewed replies; earlier rejected runs retained |
| Real Crew recording | 96.489 seconds, photo analysis, two live replies, one adversarial scripted fallback, one final verdict |
| Crew backend integration | Signed/unsigned/tampered/stale proxy requests, consent, fallback, duplicate handling, concurrency and daily attempt limit checked |
| Crew mobile/keyboard | 360, 390, 768 and 1280 × 800: visible composer, keyboard send, fallback and Escape focus restoration passed |
| Tool isolation probe | A controlled random canary file was not read or returned; no tool calls occurred. Unexpected prose was rejected by strict JSON parsing |

Evidence is in `docs/kiro/live-dialogue`, `docs/demo/crew-recording.json`, and `docs/verification/crew/mobile.json`. The new public recording is https://youtu.be/7gknqGSknDk. Earlier validation records remain historical rather than being silently rewritten.

Public API results are in `docs/verification/production-crew-release.json`. This final rerun did not retrieve production secrets or force database timestamps. Earlier physical cleanup/expiry execution remains in `docs/verification/production-api.json`; expiry is also covered by the server suite. The YouTube English subtitle track was visibly published on November 5.

## Fixes found during execution

Corrected the Crew UI bundle path, proxy prefix normalization, photo-analysis timeout, consent-aware browser tests, runtime capability permissions and the mobile AI settings popover that covered the composer. An initial broad browser run used a stale development build; the clean production-server run passed. A Kiro narrative review overstated its scope; only the later tool output executing 131 tests is accepted as final verification evidence. Failed attempts remain recorded.

## Limits and external setup

The public website uses manual casting and authored dialogue with no paid AI calls. Live photo analysis and dialogue require the optional local Crew app, Node 24 and the player's own signed-in Kiro CLI with remaining allowance. A generated turn makes two model calls. The app caps attempts at 20 per UTC day and never purchases credits, enables overages or configures payment.

Semantic review is probabilistic. Official evidence, guilt and explanations are code-owned and are never generated or paraphrased by AI, but perfect semantic leak prevention is not claimed. Recognition was checked on a licensed fixture, not every possible photograph. Mobile tests use Chromium viewports, not physical iOS/Android devices. No native-speaker review of every translation, scheduled seven-day observation, user study, app-catalog acceptance or contest award is claimed. The optional app is distributed from its separate public repository.
