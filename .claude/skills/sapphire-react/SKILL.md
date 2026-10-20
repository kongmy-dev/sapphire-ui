---
name: sapphire-react
description: Build v4 React clients of the shared CSS contract in components/. Read before writing TSX.
---

# Sapphire React

Read `V4-PLAN.md`, `DESIGN.md`, `typescript` and `coding-principles` first.
The frozen `src/` tree is reference material until P9; never port into it.

## Component contract

- One folder per component: named implementation, examples and behaviour tests.
- React 19 takes `ref` as a prop. Derive native props with `ComponentProps`;
  use literal tuples and derived unions for variants (P-3).
- Render `sp-*` classes, `data-slot` and `data-*` modifiers. Join the fixed
  class and consumer `className` directly; CSS layers give utilities precedence.
  No CVA, `clsx`, `tailwind-merge` or design utility strings.
- Use the unified `radix-ui` peer for behaviour. Static components import no
  Radix; `asChild` uses the tested `lib/slot` implementation (ADR-0005).
- Put `use client` on entry points that need client-only features. Keep static
  components server-renderable and avoid browser globals during module import.
- Preserve public behaviour, accessible names and keyboard operation. Follow
  D5's Tidy everywhere proportions; fix known defects in the shared CSS or
  behaviour that owns them, not in an example-only override.
- Keep CSS separate from JS. Full-package consumers import `sapphire.css`;
  mixed apps import foundations and one CSS owner per component (ADR-0002).
- No comments, default exports, speculative abstractions or dependency additions.

## Verification

Examples drive the site and browser coverage. Tests assert behaviour through
roles, names, props and the DOM (P-8/P-10), including disabled and controlled
states where relevant. Test real browser layout in Playwright. The generated
package and registry maps expose the same source once their phases land; never
update the frozen v3 barrel for a v4 component. Run the gate and affected browser
checks before committing only the files owned by the current task.
