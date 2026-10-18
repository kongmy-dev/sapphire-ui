# ADR-0001: Rules ship with gates, and code carries no comments

**Status:** accepted, 2026-10-18

## What a contributor sees

```text
$ bun run gate
comment gate: <n> files checked
  components/button/button.tsx:12  P-1  comment outside the allowed forms
    Move what it knows into a name, a type, a test name or an ADR, then delete it.
comment gate: FAIL
```

```text
$ bun run gate
size gate: 0 files checked
size gate: FAIL — nothing was measured
```

A rule reaches a contributor as a failure with a file, a line, a rule ID and the
fix. It never reaches them as a paragraph they were meant to have read.

## Context

Measured at `bc2e116`:

- `bun run gate` was red, and three gates passed on nothing: the comment, size
  and token gates printed "0 files" and exited 0.
- The comment gate over `src/` found 328 stray comments; over `tooling/`, 26.
- The rules lived in four places (`CLAUDE.md`, `docs/coding/principles.md`, the
  `coding-principles` skill, `AI-CODE-QUALITY.md`), and they disagreed on which
  comment forms are allowed.

A rule held only by prose is followed by whoever read the prose last. A gate
that cannot fail looks the same as a gate that passed.

## Decision

1. **Every rule has an ID, a gate and a test.** The gate's test feeds it a real
   violation from this repository's history and expects it to fail. Each
   failure prints `file:line`, the rule ID and what to write instead.
2. **A gate that checked nothing fails.** It prints what it checked; an empty
   file list is red.
3. **No comments in TS, TSX or CSS, JSDoc included.** Names, types and unions
   carry the *what*. The *why* goes to an ADR, a test name or the commit body.
   Two forms are allowed:
   - `biome-ignore <rule>: <reason>`, for a `style` or `complexity` rule only.
     A correctness, suspicious, a11y or security finding is fixed, never
     silenced.
   - A browser or vendor bug's URL, alone above its workaround, only when no
     test can observe the bug. When a test can, the test is named for the bug,
     so deleting the workaround fails.
4. **A correction made twice becomes a gate.** Only a judgment call stays prose,
   and it lives in one place: `CLAUDE.md` lists each rule with its gate, one
   line each; skills cite rule IDs instead of restating them.

## What we accept in exchange

- **Consumers lose hover docs.** The shipped `.d.ts` shows types and literal
  unions, not sentences. A prop whose meaning needs a sentence is a prop whose
  type is too loose, and that is fixed in the type.
- **Some *why* is found through `git blame`** rather than above the line. The
  commit body carries it, and an ADR carries anything a later change must
  respect.
- **Every new rule costs a gate and its test** before it lands. A rule nobody
  can afford to check is not adopted.
- **Legacy code fails on touch.** Until P9, gates run on the new folders and any
  change under `src/` fails; v3 fixes go to the `v3` branch.

## Alternatives weighed

| Option | Weight | Why not |
|---|---|---|
| **Gates for every rule, no comments (chosen)** | 60% | — |
| Gates, but JSDoc allowed on exports | 30% | Hover text drifts from the code with nothing to check it, and it reopens the question of which comments are allowed |
| Prose rules with review, and the five fixed comment forms used until now | 10% | Measured above: the rules disagreed with each other and three gates passed on nothing |

Weights are the author's estimate at decision time.
