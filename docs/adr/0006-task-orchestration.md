# Task orchestration and verification

**Status:** Accepted

## Decision

Use the pinned Turbo development dependency to schedule the existing package
scripts in this single-package repository. Keep direct commands available for
focused work. The integrated gate retains every existing check, with bounded
parallel execution and a local cache. CI persists that cache between runs.

Cache deterministic checks and their declared outputs. Start with Turbo's full
default input set, which includes untracked, non-ignored files; narrow inputs
only after an invalidation experiment proves the change safe. Toolchain versions
and configuration belong to the input contract. Cache entries stay within the
checkout, because generated reports can contain absolute paths.

Checks that enumerate tracked files stay uncached: staging changes their scope
without changing the bytes Turbo hashes. The API check stays uncached because
it reads HEAD and its parent. Registry builds stay uncached because their CLI
supports a caller-selected output directory and invokes an external tool.

Coverage verification depends on the test task, whose cache restores the LCOV
report. The registry checker depends on the registry build. Never run either
consumer against a leftover artifact. Browser, publication, migration and
consumer smoke checks remain explicit; a cached gate cannot certify them.

Use `bun run gate --force` for fresh integrated evidence without deleting shared
caches. Before relying on caching, test input invalidation, output restoration,
dependency failure and the Git-dependent checks in a disposable repository.

The development skills explain scope selection, behaviour-preserving refactoring,
evidence and review. The rule table remains in CLAUDE.md; skills do not duplicate
it or lower its limits. A passing cached result is reported as cached.

## Alternatives

Retaining a serial command costs no dependency but repeats unchanged work.
Bun's parallel script runner removes the serial wait but does not supply an
artifact cache or dependency graph. Turbo provides both while retaining the
existing scripts and repository layout.

## Consequences

The cache adds disk use and an exact development dependency. Conservative inputs
can miss cache after an unrelated edit; that is preferable to stale evidence.
Concurrency can contend with the compiler and tests, so measure fresh and warm
runs separately. No runtime dependency or public component contract changes.

Sources: [single-package workspaces](https://turborepo.dev/docs/guides/single-package-workspaces),
[configuration](https://turborepo.dev/docs/reference/configuration) and
[caching](https://turborepo.dev/docs/crafting-your-repository/caching).
