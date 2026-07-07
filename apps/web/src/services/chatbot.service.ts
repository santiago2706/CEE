import type { ChatAction, CardCourse } from '@/types/chatbot.types';
import { useChatStore } from '@/store/chatStore';
import { mockCatalogo as fallbackCatalogo } from '@/mocks/data/chatbot.mock';
import { chatbotData } from '@/services/chatbot.data';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = (ms = 600) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Catálogo en memoria — se carga una vez desde Supabase, fallback a mock */
let catalogo = fallbackCatalogo;
let catalogoCargado = false;

async function ensureCatalogo() {
  if (catalogoCargado) return;
  catalogo = await chatbotData.cargarCatalogo();
  catalogoCargado = true;
}
ensureCatalogo();

// ──────────────── Helpers ────────────────

function getServiciosPorCurso(codTipoCurso: number) {
  return catalogo.servicios.filter((s) => s.tipo_curso === codTipoCurso);
}

function getTemasPorCurso(codTipoCurso: number) {
  const rels = catalogo.silaboCursos.filter((r) => r.cod_tipo_curso === codTipoCurso);
  return rels
    .map((r) => {
      const tema = catalogo.temas.find((t) => t.cod_tema === r.cod_tema);
      return tema ? { ...tema, secuencia_logica: r.secuencia_logica } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a!.secuencia_logica - b!.secuencia_logica);
}

// ──────────────── Groq API ────────────────

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string;
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

interface GroqMsg {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
  tool_calls?: { id: string; type: 'function'; function: { name: string; arguments: string } }[];
}

// ──────────────── System Prompt ────────────────

const SYSTEM_PROMPT = `Eres Ceci, la asesora virtual del Centro de Especialización Ejecutiva de la Universidad Nacional de Ingeniería (CEE-FIIS), en Lima, Perú.

## Tu rol
Ayudas a profesionales interesados en programas de especialización del CEE-FIIS. Proporcionas información precisa sobre cursos, precios, temarios y certificaciones.

## Datos de contacto
- WhatsApp: +51 966 644 502
- Correo: contacto@cee-fiis.edu.pe

## Herramientas
Tienes acceso a herramientas para consultar la base de datos de cursos. NUNCA inventes nombres, precios ni detalles de cursos. Usa las herramientas para obtener datos reales.

## Cómo responder
- **Saludos** ("hola", "buenas", "qué tal"): SOLO responde con un saludo cordial de 1-2 líneas. NO uses herramientas. NO muestres cursos. Ejemplo: "¡Hola! 👋 Soy Ceci, asesora virtual del CEE-FIIS. ¿En qué área te gustaría especializarte?"
- **Catálogo** (el usuario pide ver cursos): usa buscar_cursos para encontrar cursos. Menciona nombre y precio. Sé conciso, máximo 5 cursos por respuesta.
- **Temario**: usa temario_curso. Lista los temas en orden numerado con su duración. Solo si el usuario lo pide explícitamente.
- **Precio**: usa detalle_curso. Muestra solo el precio y agrega: [chip:Ver opciones de financiamiento](¿Qué opciones de financiamiento tienen?). Sé breve.
- **Certificación / ponentes**: 2-3 líneas máximo explicando que el certificado es a nombre de la UNI-FIIS.
- **Financiamiento**: explica en 2-3 bullet points.
- **Inscripción / pago**: deriva a WhatsApp (+51 966 644 502). Una sola línea.
- **Asesor humano**: proporciona WhatsApp y correo. Una sola línea.
- **Preguntas fuera del CEE**: una línea declinando y una línea ofreciendo ver cursos.

## Regla de oro
- Respuestas CORTAS. Máximo 4 líneas. El usuario está en un chat, no leyendo un email.
- SOLO usa herramientas cuando el usuario pide explícitamente cursos, precios o temarios.
- NUNCA muestres el catálogo completo sin que el usuario lo pida.

## Tono
Cercano, profesional, CONCISO. Respuestas de 2-4 líneas. Usa Markdown. Español. Máximo 1 emoji por mensaje. NUNCA hagas listas enormes ni muestres todo el catálogo sin que te lo pidan.`;

// ──────────────── Tool Definitions ────────────────

const TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'get_segmentos',
      description: 'Obtiene las áreas de especialización del CEE.',
      parameters: { type: 'object' as const, properties: {}, required: [] as string[] },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'buscar_cursos',
      description: 'Busca cursos por nombre, descripción o área. Usa query vacío ("") para obtener todos.',
      parameters: {
        type: 'object' as const,
        properties: {
          query: { type: 'string', description: 'Texto a buscar (nombre del curso o área). Vacío = todos.' },
          segmento: { type: 'string', description: 'Nombre del área para filtrar (opcional).' },
        },
        required: ['query'] as string[],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'detalle_curso',
      description: 'Obtiene el detalle de un curso: descripción, precio, modalidad, nivel, duración, PDF.',
      parameters: {
        type: 'object' as const,
        properties: { curso_id: { type: 'integer', description: 'ID del curso (cod_tipo_curso)' } },
        required: ['curso_id'] as string[],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'temario_curso',
      description: 'Obtiene el temario de un curso: temas en orden de secuencia con duración de cada bloque.',
      parameters: {
        type: 'object' as const,
        properties: { curso_id: { type: 'integer', description: 'ID del curso (cod_tipo_curso)' } },
        required: ['curso_id'] as string[],
      },
    },
  },
];

// ──────────────── Tool Execution ────────────────

function ejecutarHerramienta(name: string, args: Record<string, unknown>): unknown {
  const cursoId = args.curso_id ? Number(args.curso_id) : 0;

  switch (name) {
    case 'get_segmentos':
      return catalogo.segmentos.map((s) => ({ id: s.segmento_curso, nombre: s.nombre_segmento }));

    case 'buscar_cursos': {
      const query = String(args.query ?? '').toLowerCase();
      const segmento = args.segmento ? String(args.segmento).toLowerCase() : '';
      let cursos = [...catalogo.cursos];
      if (segmento) {
        const seg = catalogo.segmentos.find((s) => s.nombre_segmento.toLowerCase().includes(segmento));
        if (seg) cursos = cursos.filter((c) => c.segmento_curso === seg.segmento_curso);
      }
      if (query && query !== 'todos') {
        cursos = cursos.filter(
          (c) =>
            c.nombre_curso.toLowerCase().includes(query) ||
            (c.descripcion_curso ?? '').toLowerCase().includes(query),
        );
      }
      return cursos.slice(0, 8).map((c) => {
        const seg = catalogo.segmentos.find((s) => s.segmento_curso === c.segmento_curso);
        const svc = catalogo.servicios.find((s) => s.tipo_curso === c.cod_tipo_curso);
        return {
          id: c.cod_tipo_curso,
          nombre: c.nombre_curso,
          descripcion: c.short_description || c.descripcion_curso || '',
          segmento: seg?.nombre_segmento ?? '',
          precio: svc?.tarifa_curso ?? 0,
          inscripciones: svc?.total_inscripciones ?? 0,
          slug: c.slug,
          modality: c.modality || '',
        };
      });
    }

    case 'detalle_curso': {
      if (!cursoId) return { error: 'curso_id es requerido' };
      const curso = catalogo.cursos.find((c) => c.cod_tipo_curso === cursoId);
      if (!curso) return { error: `Curso con ID ${cursoId} no encontrado` };
      const seg = catalogo.segmentos.find((s) => s.segmento_curso === curso.segmento_curso);
      const svcs = getServiciosPorCurso(cursoId);
      return {
        id: curso.cod_tipo_curso,
        nombre: curso.nombre_curso,
        descripcion: curso.short_description || curso.descripcion_curso || '',
        segmento: seg?.nombre_segmento ?? '',
        modalidad: curso.modality || 'No especificada',
        nivel: curso.level || 'No especificado',
        horas: curso.academic_hours || 0,
        pdf: curso.syllabus_pdf_url || null,
        servicios: svcs.map((s) => ({
          precio: s.tarifa_curso,
          inscripciones: s.total_inscripciones,
          estado: s.estado_capacitacion === 'A' ? 'Disponible' : 'No disponible',
        })),
      };
    }

    case 'temario_curso': {
      if (!cursoId) return { error: 'curso_id es requerido' };
      const temas = getTemasPorCurso(cursoId);
      return temas.map((t) => ({
        secuencia: t!.secuencia_logica,
        tema: t!.nombre_tema,
        descripcion: t!.descripcion_tema,
        duracion_min: t!.duracion_tema,
      }));
    }

    default:
      return { error: `Herramienta desconocida: ${name}` };
  }
}

/** Extrae CardCourse[] de los resultados de herramientas */
function extraerCards(toolResults: { name: string; data: unknown }[]): CardCourse[] {
  const cards: CardCourse[] = [];
  const seen = new Set<number>();

  for (const tr of toolResults) {
    if (tr.name === 'buscar_cursos' && Array.isArray(tr.data)) {
      for (const c of tr.data as Record<string, unknown>[]) {
        const id = Number(c.id);
        if (!id || seen.has(id)) continue;
        seen.add(id);
        cards.push({
          id,
          name: String(c.nombre || ''),
          segment: String(c.segmento || ''),
          price: Number(c.precio || 0),
          description: String(c.descripcion || ''),
          imageUrl: '',
          slug: String(c.slug || ''),
        });
      }
    }
    if (tr.name === 'detalle_curso' && tr.data && !(tr.data as Record<string, unknown>).error) {
      const d = tr.data as Record<string, unknown>;
      const id = Number(d.id);
      if (id && !seen.has(id)) {
        seen.add(id);
        cards.push({
          id,
          name: String(d.nombre || ''),
          segment: String(d.segmento || ''),
          price: Array.isArray(d.servicios) ? Number((d.servicios as Record<string, unknown>[])[0]?.precio || 0) : 0,
          description: String(d.descripcion || ''),
          imageUrl: '',
          slug: catalogo.cursos.find((c) => c.cod_tipo_curso === id)?.slug || '',
        });
      }
    }
  }

  return cards;
}

// ──────────────── Groq Call ────────────────

async function enviarAGroq(
  userMessages: { role: string; content: string }[],
): Promise<{ text: string; actions?: CardCourse[] }> {
  const messages: GroqMsg[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...userMessages.map((m) => ({ role: m.role as GroqMsg['role'], content: m.content })),
  ];

  const toolResults: { name: string; data: unknown }[] = [];

  // Llamada inicial con herramientas
  let res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages, max_tokens: 1024, temperature: 0.7, tools: TOOLS }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`[Ceci] Groq error:`, err.slice(0, 200));
    throw new Error(`API ${res.status}`);
  }

  let completion = await res.json();
  let assistantMsg: GroqMsg = completion.choices[0].message;
  let loops = 0;

  // Loop de herramientas
  while (assistantMsg.tool_calls?.length && loops < 5) {
    loops++;
    messages.push(assistantMsg);

    for (const tc of assistantMsg.tool_calls) {
      let fnArgs: Record<string, unknown> = {};
      try { fnArgs = JSON.parse(tc.function.arguments); } catch { /* */ }
      const data = ejecutarHerramienta(tc.function.name, fnArgs);
      toolResults.push({ name: tc.function.name, data });
      messages.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(data) });
    }

    res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages, max_tokens: 1024, temperature: 0.7, tools: TOOLS }),
    });

    if (!res.ok) { console.error('[Ceci] Tool loop error'); break; }

    completion = await res.json();
    assistantMsg = completion.choices[0].message;
  }

  const rawText = assistantMsg.content ?? '';
  // Limpiar artefactos de function call que el modelo a veces filtra en el texto
  const text = rawText
    .replace(/<function=\w+>\s*\{[^}]*\}\s*<\/function>/gi, '')
    .replace(/<function=\w+>.*?<\/function>/gis, '')
    .trim()
    || 'Lo siento, no pude procesar tu consulta. ¿Podrías intentarlo de nuevo?';
  const actions = extraerCards(toolResults);

  return { text, actions: actions.length > 0 ? actions : undefined };
}

// ──────────────── Edge Function (prod) ────────────────

const EDGE_FUNCTION_URL = import.meta.env.VITE_SUPABASE_CHATBOT_URL as string;

async function callEdgeFunction(messages: { role: string; content: string }[]): Promise<{ reply: string }> {
  if (!EDGE_FUNCTION_URL) throw new Error('VITE_SUPABASE_CHATBOT_URL no está configurada');

  const res = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) throw new Error(`Error al llamar al chatbot: ${res.status}`);
  return res.json();
}

// ──────────────── Public API ────────────────

const USE_GROQ_DIRECT = Boolean(GROQ_API_KEY);

export const chatbotService = {
  async sendMessage(text: string): Promise<void> {
    const store = useChatStore.getState();
    store.addMessage({ role: 'user', text });
    store.setTyping(true);

    try {
      let reply: string;
      let replyActions: ChatAction[] | undefined;

      if (USE_GROQ_DIRECT) {
        const messages = store.messages.map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.text,
        }));
        messages.push({ role: 'user', content: text });

        const result = await enviarAGroq(messages);
        reply = result.text;

        if (result.actions?.length) {
          replyActions = [{ type: 'courses', courses: result.actions }];
        }
      } else if (USE_MOCKS) {
        reply = 'Hola 👋 Soy Ceci, la asesora virtual del CEE-FIIS. Estoy aquí para ayudarte con información sobre cursos, precios y certificaciones. ¿En qué tema te gustaría especializarte?';
        await delay(600);
      } else {
        const messages = store.messages.map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.text,
        }));
        messages.push({ role: 'user', content: text });
        const result = await callEdgeFunction(messages);
        reply = result.reply;
      }

      store.addMessage({ role: 'bot', text: reply, actions: replyActions });

      // WhatsApp highlight si menciona asesor
      if (/whatsapp|\+51\s*9|asesor|humano|contactar|escr[ií]benos/i.test(reply)) {
        useChatStore.getState().triggerWhatsAppHighlight();
      }
    } catch (err) {
      console.error('[Ceci] Error:', err);
      store.addMessage({
        role: 'bot',
        text: 'Ups, tuve un problema al procesar tu mensaje. ¿Podrías intentarlo de nuevo?',
      });
    } finally {
      store.setTyping(false);
    }
  },

  async sendQuickAction(query: string): Promise<void> {
    return this.sendMessage(query);
  },
};
