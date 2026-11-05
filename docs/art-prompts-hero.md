# Generated hero mascot — provenance

Generated on 2026-10-31 (Asia/Seoul) with the built-in `image_gen` tool through Codex. No CLI, external API key, or Kiro execution was used. This is original generated decorative game artwork, not the user's room photograph and not evidence about any game's culprit.

## Final asset

- File: `public/art/suspect-trio.png`
- Selected output: the second built-in result, following one targeted cutout/framing refinement of the first result.
- Format: PNG, 1536 × 1024, four RGBA channels. Generated alpha was copied without alteration.
- SHA-256: `be63157d229c864a02d880bfc0a9f220833f3160fa754340e36ed403c983edb1`.
- Characters: exactly three anthropomorphic objects — cream mug, teal desk lamp, plum keyboard — plus one inert miniature magnifying glass.
- Visual inspection: complete recognizable objects, expressive eyes and mouths, tactile clay/gouache finish, no humans, no text or key lettering, no badge or logo. Expressions are decorative and are not mapped to the game's solution.
- Alpha verification: 827,195 pixels have alpha 0. The visible alpha bounds at threshold >16 are x=24…1515, y=21…970. The output has clear transparent edges, but its minimum framing margin is around 20 pixels; keep additional layout padding when it is used in the UI.
- The underlying generated PNG contains color values in transparent pixels. The alpha channel is genuine; display with alpha compositing rather than flattening the RGB channels.

## Initial generation prompt

```text
Use case: stylized-concept
Asset type: transparent raster hero mascot cutout for the web detective-comedy game Room of Suspects.
Primary request: Exactly three living everyday objects quietly arguing around one tiny detective magnifying glass: a cream ceramic mug with little worried eyes, a teal desk lamp giving a curious side-eye, and a plum keyboard with a grumpy expression. Give all three large expressive eyes and small expressive mouths. No one should look like the guilty party; they are equally charming, funny suspects.
Scene/backdrop: Fully transparent background with genuine alpha, isolated complete trio. The tiny magnifier is an inert prop, with no face. No tabletop slab or room background.
Style/medium: Premium handcrafted stop-motion clay characters with illustrated gouache surface details, sophisticated playful cozy mystery, tactile storybook board-game artwork. Appealing chunky silhouettes, softly irregular handmade surfaces, deep warm outlines; charming, not glossy plastic.
Composition/framing: Wide horizontal group, roughly 3:2 landscape canvas. All three objects complete and recognizable, gathered closely but each face readable, no cropping of lamp, mug handle, or keyboard. Generous transparent padding around every edge. The tall desk lamp bends gently over the other two; the mug and keyboard form a broad stable base.
Lighting/mood: Soft warm light from upper left, quiet playful disagreement, no fear or horror. Soft contact shadows limited to the objects, with transparent surrounding space.
Color palette: ink #182631, mint #9bcbbd, paper #f2dfb8, orange #ef8248, plum #70627a.
Text: None.
Constraints: Exactly three anthropomorphic object characters; no humans, no extra characters, no lettering on keyboard keys, no text, no badges, no logo, no watermark, no crime clues, no arrows or labels. Keep every character fully inside the frame. Genuine transparent background.
```

## Targeted refinement prompt

The first generated PNG was visually inspected and supplied as the edit target. `transparent_background: true` was used for both calls.

```text
Use case: precise-object-edit
Edit target: the provided three-object clay/gouache hero mascot.
Change only the framing and cutout background: keep the same cream mug, teal desk lamp, plum keyboard, tiny inert magnifying glass, facial expressions, colors, texture, pose and lighting. Preserve exactly these three characters.
Make the group about 80 percent of the canvas width and height so there is generous genuinely transparent padding on every side. Remove all smoky colored halos, hazy background illumination and floor/backdrop outside the objects. Keep clean anti-aliased object edges and only very small soft contact shadows immediately underneath. The canvas must have genuine transparent alpha with no background at all.
Keep a landscape 3:2 composition, all objects fully visible. No new objects, text, letters, badges or logo.
```

Only the selected final asset is included in the project. Source photographs and the face-overlay gameplay remain separate; no existing photo or game code was changed by this asset task.

