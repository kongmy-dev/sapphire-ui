# Changelog

## 5.0.0 — Unreleased

- Product headings default to sans-serif at 28/18/16px. Set
  `data-typography="editorial"` for the fluid serif scale.
- `--primary` is now a semantic action colour: navy in light mode, gold in dark.
  Use `--brand-navy` with `--on-dark` for permanent navy surfaces. Shadows retain navy.
- Button removes `premium`, `on-dark-primary` and `on-dark-outline`. Use `brand`,
  `brand` and `outline` respectively; set `data-theme="dark"` on dark surfaces.
- AdminLayout owns controlled/default desktop and mobile navigation state.
  Children no longer accept collapse props. A stable header trigger, compact
  tooltips, visible account/brand recipes, groups and modal mobile navigation
  replace the separate collapse controls. Registry Sidebar no longer writes
  cookies or installs a global keyboard shortcut; applications own those policies.
- PageHeader and FormSection reduce repeated page/form markup. FormField render
  children associate compound controls with their labels, help and errors.
  Combobox searches visible labels and forwards trigger/form attributes.
- StatGroup owns the grid; Stat owns its surface. Remove extra Card wrappers.
  Readonly collections and a private shared focus-return helper reduce glue code.
- Document title/icon, passphrase and row-action demo styles leave the shared
  AdminLayout stylesheet. Compose application content with IconMark/Badge/Button.
- The registry adds complete table and layout recipes. Current registry output
  is `/r/v5/`; legacy assets stay frozen. Documentation loads production code and
  example styles for the current component page.

See [the migration guide](docs/migrate-v5.md) for required manual decisions.
This candidate has not been published.

## 4.0.0 — 2026-10-20

3.0.1 and 3.0.2 reached GitHub Packages only, so this is the first npm release since
3.0.0. The migration maps below cover 3.x.

### Package and migration

- ESM-only, file-for-file JavaScript and declarations. Import components through named
  subpaths such as `@kongmy-dev/sapphire-ui/button`; the root barrel and CommonJS exports
  are removed. Internal modules and examples are not public import paths.
- Import `sapphire.css` for all styles, or `foundations.css` plus the component CSS files
  an app owns. Foundations includes the selected fonts, tokens, base and layout only.
  `style.css` remains an alias for the full stylesheet. Font binaries ship in the package.
- React, React DOM, Radix UI and resizable panels are optional peers. CSS and native
  custom elements install without React. Basic React components do not load Radix.
  The package has no runtime dependencies.
- Native elements use `elements/<name>` subpaths. Their exported constructors are
  undefined on the server; import modules safely during SSR and construct elements only
  in a browser. React clients render shared CSS directly rather than wrapping elements.
- App helpers use `theme`, `consent`, `seo-tags` and `hooks/use-*` subpaths. Metadata
  serialization escapes closing-script injection. Analytics waits for consent and
  rejects conflicting simultaneous PostHog configurations.
- Icons accept React SVG elements; string font glyphs and filled-icon options are removed.
  Use Lucide-compatible SVG geometry. `accent` banner styling becomes `brand`.
- The committed API snapshot covers declaration graphs, CSS selectors, custom property
  names and the exact export map; changes require a version increase and release notes.

### Distribution

- **npm only.** The package is no longer published to GitHub Packages. If your `.npmrc`
  has `@kongmy-dev:registry=https://npm.pkg.github.com`, remove that line so the package
  resolves from npm.
- Releases are published from `v*` tags: CI runs the full suite, then npm trusted
  publishing releases the package with no stored token.

### Migrating an app

Run `bun run migrate <app> --check` from the library checkout to preview changes,
then `bun run migrate <app>` to apply literal HTML, Astro, JSX/TSX and CSS mappings.
Review the diff and every `file:line: manual` report. Dynamic expressions, ambiguous
classes, component spreads, storage parsers and removed APIs require manual changes.
The command exits nonzero for unresolved work, and check mode also fails for pending
edits. Dependencies, generated directories and symlinks are skipped. Repeat checks
do not certify that every application-specific usage has been migrated; run the app's
own type, interaction and visual checks before adopting v4.

<!-- sapphire-migration:start -->
### Migration maps

Generated from `tooling/migrate/map.ts`. Review ambiguous class names and manual actions; a selector mapping does not imply a safe replacement in arbitrary text.

#### Classes

| Before | After / action |
|---|---|
| `.icon-mark` | `.sp-icon-mark` |
| `.icon-mark-dark` | `.sp-icon-mark[data-variant=on-dark]` |
| `.tag` | `.sp-badge[data-size=lg]` |
| `.tag-accent` | `.sp-badge[data-variant=brand]` |
| `.tag-dark` | `.sp-badge[data-variant=on-dark]` |
| `.delta` | `.sp-stat-change` |
| `.up` | `.sp-stat-change[data-direction=up]` |
| `.down` | `.sp-stat-change[data-direction=down]` |
| `.published` | `.sp-badge[data-variant=success]` |
| `.draft` | `.sp-badge` |
| `.review` | `.sp-badge[data-variant=warning]` |
| `.x` | `.sp-dialog-close` |
| `.btn` | `.sp-button` |
| `.btn-primary` | `.sp-button` |
| `.btn-outline` | `.sp-button[data-variant=outline]` |
| `.btn-ghost` | `.sp-button[data-variant=ghost]` |
| `.btn-accent` | `.sp-button[data-variant=brand]` |
| `.btn-destructive` | `.sp-button[data-variant=destructive]` |
| `.btn-xs` | `.sp-button[data-size=xs]` |
| `.btn-sm` | `.sp-button[data-size=sm]` |
| `.btn-lg` | `.sp-button[data-size=lg]` |
| `.btn-block` | `.sp-button[data-full-width]` |
| `.badge` | `.sp-badge` |
| `.badge-accent` | `.sp-badge[data-variant=brand]` |
| `.badge-dark` | `.sp-badge[data-variant=on-dark]` |
| `.badge-success` | `.sp-badge[data-variant=success]` |
| `.badge-error` | `.sp-badge[data-variant=error]` |
| `.badge-warning` | `.sp-badge[data-variant=warning]` |
| `.badge-info` | `.sp-badge[data-variant=info]` |
| `.card` | `.sp-card[data-hoverable]` |
| `.card-dark` | `.sp-card[data-variant=dark]` |
| `.card-compact` | `.sp-card[data-padding=compact]` |
| `.card-static` | `.sp-card` |
| `.modal` | `.sp-dialog` |
| `.modal-overlay` | `.sp-dialog-overlay` |
| `.modal-header` | `.sp-dialog-header` |
| `.modal-body` | `.sp-dialog-body` |
| `.modal-footer` | `.sp-dialog-footer` |
| `.modal-mask` | `.sp-dialog-overlay` |
| `.modal-head` | `.sp-dialog-header` |
| `.label` | `.sp-label` |
| `.input` | `.sp-input` |
| `.input--mono` | `.sp-input[data-variant=mono]` |
| `.input--dark` | `.sp-input[data-variant=on-dark]` |
| `.form-group` | `.sp-form-field` |
| `.help-text` | `.sp-form-field-hint` |
| `.help-text--error` | `.sp-form-field-error` |
| `.k-input-dark` | `.sp-input[data-variant=on-dark]` |
| `.k-checkbox` | `.sp-checkbox` |
| `.k-checkbox-indicator` | `.sp-checkbox-indicator` |
| `.k-switch` | `.sp-switch` |
| `.k-switch--sm` | `.sp-switch[data-size=sm]` |
| `.k-switch-thumb` | `.sp-switch-thumb` |
| `.k-slider` | `.sp-range-slider` |
| `.k-slider--light` | `.sp-range-slider[data-variant=light]` |
| `.k-slider-track` | `.sp-range-slider-track` |
| `.k-slider-range` | `.sp-range-slider-range` |
| `.k-slider-thumb` | `.sp-range-slider-thumb` |
| `.skeleton` | `.sp-skeleton` |
| `.skeleton-line--sm` | `.sp-skeleton[data-size=sm]` |
| `.skeleton-line--md` | `.sp-skeleton` |
| `.skeleton-line--lg` | `.sp-skeleton[data-size=lg]` |
| `.skeleton-card` | `.sp-skeleton[data-variant=card]` |
| `.spinner` | `.sp-spinner` |
| `.spinner--sm` | `.sp-spinner[data-size=sm]` |
| `.spinner--lg` | `.sp-spinner[data-size=lg]` |
| `.alert` | `.sp-alert` |
| `.alert--info` | `.sp-alert` |
| `.alert--success` | `.sp-alert[data-variant=success]` |
| `.alert--warning` | `.sp-alert[data-variant=warning]` |
| `.alert--error` | `.sp-alert[data-variant=error]` |
| `.alert--accent` | `.sp-alert[data-variant=brand]` |
| `.empty-state` | `.sp-empty` |
| `.sapphire-toast-container` | `.sp-toast-viewport` |
| `.sapphire-toast` | `.sp-toast` |
| `.sapphire-toast-icon` | `.sp-toast-icon` |
| `.sapphire-toast-message` | `.sp-toast-message` |
| `.sapphire-table` | `.sp-table` |
| `.sapphire-banner` | `.sp-banner` |
| `.sapphire-banner-dismiss` | `.sp-banner-dismiss` |
| `.prose` | `.sp-prose` |
| `.prose-sm` | `.sp-prose[data-size=sm]` |
| `.prose-lg` | `.sp-prose[data-size=lg]` |
| `.doc-shell` | `.sp-document-shell` |
| `.doc-bar` | `.sp-document-bar` |
| `.wm` | `.sp-document-wordmark` |
| `.crumb` | `.sp-document-crumb` |
| `.doc-meta` | `.sp-document-bar-meta` |
| `.doc-hero` | `.sp-document-hero` |
| `.eyebrow` | `.sp-document-eyebrow` |
| `.lede` | `.sp-document-lede` |
| `.meta-row` | `.sp-document-hero-meta` |
| `.doc-section` | `.sp-document-section` |
| `.sec-no` | `.sp-document-section-number` |
| `.doc-card` | `.sp-document-card` |
| `.dark` | `.sp-document-card[data-variant=on-dark]` |
| `.ic` | `.sp-document-card-icon` |
| `.doc-foot` | `.sp-document-foot` |
| `.muted` | `.sp-document-muted` |
| `.rule` | `.sp-document-rule` |
| `.num-pos` | `.sp-document-figure[data-tone=positive]` |
| `.num-neg` | `.sp-document-figure[data-tone=negative]` |
| `.tab-num` | `.sp-document-figure[data-tabular]` |
| `.fin-table` | `.sp-table[data-variant=financial]` |
| `.section` | `.sp-table-row[data-row=section]` |
| `.subtotal` | `.sp-table-row[data-row=subtotal]` |
| `.total` | `.sp-table-row[data-row=total]` |
| `.kvs` | `.sp-key-value-list` |
| `.stack` | `.sp-stack` |
| `.stack-sm` | `.sp-stack[data-size=sm]` |
| `.stack-lg` | `.sp-stack[data-size=lg]` |
| `.stack-xl` | `.sp-stack[data-size=xl]` |
| `.cluster` | `.sp-cluster` |
| `.cq` | `.sp-cq` |
| `.cq-inline` | `.sp-cq` |
| `.cols-2` | `.sp-columns[data-columns=2]` |
| `.cols-3` | `.sp-columns[data-columns=3]` |
| `.page` | `.sp-page` |
| `.masthead` | `.sp-masthead` |
| `.visually-hidden` | `.sp-sr-only` |
| `.sr-only` | `.sp-sr-only` |
| `.visually-hidden-focusable` | `.sp-sr-only-focusable` |
| `.layout-root` | `.sp-layout` |
| `.sidebar` | `.sp-layout-sidebar` |
| `.main-content` | `.sp-layout-main` |
| `.site-header` | `.sp-site-header` |
| `.site-header--sticky` | `.sp-site-header[data-sticky]` |
| `.site-header--light` | `.sp-site-header[data-variant=light]` |
| `.site-header-inner` | `.sp-site-header-inner` |
| `.site-header-brand` | `.sp-site-header-brand` |
| `.site-header-nav` | `.sp-site-header-nav` |
| `.site-header-actions` | `.sp-site-header-actions` |
| `.site-header-link` | `.sp-site-header-link` |
| `.site-header-link--active` | `.sp-site-header-link[aria-current=page]` |
| `.site-footer` | `.sp-site-footer` |
| `.site-footer--light` | `.sp-site-footer[data-variant=light]` |
| `.site-footer-inner` | `.sp-site-footer-inner` |
| `.site-footer-grid` | `.sp-site-footer-grid` |
| `.site-footer-group` | `.sp-site-footer-group` |
| `.site-footer-group-title` | `.sp-site-footer-group-title` |
| `.site-footer-link` | `.sp-site-footer-link` |
| `.site-footer-bottom` | `.sp-site-footer-bottom` |
| `.sf-shell` | `.sp-admin-layout` |
| `.sf-admin-shell` | `.sp-admin-layout` |
| `.sf-side` | `.sp-admin-layout-sidebar` |
| `.sf-admin-sidebar` | `.sp-admin-layout-sidebar` |
| `.sf-main` | `.sp-admin-layout-main` |
| `.sf-admin-main` | `.sp-admin-layout-main` |
| `.sf-topbar` | `.sp-admin-layout-header` |
| `.sf-admin-header` | `.sp-admin-layout-header` |
| `.sf-page` | `.sp-admin-layout-content` |
| `.sf-admin-content` | `.sp-admin-layout-content` |
| `.sf-brand` | `.sp-admin-layout-brand` |
| `.sf-nav` | `.sp-admin-layout-nav` |
| `.sf-count` | `.sp-admin-layout-badge` |
| `.sf-side-foot` | `.sp-admin-layout-sidebar-footer` |
| `.sf-avatar` | `.sp-avatar[data-size=sm]` |
| `.sf-kbd` | `.sp-kbd` |
| `.sf-page-head` | `.sp-admin-layout-page-head` |
| `.sf-sub` | `.sp-admin-layout-page-sub` |
| `.sf-actions` | `.sp-admin-layout-page-actions` |
| `.sf-btn` | `.sp-button` |
| `.sf-btn-primary` | `.sp-button` |
| `.sf-btn-accent` | `.sp-button[data-variant=brand]` |
| `.sf-btn-ghost` | `.sp-button[data-variant=outline]` |
| `.sf-btn-quiet` | `.sp-button[data-variant=ghost]` |
| `.sf-btn-sm` | `.sp-button[data-size=sm]` |
| `.sf-stats` | `.sp-stat-group[data-cols=4]` |
| `.sf-filters` | `.sp-admin-layout-filters` |
| `.sf-tabs` | `.sp-tabs-list[data-variant=pills]` |
| `.sf-tab` | `.sp-tabs-trigger` |
| `.sf-table-wrap` | `.sp-table-container` |
| `.sf-table` | `.sp-table` |
| `.sf-pill` | `.sp-badge` |
| `.gate` | `.sp-passphrase-gate` |
| `.gate-card` | `.sp-passphrase-gate-card` |
| `.gate-brand` | `.sp-passphrase-gate-brand` |
| `.gate-doc` | `.sp-passphrase-gate-document` |
| `.gate-field` | `.sp-passphrase-gate-field` |
| `.gate-submit` | `.sp-passphrase-gate-submit` |
| `.gate-foot` | `.sp-passphrase-gate-foot` |
| `.gate-err` | `.sp-passphrase-gate-error` |
| `.gate-toggle` | `.sp-passphrase-gate-toggle` |
| `.pass-locked-pill` | `.sp-passphrase-gate-pill` |

#### Tokens

| Before | After / action |
|---|---|
| `--color-primary` | `--primary` |
| `--color-primary-hover` | `--primary-hover` |
| `--color-accent` | `--brand` |
| `--color-accent-dark` | `--brand-hover` |
| `--color-accent-text` | `--brand-text` |
| `--color-accent-on-fill` | `--brand-on-fill` |
| `--color-surface` | `--background` |
| `--color-text-main` | `--foreground` |
| `--color-text-strong` | `--foreground-strong` |
| `--color-text-muted` | `--muted-foreground` |
| `--color-text-on-dark` | `--on-dark` |
| `--color-text-on-dark-muted` | `--on-dark-muted` |
| `--color-success` | `--success` |
| `--color-success-bg` | `--success-bg` |
| `--color-success-border` | `--success-border` |
| `--color-error` | `--error` |
| `--color-error-hover` | `--error-hover` |
| `--color-error-ring` | `--error-ring` |
| `--color-error-bg` | `--error-bg` |
| `--color-error-border` | `--error-border` |
| `--color-warning` | `--warning` |
| `--color-warning-bg` | `--warning-bg` |
| `--color-warning-border` | `--warning-border` |
| `--color-info` | `--info` |
| `--color-info-bg` | `--info-bg` |
| `--color-info-border` | `--info-border` |
| `--color-border` | `--border` |
| `--color-border-strong` | `--border-strong` |
| `--color-border-dark` | `--border-dark` |
| `--color-hover-overlay` | `--accent` |
| `--color-focus-ring` | `--ring` |
| `--color-white` | `--white` |
| `--color-card-bg` | `--card` |
| `--color-card-dark-bg` | `--card-dark` |
| `--color-background` | `--background` |
| `--color-foreground` | `--foreground` |
| `--color-card` | `--card` |
| `--color-card-foreground` | `--card-foreground` |
| `--color-popover` | `--popover` |
| `--color-popover-foreground` | `--popover-foreground` |
| `--color-primary-foreground` | `--primary-foreground` |
| `--color-secondary` | `--secondary` |
| `--color-secondary-foreground` | `--secondary-foreground` |
| `--color-muted` | `--muted` |
| `--color-muted-foreground` | `--muted-foreground` |
| `--color-accent-foreground` | `--brand-foreground` |
| `--color-destructive` | `--destructive` |
| `--color-destructive-foreground` | `--destructive-foreground` |
| `--color-success-foreground` | `--success-foreground` |
| `--color-warning-foreground` | `--warning-foreground` |
| `--color-info-foreground` | `--info-foreground` |
| `--color-input` | `--input` |
| `--color-ring` | `--ring` |
| `--color-sidebar` | `--sidebar` |
| `--color-sidebar-foreground` | `--sidebar-foreground` |
| `--color-sidebar-primary` | `--sidebar-primary` |
| `--color-sidebar-primary-foreground` | `--sidebar-primary-foreground` |
| `--color-sidebar-accent` | `--sidebar-accent` |
| `--color-sidebar-accent-foreground` | `--sidebar-accent-foreground` |
| `--color-sidebar-border` | `--sidebar-border` |
| `--color-sidebar-ring` | `--sidebar-ring` |
| `--color-chart-1` | `--chart-1` |
| `--color-chart-2` | `--chart-2` |
| `--color-chart-3` | `--chart-3` |
| `--color-chart-4` | `--chart-4` |
| `--color-chart-5` | `--chart-5` |
| `--radius-lg` | `--radius` |
| `--bg-page` | `--background` |
| `--bg-card` | `--card` |
| `--bg-dark` | `--brand-navy` |
| `--bg-accent` | `--brand` |
| `--fg-primary` | `--foreground` |
| `--fg-secondary` | `--muted-foreground` |
| `--fg-on-dark` | `--on-dark` |
| `--fg-accent` | `--brand` |
| `--interactive-primary` | `--brand` |
| `--interactive-hover` | `--brand-hover` |
| `--interactive-focus` | `--ring` |

#### Component variables

| Before | After / action |
|---|---|
| `--switch-active` | `--sp-switch-active` |
| `--switch-inactive` | `--sp-switch-inactive` |
| `--toast-accent` | `--sp-toast-accent` |
| `--stack-gap` | `--sp-stack-gap` |
| `--cluster-gap` | `--sp-cluster-gap` |
| `--cluster-justify` | `--sp-cluster-justify` |

#### Tailwind colour suffixes

| Before | After / action |
|---|---|
| `accent` | `brand`; retain utility prefix, variants and opacity |
| `accent-dark` | `brand-hover`; retain utility prefix, variants and opacity |
| `accent-text` | `brand-text`; retain utility prefix, variants and opacity |
| `accent-on-fill` | `brand-on-fill`; retain utility prefix, variants and opacity |
| `accent-foreground` | `brand-foreground`; retain utility prefix, variants and opacity |
| `surface` | `background`; retain utility prefix, variants and opacity |
| `text-main` | `foreground`; retain utility prefix, variants and opacity |
| `text-strong` | `foreground-strong`; retain utility prefix, variants and opacity |
| `text-muted` | `muted-foreground`; retain utility prefix, variants and opacity |
| `text-on-dark` | `on-dark`; retain utility prefix, variants and opacity |
| `text-on-dark-muted` | `on-dark-muted`; retain utility prefix, variants and opacity |
| `hover-overlay` | `accent`; retain utility prefix, variants and opacity |
| `focus-ring` | `ring`; retain utility prefix, variants and opacity |
| `card-bg` | `card`; retain utility prefix, variants and opacity |
| `card-dark-bg` | `card-dark`; retain utility prefix, variants and opacity |

#### React prop values

| Before | After / action |
|---|---|
| `IconMark.variant="dark"` | `variant="on-dark"` |
| `Button.variant="accent"` | `variant="brand"` |
| `Button.variant="premium"` | `variant="brand"` |
| `Button.variant="on-dark-primary"` | `variant="brand"` |
| `Button.variant="on-dark-outline"` | `variant="outline"` |
| `Badge.variant="accent"` | `variant="brand"` |
| `Badge.variant="dark"` | `variant="on-dark"` |
| `Chip.variant="accent"` | `variant="brand"` |
| `Input.variant="dark"` | `variant="on-dark"` |
| `Textarea.variant="dark"` | `variant="on-dark"` |
| `NativeSelect.variant="dark"` | `variant="on-dark"` |
| `Alert.variant="accent"` | `variant="brand"` |
| `Spinner.tone="accent"` | `tone="brand"` |
| `Banner.variant="accent"` | `variant="brand"` |

#### Public subpaths

| Before | After / action |
|---|---|
| `toggle-switch` | `switch` |

#### Manual API changes

| Before | After / action |
|---|---|
| `AdminLayout.sidebarCollapsed` | Move state to desktopState="compact" or "expanded" on AdminLayout; remove repeated collapsed props from its children |
| `AdminSidebar.collapsed` | Move collapse state to AdminLayout.desktopState or defaultDesktopState; use brand/footer render children to retain a compact mark or account avatar |
| `AdminSidebar.onToggleCollapse` | Use AdminLayout.onDesktopStateChange; desktop and mobile navigation are independent |
| `AdminSidebarSection.collapsed` | Remove collapsed; navigation state comes from AdminLayout |
| `AdminSidebarLink.collapsed` | Remove collapsed; navigation state and compact tooltips come from AdminLayout |
| `ThemeToggle.asChild` | Remove asChild; ThemeToggle owns its icon children and always renders a button |
| `Icon.name` | Replace font glyph names with a React SVG element; no Icon name registry is exported |
| `Icon.filled` | Filled font glyphs are removed; choose explicit SVG geometry |
| `Button.icon` | Replace a string glyph with a React SVG element |
| `IconMark.icon` | Replace a string glyph with a React SVG element |
| `IconMark.filled` | Filled font glyphs are removed; choose explicit SVG geometry |
| `Badge.icon` | Replace a string glyph with a React SVG element |
| `Chip.icon` | Replace a string glyph with a React SVG element |
| `Alert.icon` | Replace a string glyph with a React SVG element |
| `Banner.icon` | Replace a string glyph with a React SVG element |

#### Manual hook changes

| Before | After / action |
|---|---|
| `useLocalStorage` | Pass an explicit (unknown) => T parser as the third argument; throw to reject invalid stored JSON, and allow undefined only when T includes it |

#### Classes without a direct replacement

| Before | After / action |
|---|---|
| `.sf-search` | Use a labeled Input with type="search"; compose filter layout in the consuming application |
| `.plan` | Document type decoration belongs to application CSS; use a labeled IconMark or Badge instead |
| `.proposal` | Document type decoration belongs to application CSS; use a labeled IconMark or Badge instead |
| `.sf-icon-btn` | Use Button with variant="ghost", an icon size and an accessible label |
| `.doc-title` | Compose document title and metadata in the consuming application; AdminLayout owns only the shell |
| `.dot` | Compose a document icon with IconMark; AdminLayout no longer owns document decoration |
| `.sf-pass` | Compose the passphrase preview and copy action in the consuming application |
| `.dots` | Password preview typography belongs to the consuming application |
| `.sf-row-actions` | Compose labeled Button actions in a Cluster; there is no document row API in AdminLayout |
| `.t-display` | display typography moves to the semantic h2 base rule or consumer utilities using --text-display; no sp-* typography class is shipped |
| `.t-heading` | heading typography moves to the semantic h3 base rule or consumer utilities using --text-heading; no sp-* typography class is shipped |
| `.t-subheading` | subheading typography moves to the semantic h4 base rule or consumer utilities using --text-subheading; no sp-* typography class is shipped |
| `.t-body` | body typography is inherited from the base body and p rules; remove this helper after checking the element context |
| `.t-body-sm` | small muted copy uses consumer CSS with --text-sm and --muted-foreground; the base p rule intentionally stays body-sized |
| `.t-body-lg` | large copy uses consumer CSS with --text-lg; there is no global sp-* type-scale utility |
| `.t-eyebrow` | uppercase tracked labels use --text-xs and consumer CSS; .sp-document-eyebrow has document-specific spacing and is not a general replacement |
| `.t-mono` | monospace copy uses --font-mono and --text-sm in consumer CSS; semantic code also receives component-specific styling |
| `.status-radio` | the enabled/disabled status dot has no standalone v4 component; choose a labelled .sp-badge status instead of retaining a colour-only indicator |
| `.enabled` | a modifier of .status-radio; represent the enabled status in text and choose a badge variant in the consuming markup |
| `.disabled` | a modifier of .status-radio, not the native disabled state; represent the disabled status in text and choose a badge variant |
| `.feature-badge` | a monospace feature pill with different casing and padding from .sp-badge; compose .sp-badge and consumer typography after reviewing its content |
| `.material-symbols-outlined` | font ligature text must be replaced with the corresponding Lucide SVG carrying .sp-icon; a class rename cannot replace its text node |
| `.collapsed` | the admin sidebar collapses with data-collapsed on .sp-admin-layout-sidebar; the class migrator cannot attach a state-only attribute |
| `.is-active` | admin links use aria-current=page and tab triggers use data-state=active; select the attribute from the element role |
| `.who` | the admin sidebar user-name and role wrapper has no public component part; compose consumer markup inside .sp-admin-layout-sidebar-footer |
| `.ct` | a count inside .sf-tab; v4 tab triggers accept composed badge content and have no count-specific part |
| `.archived` | an admin status pill with a special mixed muted fill; use a labelled .sp-badge and review whether its default muted styling is sufficient |
| `.show` | the modal overlay opens with data-state=open on .sp-dialog-overlay; visibility is an attribute state and cannot be migrated as a standalone class |
| `.is-hidden` | a modifier of .gate alone; the passphrase gate hides with data-hidden, an attribute no class stands for |
| `.is-visible` | a toast opens with [data-state=open] or [data-open] on .sp-toast, an attribute no class stands for |
| `.cq-sm` | a container query helper that applies one utility from a width up; Tailwind apps use its @container variants and plain HTML uses .sp-columns[data-from] |
| `.cq-md` | a container query helper that applies one utility from a width up; Tailwind apps use its @container variants and plain HTML uses .sp-columns[data-from] |
| `.cq-lg` | a container query helper that applies one utility from a width up; Tailwind apps use its @container variants and plain HTML uses .sp-columns[data-from] |
| `.locked` | a modifier of the admin shell .sf-pill; inside .doc-bar the pair is .sp-document-pill, a compound the class map cannot express |
| `.bar-row` | a horizontal share bar with a label, a track and a value; the bar chart draws vertical columns, so no part of it fits |
| `.bar` | the track of .bar-row, which has no v4 home (see .bar-row) |
| `.lbl` | the label of .bar-row and of .sf-stat, neither of which one v4 class replaces (see .bar-row and .sf-stat) |
| `.v` | the value of .bar-row and of .sf-stat, neither of which one v4 class replaces (see .bar-row and .sf-stat) |
| `.accent` | the gold fill of a .bar-row track, which has no v4 home (see .bar-row) |
| `.sf-mark` | the brand mark tile; it is .sp-document-mark in the document bar, foot and proposal layout and .sp-passphrase-gate-mark in the gate, so the class map cannot pick one |
| `.sf-wm` | the admin brand wordmark; .sp-admin-layout-brand takes any content and has no wordmark part |
| `.sf-tag` | the version tag in the admin brand; .sp-admin-layout-brand has no tag part |
| `.sf-spacer` | a flex spacer in the top bar; .sp-admin-layout-header spaces its start and end itself |
| `.sf-stat` | a stat in a bordered card; v4 puts .sp-stat inside .sp-card, two elements the class map cannot express |
| `.sf-type-tag` | the document type tag belongs to application content; compose a labeled Badge or IconMark |

<!-- sapphire-migration:end -->

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
