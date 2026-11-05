'use client';

/**
 * CrossExamination.tsx
 *
 * Original authorship: Codex. All game logic, routing, and component structure
 * belong to Codex. Do not attribute this file to Kiro.
 *
 * Ten-language secondary UI localization: Kiro (2026-10-31). The inline `t(ko, en)`
 * two-locale pattern has been replaced with a lookup into the secondary-ui catalogue,
 * which covers all ten supported locales. Component behaviour and game logic are
 * unchanged.
 * Codex integration: frozen-content language/direction boundaries for older shares.
 */

import { useRef, useState } from 'react';
// Codex integration (2026-11-04): Kiro-authored decorative prop only; dialogue is unchanged.
import DetectiveProp from './DetectiveProp';
import { t, fill } from '@/lib/i18n/secondary-ui';
import { getDirection } from '@/lib/i18n/locales';
import type { Locale, PublicSnapshot, SuspectId } from '@/lib/game';

type Props = {
  snapshot: PublicSnapshot;
  locale: Locale;
  completed: SuspectId[];
  onComplete: (id: SuspectId) => void;
  onSpeak: (id: SuspectId, line: string) => void;
};

/** Scripted cross-examination quotes the frozen official claims; it never judges a theory. */
export default function CrossExamination({ snapshot, locale, completed, onComplete, onSpeak }: Props) {
  const [selected, setSelected] = useState<SuspectId>();
  const [turn, setTurn] = useState(0);
  const [theories, setTheories] = useState<Partial<Record<SuspectId, string>>>({});
  const exchangeRef = useRef<HTMLDivElement>(null);

  const routes = snapshot.interrogations;
  if (!routes) return null;
  const route = selected ? routes[selected] : undefined;
  const name = (id: SuspectId) => snapshot.suspects.find(s => s.id === id)?.displayName ?? id;
  const contentLanguage = { lang: snapshot.locale, dir: getDirection(snapshot.locale) };

  function question(id: SuspectId) {
    setSelected(id); setTurn(0);
    onSpeak(id, routes![id].challenge);
    requestAnimationFrame(() => exchangeRef.current?.focus());
  }

  return (
    <section className="cross-examination" aria-labelledby="cross-title">
      <div className="evidence-title">
        <h2 id="cross-title">{t(locale, 'cross-title')}</h2>
        <span data-testid="exam-progress">
          {fill(t(locale, 'cross-progress'), { remaining: completed.length })}
        </span>
      </div>

      <p className="cross-intro">{t(locale, 'cross-intro')}</p>

      <div className="question-list">
        {snapshot.suspects.map((suspect, i) => (
          <button
            key={suspect.id}
            data-testid={`question-${suspect.id}`}
            aria-pressed={selected === suspect.id}
            onClick={() => question(suspect.id)}
          >
            <span className="question-number">{i + 1}</span>
            <span>
              <strong {...contentLanguage}>{suspect.displayName}</strong>
              <span {...contentLanguage}>{routes[suspect.id].question}</span>
            </span>
            <span className="question-status">{completed.includes(suspect.id) ? '✓' : '?'}</span>
          </button>
        ))}
      </div>

      {route && (
        <div
          className="exchange"
          ref={exchangeRef}
          tabIndex={-1}
          data-testid="exchange"
          aria-label={fill(t(locale, 'cross-hear-rebuttal'), { name: name(route.rebuttalSpeakerId) })}
        >
          <p className="detective-question">
            <b>{t(locale, 'cross-detective-label')}</b><span {...contentLanguage}>{route.question}</span>
          </p>

          <div className="dialogue-turn">
            <span {...contentLanguage}>{name(route.speakerId)}</span>
            <p {...contentLanguage}>{route.challenge}</p>
          </div>

          {turn === 0 ? (
            <button
              className="rebuttal-button"
              data-testid="hear-rebuttal"
              onClick={() => {
                setTurn(1);
                onSpeak(route.rebuttalSpeakerId, route.rebuttal);
              }}
            >
              {fill(t(locale, 'cross-hear-rebuttal'), { name: name(route.rebuttalSpeakerId) })}
              {' '}
              <span aria-hidden="true">!</span>
            </button>
          ) : (
            <>
              <div className="dialogue-turn objection" aria-live="polite">
                <span>
                  <span {...contentLanguage}>{name(route.rebuttalSpeakerId)}</span>{' '}
                  <b>{t(locale, 'cross-objection')}</b>
                </span>
                <p {...contentLanguage}>{route.rebuttal}</p>
              </div>

              <div className="citation-strip">
                <b>{t(locale, 'cross-compare-label')}</b>
                {route.citedStatementIds.map(id => {
                  const statement = snapshot.statements.find(s => s.id === id)!;
                  return (
                    <blockquote key={id} {...contentLanguage}>
                      <cite>{name(statement.speakerId)}</cite>
                      {statement.text}
                    </blockquote>
                  );
                })}
              </div>

              <div className="detective-note">
                <b>{t(locale, 'cross-note-label')}</b>
                <p {...contentLanguage}>{route.note}</p>
              </div>

              {turn < 2 ? (
                <button
                  className="secondary"
                  data-testid="save-note"
                  onClick={() => {
                    setTurn(2);
                    onComplete(route.speakerId);
                  }}
                >
                  {t(locale, 'cross-pin-button')} <DetectiveProp kind="pin"/>
                </button>
              ) : (
                <p className="note-saved" role="status">
                  ✓{' '}
                  {completed.length === 3
                    ? t(locale, 'cross-pinned-done')
                    : t(locale, 'cross-pinned-more')}
                </p>
              )}
            </>
          )}

          <small className="dialogue-rule">{t(locale, 'cross-dialogue-rule')}</small>
        </div>
      )}

      {completed.length > 0 && (
        <details className="notebook" open={completed.length === 3}>
          <summary>
            {fill(t(locale, 'cross-notebook-title'), {
              remaining: completed.length,
              total: 3,
            })}
          </summary>
          <p>{t(locale, 'cross-notebook-intro')}</p>
          {snapshot.suspects
            .filter(s => completed.includes(s.id))
            .map(s => (
              <div className="theory-row" key={s.id}>
                <label htmlFor={`theory-${s.id}`} {...contentLanguage}>{s.displayName}</label>
                <select
                  id={`theory-${s.id}`}
                  value={theories[s.id] ?? ''}
                  onChange={e => setTheories(v => ({ ...v, [s.id]: e.target.value }))}
                >
                  <option value="">{t(locale, 'cross-undecided')}</option>
                  <option value="true">{t(locale, 'cross-think-true')}</option>
                  <option value="false">{t(locale, 'cross-think-false')}</option>
                </select>
              </div>
            ))}
        </details>
      )}
    </section>
  );
}
