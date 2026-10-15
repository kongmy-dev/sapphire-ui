---
name: refactor-code
description: Refactoring procedures for Sapphire UI. Use when addressing review findings, size-gate alerts, or cleaning up components. Explains how to pin behavior with tests, extract comments safely, simplify component trees, and reduce size.
---

# Refactor Code — Sapphire UI

Refactoring changes code structure without changing its external behavior. Follow these procedures to resolve review findings and size gate violations.

## Core Rules

1. **Pin behavior before moving code:** Run the test suite first. If a component lacks behavioral test coverage, write the test before refactoring.
2. **One step at a time:** Keep structural reorganization and behavioral changes in separate steps.
3. **Subtract before adding:** Delete obsolete wrappers, unused exports, and dead helpers before introducing new abstractions.

## Removing Stray Comments Without Losing Knowledge (P-1)

When the comment gate reports a stray comment:

| What the comment was doing | How to eliminate it |
|---|---|
| Explaining what a variable or prop means | Rename the variable or prop to be self-explanatory (`disabled` → `isDisabled`, `delay` → `delayMs`). |
| Describing component or prop usage for consumers | Move into JSDoc (`/** ... */`) directly above the exported component or interface prop. |
| Explaining why an unusual branch or workaround exists | If forced by browser or library behavior, convert to `// vendor: <link> <fact>` or `// a11y: <WCAG ref>`. |
| Explaining design architecture or token decisions | Move into `design/design.md` or `docs/`. |
| Marking open work or reminders | Remove from code and record in project issue or task list. |

## Reducing Size and Cognitive Complexity (P-5)

When `tooling/quality-metrics/check.ts` fails on complexity or line count:

1. **Invert deeply nested conditionals:** Convert nested `if` statements into early returns/guards.
2. **Extract discrete UI sub-blocks:** If a JSX render function exceeds 89 lines, identify cohesive sub-elements (e.g. Header, Item, EmptyState) and extract them into focused child components.
3. **Replace complex conditionals with lookup objects:** Replace nested ternaries with an `as const` map or CVA variant.
4. **Eliminate single-use helper indirection:** Inline wrappers that simply call a Radix primitive without adding logic.

## Verification

After any refactoring:
```bash
bun tooling/quality-metrics/check.ts <edited-files>
bun tooling/gates/comments.ts <edited-files>
bun run test
bun run test:a11y
```
