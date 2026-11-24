import { setWorldConstructor, World, type IWorldOptions } from '@cucumber/cucumber';
import type { BrowserContext, Page } from '@playwright/test';
import { CartPage } from '../../pages/CartPage';
import { ShopPage } from '../../pages/ShopPage';

export class ShopWorld extends World {
  context!: BrowserContext;
  page!: Page;
  shop!: ShopPage;
  cart!: CartPage;

  constructor(options: IWorldOptions) {
    super(options);
  }

  init(context: BrowserContext, page: Page): void {
    this.context = context;
    this.page = page;
    this.shop = new ShopPage(page);
    this.cart = new CartPage(page);
  }
}

setWorldConstructor(ShopWorld);
