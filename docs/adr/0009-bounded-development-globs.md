# Bounded development glob processing

**Status:** Accepted

## Decision

Apply a version-specific Bun patch to `braces` 3.0.3. Bound parser container
nesting and recursive compile, expand and stringify walks to 128 AST levels.
Reject deeper input with a diagnostic `SyntaxError`, including caller-supplied
ASTs. Preserve ordinary glob expansion, escaping, quoting and range behavior.

Run shadcn through its installed entrypoint with the current Bun executable.
An ephemeral `bunx` installation can bypass the root's `patchedDependencies`;
registry builds and consumer smokes must use the patched dependency graph.

## Alternatives

The upstream advisory has no patched release. Waiting leaves unbounded recursion
in development tooling. Replacing the registry CLI changes a larger supported
workflow. A checked-in Bun patch changes only the vulnerable traversal boundary
and reapplies during frozen installs without editing shared cache files.

## Evidence and limits

Regressions exercise deep braces, parentheses and direct AST inputs through the
dependency resolved from shadcn, and retain normal matching and expansion cases.
A disposable frozen install verifies patch replay. Registry consumer smokes
exercise the installed CLI outside the checkout.

The advisory remains in version-based audit output until upstream publishes a
fixed version. This local mitigation does not suppress that finding or claim an
upstream fix. Replace the patch when a supported release includes equivalent
bounds; retain the regressions.

Sources: [advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm),
[Bun patch workflow](https://bun.sh/docs/pm/cli/patch).
