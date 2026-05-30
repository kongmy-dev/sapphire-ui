import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import dts from 'vite-plugin-dts';
import fs from 'node:fs';
import path from 'path';

/**
 * Ship `src/theme.css` to `dist/theme.css` verbatim — NOT through the Tailwind
 * build. It carries a raw `@theme {}` block that the *consumer's* Tailwind must
 * process; compiling it here would flatten `@theme` into `:root` vars and strip
 * the at-rule, defeating the purpose. A plain copy preserves the token contract.
 */
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

// https://vite.dev/config/
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
      // Multi-entry: full React bundle + framework-agnostic Web Components entry.
      // Consumers can `import from '@kongmy-dev/sapphire-ui'` (React-aware)
      // or `import '@kongmy-dev/sapphire-ui/elements'` (vanilla, no React).
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        elements: path.resolve(__dirname, 'src/elements.ts'),
      },
      name: 'SapphireUI',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      // Externalize deps that shouldn't be bundled into the library.
      // Runtime deps are declared in package.json `dependencies` and
      // resolved by the consumer's bundler — including them here would
      // duplicate code across consumers' bundles.
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'js-cookie',
        'clsx',
        'tailwind-merge',
        'class-variance-authority',
        /^@radix-ui\//,
      ],
      output: {
        // Mirror the src tree into dist so each component / hook / util
        // ships as its own file. Enables true per-component tree-shaking
        // and powers the per-subpath exports declared in package.json
        // (e.g. `@kongmy-dev/sapphire-ui/button`).
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
