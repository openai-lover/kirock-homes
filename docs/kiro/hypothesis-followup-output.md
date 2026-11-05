Reading the current state of the files I own before making any changes.Good. I have a clear picture of what needs changing. Now making all four edits before running the commands.Now update REQ-3.3 to narrow the restriction to only the actionable correctness-evaluation prohibition:Now rewrite tasks.md with the honest chronology correction and placeholders for the real upcoming run results:Now run both commands and capture real output:Both pass. Now fill in the real results in tasks.md, replacing the placeholders:Let me do a final read of hypothesis.ts to confirm it's clean:Clean — only `Suspect` and `SuspectId` imported, no `Locale`, no re-export, no trailing blank line issues.

---

## Exact changes and verified outcomes

### Files changed

**`src/lib/game/hypothesis.ts`**
- Removed `Locale` from the import (was unused by the builder itself).
- Removed the `export type { Locale }` convenience re-export block at the bottom.
- The module now imports only `Suspect` and `SuspectId` from `./types`. No other change.

**`src/components/HypothesisBoard.tsx`**
- Replaced instruction `<p>` copy:
  - Korean: `'세 증언과 맞지 않는 가설을 눌러 지워 보세요. 다시 누르면 되돌릴 수 있어요.'`
  - English: `'Tap the theories that don\'t fit the three statements to cross them out. Tap again to restore them.'`
- All other logic, structure, labels, and test IDs unchanged.

**`.kiro/specs/detective-hypotheses/requirements.md`**
- REQ-3.3: narrowed the prohibition from a broad ban on common English words (`answer`, `correct`, `culprit`) to the precise rule: the board must not assert that a remaining theory is *verified correct*. The label `'내가 남긴 가설'` / `'My remaining theory'` is explicitly permitted as player-owned language.

**`.kiro/specs/detective-hypotheses/tasks.md`**
- Added a "Chronology correction" section at the top explicitly acknowledging that the initial draft's ✅ marks were written before file creation and command execution — premature, not erased.
- Final ✅ statuses now reference the actual CLI runs.
- Task 7 added, documenting all follow-up edits and containing the real verbatim terminal output from both commands.

### Verified test outcomes (follow-up session, 2026-10-31)

**Hypothesis only** — `node --import tsx --conditions=react-server --test tests/hypothesis.test.ts`
→ **11 pass, 0 fail**, exit status 0, duration ~130 ms

**Engine + hypothesis regression** — `node --import tsx --conditions=react-server --test tests/engine.test.ts tests/hypothesis.test.ts`
→ **19 pass (8 engine + 11 hypothesis), 0 fail**, exit status 0, duration ~116 ms

### What was not performed (honest record)
- `npm run typecheck` — not run; Codex owns the build pipeline and `index.ts` barrel.
- `npm run build` — not run.
- Browser / Playwright validation — not claimable from CLI alone; Codex will handle e2e integration.
