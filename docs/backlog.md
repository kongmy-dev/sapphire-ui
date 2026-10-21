# Open work

Release stabilization and deployment remain in `V4-PLAN.md` until the owner closes
the release checklist. No unverified remote CI, publication or production smoke
result is implied by local checks.

The owner requested npm v4 publication through the existing trusted-publishing
tag workflow after final-candidate remote CI and approved master integration.
Local docs verification does not establish registry publication or project acceptance.

Dependency migrations:

The [dependency review](dependency-review.md) records retained packages,
compatibility holds and the outstanding tooling advisory.

- Keep TypeScript on 6.0.3 until the gates, migration tools and documentation
  builders migrate from the classic compiler API. TypeScript 7.0.2 exposes a
  different API; P-12 deliberately enforces 6.0.x.
- Keep `@tanstack/react-table` on 8.21.3 for this release. A 9.3.1 install trial
  fails `bun run typecheck --force` in both data-table blocks: `Column` and
  `Table` require new feature generics. Migration must cover sorting, visibility,
  consumer types and registry installation before changing the pin.
- Track the unpatched `braces` stack-exhaustion advisory through shadcn's
  `fast-glob`/`micromatch` tooling chain. Replace or update that upstream chain
  when a supported fix is available; the published package has no runtime
  dependencies. See the review for the advisory and current exposure limits.
