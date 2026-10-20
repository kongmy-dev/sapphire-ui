import type { ComponentProps } from 'react';

export type TableHeaderProps = ComponentProps<'thead'> & {
  sticky?: boolean | undefined;
};

const variants = ['financial'] as const;
const rowKinds = ['section', 'subtotal', 'total'] as const;

export function Table({
  className,
  'data-variant': variant,
  ...props
}: ComponentProps<'table'> & {
  'data-variant'?: (typeof variants)[number] | undefined;
}) {
  return (
    <div className="sp-table-container">
      <table
        {...props}
        className={['sp-table', className].filter(Boolean).join(' ')}
        data-slot="table"
        data-variant={variant}
      />
    </div>
  );
}

export function TableHeader({ className, sticky, ...props }: TableHeaderProps) {
  return (
    <thead
      {...props}
      className={['sp-table-header', className].filter(Boolean).join(' ')}
      data-slot="table-header"
      data-sticky={sticky || undefined}
    />
  );
}

export function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
  return <tbody {...props} className={className} data-slot="table-body" />;
}

export function TableRow({
  className,
  'data-row': row,
  ...props
}: ComponentProps<'tr'> & {
  'data-row'?: (typeof rowKinds)[number] | undefined;
}) {
  return (
    <tr
      {...props}
      className={['sp-table-row', className].filter(Boolean).join(' ')}
      data-slot="table-row"
      data-row={row}
    />
  );
}

export function TableHead({ className, ...props }: ComponentProps<'th'>) {
  return (
    <th
      {...props}
      className={['sp-table-head', className].filter(Boolean).join(' ')}
      data-slot="table-head"
    />
  );
}

export function TableCell({ className, ...props }: ComponentProps<'td'>) {
  return (
    <td
      {...props}
      className={['sp-table-cell', className].filter(Boolean).join(' ')}
      data-slot="table-cell"
    />
  );
}
