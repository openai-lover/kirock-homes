import { test, expect, type Locator, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { SUPPORTED_LOCALES } from '../../src/lib/i18n/locales';
import { getDetectiveCopy, getPreviewBanter } from '../../src/lib/i18n/detective';
import { examine, tabTo } from './helpers';

const suspectIds = ['s0', 's1', 's2'] as const;

async function capture(page: Page, name: string) {
  await page.evaluate(() => document.fonts.ready);
  // Full-page captures should anchor sticky photographs at the page's start,
  // rather than freeze their position after a dialogue button scrolled into view.
  await page.evaluate(() => window.scrollTo(0, 0));
  await mkdir('docs/screenshots', { recursive: true });
  await page.screenshot({ path: `docs/screenshots/detective-${name}.png`, fullPage: true, animations: 'disabled' });
}

async function fitsPage(page: Page) {
  const sizes = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
  expect(sizes.content).toBeLessThanOrEqual(sizes.viewport + 1);
}

async function readable(elements: Locator) {
  expect(await elements.count()).toBeGreaterThan(0);
  for (const element of await elements.all()) {
    await expect(element).toBeVisible();
    const size = await element.evaluate(node => ({
      width: node.clientWidth, contentWidth: node.scrollWidth,
      height: node.clientHeight, contentHeight: node.scrollHeight,
      overflowY: getComputedStyle(node).overflowY,
    }));
    expect(size.contentWidth).toBeLessThanOrEqual(size.width + 1);
    if (size.overflowY !== 'visible') expect(size.contentHeight).toBeLessThanOrEqual(size.height + 1);
  }
}

async function usableControls(page: Page, elements: Locator) {
  expect(await elements.count()).toBeGreaterThan(0);
  for (const element of await elements.all()) {
    await expect(element).toBeVisible();
    const box = await element.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.x).toBeGreaterThanOrEqual(-1);
    expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
  }
}

test('keyboard suspect previews are flavour only and leave the real case unplayed', async ({ page }) => {
  await page.goto('/');
  const preview = page.getByTestId('detective-preview');
  await expect(preview).toBeHidden();
  await tabTo(page, page.getByTestId('preview-toggle'));
  await page.keyboard.press('Enter');
  await expect(preview).toBeVisible();
  await expect(page.getByTestId('preview-banter')).toContainText(getDetectiveCopy('en').previewHint);
  const previewRequests: string[] = [];
  page.on('request', request => {
    if (new URL(request.url()).pathname.startsWith('/api/')) previewRequests.push(request.url());
  });

  for (const id of suspectIds) {
    const button = page.getByTestId(`preview-${id}`);
    await tabTo(page, button);
    await page.keyboard.press('Enter');
    await expect(button).toBeFocused();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('preview-banter')).toContainText(getPreviewBanter('en', id));
    await expect(preview.getByTestId(`face-${id}`)).toHaveClass(/is-speaking/);
    for (const other of suspectIds.filter(value => value !== id)) {
      await expect(page.getByTestId(`preview-${other}`)).toHaveAttribute('aria-pressed', 'false');
    }
    await expect(page.locator('main.app')).toHaveAttribute('data-phase', 'start');
    await expect(page.locator('.testimony, .proof, .verdict-tag, .face-guilty')).toHaveCount(0);
    await expect(page.getByTestId('confession')).toHaveCount(0);
  }
  // The photograph and its larger accessible controls drive the same preview.
  await preview.getByTestId('face-s0').click();
  await expect(page.getByTestId('preview-s0')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('preview-banter')).toContainText(getPreviewBanter('en', 's0'));
  expect(previewRequests).toEqual([]);

  await tabTo(page, page.getByTestId('sample-start'));
  await page.keyboard.press('Enter');
  await page.getByTestId('skip-awakening').click();
  await expect(page.getByTestId('detective-preview')).toHaveCount(0);
  await expect(page.locator('.testimony')).toHaveCount(3);
  await expect(page.locator('.testimony.heard')).toHaveCount(0);
  for (const id of suspectIds) await expect(page.getByTestId(`choose-${id}`)).toBeDisabled();
  await expect(page.getByTestId('accuse')).toBeDisabled();
});

for (const width of [1440, 360]) {
  test(`the detective and playable case invitation remain readable in ten languages at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 1440 ? 960 : 800 });
    await page.goto('/');
    const preview = page.getByTestId('detective-preview');
    const host = page.getByTestId('detective-host');
    await expect.poll(() => host.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    for (const locale of SUPPORTED_LOCALES) {
      await page.getByTestId('language-select').selectOption(locale);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await page.evaluate(() => document.fonts.ready);
      await fitsPage(page);
      await readable(page.locator('.intro h1, .tagline'));
      await expect(preview).toBeHidden();
      await usableControls(page, page.locator('.entry-actions button, .settings button, .language-setting select'));

      const hostBox = await host.boundingBox();
      expect(hostBox).toBeTruthy();
      expect(hostBox!.width).toBeGreaterThan(width === 1440 ? 180 : 130);
      expect(hostBox!.height).toBeGreaterThan(width === 1440 ? 180 : 130);
      expect(hostBox!.x).toBeGreaterThanOrEqual(-1);
      expect(hostBox!.x + hostBox!.width).toBeLessThanOrEqual(width + 1);
      if (locale === 'en') await capture(page, width === 1440 ? 'home-desktop' : 'home-mobile');
      if (width === 360 && ['ko', 'ar', 'hi'].includes(locale)) await capture(page, `home-${locale}-mobile`);
      await page.getByTestId('preview-toggle').click();
      await usableControls(page, preview.locator('[data-testid^="preview-s"]'));
      await page.getByTestId('preview-s1').click();
      await expect(page.getByTestId('preview-banter')).toContainText(getPreviewBanter(locale, 's1'));
      await readable(page.getByTestId('preview-banter'));
      await fitsPage(page);
      await page.getByTestId('preview-toggle').click();
      await expect(preview).toBeHidden();
      await page.getByTestId('sample-start').scrollIntoViewIfNeeded();
      await expect(page.getByTestId('sample-start')).toBeInViewport();
    }
  });
}

test('investigation progress follows listening and actual rebuttals before deduction becomes available', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto('/');
  await page.getByTestId('sample-start').click();
  const steps = page.locator('.case-journey > li');
  await expect(steps).toHaveCount(4);
  await expect(steps.nth(0)).toHaveAttribute('aria-current', 'step');
  await page.getByTestId('skip-awakening').click();
  await expect(steps.nth(1)).toHaveAttribute('aria-current', 'step');
  await page.getByTestId('statement-s0').click();
  await expect(page.locator('.testimony.heard')).toHaveCount(1);
  await fitsPage(page);
  await capture(page, 'evidence');

  for (const id of ['s1', 's2']) await page.getByTestId(`statement-${id}`).click();
  await expect(steps.nth(2)).toHaveAttribute('aria-current', 'step');
  await page.getByTestId('question-s0').click();
  await page.getByTestId('hear-rebuttal').click();
  await expect(page.getByTestId('exchange').locator('.dialogue-turn')).toHaveCount(2);
  await expect(page.getByTestId('exam-progress')).toHaveText('0/3');
  await expect(page.getByTestId('choose-s0')).toBeDisabled();
  await expect(page.getByTestId('verdict-proof')).toHaveCount(0);
  await fitsPage(page);
  await capture(page, 'confrontation');

  await examine(page);
  await expect(steps.nth(3)).toHaveAttribute('aria-current', 'step');
  await expect(page.getByTestId('hypothesis-board')).toBeVisible();
  await expect(page.getByTestId('choose-s0')).toBeEnabled();
  await expect(page.getByTestId('accuse')).toBeDisabled();
  await fitsPage(page);
  await capture(page, 'deduction');
});
