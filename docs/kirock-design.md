# Kirock Homes — household detective agency

2026-10-31. User-approved English name: **Kirock Homes**. Korean localization: **킬록 홈즈**. The prior Kirolock spelling remains only in historical evidence and the original asset filename.

## Direction before implementation

Keep the recognizable white ghost detective, but give the whole game the voice of a small household detective agency. The photo and its three object faces remain the actual case scene. Kirock is the player's guide outside that photo, never a fourth suspect.

- Palette: ink `#182631`, deep teal `#173c3c`, parchment `#f2dfb8`, brass `#cba76b`, mint scarf `#9bcbbd`, warm case-tab accent `#ef8248`.
- Type: a classic Georgia wordmark for English, friendly Jua for Korean, readable system text for rules and evidence, Gaegu only for short handwritten asides.
- Landing: compact title and detective portrait share the left column; the real photograph occupies the right. Below the start actions, one handwritten character line and a three-step investigation guide clarify the interaction.
- Game: evidence cards read as filed witness statements, phase tabs identify the current task, and a small Kiro-authored notebook aside gives a short, neutral instruction at each stage.
- Voice: dry, friendly domestic comedy. No gore, death, threatening cop language, fake evidence, or implicit guilt. Clear actions take priority over jokes.
- International behavior: English server-rendered copy; Korean browser language selects Korean; an explicit language choice persists and takes precedence. No network language detection.

```text
brand                                      sound / motion / language

small agency line                    ┌ original photo + faces ┐
Kirock       [ghost detective]        │                        │
Homes                                └ caption                ┘
Room of Suspects                     field note
one-sentence premise
sample / upload
short handwritten line

1 Wake three objects    2 Compare their stories    3 Make your call
```

## Review against the brief

The previous layout put the new mascot below a large empty title area; the title changed, but the game still felt like the earlier anonymous desk. Move the detective into the opening composition and carry his notebook voice through casting, testimony, confrontation, deduction and closure. Keep photographic faces and immutable official evidence unchanged. Existing generated button materials and scene props remain because they belong to this established game rather than adding another decorative set.

## Authorship boundary

Codex owns name/locale integration, layout and styling. Actual authenticated Kiro owns the new `DetectiveAside` component, its deterministic UI voice data and its new specification files. Those files take only phase and locale, with no answer or suspect input. Kiro usage and credits are documented separately from the game’s optional runtime AI provider.
