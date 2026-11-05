import assert from 'node:assert/strict';
import test from 'node:test';
import { SUPPORTED_LOCALES } from '../src/lib/i18n/locales';
import { UI_MESSAGES, uiText, type UiKey } from '../src/lib/i18n/ui';

const keys = Object.keys(UI_MESSAGES) as UiKey[];
const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();

test('every game UI message explicitly supplies every supported language', () => {
  assert.deepEqual(SUPPORTED_LOCALES, ['en', 'ko', 'es', 'fr', 'de', 'pt', 'ja', 'zh', 'ar', 'hi']);
  for (const key of keys) {
    const row = UI_MESSAGES[key];
    assert.deepEqual(Object.keys(row).sort(), [...SUPPORTED_LOCALES].sort(), key);
    for (const locale of SUPPORTED_LOCALES) {
      assert.ok(row[locale].trim().length > 0, `${locale}: ${key}`);
      assert.equal(uiText(locale, key), row[locale], `${locale}: ${key}`);
    }
  }
});

test('translations preserve the same interpolation variables as the English source', () => {
  for (const key of keys) {
    const expected = placeholders(UI_MESSAGES[key].en);
    for (const locale of SUPPORTED_LOCALES) {
      assert.deepEqual(placeholders(UI_MESSAGES[key][locale]), expected, `${locale}: ${key}`);
      const rendered = uiText(locale, key, { name: 'Café', number: 3, date: '2030-01-01', language: '日本語' });
      assert.deepEqual(placeholders(rendered), [], `${locale}: unresolved variable in ${key}`);
    }
  }
});

test('interpolation preserves a player name verbatim without interpreting its contents', () => {
  const name = '{number} <Cup> $& — чашка';
  for (const locale of SUPPORTED_LOCALES) {
    const accusation = uiText(locale, 'Accuse {name}!', { name, number: 3 });
    const testimony = uiText(locale, 'Statement by {name}', { name, number: 3 });
    assert.ok(accusation.includes(name), locale);
    assert.ok(testimony.includes(name), locale);
    assert.equal(accusation.split(name).length, 2, locale);
  }
});
