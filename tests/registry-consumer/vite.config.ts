import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Stand-in for a real shadcn consumer: `@/` → this fixture's app/ dir, Tailwind
// v4 + React. verify-consumer.ts materializes the registry into app/ then builds.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./app', import.meta.url)),
    },
  },
  build: { outDir: 'dist', emptyOutDir: true },
});
