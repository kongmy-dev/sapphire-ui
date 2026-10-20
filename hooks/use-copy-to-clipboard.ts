'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type UseCopyToClipboardOptions = { resetMs?: number };

export type UseCopyToClipboardReturn = {
  copied: string | null;
  isCopied: boolean;
  copy: (text: string) => Promise<boolean>;
};

export function useCopyToClipboard({
  resetMs = 2000,
}: UseCopyToClipboardOptions = {}): UseCopyToClipboardReturn {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(false);
  const sequence = useRef(0);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      sequence.current += 1;
      if (timer.current !== null) clearTimeout(timer.current);
    };
  }, []);
  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      const request = ++sequence.current;
      try {
        if (typeof navigator === 'undefined' || !navigator.clipboard)
          return false;
        await navigator.clipboard.writeText(text);
        if (!mounted.current || request !== sequence.current) return true;
        if (timer.current !== null) clearTimeout(timer.current);
        setCopied(text);
        timer.current = setTimeout(() => setCopied(null), resetMs);
        return true;
      } catch {
        return false;
      }
    },
    [resetMs],
  );
  return { copied, isCopied: copied !== null, copy };
}
