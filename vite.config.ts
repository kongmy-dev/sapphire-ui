import fs from 'node:fs';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import dts from 'vite-plugin-dts';

const externalizedFromBundle = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'js-cookie',
  'clsx',
  'tailwind-merge',
  'class-variance-authority',
  'react-resizable-panels',
  /^@radix-ui\//,
];

function copyRawThemeCss(): Plugin {
  return {
    name: 'sapphire-copy-raw-theme-css',
    apply: 'build',
    closeBundle() {
      const from = path.resolve(__dirname, 'src/theme.css');
      const to = path.resolve(__dirname, 'dist/theme.css');
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(from, to);
    },
  };
}

export default defineConfig({
  publicDir: false,
  plugins: [
    react(),
    tailwindcss(),
    dts({
      insertTypesEntry: true,
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      entryRoot: 'src',
      exclude: ['src/App.tsx', 'src/main.tsx', 'src/pages/**', 'src/App.css'],
      tsconfigPath: './tsconfig.app.json',
    }),
    copyRawThemeCss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        elements: path.resolve(__dirname, 'src/elements.ts'),
      },
      name: 'SapphireUI',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: externalizedFromBundle,
      output: {
        preserveModules: true,
        preserveModulesRoot: path.resolve(__dirname, 'src'),
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});
