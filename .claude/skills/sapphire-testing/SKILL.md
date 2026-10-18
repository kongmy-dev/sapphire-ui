---
name: sapphire-testing
description: How to write and run unit tests and accessibility tests in Sapphire UI. Covers the test runners, the rules a test must meet, and running verification suites.
---

# Skill: Testing Sapphire UI

Read this before adding or modifying tests.

## Stack

- **Unit tests:** `bun test`, importing from `bun:test`. Today they cover `tooling/gates/` and
  `scripts/`. Component tests arrive with the v4 components, with happy-dom registered in its own
  preload before Testing Library loads (`V4-PLAN.md` §9).
- **Accessibility tests:** Playwright and `@axe-core/playwright` against WCAG 2.1 AA, in `tests/`.

## Rules

A test states a behaviour and can fail: it reaches a component only through props and the DOM,
finds elements by role, and asserts no snapshot (`V4-PLAN.md` §7, P-10). The typescript skill's
Q1–Q3 apply: revert the code under test and the test must fail, and a suite that ran nothing fails.

## Running Tests

```bash
bun run test           # bun test
bun run test:a11y      # Playwright a11y specs
```
