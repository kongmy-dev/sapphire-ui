import { useCallback, useEffect, useState } from 'react';

type SetValue<T> = (value: T | ((prev: T) => T)) => void;

function readFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

/**
 * `useState` that syncs to `window.localStorage` under a stable key.
 *
 *   const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
 *
 * Behavior:
 *  - Reads the persisted value lazily in the initializer (SSR-safe; on the
 *    server the fallback is used, which matches the first client render).
 *  - Writes JSON-serialized value on every change.
 *  - Listens to the cross-tab `storage` event so multiple tabs stay in sync.
 *  - Falls back to `initialValue` on read/write errors (private browsing, etc.).
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, SetValue<T>] {
  const [value, setValue] = useState<T>(() => readFromStorage(key, initialValue));

  const setStoredValue = useCallback<SetValue<T>>(
    (next) => {
      setValue((prev) => {
        const resolved =
          typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // Storage may be full or disabled; mirror in memory anyway.
        }
        return resolved;
      });
    },
    [key],
  );

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key !== key || event.newValue === null) return;
      try {
        setValue(JSON.parse(event.newValue) as T);
      } catch {
        // Ignore unparseable cross-tab writes.
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key]);

  return [value, setStoredValue];
}
