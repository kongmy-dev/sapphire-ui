'use client';

import { useState } from 'react';
import { Pagination } from './pagination.js';

function PaginationControlled() {
  const [page, setPage] = useState(3);
  return (
    <div className="sp-stack">
      <Pagination currentPage={page} totalPages={12} onPageChange={setPage} />
      <output>Page {page}</output>
    </div>
  );
}

function PaginationBoundaries() {
  const [page, setPage] = useState(1);
  return (
    <div className="sp-stack">
      <Pagination
        currentPage={page}
        totalPages={3}
        onPageChange={setPage}
        aria-label="Short pagination"
      />
      <Pagination
        currentPage={page}
        totalPages={3}
        onPageChange={setPage}
        hideControls
        aria-label="Pages only"
      />
    </div>
  );
}

export const examples = [
  { name: 'controlled', render: PaginationControlled },
  { name: 'boundaries', render: PaginationBoundaries },
] as const;
