import type { ComponentProps, ReactNode } from 'react';

export type PassphraseGateProps = Omit<ComponentProps<'div'>, 'title'> & {
  isHidden?: boolean | undefined;
  brandMark?: ReactNode;
  brandName?: ReactNode;
  title?: ReactNode;
  documentTitle?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
};

export function PassphraseGate({
  className,
  isHidden = false,
  brandMark,
  brandName,
  title = 'Protected Document',
  documentTitle,
  description,
  children,
  ...props
}: PassphraseGateProps) {
  return (
    <div
      {...props}
      hidden={isHidden}
      className={['sp-passphrase-gate', className].filter(Boolean).join(' ')}
      data-slot="passphrase-gate"
      data-hidden={isHidden || undefined}
    >
      <div className="sp-passphrase-gate-card">
        {(brandMark || brandName) && (
          <div className="sp-passphrase-gate-brand">
            {brandMark && (
              <div className="sp-passphrase-gate-mark">{brandMark}</div>
            )}
            {brandName && <span>{brandName}</span>}
          </div>
        )}
        <h2 className="sp-passphrase-gate-title">{title}</h2>
        {documentTitle && (
          <div className="sp-passphrase-gate-document">{documentTitle}</div>
        )}
        {description && (
          <p className="sp-passphrase-gate-description">{description}</p>
        )}
        {children}
      </div>
    </div>
  );
}
