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

## Specimens and pins

A specimen is plain HTML that renders one v3 docs section from `sapphire.css` alone:
`components/<name>/<name>.examples.html` (and `css/base.examples.html`), a list of
`<section class="docs-section" data-pin="<route>/<slug>">` fragments. `bun run test:visual` screenshots each
against the pin of the same name at zero tolerance; `pins.spec.ts` skips a pin a specimen covers, and
`tests/specimens.a11y.spec.ts` runs axe on every specimen page in both schemes. An unexpected mismatch goes to the owner with expected, actual and diff. Approved D5 refinements
and defect fixes may update pins only through `bun run pin` after reviewing that evidence.
Unrelated states remain pinned; never directly invoke snapshot updates.

- The specimen page keeps the v3 page geometry (the 240 px sidebar column, the page header): a gradient's
  dither and a box's snapped edges change with the section's offset.
- A section whose preceding sections are not all in the specimen declares `data-pin-y="<y in the v3 page>"`;
  the spec moves the page by the missing sub-pixel fraction before it screenshots.
- Whitespace between inline elements in hand-written HTML renders as a space; JSX had none.

## Running Tests

```bash
bun run test           # bun test
bun run test:a11y      # Playwright a11y specs
```
