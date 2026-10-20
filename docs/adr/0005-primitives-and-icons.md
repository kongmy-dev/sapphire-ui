# ADR-0005: Behaviour primitives, SVG icons and validated storage

**Status:** accepted

## Decision

Behavioural components use the unified optional `radix-ui` peer. Components without that behaviour import no Radix; their `asChild` composition uses the maintained local Slot implementation. React 19 refs are props, without `forwardRef` or `displayName`, and component parts expose `data-slot`.

Lucide geometry is the icon system. Internal close, chevron and check glyphs are inline SVG, so the package has no icon runtime dependency or font request. Application-facing icon props accept React elements rather than icon names. Applications may import `lucide-react`; plain HTML uses SVG with `sp-icon`. The former name-based Icon component becomes the CSS class rather than an export that bundles every glyph. IconMark no longer has a filled mode.

All public component families remain supported, including native elements, Analytics, CookieBanner, SEOHead and editorial layouts. Native tags, methods, events, attributes, slots and content node identity are public contracts. Server-safe imports do not fabricate an HTMLElement constructor.

`useLocalStorage` requires `(key, fallback, parse)`. The parser receives unknown JSON and returns the validated value; throwing rejects it. Returning undefined is valid when included in the value type. Missing, inaccessible or invalid stored data uses the fallback. SSR and initial hydration also use the fallback.

The setter retains React's value/updater convention, including wrapped function values. Storage write failures retain the in-memory update. Key changes and cross-tab updates, removals and clear events follow the same validation and fallback contract. A parser is required because generic type parameters cannot validate untrusted JSON.

## Consequences

Behaviour and Slot ownership require keyboard, state, ref, lifecycle and SSR tests through public APIs. Migration reports string icons for manual conversion to elements; it must not guess an icon's intended meaning. Examples, strict accessibility checks and coverage accompany each supported component rather than replacing behaviour with styled markup.
