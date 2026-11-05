# Consulting-room UI validation — 2026-10-31

This report covers the Sherlock-inspired visual revision by Codex. The engine, official claims, localization data for evidence, share adjudication and earlier Kiro contributions were preserved. See [design decisions](sherlock-design.md), [art provenance](sherlock-art.md), and [font licenses/sources](sherlock-fonts.md).

## Executed checks

- `npm test`: **74 passed, 0 failed**. This includes exhaustive approved-variant reasoning, explanation consistency, AI fallback and server share/expiry/deletion contracts. [Output](verification/sherlock-unit-tests.txt).
- `npm run typecheck`: passed.
- `npm run build`: passed; the app was served with `npm run start` at `127.0.0.1:3000`.
- Initial redesigned production build, `npm run test:e2e`: **36 passed, 0 failed, 3.6 minutes**. [Output](verification/sherlock-e2e-full.txt). Covers correct/wrong sample verdicts; keyboard completion; 360/390/768 px layouts; landscape/portrait/EXIF/manual rotation; malformed files; absent/late/invalid AI; shared-case identity, answer secrecy, independent plays and deletion; ten-language completion; preserved state across locale changes; legacy Arabic/English direction; focus trap; manual hypothesis notes.

The full run preceded the final small-text contrast correction, decorative seal accessibility correction and refreshed font/art credit copy. After those changes, the new layout suite found two real mobile overflow failures (5 px at English 360 px and 3 px at Korean 390 px), while 25 other targeted tests passed. The decorative folder rotation was reduced on mobile; the assertions were not relaxed. [Initial failure record](verification/sherlock-e2e-layout-before-fix.txt). A sandboxed first browser-test launch could not reach localhost (EPERM); no tests ran in that attempt. The permitted retry above passed. These environment errors are not recorded as passing checks.

## Final production-build verification

- Rebuilt after the overflow correction: **build passed**. [Build output](verification/sherlock-build.txt).
- Final targeted run: **27 passed, 0 failed, 24.6 seconds**, covering all tests in brand, languages, ui-redesign and sherlock-visual. [Output](verification/sherlock-e2e-final.txt). This includes the four new layout checks and reruns 23 existing browser scenarios. Together with the earlier full run, all 40 distinct browser scenarios have a successful run; this is not a claim of a single final 40-test invocation.
- Final unit/integration run: **74 passed, 0 failed**.
- English default, saved language choice, all ten mobile language flows, live locale switching, translated credits, shared-result retry, legacy RTL evidence, keyboard language control, focus trap, face dragging, long labels and the manual hypothesis board passed against the final production build.
- The new layout checks measure document width and 44 px control targets and capture screenshots for human inspection; they are not pixel-golden comparisons.

## Reviewed screenshots

- [English desktop arrival](screenshots/victorian/sherlock-landing-en-1440.png)
- [English 360 px](screenshots/victorian/sherlock-landing-en-360.png), [Korean 390 px](screenshots/victorian/sherlock-landing-ko-390.png), [Arabic 360 px](screenshots/victorian/sherlock-landing-ar-360.png)
- [Official statements](screenshots/victorian/sherlock-statements.png), [cross-examination](screenshots/victorian/sherlock-confrontation.png), [verdict](screenshots/victorian/sherlock-verdict.png)

Desktop and mobile screenshots were visually inspected after capture. The original photo is not filtered, clipped independently from faces, or mirrored in Arabic.

## Visual review and changes

- Actual desktop browser inspection found the first draft's background underneath the body and an oversized evidence photograph. Fixed the body stacking context and reduced the landing photo mount; the study, lamplight and rainy window now remain visible beside the title.
- Inspected the real statement and cross-examination screens. Kept the actual unfiltered sample photograph and readable, small SVG faces. Replaced the scrapbook bubble treatment with ruled transcripts and an oxblood objection stamp.
- Reviewed small text contrast on paper, using the darkest gradient endpoint where relevant. Darkened photo captions, scene labels, hints and excluded-world text. This is a focused contrast review, not a claim of a complete WCAG certification.
- Decorative KH wax seal is explicitly hidden from assistive technology. Native buttons, select menus, disclosure controls, focus handling and reduced-motion rules remain functional.

## Limits

Chrome on this macOS computer and emulated mobile viewports were exercised. No physical iPhone/Android device, Safari or Firefox was tested in this revision. No live external AI service, production hosting or real personal-photo upload was needed or tested. Screenshots use the bundled licensed sample only. Existing expiry coverage uses the project's deterministic server tests; this run did not wait seven real days.

Kiro was not invoked for this visual revision. Existing Kiro code and its recorded evidence remain intact; the new layout, CSS, art generation and verification are Codex work.
