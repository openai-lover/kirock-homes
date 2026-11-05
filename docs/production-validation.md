# Public deployment validation — 2026-11-05

App: https://kirock-homes.vercel.app
Source: https://github.com/openai-lover/kirock-homes
Video: https://youtu.be/zGdqdS0ssVY

Vercel team `teamstartup`, Hobby; Turso `kirock-homes`, Starter free. The integration showed **No payment method configured**. No card, upgrade, overage or paid AI was enabled. Public `AI_PROVIDER` and `CHAT_PROVIDER` are `none`. The local recording's live Kiro question is a separate, documented local run.

## Executed checks

- Production deployment `dpl_EXhQYCz1Zyx2UJk8CKMQoeEtpDmF` reached Ready, Node 24.x. Its stable alias opens without Vercel authentication.
- [Actual public API results](verification/production-api.json): eleven groups passed through anonymous HTTPS requests and the real remote database. This includes photo publication consent, secure owner cookies, all ten frozen translations, exact sanitized image bytes, no pre-verdict answer fields, independent friends, unauthorized access refusal, simultaneous differing accusations returning the same first verdict, exact engine explanation, missing-key fallback, owner deletion and expiry.
- Expiry was tested by aging only a disposable fixture row. Photo, case, session, accusation and chat immediately returned 410. The authenticated cleanup endpoint physically removed the case and dependent play. Unauthorized cleanup returned 401. Natural seven-day passage and an actual scheduled cron invocation were not observed.
- All production-test records were removed. Only licensed test photos were uploaded; no user photo was used.
- Current unit/server/solver suite: **173 passed**, zero failed/skipped ([log](verification/production-unit.txt)). Type generation and TypeScript: exit 0 ([log](verification/production-typecheck.txt)). Local production Webpack build: exit 0 ([log](verification/vercel-webpack-build.txt)); Vercel ran its own successful production build.
- The earlier full **63-test** browser preflight remains recorded in [preflight validation](preflight-validation.md). It was not rerun wholesale against the public deployment.
- Actual in-app public browser: English first visit and ten-language menu, sample awakening, three statements, typed question and correct Keyboard verdict inspected. At **390 × 844**, uploaded the portrait `dark-desk.jpg`, manually selected Mug/Tablet/Notebook, placed faces, awakened them, asked a comparison question and received Mug's answer plus Notebook's interjection. An intentionally wrong Notebook accusation revealed Mug and a three-step proof.
- Public mobile face centers measured approximately `(0.149,0.629)`, `(0.679,0.450)`, `(0.690,0.821)` against requested `(0.15,0.63)`, `(0.68,0.45)`, `(0.69,0.82)`. No horizontal overflow. At **390 × 480**, input and Send each retained 44 px height and bottom position 410, inside the viewport. This is a keyboard-space simulation, not a physical mobile keyboard test.

## Failures found and resolved

The first Turbopack deployments served the static homepage but failed server functions with missing Next runtime files. Adding only bootstrap files was insufficient: the route runtime was also absent. The final implementation uses Next's supported bundled Webpack production build, whose trace includes the complete runtime. The intermediate workaround is not part of the delivered source. All public API checks then passed.

The browser automation's range-input fill did not change React's selection; actual photo clicks and keyboard adjustment did. Final measured face positions use those real interactions. A file chooser tool response was delayed; the resulting file loaded correctly. No timeout was counted as a passing upload until the actual image and controls were visible.

## Remaining external work

Final Devpost project submission has not been performed. Credit application approval, credit balance and redemption have not been verified. Public live AI needs a separately configured provider and is deliberately disabled. Physical iPhone/Android, Safari/Firefox, screen-reader and human-playtest checks remain unperformed. Free service limits and scheduled cleanup failures still need operator monitoring.

Screenshots: [mobile entry](screenshots/preflight/production-mobile-home.png), [mobile live-photo chat](screenshots/preflight/production-mobile-chat.png).
