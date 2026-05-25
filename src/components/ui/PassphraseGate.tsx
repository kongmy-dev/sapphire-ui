import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface PassphraseGateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  isHidden?: boolean;
  brandMark?: ReactNode;
  brandName?: ReactNode;
  title?: ReactNode;
  documentTitle?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}

export const PassphraseGate = forwardRef<HTMLDivElement, PassphraseGateProps>(
  ({ className, isHidden = false, brandMark, brandName, title = 'Protected Document', documentTitle, description, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('gate', isHidden && 'is-hidden', className)} {...props}>
        <div className="gate-card">
          {(brandMark || brandName) && (
            <div className="gate-brand">
              {brandMark && <div className="sf-mark">{brandMark}</div>}
              {brandName && <span>{brandName}</span>}
            </div>
          )}
          
          <h2>{title}</h2>
          {documentTitle && <div className="gate-doc">{documentTitle}</div>}
          {description && <p className="muted">{description}</p>}
          
          {children}
        </div>
      </div>
    );
  }
);
PassphraseGate.displayName = 'PassphraseGate';
