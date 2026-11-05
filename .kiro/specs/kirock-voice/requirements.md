# Kirock Voice — Requirements

**Spec authored by Kiro (2026-10-31). Revised 2026-10-31 to match final implementation.**

---

## Attribution

The inherited application (engine, `Game.tsx`, CSS, server routes, `CrossExamination.tsx`,
sample content, images) is **Codex** work. The prior hypothesis board
(`hypothesis.ts`, `HypothesisBoard.tsx`, `.kiro/specs/detective-hypotheses/`) is prior
**Kiro CLI** work. This spec and its two owned implementation files are new **Kiro** work.

Implementation files were written first in this CLI session, then these specs were
written to match them. This is not a spec-first native IDE workflow. Do not claim it
as one in commit messages or submissions.

Do not attribute Codex or prior Kiro work to this feature, or vice versa.

---

## Scope

This feature adds a small, stateless guidance panel — the **Detective Aside** — that
shows the player a short, stage-contextual hint from Kirock Homes as they move through
the investigation. It is authored by Kiro and integrated into `Game.tsx` by Codex.

The feature consists of exactly **two new implementation files**:

| File | Owner |
|---|---|
| `src/lib/ui/detective-voice.ts` | Kiro |
| `src/components/DetectiveAside.tsx` | Kiro |

---

## Requirements

### R1 — Stage type

The module `src/lib/ui/detective-voice.ts` must export a `DetectiveStage` type with
exactly these six literal members:

```
'casting' | 'awakening' | 'listening' | 'confronting' | 'deducing' | 'reveal'
```

No other members may be added or removed without revising this spec.

### R2 — Copy dictionary

The module must contain localized guidance copy for every combination of
`(DetectiveStage × Locale)` — twelve lines in total. Each line must:

- Be a short instruction, ≤ ~25 English words.
- Use idiomatic English with dry, warm, domestic-detective humor (EN).
- Use natural Korean localization — not a word-for-word translation (KO).
- Remain appropriate for a cozy family game: no death, threats, gore, or
  menacing undertone.
- Avoid inventing evidence, motives, facial tells, suspect guilt, or
  result-specific reactions.

Additional per-stage copy constraints:

- **listening**: must clearly state that the three official statements are the
  only evidence, using grammatically correct idiomatic English.
- **confronting**: must explain that questioning an object causes another object
  to object; must direct the player to compare the two quoted official statements
  side by side and note findings. Must not use the phrase "Pin the gap" or imply
  every exchange proves a contradiction.
- **deducing**: must explain that hypotheses can be crossed out and restored by
  tapping again, and that the final accusation is once only. Must not imply the
  player already knows the answer or that one remaining hypothesis is automatically
  correct.
- **reveal**: must be worded identically regardless of whether the player's
  accusation was right or wrong. Must not reference success, failure, or a
  particular culprit.

### R3 — Deterministic accessor

The module must export a function `getDetectiveVoice(stage, locale)` that returns
the `StageCopy` for that pair. The function must be deterministic: the same inputs
always return the same output. No randomness, no network I/O, no side effects.

### R4 — Readonly StageCopy

`StageCopy` must be declared with `Readonly<{…}>` so consumers cannot accidentally
mutate the shared static copy objects returned by `getDetectiveVoice`.

### R5 — No forbidden dependencies in the voice module

`src/lib/ui/detective-voice.ts` must not import:

- React or any DOM API
- Solver, generator, or renderer modules
- Case draft, role assignment, answer, or suspect data
- Server-only modules, AI modules, or storage modules

A `type`-only import of `Locale` from `@/lib/game/types` is permitted.

### R6 — Component prop contract

`src/components/DetectiveAside.tsx` must export:

- A default export `DetectiveAside` with exactly these required props:
  `{ stage: DetectiveStage; locale: Locale }`
- A named `export type { DetectiveStage }` (re-exported from the voice module).
- A named export `DetectiveAsideProps` type.

No correct/incorrect, guilt, suspect identity, case data, statement content,
solver, or private-answer prop may be accepted.

### R7 — Component rendering contract

The component must render:

- An `<aside>` element with:
  - `className="detective-aside"`
  - `data-testid="detective-aside"`
  - `data-stage={stage}` (enables stage verification without parsing copy text)
  - `aria-label` set to the localized notebook title
- The mascot image `/art/kirolock-homes.png` with:
  - `className="detective-aside-mascot"`
  - `alt=""` (decorative)
  - `aria-hidden="true"`
  - `width={72}` and `height={72}` (prevents layout shift; historical filename kept)
  - `decoding="async"`
- A wrapper `<div className="detective-aside-copy">` containing:
  - A `<strong className="detective-aside-title">` with the localized notebook title:
    - English: `"Kirock's notebook"`
    - Korean: `"킬록의 수첩"`
  - A `<p className="detective-aside-line">` containing the stage copy line.

### R8 — No state, no network

`DetectiveAside` must hold no local state and make no network requests. It is a
pure function of its props.

### R9 — No forbidden component dependencies

`DetectiveAside` must not import:

- Server-only modules
- AI modules
- Solver, generator, renderer, or case-data modules
- Any module that exposes the culprit identity, role assignment, or verdict

### R10 — Live region restraint

The aside must not use `aria-live`, `role="status"`, or `role="alert"` unless
integration evidence shows a specific need. Stage changes are driven by deliberate
player navigation; a live region would announce unnecessarily.

### R11 — No inline styles that prevent responsive styling

The component sets only `width` and `height` on the `<img>` element. All other
layout and visual treatment is delegated to Codex's CSS via the class names in R7.

### R12 — Styling and integration are Codex's responsibility

Codex owns all CSS, the `game-invariants` steering scope, and `Game.tsx`. This spec
does not define colors, sizes, placement, or responsive breakpoints.

---

## Out of scope

- Codex-owned files (`Game.tsx`, CSS, existing components, server routes)
- Prior Kiro-owned files (`hypothesis.ts`, `HypothesisBoard.tsx`, related specs)
- Live AI copy generation during gameplay
- Animation, sound, or transition behavior
- Persistent storage of any kind
- Tests that simply repeat the copy dictionary
