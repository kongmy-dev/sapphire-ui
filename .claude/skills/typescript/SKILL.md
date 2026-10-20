---
name: typescript
description: Apply Sapphire's compiler, source structure, edge parsing and test conventions.
---

# TypeScript

Read `CLAUDE.md` for rules P-1–P-16. Bun owns local installs and commands;
TypeScript's pinned compiler also supplies the AST used by the gates. Consult
ctx7 before an unfamiliar dependency API; use official docs if it is unavailable.

## Compiler and source shape

`tsconfig.base.json` owns shared strict flags. Every tracked source belongs to
an extending config. `references/tsconfig.md` explains the compiler decisions.
Use explicit `.js` relative imports in public source so emitted ESM works in Node.
Biome owns formatting and unused-source diagnostics; do not silence correctness.

Derive props and unions from their owner. Model illegal combinations with a
discriminated union when it removes impossible branches, not merely to add a type.
Use `unknown` at untrusted edges and narrow the properties actually consumed.
Data shapes, names and tests carry intent; P-3 has no special cast exception.

Functions with several same-type parameters usually take a named object; retain
positional arguments for established APIs or hot paths where allocation matters.
A single-reader options type or single-implementation interface is not a seam.
Keep types local until a second consumer establishes a useful boundary.

## Edges and tests

Parse JSON, attributes, storage and messages once. A guard that verifies one
property cannot claim three. Return expected input failure; throw for a broken
internal invariant. Do not swallow unexpected failures and continue as success.

Tests render real components through public props and DOM roles. Do not mock
owned internals. Test the bug trigger, accepted null/undefined values, state
transitions and accessible outcomes. Happy-dom has no layout; use Playwright
for geometry and pointer behaviour. P-10 coverage includes unimported runtime
and example files, and a test or gate that ran nothing is not a pass.

Run scoped Biome, types and affected tests, then `bun run gate`. Use
`.claude/skills/sapphire-component/SKILL.md` for client/CSS contracts and
`.claude/skills/review-code/SKILL.md` for independent review.
