---
name: typescript
description: >-
  How TypeScript is written in Sapphire UI: toolchain, compiler flags, Biome,
  file shape, types, edges and tests, each rule with the check that catches it.
  Load before writing or changing any .ts or .tsx file, when adding or editing
  tsconfig, biome.json, bunfig.toml or git hooks, when reviewing a TypeScript
  diff, or when deciding how to type a prop, a variant, a guard or a parse.
---

# TypeScript in Sapphire UI

`CLAUDE.md`, `V4-PLAN.md` §7 and the `coding-principles` skill sit on top of this
one and win where they differ. When you find a difference, say so; don't
silently pick one.

Every rule names what catches a breach: **types** (the compiler), **lint**
(the named Biome rule, which `biome.json` must enable at error level), **gate** (size, comment or another `tooling/gates/` check), **test**,
**hook**, **review** (a reader, nothing else). A rule held only by review is a
rule waiting for a check: build it with the `add-rule` skill.

Older files break rules this skill sets. Copy the rule, not the neighbouring code.

## Before you write

1. **Decide out loud.** List what the request leaves open (input, output, edge
   behaviour), take the narrowest answer, say what you are *not* building, then
   build that list and stop.
2. **Find the existing one.** A helper, guard, token or component that exists is
   used, not written again. Two implementations of one thing is a finding.
3. **Name the data first,** from how the caller uses it; then the type; then the
   code.

## Toolchain

- **B1 · Bun only.** `bun install`, `bun run`, `bun test`, `bunx`. One lockfile
  (`bun.lock`), one resolver, one cache. *Caught by:* CI's
  `bun install --frozen-lockfile`.
- **B2 · Pin what writes config.** `packageManager` and `.bun-version`; exact
  versions for TypeScript, Biome and every devDep. TypeScript stays on 6.0.x:
  the gates and knip need the classic compiler API, which 7 drops. *Caught by:*
  dependency gate.
- **B3 · Read the docs before an unfamiliar API.** `ctx7 library <name> "<q>"`,
  then `ctx7 docs <id> "<q>"`, before writing against a new library, the shadcn
  CLI, Radix or a migration. *Caught by:* review.

## Compiler — `references/tsconfig.md`

- **TS1 · Strict, plus what strict leaves off:** `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`, `noImplicitOverride`, `noFallthroughCasesInSwitch`,
  `verbatimModuleSyntax`, `erasableSyntaxOnly`. One `tsconfig.base.json`,
  extended by every config. A flag that would narrow a public prop type stops
  and goes to the owner (`V4-PLAN.md` §9). *Caught by:* types.
- **TS2 · Every tracked `.ts` file is checked by some config** in `typecheck`,
  scripts and `*.config.ts` included. *Caught by:* types, review.

## Lint and format

- **L1 · Biome is the linter and the formatter,** `--error-on-warnings`. Style
  is never discussed in review. *Caught by:* lint, hook.
- **L2 · No suppressions,** except `biome-ignore <rule>: <reason>` on a `style`
  or `complexity` rule. No `@ts-ignore`, no `@ts-expect-error`. *Caught by:*
  comment gate.

## Shape of every file

- **S1 · No comments** (P-1). The *why* goes to an ADR, a test name or the
  commit. *Caught by:* comment gate.
- **S2 · Write to the gate's shape.** Short functions with few decisions: guard
  clauses, `Record<Union, X>` tables over branches, named predicates. Limits are
  this tree's own p95, never raised to bless a file. *Caught by:* size gate.
- **S3 · Subtract before you add** (P-6). Every new export, file or dependency
  has its consumer in the same change. No one-implementation interface,
  one-product factory, one-reader options object or re-export shim. *Caught
  by:* knip.
- **S4 · Names carry meaning.** Files kebab-case; booleans `is`/`has`/`can`; a
  unit on every bare number (`delayMs`, `sizePx`); no `utils`, `helpers`,
  `misc`, `common`, `manager`, `data`, `info`. Named exports only. More than two
  parameters, or two of one type, become one object, except on hot paths
  (per-frame handlers, parsers). *Caught by:* review.

## Types — `references/patterns.md`

- **T1 · Illegal states unrepresentable** (P-3). A discriminated union with one
  literal tag, never a boolean beside an optional field. Exhaustive `switch`
  whose `default` assigns to `never`, or a `Record<Union, X>` table. *Caught
  by:* types.
- **T2 · Constructive over checked.** Build the shape so the bad value can't be
  written: `[T, ...T[]]` for non-empty, `start` plus `durationMs` for a range.
  Strengthen a type only where the loose one forces a `!`, a cast or a "never
  happens" throw; otherwise keep the simplest total type. *Caught by:* types.
- **T3 · No `any`, `!`, `as` (but `as const`), `enum` or `interface`** (P-3).
  `unknown` at the edge; handle the `undefined` that `noUncheckedIndexedAccess`
  reports; `satisfies` to check a literal without widening it. *Caught
  by:* lint (`noExplicitAny`, `noNonNullAssertion`, `noEnum`,
  `useConsistentTypeDefinitions` set to `type`), types (`erasableSyntaxOnly`),
  review (casts).
- **T4 · Derive, never re-declare.** `ComponentProps<'button'>`, `Pick`/`Omit`,
  `(typeof X)[number]`, `ReturnType`. A second declaration of a shape drifts.
  *Caught by:* review.
- **T5 · A value with meaning is declared once** (P-3): a variant list, data
  attribute value, storage key, event name or cookie name is an `as const`
  tuple or object with its derived union. *Caught by:* lint, review.
- **T6 · Data is readonly.** `readonly` fields and `readonly T[]` parameters;
  return new values; no module-level mutable state outside a hook or element.
  *Caught by:* review.

## Edges

- **E1 · Parse at the edge, trust inside.** `document.cookie`, `localStorage`,
  `JSON.parse`, `postMessage`, attribute values on a custom element and URL
  params arrive as `unknown` or `string` and are parsed once into a named type.
  The package has no runtime dependency, so no schema library: a hand-written
  guard verifies every property it claims, or it is a lie that hides behind a
  safe name. *Caught by:* test, review.
- **E2 · Expected failures are returned, bugs thrown.** A parse returns
  `T | null` or its own `{ ok }` union; a `catch` that swallows or logs and
  carries on is a finding. *Caught by:* test, review.
- **E3 · No `console.*` in shipped code.** *Caught by:* lint (`noConsole`).

## Tests

- **Q1 · A test is a behaviour sentence that can fail** (P-10). Revert the
  change in your head: if nothing fails, the test is decoration. A bug fix
  starts with a failing test. No `.only` or `.skip` committed. *Caught by:*
  lint (`noFocusedTests`, `noSkippedTests`), review.
- **Q2 · Run the real thing.** `bun test` with happy-dom renders the real
  component and finds it by role and name; Playwright where happy-dom has no
  layout. Never mock our own code. *Caught by:* review.
- **Q3 · A suite that ran nothing fails.** A gate or suite over an empty file
  list is red, not green. *Caught by:* gate tests (P-15).

## After you write

1. `bunx biome check --write <files>`, then the gates on the files you wrote.
2. Run what proves the change: typecheck, the tests it touches, the build.
3. Read your own diff once as a reviewer: a comment, a cast, an export nobody
   calls, a hardcoded string, a swallowed error. Every *review* rule above
   depends on this read.
4. Commit one line, staging only your own paths.
