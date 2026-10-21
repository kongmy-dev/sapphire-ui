# ADR-0008: Runnable hook guides and copyable usage

**Status:** accepted

## Decision

Keep the current static routes and public APIs. Mount six small React hook demos
only on the hooks guide, using the shipped hooks. Show input and observable output,
including clipboard failure, persistent storage, viewport changes, outside focus
and layout measurement.

Each component example has a collapsed usage disclosure. JSX comes from the named
example and its local dependencies, with package entry imports. Rendered HTML comes
from the first mounted React preview. Native snippets capture authored custom-element
markup before connection, omitting demo controls and generated internals. Label React
HTML as initial rendered markup: React handlers and portalled
content require React and are not reproduced by copying static HTML. Native HTML
continues to require the registration listed under Setup.

Copy controls report success or failure beside their source and retain manual
selection. Include example-only install requirements and demo styles alongside JSX.
Purpose text is maintained with the catalogue, distinct from generated
API tables. Shell descriptions follow the page introduction; the version comes
from the package manifest. Migration material and redirects remain outside scope.

## Why

Named examples already own behaviour and browser verification. Extracting their
dependency closure avoids a second handwritten component inventory and keeps
stateful usage complete. A browser HTML capture preserves the actual rendered
contract without pretending server rendering includes portals. Disclosures keep
long examples accessible without displacing the preview or API reference.

## Verification

Builder tests cover source extraction, escaping and metadata. Browser checks cover
all six hook interactions, copy success and denial, repeated navigation, keyboard
focus, light and dark schemes, narrow viewports and accessible names. Existing
component examples and visual pins retain their names and rendering.
