import type { ComponentProps, ReactNode } from 'react';

export type ProposalLayoutProps = ComponentProps<'div'> & {
  children: ReactNode;
  brandMark?: ReactNode;
  brandName?: ReactNode;
  breadcrumbs?: ReactNode;
  metadata?: ReactNode;
};

export function ProposalLayout({
  className,
  children,
  brandMark,
  brandName,
  breadcrumbs,
  metadata,
  ...props
}: ProposalLayoutProps) {
  return (
    <div
      {...props}
      className={['sp-proposal-layout', className].filter(Boolean).join(' ')}
      data-slot="proposal-layout"
    >
      <div className="sp-document-bar">
        {brandMark && <div className="sp-document-mark">{brandMark}</div>}
        {brandName && <div className="sp-document-wordmark">{brandName}</div>}
        {breadcrumbs && (
          <>
            <svg
              className="sp-icon sp-document-bar-separator"
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
            <div className="sp-document-crumb">{breadcrumbs}</div>
          </>
        )}
        {metadata && <div className="sp-document-bar-meta">{metadata}</div>}
      </div>
      <div className="sp-document-shell">{children}</div>
    </div>
  );
}

export type ProposalHeroProps = Omit<ComponentProps<'div'>, 'title'> & {
  eyebrow?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  metaRows?: { label: string; value: ReactNode }[] | undefined;
};

export function ProposalHero({
  className,
  eyebrow,
  title,
  lede,
  metaRows,
  ...props
}: ProposalHeroProps) {
  return (
    <div
      {...props}
      className={['sp-document-hero', className].filter(Boolean).join(' ')}
      data-slot="proposal-hero"
    >
      {eyebrow && <div className="sp-document-eyebrow">{eyebrow}</div>}
      <h1>{title}</h1>
      {lede && <p className="sp-document-lede">{lede}</p>}
      {metaRows && metaRows.length > 0 && (
        <dl className="sp-document-hero-meta">
          {metaRows.map((row, index) => (
            <div key={`meta-${index}`}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

export type ProposalSectionProps = Omit<ComponentProps<'section'>, 'title'> & {
  sectionNo?: string | undefined;
  title: ReactNode;
  lede?: ReactNode;
  children: ReactNode;
};

export function ProposalSection({
  className,
  sectionNo,
  title,
  lede,
  children,
  ...props
}: ProposalSectionProps) {
  return (
    <section
      {...props}
      className={['sp-document-section', className].filter(Boolean).join(' ')}
      data-slot="proposal-section"
    >
      {sectionNo && (
        <div className="sp-document-section-number">{sectionNo}</div>
      )}
      <h2>{title}</h2>
      {lede && <p className="sp-document-lede">{lede}</p>}
      {children}
    </section>
  );
}
