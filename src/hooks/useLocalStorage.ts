import { useCallback, useEffect, useState } from 'react';

type SetValue<T> = (value: T | ((prev: T) => T)) => void;

/**
 * `useState` that syncs to `window.localStorage` under a stable key.
 *
 *   const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
 *
 * Behavior:
 *  - Reads the persisted value on mount (after first render) to stay SSR-safe.
 *  - Writes JSON-serialized value on every change.
 *  - Listens to the cross-tab `storage` event so multiple tabs stay in sync.
 *  - Falls back to `initialValue` on read/write errors (private browsing, etc.).
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, SetValue<T>] {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      // Ignore corrupt or inaccessible storage.
    }
  }, [key]);

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
