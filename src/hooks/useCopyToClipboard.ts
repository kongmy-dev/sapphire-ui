import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseCopyToClipboardOptions {
  /** Milliseconds before `copied` flips back to false. Defaults to 2000. */
  resetMs?: number;
}

export interface UseCopyToClipboardReturn {
  /** Most recently copied text (null until first successful copy). */
  copied: string | null;
  /** True for `resetMs` after a successful copy. */
  isCopied: boolean;
  /** Copy a string; resolves to `true` on success, `false` on failure. */
  copy: (text: string) => Promise<boolean>;
}

/**
 * Wraps `navigator.clipboard.writeText` with a transient "just copied" flag
 * so a docs example or button can show a checkmark without orchestrating its
 * own timer. Falls back to a no-op on environments without the Clipboard API
 * (very old browsers, insecure contexts).
 */
export function useCopyToClipboard(
  options: UseCopyToClipboardOptions = {},
): UseCopyToClipboardReturn {
  const { resetMs = 2000 } = options;
  const [copied, setCopied] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      if (typeof navigator === 'undefined' || !navigator.clipboard) {
        return false;
      }
      try {
        await navigator.clipboard.writeText(text);
        setCopied(text);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(null), resetMs);
        return true;
      } catch {
        return false;
      }
    },
    [resetMs],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { copied, isCopied: copied !== null, copy };
}
