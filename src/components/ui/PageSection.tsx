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
        'w-full mx-auto px-6 py-16 md:py-24',
        className,
      )}
      style={{ maxWidth: maxWidthMap[maxWidth] }}
      {...props}
    >
      {(label || heading || subheading) && (
        <div className="mb-10 md:mb-14">
          {label && (
            <span className="block font-mono text-xs font-bold uppercase tracking-[0.1em] text-[var(--color-accent)] mb-3">
              {label}
            </span>
          )}
          {heading && (
            <h2 className="font-serif font-bold text-[clamp(1.5rem,3vw,2.5rem)] text-[var(--color-primary)] leading-tight m-0">
              {heading}
            </h2>
          )}
          {subheading && (
            <p className="font-sans text-base md:text-lg text-[var(--color-text-muted)] mt-3 leading-relaxed max-w-[640px] m-0 mt-3">
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
