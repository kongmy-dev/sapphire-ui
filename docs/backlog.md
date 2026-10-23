# Open work

The product-layout redesign (ADR-0011) is implemented as an unpublished v5
candidate. Its breaking contracts and manual choices are in
[the migration guide](migrate-v5.md). Publication and deployment require separate
authorization; prior v4 release approval does not authorize v5.

Release stabilization and deployment remain in `V4-PLAN.md` until the owner closes
the release checklist. No unverified remote CI, publication or production smoke
result is implied by local checks.

Before deploying the v5 catalogue, retain the deployed `/r/v4/` assets alongside
the frozen `/r/` distribution. This checkout does not contain a frozen v4 copy.
Local checks do not establish publication, deployment or consumer adoption.

Dependency migrations:

The [dependency review](dependency-review.md) records retained packages,
the TypeScript hold and the locally mitigated tooling advisory.

- Keep TypeScript on 6.0.3 until the gates, migration tools and documentation
  builders migrate from the classic compiler API. TypeScript 7.0.2 exposes a
  different API; P-12 deliberately enforces 6.0.x.
- Replace the local `braces` patch when upstream publishes a supported release
  with equivalent traversal bounds. Retain the security regressions and the
  installed-CLI wrapper; version-based audit output remains open until then.
