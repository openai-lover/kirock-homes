// Supplemental visual/interaction QA. Requires the local application at :3000.
// All uploaded images and long object names below are synthetic test fixtures.
import { chromium, expect } from '@playwright/test';
import sharp from 'sharp';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const origin = 'http://127.0.0.1:3000';
const screenshotDirectory = 'docs/screenshots';
const sourceFiles = ['src/components/Game.tsx', 'src/components/PhotoStage.tsx', 'src/components/CrossExamination.tsx', 'src/components/HypothesisBoard.tsx', 'src/app/globals.css'];
async function hashes() {
  return Object.fromEntries(await Promise.all(sourceFiles.map(async file => [file, createHash('sha256').update(await readFile(file)).digest('hex')])));
}
const report = { startedAt: new Date().toISOString(), target: origin, mode: process.env.QA_SERVER_MODE || 'development server', sourceHashes: await hashes(), checks: [], screenshots: [], browserErrors: [], failedRequests: [] };
await mkdir(screenshotDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
report.browser = await browser.version();
const context = await browser.newContext({ viewport: { width: 1440, height: 1050 }, reducedMotion: 'reduce' });
const page = await context.newPage();
page.on('pageerror', error => report.browserErrors.push(error.message));
page.on('requestfailed', request => report.failedRequests.push({ url: request.url(), reason: request.failure()?.errorText }));

async function screenshot(name, fullPage = true) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  const path = `${screenshotDirectory}/${name}.png`;
  await page.screenshot({ path, fullPage, animations: 'disabled' });
  report.screenshots.push({ path, viewport: page.viewportSize(), fullPage });
}
async function noOverflow(label) {
  const sizes = await page.evaluate(() => ({ pageWidth: document.documentElement.scrollWidth, viewport: innerWidth }));
  expect(sizes.pageWidth, label).toBeLessThanOrEqual(sizes.viewport + 1);
  report.checks.push({ name: label, status: 'pass', ...sizes });
}
async function stageRatio(label) {
  const ratio = await page.locator('.scene-column .photo-stage').evaluate(stage => {
    const rect = stage.getBoundingClientRect(), image = stage.querySelector('img');
    return { rendered: rect.width / rect.height, natural: image.naturalWidth / image.naturalHeight };
  });
  expect(Math.abs(ratio.rendered - ratio.natural), label).toBeLessThan(.015);
  report.checks.push({ name: label, status: 'pass', ...ratio });
}
async function upload(width, height) {
  const image = await sharp({ create: { width, height, channels: 3, background: '#627b78' } }).jpeg().toBuffer();
  await page.getByLabel('사진 업로드', { exact: true }).setInputFiles({ name: 'synthetic-ui-fixture.jpg', mimeType: 'image/jpeg', buffer: image });
  await expect(page.getByRole('heading', { name: '누구를 깨울까요?' })).toBeVisible();
}
async function examine(captureFirst = false) {
  for (const [index, id] of ['s0', 's1', 's2'].entries()) {
    await page.getByTestId(`question-${id}`).click();
    await page.getByTestId('hear-rebuttal').click();
    if (captureFirst && index === 0) {
      await screenshot('interrogation-desktop');
      await page.setViewportSize({ width: 390, height: 844 });
      await noOverflow('390px cross-examination and citations have no horizontal overflow');
      await screenshot('interrogation-mobile');
      await page.setViewportSize({ width: 1440, height: 1050 });
    }
    await page.getByTestId('save-note').click();
    await expect(page.getByTestId('exam-progress')).toHaveText(`${index + 1}/3`);
  }
}

try {
  await page.goto(origin);
  await expect(page.locator('.desk-preview .photo-stage img')).toHaveJSProperty('complete', true);
  await noOverflow('desktop landing has no horizontal overflow');
  await screenshot('desktop');
  await page.setViewportSize({ width: 390, height: 844 });
  await noOverflow('390px landing has no horizontal overflow');
  await screenshot('mobile');
  await page.setViewportSize({ width: 360, height: 800 });
  await noOverflow('360px landing has no horizontal overflow');
  await screenshot('mobile-360');
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await expect(page.getByRole('button', { name: 'Try the sample desk' })).toBeVisible();
  await noOverflow('360px English landing has no horizontal overflow');
  await screenshot('mobile-english');
  await page.getByRole('button', { name: '한국어로 전환' }).click();
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.getByRole('button', { name: '샘플 책상에서 바로 해보기' }).click();
  await expect(page.locator('.awakening-copy')).toBeVisible();
  await screenshot('awakening-desktop');
  await expect(page.getByTestId('statement-s0')).toBeVisible({ timeout: 12_000 });
  for (const id of ['s0', 's1', 's2']) await page.getByTestId(`statement-${id}`).click();
  await examine(true);
  await expect(page.getByTestId('hypothesis-board')).toBeVisible();
  await screenshot('hypothesis-desktop');
  await stageRatio('portrait sample preserves image ratio');
  await screenshot('investigation-desktop');
  await page.setViewportSize({ width: 390, height: 844 });
  await noOverflow('390px investigation has no horizontal overflow');
  await screenshot('investigation-mobile');
  await page.getByTestId('choose-s0').click();
  await page.getByTestId('accuse').click();
  await expect(page.locator('.proof li')).toHaveCount(3);
  await screenshot('verdict-mobile');

  const opener = page.getByRole('button', { name: '친구에게 같은 사건 보내기' });
  await opener.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByLabel('사진을 확인했고 링크로 공개하는 데 동의해요.')).not.toBeChecked();
  await expect(page.getByRole('button', { name: '이 사진으로 링크 만들기', exact: true })).toBeDisabled();
  for (let i = 0; i < 9; i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')))).toBe(true);
  }
  for (let i = 0; i < 9; i++) {
    await page.keyboard.press('Shift+Tab');
    expect(await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')))).toBe(true);
  }
  await screenshot('share-dialog-mobile', false);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(opener).toBeFocused();
  report.checks.push({ name: 'share preview consent, forward/reverse focus trap, and Escape focus restoration', status: 'pass' });

  await page.goto(origin);
  await page.setViewportSize({ width: 360, height: 800 });
  await upload(600, 400);
  for (let i = 0; i < 3; i++) {
    await page.locator('.cast-tabs button').nth(i).click();
    await page.getByLabel('물건 이름', { exact: true }).fill('긴이름'.repeat(9) + (i + 1));
    if (i !== 1) {
      await page.getByLabel('가로 위치', { exact: true }).press(i === 0 ? 'Home' : 'End');
      await page.getByLabel('세로 위치', { exact: true }).press(i === 0 ? 'Home' : 'End');
      await page.getByLabel('얼굴 크기', { exact: true }).press('End');
    }
    await page.getByRole('button', { name: '이 위치로 선택' }).click();
  }
  await stageRatio('landscape upload preserves image ratio at 360px');
  await noOverflow('28-character names and edge face placements do not widen the 360px page');
  const labelBounds = await page.locator('.scene-column .actor-label').evaluateAll(labels => labels.map(label => {
    const r = label.getBoundingClientRect(), s = label.closest('.photo-stage').getBoundingClientRect();
    return { left: r.left - s.left, right: r.right - s.left, stageWidth: s.width };
  }));
  for (const label of labelBounds) { expect(label.left).toBeGreaterThanOrEqual(-1); expect(label.right).toBeLessThanOrEqual(label.stageWidth + 1); }
  report.checks.push({ name: 'long face labels stay within the photo width', status: 'pass', labelBounds });
  await screenshot('long-names-landscape-mobile');
  await page.getByRole('button', { name: '이 셋을 깨우기' }).click();
  await expect(page.getByTestId('statement-s0')).toBeVisible({ timeout: 12_000 });
  for (const id of ['s0', 's1', 's2']) await page.getByTestId(`statement-${id}`).click();
  await examine();
  await noOverflow('long custom names in testimony and choices fit 360px');
  await screenshot('long-names-investigation-mobile');

  for (const width of [390, 768, 1440]) {
    await page.goto(origin);
    await page.setViewportSize({ width, height: width === 1440 ? 1050 : 844 });
    await upload(400, 600);
    await stageRatio(`portrait upload preserves image ratio at ${width}px`);
    await noOverflow(`portrait casting has no horizontal overflow at ${width}px`);
    if (width === 390) await screenshot('portrait-casting-mobile');
  }
  expect(report.browserErrors).toEqual([]);
  expect(report.failedRequests.filter(request => !request.reason?.includes('ERR_ABORTED'))).toEqual([]);
  report.status = 'pass';
} catch (error) {
  report.status = 'fail';
  report.error = String(error?.stack ?? error);
  await screenshot('redesign-targeted-failure').catch(() => {});
  process.exitCode = 1;
} finally {
  report.finishedAt = new Date().toISOString();
  report.finalSourceHashes = await hashes();
  report.sourceChangedDuringRun = JSON.stringify(report.sourceHashes) !== JSON.stringify(report.finalSourceHashes);
  await writeFile(`docs/${process.env.QA_REPORT_PREFIX || 'ui-redesign'}-targeted-results.json`, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ status: report.status, checks: report.checks.length, screenshots: report.screenshots.length, sourceChangedDuringRun: report.sourceChangedDuringRun, error: report.error }, null, 2));
  await browser.close();
}
