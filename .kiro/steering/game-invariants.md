# Game Invariants — Steering

**Author:** Kiro (2026-10-31).

---

## Attribution

The application (engine, generator, renderer, server routes, Game component, CrossExamination
component, CSS, sample content, tests) was created by **Codex**. Kiro's contribution to this
project is limited to the hypothesis board feature:

- `src/lib/game/hypothesis.ts`
- `src/components/HypothesisBoard.tsx`
- `tests/hypothesis.test.ts`
- `.kiro/specs/detective-hypotheses/` (requirements, design, tasks)
- `.kiro/steering/game-invariants.md`

Do not attribute Codex work to Kiro or vice versa in commit messages, documentation, or competition
submissions.

---

## Immutable game constraints

These invariants are enforced by the engine (`solver.ts`, `generator.ts`, `render.ts`) and must not
be weakened by any new feature:

1. **Exactly six worlds.** `enumerateWorlds()` always returns `{ culpritId, fact }` for each of
   `['s0','s1','s2'] × [false, true]`. No world may be added, removed, or pre-eliminated.

2. **Unique solution.** Every playable case has exactly one world where all three statements are
   satisfied by an honest innocent pair and a lying culprit. `validatePuzzle` enforces this.

3. **All three statements necessary.** Removing any single statement leaves the culprit ambiguous.
   No statement is decorative or redundant.

4. **One liar, who is the culprit.** Each world assigns truth-values to all three claims: the two
   innocents tell the truth, the culprit lies. This is the only logic family in use.

5. **Facts and targets stable under role permutations.** The `factSubjectId` and `factId` are fixed
   per case regardless of which suspect holds which role (`a`, `b`, `c`).

6. **No solution leak in public response.** `publicSnapshot` omits `culpritId`, `roleAssignment`,
   `confession`, `proofSteps`, and `factInverted`. The HTTP `GET /api/shared-cases/[shareId]`
   route returns only the public snapshot before a verdict is submitted.

---

## Hypothesis board constraints (new feature)

These constraints follow directly from the game invariants above and must be maintained in all
future modifications to `hypothesis.ts` and `HypothesisBoard.tsx`:

- The board is a **player scratchpad only**. It has no access to the case draft, role assignment,
  solution world, or resolver.
- No card is ever eliminated **automatically**. Every state change is a direct result of a user
  click.
- The remaining-card label is `내가 남긴 가설` / `My remaining theory`. It must never read
  `정답`, `correct`, `answer`, `culprit`, or any synonym that implies the board knows the truth.
- `buildHypotheses` must not import `solver`, `render`, `generator`, `server-only`, AI modules, or
  any module outside `./types`.
- `HypothesisBoard` must not import server-only modules, AI modules, or any module that exposes
  private case data.

---

## Development process guidance

- **Specs tasks must be marked complete only after the code is written and the relevant command
  has been executed and its output confirmed.**
- **Browser validation is not claimable from the CLI alone.** Mark browser test tasks complete only
  after a human or automated Playwright run with confirmed output.
- When in doubt whether a change is within Kiro scope, do not edit files outside the list above.
  Instead, document the integration requirement and leave it for Codex.
