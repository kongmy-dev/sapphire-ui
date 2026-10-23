'use client';

import { type ComponentProps, type ReactNode, useId } from 'react';

export type FormSectionProps = ComponentProps<'fieldset'> & {
  legend: ReactNode;
  description?: ReactNode;
};

export function FormSection({
  className,
  legend,
  description,
  children,
  'aria-describedby': describedBy,
  ...props
}: FormSectionProps) {
  const descriptionId = useId();
  const descriptions =
    [describedBy, description && descriptionId].filter(Boolean).join(' ') ||
    undefined;
  return (
    <fieldset
      {...props}
      aria-describedby={descriptions}
      className={['sp-form-section', className].filter(Boolean).join(' ')}
      data-slot="form-section"
    >
      <legend className="sp-form-section-legend">{legend}</legend>
      {description && (
        <p id={descriptionId} className="sp-form-section-description">
          {description}
        </p>
      )}
      <div className="sp-form-section-body">{children}</div>
    </fieldset>
  );
}
