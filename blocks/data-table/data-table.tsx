'use client';

import {
  type Cell,
  FlexRender,
  type Header,
  type ReactTable,
  type RowData,
  type StockFeatures,
  Subscribe,
  type TableFeatures,
  type TableState,
} from '@tanstack/react-table';
import type { ComponentProps, ReactNode } from 'react';
import { Button } from '../../components/button/button.js';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/table/table.js';
import { cn } from '../classes.js';
import { DataTableColumnHeader } from '../data-table-column-header/data-table-column-header.js';
import { DataTableViewOptions } from '../data-table-view-options/data-table-view-options.js';

type PaginationFeatures = Pick<StockFeatures, 'rowPaginationFeature'>;
type HeaderControls<TData extends RowData> = ComponentProps<
  typeof DataTableColumnHeader<TData, unknown>
>['column'];
type DataTableHeader<
  TFeatures extends TableFeatures,
  TData extends RowData,
> = Header<TFeatures, TData> & {
  column: Header<TFeatures, TData>['column'] & HeaderControls<TData>;
};
type DataTableInstance<
  TFeatures extends TableFeatures,
  TData extends RowData,
> = Pick<ReactTable<TFeatures, TData>, 'store'> &
  ComponentProps<typeof DataTableViewOptions<TData>>['table'] &
  Pick<
    ReactTable<PaginationFeatures, TData>,
    | 'getPageCount'
    | 'getCanPreviousPage'
    | 'getCanNextPage'
    | 'previousPage'
    | 'nextPage'
  > & {
    atoms: Pick<ReactTable<PaginationFeatures, TData>['atoms'], 'pagination'>;
    getVisibleLeafColumns: () => readonly unknown[];
    getHeaderGroups: () => readonly {
      id: string;
      headers: readonly DataTableHeader<TFeatures, TData>[];
    }[];
    getRowModel: () => {
      rows: readonly {
        id: string;
        getVisibleCells: () => readonly Cell<TFeatures, TData>[];
      }[];
    };
  };

type DataTableStatus =
  | { status?: 'ready' | undefined; message?: never }
  | { status: 'loading'; message?: ReactNode }
  | { status: 'error'; message: ReactNode };

export type DataTableProps<
  TFeatures extends TableFeatures,
  TData extends RowData,
> = Omit<ComponentProps<'section'>, 'children'> &
  DataTableStatus & {
    table: DataTableInstance<TFeatures, TData>;
    caption: string;
    filters?: ReactNode;
    emptyMessage?: ReactNode;
  };

function TableFeedback({
  status,
  message,
  emptyMessage,
}: {
  status: DataTableStatus['status'];
  message: ReactNode;
  emptyMessage: ReactNode;
}) {
  if (status === 'error') return <div role="alert">{message}</div>;
  return (
    <div role="status">
      {status === 'loading' ? (message ?? 'Loading records…') : emptyMessage}
    </div>
  );
}

function HeaderContent<TFeatures extends TableFeatures, TData extends RowData>({
  header,
}: {
  header: DataTableHeader<TFeatures, TData>;
}) {
  if (header.isPlaceholder) return null;
  const title = header.column.columnDef.header;
  if (typeof title === 'string' && header.subHeaders.length === 0)
    return <DataTableColumnHeader column={header.column} title={title} />;
  return <FlexRender<TFeatures, TData> header={header} />;
}

function DataTableHead<TFeatures extends TableFeatures, TData extends RowData>({
  table,
}: Pick<DataTableProps<TFeatures, TData>, 'table'>) {
  return (
    <TableHeader>
      {table.getHeaderGroups().map((group) => (
        <TableRow key={group.id}>
          {group.headers.map((header) => (
            <TableHead
              key={header.id}
              colSpan={header.colSpan}
              aria-sort={headerSort(header)}
            >
              <HeaderContent header={header} />
            </TableHead>
          ))}
        </TableRow>
      ))}
    </TableHeader>
  );
}

function headerSort<TFeatures extends TableFeatures, TData extends RowData>(
  header: DataTableHeader<TFeatures, TData>,
): ComponentProps<typeof TableHead>['aria-sort'] {
  if (
    header.isPlaceholder ||
    header.subHeaders.length > 0 ||
    !header.column.getCanSort()
  )
    return undefined;
  const sorted = header.column.getIsSorted();
  if (sorted === 'asc') return 'ascending';
  return sorted === 'desc' ? 'descending' : 'none';
}

function DataTableBody<TFeatures extends TableFeatures, TData extends RowData>({
  table,
  status,
  message,
  emptyMessage,
}: Pick<
  DataTableProps<TFeatures, TData>,
  'table' | 'status' | 'message' | 'emptyMessage'
>) {
  const rows = table.getRowModel().rows;
  const columns = table.getVisibleLeafColumns().length;
  if (
    status === 'loading' ||
    status === 'error' ||
    rows.length === 0 ||
    columns === 0
  )
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={Math.max(1, columns)}>
            <TableFeedback
              status={status}
              message={message}
              emptyMessage={
                columns === 0 ? 'No columns selected.' : emptyMessage
              }
            />
          </TableCell>
        </TableRow>
      </TableBody>
    );
  return (
    <TableBody>
      {rows.map((row) => (
        <TableRow key={row.id}>
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              <FlexRender<TFeatures, TData> cell={cell} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}

function DataTablePagination<
  TFeatures extends TableFeatures,
  TData extends RowData,
>({
  table,
  caption,
}: Pick<DataTableProps<TFeatures, TData>, 'table' | 'caption'>) {
  const { pageIndex } = table.atoms.pagination.get();
  const count = table.getPageCount();
  return (
    <nav
      className="flex flex-wrap items-center justify-end gap-3"
      aria-label={`${caption} pages`}
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!table.getCanPreviousPage()}
        onClick={() => table.previousPage()}
      >
        Previous
      </Button>
      <span aria-live="polite">
        Page {pageIndex + 1}
        {count > 0 ? ` of ${count}` : ''}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!table.getCanNextPage()}
        onClick={() => table.nextPage()}
      >
        Next
      </Button>
    </nav>
  );
}

export function DataTable<
  TFeatures extends TableFeatures,
  TData extends RowData,
>({
  table,
  caption,
  filters,
  status = 'ready',
  message,
  emptyMessage = 'No results.',
  className,
  ...props
}: DataTableProps<TFeatures, TData>) {
  return (
    <Subscribe<TFeatures, TableState<TFeatures>>
      source={table.store}
      selector={(state) => state}
    >
      {() => (
        <section
          {...props}
          className={cn('space-y-4', className)}
          aria-busy={status === 'loading'}
        >
          <div className="flex flex-wrap items-center gap-3">
            {filters}
            <DataTableViewOptions table={table} />
          </div>
          <Table>
            <caption className="sp-sr-only">{caption}</caption>
            <DataTableHead table={table} />
            <DataTableBody
              table={table}
              status={status}
              message={message}
              emptyMessage={emptyMessage}
            />
          </Table>
          <DataTablePagination table={table} caption={caption} />
        </section>
      )}
    </Subscribe>
  );
}
