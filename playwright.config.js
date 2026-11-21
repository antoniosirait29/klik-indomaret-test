// @ts-check
import { defineConfig, devices } from '@playwright/test';

const bravePath =
  process.env.BRAVE_PATH ||
  'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],

  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },

  use: {
    baseURL: 'https://www.klikindomaret.com',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // Uses the locally installed Brave executable for compatibility testing.
      // Set BRAVE_PATH if Brave is installed in a different location.
      name: 'brave',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          executablePath: bravePath,
        },
      },
    },
  ],
});
