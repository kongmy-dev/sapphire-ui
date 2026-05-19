import { useEffect, useState } from 'react';

/**
 * Debounce a fast-changing value. Returns the latest value only after
 * `delay` ms have elapsed since the last change.
 *
 *   const [query, setQuery] = useState('');
 *   const debouncedQuery = useDebounce(query, 300);
 *
 * @param value Any serializable value to debounce.
 * @param delay Milliseconds to wait between changes. Defaults to 300.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);

  return debounced;
}
