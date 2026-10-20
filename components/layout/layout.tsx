import type { ComponentProps, ReactNode } from 'react';

export type LayoutProps = ComponentProps<'div'> & {
  header?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  mainClassName?: string | undefined;
};

export function Layout({
  header,
  sidebar,
  footer,
  mainClassName,
  children,
  className,
  ...props
}: LayoutProps) {
  return (
    <div
      {...props}
      className={['sp-layout', className].filter(Boolean).join(' ')}
      data-slot="layout"
    >
      {header}
      <div
        className="sp-layout-body"
        data-sidebar={Boolean(sidebar) || undefined}
      >
        {sidebar}
        <main
          className={['sp-layout-main', mainClassName]
            .filter(Boolean)
            .join(' ')}
        >
          {children}
        </main>
      </div>
      {footer}
    </div>
  );
}
