import type { ComponentProps } from 'react';

export type TableHeaderProps = ComponentProps<'thead'> & {
  sticky?: boolean | undefined;
};

export function Table({ className, ...props }: ComponentProps<'table'>) {
  return (
    <div className="sp-table-container">
      <table
        {...props}
        className={['sp-table', className].filter(Boolean).join(' ')}
        data-slot="table"
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
  return (
    <tbody
      {...props}
      className={['sp-table-body', className].filter(Boolean).join(' ')}
      data-slot="table-body"
    />
  );
}

export function TableRow({ className, ...props }: ComponentProps<'tr'>) {
  return (
    <tr
      {...props}
      className={['sp-table-row', className].filter(Boolean).join(' ')}
      data-slot="table-row"
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
