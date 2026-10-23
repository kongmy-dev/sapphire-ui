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
  children:
    | ReactElement
    | ((field: {
        controlProps: Pick<
          ComponentProps<'button'>,
          'id' | 'aria-describedby' | 'aria-invalid' | 'aria-required'
        >;
        required: boolean;
      }) => ReactNode);
};

function controlId(value: unknown, fallback: string) {
  return typeof value === 'string' && value ? value : fallback;
}

function descriptionIds(value: unknown, message: string | undefined) {
  const existing = typeof value === 'string' ? value.trim().split(/\s+/) : [];
  return (
    [...new Set([...existing, ...(message ?? '').split(/\s+/)])]
      .filter(Boolean)
      .join(' ') || undefined
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
  return (
    <>
      {hint && (
        <p
          id={`${id}-hint`}
          className="sp-form-field-hint"
          data-slot="form-field-hint"
        >
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          className="sp-form-field-error"
          data-slot="form-field-error"
        >
          {error}
        </p>
      )}
    </>
  );
}

function fieldDescription({
  id,
  hint,
  error,
  existing,
}: {
  id: string;
  hint: ReactNode;
  error: ReactNode;
  existing?: unknown;
}) {
  const messages = [hint && `${id}-hint`, error && `${id}-error`]
    .filter(Boolean)
    .join(' ');
  return descriptionIds(existing, messages);
}

function nativeControl({
  children,
  id,
  required,
  hint,
  error,
}: FormFieldProps & { id: string; children: ReactElement }) {
  const child = Children.only(children);
  if (!isValidElement<Record<string, unknown>>(child))
    throw new Error('FormField requires one form control.');
  const fieldId = controlId(child.props.id, id);
  const isRequired = required || child.props.required === true;
  return {
    id: fieldId,
    required: isRequired,
    control: cloneElement(child, {
      id: fieldId,
      required: isRequired,
      'aria-required': isRequired || child.props['aria-required'],
      'aria-describedby': fieldDescription({
        id: fieldId,
        hint,
        error,
        existing: child.props['aria-describedby'],
      }),
      'aria-invalid': error ? true : child.props['aria-invalid'],
    }),
  };
}

function fieldControl({
  children,
  id,
  required = false,
  hint,
  error,
}: FormFieldProps & { id: string }) {
  if (typeof children !== 'function')
    return nativeControl({ children, id, required, hint, error });
  return {
    id,
    required,
    control: children({
      required,
      controlProps: {
        id,
        'aria-describedby': fieldDescription({ id, hint, error }),
        'aria-invalid': error ? true : undefined,
        'aria-required': required || undefined,
      },
    }),
  };
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
  const field = fieldControl({
    children,
    id: idProp || autoId,
    required,
    hint,
    error,
  });
  return (
    <div
      {...props}
      className={['sp-form-field', className].filter(Boolean).join(' ')}
      data-slot="form-field"
    >
      {label && (
        <Label htmlFor={field.id} required={field.required}>
          {label}
        </Label>
      )}
      {field.control}
      <FieldMessage id={field.id} error={error} hint={hint} />
    </div>
  );
}
