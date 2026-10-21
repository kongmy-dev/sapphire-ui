# Sapphire UI: v3 → v4 agent guide

Scope: migrate one app; preserve its behaviour and content. v4 is a breaking
release. Confirm the approved v4 package or tarball before installing; do not
assume the registry's `latest` tag is v4. Do not publish or tag the library.

## Execute in this order

1. Inspect the app's imports, CSS ownership, native registrations and lockfile.
   Record existing type/build, keyboard and accessibility results. Preserve
   unrelated changes; use Bun for installs and scripts.
2. From the library checkout run `bun run migrate /path/to/app --check`.
   This previews without writes and exits nonzero for pending edits/manual work.
3. Choose stylesheet ownership below, then run `bun run migrate /path/to/app`.
   Review every changed file and `file:line: manual` report. Dynamic expressions,
   spreads, ambiguous classes and removed APIs need human/agent judgment.
4. Make the manual changes below. Re-run check mode; resolve every report.
5. Run the app's types, production build and interaction tests. Check light/dark,
   keyboard/focus, overlays, native reconnects and consent where used. Review
   screenshots; do not overwrite accepted pins merely to make tests green.
6. Commit only owned files. Report tests, remaining manual work and the exact
   package version/tarball used. A clean migration scan is not app acceptance.

## Choose one CSS owner per component

- Package-only: import `@kongmy-dev/sapphire-ui/sapphire.css` once.
  `style.css` remains an alias. Do not add foundations/component CSS as well.
- Mixed/vendored: import `foundations.css` once. Package components import their
  own `button.css`, etc.; vendored components import only their local CSS.
  Never import the full stylesheet in this mode. Keep `sp-*` parts and their
  `data-*` variants together. Foundations includes fonts; no font package needed.

## Required changes

| v3 | v4 / action |
| --- | --- |
| Root JS import / CommonJS | ESM named subpaths: `@kongmy-dev/sapphire-ui/button` |
| `theme.css` | Tailwind apps import `tailwind.css`; foundations owns base tokens |
| `--color-accent`, `--color-accent-text` | `--brand`, `--brand-text` |
| `--color-card-bg`, `--color-text-main` | `--card`, `--foreground` |
| `variant="accent"` | `variant="brand"`; check the component's migration map |
| `icon="add"` / font ligatures | React SVG element or inline SVG with `sp-icon` |
| `elements` registration barrel | `elements/banner`, etc.; import only used entries |
| `useLocalStorage(key, fallback)` | Add a parser receiving `unknown`; reject invalid data by throwing |
| CVA styling exports, `IconMark.filled`, `ThemeToggle.asChild` | Removed; compose the supported public API manually |
| Native constructors during SSR | Exports are `undefined` on server; construct only in browser |
| GitHub Packages scope override in `.npmrc` | Remove it for the npm-only v4 release |

Do not mechanically replace v4 `--accent` with gold: it means a quiet interactive
tint. Gold fill is `--brand`; readable gold text on light surfaces is `--brand-text`.
Override colours on `:root, [data-theme="light"], [data-theme="dark"], .dark`, not
only `:root`. Native tags/methods/events stay; React clients use shared CSS directly.

```tsx
import { Button } from '@kongmy-dev/sapphire-ui/button';
import { useLocalStorage } from '@kongmy-dev/sapphire-ui/hooks/use-local-storage';

const [name, setName] = useLocalStorage('name', '', value => {
  if (typeof value !== 'string') throw new Error('Invalid name');
  return value;
});
```

React, React DOM, Radix UI and resizable panels are optional peers; install only
those required by selected components. CSS/native consumers need none of them.
Registry consumers use `/r/v4/{name}.json`; legacy `/r` files remain frozen.
Vendored copies receive fixes only after reviewed updates, not package upgrades.

Use [the full migration maps](https://github.com/kongmy-dev/sapphire-ui/blob/master/CHANGELOG.md),
[package ownership](https://github.com/kongmy-dev/sapphire-ui/blob/master/docs/package-v4.md)
and [registry setup](https://github.com/kongmy-dev/sapphire-ui/blob/master/docs/registry-v4.md) for unresolved details. Respect the owner's
separate documentation acceptance, release-tag and package-publication gates.
