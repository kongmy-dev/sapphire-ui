'use client';

import {
  Children,
  type ComponentProps,
  cloneElement,
  createContext,
  isValidElement,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useState,
} from 'react';
import { Slot } from '../../lib/slot.js';
import { Popover, PopoverContent, PopoverTrigger } from '../popover/popover.js';
import { Tooltip } from '../tooltip/tooltip.js';
import { useAdminNavigation } from './admin-context.js';

const GroupContext = createContext<{
  flyout: boolean;
  close?: (() => void) | undefined;
} | null>(null);

type AdminSidebarSectionProps = ComponentProps<'div'> & {
  title?: string | undefined;
  children: ReactNode;
};

export function AdminSidebarSection({
  title,
  children,
  ...props
}: AdminSidebarSectionProps) {
  const id = useId();
  return (
    <div {...props} data-slot="admin-sidebar-section">
      {title && (
        <h2 id={id} className="sp-admin-layout-section-title">
          {title}
        </h2>
      )}
      <nav
        className="sp-admin-layout-links"
        aria-labelledby={title ? id : undefined}
      >
        {children}
      </nav>
    </div>
  );
}

type AdminSidebarLinkProps = ComponentProps<'a'> & {
  asChild?: boolean | undefined;
  icon?: ReactElement | null | undefined;
  active?: boolean | undefined;
  badge?: ReactNode;
};

function LinkContent({
  icon,
  badge,
  children,
}: Pick<AdminSidebarLinkProps, 'icon' | 'badge' | 'children'>) {
  return (
    <>
      {icon && (
        <span className="sp-admin-layout-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="sp-admin-layout-label">{children}</span>
      {badge !== undefined && badge !== null && (
        <span className="sp-admin-layout-badge">{badge}</span>
      )}
    </>
  );
}

function followsNavigation(event: MouseEvent<HTMLAnchorElement>) {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    event.currentTarget.target !== '_blank' &&
    !event.currentTarget.hasAttribute('download')
  );
}

function slottedChild({
  asChild,
  children,
}: Pick<AdminSidebarLinkProps, 'asChild' | 'children'>) {
  if (!asChild) return undefined;
  const child = Children.only(children);
  return isValidElement<{ children?: ReactNode }>(child) ? child : undefined;
}

function LinkHint({
  children,
  badge,
}: Pick<AdminSidebarLinkProps, 'children' | 'badge'>) {
  return (
    <>
      {children}
      {badge !== undefined && badge !== null && <> {badge}</>}
    </>
  );
}

export function AdminSidebarLink({
  className,
  asChild = false,
  icon,
  active = false,
  badge,
  children,
  onClick,
  ...props
}: AdminSidebarLinkProps) {
  const {
    compact: sidebarCompact,
    isMobile,
    setMobileOpen,
  } = useAdminNavigation();
  const group = useContext(GroupContext);
  const compact = sidebarCompact && !group?.flyout;
  const Root = asChild ? Slot : 'a';
  const child = slottedChild({ asChild, children });
  const label = child ? child.props.children : children;
  const content = (
    <LinkContent icon={icon} badge={badge}>
      {label}
    </LinkContent>
  );
  const link = (
    <Root
      {...props}
      className={['sp-admin-layout-link', className].filter(Boolean).join(' ')}
      data-slot="admin-sidebar-link"
      data-iconless={!icon || undefined}
      aria-current={active ? 'page' : props['aria-current']}
      onClick={(event) => {
        onClick?.(event);
        if (!followsNavigation(event)) return;
        if (isMobile) setMobileOpen(false);
        group?.close?.();
      }}
    >
      {child ? cloneElement(child, { children: content }) : content}
    </Root>
  );
  return compact ? (
    <Tooltip
      noProvider
      content={<LinkHint badge={badge}>{label}</LinkHint>}
      side="right"
    >
      {link}
    </Tooltip>
  ) : (
    link
  );
}

type AdminSidebarGroupProps = ComponentProps<'div'> & {
  label: string;
  icon?: ReactElement | null | undefined;
  active?: boolean | undefined;
  children: ReactNode;
};

function GroupButton({
  label,
  icon,
  active,
  ...props
}: ComponentProps<'button'> &
  Pick<AdminSidebarGroupProps, 'label' | 'icon' | 'active'>) {
  return (
    <button
      {...props}
      type="button"
      className="sp-admin-layout-group-trigger"
      data-active={active || undefined}
      data-iconless={!icon || undefined}
    >
      <LinkContent icon={icon}>{label}</LinkContent>
      <svg
        className="sp-icon sp-admin-layout-group-chevron"
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </button>
  );
}

export function AdminSidebarGroup({
  label,
  icon,
  active = false,
  children,
  className,
  ...props
}: AdminSidebarGroupProps) {
  const { compact } = useAdminNavigation();
  const parentGroup = useContext(GroupContext);
  const [open, setOpen] = useState(active);
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const id = useId();
  useEffect(() => {
    if (active) setOpen(true);
  }, [active]);
  useEffect(() => {
    if (!compact) setFlyoutOpen(false);
  }, [compact]);
  if (parentGroup)
    throw new Error('AdminSidebarGroup supports one navigation level.');
  const content = (flyout: boolean) => (
    <GroupContext.Provider
      value={{ flyout, close: flyout ? () => setFlyoutOpen(false) : undefined }}
    >
      <nav
        id={id}
        className="sp-admin-layout-group-content"
        aria-label={label}
        hidden={!flyout && !open}
      >
        {children}
      </nav>
    </GroupContext.Provider>
  );
  return (
    <div
      {...props}
      className={['sp-admin-layout-group', className].filter(Boolean).join(' ')}
      data-slot="admin-sidebar-group"
    >
      {compact ? (
        <Popover open={flyoutOpen} onOpenChange={setFlyoutOpen}>
          <Tooltip noProvider content={label} side="right">
            <PopoverTrigger asChild>
              <GroupButton
                label={label}
                icon={icon}
                active={active}
                aria-controls={id}
              />
            </PopoverTrigger>
          </Tooltip>
          <PopoverContent
            className="sp-admin-layout-group-flyout"
            side="right"
            align="start"
            aria-label={label}
          >
            <h2 className="sp-admin-layout-section-title">{label}</h2>
            {content(true)}
          </PopoverContent>
        </Popover>
      ) : (
        <>
          <GroupButton
            label={label}
            icon={icon}
            active={active}
            aria-controls={id}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          />
          {content(false)}
        </>
      )}
    </div>
  );
}
