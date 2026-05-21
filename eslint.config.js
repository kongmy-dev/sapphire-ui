import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import betterTailwind from 'eslint-plugin-better-tailwindcss'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'dist-docs']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      betterTailwind.configs.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    settings: {
      'better-tailwindcss': {
        // Tailwind v4 reads config from the CSS entry file, not tailwind.config.js
        entryPoint: 'src/index.css',
      },
    },
    rules: {
      // Library code exports many subcomponents and variant helpers per file
      // by design (Tabs+TabsList+TabsTrigger, cva variants alongside the
      // component). The Vite HMR rule is meaningful for app code only.
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // The new "set-state-in-effect" lint is too aggressive for cases where
      // an effect IS the synchronization boundary (media query listeners,
      // localStorage reads, theme provider). Downgrade to warn.
      'react-hooks/set-state-in-effect': 'warn',
      // Line-wrapping reformats multi-class cn() calls across many lines —
      // too opinionated for a component library; ordering is handled by
      // enforce-consistent-class-order instead.
      'better-tailwindcss/enforce-consistent-line-wrapping': 'off',
      // This project mixes Tailwind utilities with hand-crafted design-system
      // CSS classes (docs-preview, cluster, icon-mark, etc.) defined in
      // App.css / index.css. Unknown-class errors would be all false positives.
      'better-tailwindcss/no-unknown-classes': 'off',
    },
  },
  {
    // Files entirely owned by the consumer's working tree — not part of the
    // library surface and not lint-policed.
    files: [
      'src/components/AnalyticsElement.ts',
      'src/components/ToastElement.ts',
      'src/components/Toast.tsx',
      'src/components/ui/Dialog.tsx',
      'src/components/ui/PageSection.tsx',
      'src/components/ui/SEOHead.tsx',
      'src/components/ui/SiteFooter.tsx',
      'src/components/ui/SiteHeader.tsx',
      'src/pages/InteractivePage.tsx',
      'src/pages/OverviewPage.tsx',
      'src/lib/consent.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-var': 'off',
      'prefer-rest-params': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])
