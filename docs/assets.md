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

## The resident detective

Kirock is a human detective seen only from behind, wearing a deerstalker and high collar. A gloved hand passes a folded clue slip in the chat. Codex generated both transparent originals on November 24, 2026 using only text. The name plays on Kiro, Sherlock and the homes where the cases take place.

The masters are `public/art/detective-silhouette.png` and `public/art/detective-glove.png`. The opening, compact logo, chat and Crew icon use local derivatives. The verdict uses a separately generated red wax seal with a key impression, shown after either outcome. See the [generation prompts](detective-silhouette-art.md).

The old ghost-inspired artwork and four-panel atlas were retired on November 24. Dated development notes describe those earlier versions. The Kiro execution logs retain their original dates and authorship. The replacement art is Codex work.

## Scenes, materials and photo animation

The entrance uses generated gaslit street, brass and paper textures made by Codex. Buttons have live HTML labels. The living-photo story and its English and Korean GIFs show the licensed sample photograph with independent SVG faces and the gloved hand. Other preserved materials include the earlier Victorian study, blank button textures, an eye-free magnifier and the decorative object trio. See [scene and texture prompts](themepark-art.md), [the study](sherlock-art.md) and [the trio](art-prompts-hero.md).

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
