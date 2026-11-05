import { test, expect, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { getStoryCopy } from '../../src/lib/i18n/story';
import { SUPPORTED_LOCALES } from '../../src/lib/i18n/locales';
import { examine, tabTo } from './helpers';

async function lastPage(page: Page) {
  for (let index = 0; index < 3; index++) await page.getByTestId('story-next').click();
  await expect(page.getByTestId('story-count')).toHaveText('4 / 4');
}

test('the optional comic supports keyboard reading, contained focus and return to its opener without starting a case', async ({ page }) => {
  const api: string[] = [];
  page.on('request', request => { if (new URL(request.url()).pathname.startsWith('/api/')) api.push(request.url()); });
  await page.goto('/');
  await expect(page.getByTestId('story-dialog')).toHaveCount(0);
  await tabTo(page, page.getByTestId('story-open'));
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('story-close')).toBeFocused();
  await expect(page.getByTestId('game-content')).toHaveAttribute('inert', '');
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
  await expect(page.getByTestId('story-dialog')).toHaveAccessibleName('The biscuit incident');
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByTestId('story-next')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByTestId('story-close')).toBeFocused();
  for (let index = 1; index < 4; index++) {
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('story-count')).toHaveText(`${index + 1} / 4`);
    await expect(page.getByTestId('story-page')).toContainText(getStoryCopy('en').pages[index].line);
  }
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('story-count')).toHaveText('4 / 4');
  await tabTo(page, page.getByTestId('story-photo'));
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByTestId('story-close')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('story-dialog')).toHaveCount(0);
  await expect(page.getByTestId('story-open')).toBeFocused();
  await expect(page.getByTestId('game-content')).not.toHaveAttribute('inert');
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
  await expect(page.locator('main.app')).toHaveAttribute('data-phase', 'start');
  await expect(page.locator('.testimony, .proof, [data-testid="confession"]')).toHaveCount(0);
  expect(api).toEqual([]);
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('story-count')).toHaveText('1 / 4');
  await page.getByTestId('story-close').click();
  await expect(page.getByTestId('story-open')).toBeFocused();
});

test('the comic leads into a fresh, completable sample with three unheard statements', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('story-open').click();
  await lastPage(page);
  await tabTo(page, page.getByTestId('story-sample'));
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('story-dialog')).toHaveCount(0);
  await expect(page.locator('.case-heading h1')).toBeFocused();
  await page.getByTestId('skip-awakening').click();
  await expect(page.locator('.testimony')).toHaveCount(3);
  await expect(page.locator('.testimony.heard')).toHaveCount(0);
  await expect(page.getByTestId('accuse')).toBeDisabled();
  for (const id of ['s0', 's1', 's2']) await page.getByTestId(`statement-${id}`).click();
  await examine(page);
  await page.getByTestId('choose-s0').click();
  await page.getByTestId('accuse').click();
  await expect(page.getByTestId('confession')).toBeVisible();
  await expect(page.locator('main.app')).toHaveAttribute('data-phase', 'reveal');
});

test('the final comic panel opens the actual photo picker and reaches manual casting', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('story-open').click();
  await lastPage(page);
  const chooser = page.waitForEvent('filechooser');
  await page.getByTestId('story-photo').click();
  await (await chooser).setFiles('public/sample-desk.jpg');
  await expect(page.getByTestId('story-dialog')).toHaveCount(0);
  await expect(page.locator('main.app')).toHaveAttribute('data-phase', 'casting');
  await expect(page.locator('.case-heading h1')).toBeFocused();
  await expect(page.locator('.cast-tabs button')).toHaveCount(3);
});

test('failed comic artwork retains readable narrative and an escape into the sample', async ({ page }) => {
  await page.route('**/art/story-biscuit.webp', route => route.abort());
  await page.goto('/');
  await page.getByTestId('story-open').click();
  await expect(page.locator('.story-art-description')).toContainText('empty biscuit plate');
  await lastPage(page);
  await expect(page.locator('.story-art-description')).toContainText('three talking objects');
  await page.getByTestId('story-sample').click();
  await page.getByTestId('skip-awakening').click();
  await expect(page.locator('.testimony')).toHaveCount(3);
});

for (const size of [{ width: 1440, height: 960 }, { width: 1078, height: 738 }, { width: 360, height: 640 }, { width: 640, height: 360 }]) {
  test(`all ten translated comics have reachable controls and readable panels at ${size.width}×${size.height}`, async ({ page }) => {
    test.setTimeout(90_000);
    await mkdir('docs/screenshots/story', { recursive: true });
    await page.setViewportSize(size);
    await page.goto('/');
    for (const locale of SUPPORTED_LOCALES) {
      await page.getByTestId('language-select').selectOption(locale);
      await page.getByTestId('story-open').click();
      await expect(page.getByTestId('story-dialog')).toHaveAttribute('lang', locale);
      await expect(page.getByTestId('story-dialog')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
      await page.evaluate(() => document.fonts.ready);
      await expect.poll(() => page.locator('.story-art img').evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
      for (let index = 0; index < 4; index++) {
        await expect(page.getByTestId('story-count')).toHaveText(`${index + 1} / 4`);
        await expect(page.locator('.story-copy')).toContainText(getStoryCopy(locale).pages[index].narration);
        if (size.width > 700) await expect(page.locator('.story-art')).toBeInViewport({ ratio: 1 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(size.width);
        for (const text of await page.locator('.story-copy h3, .story-narration, .story-bubble').all()) {
          await text.scrollIntoViewIfNeeded();
          const sizes = await text.evaluate(el => ({ width: el.clientWidth, content: el.scrollWidth }));
          expect(sizes.content).toBeLessThanOrEqual(sizes.width + 1);
          await expect(text).toBeInViewport();
        }
        for (const control of await page.locator('.story-header button, .story-nav button:not(:disabled)').all()) {
          await expect(control).toBeInViewport({ ratio: 1 });
          const rect = await control.boundingBox();
          expect(rect!.height).toBeGreaterThanOrEqual(44);
          expect(rect!.x).toBeGreaterThanOrEqual(0);
          expect(rect!.x + rect!.width).toBeLessThanOrEqual(size.width);
          expect(await control.evaluate(el => {
            const r = el.getBoundingClientRect();
            const target = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
            return target === el || el.contains(target);
          })).toBe(true);
        }
        expect(await page.locator('.story-copy').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
        if (['en', 'ko', 'ar'].includes(locale) && size.height !== 360) {
          await page.locator('.story-scroll').evaluate(el => el.scrollTop = 0);
          await page.screenshot({ path: `docs/screenshots/story/${size.width}-${locale}-${index + 1}.png`, animations: 'disabled' });
        }
        if (index < 3) await page.keyboard.press(locale === 'ar' ? 'ArrowLeft' : 'ArrowRight');
      }
      await page.getByTestId('story-photo').scrollIntoViewIfNeeded();
      await expect(page.getByTestId('story-photo')).toBeInViewport();
      await page.keyboard.press('Escape');
      await expect(page.getByTestId('story-open')).toBeFocused();
    }
  });
}
