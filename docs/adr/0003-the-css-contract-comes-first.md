# ADR-0003: The CSS contract comes first; React renders it

**Status:** accepted, 2026-10-18

## What an app writes

A server-rendered page, an Astro site or plain HTML:

```html
<link rel="stylesheet" href="/node_modules/@kongmy-dev/sapphire-ui/dist/sapphire.css">

<button class="sp-button" data-variant="secondary" data-size="sm">Save</button>
```

A React app gets the same element from the component:

```tsx
<Button variant="secondary" size="sm">Save</Button>
```

and changes it the way it would change any element:

```tsx
<Button className="px-8">Save</Button>
```

```css
.checkout .sp-button { --sp-button-radius: 0; }
```

## Context

Measured at `bc2e116`:

- The stylesheet's classes and the React components are two implementations
  of one design, and they disagree: `.btn` pads 12 × 24 px at 16 px; `<Button>`
  pads 9 × 16 px at 14 px.
- `sapphire-ui.css` is 135.4 KB, 23.6 KB gzipped. 73.0 KB of it is the
  utilities layer, generated almost entirely for the React components.
- 307 rules (28.7 KB) sit outside every cascade layer, so they beat any utility
  a consumer applies.

## Decision

**The CSS is the design system.** `sapphire.css` holds every component as
`sp-*` classes in `@layer base` and `@layer components`. React components and
custom elements are its clients: they render those classes and add behaviour.

- **Class names name things** (`sp-card`, `sp-card-title`). **Data attributes
  describe them** (`data-variant`, `data-size`, and Radix's `data-state`).
- **React renders the contract and nothing else.** No CVA, no `clsx`, no
  `tailwind-merge`, no utility strings: a variant is an `as const` tuple
  rendered as a `data-*` attribute, beside the `sp-*` class and the caller's
  `className`.
- **The stylesheet declares Tailwind's layer order on its first line:**
  `@layer theme, base, components, utilities;`. Spike 1 (`6868ef2`) measured
  48 of 48 passes with it, across four import orders, dev and build, Chromium,
  Firefox and WebKit, and the line survives `bun build --minify`. Without it,
  importing `sapphire.css` before Tailwind lets Tailwind's preflight beat
  `sp-*` in every engine. A test holds the line in place.
- **The customisation ladder,** cheapest first: brand tokens → component
  variables (`--sp-button-radius`) → `data-*` variants → utility classes, which
  win by layer order → the app's own CSS, since unlayered beats layered → the
  vendored copy.
- **Where the two implementations disagree, the React look wins:** more apps see
  it.
- **The contract gate (P-4) holds React and CSS together.** Every variant value
  has its selector, every selector its value, and every class a component or
  element renders exists.
- **The stylesheet has a budget (P-13):** gzipped `sapphire.css` at most its
  measured size plus 15%.

## What we accept in exchange

- **Every class is renamed** (`.btn.btn-primary` → `.sp-button`). Apps on 3.x
  stay pinned and migrate with the map in `CHANGELOG.md`, applied by
  `bun run migrate`. No aliases for v3 names.
- **Components stop composing utility strings.** A layout tweak inside a
  component is a CSS edit in `components/<name>/<name>.css`, not a class string
  in the TSX.
- **The layer line must stay first.** A consumer who strips it, or a build that
  drops it before Tailwind sees it, loses to preflight. Spike 1 measured that
  Vite's Lightning CSS pass consumes the statement and bakes the order into
  block order, which keeps the cascade; other pipelines (Tailwind CLI, Astro,
  Next) are unverified.
- **A contract gate to build and keep green,** before any component ports.

## Alternatives weighed

| Option | Weight | Why not |
|---|---|---|
| **CSS contract first, React renders it (chosen)** | 55% | — |
| React first, CSS generated from it with `@apply` | 30% | HTML and server-rendered pages would get a byproduct of the React build, and every class would carry the utilities layer's weight |
| Keep both implementations, with parity tests | 15% | Two sources of one design, and the tests chase drift instead of preventing it |

## Evidence

- Spike 1, `6868ef2`, `spikes/css-layers/result.txt` on `spike/css`. Measured
  on stand-in CSS, not the real stylesheet.
