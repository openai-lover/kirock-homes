// src/components/DetectiveProp.tsx
// Author: Kiro (2026-11-04).
// Decorative SVG prop icons for the Sherlock detective theme-park interface.
// No state, effects, event handling, locale, solver, storage, or network.
// Codex review: compatible with server rendering and imports from client components.

import type React from 'react';

type Kind =
  | 'bell'
  | 'key'
  | 'camera'
  | 'seal'
  | 'pin'
  | 'footprints'
  | 'crest';

type Props = {
  kind: Kind;
  className?: string;
};

// ---------------------------------------------------------------------------
// Icon shapes
// Each value is the inner JSX for the <svg> root.
// Rules for every icon:
//   - viewBox coordinates are within 0 0 48 48
//   - strokes use currentColor (inherited from root)
//   - fills are "none" unless a solid silhouette meaningfully aids readability
//   - no id attributes, no <defs>, no <use>
// ---------------------------------------------------------------------------

const Bell = () => (
  <>
    {/* Dome body */}
    <path d="M8 34 Q8 12 24 12 Q40 12 40 34" />
    {/* Base plate */}
    <rect x="5" y="34" width="38" height="5" rx="2.5" />
    {/* Apex button */}
    <circle cx="24" cy="12" r="2.5" />
    {/* Striker line inside dome */}
    <line x1="14" y1="34" x2="34" y2="34" />
  </>
);

const Key = () => (
  <>
    {/* Bow outer ring */}
    <circle cx="14" cy="20" r="9" />
    {/* Bow cutout */}
    <circle cx="14" cy="20" r="4" />
    {/* Shaft */}
    <line x1="23" y1="20" x2="42" y2="20" />
    {/* Bit 1 (closer to tip) */}
    <line x1="34" y1="20" x2="34" y2="27" />
    {/* Bit 2 (at tip) */}
    <line x1="39" y1="20" x2="39" y2="24" />
    {/* Bit 3 (near bow) */}
    <line x1="28" y1="20" x2="28" y2="25" />
  </>
);

const Camera = () => (
  <>
    {/* Main body */}
    <rect x="6" y="18" width="36" height="24" rx="2" />
    {/* Outer lens ring */}
    <circle cx="24" cy="30" r="9" />
    {/* Inner lens */}
    <circle cx="24" cy="30" r="5" />
    {/* Viewfinder box on top-right */}
    <rect x="29" y="12" width="10" height="7" rx="1" />
    {/* Connector from viewfinder down to body */}
    <line x1="34" y1="19" x2="34" y2="18" />
    {/* Shutter button */}
    <rect x="10" y="14" width="8" height="5" rx="1" />
    <line x1="14" y1="18" x2="14" y2="18" />
  </>
);

// Scalloped seal: 12-point path approximated with arc commands.
// Inner smooth circle frames the check mark.
const SEAL_PATH =
  // 12 outward bumps alternating r=20 (tip) and r=14 (valley) around cx=24 cy=24
  // Generated analytically: angle step = 30°, tips at multiples of 30°, valleys between
  'M44 24 ' +
  'A4 4 0 0 0 41.66 17.02 ' +
  'A4 4 0 0 0 34.98 10.34 ' +
  'A4 4 0 0 0 28 8 ' +
  'A4 4 0 0 0 21.02 10.34 ' +
  'A4 4 0 0 0 14.34 17.02 ' +
  'A4 4 0 0 0 12 24 ' +
  'A4 4 0 0 0 14.34 30.98 ' +
  'A4 4 0 0 0 21.02 37.66 ' +
  'A4 4 0 0 0 28 40 ' +
  'A4 4 0 0 0 34.98 37.66 ' +
  'A4 4 0 0 0 41.66 30.98 ' +
  'A4 4 0 0 0 44 24 Z';

const Seal = () => (
  <>
    {/* Scalloped outer edge — 12 arc bumps */}
    <path d={SEAL_PATH} />
    {/* Inner framing circle */}
    <circle cx="24" cy="24" r="11" />
    {/* Check mark ✓ */}
    <polyline points="16,24 21,30 32,17" />
  </>
);

const Pin = () => (
  <>
    {/* Head — filled for visual weight */}
    <circle cx="24" cy="14" r="8" fill="currentColor" stroke="none" />
    {/* Inner highlight ring */}
    <circle cx="24" cy="14" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    {/* Shaft tapering to point */}
    <path d="M21 21 L24 44 L27 21" />
  </>
);

// Two filled footprint silhouettes arranged diagonally, no toes or laces.
const Footprints = () => (
  <>
    {/* Left foot — lower-left, angled slightly left */}
    <ellipse
      cx="15"
      cy="35"
      rx="5.5"
      ry="9"
      fill="currentColor"
      stroke="none"
      transform="rotate(-15 15 35)"
    />
    {/* Right foot — upper-right, angled slightly right */}
    <ellipse
      cx="33"
      cy="15"
      rx="5.5"
      ry="9"
      fill="currentColor"
      stroke="none"
      transform="rotate(15 33 15)"
    />
  </>
);

const Crest = () => (
  <>
    {/* --- Deerstalker cap (top half) --- */}
    {/* Crown dome */}
    <path d="M10 22 Q12 6 24 6 Q36 6 38 22" />
    {/* Crown base brim line */}
    <line x1="10" y1="22" x2="38" y2="22" />
    {/* Front peak (left brim) */}
    <path d="M10 22 Q6 23 8 26 Q10 24 12 23" />
    {/* Back peak (right brim) */}
    <path d="M38 22 Q42 23 40 26 Q38 24 36 23" />
    {/* Ear-flap bow at crown top */}
    <line x1="22" y1="6" x2="26" y2="6" />

    {/* --- Magnifying glass (bottom half) --- */}
    {/* Lens circle */}
    <circle cx="21" cy="36" r="7" />
    {/* Handle */}
    <line x1="26" y1="41" x2="34" y2="46" strokeWidth="3" />
  </>
);

// ---------------------------------------------------------------------------
// Icon lookup — Record<Kind, React.ReactElement> gives exhaustiveness at compile time.
// ---------------------------------------------------------------------------
const ICONS: Record<Kind, React.ReactElement> = {
  bell: <Bell />,
  key: <Key />,
  camera: <Camera />,
  seal: <Seal />,
  pin: <Pin />,
  footprints: <Footprints />,
  crest: <Crest />,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function DetectiveProp({ kind, className }: Props) {
  const cls = className ? `detective-prop ${className}` : 'detective-prop';
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable={false}
      className={cls}
    >
      {ICONS[kind]}
    </svg>
  );
}
