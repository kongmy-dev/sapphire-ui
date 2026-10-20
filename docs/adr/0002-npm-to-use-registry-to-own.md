# ADR-0002: Package to use; registry to own

**Status:** accepted

## Decision

The package provides maintained components and CSS. The registry provides source that an application owns and may change. Both derive from the same component folders; registry blocks compose those public primitives.

The package is file-for-file ESM with declarations and exact generated public exports. There is no root barrel or CommonJS entry. Exact subpaths exclude implementation helpers and test support; packed consumer tests prove internal imports are denied. CSS foundations, individual component styles, fonts and the full `sapphire.css` entry are independently available.

There are zero runtime dependencies and four optional peers: `react`, `react-dom`, `radix-ui` and `react-resizable-panels`. Consumers install only what their chosen entries require. SplitLayout retains the fourth peer to preserve sizing, persistence, collapse and imperative behaviour rather than replacing that contract with a partial implementation.

CSS-only and raw SEO consumers require no React. Native element modules import safely on servers; their constructors are undefined there and concrete classes in browsers. Side-effect registration imports must survive bundling.

The versioned `/r/v4` registry installs the package foundations and copies component source with exact dependency declarations. Existing `/r` assets remain frozen. Applications choose one owner for a component's CSS; package and vendored styles must not accidentally style the same class twice.

## Release boundary

Bun is the toolchain for installation, builds, tests, packing and registry validation. The sole npm CLI exception is publishing from the protected release CI job using trusted OIDC authentication and provenance. Local publishing and stored npm tokens are not the release path. Revisit the exception when Bun supports the required publishing guarantees.

## Verification

Packed tests cover public imports, declarations, optional peer isolation, native SSR and side-effect registration. Registry smoke tests use the pinned real CLI, typecheck and build the consumer, check both CSS import orders and preserve vendored customization during compatible updates. A registry copy belongs to its application; package upgrades do not overwrite it.
