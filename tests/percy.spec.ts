import percySnapshot  from '@percy/playwright';
import { expect, test } from '@playwright/test';

// Optional cloud visual review. Run with: PERCY_TOKEN=... npm run test:percy
// Applitools Eyes works the same way: add @applitools/eyes-playwright and call eyes.check(...).
test.skip(!process.env.PERCY_TOKEN, 'PERCY_TOKEN not set');

test('@percy home page and discounted cart', async ({ page }) => {
  await page.goto('/');
  await percySnapshot(page, 'Home page');

  await page.getByRole('button', { name: 'Add Backpack to cart' }).click();
  await page.getByLabel('Discount code').fill('SAVE10');
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Discount applied: SAVE10');
  await percySnapshot(page, 'Cart with SAVE10 applied');
});
