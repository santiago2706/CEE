import { createClient } from '@supabase/supabase-js';
import { authStorageAdapter } from '@/store/authStore';

// En modo mock (VITE_USE_MOCKS=true) el cliente nunca llega a usarse, pero
// createClient exige una URL/key válidas para construirse sin lanzar error.
// Sin este fallback, abrir la app sin credenciales reales de Supabase
// rompe el arranque (createClient lanza antes de montar React).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: authStorageAdapter,
    storageKey: 'cee_token',
    persistSession: true,
    autoRefreshToken: true,
  },
});
