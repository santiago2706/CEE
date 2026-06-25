export interface MockSegmento {
  segmento_curso: number;
  nombre_segmento: string;
}

export interface MockCurso {
  cod_tipo_curso: number;
  nombre_curso: string;
  descripcion_curso: string | null;
  segmento_curso: number;
  slug: string;
  modality?: string;
  level?: string;
  academic_hours?: number;
  short_description?: string;
  syllabus_pdf_url?: string;
}

export interface MockPrerrequisito {
  cod_curso: number;
  cod_curso_previo: number;
}

export interface MockTema {
  cod_tema: number;
  nombre_tema: string;
  descripcion_tema: string | null;
  duracion_tema: number;
}

export interface MockSilaboCurso {
  cod_tipo_curso: number;
  cod_tema: number;
  secuencia_logica: number;
}

export interface MockHorarioSemanal {
  tipo_horario: number;
  descripcion_horario: string;
}

export interface MockDetalleHorario {
  tipo_horario: number;
  dia_semana: 'L' | 'M' | 'X' | 'J' | 'V' | 'S' | 'D';
  hora: number;
}

export interface MockServicio {
  cod_tipo_servicio: number;
  descripcion_servicio: string;
  tarifa_curso: number;
  total_inscripciones: number;
  total_veces_completado: number;
  estado_capacitacion: 'A' | 'I';
  tipo_curso: number;
  tipo_horario: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  actions?: ChatAction[];
  timestamp: number;
}

export type ChatAction =
  | { type: 'chips'; chips: { label: string; query: string }[] }
  | { type: 'courses'; courses: CardCourse[] }
  | { type: 'lead_capture' }
  | { type: 'redirect_whatsapp' };

export interface CardCourse {
  id: number;
  name: string;
  segment: string;
  price: number;
  description: string;
  imageUrl: string;
  slug: string;
}

export interface ChatContext {
  lastCourseMentioned: string | null;
  priceQueriesCount: number;
  hasCapturedLead: boolean;
}
