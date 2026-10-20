---
name: sapphire-component
description: Add or change shared Sapphire CSS, React/native clients, examples and behaviour checks.
---

# Component changes

Read `CLAUDE.md`, `DESIGN.md`, `.claude/skills/typescript/SKILL.md` and
`.claude/skills/coding-principles/SKILL.md`. Reuse an assigned managed worktree.
Read the component's implementation, CSS, named examples and tests before editing.

## Shared CSS and clients

Keep shared styles in the component's CSS and render its `sp-*` parts,
`data-slot` and declared data attributes from clients (P-4). React does not
import CSS. Static React components do not import Radix; `asChild` uses `lib/slot.tsx`.
Behaviour primitives use unified `radix-ui`; SplitLayout uses its optional panels peer.
Elements import only `lib/`; browser registration is safe to import during SSR.

Use native/Radix-derived props and React 19 ref-as-prop. Preserve accepted null
and explicit undefined values unless a mapped major API change is intentional.
Record public renames and manual migration steps in `tooling/migrate/map.ts`.
Generate public maps after entrypoint changes and review emitted declarations.

Follow the density and coarse-pointer targets in `DESIGN.md`. Fix defects in
shared runtime/CSS rather than demo overrides. CSS variable, hover, motion,
contrast and theme rules are in DESIGN and P-4/P-5/P-8.

A component knob earns its name when a variant reassigns it, multiple rules
read it, or a real consumer/example customizes it. Otherwise use the value directly.
Own decorative glyphs use hidden inline Lucide-compatible SVG with `sp-icon`;
examples can import Lucide. Do not add a glyph-name runtime registry.

## Examples and tests

`<name>.examples.tsx` exports a literal `examples` array of
`{ name: 'stable-name', render: NamedExample } as const`. Each render is a
named zero-prop React function; consumers render via JSX or `createElement`.
Native `.examples.ts` functions return `HTMLElement`. Demo layout belongs in
`.examples.css`. Keep names stable because browser cases and pins use them.

Test public props and DOM roles/names (P-10): refs, callbacks, form values,
controlled/uncontrolled states, disabled/loading states and defect regressions.
Happy-dom preloads before Testing Library. Real browsers cover layout, pointer
resizing, focus containment and portalled overlays. Axe scans the full document
with overlays open. Rendered SSR snippets cannot represent portal interaction.

Run `bun run gate` and affected browser checks. Stage new files or explicitly
name them in scoped gates. Never lower coverage or waive an accessibility defect.
Pin updates require `bun run pin` and review of expected, actual and diff paths;
preserve reached interaction assertions and retained state captures.
An independent session reviews before integration. Commit only owned paths and
report changed APIs, verification and unresolved integration work.
