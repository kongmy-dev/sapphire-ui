---
name: review-code
description: Review changes against Sapphire UI coding principles. Run before pushing or after writing code. Verifies principles P-1 through P-10, component exports, token compliance, and comments. Reports findings citing rule IDs without modifying code.
---

# Review Code — Sapphire UI

Judge code strictly against `docs/coding/principles.md`. Every finding must cite a principle ID (e.g., `P-1`, `P-5`, `P-8`). "I would write it differently" is not a valid finding.

Review is non-destructive: report findings and their exact locations; do not alter files during review.

## Review Passes

### Pass 1: Principles and Invariants

1. **Exports (P-6):** Does every new export have a consumer or a matching entry in `src/index.ts` and `package.json -> exports`?
2. **Tokens (P-8):** Are there raw hex color values (`#...`) or hardcoded style values in the components? Are text colors on light backgrounds using `--color-accent-text` instead of `--color-accent`?
3. **Boundaries (P-2):** Does `src/` import from `registry/`, `scripts/`, or `tests/`? Does `registry/blocks/` import from `src/`?
4. **Types (P-3, P-4, P-7):** Are there `any`, `!`, `as` casts (other than `as const`), or `enum` declarations? Are variants modeled with CVA?
5. **Accessibility (P-9):** Do interactive elements have appropriate ARIA attributes, keyboard support, and focus rings (`focus-visible:ring-2`)?
6. **Complexity (P-5):** Does any function exceed cognitive complexity 7 or 89 lines? Are there deeply nested ternary operators or conditionals?

### Pass 2: Comment Discipline (P-1)

Run the comment gate on all modified files:
```bash
bun tooling/gates/comments.ts <file>
```

Check:
1. Are there narration comments ("does this", "loop over items")?
2. Are there section banners (`// --- helpers ---`)?
3. Are there `TODO`, `FIXME`, or commented-out code blocks?
4. Are JSDoc comments only placed directly above exported declarations or members of exported types?
5. Does every remaining comment strictly match one of the allowed fixed forms?

## Reporting Findings

Format every finding with:
- `File:Line`
- Principle ID (`P-1` to `P-10`)
- Concrete problem description and recommended remediation
