# Migrating to v4

Work on a committed application branch, then run:

```sh
bun run migrate /absolute/path/to/app --check
bun run migrate /absolute/path/to/app
```

The default command writes supported edits. `--check` leaves files unchanged.
Both commands print unresolved changes as `file:line: manual: ...`; unresolved
work returns a nonzero exit status even when safe edits were applied. Review the
diff and run the application's types, build, keyboard and accessibility checks.
The tool does not install packages, update a lockfile or change registry ownership.

The migrator reads HTML, Astro, JSX/TSX and JavaScript/TypeScript source. It maps
literal class attributes to `sp-*` classes plus data attributes, deduplicates class
names, and maps Tailwind colour suffixes while retaining variants and opacity.
CSS files receive token/custom-property renames outside comments, strings and URLs;
application selectors and arbitrary JavaScript strings are not rewritten.

React prop values are rewritten only for components imported from Sapphire,
including named import aliases. Astro frontmatter imports establish the same
component identity for template props. A same-named local component is untouched.
Static `toggle-switch` imports move to `switch`. Root imports, CommonJS,
font-glyph icons, removed props and ambiguous style/element entrypoints require review.

Dynamic classes/prop values and spreads that could overwrite added data attributes
are reported. Existing conflicting attributes and conflicting legacy modifiers keep
the class list unchanged. Generic class names such as `dark`, `total` and `section`
need component context and remain manual. Symlinks, dependencies, build output and
version-control directories are skipped. Comments and script/style text in HTML
are not treated as markup. Unsupported templating syntax needs manual migration.

The complete generated maps and explicit unmapped reasons are in
[CHANGELOG.md](../CHANGELOG.md). Runtime changes include:

- Import React components from individual public subpaths; remove CommonJS and root-barrel imports.
- Pass React SVG elements to icon props; font glyph strings and filled options are removed.
- Use `brand` for the former gold `accent` variants and `on-dark` where the prop map specifies it.
- Remove `ThemeToggle.asChild`; the toggle owns its icon content and renders a button.
- Replace `theme.css` with the Tailwind mapping or foundations according to the app's pipeline.
- Use individual `elements/<name>` imports; constructors are undefined during SSR.
- Remove the exported Stylelint preset and CVA variant-helper imports.
- Give every mixed package/registry component one source and CSS owner.

See [the package guide](package-v4.md) and [registry guide](registry-v4.md) for
installation, bundled fonts, peer dependencies and compatible style ownership.
