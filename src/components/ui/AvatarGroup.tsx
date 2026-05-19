import { forwardRef, Children, cloneElement, isValidElement, type HTMLAttributes, type ReactElement } from 'react';
import { cn } from '../../lib/utils';
import { Avatar } from './Avatar';

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Negative margin (px) controlling how much avatars overlap. Default 8. */
  spacing?: number;
  /**
   * Max avatars to render. When exceeded, the remaining count is shown
   * in a trailing "+N" tile. Undefined renders all children.
   */
  max?: number;
}

/**
 * Stacked / overlapping avatar collection. Pass `<Avatar />` children;
 * the group applies the negative-margin overlap and an optional cap
 * with a "+N" indicator for the remainder.
 *
 *   <AvatarGroup max={3}>
 *     <Avatar fallback="AB" />
 *     <Avatar fallback="CD" />
 *     <Avatar fallback="EF" />
 *     <Avatar fallback="GH" />
 *   </AvatarGroup>
 */
const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, children, spacing = 8, max, ...props }, ref) => {
    const items = Children.toArray(children).filter(isValidElement) as ReactElement[];
    const visible = max != null ? items.slice(0, max) : items;
    const overflow = max != null && items.length > max ? items.length - max : 0;

    return (
      <div
        ref={ref}
        className={cn('inline-flex items-center', className)}
        {...props}
      >
        {visible.map((child, i) =>
          cloneElement(child, {
            key: i,
            style: {
              ...(child.props as { style?: React.CSSProperties }).style,
              marginLeft: i === 0 ? 0 : -spacing,
              // Ring effect so overlapping avatars stay visually separated.
              boxShadow: '0 0 0 2px var(--color-card-bg, white)',
              position: 'relative',
              zIndex: visible.length - i,
            } as React.CSSProperties,
          } as Partial<typeof child.props>),
        )}
        {overflow > 0 && (
          <Avatar
            fallback={`+${overflow}`}
            style={{
              marginLeft: -spacing,
              boxShadow: '0 0 0 2px var(--color-card-bg, white)',
              position: 'relative',
              zIndex: 0,
            }}
          />
        )}
      </div>
    );
  },
);
AvatarGroup.displayName = 'AvatarGroup';

export { AvatarGroup };
