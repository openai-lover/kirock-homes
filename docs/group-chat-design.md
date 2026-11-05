# Kirock's room chat — 2026-11-05

The user's new direction is an approachable group conversation: explanation first, one step at a time, free typed questions, contextual character objections, and a stable fair mystery. The photograph and faces must remain central. The Story comic should show real-looking objects with graphic expressions, making the photo augmentation clear.

## Plan and critique before code

Palette: chat canvas #edf1ee, ink #223b3c, detective teal #285d60, player green #d7edce, evidence amber #e6b65d, stage navy #14242c. System sans for chat, the existing Cormorant only for the brand and chapter moments. Speaker names, avatars and distinct bubble alignment establish identity without another dashboard.

```
 Kirock + three participants       [room photo] [case notes]
 ┌──────────────────────────────────────────────────────────┐
 │ Kirock: Welcome. Here's what happened…                    │
 │                              [Listen to the first object]│
 │ Cup: my authored statement…                              │
 │ You: Lamp, that isn't what the cup said.                  │
 │ Lamp: a response grounded in its fixed claim…             │
 │ Keyboard: a contextual objection…                        │
 ├──────────────────────────────────────────────────────────┤
 │ @Everyone   Ask the room…                         [send] │
 └──────────────────────────────────────────────────────────┘
```

On desktop a restrained real-photo area sits beside one chat column; on phones the photo is a compact collapsible header. Remove the always-visible evidence grid, cross-examination panel, hypothesis board and accusation controls from the default flow. Keep a small case-notes disclosure for exact statements and a deliberate final accusation after evidence is read. Original photo casting, privacy consent, sharing and server verdicts continue to operate.

Critique: a chat wallpaper alone would not simplify the current game. The interaction itself must become sequential. No simultaneous panels asking the user to listen, compare, pin, eliminate and accuse. Replies should be conversational and respond to intent, while official evidence stays visually identifiable and exact. Do not manufacture a live camera feature: the comic demonstrates a photo with face overlays. Keep previous artwork as historical source.

## Fixed-world conversation contract

Kiro receives public character roles, exact statements and recent conversation, never private resolution fields or photographs. It interprets the question and selects an allowed dialogue act and participants. Code renders canonical evidence and authored rebuttals, ensuring no generated fourth clue, invented alibi, changed answer or premature confession. Free questions and history can change the conversational branch; they cannot rewrite the case. The UI must disclose whether a turn actually used Kiro or the local authored fallback. No runtime AI key is needed for fallback play.

The local Kiro adapter uses the authenticated CLI's V2 headless interface, an isolated work directory, a tool-free agent, no shell interpolation, bounded output and timeout, and persistent request caps. Its runtime prompt only contains the active game conversation. A configured compatible HTTP adapter can replace it. Shared cases are loaded from the server's immutable public snapshot; chat never accepts private case fields as shared evidence.

The current simple logical family is retained for existing shares. A subtler new family must only be enabled after exhaustively verifying all six worlds, unique solution, three-statement necessity, role permutations and explanations. A softer wording alone must not change a statement's meaning.

## Attribution and verification

Codex owns integration, design and art. A real scoped Kiro run will own the new pure routing validator and its tests if it succeeds; logs and hashes will distinguish this from Codex work. A login check is not runtime dialogue evidence. Live dialogue will be claimed only after a real request returns and is validated. UI checks must cover keyboard, ten languages, small/rotated viewports, timeout/invalid outputs, sharing integrity and both verdict paths.

## Final photo direction and implementation

The user rejected the four-panel format during implementation. The live Story screen now uses the existing **real sample photograph**, full frame with a camera-style shutter. Pressing it starts the actual case using the same photo and face coordinates. No generated photo-comic is shipped as current UI. It does not imply live camera or spatial tracking.

New cases use versioned conditional alibis (v2). A states fact F; B says `not F -> culprit A`; C says `culprit C -> F`. The unique solution is culprit A and not F. Both old v1 and v2 retain all six-world/necessity checks, both story settings, fixed subjects and immutable old shares. The current UI reveals one message stage at a time and requires one question after all three statements before a separate accusation confirmation. Additional questions remain available.

Desktop critique: retained the actual photograph as the strongest visual; removed stacked notebook panels, cards and progress decorations. Mobile critique: a full portrait photo was too small as a strip, so its simple expand control opens the original coordinate plane at readable size. The composer remains visible in the compact view. All faces remain flat SVG overlays; nothing in their pre-verdict expression uses the solution.
