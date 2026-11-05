I'll start by reading the required files before writing anything.Good. I now have all the context I need. The component is a pure, stateless SVG renderer with no state, effects, or browser APIs — so no `"use client"` is needed. Let me now write the three spec files first, then implement the component, then run typecheck.Good. Now let me look at an existing spec set to match the document style:I have all the context I need. Now I'll write the three spec files first, then implement the component.

---

**Step 1 — Requirements****Step 2 — Design****Step 3 — Tasks (initial, not yet complete)**Now Task 1 is complete. **Step 4 — Implementation**Now run the typecheck:One error in my file — `JSX.Element` is not directly available without an explicit React import under `react-jsx` transform with `isolatedModules`. I need to use `React.ReactElement` or import from React. Let me check how existing components handle this:The `JSX` namespace isn't available without a React import. The simplest fix for the `isolatedModules`/`react-jsx` setup is to use `React.ReactElement` with an explicit React import, or use `ReactNode`. Let me use `import type React from 'react'` and type the record as `Record<Kind, React.ReactElement>`:Typecheck passes with exit status 0. Now update the tasks file with actual results:Let me do a final read of the produced component to confirm it's clean before summarising:Everything is in order. Here's the summary of what was done and what the actual results were.

---

## Files produced

| File | Status |
|---|---|
| `.kiro/specs/attraction-props/requirements.md` | ✅ created before implementation |
| `.kiro/specs/attraction-props/design.md` | ✅ created before implementation |
| `.kiro/specs/attraction-props/tasks.md` | ✅ created and updated with actual results |
| `src/components/DetectiveProp.tsx` | ✅ implemented and typechecked |

No existing file was modified.

---

## TypeScript check — actual result

```
node node_modules/typescript/bin/tsc --noEmit
exit status: 0   (empty stdout and stderr)
```

One repair was needed in my own file: `JSX.Element` is unavailable without a namespace import under `react-jsx` + `isolatedModules: true`. Fixed by replacing it with `React.ReactElement` and adding `import type React from 'react'`. No other file was touched.

---

## Component design decisions

**No `'use client'`** — the component has no state, effects, or browser APIs. It renders as a Server Component and can be imported anywhere.

**Seven named sub-components** (`Bell`, `Key`, `Camera`, `Seal`, `Pin`, `Footprints`, `Crest`) return JSX fragments used as values in a `Record<Kind, React.ReactElement>`. TypeScript's exhaustiveness check on that record means adding a new `Kind` variant without a matching icon is a compile error, not a silent undefined.

**Icon geometry choices:**
- `bell` — quadratic-bezier dome, base rect, apex circle, striker line; classic concierge silhouette
- `key` — double ring bow (outer + inner cutout), horizontal shaft, three perpendicular bits
- `camera` — rectangular body with rounded corners, two concentric lens circles, elevated viewfinder box
- `seal` — 12-arc scalloped path + framing circle + `<polyline>` check mark; no text baked in
- `pin` — solid-filled head circle + inner highlight ring + tapered V shaft
- `footprints` — two `fill="currentColor"` rotated ellipses, diagonal stride arrangement; no toes
- `crest` — quadratic-bezier deerstalker dome + brim + twin peaks + magnifier circle + thick handle line; no pipe, gun, or eye

**`focusable={false as unknown as boolean}`** — SVG `focusable="false"` is an IE11 quirk attribute. React's SVG prop types don't include it natively, so the cast keeps both the type system and the emitted attribute correct. `aria-hidden="true"` is also set and never overridable through the public props.

---

## Limitations (not claimable from CLI alone)

- Browser rendering, visual layout, and actual pixel silhouettes are not verified — no `npm run build` or live browser run was performed.
- CSS for `.detective-prop` (size, display, colour inheritance) is Codex's integration responsibility.
- No Playwright tests were written; the component has no interactive behaviour to drive.
