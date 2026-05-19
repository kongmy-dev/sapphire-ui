import { useEffect, useLayoutEffect } from 'react';

/**
 * `useLayoutEffect` that quietly falls back to `useEffect` during SSR.
 *
 * React warns when `useLayoutEffect` runs on the server because there is no
 * DOM to mutate before paint. This shim picks the right hook based on
 * whether `window` exists. Use it inside any hook or component that *might*
 * be rendered on the server (Next.js, Astro, Remix, Vike).
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
