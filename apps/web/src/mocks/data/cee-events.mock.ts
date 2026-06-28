import type { CeeEvent } from '@cee/types';

/** Eventos completos del CEE para la sección pública /eventos. */
export const mockCeeEvents: CeeEvent[] = [
  {
    id: 'evt001',
    slug: 'cadena-inteligente',
    title: 'Conferencia Cadena Inteligente',
    description:
      'Conferencia sobre optimización de cadenas de suministro con tecnologías de la Industria 4.0. ' +
      'Expertos del sector compartirán casos de éxito en manufactura, logística y trazabilidad mediante IoT, ' +
      'blockchain y analítica de datos. Dirigida a gerentes, jefes de operaciones y profesionales del área.',
    eventDate: '2026-07-01',
    startTime: '15:00',
    endTime: '19:00',
    location: 'Auditorio FIIS UNI',
    capacity: 150,
    hasCertificate: true,
    certificatePrice: 20,
    status: 'published',
    flyerUrl: null,
    registeredCount: 8,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'evt002',
    slug: 'excel-avanzado-negocios',
    title: 'Taller de Excel Avanzado para Negocios',
    description:
      'Taller práctico intensivo de Microsoft Excel orientado a profesionales del área de negocios y finanzas. ' +
      'Se abordarán tablas dinámicas, funciones avanzadas (BUSCARX, fórmulas matriciales), ' +
      'automatización con macros básicas y creación de dashboards ejecutivos. ' +
      'Requiere nivel intermedio de Excel. Trae tu laptop.',
    eventDate: '2026-07-15',
    startTime: '09:00',
    endTime: '13:00',
    location: 'Sala de Cómputo FIIS',
    capacity: 30,
    hasCertificate: false,
    certificatePrice: null,
    status: 'published',
    flyerUrl: null,
    registeredCount: 7,
    createdAt: '2026-06-05T00:00:00Z',
    updatedAt: '2026-06-05T00:00:00Z',
  },
];
