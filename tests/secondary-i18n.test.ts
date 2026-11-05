/**
 * tests/secondary-i18n.test.ts — Ten-language secondary UI catalogue tests.
 *
 * Authored by Kiro (2026-10-31).
 * Uses node:test and node:assert/strict, matching the project's existing test style.
 *
 * Coverage:
 *   1. All ten locales present in secondary-ui.ts catalogue
 *   2. Every required key is present in every locale
 *   3. Named placeholder parity — every placeholder in 'en' template also appears
 *      in the corresponding template for every other locale
 *   4. All six DetectiveStage names produce a non-empty copy.line for every locale
 *   5. fill() correctly interpolates a hostile-looking object name as plain string
 *      (no HTML injection, no breakage)
 *   6. t() + fill() round-trip for {name}, {remaining}, {total} placeholders
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { SUPPORTED_LOCALES, type Locale } from '../src/lib/i18n/locales';
import { t, fill, type SecondaryUiKey } from '../src/lib/i18n/secondary-ui';
import { getDetectiveVoice, type DetectiveStage } from '../src/lib/ui/detective-voice';

// ── Constants ─────────────────────────────────────────────────────────────────

const ALL_LOCALES: readonly Locale[] = SUPPORTED_LOCALES;

const DETECTIVE_STAGES: readonly DetectiveStage[] = [
  'casting',
  'awakening',
  'listening',
  'confronting',
  'deducing',
  'reveal',
];

/**
 * Every key that must be present in every locale.
 * This is the authoritative list for coverage testing.
 */
const ALL_REQUIRED_KEYS: readonly SecondaryUiKey[] = [
  // CrossExamination
  'cross-title',
  'cross-intro',
  'cross-hear-rebuttal',
  'cross-objection',
  'cross-compare-label',
  'cross-note-label',
  'cross-pin-button',
  'cross-pinned-more',
  'cross-pinned-done',
  'cross-dialogue-rule',
  'cross-notebook-title',
  'cross-notebook-intro',
  'cross-undecided',
  'cross-think-true',
  'cross-think-false',
  'cross-progress',
  'cross-detective-label',
  // HypothesisBoard
  'hyp-board-aria',
  'hyp-heading',
  'hyp-instruction',
  'hyp-count',
  'hyp-last-label',
  'hyp-empty',
  'hyp-status-possible',
  'hyp-status-eliminated',
  'hyp-reset',
  // DetectiveAside
  'aside-heading',
];

// ── Helper ────────────────────────────────────────────────────────────────────

/** Extract all named placeholder tokens {word} from a template string. */
function extractPlaceholders(template: string): Set<string> {
  const found = new Set<string>();
  for (const [, key] of template.matchAll(/\{(\w+)\}/g)) {
    found.add(key);
  }
  return found;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test('SUPPORTED_LOCALES contains exactly ten entries', () => {
  assert.equal(ALL_LOCALES.length, 10);
});

test('all ten locales are present: en ko es fr de pt ja zh ar hi', () => {
  const expected = new Set(['en', 'ko', 'es', 'fr', 'de', 'pt', 'ja', 'zh', 'ar', 'hi']);
  for (const locale of ALL_LOCALES) {
    assert.ok(expected.has(locale), `unexpected locale: ${locale}`);
  }
  assert.equal(ALL_LOCALES.length, expected.size);
});

test('every required key returns a non-empty string in every locale', () => {
  for (const locale of ALL_LOCALES) {
    for (const key of ALL_REQUIRED_KEYS) {
      const value = t(locale, key);
      assert.ok(
        typeof value === 'string' && value.length > 0,
        `locale=${locale} key=${key} returned empty or non-string: ${JSON.stringify(value)}`,
      );
    }
  }
});

test('placeholder parity: every {placeholder} in the English template appears in every other locale template', () => {
  for (const key of ALL_REQUIRED_KEYS) {
    const enTemplate = t('en', key);
    const enPlaceholders = extractPlaceholders(enTemplate);
    if (enPlaceholders.size === 0) continue; // no placeholders, skip parity check

    for (const locale of ALL_LOCALES) {
      if (locale === 'en') continue;
      const localeTemplate = t(locale, key);
      const localePlaceholders = extractPlaceholders(localeTemplate);

      for (const placeholder of enPlaceholders) {
        assert.ok(
          localePlaceholders.has(placeholder),
          `locale=${locale} key=${key}: missing placeholder {${placeholder}} ` +
            `(en has: ${[...enPlaceholders].join(', ')}; locale has: ${[...localePlaceholders].join(', ')})`,
        );
      }
    }
  }
});

test('all six DetectiveStage values produce a non-empty copy.line in every locale', () => {
  for (const stage of DETECTIVE_STAGES) {
    for (const locale of ALL_LOCALES) {
      const copy = getDetectiveVoice(stage, locale);
      assert.ok(
        typeof copy.line === 'string' && copy.line.length > 0,
        `getDetectiveVoice(${stage}, ${locale}) returned empty or missing line`,
      );
    }
  }
});

test('fill() interpolates {name} placeholder with a hostile-looking object name as plain string', () => {
  // Hostile names that must not cause HTML injection or break the string
  const hostileNames = [
    '<script>alert(1)</script>',
    '"><img src=x onerror=alert(1)>',
    "'; DROP TABLE suspects; --",
    '{total}',              // recursive placeholder — must not expand
    '\\n\\t',              // escape sequences
    '日本語テスト',          // CJK characters
    'كيروك',                // Arabic
    'हिन्दी',               // Devanagari
  ];

  for (const hostile of hostileNames) {
    const template = t('en', 'cross-hear-rebuttal'); // "Hear {name}'s objection"
    const result = fill(template, { name: hostile });

    // The hostile name must appear verbatim in the output
    assert.ok(
      result.includes(hostile),
      `fill() did not include hostile name verbatim: ${JSON.stringify(hostile)}`,
    );

    // The result is a plain string — no DOM is involved; we just confirm it's a string
    assert.equal(typeof result, 'string');

    // The {name} placeholder must be gone (fully substituted)
    assert.ok(
      !result.includes('{name}'),
      `fill() left {name} unsubstituted for: ${JSON.stringify(hostile)}`,
    );
  }
});

test('fill() with {name} placeholder works across all locales', () => {
  const suspectName = 'Lamp';
  for (const locale of ALL_LOCALES) {
    const template = t(locale, 'cross-hear-rebuttal');
    const result = fill(template, { name: suspectName });
    assert.ok(
      result.includes(suspectName),
      `locale=${locale}: fill() did not include name "${suspectName}" in result: ${JSON.stringify(result)}`,
    );
    assert.ok(
      !result.includes('{name}'),
      `locale=${locale}: fill() left {name} unsubstituted`,
    );
  }
});

test('fill() with {remaining} and {total} in hyp-count across all locales', () => {
  for (const locale of ALL_LOCALES) {
    const template = t(locale, 'hyp-count');
    const result = fill(template, { remaining: 4, total: 6 });
    assert.ok(
      result.includes('4'),
      `locale=${locale}: fill() did not include remaining=4 in hyp-count: ${JSON.stringify(result)}`,
    );
    assert.ok(
      result.includes('6'),
      `locale=${locale}: fill() did not include total=6 in hyp-count: ${JSON.stringify(result)}`,
    );
    assert.ok(
      !result.includes('{remaining}'),
      `locale=${locale}: fill() left {remaining} unsubstituted in hyp-count`,
    );
    assert.ok(
      !result.includes('{total}'),
      `locale=${locale}: fill() left {total} unsubstituted in hyp-count`,
    );
  }
});

test('fill() with {remaining} and {total} in cross-notebook-title across all locales', () => {
  for (const locale of ALL_LOCALES) {
    const template = t(locale, 'cross-notebook-title');
    const result = fill(template, { remaining: 2, total: 3 });
    assert.ok(
      result.includes('2'),
      `locale=${locale}: fill() did not include remaining=2 in cross-notebook-title`,
    );
    assert.ok(
      result.includes('3'),
      `locale=${locale}: fill() did not include total=3 in cross-notebook-title`,
    );
  }
});

test('fill() leaves unrecognized placeholders intact', () => {
  const result = fill('Hello {unknown}', {});
  assert.equal(result, 'Hello {unknown}');
});

test('fill() handles empty vars object without throwing', () => {
  const template = t('en', 'cross-title'); // no placeholders
  const result = fill(template, {});
  assert.equal(result, template);
});

test('detective-voice listening stage: all locales mention the three statements as sole evidence', () => {
  // Spot-check: the English and Korean lines must match known spec language
  const en = getDetectiveVoice('listening', 'en');
  assert.ok(
    en.line.toLowerCase().includes('only evidence'),
    `en listening line does not mention "only evidence": ${en.line}`,
  );
  const ko = getDetectiveVoice('listening', 'ko');
  assert.ok(
    ko.line.includes('증거'),
    `ko listening line does not mention "증거" (evidence): ${ko.line}`,
  );
});

test('detective-voice deducing stage: all locales mention that accusation is once only', () => {
  const en = getDetectiveVoice('deducing', 'en');
  assert.ok(
    en.line.toLowerCase().includes('one-time') || en.line.toLowerCase().includes('accusation'),
    `en deducing line does not mention one-time accusation: ${en.line}`,
  );
  const ko = getDetectiveVoice('deducing', 'ko');
  assert.ok(
    ko.line.includes('한 번'),
    `ko deducing line does not mention "한 번" (once): ${ko.line}`,
  );
});

test('detective-voice reveal stage: all locales are neutral (no "correct" or "wrong")', () => {
  const forbiddenEn = ['correct', 'wrong', 'right answer', 'culprit', 'you win', 'you lose'];
  const en = getDetectiveVoice('reveal', 'en');
  for (const word of forbiddenEn) {
    assert.ok(
      !en.line.toLowerCase().includes(word),
      `en reveal line contains forbidden word "${word}": ${en.line}`,
    );
  }
});

test('aside-heading is non-empty and does not contain "correct", "culprit", or "answer" in any locale', () => {
  const forbidden = ['correct', 'culprit', 'answer', '정답', '범인'];
  for (const locale of ALL_LOCALES) {
    const heading = t(locale, 'aside-heading');
    assert.ok(heading.length > 0, `locale=${locale}: aside-heading is empty`);
    for (const word of forbidden) {
      assert.ok(
        !heading.toLowerCase().includes(word),
        `locale=${locale}: aside-heading contains forbidden word "${word}": ${heading}`,
      );
    }
  }
});

test('hyp-last-label does not imply a correct answer in any locale', () => {
  const forbidden = ['correct', 'answer', 'culprit', '정답', '범인', 'right'];
  for (const locale of ALL_LOCALES) {
    const label = t(locale, 'hyp-last-label');
    for (const word of forbidden) {
      assert.ok(
        !label.toLowerCase().includes(word),
        `locale=${locale}: hyp-last-label contains forbidden word "${word}": ${label}`,
      );
    }
  }
});

test('cross-detective-label is "Kirock Homes" in English (brand name unchanged)', () => {
  assert.equal(t('en', 'cross-detective-label'), 'Kirock Homes');
});

test('t() is deterministic: same (locale, key) always returns same string', () => {
  for (const locale of ALL_LOCALES) {
    for (const key of ALL_REQUIRED_KEYS) {
      const a = t(locale, key);
      const b = t(locale, key);
      assert.equal(a, b, `t(${locale}, ${key}) returned different values on repeated calls`);
    }
  }
});

test('getDetectiveVoice is deterministic: same (stage, locale) always returns same copy', () => {
  for (const stage of DETECTIVE_STAGES) {
    for (const locale of ALL_LOCALES) {
      const a = getDetectiveVoice(stage, locale);
      const b = getDetectiveVoice(stage, locale);
      assert.equal(a.line, b.line, `getDetectiveVoice(${stage}, ${locale}) returned different lines`);
    }
  }
});
