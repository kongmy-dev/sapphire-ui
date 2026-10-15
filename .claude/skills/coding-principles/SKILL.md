---
name: coding-principles
description: Principles and guardrails for writing TypeScript, React components, and CSS in Sapphire UI. Covers component boundaries, strict typing, no stray comments, explicit exports, tokens, and a11y, each with its enforcing gate. Load before writing or editing any .ts/.tsx file and whenever deciding component API structure.
---

# Coding Principles — Sapphire UI

This is the standard for any code written in Sapphire UI. The full rules and current status live in `docs/coding/principles.md`. When a principle and a gate disagree, the gate is what runs, so raise the mismatch rather than picking one.

## The Principles

- **P-1 No comments in code.** Names, types, structure and tests say *what*. The *why* lives in an ADR, docs, a test name or the commit message. JSDoc (`/** */`) is kept only directly above exported declarations and members of exported types (so it ships in `.d.ts` as IDE docs for consumers). All other comments must follow one of the fixed forms:
  - `// vendor: <link> <fact>` — forced by browser or upstream library behavior.
  - `// ADR-NNNN` — architectural decision reference.
  - `// biome-ignore <rule>: <reason>` — required linter ignore with reason.
  - `// @ts-expect-error <issue link>` — upstream type bug reference.
  - `// a11y: <WCAG ref>` — explicit accessibility requirement.
  - `/* SPDX-License-Identifier: ... */` — license header.
  Gate: `tooling/gates/comments.ts` run on edited files.
- **P-2 Strict boundary separation.** `src/` never imports `registry/`, `scripts/`, or `tests/`. `registry/blocks/` never imports `src/` (registry items must be self-contained). Gate: `bun run check:registry`.
- **P-3 Strict types, no escape hatches.** No `any`, no `!`, and no type assertion outside tests except `as const`. Narrow with type guards or `satisfies`. Gate: Biome (`noExplicitAny`, `noNonNullAssertion`, `noUnsafeTypeAssertion`).
- **P-4 Make illegal states unrepresentable.** Component variants are defined through CVA unions. Use discriminated unions instead of boolean flags coupled with optional fields. Match exhaustively. Gate: `tsc` strict.
- **P-5 Minimise reader load.** Collapse single-caller wrappers and single-implementation interfaces. Thresholds: cognitive complexity ≤ 7, function lines ≤ 89, file lines ≤ 474, nesting ≤ 5. Gate: `tooling/quality-metrics/check.ts`.
- **P-6 Subtract before you add; explicit exports.** Every new export needs a consumer in the same change. Every exported component is mapped in `src/index.ts` and `package.json -> exports`. Gate: Size gate export check.
- **P-7 A value with meaning is declared once.** Use an `as const` object map plus its derived union, never TypeScript `enum`. Gate: Biome `noEnum` and tsc `erasableSyntaxOnly`.
- **P-8 Tokens only, no hardcoded colors.** Components never contain hardcoded hex or rgb strings. Always reference design tokens via Tailwind theme utilities or CSS variables (`var(--...)`). `--color-accent` is decorative; text on light surfaces must use `--color-accent-text`. Gate: Token review & CSS check.
- **P-9 Accessibility (a11y) first.** Interactive components must support keyboard navigation, correct ARIA roles, focus rings, and pass axe automated scans without violations. Gate: `bun run test:a11y`.
- **P-10 Peer dependencies stay peers.** React and Radix UI packages stay in `peerDependencies` so consumers never bundle multiple instances. Dev dependencies are pinned exactly. Gate: `package.json` validation.

## Before You Write

1. **Decide out loud:** List what the request leaves open, choose the narrowest satisfying answer, and declare what you are choosing *not* to build.
2. **Consult tokens:** Verify CSS variable and token names in `src/theme.css` before writing styling.
3. **Check for existing primitives:** Reuse Radix primitives and existing UI components before writing custom implementations.

## After You Write

1. Ensure no comments exist outside the allowed JSDoc and fixed forms.
2. Confirm new components have matching entries in `src/index.ts` and `package.json`.
3. Verify that the size gate and comment gate pass without errors.
4. Run `bun run test` and `bun run test:a11y`.
