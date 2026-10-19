---
name: sapphire-css
description: How to write CSS that fits the Sapphire design system. Covers the v4 token system (css/tokens.css), Tailwind mapping, color tokens, contrast rules, and formatting. Read before modifying any stylesheet or CSS utility.
---

# Skill: Sapphire UI CSS

How to write CSS that fits the Sapphire design system. Read this before touching any stylesheet or token configuration.

## Token System

v4 tokens are CSS custom properties with shadcn's names plus a brand extension. The **single source of truth** is `css/tokens.css` (ADR-0004); `DESIGN.md` lists every token and the token gate (P-5) fails when its tables disagree.

- A colour is `light-dark(<light>, <dark>)`, declared once, only in the block `:root, [data-theme=light], [data-theme=dark], .dark`. An alias (`--card-foreground: var(--foreground)`) goes in the same block, since an alias on `:root` alone would not flip inside a nested scope.
- `light-dark()` takes only colours. Every other token (fonts, sizes, spacing, radius, shadow, transition) is declared once on `:root`; a shadow reads its colour from `--primary`.
- `color-scheme` is `light dark` on `:root`, `light` on `[data-theme=light]` and `dark` on `[data-theme=dark], .dark`.
- `css/tailwind.css` maps every token for Tailwind (`@theme inline` for colours and spacing, `@theme reference` for same-name pass-throughs). A new token needs a mapping there and a row in `DESIGN.md`.
- `tooling/migrate/map.ts` maps each v3 name to its v4 name. `src/theme.css` is the v3 file, frozen until P9.

**Never hard-code hex values.** Always reference tokens:
```css
/* correct */
color: var(--foreground);
background: var(--primary);

/* wrong */
color: #1e293b;
background: #0a192f;
```

An app overrides a colour on the full selector list, never on `:root` alone:
```css
:root, [data-theme="light"], [data-theme="dark"], .dark {
  --primary: light-dark(#1d4ed8, #93c5fd);
}
```

## Tailwind v4 Integration

Utilities read the tokens: `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `text-brand-text`, `font-serif`, `rounded-btn`.
```html
<div class="bg-primary text-primary-foreground font-serif">
```

## Color Tokens & Contrast

- Brand: `--primary` (`#0a192f`), `--brand` (`#c5a065`), `--brand-hover` (`#b8904f`), `--brand-text` (`#8a5a1f`, gold text on a light surface), `--brand-on-fill`.
- Text: `--foreground`, `--foreground-strong`, `--muted-foreground`, `--on-dark`, `--on-dark-muted`.
- Surfaces: `--background`, `--card`, `--card-dark`, `--popover`; `--accent` is the quiet gold-tint surface for hover and selected rows.
- Borders and focus: `--border`, `--border-strong`, `--input`, `--ring`.

**Contrast Rule:** `--brand` (`#c5a065`) fails WCAG AA as text on light surfaces. Use `--brand-text` (`#8a5a1f`, 4.6:1) for gold text there.

## Typography Tokens

- Families: `--font-serif` ('Newsreader', Georgia, serif) for headings; `--font-sans` ('Source Sans 3', system-ui) for body/UI; `--font-mono` ('JetBrains Mono') for code.
- Fluid display sizes: `--text-display-xl` (`clamp(2.5rem, 6vw, 4.5rem)`), `--text-display-lg` (`clamp(2rem, 4vw, 3rem)`).

## Lengths in components

The token gate bans length literals outside `css/tokens.css`, except the font-relative `em` and `ch`. In `components/<name>/<name>.css`:

- A value on a token's scale uses the token: `var(--space-4)`, `var(--text-sm)`, `var(--radius-btn)`.
- An off-scale geometry value is `calc(var(--space-1) * N)` (9 px is `calc(var(--space-1) * 2.25)`); an off-scale type size is `calc(var(--text-base) * N)` (13 px is `calc(var(--text-base) * 0.8125)`).
- A length that follows the element's own font size is an `em` literal (`letter-spacing: 0.04em`, a prose flow of `1.25em`); a line measure is a `ch` literal (`max-width: 70ch`). Declared in a `--sp-<name>-*` variable, the unit resolves where the variable is used.
- A value several components share becomes a token in `css/tokens.css`, with its `css/tailwind.css` mapping and `DESIGN.md` row.
- A component's own knobs are `--sp-<name>-*` variables declared on its `.sp-<name>` rule; variants and sizes override them through `data-variant` and `data-size`, and the customisation ladder (ADR-0003) sets them from outside.

## Linting and Formatting

Formatting and CSS linting are handled by Biome:
```bash
bun run lint
bun run lint:fix
```
Never use manual overrides for class sorting; Biome automatically orders utility classes.
