import { expect, it } from 'bun:test';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { examples } from './table.examples.js';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  type TableHeaderProps,
  TableRow,
} from './table.js';

it('preserves semantic structure, native attributes and refs for every part', () => {
  const table = createRef<HTMLTableElement>();
  const header = createRef<HTMLTableSectionElement>();
  const body = createRef<HTMLTableSectionElement>();
  const row = createRef<HTMLTableRowElement>();
  const head = createRef<HTMLTableCellElement>();
  const cell = createRef<HTMLTableCellElement>();
  const headerProps = {
    sticky: true,
    className: 'header',
  } satisfies TableHeaderProps;
  render(
    <Table ref={table} className="custom">
      <caption>Inventory</caption>
      <TableHeader {...headerProps} ref={header}>
        <TableRow>
          <TableHead ref={head} scope="col" className="head">
            Product
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody ref={body} className="body">
        <TableRow ref={row} className="row">
          <TableCell ref={cell} className="cell" colSpan={2}>
            Sapphire
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  );
  expect(table.current).toBe(screen.getByRole('table', { name: 'Inventory' }));
  expect(table.current?.className).toBe('sp-table custom');
  expect(header.current?.hasAttribute('data-sticky')).toBe(true);
  expect(header.current?.className).toBe('sp-table-header header');
  expect(body.current?.className).toBe('sp-table-body body');
  expect(row.current?.className).toBe('sp-table-row row');
  expect(head.current).toBe(
    screen.getByRole('columnheader', { name: 'Product' }),
  );
  expect(head.current?.scope).toBe('col');
  expect(cell.current).toBe(screen.getByRole('cell', { name: 'Sapphire' }));
  expect(cell.current?.colSpan).toBe(2);
});

for (const { name, render: Example } of examples) {
  it(`renders accessible ${name} data`, async () => {
    render(<Example />);
    expect(screen.getAllByRole('columnheader')).toHaveLength(2);
    expect(screen.getAllByRole('cell').length).toBeGreaterThan(0);
    if (name === 'projects') {
      await userEvent.tab();
      expect(document.activeElement).toBe(
        screen.getByRole('link', { name: 'Sapphire' }),
      );
    } else {
      expect(screen.getByRole('table').getAttribute('data-variant')).toBe(
        'financial',
      );
    }
  });
}
