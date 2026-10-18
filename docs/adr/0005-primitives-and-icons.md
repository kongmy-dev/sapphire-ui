# ADR-0005: Radix for behaviour, Lucide for icons, every component ported

**Status:** accepted, 2026-10-18

## What an app writes

```tsx
import { Button } from '@kongmy-dev/sapphire-ui/button';
import { Dialog } from '@kongmy-dev/sapphire-ui/dialog';
import { Plus } from 'lucide-react';

<Button asChild>
  <a href="/invoices/new">
    <Plus aria-hidden />
    New invoice
  </a>
</Button>
```

`Button` imports only React. `Dialog` imports `radix-ui`, which the app installs
when it uses a component with behaviour. A page without React writes the same
classes and puts any SVG inside `sp-icon`:

```html
<span class="sp-icon"><svg aria-hidden="true">…</svg></span>
```

## Context

Measured at `bc2e116`:

- Two icon systems: the primitives use the Material Symbols font (19 files in
  `src/`); the registry blocks import `lucide-react`.
- 54 files use `forwardRef` and `displayName`; Radix is imported package by
  package (`@radix-ui/react-*`), and 19 Radix packages are required peers.
- From a scan of every local app: none uses the custom elements, Analytics,
  CookieBanner, SEOHead or the proposal React components. The CSS-only apps do
  use the document, financial-table, prose, page and admin-shell classes.

Measured by spike 4 (`deb0295`):

- A 132-line `lib/slot` matches Radix's Slot on all 20 of Radix's own slot
  tests that use no `Slottable`, on 45 added cases, and on 57,600 prop pairs.
- Its only `Slottable` use in this repository, the admin sidebar link, renders
  identically when written with `cloneElement`.
- Minified with React external, it is 790 B gzipped against Radix's 1,470 B,
  and its bundle holds no Radix code.
- Radix's Slot carries no `"use client"`: button and badge already render as
  server components with it. The reason to drop it is the install and the
  bytes, not hydration.

## Decision

**Radix stays for behaviour,** through the unified `radix-ui` package, an
optional peer. State selectors read both `[data-state=open]` and `[data-open]`,
so a later move to Base UI touches components only. Revisit when a primitive
or fix we need ships only in Base UI, or when Radix ships nothing for six
months.

**A component without behaviour imports no Radix.** Its `asChild` uses
`lib/slot.tsx`. Button, badge, card and alert then need only React, and a
registry block that uses `asChild` ships `lib/slot` as a registry file.

**React 19 throughout:** `ref` is a prop, no `forwardRef`, no `displayName`;
every part renders `data-slot`.

**Lucide is the one icon system (D3).** It is shadcn's default and already in
the blocks. SVG needs no font request, works under a strict CSP and renders on
a server.

- `Icon` ports as the `sp-icon` class, not a component: a name-based `Icon`
  would bundle every Lucide icon.
- A prop that took an icon name takes an element: `icon="add"` → `icon={<Plus />}`.
- The components' own glyphs (close, chevron, check) are inline SVG, so the
  package has no icon dependency. Apps and blocks import `lucide-react`.

**Every component is ported (D4),** the custom elements, Analytics,
CookieBanner, SEOHead and the editorial layouts included. This is the owner's
call: v4 loses nothing.

## What we accept in exchange

- **`radix-ui` remains a peer** for dialog, select, tooltip and the other
  behavioural components, and its own components keep their `"use client"`.
- **Our slot is ours to maintain.** The spike's 159 tests come with it.
  Radix's own tests catch 8 of 15 planted breakages and the full suite catches
  all 15, so the suite moves into `lib/` with the slot.
- **Material Symbols users migrate:** every icon name in an app becomes an
  import, listed with `file:line` by `bun run migrate`.
- **D4 ports code no app uses today.** Each port costs a session and an
  example, a pin and an a11y spec, against a weighting that favoured cutting.

## Alternatives weighed

Primitives (author's estimate):

| Option | Weight | Why not |
|---|---|---|
| **`radix-ui` for behaviour, `lib/slot` for `asChild` (chosen)** | 60% | — |
| `radix-ui` everywhere, Slot included | 25% | Every app installs `radix-ui` for a button; spike 4 shows the slot costs 132 lines to own |
| Base UI | 15% | Nothing we need ships only there yet; the `data-open` selectors keep the move open |

Icons (D3):

| Option | Weight | Why not |
|---|---|---|
| **Lucide (chosen)** | 50% | — |
| Material Symbols as SVG | 30% | A second set beside the blocks' Lucide, and not what community items expect |
| Keep the font | 20% | A font request per page, blocked by a strict CSP, and one glyph set for every icon |

Scope (D4):

| Option | Weight | Why not |
|---|---|---|
| Cut what no app uses | 60% | Overruled by the owner: v4 loses nothing |
| Cut, but keep the editorial React | 30% | Overruled by the owner |
| **Port every component (chosen)** | 10% | — |

## Evidence

- Spike 4, `deb0295`, `spikes/slot/result.txt` on `spike/react`. Radix's slot
  tests ported from the Radix primitives repository at the version installed
  (`@radix-ui/react-slot` 1.5.0).
