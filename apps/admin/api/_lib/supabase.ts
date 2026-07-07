import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { requireEnv } from './errors';

// Construcción perezosa a propósito: si esto corriera al cargar el módulo (como
// antes) y faltara una env var, el `throw` ocurre en el cold start de la
// función serverless, ANTES de que el handler llegue a su try/catch — Vercel
// devuelve un 500 genérico sin nuestro body de error. Al diferir la
// construcción a la primera llamada dentro del handler, el error cae dentro
// del try/catch y se puede responder con un código diagnosticable.
let client: SupabaseClient | undefined;

export function getSupabase(): SupabaseClient {
  if (!client) {
    const supabaseUrl = requireEnv('SUPABASE_URL');
    const supabaseKey = requireEnv('SUPABASE_KEY');
    client = createClient(supabaseUrl, supabaseKey);
  }
  return client;
}
