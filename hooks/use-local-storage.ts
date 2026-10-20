'use client';

import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

type StorageOptions<T> = { fallback: T; parse: (value: unknown) => T };

function decoded<T>(raw: string | null, options: StorageOptions<T>): T {
  if (raw === null) return options.fallback;
  try {
    const value: unknown = JSON.parse(raw);
    return options.parse(value);
  } catch {
    return options.fallback;
  }
}

function stored<T>(key: string, options: StorageOptions<T>): T {
  try {
    return decoded(window.localStorage.getItem(key), options);
  } catch {
    return options.fallback;
  }
}

function persist<T>(key: string, value: T): void {
  try {
    const raw = JSON.stringify(value);
    if (raw === undefined) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, raw);
  } catch {
    return;
  }
}

const isUpdater = <T>(value: SetStateAction<T>): value is (previous: T) => T =>
  typeof value === 'function';

export function useLocalStorage<T>(
  key: string,
  fallback: T,
  parse: (value: unknown) => T,
): [T, Dispatch<SetStateAction<T>>] {
  const options = useRef({ fallback, parse });
  options.current = { fallback, parse };
  const [state, setState] = useState(() => ({ key, value: fallback }));
  const current = useRef(state);
  current.current = state;
  const update = useCallback<Dispatch<SetStateAction<T>>>(
    (action) => {
      const previous =
        current.current.key === key
          ? current.current.value
          : options.current.fallback;
      const value = isUpdater(action) ? action(previous) : action;
      current.current = { key, value };
      setState({ key, value });
      persist(key, value);
    },
    [key],
  );
  useEffect(() => {
    const receive = (value: T) => {
      current.current = { key, value };
      setState({ key, value });
    };
    receive(stored(key, options.current));
    const changed = (event: StorageEvent) => {
      if (event.key !== null && event.key !== key) return;
      if (event.storageArea !== null) {
        try {
          if (event.storageArea !== window.localStorage) return;
        } catch {
          return;
        }
      }
      receive(decoded(event.newValue, options.current));
    };
    window.addEventListener('storage', changed);
    return () => window.removeEventListener('storage', changed);
  }, [key]);
  return [state.key === key ? state.value : fallback, update];
}
