import type { DashboardMetrics, DashboardSummary } from '@cee/types';

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

export const mockDashboardMetrics: DashboardMetrics = {
  kpis: {
    totalRevenue: 23890,
    revenueDeltaPct: 18,
    publishedCourses: 12,
    publishedCoursesDeltaPct: 8,
    contactLeads: 148,
    leadsDeltaPct: 23,
    completedSales: 102,
    salesDeltaPct: 6,
  },
  monthlyRevenue: [
    { label: 'Ene', revenue: 5200 },
    { label: 'Feb', revenue: 4680 },
    { label: 'Mar', revenue: 6100 },
    { label: 'Abr', revenue: 5340 },
    { label: 'May', revenue: 7020 },
    { label: 'Jun', revenue: 8410 },
  ],
  coursesByCategory: [
    { category: 'Tecnología', count: 4 },
    { category: 'Gestión', count: 3 },
    { category: 'Ingeniería', count: 2 },
    { category: 'Finanzas', count: 2 },
    { category: 'Habilidades Blandas', count: 2 },
  ],
  recentSales: [
    { id: 's001', courseName: 'Gestión de Proyectos Ágiles con Scrum y Kanban', amount: 199, status: 'completed', date: '2026-06-19T18:20:00Z' },
    { id: 's002', courseName: 'Análisis de Datos para Negocios con Python',      amount: 249, status: 'completed', date: '2026-06-19T14:05:00Z' },
    { id: 's003', courseName: 'Ciberseguridad para Empresas',                    amount: 279, status: 'pending',   date: '2026-06-18T20:40:00Z' },
    { id: 's004', courseName: 'Finanzas Corporativas Avanzadas',                 amount: 320, status: 'refunded',  date: '2026-06-17T11:15:00Z' },
    { id: 's005', courseName: 'Liderazgo y Habilidades Directivas',              amount: 179, status: 'completed', date: '2026-06-16T09:30:00Z' },
  ],
};
