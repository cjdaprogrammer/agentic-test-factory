import { type Locator, type Page } from '@playwright/test';

/**
 * Cart + discount panel.
 * Locators prefer accessible roles/labels; getByTestId is used only for the price
 * figures, which have no accessible role of their own.
 */
export class CartPage {
  readonly codeInput: Locator;
  readonly applyButton: Locator;
  readonly removeButton: Locator;
  readonly message: Locator;
  readonly subtotal: Locator;
  readonly discount: Locator;
  readonly total: Locator;

  constructor(page: Page) {
    this.codeInput = page.getByLabel('Discount code');
    this.applyButton = page.getByRole('button', { name: 'Apply', exact: true });
    this.removeButton = page.getByRole('button', { name: 'Remove discount' });
    this.message = page.getByRole('status');
    this.subtotal = page.getByTestId('subtotal');
    this.discount = page.getByTestId('discount');
    this.total = page.getByTestId('total');
  }

  async applyCode(code: string): Promise<void> {
    await this.codeInput.fill(code);
    await this.applyButton.click();
  }

  async removeDiscount(): Promise<void> {
    await this.removeButton.click();
  }
}
