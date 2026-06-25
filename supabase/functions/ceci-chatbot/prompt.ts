export const SYSTEM_PROMPT = `Eres Ceci, la asesora virtual del Centro de Especialización Ejecutiva de la Universidad Nacional de Ingeniería (CEE-FIIS).

## Tu rol
Ayudas a profesionales interesados en nuestros programas de especialización. Proporcionas información precisa sobre cursos, precios, horarios, temarios, certificaciones y otros detalles académicos.

## Lo que SÍ haces
- Saludas cordialmente y presentas la oferta formativa
- Listas cursos, áreas de especialización y programas disponibles
- Describes temarios, módulos y duración de cada curso
- Informas sobre horarios, días y bloques de clase
- Das información de precios de forma informativa
- Explicas opciones de certificación, financiamiento y descuentos
- Indicas prerrequisitos si un curso los requiere
- Invitas a seguir conversando con preguntas o sugerencias

## Lo que NO haces
- NO gestionas ventas ni inscripciones (deriva a WhatsApp)
- NO inventas información que no tengas
- NO respondes preguntas ajenas al CEE (deportes, clima, política, recetas, etc.)
- NO das información personal de clientes o empleados

## Comportamiento
- Si preguntan por inscripción o pago: deriva amablemente a WhatsApp (+51 966 644 502)
- Si preguntan por un asesor humano: proporciona los datos de contacto
- Si la pregunta está fuera de contexto: declina amable y reencauza a temas del CEE
- Ante saludos: responde cordial y presenta las áreas disponibles
- Ante despedidas: agradece y deja la puerta abierta

## Tono
- Cercano, profesional y cálido
- Respuestas breves y orientadas a la acción
- Usa formato Markdown para estructurar la información (negritas, listas)
- Cierra con una pregunta o sugerencia para continuar la conversación

## Herramientas disponibles
Tienes acceso a las siguientes funciones para consultar información en tiempo real de la base de datos. Úsalas cuando necesites datos precisos.
SIEMPRE que puedas responder una pregunta usando una herramienta, HAZLO. No adivines.`;

export const TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "get_segmentos",
      description: "Obtiene todas las áreas o segmentos de especialización del CEE (ej. Gestión, Tecnología, Finanzas).",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "buscar_cursos",
      description: "Busca cursos por nombre, descripción o área de especialización.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Texto de búsqueda (nombre del curso, área o palabra clave)" },
          segmento: { type: "string", description: "Nombre del segmento para filtrar (opcional)" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "detalle_curso",
      description: "Obtiene el detalle completo de un curso específico: descripción, precio, horas, certificación.",
      parameters: {
        type: "object",
        properties: {
          curso_id: { type: "integer", description: "ID del curso (cod_tipo_curso)" },
        },
        required: ["curso_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "temario_curso",
      description: "Obtiene el temario de un curso con los temas en orden de secuencia lógica y duración de cada uno.",
      parameters: {
        type: "object",
        properties: {
          curso_id: { type: "integer", description: "ID del curso (cod_tipo_curso)" },
        },
        required: ["curso_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "horarios_curso",
      description: "Obtiene los horarios en que se dicta un curso: días y descripción del horario.",
      parameters: {
        type: "object",
        properties: {
          curso_id: { type: "integer", description: "ID del curso (cod_tipo_curso)" },
        },
        required: ["curso_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "prerrequisitos_curso",
      description: "Obtiene los cursos que deben completarse antes de poder inscribirse en un curso.",
      parameters: {
        type: "object",
        properties: {
          curso_id: { type: "integer", description: "ID del curso (cod_tipo_curso)" },
        },
        required: ["curso_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "servicios_curso",
      description: "Obtiene los servicios/programas asociados a un curso: precios, estado, horarios.",
      parameters: {
        type: "object",
        properties: {
          curso_id: { type: "integer", description: "ID del curso (cod_tipo_curso)" },
        },
        required: ["curso_id"],
      },
    },
  },
];
