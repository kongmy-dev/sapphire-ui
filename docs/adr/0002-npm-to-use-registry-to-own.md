# ADR-0002: npm to use, registry to own

**Status:** accepted, 2026-10-18

## What an app writes

An app that uses a component:

```sh
bun add @kongmy-dev/sapphire-ui
```

```tsx
import '@kongmy-dev/sapphire-ui/sapphire.css';
import { Button } from '@kongmy-dev/sapphire-ui/button';
```

An app that must change a component's structure:

```sh
bunx shadcn add @sapphire/button
```

with `components.json` mapping `@sapphire` to `https://design.kongmy.dev/r/v4/{name}.json`.

A CSS-only page writes `<link rel="stylesheet" href=".../sapphire.css">` and the
`sp-*` classes, and installs no peer.

## Context

Measured at `bc2e116`:

- 88 subpath exports, most with ESM, CJS and `.d.ts`; 19 required Radix peers.
  An app that wants only the stylesheet still installs them.
- Of the apps that use Sapphire, 2 use only the stylesheet's classes, 2 import
  React components from npm (one is still on 2.x, one also vendors from the
  registry), and 3 vendor from the registry.
- Every vendored `button`, `badge`, `dialog`, `select` and `table` differs from
  its source by 32 to 287 lines, mostly formatting, so re-pulling a fix is noisy.
- Releases stalled after 3.0.0: npm refused 3.0.1 and 3.0.2 with `404 Not Found
  - PUT` (the token was no longer accepted; inferred), and `publish.yml`
  published whatever `master` held on every push.

## Decision

**One source, two channels.** `components/<name>/` holds a component's CSS,
React source and examples. Both channels build from it.

**npm is for using.** A fix reaches every app with `bun update`.

- ESM only. One subpath per component through a generated `./*` pattern
  export, and no root barrel, so importing one component never loads Radix for
  another.
- No runtime dependency. `react`, `react-dom` and `radix-ui` are optional
  peers; a component without behaviour imports no Radix (ADR-0005), so an
  app that uses only those installs no `radix-ui`.
- The package ships the stylesheets, fonts, React components, custom elements
  and `DESIGN.md`.
- Styles have one owner per component. The all-in-one `sapphire.css` remains
  available for standard consumers. Mixed npm/registry apps import shared
  foundations (fonts, tokens, base and layout), then individual component CSS.
  A vendored component supplies its own CSS; its package CSS and JavaScript
  imports are removed. The full stylesheet is not supported in a mixed app.
  Foundation and component entries preserve the same cascade layer order.

**The registry is for owning.** An app that must change a component's
structure vendors it and owns the copy from then on.

- Served at `/r/v4/{name}.json`; `/r/{name}.json` stays the frozen v3 build
  until each app moves.
- Built by a pinned `shadcn build` and checked by `shadcn registry validate`.
  Each item declares its npm dependencies with versions from `package.json`.
- A `registry:base` item adds the npm package, the foundations import, the fonts
  and the consumer skill, at the app's `.claude/skills/sapphire/`.
- The blocks (sidebar, command, combobox, calendar, toaster, data table) are
  registry-only and may use Tailwind utilities for layout.

**One component, one place.** In an app that installs the package and also
vendors, a vendored component's package imports go, including its CSS. Registry
items include their transitive component styles and declare compatibility with
the shared foundations. The smoke test covers customized local CSS beside an
npm component, both import orders and a compatible package update. The consumer
skill states these rules. The stylesheet budget measures the full convenience
entry so splitting delivery does not hide its cost.

**Publishing is a tag, not a push.** `publish.yml` runs only on a `v*` tag,
only after CI passes, to npm only, through npm's trusted publishing
(`id-token: write`, no `NPM_TOKEN`). GitHub Packages goes. `v3`'s workflow
publishes with `--tag v3`, so a 3.x fix never takes `latest`.

**That one step runs the npm CLI.** Everything else is Bun. `bun publish`
authenticates only with a token (`NPM_CONFIG_TOKEN`, per Bun's docs) and cannot
write provenance; the request is open as oven-sh/bun#15601, and the OIDC
request oven-sh/bun#22423 was closed as its duplicate. Trusted publishing
generates provenance automatically when the npm CLI publishes (GitHub
changelog). Revisit when Bun ships either.

## What we accept in exchange

- **Two channels to keep honest.** The registry smoke installs base, button,
  dialog and sidebar with the pinned real CLI into a scratch app that must
  typecheck and build, before and after deploy; the package smoke installs
  the packed tarball.
- **A vendored copy stops receiving fixes.** That is the point of vendoring; an
  app that wants fixes uses npm.
- **Registry versions are paths, not semver per item.** A breaking registry
  change gets a new path (`/r/v5/`), and the old path stays until its apps move.
- **One CI step breaks the Bun-only rule,** for as long as `bun publish` cannot
  use trusted publishing.

## Alternatives weighed

| Option | Weight | Why not |
|---|---|---|
| **npm to use, registry to own (chosen)** | 55% | — |
| Registry only, with npm shipping only the CSS | 25% | Every fix becomes a re-vendor in every app, and the noisy diffs above say that rarely happens |
| npm only | 20% | Product apps that must diverge (client theming, touch UIs) would fork the package instead |

## Sources

- Bun docs, `bun publish`: authentication through `NPM_CONFIG_TOKEN`.
- oven-sh/bun#15601, "Implement `bun publish --provenance` as in npm": open.
- oven-sh/bun#22423, "bun publish does not support npm OIDC authentication in
  GitHub Actions": closed as a duplicate of #15601.
- GitHub changelog, "npm trusted publishing with OIDC is generally available",
  publication announcement.
