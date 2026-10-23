---
name: sapphire
description: Consume Sapphire through npm or owned registry source.
---

# Sapphire

Use Bun. Install the matching major-version registry base before adding `@sapphire` items.
The base installs Sapphire at an exact version, imports the foundations stylesheet,
and bundles the fonts; no Google Fonts or icon font request is needed.

## Choose one owner per component

- Package-only apps may import `@kongmy-dev/sapphire-ui/sapphire.css` once.
- Mixed apps import `@kongmy-dev/sapphire-ui/foundations.css` once.
- Package components use their own subpath and CSS, for example
  `@kongmy-dev/sapphire-ui/card` and `@kongmy-dev/sapphire-ui/card.css`.
- Vendored components use the installed local source and local CSS.
  Remove both the corresponding package JavaScript import and package CSS.
- Never use the full stylesheet in a mixed app: it restores duplicate owners.
- Registry dependency items install their own CSS and required helpers.
- Keep the installed foundations within each item's declared compatible range.

## Edit owned source

The local component and its local stylesheet are yours. Keep `sp-*` part classes
and `data-*` variants together. Keep styles separate from JavaScript. Use tokens
from foundations; use `--brand-text` for readable gold text and `--brand` for decoration.
Use solid fills. Preserve keyboard focus and reduced motion.

Product headings are sans-serif; opt into `data-typography="editorial"` for serif display type.
Use `--primary` with `--primary-foreground` for actions, `--brand-navy` for fixed navy.
Let AdminLayout own desktop/mobile navigation. Compose PageHeader and FormSection;
put FormField render-child controlProps on the actual compound-control trigger.

Set `data-theme="light"` or `data-theme="dark"` on the document element.
React and Radix are optional package peers; install the exact dependencies listed
by the registry items you select. A vendored copy receives fixes only when you
review and reinstall it. Run typecheck, build, keyboard and accessibility checks
after edits and compatible foundations updates.

Override colours on the full theme scope list, not only the root:
`:root, [data-theme="light"], [data-theme="dark"], .dark`.
The catalogue at https://design.kongmy.dev shows live named examples, source,
public imports and HTML snippets. Installed declarations define accepted props.
