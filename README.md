# Sapphire UI

Navy and gold, product and editorial typography, one CSS contract. Use Sapphire as plain HTML
classes, Tailwind tokens, typed React components, or vendored registry source.
Fonts ship with the package. CSS and native elements need no React dependency.

[Catalogue](https://design.kongmy.dev) · [Design](DESIGN.md) ·
[Package contract](docs/package-v4.md) · [Registry](docs/registry-v4.md) ·
[Migration](docs/migrate-v5.md) · [Changelog](CHANGELOG.md)

This checkout prepares the unpublished v5 candidate. The v5 registry commands
below become available after release; current installations follow their
published version's contract.

```sh
bun add @kongmy-dev/sapphire-ui
```

## HTML classes

Import the full stylesheet through your bundler:

```css
@import '@kongmy-dev/sapphire-ui/sapphire.css';
```

```html
<button class="sp-button" data-variant="brand">Save</button>
<article class="sp-card"><h2>Account</h2><p>Shared styles, native markup.</p></article>
```

Use the catalogue's HTML snippets for static markup. A snippet of a React portal
cannot implement its overlay interaction; use its React component or your own behaviour.

## Tailwind tokens

Compile your utilities against Sapphire's token mapping:

```css
@import 'tailwindcss';
@import '@kongmy-dev/sapphire-ui/tailwind.css';
@import '@kongmy-dev/sapphire-ui/sapphire.css';
```

```html
<p class="text-muted-foreground">Quiet copy</p>
```

Utilities override component-layer styles. `--brand` is decorative gold;
`--brand-text` is the token for readable gold text.

## React

Install `react` and `react-dom`. Interactive primitives also use the optional
`radix-ui` peer; SplitLayout uses optional `react-resizable-panels`.

```tsx
import { Button } from '@kongmy-dev/sapphire-ui/button';
import { Card } from '@kongmy-dev/sapphire-ui/card';
import '@kongmy-dev/sapphire-ui/sapphire.css';

export function Account() {
  return <Card><Button variant="brand">Save</Button></Card>;
}
```

Use public subpaths; there is no JavaScript root barrel or CommonJS build.
Icons accept React SVG elements. Basic components do not load Radix.

## Registry

Initialize an existing Vite/Tailwind app with the base and map `@sapphire` to
`https://design.kongmy.dev/r/v5/{name}.json` in `components.json`:

```sh
bunx --bun shadcn@4.22.1 init https://design.kongmy.dev/r/v5/base.json --yes
bunx --bun shadcn@4.22.1 add @sapphire/button @sapphire/dialog @sapphire/sidebar
```

The base imports foundations and bundled fonts. Each vendored component owns
its local CSS. In a mixed app, import `foundations.css` plus only the package
component CSS still in use. Give each component one JavaScript and CSS owner.
The existing `/r/` registry remains frozen; moving to `/r/v5/` is explicit.

## Customization

Use props and data attributes first, then utilities or consumer classes,
then component `--sp-*` variables, then shared token overrides. Vendor a
component when the app needs to own its implementation. Do not load its package
CSS alongside the vendored CSS or combine the full stylesheet with mixed ownership.

Override colours on every theme scope so nested light/dark sections keep working:

```css
:root, [data-theme="light"], [data-theme="dark"], .dark {
  --brand-text: light-dark(var(--primary), var(--on-dark));
}
```

Set `data-theme="light"` or `data-theme="dark"` on a scope. The `theme` helper
exports `initTheme`, `setTheme` and subscriptions; the React `theme-provider`
entry supplies reactive theme preferences. Call initialization in a browser;
importing a module on the server does not initialize a document.

## Native elements

```ts
import '@kongmy-dev/sapphire-ui/elements/toast';
import '@kongmy-dev/sapphire-ui/sapphire.css';
```

Native tags include `sapphire-toast`, `cookie-banner`, `sapphire-analytics`,
`sapphire-banner`, `sapphire-site-header` and `sapphire-site-footer`. Import each
entry to register its tag in a browser. Constructors are undefined during SSR.
See [the package guide](docs/package-v4.md) for lifecycle and import contracts.

[BSD 3-Clause License](LICENSE)
