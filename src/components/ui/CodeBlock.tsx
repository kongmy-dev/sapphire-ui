import { forwardRef, useState, useCallback, type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface CodeBlockProps extends Omit<HTMLAttributes<HTMLPreElement>, 'children'> {
  /** Raw code string. */
  code: string;
  /** Language hint (e.g. "ts", "tsx", "css"). Sets data-lang for syntax
   *  highlighters that key off it. Does NOT highlight automatically —
   *  syntax highlighting is left to the consumer (Shiki, Prism, etc.). */
  language?: string;
  /** Show a "copy to clipboard" button in the top-right corner. */
  copyable?: boolean;
  /** Visual variant. */
  variant?: 'dark' | 'light';
}

/**
 * Styled <pre><code> block. By design this does NOT bundle a syntax
 * highlighter — consumers pre-render highlighted markup (Shiki at build,
 * Prism at runtime, etc.) and pass the result as `code`, or wrap the
 * highlighter's output node directly.
 *
 * The `language` prop is forwarded as `data-lang` for highlighters that
 * use class/attribute selectors.
 */
const CodeBlock = forwardRef<HTMLPreElement, CodeBlockProps>(
  ({ className, code, language, copyable, variant = 'dark', ...props }, ref) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        // Clipboard API blocked (insecure context, denied permission).
        // Silently no-op; consumer can detect lack of feedback.
      }
    }, [code]);

    return (
      <div className="relative group">
        <pre
          ref={ref}
          data-lang={language}
          className={cn(
            'font-mono text-[13px] leading-relaxed overflow-x-auto m-0',
            'rounded-[var(--radius-sm)] p-4',
            variant === 'dark' && 'bg-[var(--color-primary)] text-[var(--color-text-on-dark)]',
            variant === 'light' && 'bg-[var(--color-surface)] text-[var(--color-text-main)] border border-[var(--color-border)]',
            className,
          )}
          {...props}
        >
          <code>{code}</code>
        </pre>
        {copyable && (
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? 'Copied' : 'Copy code to clipboard'}
            className={cn(
              'absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-mono cursor-pointer transition-opacity',
              'opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
              variant === 'dark' && 'bg-white/10 text-[var(--color-text-on-dark)] hover:bg-white/20 border-none',
              variant === 'light' && 'bg-white text-[var(--color-text-muted)] border border-[var(--color-border)] hover:bg-[var(--color-surface)]',
              'focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:outline-none',
            )}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
      </div>
    );
  },
);
CodeBlock.displayName = 'CodeBlock';

export { CodeBlock };
