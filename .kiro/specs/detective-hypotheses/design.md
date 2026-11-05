# Detective Hypothesis Board — Design

**Feature:** Manual six-world hypothesis scratchpad.  
**Author:** Kiro (2026-10-31).

---

## Module: `src/lib/game/hypothesis.ts`

### Types

```ts
export type HypothesisId = `${SuspectId}-false` | `${SuspectId}-true`;

export type Hypothesis = {
  readonly id: HypothesisId;
  readonly culpritId: SuspectId;
  readonly fact: boolean;
  readonly suspectDisplayName: string;
};
```

`HypothesisId` is a branded template-literal type over the six legal combinations. Using a template
literal keeps the type precise without a runtime enum.

### Builder

```ts
export function buildHypotheses(
  suspects: readonly Suspect[],
  displayOrder: readonly SuspectId[],
): Hypothesis[]
```

Algorithm:
1. Create a `Map<SuspectId, Suspect>` from `suspects` for O(1) name lookup (does not mutate input).
2. For each `id` in `displayOrder`, emit `{ id: `${id}-false`, culpritId: id, fact: false, ... }`,
   then `{ id: `${id}-true`, culpritId: id, fact: true, ... }`.
3. Return the resulting array (length = `displayOrder.length × 2`; always 6 for a valid case).

No imports except `./types`. No side effects.

---

## Component: `src/components/HypothesisBoard.tsx`

### Props

```ts
type Props = {
  suspects: readonly Suspect[];
  locale: Locale;
  factLabels: readonly [string, string];
};
```

`suspects` carries both `id` (for display order) and `displayName`. The component derives the
display order from `suspects` order, matching the contract from `publicSnapshot` which orders
suspects by `displayOrder`.

### State

```ts
const [eliminated, setEliminated] = useState<Set<HypothesisId>>(new Set());
```

A `Set` is used rather than an array for O(1) membership queries. The `Set` is never mutated; each
toggle creates a new `Set`.

### Render tree

```
<section data-testid="hypothesis-board" className="hypothesis-board">
  <h2>                            ← localized heading
  <p className="hypothesis-count"> ← remaining count + optional last-card label
  <div className="hypothesis-grid">
    {hypotheses.map(h =>
      <button
        key={h.id}
        className="hypothesis-card"
        data-testid={`hypothesis-card-${h.id}`}
        aria-pressed={eliminated.has(h.id)}
        onClick={() => toggle(h.id)}
      >
        <span className="hypothesis-suspect">{h.suspectDisplayName}</span>
        <span className="hypothesis-fact">{factLabel(h.fact)}</span>
        <span className="hypothesis-status">{statusLabel(h.id)}</span>
      </button>
    )}
  </div>
  {remaining === 0 && <p role="status">...restore message...</p>}
  <button data-testid="hypothesis-reset" onClick={reset}>...</button>
</section>
```

### Localization helper

A minimal inline `t(ko, en)` function selected by `locale === 'ko'`, consistent with the pattern
used in `CrossExamination.tsx`.

### No automatic eliminations

The component never reads `suspects[x].id === culpritId`, never calls `solve()`, and never accesses
any case, draft, or resolution object. All elimination decisions originate from user clicks.

---

## Tests: `tests/hypothesis.test.ts`

| Test | What it checks |
|---|---|
| All permutations produce six hypotheses | `permutations(SUSPECT_IDS)` × `buildHypotheses` → length 6 |
| Display order respected | First two items have `culpritId` of `displayOrder[0]` |
| False-before-true per suspect | Within each pair, `fact` is `false` then `true` |
| All six IDs unique | `new Set(ids).size === 6` |
| Stable IDs independent of display order | Same culpritId+fact always produces the same `id` string |
| Input not mutated (frozen array) | `Object.freeze` on input; builder completes without throwing |
| Input objects not mutated (frozen suspects) | Each `Suspect` object frozen; builder completes |
| No solver import | Source text of `hypothesis.ts` does not contain `"solver"` or `"validatePuzzle"` |

---

## Integration notes

The items below were confirmed by reading actual source files on 2026-10-31. Source changes are
Codex work; this section records what Kiro verified.

### Game.tsx — confirmed ✅ (Codex work)

`HypothesisBoard` is rendered at the correct phase:

```tsx
{readyToAccuse && snapshot?.factLabels && (
  <div className="deduction-stage" ref={deductionRef} tabIndex={-1}>
    <HypothesisBoard suspects={actors} locale={locale} factLabels={snapshot.factLabels} />
  </div>
)}
```

- `suspects={actors}` — the public Suspect array, ordered by display order (matches `publicSnapshot` contract).
- `locale={locale}` — game locale, passed through from the page.
- `factLabels={snapshot.factLabels}` — sourced from `publicSnapshot(...).factLabels` as required.
- Guard `readyToAccuse && snapshot?.factLabels` places the board after cross-examination is complete and before verdict submission. No case draft, role assignment, or solution is passed.

### globals.css — confirmed ✅ (Codex work)

All required class hooks are defined, preceded by the comment:
`/* Kiro's six-world scratchpad; marks express only the player's current theory. */`

Rules confirmed present: `.deduction-stage`, `.hypothesis-board`, `.hypothesis-grid`,
`.hypothesis-card`, `.hypothesis-card[aria-pressed=true]` (with strikethrough on name and fact text,
distinct status color — state indicated beyond color alone), `.hypothesis-suspect`, `.hypothesis-fact`,
`.hypothesis-status`, `.hypothesis-last-label`, `.hypothesis-empty`, `.hypothesis-reset`, and a
`@media(max-width:680px)` responsive override.

### Not confirmed from source alone

- Playwright e2e assertions for `data-testid="hypothesis-board"` — e2e spec files not read in this pass.
- Browser execution, accessibility behavior, focus management, layout rendering — unverified; require live browser run.
- Typecheck and production build — not performed.
