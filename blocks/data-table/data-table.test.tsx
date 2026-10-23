import { expect, it, mock } from 'bun:test';
import {
  columnFilteringFeature,
  columnOrderingFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  type ReactTable,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_text,
  tableFeatures,
  useTable,
} from '@tanstack/react-table';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { DataTable } from './data-table.js';

const features = tableFeatures({
  columnFilteringFeature,
  columnOrderingFeature,
  columnVisibilityFeature,
  rowSortingFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
});
const people = [
  { id: '1', name: 'Zed', role: 'Owner' },
  { id: '2', name: 'Amy', role: 'Editor' },
  { id: '3', name: 'Bea', role: 'Viewer' },
];
type Person = (typeof people)[number];
const helper = createColumnHelper<typeof features, Person>();
const columns = helper.columns([
  helper.accessor('name', {
    header: 'Name',
    sortFn: sortFn_text,
    filterFn: filterFn_includesString,
    cell: ({ getValue }) => <strong>{getValue()}</strong>,
  }),
  helper.accessor('role', {
    header: () => <span>Account role</span>,
    enableSorting: false,
  }),
]);
const groupedColumns = helper.columns([
  helper.group({ header: 'Identity', columns }),
  helper.accessor('id', {
    header: 'Identifier',
    enableSorting: false,
    enableHiding: false,
  }),
]);

type RecipeInput = {
  table: ReactTable<typeof features, Person, null>;
  filters: ReactNode;
};
function defaultRecipe({ table, filters }: RecipeInput) {
  return <DataTable table={table} caption="People" filters={filters} />;
}
function People({
  records = people,
  grouped = false,
  manualPageCount,
  recipe = defaultRecipe,
}: {
  records?: Person[];
  grouped?: boolean;
  manualPageCount?: number;
  recipe?: (input: RecipeInput) => ReactNode;
}) {
  const table = useTable(
    {
      features,
      columns: grouped ? groupedColumns : columns,
      data: records,
      initialState: { pagination: { pageIndex: 0, pageSize: 2 } },
      ...(manualPageCount === undefined
        ? {}
        : { manualPagination: true, pageCount: manualPageCount }),
    },
    () => null,
  );
  const column = table.getColumn('name');
  const filters = (
    <input
      aria-label="Filter people"
      onChange={(event) => column?.setFilterValue(event.currentTarget.value)}
    />
  );
  return recipe({ table, filters });
}

async function openMenu(name: string) {
  await userEvent.click(screen.getByRole('button', { name }));
  await screen.findByRole('menu');
}

it('renders typed custom cells and pagination from the real v9 row model', async () => {
  render(<People />);
  const table = screen.getByRole('table', { name: 'People' });
  expect(
    within(table).getByRole('cell', { name: 'Zed' }).querySelector('strong'),
  ).not.toBeNull();
  expect(
    within(table).getByRole('columnheader', { name: 'Account role' }),
  ).not.toBeNull();
  expect(
    screen.getByRole('button', { name: 'Previous' }).hasAttribute('disabled'),
  ).toBe(true);
  expect(screen.getByText('Page 1 of 2')).not.toBeNull();
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));
  await waitFor(() =>
    expect(within(table).getByRole('cell', { name: 'Bea' })).not.toBeNull(),
  );
  expect(within(table).queryByRole('cell', { name: 'Zed' })).toBeNull();
  expect(
    screen.getByRole('button', { name: 'Next' }).hasAttribute('disabled'),
  ).toBe(true);
  await userEvent.click(screen.getByRole('button', { name: 'Previous' }));
  await waitFor(() =>
    expect(within(table).getByRole('cell', { name: 'Zed' })).not.toBeNull(),
  );
});

it('composes header sorting and column visibility without requiring every stock feature', async () => {
  render(<People />);
  const name = screen.getByRole('columnheader', { name: 'Name' });
  expect(name.getAttribute('aria-sort')).toBe('none');
  expect(
    screen
      .getByRole('columnheader', { name: 'Account role' })
      .hasAttribute('aria-sort'),
  ).toBe(false);
  await openMenu('Name');
  await userEvent.click(screen.getByRole('menuitem', { name: 'Asc' }));
  await waitFor(() =>
    expect(screen.queryByRole('cell', { name: 'Zed' })).toBeNull(),
  );
  expect(screen.getByRole('cell', { name: 'Amy' })).not.toBeNull();
  expect(name.getAttribute('aria-sort')).toBe('ascending');
  await openMenu('Name');
  await userEvent.click(screen.getByRole('menuitem', { name: 'Desc' }));
  await waitFor(() =>
    expect(name.getAttribute('aria-sort')).toBe('descending'),
  );
  await openMenu('Name');
  await userEvent.click(screen.getByRole('menuitem', { name: 'Hide' }));
  await waitFor(() =>
    expect(screen.queryByRole('columnheader', { name: 'Name' })).toBeNull(),
  );
  await openMenu('View');
  await userEvent.click(screen.getByRole('menuitemcheckbox', { name: 'name' }));
  await waitFor(() =>
    expect(screen.getByRole('columnheader', { name: 'Name' })).not.toBeNull(),
  );
});

it('filters with caller controls and announces the empty result', async () => {
  render(<People />);
  await userEvent.type(
    screen.getByRole('textbox', { name: 'Filter people' }),
    'Amy',
  );
  await waitFor(() =>
    expect(screen.queryByRole('cell', { name: 'Zed' })).toBeNull(),
  );
  expect(screen.getByRole('cell', { name: 'Amy' })).not.toBeNull();
  await userEvent.clear(screen.getByRole('textbox', { name: 'Filter people' }));
  await userEvent.type(
    screen.getByRole('textbox', { name: 'Filter people' }),
    'Nobody',
  );
  await waitFor(() =>
    expect(screen.getByRole('status').textContent).toBe('No results.'),
  );
  expect(
    screen.getByRole('cell', { name: 'No results.' }).getAttribute('colspan'),
  ).toBe('2');
});

it('announces loading instead of stale rows and supports custom progress messages', () => {
  const view = render(
    <People
      recipe={({ table }) => (
        <DataTable table={table} caption="People" status="loading" />
      )}
    />,
  );
  expect(screen.getByRole('status').textContent).toBe('Loading records…');
  expect(
    screen
      .getByRole('table', { name: 'People' })
      .closest('[aria-busy]')
      ?.getAttribute('aria-busy'),
  ).toBe('true');
  expect(screen.queryByRole('cell', { name: 'Zed' })).toBeNull();
  view.rerender(
    <People
      recipe={({ table }) => (
        <DataTable
          table={table}
          caption="People"
          status="loading"
          message="Refreshing people"
        />
      )}
    />,
  );
  expect(screen.getByRole('status').textContent).toBe('Refreshing people');
});

it('renders caller-owned recovery actions for errors and custom empty content', async () => {
  const retry = mock();
  const view = render(
    <People
      recipe={({ table }) => (
        <DataTable
          table={table}
          caption="People"
          status="error"
          message={
            <>
              <p>People could not be loaded.</p>
              <button type="button" onClick={retry}>
                Retry
              </button>
            </>
          }
        />
      )}
    />,
  );
  expect(screen.getByRole('alert').textContent).toContain(
    'People could not be loaded.',
  );
  expect(screen.queryByRole('cell', { name: 'Zed' })).toBeNull();
  await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(retry).toHaveBeenCalledTimes(1);
  view.rerender(
    <People
      records={[]}
      recipe={({ table }) => (
        <DataTable
          table={table}
          caption="People"
          emptyMessage="Add your first person."
        />
      )}
    />,
  );
  expect(screen.getByRole('status').textContent).toBe('Add your first person.');
  expect(screen.queryByText('Page 1 of 0')).toBeNull();
});

it('renders grouped and placeholder headers without creating group sort controls', () => {
  render(<People grouped />);
  const table = screen.getByRole('table', { name: 'People' });
  expect(
    within(table)
      .getByRole('columnheader', { name: 'Identity' })
      .getAttribute('colspan'),
  ).toBe('2');
  expect(screen.queryByRole('button', { name: 'Identity' })).toBeNull();
  expect(
    within(table).getByRole('columnheader', { name: 'Identifier' }),
  ).not.toBeNull();
  expect(
    within(table)
      .getAllByRole('columnheader')
      .some((cell) => cell.textContent === ''),
  ).toBe(true);
});

it('keeps previous and next navigation available when server page counts are unknown', async () => {
  render(<People manualPageCount={-1} />);
  expect(screen.getByText('Page 1')).not.toBeNull();
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));
  await waitFor(() => expect(screen.getByText('Page 2')).not.toBeNull());
  expect(
    screen.getByRole('button', { name: 'Next' }).hasAttribute('disabled'),
  ).toBe(false);
  expect(
    screen.getByRole('button', { name: 'Previous' }).hasAttribute('disabled'),
  ).toBe(false);
});

it('paginates inside a form without submitting caller data', async () => {
  const submit = mock((event: React.FormEvent<HTMLFormElement>) =>
    event.preventDefault(),
  );
  render(
    <form onSubmit={submit}>
      <People />
    </form>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));
  await waitFor(() => expect(screen.getByText('Page 2 of 2')).not.toBeNull());
  await userEvent.click(screen.getByRole('button', { name: 'Previous' }));
  expect(submit).not.toHaveBeenCalled();
});

it('keeps column recovery available when every column is hidden', async () => {
  render(<People />);
  await openMenu('View');
  await userEvent.click(screen.getByRole('menuitemcheckbox', { name: 'name' }));
  await openMenu('View');
  await userEvent.click(screen.getByRole('menuitemcheckbox', { name: 'role' }));
  await waitFor(() =>
    expect(screen.getByRole('status').textContent).toBe('No columns selected.'),
  );
  expect(
    screen
      .getByRole('cell', { name: 'No columns selected.' })
      .getAttribute('colspan'),
  ).toBe('1');
  await openMenu('View');
  await userEvent.click(screen.getByRole('menuitemcheckbox', { name: 'name' }));
  await waitFor(() =>
    expect(screen.getByRole('cell', { name: 'Zed' })).not.toBeNull(),
  );
});
