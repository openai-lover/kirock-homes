# A playful mystery in a paperback

2026-10-31. The user rejected the visually crowded Victorian-room treatment and asked for a clean, inviting detective-novel feeling. This replaces that direction throughout the opening, homepage and playable investigation.

## Design plan before implementation

Palette: book paper `#f6f3ed`, blue-black ink `#202d37`, oxblood `#9b383c`, secondary slate `#667077`, clean white `#ffffff`, quiet rule `#d8d9d7`. Warm paper is a literal reading surface for this brief, not simulated antique parchment. No room photograph, wallpaper, gold ornament, leather, scratches or nested decorative frames.

Typography: retain bundled Cormorant Garamond for the book title and spoken lines, Nanum Myeongjo for Korean literary text, and the existing system sans-serif for actions and explanatory UI. Use ordinary sentence case, readable controls and approximately 60-character reading widths. The title's two words share the same weight and alignment, rather than italicizing one as an accent.

```
Opening:   quiet paper / large title       arriving ghost detective
           one caption                    nothing behind the character

Home:      title + short premise          the real photograph
           sample / own photo             a restrained book-cover mount
           replay
           a light three-step reading guide

Case:      case title + progress
           original photograph            readable statements / dialogue
           live caption                   one active reading column
```

Alignment is left/start aligned. Mobile stacks photograph and reading column; the photo's original coordinate plane stays intact. Only the character arrival is an automatic visual flourish. Buttons remain semantic HTML, with a visible focus state and 44px minimum touch height.

## Critique against the brief

A faux old newspaper, dense rules, tiny uppercase metadata and a large burgundy seal would reproduce the rejected clutter. Avoid them. Keep the case progression because it communicates actual steps, but remove redundant case badges and floating file tabs. Reserve oxblood for the main action, the active statement and an objection; use spacing rather than repeated boxes to structure reading. The original photo and comic object faces provide the distinctive game identity.

The latest full-screen entrance is retained, but now resembles a title page instead of a furnished room. Existing artwork is reused; the large Victorian scene is no longer loaded by the UI. This restyling is Codex work. Existing Kiro-authored modules retain their attribution; official evidence and adjudication remain unchanged.
