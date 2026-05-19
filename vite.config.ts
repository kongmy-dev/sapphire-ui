import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import dts from 'vite-plugin-dts';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      insertTypesEntry: true,
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      tsconfigPath: './tsconfig.app.json',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      // Multi-entry: full React bundle + framework-agnostic Web Components entry.
      // Consumers can `import from '@kongmy-dev/sapphire-ui'` (React-aware)
      // or `import '@kongmy-dev/sapphire-ui/elements'` (vanilla, no React).
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        elements: path.resolve(__dirname, 'src/elements.ts'),
      },
      name: 'SapphireUI',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) =>
        `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      // Externalize deps that shouldn't be bundled into the library.
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'js-cookie',
        /^@radix-ui\//,
      ],
      output: {
        // Preserve module structure so tree-shaking and side-effect hints
        // (customElements.define) survive in consumer bundles.
        preserveModules: false,
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});
