# Comic prologue — actual validation, 2026-11-05

The optional Story button opens a four-panel illustrated prologue. It has localized narration, character speech balloons and accessible navigation in all ten supported languages. The last panel opens either a fresh sample case or the actual photo picker. The homepage keeps its character logo, one-line premise and primary actions.

## Implementation and authorship

- `src/components/StoryComic.tsx` contains presentation state only; it never fetches an API or receives case/answer data.
- `src/lib/i18n/story.ts` is authored fiction, separate from official testimony and the game engine. English remains the default, with all ten existing languages supported.
- `public/art/story-biscuit.png` preserves the generated master; the WebP atlas is 487,182 bytes. Panels are displayed through CSS; translations remain real HTML text. See [the exact prompt and provenance](story-art.md).
- The dialog locks background scrolling, makes the game inert, contains Tab focus, restores the opener on dismissal, and supports Escape plus direction-aware arrow keys. Focus remains inside when a page turn removes the photo button or disables Back.
- Page navigation is manual. Reduced motion removes its short transition; missing art uses localized scene descriptions and keeps navigation and entry actions working.
- This revision is Codex work. Existing Kiro work retains its original attribution in [the development record](kiro-usage.md); no new Kiro run or credit consumption is asserted.

## Executed checks

Production build served locally at `http://127.0.0.1:3000`. Node 25.9.0 / npm 11.12.1. Test fixtures use the configured local Chrome executable, with no live AI provider.

| Check | Result | Evidence |
| --- | --- | --- |
| Typecheck | Passed | [Log](verification/story-typecheck.txt) |
| Production build | Passed | [Log](verification/story-build.txt) |
| Unit/integration suite | 74 passed, 0 failed | [Log](verification/story-unit.txt) |
| Full browser suite before final CSS repair | 65 passed, 1 failed; 5.1 minutes | [Full log with failure](verification/story-full-before-fix.txt) |
| Final comic suite after CSS repair | 8 passed, 0 failed; 46.1 seconds | [Final log](verification/story-final.txt) |

The first focused run passed seven comic tests. Visual review then found that a low desktop window clipped the bottom of the artwork. Its size is now bounded by viewport height, with an additional 1078 × 738 layout regression check. The full suite includes eight comic tests and the existing 58 browser tests. Its new low-window assertion exposed a remaining 3px clip: a global `footer` margin was inherited by the comic navigation. The final repair is scoped to `.story-nav { margin: 0 }`. The strict full-image visibility assertion is unchanged; the complete eight-test comic suite passed against the rebuilt production server. The other 58 tests and all 74 unit tests passed before this isolated CSS repair; they are not claimed as a second full-suite run afterward.

Executed browser commands:

```sh
npm run test:e2e -- --reporter=list --output=/private/tmp/story-full-results
npm run test:e2e -- tests/e2e/story.spec.ts --reporter=list --output=/private/tmp/story-final-results
```

## Browser coverage

- Keyboard-only opening and reading; forward/back boundaries; focus wrap; Escape; return to Story; reopening starts at panel one. Merely reading the comic leaves the case unplayed and sends no API request.
- A fresh sample from the comic reaches the actual verdict after all testimony and rebuttals. Initially none of its three official statements is marked heard.
- The real photo chooser from the final panel accepts the licensed sample fixture and reaches manual casting.
- Aborted comic image requests retain descriptions and navigation, and still reach the sample.
- Four pages × ten languages × four viewport sizes: 1440 × 960, 1078 × 738, 360 × 640 and landscape 640 × 360. Checks cover image loading, RTL direction and arrows, readable text, horizontal bounds, visible fixed navigation, hit targets of at least 44px, and reduced motion. On short screens the story body may scroll; close and navigation stay available.
- The broader suite retains sample correct/incorrect verdicts, keyboard completion, photo placement and rotation, AI failure/timeout fallbacks, shared-case identity and hidden answers, duplicate accusations, deletion, translations, and opening/replay behavior. Solver and expiry checks remain in the unit/integration suite.

## Visual inspection

The generated atlas and desktop/mobile renders were inspected. Manual in-app review confirmed the live first, second and third panels, the corrected full artwork framing in a low window, and return to panel one. The original title screen remains uncluttered; Story is a small book action beneath the main entry buttons. Earlier title-screen images are preserved in `screenshots/simple-entry/`.

After the margin repair, the live in-app first panel was inspected again, along with the final Korean mobile panel and the English/Arabic/Korean captures. The screenshot set for this revision is under `screenshots/story/`. It includes English, Korean and Arabic panels on desktop and portrait phone sizes. Screenshots show actual running UI, not a mockup.

- [English opening panel](screenshots/story/1440-en-1.png)
- [Kirock arrives, Korean](screenshots/story/1440-ko-3.png)
- [Low desktop window](screenshots/story/1078-en-1.png)
- [Short phone, English](screenshots/story/360-en-1.png)
- [Short phone, Korean final panel](screenshots/story/360-ko-4.png)
- [Short phone, Arabic](screenshots/story/360-ar-3.png)

## Limits and release

These are simulated browser viewports, not physical phone tests. Native-speaker review, screen-reader testing, Safari, Firefox and live AI analysis were not performed for this revision. The comic is an introductory fiction, not another solved case or a generated clue source. Existing outside-host deployment and competition-submission requirements are unchanged.

The source package is regenerated with the existing allowlist after final verification. Secrets, personal photos, runtime data, dependencies and build caches are excluded. Archive integrity and every manifest hash are checked, with the final digest stored beside the ZIP in `dist/FINAL_ARCHIVE_CHECK.json`.
