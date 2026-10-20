'use client';

import { Checkbox as Primitive } from 'radix-ui';
import { type ComponentProps, useId } from 'react';
import { Label } from '../label/label.js';

export type CheckboxProps = Omit<
  ComponentProps<typeof Primitive.Root>,
  'asChild'
> & {
  label?: string | undefined;
  description?: string | undefined;
};

export function Checkbox({
  className,
  label,
  description,
  id: idProp,
  'aria-describedby': describedBy,
  ...props
}: CheckboxProps) {
  const autoId = useId();
  const id = idProp || autoId;
  const descriptionId = description ? `${id}-desc` : undefined;
  return (
    <div className="sp-checkbox-field" data-slot="checkbox-field">
      <Primitive.Root
        {...props}
        id={id}
        aria-describedby={
          [describedBy, descriptionId].filter(Boolean).join(' ') || undefined
        }
        className={['sp-checkbox', className].filter(Boolean).join(' ')}
        data-slot="checkbox"
      >
        <Primitive.Indicator
          className="sp-checkbox-indicator"
          data-slot="checkbox-indicator"
        >
          <svg
            className="sp-checkbox-check"
            viewBox="0 0 10 10"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M1.5 5.5 4 8l4.5-5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="sp-checkbox-dash" />
        </Primitive.Indicator>
      </Primitive.Root>
      {(label || description) && (
        <div className="sp-checkbox-text">
          {label && <Label htmlFor={id}>{label}</Label>}
          {description && (
            <span id={descriptionId} className="sp-checkbox-description">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
