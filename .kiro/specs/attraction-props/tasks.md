# Attraction Props — Tasks

**Author:** Kiro (2026-11-04).  
**Workflow:** CLI-authored specs and implementation, not a native IDE spec workflow.

Tasks are marked ✅ only after the corresponding action has actually been performed and its output
confirmed.

---

## Task 1 — Spec files ✅

Create `.kiro/specs/attraction-props/requirements.md`, `design.md`, and `tasks.md`.

Files created in this session on 2026-11-04, before implementation, as required.

---

## Task 2 — `src/components/DetectiveProp.tsx` ✅

Implemented the default-export `DetectiveProp` React component:

- Props `{ kind: Kind; className?: string }` where `Kind` is the seven-variant union.
- No `'use client'` directive — pure Server Component.
- `viewBox="0 0 48 48"`, `aria-hidden="true"`, `focusable={false}` on every rendered SVG.
- `className` composed as `"detective-prop"` + optional caller value.
- Seven icon sub-components — `Bell`, `Key`, `Camera`, `Seal`, `Pin`, `Footprints`, `Crest`
  — each returning a JSX fragment of SVG shapes.
- `ICONS` typed `Record<Kind, React.ReactElement>` for exhaustiveness.
- No IDs, no `<defs>`, no `dangerouslySetInnerHTML`, no hardcoded colour values, no imports
  from application modules.
- `import type React from 'react'` used solely to obtain the `React.ReactElement` type;
  no runtime React APIs are called.

**First typecheck attempt** revealed one error in my own file:

```
src/components/DetectiveProp.tsx(171,27): error TS2503: Cannot find namespace 'JSX'.
```

Cause: `JSX.Element` is not available without a namespace import under the `react-jsx` transform
with `isolatedModules: true`. Fix: replaced `JSX.Element` with `React.ReactElement` and added
`import type React from 'react'`. No other file was changed.

---

## Task 3 — TypeScript check ✅

### Executed command

```
node node_modules/typescript/bin/tsc --noEmit
```

### Actual result (2026-11-04)

```
exit status: 0
stdout: (empty)
stderr: (empty)
```

No diagnostics. All existing files and the new `DetectiveProp.tsx` pass the project typecheck.

---

## Limitations and remaining integration work

- **Browser / build verification not performed.** `npm run build` and live browser rendering have
  not been executed. No claim is made about visual rendering, layout, or accessibility behaviour
  beyond what TypeScript can verify.
- **No Playwright / e2e tests.** The component has no interactive behaviour to test; decorative
  rendering is verified only by typecheck.
- **Integration is Codex work.** CSS for `.detective-prop`, import sites, and app integration
  into the theme-park scene components are Codex responsibilities. No existing file was modified
  by Kiro.
- **`focusable` prop.** SVG `focusable="false"` is an IE11 attribute. The implementation uses
  `focusable={false as unknown as boolean}` to satisfy React's SVG prop types while emitting
  the correct attribute. If the project's React/TSX types later accept `focusable` natively
  this cast can be removed.

## Codex integration note, after the Kiro run

Codex removed that redundant cast (`focusable={false}` is accepted by this project's types) and corrected the source's server-only wording. The component is also imported from client components. Kiro's real commands included a trailing `2>&1`; the captured tool results, rather than the abbreviated command above, are authoritative. UI integration, imagery and browser/build checks are Codex work.
