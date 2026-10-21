# Dependency review

Reviewed against registry stable tags on 2026-10-21. All 33 development packages
have consumers; none is unused. The package has zero runtime dependencies and
retains its four optional peer ranges. Those ranges describe consumer compatibility,
so they are not rewritten as exact development pins.

## Updated pins

| Package | Before | After |
| --- | --- | --- |
| `@axe-core/playwright` | 4.12.1 | 4.14.0 |
| `@biomejs/biome` | 2.5.3 | 2.6.2 |
| `@happy-dom/global-registrator` | 21.0.3 | 21.0.4 |
| `@playwright/test` | 1.61.1 | 1.64.1 |
| `knip` | 6.41.0 | 6.42.1 |
| `lucide-react` | 1.55.0 | 1.61.0 |
| `react` | 19.2.7 | 19.3.1 |
| `react-dom` | 19.2.7 | 19.3.1 |
| `react-resizable-panels` | 4.12.2 | 4.14.8 |
| `shadcn` | 4.22.0 | 4.22.1 |
| `turbo` | 2.11.7 | 2.11.10 |
| `vite` | 8.3.4 | 8.3.5 |
| `wrangler` | 4.149.0 | 4.151.3 |

The other 18 packages already match stable tags. TypeScript and TanStack Table
are the two compatibility holds described in [the backlog](backlog.md).
The [Table migration guide](https://github.com/TanStack/table/blob/main/docs/framework/react/guide/migrating.md)
documents the feature generics that break the existing table blocks.

## Why the retained packages are needed

Knip checks source and script usage. Its explicit exceptions also have consumers:
the three Fontsource packages supply the font files referenced by `css/fonts.css`;
shadcn builds and installs the registry; Tailwind is installed into consumer smokes.
Vite and its Tailwind plugin exercise supported consumer builds.

The standalone Radix Slot is a comparison oracle for the owned Slot implementation.
Radix Icons, TanStack Table, cmdk, DayPicker and Sonner serve registry blocks.
Lucide serves those blocks and component examples. Bun/Node and React type packages
support the compiler targets and tooling; testing packages support DOM, browser and
accessibility checks. Wrangler deploys the docs; Turbo runs the integrated gate.

## Compatibility changes

The registry CLI and package consumer smokes now read development versions from
the manifest. Registry dependency metadata is regenerated from the updated pins.
Biome's migration renames the Tailwind class-order rule; existing block classes
follow that rule's new order. Markdown and YAML retain their prior formatting,
including generated Markdown. Test fixtures use stable component definitions and
the new component-factory correctness check stays enabled. Its calendar finding
has a focus-preservation regression and stable child components. The updated axe
checks also enforce matching visible and accessible names on docs controls.

## Security limitation

Refreshing compatible transitive versions updates `source-map-js` to 1.2.2,
the [patched release](https://github.com/advisories/GHSA-68fv-2mgg-jv7q).
`bun audit --json` still reports `braces` 3.0.3 through shadcn → fast-glob →
micromatch. The [advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
lists no patched version. Exposure is in development registry tooling processing
glob patterns; absence of a shipped runtime dependency does not clear that finding.
No override or replacement with unverified compatibility is applied.
