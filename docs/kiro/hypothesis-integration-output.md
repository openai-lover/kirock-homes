Reading the relevant source sections first.I now have everything I need. Let me read the current tasks.md and design.md integration notes before updating them.I have all I need. Here is what I confirmed from the source inspection:

**`Game.tsx` (around line 159):** The relevant fragment is:
```tsx
{readyToAccuse&&snapshot?.factLabels&&<div className="deduction-stage" ref={deductionRef} tabIndex={-1}><HypothesisBoard suspects={actors} locale={locale} factLabels={snapshot.factLabels}/></div>}
```
- `HypothesisBoard` is imported and rendered by Codex.
- Props passed: `suspects={actors}` (the public suspect array), `locale={locale}`, `factLabels={snapshot.factLabels}` (from `publicSnapshot`).
- It is gated on `readyToAccuse && snapshot?.factLabels` — rendered after cross-examination is complete and before verdict submission. This exactly matches the intended integration slot.

**`globals.css` (lines 29-30 area, but the hypothesis block appears near the end):** The comment `/* Kiro's six-world scratchpad; marks express only the player's current theory. */` precedes a block defining `.deduction-stage`, `.hypothesis-board`, `.hypothesis-grid`, `.hypothesis-card`, `.hypothesis-card[aria-pressed=true]`, `.hypothesis-last-label`, `.hypothesis-empty`, `.hypothesis-reset`, and a `@media(max-width:680px)` override. All four required class hooks are present.

Now updating only tasks.md and design.md:Now update the integration notes section in design.md:---

## Report

### Files inspected

**`src/components/Game.tsx` (line ~159)** — read, line range 145–185.

**`src/app/globals.css` (lines 1–end)** — read in full; hypothesis block is near the end of the file.

No other files were read. No application or test files were edited.

---

### What was confirmed from source

**`Game.tsx` — Codex integration ✅**

The exact render fragment:
```tsx
{readyToAccuse&&snapshot?.factLabels&&<div className="deduction-stage" ref={deductionRef} tabIndex={-1}><HypothesisBoard suspects={actors} locale={locale} factLabels={snapshot.factLabels}/></div>}
```
All three props match the required signature. The `readyToAccuse && snapshot?.factLabels` guard places the board after cross-examination and before verdict — the correct slot. No case draft, solver, or solution data is passed.

**`globals.css` — Codex CSS hooks ✅**

The hypothesis block is introduced by Codex's comment `/* Kiro's six-world scratchpad; marks express only the player's current theory. */` and defines every required class name: `.hypothesis-board`, `.hypothesis-grid`, `.hypothesis-card`, `.hypothesis-reset`, plus `.hypothesis-card[aria-pressed=true]` which applies `text-decoration:line-through` to suspect name and fact text — state is distinguishable beyond color alone, satisfying REQ-2.4. A `@media(max-width:680px)` block provides the mobile layout. The `.hypothesis-last-label` and `.hypothesis-empty` variants are also present.

---

### What was not confirmed and remains pending

- **Playwright e2e assertions** for `data-testid="hypothesis-board"` — e2e spec files were not read in this pass and are not claimed.
- **Browser execution, accessibility behavior, focus management, layout rendering, reduced-motion behavior** — none of these are verifiable from source inspection alone. These remain unverified.
- **Typecheck (`npm run typecheck`) and production build (`npm run build`)** — not performed; not claimed.

---

### Changes made

- `.kiro/specs/detective-hypotheses/tasks.md` — "Remaining integration work" section replaced with a split structure: confirmed Codex source items marked ✅ with exact source evidence and attribution; browser/Playwright/typecheck/build items remain `[ ]` pending.
- `.kiro/specs/detective-hypotheses/design.md` — "Integration notes" section updated with confirmed render fragment, confirmed CSS rules, and explicit "not confirmed from source alone" subsection. All prior chronology correction and test output preserved unchanged.
