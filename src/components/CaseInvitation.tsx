'use client';

import { useState } from 'react';
import type { Locale, Suspect, SuspectId } from '@/lib/game';
import { getDetectiveCopy, getPreviewBanter } from '@/lib/i18n/detective';
import { uiText } from '@/lib/i18n/ui';
import PhotoStage from './PhotoStage';
import GameIcon from './GameIcon';

type Props = { locale: Locale; src: string; width: number; height: number; suspects: Suspect[]; shared: boolean };

/** A toy introduction, deliberately isolated from the case and its answer. */
export default function CaseInvitation({ locale, src, width, height, suspects, shared }: Props) {
  const [speaking, setSpeaking] = useState<SuspectId>();
  const copy = getDetectiveCopy(locale);
  const actor = suspects.find(suspect => suspect.id === speaking);
  const banter = !shared && speaking ? getPreviewBanter(locale, speaking) : undefined;

  return <section className="case-invitation" data-testid="detective-preview" aria-label={shared ? copy.yourCase : copy.inspect}>
    <div className="invitation-tab"><GameIcon name="folder"/><span>{copy.caseFile}</span><b aria-hidden="true">{shared ? '↗' : '01'}</b></div>
    <div className="desk-preview">
      <div className="invitation-heading"><span>{shared ? copy.yourCase : copy.sampleCase}</span><GameIcon name="search"/></div>
      <PhotoStage src={src} width={width} height={height} suspects={suspects} awake={3}
        active={shared ? undefined : speaking}
        label={uiText(locale, shared ? 'Your friend’s shared case photo' : 'Sample desk with a cup, lamp and keyboard')}
        onSelect={shared ? undefined : setSpeaking}/>
      {!shared && <>
        <div className="preview-suspects" aria-label={copy.suspects}>
          {suspects.map((suspect, index) => <button key={suspect.id} data-testid={`preview-${suspect.id}`}
            aria-pressed={speaking === suspect.id} onClick={() => setSpeaking(suspect.id)}>
            <span>{index + 1}</span>{suspect.displayName}
          </button>)}
        </div>
        <div className="preview-banter" aria-live="polite" aria-atomic="true" data-testid="preview-banter">
          {actor && <strong>{actor.displayName}</strong>}
          <p>{banter ?? copy.previewHint}</p>
          {banter && <small>{uiText(locale, 'Banter · not evidence')}</small>}
        </div>
      </>}
    </div>
  </section>;
}
