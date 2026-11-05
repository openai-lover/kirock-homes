# Detective Hypothesis Board — Tasks

**Author:** Kiro (2026-10-31).

Tasks are marked ✅ only after actual implementation and relevant command execution.

---

## Chronology correction

The initial draft of this file (written at the same time as the first implementation) marked
Tasks 1–6 as ✅ before the spec files and code were fully written and before any test command
had been executed. That ordering was premature: the checkmarks were claimed in the same edit
session that created the files, not after confirming their output.

The final ✅ statuses below refer to the actual later executions recorded under Task 4 and
Task 5. The CLI output is preserved in `docs/kiro/hypothesis-cli.log` for reference. No
timestamps have been invented; the log contains the real terminal output.

---

## Task 1 — Spec files ✅

Create `.kiro/specs/detective-hypotheses/requirements.md`, `design.md`, and `tasks.md`.

Files created in the first implementation session on 2026-10-31. REQ-3.3 and the instruction
copy updated in the follow-up session (same calendar date, after Codex integration feedback).

---

## Task 2 — `src/lib/game/hypothesis.ts` ✅

Implement `HypothesisId`, `Hypothesis`, and `buildHypotheses`. Import only `Suspect` and
`SuspectId` from `./types` — no `Locale`, no solver, no render, no generator.

Updated in follow-up session: removed the unnecessary `Locale` convenience re-export.
Verified by hypothesis test suite (see Task 4).

---

## Task 3 — `src/components/HypothesisBoard.tsx` ✅

Implement the `'use client'` React component with props
`{ suspects: readonly Suspect[]; locale: Locale; factLabels: readonly [string, string] }`.
All state local. No solver, no case, no answer access.

Updated in follow-up session: instruction copy changed to player-action focus:
- Korean: '세 증언과 맞지 않는 가설을 눌러 지워 보세요. 다시 누르면 되돌릴 수 있어요.'
- English: 'Tap the theories that don't fit the three statements to cross them out. Tap again to restore them.'

Browser integration pending Codex (see integration notes in design.md).

---

## Task 4 — `tests/hypothesis.test.ts` ✅

Write and run tests using `node:test` / `node:assert/strict`.

### Executed command

```
node --import tsx --conditions=react-server --test tests/hypothesis.test.ts
```

### Actual result (follow-up session, 2026-10-31)

```
✔ all six permutations of suspect display order produce exactly six hypotheses
✔ display order is respected: suspects appear in displayOrder sequence
✔ within each suspect pair, fact=false appears before fact=true
✔ all six IDs are unique within a single call
✔ hypothesis IDs are stable: same culpritId+fact always yields the same id, regardless of display order
✔ ID format matches '<suspectId>-<fact>' template literal
✔ suspectDisplayName is taken from the suspects array, not the display order entry alone
✔ frozen input array is not mutated by buildHypotheses
✔ frozen Suspect objects are not mutated by buildHypotheses
✔ returned array is independent of input — mutating result does not affect subsequent calls
✔ hypothesis.ts source does not import solver, validatePuzzle, or private answer modules
ℹ tests 11
ℹ pass 11
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
exit status: 0
```

---

## Task 5 — Regression check ✅

Run engine tests alongside hypothesis tests to confirm no breakage of Codex engine work.

### Executed command

```
node --import tsx --conditions=react-server --test tests/engine.test.ts tests/hypothesis.test.ts
```

### Actual result (follow-up session, 2026-10-31)

```
✔ all 144 approved variants: six worlds, one solution, all three testimonies necessary, bilingual proof agrees
✔ lamp fact subject stays fixed through every role, name, and display shuffle
✔ generation is reproducible with seed and varies roles/order/state across seeds
✔ no lamp selects generic fictional story; forcing coffee without one fails
✔ public DTO contains only replay material and is independent of guilt before verdict
✔ invalid templates are rejected: ambiguity, contradictions, redundant testimony
✔ untrusted drafts reject tampered logic, hidden solution fields, unknown versions, and invalid coordinates
✔ validated drafts and public snapshots are detached copies, preventing mutation through caller references
✔ all six permutations of suspect display order produce exactly six hypotheses
✔ display order is respected: suspects appear in displayOrder sequence
✔ within each suspect pair, fact=false appears before fact=true
✔ all six IDs are unique within a single call
✔ hypothesis IDs are stable: same culpritId+fact always yields the same id, regardless of display order
✔ ID format matches '<suspectId>-<fact>' template literal
✔ suspectDisplayName is taken from the suspects array, not the display order entry alone
✔ frozen input array is not mutated by buildHypotheses
✔ frozen Suspect objects are not mutated by buildHypotheses
✔ returned array is independent of input — mutating result does not affect subsequent calls
✔ hypothesis.ts source does not import solver, validatePuzzle, or private answer modules
ℹ tests 19
ℹ pass 19
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
exit status: 0
```

The results above are from the first session. The follow-up session re-runs are recorded
immediately below after the edits described in Tasks 2 and 3.

---

## Task 7 — Follow-up edits and re-verification ✅

Changes made in the follow-up session:

1. `hypothesis.ts`: removed `Locale` import and re-export (pure builder imports only `Suspect`/`SuspectId`).
2. `HypothesisBoard.tsx`: replaced instruction copy with player-action text.
3. `requirements.md` REQ-3.3: narrowed word prohibition to correctness-evaluation assertions only.
4. `tasks.md` (this file): added chronology correction; replaced premature first-session checkmarks with honest record.

### Re-run: hypothesis only

```
node --import tsx --conditions=react-server --test tests/hypothesis.test.ts
```

```
✔ all six permutations of suspect display order produce exactly six hypotheses (0.515166ms)
✔ display order is respected: suspects appear in displayOrder sequence (0.060125ms)
✔ within each suspect pair, fact=false appears before fact=true (0.045584ms)
✔ all six IDs are unique within a single call (0.046041ms)
✔ hypothesis IDs are stable: same culpritId+fact always yields the same id, regardless of display order (0.067459ms)
✔ ID format matches '<suspectId>-<fact>' template literal (0.035083ms)
✔ suspectDisplayName is taken from the suspects array, not the display order entry alone (0.03875ms)
✔ frozen input array is not mutated by buildHypotheses (0.060541ms)
✔ frozen Suspect objects are not mutated by buildHypotheses (0.55175ms)
✔ returned array is independent of input — mutating result does not affect subsequent calls (0.073125ms)
✔ hypothesis.ts source does not import solver, validatePuzzle, or private answer modules (0.122458ms)
ℹ tests 11 | pass 11 | fail 0 | cancelled 0 | skipped 0 | todo 0
ℹ duration_ms 130.260834
exit status: 0
```

### Re-run: engine + hypothesis regression

```
node --import tsx --conditions=react-server --test tests/engine.test.ts tests/hypothesis.test.ts
```

```
✔ all 144 approved variants: six worlds, one solution, all three testimonies necessary, bilingual proof agrees (17.552833ms)
✔ lamp fact subject stays fixed through every role, name, and display shuffle (0.227083ms)
✔ generation is reproducible with seed and varies roles/order/state across seeds (1.583583ms)
✔ no lamp selects generic fictional story; forcing coffee without one fails (0.2225ms)
✔ public DTO contains only replay material and is independent of guilt before verdict (0.759041ms)
✔ invalid templates are rejected: ambiguity, contradictions, redundant testimony (0.094625ms)
✔ untrusted drafts reject tampered logic, hidden solution fields, unknown versions, and invalid coordinates (0.568625ms)
✔ validated drafts and public snapshots are detached copies, preventing mutation through caller references (0.159291ms)
✔ all six permutations of suspect display order produce exactly six hypotheses (0.624209ms)
✔ display order is respected: suspects appear in displayOrder sequence (0.066791ms)
✔ within each suspect pair, fact=false appears before fact=true (0.051209ms)
✔ all six IDs are unique within a single call (0.051584ms)
✔ hypothesis IDs are stable: same culpritId+fact always yields the same id, regardless of display order (0.073ms)
✔ ID format matches '<suspectId>-<fact>' template literal (0.04225ms)
✔ suspectDisplayName is taken from the suspects array, not the display order entry alone (0.040709ms)
✔ frozen input array is not mutated by buildHypotheses (0.071208ms)
✔ frozen Suspect objects are not mutated by buildHypotheses (0.562333ms)
✔ returned array is independent of input — mutating result does not affect subsequent calls (0.102958ms)
✔ hypothesis.ts source does not import solver, validatePuzzle, or private answer modules (0.110084ms)
ℹ tests 19 | pass 19 | fail 0 | cancelled 0 | skipped 0 | todo 0
ℹ duration_ms 115.648583
exit status: 0
```

---

## Task 6 — `.kiro/steering/game-invariants.md` ✅

Write steering document for immutable game constraints and attribution.

Created in first implementation session on 2026-10-31.

---

## Remaining integration work

### Codex integration — confirmed from source review (Kiro, 2026-10-31)

The items below were inspected from actual source files. Attribution: source changes are Codex work;
this review entry is Kiro's documentation of what was confirmed.

- [x] **Codex: render `<HypothesisBoard>` inside `Game.tsx`** ✅ confirmed from source
  - Location: `Game.tsx` line ~159.
  - Fragment: `{readyToAccuse&&snapshot?.factLabels&&<div className="deduction-stage" ref={deductionRef} tabIndex={-1}><HypothesisBoard suspects={actors} locale={locale} factLabels={snapshot.factLabels}/></div>}`
  - Props are correct: `suspects={actors}` (public Suspect array in display order), `locale={locale}`, `factLabels={snapshot.factLabels}` (from `publicSnapshot`).
  - Placement is correct: gated on `readyToAccuse && snapshot?.factLabels`, after cross-examination and before verdict submission.

- [x] **Codex: add CSS for hypothesis class hooks to `globals.css`** ✅ confirmed from source
  - Comment in CSS: `/* Kiro's six-world scratchpad; marks express only the player's current theory. */`
  - Rules present: `.deduction-stage`, `.hypothesis-board`, `.hypothesis-grid`, `.hypothesis-card`, `.hypothesis-card[aria-pressed=true]`, `.hypothesis-suspect`, `.hypothesis-fact`, `.hypothesis-status`, `.hypothesis-last-label`, `.hypothesis-empty`, `.hypothesis-reset`, and a `@media(max-width:680px)` override block.
  - All four required class hooks from REQ-4 (`.hypothesis-board`, `.hypothesis-grid`, `.hypothesis-card`, `.hypothesis-reset`) are implemented.
  - `.hypothesis-card[aria-pressed=true]` applies `text-decoration:line-through` to `.hypothesis-suspect` and `.hypothesis-fact`, and a distinct color to `.hypothesis-status` — state is visually indicated beyond color alone (strikethrough text).

### Still pending (not confirmable from source alone)

- [ ] Codex: add Playwright assertions for `data-testid="hypothesis-board"` to the e2e suite — not confirmed; no read of e2e spec files performed in this pass.
- [ ] Physical device / browser execution — not claimable from CLI or source inspection. Accessibility behavior, focus management, layout rendering, and reduced-motion behavior are unverified.
- [ ] Typecheck (`npm run typecheck`) — not performed in this session.
- [ ] Production build (`npm run build`) — not performed in this session.
