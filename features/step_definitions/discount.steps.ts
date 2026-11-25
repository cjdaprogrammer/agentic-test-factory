import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { ShopWorld } from '../support/world';

Given('I am on the shop home page', async function (this: ShopWorld) {
  await this.shop.open();
});

Given('my cart contains {string}', async function (this: ShopWorld, product: string) {
  await this.shop.addToCart(product);
});

Given('I have applied the discount code {string}', async function (this: ShopWorld, code: string) {
  await this.cart.applyCode(code);
  await expect(this.cart.message).toHaveText(`Discount applied: ${code.toUpperCase()}`);
});

When('I apply the discount code {string}', async function (this: ShopWorld, code: string) {
  await this.cart.applyCode(code);
});

When('I remove the discount', async function (this: ShopWorld) {
  await this.cart.removeDiscount();
});

Then('I should see the message {string}', async function (this: ShopWorld, message: string) {
  await expect(this.cart.message).toHaveText(message);
});

Then('the subtotal should be {string}', async function (this: ShopWorld, amount: string) {
  await expect(this.cart.subtotal).toHaveText(amount);
});

Then('the discount should be {string}', async function (this: ShopWorld, amount: string) {
  await expect(this.cart.discount).toHaveText(amount);
});

Then('no discount should be applied', async function (this: ShopWorld) {
  await expect(this.cart.discount).toHaveText('$0.00');
});

Then('the order total should be {string}', async function (this: ShopWorld, amount: string) {
  await expect(this.cart.total).toHaveText(amount);
});
