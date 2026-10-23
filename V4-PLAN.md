# Sapphire UI 4.1 release

The owner authorized publication as 4.1.0. Early 4.x has one controlled consumer;
ADR-0011 records the deliberate versioning exception and the
[migration guide](docs/migrate-v4-1.md) lists the breaking changes.
Version 4.0.0 is already published. The registry stays at /r/v4/; the legacy /r/
distribution remains frozen.

## Release checks

1. Run the fresh integrated gate and package/registry consumer smokes for 4.1.0.
2. Push the candidate and require remote quality, accessibility and arm64 visual
   checks to pass before creating the release tag.
3. Publish v4.1.0 through the existing tag workflow. Its approved npm publish step
   uses trusted publishing and provenance; installs, builds and tests use Bun.
4. Verify the npm artifact, automated catalogue deployment and production registry
   with the published consumer smoke.

Publication, production deployment and consumer verification remain open until
those checks pass. Local checks alone do not establish release completion.

The CSS ceiling remains 24 KiB as recorded in ADR-0003. Visual pins change only
through reviewed bun run pin updates; the approved redesign pins are committed.
