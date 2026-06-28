import type { AdminNotification, ApiResponse, NotificationType } from '@cee/types';
import { supabase } from '@/lib/supabase';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 300): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

// ─── Mock data (in-memory) ────────────────────────────────────────────────────

const now = Date.now();
const h = (hours: number) => new Date(now - hours * 3_600_000).toISOString();

let mockNotifs: AdminNotification[] = [
  {
    id: 'notif001',
    type: 'low_enrollment',
    title: 'Bajo cupo — Gestión de Proyectos Ágiles',
    message: 'El curso "Gestión de Proyectos Ágiles" inicia el 6 Jul 2026 y solo tiene 3 de 10 inscritos mínimos requeridos.',
    courseId: 'c001',
    isRead: false,
    createdAt: h(2),
  },
  {
    id: 'notif002',
    type: 'low_enrollment',
    title: 'Bajo cupo — Liderazgo y Habilidades Directivas',
    message: 'El curso "Liderazgo y Habilidades Directivas" inicia el 13 Jul 2026 y solo tiene 2 de 10 inscritos mínimos requeridos.',
    courseId: 'c004',
    isRead: false,
    createdAt: h(3),
  },
  {
    id: 'notif003',
    type: 'new_lead',
    title: 'Nuevo contacto — Ana Quispe Flores',
    message: 'Ana Quispe Flores (aquispe@gmail.com) solicitó información sobre programas de gestión empresarial.',
    courseId: null,
    isRead: false,
    createdAt: h(26),
  },
  {
    id: 'notif004',
    type: 'new_lead',
    title: 'Nuevo contacto — Carlos Mamani García',
    message: 'Carlos Mamani García (cmamani@outlook.com) solicitó información sobre ciberseguridad para empresas.',
    courseId: null,
    isRead: true,
    createdAt: h(50),
  },
  {
    id: 'notif005',
    type: 'low_enrollment',
    title: 'Bajo cupo — Excel Avanzado para Negocios',
    message: 'El taller "Excel Avanzado para Negocios" inicia el 15 Jul 2026 y solo tiene 5 de 10 inscritos mínimos requeridos.',
    courseId: 'c002',
    isRead: true,
    createdAt: h(74),
  },
  {
    id: 'notif006',
    type: 'course_confirmed',
    title: 'Curso confirmado — Análisis de Datos para Negocios',
    message: 'El curso "Análisis de Datos para Negocios con Python" inicia hoy con 15 alumnos inscritos. El mínimo requerido era 10.',
    courseId: 'c002',
    isRead: false,
    createdAt: h(1),
  },
  {
    id: 'notif007',
    type: 'course_confirmed',
    title: 'Curso confirmado — Ciberseguridad para Empresas',
    message: 'El curso "Ciberseguridad para Empresas" inicia hoy con 22 alumnos inscritos. El mínimo requerido era 10.',
    courseId: 'c016',
    isRead: true,
    createdAt: h(25),
  },
];

// ─── Supabase row type ────────────────────────────────────────────────────────

interface NotifRow {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  course_id: string | null;
  is_read: boolean;
  created_at: string;
}

function rowToNotif(row: NotifRow): AdminNotification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    courseId: row.course_id,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const notificationsService = {
  async getNotifications(): Promise<ApiResponse<AdminNotification[]>> {
    if (USE_MOCKS) {
      const sorted = [...mockNotifs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return delay({ data: sorted });
    }
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error('No se pudieron cargar las notificaciones.');
    return { data: (data ?? []).map((r) => rowToNotif(r as NotifRow)) };
  },

  async getUnreadCount(): Promise<ApiResponse<number>> {
    if (USE_MOCKS) {
      return delay({ data: mockNotifs.filter((n) => !n.isRead).length });
    }
    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('is_read', false);
    if (error) throw new Error('Error al obtener el contador.');
    return { data: count ?? 0 };
  },

  async markAsRead(id: string): Promise<ApiResponse<void>> {
    if (USE_MOCKS) {
      mockNotifs = mockNotifs.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      return delay({ data: undefined as void });
    }
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    if (error) throw new Error('No se pudo marcar la notificación.');
    return { data: undefined as void };
  },

  async markAllAsRead(): Promise<ApiResponse<void>> {
    if (USE_MOCKS) {
      mockNotifs = mockNotifs.map((n) => ({ ...n, isRead: true }));
      return delay({ data: undefined as void });
    }
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);
    if (error) throw new Error('No se pudieron marcar las notificaciones.');
    return { data: undefined as void };
  },
};
