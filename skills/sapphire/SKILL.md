---
name: sapphire
description: Consume Sapphire v4 through npm or owned registry source.
---

# Sapphire v4

Use Bun. Install the v4 registry base before adding `@sapphire` items.
The base installs Sapphire at an exact version, imports `foundations.css`,
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
No gradients except premium buttons. Preserve keyboard focus and reduced motion.

Set `data-theme="light"` or `data-theme="dark"` on the document element.
React and Radix are optional package peers; install the exact dependencies listed
by the registry items you select. A vendored copy receives fixes only when you
review and reinstall it. Run typecheck, build, keyboard and accessibility checks
after edits and compatible foundations updates.
