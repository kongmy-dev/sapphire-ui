import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const skeletonVariants = cva(
  'animate-[skeleton-shimmer_1.5s_ease-in-out_infinite] rounded-sm bg-linear-to-r from-surface via-border to-surface bg-size-[200%_100%] motion-reduce:animate-none',
  {
    variants: {
      variant: {
        line: '',
        card: 'h-48 w-full rounded-md',
        circle: 'size-10 rounded-full',
      },
      size: {
        sm: '',
        md: '',
        lg: '',
      },
    },
    compoundVariants: [
      { variant: 'line', size: 'sm', className: 'h-3.5 w-2/5' },
      { variant: 'line', size: 'md', className: 'h-5 w-4/5' },
      { variant: 'line', size: 'lg', className: 'h-8 w-3/5' },
    ],
    defaultVariants: {
      variant: 'line',
      size: 'md',
    },
  },
);

export interface SkeletonProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

function Skeleton({ className, variant, size, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(skeletonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Skeleton, skeletonVariants };
