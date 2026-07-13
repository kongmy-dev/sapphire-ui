# Sapphire UI v3 — Full Work Plan

> Plan + task list for the Sapphire UI v3.0.0 release (started 2026-07-13).

## What v3.0.0 ships

Three workstreams land together under the v3 tag:

1. **Registry lane** — the two-lane design system (below): editorial stays npm, product subset + admin blocks become a shadcn-format registry on `design.kongmy.dev`.
2. **Toolchain migration** — ESLint + Stylelint → **Biome**; lint-staged/husky rewired to Biome.
3. **Dependency refresh** — all deps bumped to latest (currently all pending bumps are minor/patch — Radix minors, Playwright, React patch; no majors).

**The npm lane has no breaking change** — existing consumers receive an identical `dist/`. So `3.0.0` is an *architecture* major (new registry lane), not a semver-breaking one. The tag is meaningful only once the registry is live and vendorable, so **v3 is tagged at the end, after Phases A–D deploy and a clean `shadcn add` works end-to-end**.

> **Semver caveat (deliberate):** by strict semver this is additive — a `2.1.0`. The `3.0.0` tag is a chosen architecture-signal, not a breakage flag. Because a major normally tells consumers "expect breakage," the CHANGELOG (R.2) **must state plainly, first line, that there is no breaking change to the npm lane**. If that framing ever feels misleading to a consumer, downgrade to `2.1.0` — the plan's own "no breaking change" logic supports it.

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

- [ ] **0.1 Bump all deps to latest.** `bun update` (all pending are minor/patch). Keep peer-dep *ranges* permissive (`^1.0.0` style) — only bump the devDep pins. Verify: `bun run build` + `bun run test` + `bun run test:a11y` all green.
- [ ] **0.2 Migrate to Biome.** Add `biome.json`; port the rule intent from `eslint.config.js` (80 lines) + `.stylelintrc.json`: React/hooks rules, escaped-entity handling, Tailwind class ordering (Biome `useSortedClasses`, nursery — enable explicitly). Replace scripts `lint`/`lint:fix`/`format`/`lint:css`/`lint:css:fix` with `biome check` / `biome check --write`. Rewrite `.lintstagedrc.json` and `.husky/pre-commit` from `bunx eslint`/`bunx stylelint` to `biome check --write`. Remove eslint/stylelint deps + config files.
  - **Decision in execution — CSS linting:** Biome's CSS linter may flag Tailwind v4 at-rules (`@theme`, `@source`, `@utility`) via `noUnknownAtRule`. Try disabling that rule first; if Biome still can't cleanly handle `theme.css`/`index.css`, **keep Stylelint for CSS only** and use Biome for TS/TSX. Don't block the migration on perfect CSS parity.
- [ ] **0.3 Green baseline.** `bun run build`, `bun run test`, `bun run test:a11y`, `biome check` all pass. Update CLAUDE.md Commands table (lint/format entries). Commit.

### Phase A — Registry infrastructure

- [ ] **A.1** Add `components.json` (defines the `@/` alias + registry consumer config) and a `registry.json` skeleton (name, homepage, `items: []`).
- [ ] **A.2** Author `scripts/build-registry.ts` (Bun): for each declared item, read source → rewrite `../../lib/utils` → `@/lib/utils` and `../ui/X` → `@/components/ui/x` → emit a `registry:ui` manifest with `files`, `dependencies` (parsed from imports), `registryDependencies`. This is the conversion engine reused by Phases B & C.
- [ ] **A.3** Ship a `registry:theme` (+ `registry:style`) item carrying `theme.css` tokens, so `shadcn add` bootstraps a project's tokens without the npm package. Every custom utility used by product items must resolve from this item.
  - [ ] **A.3a — shadcn semantic-var alias layer (high leverage, small task).** In the theme item, alias shadcn's canonical semantic var names onto sapphire tokens: `--background`/`bg-background`, `--foreground`, `--muted`/`--muted-foreground`, `--border`/`border-input`, `--ring`, `--primary`/`--primary-foreground`, `--destructive`, `--accent`, `--popover`, `--card`, etc. This makes any *community/upstream* shadcn item render acceptably on sapphire tokens with zero per-item restyling — the difference between real ecosystem compatibility and CLI-level-only. Cross-check the alias list against the donor admin template's actual var usage.
- [ ] **A.4** Wire registry emit into `build:docs` so output lands at `dist-docs/r/{item}.json`. Add `public/_headers` entries for `application/json` content-type + permissive CORS on `/r/*`. Document the final URL (`design.kongmy.dev/r/{item}.json`) in README for consumers.
- [ ] **A.5** CI check: every registry item (a) builds, (b) has no library-internal (relative) imports left, **and** (c) every Tailwind utility it references is covered by the `theme` item. Add a deploy smoke test that `curl`s a known `/r/*.json` and asserts JSON (not the SPA `index.html` fallback). Note: this smoke test verifies the item is *served correctly*, not that it is *consumable* — that's the standing fixture in B.3, a different failure class.

### Phase B — Product subset (~22 items)

- [ ] **B.1** Feed the candidate list into `build-registry.ts`: Button, Input, Textarea, Label, Checkbox, RadioGroup, Select, NativeSelect, Dialog, Sheet, DropdownMenu, Popover, Tooltip, Table, Tabs, Card, Badge, FormField, Skeleton, Spinner, Empty, Pagination, Stat, StatGroup. (Exact list refined as the subset is exercised.)
- [ ] **B.2** Author the `registryDependencies` graph (e.g. `form-field` → `label` + `input`; `pagination` → `button`; `stat-group` → `stat`).
- [ ] **B.3** Standing consumer fixture: check in `tests/registry-consumer/` (a minimal Vite app) and a script that `shadcn add`s the subset from the deployed URL, then renders + type-checks. Run it in CI (or minimally in R.3 pre-release) so manifest rot is caught on every change — not a one-off gate that "worked once." **Primary acceptance gate, made permanent.**

### Phase C — Admin blocks (import & restyle from an external shadcn admin-dashboard template)

Restyle each onto sapphire tokens (presentation only — no server/contract wiring). Declare each block's npm deps in its manifest; add them here as **devDeps only**.

- [ ] **C.1 DataTable** primitives (TanStack Table composition — presentation only; server-pagination wiring stays in the consuming application). **Compose sapphire's existing `Table` primitives (B.1), not the donor template's `table.tsx`** — otherwise the registry ships two divergent table primitive sets. New registry dep: `@tanstack/react-table`.
- [ ] **C.2 Sidebar / app-shell**. Reconcile with existing `AdminLayout` — keep one, registry-shape it.
- [ ] **C.3 Command palette** (cmdk). Reconcile with existing `src/components/CommandPalette.tsx` — reuse if compatible. New registry dep: `cmdk`.
- [ ] **C.4 DatePicker / Calendar**. New registry deps: `react-day-picker`, `date-fns`.
- [ ] **C.5 Combobox** (Popover + Command composition).
- [ ] **C.6 Product-lane Toast** (sonner). The existing web-component `Toast` is editorial-lane; product apps need the React/sonner path. New registry dep: `sonner`. (Justify per Hard Rules — registry-item + devDep only, not a library dep.)
- [ ] **C.7 a11y specimens for every new block.** `test:a11y` (Playwright) runs against specimen pages — a block with no specimen silently escapes coverage. Add a specimen entry per C.1–C.6 block so R.3's a11y gate actually exercises them. If any block is intentionally left without a specimen, state the gap explicitly rather than let it pass silently.

### Phase D — Docs & handoff

- [ ] **D.1** Docs page: two-lane model + "which lane do I want" table + consumer setup (`components.json` registry URL, `shadcn add` examples).
- [ ] **D.2** Sync README + CLAUDE.md (Commands table already partly updated in 0.3 — keep the two-lane section current).

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
