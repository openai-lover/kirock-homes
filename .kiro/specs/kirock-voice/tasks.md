# Kirock Voice — Tasks

**Spec authored by Kiro (2026-10-31). Updated 2026-10-31 with actual TypeScript check result.**

Tasks are marked complete only after the relevant file exists **and** the specified
action has been executed with its output confirmed. Planned-but-not-yet-executed tasks
remain unchecked. Browser, build, and e2e validation are Codex tasks; Kiro does not
claim them.

---

## Workflow note

In this CLI session, implementation files (`detective-voice.ts`, `DetectiveAside.tsx`)
were written first, then spec files were created, then a second pass revised all five
files in response to Codex and user review. This is not a spec-first native IDE workflow
and is not claimed as one.

---

## Kiro-owned tasks

### T1 — Write spec files ✅

Create `.kiro/specs/kirock-voice/requirements.md`, `design.md`, and `tasks.md`.

First versions created 2026-10-31. Final versions revised 2026-10-31 to match
reviewed implementation.

---

### T2 — Implement `src/lib/ui/detective-voice.ts` ✅

Write the pure TypeScript module with:
- `DetectiveStage` type (six stages)
- `StageCopy` type as `Readonly<{ line: string }>`
- Twelve localized stage lines
- Deterministic `getDetectiveVoice(stage, locale)` accessor
- No React, DOM, solver, case, or AI dependency

First version created 2026-10-31. Revised 2026-10-31:
- `StageCopy` made `Readonly<{…}>`
- `listening`, `confronting`, and `deducing` lines polished per review

---

### T3 — Implement `src/components/DetectiveAside.tsx` ✅

Write the presentational React component with:
- Exact required props `{ stage: DetectiveStage; locale: Locale }`
- `<strong className="detective-aside-title">` for the notebook title (not h3/h2)
- Decorative image at `width={72}` `height={72}` with `alt=""` and `aria-hidden="true"`
- All required class names and `data-testid`/`data-stage` attributes
- No state, no network, no solver or answer dependency

First version created 2026-10-31. Revised 2026-10-31:
- `<h3>` replaced with `<strong className="detective-aside-title">`
- Image dimensions updated from 80 × 80 to 72 × 72

---

### T4 — Run TypeScript check ✅

**Command executed:**
```
node node_modules/typescript/bin/tsc --noEmit
```

**Working directory:** `/Users/kyumin/Documents/ChatGPT/kiro`

**stdout:** (empty)

**stderr:** (empty)

**Exit status:** 0

No diagnostics were produced. The check covers the full project including
`src/lib/ui/detective-voice.ts` and `src/components/DetectiveAside.tsx`.
No errors attributable to the five owned files. No concurrent Codex integration
errors were present at the time of the run.

---

## Codex-owned tasks (integration, not Kiro scope)

Listed for handoff clarity. Kiro does not mark these complete.

- [ ] Add CSS rules for `.detective-aside`, `.detective-aside-mascot`,
      `.detective-aside-copy`, `.detective-aside-title`, `.detective-aside-line`.
- [ ] Import `DetectiveAside` into `Game.tsx` and wire `stage` and `locale` props
      using the phase-to-stage mapping described in `design.md`.
- [ ] Run `npm run build` and confirm no new errors.
- [ ] Run `npm run test:e2e` (Playwright) and confirm the aside appears with the
      correct `data-testid="detective-aside"` and `data-stage` values in each phase.
