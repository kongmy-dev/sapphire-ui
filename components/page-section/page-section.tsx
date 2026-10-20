import type { ComponentProps } from 'react';

const widths = ['sm', 'md', 'lg', 'xl', '7xl', 'full'] as const;
export type PageSectionProps = ComponentProps<'section'> & {
  heading?: string | undefined;
  subheading?: string | undefined;
  label?: string | undefined;
  maxWidth?: (typeof widths)[number] | undefined;
};

export function PageSection({
  heading,
  subheading,
  label,
  maxWidth = '7xl',
  className,
  children,
  ...props
}: PageSectionProps) {
  return (
    <section
      {...props}
      className={['sp-page-section', className].filter(Boolean).join(' ')}
      data-slot="page-section"
      data-size={maxWidth === '7xl' ? undefined : maxWidth}
    >
      {(label || heading || subheading) && (
        <div className="sp-page-section-header">
          {label && <span className="sp-page-section-label">{label}</span>}
          {heading && <h2 className="sp-page-section-title">{heading}</h2>}
          {subheading && (
            <p className="sp-page-section-description">{subheading}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
