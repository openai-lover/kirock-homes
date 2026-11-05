import { test, expect, type Page } from '@playwright/test';
import sharp from 'sharp';
import { examine } from './helpers';

// Legacy Korean-flow checks now choose Korean explicitly; new visitors default to English.
test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => { if (!localStorage.getItem('kirock:locale')) localStorage.setItem('kirock:locale', 'ko'); });
});

async function openSyntheticCasting(page: Page) {
  const image = await sharp({ create: { width: 600, height: 400, channels: 3, background: '#627b78' } }).jpeg().toBuffer();
  await page.goto('/');
  await page.getByLabel('사진 업로드', { exact: true }).setInputFiles({ name: 'synthetic-ui-fixture.jpg', mimeType: 'image/jpeg', buffer: image });
  await expect(page.getByRole('heading', { name: '누구를 깨울까요?' })).toBeVisible();
}

test('share preview traps forward/reverse focus and restores its opener on Escape', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '샘플 책상에서 바로 해보기' }).click();
  await page.getByRole('button', { name: '증언 들으러 가기' }).click();
  for (const id of ['s0', 's1', 's2']) await page.getByTestId(`statement-${id}`).click();
  await examine(page);
  await page.getByTestId('choose-s0').click();
  await page.getByTestId('accuse').click();
  const opener = page.getByRole('button', { name: '친구에게 같은 사건 보내기' });
  await opener.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByLabel('사진을 확인했고 링크로 공개하는 데 동의해요.')).not.toBeChecked();
  await expect(page.getByRole('button', { name: '이 사진으로 링크 만들기', exact: true })).toBeDisabled();
  for (const key of ['Tab', 'Shift+Tab']) {
    for (let i = 0; i < 9; i++) {
      await page.keyboard.press(key);
      expect(await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')))).toBe(true);
    }
  }
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test('all three cross-examinations gate the verdict and cite only the existing named testimony', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '샘플 책상에서 바로 해보기' }).click();
  await page.getByRole('button', { name: '증언 들으러 가기' }).click();
  const statements: Record<string, { name: string; text: string }> = {};
  for (const id of ['s0', 's1', 's2']) {
    const card = page.getByTestId(`statement-${id}`);
    await card.click();
    statements[id] = { name: (await card.locator('.witness strong').textContent())!, text: (await card.locator('p').textContent())! };
  }
  await expect(page.getByTestId('exam-progress')).toHaveText('0/3');
  await expect(page.locator('.testimony-file')).not.toHaveAttribute('open');
  for (const id of ['s0', 's1', 's2']) await expect(page.getByTestId(`choose-${id}`)).toBeDisabled();
  await expect(page.getByTestId('accuse')).toBeDisabled();
  for (const [index, id] of ['s0', 's1', 's2'].entries()) {
    await page.getByTestId(`question-${id}`).click();
    const exchange = page.getByTestId('exchange');
    await expect(exchange.locator('.detective-question')).toContainText(statements[id].name);
    await expect(exchange.locator('.dialogue-turn').first()).toContainText(statements[id].text);
    await expect(page.getByTestId('save-note')).toHaveCount(0);
    await page.getByTestId('hear-rebuttal').click();
    const rebuttalName = (await exchange.locator('.dialogue-turn.objection > span').textContent())!;
    const otherId = Object.keys(statements).find(key => key !== id && rebuttalName.includes(statements[key].name));
    expect(otherId).toBeTruthy();
    await expect(exchange.locator('.dialogue-turn.objection p')).toContainText(statements[otherId!].text);
    const citations = await exchange.locator('.citation-strip blockquote').allTextContents();
    expect(citations).toHaveLength(2);
    expect(citations.some(text => text.includes(statements[id].text))).toBe(true);
    expect(citations.some(text => text.includes(statements[otherId!].text))).toBe(true);
    await expect(exchange.locator('.detective-note p')).not.toBeEmpty();
    await expect(page.getByTestId('exam-progress')).toHaveText(`${index}/3`);
    await page.getByTestId('save-note').click();
    await expect(page.getByTestId('exam-progress')).toHaveText(`${index + 1}/3`);
    if (index === 2) await page.getByText('대질 기록 다시 보기', { exact: true }).click();
    if (await page.locator('.notebook').getAttribute('open') === null) await page.locator('.notebook summary').click();
    await page.locator(`#theory-${id}`).selectOption('false');
    await page.locator(`#theory-${id}`).selectOption('true');
    // Personal notes are reversible and never auto-submit or reveal a verdict.
    await expect(page.locator('.verdict-tag')).toHaveCount(0);
    await expect(page.locator('.proof')).toHaveCount(0);
    await expect(page.getByTestId('accuse')).toBeDisabled();
    if (index < 2) await expect(page.getByTestId('choose-s0')).toBeDisabled();
  }
  await expect(page.getByTestId('choose-s0')).toBeEnabled();
  await expect(page.getByRole('heading', { name: '누가 거짓말하고 있을까?' })).toBeVisible();
  await page.getByTestId('choose-s0').click();
  await expect(page.getByTestId('accuse')).toBeEnabled();
  await expect(page.locator('.verdict-tag')).toHaveCount(0);
});

test('casting rejects normalized duplicate names and long edge labels fit a 360px photo', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await openSyntheticCasting(page);
  for (let i = 0; i < 3; i++) {
    await page.locator('.cast-tabs button').nth(i).click();
    await page.getByLabel('물건 이름', { exact: true }).fill(['Cup', 'cup', 'Book'][i]);
    await page.getByRole('button', { name: '이 위치로 선택' }).click();
  }
  await expect(page.getByRole('button', { name: '이 셋을 깨우기' })).toBeDisabled();
  await expect(page.getByText('서로 다른 이름을 지어 주세요.', { exact: false })).toBeVisible();
  await page.locator('.cast-tabs button').nth(1).click();
  await page.getByLabel('물건 이름', { exact: true }).fill('ＣＵＰ');
  await expect(page.getByRole('button', { name: '이 셋을 깨우기' })).toBeDisabled();
  for (let i = 0; i < 3; i++) {
    await page.locator('.cast-tabs button').nth(i).click();
    await page.getByLabel('물건 이름', { exact: true }).fill('긴이름'.repeat(9) + (i + 1));
    if (i !== 1) {
      await page.getByLabel('가로 위치', { exact: true }).press(i === 0 ? 'Home' : 'End');
      await page.getByLabel('세로 위치', { exact: true }).press(i === 0 ? 'Home' : 'End');
      await page.getByLabel('얼굴 크기', { exact: true }).press('End');
    }
  }
  await expect(page.getByRole('button', { name: '이 셋을 깨우기' })).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  const labels = await page.locator('.scene-column .actor-label').evaluateAll(elements => elements.map(element => {
    const label = element.getBoundingClientRect(), stage = element.closest('.photo-stage')!.getBoundingClientRect();
    return { left: label.left - stage.left, right: label.right - stage.left, width: stage.width };
  }));
  for (const label of labels) {
    expect(label.left).toBeGreaterThanOrEqual(-1);
    expect(label.right).toBeLessThanOrEqual(label.width + 1);
  }
});

test('six-world hypothesis cards are reversible personal notes and never judge the remaining world', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '샘플 책상에서 바로 해보기' }).click();
  await page.getByRole('button', { name: '증언 들으러 가기' }).click();
  for (const id of ['s0', 's1', 's2']) await page.getByTestId(`statement-${id}`).click();
  await examine(page);
  const board = page.getByTestId('hypothesis-board');
  await expect(board).toBeVisible();
  const cards = board.locator('.hypothesis-card');
  await expect(cards).toHaveCount(6);
  for (const id of ['s0', 's1', 's2']) {
    await expect(page.getByTestId(`hypothesis-card-${id}-false`)).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByTestId(`hypothesis-card-${id}-true`)).toHaveAttribute('aria-pressed', 'false');
  }
  for (let i = 0; i < 5; i++) await cards.nth(i).click();
  await expect(board.locator('.hypothesis-count')).toContainText('1 / 6');
  await expect(board.locator('.hypothesis-last-label')).toHaveText('내가 남긴 가설');
  await expect(page.locator('.verdict-tag')).toHaveCount(0);
  await expect(page.locator('.proof')).toHaveCount(0);
  await expect(page.getByTestId('accuse')).toBeDisabled();
  await cards.nth(5).click();
  await expect(board.locator('.hypothesis-count')).toContainText('0 / 6');
  await expect(board.locator('.hypothesis-empty')).toBeVisible();
  await cards.nth(0).click();
  await expect(board.locator('.hypothesis-count')).toContainText('1 / 6');
  await expect(cards.nth(0)).toHaveAttribute('aria-pressed', 'false');
  await page.getByTestId('hypothesis-reset').click();
  await expect(board.locator('.hypothesis-count')).toContainText('6 / 6');
  for (let i = 0; i < 6; i++) await expect(cards.nth(i)).toHaveAttribute('aria-pressed', 'false');
  await cards.nth(0).click();
  await page.getByTestId('language-select').selectOption('en');
  await expect(board.locator('.hypothesis-count')).toContainText('Remaining: 5 / 6');
  await expect(cards.nth(0)).toHaveAttribute('aria-pressed', 'true');
  await expect(board.getByRole('heading')).toHaveText('My hypothesis board');
  await page.getByTestId('hypothesis-reset').click();
  await expect(board.locator('.hypothesis-count')).toContainText('Remaining: 6 / 6');
  await expect(page.locator('.verdict-tag')).toHaveCount(0);
});

test('cancelling a face pointer drag clears movement state', async ({ page }) => {
  await openSyntheticCasting(page);
  const face = page.getByTestId('face-s0');
  const box = (await face.boundingBox())!;
  const before = await face.evaluate(element => ({ left: (element as HTMLElement).style.left, top: (element as HTMLElement).style.top }));
  await face.evaluate(element => element.addEventListener('pointerdown', event => {
    (element as HTMLElement).dataset.qaPointerId = String((event as PointerEvent).pointerId);
  }, { once: true }));
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  const pointerId = await face.evaluate(element => Number((element as HTMLElement).dataset.qaPointerId));
  expect(Number.isFinite(pointerId)).toBe(true);
  await face.evaluate((element, id) => element.dispatchEvent(new PointerEvent('pointercancel', { pointerId: id, pointerType: 'mouse', bubbles: true })), pointerId);
  await page.mouse.move(box.x + box.width / 2 + 35, box.y + box.height / 2 + 30);
  const after = await face.evaluate(element => ({ left: (element as HTMLElement).style.left, top: (element as HTMLElement).style.top }));
  expect(after).toEqual(before);
  // A synthetic cancel does not update Chrome's native click-suppression state.
  // Release over the original actor so the harness does not create a new stage
  // placement click unrelated to the cancelled drag being tested.
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.up();
  await face.focus();
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => face.evaluate(element => parseFloat((element as HTMLElement).style.left))).toBeCloseTo(26);
});
