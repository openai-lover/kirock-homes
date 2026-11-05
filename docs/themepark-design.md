# The door to Kirock's detective attraction

2026-11-04, Asia/Seoul. The user explicitly asks for Sherlock-Holmes-theme-park detail in every button and interaction. The previous flat teal composition reads as a web page with a mascot, not a place to enter. Preserve readable evidence and the actual photograph while making the surrounding world tactile.

## Plan before implementation

Palette: midnight street `#101d25`, painted door `#1e393d`, antique brass `#cda563`, amber light `#f5ce81`, ticket ivory `#f5e9ce`, seal burgundy `#803e39`. Cormorant display type supplies an engraved storybook voice; system sans remains for evidence and controls. No lettering is baked into button bitmaps: all ten languages remain accessible live text.

Composition: a wide, softly lit miniature Baker Street entrance surrounds a clearly separated central game surface. The detective and title introduce the attraction; an actual photograph hangs in a case frame. Sample entry is a raised brass doorplate with a bell; uploading uses a perforated evidence ticket with a camera. Smaller buttons have consistent hardware, not random embellishments.

```
     gaslight       agency crest / utility dials        gaslight
          engraved title       detective        hanging case file
          invitation + premise                  actual photograph
          brass bell / sample                   numbered suspect tabs
          photo evidence ticket                 comic response
                    three investigation stages

     inside the case: scene photograph | clipped investigation notebook
                 witness slips → pinned comparison → hypothesis cards
```

The opening uses the same street and door vocabulary. Interactions should feel physical: press depression, a short bell swing on hover/focus, a selected brass tab, a heard mark and an objection seal. The motion-reduction preference disables decorative movement. Utility controls remain named and at least 44px high. Faces, colors and effects never depend on guilt before a verdict.

## Critique and scope

An ornate wallpaper behind every sentence would repeat the rejected Victorian clutter. Concentrate the illustrative environment at entry, place body text on predictable dark or paper surfaces, and use hardware to communicate actions and state. Every button family receives an intentional treatment, including settings, preview, testimony, confrontation, deduction, photo editing, verdict and sharing. A single generated scene plus two blank material assets creates a coherent family; decorative SVG props stay crisp and labels remain editable.

The mystery engine, shared snapshots, expiry/deletion and runtime AI contract do not change. Kiro development usage is distinct from player authentication and from the optional vision API. New art and overall integration are Codex work; any new Kiro source is attributed only after its real run and output are observed.
