import { defineConfig, devices } from '@playwright/test';
import { EXAMPLE_URL } from './tooling/examples/catalog';
import { SPECIMEN_URL } from './tooling/visual/specimens';

export default defineConfig({
  testDir: './tests',
  testIgnore: '**/visual/**',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    [process.env.CI ? 'github' : 'list'],
    ['json', { outputFile: 'test-results/a11y.json' }],
  ],
  use: {
    baseURL: 'http://localhost:4178',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command:
        'bun tooling/site/build.ts && bun tooling/site/serve.ts dist-site 4178',
      url: 'http://localhost:4178',
      reuseExistingServer: false,
      timeout: 60000,
    },
    {
      command: 'bun tooling/examples/server.ts',
      url: EXAMPLE_URL,
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: 'bun tooling/visual/specimen-server.ts',
      url: SPECIMEN_URL,
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
