# ADR-0001: Rules ship with gates; code carries no comments

**Status:** accepted

## Decision

Every coding rule has a stable ID, an executable gate, a regression that proves a real violation fails, and a failure message containing the file, line and precise remediation. A gate that checks no files fails. Repeated corrections become enforced rules rather than longer instructions.

TypeScript, TSX and CSS contain no comments, including JSDoc. The only exceptions are the narrowly allowed Biome suppression with a reason and a standalone vendor issue URL documenting an otherwise unobservable bug. Types, names and tests explain behaviour; ADRs record decisions and commits record non-obvious reasons.

Size limits remain cognitive complexity **7**, function length **89** code lines, file length **474** code lines and nesting **5**. Tests retain their explicit scope exceptions, including nesting **6**. The improved source tree's measured p95 values live separately in `.quality-baseline.json`; measurements do not silently change enforced limits. Refactor for clearer contracts and lower maintenance cost, not solely to satisfy a newly calculated percentile.

## Consequences

A new rule costs a gate and meaningful failure tests. Documentation alone cannot establish compliance. Public types must remain explicit because consumers cannot depend on hover comments. Current coding guidance belongs in the owning skill; this ADR records the enforcement policy rather than duplicating every rule.
