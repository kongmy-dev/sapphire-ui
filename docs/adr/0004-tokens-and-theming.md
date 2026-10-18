# ADR-0004: Tokens and theming

**Status:** accepted, 2026-10-18

## What an app writes

Follow the system's scheme, and force one where a section needs it:

```html
<html>
  <section data-theme="dark">
    <div class="sp-card">Stays dark inside a light page</div>
  </section>
</html>
```

`.dark` works the same as `data-theme="dark"`, so an app that already toggles
shadcn's class needs no change.

A Tailwind app gets utilities on the same tokens:

```css
@import "tailwindcss";
@import "@kongmy-dev/sapphire-ui/tailwind.css";
```

```html
<div class="bg-card text-card-foreground">…</div>
```

An app that changes a colour declares it the way Sapphire does:

```css
:root, [data-theme=light], [data-theme=dark], .dark {
  --primary: light-dark(#1d4ed8, #93c5fd);
}
```

## Context

Measured at `bc2e116`:

- Tokens are declared three times: `src/theme.css` (`@theme`), `src/index.css`
  (`:root`, 64 hex literals) and `design/colors_and_type.css`, which is stale.
- Dark mode is `[data-theme="dark"]` only, with no `prefers-color-scheme`.
  Aliases such as `--color-background: var(--color-surface)` resolve at
  `:root`, so they do not flip inside a nested dark scope.
- The names are not shadcn's: there is no `--background`, `--primary`,
  `--radius` or `--chart-1`, so a community item reading `var(--chart-1)` gets
  nothing.

Measured by spike 2 (`588f790`), in Chromium, Firefox and WebKit:

- `light-dark()` in custom properties on `:root` alone flips in source CSS, 42
  of 42.
- The default `bun build` (the same bytes as `--target=browser`) and Vite's
  default production target lower `light-dark()` into fixed values on `:root`.
  A nested opposite scope then keeps the page's scheme: 9 of 42 pass.
- The same tokens declared on `:root, [data-theme=light], [data-theme=dark],
  .dark` pass 42 of 42 in all eight build forms, lowered or not.
- `light-dark()` takes only colours. Radius, gap, weight and shadow arguments
  are invalid in all three engines.

## Decision

1. **One source: `css/tokens.css`,** in plain custom properties with shadcn's
   names, plus a brand extension for what shadcn lacks. `--accent` takes
   shadcn's meaning, the quiet interactive surface (the gold tint). Brand gold
   becomes `--brand`, with `--brand-text` for text that must pass AA on light.
2. **Colour tokens are `light-dark(<light>, <dark>)`, declared on
   `:root, [data-theme=light], [data-theme=dark], .dark`.** Each scope
   re-evaluates the value, so a consumer's build that lowers `light-dark()`
   cannot pin it at `:root`. Each token's light and dark values sit on one line.
3. **`color-scheme` picks the side.** `:root` is `light dark`, so the page
   follows the system; `[data-theme=light]` forces `light`;
   `[data-theme=dark]` and `.dark` force `dark`. Form controls and scrollbars
   follow the same switch.
4. **Every other token is declared once on `:root`** and does not change with
   the scheme: radius, spacing, type, shadow geometry. A shadow that differs in
   dark mode reads a colour token for its colour.
5. **`css/tailwind.css` maps every token with `@theme inline`,** so a utility
   reads `var(--card)` at the element, where the scope has already picked the
   side. The token gate (P-5) fails on a token without its mapping.
6. **Tests hold it.** A Playwright spec builds `tokens.css` with the default
   `bun build` and with Vite's default target, and proves a dark scope in a
   light page and the reverse flip, in all three engines. Another test proves
   every v3 token maps to a v4 token of the same value. `DESIGN.md`'s token
   values are checked against `tokens.css`.

## What we accept in exchange

- **An override must use the same selector list.** A value set on `:root`
  alone does not reach an element inside a nested `[data-theme]` scope, since
  Sapphire's declaration on that element wins over the inherited one. It does
  apply when the scope sits on `<html>`, where the two selectors weigh the
  same and the later rule wins. `tests/tokens.spec.ts` measures both through
  the source, `bun build`, Vite and Tailwind forms, in Chromium, Firefox and
  WebKit. `DESIGN.md` and the consumer skill show the selector list.
- **Four selectors on every colour block,** where one would do in a browser
  that never sees lowered CSS.
- **Pipelines other than `bun build` and Vite are unverified:** the Tailwind
  CLI, Astro and Next. The P2 spec covers the two the package and its apps use.
- **Utility renames for Tailwind apps,** such as `text-accent-text` →
  `text-brand-text`, carried by the migration map.

## Alternatives weighed

| Option | Weight | Why not |
|---|---|---|
| **`light-dark()` colours declared per scope (chosen)** | 55% | — |
| Plain variables in a light block and a dark block | 35% | Every dark value is written twice, in the `prefers-color-scheme` block and in the `[data-theme=dark], .dark` block, so a pair lives in two places and can drift. It has the same override caveat |
| `light-dark()` inside each component rule, tokens as light and dark pairs | 10% | Breaks the single-variable contract: `bg-card` and any item reading `var(--card)` get nothing usable |
| `light-dark()` on `:root` only | rejected | Measured: a consumer's default build pins the values and nested scopes stop flipping |

## Evidence

- Spike 2, `588f790`, `spikes/light-dark/result.txt` on `spike/css`. Stand-in
  tokens, not the real `tokens.css`.
