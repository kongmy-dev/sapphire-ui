import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface PageSectionProps extends HTMLAttributes<HTMLElement> {
  /** Section heading (h2) */
  heading?: string;
  /** Subheading / description */
  subheading?: string;
  /** Small uppercase label above the heading */
  label?: string;
  /** Max width constraint. Defaults to 7xl (80rem). */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '7xl' | 'full';
  children: ReactNode;
}

const maxWidthMap = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '7xl': '80rem',
  full: '100%',
};

const PageSection = forwardRef<HTMLElement, PageSectionProps>(
  ({ className, heading, subheading, label, maxWidth = '7xl', children, ...props }, ref) => (
    <section
      ref={ref}
      className={cn(
        'mx-auto w-full px-6 py-16 md:py-24',
        className,
      )}
      style={{ maxWidth: maxWidthMap[maxWidth] }}
      {...props}
    >
      {(label || heading || subheading) && (
        <div className="mb-10 md:mb-14">
          {label && (
            <span className="mb-3 block font-mono text-xs font-bold tracking-widest text-accent uppercase">
              {label}
            </span>
          )}
          {heading && (
            <h2 className="m-0 font-serif text-[clamp(1.5rem,3vw,2.5rem)] leading-tight font-bold text-(--color-text-strong)">
              {heading}
            </h2>
          )}
          {subheading && (
            <p className="m-0 mt-3 max-w-[640px] font-sans text-base/relaxed text-(--color-text-muted) md:text-lg">
              {subheading}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  ),
);
PageSection.displayName = 'PageSection';

export { PageSection };
