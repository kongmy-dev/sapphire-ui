# Changelog

## 2.0.0 — 2026-06-10

Design-system overhaul focused on usability, extensibility, and parity across
the three export layers (CSS → Web Components → React).

### Breaking changes

- **NativeSelect** defaults to `variant="default"` (light surface) instead of
  `variant="dark"`, matching Input/Textarea. Pass `variant="dark"` explicitly
  on navy surfaces. Its `size` prop is now the visual size variant
  (`sm | default | lg`), not the native `<select size>` attribute.
- **Badge** is now a `forwardRef` component. Code that relied on Badge being a
  plain function component (rare) may need adjustment; rendering output at the
  default size is unchanged.

### Token contract (`theme.css`)

- The public `@theme` contract now includes the full **type scale**
  (`--text-display-xl` … `--text-xs`), **line heights** (`--leading-*`), and
  the **4px spacing scale** (`--space-1` … `--space-32`), so Tailwind v4
  consumers can generate utilities from them and plain-CSS consumers can
  override them in one place.
- New `--color-border-strong` token (form-control borders) with a dark-mode
  override; replaces a hard-coded fallback hex in RadioGroup/Checkbox styles.

### CSS layer parity (`style.css`)

- Button classes gained size and variant parity with React: `.btn-xs`,
  `.btn-sm`, `.btn-lg`, `.btn-block`, `.btn-accent`, `.btn-destructive`, plus
  disabled-state styling.
- New `.badge` family mirroring the React Badge variants: `.badge`,
  `.badge-accent`, `.badge-dark`, `.badge-success`, `.badge-error`,
  `.badge-warning`, `.badge-info`.
- New card modifiers: `.card-compact` (tighter padding) and `.card-static`
  (no hover lift).
- New `.k-switch--sm` compact switch size.
- Expanded `prefers-reduced-motion` guards to cover buttons, cards, inputs,
  toasts, switches, and header links.
- Replaced remaining hard-coded `#fff` / `white` values with tokens.

### React components

- **Button** — new sizes `xs`, `xl`, `icon-sm`, `icon-lg`; new `fullWidth`
  variant; new `iconPosition="start" | "end"`; icon glyph and loading spinner
  now scale with the button size; `aria-busy` is set while loading.
- **Badge** — `forwardRef` + `asChild` polymorphism; new `size`
  (`sm | default | lg`).
- **Input / Textarea** — new `size` (`sm | default | lg`); `aria-invalid`
  now styles the border/focus shadow with the error color.
- **NativeSelect** — CVA-based with `size` variants and exported
  `nativeSelectVariants`.
- **Select** — `SelectTrigger` gained `size` (`sm | default | lg`) and
  exports `selectTriggerVariants`.
- **Switch (ToggleSwitch)** — new `size="sm"`.
- **Label** — new `size` variants, exports `labelVariants`.
- **Spinner** — CVA-based with `tone` (`current | muted | accent`),
  customizable `label` for screen readers, exports `spinnerVariants`.
- **Skeleton** — CVA-based, `aria-hidden`, exports `skeletonVariants`.
- **Icon** — no longer forces `aria-hidden` when an `aria-label` is passed.
- **Chip** — larger dismiss hit area (without growing the chip footprint),
  `dismissLabel` prop for i18n.
- **Dialog** — close button is a proper 36px touch target with a visible
  focus ring and `closeLabel` prop; content is viewport-safe on small
  screens (`calc(100vw - 2rem)`); ConfirmDialog buttons gained focus rings
  and tokenized fills.
- **Sheet** — larger close button with `closeLabel` prop; `SheetHeader` /
  `SheetFooter` are `forwardRef`; exports `sheetVariants`.
- **MobileNav** — drawer width clamps to `min(280px, 85vw)`; `toggleLabel` /
  `closeLabel` props; close button gained a focus ring; respects reduced
  motion.
- **AdminLayout** — new `contentMaxWidth` prop; sidebar collapse button has
  `aria-expanded`, a visible focus ring, and `expandLabel` / `collapseLabel`
  props.

### Web Components

- **`<sapphire-toast>`** — new `duration` attribute as the default
  auto-dismiss; container is a polite `role="status"` live region.
- **`<sapphire-banner>`** — new `dismiss-label` attribute.
- **`<cookie-banner>`** — all copy is attribute-driven (`heading`,
  `description`, `privacy-url`, `privacy-label`, `accept-label`,
  `decline-label`), injected via `textContent` so values cannot carry markup.

### Docs

- Overview page documents the three-layer architecture and a new
  “Theming & Customization” section (token overrides, Tailwind v4 `theme.css`
  import, `*Variants` composition).
- Buttons, Forms, Data, and Web Components pages updated for the new sizes,
  props, and attributes.
