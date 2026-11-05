# Kirolock Homes branding validation — 2026-10-31

This is a visual/name revision to the previously validated game. Codex generated the new mascot and integrated this branding; no new Kiro execution is claimed for this revision. Existing Kiro-authored game modules and their evidence are unchanged.

## Executed on this revision

- `npm test`: 50 passed, 0 failed/skipped. [Log](validation-kirolock-unit.log).
- `npm run typecheck`: passed. [Log](validation-kirolock-typecheck.log).
- `npm run build`: passed. [Log](validation-kirolock-build.log).
- Production `npm start`: ran successfully at `http://127.0.0.1:3000` after the sandbox denied the initial port bind. No application change was required.
- Existing browser regression selection: 3 passed, covering correct and wrong sample verdicts, full keyboard play, and English play. [Log](validation-kirolock-browser.log). The full previous 18-test browser suite was not rerun for this visual-only revision.
- Production visual checks: Korean and English at 1440, 390, and 360 px. No horizontal overflow, no broken images, mascot loaded at its natural 1254 × 1254 size, original sample photograph retained, no page errors. Six screenshots in [screenshots/kirolock](screenshots/kirolock).
- Credits visibly identify the unofficial fan adaptation and Codex image generation. [Results](kirolock-visual-results.json).
- The first inspection used a credits text locator that did not match the actual wording. Six viewport checks had already passed. A focused check using the actual visible attribution passed without changing the app. [Initial evidence](kirolock-visual-initial-results.json).
- PNG has RGBA transparency; 865,776 fully transparent pixels out of 1,572,516. Final artwork visually inspected. No giant eyeball, realistic eyes, tobacco, or cropped props.

## Scope and remaining limits

No new dependency installation, live AI provider test, physical device testing, English-speaking audience survey, legal clearance, or contest submission was performed in this branding revision. The naming judgment is editorial, not a measured audience result. For earlier full gameplay/share/engine validation, see [the previous report](gameplay-depth-validation.md).

The existing release packager uses an explicit source allow-list. The updated source is also delivered as `dist/KIROLOCK_HOMES_SOURCE.zip`; ZIP integrity, extracted SHA-256 manifest, and forbidden-entry checks are recorded beside it after packaging. Keys, auth state, private photos, dependencies, runtime data, and build caches are excluded.
