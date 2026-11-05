import { expect, type Locator, type Page } from '@playwright/test';

export async function tabTo(page: Page, target: Locator) {
  for (let attempt = 0; attempt < 70; attempt++) {
    if (await target.evaluate(element => element === document.activeElement)) return;
    await page.keyboard.press('Tab');
  }
  throw new Error('Target was not reachable using the Tab key');
}

/** Complete all nine explicit dialogue actions, without bypassing the game gate. */
export async function examine(page: Page, keyboardOnly = false) {
  const act = async (target: Locator) => {
    if (keyboardOnly) { await tabTo(page, target); await page.keyboard.press('Enter'); }
    else await target.click();
  };
  for (const [index, id] of ['s0', 's1', 's2'].entries()) {
    await act(page.getByTestId(`question-${id}`));
    await expect(page.getByTestId('exchange')).toBeVisible();
    // The component focuses the exchange on the next animation frame. Wait for
    // that deliberate focus change before sending another real keyboard action.
    if (keyboardOnly) await expect(page.getByTestId('exchange')).toBeFocused();
    await act(page.getByTestId('hear-rebuttal'));
    await act(page.getByTestId('save-note'));
    await expect(page.getByTestId('exam-progress')).toHaveText(`${index + 1}/3`);
  }
  await expect(page.getByTestId('choose-s0')).toBeEnabled();
  await expect(page.getByTestId('accuse')).toBeDisabled();
}
