import type {
  ApiResponse,
  CeeEvent,
  EventRegistration,
  EventRegistrationSource,
  EventStatus,
} from '@cee/types';
import { mockAdminEvents } from '@/mocks/events.mock';
import { mockEventRegistrations } from '@/mocks/eventRegistrations.mock';
import { slugify } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 350): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

// ─── Input types ──────────────────────────────────────────────────────────────

export interface EventFormInput {
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  hasCertificate: boolean;
  certificatePrice: number | null;
  status: EventStatus;
  flyerUrl?: string | null;
  flyerFile?: File | null;
}

export interface EventRegistrationInput {
  eventId: string;
  firstName: string;
  lastNamePaternal: string;
  lastNameMaternal: string;
  email: string;
  phone: string;
  isWorking: boolean;
  wantsCertificate: boolean;
  source: EventRegistrationSource;
}

// ─── In-memory caches (mock mode) ────────────────────────────────────────────

let eventsCache: CeeEvent[] = [...mockAdminEvents];
let regsCache: EventRegistration[] = [...mockEventRegistrations];

function withCount(ev: CeeEvent): CeeEvent {
  return { ...ev, registeredCount: regsCache.filter((r) => r.eventId === ev.id).length };
}

// ─── Supabase row types ───────────────────────────────────────────────────────

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
  status: EventStatus;
  flyer_url: string | null;
  created_at: string;
  updated_at: string;
}

interface RegRow {
  id: string;
  event_id: string;
  first_name: string;
  last_name_paternal: string;
  last_name_maternal: string;
  email: string;
  phone: string;
  is_working: boolean;
  wants_certificate: boolean;
  certificate_paid: boolean;
  source: EventRegistrationSource;
  created_at: string;
}

function rowToEvent(row: EventRow, count = 0): CeeEvent {
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
    status: row.status,
    flyerUrl: row.flyer_url,
    registeredCount: count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToReg(row: RegRow): EventRegistration {
  return {
    id: row.id,
    eventId: row.event_id,
    firstName: row.first_name,
    lastNamePaternal: row.last_name_paternal,
    lastNameMaternal: row.last_name_maternal,
    email: row.email,
    phone: row.phone,
    isWorking: row.is_working,
    wantsCertificate: row.wants_certificate,
    certificatePaid: row.certificate_paid,
    source: row.source,
    createdAt: row.created_at,
  };
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const eventsService = {
  async getEvents(): Promise<ApiResponse<CeeEvent[]>> {
    if (USE_MOCKS) {
      const sorted = [...eventsCache]
        .map(withCount)
        .sort((a, b) => a.eventDate.localeCompare(b.eventDate));
      return delay({ data: sorted });
    }
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });
    if (error) throw new Error('No se pudieron cargar los eventos.');
    return { data: (data ?? []).map((r) => rowToEvent(r as EventRow)) };
  },

  async getEventById(id: string): Promise<ApiResponse<CeeEvent>> {
    if (USE_MOCKS) {
      const found = eventsCache.find((e) => e.id === id);
      if (!found) throw new Error(`Evento no encontrado: ${id}`);
      return delay({ data: withCount(found) });
    }
    const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
    if (error || !data) throw new Error(`Evento no encontrado: ${id}`);
    const count = await supabase
      .from('event_registrations')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', id);
    return { data: rowToEvent(data as EventRow, count.count ?? 0) };
  },

  async createEvent(input: EventFormInput): Promise<ApiResponse<CeeEvent>> {
    if (USE_MOCKS) {
      const now = new Date().toISOString();
      const newEvent: CeeEvent = {
        id: `evt-${Date.now()}`,
        slug: slugify(input.title),
        title: input.title,
        description: input.description,
        eventDate: input.eventDate,
        startTime: input.startTime,
        endTime: input.endTime,
        location: input.location,
        capacity: input.capacity,
        hasCertificate: input.hasCertificate,
        certificatePrice: input.hasCertificate ? input.certificatePrice : null,
        status: input.status,
        flyerUrl: input.flyerUrl ?? null,
        registeredCount: 0,
        createdAt: now,
        updatedAt: now,
      };
      eventsCache = [newEvent, ...eventsCache];
      return delay({ data: newEvent });
    }
    const { data, error } = await supabase
      .from('events')
      .insert({
        slug: slugify(input.title),
        title: input.title,
        description: input.description,
        event_date: input.eventDate,
        start_time: input.startTime,
        end_time: input.endTime,
        location: input.location,
        capacity: input.capacity,
        has_certificate: input.hasCertificate,
        certificate_price: input.hasCertificate ? input.certificatePrice : null,
        status: input.status,
        flyer_url: input.flyerUrl ?? null,
      })
      .select('*')
      .single();
    if (error || !data) throw new Error('No se pudo crear el evento.');
    return { data: rowToEvent(data as EventRow) };
  },

  async updateEvent(id: string, input: EventFormInput): Promise<ApiResponse<CeeEvent>> {
    if (USE_MOCKS) {
      const idx = eventsCache.findIndex((e) => e.id === id);
      if (idx === -1) throw new Error(`Evento no encontrado: ${id}`);
      const updated: CeeEvent = {
        ...eventsCache[idx],
        title: input.title,
        description: input.description,
        eventDate: input.eventDate,
        startTime: input.startTime,
        endTime: input.endTime,
        location: input.location,
        capacity: input.capacity,
        hasCertificate: input.hasCertificate,
        certificatePrice: input.hasCertificate ? input.certificatePrice : null,
        status: input.status,
        flyerUrl: input.flyerUrl ?? eventsCache[idx].flyerUrl,
        updatedAt: new Date().toISOString(),
      };
      eventsCache[idx] = updated;
      return delay({ data: withCount(updated) });
    }
    const { data, error } = await supabase
      .from('events')
      .update({
        title: input.title,
        description: input.description,
        event_date: input.eventDate,
        start_time: input.startTime,
        end_time: input.endTime,
        location: input.location,
        capacity: input.capacity,
        has_certificate: input.hasCertificate,
        certificate_price: input.hasCertificate ? input.certificatePrice : null,
        status: input.status,
        ...(input.flyerUrl !== undefined && { flyer_url: input.flyerUrl }),
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error || !data) throw new Error('No se pudo actualizar el evento.');
    return { data: rowToEvent(data as EventRow) };
  },

  async deleteEvent(id: string): Promise<ApiResponse<void>> {
    if (USE_MOCKS) {
      eventsCache = eventsCache.filter((e) => e.id !== id);
      regsCache   = regsCache.filter((r) => r.eventId !== id);
      return delay({ data: undefined as void });
    }
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw new Error('No se pudo eliminar el evento.');
    return { data: undefined as void };
  },

  async getRegistrations(eventId: string): Promise<ApiResponse<EventRegistration[]>> {
    if (USE_MOCKS) {
      const list = regsCache
        .filter((r) => r.eventId === eventId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      return delay({ data: list });
    }
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });
    if (error) throw new Error('No se pudieron cargar los inscritos.');
    return { data: (data ?? []).map((r) => rowToReg(r as RegRow)) };
  },

  async registerAttendee(input: EventRegistrationInput): Promise<ApiResponse<EventRegistration>> {
    if (USE_MOCKS) {
      const newReg: EventRegistration = {
        id: `reg-${Date.now()}`,
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
      regsCache = [...regsCache, newReg];
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
    if (error || !data) throw new Error('No se pudo registrar la inscripción.');
    return { data: rowToReg(data as RegRow) };
  },

  async markCertificatePaid(registrationId: string): Promise<ApiResponse<EventRegistration>> {
    if (USE_MOCKS) {
      const idx = regsCache.findIndex((r) => r.id === registrationId);
      if (idx === -1) throw new Error(`Inscripción no encontrada: ${registrationId}`);
      regsCache[idx] = { ...regsCache[idx], certificatePaid: true };
      return delay({ data: regsCache[idx] });
    }
    const { data, error } = await supabase
      .from('event_registrations')
      .update({ certificate_paid: true })
      .eq('id', registrationId)
      .select('*')
      .single();
    if (error || !data) throw new Error('No se pudo marcar el certificado como pagado.');
    return { data: rowToReg(data as RegRow) };
  },
};
