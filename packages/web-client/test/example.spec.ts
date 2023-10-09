import { test, expect } from '@playwright/test';

test('has a title', async ({ page }) => {
  await page.goto('http://localhost:8000/');

  await expect(page).toHaveTitle('linen.dev');
});

test('shows a logo on page load', async ({ page }) => {
  await page.goto('http://localhost:8000/');

  const image = await page.$('img');
  if (image) {
    const alt = await image.getAttribute('alt');
    expect(alt).toEqual('Linen Logo');
  }
});
