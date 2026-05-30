import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import Sitemap from 'vite-plugin-sitemap';

/**
 * Vite config for the documentation site (design.kongmy.dev).
 * Separate from the library build config.
 */
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    Sitemap({
      hostname: 'https://sapphire.kongmy.dev',
      dynamicRoutes: [
        '/',
        '/colors',
        '/typography',
        '/buttons',
        '/cards',
        '/forms',
        '/feedback',
        '/data',
        '/interactive',
        '/extended',
        '/layouts',
        '/elements',
        '/hooks',
      ],
      outDir: 'dist-docs',
      generateRobotsTxt: false,
    }),
  ],
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
