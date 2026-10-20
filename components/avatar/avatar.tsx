'use client';

import { Avatar as Primitive } from 'radix-ui';
import type { ComponentProps } from 'react';

const sizes = ['xs', 'sm', 'md', 'lg'] as const;

export type AvatarProps = ComponentProps<typeof Primitive.Root> & {
  src?: string | undefined;
  alt?: string | undefined;
  fallback?: string | undefined;
  size?: (typeof sizes)[number] | undefined;
};

export function Avatar({
  className,
  src,
  alt,
  fallback,
  size = 'md',
  ...props
}: AvatarProps) {
  return (
    <Primitive.Root
      {...props}
      className={['sp-avatar', className].filter(Boolean).join(' ')}
      data-slot="avatar"
      data-size={size}
    >
      <Primitive.Image
        className="sp-avatar-image"
        data-slot="avatar-image"
        src={src}
        alt={alt}
      />
      <Primitive.Fallback
        className="sp-avatar-fallback"
        data-slot="avatar-fallback"
        delayMs={300}
      >
        {fallback}
      </Primitive.Fallback>
    </Primitive.Root>
  );
}
