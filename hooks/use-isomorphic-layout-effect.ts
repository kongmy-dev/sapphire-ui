'use client';

import {
  type DependencyList,
  type EffectCallback,
  useEffect,
  useLayoutEffect,
} from 'react';

export function useIsomorphicLayoutEffect(
  effect: EffectCallback,
  dependencies?: DependencyList,
): void {
  const useEffectForEnvironment =
    typeof window === 'undefined' ? useEffect : useLayoutEffect;
  useEffectForEnvironment(effect, dependencies);
}
