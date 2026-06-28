import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CeeEvent, EventStatus } from '@cee/types';
import { eventsService } from '@/services/eventsService';
import { usePagination } from '@/hooks/usePagination';

const PAGE_SIZE = 20;

export function useEvents() {
  const [events, setEvents]       = useState<CeeEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search,       _setSearch]  = useState('');
  const [statusFilter, _setStatus]  = useState<EventStatus | 'all'>('all');

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await eventsService.getEvents();
      setEvents(res.data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.filter((e) => {
      const matchSearch = !q || e.title.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || e.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [events, search, statusFilter]);

  const { page, totalPages, paginatedItems, setPage, goNext, goPrev, hasNext, hasPrev } =
    usePagination(filteredEvents, PAGE_SIZE);

  const setSearch = (v: string)                 => { _setSearch(v);  setPage(1); };
  const setStatusFilter = (v: EventStatus | 'all') => { _setStatus(v); setPage(1); };

  const deleteEvent = async (id: string) => {
    await eventsService.deleteEvent(id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return {
    isLoading, events, filteredEvents, paginatedItems,
    search, setSearch,
    statusFilter, setStatusFilter,
    page, totalPages, goNext, goPrev, hasNext, hasPrev,
    deleteEvent,
    reload: load,
  };
}
