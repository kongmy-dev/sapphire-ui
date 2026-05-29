import { forwardRef, type HTMLAttributes, type ThHTMLAttributes, type TdHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="w-full overflow-auto">
      <table
        ref={ref}
        className={cn('w-full border-collapse font-sans text-[14px]', className)}
        {...props}
      />
    </div>
  ),
);
Table.displayName = 'Table';

export interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  /**
   * Stick the header to the top of the nearest scrolling ancestor. Requires
   * the Table to be inside a fixed-height scroll container (`overflow: auto`
   * + `max-height`) for the sticky behavior to actually take effect.
   */
  sticky?: boolean;
}

const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, sticky, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn(
        sticky && 'sticky top-0 z-10 bg-(--color-card-bg) shadow-[0_1px_0_0_var(--color-border)]',
        className,
      )}
      {...props}
    />
  ),
);
TableHeader.displayName = 'TableHeader';

const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn('', className)} {...props} />
  ),
);
TableBody.displayName = 'TableBody';

const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'border-b border-border transition-colors hover:bg-accent/5',
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = 'TableRow';

const TableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'bg-page border-b border-border px-4 py-3 text-left font-sans text-[11px] font-semibold tracking-[0.08em] whitespace-nowrap text-(--color-text-muted) uppercase',
        className,
      )}
      {...props}
    />
  ),
);
TableHead.displayName = 'TableHead';

const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn('p-4', className)}
      {...props}
    />
  ),
);
TableCell.displayName = 'TableCell';

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
