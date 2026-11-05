# Ten-Language Secondary UI — Design

**Authored by:** Kiro (2026-10-31).

---

## Architecture overview

```
src/lib/i18n/locales.ts          (root agent — Locale type, SUPPORTED_LOCALES)
       |
       v
src/lib/i18n/secondary-ui.ts     (Kiro — catalogue, t(), fill())
src/lib/ui/detective-voice.ts    (Kiro — stage copy, getDetectiveVoice())
       |
       v
src/components/CrossExamination.tsx   (Kiro localization layer over Codex logic)
src/components/HypothesisBoard.tsx    (Kiro)
src/components/DetectiveAside.tsx     (Kiro)
```

Codex owns Game.tsx, CSS, the engine, server routes, and the main UI catalogue.
This feature strictly affects the secondary UI layer.

---

## secondary-ui.ts

### Key design decisions

**Single-file static catalogue.** All ten locales are inlined in one file as a plain
`Record<Locale, Catalogue>` object literal. There is no runtime loading, no external
translation API, and no dynamic imports. This matches the project pattern established
by the game content catalogues.

**Named placeholders.** Dynamic values use `{name}`, `{remaining}`, `{total}` tokens.
The `fill(template, vars)` function substitutes them via a simple regex replace — never
`innerHTML`. Object names from the player's photo session may contain any script or
special characters; treating them as plain strings prevents XSS.

**Double-quoted strings throughout.** The catalogue uses double-quoted string literals
so that apostrophes in French (`c'est`, `n'ajoute`), English (`doesn't`, `it's`), and
other locales do not terminate the string literal.

**`SecondaryUiKey` union type.** All 27 keys are typed as a union, preventing typos at
call sites and enabling exhaustiveness checks.

**`t(locale, key)` returns the raw template string.** Callers apply `fill()` when
substitution is needed, or render the result directly when no placeholders are present.

### Key inventory

| Prefix | Component | Count |
|---|---|---|
| `cross-*` | CrossExamination | 17 |
| `hyp-*` | HypothesisBoard | 9 |
| `aside-*` | DetectiveAside | 1 |

Total: 27 keys × 10 locales = 270 strings.

---

## detective-voice.ts

The existing structure (`Record<DetectiveStage, BilingualStageCopy>`) is replaced with
`Record<DetectiveStage, Record<Locale, StageCopy>>`. This keeps the same export shape
and accessor function, making it a non-breaking extension for any existing callers.

Each of the six stages now has ten copy lines. The per-stage content constraints from
the kirock-voice spec are preserved for en and ko, and applied analogously to the eight
new locales.

---

## Component changes

### CrossExamination.tsx

- The inline `ko = locale === 'ko'` / `t = (a, b) => ko ? a : b` pattern is removed.
- All static strings are replaced with `t(locale, key)` calls.
- Dynamic strings use `fill(t(locale, key), { name, remaining, total })`.
- No game logic, routing, or snapshot-access code is changed.
- Component keys are unchanged (suspect IDs), so state persists across locale changes.
- Official testimony (`route.challenge`, `route.rebuttal`, statement text) passes through
  from the snapshot without modification.

### HypothesisBoard.tsx

- The inline `useT(locale)` helper returning `(ko, en)` is removed.
- All static strings use `t(locale, key)`.
- The count string uses `fill(t(locale, 'hyp-count'), { remaining, total })`.
- State (`eliminated` Set) is unchanged; no locale-triggered reset occurs.

### DetectiveAside.tsx

- The `HEADING: Record<Locale, string>` constant (en + ko only) is replaced with
  `t(locale, 'aside-heading')` from the catalogue.
- `getDetectiveVoice(stage, locale)` now covers all ten locales via the extended
  detective-voice.ts.

---

## Test design

`tests/secondary-i18n.test.ts` uses only pure imports (`secondary-ui.ts`,
`detective-voice.ts`, `locales.ts`) — no React, no DOM, no server. This makes it
runnable with the exact command `node --import tsx --conditions=react-server --test
tests/secondary-i18n.test.ts` without a full build.

The hostile-name test verifies that `fill()` does not parse HTML by checking that the
raw hostile string appears verbatim in the output (not as rendered HTML). No DOM is
required because the test operates on plain strings.

---

## What this feature does NOT do

- Does not translate dynamic interpolated content (object names, testimony text).
- Does not add runtime AI translation.
- Does not change the puzzle, engine, solver, or verdict logic.
- Does not change official testimony; quotes are always verbatim from the snapshot.
- Does not implement RTL layout (that is Codex CSS responsibility, triggered by
  `getDirection('ar') === 'rtl'` from locales.ts).
- Does not integrate language switching UI (that is Codex Game.tsx responsibility).

---

## Codex clarification after the interrupted run — 2026-10-31

The Kiro-authored design above is preserved. Its heading “Double-quoted strings throughout” applies to the **catalogue object keys and values**, not every string literal in the source file. Codex inspected the final catalogue with the TypeScript parser: its 540 key/value string literals use double quotes; imports and the 27-member key union still use single quotes. This clarification was written by Codex, not by Kiro. The final source and the earlier French parsing failure remain in the [execution evidence](../../../docs/kiro/ten-languages-README.md).
