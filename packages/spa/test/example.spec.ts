import { test, expect } from '@playwright/test';
import Server from './server';

test('has a title', async ({ page }) => {
  const server = new Server();
  const { port } = await server.start({ port: 0 });
  await page.goto(`http://localhost:${port}/`);

  await expect(page).toHaveTitle('linen.dev');
  await server.stop();
});

test('shows a logo on page load', async ({ page }) => {
  const server = new Server();
  const { port } = await server.start({ port: 0 });
  await page.goto(`http://localhost:${port}/`);

  const image = await page.$('img');
  if (image) {
    const alt = await image.getAttribute('alt');
    expect(alt).toEqual('Linen Logo');
  } else {
    throw new Error('Splash image is missing');
  }
  await server.stop();
});

test('show an error layout when the start api fails', async ({ page }) => {
  const server = new Server();
  const { port } = await server.start({ port: 0, statuses: { start: 500 } });
  await page.goto(`http://localhost:${port}/`);

  await page.waitForSelector(
    'text="Something went wrong. Please refresh the page."',
    { timeout: 1000 }
  );
  const content = await page.content();
  expect(content).toContain('Something went wrong. Please refresh the page.');
  await server.stop();
});
