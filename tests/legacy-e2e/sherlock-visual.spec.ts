import { test, expect, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { examine } from './helpers';

// The composition changed substantially. Check real layout bounds and keep
// screenshots for human visual review; these are not pixel-golden assertions.
const output = 'docs/screenshots';
async function fitsViewport(page: Page) {
  const width = await page.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: innerWidth }));
  expect(width.document).toBeLessThanOrEqual(width.viewport + 1);
}
async function capture(page: Page, name: string) {
  await page.evaluate(() => document.fonts.ready);
  await mkdir(output, { recursive: true });
  await page.screenshot({ path: `${output}/sherlock-${name}.png`, fullPage: true, animations: 'disabled' });
}

for (const [locale, width] of [['en', 1440], ['en', 360], ['ko', 390], ['ar', 360]] as const) {
  test(`consulting-room layout stays usable in ${locale} at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 });
    await page.goto('/');
    await page.getByTestId('language-select').selectOption(locale);
    await page.evaluate(() => document.fonts.ready);
    await fitsViewport(page);
    for (const button of await page.locator('.entry-actions button, .settings button, .language-setting select').all()) {
      const bounds = await button.boundingBox();
      expect(bounds).toBeTruthy();
      expect(bounds!.height).toBeGreaterThanOrEqual(44);
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
    }
    await capture(page, `landing-${locale}-${width}`);
    if (locale !== 'en' || width !== 1440) return;
    await page.getByTestId('sample-start').click();
    await page.getByTestId('skip-awakening').click();
    await capture(page, 'statements');
    for (const id of ['s0','s1','s2']) await page.getByTestId(`statement-${id}`).click();
    await page.getByTestId('question-s0').click();
    await page.getByTestId('hear-rebuttal').click();
    await fitsViewport(page);
    await capture(page, 'confrontation');
    await examine(page);
    await page.getByTestId('choose-s0').click();
    await page.getByTestId('accuse').click();
    await expect(page.locator('.proof li')).toHaveCount(3);
    await fitsViewport(page);
    await capture(page, 'verdict');
  });
}
