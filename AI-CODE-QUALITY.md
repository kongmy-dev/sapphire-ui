# AI-CODE-QUALITY.md

Structural measurement and a size gate were installed here on 2026-09-04, along with two rules in
`AGENTS.md`. Nothing existing was changed to satisfy them — that part is yours, and this file is the
context for deciding what is worth doing.

## What was installed

| File | What it does |
|---|---|
| `tooling/quality-metrics/metrics.ts` | Measures the source over the TypeScript AST: code lines (comments never counted as code), cognitive complexity to the Sonar spec, exports with no consumer, clone blocks. |
| `tooling/quality-metrics/check.ts` | The gate. Runs on named files, prints findings that name the fix. |
| `.claude/hooks/size-gate.sh` + `.claude/settings.json` | Runs the gate after every edit and returns findings to whoever made the edit. |
| `.quality-baseline.json` | Reference snapshot. Without it no before/after claim is checkable. |

```bash
bun tooling/quality-metrics/metrics.ts          # measure; print the distribution
bun tooling/quality-metrics/check.ts <files>    # the gate, on files you touched
```

## Your numbers

Thresholds are **this repo's own 95th percentile**: `7 / 89 / 474 / 5` (cognitive / function lines / file
lines / nesting). They were measured here, not copied — a sibling's set applied to another repo
failed 41% of its files for reasons unrelated to quality.

**31 of 108 (29%) existing files fail the gate.** That is expected and is not a backlog. The gate runs only
on files you touch, so legacy stays quiet until you are already in there. **Do not retrofit** —
that is what killed an earlier attempt at this on a sibling repo, where a blanket run got every
finding waived on day one and the gate was deleted.

## What the tool cannot see

Nothing — TypeScript throughout. `tests/registry-consumer/` is excluded as a deliberate duplicate of `registry/`.

## Worth knowing before you decide anything

- **`CLAUDE.md` and `AGENTS.md` are two separate real files, not a symlink.** They will drift. Every other repo here links one to the other; this one should too. Left alone deliberately — it is a decision about which file is canonical.
- **Weakest comment culture of the five repos**: 2.2% of comments restate the code (5× the others) and only 4.2% explain a *why* (vs ~20% elsewhere). The instruction file is also the thinnest at 97 lines. Those two facts are probably the same fact — a model mirrors what is already in the file.
- **20% cross-file duplication** — almost all of it the deliberate `registry/blocks` ↔ consumer-app mirror. Not a defect, but it means the clone number in the baseline reads high for a benign reason.

## How to proceed

1. **Do nothing for two weeks.** Let the gate report on work you were doing anyway. It is a
   report, not a blocker; nothing is waiting on you.
2. **Then look at what it caught.** If it is mostly noise on files you were forced to touch, the
   thresholds are wrong — raise them. If it caught things you agree with, ratchet them down.
3. **Ratchet, never retrofit.** Lower a limit when the files under it already pass. A limit that
   fails a third of the tree on the day you set it is a limit that gets ignored.
4. **Re-measure after any large change**: `bun tooling/quality-metrics/metrics.ts
   .quality-baseline.json` rewrites the snapshot.

## Where this came from

Six experimental rounds, 24 controlled runs across two sibling repos, three replicates per
condition. Only three things survived a noise-floor check, and they are the only three installed:
the self-clarify rule, the export rule, and the measurement. Everything else tested — copied
thresholds, skill libraries, and most of what looked like an effect at n=1 — did not.

One finding worth carrying: **none of this makes code smaller.** Four rounds showed no volume
reduction that survived scrutiny. What it does is cut published surface, show you the size of what
you just wrote while it is still cheap to change, and make claims about this codebase checkable
instead of asserted. The largest lever by 2-3x was a specific request, and that lives in the
ticket, not the repo.

Full write-up: `obsidian-knowledge/Resources/Dev & Infra/AI Code Quality — The Standard Setup.md`
