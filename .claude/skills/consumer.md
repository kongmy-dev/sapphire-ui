# Skill: Consuming Sapphire UI

How to integrate `@kongmy-dev/sapphire-ui` into downstream projects (Astro, Next.js, vanilla HTML). Read this when working on any project that *uses* Sapphire UI — not the library itself.

---

## Installation

```bash
bun add @kongmy-dev/sapphire-ui
```

All Radix UI packages are peer dependencies. Install the ones you need:

```bash
bun add @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-accordion @radix-ui/react-checkbox @radix-ui/react-switch @radix-ui/react-slider @radix-ui/react-radio-group @radix-ui/react-progress @radix-ui/react-scroll-area @radix-ui/react-separator @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-avatar @radix-ui/react-hover-card
```

---

## Font Setup

Sapphire UI expects four font families. Add these `<link>` tags to your HTML `<head>`:

```html
<!-- Typography -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Source+Sans+3:ital,wght@0,200..900;1,200..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet" />

<!-- Icons -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
```

Or use CSS `@import` in your stylesheet — `sapphire-ui/style.css` includes the typography import but **not** the icon font.

---

## CSS Import

Import the compiled stylesheet in your app entry:

```tsx
// React / Next.js — in _app.tsx or layout.tsx
import '@kongmy-dev/sapphire-ui/style.css';
```

```astro
<!-- Astro — in a layout component -->
<link rel="stylesheet" href="@kongmy-dev/sapphire-ui/style.css" />
```

---

## React Component Usage

**Barrel import** (simpler, larger bundle):
```tsx
import { Button, Card, Badge } from '@kongmy-dev/sapphire-ui';
```

**Per-subpath import** (tree-shakeable, recommended):
```tsx
import { Button } from '@kongmy-dev/sapphire-ui/button';
import { Card, CardHeader, CardBody } from '@kongmy-dev/sapphire-ui/card';
import { Badge } from '@kongmy-dev/sapphire-ui/badge';
```

---

## Dark Mode

Toggle dark mode by setting `data-theme="dark"` on `<html>`.

**SSR-safe init** (prevents flash of wrong theme):
```tsx
import { initTheme } from '@kongmy-dev/sapphire-ui/theme';

// In a <script> tag in <head>, or in your entry file before React renders:
initTheme(); // reads localStorage preference, falls back to system
```

**React components:**
```tsx
import { ThemeProvider, ThemeToggle } from '@kongmy-dev/sapphire-ui';

function App() {
  return (
    <ThemeProvider>
      <ThemeToggle />
      {/* app content */}
    </ThemeProvider>
  );
}
```

---

## Web Components (Custom Elements)

For non-React consumers (Astro, Hugo, vanilla HTML):

```ts
import '@kongmy-dev/sapphire-ui/elements';
import '@kongmy-dev/sapphire-ui/style.css';
```

Available elements:
- `<sapphire-toast>` — toast notifications
- `<cookie-banner>` — GDPR cookie consent
- `<sapphire-analytics>` — analytics wrapper
- `<sapphire-banner>` — dismissible alert banner
- `<sapphire-site-header>` — full site header
- `<sapphire-site-footer>` — full site footer

---

## Framework-Agnostic CSS Utilities

For HTML-only consumers, the stylesheet includes ready-made CSS classes:

```
Buttons:    .btn .btn-primary .btn-outline .btn-ghost
Cards:      .card .card-dark
Tags:       .tag .tag-accent .tag-dark
Typography: .t-display .t-heading .t-subheading .t-body .t-body-sm .t-eyebrow .t-mono
Forms:      .form-group .label .input .input--dark .input--mono .help-text
Alerts:     .alert .alert--info .alert--success .alert--warning .alert--error .alert--accent
Layout:     .layout-root .sidebar .main-content .page .masthead
Content:    .prose .prose-sm .prose-lg
Spacing:    .stack .stack-sm .stack-lg .stack-xl
Flex:       .cluster
Loading:    .skeleton .spinner .spinner--sm .spinner--lg
Table:      .sapphire-table
Data:       .empty-state
A11y:       .visually-hidden .sr-only .visually-hidden-focusable
```

Container queries: add `.cq` to an ancestor, then use `.cq-sm\:flex`, `.cq-md\:cols-2`, etc.

---

## Consent and Analytics

```html
<cookie-banner
  policy-url="/privacy"
  analytics-label="GA4"
></cookie-banner>

<sapphire-analytics
  gtm-id="GTM-XXXXX"
></sapphire-analytics>
```

The consent library auto-gates analytics loading behind user consent.

---

## Theming / Color Customization

Override CSS custom properties to rebrand:

```css
:root {
  /* Change primary from navy to your brand color */
  --color-primary: #1a1a2e;
  --color-primary-hover: #2a2a4e;

  /* Change accent from gold to your accent */
  --color-accent: #e94560;
  --color-accent-dark: #c73e55;
  --color-accent-text: #b52d44;  /* must pass AA on --color-surface */

  /* Update focus ring to match */
  --color-focus-ring: #e94560;
}
```

All components reference these tokens, so a single `:root` override rebrands the entire library.
