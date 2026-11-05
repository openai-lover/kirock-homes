'use client';

/**
 * DetectiveAside.tsx — Stage-contextual guidance panel for Kirock Homes.
 *
 * Original authorship: Kiro (2026-10-31). English and Korean.
 * Ten-language extension: Kiro (2026-10-31). Added es / fr / de / pt / ja / zh / ar / hi
 * to the heading via the secondary-ui catalogue; detective-voice.ts handles stage copy.
 *
 * A compact, purely presentational aside that pairs the /art/kirolock-homes.png
 * mascot image (72 × 72, decorative) with stage-scoped detective guidance.
 * Receives stage and locale as props; holds no state and makes no network requests.
 *
 * The notebook title is rendered as <strong class="detective-aside-title"> rather
 * than a heading element, so Codex retains full control of the document outline.
 *
 * Class names (detective-aside, detective-aside-mascot, detective-aside-copy,
 * detective-aside-title, detective-aside-line) and the data-testid/data-stage
 * attributes are defined here; all styling is Codex's responsibility.
 *
 * The image filename /art/kirolock-homes.png is intentionally historical and does
 * not reflect the current "Kirock" brand spelling — it is not an error to fix.
 *
 * Attribution note: The inherited application (engine, Game.tsx, CSS, server routes,
 * CrossExamination.tsx) is Codex work. The hypothesis board module and component are
 * prior Kiro CLI work. This component and detective-voice.ts are Kiro work.
 */

import { t } from '@/lib/i18n/secondary-ui';
import { getDetectiveVoice, type DetectiveStage } from '@/lib/ui/detective-voice';
import type { Locale } from '@/lib/game/types';

// Re-export so consumers can import the stage type from this file if preferred.
export type { DetectiveStage };

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type DetectiveAsideProps = {
  stage: DetectiveStage;
  locale: Locale;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * DetectiveAside
 *
 * Renders a compact aside with:
 *   - The Kirock Homes mascot image (decorative, empty alt, aria-hidden, 72 × 72)
 *   - A notebook title as <strong> (from the secondary-ui catalogue, all ten locales)
 *   - A short stage guidance line (from detective-voice.ts, all ten locales)
 *
 * No correct/incorrect, guilt, suspect identity, case data, statement content,
 * solver, or private-answer information is accepted or displayed.
 *
 * The `data-stage` attribute on the aside element helps browser verification
 * confirm the active stage without inspecting copy text.
 */
export default function DetectiveAside({ stage, locale }: DetectiveAsideProps) {
  const copy = getDetectiveVoice(stage, locale);
  const heading = t(locale, 'aside-heading');

  return (
    <aside
      className="detective-aside"
      data-testid="detective-aside"
      data-stage={stage}
      aria-label={heading}
    >
      {/*
        Decorative mascot image.
        - alt="" marks it as decorative for screen readers.
        - aria-hidden="true" prevents the empty alt from creating a redundant
          focusable element in some AT implementations.
        - Explicit width/height prevent layout shift (CLS).
        - The filename kirolock-homes.png is historical; see file header note.
      */}
      <img
        className="detective-aside-mascot"
        src="/art/kirolock-homes.png"
        alt=""
        aria-hidden="true"
        width={72}
        height={72}
        decoding="async"
      />

      <div className="detective-aside-copy">
        {/*
          Notebook title rendered as <strong> rather than a heading element,
          per Codex integration guidance. This avoids introducing a heading
          into the document outline that Codex cannot control from Game.tsx.
          The <aside>'s aria-label already identifies the region for AT.
        */}
        <strong className="detective-aside-title">{heading}</strong>

        {/*
          Stage guidance line.
          Not a live region: the aside updates as the player moves between
          phases, but changes are driven by deliberate player navigation rather
          than background activity, so aria-live would announce unnecessarily.
          Codex may add role="status" if integration evidence shows a need.
        */}
        <p className="detective-aside-line">{copy.line}</p>
      </div>
    </aside>
  );
}
