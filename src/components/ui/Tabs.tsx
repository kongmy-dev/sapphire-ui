import * as TabsPrimitive from '@radix-ui/react-tabs';
import { createContext, forwardRef, useContext } from 'react';
import { cn } from '../../lib/utils';

type TabsVariant = 'underline' | 'pills' | 'dashboard';

const TabsVariantContext = createContext<TabsVariant>('underline');

const Tabs = TabsPrimitive.Root;

const TabsList = forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: TabsVariant;
  }
>(({ className, variant = 'underline', ...props }, ref) => (
  <TabsVariantContext.Provider value={variant}>
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        'flex',
        variant === 'underline' && 'gap-0 border-b border-border data-[orientation=vertical]:flex-col data-[orientation=vertical]:border-r data-[orientation=vertical]:border-b-0',
        variant === 'pills' && 'flex-wrap gap-1 data-[orientation=vertical]:flex-col',
        variant === 'dashboard' && 'gap-0.5',
        className,
      )}
      data-variant={variant}
      {...props}
    />
  </TabsVariantContext.Provider>
));
TabsList.displayName = 'TabsList';

const TabsTrigger = forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  const variant = useContext(TabsVariantContext);

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        'inline-flex cursor-pointer items-center gap-2 font-sans text-sm font-medium transition-all outline-none',
        'text-(--color-text-muted) hover:text-(--color-text-strong)',

        // Underline variant
        variant === 'underline' && [
          '-mb-px border-b-2 border-transparent px-4 py-3',
          'data-[state=active]:border-accent data-[state=active]:text-(--color-accent-text)',
          // Vertical orientation overrides
          'data-[orientation=vertical]:-mr-px data-[orientation=vertical]:mb-0 data-[orientation=vertical]:w-full data-[orientation=vertical]:justify-start data-[orientation=vertical]:border-r-2 data-[orientation=vertical]:border-b-0 data-[orientation=vertical]:text-left data-[orientation=vertical]:whitespace-normal',
        ],

        // Pills variant
        variant === 'pills' && [
          'rounded-md px-3 py-2',
          'hover:bg-surface',
          'data-[state=active]:bg-accent/10 data-[state=active]:text-(--color-accent-text)',
        ],

        // Dashboard variant
        variant === 'dashboard' && [
          'rounded-md px-3.5 py-[7px] text-[13px] font-semibold text-(--color-text-muted)',
          'data-[state=active]:bg-primary data-[state=active]:text-white',
        ],

        'focus-visible:ring-2 focus-visible:ring-(--color-focus-ring) focus-visible:ring-offset-0',
        className,
      )}
      {...props}
    />
  );
});
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
