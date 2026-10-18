import { defineConfig, devices } from '@playwright/test';
import { SPECIMEN_URL } from './tooling/visual/specimens';

const buildThenPreviewDocs =
  'bun run build:docs && vite preview --config vite.docs.config.ts --port 4173';

export default defineConfig({
  testDir: './tests',
  testIgnore: '**/visual/**',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: buildThenPreviewDocs,
      url: 'http://localhost:4173',
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
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
