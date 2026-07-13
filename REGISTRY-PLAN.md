# Sapphire UI v3 — Full Work Plan

> Plan + task list for the Sapphire UI v3.0.0 release (started 2026-07-13).

## What v3.0.0 ships

Three workstreams land together under the v3 tag:

1. **Registry lane** — the two-lane design system (below): editorial stays npm, product subset + admin blocks become a shadcn-format registry on `design.kongmy.dev`.
2. **Toolchain migration** — ESLint + Stylelint → **Biome**; lint-staged/husky rewired to Biome.
3. **Dependency refresh** — all deps bumped to latest, with two majors handled deliberately: `@types/node` 25→26 taken (dev-only types), **TypeScript held at latest 6.x** (7.0 is the native/Go compiler that drops the JS Compiler API `vite-plugin-dts` needs — its own migration, out of scope here).

**The npm lane has no breaking change** — existing consumers receive an identical `dist/`. So `3.0.0` is an *architecture* major (new registry lane), not a semver-breaking one. The tag is meaningful only once the registry is live and vendorable, so **v3 is tagged at the end, after Phases A–D deploy and a clean `shadcn add` works end-to-end**.

> **Semver note (decided — v3, full A–D build):** by strict semver this is additive, but the `3.0.0` tag is a deliberate architecture-signal for the new registry lane. To keep it honest for consumers, the CHANGELOG leads with "**No breaking API or export changes**" and separately documents the one behavior change (`cn()` font-size conflict resolution, from the tailwind-merge upgrade). API/exports are compatible; no consumer migration required.

---

## Decision & reasoning (two-lane model)

Sapphire UI becomes a **two-lane** design system in one repo:

| Lane | Distribution | Audience | Status |
|---|---|---|---|
| **Editorial/brand** | npm package (`@kongmy-dev/sapphire-ui`, GitHub Packages) — unchanged | kongmy.dev properties, blog, proposals — sites we fully control | Live, keep as-is |
| **Product** (new) | **shadcn-format registry** — vendored source via `shadcn add`, hosted as static output on design.kongmy.dev | Product/client apps | This plan |

**Why a registry lane (strengths):**
- **Vendored source beats versioned packages when consumers must diverge.** Product apps (POS terminals, client admin panels) modify components — touch targets, kiosk modes, client one-offs. With npm that means local forks or library pollution; with vendored source it's editing your own file. No version treadmill.
- **Zero-credential tooling.** GitHub Packages requires a PAT even for public packages — friction on every machine, CI, and AI-agent session. A public static registry over HTTPS makes `shadcn add` and agent workflows credential-free.
- **The token contract is the durable asset, not the component copies.** Consumers reskin by overriding `theme.css` custom properties; the same tokens skin npm components, registry components, and imported admin blocks identically.
- **Ecosystem compatibility.** Registry items are shadcn-shaped, so product apps can mix sapphire items with community/shadcn items under one `components.json`, and the shadcn CLI/AI tooling works uniformly. **This is only *visually* true if the theme item aliases shadcn's semantic var names onto sapphire tokens (see A.3)** — without that layer, compatibility is CLI-level only and every community `add` needs a manual restyle.

**Scope discipline:** ONLY the product subset gets registry-shaped (~22 components + admin blocks). Editorial components (MarginNote, ProposalLayout, SEOHead, SiteHeader/Footer, TableOfContents, CodeBlock, PassphraseGate…) stay npm-only forever — they serve controlled sites where a versioned package is the *right* model. Converting all 63 components would be waste.

**Compatibility:** existing npm consumers are untouched — ratchet policy, no forced migration.

## Hard boundary (add to reviews)

- **Sapphire stays backend-agnostic.** Never import application or backend code; no contract/API types here. Contract-aware blocks (DataTable wired to pagination schemas, error→form mapping) live in consuming applications, composed FROM sapphire primitives. Dependency points one way: consuming application → sapphire registry, never the reverse.
- **Registry items are self-contained per shadcn conventions.** They declare their own npm `dependencies` + `registryDependencies`, import `cn()` via the `@/lib/utils` alias, and read tokens only via CSS custom properties from `theme.css` — never hard-coded values (existing rule, applies doubly here).
- **Registry deps do not become npm-library deps.** `@tanstack/react-table`, `cmdk`, `sonner`, `date-fns`, `react-day-picker` etc. belong in registry-item manifests (installed into the consumer) and as **devDeps** here (specimen viewer only). The editorial npm lane stays lean — do not add them to `dependencies` or `peerDependencies`.

---

## Grounding notes (verified against the codebase)

Facts that shape the work, confirmed by inspection:

- **The product subset is already registry-friendly.** All ~22 candidate components use pure Tailwind utilities (0 references to `index.css` semantic classes). Their only real dependencies are `theme.css` tokens + `@/lib/utils`, **not** the 1,965-line `index.css`.
- **The one mechanical transform:** components import `../../lib/utils` (relative). shadcn convention is the `@/lib/utils` alias. Conversion = rewrite relative imports to `@/…` form. Best automated by a Bun script, not hand-authored manifests (22+ items).
- **Custom Tailwind utilities are the hidden coupling.** Items use `bg-primary`, `rounded-btn`, `text-accent-text`, `bg-hover-overlay`, `text-text-on-dark` — all generated from `theme.css` `@theme {}`. The registry `theme` item must carry these, and CI must verify coverage.
- **Deploy is one Cloudflare Worker** (`wrangler.toml` → `dist-docs/`, `not_found_handling = single-page-application`, `design.kongmy.dev`). Registry JSON must be emitted *into* `dist-docs/` and survive the SPA fallback (a mistyped item silently returns `index.html` instead of 404).
- **Phase C source** is an external shadcn admin-dashboard template: ships `sidebar.tsx`, `command.tsx` (cmdk), `calendar.tsx` (react-day-picker + date-fns), `sonner.tsx`, `data-table/` (TanStack Table), `form.tsx`, plus feature demos.

---

## Task list

### Phase 0 — Toolchain & dependencies (foundation; do first, land as its own commit)

Do this before registry work so the build script and CI checks are authored under the final toolchain, and the dep churn doesn't collide with in-flight registry files.

- [x] **0.1 Bump all deps to latest.** Done. Bumped all except TypeScript (held at `6` — see above); `@types/node` 26 taken. Kept peer-dep *ranges* permissive: `--latest` tightened `react`/`react-dom`/`react-resizable-panels` peers, reverted to `^19.2.0`/`^4.11.2`. Also restored a green unit baseline first — jsdom 29 drops Web Storage under vitest 4, so `localStorage` is now polyfilled in `vitest.setup.ts`. Verified: `build` + `test` (117/117) + `test:a11y` (48/48, all 3 engines) green.
- [x] **0.2 Migrate to Biome (Biome-max).** Done. Added `biome.json` (Biome 2.5); `preset: recommended` + `useSortedClasses` (class sort applied across components). Scripts → `biome check` / `--write`; `.lintstagedrc.json` → `biome check --write`; removed eslint/stylelint deps + `eslint.config.js`. Kept `.stylelintrc.json` shipped (it's a consumer export — deleting would break the npm lane). CSS handled via Biome's `css.parser.tailwindDirectives: true` (parses v4 `@theme`/`@utility`/…). Relaxed rules (documented in this commit): a11y group off (axe suite is the a11y gate), `noDangerouslySetInnerHtml`/`noImportantStyles`/`noDescendingSpecificity`/`noArrayIndexKey` off (intentional patterns / prior posture); `*Element.ts` web-component glue exempted from strict suspicious rules. Note: reformat collapsed the hand-aligned token columns in `index.css`/`theme.css` — compiled CSS verified byte-identical.
- [x] **0.3 Green baseline.** Done. `bun run build`, `bun run test` (117/117), `bun run test:a11y` (48/48), `bun run lint` (biome, exit 0) all pass. CLAUDE.md Commands table updated. One latent test corrected: `cn('text-lg text-sm')` now `'text-sm'` (tailwind-merge bump fixed font-size conflict resolution — later class wins, matching the test's own name).

### Phase A — Registry infrastructure

- [x] **A.1** Done. `components.json` defines the `@/` aliases (consumer reference). `registry.json` is generated as the index by the build script (`items` populated, not a stub).
- [x] **A.2** Done. `scripts/build-registry.ts` (Bun) + `registry/items.ts` config: reads each source, rewrites `../../lib/utils`→`@/lib/utils`, `../../hooks/x`→`@/hooks/x`, `./X`→`@/components/ui/x`, and **derives** npm `dependencies` + `registryDependencies` from imports. Proven on the 25-item product subset: closed dependency graph (`icon`/`label` resolve), zero leftover relative imports. Note: survey found the only internal edges are all→`utils`, Dialog→`icon`, FormField→`label`; `Icon` was added to the set as Dialog's dep.
- [x] **A.3** Done. `theme` item (`registry:style`, target `styles/sapphire-theme.css`) ships `theme.css` verbatim — now the **single source** carrying brand tokens + the shadcn semantic layer + the `[data-theme="dark"]` block (the separate `shadcn-aliases.css` was merged in). A `registryDependency` of every component; coverage enforced by A.5.

**Token-vocabulary alignment (2026-07-13):** `theme.css` is now shadcn-canonical — shadcn semantic tokens are first-class (shipped to both lanes, additively/non-breaking), and the 25 product components were migrated to shadcn utility names where a value-identical equivalent exists (`text-text-muted`→`text-muted-foreground`, `bg-surface`→`bg-background`, `text-text-main`→`text-foreground`, `text-text-on-dark`→`text-primary-foreground`). Brand-only utilities with no shadcn equivalent stay (`text-accent-text`, `text-text-strong`, `rounded-btn`, `bg-hover-overlay`, `on-dark` family). Value-identical by construction (proven: `text-muted-foreground`→`var(--color-text-muted)`→`#475569`); a11y 48/48 confirms no contrast change.
  - [x] **A.3a — shadcn semantic-var alias layer.** Done (`registry/shadcn-aliases.css`, concatenated into the theme item). Adds the shadcn names sapphire lacks (`background`, `foreground`, `card`, `popover`, `muted`/`muted-foreground`, `secondary`, `destructive`, `input`, `ring`, `*-foreground`, `radius-lg/xl`) as `var()` aliases → sapphire tokens; names sapphire already owns (`primary`, `accent`, `border`) intentionally coincide. Dark mode is free (var() indirection flows through `[data-theme="dark"]`). Proven by B.3: `bg-background`/`text-muted-foreground` compile to sapphire tokens in the consumer build. **Now includes the full standard shadcn surface — `--color-sidebar-*` (7), `--color-chart-1..5`, and status `-foreground` companions — added after the emas-pos audit showed 27 sidebar usages depend on them (also unblocks Phase C's sidebar block).**
- [x] **A.4** Mostly done. `build:docs` now runs `build:registry` (emits to `dist-docs/r/{item}.json`); `build:registry` script added. `public/_headers` has a `/r/*` block (permissive CORS + short cache; Cloudflare sets JSON content-type). URL + `components.json` setup documented in the README (D.1). ✅ complete.
- [x] **A.5** Done (build-time checks). `scripts/check-registry.ts` (`bun run check:registry`, gated in CI) asserts: (a) closed dependency graph, (b) no leaked relative imports in emitted component files, (c) every sapphire `--color-*`/`--radius-*`/… token a component references is defined by the `theme` item. **Remaining:** the post-deploy `curl` smoke test on a live `/r/*.json` (serving-vs-SPA-fallback) — belongs with the deploy step (R.4), not build CI.

### Phase B — Product subset (~22 items)

- [x] **B.1** Done. All 24 candidates + `Icon` (Dialog's dep) shipped as registry items via `registry/items.ts`.
- [x] **B.2** Done — `registryDependencies` are *derived* from imports, not hand-authored (see A.2), plus `theme` added to every component. Actual edges: `dialog`→`icon`+`theme`, `form-field`→`label`+`theme`, all others→`theme`. (The plan's earlier guesses like `pagination`→`button` don't hold — Pagination has no component imports; derivation reflects the real graph.)
- [x] **B.3** Done. `tests/registry-consumer/` (committed Vite+Tailwind app) + `scripts/verify-consumer.ts` (`bun run test:registry`, gated in CI): materializes the built registry into the `@/` root, runs `tsc --noEmit` over all vendored components, and does a real Tailwind build asserting the compiled CSS contains `#0a192f` (vendored Button's `bg-primary`) and `#f4f6f8` (`bg-background` shadcn alias). Catches manifest rot every run. The true `shadcn add` from the deployed URL runs post-deploy (R.4); this is its local proxy. **Primary acceptance gate, permanent.**

### Phase C — Admin blocks (import & restyle from an external shadcn admin-dashboard template)

Restyle each onto sapphire tokens (presentation only — no server/contract wiring). Declare each block's npm deps in its manifest; add them here as **devDeps only**.

**Blocks infrastructure done:** blocks live in `registry/blocks/` (outside `src/`, so the npm lane never bundles them); the build engine reads them, derives deps + registryDependencies (unified from `@/components/ui/*` imports), and emits `registry:block` items. `check:registry` + the consumer fixture (`test:registry`) now type-check + build blocks against sapphire's real primitives. **The token alignment paid off**: donor blocks use shadcn utilities sapphire now provides, so restyle is near-free. **Remaining C:** C.1 DataTable, C.2 Sidebar (728-line donor + AdminLayout reconciliation — its own task), C.4 Calendar, C.7 specimens.

- [ ] **C.1 DataTable** primitives (TanStack Table composition — presentation only; server-pagination wiring stays in the consuming application). **Compose sapphire's existing `Table` primitives (B.1), not the donor template's `table.tsx`** — otherwise the registry ships two divergent table primitive sets. New registry dep: `@tanstack/react-table`.
- [ ] **C.2 Sidebar / app-shell**. Reconcile with existing `AdminLayout` — keep one, registry-shape it.
- [x] **C.3 Command** (cmdk). Done — `registry/blocks/command.tsx`, the cmdk Command family composing sapphire's `Dialog`. Deps `cmdk` + `lucide-react` (registry-item deps + devDeps only). (The higher-level `CommandPalette` editorial component is untouched; this is the reusable primitive product apps compose.)
- [ ] **C.4 DatePicker / Calendar**. New registry deps: `react-day-picker`, `date-fns`.
- [x] **C.5 Combobox** (Popover + Command composition). Done — `registry/blocks/combobox.tsx`, a reusable searchable single-select over sapphire `Button` + `Popover` + the `command` block. Fixture builds + type-checks it.
- [x] **C.6 Product-lane Toast** (sonner). Done — `registry/blocks/sonner.tsx` `Toaster`, wired to sapphire tokens (`var(--color-popover)` etc.); dropped the donor `next-themes` coupling. Registry dep `sonner` (devDep only).
- [ ] **C.7 a11y specimens for every new block.** `test:a11y` (Playwright) runs against specimen pages — a block with no specimen silently escapes coverage. Add a specimen entry per C.1–C.6 block so R.3's a11y gate actually exercises them. If any block is intentionally left without a specimen, state the gap explicitly rather than let it pass silently.

### Phase D — Docs & handoff

- [x] **D.1** Done. README "Two lanes" section: the which-lane-do-I-want table + product-lane consumer setup (`components.json` `registries` URL, `shadcn add @sapphire/…` examples, `@import` the theme layer, Material Symbols + font requirement, dark-mode note, and the shadcn-vocabulary/mix-with-community note). (A dedicated interactive specimen page in the docs app could follow, but the README is the canonical registry doc consumers read.)
- [x] **D.2** Done. README registry-lane section added; CLAUDE.md carries the two-lane model + the shadcn-canonical token convention (added during the alignment work). Commands table current (Biome).

### Release — tag v3.0.0

- [ ] **R.1** Bump `package.json` 2.0.3 → 3.0.0.
- [ ] **R.2** CHANGELOG entry, framed additive: new registry lane + Biome + dep refresh; **npm lane unchanged**.
- [ ] **R.3** Final gate: `bun run build` + `bun run test` + `bun run test:a11y` + `biome check` green; the `tests/registry-consumer/` fixture (B.3) re-vendors and type-checks clean; registry smoke test (A.5) passes against the deployed URL.
- [ ] **R.4** `git tag v3.0.0`, publish npm (identical artifact), `bun run deploy:docs` (docs + registry).

### Explicitly NOT in scope

- Converting editorial components to registry items.
- Any breaking change to the npm lane or existing consumers.
- Adding registry deps (TanStack, cmdk, sonner…) to the npm library's `dependencies`/`peerDependencies`.
- Compose/KMP token export (revisit only when a real mobile project demands it).
- Contract-aware logic of any kind (belongs in consuming applications).

## Acceptance criteria

- [ ] A clean Vite app can `shadcn add` the product subset + one admin block from design.kongmy.dev with zero credentials and render correctly with sapphire tokens.
- [ ] npm lane consumers observe zero change.
- [ ] Toolchain is Biome (with CSS fallback documented if retained); all deps at latest; full test + a11y suite green.
