'use client';

import type { ComponentProps } from 'react';
import { useCopyToClipboard } from '../../hooks/use-copy-to-clipboard.js';

const variants = ['dark', 'light'] as const;
export type CodeBlockProps = Omit<ComponentProps<'pre'>, 'children'> & {
  code: string;
  language?: string | undefined;
  copyable?: boolean | undefined;
  variant?: (typeof variants)[number] | undefined;
};

export function CodeBlock({
  code,
  language,
  copyable,
  variant = 'dark',
  className,
  ...props
}: CodeBlockProps) {
  const { copy, isCopied } = useCopyToClipboard({ resetMs: 1500 });
  return (
    <div
      className="sp-code-block"
      data-slot="code-block"
      data-variant={variant === 'dark' ? 'dark' : undefined}
    >
      <pre
        {...props}
        data-lang={language}
        className={['sp-code-block-pre', className].filter(Boolean).join(' ')}
      >
        <code>{code}</code>
      </pre>
      {copyable && (
        <button
          type="button"
          className="sp-code-block-copy"
          onClick={() => copy(code)}
          aria-label={isCopied ? 'Copied' : 'Copy code to clipboard'}
        >
          {isCopied ? 'Copied!' : 'Copy'}
        </button>
      )}
    </div>
  );
}
