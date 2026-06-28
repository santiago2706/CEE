import type { ApiResponse, CeeEvent, EventRegistration, EventRegistrationInput, EventSlide } from '@cee/types';
import { mockEvents } from '@/mocks';
import { mockCeeEvents } from '@/mocks/data/cee-events.mock';
import { supabase } from '@/lib/supabase';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 300): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

// ─── EventSlide service (home page slider) ────────────────────────────────────

interface SlideRow {
  id: string;
  title: string;
  date: string;
  image_url: string;
  cta_label: string;
  cta_href: string;
}

function formatSlide(row: SlideRow): EventSlide {
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
      .from('event_slides')
      .select('*')
      .order('date', { ascending: true });
    if (error) throw new Error('No se pudieron cargar los eventos.');
    return (data ?? []).map((row) => formatSlide(row as SlideRow));
  },
};

// ─── CeeEvent public service (public /eventos pages) ─────────────────────────

interface EventRow {
  id: string;
  slug: string | null;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  capacity: number;
  has_certificate: boolean;
  certificate_price: number | null;
  status: string;
  flyer_url: string | null;
  created_at: string;
  updated_at: string;
}

function rowToEvent(row: EventRow): CeeEvent {
  return {
    id: row.id,
    slug: row.slug ?? '',
    title: row.title,
    description: row.description,
    eventDate: row.event_date,
    startTime: row.start_time,
    endTime: row.end_time,
    location: row.location,
    capacity: row.capacity,
    hasCertificate: row.has_certificate,
    certificatePrice: row.certificate_price,
    status: row.status as CeeEvent['status'],
    flyerUrl: row.flyer_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

let webRegsCache: EventRegistration[] = [];

export const eventsPublicService = {
  async getPublishedEvents(): Promise<ApiResponse<CeeEvent[]>> {
    if (USE_MOCKS) {
      return delay({ data: mockCeeEvents.filter((e) => e.status === 'published') });
    }
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .order('event_date', { ascending: true });
    if (error) throw new Error('No se pudieron cargar los eventos.');
    return { data: (data ?? []).map((r) => rowToEvent(r as EventRow)) };
  },

  async getEventBySlug(slug: string): Promise<ApiResponse<CeeEvent>> {
    if (USE_MOCKS) {
      const found = mockCeeEvents.find((e) => e.slug === slug);
      if (!found) throw new Error(`Evento no encontrado: ${slug}`);
      return delay({ data: found });
    }
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error || !data) throw new Error(`Evento no encontrado: ${slug}`);
    return { data: rowToEvent(data as EventRow) };
  },

  async registerAttendee(input: EventRegistrationInput): Promise<ApiResponse<EventRegistration>> {
    if (USE_MOCKS) {
      const newReg: EventRegistration = {
        id: `wreg-${Date.now()}`,
        eventId: input.eventId,
        firstName: input.firstName,
        lastNamePaternal: input.lastNamePaternal,
        lastNameMaternal: input.lastNameMaternal,
        email: input.email,
        phone: input.phone,
        isWorking: input.isWorking,
        wantsCertificate: input.wantsCertificate,
        certificatePaid: false,
        source: input.source,
        createdAt: new Date().toISOString(),
      };
      webRegsCache = [...webRegsCache, newReg];
      return delay({ data: newReg });
    }
    const { data, error } = await supabase
      .from('event_registrations')
      .insert({
        event_id: input.eventId,
        first_name: input.firstName,
        last_name_paternal: input.lastNamePaternal,
        last_name_maternal: input.lastNameMaternal,
        email: input.email,
        phone: input.phone,
        is_working: input.isWorking,
        wants_certificate: input.wantsCertificate,
        certificate_paid: false,
        source: input.source,
      })
      .select('*')
      .single();
    if (error || !data) throw new Error('No se pudo registrar la inscripción. Intenta nuevamente.');
    const r = data as Record<string, unknown>;
    return {
      data: {
        id: r.id as string, eventId: r.event_id as string,
        firstName: r.first_name as string, lastNamePaternal: r.last_name_paternal as string,
        lastNameMaternal: r.last_name_maternal as string, email: r.email as string,
        phone: r.phone as string, isWorking: r.is_working as boolean,
        wantsCertificate: r.wants_certificate as boolean, certificatePaid: r.certificate_paid as boolean,
        source: r.source as EventRegistration['source'], createdAt: r.created_at as string,
      },
    };
  },
};
