# Open work

Release stabilization and deployment remain in `V4-PLAN.md` until the owner closes
the release checklist. No unverified remote CI, publication or production smoke
result is implied by local checks.

The owner requested npm v4 publication through the existing trusted-publishing
tag workflow after final-candidate remote CI and approved master integration.
Local docs verification does not establish registry publication or project acceptance.

Dependency migrations:

The [dependency review](dependency-review.md) records retained packages,
the TypeScript hold and the locally mitigated tooling advisory.

- Keep TypeScript on 6.0.3 until the gates, migration tools and documentation
  builders migrate from the classic compiler API. TypeScript 7.0.2 exposes a
  different API; P-12 deliberately enforces 6.0.x.
- Replace the local `braces` patch when upstream publishes a supported release
  with equivalent traversal bounds. Retain the security regressions and the
  installed-CLI wrapper; version-based audit output remains open until then.
