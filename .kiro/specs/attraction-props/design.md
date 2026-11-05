# Attraction Props — Design

**Feature:** Reusable decorative SVG icon component.  
**Author:** Kiro (2026-11-04).

---

## Component: `src/components/DetectiveProp.tsx`

### Props interface

```ts
type Kind = 'bell' | 'key' | 'camera' | 'seal' | 'pin' | 'footprints' | 'crest';

type Props = {
  kind: Kind;
  className?: string;
};
```

### Rendering model

The component is a pure function with no state, effects, or browser APIs.
No `'use client'` directive is used; it renders as a Server Component in Next.js App Router.

```tsx
export default function DetectiveProp({ kind, className }: Props) {
  const cls = className ? `detective-prop ${className}` : 'detective-prop';
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      aria-hidden="true"
      focusable="false"
      className={cls}
    >
      {ICONS[kind]}
    </svg>
  );
}
```

All SVG defaults (`fill="none"`, `stroke="currentColor"`, rounded joins/caps, `strokeWidth`)
are set on the root element. Individual shapes override only where necessary
(e.g. `fill="currentColor"` for the footprints silhouette).

### Icon dictionary

Each entry is a JSX fragment (`<>…</>`). No SVG `id` attributes are used anywhere.

---

#### `bell` — concierge desk bell

Geometry:
- Dome: a wide arc/path forming a half-ellipse bell body, widest at the base (~36 px wide),
  narrowing to a small nub at the top centre.
- Base plate: a horizontal `<rect>` bar beneath the dome, slightly wider than the dome base.
- Button: a small `<circle>` at the apex of the dome.

Key coordinates (centred at x=24, within 4 px margin):
```
dome:    M8 34 Q8 14 24 14 Q40 14 40 34
base:    rect x=6 y=34 w=36 h=4 rx=2
button:  circle cx=24 cy=14 r=2
clapper strike line: line from (14,34) to (34,34) inside dome
```

#### `key` — skeleton key

Geometry:
- Bow (ring): `<circle>` at top-left region, radius ~9, stroke only.
- Inner cutout: smaller `<circle>` inside bow, radius ~4.
- Shaft: a `<line>` or narrow rect running right from the bow to the blade end.
- Bits (teeth): two or three short `<line>` segments perpendicular to the shaft near the blade end,
  extending downward.

Key coordinates (bow centred at x=14, y=18):
```
bow outer:  circle cx=14 cy=18 r=9
bow hole:   circle cx=14 cy=18 r=4
shaft:      line x1=23 y1=18 x2=42 y2=18
bit 1:      line x1=32 y1=18 x2=32 y2=24
bit 2:      line x1=38 y1=18 x2=38 y2=22
```

#### `camera` — antique folding camera

Geometry:
- Body: a slightly trapezoidal `<rect>` or `<path>` for the main box.
- Lens: a `<circle>` centred on the body front.
- Inner lens ring: a smaller concentric `<circle>`.
- Viewfinder: a small `<rect>` on the top-right corner of the body.

Key coordinates (body centred at x=24, y=26):
```
body:       rect x=8 y=18 w=32 h=22 rx=2
lens outer: circle cx=24 cy=29 r=8
lens inner: circle cx=24 cy=29 r=4
viewfinder: rect x=30 y=13 w=8 h=6 rx=1
connector:  line x1=34 y1=18 x2=34 y2=19
```

#### `seal` — scalloped wax seal

Geometry:
- Scalloped edge: a `<path>` drawing a circle with 12 outward bumps (sinusoidal scallop or
  arc-per-bump approach, approximated with cubic beziers).
- Inner smooth circle: a `<circle>` at reduced radius to frame the mark.
- Check mark: a `<path>` forming a ✓ inside the inner circle.

Key coordinates (centred at x=24, y=24, outer scallop radius ~20, inner circle radius ~14):
```
scallop: path with 12 bumps around cx=24 cy=24
inner:   circle cx=24 cy=24 r=13
check:   M16 24 L21 30 L32 17
```

The scallop path uses 12 arc segments. Each segment alternates between a point at radius 20
and a dip to radius 15, producing a crenellated crown effect.

#### `pin` — map pushpin

Geometry:
- Head: a `<circle>` at top-centre, radius ~7, filled with `currentColor` for visual weight.
- Shaft: a narrow `<line>` or `<path>` from the bottom of the head to a sharp point.
- Optional: a small shadow ellipse beneath the tip.

Key coordinates (centred at x=24):
```
head:   circle cx=24 cy=14 r=7  fill=currentColor
shaft:  M24 21 L24 42
tip shadow: ellipse cx=24 cy=42 rx=3 ry=1 (optional, fill=currentColor opacity=0.3)
```

#### `footprints` — two detective shoe prints

Geometry:
- Two sole shapes, filled with `currentColor` (silhouette icons at small size read better filled).
- Left foot: a rounded `<ellipse>` or `<path>` rotated ~20° counter-clockwise, placed
  bottom-left of canvas.
- Right foot: mirrored, rotated ~20° clockwise, placed top-right of canvas, offset diagonally
  to suggest mid-stride.
- Each footprint: an outer rounded rectangle or oval ~9×16 px, with a slightly wider heel than toe.

Simplified approach — two `<path>` outlines using bezier curves:
```
left foot:  M10 38 C8 32 10 26 14 26 C18 26 20 32 18 38 C16 42 12 42 10 38 Z
right foot: M28 22 C26 16 28 10 32 10 C36 10 38 16 36 22 C34 26 30 26 28 22 Z
```
Both with `fill="currentColor"` and `stroke="none"`.

#### `crest` — detective crest (deerstalker + magnifier)

Geometry — two emblems arranged vertically within the canvas:

Deerstalker cap (top half, centred x=24, top at y=6):
- Crown: a dome arc from (10,22) up to (24,8) and back to (38,22).
- Front peak: a short curved brim projecting left from the crown base.
- Back peak: a short curved brim projecting right.
- Earflap tie: a small crossing `<line>` or `<path>` at the very top of the crown.

Magnifying glass (bottom half, centred x=24, y=36):
- Lens: `<circle>` cx=22 cy=36 r=7.
- Handle: a `<line>` from ~(27,41) to (34,46), strokeWidth=3.

Combined, the deerstalker sits above the magnifier glass to form a simple two-element crest emblem.

---

### TypeScript types

`Kind` is a union of seven string literals. The `ICONS` object is typed
`Record<Kind, JSX.Element>` to give exhaustiveness checking — if a variant is added to the
union but not the record, TypeScript will error.

```ts
const ICONS: Record<Kind, JSX.Element> = { bell: <>…</>, key: <>…</>, … };
```

---

## Integration notes (Codex work)

The items below are integration responsibilities owned by Codex, not by this Kiro file.

- Add `.detective-prop` CSS rule to `globals.css` (size, display, vertical-align, flex-shrink).
- Import and render `<DetectiveProp kind="bell" />` inside the theme-park entry button.
- Import and render `<DetectiveProp kind="camera" />` on the evidence-ticket upload control.
- Render `<DetectiveProp kind="crest" />` near the agency header.
- Any additional variants requested for specific controls.

No existing file is modified by Kiro as part of this feature.
