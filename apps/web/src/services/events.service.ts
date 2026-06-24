import type { EventSlide } from '@cee/types';
import { mockEvents } from '@/mocks';
import { supabase } from '@/lib/supabase';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 300): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

interface EventRow {
  id: string;
  title: string;
  date: string;
  image_url: string;
  cta_label: string;
  cta_href: string;
}

function formatEvent(row: EventRow): EventSlide {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    imageUrl: row.image_url,
    ctaLabel: row.cta_label,
    ctaHref: row.cta_href,
  };
}

export const eventsService = {
  async getAll(): Promise<EventSlide[]> {
    if (USE_MOCKS) {
      return delay([...mockEvents]);
    }

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw new Error('No se pudieron cargar los eventos.');
    return (data ?? []).map((row) => formatEvent(row as EventRow));
  },
};
