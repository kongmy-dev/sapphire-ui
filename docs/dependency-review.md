# Dependency review

Reviewed against registry stable tags. All 33 development packages
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
| `@tanstack/react-table` | 8.21.3 | 9.3.1 |
| `knip` | 6.41.0 | 6.42.1 |
| `lucide-react` | 1.55.0 | 1.61.0 |
| `react` | 19.2.7 | 19.3.1 |
| `react-dom` | 19.2.7 | 19.3.1 |
| `react-resizable-panels` | 4.12.2 | 4.14.8 |
| `shadcn` | 4.22.0 | 4.22.1 |
| `turbo` | 2.11.7 | 2.11.10 |
| `vite` | 8.3.4 | 8.3.5 |
| `wrangler` | 4.149.0 | 4.151.3 |

The other 18 packages already match stable tags. TypeScript remains on 6.0.3 as
described in [the backlog](backlog.md).
The [Table migration guide](https://github.com/TanStack/table/blob/main/docs/framework/react/guide/migrating.md)
describes the feature APIs used by the migrated table blocks. Their props derive
only the sorting and visibility capabilities they consume, allowing tables with
additional features. The registry smoke installs and compiles both blocks with
a real version 9 table.

## Why the retained packages are needed

Knip checks source and script usage. The three Fontsource packages supply the font
files referenced by `css/fonts.css`; shadcn builds and installs the registry. Their
old dependency exceptions are removed now that Knip resolves those consumers.
Tailwind remains an explicit exception because it is installed into consumer
smokes. The security regression alone may resolve transitive dependencies from
shadcn to test its installed graph. Vite and its Tailwind plugin exercise
supported consumer builds.

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
Chart button names follow the rendered value-then-label order, and the admin
avatar's name includes its visible initials.

The approved visual refresh covers native button borders and textarea resize
grips. Expected, actual and diff review found no content or geometry changes;
zero-tolerance comparisons and the reached-state inventory remain intact.

## Development tooling patch

Refreshing compatible transitive versions updates `source-map-js` to 1.2.2,
the [patched release](https://github.com/advisories/GHSA-68fv-2mgg-jv7q).
`braces` 3.0.3 through shadcn → fast-glob → micromatch now has a checked-in Bun
patch bounding parser nesting and recursive AST walks to 128 levels. Deep input
fails with a diagnostic `SyntaxError`; ordinary expansion, escaping and range
behavior remain covered. Frozen installs reapply the patch. The registry wrapper
runs the installed shadcn entrypoint so an ephemeral CLI cannot bypass it.

`bun audit --json` still reports the package version because the
[advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) lists no patched
release. The local mitigation does not suppress the finding or apply to external
CLI installations. The published package retains zero runtime dependencies.
See [the patch decision](adr/0009-bounded-development-globs.md) for its boundary
and retirement condition.

## Verification

The tooling patch and Table 9 follow-up passed a fresh `bun run gate --force`:
18 tasks, 945 tests and coverage checks across 168 files. `bun run test:release`
passed package and registry consumer installation, compilation and build checks.
The installed table consumer also passed keyboard sorting, visibility, focus
return and open/closed menu accessibility in Chromium, Firefox and WebKit in
both schemes. A disposable `bun install --frozen-lockfile --ignore-scripts`
reapplied the patch and rejected deep input through all four braces entrypoints.
