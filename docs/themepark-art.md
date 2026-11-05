# Detective attraction assets

Created 2026-11-04 by Codex using the built-in `image_gen.imagegen` tool. Three separate generation calls; no external API key or CLI fallback. All imagery was inspected in the tool result before integration. The street has a quiet dark center and warm gaslights; both button assets have blank centers and transparent surrounds. Neither contains real eyes or embedded UI labels.

Saved masters: `public/art/attraction-street.png`, `attraction-brass.png`, `attraction-ticket.png`. WebP derivatives with the same stems are used by the application. Sharp resized the street to at most 1672px and the controls to 1100px, with WebP quality 88 and alpha quality 100. PNG masters and existing character assets are preserved. All labels remain live translated text, with functional HTML buttons above the material artwork.

Provider files, in generation order by role:
- Street: `/Users/kyumin/.codex/generated_images/01a1906c-1790-7ff3-8f7e-48d997db6c8e/exec-1d94b363-671d-4dfe-b764-4654bb430b45.png`
- Brass: `/Users/kyumin/.codex/generated_images/01a1906c-1790-7ff3-8f7e-48d997db6c8e/exec-43a7ab7b-4c69-47f1-8736-57f83a77ca08.png`
- Ticket: `/Users/kyumin/.codex/generated_images/01a1906c-1790-7ff3-8f7e-48d997db6c8e/exec-c2ef3144-0296-4fd0-bd27-87b00e6dddf2.png`

## Exact prompts

### street

Transparent background: false.

Use case: stylized-concept. Asset type: a wide 16:9 background plate for a premium, playful Sherlock Holmes detective theme-park browser game called Kirock Homes. Render a beautifully crafted miniature Baker Street frontage at blue hour, like an exquisite stop-motion storybook set. One deep bottle-green paneled detective office door, handsome brass hardware, warm amber gaslights, brick and carved dark wood, a little soft London mist and wet cobblestone reflections. Front-facing theatrical composition, architecture framing the far left and far right, central 65 percent quiet dark painted door/wall with low contrast so live game UI can sit legibly over it. Gas lamps at outer sides create a welcoming pool of light. Detailed but disciplined craftsmanship, softly tactile materials, rich midnight blue, forest green and antique brass, cozy mystery, warm humorous family detective adventure, not horror. No characters, no furniture still-life, no skulls, no eyes, no letters, no signs, no text, no logo, no UI, no buttons. Avoid a busy room interior, steampunk gears, high contrast details in the middle, excessive fog, muddy blur. Crisp architectural edges, subtle depth and realistic miniature lighting.

### brass

Transparent background: true.

Use case: product-mockup. Asset type: one blank horizontal brass doorplate to serve as an interactive button skin for a Sherlock Holmes detective theme-park game. Wide 4:1 overall aspect ratio, straight-on orthographic view. A beautifully crafted warm antique brass plate, gently arched/chamfered ends, restrained engraved double-line border, two small recessed screw heads near the far left and far right, shallow raised bevel, tiny authentic brushed-metal grain. Large smooth empty center with even pale-gold illumination for live dark text and an icon. Luxurious welcoming miniature prop, softly tactile, rich aged gold, not grungy. Exactly one plate, isolated with true transparent alpha outside the complete silhouette, generous minimal transparent margin. No cast floor, no environment, no letters or numbers, no symbols, no text, no badge, no ornaments in the center, no watermark. Do not create an entire app mockup or multiple assets.

### ticket

Transparent background: true.

Use case: product-mockup. Asset type: one blank horizontal ivory admission/evidence ticket button skin for a Sherlock Holmes detective theme-park game. Wide 4:1 overall aspect ratio. Straight-on orthographic view. Thick warm ivory cotton paper, finely pressed ochre/brown double-line border, subtle paper fibers, tiny pin perforations near the short ends, small clean semicircle notches at the midpoint of the left and right short edges. Narrow empty tear-off stub delineated by a very fine vertical perforation line near the right end. Broad absolutely blank light center for live dark text and a camera icon. Premium theatrical ticket, antique stationery, lightly aged warm cream, crisp and charming, never dirty or stained. Exactly one ticket fully visible isolated on true transparent alpha background. No letters, no numbers, no words, no illustrations, no stamps, no handwritten marks, no surrounding scene, no UI, no multiple tickets. Flat diffuse even lighting.

These raster images are Codex output, not Kiro output. The separate decorative SVG prop component was implemented in an actual Kiro CLI run; see the development provenance.
