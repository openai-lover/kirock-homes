'use client';

import type { Suspect, SuspectId } from '@/lib/game';
import { pointInPhoto } from '@/lib/image/normalize';
import { useRef, type CSSProperties } from 'react';

export const colors = ['#d9c18a', '#b9c6a8', '#c1b7ba'];

export function Face({ sleeping = false, talking = false, mood = 'idle', index = 0 }: {
  sleeping?: boolean; talking?: boolean; mood?: string; index?: number;
}) {
  const innocent = mood === 'innocent';
  const glance = mood === 'guilty' ? 3 : 0;
  const smile = innocent ? 'M50 64 Q60 54 70 64' : 'M49 57 Q60 69 71 57';
  const brows = innocent ? 'M29 18 L43 14 M77 14 L91 18' : 'M30 17 Q37 13 44 17 M76 17 Q83 13 90 17';
  return <svg viewBox="0 0 120 80" aria-hidden="true" className={`face face-${mood} ${talking ? 'talking' : ''}`} style={{ '--blink-delay': `${index * 1.4}s` } as CSSProperties}>
    {/* Flat ink-and-paper bean eyes, without large irises or anatomical detail. */}
    <g className={sleeping ? undefined : 'eyes'}>
      {sleeping ? <>
        <path d="M28 34 Q37 42 46 34 M74 34 Q83 42 92 34" stroke="#fff8e8" strokeWidth="7" />
        <path d="M28 34 Q37 42 46 34 M74 34 Q83 42 92 34" stroke="#182631" strokeWidth="3" />
      </> : <>
        <g className="pupils">
          <ellipse cx={37 + glance} cy="33" rx="7" ry="10" fill="#182631" stroke="#fff8e8" strokeWidth="4" />
          <ellipse cx={83 + glance} cy="33" rx="7" ry="10" fill="#182631" stroke="#fff8e8" strokeWidth="4" />
          <circle cx={35 + glance} cy="29" r="1.7" fill="#fff8e8" stroke="none" />
          <circle cx={81 + glance} cy="29" r="1.7" fill="#fff8e8" stroke="none" />
        </g>
        <path d={brows} stroke="#fff8e8" strokeWidth="6" />
        <path d={brows} stroke="#182631" strokeWidth="2.5" />
      </>}
    </g>
    {!sleeping && <>
      <g fill="#ef8248" stroke="none" opacity=".75"><ellipse cx="24" cy="49" rx="5" ry="2.5" /><ellipse cx="96" cy="49" rx="5" ry="2.5" /></g>
      <g className="mouth">{talking
        ? <ellipse cx="60" cy="61" rx="7" ry="6" fill="#182631" stroke="#fff8e8" strokeWidth="3.5" />
        : <><path d={smile} stroke="#fff8e8" strokeWidth="7" /><path d={smile} stroke="#182631" strokeWidth="3" /></>}
      </g>
    </>}
  </svg>;
}

type Props = {
  src: string; width: number; height: number; suspects: Suspect[];
  awake?: number; active?: SuspectId; editing?: boolean; selected?: SuspectId;
  result?: { culpritId: SuspectId; accusedId: SuspectId };
  onSelect?: (id: SuspectId) => void;
  onMove?: (id: SuspectId, x: number, y: number) => void;
  onPlace?: (x: number, y: number) => void;
  bubble?: string; label: string;
};

export default function PhotoStage(p: Props) {
  const speaker = p.suspects.find(s => s.id === p.active);
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: SuspectId; pointerId: number; moved: boolean; x: number; y: number } | null>(null);
  const interactive = Boolean(p.onSelect || (p.editing && p.onMove));
  return <div ref={ref} className={`photo-stage ${p.editing ? 'editable' : ''}`}
    data-photo-orientation={p.width > p.height ? 'landscape' : p.width < p.height ? 'portrait' : 'square'}
    data-photo-editing={Boolean(p.editing)}
    style={{ aspectRatio: `${p.width}/${p.height}`, containerType: 'inline-size' }}
    onClick={e => {
      if (p.editing && e.target === e.currentTarget) {
        const q = pointInPhoto(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect());
        p.onPlace?.(q.x, q.y);
      }
    }}>
    {/* This image and the SVG overlays share one normalized coordinate plane. */}
    <img src={p.src} alt={p.label} draggable={false} />
    {p.suspects.map((s, i) => {
      const faceWidth = s.face.scale * Math.min(p.width, p.height) / p.width;
      const labelCenter = Math.max(.2, Math.min(.8, s.face.x));
      const actorStyle = {
        left: `${s.face.x * 100}%`, top: `${s.face.y * 100}%`, width: `${faceWidth * 100}%`,
        '--actor-color': colors[i], transform: 'translate(-50%, -50%)',
      } as CSSProperties;
      const className = `actor ${p.active === s.id ? 'is-speaking' : ''} ${p.selected === s.id ? 'is-selected' : ''}`;
      // Clamp the name to the photo, independently of the face's size and tilt.
      const labelStyle: CSSProperties = {
        left: `${50 + (labelCenter - s.face.x) / faceWidth * 100}%`,
        top: s.face.y > .8 ? 'auto' : '100%', bottom: s.face.y > .8 ? '100%' : undefined,
        maxWidth: 'min(140px, 36cqw)', width: 'max-content', transform: 'translateX(-50%)',
      };
      const content = <>
        <span className="actor-face-tilt" style={{ display: 'block', transform: `rotate(${s.face.rotation}deg)` }}>
          <Face sleeping={p.editing || i >= (p.awake ?? 3)} talking={p.active === s.id}
            mood={p.result ? (s.id === p.result.culpritId ? 'guilty' : s.id === p.result.accusedId ? 'innocent' : 'idle') : 'idle'} index={i} />
        </span>
        <span className="actor-label" style={labelStyle} aria-hidden="true"><b style={{ flexShrink: 0 }}>{i + 1}</b><span className="actor-name" style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.displayName}</span></span>
      </>;
      if (!interactive) return <div key={s.id} data-testid={`face-${s.id}`} className={className} style={actorStyle} aria-hidden="true">{content}</div>;
      return <button type="button" key={s.id} data-testid={`face-${s.id}`} aria-label={s.displayName}
        aria-pressed={p.selected === undefined ? undefined : p.selected === s.id} title={s.displayName} className={className} style={actorStyle}
        onFocus={() => { if (p.editing) p.onSelect?.(s.id); }}
        onPointerDown={e => {
          if (!p.editing || e.button !== 0) return;
          e.preventDefault(); e.currentTarget.focus({ preventScroll: true });
          drag.current = { id: s.id, pointerId: e.pointerId, moved: false, x: e.clientX, y: e.clientY };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={e => {
          if (!drag.current || drag.current.id !== s.id || drag.current.pointerId !== e.pointerId || !p.editing || !ref.current) return;
          if (Math.hypot(e.clientX - drag.current.x, e.clientY - drag.current.y) > 3) drag.current.moved = true;
          if (!drag.current.moved) return;
          const q = pointInPhoto(e.clientX, e.clientY, ref.current.getBoundingClientRect());
          p.onMove?.(s.id, q.x, q.y);
        }}
        onPointerUp={e => {
          if (!p.editing || drag.current?.pointerId !== e.pointerId || drag.current.id !== s.id) return;
          const moved = drag.current.moved; drag.current = null;
          if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
          if (!moved) p.onSelect?.(s.id);
        }}
        onPointerCancel={e => {
          if (drag.current?.pointerId === e.pointerId) drag.current = null;
          if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        onLostPointerCapture={e => { if (drag.current?.pointerId === e.pointerId) drag.current = null; }}
        onClick={e => { e.stopPropagation(); if (!p.editing) p.onSelect?.(s.id); }}
        onKeyDown={e => {
          if (!p.editing) return;
          const directions: Record<string, [number, number]> = { ArrowLeft: [-.01, 0], ArrowRight: [.01, 0], ArrowUp: [0, -.01], ArrowDown: [0, .01] };
          if (directions[e.key]) {
            e.preventDefault();
            p.onMove?.(s.id, Math.min(.96, Math.max(.04, s.face.x + directions[e.key][0])), Math.min(.96, Math.max(.04, s.face.y + directions[e.key][1])));
          }
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); p.onSelect?.(s.id); }
        }}>{content}</button>;
    })}
    {p.bubble && speaker && <div className="speech-bubble" aria-hidden="true" style={{ left: `${Math.max(.25, Math.min(.75, speaker.face.x)) * 100}%`, top: `${Math.max(.12, speaker.face.y - speaker.face.scale * .55) * 100}%` }}>{p.bubble}</div>}
  </div>;
}
