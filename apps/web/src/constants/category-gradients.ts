import type { CourseCategory } from '@cee/types';

/** Fallback visual mientras carga la imagen real del curso o si esta falla. */
export const CATEGORY_GRADIENTS: Record<CourseCategory, string> = {
  Ingeniería: 'linear-gradient(135deg, #682222, #4F1A1A)',
  Gestión: 'linear-gradient(135deg, #8C3A3A, #682222)',
  Tecnología: 'linear-gradient(135deg, #4F1A1A, #2A0E0E)',
  'Habilidades Blandas': 'linear-gradient(135deg, #A9A9A9, #682222)',
  Finanzas: 'linear-gradient(135deg, #682222, #8C3A3A)',
};
