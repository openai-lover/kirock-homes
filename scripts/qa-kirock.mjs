// Local visual QA for Kirock Homes. Uses only the bundled sample photograph.
// Run against a prepared server: QA_SERVER_MODE='production server' node scripts/qa-kirock.mjs
import { chromium, expect } from '@playwright/test';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const origin = 'http://127.0.0.1:3000';
const output = 'docs/kirock-screenshots';
const sourceFiles = ['src/components/Game.tsx', 'src/components/DetectiveAside.tsx', 'src/lib/ui/detective-voice.ts', 'src/app/globals.css', 'src/app/layout.tsx', 'src/app/credits/page.tsx'];
const hashes = async () => Object.fromEntries(await Promise.all(sourceFiles.map(async file => [file, createHash('sha256').update(await readFile(file)).digest('hex')])));
const report = { startedAt: new Date().toISOString(), target: origin, mode: process.env.QA_SERVER_MODE || 'unspecified server', sourceHashes: await hashes(), checks: [], screenshots: [], browserErrors: [], failedRequests: [] };
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = await chromium.launch(existsSync(chrome) ? { executablePath: chrome } : {});
report.browser = await browser.version();
await mkdir(output, { recursive: true });
let currentPage;

function observe(page) {
  currentPage = page;
  page.on('pageerror', error => report.browserErrors.push(error.message));
  page.on('requestfailed', request => report.failedRequests.push({ url: request.url(), reason: request.failure()?.errorText }));
}
async function capture(page, name) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  const path = `${output}/${name}.png`;
  await page.screenshot({ path, fullPage: true, animations: 'disabled' });
  report.screenshots.push({ path, viewport: page.viewportSize() });
}
async function layoutCheck(page, name) {
  const measured = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: innerWidth }));
  expect(measured.width, name).toBeLessThanOrEqual(measured.viewport + 1);
  report.checks.push({ name, status: 'pass', ...measured });
}
async function imageCheck(page, selector, name) {
  const img = page.locator(selector);
  await expect(img).toHaveJSProperty('complete', true);
  const size = await img.evaluate(element => ({ naturalWidth: element.naturalWidth, naturalHeight: element.naturalHeight }));
  expect(size.naturalWidth).toBeGreaterThan(0);
  report.checks.push({ name, status: 'pass', ...size });
}
async function guidanceCheck(page, stage) {
  const aside = page.getByTestId('detective-aside');
  await expect(aside).toBeVisible();
  await expect(aside).toHaveAttribute('data-stage', stage);
  await expect(aside.locator('.detective-aside-title')).toHaveText("Kirock's notebook");
  await expect(aside.locator('.detective-aside-line')).not.toBeEmpty();
  expect(await aside.innerText()).not.toMatch(/[가-힣]/u);
  await expect(page.locator('.scene-column .actor')).toHaveCount(3);
  report.checks.push({ name: `English detective guidance follows ${stage}; photo still has three suspects`, status: 'pass' });
}

try {
  for (const locale of ['en-US', 'ko-KR']) {
    const ko = locale === 'ko-KR';
    const context = await browser.newContext({ locale, viewport: { width: 1440, height: 1050 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    observe(page);
    await page.goto(origin);
    await expect(page.locator('html')).toHaveAttribute('lang', ko ? 'ko' : 'en');
    await expect(page.getByRole('heading', { level: 1, name: ko ? /^킬록\s*홈즈$/ : /^Kirock\s+Homes$/ })).toBeVisible();
    await expect(page.locator('.game-subtitle')).toHaveText(ko ? '범인은 내 방에' : 'Room of Suspects');
    await imageCheck(page, '.agency-mascot', `${locale} detective artwork loads`);
    await imageCheck(page, '.desk-preview .photo-stage > img', `${locale} original sample photo loads`);
    await expect(page.locator('.desk-preview .actor')).toHaveCount(3);
    report.checks.push({ name: `${locale} language, current brand and exactly three photo suspects`, status: 'pass' });
    for (const width of [1440, 390, 360]) {
      await page.setViewportSize({ width, height: width === 1440 ? 1050 : 844 });
      await layoutCheck(page, `${locale} landing fits ${width}px`);
      await capture(page, `${ko ? 'ko' : 'en'}-landing-${width}`);
    }
    await context.close();
  }

  // The same English game is captured through the major play phases.
  const context = await browser.newContext({ locale: 'en-US', viewport: { width: 1440, height: 1050 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  observe(page);
  await page.goto(origin);
  await page.getByRole('button', { name: 'Try the sample desk', exact: true }).click();
  await expect(page.locator('.awakening-copy')).toBeVisible();
  await guidanceCheck(page, 'awakening');
  await capture(page, 'en-awakening-desktop');
  await expect(page.getByTestId('statement-s0')).toBeVisible({ timeout: 12_000 });
  await guidanceCheck(page, 'listening');
  await layoutCheck(page, 'English official statements fit desktop');
  await capture(page, 'en-statements-desktop');
  for (const id of ['s0', 's1', 's2']) await page.getByTestId(`statement-${id}`).click();
  await guidanceCheck(page, 'confronting');
  await expect(page.getByTestId('accuse')).toBeDisabled();
  await expect(page.locator('.proof')).toHaveCount(0);
  for (const [index, id] of ['s0', 's1', 's2'].entries()) {
    await page.getByTestId(`question-${id}`).click();
    await page.getByTestId('hear-rebuttal').click();
    if (index === 0) {
      await capture(page, 'en-interrogation-desktop');
      await page.setViewportSize({ width: 360, height: 844 });
      await layoutCheck(page, 'English rebuttal and citation fit 360px');
      await capture(page, 'en-interrogation-360');
      await page.setViewportSize({ width: 1440, height: 1050 });
    }
    await page.getByTestId('save-note').click();
  }
  await expect(page.getByTestId('hypothesis-board')).toBeVisible();
  await guidanceCheck(page, 'deducing');
  await expect(page.getByTestId('hypothesis-board').locator('.hypothesis-card')).toHaveCount(6);
  await expect(page.locator('.proof')).toHaveCount(0);
  report.checks.push({ name: 'English cross-examination completes to six manual hypotheses without a pre-accusation verdict', status: 'pass' });
  await capture(page, 'en-hypothesis-desktop');
  await page.setViewportSize({ width: 390, height: 844 });
  await layoutCheck(page, 'English six-world board fits 390px');
  await capture(page, 'en-hypothesis-390');
  await page.getByTestId('choose-s0').click();
  await page.getByTestId('accuse').click();
  await expect(page.locator('.proof li')).toHaveCount(3);
  await guidanceCheck(page, 'reveal');
  await layoutCheck(page, 'English verdict and explanation fit 390px');
  await capture(page, 'en-verdict-390');
  await context.close();

  expect(report.browserErrors).toEqual([]);
  expect(report.failedRequests.filter(request => !request.reason?.includes('ERR_ABORTED'))).toEqual([]);
  report.status = 'pass';
} catch (error) {
  report.status = 'fail';
  report.error = String(error?.stack ?? error);
  if (currentPage && !currentPage.isClosed()) await capture(currentPage, 'failure').catch(() => {});
  process.exitCode = 1;
} finally {
  report.finishedAt = new Date().toISOString();
  report.finalSourceHashes = await hashes();
  report.sourceChangedDuringRun = JSON.stringify(report.sourceHashes) !== JSON.stringify(report.finalSourceHashes);
  await writeFile('docs/kirock-visual-results.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ status: report.status, checks: report.checks.length, screenshots: report.screenshots.length, sourceChangedDuringRun: report.sourceChangedDuringRun, error: report.error }, null, 2));
  await browser.close();
}
