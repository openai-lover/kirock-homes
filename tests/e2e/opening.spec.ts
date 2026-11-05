import { test, expect, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const seenKey = 'kirock:opening-seen:v2';
const opening = (page: Page) => page.getByTestId('opening-sequence');

async function expectHomeReady(page: Page) {
  await expect(opening(page)).toHaveCount(0);
  await expect(page.getByTestId('game-content')).toHaveJSProperty('inert', false);
  await expect(page.getByTestId('game-content')).not.toHaveAttribute('aria-hidden', 'true');
  await expect(page.getByTestId('sample-start')).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
}

async function expectViewportCoverage(page: Page) {
  const size = page.viewportSize()!;
  const bounds = await opening(page).boundingBox();
  expect(bounds).toBeTruthy();
  expect(bounds!.x).toBeCloseTo(0, 0);
  expect(bounds!.y).toBeCloseTo(0, 0);
  expect(bounds!.width).toBeCloseTo(size.width, 0);
  expect(bounds!.height).toBeCloseTo(size.height, 0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
}

async function capture(page: Page, filename: string) {
  await mkdir('docs/screenshots', { recursive: true });
  // Do not disable animations: Playwright would advance finite entrance
  // animations to their end rather than capture the visible cinematic frame.
  await page.screenshot({ path: `docs/screenshots/${filename}.png`, animations: 'allow' });
}

test.describe('first-visit cinematic opening', () => {
  test.use({ reducedMotion: 'no-preference', viewport: { width: 1440, height: 960 } });

  test('the opening fills the viewport, contains keyboard focus, and stays dismissed after reload', async ({ page }) => {
    await page.goto('/');
    await expect(opening(page)).toBeVisible();
    await expectViewportCoverage(page);
    await expect(opening(page)).toHaveAttribute('role', 'dialog');
    await expect(opening(page)).toHaveAttribute('aria-modal', 'true');
    await expect(page.getByTestId('game-content')).toHaveJSProperty('inert', true);
    await expect(page.getByTestId('game-content')).toHaveAttribute('aria-hidden', 'true');
    await expect(page.getByTestId('opening-skip')).toBeFocused();
    for (const key of ['Tab', 'Tab', 'Shift+Tab', 'Shift+Tab']) {
      await page.keyboard.press(key);
      expect(await page.evaluate(() => Boolean(document.activeElement?.closest('[data-testid="opening-sequence"]')))).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expectHomeReady(page);
    await expect(page.getByTestId('sample-start')).toBeFocused();
    expect(await page.evaluate(key => localStorage.getItem(key), seenKey)).toBe('1');
    await page.reload();
    await expectHomeReady(page);
    await expect(page.getByTestId('language-select')).toHaveValue('en');
  });

  test('the complete opening reveals the homepage automatically and releases scrolling', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await expect(opening(page)).toHaveAttribute('data-state', 'playing');
    await expect(page.getByTestId('opening-character')).toHaveJSProperty('complete', true);
    expect(await page.getByTestId('opening-character').evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await page.waitForTimeout(2000);
    await capture(page, 'opening-desktop');
    await expectHomeReady(page);
    await expect(page.getByTestId('sample-start')).toBeFocused();
    expect(await page.evaluate(key => localStorage.getItem(key), seenKey)).toBe('1');
    await page.evaluate(() => document.fonts.ready);
    await capture(page, 'home-after-opening');
    expect(errors).toEqual([]);
  });

  test('the mobile character entrance keeps its single bottom-left exit on screen', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/');
    await expect(opening(page)).toHaveAttribute('data-state', 'playing');
    await page.waitForTimeout(2000);
    await expectViewportCoverage(page);
    for (const id of ['opening-skip']) {
      const button = page.getByTestId(id);
      await expect(button).toBeVisible();
      const bounds = await button.boundingBox();
      expect(bounds).toBeTruthy();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.y).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(361);
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(801);
      expect(bounds!.height).toBeGreaterThanOrEqual(44);
    }
    await capture(page, 'opening-mobile');
    await page.getByTestId('opening-skip').click();
    await expectHomeReady(page);
  });

  test('replay restores its opener and cancelled timers cannot interrupt a new game', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('opening-skip').click();
    await expectHomeReady(page);
    const replay = page.getByTestId('opening-replay');
    await replay.click();
    await expect(opening(page)).toBeVisible();
    await page.getByTestId('opening-skip').click();
    await expectHomeReady(page);
    await expect(replay).toBeFocused();
    await page.getByTestId('sample-start').click();
    for(let i=0;i<4;i++)await page.getByTestId('chat-continue').click();
    await page.getByTestId('chat-input').focus();
    // Wait past the original cinematic deadline to catch an uncleared callback
    // stealing focus or changing the page after the user already entered a case.
    await page.waitForTimeout(7000);
    await expect(page.getByTestId('chat-input')).toBeFocused();
    await expect(page.getByTestId('statement-s0')).toBeVisible();
    await expect(opening(page)).toHaveCount(0);
  });

  test('unavailable storage and failed artwork cannot trap a player in the opening', async ({ page, context }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await context.addInitScript(() => {
      Object.defineProperty(Storage.prototype, 'getItem', { configurable: true, value: () => { throw new DOMException('Storage is unavailable', 'SecurityError'); } });
      Object.defineProperty(Storage.prototype, 'setItem', { configurable: true, value: () => { throw new DOMException('Storage is unavailable', 'SecurityError'); } });
    });
    await page.route('**/art/**', route => route.abort());
    await page.goto('/');
    await expect(opening(page)).toBeVisible();
    // Automatic completion also covers the bounded asset-readiness fallback.
    await expectHomeReady(page);
    await page.getByTestId('sample-start').click();
    for(let i=0;i<4;i++)await page.getByTestId('chat-continue').click();
    await expect(page.getByTestId('statement-s0')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('a direct shared-case link bypasses the opening before reporting an expired case', async ({ page }) => {
    await page.goto('/s/opening-missing-case');
    await expect(page.getByTestId('game-content').getByRole('alert')).toContainText('This case has expired or was deleted.');
    await expect(opening(page)).toHaveCount(0);
    await expect(page.getByTestId('game-content')).toHaveJSProperty('inert', false);
    expect(await page.evaluate(key => localStorage.getItem(key), seenKey)).toBeNull();
  });
});

test('reduced motion bypasses automatically and explicit replay waits on a static accessible title screen', async ({ page, context }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await context.addInitScript(() => localStorage.setItem('kirock:locale', 'ar'));
  await page.goto('/');
  await expectHomeReady(page);
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const replay = page.getByTestId('opening-replay');
  await replay.click();
  await expect(opening(page)).toHaveAttribute('data-state', 'still');
  await expectViewportCoverage(page);
  await expect(page.getByTestId('opening-skip')).toBeFocused();
  await page.waitForTimeout(6500);
  await expect(opening(page)).toHaveAttribute('data-state', 'still');
  await page.getByTestId('opening-skip').click();
  await expectHomeReady(page);
  await expect(replay).toBeFocused();
  await expect(page.getByTestId('language-select')).toHaveValue('ar');
});

test('compact static replay keeps dialogue, character and controls separate in all ten languages', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto('/');
  await expectHomeReady(page);
  const measurements: Record<string, unknown> = {};
  for (const locale of ['en', 'ko', 'es', 'fr', 'de', 'pt', 'ja', 'zh', 'ar', 'hi']) {
    await page.getByTestId('language-select').selectOption(locale);
    await page.getByTestId('opening-replay').click();
    await expect(opening(page)).toHaveAttribute('data-state', 'still');
    await expect(opening(page)).toHaveAttribute('lang', locale);
    await page.evaluate(() => document.fonts.ready);
    await expect.poll(() => page.getByTestId('opening-character').evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await expectViewportCoverage(page);
    const elements = {
      copy: opening(page).locator('.opening-copy'),
      dialogue: opening(page).locator('.opening-line'),
      character: page.getByTestId('opening-character'),
      skip: page.getByTestId('opening-skip'),
    };
    const bounds: Record<string, { x: number; y: number; width: number; height: number }> = {};
    for (const [name, element] of Object.entries(elements)) {
      await expect(element).toBeVisible();
      const box = await element.boundingBox();
      expect(box, `${locale}: ${name} has bounds`).toBeTruthy();
      bounds[name] = box!;
      expect.soft(box!.x, `${locale}: ${name} starts inside the viewport`).toBeGreaterThanOrEqual(-1);
      expect.soft(box!.y, `${locale}: ${name} starts below the viewport top`).toBeGreaterThanOrEqual(-1);
      expect.soft(box!.x + box!.width, `${locale}: ${name} fits the viewport width`).toBeLessThanOrEqual(361);
      expect.soft(box!.y + box!.height, `${locale}: ${name} fits the viewport height`).toBeLessThanOrEqual(641);
    }
    expect.soft(bounds.copy.y + bounds.copy.height, `${locale}: dialogue and title stay above the character`).toBeLessThanOrEqual(bounds.character.y + 1);
    expect.soft(bounds.character.y + bounds.character.height, `${locale}: character stays above the skip button`).toBeLessThanOrEqual(bounds.skip.y + 1);
    expect.soft(bounds.skip.height, `${locale}: skip target height`).toBeGreaterThanOrEqual(44);
    const text = await elements.dialogue.innerText();
    expect(text.trim().length, `${locale}: the translated dialogue is present`).toBeGreaterThan(8);
    measurements[locale] = { text, bounds };
    console.info(`compact ${locale}: ${JSON.stringify(bounds)}`);
    await page.getByTestId('opening-skip').click();
    await expectHomeReady(page);
  }
  await testInfo.attach('compact-opening-bounds', { body: JSON.stringify(measurements, null, 2), contentType: 'application/json' });
});
