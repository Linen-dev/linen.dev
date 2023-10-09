import { test, expect } from '@playwright/test';

test('has a title', async ({ page }) => {
  await page.goto('http://localhost:8000/');

  await expect(page).toHaveTitle('linen.dev');
});
