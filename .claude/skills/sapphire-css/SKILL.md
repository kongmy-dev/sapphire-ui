---
name: sapphire-css
description: How to write CSS that fits the Sapphire design system. Covers the design token system, Tailwind v4 @theme integration, color tokens, contrast rules, and formatting. Read before modifying any stylesheet or CSS utility.
---

# Skill: Sapphire UI CSS

How to write CSS that fits the Sapphire design system. Read this before touching any stylesheet or token configuration.

## Token System

All tokens are CSS custom properties. The **single source of truth** is:
- `src/theme.css`: Canonical tokens (`@theme {}` + `:root`) exported directly and imported by `src/index.css`.
- `design/colors_and_type.css`: Legacy reference catalog.

**Never hard-code hex values.** Always reference tokens:
```css
/* correct */
color: var(--color-text-main);
background: var(--color-primary);

/* wrong */
color: #1e293b;
background: #0a192f;
```

## Tailwind v4 Integration

Sapphire uses Tailwind v4's `@theme {}` block in `src/theme.css`. Tokens declared there are available as both CSS variables and Tailwind class suffixes:
```html
<div class="bg-primary text-surface font-serif">
<div style="background: var(--color-primary)">
```

When writing Tailwind inside component class strings, use bracket notation for tokens not directly mapped:
```tsx
className="text-[var(--color-text-muted)] border-[var(--color-border-dark)]"
```

## Color Tokens & Contrast

- Brand fills: `--color-primary` (`#0a192f`), `--color-accent` (`#c5a065`), `--color-accent-dark` (`#b8904f`).
- Text: `--color-text-main` (`#1e293b`), `--color-text-muted` (`#475569`), `--color-text-on-dark` (`#f1f5f9`), `--color-accent-text` (`#8a5a1f`).
- Surfaces: `--color-surface` (`#f4f6f8`), `--color-card-bg` (`#ffffff`), `--color-card-dark-bg` (`#0a192f`).
- Borders: `--color-border` (`#e2e8f0`), `--color-border-dark` (`rgba(255,255,255,0.12)`).

**Contrast Rule:** `--color-accent` (`#c5a065`) fails WCAG AA contrast as text on light surfaces. Always use `--color-accent-text` (`#8a5a1f`, 4.6:1 contrast ratio) for gold text on light surfaces.

## Typography Tokens

- Families: `--font-serif` ('Newsreader', Georgia, serif) for headings; `--font-sans` ('Source Sans 3', system-ui) for body/UI; `--font-mono` ('JetBrains Mono') for code.
- Fluid display sizes: `--text-display-xl` (`clamp(2.5rem, 6vw, 4.5rem)`), `--text-display-lg` (`clamp(2rem, 4vw, 3rem)`).

## Linting and Formatting

Formatting and CSS linting are handled by Biome:
```bash
bun run lint
bun run lint:fix
```
Never use manual overrides for class sorting; Biome automatically orders utility classes.
