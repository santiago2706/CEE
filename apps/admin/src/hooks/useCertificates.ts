import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Certificate, CertificateStatus } from '@cee/types';
import { certificatesService } from '@/services/certificatesService';
import { usePagination } from '@/hooks/usePagination';

const PAGE_SIZE = 20;

export function useCertificates() {
  const [certs, setCerts]         = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states (private — use the reset-aware setters below)
  const [search,       _setSearch]       = useState('');
  const [courseFilter, _setCourseFilter] = useState('all');
  const [statusFilter, _setStatusFilter] = useState<CertificateStatus | 'all'>('all');

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await certificatesService.getCertificates();
      setCerts(res.data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filteredCerts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return certs.filter((c) => {
      const matchSearch =
        !q ||
        c.studentName.toLowerCase().includes(q) ||
        c.certificateNumber.toLowerCase().includes(q);
      const matchCourse = courseFilter === 'all' || c.courseId === courseFilter;
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchCourse && matchStatus;
    });
  }, [certs, search, courseFilter, statusFilter]);

  // ── Pagination ────────────────────────────────────────────────────────────
  const {
    page, totalPages, paginatedItems, setPage, goNext, goPrev, hasNext, hasPrev,
  } = usePagination(filteredCerts, PAGE_SIZE);

  // ── Filter setters that also reset to page 1 ──────────────────────────────
  const setSearch       = (v: string)                    => { _setSearch(v);       setPage(1); };
  const setCourseFilter = (v: string)                    => { _setCourseFilter(v); setPage(1); };
  const setStatusFilter = (v: CertificateStatus | 'all') => { _setStatusFilter(v); setPage(1); };

  // ── Unique courses for the dropdown ───────────────────────────────────────
  const uniqueCourses = useMemo(() => {
    const map = new Map<string, string>();
    certs.forEach((c) => map.set(c.courseId, c.courseName));
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [certs]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const changeStatus = async (id: string, status: CertificateStatus) => {
    const res = await certificatesService.updateStatus(id, status);
    setCerts((prev) => prev.map((c) => (c.id === id ? res.data : c)));
  };

  const revoke = async (id: string) => {
    const res = await certificatesService.revoke(id);
    setCerts((prev) => prev.map((c) => (c.id === id ? res.data : c)));
  };

  return {
    isLoading,
    certs,
    filteredCerts,
    paginatedItems,
    uniqueCourses,
    search,       setSearch,
    courseFilter, setCourseFilter,
    statusFilter, setStatusFilter,
    page, totalPages, goNext, goPrev, hasNext, hasPrev,
    changeStatus,
    revoke,
  };
}
