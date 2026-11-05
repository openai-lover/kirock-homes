import { test, expect } from '@playwright/test';

test.describe('English browser language', () => {
  test.use({ locale: 'en-US' });

  test('a new en-US visitor sees Kirock Homes in English', async ({ page }) => {
    await page.goto('/');
    expect(await page.evaluate(() => navigator.language)).toBe('en-US');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', { level: 1, name: /^Kirock\s+Homes$/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Try the sample desk', exact: true })).toBeVisible();
    await expect(page.locator('.tagline')).toHaveText('Your room. Three suspects. One liar.');
  });

  test('an explicit language choice overrides en-US and survives reload in both directions', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await page.getByTestId('language-select').selectOption('ko');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
    expect(await page.evaluate(() => localStorage.getItem('kirock:locale'))).toBe('ko');
    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: /^킬록\s*홈즈$/ })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
    expect(await page.evaluate(() => navigator.language)).toBe('en-US');
    await page.getByTestId('language-select').selectOption('en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    expect(await page.evaluate(() => localStorage.getItem('kirock:locale'))).toBe('en');
    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: /^Kirock\s+Homes$/ })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});

test.describe('Korean browser language', () => {
  test.use({ locale: 'ko-KR' });

  test('a new ko-KR visitor also starts in English until they choose a language', async ({ page }) => {
    await page.goto('/');
    expect(await page.evaluate(() => navigator.language)).toBe('ko-KR');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', { level: 1, name: /^Kirock\s+Homes$/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Try the sample desk', exact: true })).toBeVisible();
    await expect(page.locator('.tagline')).toHaveText('Your room. Three suspects. One liar.');
  });
});
