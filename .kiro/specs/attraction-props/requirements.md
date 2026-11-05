# Attraction Props — Requirements

**Feature:** Reusable decorative SVG icon component for the Sherlock detective theme-park interface.  
**Author:** Kiro (2026-11-04). Inherited application code and app integration are Codex work;
this component is new Kiro work.  
**Workflow:** CLI-authored spec, not a native IDE spec workflow.

---

## Overview

The detective theme-park interface needs a small set of tactile, period-appropriate SVG icons that
can be scattered across buttons, headings, and decorative regions to communicate the physical world
of Baker Street. Each icon must be legible at 48 CSS pixels, express its referent through outline
only (no fills that obscure the parent element's surface), and carry no interactive semantics of its
own — parent buttons and labels already supply accessible names and roles.

---

## Requirements

### REQ-1 Component contract

- **REQ-1.1** The file exports a single default export named `DetectiveProp`.
- **REQ-1.2** Props:
  ```ts
  { kind: 'bell' | 'key' | 'camera' | 'seal' | 'pin' | 'footprints' | 'crest'; className?: string }
  ```
  No other props are accepted or forwarded to the SVG element.
- **REQ-1.3** The component requires no `'use client'` directive; it contains no state, effects,
  event handlers, or browser APIs, and may therefore be rendered as a Server Component.

### REQ-2 SVG output invariants

- **REQ-2.1** Every rendered SVG has `viewBox="0 0 48 48"`.
- **REQ-2.2** Every rendered SVG has `aria-hidden="true"` and `focusable="false"`. These must
  never be absent or overridden.
- **REQ-2.3** No SVG element carries `role="img"`, a `<title>`, a `<desc>`, or any interactive
  role attribute. Accessible names are provided by parent controls.
- **REQ-2.4** All strokes use `currentColor`. Fills must be either `"none"` (transparent) or
  `currentColor` where a small solid region meaningfully reinforces silhouette readability;
  no hardcoded colour hex/rgb values.
- **REQ-2.5** No SVG `id` attributes, no `<defs>`, no `<use>`, no `<symbol>`, no
  `dangerouslySetInnerHTML`, and no arbitrary HTML props spread onto SVG elements.
- **REQ-2.6** No external images, no `<image>` elements, no embedded font glyphs, no imported
  bitmap assets.

### REQ-3 CSS class

- **REQ-3.1** Every rendered SVG element has `className` set to `"detective-prop"` plus the
  caller-supplied `className` value (if provided), separated by a space. When `className` is
  absent the element carries exactly `"detective-prop"`.
- **REQ-3.2** The component introduces no new CSS file. Codex supplies styling for
  `.detective-prop` in the application stylesheet.

### REQ-4 Icon silhouettes

Each variant must be distinctly recognizable as its referent at 48 px, drawn from original
code-native SVG paths and shapes only.

- **REQ-4.1 `bell`** — a brass reception / concierge bell: a dome body, base plate, and a small
  button on top. No handle (a desk bell, not a hand bell). Stroke-only silhouette.
- **REQ-4.2 `key`** — an old skeleton key: circular bow (ring end) with a small circular cutout
  inside, a long narrow shaft, and two or three simple rectangular bits (teeth) extending from the
  blade end.
- **REQ-4.3 `camera`** — an antique folding / bellows camera: a trapezoidal or boxy outer body with
  a prominent circular lens in the centre and a simple rectangular viewfinder or handle detail.
  Stroke-only silhouette.
- **REQ-4.4 `seal`** — a scalloped wax seal circle: a circle with a scalloped or serrated outer
  edge and a simple check-mark (✓) drawn inside. No text baked into paths.
- **REQ-4.5 `pin`** — a map pushpin / thumbtack: a circular head at the top and a triangular or
  tapered spike pointing downward.
- **REQ-4.6 `footprints`** — two detective shoe-print silhouettes, one left and one right, arranged
  diagonally as if mid-stride. Each footprint is a simple filled oval-ish sole shape with a rounded
  toe end. No toes, no laces.
- **REQ-4.7 `crest`** — a detective crest combining two elements: a small deerstalker cap outline
  at the top and a magnifying glass outline below, arranged within the 48×48 canvas as a unified
  emblem. No pipe, no gun, no realistic eye.

### REQ-5 Prohibited content

- **REQ-5.1** No pipe, no gun, no realistic human eye.
- **REQ-5.2** No locale, game-state, guilt, solver, network, storage, animation, or event handling.
- **REQ-5.3** No import of any application module (engine, AI, server, locale, storage, Game, etc.).
- **REQ-5.4** No test that merely copies static SVG path strings back and asserts equality; tests
  are not part of the Kiro scope for this feature (spec only).

### REQ-6 Attribution and scope

- **REQ-6.1** `src/components/DetectiveProp.tsx` is Kiro work.
- **REQ-6.2** App integration (CSS, layout, import into scene components) is Codex work.
- **REQ-6.3** No existing file — including `Game.tsx`, `GameIcon.tsx`, and any page or layout — is
  modified by Kiro.
