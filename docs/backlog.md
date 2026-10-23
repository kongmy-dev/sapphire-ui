# Open work

The owner authorized the product-layout redesign (ADR-0011) as release 4.1.0.
Its breaking contracts and manual choices are in
[the migration guide](migrate-v4-1.md). Complete the remote CI, publication,
automated catalogue deployment and published consumer checks in V4-PLAN.md.
The registry remains at /r/v4/; the legacy /r/ distribution remains frozen.

- Revisit the narrow avatar screenshot colour tolerance in ADR-0011 when
  the pinned browser changes. The underlying circular-edge rendering cause
  remains unproven; retain the reviewed baseline and all other strict captures.

Dependency migrations:

The [dependency review](dependency-review.md) records retained packages,
the TypeScript hold and the locally mitigated tooling advisory.

- Keep TypeScript on 6.0.3 until the gates, migration tools and documentation
  builders migrate from the classic compiler API. TypeScript 7.0.2 exposes a
  different API; P-12 deliberately enforces 6.0.x.
- Replace the local `braces` patch when upstream publishes a supported release
  with equivalent traversal bounds. Retain the security regressions and the
  installed-CLI wrapper; version-based audit output remains open until then.
