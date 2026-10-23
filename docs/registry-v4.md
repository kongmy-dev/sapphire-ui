# Registry v5 candidate

The unpublished v5 registry is built at `/r/v5/{name}.json`. The 35 JSON files in
`registry/legacy-r/` are the frozen `/r/` distribution; copy them unchanged into
the site's `/r/` output before writing the v5 subdirectory.
Before a later whole-site deployment, also retain any deployed `/r/v4/` assets;
this checkout does not contain a frozen copy of that distribution.

```sh
bun tooling/registry/generate.ts
bun tooling/registry/build.ts
bun tooling/registry/check.ts
SAPPHIRE_PACKAGE_TARBALL=/absolute/path/sapphire-ui.tgz bun tooling/registry/smoke.ts
```

`REGISTRY_V5_OUT` selects the build/check output, defaulting to `dist-docs/r/v5`.
The source registry includes generated metadata. The build wrapper stages its
physical source files because shadcn's included registry paths cannot traverse
parent directories and the CLI reads file contents from disk. It runs pinned
`shadcn@4.22.1 build` and `registry validate`, then rewrites source imports to
consumer aliases. It never rebuilds or rewrites the legacy distribution.

Repository commands run the installed CLI with Bun, preserving the local
`braces` dependency patch. Ephemeral CLI installs in consumer applications do not
inherit this repository's patch; see [the tooling patch decision](adr/0009-bounded-development-globs.md).

The base has `extends: none`, installs the exact Sapphire package, imports only
`foundations.css`, and installs `.claude/skills/sapphire/SKILL.md`. Foundations
includes the bundled font files and font faces; no extra font package is needed.
Each vendored component imports its own installed CSS. Dependencies use exact
versions from the development manifest. Transitive components are registry
items; private implementation files, including Slot, travel with their owner.

Initialize an existing Vite/Tailwind application using the base URL, then map
`@sapphire` to `https://design.kongmy.dev/r/v5/{name}.json` in the `registries`
object of `components.json`. Add components with the pinned CLI:

```sh
bunx --bun shadcn@4.22.1 init https://design.kongmy.dev/r/v5/base.json --yes
bunx --bun shadcn@4.22.1 add @sapphire/button @sapphire/dialog @sapphire/sidebar
```

The smoke creates a temporary Vite application and invokes the real CLI for
both commands. Before publication it resolves the exact package through a
local tarball override, while the registry still declares `5.0.0`. It checks
strict types and builds a customized vendored Button beside a package Card,
with both CSS import orders. A synthetic compatible `5.0.1` tarball changes
package Button CSS; the smoke verifies that customization survives and the
unimported package Button CSS stays outside the application bundle. This is a
build and ownership test, not a browser screenshot assertion or a published
package upgrade. Set `SAPPHIRE_REGISTRY_URL` to the deployed URL template to
repeat installation against production after deployment.

The data-table blocks use TanStack Table 9. Use `useTable` with explicitly
registered features and sorting/pagination row models:

```ts
const features = tableFeatures({
  rowSortingFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
});
```

Supply a `sortFn` on sortable columns or register the matching sort function.
The header consumes sorting and hiding capabilities; the view menu consumes
visibility-capable accessor columns. Additional table features remain supported.
The consumer smoke installs the table recipe and both controls and exercises these types with an extra
column-ordering feature. Follow the [upstream migration guide](https://github.com/TanStack/table/blob/main/docs/framework/react/guide/migrating.md)
when updating an existing version 8 table.
