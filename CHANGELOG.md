# Changelog

## 3.0.3 — 2026-10-17

3.0.1 and 3.0.2 reached GitHub Packages only, so this is the first npm release since
3.0.0 and carries their changes too. The API and exports are unchanged from 3.0.0.

### Distribution

- **npm only.** The package is no longer published to GitHub Packages. If your `.npmrc`
  has `@kongmy-dev:registry=https://npm.pkg.github.com`, remove that line so the package
  resolves from npm.
- Releases are published from `v*` tags: CI runs the full suite, then npm trusted
  publishing releases the package with no stored token.

### Fixes

- **`react-resizable-panels` is no longer bundled.** The build inlined it into
  `dist/node_modules/react-resizable-panels/` (about 42 kB ESM and 32 kB CJS), so
  `SplitLayout` ran a private copy. It now imports the copy your app installs. It is a
  required peer dependency; install it yourself if your package manager does not add peers.
- **Peer ranges include what is tested.** `react` and `react-dom` take `^19.2.0` and
  `react-resizable-panels` takes `^4.11.2`, as in 3.0.0. The `^19.3.0` and `^4.14.4` of
  3.0.2 excluded the React 19.2.7 and panels 4.12.2 the suite runs on.

### Tooling

- `react`, `react-dom` and `react-resizable-panels` are devDependencies, pinned to 19.2.7,
  19.2.7 and 4.12.2, so CI installs the peers it declares.

## 3.0.2 — 2026-10-12

### Dependencies & Tooling

- Adopt `react-day-picker` v10 (PR #8) with updated `month_grid` class mapping in `registry/blocks/calendar.tsx`.
- Bump peerDependencies (`react`, `react-dom` to `^19.3.0`, `react-resizable-panels` to `^4.14.4`).
- Bump devDependencies to latest stable (`@radix-ui/*`, `@testing-library/*`, `@types/*`, `lucide-react`, `tailwindcss`, `vite`, `vite-plugin-dts`, `wrangler`).
- Defer breaking upgrades: `@tanstack/react-table` (held at `^8.21.3`), `typescript` (held at `6`), `vitest` (held at `^4.1.11`), and `jsdom` (held at `^29.1.1`).

## 3.0.1 — 2026-10-12

### Tooling

- Bumps `@testing-library/jest-dom` to `^7.0.0` (PR #9).

## 3.0.0 — 2026-07-13

Architecture release: adds a second distribution lane (a shadcn-format **registry**
on design.kongmy.dev) alongside the existing npm package. **No breaking API or
export changes** — the npm lane's `dist/` is API-compatible; existing consumers
need no migration. The major version signals the architecture shift, not a break.

### Registry lane (new)

- **shadcn-format registry** — vendor Sapphire source into any Tailwind v4 app
  with `shadcn add` from `design.kongmy.dev/r/{name}.json`, no credentials. 34
  items: a `theme` token item, 26 primitives, and 7 admin blocks (Toaster,
  Command, Combobox, Calendar, Sidebar, DataTable column-header + view-options).
- **shadcn-canonical tokens.** `theme.css` now defines shadcn's semantic token
  vocabulary (`--color-background`, `--color-muted-foreground`, `--color-card`,
  `--color-sidebar-*`, `--color-chart-*`, …) as first-class aliases onto the
  brand tokens — shipped to **both** lanes (additive). Sapphire components and
  community shadcn items now share one token vocabulary; brand-only tokens
  (`--color-accent-text`, `--radius-btn`, the on-dark family) remain as an
  extension. Product components migrated to shadcn utility names where a
  value-identical equivalent exists (rendering unchanged).

### Behavior changes

- **`cn()` font-size conflicts now resolve later-class-wins.** Via the
  `tailwind-merge` upgrade, `cn('text-lg text-sm')` now returns `'text-sm'`
  (previously `'text-lg'`). This aligns with tailwind-merge's documented
  conflict resolution; only affects call sites that passed conflicting
  `text-{size}` utilities in one string.

### Tooling

- Linting/formatting migrated from ESLint + Stylelint to **Biome** (single
  toolchain, TS/TSX + CSS). The `@kongmy-dev/sapphire-ui/stylelint` export is
  retained unchanged for consumers.
- All dependencies refreshed to latest (TypeScript held at 6.x; 7.0 pending
  `vite-plugin-dts` support for the native compiler).
- CI now gates the Playwright a11y suite and runs on pushes to `master`.

## 2.0.0 — 2026-06-10

Design-system overhaul focused on usability, extensibility, and parity across
the three export layers (CSS → Web Components → React).

### Breaking changes

- **NativeSelect** defaults to `variant="default"` (light surface) instead of
  `variant="dark"`, matching Input/Textarea. Pass `variant="dark"` explicitly
  on navy surfaces. Its `size` prop is now the visual size variant
  (`sm | default | lg`), not the native `<select size>` attribute.
- **Badge** is now a `forwardRef` component. Code that relied on Badge being a
  plain function component (rare) may need adjustment; rendering output at the
  default size is unchanged.

### Token contract (`theme.css`)

- The public `@theme` contract now includes the full **type scale**
  (`--text-display-xl` … `--text-xs`), **line heights** (`--leading-*`), and
  the **4px spacing scale** (`--space-1` … `--space-32`), so Tailwind v4
  consumers can generate utilities from them and plain-CSS consumers can
  override them in one place.
- New `--color-border-strong` token (form-control borders) with a dark-mode
  override; replaces a hard-coded fallback hex in RadioGroup/Checkbox styles.

### CSS layer parity (`style.css`)

- Button classes gained size and variant parity with React: `.btn-xs`,
  `.btn-sm`, `.btn-lg`, `.btn-block`, `.btn-accent`, `.btn-destructive`, plus
  disabled-state styling.
- New `.badge` family mirroring the React Badge variants: `.badge`,
  `.badge-accent`, `.badge-dark`, `.badge-success`, `.badge-error`,
  `.badge-warning`, `.badge-info`.
- New card modifiers: `.card-compact` (tighter padding) and `.card-static`
  (no hover lift).
- New `.k-switch--sm` compact switch size.
- Expanded `prefers-reduced-motion` guards to cover buttons, cards, inputs,
  toasts, switches, and header links.
- Replaced remaining hard-coded `#fff` / `white` values with tokens.

### React components

- **Button** — new sizes `xs`, `xl`, `icon-sm`, `icon-lg`; new `fullWidth`
  variant; new `iconPosition="start" | "end"`; icon glyph and loading spinner
  now scale with the button size; `aria-busy` is set while loading.
- **Badge** — `forwardRef` + `asChild` polymorphism; new `size`
  (`sm | default | lg`).
- **Input / Textarea** — new `size` (`sm | default | lg`); `aria-invalid`
  now styles the border/focus shadow with the error color.
- **NativeSelect** — CVA-based with `size` variants and exported
  `nativeSelectVariants`.
- **Select** — `SelectTrigger` gained `size` (`sm | default | lg`) and
  exports `selectTriggerVariants`.
- **Switch (ToggleSwitch)** — new `size="sm"`.
- **Label** — new `size` variants, exports `labelVariants`.
- **Spinner** — CVA-based with `tone` (`current | muted | accent`),
  customizable `label` for screen readers, exports `spinnerVariants`.
- **Skeleton** — CVA-based, `aria-hidden`, exports `skeletonVariants`.
- **Icon** — no longer forces `aria-hidden` when an `aria-label` is passed.
- **Chip** — larger dismiss hit area (without growing the chip footprint),
  `dismissLabel` prop for i18n.
- **Dialog** — close button is a proper 36px touch target with a visible
  focus ring and `closeLabel` prop; content is viewport-safe on small
  screens (`calc(100vw - 2rem)`); ConfirmDialog buttons gained focus rings
  and tokenized fills.
- **Sheet** — larger close button with `closeLabel` prop; `SheetHeader` /
  `SheetFooter` are `forwardRef`; exports `sheetVariants`.
- **MobileNav** — drawer width clamps to `min(280px, 85vw)`; `toggleLabel` /
  `closeLabel` props; close button gained a focus ring; respects reduced
  motion.
- **AdminLayout** — new `contentMaxWidth` prop; sidebar collapse button has
  `aria-expanded`, a visible focus ring, and `expandLabel` / `collapseLabel`
  props.

### Web Components

- **`<sapphire-toast>`** — new `duration` attribute as the default
  auto-dismiss; container is a polite `role="status"` live region.
- **`<sapphire-banner>`** — new `dismiss-label` attribute.
- **`<cookie-banner>`** — all copy is attribute-driven (`heading`,
  `description`, `privacy-url`, `privacy-label`, `accept-label`,
  `decline-label`), injected via `textContent` so values cannot carry markup.

### Docs

- Overview page documents the three-layer architecture and a new
  “Theming & Customization” section (token overrides, Tailwind v4 `theme.css`
  import, `*Variants` composition).
- Buttons, Forms, Data, and Web Components pages updated for the new sizes,
  props, and attributes.
