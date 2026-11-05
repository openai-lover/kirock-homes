import { test, expect, type Page } from '@playwright/test';
import sharp from 'sharp';
import { examine, tabTo } from './helpers';

// Legacy Korean-flow checks now choose Korean explicitly; new visitors default to English.
test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => { if (!localStorage.getItem('kirock:locale')) localStorage.setItem('kirock:locale', 'ko'); });
});

const origin = 'http://127.0.0.1:3000';
const suspectIds = ['s0', 's1', 's2'] as const;

async function fixture(width = 600, height = 400, orientation?: number) {
  const canvas = sharp({ create: { width, height, channels: 3, background: '#4a6d8c' } });
  // Deliberately synthetic, with a red top-left corner to verify rotation direction.
  const corner = await sharp({ create: { width: 100, height: 100, channels: 3, background: '#f02020' } }).png().toBuffer();
  let output = canvas.composite([{ input: corner, top: 0, left: 0 }]).jpeg();
  if (orientation) output = output.withMetadata({ orientation });
  return output.toBuffer();
}

async function upload(page: Page, width = 600, height = 400, orientation?: number) {
  await page.getByLabel('사진 업로드', { exact: true }).setInputFiles({ name: 'synthetic-fixture.jpg', mimeType: 'image/jpeg', buffer: await fixture(width, height, orientation) });
  await expect(page.getByRole('heading', { name: '누구를 깨울까요?' })).toBeVisible();
  await expect(page.locator('.scene-column img')).toHaveJSProperty('naturalWidth', orientation === 6 ? height : width);
  await expect(page.locator('.scene-column img')).toHaveJSProperty('naturalHeight', orientation === 6 ? width : height);
}

async function placeAll(page: Page) {
  for (let i = 0; i < 3; i++) {
    await page.locator('.cast-tabs button').nth(i).click();
    await page.getByRole('button', { name: '이 위치로 선택' }).click();
  }
}

async function investigate(page: Page) {
  await expect(page.getByTestId('statement-s0')).toBeVisible();
  await expect(page.getByTestId('accuse')).toBeDisabled();
  for (const id of suspectIds) await page.getByTestId(`statement-${id}`).click();
  await examine(page);
  await expect(page.getByRole('heading', { name: '누가 거짓말하고 있을까?' })).toBeVisible();
  const texts = await page.locator('.testimony p').allTextContents();
  const direct = texts.find(text => /범인은 ‘.+’야\./.test(text));
  const culprit = direct?.match(/범인은 ‘(.+)’야\./)?.[1];
  expect(culprit).toBeTruthy();
  const choices = await page.locator('.suspect-options button').allTextContents();
  const culpritIndex = choices.findIndex(text => text.slice(1) === culprit);
  expect(culpritIndex).toBeGreaterThanOrEqual(0);
  const culpritId = (await page.locator('.suspect-options button').nth(culpritIndex).getAttribute('data-testid'))!.replace('choose-', '');
  return { culprit: culprit!, culpritId, texts };
}

async function finish(page: Page, correct = true) {
  const mystery = await investigate(page);
  const target = correct ? mystery.culpritId : suspectIds.find(id => id !== mystery.culpritId)!;
  await page.getByTestId(`choose-${target}`).click();
  await page.getByTestId('accuse').click();
  await expect(page.locator('.verdict-tag')).toHaveText(correct ? '정답이에요!' : '앗, 무고한 물건이었어요');
  await expect(page.locator('.reveal-panel h2')).toContainText(mystery.culprit);
  await expect(page.locator('.proof li')).toHaveCount(3);
  await expect(page.locator('.proof li').last()).toContainText(mystery.culprit);
  await expect(page.getByTestId('accuse')).toHaveCount(0);
  return mystery;
}

test('sample correct verdict and wrong verdict both complete without API keys', async ({ page }) => {
  const unexpected: string[] = [];
  page.on('pageerror', error => unexpected.push(error.message));
  for (const correct of [true, false]) {
    await page.goto('/');
    await page.getByRole('button', { name: '샘플 책상에서 바로 해보기' }).click();
    await finish(page, correct);
    await page.getByText('공식 증언 다시 보기', { exact: true }).click();
    await expect(page.locator('.recap p')).toHaveCount(3);
  }
  expect(unexpected).toEqual([]);
});

test('sample can be completed using only keyboard navigation and subtitles', async ({ page }) => {
  await page.goto('/');
  await tabTo(page, page.getByRole('button', { name: '샘플 책상에서 바로 해보기' }));
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('statement-s0')).toBeVisible();
  for (const id of suspectIds) {
    await tabTo(page, page.getByTestId(`statement-${id}`));
    await page.keyboard.press('Enter');
  }
  await examine(page, true);
  await tabTo(page, page.getByTestId('choose-s0'));
  await page.keyboard.press('Space');
  await tabTo(page, page.getByTestId('accuse'));
  await page.keyboard.press('Enter');
  await expect(page.locator('.proof li')).toHaveCount(3);
  await expect(page.locator('.caption p')).not.toBeEmpty();
  await expect(page.getByTitle('효과음')).toHaveAttribute('aria-pressed', 'false');
});

for (const width of [360, 390, 768]) {
  test(`mobile/tablet ${width}px keeps photo faces and statements within the viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    await page.getByRole('button', { name: '샘플 책상에서 바로 해보기' }).click();
    await investigate(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    for (const id of suspectIds) {
      const actor = await page.getByTestId(`face-${id}`).boundingBox();
      expect(actor).toBeTruthy();
      expect(actor!.x).toBeGreaterThanOrEqual(0);
      expect(actor!.x + actor!.width).toBeLessThanOrEqual(width + 1);
    }
    await page.screenshot({ path: `test-results/viewport-${width}.png`, fullPage: true });
  });
}

test('landscape, portrait, EXIF rotation and manual clockwise rotation preserve photo coordinates', async ({ page }) => {
  await page.goto('/');
  for (const [width, height, orientation] of [[600, 400, undefined], [400, 600, undefined], [600, 400, 6]] as const) {
    await upload(page, width, height, orientation);
    const beforeRotation = await page.locator('.scene-column img').evaluate((element, hasOrientation) => {
      const img = element as HTMLImageElement, canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const context = canvas.getContext('2d')!; context.drawImage(img, 0, 0);
      return Array.from(context.getImageData(hasOrientation ? canvas.width - 50 : 50, 50, 1, 1).data);
    }, orientation === 6);
    expect(beforeRotation[0]).toBeGreaterThan(200);
    expect(beforeRotation[1]).toBeLessThan(70);
    const face = page.getByTestId('face-s0');
    await face.focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await expect(face).toHaveCSS('left', /.+/);
    const position = await face.evaluate(element => ({ x: parseFloat((element as HTMLElement).style.left) / 100, y: parseFloat((element as HTMLElement).style.top) / 100 }));
    expect(position.x).toBeCloseTo(.26);
    expect(position.y).toBeCloseTo(.51);
    await page.getByRole('button', { name: '사진 회전 ↻' }).click();
    await expect.poll(() => face.evaluate(element => parseFloat((element as HTMLElement).style.left) / 100)).toBeCloseTo(.49);
    await expect.poll(() => face.evaluate(element => parseFloat((element as HTMLElement).style.top) / 100)).toBeCloseTo(.26);
    const img = page.locator('.scene-column img');
    await expect(img).toHaveJSProperty('naturalWidth', orientation === 6 ? width : height);
    await expect(img).toHaveJSProperty('naturalHeight', orientation === 6 ? height : width);
    const afterRotation = await img.evaluate((element, hasOrientation) => {
      const image = element as HTMLImageElement, canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d')!; context.drawImage(image, 0, 0);
      return Array.from(context.getImageData(canvas.width - 50, hasOrientation ? canvas.height - 50 : 50, 1, 1).data);
    }, orientation === 6);
    expect(afterRotation[0]).toBeGreaterThan(200);
    expect(afterRotation[1]).toBeLessThan(70);
    await page.setViewportSize({ width: 390, height: 844 });
    const relation = await face.evaluate(element => {
      const actor = element.getBoundingClientRect(), stage = element.parentElement!.getBoundingClientRect();
      return { x: (actor.x + actor.width / 2 - stage.x) / stage.width, y: (actor.y + actor.height / 2 - stage.y) / stage.height };
    });
    expect(relation.x).toBeCloseTo(.49, 2);
    expect(relation.y).toBeCloseTo(.26, 2);
  }
  await placeAll(page);
  await page.getByRole('button', { name: '이 셋을 깨우기' }).click();
  await finish(page);
});

test('unsupported and corrupted photo files give usable errors and sample remains playable', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('사진 업로드', { exact: true }).setInputFiles({ name: 'photo.heic', mimeType: 'image/heic', buffer: Buffer.from('unsupported') });
  await expect(page.locator('main').getByRole('alert')).toContainText('HEIC');
  await page.getByLabel('사진 업로드', { exact: true }).setInputFiles({ name: 'broken.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('corrupt') });
  await expect(page.locator('main').getByRole('alert')).toContainText('사진을 읽을 수 없어요');
  await page.getByRole('button', { name: '샘플 책상에서 바로 해보기' }).click();
  await finish(page);
});

test('missing AI key falls back to manual selection with explicit analysis consent', async ({ page }) => {
  await page.goto('/');
  await upload(page);
  await page.getByText('자동 추천 도움받기 (선택)', { exact: true }).click();
  await expect(page.getByRole('button', { name: '물건 후보 추천' })).toBeDisabled();
  await page.locator('.ai-option input[type=checkbox]').check();
  const analysisRequest = page.waitForRequest('**/api/analyze');
  const analysisResponse = page.waitForResponse('**/api/analyze');
  await page.getByRole('button', { name: '물건 후보 추천' }).click();
  expect((await analysisRequest).postDataJSON().consent).toBe(true);
  const response = await analysisResponse;
  expect(response.status()).toBe(200);
  expect(await response.json()).toMatchObject({ status: 'manual', reason: 'not_configured' });
  await expect(page.getByRole('status')).toContainText('자동 추천을 사용할 수 없어요');
  await placeAll(page);
  await page.getByRole('button', { name: '이 셋을 깨우기' }).click();
  await finish(page);
});

test('invalid AI output and real client timeout both retain a completable manual path', async ({ page }) => {
  for (const mode of ['invalid', 'timeout']) {
    await page.goto('/');
    await upload(page);
    await page.route('**/api/analyze', async route => {
      if (mode === 'timeout') {
        await new Promise(resolve => setTimeout(resolve, 9000));
        await route.abort().catch(() => {});
      } else await route.fulfill({ json: { status: 'manual', reason: 'invalid_output', candidates: [] } });
    });
    await page.getByText('자동 추천 도움받기 (선택)', { exact: true }).click();
    await page.locator('.ai-option input[type=checkbox]').check();
    await page.getByRole('button', { name: '물건 후보 추천' }).click();
    await expect(page.getByRole('status')).toBeVisible({ timeout: 12_000 });
    await placeAll(page);
    await page.getByRole('button', { name: '이 셋을 깨우기' }).click();
    await finish(page);
    await page.unroute('**/api/analyze');
  }
});

const suggested = suspectIds.map((id, i) => ({ displayName: `추천 물건 ${i + 1}`, kind: 'book', personalityId: 'dry', face: { x: .25 + .25 * i, y: .5, scale: .16, rotation: 0 } }));

test('valid AI candidates use displayName and a late response cannot overwrite manual choices', async ({ page }) => {
  await page.goto('/');
  await upload(page);
  await page.route('**/api/analyze', route => route.fulfill({ json: { status: 'ready', candidates: suggested } }));
  await page.getByText('자동 추천 도움받기 (선택)', { exact: true }).click();
  await page.locator('.ai-option input[type=checkbox]').check();
  await page.getByRole('button', { name: '물건 후보 추천' }).click();
  await expect(page.getByLabel('물건 이름', { exact: true })).toHaveValue('추천 물건 1');
  await expect(page.getByRole('button', { name: '이 셋을 깨우기' })).toBeEnabled();
  await page.unroute('**/api/analyze');
  await page.route('**/api/analyze', async route => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    await route.fulfill({ json: { status: 'ready', candidates: suggested } });
  });
  await page.getByRole('button', { name: '물건 후보 추천' }).click();
  await page.getByLabel('물건 이름', { exact: true }).fill('내가 고른 책');
  // The second request completes, then the per-photo two-call cap applies.
  await expect(page.getByRole('button', { name: '물건 후보 추천' })).toBeDisabled();
  await expect(page.getByText('추천은 사진 한 장에 두 번까지예요. 직접 선택으로 계속해 주세요.')).toBeVisible();
  await expect(page.getByLabel('물건 이름', { exact: true })).toHaveValue('내가 고른 책');
  await page.getByRole('button', { name: '이 셋을 깨우기' }).click();
  await finish(page);
});

test('corrupted JSON and malformed ready responses never crash the casting screen', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const body of ['{broken-json', JSON.stringify({ status: 'ready', candidates: [{}, {}, {}] })]) {
    await page.goto('/');
    await upload(page);
    await page.route('**/api/analyze', route => route.fulfill({ contentType: 'application/json', body }));
    await page.getByText('자동 추천 도움받기 (선택)', { exact: true }).click();
    await page.locator('.ai-option input[type=checkbox]').check();
    await page.getByRole('button', { name: '물건 후보 추천' }).click();
    await expect(page.getByRole('status')).toBeVisible();
    await expect(page.getByLabel('물건 이름', { exact: true })).toHaveValue('물건 1');
    await placeAll(page);
    await page.getByRole('button', { name: '이 셋을 깨우기' }).click();
    await finish(page);
    await page.unroute('**/api/analyze');
  }
  expect(errors).toEqual([]);
});

test('English sample has translated testimony, verdict, and explanation', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('language-select').selectOption('en');
  await page.getByRole('button', { name: 'Try the sample desk' }).click();
  await expect(page.getByTestId('statement-s0')).toBeVisible();
  for (const id of suspectIds) await page.getByTestId(`statement-${id}`).click();
  await examine(page);
  const evidence = await page.locator('.testimony p').allTextContents();
  expect(evidence.every(text => !/[가-힣]/u.test(text))).toBe(true);
  await page.getByTestId('choose-s0').click();
  await page.getByTestId('accuse').click();
  await expect(page.locator('.reveal-panel h2')).toContainText('The culprit is');
  expect((await page.locator('.proof').innerText()).match(/[가-힣]/u)).toBeNull();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('sharing preserves the case, hides answers, supports independent one-shot play, and deletes for the owner', async ({ page, browser }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '샘플 책상에서 바로 해보기' }).click();
  const local = await finish(page);
  let storedDraft: unknown;
  page.on('request', request => { if (request.url().endsWith('/api/shared-cases') && request.method() === 'POST') storedDraft = request.postDataJSON().draft; });
  await page.getByRole('button', { name: '친구에게 같은 사건 보내기' }).click();
  const create = page.getByRole('button', { name: '이 사진으로 링크 만들기', exact: true });
  await expect(create).toBeDisabled();
  await page.getByLabel('사진을 확인했고 링크로 공개하는 데 동의해요.').check();
  const creationResponse = page.waitForResponse(response => response.url().endsWith('/api/shared-cases') && response.request().method() === 'POST');
  await create.click();
  const creation = await creationResponse;
  expect(creation.status(), await creation.text()).toBe(201);
  const link = page.getByLabel('친구의 사건 링크', { exact: true });
  await expect(link).toBeVisible();
  const url = await link.inputValue(), shareId = url.split('/').at(-1)!;
  expect(storedDraft).toBeTruthy();
  const publicResponse = await page.request.get(`/api/shared-cases/${shareId}?locale=ko`);
  expect(publicResponse.ok()).toBe(true);
  const publicCase = await publicResponse.json();
  expect(publicCase.statements.map((item: { text: string }) => item.text)).toEqual(local.texts);
  expect(Object.keys(publicCase.interrogations).sort()).toEqual([...suspectIds]);
  expect(publicCase.factLabels).toHaveLength(2);
  const prohibited = ['culpritId', 'confession', 'proofSteps', 'roleAssignment', 'factInverted', 'private_json'];
  for (const key of prohibited) expect(JSON.stringify(publicCase)).not.toContain(`"${key}"`);
  const html = await (await page.request.get(`/s/${shareId}`)).text();
  for (const key of prohibited) expect(html).not.toContain(`"${key}"`);
  const image1 = await page.request.get(publicCase.scene.url);
  expect(image1.headers()['cache-control']).toContain('no-store');
  const friendContext = await browser.newContext({ baseURL: origin, locale: 'ko-KR', reducedMotion: 'reduce' });
  await friendContext.addInitScript(() => localStorage.setItem('kirock:locale', 'ko'));
  const friend = await friendContext.newPage();
  try {
    await friend.goto(url);
    const friendData = await (await friend.request.get(`/api/shared-cases/${shareId}?locale=ko`)).json();
    expect(friendData.isOwner).toBe(false);
    expect(friendData.statements).toEqual(publicCase.statements);
    expect(friendData.characterLines).toEqual(publicCase.characterLines);
    expect(friendData.suspects).toEqual(publicCase.suspects);
    expect(friendData.interrogations).toEqual(publicCase.interrogations);
    expect(friendData.factLabels).toEqual(publicCase.factLabels);
    expect(await (await friend.request.get(friendData.scene.url)).body()).toEqual(await image1.body());
    await friend.getByRole('button', { name: '친구의 사건 시작하기' }).click();
    const mystery = await finish(friend, false);
    expect(mystery.culprit).toBe(local.culprit);
    const playId = await friend.evaluate(id => sessionStorage.getItem(`play:${id}`), shareId);
    const duplicate = await friend.request.post(`/api/plays/${playId}/accuse`, { headers: { Origin: origin }, data: { suspectId: mystery.culpritId, locale: 'ko' } });
    expect(duplicate.ok()).toBe(true);
    const verdict = await duplicate.json();
    expect(verdict.correct).toBe(false);
    expect(verdict.accusedId).not.toBe(mystery.culpritId);
    const forbidden = await friend.request.delete(`/api/shared-cases/${shareId}`, { headers: { Origin: origin } });
    expect(forbidden.status()).toBe(403);
    const english = await (await friend.request.get(`/api/shared-cases/${shareId}?locale=en`)).json();
    expect(english.id).toBe(publicCase.id);
    expect(english.suspects.map(({displayName, ...suspect}: {displayName:string}) => suspect)).toEqual(publicCase.suspects.map(({displayName, ...suspect}: {displayName:string}) => suspect));
    expect(english.locale).toBe('en');
    expect(Object.keys(english.interrogations).sort()).toEqual([...suspectIds]);
    expect(english.factLabels).toHaveLength(2);
    const otherFriendContext = await browser.newContext({ baseURL: origin, locale: 'ko-KR', reducedMotion: 'reduce' });
    try {
      await otherFriendContext.addInitScript(() => localStorage.setItem('kirock:locale', 'ko'));
      const otherFriend = await otherFriendContext.newPage();
      await otherFriend.goto(url);
      await otherFriend.getByRole('button', { name: '친구의 사건 시작하기' }).click();
      await finish(otherFriend, true);
      const independentPlay = await otherFriend.evaluate(id => sessionStorage.getItem(`play:${id}`), shareId);
      expect(independentPlay).not.toBe(playId);
    } finally { await otherFriendContext.close(); }
    await page.getByRole('button', { name: '공유 삭제', exact: true }).click();
    await expect(page.locator('main').getByRole('alert')).toContainText('삭제했어요');
    expect((await friend.request.get(`/api/shared-cases/${shareId}`)).status()).toBe(404);
    expect((await friend.request.get(friendData.scene.url)).status()).toBe(404);
    await friend.goto(url);
    await expect(friend.locator('main').getByRole('alert')).toContainText('만료되었거나 삭제');
  } finally { await friendContext.close(); }
});
