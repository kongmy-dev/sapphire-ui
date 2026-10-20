'use client';

import {
  Children,
  type ComponentProps,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useId,
} from 'react';
import { Label } from '../label/label.js';

export type FormFieldProps = Omit<ComponentProps<'div'>, 'children'> & {
  label?: ReactNode;
  required?: boolean | undefined;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactElement;
};

function controlId(value: unknown, fallback: string) {
  return typeof value === 'string' && value ? value : fallback;
}

function descriptionIds(value: unknown, message: string | undefined) {
  const existing = typeof value === 'string' ? value.trim().split(/\s+/) : [];
  return (
    [...new Set([...existing, message])].filter(Boolean).join(' ') || undefined
  );
}

function FieldMessage({
  id,
  error,
  hint,
}: {
  id: string;
  error: ReactNode;
  hint: ReactNode;
}) {
  if (error)
    return (
      <p
        id={`${id}-error`}
        className="sp-form-field-error"
        data-slot="form-field-error"
      >
        {error}
      </p>
    );
  if (hint)
    return (
      <p
        id={`${id}-hint`}
        className="sp-form-field-hint"
        data-slot="form-field-hint"
      >
        {hint}
      </p>
    );
  return null;
}

function messageId(id: string, error: ReactNode, hint: ReactNode) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
}

export function FormField({
  className,
  label,
  required,
  hint,
  error,
  children,
  id: idProp,
  ...props
}: FormFieldProps) {
  const autoId = useId();
  const child = Children.only(children);
  if (!isValidElement<Record<string, unknown>>(child))
    throw new Error('FormField requires one form control.');
  const id = controlId(child.props.id, idProp || autoId);
  const isRequired = required || child.props.required === true;
  const describedBy = descriptionIds(
    child.props['aria-describedby'],
    messageId(id, error, hint),
  );
  const control = cloneElement(child, {
    id,
    required: isRequired,
    'aria-describedby': describedBy,
    'aria-invalid': error ? true : child.props['aria-invalid'],
  });
  return (
    <div
      {...props}
      className={['sp-form-field', className].filter(Boolean).join(' ')}
      data-slot="form-field"
    >
      {label && (
        <Label htmlFor={id} required={isRequired}>
          {label}
        </Label>
      )}
      {control}
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  );
}
