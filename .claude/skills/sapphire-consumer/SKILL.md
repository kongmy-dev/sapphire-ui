---
name: sapphire-consumer
description: How to integrate and consume @kongmy-dev/sapphire-ui in downstream applications (Astro, Next.js, React, HTML). Covers installation, font setup, theme initialization, subpath imports, and custom elements.
---

# Skill: Consuming Sapphire UI

How to integrate `@kongmy-dev/sapphire-ui` into downstream projects (Astro, Next.js, vanilla HTML). Read this when working on any project that *uses* Sapphire UI — not the library itself.

## Installation

```bash
bun add @kongmy-dev/sapphire-ui
```

All Radix UI packages are peer dependencies. Install the primitives you need:
```bash
bun add @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-accordion @radix-ui/react-checkbox @radix-ui/react-switch @radix-ui/react-slider @radix-ui/react-radio-group @radix-ui/react-progress @radix-ui/react-scroll-area @radix-ui/react-separator @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-avatar @radix-ui/react-hover-card
```

Note: If consuming `@kongmy-dev/sapphire-ui/stylelint`, ensure `stylelint` and `stylelint-config-standard` are installed in your project devDependencies.

## Font Setup

Sapphire UI expects four font families:
```html
<!-- Typography -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Source+Sans+3:ital,wght@0,200..900;1,200..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet" />

<!-- Icons -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
```

## CSS and Theme Imports

In your app stylesheet or entry:
```tsx
import '@kongmy-dev/sapphire-ui/style.css';
```

For Tailwind v4 downstream projects wanting Sapphire tokens:
```css
@import '@kongmy-dev/sapphire-ui/theme.css';
```

## React Component Usage

Per-subpath import (tree-shakeable, recommended):
```tsx
import { Button } from '@kongmy-dev/sapphire-ui/button';
import { Card, CardHeader, CardBody } from '@kongmy-dev/sapphire-ui/card';
import { Badge } from '@kongmy-dev/sapphire-ui/badge';
```

## Dark Mode

Toggle dark mode by setting `data-theme="dark"` on `<html>`.

SSR-safe initialization (prevent flash):
```tsx
import { initTheme } from '@kongmy-dev/sapphire-ui/theme';

initTheme(); // reads localStorage, falls back to system preference
```

## Web Components (Custom Elements)

For non-React consumers (Astro, vanilla HTML):
```ts
import '@kongmy-dev/sapphire-ui/elements';
import '@kongmy-dev/sapphire-ui/style.css';
```
Available tags: `<sapphire-toast>`, `<cookie-banner>`, `<sapphire-analytics>`, `<sapphire-banner>`, `<sapphire-site-header>`, `<sapphire-site-footer>`.
