import { expect, test } from '@playwright/test';

// Baselines: `npm run test:visual:update` (ideally inside Docker so fonts match CI).
test.describe('visual: key pages', () => {
  test('home page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'QA Shop', level: 1 })).toBeVisible();
    await expect(page).toHaveScreenshot('home.png', { fullPage: true });
  });

  test('cart with discount applied', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Add Backpack to cart' }).click();
    await page.getByLabel('Discount code').fill('SAVE10');
    await page.getByRole('button', { name: 'Apply', exact: true }).click();
    await expect(page.getByRole('status')).toHaveText('Discount applied: SAVE10');
    await expect(page).toHaveScreenshot('cart-discount-applied.png', { fullPage: true });
  });
});
