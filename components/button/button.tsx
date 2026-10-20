'use client';

import {
  type ComponentProps,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import { Slot } from '../../lib/slot.js';

const variants = [
  'primary',
  'outline',
  'ghost',
  'brand',
  'on-dark-primary',
  'on-dark-outline',
  'link',
  'premium',
  'destructive',
  'destructive-outline',
  'destructive-ghost',
] as const;
const sizes = [
  'xs',
  'sm',
  'default',
  'lg',
  'xl',
  'icon-sm',
  'icon',
  'icon-lg',
] as const;

export type ButtonProps = ComponentProps<'button'> & {
  variant?: (typeof variants)[number] | null | undefined;
  size?: (typeof sizes)[number] | null | undefined;
  fullWidth?: boolean | null | undefined;
  asChild?: boolean | undefined;
  icon?: ReactElement | undefined;
  iconPosition?: 'start' | 'end' | undefined;
  loading?: boolean | undefined;
};

function preventActivation(event: SyntheticEvent) {
  event.preventDefault();
  event.stopPropagation();
}

function inactiveChild(children: ReactNode, loading: boolean | undefined) {
  if (!isValidElement<Record<string, unknown>>(children)) return children;
  return cloneElement(children, {
    'aria-disabled': true,
    'aria-busy': loading || children.props['aria-busy'],
    disabled: true,
    onAuxClickCapture: preventActivation,
    tabIndex: -1,
    onClickCapture: preventActivation,
    onKeyDownCapture: preventActivation,
    onPointerDownCapture: preventActivation,
  });
}

function stateAttribute<T>(state: boolean | undefined, fallback: T) {
  return state || fallback;
}

function captureHandler<T>(inactive: boolean | undefined, handler: T) {
  return inactive ? preventActivation : handler;
}

function buttonContent({
  asChild,
  children,
  icon,
  loading,
  iconPosition,
}: ButtonProps) {
  if (asChild) return children;
  const glyph = loading ? null : icon;
  return (
    <>
      {iconPosition === 'start' && glyph}
      {children}
      {iconPosition === 'end' && glyph}
    </>
  );
}

function slottedContent(
  content: ReactNode,
  { disabled, loading }: ButtonProps,
) {
  return disabled || loading ? inactiveChild(content, loading) : content;
}

export function Button({
  variant = 'primary',
  size = 'default',
  fullWidth,
  asChild = false,
  icon,
  iconPosition = 'start',
  loading,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const inactive = disabled || loading;
  const Comp = asChild ? Slot : 'button';
  const content = buttonContent({
    asChild,
    children,
    icon,
    iconPosition,
    loading,
  });
  return (
    <Comp
      {...props}
      className={['sp-button', className].filter(Boolean).join(' ')}
      data-slot="button"
      data-variant={variant ?? undefined}
      data-size={size ?? undefined}
      data-full-width={fullWidth || undefined}
      disabled={inactive}
      onClickCapture={captureHandler(inactive, props.onClickCapture)}
      onAuxClickCapture={captureHandler(inactive, props.onAuxClickCapture)}
      onKeyDownCapture={captureHandler(inactive, props.onKeyDownCapture)}
      onPointerDownCapture={captureHandler(
        inactive,
        props.onPointerDownCapture,
      )}
      aria-disabled={inactive || props['aria-disabled']}
      aria-busy={stateAttribute(loading, props['aria-busy'])}
    >
      {asChild ? slottedContent(content, { disabled, loading }) : content}
    </Comp>
  );
}
