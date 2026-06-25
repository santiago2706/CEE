import type {
  MockSegmento,
  MockCurso,
  MockPrerrequisito,
  MockTema,
  MockSilaboCurso,
  MockHorarioSemanal,
  MockDetalleHorario,
  MockServicio,
} from '@/types/chatbot.types';

export const mockSegmentos: MockSegmento[] = [
  { segmento_curso: 1, nombre_segmento: 'Gestión' },
  { segmento_curso: 2, nombre_segmento: 'Tecnología' },
  { segmento_curso: 3, nombre_segmento: 'Finanzas' },
  { segmento_curso: 4, nombre_segmento: 'Habilidades Blandas' },
  { segmento_curso: 5, nombre_segmento: 'Ingeniería' },
];

export const mockCursos: MockCurso[] = [
  { cod_tipo_curso: 1, nombre_curso: 'Gestión de Proyectos Ágiles con Scrum y Kanban', descripcion_curso: 'Programa intensivo para profesionales que buscan implementar metodologías ágiles en sus organizaciones. Aprenderás a planificar sprints, gestionar backlogs y facilitar ceremonias ágiles.', segmento_curso: 1, slug: 'gestion-proyectos-agiles', modality: 'Virtual', level: 'Intermedio', academic_hours: 48, short_description: 'Domina Scrum y Kanban para liderar equipos en entornos complejos.', syllabus_pdf_url: '' },
  { cod_tipo_curso: 2, nombre_curso: 'Diplomado en Project Management (PMI)', descripcion_curso: 'Formación completa alineada al PMBOK 7ma edición. Cubre los 5 grupos de procesos y 10 áreas de conocimiento para la certificación PMP.', segmento_curso: 1, slug: 'diplomado-project-management-pmi', modality: 'Presencial', level: 'Avanzado', academic_hours: 72, short_description: 'Prepárate para la certificación PMP con el estándar PMBOK 7.', syllabus_pdf_url: '/syllabi/diplomado-pmi.pdf' },
  { cod_tipo_curso: 3, nombre_curso: 'Análisis de Datos para Negocios con Python', descripcion_curso: 'Curso práctico que cubre el ciclo completo del análisis de datos: limpieza con pandas, visualización con matplotlib y seaborn.', segmento_curso: 2, slug: 'analisis-datos-negocios-python', modality: 'Virtual', level: 'Intermedio', academic_hours: 56, short_description: 'Extrae, transforma y visualiza datos empresariales con Python.', syllabus_pdf_url: '/syllabi/analisis-datos-python.pdf' },
  { cod_tipo_curso: 4, nombre_curso: 'Power BI para la Toma de Decisiones', descripcion_curso: 'Domina Power BI desde la conexión a fuentes de datos hasta la publicación de dashboards interactivos para la alta dirección.', segmento_curso: 2, slug: 'power-bi-toma-decisiones', modality: 'Virtual', level: 'Básico', academic_hours: 40, short_description: 'Crea dashboards interactivos con Power BI desde cero.', syllabus_pdf_url: '' },
  { cod_tipo_curso: 5, nombre_curso: 'Machine Learning Aplicado a la Industria', descripcion_curso: 'Programa avanzado para ingenieros que buscan aplicar ML en contextos industriales: mantenimiento predictivo, control de calidad y optimización.', segmento_curso: 2, slug: 'machine-learning-industria', modality: 'Virtual', level: 'Avanzado', academic_hours: 72, short_description: 'Implementa modelos de ML para problemas industriales reales.', syllabus_pdf_url: '/syllabi/machine-learning.pdf' },
  { cod_tipo_curso: 6, nombre_curso: 'Finanzas Corporativas y Valorización de Empresas', descripcion_curso: 'Domina las herramientas financieras clave para evaluar proyectos de inversión, valorizar empresas y tomar decisiones estratégicas.', segmento_curso: 3, slug: 'finanzas-corporativas-avanzadas', modality: 'Híbrido', level: 'Avanzado', academic_hours: 64, short_description: 'Valorización de empresas, DCF, evaluación de proyectos de inversión.', syllabus_pdf_url: '' },
  { cod_tipo_curso: 7, nombre_curso: 'Gestión de Tesorería y Riesgo Financiero', descripcion_curso: 'Aprende a gestionar el flujo de caja, coberturas cambiarias y riesgos financieros en entornos volátiles.', segmento_curso: 3, slug: 'gestion-tesoreria-riesgo', modality: 'Virtual', level: 'Intermedio', academic_hours: 48, short_description: 'Gestión de tesorería y coberturas en entornos volátiles.', syllabus_pdf_url: '' },
  { cod_tipo_curso: 8, nombre_curso: 'Liderazgo Estratégico y Gestión del Cambio', descripcion_curso: 'Desarrolla habilidades de liderazgo transformacional para guiar equipos en procesos de cambio organizacional y cultural.', segmento_curso: 4, slug: 'liderazgo-habilidades-directivas', modality: 'Presencial', level: 'Intermedio', academic_hours: 40, short_description: 'Liderazgo transformacional y gestión del cambio organizacional.', syllabus_pdf_url: '/syllabi/liderazgo-estrategico.pdf' },
  { cod_tipo_curso: 9, nombre_curso: 'Comunicación Efectiva y Oratoria Ejecutiva', descripcion_curso: 'Potencia tu capacidad de comunicación, presentaciones de alto impacto y manejo de audiencias críticas.', segmento_curso: 4, slug: 'comunicacion-oratoria-ejecutiva', modality: 'Presencial', level: 'Básico', academic_hours: 24, short_description: 'Comunicación ejecutiva y presentaciones de alto impacto.', syllabus_pdf_url: '' },
  { cod_tipo_curso: 10, nombre_curso: 'Transformación Digital e Industria 4.0', descripcion_curso: 'Comprende las tecnologías habilitadoras de la cuarta revolución industrial: IoT, cloud, IA y blockchain aplicadas a modelos de negocio.', segmento_curso: 2, slug: 'transformacion-digital-industria-40', modality: 'Virtual', level: 'Intermedio', academic_hours: 48, short_description: 'Tecnologías de la Industria 4.0 y estrategias de transformación digital.', syllabus_pdf_url: '' },
  { cod_tipo_curso: 11, nombre_curso: 'Ciberseguridad y Gestión de Riesgos TI', descripcion_curso: 'Aprende a proteger activos digitales, implementar frameworks de seguridad y gestionar incidentes cibernéticos.', segmento_curso: 2, slug: 'ciberseguridad-empresas', modality: 'Virtual', level: 'Avanzado', academic_hours: 56, short_description: 'Frameworks de seguridad, gestión de incidentes y ciberresiliencia.', syllabus_pdf_url: '' },
  { cod_tipo_curso: 12, nombre_curso: 'Excel Avanzado para Finanzas y Operaciones', descripcion_curso: 'Domina tablas dinámicas, macros VBA, Power Query y funciones financieras avanzadas para optimizar tu trabajo diario.', segmento_curso: 3, slug: 'excel-avanzado-finanzas', modality: 'Virtual', level: 'Básico', academic_hours: 32, short_description: 'Excel avanzado con macros VBA, Power Query y funciones financieras.', syllabus_pdf_url: '' },
];

export const mockPrerrequisitos: MockPrerrequisito[] = [
  { cod_curso: 5, cod_curso_previo: 3 },
  { cod_curso: 4, cod_curso_previo: 12 },
  { cod_curso: 7, cod_curso_previo: 6 },
];

export const mockTemas: MockTema[] = [
  // Gestión de Proyectos Ágiles (curso 1)
  { cod_tema: 1, nombre_tema: 'Manifiesto Ágil y sus doce principios', descripcion_tema: 'Historia, valores y principios del movimiento ágil', duracion_tema: 120 },
  { cod_tema: 2, nombre_tema: 'Scrum: Roles, artefactos y ceremonias', descripcion_tema: 'Product Owner, Scrum Master, equipo de desarrollo. Sprint planning, daily, review y retrospectiva', duracion_tema: 180 },
  { cod_tema: 3, nombre_tema: 'Kanban y flujo continuo', descripcion_tema: 'Visualización del trabajo, límites WIP, métricas de flujo', duracion_tema: 120 },
  { cod_tema: 4, nombre_tema: 'Escalado ágil: SAFe y LeSS', descripcion_tema: 'Introducción a frameworks de escalado organizacional', duracion_tema: 90 },
  // Project Management (curso 2)
  { cod_tema: 5, nombre_tema: 'Fundamentos del PMBOK 7ma edición', descripcion_tema: 'Principios y dominios de desempeño', duracion_tema: 150 },
  { cod_tema: 6, nombre_tema: 'Gestión del alcance, tiempo y costo', descripcion_tema: 'EDT, cronograma, presupuesto y línea base', duracion_tema: 180 },
  { cod_tema: 7, nombre_tema: 'Gestión de riesgos y adquisiciones', descripcion_tema: 'Identificación, análisis cualitativo y cuantitativo, plan de respuesta', duracion_tema: 150 },
  // Análisis de Datos (curso 3)
  { cod_tema: 8, nombre_tema: 'Python para análisis de datos', descripcion_tema: 'Jupyter, numpy, pandas: estructuras y operaciones fundamentales', duracion_tema: 150 },
  { cod_tema: 9, nombre_tema: 'Limpieza y transformación de datos', descripcion_tema: 'Valores nulos, duplicados, outliers, encoding y feature engineering', duracion_tema: 120 },
  { cod_tema: 10, nombre_tema: 'Visualización efectiva', descripcion_tema: 'Matplotlib, seaborn, plotly. Principios de storytelling con datos', duracion_tema: 120 },
  // Power BI (curso 4)
  { cod_tema: 11, nombre_tema: 'Power Query y modelado de datos', descripcion_tema: 'Conexión a fuentes, transformaciones, modelo estrella', duracion_tema: 150 },
  { cod_tema: 12, nombre_tema: 'DAX: medidas y columnas calculadas', descripcion_tema: 'CALCULATE, FILTER, SUMX, contexto de filtro y fila', duracion_tema: 180 },
  { cod_tema: 13, nombre_tema: 'Dashboards interactivos', descripcion_tema: 'Diseño visual, bookmarks, drill-through, publicación en servicio', duracion_tema: 120 },
  // Machine Learning (curso 5)
  { cod_tema: 14, nombre_tema: 'Flujo de trabajo ML: CRISP-DM', descripcion_tema: 'Entendimiento del negocio, preparación de datos, modelado, evaluación', duracion_tema: 120 },
  { cod_tema: 15, nombre_tema: 'Modelos supervisados con scikit-learn', descripcion_tema: 'Regresión lineal/logística, árboles, random forest, SVM', duracion_tema: 180 },
  { cod_tema: 16, nombre_tema: 'Series temporales para pronóstico', descripcion_tema: 'ARIMA, SARIMA, Prophet. Aplicaciones en demanda y producción', duracion_tema: 150 },
  // Finanzas Corporativas (curso 6)
  { cod_tema: 17, nombre_tema: 'Estados financieros y análisis de ratios', descripcion_tema: 'Balance, estado de resultados, flujo de caja. Ratios de liquidez, endeudamiento, rentabilidad', duracion_tema: 150 },
  { cod_tema: 18, nombre_tema: 'Valorización de empresas: DCF y múltiplos', descripcion_tema: 'Flujo de caja descontado, WACC, valor terminal, comparables', duracion_tema: 180 },
  { cod_tema: 19, nombre_tema: 'Evaluación de proyectos: VAN, TIR, ROI', descripcion_tema: 'Criterios de decisión, análisis de sensibilidad, escenarios', duracion_tema: 120 },
  // Tesorería (curso 7)
  { cod_tema: 20, nombre_tema: 'Gestión del capital de trabajo', descripcion_tema: 'Ciclo de conversión de efectivo, políticas de crédito y cobranza', duracion_tema: 120 },
  { cod_tema: 21, nombre_tema: 'Coberturas cambiarias y forwards', descripcion_tema: 'Tipos de cambio, forwards, futuros, opciones. Estrategias de cobertura', duracion_tema: 150 },
  // Liderazgo (curso 8)
  { cod_tema: 22, nombre_tema: 'Modelos de liderazgo transformacional', descripcion_tema: 'Bass, Goleman. Inteligencia emocional y motivación', duracion_tema: 120 },
  { cod_tema: 23, nombre_tema: 'Gestión del cambio organizacional', descripcion_tema: 'Modelo de Kotter, ADKAR. Resistencia al cambio y comunicación', duracion_tema: 150 },
  // Comunicación (curso 9)
  { cod_tema: 24, nombre_tema: 'Estructura del discurso ejecutivo', descripcion_tema: 'Storytelling, pirámide de Minto, elevator pitch', duracion_tema: 120 },
  { cod_tema: 25, nombre_tema: 'Manejo de audiencias y Q&A', descripcion_tema: 'Técnicas para responder preguntas difíciles, manejo de nervios', duracion_tema: 90 },
  // Transformación Digital (curso 10)
  { cod_tema: 26, nombre_tema: 'Tecnologías de la Industria 4.0', descripcion_tema: 'IoT, cloud computing, big data, IA, blockchain. Casos de uso', duracion_tema: 150 },
  { cod_tema: 27, nombre_tema: 'Estrategia de transformación digital', descripcion_tema: 'Modelos de madurez digital, roadmap, KPIs de transformación', duracion_tema: 120 },
  // Ciberseguridad (curso 11)
  { cod_tema: 28, nombre_tema: 'Frameworks de seguridad: ISO 27001 y NIST', descripcion_tema: 'Estructura, controles, implementación y certificación', duracion_tema: 150 },
  { cod_tema: 29, nombre_tema: 'Gestión de incidentes y continuidad', descripcion_tema: 'CSIRT, plan de respuesta, BCP/DRP, simulacros', duracion_tema: 120 },
  // Excel Avanzado (curso 12)
  { cod_tema: 30, nombre_tema: 'Tablas dinámicas y Power Query', descripcion_tema: 'Creación, segmentación, gráficos dinámicos. Conexión a múltiples fuentes', duracion_tema: 120 },
  { cod_tema: 31, nombre_tema: 'Macros VBA y automatización', descripcion_tema: 'Grabación, edición de código, formularios, integración con otras apps', duracion_tema: 150 },
];

export const mockSilaboCursos: MockSilaboCurso[] = [
  // Gestión de Proyectos Ágiles
  { cod_tipo_curso: 1, cod_tema: 1, secuencia_logica: 1 },
  { cod_tipo_curso: 1, cod_tema: 2, secuencia_logica: 2 },
  { cod_tipo_curso: 1, cod_tema: 3, secuencia_logica: 3 },
  { cod_tipo_curso: 1, cod_tema: 4, secuencia_logica: 4 },
  // Project Management
  { cod_tipo_curso: 2, cod_tema: 5, secuencia_logica: 1 },
  { cod_tipo_curso: 2, cod_tema: 6, secuencia_logica: 2 },
  { cod_tipo_curso: 2, cod_tema: 7, secuencia_logica: 3 },
  // Análisis de Datos
  { cod_tipo_curso: 3, cod_tema: 8, secuencia_logica: 1 },
  { cod_tipo_curso: 3, cod_tema: 9, secuencia_logica: 2 },
  { cod_tipo_curso: 3, cod_tema: 10, secuencia_logica: 3 },
  // Power BI
  { cod_tipo_curso: 4, cod_tema: 11, secuencia_logica: 1 },
  { cod_tipo_curso: 4, cod_tema: 12, secuencia_logica: 2 },
  { cod_tipo_curso: 4, cod_tema: 13, secuencia_logica: 3 },
  // Machine Learning
  { cod_tipo_curso: 5, cod_tema: 14, secuencia_logica: 1 },
  { cod_tipo_curso: 5, cod_tema: 15, secuencia_logica: 2 },
  { cod_tipo_curso: 5, cod_tema: 16, secuencia_logica: 3 },
  // Finanzas Corporativas
  { cod_tipo_curso: 6, cod_tema: 17, secuencia_logica: 1 },
  { cod_tipo_curso: 6, cod_tema: 18, secuencia_logica: 2 },
  { cod_tipo_curso: 6, cod_tema: 19, secuencia_logica: 3 },
  // Tesorería
  { cod_tipo_curso: 7, cod_tema: 20, secuencia_logica: 1 },
  { cod_tipo_curso: 7, cod_tema: 21, secuencia_logica: 2 },
  // Liderazgo
  { cod_tipo_curso: 8, cod_tema: 22, secuencia_logica: 1 },
  { cod_tipo_curso: 8, cod_tema: 23, secuencia_logica: 2 },
  // Comunicación
  { cod_tipo_curso: 9, cod_tema: 24, secuencia_logica: 1 },
  { cod_tipo_curso: 9, cod_tema: 25, secuencia_logica: 2 },
  // Transformación Digital
  { cod_tipo_curso: 10, cod_tema: 26, secuencia_logica: 1 },
  { cod_tipo_curso: 10, cod_tema: 27, secuencia_logica: 2 },
  // Ciberseguridad
  { cod_tipo_curso: 11, cod_tema: 28, secuencia_logica: 1 },
  { cod_tipo_curso: 11, cod_tema: 29, secuencia_logica: 2 },
  // Excel Avanzado
  { cod_tipo_curso: 12, cod_tema: 30, secuencia_logica: 1 },
  { cod_tipo_curso: 12, cod_tema: 31, secuencia_logica: 2 },
];

export const mockHorariosSemanales: MockHorarioSemanal[] = [
  { tipo_horario: 1, descripcion_horario: 'Sábados 8:00 a. m. a 1:00 p. m.' },
  { tipo_horario: 2, descripcion_horario: 'Lunes y Miércoles 7:00 p. m. a 10:00 p. m.' },
  { tipo_horario: 3, descripcion_horario: 'Martes y Jueves 7:00 p. m. a 10:00 p. m.' },
  { tipo_horario: 4, descripcion_horario: 'Viernes 6:00 p. m. a 10:00 p. m. y Sábados 8:00 a. m. a 12:00 p. m.' },
];

export const mockDetalleHorarios: MockDetalleHorario[] = [
  // Sábados 8am-1pm
  { tipo_horario: 1, dia_semana: 'S', hora: 8 },
  { tipo_horario: 1, dia_semana: 'S', hora: 9 },
  { tipo_horario: 1, dia_semana: 'S', hora: 10 },
  { tipo_horario: 1, dia_semana: 'S', hora: 11 },
  { tipo_horario: 1, dia_semana: 'S', hora: 12 },
  // Lunes y Miércoles 7pm-10pm
  { tipo_horario: 2, dia_semana: 'L', hora: 19 },
  { tipo_horario: 2, dia_semana: 'L', hora: 20 },
  { tipo_horario: 2, dia_semana: 'L', hora: 21 },
  { tipo_horario: 2, dia_semana: 'X', hora: 19 },
  { tipo_horario: 2, dia_semana: 'X', hora: 20 },
  { tipo_horario: 2, dia_semana: 'X', hora: 21 },
  // Martes y Jueves 7pm-10pm
  { tipo_horario: 3, dia_semana: 'M', hora: 19 },
  { tipo_horario: 3, dia_semana: 'M', hora: 20 },
  { tipo_horario: 3, dia_semana: 'M', hora: 21 },
  { tipo_horario: 3, dia_semana: 'J', hora: 19 },
  { tipo_horario: 3, dia_semana: 'J', hora: 20 },
  { tipo_horario: 3, dia_semana: 'J', hora: 21 },
];

export const mockServicios: MockServicio[] = [
  { cod_tipo_servicio: 1, descripcion_servicio: 'Curso de Gestión de Proyectos Ágiles', tarifa_curso: 199.00, total_inscripciones: 342, total_veces_completado: 280, estado_capacitacion: 'A', tipo_curso: 1, tipo_horario: 1 },
  { cod_tipo_servicio: 2, descripcion_servicio: 'Diplomado en Project Management (PMI)', tarifa_curso: 450.00, total_inscripciones: 180, total_veces_completado: 145, estado_capacitacion: 'A', tipo_curso: 2, tipo_horario: 1 },
  { cod_tipo_servicio: 3, descripcion_servicio: 'Curso de Análisis de Datos para Negocios', tarifa_curso: 249.00, total_inscripciones: 215, total_veces_completado: 170, estado_capacitacion: 'A', tipo_curso: 3, tipo_horario: 2 },
  { cod_tipo_servicio: 4, descripcion_servicio: 'Curso de Power BI', tarifa_curso: 180.00, total_inscripciones: 430, total_veces_completado: 380, estado_capacitacion: 'A', tipo_curso: 4, tipo_horario: 3 },
  { cod_tipo_servicio: 5, descripcion_servicio: 'Machine Learning Aplicado a la Industria', tarifa_curso: 349.00, total_inscripciones: 95, total_veces_completado: 62, estado_capacitacion: 'A', tipo_curso: 5, tipo_horario: 2 },
  { cod_tipo_servicio: 6, descripcion_servicio: 'Curso de Finanzas Corporativas', tarifa_curso: 280.00, total_inscripciones: 260, total_veces_completado: 210, estado_capacitacion: 'A', tipo_curso: 6, tipo_horario: 3 },
  { cod_tipo_servicio: 7, descripcion_servicio: 'Curso de Gestión de Tesorería y Riesgo', tarifa_curso: 250.00, total_inscripciones: 145, total_veces_completado: 120, estado_capacitacion: 'A', tipo_curso: 7, tipo_horario: 2 },
  { cod_tipo_servicio: 8, descripcion_servicio: 'Diplomado en Liderazgo Estratégico', tarifa_curso: 390.00, total_inscripciones: 310, total_veces_completado: 265, estado_capacitacion: 'A', tipo_curso: 8, tipo_horario: 1 },
  { cod_tipo_servicio: 9, descripcion_servicio: 'Curso de Comunicación y Oratoria Ejecutiva', tarifa_curso: 150.00, total_inscripciones: 520, total_veces_completado: 470, estado_capacitacion: 'A', tipo_curso: 9, tipo_horario: 4 },
  { cod_tipo_servicio: 10, descripcion_servicio: 'Curso de Transformación Digital e Industria 4.0', tarifa_curso: 320.00, total_inscripciones: 185, total_veces_completado: 140, estado_capacitacion: 'A', tipo_curso: 10, tipo_horario: 1 },
  { cod_tipo_servicio: 11, descripcion_servicio: 'Curso de Ciberseguridad y Gestión de Riesgos TI', tarifa_curso: 350.00, total_inscripciones: 120, total_veces_completado: 85, estado_capacitacion: 'I', tipo_curso: 11, tipo_horario: 3 },
  { cod_tipo_servicio: 12, descripcion_servicio: 'Curso de Excel Avanzado para Finanzas', tarifa_curso: 120.00, total_inscripciones: 680, total_veces_completado: 590, estado_capacitacion: 'A', tipo_curso: 12, tipo_horario: 4 },
];

export const mockCatalogo = {
  segmentos: mockSegmentos,
  cursos: mockCursos,
  prerrequisitos: mockPrerrequisitos,
  temas: mockTemas,
  silaboCursos: mockSilaboCursos,
  horariosSemanales: mockHorariosSemanales,
  detalleHorarios: mockDetalleHorarios,
  servicios: mockServicios,
};
