import { After, AfterAll, Before, BeforeAll, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, type Browser } from '@playwright/test';
import * as fs from 'fs';
import type { Server } from 'http';
import { start } from '../../demo-shop/server';
import { config } from '../../config';
import { slugify } from '../../utils/slug';
import type { ShopWorld } from './world';

setDefaultTimeout(30_000);

let browser: Browser;
let server: Server | undefined;

BeforeAll(async () => {
  // Use the bundled demo shop unless BASE_URL points at a real environment.
  if (!config.usesExternalServer) server = await start(config.port);
  browser = await chromium.launch({ headless: config.headless });
  for (const dir of ['reports/traces', 'reports/videos', 'reports/dom']) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

AfterAll(async () => {
  await browser?.close();
  if (server) await new Promise<void>((resolve) => server!.close(() => resolve()));
});

Before(async function (this: ShopWorld) {
  const context = await browser.newContext({
    baseURL: config.baseUrl,
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: 'reports/videos' },
  });
  await context.tracing.start({ screenshots: true, snapshots: true });
  this.init(context, await context.newPage());
});

After(async function (this: ShopWorld, { result, pickle }) {
  const failed = result?.status === Status.FAILED;
  const slug = slugify(pickle.name);
  const video = this.page.video();

  if (failed) {
    this.attach(await this.page.screenshot({ fullPage: true }), 'image/png');
    // DOM snapshot feeds the AI locator-fix suggestions (ai/suggest-locator-fix.ts).
    fs.writeFileSync(`reports/dom/${slug}.html`, await this.page.content());
    await this.context.tracing.stop({ path: `reports/traces/${slug}.zip` });
  } else {
    await this.context.tracing.stop();
  }

  await this.context.close();
  if (!failed && video) await video.delete(); // keep videos for failures only
});
