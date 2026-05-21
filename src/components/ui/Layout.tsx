import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface LayoutProps extends HTMLAttributes<HTMLDivElement> {
  /** Slot rendered at the top of the page, above sidebar+main. Typically a SiteHeader. */
  header?: ReactNode;
  /** Optional left-rail sidebar rendered alongside main content. */
  sidebar?: ReactNode;
  /** Slot rendered at the bottom, below sidebar+main. Typically a SiteFooter. */
  footer?: ReactNode;
  /** Class merged into the inner <main> wrapper (for padding, max-width, etc.). */
  mainClassName?: string;
  children: ReactNode;
}

/**
 * Canonical page shell for kongmy.dev apps. Orchestrates the shared
 * header → (sidebar + main) → footer layout used across landing-page,
 * blog.kongmy.dev, web-toolbox, and the sapphire-ui docs site.
 *
 *   <Layout
 *     header={<SiteHeader brand={...} nav={...} />}
 *     footer={<SiteFooter brand={...} links={...} />}
 *   >
 *     <Routes>{...}</Routes>
 *   </Layout>
 *
 * All slots are optional. For app shells with a side rail (docs, dashboards)
 * pass the rail via `sidebar`.
 */
const Layout = forwardRef<HTMLDivElement, LayoutProps>(
  ({ header, sidebar, footer, mainClassName, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'min-h-screen flex flex-col bg-[var(--color-surface)]',
          className,
        )}
        {...props}
      >
        {header}
        <div className={cn('flex flex-1 min-h-0', sidebar ? '' : 'flex-col')}>
          {sidebar}
          <main className={cn('flex-1 min-w-0', mainClassName)}>
            {children}
          </main>
        </div>
        {footer}
      </div>
    );
  },
);
Layout.displayName = 'Layout';

export { Layout };
