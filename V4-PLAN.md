# Sapphire UI v4 — plan

**Status:** decided. D1: the CSS contract comes first. D2: npm to use, registry to own. D3: Lucide.
D4: every component is ported. Numbers measured at `bc2e116`. This file replaces `MIGRATION-PLAN.md`
and `REGISTRY-PLAN.md` and is deleted when 4.0.0 ships.

## 1. Where it stands

| Finding | Evidence |
|---|---|
| The stylesheet's classes and the React components are two implementations of one design, and they disagree | `.btn` pads 12 × 24 px at 16 px (`src/index.css`); `<Button>` pads 9 × 16 px at 14 px (`src/components/ui/Button.tsx`) |
| The stylesheet works against its consumers | `sapphire-ui.css` is 135.4 KB, 23.6 KB gzipped. 73.0 KB is the utilities layer, almost all of it generated for the React components. 307 rules (28.7 KB) sit outside every cascade layer, so they beat any utility a consumer applies |
| Tokens are declared three times | `src/theme.css` (`@theme`), `src/index.css` (`:root`, 64 hex literals), `design/colors_and_type.css` (stale: `--color-text-muted: #64748b`) |
| Dark mode is `[data-theme="dark"]` only | no `prefers-color-scheme`; aliases such as `--color-background: var(--color-surface)` resolve at `:root`, so they do not flip inside a nested dark scope |
| The variable names are not shadcn's theming contract | no raw `--background`, `--primary`, `--radius` or `--chart-1`; a community item reading `var(--chart-1)` gets nothing, and presets or `shadcn apply` write variables sapphire never reads |
| Packaging costs the apps that want only CSS | 19 required Radix peers; 88 subpath exports, most with ESM, CJS and `.d.ts`; the root entry re-exports six custom elements and the analytics and consent code, all listed in `sideEffects` |
| Two icon systems in the registry | primitives use the Material Symbols font (19 files in `src/`); blocks import `lucide-react` |
| Fonts are named, never loaded | no `@font-face` in the package |
| Consumers, from a scan of every local repository | 2 apps use the stylesheet's classes only; 2 import React components from npm (one is still on 2.x, one also vendors from the registry); 3 vendor from the registry, the app template among them. The company website and blog use none of it. No app uses the custom elements, Analytics, CookieBanner, SEOHead or the proposal React components; the CSS-only apps do use the document, financial-table, prose, page and admin-shell classes |
| Vendored copies are reformatted by each app | every vendored `button`, `badge`, `dialog`, `select` and `table` differs from its source by 32–287 lines, mostly formatting, so re-pulling a fix through the registry is noisy |
| The gate is red, and three gates pass on nothing | `bun run gate`: `test` and `externals-check` fail on a stale `dist/` that a test reads; the comment, size and token gates print "0 files" and exit 0 |
| Comment and size debt | comment gate over `src/`: 328 stray comments, over `tooling/`: 26; size gate: 28 of 121 `src/` files fail |
| Code lags React 19 and current shadcn | 54 files use `forwardRef` and `displayName`; no `data-slot`; per-package `@radix-ui/react-*` imports |
| Docs sprawl | 2,391 lines of Markdown; two plans written as task history; files that name other projects: `design/colors_and_type.css`, `src/components/AnalyticsElement.ts`, `src/components/ui/Layout.tsx`, `AI-CODE-QUALITY.md`, `REGISTRY-PLAN.md`, `tooling/quality-metrics/` |

## 2. Target

The CSS contract is the design system. React components and custom elements are its clients.

```
css/tokens.css        shadcn variable names + brand extension; light and dark via color-scheme + light-dark()
  ├─ css/tailwind.css     @theme inline mapping: Tailwind apps get utilities on the same tokens
  └─ sapphire.css         base + layout + every components/<name>/<name>.css:
       │                  sp-* classes, data-* modifiers, in @layer base and @layer components
       ├─ plain HTML, Astro and server-rendered pages write the classes
       ├─ elements/*.ts   custom elements rendering the same classes, for sites without React
       └─ components/<name>/<name>.tsx   React components rendering the same classes, Radix for behaviour
              ├─ npm        import it, update with `bun update`   (@kongmy-dev/sapphire-ui/<name>)
              └─ registry   vendor it and own it, plus the blocks (shadcn add @sapphire/<name>)
```

- **Class names name things** (`sp-card`, `sp-card-title`); **data attributes describe them**
  (`data-variant`, `data-size`, Radix's `data-state`).
- **Customisation ladder,** cheapest first: brand tokens → component variables
  (`--sp-button-radius`) → `data-*` variants → utility classes, which win by layer order → the app's
  own CSS, since unlayered beats layered → the vendored copy.
- **npm to use, registry to own.** npm ships the stylesheets, fonts, React components, custom
  elements and `DESIGN.md`, ESM only. The peers `react`, `react-dom` and `radix-ui` are all
  optional: a CSS-only app installs none of them, and a component without behaviour (button, card,
  badge, alert…) imports no Radix, so it renders on a server without hydration. The registry serves
  the same component source and the blocks, for an app that must change a component's structure.

```
css/          tokens, tailwind mapping, base, layout, fonts
components/   one folder per component: <name>.css · <name>.tsx · <name>.examples.tsx · <name>.test.tsx
blocks/       registry-only compositions: sidebar, command, combobox, calendar, toaster, data table
elements/     custom elements for sites without React
hooks/, lib/  the hooks and helpers that components and apps share
site/         specimen and docs; hosts /r/v4
tooling/      gates, metrics, the CSS, package and registry builders
tests/        Playwright a11y and visual specs, package and registry smoke
```

The stylesheet's import list, the export map, `registry.json` and the site's navigation are
generated from the folders, so adding a component edits no shared file and components can be built
in parallel.

## 3. Decisions

| # | Decision | Why |
|---|---|---|
| D1 | **The CSS contract comes first; React renders it** | One implementation for HTML, server-rendered pages and React, so they cannot drift. The smallest React: no CVA, no utility strings. Component variables give deep theming; utilities still override by layer order |
| D2 | **npm to use, registry to own** | A fix reaches every app with `bun update`; an app that must change a component's structure vendors it. Both build from one source and one CSS contract, so they cannot drift either |
| D3 | **Lucide is the one icon system** | shadcn's default and already in the blocks. SVG needs no font request and works under a strict CSP and on a server |
| D4 | **Every component is ported,** the custom elements, Analytics, CookieBanner, SEOHead and the editorial layouts included | The owner's call: v4 loses nothing |

Alternatives weighed, for the ADRs: D1 — React first with CSS generated by `@apply` (30%), keep both
with parity tests (15%). D2 — registry only with npm as CSS (25%), npm only (20%). D3 — Material
Symbols as SVG (30%), keep the font (20%). D4 — cut what no app uses (60%), cut but keep the
editorial React (30%).

**What D3 does to D4:** a name-based `Icon` would bundle every Lucide icon, so `Icon` ports as the
`sp-icon` class, and a prop that took an icon name (`icon="add"`) takes an icon element instead.

### Settled defaults

- **Radix stays,** through the unified `radix-ui` package. State selectors read both
  `[data-state=open]` and `[data-open]`, so a later move to Base UI touches components only.
  Revisit when a primitive or fix we need ships only in Base UI, or Radix ships nothing for six
  months.
- **Tokens take shadcn's raw names** in `:root`, mapped by `@theme inline`. `--accent` takes
  shadcn's meaning, the quiet interactive surface (the gold tint); brand gold becomes `--brand`,
  with `--brand-text` for AA text on light. Reviewed on screenshots in P2.
- **Where the two implementations disagree, the React look wins:** more apps see it.
- **Registry v4 is served at `/r/v4/{name}.json`;** `/r/{name}.json` stays the v3 build until each
  app moves.
- **A `v3` branch** is cut from `f6720d3` (3.0.2) for fixes; `master` becomes v4.
- **No comments** in TS, TSX or CSS, JSDoc included: names and unions carry the meaning, and the
  shipped `.d.ts` shows the types. The one allowed form is `biome-ignore <rule>: <reason>`.
- **ESM only, one subpath per component** through a `./*` pattern export and no root barrel, so
  importing one component never loads Radix for another.
- **No runtime dependency.** Data attributes replace CVA, `clsx` and tailwind-merge; consent uses
  `document.cookie` instead of `js-cookie`; the components' own glyphs (close, chevron, check) are
  inline SVG, so the package needs no icon dependency. Apps and blocks import `lucide-react`.
- **One repository, no workspaces;** kebab-case files; class prefix `sp-`.
- **Publish to npm only,** public, with no token needed to install; GitHub Packages goes.
- **TypeScript stays on 6.0.x:** 7 has no classic compiler API, which the metrics tool and knip
  need. Bun is pinned.
- **Unit tests** run on `bun test` with happy-dom; a11y and visual specs on Playwright.

## 4. Not building

- CJS output or a root barrel.
- A Base UI variant, a monorepo or a task runner.
- A token pipeline (DTCG, Style Dictionary): CSS variables are the source, and `DESIGN.md` is
  checked against them.
- Storybook or a hosted visual-diff service: the site is the specimen and Playwright is the pin.
- Aliases for v3 class names or props: apps on 3.x stay pinned and migrate with a map.
- `@tanstack/react-table` 9 (backlog).
- A redesign: values stay as they are, except the changes this file names.

## 5. Phases

Each step is one commit and ends with `bun run gate` green. A move is pinned first, moved second and
proved third.

**P0 — Decide.** ADRs in `docs/adr/`, each under 1,000 words: rules ship with gates and code
carries no comments; the CSS contract (D1); distribution and registry versions (D2); tokens and
theming; primitives and icons (D3, D4). Delete both old plans; their vendor traps move to
`docs/traps.md`.

**P1 — A gate that can be trusted, and a pin.** Every gate prints what it checked and fails when
that is nothing. Tests are hermetic: none reads the real `dist/`. Pin Bun (`.bun-version`,
`packageManager`), devDeps exactly (`bunfig.toml`) and TypeScript 6.0.x. A strict shared
`tsconfig.base.json`, with `typecheck` in the gate. Strict Biome with `--error-on-warnings`. knip.
Unit tests move to `bun test` with happy-dom; a Radix dialog is the pilot, and if portals or pointer
events fail there, that suite runs in Playwright instead of bringing jsdom back. **Pin the look:**
Playwright screenshots of every component's demo, light and dark, committed.

**P2 — Tokens.** `css/tokens.css` and `css/tailwind.css`: light and dark through `color-scheme` and
`light-dark()`, following `prefers-color-scheme` unless `[data-theme]` or `.dark` forces one. A test
proves every v3 token maps to a v4 token of the same value. `DESIGN.md`, from `design/design.md`
and `.claude/instructions/design-system.md`, with its token values checked against `tokens.css`.

**P3 — The CSS contract.** `css/base.css` (elements, focus ring, type scale, `sp-prose`),
`css/layout.css`, and `components/<name>/<name>.css` for every component and pattern: document,
financial table, key-value list, prose, page, masthead and section, stack, cluster, columns, admin
shell. `sapphire.css` declares the layer order Tailwind uses and is bundled and minified by
`bun build`. Fonts: `woff2` from pinned `@fontsource-variable` packages, latin and latin-ext, copied
into `dist/fonts/` and declared in `fonts.css`. Each component's plain-HTML specimen matches its P1
pin, and every deliberate difference is listed in its commit. Budget: gzipped `sapphire.css` at its
measured size plus 15%. Button, card and dialog go first and set the pattern; the rest fan out.

**P4 — React components.** `components/<name>/<name>.tsx` for every component: React 19 (`ref` as
a prop), `data-slot`, variants as `as const` tuples rendered as `data-*`, the `sp-*` class plus
`className`, `radix-ui` for behaviour. `<name>.examples.tsx` is the single source for the site, the
a11y and visual specs and the HTML snippet (`renderToStaticMarkup`). `<name>.test.tsx` states
behaviour; coverage is at least 95% of lines and functions, every file counted. The contract gate
holds React and CSS together. Hooks and helpers move to `hooks/` and `lib/` with their tests.

**P5 — Custom elements.** `elements/<name>.ts` renders the same classes as its React twin, defines
itself only in a browser, and has its own a11y specimen.

**P6 — The package.** `tsc` compiles `components/`, `elements/`, `hooks/` and `lib/` file for file
(ESM and `.d.ts`); `bun build` bundles the CSS. A generated `./*` pattern export, optional peers,
and `sideEffects` naming only the stylesheets and `elements/`. A committed API snapshot (exported
types, CSS selectors, token names) fails on any change that the version and `CHANGELOG.md` do not
carry. Smoke: a temporary app installs the packed tarball and imports only the CSS with no peer
installed; server-renders button, card, badge and alert with React and without `radix-ui`; builds a
page with a dialog.

**P7 — Registry v4.** A source `registry.json` with `include`, built by a pinned `shadcn build` and
checked by `shadcn registry validate`, from the same component folders plus `blocks/`, which move
onto the new components and may use Tailwind utilities for layout. npm dependencies are versioned
from `package.json`; a slim generator stays only if `shadcn build` cannot derive them. A
`registry:base` item adds the npm package, the stylesheet import, the fonts and the consumer skill
(`~/.claude/skills/sapphire/SKILL.md`); whether the CLI can add the `@import` is unverified, and
the fallback is one documented line. Serve `/r/v4/`; freeze the current build at `/r/`. Smoke: the
pinned real CLI installs base, button, dialog and sidebar into a temporary Vite app, which must
typecheck and build; the same run targets production after deploy.

**P8 — Site.** `site/` shows, for each component, a live preview in both schemes, its own source,
its npm import and its HTML snippet, plus pages for tokens, layout and prose. It is styled by
`sapphire.css` alone, with no router or sitemap dependency. Deploy is unchanged.

**P9 — Retire the old lane.** Delete `src/`, the library Vite config, `vite-plugin-dts`, the CJS
build, the hand-written exports map, the gates that guarded only them (`deps`, `bundle-externals`),
`.husky/`, `.lintstagedrc.json`, `design/` and the two unrelated skills under `.agents/`. Set the
size limits to the new tree's own p95, lowered only from then on, and rewrite
`.quality-baseline.json`. `bun publish --dry-run` lists only `dist/`, `README.md`, `DESIGN.md` and
`LICENSE`.

**P10 — Docs.** Docs are written alongside each phase; this step adds the docs and skill-refs gates
and sweeps what is left (§6).

**P11 — Release 4.0.0.** `CHANGELOG.md` carries the migration maps (§8). CI runs `bun run gate` and
the a11y, visual and smoke specs; `bun publish` runs only after CI passes; then deploy, the
production smoke and the tag.

## 6. Docs after v4

| Doc | Holds |
|---|---|
| `README.md` | what it is, the four ways to use it (classes, Tailwind, npm React, registry), the customisation ladder, links |
| `CLAUDE.md` (`AGENTS.md` links to it) | the rules, one line each; commands; layout; hard rules; at most 120 lines |
| `DESIGN.md` | brand, tokens (checked), component guidance, UX rules; shipped in the package |
| `CHANGELOG.md` | release notes and migration maps |
| `docs/adr/` | each decision and its critical why |
| `docs/coding/principles.md` | each rule and its gate |
| `docs/traps.md` | behaviour forced by a vendor: the shadcn CLI, Cloudflare, Tailwind, Radix, browsers |
| `docs/backlog.md` | open work; never a `TODO` in code |
| `SECURITY.md`, `LICENSE` | unchanged |
| Skills | `coding-principles` (with the gate's shape and where knowledge goes), `sapphire-component` (add or change a component), `review-code`, `refactor-code`, `add-rule`; the consumer skill `skills/sapphire/SKILL.md`, shipped in the package and by the registry |

Deleted: `AI-CODE-QUALITY.md` (its size-gate reasoning moves to the `coding-principles`
reference), both plans, `.claude/instructions/design-system.md` (into `DESIGN.md`), the
`sapphire-react`, `sapphire-css`, `sapphire-testing` and `gate` skills (folded in),
`.github/ISSUE_TEMPLATE/`.

## 7. Rules and their gates

| ID | Rule | Gate |
|---|---|---|
| P-1 | No comments in TS, TSX or CSS; `biome-ignore <rule>: <reason>` is the one form | comment gate on every tracked source file, and on each edit |
| P-2 | Dependencies point one way: `css/` imports only `css/`; a component imports React, `radix-ui`, `hooks/`, `lib/` and other components; an element imports only `lib/`; a block imports components and its declared packages; `site/` imports the rest; nothing imports `site/` or `tooling/`; every tracked file is reached | boundary gate |
| P-3 | Types carry the rules: no `any`, no `!`, no `as` but `as const`, `type` over `interface`, variants as `as const` tuples with derived unions, no `enum` | `tsc` strict and Biome |
| P-4 | One contract: every variant value has its selector, every selector its value, and every class a component or element renders exists | contract gate |
| P-5 | Tokens only: no colour or length literal outside `tokens.css`, every `var()` resolves, `DESIGN.md` matches `tokens.css` | token gate |
| P-6 | Subtract before adding: a new export, file or dependency has its consumer in the same change | knip |
| P-7 | Minimise reader load, at this tree's own p95, lowered only | size gate; Biome `noNestedTernary`, `noUselessElse`, `noParameterAssign` |
| P-8 | Accessible in both schemes: every example passes axe in light and dark, and interactive ones have a keyboard spec | Playwright a11y, with coverage of every example |
| P-9 | The look is pinned: every example matches its committed screenshot, and a deliberate change updates the pin in the same commit | Playwright visual |
| P-10 | A test states a behaviour and can fail; at least 95% of lines and functions, every file counted | `bun test --coverage` and the coverage gate |
| P-11 | Docs hold the current position: no history narrated, dates only in `CHANGELOG.md` and ADR status lines, ADRs under 1,000 words, `CLAUDE.md` at most 120 lines, every path a skill cites exists | docs gate and skill-refs gate |
| P-12 | The toolchain is pinned and the package carries nothing: exact devDeps, `.bun-version`, TypeScript 6.0.x; no runtime dependency, every peer optional; registry items declare versioned dependencies | dependency gate |
| P-13 | The stylesheet has a budget: gzipped `sapphire.css` at most its measured size plus 15% | budget gate |
| P-14 | The public surface is semver: a removed or narrowed prop, class, data attribute or token is a major | API snapshot test |

`CLAUDE.md` also carries the working rules: decide out loud before building; a number in a doc or
commit is pasted from a command, with its commit; a claim about an outside system carries its
evidence or says "unverified"; a decision is an ADR before it is code; a fix lands wherever its rule
applies, in every component it touches.

## 8. Consumer migration

| App kind | Step to v4 |
|---|---|
| Stylesheet classes (pinned to 3.x) | the class map in `CHANGELOG.md`, e.g. `.btn.btn-primary` → `.sp-button`, `.alert.alert--info` → `.sp-alert[data-tone=info]`, `.fin-table` → `.sp-table[data-variant=financial]` |
| Tailwind theme | `@import "@kongmy-dev/sapphire-ui/tailwind.css"`; utility renames, e.g. `text-accent-text` → `text-brand-text` |
| npm React | the same subpaths, `@kongmy-dev/sapphire-ui/<name>`; the prop map in `CHANGELOG.md`, e.g. `icon="add"` → `<Plus />`; the stylesheet import becomes `sapphire.css`; root imports move to subpaths |
| Registry | nothing until `components.json` points at `/r/v4/{name}.json`; then re-add each item |

## 9. Stop and ask

- A pin cannot match without a visual change this file does not name.
- happy-dom cannot run a Radix suite.
- A component without behaviour cannot render on a server without `radix-ui`.
- `shadcn build` cannot express versioned or derived dependencies.
- `registry:base` cannot set up the stylesheet import.
- `light-dark()` lowering breaks a nested theme scope.
- A strict compiler flag would narrow a public prop type.

## 10. Done means

Measured at the end against `bc2e116`: runtime dependencies 4 → 0, required peers 22 → 0, export
entries 88 → under 10, stray comments 354 → 0, size-gate failures 28 → 0, Markdown other than
`CHANGELOG.md` at most half of today's 2,391 lines, gzipped stylesheet under 23.6 KB.
