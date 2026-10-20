'use client';

import { RadioGroup as Primitive } from 'radix-ui';
import { type ComponentProps, type ReactNode, useId } from 'react';
import { Label } from '../label/label.js';

export function RadioGroup({
  className,
  ...props
}: ComponentProps<typeof Primitive.Root>) {
  return (
    <Primitive.Root
      {...props}
      className={['sp-radio-group', className].filter(Boolean).join(' ')}
      data-slot="radio-group"
    />
  );
}

export type RadioGroupItemProps = ComponentProps<typeof Primitive.Item> & {
  label?: ReactNode;
  description?: ReactNode;
};

export function RadioGroupItem({
  className,
  label,
  description,
  id: idProp,
  'aria-describedby': describedBy,
  ...props
}: RadioGroupItemProps) {
  const autoId = useId();
  const id = idProp || autoId;
  const descriptionId = description ? `${id}-desc` : undefined;
  return (
    <div className="sp-radio-group-option" data-slot="radio-group-option">
      <Primitive.Item
        {...props}
        id={id}
        aria-describedby={
          [describedBy, descriptionId].filter(Boolean).join(' ') || undefined
        }
        className={['sp-radio-group-item', className].filter(Boolean).join(' ')}
        data-slot="radio-group-item"
      >
        <Primitive.Indicator
          className="sp-radio-group-indicator"
          data-slot="radio-group-indicator"
        >
          <span className="sp-radio-group-dot" />
        </Primitive.Indicator>
      </Primitive.Item>
      {(label || description) && (
        <div className="sp-radio-group-text">
          {label && <Label htmlFor={id}>{label}</Label>}
          {description && (
            <span id={descriptionId} className="sp-radio-group-description">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
