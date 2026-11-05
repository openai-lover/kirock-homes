# Assets and attribution

## Sample desk photograph

- Application file: `public/sample-desk.jpg`
- Photograph: **A Lamp on a Computer Desk**, by **Elena Golovchenko**.
- Primary source: [Pexels photo 10922370](https://www.pexels.com/photo/a-lamp-on-a-computer-desk-10922370/).
- Download URL: `https://images.pexels.com/photos/10922370/pexels-photo-10922370.jpeg?auto=compress&dpr=1&w=1100`
- License: [Pexels License](https://www.pexels.com/license/), checked 2026-10-31. Pexels permits use and modification in websites/apps without mandatory attribution. Do not sell unaltered copies, redistribute as stock, or imply endorsement. The photo retains its own license and is not relicensed under the application's source-code license.
- Local dimensions: 1100 × 1659 px; portrait JPEG. The CDN resized/compressed the source for web use. The scene was not generated, recolored, composited, or cropped by this project.
- SHA-256: `2369b828b6ab40a0413cfebd30a5b8d6cd7ae067d3edcef422c31db22dbfe9c4`.
- The sample is a publicly licensed stock photograph, not a photograph taken by the developer or an uploaded user photograph. No photographer endorsement is implied.

The game adds original SVG eyes/mouths as independent overlays. The three visible sample objects are a glass cup, a black desk lamp, and a keyboard. Approximate face centers in normalized photo coordinates are cup `(0.661, 0.723)`, lamp `(0.312, 0.250)`, and keyboard `(0.379, 0.782)`. Final display placement is controlled by the sample configuration in the source.

## Current generated artwork and interface materials

The current entry on 2026-11-05 combines a compact Kirock character logo with live localized lettering, a one-line premise and two actions. The gaslit entrance and brass/paper materials remain; the sample case folder is now available through an optional disclosure. Codex generated the three new scene/material assets and previously generated the pose using the existing mascot as an identity reference. The game never calls an image-generation service at runtime. Buttons, labels, testimony, photographs and animated SVG faces remain separate live interface elements.

| File | Purpose |
| --- | --- |
| `story-biscuit.webp` / `.png` | Four-panel comic atlas / preserved generated master; [exact prompt and provenance](story-art.md) |
| `kirock-logo-mark.webp` / `.png` | Current mascot logo / preserved generated master |
| `kirock-logo-small.webp` | 128px header derivative |
| `attraction-street.webp` / `.png` | Current gaslit entrance scene / generated master |
| `attraction-brass.webp` / `.png` | Blank brass action material / generated master |
| `attraction-ticket.webp` / `.png` | Blank paper ticket material / generated master |
| `kirock-case-invitation.webp` | Transparent case-offering pose retained in the opening |
| `kirock-case-invitation.png` | Original generated pose master, retained in the source package |
| `kirolock-homes.png` | Existing unofficial ghost detective guide, still used in the game notebook; original filename retained |
| `suspect-trio.png` | Decorative object illustration during awakening |

Entry buttons combine generated blank material skins with live HTML labels and solid-color image-failure fallbacks. Other controls use CSS metal, paper, clips and stamps. The case folder, notebook and progress markers remain HTML/CSS. All displayed interface text remains real text. The player's original photograph remains intact, with independent SVG faces on its own coordinate plane. Utility symbols and the editable faces remain code-native SVG for crisp scaling and accessible interactions.

See [the current entry design](simple-entry-design.md), [logo prompt/provenance](simple-entry-art.md), [new scene/material prompts](themepark-art.md), [pose provenance](detective-art.md), and [font sources](sherlock-fonts.md). Visual integration and generated bitmap art are Codex work. Kiro actually authored the decorative SVG prop component and its specs; Codex reviewed and integrated it. The [development record](kiro-usage.md) distinguishes both contributions.

The optional Story prologue uses a single generated 2×2 atlas, displayed one panel at a time with localized HTML speech balloons and narration. It is introductory fiction, never evidence. Codex generated and integrated this art with the built-in image tool; there is no new Kiro execution associated with it. See [comic design](story-design.md) and [art record](story-art.md).

### Preserved earlier artwork

The following generated assets remain in `public/art/` as part of the project's prior visual work. Their presence in the source package does not mean that the current interface uses their button skins or background.

| File | Purpose |
| --- | --- |
| `baker-street-study.webp` | Historical Victorian consulting-room background; no longer displayed |
| `baker-street-study.png` | Original generated study master from that earlier redesign |
| `midnight-desk.png` | Earlier painted desk background |
| `primary-plaque.png` | Earlier orange enamel button skin |
| `paper-label.png` | Earlier cream secondary button skin |
| `detective-lens.png` | Earlier ordinary eye-free magnifier; transparent surrounding canvas |

The Victorian study and brass-and-leather CSS buttons belong to the [earlier consulting-room design](sherlock-design.md). The study's exact prompt and provenance remain in [the historical study art record](sherlock-art.md). The initial magnifier with an eye was rejected by the user and is excluded. Other earlier prompts and tool provenance are in [UI prompts](art-prompts-ui.md), [trio prompt](art-prompts-hero.md), and [replacement magnifier prompt](art-prompts-lens.md). No music or recorded voices are bundled. Sound effects are synthesized locally. Private uploaded photos are excluded from the release.

### Kirock Homes detective mascot

- Original pose: `public/art/kirolock-homes.png`, 1254 × 1254 px RGBA PNG with transparent alpha; still used by the in-game detective aside.
- Identity reference: the official ghost shown on [Kiro About](https://kiro.dev/about/) and its [about-banner-ghost.png](https://kiro.dev/images/about-banner-ghost.png), checked 2026-10-31. The downloaded reference itself is not bundled.
- The original pose was generated through **Codex's built-in image generation tool**, using the official ghost as a reference and adding a detective cap, cape, teal scarf, notebook and ordinary magnifying glass. [Exact original prompt and provenance](art-prompts-kirolock.md).
- The full-body opening pose, `public/art/kirock-case-invitation.png`, was generated by Codex from that original pose. It replaces the notebook with a closed case folder and retains an ordinary magnifying glass. The transparent 960-pixel WebP derivative, `public/art/kirock-case-invitation.webp`, is used by the application. [Exact new prompt and provenance](detective-art.md).
- This is a project-specific **unofficial fan adaptation**, not an official Kiro mascot release or endorsement. The underlying Kiro character/reference is not claimed as an original project creation or relicensed as MIT.
- This artwork is not Kiro CLI output. Kiro's actual code contribution remains the separately recorded hypothesis-board implementation; see [development provenance](kiro-usage.md).
- Original pose SHA-256: `66622fa3f5cc4b7c45a840f101007bc5e89430a7309b4df96ca85ebf14f43d67`.

See [the attraction design](themepark-design.md) for the detective's invitation and case notebook, and [the Kirock branding record](kirock-design.md) for localized names. The [earlier branding record](kirolock-branding.md), original generation prompt and asset filename preserve their historical spelling.

## Fonts

The current interface uses locally bundled **Cormorant Garamond** (variable, weights 300–700) for literary Latin display text and **Nanum Myeongjo Regular** (weight 400) for Korean literary headings. Official testimony and small controls use readable system sans-serif with suitable script fallbacks. Font files and their original SIL Open Font License 1.1 notices are in `public/fonts/`. No font request leaves the application at runtime. Download sizes, SHA-256 hashes and verification details are in [font provenance](sherlock-fonts.md).

- Cormorant Garamond source: [Google Fonts / Cormorant Garamond](https://github.com/google/fonts/tree/main/ofl/cormorantgaramond)
- Nanum Myeongjo source: [Google Fonts / Nanum Myeongjo](https://github.com/google/fonts/tree/main/ofl/nanummyeongjo)

**Jua Regular** and **Gaegu Regular** and their licenses are retained as earlier assets. They are no longer the current interface's selected fonts.

- Jua source: [Google Fonts / Jua](https://github.com/google/fonts/tree/main/ofl/jua)
- Gaegu source: [Google Fonts / Gaegu](https://github.com/google/fonts/tree/main/ofl/gaegu)
- All four families were retrieved from the official Google Fonts repository on 2026-10-31. These fonts retain their separate OFL terms and are not relicensed as MIT.

## External real-photo QA fixtures

`tests/fixtures/photos/dark-desk.jpg` (Efnan Yılmaz) and `work-desk.jpg` (Jep Gambardella) are Pexels-licensed public stock used for actual upload/casting/gameplay verification and the local review recording. They are not personal player photos. [Exact photo pages and license](../tests/fixtures/photos/README.md). Their Pexels license is separate from the source-code MIT grant.
