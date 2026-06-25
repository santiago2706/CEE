import axios from 'axios';
import { createAIProvider } from '../ai';
import {
  getCourses,
  getCourseByTitle,
  getSalesByUser,
  formatCoursesForContext,
  formatSalesForContext,
} from '../supabase';

const META_TOKEN = process.env.META_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

if (!META_TOKEN || !PHONE_NUMBER_ID) {
  throw new Error('META_TOKEN y PHONE_NUMBER_ID son obligatorios.');
}

const WHATSAPP_API_URL = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;

// El provider se crea una vez al arrancar el proceso
const ai = createAIProvider();

// ---------- Detección de intención (simple, sin NLU externo) ----------

function detectIntent(text: string): 'courses' | 'sales' | 'course_search' | 'general' {
  const lower = text.toLowerCase();

  if (/\b(mis compras?|mis pagos?|mis cursos? comprados?|mis ventas?|historial)\b/.test(lower)) {
    return 'sales';
  }
  if (/\b(busca|buscar|información sobre|info de|cuánto cuesta|precio de)\b/.test(lower)) {
    return 'course_search';
  }
  if (/\b(cursos?|catálogo|oferta|disponibles?|lista|qué ofrecen)\b/.test(lower)) {
    return 'courses';
  }
  return 'general';
}

// Extrae el término de búsqueda cuando el usuario pregunta por un curso específico
function extractSearchTerm(text: string): string {
  return text
    .replace(/busca|buscar|información sobre|info de|cuánto cuesta|precio de/gi, '')
    .trim();
}

// ---------- Construcción del contexto desde Supabase ----------

async function buildContext(text: string, userId?: string): Promise<string> {
  const intent = detectIntent(text);

  switch (intent) {
    case 'sales': {
      if (!userId) return 'El usuario no está identificado; no se pueden mostrar ventas.';
      const sales = await getSalesByUser(userId);
      return `=== HISTORIAL DE COMPRAS DEL USUARIO ===\n${formatSalesForContext(sales)}`;
    }

    case 'course_search': {
      const term = extractSearchTerm(text);
      const courses = term.length > 2 ? await getCourseByTitle(term) : await getCourses();
      return `=== CURSOS ENCONTRADOS ===\n${formatCoursesForContext(courses)}`;
    }

    case 'courses': {
      const courses = await getCourses();
      return `=== CURSOS DISPONIBLES EN EL CEE ===\n${formatCoursesForContext(courses)}`;
    }

    default:
      return '';
  }
}

// ---------- Envío de mensaje por WhatsApp ----------

async function sendWhatsAppMessage(to: string, body: string): Promise<void> {
  await axios.post(
    WHATSAPP_API_URL,
    {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body },
    },
    {
      headers: {
        Authorization: `Bearer ${META_TOKEN}`,
        'Content-Type': 'application/json',
      },
    },
  );
}

// ---------- Handler principal ----------

export async function handleMessage(from: string, text: string, userId?: string): Promise<void> {
  try {
    const context = await buildContext(text, userId);
    const reply = await ai.chat(text, context);
    await sendWhatsAppMessage(from, reply);
    console.log(`[bot] Respuesta enviada a ${from} (intent: ${detectIntent(text)})`);
  } catch (err) {
    console.error(`[bot] Error procesando mensaje de ${from}:`, err);
    try {
      await sendWhatsAppMessage(
        from,
        'Lo siento, ocurrió un problema al procesar tu consulta. Por favor comunícate con la secretaría del CEE-FIIS.',
      );
    } catch {
      // silenciar error secundario de envío
    }
  }
}
