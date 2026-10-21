# Table feature contracts

**Status:** Accepted

## Decision

Use TanStack Table 9's feature-gated types and APIs in the two registry table
blocks. Preserve sorting, column hiding, the visibility menu and their existing
keyboard behavior. Keep TypeScript at 6.0.3.

Accept tables with the required sorting and visibility capabilities without
forcing consumers to register every stock feature or adopt a deprecated legacy
adapter. The header requires sorting and visibility; the view menu requires
visibility. Consumer examples and smoke builds register their features explicitly.

## Alternatives

The legacy adapter retains a deprecated API and bundles all features. Requiring
stock features makes unrelated features part of these small controls' contract.
Staying on version 8 defers the requested upgrade. Explicit capability contracts
follow the upstream feature model and retain useful static checking.

## Evidence

Use real version 9 tables in behavior regressions for ascending and descending
sorting, visibility changes and non-sortable or non-hideable columns. Registry
consumer compilation must include both blocks and an additional table feature,
so a version pin alone cannot satisfy migration verification.
The boundary gate permits TanStack fixtures in block tests while continuing to
reject that package in component tests.

Source: [Table migration guide](https://github.com/TanStack/table/blob/main/docs/framework/react/guide/migrating.md).
