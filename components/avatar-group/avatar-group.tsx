import {
  Children,
  type ComponentProps,
  cloneElement,
  isValidElement,
} from 'react';
import { Avatar } from '../avatar/avatar.js';

export type AvatarGroupProps = ComponentProps<'div'> & {
  spacing?: number | undefined;
  max?: number | undefined;
};

function count(max: number | undefined, length: number) {
  if (max === undefined || !Number.isFinite(max)) return length;
  return Math.min(length, Math.max(0, Math.floor(max)));
}

export function AvatarGroup({
  className,
  children,
  spacing = 8,
  max,
  ...props
}: AvatarGroupProps) {
  const items = Children.toArray(children).filter(
    isValidElement<ComponentProps<'span'>>,
  );
  const visible = items.slice(0, count(max, items.length));
  const overflow = items.length - visible.length;
  return (
    <div
      {...props}
      className={['sp-avatar-group', className].filter(Boolean).join(' ')}
      data-slot="avatar-group"
    >
      {visible.map((child, index) =>
        cloneElement(child, {
          style: {
            ...child.props.style,
            marginInlineStart: index === 0 ? 0 : -spacing,
            zIndex: visible.length - index,
          },
        }),
      )}
      {overflow > 0 && (
        <Avatar
          fallback={`+${overflow}`}
          aria-label={`${overflow} more people`}
          style={{
            marginInlineStart: visible.length ? -spacing : 0,
            zIndex: 0,
          }}
        />
      )}
    </div>
  );
}
