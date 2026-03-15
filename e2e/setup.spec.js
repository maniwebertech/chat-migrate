import { test, expect } from '@playwright/test';

test.describe('Step 1 — Configure Migration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows the configure screen on load', async ({ page }) => {
    await expect(page.getByText('Configure Migration')).toBeVisible();
    await expect(page.getByText('ChatGPT')).toBeVisible();
    await expect(page.getByText('Claude')).toBeVisible();
  });

  test('shows privacy banner', async ({ page }) => {
    await expect(page.getByText('Your keys never leave your browser')).toBeVisible();
  });

  test('shows step bar with 4 steps', async ({ page }) => {
    await expect(page.getByText('Configure')).toBeVisible();
    await expect(page.getByText('Select')).toBeVisible();
    await expect(page.getByText('Migrate')).toBeVisible();
    await expect(page.getByText('Done')).toBeVisible();
  });

  test('shows error if Load Chats clicked without selecting providers', async ({ page }) => {
    await page.getByRole('button', { name: /load chats/i }).click();
    await expect(page.getByText('Select both source and target.')).toBeVisible();
  });

  test('shows error if no file is uploaded', async ({ page }) => {
    await page.getByRole('button', { name: 'ChatGPT' }).first().click();
    // pick a target
    await page.getByRole('button', { name: /json/i }).click();
    await page.getByRole('button', { name: /load chats/i }).click();
    await expect(page.getByText(/upload your conversations\.json/i)).toBeVisible();
  });

  test('cannot pick the same provider as source and target', async ({ page }) => {
    // Select ChatGPT as source — the ChatGPT target button should be disabled
    await page.getByRole('button', { name: 'ChatGPT' }).first().click();
    const chatgptTarget = page.locator('button', { hasText: 'ChatGPT' }).nth(1);
    await expect(chatgptTarget).toBeDisabled();
  });

  test('shows Anthropic key field only when Claude is the target', async ({ page }) => {
    // No key field initially
    await expect(page.getByPlaceholder('sk-ant-...')).not.toBeVisible();

    // Select source + Claude target
    await page.getByRole('button', { name: 'ChatGPT' }).first().click();
    await page.getByRole('button', { name: /^Claude/ }).nth(1).click();

    await expect(page.getByPlaceholder('sk-ant-...')).toBeVisible();
  });

  test('dark/light mode toggle changes icon', async ({ page }) => {
    const toggle = page.getByRole('button', { name: /toggle theme|dark|light/i });
    const before = await toggle.textContent();
    await toggle.click();
    const after = await toggle.textContent();
    expect(before).not.toBe(after);
  });
});
