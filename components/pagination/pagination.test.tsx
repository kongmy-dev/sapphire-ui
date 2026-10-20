import { expect, it, mock } from 'bun:test';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { examples } from './pagination.examples.js';
import { Pagination } from './pagination.js';

it('names navigation and pages, exposes current page and supports keyboard callbacks', async () => {
  const ref = createRef<HTMLElement>();
  const change = mock((_page: number) => {});
  render(
    <Pagination
      ref={ref}
      className="custom"
      currentPage={5}
      totalPages={12}
      onPageChange={change}
    />,
  );
  expect(ref.current).toBe(
    screen.getByRole('navigation', { name: 'Pagination' }),
  );
  expect(ref.current?.className).toBe('sp-pagination custom');
  expect(
    screen
      .getByRole('button', { name: 'Go to page 5' })
      .getAttribute('aria-current'),
  ).toBe('page');
  await userEvent.click(screen.getByRole('button', { name: 'Go to page 5' }));
  expect(change).not.toHaveBeenCalled();
  screen.getByRole('button', { name: 'Go to page 6' }).focus();
  await userEvent.keyboard('{Enter}');
  expect(change).toHaveBeenCalledWith(6);
  await userEvent.click(
    screen.getByRole('button', { name: 'Go to previous page' }),
  );
  expect(change).toHaveBeenCalledWith(4);
  await userEvent.click(
    screen.getByRole('button', { name: 'Go to next page' }),
  );
  expect(change).toHaveBeenCalledWith(6);
  expect(ref.current?.querySelectorAll('.sp-pagination-ellipsis').length).toBe(
    2,
  );
});

it('disables boundary controls, hides controls when requested and keeps valid callbacks', async () => {
  const change = mock((_page: number) => {});
  const { rerender } = render(
    <Pagination currentPage={1} totalPages={3} onPageChange={change} />,
  );
  await userEvent.click(
    screen.getByRole('button', { name: 'Go to previous page' }),
  );
  expect(change).not.toHaveBeenCalled();
  rerender(<Pagination currentPage={3} totalPages={3} onPageChange={change} />);
  await userEvent.click(
    screen.getByRole('button', { name: 'Go to next page' }),
  );
  expect(change).not.toHaveBeenCalled();
  rerender(
    <Pagination
      currentPage={2}
      totalPages={3}
      hideControls
      onPageChange={change}
      aria-label="Results"
    />,
  );
  expect(screen.getByRole('navigation', { name: 'Results' })).not.toBeNull();
  expect(screen.queryByRole('button', { name: 'Go to next page' })).toBeNull();
  expect(
    screen.queryByRole('button', { name: 'Go to previous page' }),
  ).toBeNull();
});

for (const total of [0, 1, -10, Number.NaN, Infinity, -Infinity]) {
  it(`renders nothing for invalid or unnecessary total ${String(total)}`, () => {
    render(
      <Pagination currentPage={1} totalPages={total} onPageChange={() => {}} />,
    );
    expect(screen.queryByRole('navigation')).toBeNull();
  });
}

for (const current of [Number.NaN, -Infinity, Infinity, -5, 0, 99]) {
  it(`clamps current page ${String(current)} to a visible valid page`, () => {
    const { container } = render(
      <Pagination
        currentPage={current}
        totalPages={5}
        onPageChange={() => {}}
      />,
    );
    const active = container.querySelector('[aria-current="page"]');
    expect(active?.textContent).toBe(current === 99 ? '5' : '1');
  });
}

it('floors fractional counts, bounds siblings to 100 and handles unsafe finite integers without unbounded iteration', () => {
  const { rerender, container } = render(
    <Pagination
      currentPage={3.9}
      totalPages={6.8}
      siblings={-2}
      onPageChange={() => {}}
    />,
  );
  expect(
    screen
      .getByRole('button', { name: 'Go to page 3' })
      .getAttribute('aria-current'),
  ).toBe('page');
  expect(screen.getByRole('button', { name: 'Go to page 6' })).not.toBeNull();
  expect(screen.queryByRole('button', { name: 'Go to page 2' })).toBeNull();
  rerender(
    <Pagination
      currentPage={500}
      totalPages={1000}
      siblings={1e308}
      onPageChange={() => {}}
    />,
  );
  expect(container.querySelectorAll('[aria-label^="Go to page "]').length).toBe(
    203,
  );
  rerender(
    <Pagination
      currentPage={1e308}
      totalPages={1e308}
      siblings={1e308}
      onPageChange={() => {}}
    />,
  );
  expect(container.querySelector('[aria-current="page"]')?.textContent).toBe(
    String(Number.MAX_SAFE_INTEGER),
  );
  expect(container.querySelectorAll('button').length).toBeLessThan(205);
  rerender(
    <Pagination
      currentPage={4}
      totalPages={10}
      siblings={Infinity}
      onPageChange={() => {}}
    />,
  );
  expect(screen.getByRole('button', { name: 'Go to page 3' })).not.toBeNull();
});

for (const { name, render: Example } of examples) {
  it(`renders and exercises ${name}`, async () => {
    render(<Example />);
    const button = screen.getAllByRole('button', {
      name: 'Go to next page',
    })[0];
    if (!button) throw new Error('Next page button missing');
    await userEvent.click(button);
    if (name === 'controlled')
      expect(screen.getByRole('status').textContent).toBe('Page 4');
  });
}
