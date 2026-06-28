import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Sale } from '@cee/types';
import { salesRecordsService } from '@/services/salesRecordsService';
import { usePagination } from '@/hooks/usePagination';

const PAGE_SIZE = 20;

export function useSalesList() {
  const [sales, setSales]           = useState<Sale[]>([]);
  const [isLoading, setIsLoading]   = useState(true);

  // Filter states (private — use the reset-aware setters below)
  const [search,       _setSearch]       = useState('');
  const [courseFilter, _setCourseFilter] = useState('all');
  const [statusFilter, _setStatusFilter] = useState<Sale['status'] | 'all'>('all');
  const [dateFrom,     _setDateFrom]     = useState('');
  const [dateTo,       _setDateTo]       = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await salesRecordsService.getSales();
      setSales(res.data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filteredSales = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sales.filter((s) => {
      const matchSearch =
        !q ||
        (s.studentName ?? '').toLowerCase().includes(q) ||
        s.courseName.toLowerCase().includes(q);
      const matchCourse = courseFilter === 'all' || s.courseId === courseFilter;
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      const d = s.date.slice(0, 10);
      const matchFrom = !dateFrom || d >= dateFrom;
      const matchTo   = !dateTo   || d <= dateTo;
      return matchSearch && matchCourse && matchStatus && matchFrom && matchTo;
    });
  }, [sales, search, courseFilter, statusFilter, dateFrom, dateTo]);

  // ── Pagination ────────────────────────────────────────────────────────────
  const {
    page, totalPages, paginatedItems, setPage, goNext, goPrev, hasNext, hasPrev,
  } = usePagination(filteredSales, PAGE_SIZE);

  // ── Filter setters that also reset to page 1 ──────────────────────────────
  const setSearch       = (v: string)                  => { _setSearch(v);       setPage(1); };
  const setCourseFilter = (v: string)                  => { _setCourseFilter(v); setPage(1); };
  const setStatusFilter = (v: Sale['status'] | 'all') => { _setStatusFilter(v); setPage(1); };
  const setDateFrom     = (v: string)                  => { _setDateFrom(v);     setPage(1); };
  const setDateTo       = (v: string)                  => { _setDateTo(v);       setPage(1); };

  // ── Unique courses for the course filter dropdown ─────────────────────────
  const uniqueCourses = useMemo(() => {
    const map = new Map<string, string>();
    sales.forEach((s) => map.set(s.courseId, s.courseName));
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [sales]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const changeStatus = async (id: string, status: Sale['status']) => {
    const res = await salesRecordsService.updateStatus(id, status);
    setSales((prev) => prev.map((s) => (s.id === id ? res.data : s)));
  };

  return {
    isLoading,
    sales,
    filteredSales,
    paginatedItems,
    uniqueCourses,
    search,       setSearch,
    courseFilter, setCourseFilter,
    statusFilter, setStatusFilter,
    dateFrom,     setDateFrom,
    dateTo,       setDateTo,
    page, totalPages, goNext, goPrev, hasNext, hasPrev,
    changeStatus,
  };
}
