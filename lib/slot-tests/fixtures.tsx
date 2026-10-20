import * as RadixSlot from '@radix-ui/react-slot';
import {
  Children,
  type ComponentProps,
  cloneElement,
  forwardRef,
  isValidElement,
  type ReactNode,
} from 'react';
import type { SlotComponent } from './impls.js';

type ClassPart = string | false | null | undefined;

function cn(...parts: readonly ClassPart[]) {
  return parts.filter(Boolean).join(' ');
}

export type ButtonProps = ComponentProps<'button'> & {
  asChild?: boolean;
  variant?: 'primary' | 'ghost';
  loading?: boolean;
};

export function makeButton(Slot: SlotComponent) {
  return function Button({
    className,
    variant = 'primary',
    asChild = false,
    loading,
    children,
    disabled,
    ...props
  }: ButtonProps) {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(
          'inline-flex gap-2',
          variant === 'primary' ? 'bg-primary' : 'bg-transparent',
          className,
        )}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading && <span aria-hidden="true" />}
            {children}
          </>
        )}
      </Comp>
    );
  };
}

export function makeForwardRefButton(Slot: SlotComponent) {
  return forwardRef<HTMLButtonElement, ButtonProps>(
    (
      { className, asChild = false, loading, children, disabled, ...props },
      ref,
    ) => {
      const Comp = asChild ? Slot : 'button';
      return (
        <Comp
          ref={ref}
          className={cn('inline-flex gap-2', className)}
          disabled={disabled || loading}
          aria-busy={loading || undefined}
          {...props}
        >
          {children}
        </Comp>
      );
    },
  );
}

export type BadgeProps = ComponentProps<'span'> & { asChild?: boolean };

export function makeBadge(Slot: SlotComponent) {
  return function Badge({ className, asChild = false, ...props }: BadgeProps) {
    const Comp = asChild ? Slot : 'span';
    return <Comp className={cn('badge', className)} {...props} />;
  };
}

export type IconButtonProps = ComponentProps<'button'> & {
  asChild?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
};

type ElementWithChildren = { children?: ReactNode };

export function makeIconButton(Slot: SlotComponent, isLabelWrapped: boolean) {
  const label = (content: ReactNode) =>
    isLabelWrapped ? <span>{content}</span> : content;
  return function IconButton({
    children,
    asChild = false,
    iconLeft,
    iconRight,
    ...props
  }: IconButtonProps) {
    if (!asChild) {
      return (
        <button {...props}>
          {iconLeft}
          {label(children)}
          {iconRight}
        </button>
      );
    }
    if (!isValidElement<ElementWithChildren>(children)) {
      throw new Error('asChild needs a single element child');
    }
    return (
      <Slot {...props}>
        {cloneElement(
          children,
          undefined,
          iconLeft,
          label(children.props.children),
          iconRight,
        )}
      </Slot>
    );
  };
}

export const expectedHtml = {
  iconButton:
    '<button><span>left</span>Button <em>text</em><span>right</span></button>',
  iconLink:
    '<a href="/docs"><span>left</span>Button <em>text</em><span>right</span></a>',
  wrappedButton: '<button><span>Button <em>text</em></span></button>',
  wrappedIconButton:
    '<button><span>left</span><span>Button <em>text</em></span><span>right</span></button>',
  wrappedLink: '<a href="/docs"><span>Button <em>text</em></span></a>',
  wrappedIconLink:
    '<a href="/docs"><span>left</span><span>Button <em>text</em></span><span>right</span></a>',
} as const;

export type NavItemProps = ComponentProps<'a'> & {
  asChild?: boolean;
  icon?: string;
  active?: boolean;
  badge?: ReactNode;
  collapsed?: boolean;
};

function navItemClass({ active, collapsed, className }: NavItemProps): string {
  return cn(
    'group flex items-center gap-2.5',
    active ? 'bg-accent/12 text-accent' : 'text-text-on-dark',
    collapsed ? 'justify-center px-0' : '',
    className,
  );
}

function iconNode(icon: string | undefined, active: boolean | undefined) {
  return (
    icon && (
      <span
        key="icon"
        className={cn(
          'material-symbols-outlined',
          active ? 'opacity-100' : 'opacity-70',
        )}
      >
        {icon}
      </span>
    )
  );
}

function badgeNode(badge: ReactNode, collapsed: boolean | undefined) {
  return (
    !collapsed &&
    badge && (
      <span key="badge" className="ml-auto font-mono">
        {badge}
      </span>
    )
  );
}

export const NavItemWithSlottable = forwardRef<HTMLAnchorElement, NavItemProps>(
  (props, ref) => {
    const {
      asChild = false,
      icon,
      active = false,
      badge,
      collapsed = false,
      className: _className,
      children,
      ...rest
    } = props;
    if (!asChild) throw new Error('fixture covers the asChild branch only');
    const child = Children.only(children);
    if (!isValidElement<ElementWithChildren>(child)) {
      throw new Error('asChild needs a single element child');
    }
    const inner = (
      <span
        key="label"
        className={cn(collapsed ? 'sr-only' : 'flex-1 truncate')}
      >
        {child.props.children}
      </span>
    );
    const newChild = cloneElement(child, { children: inner });
    return (
      <RadixSlot.Slot ref={ref} className={navItemClass(props)} {...rest}>
        {iconNode(icon, active)}
        <RadixSlot.Slottable key="slottable">{newChild}</RadixSlot.Slottable>
        {badgeNode(badge, collapsed)}
      </RadixSlot.Slot>
    );
  },
);

export function makeNavItem(Slot: SlotComponent) {
  return forwardRef<HTMLAnchorElement, NavItemProps>((props, ref) => {
    const {
      asChild = false,
      icon,
      active = false,
      badge,
      collapsed = false,
      className: _className,
      children,
      ...rest
    } = props;
    if (!asChild) throw new Error('fixture covers the asChild branch only');
    const child = Children.only(children);
    if (!isValidElement<ElementWithChildren>(child)) {
      throw new Error('asChild needs a single element child');
    }
    return (
      <Slot ref={ref} className={navItemClass(props)} {...rest}>
        {cloneElement(
          child,
          undefined,
          iconNode(icon, active),
          <span
            key="label"
            className={cn(collapsed ? 'sr-only' : 'flex-1 truncate')}
          >
            {child.props.children}
          </span>,
          badgeNode(badge, collapsed),
        )}
      </Slot>
    );
  });
}
