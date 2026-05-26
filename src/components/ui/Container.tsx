import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '7xl' | 'full';
  padding?: 'none' | 'default' | 'lg';
}

const maxWidthMap = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '7xl': '80rem',
  full: '100%',
};

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, maxWidth = '7xl', padding = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'mx-auto w-full font-sans',
        padding === 'default' && 'px-4 py-8 sm:px-6 md:py-12',
        padding === 'lg' && 'px-6 py-16 sm:px-8 md:py-24',
        className
      )}
      style={{ maxWidth: maxWidthMap[maxWidth] }}
      {...props}
    />
  )
);
Container.displayName = 'Container';

export { Container };
