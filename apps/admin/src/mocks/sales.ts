import type { SalesReport } from '@cee/types';

const weekReport: SalesReport = {
  kpis: {
    totalSales: 14,
    totalRevenue: 3120,
    conversionRate: 4.8,
    salesDeltaPct: 9,
    revenueDeltaPct: 11,
    conversionDeltaPct: -2,
  },
  trend: [
    { label: 'Lun', revenue: 380 },
    { label: 'Mar', revenue: 420 },
    { label: 'Mié', revenue: 510 },
    { label: 'Jue', revenue: 290 },
    { label: 'Vie', revenue: 640 },
    { label: 'Sáb', revenue: 520 },
    { label: 'Dom', revenue: 360 },
  ],
  breakdown: [
    {
      courseId: 'c001',
      courseName: 'Gestión de Proyectos Ágiles con Scrum y Kanban',
      salesCount: 5,
      revenue: 995,
      lastTransaction: '2026-06-19T18:20:00Z',
    },
    {
      courseId: 'c002',
      courseName: 'Análisis de Datos para Negocios con Python',
      salesCount: 4,
      revenue: 996,
      lastTransaction: '2026-06-19T14:05:00Z',
    },
    {
      courseId: 'c016',
      courseName: 'Ciberseguridad para Empresas',
      salesCount: 3,
      revenue: 837,
      lastTransaction: '2026-06-18T20:40:00Z',
    },
    {
      courseId: 'c004',
      courseName: 'Liderazgo y Habilidades Directivas',
      salesCount: 2,
      revenue: 358,
      lastTransaction: '2026-06-17T11:15:00Z',
    },
  ],
};

const monthReport: SalesReport = {
  kpis: {
    totalSales: 37,
    totalRevenue: 8410,
    conversionRate: 5.2,
    salesDeltaPct: 15,
    revenueDeltaPct: 18,
    conversionDeltaPct: 4,
  },
  trend: [
    { label: 'Sem 1', revenue: 1850 },
    { label: 'Sem 2', revenue: 2140 },
    { label: 'Sem 3', revenue: 1620 },
    { label: 'Sem 4', revenue: 2800 },
  ],
  breakdown: [
    {
      courseId: 'c001',
      courseName: 'Gestión de Proyectos Ágiles con Scrum y Kanban',
      salesCount: 12,
      revenue: 2388,
      lastTransaction: '2026-06-19T18:20:00Z',
    },
    {
      courseId: 'c002',
      courseName: 'Análisis de Datos para Negocios con Python',
      salesCount: 9,
      revenue: 2241,
      lastTransaction: '2026-06-19T14:05:00Z',
    },
    {
      courseId: 'c016',
      courseName: 'Ciberseguridad para Empresas',
      salesCount: 7,
      revenue: 1953,
      lastTransaction: '2026-06-18T20:40:00Z',
    },
    {
      courseId: 'c004',
      courseName: 'Liderazgo y Habilidades Directivas',
      salesCount: 5,
      revenue: 895,
      lastTransaction: '2026-06-17T11:15:00Z',
    },
    {
      courseId: 'c003',
      courseName: 'Finanzas Corporativas Avanzadas',
      salesCount: 4,
      revenue: 933,
      lastTransaction: '2026-06-15T09:30:00Z',
    },
  ],
};

const quarterReport: SalesReport = {
  kpis: {
    totalSales: 102,
    totalRevenue: 23890,
    conversionRate: 4.6,
    salesDeltaPct: 6,
    revenueDeltaPct: 9,
    conversionDeltaPct: -1,
  },
  trend: [
    { label: 'Ene', revenue: 5200 },
    { label: 'Feb', revenue: 4680 },
    { label: 'Mar', revenue: 6100 },
    { label: 'Abr', revenue: 5340 },
    { label: 'May', revenue: 7020 },
    { label: 'Jun', revenue: 8410 },
  ],
  breakdown: [
    {
      courseId: 'c001',
      courseName: 'Gestión de Proyectos Ágiles con Scrum y Kanban',
      salesCount: 32,
      revenue: 6368,
      lastTransaction: '2026-06-19T18:20:00Z',
    },
    {
      courseId: 'c002',
      courseName: 'Análisis de Datos para Negocios con Python',
      salesCount: 24,
      revenue: 5976,
      lastTransaction: '2026-06-19T14:05:00Z',
    },
    {
      courseId: 'c016',
      courseName: 'Ciberseguridad para Empresas',
      salesCount: 18,
      revenue: 5022,
      lastTransaction: '2026-06-18T20:40:00Z',
    },
    {
      courseId: 'c004',
      courseName: 'Liderazgo y Habilidades Directivas',
      salesCount: 15,
      revenue: 2685,
      lastTransaction: '2026-06-17T11:15:00Z',
    },
    {
      courseId: 'c003',
      courseName: 'Finanzas Corporativas Avanzadas',
      salesCount: 13,
      revenue: 3839,
      lastTransaction: '2026-06-15T09:30:00Z',
    },
  ],
};

export const mockSalesReports = {
  week: weekReport,
  month: monthReport,
  quarter: quarterReport,
};
