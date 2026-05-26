# Skill: Sapphire UI CSS

How to write CSS that fits the Sapphire design system. Read this before touching any stylesheet.

---

## Token System

All tokens are CSS custom properties. The **single source of truth** is:

| File | Purpose |
|---|---|
| `src/index.css` (`@theme {}` + `:root`) | Production tokens — Tailwind v4 integration + component styles |
| `design/colors_and_type.css` | Legacy reference — readable catalog for HTML/Astro consumers (not part of the build) |

**Never hard-code hex values.** Always reference tokens:

```css
/* correct */
color: var(--color-text-main);
background: var(--color-primary);

/* wrong */
color: #1e293b;
background: #0a192f;
```

---

## Tailwind v4 Integration

Sapphire uses Tailwind v4's `@theme {}` block (not `tailwind.config.js`). Tokens declared there are available as **both CSS vars and Tailwind class suffixes**:

```html
<!-- Tailwind utility suffix (preferred for React components) -->
<div class="bg-primary text-surface font-serif">

<!-- CSS var (preferred for stylesheet rules and custom components) -->
<div style="background: var(--color-primary)">
```

The `@theme` block is in `src/index.css`. Only the tokens listed there are Tailwind-available; the full token set is in `design/colors_and_type.css`.

When writing Tailwind inside component class strings, use **bracket notation** for tokens not in `@theme`:

```tsx
// token is in @theme → short form works
className="text-primary"

// token not in @theme → bracket notation
className="text-[var(--color-text-muted)]"
className="border-[var(--color-border-dark)]"
```

---

## Color Tokens

```
Brand fills (backgrounds, borders, UI surfaces)
  --color-primary        #0a192f   dark navy — buttons, headers, dark cards
  --color-accent         #c5a065   gold — backgrounds, decorative fills, borders
  --color-accent-dark    #b8904f   gold hover state

Text
  --color-text-main      #1e293b   primary body copy
  --color-text-muted     #475569   captions, meta (AA-safe on #f4f6f8)
  --color-text-on-dark   #f1f5f9   body on navy backgrounds
  --color-text-on-dark-muted  rgba(241,245,249,0.65)
  --color-accent-text    #8a5a1f   gold text on light surface (AA-safe, 4.6:1)

Surfaces
  --color-surface        #f4f6f8   page background
  --color-white          #ffffff   card / modal backgrounds
  --color-card-bg        #ffffff
  --color-card-dark-bg   #0a192f

Borders
  --color-border         #e2e8f0   hairline on light surfaces
  --color-border-dark    rgba(255,255,255,0.12)  on navy surfaces

States
  --color-hover-overlay  rgba(197,160,101,0.08)  ghost button hover
  --color-focus-ring     #c5a065   focus ring color
```

**Contrast rule:** `--color-accent` (`#c5a065`) FAILS contrast as *text* on `--color-surface`. Always use `--color-accent-text` (`#8a5a1f`) for readable gold text on light backgrounds.

---

## Typography Tokens

```
Families
  --font-serif    'Newsreader', Georgia, serif      → headings h1–h6
  --font-sans     'Source Sans 3', system-ui, ...   → body, UI labels
  --font-mono     'JetBrains Mono', ...             → code only

Scale (fluid via clamp for display sizes)
  --text-display-xl   clamp(2.5rem, 6vw, 4.5rem)   hero h1
  --text-display      clamp(2rem, 4vw, 3.25rem)     section h2
  --text-heading      clamp(1.5rem, 3vw, 2rem)      h3
  --text-subheading   1.25rem                        h4
  --text-lg           1.125rem
  --text-base         1rem
  --text-sm           0.875rem
  --text-xs           0.75rem

Line heights
  --leading-tight     1.2     headings
  --leading-snug      1.375
  --leading-normal    1.6     body
  --leading-relaxed   1.75
```

---

## Spacing, Radius, Shadow, Transitions

```
Spacing (4px base)
  --space-1 … --space-32  (4px to 128px)

Radius
  --radius-sm    4px
  --radius-btn   6px   buttons
  --radius-md    8px   cards
  --radius-pill  9999px  tags, badges

Shadow (express elevation via bg contrast, not heavy shadows)
  --shadow-sm / --shadow-md / --shadow-lg
  --shadow-card-hover   0 8px 24px rgba(10,25,47,0.12)

Transitions
  --transition-fast   150ms ease
  --transition-base   200ms ease
  --transition-slow   350ms ease
```

---

## Utility Classes (from `design/colors_and_type.css`)

These pre-built classes are available for HTML / non-React consumers:

```css
.btn              base button styles
.btn-primary      navy fill
.btn-outline      navy border
.btn-ghost        gold border

.tag              pill label (caps, xs, muted)
.tag-accent       gold tint variant
.tag-dark         on-dark variant

.card             white, 8px radius, 1px border
.card-dark        navy fill card

.material-symbols-outlined   Material icon base
```

In React components, prefer Tailwind utilities over these classes.

---

## Dark Mode

Dark mode is toggled via `data-theme="dark"` on `<html>`. The theme helpers are in `src/lib/theme.ts`.

Key dark-mode swaps defined in `src/index.css`:
- `--color-surface` → `#0a192f`
- `--color-text-main` → `#f1f5f9`
- `--color-text-strong` → `#f1f5f9`
- `--color-text-muted` → `rgba(241,245,249,0.72)`
- `--color-border` → `rgba(255,255,255,0.12)`
- `--color-card-bg` → `#112240`
- `--color-accent-text` → `#c5a065` (gold passes AA on dark backgrounds naturally)

Note: `--color-white` is **not** redefined in dark mode — it stays `#ffffff`.

When adding new tokens, always define a dark-mode override in the `[data-theme="dark"]` block.

---

## Writing New Styles

1. Check if a token covers it. If yes, use the token.
2. If no token covers it, check if it should become one (brand-aligned value) or stay inline.
3. Use `var(--space-N)` for all spacing, never magic numbers.
4. Use `--transition-base` for interactive state changes.
5. Always add `@media (prefers-reduced-motion: reduce)` guards for animations.
6. Never introduce `!important` except inside the reduced-motion guard.
