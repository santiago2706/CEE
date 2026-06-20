import type { DashboardSummary } from '@cee/types';

export const mockDashboardSummary: DashboardSummary = {
  publishedCourses: 12,
  publishedCoursesDeltaPct: 8,
  draftCourses: 4,
  draftCoursesDeltaPct: -12,
  monthlySales: 37,
  monthlySalesDeltaPct: 15,
  registeredUsers: 218,
  registeredUsersDeltaPct: 6,
  recentActivity: [
    {
      id: 'act-001',
      courseTitle: 'Gestión de Proyectos Ágiles con Scrum y Kanban',
      action: 'updated',
      author: 'Diana Flores',
      date: '2026-06-19T15:30:00Z',
    },
    {
      id: 'act-002',
      courseTitle: 'Machine Learning Aplicado a la Industria',
      action: 'created',
      author: 'Tom Vargas',
      date: '2026-06-19T11:05:00Z',
    },
    {
      id: 'act-003',
      courseTitle: 'Ciberseguridad para Empresas',
      action: 'updated',
      author: 'Isabel Rojas',
      date: '2026-06-18T17:42:00Z',
    },
    {
      id: 'act-004',
      courseTitle: 'Excel Avanzado y Business Intelligence',
      action: 'created',
      author: 'Renato Quispe',
      date: '2026-06-18T09:15:00Z',
    },
    {
      id: 'act-005',
      courseTitle: 'Negociación y Contratos Empresariales',
      action: 'updated',
      author: 'Diana Flores',
      date: '2026-06-17T14:20:00Z',
    },
  ],
};
