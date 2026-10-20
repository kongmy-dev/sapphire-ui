---
name: sapphire-component
description: How to port one v3 component to its v4 CSS contract in Sapphire UI. Covers the order of a port, the CSS and specimen conventions, the renames map, the checks, the files a port may not touch and what the report carries. Read before porting any component.
---

# Skill: Port one component

One session ports one component (or one family, as card and badge shared a session). The v3 React look is the starting point; approved D5 refinements and defect fixes supersede it. Read the `sapphire-css`, `sapphire-testing` and `typescript` skills first, then `components/button/`, `components/card/` and `components/dialog/` as the worked examples.

## Setup

```bash
git worktree add -q .claude/worktrees/<name> -b v4/<name> master
cd .claude/worktrees/<name> && bun install --ignore-scripts --frozen-lockfile
```

Prefix every later command with `cd <worktree> &&`. Bun only. ctx7 before any API you have not used.

## The steps, in order

1. **Read the v3 source.** `src/components/ui/<Name>.tsx` (variants, sizes, props, the Radix structure), its rules in `src/index.css`, and its section in `src/pages/<Route>Page.tsx`. The pins are `tests/visual/pins/<route>/<slug>.<scheme>.png`; `bun run scorecard` lists each component's state. Decide out loud what the pins show, what they do not (variants, hover, disabled, a second structure), and what you are choosing not to build.
2. **Write `components/<name>/<name>.css`** (conventions below).
3. **Write `components/<name>/<name>.examples.html`**: the v3 page header, then one `<section class="docs-section" data-pin="<route>/<slug>">` per pin you take over, reproducing the v3 section's markup with `sp-*` classes. A section that is not first on its v3 page sets `data-pin-y` to its y in the v3 page (`getBoundingClientRect().top + scrollY`, read in the browser on the v3 docs). Whitespace between inline elements renders as a space; JSX had none.
4. **Demo-only styles** (v3's inline `maxWidth`, serif card titles) go in `components/<name>/<name>.examples.css`, linked automatically after `/specimen.css`. A `style` attribute may only set a component variable to a `var()` (`style="--sp-button-fg: var(--error-text)"`); the token gate fails a colour or length literal there.
5. **Add renames to `tooling/migrate/map.ts`**: every v3 class of the family in `classRenames` (or `unmappedClasses` with the reason), every renamed prop value in `propValueRenames`. `tooling/migrate/classes.test.ts` is generic: it checks each entry against `src/` and your CSS, so a port edits the map and never the test.
6. **Regenerate**: `bun run generate` rebuilds `sapphire.css` (the generated-files gate fails on a stale one).
7. **Check and commit** (below). Look at the specimen at `http://localhost:4175/components/<name>/<name>.examples.html?scheme=dark` after `bun tooling/visual/specimen-server.ts`.

## CSS conventions

- Everything sits in `@layer components`. `.sp-<name>` is the default variant and size; `data-variant`, `data-size` and boolean `data-*` (`data-hoverable`, `data-full-width`) describe the rest. Sub-parts are `.sp-<name>-header`, `-body`, `-footer`.
- A variable `--sp-<name>-<thing>` is declared on the base class only when a variant, size, state or media query reassigns it, more than one rule reads it, or a specimen or test sets it. A value read once and never reassigned is written inline: an app overrides that property directly, since its unlayered CSS beats `@layer components`, and the variable would cost bytes against the budget (P-13) for nothing. A number-only `calc()` (`calc(1.25 / 0.875)`) stays in a variable, because the minifier folds it to five decimals. The report names every variable.
- Colours are tokens (`var(--card)`, `var(--error)`); never a hex. Use `--brand-text` for gold text and the status text tokens (`--error-text`, `--success-text`, `--warning-text`, `--info-text`) for status-coloured text and outlines; a filled status colour keeps its base token (`--error`). Use the `--on-dark` family on dark surfaces. A value that no token holds and two components share becomes a token in `css/tokens.css` with its `css/tailwind.css` mapping and `DESIGN.md` row; one component's own value stays a variable.
- Lengths: an on-scale value uses its token; off-scale geometry is `calc(var(--space-1) * N)`; off-scale type is `calc(var(--text-base) * N)`; a length that follows the font size (tracking, prose rhythm, a line measure) is an `em` or `ch` literal. The token gate bans px, rem and the other absolute literals outside `css/tokens.css` (a media-query condition such as `min-width: 48rem` is not scanned).
- Hover goes in `@media (hover: hover)` and never applies to disabled elements. `@media (prefers-reduced-motion: reduce)` stops every transition and animation the component has.
- Focus is `:focus-visible` with the ring tokens. Preserve visible keyboard focus when applying D5; never retain a missing focus indicator for parity.
- No comments (P-1), no gradients except the `premium` button.
- A component with two structures (native `<dialog>` and Radix's `data-state` overlay plus content) states the look once and shares keyframes; native exit animation works only where the engine supports `display` and `overlay` transitions, so entry must work everywhere (dialog.css).
- Names keep v3's React names unless a v4 token makes one wrong (`accent` becomes `brand`; `dark` becomes `on-dark`). Every rename is in the map.
- A glyph arrives with the icon port: a section that renders a Material Symbols icon stays on its v3 pin, and the specimen leaves the glyph out. Do not add an icon library or a glyph.

## Checks (all must pass in the worktree)

```bash
bun run gate                 # lint, typecheck, knip, comment, size, dep, token, budget, generated, freeze, test, registry
bun run test:visual          # run it twice in a row, both green (needs Docker; counts in the report)
bun run test:a11y            # green; counts in the report
git diff master --stat -- tests/visual/pins    # must print nothing
```

- Only the integrating session runs `bun run pin` for named, owner-approved visual changes after displaying expected/actual/diff images. Never pass `--update-snapshots` directly. Never `docker rm`, `stop` or `prune`; never restart Colima.
- A pin you cannot match after a real attempt: copy its expected, actual and diff PNGs to the scratchpad folder the brief names, leave that section on its v3 pin (remove its `data-pin` from the specimen), and report the cause. Never change the look to pass.
- Fix axe findings when the affected component is touched; never add waivers to preserve a known defect. Remove resolved entries from `KNOWN_VIOLATIONS` in `tests/specimens.a11y.spec.ts` and retain regression coverage.
- A behaviour the pin cannot show (an open dialog) gets a live parity spec against the v3 docs under `tests/visual/`, comparing pixels, computed styles and focus; P9 replaces it with a pin.
- Hermetic tests only; a new test fails when the code it covers is reverted. No casts but `as const`, no `!`, no `any`.

## Files a port must not touch

Other components' folders; `site/specimen.css`; `css/` (except a shared token added through the token rules); `tooling/` (except `tooling/migrate/map.ts`); `tests/visual/pins/`; this skill; `src/`, `registry/blocks/`, `tests/registry-consumer/app/` and `design/`. A change a port needs in any of them goes to the owner in the report.

## Commits and report

One-line commits (`type: what changed`), explicit `git add <paths>`, never `git add .`, never push, tag or publish. Several small commits are fine.

The report pastes command output and labels each claim measured, inferred or unverified. It carries: the gate result; `test:visual` counts for both runs and the pins now rendered by specimens; `test:a11y` counts and each waiver with its ratio; the budget gate's gzipped bytes; the commits; every variable, variant and data attribute with each rename; sections left on v3 pins and why; mismatch image paths; every judgment call.
