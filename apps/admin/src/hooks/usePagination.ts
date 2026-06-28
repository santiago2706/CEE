import { useMemo, useState } from 'react';

export interface PaginationResult<T> {
  page: number;
  totalPages: number;
  paginatedItems: T[];
  setPage: (page: number) => void;
  goNext: () => void;
  goPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export function usePagination<T>(items: T[], pageSize: number): PaginationResult<T> {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginatedItems = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize],
  );

  return {
    page: safePage,
    totalPages,
    paginatedItems,
    setPage,
    goNext: () => setPage((p) => Math.min(p + 1, totalPages)),
    goPrev: () => setPage((p) => Math.max(p - 1, 1)),
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
  };
}
