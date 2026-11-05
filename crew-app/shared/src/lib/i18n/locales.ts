/** Shared language registry. Selecting a language never changes the mystery. */
export const SUPPORTED_LOCALES = ['en', 'ko', 'es', 'fr', 'de', 'pt', 'ja', 'zh', 'ar', 'hi'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALES: ReadonlyArray<{ code: Locale; name: string; dir: 'ltr' | 'rtl' }> = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'ko', name: '한국어', dir: 'ltr' },
  { code: 'es', name: 'Español', dir: 'ltr' },
  { code: 'fr', name: 'Français', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', dir: 'ltr' },
  { code: 'pt', name: 'Português', dir: 'ltr' },
  { code: 'ja', name: '日本語', dir: 'ltr' },
  { code: 'zh', name: '简体中文', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'hi', name: 'हिन्दी', dir: 'ltr' },
];
export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
export function getDirection(locale: Locale): 'ltr' | 'rtl' { return locale === 'ar' ? 'rtl' : 'ltr'; }
