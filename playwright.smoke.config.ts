import { defineConfig, devices } from '@playwright/test';

/**
 * Smoke-test Playwright config.
 * Excludes the heavy visual-regression specs so a full PR run finishes quickly.
 * Visual regression should be run separately or in CI sharding.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list']],
  grepInvert: /visual regression|component visual regression/i,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3002',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
});
