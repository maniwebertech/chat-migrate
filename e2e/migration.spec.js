import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SAMPLE_FILE = path.resolve(__dirname, '../sample_conversations.json');

test.describe('Full migration flow — JSON export', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads chats from sample file and reaches Select screen', async ({ page }) => {
    // Configure
    await page.getByRole('button', { name: 'ChatGPT' }).first().click();
    await page.getByRole('button', { name: /json/i }).click();

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(SAMPLE_FILE);

    await page.getByRole('button', { name: /load chats/i }).click();

    // Should reach Select screen
    await expect(page.getByText('Select Chats')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Python Sorting Help')).toBeVisible();
    await expect(page.getByText('React useEffect Question')).toBeVisible();
  });

  test('select all + migrate → reaches Done screen', async ({ page }) => {
    // Configure
    await page.getByRole('button', { name: 'ChatGPT' }).first().click();
    await page.getByRole('button', { name: /json/i }).click();
    await page.locator('input[type="file"]').setInputFiles(SAMPLE_FILE);
    await page.getByRole('button', { name: /load chats/i }).click();
    await expect(page.getByText('Select Chats')).toBeVisible({ timeout: 5000 });

    // Select all
    await page.getByRole('button', { name: /select all/i }).click();
    await expect(page.getByText(/2 selected/i)).toBeVisible();

    // Migrate
    await page.getByRole('button', { name: /migrate/i }).click();
    await expect(page.getByText('Migrating Chats')).toBeVisible();

    // Done
    await expect(page.getByText('Migration Complete')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('2')).toBeVisible(); // migrated count
  });

  test('deselect all disables migrate button', async ({ page }) => {
    await page.getByRole('button', { name: 'ChatGPT' }).first().click();
    await page.getByRole('button', { name: /json/i }).click();
    await page.locator('input[type="file"]').setInputFiles(SAMPLE_FILE);
    await page.getByRole('button', { name: /load chats/i }).click();
    await expect(page.getByText('Select Chats')).toBeVisible({ timeout: 5000 });

    // All should be selected by default — deselect all
    await page.getByRole('button', { name: /deselect all/i }).click();
    const migrateBtn = page.getByRole('button', { name: /migrate/i });
    await expect(migrateBtn).toBeDisabled();
  });

  test('search filters the chat list', async ({ page }) => {
    await page.getByRole('button', { name: 'ChatGPT' }).first().click();
    await page.getByRole('button', { name: /json/i }).click();
    await page.locator('input[type="file"]').setInputFiles(SAMPLE_FILE);
    await page.getByRole('button', { name: /load chats/i }).click();
    await expect(page.getByText('Select Chats')).toBeVisible({ timeout: 5000 });

    await page.getByPlaceholder(/search/i).fill('python');
    await expect(page.getByText('Python Sorting Help')).toBeVisible();
    await expect(page.getByText('React useEffect Question')).not.toBeVisible();
  });

  test('Start New Migration resets back to Configure screen', async ({ page }) => {
    // Speed through the flow
    await page.getByRole('button', { name: 'ChatGPT' }).first().click();
    await page.getByRole('button', { name: /json/i }).click();
    await page.locator('input[type="file"]').setInputFiles(SAMPLE_FILE);
    await page.getByRole('button', { name: /load chats/i }).click();
    await expect(page.getByText('Select Chats')).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: /select all/i }).click();
    await page.getByRole('button', { name: /migrate/i }).click();
    await expect(page.getByText('Migration Complete')).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /start new migration/i }).click();
    await expect(page.getByText('Configure Migration')).toBeVisible();
  });
});
