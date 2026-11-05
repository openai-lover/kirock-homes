import type { Locale } from '@/lib/game';
import { uiText } from '@/lib/i18n/ui';

/** Character and live lettering form one localized logo. No game state. */
export default function KirockLogo({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const name = <>{uiText(locale, 'Kirock')}<span>{' '}{uiText(locale, 'Homes')}</span></>;
  return <div className={`kirock-logo ${compact ? 'logo-compact' : 'logo-hero'}`}>
    <img src={compact ? '/art/kirock-logo-small.webp' : '/art/kirock-logo-mark.webp'}
      data-testid={compact ? 'brand-character' : 'detective-host'}
      alt="" width={640} height={640} fetchPriority={compact ? undefined : 'high'}/>
    {compact ? <span className="logo-name">{name}</span> : <h1 className="logo-name">{name}</h1>}
  </div>;
}
