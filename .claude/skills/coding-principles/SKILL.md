---
name: coding-principles
description: Find Sapphire's rules, enforcement, evidence and documentation boundaries before changing code.
---

# Coding principles

Read `CLAUDE.md` for the only rule table and `DESIGN.md` for the UI contract.
The rule IDs identify enforcement; skills explain the judgment those checks cannot make.

Before implementation, state input/output choices and the smallest useful scope.
Find existing primitives, types, tokens and tests before introducing another path.
Name the caller's data and accepted states before shaping the implementation.
Judge simplicity by the layers a reader traces and the state they must hold;
fewer lines alone do not establish an improvement. A repeated fix applies at
its owner and every affected use, including both clients and colour schemes.
Use `.claude/skills/typescript/SKILL.md` for compiler and edge handling and
`.claude/skills/sapphire-component/SKILL.md` for UI changes.

Knowledge belongs where it can be checked:

| Knowledge | Home |
|---|---|
| Public data shape and accepted states | Types and named examples |
| Observable behaviour and regressions | Tests |
| Repeated mechanical restriction | Gate plus a failing regression (P-15) |
| Architectural tradeoff | `docs/adr/` |
| Open work | `docs/backlog.md` |
| A judgment that no gate can make | The smallest relevant skill |

For P-7, retain the enforced 7/89/474/5 limits. Measurement does not justify
raising a threshold. The size gate counts code lines rather than comment padding;
reduce branches and unnecessary exports before splitting a coherent operation.
A lower measured p95 is evidence, not permission for a broad cosmetic rewrite.

Run `bun run gate` and affected browser checks. A check that measured nothing
is a failure. Record the command, commit and result; label incomplete evidence.
Use `.claude/skills/gate/SKILL.md` for focused checks, cache evidence and fresh runs.
When prose and enforcement disagree, establish which contract is intended and
correct both in the same change. Do not silently follow a stale instruction.
An independent reviewer uses `.claude/skills/review-code/SKILL.md` before integration.
