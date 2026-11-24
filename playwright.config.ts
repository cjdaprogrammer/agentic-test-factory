import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.PORT ?? 4173);
const baseURL = process.env.BASE_URL?.trim() || `http://localhost:${port}`;

// Playwright Test is used here for visual regression only. BDD scenarios run through Cucumber.js.
export default defineConfig({
  testDir: './tests',
  // Platform-independent baseline names: generate baselines in Docker so CI and local runs match.
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'reports/playwright' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'npx ts-node demo-shop/server.ts',
        url: `${baseURL}/health`,
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
      },
});
