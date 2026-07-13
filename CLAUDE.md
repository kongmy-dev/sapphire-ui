# CLAUDE.md — Sapphire UI

Sapphire UI is the official design system for **KONGMY Digital Solutions** (`kongmy.dev`). It exports both a compiled stylesheet (`sapphire-ui.css`) and a typed React component library. All work here must honour the navy + gold editorial aesthetic.

## Two-lane model (v3 — decided 2026-07-13)

| Lane | Distribution | Audience |
|---|---|---|
| **Editorial/brand** | npm package (unchanged) | kongmy.dev properties, blog, proposals |
| **Product** | shadcn-format **registry** (vendored source, hosted on design.kongmy.dev) | product/client apps scaffolded from `~/Projects/kongmy-stack` |

Why: product apps must diverge (client theming, POS touch UIs) — vendored source makes divergence an edit, not a fork; a public registry also kills GitHub-Packages PAT friction. Only the **product subset** (~15 components + admin blocks imported from `~/Projects/references/shadcn-admin`, restyled onto tokens) gets registry-shaped; editorial components stay npm-only. Existing npm consumers are never broken.

**Plan + task list: `REGISTRY-PLAN.md`.** Hard boundary: sapphire stays backend-agnostic — never import from kongmy-stack, no contract/API types here; contract-aware blocks live in kongmy-stack, composed from sapphire primitives. Registry items must be self-contained (shadcn conventions) and read tokens only via CSS custom properties.

---

## Stack

| Layer | Tool |
|---|---|
| Bundler / dev server | Vite 8 |
| Language | TypeScript 6 |
| UI framework | React 19 |
| Styling | Tailwind CSS v4 (`@theme {}`) |
| Component primitives | Radix UI (peer deps) |
| Variant logic | `class-variance-authority` (CVA) |
| Class merging | `clsx` + `tailwind-merge` via `cn()` |
| Package manager | **Bun** (never npm/npx) |
| Icons | Material Symbols Outlined |

---

## Commands

```bash
bun run dev          # specimen viewer at localhost:5173
bun run build        # tsc + vite build → dist/
bun run lint         # Biome check (lint + format, TS/TSX + CSS)
bun run lint:fix     # Biome check --write (auto-fix + format, incl. Tailwind class sort)
bun run format       # Alias of lint:fix (Biome check --write)
bun run test:a11y    # Playwright a11y tests
bun run build:docs   # docs site → dist-docs/
bun run deploy:docs  # deploy docs to Cloudflare Pages
```

---

## Key Paths

```
design/
  colors_and_type.css   ← canonical design tokens (CSS custom properties)
  design.md             ← design spec (colors, type, do's/don'ts)

src/
  index.css             ← Tailwind v4 @theme + full component styles
  index.ts              ← main library entry (React)
  elements.ts           ← Web Components / custom elements entry
  components/ui/        ← all primitive components (Button, Card, Badge…)
  components/           ← composite / behaviour components (Toast, Banner…)
  hooks/                ← reusable React hooks
  lib/
    utils.ts            ← cn() helper
    theme.ts            ← dark-mode helpers
    consent.ts          ← cookie consent helpers
```

---

## AI Skills (read before working)

| Task | Read first |
|---|---|
| Writing or editing CSS | `.claude/skills/css.md` |
| Writing or editing React components | `.claude/skills/react.md` |
| Any UI work | `.claude/instructions/design-system.md` |

---

## Hard Rules

- **Bun only.** Never use `npm`, `npx`, or `yarn`.
- **No new dependencies without justification.** This library ships to consumers; every dep has a size cost.
- **Peer deps stay peer deps.** React and all Radix packages are peer deps — never move them to `dependencies`.
- **Design tokens are in `src/theme.css` (`@theme {}`) — that is the single source.** `index.css` imports it; never re-declare tokens there. Never hard-code hex values; always reference CSS custom properties. `theme.css` ships RAW (uncompiled) to consumers as `@kongmy-dev/sapphire-ui/theme.css` so a Tailwind v4 app can `@import` it and generate utilities from Sapphire tokens without re-declaring them — do not run it through the Tailwind build (a copy plugin in `vite.config.ts` emits `dist/theme.css`).
- **No gradients in primary UI** except the `premium` button variant (intentional exception).
- **`--color-accent` is decorative.** For text on light surfaces always use `--color-accent-text` (`#8a5a1f`) — it passes WCAG AA contrast; `--color-accent` does not.
- **Exports are explicit.** Every new component gets its own named export in `package.json → exports`. Update `src/index.ts` and `package.json` together.
- **a11y first.** Run `bun run test:a11y` before shipping any component change.
