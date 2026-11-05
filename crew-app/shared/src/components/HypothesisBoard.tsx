'use client';

/**
 * HypothesisBoard.tsx — Player-owned manual deduction scratchpad.
 *
 * Original authorship: Kiro (2026-10-31). Hypothesis board feature (pure client
 * component, local state only, never reads solver/case/culprit identity).
 *
 * Ten-language secondary UI localization: Kiro (2026-10-31). The inline
 * two-locale `t(ko, en)` pattern has been replaced with a lookup into the
 * secondary-ui catalogue covering all ten supported locales. Component behaviour,
 * game invariants, and data flow are unchanged.
 *
 * The inherited application code (Game.tsx, CrossExamination.tsx, CSS, engine)
 * is Codex work. Codex is responsible for rendering this component and styling
 * the hypothesis-board / hypothesis-grid / hypothesis-card class names.
 * Codex integration: optional frozen-content language boundaries for older shares.
 */

import { useState } from 'react';
import { t, fill } from '@/lib/i18n/secondary-ui';
import { getDirection } from '@/lib/i18n/locales';
import { buildHypotheses, type Hypothesis, type HypothesisId } from '@/lib/game/hypothesis';
import type { Locale, Suspect, SuspectId } from '@/lib/game/types';

type Props = {
  suspects: readonly Suspect[];
  locale: Locale;
  contentLocale?: Locale;
  /** factLabels[0] = label for fact=false event; factLabels[1] = label for fact=true event. */
  factLabels: readonly [string, string];
};

/**
 * Manual six-world hypothesis board.
 *
 * Renders six toggleable cards representing every (culpritId × fact) world.
 * The player eliminates worlds they consider impossible; the board never
 * auto-eliminates or reveals which world is correct.
 */
export default function HypothesisBoard({ suspects, locale, contentLocale = locale, factLabels }: Props) {
  // Derive display order from the suspects array (mirrors publicSnapshot ordering).
  const displayOrder: SuspectId[] = suspects.map((s) => s.id as SuspectId);
  const hypotheses: Hypothesis[] = buildHypotheses(suspects, displayOrder);

  // Set of eliminated hypothesis IDs; never mutated — always replaced with a new Set.
  const [eliminated, setEliminated] = useState<Set<HypothesisId>>(new Set());

  function toggle(id: HypothesisId) {
    setEliminated((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function reset() {
    setEliminated(new Set());
  }

  const total = hypotheses.length; // always 6
  const remaining = total - eliminated.size;

  // The one remaining card — only meaningful when exactly one is left.
  const lastCard: Hypothesis | undefined =
    remaining === 1 ? hypotheses.find((h) => !eliminated.has(h.id)) : undefined;

  return (
    <section
      className="hypothesis-board"
      data-testid="hypothesis-board"
      aria-label={t(locale, 'hyp-board-aria')}
    >
      <h2>{t(locale, 'hyp-heading')}</h2>

      <p className="hypothesis-instruction">{t(locale, 'hyp-instruction')}</p>

      {/* Remaining count */}
      <p className="hypothesis-count" aria-live="polite">
        {fill(t(locale, 'hyp-count'), { remaining, total })}
        {remaining === 1 && lastCard && (
          <>
            {' — '}
            <strong>{t(locale, 'hyp-last-label')}</strong>
          </>
        )}
      </p>

      {/* Zero-remaining message */}
      {remaining === 0 && (
        <p className="hypothesis-empty" role="status">
          {t(locale, 'hyp-empty')}
        </p>
      )}

      <div className="hypothesis-grid">
        {hypotheses.map((h) => {
          const isEliminated = eliminated.has(h.id);
          const factLabel = h.fact ? factLabels[1] : factLabels[0];
          const statusText = isEliminated
            ? t(locale, 'hyp-status-eliminated')
            : t(locale, 'hyp-status-possible');
          const isLast = lastCard?.id === h.id;

          return (
            <button
              key={h.id}
              className="hypothesis-card"
              data-testid={`hypothesis-card-${h.id}`}
              aria-pressed={isEliminated}
              onClick={() => toggle(h.id)}
              type="button"
            >
              <span className="hypothesis-suspect" lang={contentLocale} dir={getDirection(contentLocale)}>{h.suspectDisplayName}</span>
              <span className="hypothesis-fact" lang={contentLocale} dir={getDirection(contentLocale)}>{factLabel}</span>
              <span className="hypothesis-status">{statusText}</span>
              {isLast && (
                <span className="hypothesis-last-label">
                  {t(locale, 'hyp-last-label')}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        className="hypothesis-reset"
        data-testid="hypothesis-reset"
        onClick={reset}
        type="button"
      >
        {t(locale, 'hyp-reset')}
      </button>
    </section>
  );
}
