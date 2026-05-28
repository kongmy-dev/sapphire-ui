import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

/**
 * Vite config for the documentation site (design.kongmy.dev).
 * Separate from the library build config.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist-docs',
    emptyOutDir: true,
    rollupOptions: {
      treeshake: { moduleSideEffects: true },
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return;
          if (id.includes('react-dom') || id.includes('scheduler')) return 'react';
          if (id.includes('react-router')) return 'router';
          if (id.includes('@radix-ui')) return 'radix';
          return 'vendor';
        },
      },
    },
  },
});
