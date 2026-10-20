---
name: sapphire-component
description: Port or change a v4 component, its shared CSS, React examples and behavioural checks.
---

# Port or change a component

Read `V4-PLAN.md`, `DESIGN.md`, `coding-principles`, `typescript`, `sapphire-css`
and `sapphire-testing`; read `sapphire-react` for React work. The frozen `src/`
tree is reference material until P9. Approved D5 refinements and defect fixes
supersede the v3 look.

## Scope and setup

Use the assigned worktree and own only the assigned component folders. Reuse a
suitable managed worktree; a new branch uses `codex/`. Do not reset another
session's work. Install with `bun install --ignore-scripts --frozen-lockfile`.
Read the component's v3 public props and behaviour, existing v4 CSS and HTML,
and its current examples and tests before editing. State what the port covers
and which shared changes need integration. Button, card and dialog establish
the pattern for each phase.

## Shared CSS

- Keep styles in `@layer components`, with `sp-*` classes naming parts and
  `data-*` attributes naming variants, sizes and states. CSS is shared by HTML,
  React and custom elements; client code does not import it.
- Follow D5's tighter proportions in product and editorial UI. Preserve the
  theme, readable type, focus indication and coarse-pointer target sizes.
  Fix defects where they originate, not through an example-only override.
- Use tokens for colours and absolute lengths. Font-relative `em` and `ch`
  and token-based `calc()` are allowed. Gold text uses `--brand-text`.
- Keep a component variable only when a variant/state reassigns it, several
  rules read it, or a documented customization/example uses it. One-use
  aliases add bytes without adding a useful customization point.
- Hover belongs in `@media (hover: hover)` and excludes disabled states.
  Reduced-motion rules disable the component's animations and transitions.
- Own glyphs are inline Lucide SVG geometry with `sp-icon`, hidden from
  assistive technology when decorative. Apps and examples may use Lucide.
  No font glyphs or bundled icon-name lookup.
- Demo-only layout belongs in the component's `.examples.css`; it must not
  conceal a defect in the shipped CSS. Preserve existing specimen geometry
  for unchanged pins, including declared `data-pin-y` offsets.
- Record renamed classes, props and values in `tooling/migrate/map.ts`.
  Run `bun run generate` when the component folder inventory changes.

## React and examples

- React 19 refs are props. Use native/Radix-derived prop types, named exports,
  `data-slot`, literal variant tuples and the fixed class plus `className`.
- Static clients import no Radix. `asChild` uses the tested `lib/slot`.
  Behaviour uses the unified optional `radix-ui` peer. Keep modules safe to
  import on a server and preserve existing public acceptance of nullable or
  explicitly undefined props unless a mapped API change is intentional.
- `<name>.examples.tsx` exports `examples`, an `as const` array of
  `{ name: 'stable-name', render: NamedExample }`. Render functions are named,
  zero-prop React components. Consumers use `createElement` or JSX, never
  call the render function directly. These examples feed docs and tests.
- Tests reach components through their public props and DOM roles/names.
  Cover controlled/uncontrolled and disabled states, callbacks, refs,
  keyboard operation and defect regressions that apply. Browser tests cover
  layout and portals; axe scans the full document after opening overlays.
- SSR HTML snippets cannot show portalled content. Documentation must explain
  that limitation rather than imply a static snippet implements the dialog.

## Validation and integration

Run `bun run gate`, the affected accessibility checks and container visual
checks. New files must be included explicitly in scoped gates or staged before
running tracked-file gates. Report counts and remaining failures honestly.
Coverage counts every public implementation and example file, including
unimported files; tooling gates have their own failure-case tests (P-15).

Only the integrating session updates pins through `bun run pin`, after reviewing
expected, actual and diff images for an approved change. Preserve unchanged
states and all behaviour/geometry checks. When a refinement supersedes a v3
parity comparison, first give the affected state an equivalent v4 pin; keep
its interaction assertions. Retain the old renderer until P9 closes the full
state inventory.

Run a check again when code changes, a failure or an unresolved concern warrants
it. Never lower a threshold or waive a defect to obtain a pass. Before a phase
closes, the integrated gate and all checks required by that phase must pass.
An independent reviewer checks the changes before integration.

Do not push, tag, publish, clear shared caches or alter Docker services as part
of a component port. Report infrastructure blockers to the integrating session.
Commit only owned files, with an explicit path list and a short one-line subject.
Report the commits, validation evidence, API/migration changes, reviewed visual
changes and any unresolved integration dependency. Do not edit the frozen lane
or another component's folder without the integrating session assigning it.
