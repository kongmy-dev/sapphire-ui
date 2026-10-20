'use client';

import type { ComponentProps, Ref } from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';

export function SplitLayout({
  className,
  ...props
}: ComponentProps<typeof Group>) {
  return (
    <Group
      {...props}
      className={['sp-split-layout', className].filter(Boolean).join(' ')}
      data-slot="split-layout"
    />
  );
}

export function SplitPanel({
  className,
  ...props
}: ComponentProps<typeof Panel>) {
  return (
    <Panel
      {...props}
      className={['sp-split-layout-panel', className].filter(Boolean).join(' ')}
      data-slot="split-panel"
    />
  );
}

export function SplitHandle({
  className,
  withHandle,
  ref,
  elementRef,
  ...props
}: ComponentProps<typeof Separator> & {
  withHandle?: boolean | undefined;
  ref?: Ref<HTMLDivElement> | undefined;
}) {
  return (
    <Separator
      {...props}
      elementRef={elementRef ?? ref}
      className={['sp-split-layout-handle', className]
        .filter(Boolean)
        .join(' ')}
      data-slot="split-handle"
    >
      {withHandle && (
        <div className="sp-split-layout-grip" aria-hidden="true">
          <svg
            aria-hidden="true"
            className="sp-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          >
            <path d="M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01" />
          </svg>
        </div>
      )}
    </Separator>
  );
}
