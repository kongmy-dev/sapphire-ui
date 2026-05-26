import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface ProposalLayoutProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  brandMark?: ReactNode;
  brandName?: ReactNode;
  breadcrumbs?: ReactNode;
  metadata?: ReactNode;
}

export const ProposalLayout = forwardRef<HTMLDivElement, ProposalLayoutProps>(
  ({ className, children, brandMark, brandName, breadcrumbs, metadata, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('bg-page min-h-screen font-sans text-primary', className)} {...props}>
        {/* Document Bar */}
        <div className="doc-bar">
          {brandMark && <div className="sf-mark">{brandMark}</div>}
          {brandName && <div className="wm">{brandName}</div>}
          {breadcrumbs && <div className="crumb">{breadcrumbs}</div>}
          {metadata && <div className="doc-meta">{metadata}</div>}
        </div>
        
        {/* Document Shell */}
        <div className="doc-shell">
          {children}
        </div>
      </div>
    );
  }
);
ProposalLayout.displayName = 'ProposalLayout';

export interface ProposalHeroProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  eyebrow?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  metaRows?: Array<{ label: string; value: ReactNode }>;
}

export const ProposalHero = forwardRef<HTMLDivElement, ProposalHeroProps>(
  ({ className, eyebrow, title, lede, metaRows, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('doc-hero', className)} {...props}>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {lede && <p className="lede">{lede}</p>}
        
        {metaRows && metaRows.length > 0 && (
          <dl className="meta-row">
            {metaRows.map((row, i) => (
              <div key={i}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    );
  }
);
ProposalHero.displayName = 'ProposalHero';

export interface ProposalSectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  sectionNo?: string;
  title: ReactNode;
  lede?: ReactNode;
  children: ReactNode;
}

export const ProposalSection = forwardRef<HTMLElement, ProposalSectionProps>(
  ({ className, sectionNo, title, lede, children, ...props }, ref) => {
    return (
      <section ref={ref} className={cn('doc-section', className)} {...props}>
        {sectionNo && <div className="sec-no">{sectionNo}</div>}
        <h2>{title}</h2>
        {lede && <p className="lede">{lede}</p>}
        {children}
      </section>
    );
  }
);
ProposalSection.displayName = 'ProposalSection';
