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
      'data-[orientation=vertical]:flex-col',
      variant === 'underline' && 'data-[orientation=horizontal]:border-b data-[orientation=vertical]:border-l border-border',
      variant === 'pills' && 'flex-wrap gap-2',
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
      // Padding
      'px-4 py-3',
      // Underline variant styles (horizontal)
      '[parent[data-variant=underline]_&]:data-[orientation=horizontal]:-mb-px [parent[data-variant=underline]_&]:data-[orientation=horizontal]:border-b-2 [parent[data-variant=underline]_&]:data-[orientation=horizontal]:border-transparent',
      // Underline variant styles (vertical)
      '[parent[data-variant=underline]_&]:data-[orientation=vertical]:-ml-px [parent[data-variant=underline]_&]:data-[orientation=vertical]:border-l-2 [parent[data-variant=underline]_&]:data-[orientation=vertical]:border-transparent [parent[data-variant=underline]_&]:data-[orientation=vertical]:justify-start',
      // Fallbacks if parent selector is too complex, we can just use universal border:
      'data-[orientation=horizontal]:-mb-px data-[orientation=horizontal]:border-b-2 data-[orientation=horizontal]:border-transparent',
      'data-[orientation=vertical]:-ml-px data-[orientation=vertical]:border-l-2 data-[orientation=vertical]:border-transparent data-[orientation=vertical]:justify-start',
      
      'data-[state=active]:border-accent data-[state=active]:text-(--color-accent-text)',
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
    className={cn(
      'outline-none',
      'data-[orientation=horizontal]:mt-4',
      'data-[orientation=vertical]:ml-6',
      className
    )}
    {...props}
  />
));
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };
