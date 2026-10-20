---
name: add-rule
description: Add a Sapphire rule with a gate, a regression and a precise remediation message.
---

# Add a rule

Read the rule table in `CLAUDE.md`. Reuse an existing ID when the restriction is
already part of that principle; a new principle needs the owner's agreement.
A mechanical correction belongs in a gate, not another checklist.

Implement `tooling/gates/<name>.ts` as a pure function over file names/text or
an explicit input contract. Only the CLI boundary reads git and files. Reuse
`tooling/gates/scope.ts`, `tooling/gates/report.ts` and `tooling/source/parse.ts`.
Prefer the TypeScript AST for structural source checks. A gate that checked
nothing fails, and each finding includes file, line, rule ID and a concrete fix.

Test valid input, an empty scope and an actual forbidden shape. Assert the
failure and remediation, not just an arbitrary finding count. Run the real gate
against the intended scope to detect false positives before wiring it.

Coordinate package scripts and `bun run gate` with their owner. Update the
single rule table and relevant reference, without copying it into every skill.
