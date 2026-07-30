import { defineConfig, devices } from '@playwright/test';

const shardTotal = process.env.SHARD_TOTAL ? parseInt(process.env.SHARD_TOTAL, 10) : undefined;
const shardIndex = process.env.SHARD_INDEX ? parseInt(process.env.SHARD_INDEX, 10) : undefined;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list']],
  // CI sharding support: run with SHARD_TOTAL=4 SHARD_INDEX=0..3
  shard: shardTotal && shardIndex ? { total: shardTotal, current: shardIndex } : undefined,
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
