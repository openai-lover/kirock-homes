# Detective Hypothesis Board — Requirements

**Feature:** Manual six-world hypothesis scratchpad for Room of Suspects.  
**Author:** Kiro (2026-10-31). Inherited application code is Codex work; this feature is new Kiro work.

---

## Overview

Players reason by elimination. After examining cross-examination dialogue, they need a place to track
which of the six possible (culpritId × fact) worlds they have ruled out through their own deduction.
The board is a personal scratchpad — it never knows the answer, never evaluates the player's logic,
and never submits a verdict.

---

## Requirements

### REQ-1 Pure hypothesis builder (TypeScript, no UI)

- **REQ-1.1** `buildHypotheses(suspects, displayOrder)` accepts a `readonly Suspect[]` and a
  `readonly SuspectId[]` display order, and returns exactly six `Hypothesis` objects in a
  deterministic order: for each suspect in display order, `fact=false` then `fact=true`.
- **REQ-1.2** Each `Hypothesis` carries a stable `id` string derived solely from `culpritId` and
  `fact` (no randomness, no runtime state). The format is `<culpritId>-<fact>` (e.g. `"s0-false"`).
- **REQ-1.3** The builder must not mutate the input arrays or objects.
- **REQ-1.4** The builder has no dependency on DOM, React, Next.js, AI, storage, solver, or private
  answer data. It imports only from `./types`.
- **REQ-1.5** The module exports `buildHypotheses`, the `Hypothesis` type, and the `HypothesisId`
  type directly from `src/lib/game/hypothesis.ts`.

### REQ-2 HypothesisBoard component

- **REQ-2.1** Default export `HypothesisBoard` is a `'use client'` React component with exact props:
  ```ts
  { suspects: readonly Suspect[]; locale: Locale; factLabels: readonly [string, string] }
  ```
  `factLabels[0]` describes the `false` event; `factLabels[1]` describes the `true` event.
- **REQ-2.2** The component owns all eliminated-world state locally via `useState`. The parent never
  passes a case, solution, testimony, or solver instance.
- **REQ-2.3** Each of the six hypothesis cards is a `<button>` that toggles the card between
  `possible` and `eliminated`. When eliminated, `aria-pressed="true"` is set on the button.
- **REQ-2.4** Each card displays: the suspect's `displayName`, the matching fact label, and explicit
  visible text for the current state (`가능` / `제외됨` in Korean, `Possible` / `Eliminated` in
  English). Color alone must not be the only state indicator.
- **REQ-2.5** The component never reads from or writes to a backend, localStorage, or cookies.

### REQ-3 Counter, reset, and edge-case labels

- **REQ-3.1** A localized reset button (data-testid `hypothesis-reset`) restores all six cards to
  `possible`. Its label is `가설 초기화` (Korean) / `Reset hypotheses` (English).
- **REQ-3.2** The component displays a remaining-count line, e.g. `남은 가설: 4 / 6` / `Remaining: 4 / 6`.
- **REQ-3.3** When exactly one card remains possible, that card gets an additional label
  `내가 남긴 가설` (Korean) / `My remaining theory` (English). The board must never assert that
  a player-selected theory is verified correct or that it identifies the culprit. Specifically,
  the last-card label must not claim `정답` (correct answer), imply `정답이에요`, or use any
  phrasing that presents the remaining theory as a confirmed truth rather than the player's own
  working hypothesis.
- **REQ-3.4** When zero cards remain possible, the component shows an explanatory message inviting
  the player to restore cards using the reset button. It must not say "you are wrong" or anything
  equivalent.

### REQ-4 CSS hooks and test IDs

- **REQ-4.1** Outer wrapper element has `className="hypothesis-board"` and
  `data-testid="hypothesis-board"`.
- **REQ-4.2** The grid container has `className="hypothesis-grid"`.
- **REQ-4.3** Each card `<button>` has `className="hypothesis-card"` and
  `data-testid="hypothesis-card-<stableId>"` (e.g. `hypothesis-card-s0-false`).
- **REQ-4.4** The reset button has `data-testid="hypothesis-reset"`.
- **REQ-4.5** No inline styles that would override Codex CSS. No new CSS files introduced.

### REQ-5 Localization

- **REQ-5.1** All UI labels exist in Korean (`ko`) and English (`en`).
- **REQ-5.2** The component selects language via the `locale` prop. No other i18n mechanism is used.
- **REQ-5.3** `factLabels` come from the parent (derived from `publicSnapshot`) and are displayed
  verbatim; the component does not fabricate event descriptions.

### REQ-6 Game invariant compliance

- **REQ-6.1** The board never eliminates any hypothesis automatically.
- **REQ-6.2** The board never shows which hypothesis is correct.
- **REQ-6.3** The board is not a verdict submission mechanism.
- **REQ-6.4** The board adds no new evidence or factual claims beyond the labels supplied by the parent.

### REQ-7 Tests

- **REQ-7.1** `tests/hypothesis.test.ts` uses `node:test` and `node:assert/strict`.
- **REQ-7.2** Tests cover: all six suspect-ID permutations produce six hypotheses; ordering matches
  display order with false-before-true per suspect; all six IDs are unique per run; IDs are stable
  independent of display order; frozen input arrays and objects are not mutated.
- **REQ-7.3** No tests for invalid inputs (validation is upstream).
- **REQ-7.4** A source-level check may confirm `hypothesis.ts` does not import solver or private
  answer modules.
