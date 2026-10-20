---
name: coding-principles
description: Principles and guardrails for writing TypeScript, React components, and CSS in Sapphire UI. Covers component boundaries, strict typing, no stray comments, explicit exports, tokens, and a11y, each with its enforcing gate. Load before writing or editing any .ts/.tsx file and whenever deciding component API structure.
---

# Coding Principles — Sapphire UI

This is the standard for any code written in Sapphire UI. The full rules and current status live in `docs/coding/principles.md`. When a principle and a gate disagree, the gate is what runs, so raise the mismatch rather than picking one.

## The Principles

Rule IDs are those of `V4-PLAN.md` §7. A failing gate prints `file:line`, the ID and what to write instead.

- **P-1 No comments in TS, TSX or CSS.** Names, types, structure and tests say *what*; the *why* lives in an ADR, a test name or the commit message. The two allowed forms are in `docs/adr/0001-rules-ship-with-gates.md`. Gate: `bun run comment-check`, and `.claude/hooks/check-edit.sh` on each edit.
- **P-2 Strict boundary separation.** `src/` never imports `registry/`, `scripts/`, or `tests/`. `registry/blocks/` never imports `src/` (registry items must be self-contained). Gate: `bun run check:registry`.
- **P-3 Types carry the rules.** No `any`, no `!`, no `as` but `as const`, `type` over `interface`, variants as `as const` tuples with derived unions, no `enum`; discriminated unions over boolean flags paired with optional fields. Gate: `tsc` strict and Biome (`noExplicitAny`, `noNonNullAssertion`, `noEnum`, and the `tooling/biome/no-cast.grit` plugin for `as`).
- **P-5 Tokens only.** No colour or length literal outside `css/tokens.css` (font-relative `em` and `ch` excepted), and every `var()` resolves. `--brand` is decorative; gold text uses `--brand-text`. Gate: `bun run token-check`.
- **P-6 Subtract before you add.** Every new export, file or dependency needs a consumer in the same change; v4 exports come from component folders through the generated map in P6; never edit the frozen v3 barrel for a v4 port. Gate: knip.
- **P-7 Minimise reader load.** Collapse single-caller wrappers and single-implementation interfaces. Limits: cognitive complexity 7, function lines 89, file lines 474, nesting 5. Gate: `bun run size-check`, and Biome `noNestedTernary`, `noUselessElse`, `noParameterAssign`.
- **P-8 Accessibility first.** Interactive components support keyboard navigation, correct ARIA roles and focus rings, and pass axe. Gate: `bun run test:a11y`.
- **P-12 Pinned toolchain, peers stay peers.** Exact devDependencies, `.bun-version`, TypeScript 6.0.x; React and Radix stay in `peerDependencies`. Gate: `bun run dep-check`.
- **P-15 A gate can fail.** A gate's test feeds it a real past violation and expects it to fail.
- **P-17 `src/` is frozen until P9.** A v3 fix goes to the `v3` branch; v4 work goes in the new folders. Gate: `bun run freeze-check`.

## Before You Write

1. **Decide out loud:** List what the request leaves open, choose the narrowest satisfying answer, and declare what you are choosing *not* to build.
2. **Consult tokens:** Verify CSS variable and token names in `css/tokens.css` (`src/theme.css` while `src/` stands) before writing styling.
3. **Check for existing primitives:** Reuse Radix primitives and existing UI components before writing custom implementations.

## After You Write

1. Ensure no comment exists outside the forms ADR-0001 allows.
2. Confirm new components have examples/tests and enter the generated public map when packaging lands.
3. Verify that `bun run gate` passes.
4. Run `bun run test` and `bun run test:a11y`.
