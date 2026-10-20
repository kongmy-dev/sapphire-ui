'use client';

import { type ComponentProps, type Ref, useRef } from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { useIsomorphicLayoutEffect } from '../../hooks/use-isomorphic-layout-effect.js';

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
  elementRef,
  tabIndex,
  ...props
}: ComponentProps<typeof Panel>) {
  const ref = useRef<HTMLDivElement>(null);
  useIsomorphicLayoutEffect(() => {
    const scrollport = ref.current?.querySelector('.sp-split-layout-panel');
    if (scrollport instanceof HTMLElement) scrollport.tabIndex = tabIndex ?? 0;
  }, [tabIndex]);
  useIsomorphicLayoutEffect(() => {
    const cleanup =
      typeof elementRef === 'function' ? elementRef(ref.current) : undefined;
    if (elementRef && typeof elementRef !== 'function')
      elementRef.current = ref.current;
    return () => {
      if (typeof cleanup === 'function') return cleanup();
      if (typeof elementRef === 'function') {
        elementRef(null);
        return;
      }
      if (elementRef) elementRef.current = null;
    };
  }, [elementRef]);
  return (
    <Panel
      {...props}
      elementRef={ref}
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
