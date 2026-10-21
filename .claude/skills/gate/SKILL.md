---
name: gate
description: Choose and interpret Sapphire verification, including Turbo cache evidence, focused checks and fresh integrated runs.
---

# Verification

Read the rule table in `CLAUDE.md`; command definitions live in `package.json`.
Use focused checks while editing, then the integrated gate when the batch is ready.
The edit hook covers only its calling editor; it cannot certify another agent's work.

| Change | Evidence before integration |
|---|---|
| Runtime or examples | Public behaviour tests, types and affected contract gates |
| CSS, geometry, focus or pointer interaction | Affected browser tests and visual comparisons |
| Gate or task graph | A passing case, a planted failure and an empty/missing-input case |
| Public API or generated surface | Generation, API check and affected consumer smokes |
| Docs or skills | Docs and skill-reference gates; read the instructions as a caller |

`bun run gate` schedules the existing checks through `turbo.json`. It uses four
concurrent tasks and only the checkout's local cache. Git-scope and API-history
checks run every time. Coverage depends on tests restoring their LCOV output;
registry checking depends on its build. Direct scripts remain available for
focused runs, but a direct coverage check needs a current test report first.

Use `bun run gate --force` when fresh execution is required, including validation
of changed orchestration. This bypasses cache reads without deleting caches.
The TypeScript build can still reuse its compiler state; use
`bun run typecheck --force` when that state is in doubt.

Read file counts and test totals, not only exit status. A scoped check that reads
nothing fails. New files must be staged or explicitly named in scoped gates:
Turbo hashes untracked inputs, but Git-enumerated gates still need their scope.
Compare suite totals with the baseline; explain any reduction.

A cache hit reuses earlier evidence for its input hash. Report it as cached;
it does not mean the tests executed again. Full task logs remain under `.turbo/`.
Changes to default inputs, the lockfile, toolchain pin or declared environment
invalidate deterministic task caches. Never narrow inputs without an experiment
covering additions, edits and missing outputs. See `docs/adr/0006-task-orchestration.md`.

Browser checks, package smokes, publication and deployment have separate evidence.
A green integrated gate does not imply they ran. Report the command, commit,
fresh/cached status, counts and any remaining check or blocker.
