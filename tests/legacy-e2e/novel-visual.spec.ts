import { test, expect, type Locator, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { SUPPORTED_LOCALES } from '../../src/lib/i18n/locales';

// Layout checks exercise the rendered page rather than asserting design tokens.
// Screenshots are review artifacts, not brittle pixel-perfect golden files.
async function capture(page: Page, name: string) {
  await page.evaluate(() => document.fonts.ready);
  await mkdir('docs/screenshots', { recursive: true });
  await page.screenshot({ path: `docs/screenshots/novel-${name}.png`, fullPage: true, animations: 'disabled' });
}

async function fitsPage(page: Page) {
  const sizes = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
  expect(sizes.content).toBeLessThanOrEqual(sizes.viewport + 1);
}

async function readableText(elements: Locator) {
  for (const element of await elements.all()) {
    await expect(element).toBeVisible();
    const size = await element.evaluate(node => ({
      width: node.clientWidth,
      contentWidth: node.scrollWidth,
      height: node.clientHeight,
      contentHeight: node.scrollHeight,
      overflowY: getComputedStyle(node).overflowY,
    }));
    expect(size.contentWidth).toBeLessThanOrEqual(size.width + 1);
    // Display type can extend beyond a tight line box without being clipped.
    // Only a clipping/scrolling container needs the vertical content-fit check.
    if (size.overflowY !== 'visible') expect(size.contentHeight).toBeLessThanOrEqual(size.height + 1);
  }
}

async function usableControls(page: Page, elements: Locator) {
  for (const button of await elements.all()) {
    await expect(button).toBeVisible();
    const bounds = await button.boundingBox();
    expect(bounds).toBeTruthy();
    expect(bounds!.height).toBeGreaterThanOrEqual(44);
    expect(bounds!.x).toBeGreaterThanOrEqual(-1);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
  }
}

async function startInvestigation(page: Page) {
  await page.goto('/');
  await page.getByTestId('sample-start').click();
  await page.getByTestId('skip-awakening').click();
  await expect(page.getByTestId('statement-s0')).toBeVisible();
}

test('the novel homepage offers readable copy and keyboard access to its sample on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto('/');
  await expect(page.getByTestId('language-select')).toHaveValue('en');
  await fitsPage(page);
  await readableText(page.locator('.intro h1, .tagline'));
  await usableControls(page, page.locator('.entry-actions button, .settings button, .language-setting select'));
  const start = page.getByTestId('sample-start');
  await expect(start).toBeInViewport();
  await capture(page, 'home-desktop');
  await start.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('skip-awakening')).toBeVisible();
  await page.getByTestId('skip-awakening').click();
  await expect(page.getByTestId('statement-s0')).toBeVisible();
});

test('the 360px homepage keeps ten languages readable and actions reachable', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/');
  for (const locale of SUPPORTED_LOCALES) {
    await page.getByTestId('language-select').selectOption(locale);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await page.evaluate(() => document.fonts.ready);
    await fitsPage(page);
    await readableText(page.locator('.intro h1, .tagline'));
    await usableControls(page, page.locator('.entry-actions button, .settings button, .language-setting select'));
    await page.getByTestId('sample-start').scrollIntoViewIfNeeded();
    await expect(page.getByTestId('sample-start')).toBeInViewport();
    if (['en', 'ko', 'ar', 'hi'].includes(locale)) await capture(page, `home-${locale}-mobile`);
  }
});

test('mobile evidence and rebuttals remain readable and usable through a complete confrontation', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await startInvestigation(page);
  await usableControls(page, page.locator('.testimony'));
  await page.getByTestId('statement-s0').click();
  await readableText(page.locator('.testimony p'));
  await fitsPage(page);
  await capture(page, 'evidence-mobile');
  for (const id of ['s1', 's2']) await page.getByTestId(`statement-${id}`).click();
  await usableControls(page, page.locator('.question-list > button'));
  await page.getByTestId('question-s0').click();
  await usableControls(page, page.getByTestId('hear-rebuttal'));
  await page.getByTestId('hear-rebuttal').click();
  await expect(page.getByTestId('exchange').locator('.dialogue-turn')).toHaveCount(2);
  await readableText(page.locator('.dialogue-turn > p, .citation-strip blockquote, .detective-note p'));
  await usableControls(page, page.getByTestId('save-note'));
  await fitsPage(page);
  await capture(page, 'confrontation-mobile');
  await page.getByTestId('save-note').click();
  await expect(page.getByTestId('exam-progress')).toHaveText('1/3');
  await expect(page.getByTestId('choose-s0')).toBeDisabled();
});

test('responsive layout and translated reading panels preserve the photograph and face positions', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await startInvestigation(page);
  const photograph = page.locator('.scene-column .photo-stage > img');
  await expect(photograph).toHaveJSProperty('complete', true);
  const source = await photograph.getAttribute('src');
  const measure = () => page.locator('.scene-column .photo-stage').evaluate(stage => {
    const image = stage.querySelector('img')!;
    const imageBox = image.getBoundingClientRect();
    return {
      displayedAspect: imageBox.width / imageBox.height,
      sourceAspect: image.naturalWidth / image.naturalHeight,
      faces: [...stage.querySelectorAll('.actor')].map(actor => {
        const face = actor.getBoundingClientRect();
        return {
          x: (face.x + face.width / 2 - imageBox.x) / imageBox.width,
          y: (face.y + face.height / 2 - imageBox.y) / imageBox.height,
          width: face.width / imageBox.width,
        };
      }),
    };
  });
  const baseline = await measure();
  expect(baseline.faces).toHaveLength(3);
  expect(baseline.displayedAspect).toBeCloseTo(baseline.sourceAspect, 2);
  await capture(page, 'evidence-desktop');
  await page.setViewportSize({ width: 360, height: 800 });
  for (const locale of SUPPORTED_LOCALES) {
    await page.getByTestId('language-select').selectOption(locale);
    await page.evaluate(() => document.fonts.ready);
    await fitsPage(page);
    await expect(photograph).toHaveAttribute('src', source!);
    const layout = await measure();
    expect(layout.displayedAspect).toBeCloseTo(layout.sourceAspect, 2);
    for (const [index, face] of layout.faces.entries()) {
      expect(face.x).toBeCloseTo(baseline.faces[index].x, 2);
      expect(face.y).toBeCloseTo(baseline.faces[index].y, 2);
      expect(face.width).toBeCloseTo(baseline.faces[index].width, 2);
    }
    await readableText(page.locator('.case-heading h1, .case-note p'));
  }
});
