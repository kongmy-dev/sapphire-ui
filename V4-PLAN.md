# Sapphire UI v4 — plan

**Status:** Implementation authorized through P11, with at most two GPT-6.1 Sol subagents.
P8 is reopened: the owner rejected the removed navigation and reduced foundation/API content.
P11 is held pending documentation acceptance; migration tooling is complete.
The v4-only visual suite passes 748 zero-tolerance cases; all 1,626 remote browser checks pass
with 161 files checked by accessibility coverage. The first push and automated documentation deployment
are complete. Remote accessibility at `462d75b` passes all 1,626 browser checks; remote quality at `2dd34fe` passes; all fourteen native-control baseline changes are owner-approved and local visuals pass all 748 cases;
the v4 tag, publication and published-consumer verification remain.
D5 retains button widths while reducing height and applies the approved targeted polish.
Delete this file when 4.0.0 ships.

### Current execution checkpoint

- Documentation restores visual colours, font families and type scale, spacing, shape,
  elevation and hook references. Current token values supply the specimens. Component pages
  show supported props from the public TypeScript signatures, with grouped platform props,
  local defaults and separate compound-component APIs. Native pages list attributes, methods
  and events; CSS-only pages describe HTML parts. Full implementation/example source listings
  are removed. Side-by-side v3/revised-v4 screenshots and a local preview remain for owner review;
  documentation acceptance, production deployment, tagging and publication stay held.

- Owner requested the remote accessibility correction and a separately published migration
  comparison. Documentation acceptance, release tagging and npm publication stay owner-gated.
  The three Linux WebKit failures pair inherited light text with a browser-selected grey
  native-control background. Shared base CSS now pairs `--foreground` and `--card` for native
  controls; styled components retain their component-layer rules. Timeline hash navigation
  now uses a retrying URL assertion. Five focused Linux WebKit checks pass at `462d75b` with `bunx --no-install playwright test`
  (three originally failing examples plus the native-control regression in both themes).
  A minimal Linux button fixture restores the original reset by a later base-layer override:
  foreground `rgb(241, 245, 249)` over `rgb(192, 192, 192)` fails axe; the fixed background
  `rgb(17, 34, 64)` passes. The fixture is in `site/comparison/sources/linux-native-regression.txt`.
  Full Linux CI at `462d75b` now passes all 1,626 browser checks and the 161-file accessibility coverage gate
  ([run 39524778212](https://github.com/kongmy-dev/sapphire-ui/actions/runs/39524778212)).
  All 1,626 local browser checks pass at `462d75b` (`bun run test:a11y`), including
  six new native-control cases. The owner approved the six bare-button surface/chrome pin
  updates; `bun run pin` updates only those six files. The owner subsequently approved the eight field updates and requested more text-field spacing.
  Dialog, Popover and Sheet examples now reuse Input and Label with 12px label gaps; SplitLayout
  uses Textarea with 16px editor/navigation insets. Runtime CSS and APIs stay unchanged by this
  composition correction. All 24 focused three-engine browser checks and 27 independent unit
  checks pass. The supported pin command updates the eight approved files; the full local visual suite passes all 748 cases. The fresh spacing-change gate passes 18 tasks and 923 tests with zero cache hits.
  Remote quality found one HoverCard async assertion failure: formatting a live DOM object
  can starve its close timer. A primitive count keeps the removal check and timeout intact;
  120 focused local reruns and the fresh 923-test gate pass. Remote quality now passes at `2dd34fe`
  ([run 39527350307](https://github.com/kongmy-dev/sapphire-ui/actions/runs/39527350307)). The concise agent procedure lives in `docs/migrate-v3-v4.md`, linked from `/v3-v4/`,
  which now explains migration value and unlocked capabilities without performance claims.

- Status review at local source `a99658f`: latest observed remote CI is `331ce2e`
  ([run 39397626860](https://github.com/kongmy-dev/sapphire-ui/actions/runs/39397626860)).
  Quality and visual jobs pass; accessibility fails three WebKit dark examples:
  Avatar lifecycle, controlled Checkbox and controlled Popover. Logs report contrast
  failures on bare example buttons; Timeline keyboard navigation is also flaky.
  The run records 1,589 passing cases, three failures and one flaky case. These are
  remote findings, not a reproduced root-cause diagnosis of the local head. npm latest
  remains 3.0.0; no v4 tag or GitHub release was observed. Sidebar acceptance remains open.
  The focused visual/API comparison is available locally at `/v3-v4/`.

- The deployed P8 rewrite incorrectly replaced the left sidebar with a flat catalogue and top links.
  Restore a persistent sidebar with grouped component links, active-page indication, search,
  theme switching and a keyboard-accessible mobile drawer. Keep the approved component polish.
  Show the corrected local preview before another deployment; do not tag or publish while this
  review is pending. Route and accessibility passes did not establish visual acceptance.
  The corrected local candidate passes the integrated gate (915 tests) and all 36 site browser
  checks across Chromium, Firefox and WebKit, including open-drawer accessibility. Desktop
  light/dark and mobile visuals were inspected. Review: `http://localhost:4177/sidebar-review.html`;
  interactive preview: `http://localhost:4179/components/button/`.
- The owner requested light-theme navigation and restoration of overlay search. The sidebar now
  follows the page theme: light surface/navy text in light mode, navy in dark mode. Search opens
  a modal command palette from its launcher or Cmd/Ctrl+K, supports arrows/Enter, empty results,
  Escape and focus restoration, and leaves navigation groups intact. No new dependency or shared
  component styling change. The updated site passes 39 three-engine browser checks, including
  dark-mode contrast, mobile resize and pointer selection; local visual review is complete.

- The owner approved a narrow Bun-only exception for CI `npm publish` so releases can use
  tokenless trusted publishing and provenance. All installs, builds, tests and other tooling
  remain Bun. This exception does not authorize other npm commands.
- P11's integrated gate passes **915 tests**, including **41 migration tests** and **207
  migration assertions**. The CLI previews without writes, skips symlinks/dependencies,
  safely rewrites literals and reports manual work. CHANGELOG migration maps are generated
  and freshness-checked. Settled owner decisions are preserved in ADRs 0001–0005.
- The owner confirmed the npm trusted publisher matches `publish.yaml`. Cloudflare deployment
  is automated from Git; verify its build and live routes after the first push, without local deployment.
- Release candidate `6b80d56` is pushed with the `v3` maintenance branch. GitHub quality,
  packed consumers, production build and Cloudflare deployment pass. Live v4 examples render;
  legacy registry bytes, v4 CORS/cache headers and missing-item 404s are verified. The v3
  maintenance CI passes. The v4 accessibility and arm64 visual jobs are still running.
- Candidate `5b9c75b` passes remote quality and all **748** arm64 visual cases. The first
  candidate differed at 20 comparison pixels on one dark avatar edge; the unchanged pins
  passed the next remote run and 20 focused local captures. No tolerance or styling changed.
- Independent review found and fixed escaped CSS URL delimiters and missing directional
  colour utility migrations in `2acc055`; its integrated gate passes **915 tests**. The final
  remote checkpoint must include these tooling corrections before the release tag.

- All P4 React families, six hooks, app layouts and approved visual polish are integrated.
  All six P5 native elements are integrated. The final post-retirement browser suite passes **1,578 checks**;
  native accessibility/keyboard checks pass **48/48** and React/native class/data equivalence
  passes **36/36**, across all three engines. A further **144** source-site and token-build
  checks pass, including mobile overflow, keyboard skip links and every generated page route.
- The integrated pre-registry gate passed **885 tests** and coverage for **168 runtime/example
  files**. The integrated P10 gate passes 893 tests with the new registry, docs and skill-reference checks. The accepted visual update
  passes **730 cases**; the final v4-only comparison passes **748 cases** at zero pixel tolerance.
- P6 ships 156 exact ESM/type/CSS subpaths, zero runtime dependencies and four optional peers.
  Packed consumer checks pass for CSS-only, native SSR/registration, React without Radix and
  Dialog consumers. P7 builds and validates 33 v4 registry items; real CLI init/add, consumer
  type/build, both CSS import orders and compatible updates preserve vendored customization.
  Thirty-five legacy registry assets are frozen byte-for-byte for the existing /r URLs.
- D5 uses 36px default controls, tighter cards/disclosures/pages/documents and actual 44px coarse
  pointer targets. Button widths retain prior horizontal padding, icon widths and gaps, including
  large and icon-only sizes. Fine/coarse density checks pass in all three engines. A unitless-zero
  border token that invalidated filled-button padding was corrected and is covered by those checks.
- The owner approved targeted polish from `http://localhost:4177/proposal.html`: compact card
  heading rhythm, sans operational card titles, grouped trailing actions and quiet disclosure
  hover. Page/editorial serif typography, navy/gold tokens and button widths remain. The earlier
  density comparison remains at `http://localhost:4177` during this session.
- The owner approved a **24 KiB (24,576-byte) gzip ceiling**. Delivered UI value takes priority
  over marginal byte savings; stop cosmetic micro-optimization while the guardrail passes.
  The current styling is within the approved ceiling.
- Every former parity capture now compares against committed v4 state pins, preserving its
  interactions and capture counts. The state inventory contains **870 pins**; D5 and native pins are updated and representative card/button images reviewed. The reference renderer is retired.
- `useLocalStorage` requires `(key, fallback, parse)`; the parser receives unknown JSON, throwing
  rejects it, and returning undefined is valid when included in T. SSR/initial hydration use the
  fallback; React value/updater setter semantics remain. Migration also records ThemeToggle.asChild
  removal, accent-to-brand, IconMark.filled removal and removal of CVA styling helpers.
- SplitLayout retains `react-resizable-panels` as the fourth optional peer, preserving its full
  sizing/persistence/collapse/imperative contract. Scrollports are keyboard reachable, outer native
  refs retain identity, callback cleanup is preserved and tabIndex updates without duplicate stops.
- Overlapping modal isolation remains active until the last owner closes. Status text and dark
  header brand links pass contrast checks. Consent uses validated native cookies with a session
  fallback, and analytics shares deduplicated SDK ownership between React and native elements;
  withdrawal disables collection but cannot revoke requests already dispatched.
- Native tags, methods, events, slots and node identity are retained. Constructors are undefined
  on server import and concrete classes in browsers; P6 declaration/package smoke covers this
  migration detail. Reconnect, storage dismissal, consent withdrawal, timers and toast bridge
  ownership are tested. Native examples are independently discovered for a11y and visual coverage.
- Shared foundations plus per-component stylesheet ownership is recorded in ADR-0002. Package and
  registry consumers use one implementation per component. If package foundations include font
  assets and faces, the registry base installs that exact package without a redundant font dependency.
- Docker validation uses isolated dependency volumes and memory-backed scratch files. The owner
  cleared unused build cache; unrelated services, volumes and caches remain untouched.

## 1. Where it stands

This records the current execution state, not a release sign-off. The phase descriptions in §5
remain the acceptance criteria; retained v3 code does not count as a v4 implementation.

| Phase | Current position and evidence |
|---|---|
| P0 — safety and decisions | Local `v3` branch exists with the build peer/external fix. Both branches have tag-only publishing, CI as a prerequisite and OIDC permission. Five ADRs exist in `docs/adr/`; spike outcomes and owner decisions are in §9. The owner confirmed npm trusted-publisher configuration for `publish.yaml`; a real publication is unverified; P11 still owns release execution |
| P1 — gates and pins | Bun and devDependencies are pinned; Dependabot uses Bun. Strict `tsconfig.base.json`, Biome, knip, gate regression tests, scorecard and container pin tooling exist. `src/` remains frozen. The current gate passes; it measures the active lane rather than claiming the retained v3 debt is gone |
| P2 — tokens | `css/tokens.css`, `css/tailwind.css` and `DESIGN.md` exist; token mappings and design tables are enforced. `tests/tokens.spec.ts` exercises source, Bun, Vite and Tailwind builds, nested scopes and overrides in three engines |
| P3 — CSS contract | Complete: 69 component stylesheets, 70 plain-HTML specimen pages and 65 reference sections. The three elements documentation sections await P5/P8. The v3 parity renderer remains until P9 |
| P4 — React | Complete: all families, hooks and layouts, approved D5 polish, browser checks and zero-tolerance visual comparison pass |
| P5 — elements | Complete: six native elements with passing lifecycle, SSR, equivalence, keyboard, accessibility and visual coverage |
| P6 — package | Integrated: 156 generated exact exports, ESM/declarations, zero runtime dependencies, four optional peers and passing packed consumer smoke |
| P7 — registry | Integrated: 33 v4 items, seven ported blocks, frozen legacy URLs and passing real CLI/mixed ownership smoke. Integrated gate and production build pass; deployed smoke remains P11 |
| P8 — site | Reopened for navigation and content depth. Sidebar, visual foundations and supported component APIs are restored in the local review preview; documentation acceptance and production deployment remain held |
| P9 — retirement | Complete: v3 runtime/build removed, historical migration facts and legacy registry retained, interaction inventory preserved. Current size limits retained by owner approval; measured p95 is 4/34/211/5. Package dry run lists only allowed files, then stops for missing local publish credentials; packed consumer checks pass |
| P10 — docs | Complete: CLAUDE is 84 lines, consumer skill 40 lines; consolidated guidance, docs and skill-reference gates pass. Release migration notes remain P11 |
| P11 — release | Migration tooling, generated release maps, local gates and consumer smoke complete. Trusted publisher confirmed by owner. Remote accessibility passes at `462d75b` and quality at `2dd34fe`; candidate `5967f10` has six passing checks and one pending. Documentation acceptance, fresh remote verification of the final candidate, v4 tag, publication and published-package smoke remain |

### P3 completion checkpoint

1. Cookie-banner and icon-mark CSS and specimens are implemented. The class-map regression now
   checks every class declared by `src/index.css`, including explicit reasons for unmapped classes.
2. `sp-icon` and the Lucide specimen sweep are implemented. The current tree has 69 component
   stylesheets and 70 specimen pages taking over 65 reference sections. Only the three `elements/*`
   documentation sections await P5/P8. Preserve the v3 renderer until P9 covers every parity state.
3. The gate passes 246 tests, strict specimen accessibility passes 420 checks and the integrated
   container visual/parity suite passes 412 checks. The full CSS is 23,762 bytes gzipped against
   the unchanged 23,765-byte ceiling. P3 is closed; P4 starts from this verified baseline.
4. Persistent dependency caching passes cold and warm validation. Scratch files remain in memory;
   the runner never performs recursive ownership changes or clears shared caches.

P4 corrects tab-panel focus, keyboard access to bar-chart values, margin-note focus/overlap,
toc truncation, prose markers/spacing and financial-header consistency.
P4's browser checks now verify the shared dark-card heading and paragraph contrast correction.
Success and warning text on tinted page backgrounds now uses darker semantic tokens;
the integrated accessibility run passes. Affected visual pins await the D5 review.
Vertical-slider geometry and the multiple-select chevron are corrected, with browser geometry
checks. Their accepted visual states must be captured before P4 closes. Static CSS and axe
checks alone do not close those behaviour and layout gaps. Fix each defect when its component is
next touched, in the shared CSS or behaviour that owns it, with a regression check and reviewed
pin where the look changes. They are not a separate prerequisite to closing P3; none carries into
the release merely to preserve v3 parity.

## 2. Target

The CSS contract is the design system. React components and custom elements are its clients.

```
css/tokens.css        shadcn variable names + brand extension; colours via color-scheme + light-dark(), per scope
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
  elements and `DESIGN.md`, ESM only. The peers `react`, `react-dom`, `radix-ui` and `react-resizable-panels` are all
  optional: a CSS-only app installs none of them, and a component without behaviour (button, card,
  badge, alert…) imports no Radix, since its `asChild` uses the slot in `lib/`, so an app that uses
  only those installs no `radix-ui`. The registry serves
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
| D1 | **The CSS contract comes first; React renders it** | HTML, server-rendered pages and React share one visual contract. The smallest React: no CVA, no utility strings. Component variables give deep theming; utilities still override by layer order |
| D2 | **npm to use, registry to own** | A fix reaches an app when its owner updates; an app that must change a component's structure vendors it. Both channels build from one source; installed copies still need the style ownership and version rules below |
| D3 | **Lucide is the one icon system** | shadcn's default and already in the blocks. SVG needs no font request and works under a strict CSP and on a server |
| D4 | **Every component is ported,** the custom elements, Analytics, CookieBanner, SEOHead and the editorial layouts included | The owner's call: v4 loses nothing |
| D5 | **Tidy everywhere, preserving the theme** | The owner selected tighter proportions across product and editorial surfaces, including buttons and other controls. Reduce excessive whitespace and oversized affordances; retain navy, gold, the existing typefaces and accessible contrast |

Alternatives weighed, for the ADRs: D1 — React first with CSS generated by `@apply` (30%), keep both
with parity tests (15%). D2 — registry only with npm as CSS (25%), npm only (20%). D3 — Material
Symbols as SVG (30%), keep the font (20%). D4 — cut what no app uses (60%), cut but keep the
editorial React (30%).

**What D3 does to D4:** a name-based `Icon` would bundle every Lucide icon, so `Icon` ports as the
`sp-icon` class, and a prop that took an icon name (`icon="add"`) takes an icon element instead.

### Adoption and review decisions

- **The owner is the only consumer and decides when and how to adopt.** Keep the existing phase
  order and package/registry smoke checks. Do not add an early end-to-end consumer milestone,
  a broader framework certification matrix or a mandatory migration rehearsal. The migration
  map and P11 tooling remain planned aids; adoption of an app is not a library release gate.
- **Fix defects as each component is touched.** The known defects below are work to close in the
  affected port, not requirements to reproduce a broken result. Shared CSS fixes reach HTML,
  React and custom elements. Behaviour fixes live in the relevant client and its tests.
- **One component, one style owner: shared foundations plus per-component CSS.** The owner
  selected shared fonts, tokens, base and layout, with each component's styles coming from its
  package or its vendored copy, never both. Keep `sapphire.css` as the all-in-one convenience
  entry. Mixed apps import a foundations entry and individual component stylesheets; a vendored
  component brings its own CSS and removes that component's package CSS and JavaScript imports.
  Importing the full stylesheet in a mixed app is unsupported because it restores duplicate
  ownership. The registry base installs foundations; each item declares its transitive component
  CSS requirements. All entries preserve the same layer order. Keep foundations compatible within
  the v4 contract and declare the supported package range in registry metadata. P7's smoke covers
  a customized vendored component beside an npm component, both import orders and a compatible
  foundations/package update. The CSS budget still measures the full all-in-one entry.
- **Custom-element parity includes behaviour.** P5 covers the six existing elements: analytics,
  banner, cookie banner, toast, site header and site footer. Test browser registration, safe
  server import, connection/disconnection/reconnection, supported attribute updates and public
  events. Test consent and tracker activation through both clients, including withdrawal;
  class/data-attribute equivalence alone cannot prove these contracts.
- **Release metrics describe the public contract.** Enumerate reachable package subpaths and
  reject unintended internals; a small export-map key count is not the goal. Documentation length
  is a cleanup target, never a reason to omit installation, customization, behaviour or migration
  information. Keep the CSS ceiling; resolve remaining ports, defect fixes and approved visual
  changes against it before release, with an owner decision for any increase.
- **Reconcile active instructions before P4.** Update the working rules and review skills to
  agree on v4 tokens, data-attribute variants, generated exports and the frozen lane. P10 remains
  the final docs sweep, not the first point at which contradictory instructions are corrected.
- **Keep the first push in P11.** After that push, complete a distinct remote CI stabilization
  checkpoint before tagging: quality, arm64 visual pins, three-engine accessibility and smoke
  jobs all pass on the release candidate. Tagging does not follow a local pass automatically.

### Visual refinement direction

The theme stays: navy, restrained gold, existing light/dark surfaces, Source Sans 3, Newsreader
and JetBrains Mono. The visual problem is spacing and hierarchy, not a need for a new palette.
Refine shared component CSS so all clients receive the same treatment.

**Selected: Tidy everywhere.** Apply tighter spacing and more restrained proportions across
product controls, app layouts, editorial pages and documents. This includes buttons and other
control forms, not only disclosures. The comparison establishes the direction; its illustrative
dimensions are starting points to validate per component, not a blanket replacement token scale.

- Start with disclosure rows, accordion triggers, sidebar groups, cards, form groups and page
  gutters. Use aligned labels, quieter chevrons, consistent control heights and clear grouping;
  avoid stacked padding that separates related content without adding hierarchy.
- Carry the same proportions through buttons (text, icon-only and icon-with-label), inputs,
  selects, textareas, checkboxes, radios, switches, tabs and grouped actions. Align related
  controls by height and baseline; make icon size, label spacing and padding consistent across
  sizes and variants. Keep primary, secondary and destructive actions visually distinct.
- Tighten editorial section gaps, document padding and heading spacing while preserving readable
  body text, line height and line length. Do not make text smaller simply to fit more content.
- Reduce the visible expand/collapse affordance without shrinking its effective hit area. Keep
  the full row operable, keyboard focus clear, expanded state exposed and touch targets usable.
- Keep effective touch targets usable for every control, even where the visible control is
  compact. Check default, hover, focus, active, disabled, loading and invalid states where they
  apply; labels, icons and focus indicators must not clip or collide.
- Review closed and open states, long labels, narrow layouts and both colour schemes. Compare
  a complete settings composition and an editorial reading page, not isolated controls alone.
- During implementation, record the selected rules in `DESIGN.md`, then apply them as affected
  components are touched. Review expected/actual/diff images before updating pins. Approved
  refinements supersede v3 pixel parity only for the named changes; unrelated states stay pinned.

### Settled defaults

- **Radix stays,** through the unified `radix-ui` package. State selectors read both
  `[data-state=open]` and `[data-open]`, so a later move to Base UI touches components only.
  Revisit when a primitive or fix we need ships only in Base UI, or Radix ships nothing for six
  months.
- **Tokens take shadcn's raw names,** mapped by `@theme inline`. Colour tokens are
  `light-dark()` values declared on `:root, [data-theme=light], [data-theme=dark], .dark`, so a
  consumer's build that lowers `light-dark()` cannot pin them at `:root`; every other token is
  declared once on `:root` and does not change with the scheme (ADR-0004). `--accent` takes
  shadcn's meaning, the quiet interactive surface (the gold tint); brand gold becomes `--brand`,
  with `--brand-text` for AA text on light. Reviewed on screenshots in P2. Status-coloured text
  and outlines take `--error-text`, `--success-text`, `--warning-text` and `--info-text` (the
  400 shades in dark), AA on the dark surfaces where the base colours measured 2.06–2.70:1; a
  filled status colour keeps its base token. This changes the dark pins of the
  destructive-outline button, the badges (the table's too), the dialog's danger trigger and the
  stat's change figures; the alert's title and icon and the toast's stripe and icon take them
  too, replacing v3's toast literals no token held. v3's `--toast-accent` becomes `--sp-toast-accent`.
- **`--shadow-lg` mixes its colour with `color-mix()`,** within 6/255 per channel of v3's
  `rgba()`, an invisible difference; the dialog's parity check compares shadow geometry only.
- **Field placeholders are 65% of the text colour,** not v3's 50%, which measured 3.05:1 on
  light; 65% measures 4.56–7.54:1 across the input variants and both schemes. The native select
  keeps `--space-10` clear at its inline end so a long value never runs under the chevron (v3's
  `pr-10` lost to its size padding) and takes the input's `aria-invalid` look, which v3 never
  drew. The forms parity check applies both changes to the v3 side.
- **The switch's custom-accent demo reads `--success`,** not v3's literal `#16a34a`, which no
  token holds; `--switch-off` holds v3's off track. v3's `--switch-active` and `--switch-inactive`
  become `--sp-switch-*` through the map's variable table, and v3's double-hyphen modifiers
  (`.input--dark`, `.k-switch--sm`) map like any other class.
- **A pinned specimen section renders at its v3 page y** (`data-pin-y`), not only at its
  fraction: Chromium antialiased the same radio differently at y 100 and at y 2619.
- **v3's `rgba()` demo literals become `color-mix()` on a token,** even where the result lands
  one level off (the segmented bar's dark remainder, re-pinned). An avatar group stacks earlier
  avatars on top through `:nth-child` for its first eight; pagination never tints a disabled or
  current link on hover, which v3 did for a disabled one.
- **A disabled tab dims to 50% and takes no hover;** v3 drew none. The table's sticky header is
  `data-sticky` on `.sp-table-header`, and its body needs no class. v3's sparkline is a row of
  bars, not SVG, and stays one, its colour per bar through `data-status`. Fix two open defects
  when those components are next touched: the tab panel takes focus without a ring, and the bar
  chart shows its values on pointer hover only.
- **The banner's base is neutral** (`--background`, `--foreground`, `--border`); each status
  variant reads its `-bg`, `-border` and `-text` tokens. v3's `accent` variant is `brand`, a 10%
  and 35% tint of `--brand` with `--brand-text`, and the dismiss hover is a 25% mix of
  `--field-dark`. The code block is light by default and dark through `data-variant=dark`.
- **Disabled toggles take no hover,** which v3 gave them. The accordion opens and closes with a
  height animation that reduced motion drops; v3's docs had none. The breadcrumb gains an
  ellipsis part and its links take the base focus ring. The scroll area's viewport is a labelled
  `role=region` with `tabindex=0`, and the specimens' lint allows that tabindex.
- **Steps and timeline draw their connectors as `::after`.** A step's status is `data-status`
  (done, active, upcoming) with `aria-current="step"` on the active one, and compact steps hide
  the description. The timeline's last item is `data-last` on its indicator, as v3's `isLast`.
  The toc's active link is `aria-current="location"` and its links take the base focus ring,
  where v3 drew the browser's. Fix three defects when those components are next touched: the
  margin note's anchor takes no focus, its wide-screen note overlaps the anchor text, and the toc's two-line clamp
  never truncates.
- **The token gate allows the font-relative `em` and `ch`.** A unit token (`--unit-em: 1em`)
  would pass the gate while constraining nothing, and a font-size variable times a factor cannot
  express a `70ch` measure or `code` at `0.875em` that scales with its heading. px, rem and the
  other absolute units stay banned.
- **Document gold text is `--brand-text`,** where v3 drew `#b8904f` (2.71:1, now 5.44:1); the
  figure's `data-tone=positive|negative` reads `--success-text` and `--error-text`. The document
  bar is sticky only with `data-sticky`. Prose and the document style flow content through
  element selectors and state the preflight resets they rely on. The financial table is
  `data-variant=financial` on the table, with `data-row=section|subtotal|total` and a border on
  every cell. v3's `.bar-row` stays unmapped: a share bar, not the bar chart. Fix four defects
  when those components are next touched: prose lists have no markers, prose paragraphs have no
  gap, the financial table's first header is lighter than the rest, and the dark card's paragraphs are
  dark text on navy.
- **Overlays stack at `z-index: 50`:** the popover, tooltip, hover card, dropdown menu, sheet and
  its overlay. The sheet's scrim is a 50% mix of
  `--primary` blurred by `--space-2`; it opens in 500ms and closes in 300ms, ease-in-out, and its
  title and description take v3's docs values. A destructive menu item is
  `data-variant=destructive` in `--error-text`. The command palette is `.sp-sheet` with
  `.sp-command-palette`, its active item `aria-selected=true` or `data-active`. Open specimens
  skip the entry animation, and the palette's empty state has no `aria-controls`. The tooltip
  stays on its v3 pin for its glyph; the palette has parity only.
- **Page layout primitives live in `css/layout.css`** (stack, cluster, columns, container query,
  page, masthead, sr-only), and the page width is the `--page-width` token. `.sp-columns` drops
  v3's owl margins, so its cells align; `.sp-sr-only` drops `!important`. The layout is a column,
  as the React one is. The mobile nav's drawer sits at `inset: 0 auto 0 0` and is
  `visibility: hidden` when closed; its scrim and shadow mix `--primary`, not black. Gold text on
  a light surface is `--brand-text`: the page section label, the light header's brand suffix and
  the footer group title (`--brand` on dark). Re-pinned: css-utilities (the owl margins), page
  section and light header (the AA gold), and layout (anti-aliasing, one level). The light
  header's hover parity skips pixels: 6 differ by one level.
- **A component variable exists only where something reassigns it or several rules read it.**
  Page layout took the stylesheet to 25,075 bytes gzipped, over the 23,765 ceiling, and the
  `--sp-*` declarations were a third of it. 484 were declared once, read once and never
  reassigned; inlining them measured 21,056 bytes with every pin unchanged. An app overrides such
  a value on the property itself, which its unlayered CSS wins anyway. A number-only `calc()`
  stays in a variable: the minifier folds it to five decimals, 1/64 px off v3. Weighed: inline
  (55%), raise the ceiling past v3's size (30%), split the stylesheet into opt-in entries (15%).
- **App layout is one admin layout, a proposal layout and four app shells.** `.sp-admin-layout`
  holds the sidebar, header and content, plus the page parts a dashboard puts in the content
  column (page head, filters, search, document title with `data-kind`, passphrase chip, row
  actions). The class map renames both generations of v3's admin shell, `.sf-shell` and
  `.sf-admin-shell` alike, onto it. `.sf-btn-ghost` is the outline button and `.sf-btn-quiet`
  the ghost. `.sf-tabs` are pills tabs, and `.modal-mask` and `.modal-head` are the dialog
  overlay and header. Left unmapped, with reasons: `.sf-stat` (v4 nests a stat in a card),
  `.sf-mark` (the document mark or the gate mark, by place), the brand's wordmark and tag, the
  type tag and the top bar spacer. The proposal layout paints no background: v3's `bg-page`
  utility never existed, so its shell is transparent over the page. The passphrase gate hides
  with `data-hidden`; the wizard's mode is `data-mode`. The admin glyphs wait for the icon port.
  The stylesheet measures 23,497 bytes after the two ports, 268 under the ceiling.
- **Where the two implementations disagree, the React look is the starting point.** Named
  defect fixes and owner-approved visual refinements supersede it.
- **Registry v4 is served at `/r/v4/{name}.json`;** `/r/{name}.json` stays the v3 build until each
  app moves.
- **A `v3` branch** is cut from `f6720d3` (3.0.2) for fixes; `master` becomes v4.
- **No comments** in TS, TSX or CSS, JSDoc included: names and unions carry the meaning, and the
  shipped `.d.ts` shows the types. Two forms are allowed. `biome-ignore <rule>: <reason>` silences
  a `style` or `complexity` rule only; a correctness, suspicious, a11y or security finding is
  fixed, never silenced. A workaround for a browser or vendor bug gets a test named for that bug,
  so deleting the workaround fails; where no test can observe the bug, its URL sits alone above
  the workaround.
- **ESM only, one subpath per component** through a `./*` pattern export and no root barrel, so
  importing one component never loads Radix for another.
- **No runtime dependency.** Data attributes replace CVA, `clsx` and tailwind-merge; consent uses
  `document.cookie` instead of `js-cookie`; the components' own glyphs (close, chevron, check) are
  inline SVG, so the package needs no icon dependency. Apps and blocks import `lucide-react`.
- **One repository, no workspaces;** kebab-case files; class prefix `sp-`.
- **Publish to npm only,** public, through npm's trusted publishing from the tag workflow, so no
  token is needed to install or to publish; GitHub Packages goes. That one step runs the npm
  CLI: `bun publish` reads only a token and cannot write provenance (Bun's docs).
- **TypeScript stays on 6.0.x:** 7 has no classic compiler API, which the metrics tool and knip
  need. Bun is pinned.
- **Unit tests** run on `bun test` with happy-dom; a11y and visual specs on Playwright. A unit
  test sees only what an app sees: it imports its component and that component's examples, finds
  elements by role and name, and asserts no snapshot.
- **The look is pinned in one environment.** Pins are rendered and compared only in the Playwright
  container image that matches the pinned `@playwright/test`, on `linux/arm64`: native on an Apple
  Silicon Mac and on CI's `ubuntu-24.04-arm` runner, free for public repositories. Under amd64
  emulation the image's Chromium crashes on launch. One screenshot per example root, at
  zero tolerance (Playwright's default allows 0.2 per pixel). Rendering differs by OS, so a pin
  taken on a laptop never lands.
- **Generated files are committed:** the export map, the stylesheet's import list,
  `registry.json`, the site's navigation and the migration tables. The gate reruns every generator
  and fails on any diff.

## 4. Not building

- CJS output or a root barrel.
- A Base UI variant, a monorepo or a task runner.
- A token pipeline (DTCG, Style Dictionary): CSS variables are the source, and `DESIGN.md` is
  checked against them.
- Storybook or a hosted visual-diff service: the site is the specimen and Playwright is the pin.
- Aliases for v3 class names or props: apps on 3.x stay pinned and migrate with a map.
- `@tanstack/react-table` 9 (backlog).
- A replacement brand theme. D5 selects tighter proportions across product and editorial UI.
  Do not scale every spacing token down globally.
- Progress checkboxes in this file: `bun run scorecard` reads progress from the tree, so parallel
  sessions never edit one shared list.

## 5. Phases

Each phase may span focused commits and closes with `bun run gate` green plus its required
browser and smoke checks. A move is pinned first, moved second and proved third.

**P0 — Make `master` safe, settle the unknowns, decide.**

1. Cut `v3` from `f6720d3` for 3.x fixes. On `v3`, add `react-resizable-panels` to devDeps and to
   the build's externals, and widen each peer range to include the version CI tests. On both
   branches `publish.yml` runs only on a `v*` tag, only after CI passes, and publishes through
   npm's trusted publishing (`id-token: write`, no `NPM_TOKEN`), so a push to `master` never
   publishes and no token can expire. No 3.x release is cut: v4 stays local until P11 releases
   4.0.0 (the owner's call).
2. Run the spikes in §9, each in a throwaway branch or scratch app, and paste each result with its
   SHA. A result that contradicts this file stops the plan before P1.
3. Write the ADRs in `docs/adr/`, each under 1,000 words, each opening with the consumer's code
   (the HTML, the import, the `shadcn add`) before the decision: rules ship with gates and code
   carries no comments; the CSS contract (D1); distribution and registry versions (D2); tokens and
   theming; primitives and icons (D3, D4). Each says what it accepts in exchange for what, and
   lists its weighted alternatives.
4. Delete both old plans. Their vendor traps become assertions where they bite: the registry
   smoke fails if the shadcn CLI sees `REGISTRY_URL`, and the production smoke checks the `/r/*`
   headers.

**P1 — A gate that can be trusted, and a pin.** Every gate prints what it checked and fails when
that is nothing. Each gate has a test that feeds it a real violation from this repository (a stray
comment from `src/`, a hex literal from `src/index.css`, the `.btn` and `<Button>` padding drift)
and expects it to fail, and each failure prints `file:line`, the rule ID and what to write
instead. Until P9 the gates run on the new folders and any change under `src/` fails (P-17); v3
fixes go to the `v3` branch. The gates that guard only `src/` (the old token, CSS-variable,
a11y-coverage and bundle-externals gates) go, since the freeze covers it. A gate whose folders do
not exist yet is built and tested now and joins `bun run gate` in the commit that creates them.
Tests are hermetic: none reads the real `dist/`. Pin Bun (`.bun-version`,
`packageManager`), devDeps exactly (`bunfig.toml`) and TypeScript 6.0.x; Dependabot moves to the
`bun` ecosystem, which updates `bun.lock`. A strict shared `tsconfig.base.json` that covers every
tracked `.ts` file outside `src/`, with `typecheck` in the gate; `src/` keeps its own non-strict
tsconfig until P9, and the v3 registry blocks keep the consumer typecheck until P7 replaces them.
Strict Biome with `--error-on-warnings`. knip. Unit tests move to `bun test`, or to Playwright
where the §9 spike says so; happy-dom, registered in its own preload, arrives with the first test
that needs a DOM. vitest and jsdom go and do not come back. The 21 vitest files under `src/` are deleted: `src/` is frozen,
and `v3` keeps them. `bun run scorecard [sha]` prints §10's numbers and each component's state
(CSS, React, examples, pin, element, registry item) for any commit, measured the same way.
**Pin the look:** Playwright screenshots of every component's demo, light and dark, rendered as §3
says and committed. `bun run pin <example>…` is the only way to change a pin, and it refuses an
empty list.

**P2 — Tokens.** `css/tokens.css` and `css/tailwind.css`: light and dark through `color-scheme` and
`light-dark()` on the per-scope selector list, following `prefers-color-scheme` unless `[data-theme]`
or `.dark` forces one. A test proves every v3 token maps to a v4 token of the same value. A
Playwright spec builds `tokens.css` with the default `bun build` and with Vite's default target, and
proves a dark scope inside a light page and the reverse flip, in Chromium, Firefox and WebKit. `DESIGN.md`, from `design/design.md`, with its token values checked against `tokens.css`.
The token gate joins `bun run gate`.

**P3 — The CSS contract.** `css/base.css` (elements, focus ring, type scale),
`css/layout.css`, and `components/<name>/<name>.css` for every component and pattern: document,
financial table, key-value list, prose, page, masthead and section, stack, cluster, columns, admin
shell. `sapphire.css` declares the layer order Tailwind uses and is bundled and minified by
`bun build`. Fonts: `woff2` from pinned `@fontsource-variable` packages, latin and latin-ext, copied
into `dist/fonts/` and declared in `fonts.css`. Each component's plain-HTML specimen matches its P1
pin; a deliberate difference goes through `bun run pin` and is listed in its commit. A specimen is
`<name>.examples.html` beside its CSS, one `<section data-pin="<route>/<slug>">` per pin it takes
over from the v3 docs; each pin has one renderer, and a section that renders an icon glyph stays on
its v3 pin until the Lucide port. Budget:
gzipped `sapphire.css` at its measured size plus 15%. Button, card and dialog go first and set the
pattern. Then `sapphire-component` is written from those three: the steps, the checks a port must
pass and the files a port must not touch. Every other component is one session that owns only its
folder and does not edit that skill. Each rename lands in `tooling/migrate/map.ts` in the commit
that makes it. The rest go by family, one session each, in this order: forms (input, textarea,
label, native select, form field); forms with state (checkbox, switch, radio group, range slider,
select); feedback (skeleton, spinner, progress, segmented bar, alert, toast, empty); data (avatar,
avatar group, stat, stat group, chip, separator, pagination); data views (tabs, table, bar chart,
sparkline); extended (breadcrumb, kbd, code block, toggle, scroll area, banner, accordion);
editorial (callout, margin note, table of contents, steps, timeline, prose, document, financial
table, key-value list); overlays (popover, tooltip, hover card, dropdown menu, sheet, command
palette); page layout (`css/layout.css` with stack, cluster and columns, container, page section,
layout, masthead and section, site header and footer, mobile nav, theme toggle); app layout (admin
shell, split, wizard, vertical tabs, proposal, passphrase gate); then cookie banner and icon mark.
Then the class sweep: the class-map test checks every class `src/index.css` declares, not only
those of a family the map renames, so each is renamed or listed unmapped with its reason.
Analytics, SEO head and the theme provider draw nothing and get no CSS. Then the icon port:
`sp-icon`, the components' own glyphs as inline SVG, and Lucide in the specimens, so every section
left on its v3 pin for a glyph moves to its specimen through `bun run pin`. The port settles the
button glyph's size: v3's draws at 24px, because the global Material Symbols rule beats the
button's 20px utility.

**P4 — React components.** The active working rules and review skills are reconciled with v4
(§3). Port behaviour against the verified P3 CSS first, starting with Slot, button, card and
dialog, then the component families. Fix behaviour defects in each port. Capture the React
examples and every state currently covered only by v3 parity before a visual refinement
supersedes that comparison; retain its interaction assertions. Then complete a shared CSS
refinement pass for D5 and the known layout/contrast defects, reviewing changed pins without
weakening unchanged states. P4 is not complete until this visual pass is done. P9 still owns
retiring the v3 renderer; its affected-state pinning prerequisite moves earlier where needed.

Execution alternatives: ports then a shared visual pass (70%, selected: consistent component
proportions and reviewable state baselines); density per port (25%, earlier previews but repeated
changes to shared button/card comparisons); defer density to P9 (5%, too late for feedback).
This changes the order within P4, not its scope or acceptance criteria.
`components/<name>/<name>.tsx` for every component: React 19 (`ref` as
a prop), `data-slot`, variants as `as const` tuples rendered as `data-*`, the `sp-*` class plus
`className`, `radix-ui` for behaviour. `<name>.examples.tsx` is the single source for the site, the
a11y and visual specs and the HTML snippet (`renderToStaticMarkup`). `<name>.test.tsx` states
behaviour; coverage is at least 95% of lines and functions, every file counted. The contract gate
holds React and CSS together, and the a11y coverage gate holds every example to its spec. Hooks and helpers move to `hooks/` and `lib/` with their tests. `lib/slot.tsx` replaces Radix's Slot; the admin sidebar link, its one `Slottable` use, composes its children with `cloneElement` instead.

**P5 — Custom elements.** `elements/<name>.ts` renders the same classes as its React twin, defines
itself only in a browser, and has its own a11y specimen. An equivalence test renders each element
and its React twin from the same example and compares their classes and data attributes. The
six-element behaviour inventory and lifecycle, event and consent checks in §3 are required too;
a markup match does not establish functional parity.

**P6 — The package.** Ship the all-in-one stylesheet, a shared foundations entry and individual
component CSS entries from the same sources (§3); no component CSS is bundled into foundations.
`tsc` compiles `components/`, `elements/`, `hooks/` and `lib/` file for file
(ESM and `.d.ts`); `bun build` bundles the CSS. A generated `./*` pattern export that reaches each
folder's entry file and nothing else, so importing an internal fails; enumerate every reachable
subpath from the packed files and test that internals cannot be imported, including nested wildcard
matches. Count actual public subpaths, not export-map keys. Peers are optional, and
`sideEffects` names only the stylesheets and `elements/`. A committed API snapshot (exported
types, CSS selectors, token names) fails on any change that the version and `CHANGELOG.md` do not
carry. Smoke: a temporary app installs the packed tarball and imports only the CSS with no peer
installed; server-renders button, card, badge and alert with React and without `radix-ui`; builds a
page with a dialog.

**P7 — Registry v4.** A source `registry.json` with `include`, built by a pinned `shadcn build` and
checked by `shadcn registry validate`, from the same component folders plus `blocks/`, which move
onto the new components and may use Tailwind utilities for layout. A block using `asChild` ships
`lib/slot` as a registry file. `shadcn build` leaves a bare dependency name bare, so the generator
writes each item's npm dependencies with versions from `package.json`. A `registry:base` item, with
`"extends": "none"` and no `@sapphire/…` dependency, adds the npm package and the font at exact
versions, the foundations stylesheet import, and the consumer skill at `<app>/.claude/skills/sapphire/SKILL.md`.
Serve `/r/v4/`; freeze the current build at `/r/`. Smoke: the pinned real CLI runs `init` with the
base, maps `@sapphire` in `components.json`, and installs button, dialog and sidebar into a
temporary Vite app, which must typecheck and build. Apply the style ownership decision in §3 and
exercise a customized vendored component beside an npm component, both stylesheet import orders
and a package update. The same install smoke targets production after deploy.

**P8 — Site.** `site/` shows, for each component, a live preview in both schemes, its own source,
its npm import and its HTML snippet, plus pages for tokens, layout and prose. It is styled by
`sapphire.css` alone, with no router or sitemap dependency. Deploy is unchanged.

**P9 — Retire the old lane.** Delete `src/`, the library Vite config, `vite-plugin-dts`, the CJS
build, the hand-written exports map, the freeze gate,
`.husky/`, `.lintstagedrc.json`, `design/` and the two unrelated skills under `.agents/`. Set the
size measurements to the new tree's p95 and rewrite
`.quality-baseline.json`. The owner approved retaining the current enforced limits
(cognitive complexity 7, function length 89, file length 474, nesting 5). The new tree's measured
p95 is recorded for visibility; it is not a new blanket threshold. Literal enforcement would
create 96 function-length and 74 complexity findings (overlapping), requiring broad refactoring
solely for metrics. Existing limits remain enforced and cannot be raised. `bun publish --dry-run` lists only `dist/`, `README.md`, `DESIGN.md` and
`LICENSE`. Every `tests/visual/*-parity.spec.ts` reads the v3 docs, so before deleting `src/` P9
gives each state they compare a pin of its own through `bun run pin` (the open dialog and overlays,
hover and focus, and each component no v3 pin covered), then deletes them.

**P10 — Docs.** Docs are written alongside each phase; this step adds the docs and skill-refs gates
and sweeps what is left (§6); contradictory active instructions were already reconciled before P4.

**P11 — Release 4.0.0.** `CHANGELOG.md` carries the migration maps (§8), generated from
`tooling/migrate/map.ts`, and `bun run migrate <app>` applies them. CI runs `bun run gate` and the
a11y, visual and smoke specs. Nothing is pushed before this step, so the first push runs CI over
all of v4 at once: budget a shake-out (the arm64 visual job, the pin image, the three-engine a11y
run) before the tag. `v3`'s `publish.yaml` first gains `--tag v3`, so a 3.x fix never takes
`latest`. The owner adds the trusted publisher on npmjs.com, pushes `master`, then the `v4.0.0`
tag only after the remote CI stabilization checkpoint in §3 passes; `publish.yaml` publishes after
CI passes; then deploy and the production smoke. `bun run scorecard` at `bc2e116` and at the release
commit fills §10.

## 6. Docs after v4

| Doc | Holds |
|---|---|
| `README.md` | what it is, the four ways to use it (classes, Tailwind, npm React, registry), the customisation ladder, links |
| `CLAUDE.md` (`AGENTS.md` links to it) | the rules with their gates, one line each, the only copy (skills cite rule IDs); the working rules; commands; layout; at most 120 lines |
| `DESIGN.md` | brand, tokens (checked), component guidance, UX rules; shipped in the package |
| `CHANGELOG.md` | release notes and migration maps |
| `docs/adr/` | each decision and its critical why |
| `docs/backlog.md` | open work; never a `TODO` in code |
| `SECURITY.md`, `LICENSE` | unchanged |
| Skills | `coding-principles` (with the gate's shape and where knowledge goes), `typescript` (toolchain, compiler, types, edges and tests, under the rules here), `sapphire-component` (add or change a component), `review-code` (the checks no gate makes: root cause or symptom, a second way to do one task, an internal another module can import, a file passing 1,000 lines, a simplification left on the table; run by a session that did not write the change), `refactor-code`, `add-rule`; the consumer skill `skills/sapphire/SKILL.md`, shipped in the package and by the registry into the app's `.claude/skills/sapphire/`. It stays slim: names, types and examples document the components, so it holds only what the code cannot say (one component from one place, the token override selector list, where the examples are), in at most 60 lines |

Deleted: `AI-CODE-QUALITY.md` (its size-gate reasoning moves to the `coding-principles`
reference), both plans, `docs/coding/principles.md` (its table moves into `CLAUDE.md`),
`.claude/instructions/design-system.md` (into `DESIGN.md`), the `sapphire-react`, `sapphire-css`,
`sapphire-testing` and `gate` skills (folded in), `.github/ISSUE_TEMPLATE/`.

## 7. Rules and their gates

| ID | Rule | Gate |
|---|---|---|
| P-1 | No comments in TS, TSX or CSS. `biome-ignore` silences only a `style` or `complexity` rule, with a reason; a vendor bug's URL may sit alone above its workaround when no test can observe the bug | comment gate on every tracked source file, and on each edit |
| P-2 | Dependencies point one way: `css/` imports only `css/`; a component imports React, `radix-ui`, `hooks/`, `lib/` and other components; an element imports only `lib/`; a block imports components and its declared packages; `site/` imports the rest; nothing imports `site/` or `tooling/`; every tracked file is reached | boundary gate |
| P-3 | Types carry the rules: no `any`, no `!`, no `as` but `as const`, `type` over `interface`, variants as `as const` tuples with derived unions, no `enum` | `tsc` strict and Biome (the `as` ban is the `tooling/biome/no-cast.grit` plugin) |
| P-4 | One contract: every variant value has its selector, every selector its value, every class a component or element renders exists, and elements preserve their visual and behavioural contracts | contract gate; element equivalence and behaviour tests |
| P-5 | Tokens only: no colour or length literal outside `tokens.css` (font-relative `em` and `ch` excepted), every `var()` resolves, every token has its Tailwind mapping, `DESIGN.md` matches `tokens.css` | token gate |
| P-6 | Subtract before adding: a new export, file or dependency has its consumer in the same change | knip |
| P-7 | Minimise reader load, at this tree's own p95, lowered only | size gate; Biome `noNestedTernary`, `noUselessElse`, `noParameterAssign` |
| P-8 | Accessible in both schemes: every example passes axe in light and dark, and interactive ones have a keyboard spec | Playwright a11y, with coverage of every example |
| P-9 | The look is pinned: every example matches its committed screenshot with zero differing pixels, rendered in the pinned Playwright container; a pin changes only through `bun run pin`, after the owner has seen the expected, actual and diff images | Playwright visual |
| P-10 | A test states a behaviour and can fail: it reaches its component only through props and the DOM, finds elements by role, and asserts no snapshot; at least 95% of lines and functions, every file counted | `bun test --coverage`, the coverage gate, the boundary gate on test imports |
| P-11 | Docs hold the current position: no history narrated, dates only in `CHANGELOG.md` and ADR status lines, ADRs under 1,000 words, `CLAUDE.md` at most 120 lines, the consumer skill at most 60, every path a skill cites exists, none of the filler words the docs gate lists | docs gate and skill-refs gate |
| P-12 | The toolchain is pinned and the package carries nothing: exact devDeps, `.bun-version`, TypeScript 6.0.x; no runtime dependency, every peer optional; registry items declare versioned dependencies | dependency gate |
| P-13 | The stylesheet has a budget: gzipped `sapphire.css` at most its measured size plus 15% | budget gate |
| P-14 | The public surface is semver: a removed or narrowed prop, class, data attribute or token is a major, and has its entry in `tooling/migrate/map.ts` | API snapshot test |
| P-15 | A gate can fail: each gate's test feeds it a real past violation and expects it to fail; each failure names `file:line`, the rule and the fix | `bun test` over `tooling/gates/` |
| P-16 | Generated files are fresh: rerunning every generator leaves the tree unchanged | generated-files gate |
| P-17 | `src/` is frozen until P9 deletes it: a v3 fix goes to the `v3` branch, v4 work to the new folders | freeze gate |

`CLAUDE.md` also carries the working rules: decide out loud before building; a question that an
experiment can answer gets the experiment, not a question to the owner; a number in a doc or commit
is pasted from a command, with its commit; every other claim says whether it was measured, inferred
or is unverified; a decision is an ADR before it is code; a fix lands wherever its rule applies, in
every component it touches; a correction made twice becomes a gate, and only a judgment call
becomes prose.

## 8. Consumer migration

| App kind | Step to v4 |
|---|---|
| Stylesheet classes (pinned to 3.x) | the class map in `CHANGELOG.md`, e.g. `.btn.btn-primary` → `.sp-button`, `.alert.alert--success` → `.sp-alert[data-variant=success]`, `.fin-table` → `.sp-table[data-variant=financial]` |
| Tailwind theme | `@import "@kongmy-dev/sapphire-ui/tailwind.css"`; utility renames, e.g. `text-accent-text` → `text-brand-text` |
| npm React | the same subpaths, `@kongmy-dev/sapphire-ui/<name>`; the prop map in `CHANGELOG.md`, e.g. `icon="add"` → `<Plus />`; the stylesheet import becomes `sapphire.css`; root imports move to subpaths |
| Registry | nothing until `components.json` points at `/r/v4/{name}.json`; then re-add each item |

`bun run migrate <app>` applies the class and prop maps to an app's HTML, Astro and JSX, and lists
with `file:line` every place it could not rewrite. In an app that installs the package and also
vendors from the registry, each component comes from one place: once a component is vendored, its
package imports go. The consumer skill says so.

## 9. Spikes, and the owner's calls

P0 answers every question that an experiment can settle. Each spike is throwaway; its result is
pasted here with its SHA.

| Question | Spike | Result |
|---|---|---|
| Do utilities and an app's unlayered CSS beat `sp-*`, whichever of `sapphire.css` and Tailwind is imported first? | a scratch Vite and Tailwind 4 app, both import orders | **Yes, when `sapphire.css` opens with `@layer theme, base, components, utilities;`.** 48 of 48 pass: four import orders, dev and build, Chromium, Firefox and WebKit; the line survives `bun build --minify`. Without it, importing `sapphire.css` before Tailwind lets preflight beat `sp-*` in every engine. Measured on stand-in CSS, not the real file. `6868ef2`, `spikes/css-layers/result.txt` |
| Does `light-dark()` survive `bun build` and flip inside a nested `[data-theme]` scope? | build `tokens.css`; screenshot a dark card inside a light page | **Only if the tokens are re-declared per scope; contradicts §2 and P2 as written.** `light-dark()` in custom properties on `:root` alone flips in source CSS, 42 of 42 in Chromium, Firefox and WebKit, but the default `bun build` (same bytes as `--target=browser`) and Vite's default production target lower it to fixed values on `:root`, and nested scopes then fail, 9 of 42. Three forms pass 42 of 42 in all eight build forms: the same `light-dark()` tokens declared on `:root, [data-theme=light], [data-theme=dark], .dark`; `light-dark()` written inside each declaration; plain variables re-declared per scope. `light-dark()` takes only colours: radius, gap, weight and shadow arguments are invalid in all three engines. `588f790`, `spikes/light-dark/result.txt`. **Owner's call:** the first form, colours only (ADR-0004) |
| Can `bun test` with happy-dom run a Radix dialog: portal, focus trap, Escape, outside click? | one dialog suite; where it fails, that suite runs in Playwright | **Yes.** The dialog's portal, name and description, focus entry, Tab wrap, Escape with focus return, overlay press, `aria-hidden` and scroll lock all pass, as do 17 primitives, with no polyfills (happy-dom 21.0.3). 23 tests run in a median 415 ms; `--rerun-each=20` passed 460 of 460. Register happy-dom in its own preload before Testing Library loads; an outside press targets the overlay; nothing has layout, so a position-based drag runs in Playwright. `1f47e8b`, `spikes/happy-dom-radix/result.txt` |
| Can `asChild` work without `radix-ui`, so that button, badge and card import no Radix? | a slot in `lib/` run against Radix Slot's cases: props, handlers, refs and `className` merged | **Yes, with one rewrite.** A 132-line `lib/slot` matches Radix's Slot on all 20 of Radix's own slot tests that use no `Slottable` and on 45 added cases, and merges props identically over 57,600 prop pairs; 159 tests pass, 1,590 of 1,590 over `--rerun-each=10`. It has no `Slottable`; the one use, the admin sidebar link, is rewritten with `cloneElement` and renders identically. Minified with React external: 790 B gzipped against Radix's 1,470 B, and the bundle holds no Radix code. **Corrects §2's reason:** Radix's Slot carries no `"use client"`, so button and badge already render as server components; what `lib/slot` buys is no `radix-ui` install and the bytes. `deb0295`, `spikes/slot/result.txt` |
| Can `shadcn build` emit versioned dependencies, and can a `registry:base` item add the package, the stylesheet import and the fonts? | one base item and one component through `shadcn build`, `shadcn registry validate` and `shadcn add` into a scratch app | **Yes, except the skill's place and the versions.** With shadcn 4.22.0, `shadcn add @sapphire/base` into a Tailwind 4 + Vite app installed `@kongmy-dev/sapphire-ui` and `@fontsource-variable/inter` at the exact versions the item names, added both `@import` lines after `@import 'tailwindcss'` without duplicating them on a re-add, and the app typechecked and built; `validate` passed 16 items. `shadcn build` copies `name@version` verbatim but leaves a bare name bare, and `add` then installs it as `^latest`, so the generator writes the versions from `package.json`. A target `~/…` means the app's root: `../` and absolute targets are refused, so the skill lands at `<app>/.claude/skills/sapphire/SKILL.md`, not in the home directory. A versioned `registry:font` dependency breaks the build; the base pins the font in `dependencies` and imports it through `css`. `shadcn init` with the base merges shadcn's defaults unless it sets `"extends": "none"`, and the base must have no `@sapphire/…` dependency. `b2ca83e`, `spikes/registry/result.txt`. **Owner's call:** the skill installs at the app's level and stays slim, since the code documents itself (P7, §6) |
| Do vendored files land at `@/components/ui/<name>` from the folder layout? | the same scratch app | **Yes.** `components/button/button.tsx` and `button.css`, listed as `registry:ui`, land flat at `src/components/ui/button.tsx` and `button.css`; the CSS import resolves and is bundled. Examples and tests are never vendored unless an item lists them. Files must sit below the `registry.json` that declares them. `b2ca83e` |

Stop and ask the owner when:

- a spike's result contradicts this file;
- a pin cannot match without a visual change this file does not name;
- a strict compiler flag would narrow a public prop type.

## 10. Done means

Measured by `bun run scorecard` over the whole tree. The current column measures the completed
implementation and migration tooling at the release candidate, before remote release verification.

| Measure | Baseline `bc2e116` | Current `64bba24` | Release requirement |
|---|---|---|---|
| Runtime dependencies | 4 | 0 | 0 |
| Required peers | 21 | 0 | 0 |
| Reachable public subpaths | 88 historical export keys | 156, packed and tested | No unintended internals |
| Stray comments | 929 | 0 | 0 |
| Size findings / failing files | 75 / 40 | 0 / 0 | 0 / 0 |
| Markdown lines, excluding `CHANGELOG.md` | 5,303 | 1,837 | Target at most 2,651; complete consumer guidance takes precedence |
| v4 stylesheet, gzipped | Unavailable: baseline build fails | 24,500 bytes | At most 24,576 bytes (owner-approved D5 cap) |

Both columns were measured with `bun run scorecard` at their named commits. The baseline
stylesheet remains unmeasured because its build cannot resolve the resizing dependency; do not
substitute a different revision's CSS as though it were the baseline. The owner approved the
24 KiB ceiling for UI value and accessible touch targets. Current size limits remain enforced;
the improved p95 is recorded in `.quality-baseline.json`, not imposed retroactively.
