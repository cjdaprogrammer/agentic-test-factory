import { expect, type Page } from '@playwright/test';

/** Catalogue / product area of the shop. */
export class ShopPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/');
    await expect(this.page.getByRole('heading', { name: 'QA Shop', level: 1 })).toBeVisible();
  }

  async addToCart(product: string): Promise<void> {
    await this.page.getByRole('button', { name: `Add ${product} to cart` }).click();
  }
}
