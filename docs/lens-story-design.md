# Magnifier opening and living-photo story — 2026-11-05

The brief is a detective's sweeping magnifier followed by an immediately understandable, funny moving story. Preserve the actual photograph and game; no comic panels, anatomical eyes, or extra landing-page text.

Palette: midnight desk #143139, warm paper #f4eedf, brass #e5b65c, lens reflection #bcdfe2, ink #182631. Use the existing Cormorant/Nanum Myeongjo title fonts and existing sans-serif controls. One large moving photograph is the hero. The magnifier is the only major opening effect; it reveals a brighter, enlarged portion of the same photograph before the detective enters. The story uses the actual sample photograph and the game's flat SVG faces. Speech is brief, localized, and positioned beside its speaker. Persistent pause/next and start controls remain outside the photograph.

Layout: full-screen opening; one vertical photograph centered in a quiet cinema frame for the story. The story changes over time, never into a grid. Mobile keeps the original photo coordinate plane, with title above and controls below. A playful mug/keyboard exchange demonstrates the premise, followed by a player question and the detective's handoff. This is illustrative banter, independent of any case or answer.

Review before implementation: avoid decorative Victorian clutter, four-card explainers, large blocks of onboarding copy, or a static poster passed off as animation. The generated-image tool was asked for GIF output but returned a PNG, so it is not a GPT-generated GIF. Use a deterministic photo/SVG sequence in the app and export that actual sequence as a GIF. Native GPT GIF output exists in the official API but this session's image tool exposes no output-format control. No new API key or paid provider was configured.

Accessibility: retain opening skip/Escape/focus restoration and reduced-motion bypass. Story opens paused under reduced motion, supports manual next/replay, pauses when hidden, keeps all exit/start controls keyboard accessible, and provides the same dialogue as text. Motion never signals a real culprit. Authorship of this revision: Codex; prior Kiro contributions remain unchanged.
