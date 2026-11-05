import { test, expect } from '@playwright/test';
import { SUPPORTED_LOCALES } from '../../src/lib/i18n/locales';
import { examine } from './helpers';
import sharp from 'sharp';
import { createCase, sampleSuspects, resolveCase } from '../../src/lib/game';

for (const locale of SUPPORTED_LOCALES) {
  test(`complete the sample mystery in ${locale} at mobile width`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    const language = page.getByTestId('language-select');
    await expect(language.locator('option')).toHaveCount(10);
    await language.selectOption(locale);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('html')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    await page.getByTestId('sample-start').click();
    await page.getByTestId('skip-awakening').click();
    for (const id of ['s0', 's1', 's2']) await page.getByTestId(`statement-${id}`).click();
    await examine(page);
    await expect(page.getByTestId('exam-progress')).toHaveText('3/3');
    await expect(page.getByTestId('hypothesis-board').locator('button.hypothesis-card')).toHaveCount(6);
    await page.getByTestId('choose-s0').click();
    await page.getByTestId('accuse').click();
    await expect(page.locator('.proof li')).toHaveCount(3);
    for (const line of await page.locator('.proof li').allTextContents()) expect(line.trim().length).toBeGreaterThan(15);
    const translated = await page.locator('.proof').innerText();
    const verdict = await page.locator('.actor .face-guilty').count();
    await expect(page.locator('.caption p')).not.toBeEmpty();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    if (['en', 'de', 'ar'].includes(locale)) await page.screenshot({ path: `test-results/language-${locale}-mobile.png`, fullPage: true });
    if (locale !== 'en') {
      await language.selectOption('en');
      await expect(page.locator('.proof')).not.toHaveText(translated);
      expect(await page.locator('.actor .face-guilty').count()).toBe(verdict);
      await expect(page.getByTestId('accuse')).toHaveCount(0);
    }
    expect(errors).toEqual([]);
  });
}

test('language changes preserve cross-examination notes, eliminations and photo coordinates', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('sample-start').click();
  await page.getByTestId('skip-awakening').click();
  for (const id of ['s0', 's1', 's2']) await page.getByTestId(`statement-${id}`).click();
  await examine(page);
  await page.locator('.cross-record > summary').click();
  await page.locator('#theory-s0').selectOption('false');
  await page.getByTestId('hypothesis-card-s0-false').click();
  const faces = await page.locator('.actor').evaluateAll(elements => elements.map(el => el.getAttribute('style')));
  for (const locale of SUPPORTED_LOCALES) {
    await page.getByTestId('language-select').selectOption(locale);
    await expect(page.getByTestId('exam-progress')).toHaveText('3/3');
    await expect(page.locator('#theory-s0')).toHaveValue('false');
    await expect(page.getByTestId('hypothesis-card-s0-false')).toHaveAttribute('aria-pressed', 'true');
    expect(await page.locator('.actor').evaluateAll(elements => elements.map(el => el.getAttribute('style')))).toEqual(faces);
    await expect(page.getByTestId('accuse')).toBeDisabled();
  }
});

test('keyboard language selection persists and an invalid saved language defaults to English', async ({ page, context }) => {
  await context.addInitScript(() => { if (!localStorage.getItem('kirock:locale')) localStorage.setItem('kirock:locale', 'unknown'); });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  const select = page.getByTestId('language-select');
  await select.focus();
  await page.keyboard.press('f');
  await page.keyboard.press('Tab');
  await expect(select).toHaveValue('fr');
  await page.reload();
  await expect(select).toHaveValue('fr');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
});

test('credits and privacy follow the language choice across all ten locales', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/credits');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  for (const locale of SUPPORTED_LOCALES) {
    await page.getByTestId('language-select').selectOption(locale);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('main h1')).not.toBeEmpty();
    await expect(page.locator('main p')).toHaveCount(11);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
  await page.locator('main > a').click();
  await expect(page.getByTestId('language-select')).toHaveValue('hi');
});

test('a failed shared verdict translation can retry without a second accusation', async ({ page }) => {
  const draft = createCase(sampleSuspects(), { seed: 17 });
  const bytes = await sharp({ create: { width: 600, height: 400, channels: 3, background: '#4a6d8c' } }).jpeg().toBuffer();
  const response = await page.request.post('/api/shared-cases', {
    headers: { Origin: 'http://127.0.0.1:3000' },
    data: { draft, scene: { dataUrl: `data:image/jpeg;base64,${bytes.toString('base64')}`, width: 600, height: 400 }, consent: true },
  });
  expect(response.status()).toBe(201);
  const { id } = await response.json();
  try {
    await page.goto(`/s/${id}`);
    await page.getByTestId('shared-start').click();
    await page.getByTestId('skip-awakening').click();
    for (const suspect of ['s0', 's1', 's2']) await page.getByTestId(`statement-${suspect}`).click();
    await examine(page);
    await page.getByTestId('choose-s0').click();
    await page.getByTestId('accuse').click();
    await expect(page.locator('.proof li')).toHaveCount(3);
    let failNextTranslation = true;
    await page.route('**/api/plays/*/accuse', async route => {
      if (route.request().postDataJSON().locale === 'fr' && failNextTranslation) {
        failNextTranslation = false;
        return route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"test_unavailable"}' });
      }
      return route.continue();
    });
    await page.getByTestId('language-select').selectOption('fr');
    await expect(page.getByTestId('retry-verdict-translation')).toBeVisible();
    await expect(page.locator('.proof')).toHaveCount(0);
    await page.getByTestId('retry-verdict-translation').click();
    await expect(page.locator('.proof li p')).toHaveText(resolveCase(draft, 's0', 'fr').proofSteps);
    await expect(page.getByTestId('accuse')).toHaveCount(0);
    await page.getByTestId('language-select').selectOption('ar');
    await expect(page.locator('.proof li p')).toHaveText(resolveCase(draft, 's0', 'ar').proofSteps);
    await expect(page.locator('.proof')).toHaveAttribute('lang', 'ar');
  } finally {
    await page.request.delete(`/api/shared-cases/${id}`, { headers: { Origin: 'http://127.0.0.1:3000' } });
  }
});

test('an older shared case keeps English evidence direction inside an Arabic interface', async ({ page }) => {
  const draft = createCase(sampleSuspects(), { seed: 19 });
  const bytes = await sharp({ create: { width: 600, height: 400, channels: 3, background: '#4a6d8c' } }).jpeg().toBuffer();
  const response = await page.request.post('/api/shared-cases', {
    headers: { Origin: 'http://127.0.0.1:3000' },
    data: { draft, scene: { dataUrl: `data:image/jpeg;base64,${bytes.toString('base64')}`, width: 600, height: 400 }, consent: true },
  });
  expect(response.status()).toBe(201);
  const { id } = await response.json();
  try {
    // Server migration/fallback is covered against SQLite in server.test.ts.
    // This response fixture checks the UI boundary for that existing contract.
    await page.route(`**/api/shared-cases/${id}?locale=*`, async route => {
      const url = new URL(route.request().url()); url.searchParams.set('locale', 'en');
      const original = await route.fetch({ url: url.toString() });
      const frozen = await original.json();
      await route.fulfill({ json: { ...frozen, availableLocales: ['en', 'ko'] } });
    });
    await page.goto(`/s/${id}`);
    await page.getByTestId('language-select').selectOption('ar');
    await expect(page.getByTestId('legacy-language-notice')).toBeVisible();
    await page.getByTestId('shared-start').click();
    await page.getByTestId('skip-awakening').click();
    for (const suspect of ['s0', 's1', 's2']) {
      await page.getByTestId(`statement-${suspect}`).click();
      await expect(page.getByTestId(`statement-${suspect}`).locator('p')).toHaveAttribute('lang', 'en');
    }
    await examine(page);
    await expect(page.locator('.hypothesis-fact').first()).toHaveAttribute('dir', 'ltr');
    await expect(page.locator('.dialogue-turn p').first()).toHaveAttribute('lang', 'en');
    await page.getByTestId('choose-s0').click();
    await page.getByTestId('accuse').click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('.proof')).toHaveAttribute('lang', 'en');
    await expect(page.locator('.proof')).toHaveAttribute('dir', 'ltr');
    await expect(page.locator('.proof li p')).toHaveText(resolveCase(draft, 's0', 'en').proofSteps);
  } finally {
    await page.request.delete(`/api/shared-cases/${id}`, { headers: { Origin: 'http://127.0.0.1:3000' } });
  }
});
