import type { Teacher } from '@cee/types';
import { mockInstructors } from './instructors.mock';
import { slugify } from '@/lib/utils';

const UPCOMING_EVENTS_BY_INSTRUCTOR_ID: Record<string, Teacher['upcomingEvents']> = {
  i001: [{ id: 'ev-i001-1', title: 'Sprint Review abierto — Gestión de Proyectos Ágiles', date: '2026-07-22' }],
  i002: [{ id: 'ev-i002-1', title: 'Taller: Analítica de datos para decisiones gerenciales', date: '2026-07-29' }],
  i003: [{ id: 'ev-i003-1', title: 'Clase magistral: Valorización de empresas', date: '2026-08-05' }],
  i004: [{ id: 'ev-i004-1', title: 'Workshop de liderazgo situacional', date: '2026-07-18' }],
  i005: [],
  i006: [{ id: 'ev-i006-1', title: 'Webinar: Estrategia de contenidos 2026', date: '2026-08-12' }],
  i007: [],
  i008: [{ id: 'ev-i008-1', title: 'Taller de oratoria ejecutiva', date: '2026-08-01' }],
};

export const mockTeachers: Teacher[] = mockInstructors.map((instructor) => ({
  ...instructor,
  slug: slugify(instructor.name),
  upcomingEvents: UPCOMING_EVENTS_BY_INSTRUCTOR_ID[instructor.id] ?? [],
}));
