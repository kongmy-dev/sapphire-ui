# Retired renderer coverage

The v4 visual runner serves shared-CSS specimens and executable React/native examples directly. It does not build the retired documentation application or substitute archived component screenshots.

`tooling/visual/section-pins.json` records every active section screenshot. Its test requires exact equality with specimen `data-pin` sections, preventing either a missing capture or an unknown section. Every state spec and `tests/visual/state-inventory.json` remain unchanged: the fixture still checks the exact capture count for each test and scheme.

Three documentation-only sections retain their light/dark PNGs as archival evidence. Their setup/API prose is obsolete and is excluded from pin scheduling explicitly in `ARCHIVED_DOCUMENTATION_PINS`: custom-element setup, imperative toast/banner/cookie usage snippets, and SEO usage snippets. Native executable examples, element lifecycle/equivalence tests, and SEO metadata tests cover their live functionality.

The retired route-level accessibility suite inspected the old documentation chrome and six expanded controls. Strict `tests/examples.a11y.spec.ts` now scans every exported React example in all three browsers and both schemes, including portals, after running the keyboard registry. The accordion, popover, sheet, dropdown-menu, dialog, and command-palette registry cases open the corresponding controls and assert behavior. `tests/elements.a11y.spec.ts` covers native element examples, while `tests/specimens.a11y.spec.ts` checks shared-CSS specimens. These suites assert zero violations unconditionally; the old renderer suite only enforced that result when `STRICT_A11Y=1`.

The quality snapshot now enumerates tracked in-scope TypeScript throughout the current tree, including tooling and executable examples, instead of the retired `src/registry/tests` selection. It records nearest-rank p95 measurements and population sizes separately from the enforced limits. The existing limits remain 7 cognitive complexity, 89 function lines, 474 file code lines and 5 nesting levels; adopting tighter values would require a separately scoped refactor. Test files retain their existing exemptions from line limits.

Package verification uses the file-for-file build and packed consumer smoke. A publish dry run lists only `dist/`, README, DESIGN, LICENSE and the implicit package manifest. Bun may still reject the dry run after printing that inventory when registry authentication is absent; packing and consumer checks do not need publishing credentials.
