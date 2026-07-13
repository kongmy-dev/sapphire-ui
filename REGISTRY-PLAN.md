# Sapphire UI v3 — Registry Lane Plan

> Decided 2026-07-13 as part of the kongmy-stack architecture (vault: `Resources/Dev & Infra/API Stack & Template Architecture — kongmy-stack.md`; consumer side: `~/Projects/kongmy-stack/PLAN.md`). This file is the sapphire-side plan + task list.

## Decision & reasoning (summary)

Sapphire UI becomes a **two-lane** design system in one repo:

| Lane | Distribution | Audience | Status |
|---|---|---|---|
| **Editorial/brand** | npm package (`@kongmy-dev/sapphire-ui`, GitHub Packages) — unchanged | kongmy.dev properties, blog, proposals — sites we fully control | Live, keep as-is |
| **Product** (new) | **shadcn-format registry** — vendored source via `shadcn add`, hosted as static output on design.kongmy.dev | Product/client apps scaffolded from kongmy-stack | This plan |

**Why a registry lane (strengths):**
- **Vendored source beats versioned packages when consumers must diverge.** Product apps (POS terminals, client admin panels) modify components — touch targets, kiosk modes, client one-offs. With npm that means local forks or library pollution; with vendored source it's editing your own file. No version treadmill (consumer-pinning drift is already observed at n=1 consumer).
- **Zero-credential tooling.** GitHub Packages requires a PAT even for public packages — friction on every machine, CI, and AI-agent session. A public static registry over HTTPS makes `shadcn add` and agent workflows credential-free.
- **The token contract is the durable asset, not the component copies.** Consumers reskin by overriding `theme.css` custom properties; the same tokens skin npm components, registry components, and imported shadcn-admin blocks identically.
- **Ecosystem compatibility.** Registry items are shadcn-shaped, so product apps can mix sapphire items with community/shadcn items under one `components.json`, and the shadcn CLI/AI tooling works uniformly.

**Scope discipline:** ONLY the product subset gets registry-shaped (~15 components first + admin blocks). Editorial components (MarginNote, ProposalLayout, SEOHead, SiteHeader/Footer, TableOfContents, CodeBlock, PassphraseGate…) stay npm-only forever — they serve controlled sites where a versioned package is the *right* model. Converting all 63 components would be waste.

**Consumers:** first = emas-pos (via kongmy-stack skeleton, 4+ apps, replacing its parallel `theme.css` + `packages/ui`). Existing npm consumers (nexus) untouched — ratchet policy, no forced migration.

## Hard boundary (add to reviews)

- **Sapphire stays backend-agnostic.** Never import from kongmy-stack; no contract/API types here. Contract-aware blocks (DataTable wired to pagination schemas, error→form mapping) live in kongmy-stack's `apps/web`, composed FROM sapphire primitives. Dependency points one way: stack → sapphire registry, never the reverse.
- Registry items must be self-contained per shadcn conventions (declare npm deps + registryDependencies; `@/lib/utils` for `cn()`), and read tokens only via CSS custom properties from `theme.css` — never hard-coded values (existing rule, applies doubly here).

## Task list

### Phase A — Registry infrastructure
- [ ] Add `registry.json` + per-item manifests (shadcn registry format; `shadcn build` produces static output)
- [ ] Wire registry static output into the existing design.kongmy.dev deploy (docs build + wrangler already in place) — target URL: `design.kongmy.dev/r/{item}.json` (or `/registry/…`; document final URL in README for consumers)
- [ ] Ship theme as registry items too (`registry:theme`/style): tokens from `theme.css` so `shadcn add` can bootstrap a project's tokens without the npm package
- [ ] CI check: registry items build + are self-contained (no library-internal imports)

### Phase B — Product subset conversion (~15 first; emas-pos admin needs drive the exact list)
- [ ] Candidates: Button, Input, Textarea, Label, Checkbox, RadioGroup, Select/NativeSelect, Dialog, Sheet, DropdownMenu, Popover, Tooltip, Table, Tabs, Card, Badge, FormField, Skeleton, Spinner, Empty, Pagination, Stat/StatGroup
- [ ] Convert each to registry-item shape (self-contained imports, manifest, deps declared) — source stays in this repo; npm export unaffected
- [ ] Verify one end-to-end vendor: `shadcn add` into a scratch Vite app renders correctly with tokens

### Phase C — Admin blocks (import from `~/Projects/references/shadcn-admin`, restyle onto sapphire tokens)
- [ ] DataTable primitives (TanStack Table composition — presentation only; server-pagination wiring stays in kongmy-stack)
- [ ] Sidebar/app-shell (reconcile with existing AdminLayout — keep one, registry-shape it)
- [ ] Command palette
- [ ] DatePicker/Calendar
- [ ] Combobox
- [ ] Toast/sonner story for product lane (web-component toast is editorial-lane; product apps need the React/sonner path)

### Phase D — Docs & handoff
- [ ] Docs page: two-lane model + "which lane do I want" table + consumer setup (`components.json` registry URL)
- [ ] README + CLAUDE.md updated (done for CLAUDE.md summary section — keep in sync)
- [ ] Notify kongmy-stack thread when Phase A+B land (its `apps/web` vendoring is blocked on them; interim fallback there: plain shadcn + `@import` sapphire `theme.css`)

### Explicitly NOT in scope
- Converting editorial components to registry items
- Any breaking change to the npm lane or existing consumers
- Compose/KMP token export (revisit only when a real mobile project demands it)
- Contract-aware logic of any kind (belongs in kongmy-stack)

## Acceptance criteria

- [ ] A clean Vite app can `shadcn add` the product subset + one admin block from design.kongmy.dev with zero credentials and render correctly with sapphire tokens
- [ ] emas-pos consumes the registry for its admin app (via kongmy-stack) and deletes its parallel `theme.css` + `packages/ui`
- [ ] npm lane consumers observe zero change
