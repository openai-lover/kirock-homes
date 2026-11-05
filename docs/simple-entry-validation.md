# Character-led entry — actual validation

2026-11-05, Asia/Seoul. The user requested a less cluttered first screen, less introductory text and a logo built around the Kiro-inspired detective. [Plan before implementation](simple-entry-design.md). All new presentation work and the [generated logo](simple-entry-art.md) are Codex work; no new Kiro execution is claimed.

## Changes

The home screen now has one combined character/wordmark, one premise line and two primary entry actions. The repeated agency label, subtitle, greeting, explanatory paragraph, feature claims and three-step method were removed. The small header logo now uses the same ghost portrait. Sound and motion controls keep accessible names while using icon-only presentation. Existing contextual gameplay instructions remain in their original stages.

The sample photograph and comic reactions are available through the initially closed **Meet the suspects** disclosure. It is keyboard-operable and does not create or progress a case. Shared links immediately show their stored photograph and retain their own play action. The opening keeps its existing full-body character and behavior, with the redundant profession label removed. All displayed titles remain live localized text.

## Executed checks

Runtime: macOS, Node 25.9.0, Next.js 16.4.3, React 19.3.1, TypeScript 5.9.3. Playwright used installed Google Chrome against the production server at `127.0.0.1:3000`. No live AI provider was called and no dependency was changed.

| Check | Result | Evidence |
| --- | --- | --- |
| `npm run typecheck` | Exit 0 | [Type log](verification/simple-entry-typecheck.txt) |
| `npm run build` | Exit 0 | [Production build](verification/simple-entry-build.txt) |
| `npm test` | 74 passed, 0 failed | [Unit/engine/server log](verification/simple-entry-unit.txt) |
| Entry, brand, detective preview and opening browser files | 17 passed, 0 failed, 52.7 seconds | [Focused browser log](verification/simple-entry-focused.txt) |
| Remaining game, languages, novel, Sherlock and interaction browser files | 41 passed, 0 failed, 3.6 minutes | [Remaining browser log](verification/simple-entry-game.txt) |

The two non-overlapping browser selections cover all **58 existing browser tests**, with zero failures. All ran against the same unchanged production build. The focused checks cover English defaults, persistent locale selection, keyboard disclosure activation, neutral suspect previews, a fresh investigation after preview, ten-language layout and the complete first-visit/replay opening behavior. Both primary actions are asserted fully inside a **360 × 640** viewport without scrolling. The broader layout loop also measures 768, 1024 and 1440px widths, accessible target sizes, hit testing, RTL, reduced motion and material-image failures.

The existing preview tests were adapted to open the new disclosure before interacting with its hidden controls. Former subtitle assertions now check the remaining premise line. This changes the presentation expectation without removing checks for isolation from evidence, keyboard input or playable entry. No mirror tests were added for the static logo component.

## Visual review

The rendered desktop, tablet and small-phone screenshots were inspected. The logo combines a simple ghost silhouette with live serif lettering; the main actions fit on the short phone viewport, while the surrounding detective-street materials remain visible. The in-app browser was reloaded and the reduced content verified in its accessibility tree and screenshot; the sample disclosure was opened and closed manually, then left collapsed for the user. Previous attraction screenshots are preserved in `screenshots/themepark/`, with their historical report links updated.

- [Desktop entry](screenshots/simple-entry/simple-entry-1440-en.png)
- [Tablet, 768px](screenshots/simple-entry/simple-entry-768-en.png)
- [Tablet, 1024px](screenshots/simple-entry/simple-entry-1024-en.png)
- [Short phone, English](screenshots/simple-entry/simple-entry-360-en.png)
- [Short phone, Korean](screenshots/simple-entry/simple-entry-360-ko.png)
- [Opening](screenshots/opening-desktop.png)
- [Phone opening](screenshots/opening-mobile.png)

## Limits

Viewport checks are browser simulations, not physical-phone or assistive-technology certification. Safari, Firefox, live AI recognition, native-speaker review and human playtesting were not performed in this revision. The solver, authored evidence, cross-examination, immutable shared cases and verdict logic were not changed. Public deployment and competition submission remain separate work. Earlier validation reports retain their original scope.

The source ZIP is regenerated with the existing allowlist, excluding keys, personal photo data, dependencies and build caches. Its integrity is checked before delivery; the final archive checksum is stored beside it in `dist/FINAL_ARCHIVE_CHECK.json` rather than recursively inside its own manifest.
