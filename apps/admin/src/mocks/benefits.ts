import type { Benefit } from '@cee/types';

export const mockAdminBenefits: Benefit[] = [
  {
    id: 'ben001',
    title: 'Descuento por pronto pago',
    description:
      '10% de descuento al cancelar la matrícula con al menos 7 días de anticipación al inicio del programa.',
    discountLabel: '10% OFF',
    category: 'descuento',
    code: 'PRONTO10',
    validUntil: '2026-12-31',
    isActive: true,
    createdAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'ben002',
    title: 'Descuento para egresados UNI',
    description:
      '15% de descuento exclusivo para egresados de la Universidad Nacional de Ingeniería en cualquier programa CEE.',
    discountLabel: '15% OFF',
    category: 'descuento',
    code: 'EGRESADOS15',
    validUntil: '2026-12-31',
    isActive: true,
    createdAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'ben003',
    title: 'Descuento por inscripción grupal',
    description:
      '20% de descuento cuando se inscriben 3 o más personas de la misma empresa u organización en el mismo programa.',
    discountLabel: '20% OFF',
    category: 'descuento',
    code: 'GRUPAL20',
    validUntil: null,
    isActive: true,
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'ben004',
    title: 'Beca parcial por mérito académico',
    description:
      'Beca del 30% del costo de matrícula para profesionales con promedio mínimo de 15 en sus estudios universitarios. Requiere presentar constancia.',
    discountLabel: '30% OFF',
    category: 'descuento',
    code: 'MERITO30',
    validUntil: '2026-09-30',
    isActive: true,
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'ben005',
    title: 'Descuento alumni FIIS',
    description:
      '10% de descuento permanente para todos los egresados de la Facultad de Ingeniería Industrial y de Sistemas (FIIS-UNI).',
    discountLabel: '10% OFF',
    category: 'descuento',
    code: 'ALUMNIFIIS10',
    validUntil: null,
    isActive: true,
    createdAt: '2026-02-10T10:00:00Z',
  },
  {
    id: 'ben006',
    title: 'Precio especial empleados públicos',
    description:
      '15% de descuento para servidores y funcionarios del Estado peruano. Requiere acreditar vínculo laboral vigente con entidad pública.',
    discountLabel: '15% OFF',
    category: 'descuento',
    code: 'EMPLEADOPUB15',
    validUntil: '2026-12-31',
    isActive: true,
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'ben007',
    title: 'Descuento por referido',
    description:
      'S/ 50 de descuento en tu próximo programa al referir a un nuevo alumno que complete su matrícula exitosamente.',
    discountLabel: 'S/ 50 OFF',
    category: 'descuento',
    code: 'REFERIDO50',
    validUntil: null,
    isActive: true,
    createdAt: '2026-03-15T10:00:00Z',
  },
  {
    id: 'ben008',
    title: 'Promoción matrícula anticipada',
    description:
      'S/ 30 de descuento al inscribirse antes del 30 de junio de 2026 en cualquier programa del segundo semestre.',
    discountLabel: 'S/ 30 OFF',
    category: 'descuento',
    code: 'ANTICIPADA30',
    validUntil: '2026-06-30',
    isActive: false,
    createdAt: '2026-04-01T10:00:00Z',
  },
];
