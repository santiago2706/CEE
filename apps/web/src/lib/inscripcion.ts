import { ROUTES } from '@/constants/routes';

/**
 * Contrato Fase 4 (Santiago): mecanismo único de paso del curso elegido
 * desde "Inscribirme" (Home, Catálogo, Detalle de curso) hasta el
 * formulario de registro/contacto. Usa siempre `course.id`, igual que
 * `ContactLead.courseInterest` en `@cee/types`.
 */
export const COURSE_QUERY_PARAM = 'curso';

export function buildInscripcionUrl(courseId: string) {
  return `${ROUTES.CONTACT}?${COURSE_QUERY_PARAM}=${courseId}`;
}
