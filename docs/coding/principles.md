# Coding Principles

Every change in Sapphire UI follows these principles. Each principle names its **gate**: the check that fails when the rule is broken. When a principle and a gate disagree, the gate is what runs, so raise the mismatch rather than picking one.

These principles are tailored for a **published React component library and CSS design system**.

## The Principles

| ID | Principle | Gate | State |
|---|---|---|---|
| **P-1** | **Comments:** Code carries no comments. A reader learns *what* from names, types, structure and tests. The *why* belongs in docs, a test name or the commit message. JSDoc (`/** */`) is kept only directly above exported declarations and members of exported types (to ship in `.d.ts`). Other comments are restricted to five fixed forms: `// vendor: <link> <fact>`, `// ADR-NNNN`, `// biome-ignore <rule>: <reason>`, `// @ts-expect-error <issue link>`, `// a11y: <WCAG ref>`, or an SPDX header. | Comment gate (`tooling/gates/comments.ts`), run on edited files by `.claude/hooks/check-edit.sh` and `bun run comment-check` | built |
| **P-2** | **Boundary separation:** `src/` never imports `registry/`, `scripts/`, or `tests/`. `registry/blocks/` never imports `src/` (registry items must be self-contained). | `bun run check:registry` | built |
| **P-3** | **Strict types, no escape hatches:** No `any`, no `!`, and no type assertion outside tests except `as const`. Props are strongly typed with explicit interfaces. | Biome linter (`noExplicitAny`, `noNonNullAssertion`, `noUnsafeTypeAssertion`) | built |
| **P-4** | **Make illegal states unrepresentable:** Variant logic is expressed through CVA unions. Use discriminated unions over boolean flags paired with optional properties. | `tsc` strict | built |
| **P-5** | **Minimise reader load:** Judge a change by the layers a reader must trace and the cognitive state they must hold. Collapse wrappers with one caller and interfaces with one implementation. | Size gate (`tooling/quality-metrics/check.ts`) on touched files + Biome (`noNestedTernary`, `noUselessElse`, `noParameterAssign`) | built |
| **P-6** | **Subtract before you add; explicit exports:** Every new export requires a consumer in the same change. Every exported component is explicitly mapped in `src/index.ts` and `package.json -> exports`. | Size gate export check + `package.json` validation | built |
| **P-7** | **A value with meaning is declared once:** Use `as const` object literals plus derived unions (`(typeof Foo)[keyof typeof Foo]`), never TypeScript `enum`. | Biome `noEnum` + tsc `erasableSyntaxOnly` | built |
| **P-8** | **Tokens only, never hardcoded colors:** Components never hardcode hex or rgb values in classes or styles; all colors reference design tokens. `--color-accent` is decorative; for text on light surfaces use `--color-accent-text`. | Token hex gate (`tooling/gates/tokens.ts` via `bun run token-check`) + CSS token integrity gate (`tooling/gates/css-tokens.ts` via `bun run css-check`) | built |
| **P-9** | **Accessibility (a11y) first:** Every interactive component has automated Playwright + axe accessibility coverage; keyboard navigation and ARIA attributes meet WCAG 2.1 AA. | Playwright a11y suite (`bun run test:a11y`) + coverage gate (`tooling/gates/a11y-coverage.ts` via `bun run a11y-check`) | built |
| **P-10** | **Peer dependencies stay peers:** React and Radix primitives remain peer dependencies so consumers are not burdened with duplicate runtime copies. Dev dependencies are pinned exactly. | Dependency policy gate (`tooling/gates/deps.ts` via `bun run dep-check`) + bundle externals gate (`tooling/gates/bundle-externals.ts` via `bun run externals-check`) | built |

## Decisions and Enforcements

- **Comment Gate:** Runs on changed/edited files via `.claude/hooks/check-edit.sh` and `bun run comment-check`. Legacy files are grandfathered until touched; do not mass-strip comments without verifying where their knowledge lives.
- **Size Gate:** Thresholds represent this repository's own measured 95th percentile (`7 / 89 / 474 / 5` for cognitive complexity, function lines, file lines, and nesting depth).
- **Adding or modifying a rule:** Use the `add-rule` skill. Every rule must arrive with its automated gate and an accompanying test verifying that the gate fires.
