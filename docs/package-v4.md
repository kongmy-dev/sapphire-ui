# Package contract

For an existing v3 app, follow the concise [agent migration guide](migrate-v3-v4.md).
For an existing 4.0 app, also follow [4.1 migration](migrate-v4-1.md).

The package is ESM-only and has no root JavaScript barrel. Import a component from its
named subpath, such as `@kongmy-dev/sapphire-ui/button`. CommonJS `require` is unsupported.
`bun run generate:package` discovers the component, hook and six native-element entrypoints
and writes an exact export map. Exact entries prevent a wildcard from exposing implementation
files, nested paths, tests or examples. Declarations reference internal emitted modules through
relative imports; those modules are not package subpaths.

## Styles and fonts

Choose one style ownership model:

- An app using package components throughout imports `@kongmy-dev/sapphire-ui/sapphire.css`.
  `style.css` is a compatibility alias for the same stylesheet. The old `theme.css`
  entry is replaced by foundations; the package no longer exports a Stylelint configuration.
- A mixed app imports `@kongmy-dev/sapphire-ui/foundations.css`, then imports only the
  component stylesheets it gets from the package, such as `button.css` and `dialog.css`.
  A vendored component owns its own stylesheet and does not also import the package copy.

Foundations contains layer order, selected fonts, tokens, base element rules and layout
primitives. It contains no component stylesheet. Component CSS repeats the same layer-order
statement so import order cannot redefine the order of cascade layers. Do not combine the
full stylesheet with foundations and individual component styles in a mixed app.

Fonts are copied into `dist/fonts/`, and every emitted font URL is relative to its stylesheet.
The package includes Latin and Latin Extended variable fonts from the three selected families.
Font licenses accompany the redistributed files. A consumer needs no font package dependency. `fonts.css` supports a font-only import;
`tailwind.css` exposes the token mapping to a consumer's Tailwind compiler.

## Runtime entrypoints

React, React DOM, Radix UI and resizable panels are optional peers. Install only the peers
used by the selected component. Basic Button, Card, Badge and Alert clients require React
and do not load Radix. CSS-only apps and native custom elements require none of these peers.
The library has no runtime dependencies.

App-facing helpers are `theme`, `consent`, `seo-tags` and `hooks/use-*`. `seo-tags` generates
raw metadata without React. Internal slots, modal isolation and analytics transport modules
are not public subpaths. Public API details are available in the emitted declaration files.

Native entries are `elements/analytics`, `elements/banner`, `elements/cookie-banner`,
`elements/site-header`, `elements/site-footer` and `elements/toast`. Importing an entry in a
browser registers its existing tag. Cookie banner retains the `cookie-banner` tag; the other
five tags retain their `sapphire-` prefix. Bare imports are side effects and must not be
removed by a consumer bundler. Module imports are safe on a server, where the exported
constructor is explicitly undefined. Construct instances only in a browser. The lazy factory
constructor declarations expose the actual public methods and lifecycle callbacks while
keeping private fields out of the emitted API.

## Build and checks

`bun run build` emits file-for-file ESM and declarations with TypeScript, then bundles CSS
with Bun and copies fonts. Examples, tests and test-support directories are excluded. A
successful build replaces `dist` atomically; previous output is preserved under
`node_modules/.cache/sapphire-package/` instead of deleting another build's files.

`bun run api-check` compares the current declaration graph, selectors, custom-property names
and generated public export map against `tooling/package/api-snapshot.json`. The declaration
graph includes relative internal type dependencies so a change behind an imported public
props type cannot evade the check. Intentional changes need a greater package version,
meaningful notes under that version in `CHANGELOG.md`, `bun run generate:package` and
`bun run api:snapshot`. Commit the reviewed snapshot. The gate compares against HEAD or its
parent to catch a manually refreshed snapshot without a version change; CI must fetch at
least the parent commit. Snapshot generation does not modify the version or release notes.

`bun run test:package` builds and packs a tarball, then installs it in separate temporary apps.
It checks CSS with no peers, all native SSR imports without DOM, raw SEO without React,
Button/Card/Badge/Alert server rendering without Radix, side-effect-only native registrations,
exact public export reachability and blocked internals, and a browser bundle using Dialog.
The command prints the tarball and consumer evidence directory and leaves them available
for review. Bun's ESM resolver accepts a `.js` alias for some extensionless public entries;
those aliases still reach the same declared public module and never expose its internals.

No publish or tag occurs in these commands.
