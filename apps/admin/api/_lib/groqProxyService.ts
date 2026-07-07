import Groq from 'groq-sdk';
import { ApiError, requireEnv } from './errors';

// Construcción perezosa (ver _lib/supabase.ts para el motivo): así el error de
// env var faltante cae dentro del try/catch del handler, no en el cold start.
let client: Groq | undefined;

function getGroq(): Groq {
  if (!client) {
    client = new Groq({ apiKey: requireEnv('GROQ_API_KEY') });
  }
  return client;
}

// Proxy delgado: reenvía tal cual la llamada de chat-completions (con tools/
// tool_choice de SecretariaChat.tsx) a Groq. La ejecución de las tools sigue
// pasando 100% en el navegador (coursesService, salesRecordsService, etc.) —
// este endpoint solo evita que VITE_GROQ_API_KEY se exponga en el cliente.
// No reimplementa nada de chatService.ts a propósito: ese flujo resuelve un
// problema distinto (texto -> SQL de solo lectura) que no cubre las acciones
// de escritura (crear curso, registrar inscripción, emitir certificado) ni
// la consulta de alumnos que sí usa SecretariaChat.tsx.

export type ChatCompletionProxyRequest = Parameters<Groq['chat']['completions']['create']>[0];

export async function forwardChatCompletion(payload: ChatCompletionProxyRequest) {
  try {
    return await getGroq().chat.completions.create(payload);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('groq_api_error', err instanceof Error ? err.message : 'Error al llamar a la API de Groq.');
  }
}
