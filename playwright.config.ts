import { defineConfig, devices } from '@playwright/test';

// A11y smoke harness for the docs SPA.
// Spawns `vite build --config vite.docs.config.ts` in preview mode and runs
// axe-core against every demo route.
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  webServer: {
    // Use preview (built docs) rather than dev to catch production-only issues.
    command: 'bun run build:docs && vite preview --config vite.docs.config.ts --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
