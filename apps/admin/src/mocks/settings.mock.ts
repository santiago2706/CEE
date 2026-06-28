import type { Setting } from '@cee/types';

export const mockSettings: Setting[] = [
  {
    key:         'cee_name',
    value:       'Centro de Especialización Ejecutiva — FIIS/UNI',
    description: 'Nombre completo del centro de estudios',
    updatedAt:   '2026-06-01T00:00:00Z',
  },
  {
    key:         'cee_phone',
    value:       '+51 (01) 481-1070',
    description: 'Teléfono principal de contacto',
    updatedAt:   '2026-06-01T00:00:00Z',
  },
  {
    key:         'cee_whatsapp',
    value:       '+51 954 321 987',
    description: 'Número de WhatsApp para consultas',
    updatedAt:   '2026-06-01T00:00:00Z',
  },
  {
    key:         'secretary_email',
    value:       'jose.canales.c@uni.pe',
    description: 'Correo que recibe las notificaciones automáticas del sistema',
    updatedAt:   '2026-06-01T00:00:00Z',
  },
  {
    key:         'min_students_default',
    value:       '10',
    description: 'Mínimo de alumnos requerido por defecto para iniciar un curso',
    updatedAt:   '2026-06-01T00:00:00Z',
  },
  {
    key:         'alert_days_default',
    value:       '7',
    description: 'Días de anticipación para revisar el cupo mínimo antes del inicio',
    updatedAt:   '2026-06-01T00:00:00Z',
  },
];
