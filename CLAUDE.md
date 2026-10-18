# CLAUDE.md — Sapphire UI

Sapphire UI is the official design system for **KONGMY Digital Solutions** (`kongmy.dev`). It exports both a compiled stylesheet (`sapphire-ui.css`) and a typed React component library. All work here must honour the navy + gold editorial aesthetic.

## Two-lane model (v3 — decided 2026-07-13)

| Lane | Distribution | Audience |
|---|---|---|
| **Editorial/brand** | npm package (unchanged) | Properties, blog, proposals |
| **Product** | shadcn-format **registry** (vendored source, hosted on design.kongmy.dev) | product/client apps scaffolded from the internal stack template |

Why: product apps must diverge (client theming, POS touch UIs) — vendored source makes divergence an edit, not a fork; a public registry also kills PAT friction. Only the **product subset** (~15 components + admin blocks adapted from an upstream shadcn admin reference, restyled onto tokens) gets registry-shaped; editorial components stay npm-only. Existing npm consumers are never broken.

**Plan: `V4-PLAN.md`.** Hard boundary: sapphire stays backend-agnostic — sapphire never imports from consuming apps; contract-aware blocks live in the consuming template, composed from sapphire primitives. Registry items must be self-contained (shadcn conventions) and read tokens only via CSS custom properties.

---

## Size and shape

**When a request is underspecified, decide out loud before you build.** List what the request leaves open — input shape, output shape, edge behaviour, anything you would otherwise settle silently while typing. Take the narrowest answer that satisfies it, and say what you are choosing *not* to build. Then implement that list and nothing beyond it. Measured over six runs on a sibling repo: 19% less code, 30% fewer exports, 32% lower complexity.

**A new export needs a consumer in the same change.** An interface with one implementation, a factory that constructs one thing, or an options object read in one place is indirection nobody is paying for. Write the direct version; the seam appears on its own when a second caller arrives, and it lands somewhere other than you would have guessed.

The gates run on every tracked file outside the frozen lane (`src/`, `registry/blocks/`, `tests/registry-consumer/app/`, `design/`) and, after every edit, through `.claude/hooks/check-edit.sh`; `AI-CODE-QUALITY.md` gives the size limits and why. `src/` is frozen until P9 (P-17): a v3 fix goes to the `v3` branch.

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
bun run lint         # Biome check, warnings fail (lint + format, TS/TSX + CSS)
bun run typecheck    # tsc -b over every tsconfig
bun run knip         # unused files, exports and dependencies
bun run lint:fix     # Biome check --write (auto-fix + format, incl. Tailwind class sort)
bun run format       # Alias of lint:fix (Biome check --write)
bun run test         # Unit test suite (bun test)
bun run test:a11y    # Playwright a11y tests
bun run gate         # lint, typecheck, knip, then the gates below, test, check:registry
bun run comment-check # Comment gate (P-1): every in-scope file
bun run size-check   # Size gate (P-7): every in-scope TS file
bun run dep-check    # Dependency gate (P-12)
bun run freeze-check # Freeze gate (P-17): src/ is unchanged
bun run token-check  # Token gate (P-5): css/, components/, blocks/, elements/, site/ and DESIGN.md
bun run budget-check # Budget gate (P-13): gzipped sapphire.css, built into a temp dir, against its ceiling
bun run generated-check # Generated-files gate (P-16): every generator rerun in memory, any diff fails
bun run generate     # Write the generated files (sapphire.css); run it after adding a component folder
bun run scorecard [sha] # v4 numbers and per-component state at a commit (default HEAD), measured in a temp checkout
bun run test:visual   # compare every pin inside the linux/arm64 Playwright container (needs Docker)
bun run pin <example>… # the only way to change a pin: compare, print expected/actual/diff paths, update those pins
bun run build:docs   # docs site → dist-docs/
bun run deploy:docs  # deploy docs to Cloudflare Pages
```

---

## Key Paths

```
DESIGN.md               ← v4 design spec: brand, token tables (checked against css/tokens.css), UX rules

sapphire.css            ← GENERATED stylesheet entry: layer order, then fonts, tokens, base, every component (bun run generate)

css/
  layers.css            ← the @layer order line; first import so it stays first
  fonts.css             ← @font-face from @fontsource-variable (latin, latin-ext, woff2)
  tokens.css            ← v4 tokens, the single source (ADR-0004)
  base.css              ← element defaults, focus ring, type scale (@layer base)
  base.examples.html    ← plain-HTML specimens of base (typography)
  tailwind.css          ← maps every v4 token to Tailwind utilities

components/<name>/      ← <name>.css (@layer components, sp-* classes) and <name>.examples.html (specimens)

site/specimen.css       ← docs chrome the specimens use; tooling/visual/specimen-server.ts serves them

tooling/migrate/map.ts  ← v3 → v4 token, utility, class and prop-value renames

design/
  colors_and_type.css   ← v3 design tokens (frozen lane)
  design.md             ← v3 design spec (frozen lane)

docs/
  coding/
    principles.md       ← coding principles & gates register

src/
  theme.css             ← v3 Tailwind @theme tokens (frozen until P9)
  index.css             ← component styles and utility imports
  index.ts              ← main library entry (React)
  elements.ts           ← Web Components / custom elements entry
  components/ui/        ← primitive components (Button, Card, Badge…)
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
| Coding principles & standards | `.claude/skills/coding-principles/SKILL.md` |
| Writing, typing or reviewing any `.ts`/`.tsx` | `.claude/skills/typescript/SKILL.md` |
| Writing or editing React components | `.claude/skills/sapphire-react/SKILL.md` |
| Writing or editing CSS & tokens | `.claude/skills/sapphire-css/SKILL.md` |
| Writing or running tests | `.claude/skills/sapphire-testing/SKILL.md` |
| Downstream app integration | `.claude/skills/sapphire-consumer/SKILL.md` |
| Reviewing code | `.claude/skills/review-code/SKILL.md` |
| Refactoring & size gate fixes | `.claude/skills/refactor-code/SKILL.md` |
| Running quality gates | `.claude/skills/gate/SKILL.md` |
| Adding new rules or gates | `.claude/skills/add-rule/SKILL.md` |
| Any UI work | `DESIGN.md` |

---

## Hard Rules

- **Bun only.** Never use `npm`, `npx`, or `yarn`.
- **No new dependencies without justification.** This library ships to consumers; every dep has a size cost.
- **Peer deps stay peer deps.** React and all Radix packages are peer deps — never move them to `dependencies`.
- **v4 design tokens are in `css/tokens.css` (ADR-0004) — that is the single source.** Colours are `light-dark(<light>, <dark>)`, declared once, only in the block `:root, [data-theme=light], [data-theme=dark], .dark`; every other token is declared once on `:root`. `css/tailwind.css` maps each token to utilities, and the token gate (P-5) fails on an unmapped token, a misplaced colour or a `DESIGN.md` table that disagrees. Never hard-code hex values; reference CSS custom properties. `src/theme.css` is the v3 token file, frozen with `src/` until P9; a v3 fix goes to the `v3` branch.
- **No gradients in primary UI** except the `premium` button variant (intentional exception).
- **`--brand` (the gold) is decorative.** For gold text use `--brand-text` (`#8a5a1f` in light) — it passes WCAG AA contrast; `--brand` does not. `--accent` is shadcn's quiet surface (the gold tint), not the gold.
- **Token vocabulary is shadcn-canonical + a brand extension.** Prefer the shadcn utility name where an equivalent exists (`text-muted-foreground`, `bg-background`, `bg-card`, `text-primary-foreground`) so components read as idiomatic shadcn and mix with community items. Use the brand-only tokens for what shadcn lacks: `bg-brand`, `text-brand-text` (AA gold), `text-foreground-strong`, `rounded-btn`, the `on-dark` family. The v3 names under `src/` map to these through `tooling/migrate/map.ts`.
- **Exports are explicit.** Every new component gets its own named export in `package.json → exports`. Update `src/index.ts` and `package.json` together.
- **a11y first.** Run `bun run test:a11y` before shipping any component change.
- **No comments in TS, TSX or CSS (P-1, ADR-0001).** The comment gate fails any comment outside the two forms the ADR lists.
