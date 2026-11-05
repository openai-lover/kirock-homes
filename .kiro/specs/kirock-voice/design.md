# Kirock Voice — Design

**Spec authored by Kiro (2026-10-31). Revised 2026-10-31 to match final implementation.**

---

## Overview

The Detective Aside is the smallest possible integration point between the game's
stage system and the Kirock Homes mascot image. It is a stateless, presentational
component that always renders the same output for the same `(stage, locale)` pair.

Implementation files were written first in this CLI session. These design notes were
written afterward to reflect what was actually built and reviewed. This is not a
spec-first native IDE workflow.

---

## Module: `src/lib/ui/detective-voice.ts`

### Responsibility

Owns all localized copy and the accessor that maps `(DetectiveStage, Locale)` to
`StageCopy`. Has no knowledge of React, the DOM, or any game data beyond the stage
name and locale.

### Exported surface

```ts
// The six investigative stages
export type DetectiveStage =
  | 'casting'
  | 'awakening'
  | 'listening'
  | 'confronting'
  | 'deducing'
  | 'reveal';

// The copy returned for one (stage, locale) pair.
// Readonly prevents consumers from mutating shared static objects.
export type StageCopy = Readonly<{ line: string }>;

// Deterministic accessor — same inputs always return the same StageCopy object.
export function getDetectiveVoice(stage: DetectiveStage, locale: Locale): StageCopy
```

### Internal structure

A `Record<DetectiveStage, { ko: StageCopy; en: StageCopy }>` constant (`VOICE_COPY`)
holds all twelve lines. `getDetectiveVoice` indexes into it directly; no branching
beyond the locale check. TypeScript's exhaustiveness over the `Record` keys guarantees
at compile time that every stage is present in both locales.

`StageCopy` is `Readonly<{…}>` rather than a plain object type. This prevents
accidental mutation of the shared static dictionary — e.g. `copy.line = 'foo'` is a
compile-time error. No mirror tests are needed to verify this; the type system enforces it.

### Import constraints

Only a `type`-only import of `Locale` from `@/lib/game/types` is permitted. No
runtime import of any game module. No React, DOM, solver, case, or AI import.

---

## Component: `src/components/DetectiveAside.tsx`

### Responsibility

Calls `getDetectiveVoice` with its `stage` and `locale` props, and renders a semantic
`<aside>` combining the mascot image and the resulting copy. All layout and visual
treatment is left to Codex's CSS.

### `'use client'` directive

The component is marked `'use client'` because it will be rendered inside `Game.tsx`,
which is a Client Component. Per Next.js guidance, the directive is placed at the
lowest boundary that needs it; it does not add behavior here since the component has
no state or browser API calls. Codex could pass it as a Server Component child if the
architecture later changes.

### DOM structure

```
<aside .detective-aside
       data-testid="detective-aside"
       data-stage="{stage}"
       aria-label="{localized notebook title}">

  <img .detective-aside-mascot
       src="/art/kirolock-homes.png"
       alt=""
       aria-hidden="true"
       width="72" height="72"
       decoding="async" />

  <div .detective-aside-copy>
    <strong .detective-aside-title>{heading}</strong>
    <p     .detective-aside-line>{copy.line}</p>
  </div>

</aside>
```

`<strong>` is used for the notebook title rather than a heading element. This keeps
the document outline entirely under Codex's control: heading levels in `Game.tsx` are
set by Codex, and inserting a heading from inside `DetectiveAside` would require
coordination on every future layout change. The `aria-label` on the `<aside>` already
provides the accessible region name for assistive technology.

### Accessibility

| Concern | Decision |
|---|---|
| Mascot image | `alt=""` + `aria-hidden="true"` — purely decorative |
| `<aside>` region label | `aria-label` = localized notebook title string |
| Layout shift (CLS) | `width={72}` `height={72}` on `<img>` |
| Async decode | `decoding="async"` — does not block paint |
| Live region | None — stage changes are player-driven navigations |
| Inline styles | None beyond the two img sizing attributes |

### `data-stage` attribute

`data-stage={stage}` on the `<aside>` lets a Playwright test (or manual browser
inspection) confirm which stage is active without parsing copy text. Codex's e2e suite
can assert `[data-stage="listening"]` is present when the appropriate game phase is
reached.

---

## Final twelve stage lines

| Stage | EN | KO |
|---|---|---|
| casting | Pick three objects and place their faces. Every good case starts with a proper suspect list. | 사진 속 물건 셋을 골라 눈을 붙여 주세요. 탐정의 첫 번째 임무는 용의자 확보입니다. |
| awakening | Give them a moment. Waking up is hard enough without being immediately questioned. | 방이 깨어나는 중입니다. 아직 아무것도 할 필요 없어요 — 지켜만 보세요. |
| listening | Hear all three official statements. Those three statements are the only evidence in this case. | 세 물건의 공식 증언을 모두 들어 주세요. 이 세 마디가 이번 사건의 증거 전부입니다. |
| confronting | Question each object — another will object. Compare the two quoted statements side by side and note what you find. | 각 물건을 추궁하면 다른 물건이 반론합니다. 두 인용문을 나란히 놓고 직접 메모해 두세요. |
| deducing | Cross out hypotheses that don't fit — tap again to restore any. Your accusation is one-time only, so take your time. | 맞지 않는 가설을 눌러 지우고, 다시 누르면 되살릴 수 있어요. 지목은 딱 한 번이니 신중하게. |
| reveal | Case closed. Read the explanation to see how the three statements fit together. | 사건이 마무리됐습니다. 해설을 읽으면 세 증언이 어떻게 이어지는지 확인할 수 있어요. |

---

## Relationship to existing Kiro work

The prior Kiro hypothesis board (`hypothesis.ts`, `HypothesisBoard.tsx`) is
unchanged. `DetectiveAside` does not import from it, depend on it, or alter its
behavior in any way.

---

## Relationship to Codex work

Codex owns:
- All CSS (class names are defined here; styling is not)
- `Game.tsx` integration (passing `stage` and `locale` props to `<DetectiveAside>`)
- Any responsive layout that positions the aside relative to other panels

No Codex-owned file is modified by this feature's implementation files.

---

## Stage-to-Game-phase mapping (informational, for Codex integration)

Codex's `Game.tsx` uses `Phase` (`'start' | 'casting' | 'awakening' | 'investigating' |
'resolving' | 'reveal'`). The mapping to `DetectiveStage` is Codex's decision; the
natural correspondence is:

| Game `Phase` | Suggested `DetectiveStage` |
|---|---|
| `casting` | `'casting'` |
| `awakening` | `'awakening'` |
| `investigating` (not all statements heard) | `'listening'` |
| `investigating` (cross-examination active) | `'confronting'` |
| `investigating` (deduction/accusation ready) | `'deducing'` |
| `resolving` | `'deducing'` (no change until verdict lands) |
| `reveal` | `'reveal'` |

This mapping is informational only; Codex decides the exact wiring.
