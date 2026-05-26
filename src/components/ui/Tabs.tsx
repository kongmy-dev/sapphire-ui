import * as TabsPrimitive from '@radix-ui/react-tabs';
import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: 'underline' | 'pills';
  }
>(({ className, variant = 'underline', ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'flex',
      variant === 'underline' && 'gap-0 border-b border-border data-[orientation=vertical]:border-b-0 data-[orientation=vertical]:border-r data-[orientation=vertical]:flex-col',
      variant === 'pills' && 'flex-wrap gap-2 data-[orientation=vertical]:flex-col',
      className,
    )}
    data-variant={variant}
    {...props}
  />
));
TabsList.displayName = 'TabsList';

const TabsTrigger = forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex cursor-pointer items-center gap-2 font-sans text-sm font-medium transition-all outline-none',
      'text-(--color-text-muted) hover:text-(--color-text-strong)',
      // Underline variant (default via parent data-variant)
      '-mb-px border-b-2 border-transparent px-4 py-3',
      'data-[state=active]:border-accent data-[state=active]:text-(--color-accent-text)',
      
      // Vertical orientation overrides
      'data-[orientation=vertical]:-mb-0 data-[orientation=vertical]:-mr-px data-[orientation=vertical]:border-b-0 data-[orientation=vertical]:border-r-2 data-[orientation=vertical]:w-full data-[orientation=vertical]:justify-start data-[orientation=vertical]:whitespace-normal data-[orientation=vertical]:text-left',

      'focus-visible:ring-2 focus-visible:ring-(--color-focus-ring) focus-visible:ring-offset-0',
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = 'TabsTrigger';

const TabsContent = forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn('mt-4 outline-none', className)}
    {...props}
  />
));
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };
