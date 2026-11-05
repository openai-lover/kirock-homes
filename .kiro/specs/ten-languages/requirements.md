# Ten-Language Secondary UI — Requirements

**Feature:** Ten-language localization for the secondary UI layer of Kirock Homes.  
**Authored by:** Kiro (2026-10-31). Prior application code is Codex work; prior
hypothesis board and detective voice are prior Kiro CLI work. This spec and its
implementation files are new Kiro work in this session.

---

## Background

The root agent created `src/lib/i18n/locales.ts` with ten supported locales:
`en ko es fr de pt ja zh ar hi`. The main UI catalogue is implemented by the root
Codex agent. This feature implements the secondary UI catalogue covering
CrossExamination, HypothesisBoard, and DetectiveAside, and extends detective-voice.ts
from two locales (en, ko) to all ten.

---

## Scope

This feature modifies or creates exactly these files:

| File | Work |
|---|---|
| `src/lib/i18n/secondary-ui.ts` | New — ten-language static catalogue |
| `src/lib/ui/detective-voice.ts` | Extended — en+ko → all ten locales |
| `src/components/CrossExamination.tsx` | Updated — uses catalogue instead of inline `t(ko, en)` |
| `src/components/HypothesisBoard.tsx` | Updated — uses catalogue instead of inline `t(ko, en)` |
| `src/components/DetectiveAside.tsx` | Updated — heading from catalogue; voice from detective-voice.ts |
| `tests/secondary-i18n.test.ts` | New — completeness and safety tests |

No engine, server, game logic, CSS, or Codex-owned files are modified.

---

## Requirements

### REQ-1 Catalogue completeness

- **REQ-1.1** `src/lib/i18n/secondary-ui.ts` provides translations for all ten locales
  for every key in the `SecondaryUiKey` union: 17 CrossExamination keys, 9 HypothesisBoard
  keys, 1 DetectiveAside key.
- **REQ-1.2** No locale may be absent or have a missing/empty string for any required key.
- **REQ-1.3** The English catalogue is the authoritative template for placeholder parity.
  Every `{placeholder}` in an English template must also appear in the corresponding
  template for every other locale.

### REQ-2 Named placeholders

- **REQ-2.1** Dynamic values use only named placeholders: `{name}`, `{remaining}`, `{total}`.
- **REQ-2.2** Caller interpolation via `fill(template, vars)` produces a plain string.
  No HTML injection occurs regardless of the object name's content.
- **REQ-2.3** Unrecognized placeholder tokens are left intact in the output.

### REQ-3 Detective voice — ten locales

- **REQ-3.1** `detective-voice.ts` provides a non-empty `StageCopy.line` for every
  combination of six `DetectiveStage` values × ten locales (60 entries total).
- **REQ-3.2** Per-stage content constraints from the prior spec (kirock-voice) are
  preserved for en and ko; new locales follow the same constraints.
- **REQ-3.3** The `getDetectiveVoice(stage, locale)` accessor is deterministic: same
  inputs always produce the same output.

### REQ-4 Component localization correctness

- **REQ-4.1** CrossExamination, HypothesisBoard, and DetectiveAside use `t(locale, key)`
  and `fill(template, vars)` from `secondary-ui.ts`; they do not contain inline two-locale
  `t(ko, en)` patterns.
- **REQ-4.2** Component keys, state, and user-entered data (hypothesis eliminations,
  notebook selections) are stable across locale changes; no reset occurs on locale prop change.
- **REQ-4.3** Official testimony quotes from the snapshot pass through verbatim; they are
  never translated or stored in the catalogue.
- **REQ-4.4** The `cross-detective-label` key uses the brand name "Kirock Homes" in all
  locales where the original used that name.

### REQ-5 Safety

- **REQ-5.1** Mixed-script and hostile-looking object names (HTML entities, SQL fragments,
  recursive placeholder tokens) are rendered as plain strings without HTML parsing.
- **REQ-5.2** `secondary-ui.ts` imports only `Locale` from `@/lib/i18n/locales`. It does
  not import React, DOM APIs, solver, generator, renderer, server-only, or AI modules.
- **REQ-5.3** `detective-voice.ts` imports only `Locale` from `@/lib/i18n/locales`. No
  other forbidden imports are introduced.

### REQ-6 No solution leak

- **REQ-6.1** No key in the catalogue implies, names, or suggests a correct answer,
  culprit identity, or outcome-specific reaction.
- **REQ-6.2** `hyp-last-label` must not contain "correct", "answer", "culprit", "정답",
  or "범인" in any locale.
- **REQ-6.3** The detective guidance for the `reveal` stage is worded identically
  regardless of whether the accusation was correct.

### REQ-7 Tests

- **REQ-7.1** `tests/secondary-i18n.test.ts` uses `node:test` and `node:assert/strict`.
- **REQ-7.2** Tests cover: ten-locale presence, every key non-empty in every locale,
  placeholder parity against English, all six stages × ten locales produce non-empty lines,
  `fill()` with hostile object names as plain strings, `fill()` with numeric vars, and
  determinism of both `t()` and `getDetectiveVoice()`.
