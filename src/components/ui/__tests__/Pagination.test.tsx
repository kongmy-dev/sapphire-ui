import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Pagination } from '../Pagination';

describe('Pagination', () => {
  it('renders nothing when there is a single page', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('marks the current page with aria-current', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Go to page 3' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('fires onPageChange when a different page is clicked', async () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Go to page 4' }));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('ignores a click on the already-current page', async () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Go to page 3' }));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('navigates with the prev / next controls', async () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
    expect(onPageChange).toHaveBeenLastCalledWith(4);
    await userEvent.click(screen.getByRole('button', { name: 'Go to previous page' }));
    expect(onPageChange).toHaveBeenLastCalledWith(2);
  });

  it('disables prev on the first page and next on the last page', () => {
    const { rerender } = render(
      <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />,
    );
    expect(screen.getByRole('button', { name: 'Go to previous page' })).toBeDisabled();

    rerender(<Pagination currentPage={5} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Go to next page' })).toBeDisabled();
  });

  it('renders ellipsis gaps for large ranges', () => {
    render(<Pagination currentPage={6} totalPages={12} onPageChange={() => {}} />);
    // First, last, a window around 6, and two ellipsis tokens.
    expect(screen.getByRole('button', { name: 'Go to page 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to page 12' })).toBeInTheDocument();
    expect(screen.getAllByText('…').length).toBe(2);
  });

  it('hides controls when hideControls is set', () => {
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={() => {}} hideControls />,
    );
    expect(screen.queryByRole('button', { name: 'Go to next page' })).not.toBeInTheDocument();
  });
});
