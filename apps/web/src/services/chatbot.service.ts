import type { ChatMessage, ChatAction, CardCourse } from '@/types/chatbot.types';
import { useChatStore } from '@/store/chatStore';
import { mockCatalogo as fallbackCatalogo } from '@/mocks/data/chatbot.mock';
import { chatbotData } from '@/services/chatbot.data';
import type {
  MockCurso,
  MockServicio,
  MockTema,
} from '@/types/chatbot.types';

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

// Lanzar carga inmediatamente (no bloquear)
ensureCatalogo();

// ──────────────── Mock helpers ────────────────

function findCurso(query: string): MockCurso | null {
  const q = query.toLowerCase();
  return (
    catalogo.cursos.find(
      (c) =>
        c.nombre_curso.toLowerCase().includes(q) ||
        c.descripcion_curso?.toLowerCase().includes(q),
    ) ?? null
  );
}

function findServiciosByCurso(codTipoCurso: number): MockServicio[] {
  return catalogo.servicios.filter((s) => s.tipo_curso === codTipoCurso);
}

function getTemasByCurso(codTipoCurso: number): (MockTema & { secuencia_logica: number })[] {
  const rels = catalogo.silaboCursos.filter((r) => r.cod_tipo_curso === codTipoCurso);
  return rels
    .map((r) => {
      const tema = catalogo.temas.find((t) => t.cod_tema === r.cod_tema);
      return tema ? { ...tema, secuencia_logica: r.secuencia_logica } : null;
    })
    .filter(Boolean) as (MockTema & { secuencia_logica: number })[];
}

function formatCursoLista(cursosQuery: string): string {
  let cursos = [...catalogo.cursos];
  const q = cursosQuery.toLowerCase();
  if (q && q !== 'todos') {
    const segmento = catalogo.segmentos.find(
      (s) => s.nombre_segmento.toLowerCase().includes(q),
    );
    if (segmento) {
      cursos = cursos.filter((c) => c.segmento_curso === segmento.segmento_curso);
    }
  }
  return cursos
    .slice(0, 6)
    .map((c) => {
      const svc = catalogo.servicios.find((s) => s.tipo_curso === c.cod_tipo_curso);
      const precio = svc ? `S/ ${svc.tarifa_curso.toFixed(2)}` : '';
      return `- **${c.nombre_curso}** ${precio ? `(${precio})` : ''}`;
    })
    .join('\n');
}

function formatTemario(codTipoCurso: number): string {
  const temas = getTemasByCurso(codTipoCurso).sort((a, b) => a.secuencia_logica - b.secuencia_logica);
  const curso = catalogo.cursos.find((c) => c.cod_tipo_curso === codTipoCurso);
  const header = curso ? `**Temario de ${curso.nombre_curso}**\n\n` : '';
  return (
    header +
    temas
      .map(
        (t) =>
          `${t.secuencia_logica}. **${t.nombre_tema}** (${t.duracion_tema} min)${t.descripcion_tema ? `\n   ${t.descripcion_tema}` : ''}`,
      )
      .join('\n')
  );
}

function formatPrecio(codTipoCurso: number): string {
  const servicios = findServiciosByCurso(codTipoCurso);
  if (!servicios.length) return 'No tengo información de precio para este curso.';
  return (
    servicios
      .map((s) => {
        const estado = s.estado_capacitacion === 'A' ? '✅ Disponible' : '❌ No disponible';
        return `- **${s.descripcion_servicio}**: S/ ${s.tarifa_curso.toFixed(2)} — ${estado}`;
      })
      .join('\n') +
    '\n\n[chip:Ver opciones de financiamiento](¿Qué opciones de financiamiento tienen?)'
  );
}

function formatSegmentos(): string {
  return (
    '**Áreas de especialización disponibles:**\n\n' +
    catalogo.segmentos.map((s) => `- ${s.nombre_segmento}`).join('\n')
  );
}

function buildCourseCard(curso: MockCurso): {
  name: string;
  segment: string;
  price: number;
  description: string;
  imageUrl: string;
  slug: string;
  id: number;
} {
  const segmento = catalogo.segmentos.find((s) => s.segmento_curso === curso.segmento_curso);
  const servicio = catalogo.servicios.find((s) => s.tipo_curso === curso.cod_tipo_curso);
  return {
    id: curso.cod_tipo_curso,
    name: curso.nombre_curso,
    segment: segmento?.nombre_segmento ?? '',
    price: servicio?.tarifa_curso ?? 0,
    description: curso.descripcion_curso ?? '',
    imageUrl: `https://picsum.photos/seed/curso-cee-${curso.cod_tipo_curso}/800/450`,
    slug: curso.slug,
  };
}

// ──────────────── Mock Chatbot Engine ────────────────

function classifyIntentMock(msg: string): string {
  const m = msg.toLowerCase();

  // Saludos y cortesías
  if (/\b(hola|buenas|buenos d[ií]as|buenas tardes|buenas noches|hey\b|saludos|buen d[ií]a)\b/.test(m)) return 'saludo';
  if (/\b(gracias|chau|adi[oó]s|hasta luego|nos vemos|bye)\b/.test(m)) return 'despedida';

  // Intenciones comerciales / derivación
  if (/\b(inscribir|inscripci[oó]n|matricular|matr[ií]cula|pagar|comprar|adquirir|quiero inscribirme|quiero matricularme)\b/.test(m)) return 'venta';
  if (/\b(asesor|hablar con alguien|persona real|humano|ejecutivo|consultor|contactar|comunicarme|atender|ayuda humana|hablar con un)\b/.test(m)) return 'asesor';

  // Precio / costo
  if (/\b(precio|cu[aá]nto cuesta|cu[aá]nto sale|costo|inversi[oó]n|tarifa|cu[aá]nto vale|barato|caro|vale)\b/.test(m)) return 'precio';

  // Financiamiento
  if (/\b(financia|cuotas?|descuento|pronto pago|corporativo|fraccionado|pago|cr[eé]dito|al contado)\b/.test(m)) return 'financiamiento';

  // Temario / sílabo
  if (/\b(temario|s[ií]labo|temas|m[oó]dulos?|contenido|qu[eé] se ve|qu[eé] trae|qu[eé] incluye|plan de estudios|estructura)\b/.test(m)) return 'temario';

  // Modalidad / nivel / horas / duración → devuelve detalle del curso
  if (/\b(modalidad|nivel|horas? acad[eé]micas?|virtual|presencial|h[ií]brido|b[aá]sico|intermedio|avanzado|cu[aá]nto dura|cu[aá]ntas horas)\b/.test(m)) return 'curso';

  // Certificación
  if (/\b(certifica|diploma|certificado|aval|acredita|reconocimiento|t[ií]tulo|validez|valor curricular)\b/.test(m)) return 'certificacion';

  // Ponentes
  if (/\b(profesor|ponente|docente|instructor|plana docente|qui[eé]n dicta|qui[eé]n ense[ñn]a|qui[eé]nes son|profesores?)\b/.test(m)) return 'ponentes';

  // Catálogo / listado
  if (/\b(categor[ií]a|[aá]reas?|segmento|qu[eé] cursos|cat[aá]logo|programas|oferta|disponible|qu[eé] tienen|qu[eé] ofrecen|qu[eé] hay|mu[eé]strame|dime qu[eé]|ver cursos|listado|lista de|todos los)\b/.test(m)) return 'catalogo';

  // Intento de búsqueda por nombre de curso
  // Buscar fragmentos significativos de nombres de cursos
  for (const c of catalogo.cursos) {
    const keywords = c.nombre_curso.toLowerCase()
      .replace(/[()]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3);
    const matched = keywords.filter((kw) => m.includes(kw));
    if (matched.length >= 2) return 'curso';
    // Si el nombre del curso es corto, basta con 1 keyword larga
    if (matched.length >= 1 && matched[0].length > 6) return 'curso';
  }

  // También buscar nombres de segmentos
  for (const seg of catalogo.segmentos) {
    const segKW = seg.nombre_segmento.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    if (segKW.some((kw) => m.includes(kw))) return 'catalogo';
  }

  // Si la frase es corta y no es saludo, probablemente es una pregunta sobre cursos
  if (m.length < 30) return 'catalogo';

  return 'desconocido';
}

async function generateMockResponse(msg: string, history: ChatMessage[], context: ReturnType<typeof useChatStore.getState>['context']): Promise<{ text: string; actions?: ChatAction[] }> {
  const intent = classifyIntentMock(msg);
  const m = msg.toLowerCase();
  let foundCurso: MockCurso | null = null;

  // Buscar curso mencionado en el mensaje
  for (const c of catalogo.cursos) {
    const parts = c.nombre_curso.toLowerCase().split(' ');
    if (parts.some((p) => p.length > 4 && m.includes(p))) {
      foundCurso = c;
      break;
    }
  }
  if (!foundCurso && context.lastCourseMentioned) {
    foundCurso =
      catalogo.cursos.find(
        (c) => c.nombre_curso === context.lastCourseMentioned,
      ) ?? null;
  }

  switch (intent) {
    case 'saludo':
      return {
        text: `¡Hola! 👋 Soy **Ceci**, la asesora virtual del **Centro de Especialización Ejecutiva de la FIIS-UNI**. 

Estoy aquí para ayudarte con información sobre nuestros cursos, horarios, precios, certificaciones y más.

¿En qué tema te gustaría especializarte? Puedes preguntarme por un curso específico o explorar nuestras áreas:`,
      };

    case 'despedida':
      return {
        text: '¡Gracias por tu interés en el CEE-FIIS! 🎓 Si tienes más preguntas en el futuro, aquí estaré para ayudarte. ¡Mucho éxito!',
      };

    case 'catalogo': {
      const segMencionado = catalogo.segmentos.find((s) =>
        m.includes(s.nombre_segmento.toLowerCase().slice(0, 5)),
      );
      if (segMencionado) {
        const cursosDeSeg = catalogo.cursos.filter((c) => c.segmento_curso === segMencionado.segmento_curso);
        if (cursosDeSeg.length === 0) {
          return {
            text: `**${segMencionado.nombre_segmento}**\n\nPor ahora no tenemos cursos publicados en esta área. ¿Te interesa otra? Puedes ver nuestras áreas disponibles.`,
          };
        }
        const cards: CardCourse[] = cursosDeSeg.slice(0, 6).map((c) => {
          const svc = catalogo.servicios.find((s) => s.tipo_curso === c.cod_tipo_curso);
          return {
            id: c.cod_tipo_curso,
            name: c.nombre_curso,
            segment: segMencionado.nombre_segmento,
            price: svc?.tarifa_curso ?? 0,
            description: c.descripcion_curso ?? '',
            imageUrl: `https://picsum.photos/seed/curso-cee-${c.cod_tipo_curso}/800/450`,
            slug: c.slug,
          };
        });
        return {
          text: `**Cursos de ${segMencionado.nombre_segmento}**\n\nSelecciona uno para ver más detalles:`,
          actions: [{ type: 'courses', courses: cards }],
        };
      }
      // Sin segmento: mostrar solo áreas que tienen cursos publicados
      const areaCards: CardCourse[] = catalogo.segmentos
        .filter((seg) => catalogo.cursos.some((c) => c.segmento_curso === seg.segmento_curso))
        .map((seg) => {
          const conteo = catalogo.cursos.filter((c) => c.segmento_curso === seg.segmento_curso).length;
        const primeros = catalogo.cursos.slice(0, 2).find((c) => c.segmento_curso === seg.segmento_curso);
        return {
          id: seg.segmento_curso,
          name: seg.nombre_segmento,
          segment: '',
          price: 0,
          description: `${conteo} programas disponibles`,
          imageUrl: `https://picsum.photos/seed/area-cee-${seg.segmento_curso}/800/450`,
          slug: '',
        };
      });
      return {
        text: `**Áreas de especialización del CEE-FIIS**\n\nSelecciona un área para ver sus cursos:`,
        actions: [{ type: 'courses', courses: areaCards }],
      };
    }

    case 'curso': {
      if (foundCurso) {
        useChatStore.getState().setLastCourseMentioned(foundCurso.nombre_curso);
        const svc = catalogo.servicios.find((s) => s.tipo_curso === foundCurso!.cod_tipo_curso);

        let extra = '';
        // Descripción corta
        if (foundCurso.short_description) {
          extra += `\n${foundCurso.short_description}`;
        }
        // Modalidad, nivel, horas
        const detalles: string[] = [];
        if (foundCurso.modality) detalles.push(`**Modalidad:** ${foundCurso.modality}`);
        if (foundCurso.level) detalles.push(`**Nivel:** ${foundCurso.level}`);
        if (foundCurso.academic_hours) detalles.push(`**Horas académicas:** ${foundCurso.academic_hours}`);
        if (detalles.length) extra += `\n\n${detalles.join(' | ')}`;

        // Precio y estado
        if (svc) {
          extra += `\n\n💰 Inversión: S/ ${svc.tarifa_curso.toFixed(2)}`;
          if (svc.total_inscripciones >= 50) {
            const redondeado = Math.floor(svc.total_inscripciones / 50) * 50;
            extra += `\n📊 Más de ${redondeado} profesionales ya lo llevaron`;
          } else {
            extra += '\n📌 Cupos disponibles';
          }
          extra += `\n📌 Estado: ${svc.estado_capacitacion === 'A' ? 'Disponible' : 'No disponible por ahora'}`;
        }

        // PDF del sílabo
        if (foundCurso.syllabus_pdf_url) {
          extra += `\n\n📄 [Descargar sílabo en PDF](${foundCurso.syllabus_pdf_url})`;
        }

        return {
          text: `**${foundCurso.nombre_curso}**${extra}\n\n¿Quieres ver el temario?`,
        };
      }
      return {
        text: `Claro, estos son algunos de nuestros cursos destacados:\n\n${formatCursoLista('todos')}\n\n¿Cuál te interesa?`,
      };
    }

    case 'temario': {
      if (foundCurso) {
        return { text: formatTemario(foundCurso.cod_tipo_curso) };
      }
      return {
        text: '¿De qué curso quieres ver el temario? Dime el nombre y te muestro los módulos y temas.',
      };
    }

    case 'precio': {
      useChatStore.getState().incrementPriceQuery();
      if (foundCurso) {
        return { text: formatPrecio(foundCurso.cod_tipo_curso) };
      }
      return {
        text: '¿De qué curso quieres saber el precio? Dime el nombre y te doy todos los detalles de inversión.',
      };
    }

    case 'financiamiento':
      return {
        text: `En el CEE-FIIS ofrecemos opciones de financiamiento flexible:

- **Pago en cuotas sin intereses** con tarjeta de crédito
- **Crédito directo CEE**: paga en 3 a 6 armadas
- **Descuentos corporativos**: para grupos de 3+ personas de una misma empresa
- **Pronto pago**: descuento especial por pago al contado

[chip:Ver opciones de financiamiento](¿Qué opciones de financiamiento tienen?)`,
      };

    case 'certificacion':
      return {
        text: `Todos nuestros programas otorgan un **certificado a nombre de la Universidad Nacional de Ingeniería (UNI)**, con respaldo de la **Facultad de Ingeniería Industrial y de Sistemas (FIIS)** y el **Centro de Especialización Ejecutiva (CEE)**.

El certificado incluye:
- Nombre del programa y horas académicas
- Nota final obtenida
- Firmas del Decano de la FIIS y Director del CEE
- Código QR de verificación

Es un documento con valor curricular reconocido a nivel nacional.`,
      };

    case 'ponentes':
      return {
        text: `Nuestra plana docente está compuesta por profesionales con amplia experiencia en la industria y el sector académico:

- **Docentes de la FIIS-UNI** con maestrías y doctorados
- **Ejecutivos y consultores** de empresas líderes del país
- **Expertos certificados** en metodologías como PMP, Scrum Master, CPA, etc.

Todos nuestros ponentes pasan por un riguroso proceso de selección para garantizar la calidad académica que nos caracteriza.`,
      };

    case 'venta':
      return {
        text: `¡Qué bueno que quieras dar el siguiente paso! 🚀

Para iniciar tu proceso de inscripción, te invito a contactar a nuestro equipo comercial por **WhatsApp**. Ellos te guiarán paso a paso y resolverán cualquier duda sobre el proceso de matrícula.

Haz clic en el botón verde de WhatsApp que está en la esquina de la página o escríbenos directamente. ¿Necesitas ayuda con algo más mientras tanto?`,
      };

    case 'asesor':
      return {
        text: `¡Claro! Te conecto con un asesor humano. 📞

Puedes contactarnos directamente por:
- **WhatsApp**: [+51 966 644 502](https://wa.me/51966644502)
- **Correo**: contacto@cee-fiis.edu.pe

Un asesor especializado te atenderá a la brevedad. ¿Hay algo más en lo que pueda ayudarte mientras tanto?`,
      };

    default:
      // En vez de rechazar la consulta, mostramos áreas disponibles como ayuda
      return {
        text: `Entiendo tu interés. Aquí tienes las **áreas de especialización** del CEE-FIIS:\n\n${formatSegmentos()}\n\nTambién te comparto algunos de nuestros cursos destacados:\n\n${formatCursoLista('todos')}\n\n¿Cuál te gustaría conocer más a detalle? 😊`,
      };
  }
}

// ──────────────── Groq API directa (local dev) ────────────────

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string;
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

interface GroqToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

interface GroqMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
  tool_calls?: GroqToolCall[];
}

const SYSTEM_PROMPT = `Eres Ceci, la asesora virtual del Centro de Especialización Ejecutiva de la Universidad Nacional de Ingeniería (CEE-FIIS), en Lima, Perú.

## Tu rol
Ayudas a profesionales interesados en programas de especialización del CEE-FIIS. Proporcionas información precisa sobre cursos, precios, horarios, temarios, certificaciones.

## Datos del CEE
- WhatsApp: +51 966 644 502
- Correo: contacto@cee-fiis.edu.pe

## REGLA DE ORO: SIEMPRE USA HERRAMIENTAS
NUNCA inventes nombres de cursos, precios o temarios. Para CUALQUIER consulta sobre cursos, precios o temarios, PRIMERO usa la herramienta buscar_cursos para encontrar el curso, LUEGO usa el ID devuelto para llamar a la herramienta específica (detalle_curso, temario_curso, etc).

Ejemplo de flujo:
1. Usuario: "¿Cuánto cuesta el curso de Finanzas?"
2. Tú llamas a buscar_cursos con query="Finanzas"
3. Obtienes resultados con IDs de cursos
4. Llamas a detalle_curso con el curso_id correcto (número)
5. Respondes con los datos reales

Si el usuario pregunta por un área general ("tecnología", "gestión"), usa buscar_cursos con el segmento correspondiente. Si pregunta por un curso específico, busca por nombre.

## Comportamiento
- NO gestionas ventas: deriva a WhatsApp (+51 966 644 502)
- Para preguntas fuera del CEE: responde breve y redirige a la oferta de cursos
- Tono: cercano, profesional. Usa Markdown. Responde en español. Cierra con pregunta.`;

const TOOL_DEFS = [
  {
    type: 'function',
    function: {
      name: 'get_segmentos',
      description: 'Obtiene las áreas/segmentos de especialización del CEE (ej. Gestión de Proyectos, Tecnología, Finanzas).',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'buscar_cursos',
      description: 'Busca cursos por nombre, descripción o área de especialización.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Texto de búsqueda' },
          segmento: { type: 'string', description: 'Nombre del área para filtrar (opcional)' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'detalle_curso',
      description: 'Obtiene detalle completo de un curso: descripción, precio, horas académicas.',
      parameters: {
        type: 'object',
        properties: { curso_id: { type: 'integer', description: 'ID del curso' } },
        required: ['curso_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'temario_curso',
      description: 'Obtiene el temario de un curso: temas en orden, con duración de cada bloque.',
      parameters: {
        type: 'object',
        properties: { curso_id: { type: 'integer', description: 'ID del curso' } },
        required: ['curso_id'],
      },
    },
  },
];

async function llamarGroq(messages: GroqMessage[]): Promise<GroqMessage> {
  const body: Record<string, unknown> = {
    model: 'llama-3.3-70b-versatile',
    messages,
    max_tokens: 1024,
    temperature: 0.7,
    tools: TOOL_DEFS,
  };

  const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`Groq API error ${res.status}:`, err);
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }

  const json = await res.json();
  return json.choices[0].message;
}

function ejecutarToolLocal(name: string, args: Record<string, unknown>): unknown {
  const cursoId = args.curso_id ? Number(args.curso_id) : 0;

  switch (name) {
    case 'get_segmentos':
      return catalogo.segmentos.map((s) => ({ id: s.segmento_curso, nombre: s.nombre_segmento }));

    case 'buscar_cursos': {
      const query = String(args.query ?? '').toLowerCase();
      const segmento = args.segmento ? String(args.segmento).toLowerCase() : '';
      let cursos = [...catalogo.cursos];
      if (segmento) {
        const seg = catalogo.segmentos.find(
          (s) => s.nombre_segmento.toLowerCase().includes(segmento),
        );
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
          descripcion: c.descripcion_curso,
          segmento: seg?.nombre_segmento ?? '',
          precio: svc?.tarifa_curso ?? 0,
          inscripciones: svc?.total_inscripciones ?? 0,
        };
      });
    }

    case 'detalle_curso': {
      if (!cursoId) return { error: 'curso_id es requerido (número)' };
      const curso = catalogo.cursos.find((c) => c.cod_tipo_curso === cursoId);
      if (!curso) return { error: `Curso con ID ${cursoId} no encontrado` };
      const seg = catalogo.segmentos.find((s) => s.segmento_curso === curso.segmento_curso);
      const svcs = catalogo.servicios.filter((s) => s.tipo_curso === cursoId);
      return {
        id: curso.cod_tipo_curso,
        nombre: curso.nombre_curso,
        descripcion: curso.descripcion_curso,
        segmento: seg?.nombre_segmento ?? '',
        servicios: svcs.map((s) => ({
          nombre: s.descripcion_servicio,
          precio: s.tarifa_curso,
          inscripciones: s.total_inscripciones,
          estado: s.estado_capacitacion === 'A' ? 'Disponible' : 'No disponible',
        })),
      };
    }

    case 'temario_curso': {
      if (!cursoId) return { error: 'curso_id es requerido (número)' };
      const rels = catalogo.silaboCursos.filter((r) => r.cod_tipo_curso === cursoId);
      return rels
        .map((r) => {
          const tema = catalogo.temas.find((t) => t.cod_tema === r.cod_tema);
          return tema
            ? {
                secuencia: r.secuencia_logica,
                tema: tema.nombre_tema,
                descripcion: tema.descripcion_tema,
                duracion_min: tema.duracion_tema,
              }
            : null;
        })
        .filter(Boolean)
        .sort((a, b) => a!.secuencia - b!.secuencia);
    }

    default:
      return { error: `Herramienta desconocida: ${name}` };
  }
}

async function enviarAGroq(userMessages: { role: string; content: string }[]): Promise<string> {
  const showTools = userMessages.length > 2; // No usar tools en el saludo inicial

  const body: Record<string, unknown> = {
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...userMessages.map((m) => ({
        role: m.role as GroqMessage['role'],
        content: m.content,
      })),
    ],
    max_tokens: 1024,
    temperature: 0.7,
  };

  if (showTools) {
    body.tools = TOOL_DEFS;
  }

  const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`[Ceci] Groq ${res.status}:`, err.slice(0, 300));
    throw new Error(`API ${res.status}: ${err.slice(0, 150)}`);
  }

  const completion = await res.json();
  let assistantMsg: GroqMessage = completion.choices[0].message;
  let loops = 0;

  // Si el modelo devolvió tool_calls, ejecutarlas
  const rawMessages: GroqMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...userMessages.map((m) => ({
      role: m.role as GroqMessage['role'],
      content: m.content,
    })),
  ];

  while (assistantMsg.tool_calls?.length && loops < 5) {
    loops++;
    rawMessages.push(assistantMsg);

    for (const tc of assistantMsg.tool_calls) {
      let fnArgs: Record<string, unknown> = {};
      try { fnArgs = JSON.parse(tc.function.arguments); } catch { /* */ }
      const result = ejecutarToolLocal(tc.function.name, fnArgs);
      rawMessages.push({
        role: 'tool',
        tool_call_id: tc.id,
        content: JSON.stringify(result),
      });
    }

    const toolBody: Record<string, unknown> = {
      model: 'llama-3.3-70b-versatile',
      messages: rawMessages,
      max_tokens: 1024,
      temperature: 0.7,
      tools: TOOL_DEFS,
    };

    const toolRes = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(toolBody),
    });

    if (!toolRes.ok) {
      const err = await toolRes.text();
      console.error(`[Ceci] Tool loop error:`, err.slice(0, 200));
      break;
    }

    const toolCompletion = await toolRes.json();
    assistantMsg = toolCompletion.choices[0].message;
  }

  return assistantMsg.content ?? 'Lo siento, no pude procesar tu consulta. ¿Podrías intentarlo de nuevo?';
}

// ──────────────── Real API (Edge Function) ────────────────

const EDGE_FUNCTION_URL = import.meta.env.VITE_SUPABASE_CHATBOT_URL as string;

async function callEdgeFunction(messages: { role: string; content: string }[]): Promise<{ reply: string }> {
  if (!EDGE_FUNCTION_URL) {
    throw new Error('VITE_SUPABASE_CHATBOT_URL no está configurada');
  }

  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    throw new Error(`Error al llamar al chatbot: ${response.status}`);
  }

  return response.json();
}

// ──────────────── Public API ────────────────

const USE_GROQ_DIRECT = Boolean(GROQ_API_KEY);

/** Intenciones que requieren datos precisos del catálogo → usar mock engine */
const DATA_INTENTS = new Set(['catalogo', 'curso', 'precio', 'temario']);

export const chatbotService = {
  async sendMessage(text: string): Promise<void> {
    const store = useChatStore.getState();
    store.addMessage({ role: 'user', text });

    store.setTyping(true);

    try {
      let reply: string;
      let replyActions: ChatAction[] | undefined;

      if (USE_GROQ_DIRECT) {
        const intent = classifyIntentMock(text);

        if (DATA_INTENTS.has(intent)) {
          const result = await generateMockResponse(text, store.messages, store.context);
          await delay(500 + Math.random() * 400);
          reply = result.text;
          replyActions = result.actions;
        } else {
          const messages = store.messages.map((m) => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.text,
          }));
          messages.push({ role: 'user', content: text });
          reply = await enviarAGroq(messages);
        }
      } else if (USE_MOCKS) {
        const result = await generateMockResponse(text, store.messages, store.context);
        await delay(600 + Math.random() * 600);
        reply = result.text;
        replyActions = result.actions;
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

      // Detectar menciones de WhatsApp / asesor en la respuesta y activar pulso
      const lowerReply = reply.toLowerCase();
      if (/whatsapp|\+51\s*9|asesor|humano|contactar|escr[ií]benos|ll[aá]manos/i.test(lowerReply)) {
        useChatStore.getState().triggerWhatsAppHighlight();
      }

      if (
        store.context.priceQueriesCount >= 3 &&
        !store.context.hasCapturedLead
      ) {
        await delay(400);
        store.addMessage({
          role: 'bot',
          text: '📬 **¿Te gustaría recibir información detallada?**\n\nDéjame tu correo corporativo y te envío el brochure completo con precios, estructura de cuotas y próximas fechas de inicio.',
          actions: [{ type: 'lead_capture' }],
        });
      }
    } catch (err) {
      console.error('[Ceci] Error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      store.addMessage({
        role: 'bot',
        text: `Ups, tuve un problema al procesar tu mensaje. Error: ${msg.slice(0, 80)}. ¿Podrías intentarlo de nuevo?`,
      });
    } finally {
      store.setTyping(false);
    }
  },

  async sendQuickAction(query: string): Promise<void> {
    return this.sendMessage(query);
  },
};
