'use client';

import type { ComponentProps } from 'react';

export type PaginationProps = ComponentProps<'nav'> & {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblings?: number | undefined;
  hideControls?: boolean | undefined;
};

type Page = number | 'start-gap' | 'end-gap';

function finiteInteger(value: number, fallback: number) {
  return Number.isFinite(value)
    ? Math.min(Number.MAX_SAFE_INTEGER, Math.floor(value))
    : fallback;
}

function pages(current: number, total: number, siblings: number): Page[] {
  const start = Math.max(2, current - siblings);
  const end = Math.min(total - 1, current + siblings);
  const result: Page[] = [1];
  if (start > 2) result.push('start-gap');
  result.push(
    ...Array.from(
      { length: Math.max(0, end - start + 1) },
      (_, index) => start + index,
    ),
  );
  if (end < total - 1) result.push('end-gap');
  result.push(total);
  return result;
}

function Arrow({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path
        d={direction === 'left' ? 'M9 3L5 7l4 4' : 'M5 3l4 4-4 4'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function PageItem({
  page,
  current,
  go,
}: {
  page: Page;
  current: number;
  go: (page: number) => void;
}) {
  if (typeof page !== 'number')
    return (
      <li className="sp-pagination-item">
        <span className="sp-pagination-ellipsis" aria-hidden="true">
          …
        </span>
      </li>
    );
  return (
    <li className="sp-pagination-item">
      <button
        type="button"
        className="sp-pagination-link"
        aria-label={`Go to page ${page}`}
        aria-current={page === current ? 'page' : undefined}
        onClick={() => go(page)}
      >
        {page}
      </button>
    </li>
  );
}

export function Pagination({
  className,
  currentPage,
  totalPages,
  onPageChange,
  siblings = 1,
  hideControls,
  ...props
}: PaginationProps) {
  const total = Math.max(0, finiteInteger(totalPages, 0));
  const current = Math.min(total, Math.max(1, finiteInteger(currentPage, 1)));
  const nearby = Math.min(100, Math.max(0, finiteInteger(siblings, 1)));
  if (total <= 1) return null;
  function go(page: number) {
    if (page < 1 || page > total || page === current) return;
    onPageChange(page);
  }
  return (
    <nav
      {...props}
      className={['sp-pagination', className].filter(Boolean).join(' ')}
      data-slot="pagination"
      aria-label={props['aria-label'] ?? 'Pagination'}
    >
      <ul className="sp-pagination-list">
        {!hideControls && (
          <li className="sp-pagination-item">
            <button
              type="button"
              className="sp-pagination-link"
              disabled={current <= 1}
              aria-label="Go to previous page"
              onClick={() => go(current - 1)}
            >
              <Arrow direction="left" />
            </button>
          </li>
        )}
        {pages(current, total, nearby).map((page) => (
          <PageItem key={page} page={page} current={current} go={go} />
        ))}
        {!hideControls && (
          <li className="sp-pagination-item">
            <button
              type="button"
              className="sp-pagination-link"
              disabled={current >= total}
              aria-label="Go to next page"
              onClick={() => go(current + 1)}
            >
              <Arrow direction="right" />
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
