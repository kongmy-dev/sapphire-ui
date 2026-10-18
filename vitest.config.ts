import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'tooling/**/*.{test,spec}.{ts,tsx}',
      'scripts/**/*.{test,spec}.{ts,tsx}',
    ],
    coverage: {
      provider: 'v8',
      all: true,
      include: [
        'src/components/ui/**/*.tsx',
        'src/lib/**/*.ts',
        'src/hooks/**/*.ts',
      ],
    },
  },
});
