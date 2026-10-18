---
name: review-code
description: Review changes against Sapphire UI coding principles. Run before pushing or after writing code. Verifies the rules in docs/coding/principles.md, component exports, token compliance, and comments. Reports findings citing rule IDs without modifying code.
---

# Review Code — Sapphire UI

Judge code strictly against `docs/coding/principles.md`. Every finding must cite a principle ID (e.g., `P-1`, `P-5`, `P-7`). "I would write it differently" is not a valid finding.

Review is non-destructive: report findings and their exact locations; do not alter files during review.

## Review Passes

### Pass 1: Principles and Invariants

1. **Exports (P-6):** Does every new export have a consumer or a matching entry in `src/index.ts` and `package.json -> exports`?
2. **Tokens (P-5):** Are there raw hex color values (`#...`) or hardcoded style values in the components? Are text colors on light backgrounds using `--color-accent-text` instead of `--color-accent`?
3. **Boundaries (P-2):** Does `src/` import from `registry/`, `scripts/`, or `tests/`? Does `registry/blocks/` import from `src/`?
4. **Types (P-3):** Are there `any`, `!`, `as` casts (other than `as const`), or `enum` declarations? Are variants modeled with CVA?
5. **Accessibility (P-8):** Do interactive elements have appropriate ARIA attributes, keyboard support, and focus rings (`focus-visible:ring-2`)?
6. **Complexity (P-7):** Does any function exceed cognitive complexity 7 or 89 lines? Are there deeply nested ternary operators or conditionals?

### Pass 2: Comment Discipline (P-1)

Run the comment gate on the modified files:
```bash
bun tooling/gates/comments.ts <file>
```

The gate already fails any comment outside the forms ADR-0001 allows. Check what it cannot:
1. Is the knowledge a deleted comment carried now in a name, a type, a test name or an ADR?
2. Does a remaining `biome-ignore` name a `style` or `complexity` rule, with a reason that is true?
3. Does a vendor-bug URL sit over a workaround that no test could observe?

## Reporting Findings

Format every finding with:
- `File:Line`
- Principle ID (the `P-n` from `docs/coding/principles.md`)
- Concrete problem description and recommended remediation
