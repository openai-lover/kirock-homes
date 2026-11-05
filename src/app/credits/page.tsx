'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_LOCALE, LOCALES, getDirection, isLocale, type Locale } from '@/lib/i18n/locales';
import { chatCopy } from '@/lib/chat/copy';
import { CREDITS_COPY } from '@/lib/i18n/credits';

export default function Credits() {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const copy = CREDITS_COPY[locale];

  useEffect(() => {
    try {
      const saved = localStorage.getItem('kirock:locale');
      if (isLocale(saved)) setLocale(saved);
    } catch { /* English remains available when browser storage is blocked. */ }
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = getDirection(locale);
  }, [locale]);

  function chooseLocale(value: string) {
    if (!isLocale(value)) return;
    setLocale(value);
    try { localStorage.setItem('kirock:locale', value); }
    catch { /* The chosen language still applies for this visit. */ }
  }

  return <main className="credits" dir={getDirection(locale)}>
    <a href="/" aria-label={copy.back}>{getDirection(locale) === 'rtl' ? '→' : '←'} <bdi>{copy.brand}</bdi></a>
    <label className="language-setting">
      <span>{copy.language}</span>
      <select data-testid="language-select" value={locale} onChange={event => chooseLocale(event.target.value)}>
        {LOCALES.map(option => <option key={option.code} value={option.code} lang={option.code} dir={option.dir}>{option.name}</option>)}
      </select>
    </label>
    <h1>{copy.title}</h1>
    <h2>{copy.photoHeading}</h2>
    <p>{copy.photo}</p>
    <p><a href="https://www.pexels.com/photo/a-lamp-on-a-computer-desk-10922370/">{copy.originalPhoto}</a> · <a href="https://www.pexels.com/license/">{copy.photoLicense}</a></p>
    <h2>{copy.characterHeading}</h2>
    <p>{copy.character}</p>
    <p>{copy.contribution}</p>
    <h2>{copy.artHeading}</h2>
    <p>{copy.art}</p>
    <p>{copy.fonts} <a href="https://github.com/google/fonts/tree/main/ofl/cormorantgaramond">Cormorant Garamond</a> · <a href="https://github.com/google/fonts/tree/main/ofl/nanummyeongjo">Nanum Myeongjo</a></p>
    <h2>{copy.privacyHeading}</h2>
    <p>{copy.local}</p>
    <p>{copy.sharing}</p>
    <p>{copy.expiry}</p>
    <p>{copy.ai}</p><p>{chatCopy(locale).consentDetail}</p>
    <p>{copy.copies}</p>
  </main>;
}
