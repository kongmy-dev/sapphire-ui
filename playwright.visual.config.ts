import { defineConfig, devices } from '@playwright/test';
import { SPECIMEN_URL } from './tooling/visual/specimens';

const PIN_CONTAINER_VARIABLE = 'SAPPHIRE_PIN_CONTAINER';
const PORT = 4174;
const BASE_URL = `http://localhost:${PORT}`;

if (process.env[PIN_CONTAINER_VARIABLE] !== '1') {
  throw new Error(
    'Visual pins are compared and updated only in the pin container: run bun run test:visual or bun run pin.',
  );
}

const buildThenPreviewDocs = [
  'bunx vite build --config vite.docs.config.ts --outDir dist-docs',
  `bunx vite preview --config vite.docs.config.ts --outDir dist-docs --port ${PORT} --strictPort`,
].join(' && ');

export default defineConfig({
  testDir: './tests/visual',
  testMatch: '*.spec.ts',
  snapshotPathTemplate: '{testDir}/pins/{arg}{ext}',
  updateSnapshots: 'none',
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  workers: 2,
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/visual-report.json' }],
  ],
  expect: {
    toHaveScreenshot: {
      threshold: 0,
      maxDiffPixels: 0,
      animations: 'disabled',
      caret: 'hide',
    },
  },
  use: {
    baseURL: BASE_URL,
    ...devices['Desktop Chrome'],
    deviceScaleFactor: 1,
  },
  webServer: [
    {
      command: buildThenPreviewDocs,
      url: BASE_URL,
      reuseExistingServer: false,
      timeout: 240_000,
    },
    {
      command: 'bun tooling/visual/specimen-server.ts',
      url: SPECIMEN_URL,
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
  projects: [
    { name: 'light', use: { colorScheme: 'light' } },
    { name: 'dark', use: { colorScheme: 'dark' } },
  ],
});
