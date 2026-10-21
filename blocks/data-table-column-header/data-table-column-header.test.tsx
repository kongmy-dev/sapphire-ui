import { expect, it } from 'bun:test';
import {
  columnOrderingFeature,
  columnVisibilityFeature,
  createSortedRowModel,
  rowSortingFeature,
  sortFn_text,
  tableFeatures,
  useTable,
} from '@tanstack/react-table';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTableViewOptions } from '../data-table-view-options/data-table-view-options.js';
import { DataTableColumnHeader } from './data-table-column-header.js';

const features = tableFeatures({
  rowSortingFeature,
  columnVisibilityFeature,
  columnOrderingFeature,
  sortedRowModel: createSortedRowModel(),
});
const data = [
  { name: 'Zed', locked: 'A', fixed: 'First' },
  { name: 'Amy', locked: 'Z', fixed: 'Second' },
];
const columns = [
  { accessorKey: 'name', sortFn: sortFn_text },
  { accessorKey: 'locked', sortFn: sortFn_text, enableHiding: false },
  { accessorKey: 'fixed', enableSorting: false, enableHiding: false },
  { id: 'actions' },
];

function TableControls({ columnId = 'name' }: { columnId?: string }) {
  const table = useTable({ features, data, columns });
  const column = table.getColumn(columnId);
  if (!column) throw new Error(`Missing test column ${columnId}`);
  return (
    <>
      <DataTableColumnHeader column={column} title="Column" />
      <DataTableViewOptions table={table} />
      <output aria-label="Row order">
        {table
          .getRowModel()
          .rows.map((row) => row.original.name)
          .join(',')}
      </output>
      <output aria-label="Visible columns">
        {table
          .getVisibleLeafColumns()
          .map((entry) => entry.id)
          .join(',')}
      </output>
    </>
  );
}

async function open(name: string) {
  screen.getByRole('button', { name }).focus();
  await userEvent.keyboard('{Enter}');
  await screen.findByRole('menu');
}

it('sorts real v9 rows in both directions and returns keyboard focus', async () => {
  render(<TableControls />);
  await open('Column');
  await userEvent.click(screen.getByRole('menuitem', { name: 'Asc' }));
  await waitFor(() =>
    expect(screen.getByLabelText('Row order').textContent).toBe('Amy,Zed'),
  );
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Column' }),
    ),
  );
  await open('Column');
  await userEvent.click(screen.getByRole('menuitem', { name: 'Desc' }));
  await waitFor(() =>
    expect(screen.getByLabelText('Row order').textContent).toBe('Zed,Amy'),
  );
});

it('hides from the header and toggles visibility in both directions', async () => {
  render(<TableControls />);
  await open('Column');
  await userEvent.click(screen.getByRole('menuitem', { name: 'Hide' }));
  await waitFor(() =>
    expect(screen.getByLabelText('Visible columns').textContent).toBe(
      'locked,fixed,actions',
    ),
  );
  await open('View');
  const hidden = screen.getByRole('menuitemcheckbox', { name: 'name' });
  expect(hidden.getAttribute('aria-checked')).toBe('false');
  await userEvent.click(hidden);
  await waitFor(() =>
    expect(screen.getByLabelText('Visible columns').textContent).toBe(
      'name,locked,fixed,actions',
    ),
  );
  await open('View');
  const visible = screen.getByRole('menuitemcheckbox', { name: 'name' });
  expect(visible.getAttribute('aria-checked')).toBe('true');
  await userEvent.click(visible);
  await waitFor(() =>
    expect(screen.getByLabelText('Visible columns').textContent).toBe(
      'locked,fixed,actions',
    ),
  );
});

it('keeps non-sortable headers plain and excludes locked and display columns', async () => {
  render(<TableControls columnId="fixed" />);
  expect(screen.queryByRole('button', { name: 'Column' })).toBeNull();
  expect(screen.getByText('Column')).not.toBeNull();
  await open('View');
  expect(screen.getAllByRole('menuitemcheckbox')).toHaveLength(1);
  expect(screen.queryByRole('menuitemcheckbox', { name: 'locked' })).toBeNull();
  expect(
    screen.queryByRole('menuitemcheckbox', { name: 'actions' }),
  ).toBeNull();
});

it('does not offer hiding for a sortable locked column', async () => {
  render(<TableControls columnId="locked" />);
  await open('Column');
  expect(screen.queryByRole('menuitem', { name: 'Hide' })).toBeNull();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
});
