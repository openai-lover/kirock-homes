import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { tabTo } from './helpers';

test('decorative artwork failure preserves readable entry actions and keyboard entry', async ({ page }) => {
  await page.route('**/art/attraction-*', route => route.abort());
  await page.goto('/');
  const sample = page.getByTestId('sample-start');
  await expect(sample).toHaveAccessibleName('Try the sample desk');
  await page.getByTestId('opening-replay').click();
  const openingEnter = page.getByTestId('opening-enter');
  await expect(openingEnter).toBeVisible();
  const controls = [openingEnter, ...await page.locator('.entry-actions button').all()];
  for (const button of controls) {
    await expect(button).toBeEnabled();
    const fallback = await button.evaluate(node => ({
      text: getComputedStyle(node).color,
      paper: getComputedStyle(node, '::after').backgroundColor,
      label: node.textContent,
    }));
    expect(fallback.label!.length).toBeGreaterThan(5);
    const luminance = (color: string) => {
      const rgb = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(v => v / 255)
        .map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
      return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
    };
    expect((luminance(fallback.paper) + .05) / (luminance(fallback.text) + .05)).toBeGreaterThan(4.5);
  }
  await openingEnter.click();
  await expect(page.getByTestId('opening-sequence')).toHaveCount(0);
  await tabTo(page, sample);
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('skip-awakening')).toBeVisible();
  await page.getByTestId('skip-awakening').click();
  await expect(page.locator('.testimony')).toHaveCount(3);
  await expect(page.getByTestId('accuse')).toBeDisabled();
});

test('physical controls stay reachable across phone, tablet, desktop and RTL layouts', async ({ page }) => {
  await mkdir('docs/screenshots', { recursive: true });
  for (const width of [360, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width === 360 ? 640 : 960 });
    await page.goto('/');
    for (const locale of ['en', 'ko', 'ar']) {
      await page.getByTestId('language-select').selectOption(locale);
      await page.evaluate(() => document.fonts.ready);
      const controls = page.locator('.entry-actions button, .settings button, .language-setting select');
      for (const control of await controls.all()) {
        await control.scrollIntoViewIfNeeded();
        const rect = await control.boundingBox();
        expect(rect!.height).toBeGreaterThanOrEqual(44);
        expect(rect!.x).toBeGreaterThanOrEqual(-1);
        expect(rect!.x + rect!.width).toBeLessThanOrEqual(width + 1);
        expect(await control.evaluate(node => {
          const r = node.getBoundingClientRect();
          const target = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
          return target === node || node.contains(target);
        })).toBe(true);
      }
      for (const icon of await page.locator('.detective-prop').all()) {
        await expect(icon).toHaveAttribute('aria-hidden', 'true');
        await expect(icon).toHaveAttribute('focusable', 'false');
      }
      if (width === 360) {
        await page.evaluate(() => scrollTo(0, 0));
        for (const button of await page.locator('.entry-actions button').all()) await expect(button).toBeInViewport({ratio: 1});
      }
      await page.getByTestId('sample-start').hover();
      expect(await page.locator('[data-testid="sample-start"] .detective-prop').evaluate(node => getComputedStyle(node).animationName)).toBe('none');
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
      if (locale === 'en' || (width === 360 && locale === 'ko')) {
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: `docs/screenshots/simple-entry-${width}-${locale}.png`, fullPage: true, animations: 'disabled' });
      }
    }
  }
});
