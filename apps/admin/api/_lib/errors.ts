// Error tipado para que los handlers puedan responder 500 con un código
// diagnosticable en el body (sin depender de los logs de Vercel) en vez de un
// mensaje genérico. `code` identifica la categoría de fallo:
// - "missing_env_var": falta una variable de entorno requerida en Vercel
// - "supabase_connection_failed": la llamada a Supabase (RPC/consulta) falló
// - "groq_api_error": la llamada a la API de Groq falló
export class ApiError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Lee una variable de entorno requerida; lanza ApiError('missing_env_var', ...) si falta o está vacía. */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new ApiError('missing_env_var', `La variable de entorno "${name}" no está configurada en este entorno.`);
  }
  return value;
}
