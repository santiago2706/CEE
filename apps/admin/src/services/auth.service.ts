import type { User } from '@cee/types';
import { mockAdminUser } from '@/mocks/auth';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

interface ProfileRow {
  id: string;
  name: string;
  email: string;
  role: User['role'];
  avatar_url: string | null;
}

function formatProfile(row: ProfileRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    avatarUrl: row.avatar_url ?? '',
  };
}

async function fetchProfile(userId: string): Promise<User> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error || !data) {
    throw new Error('No se pudo cargar el perfil del usuario.');
  }
  return formatProfile(data);
}

export const authService = {
  async login(email: string, password: string): Promise<User> {
    if (USE_MOCKS) {
      if (!password.trim()) throw new Error('La contraseña no puede estar vacía.');
      if (email.trim().toLowerCase() !== mockAdminUser.email.toLowerCase()) {
        throw new Error('Credenciales inválidas.');
      }
      useAuthStore.getState().setUser(mockAdminUser);
      return delay(mockAdminUser);
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      throw new Error('Credenciales inválidas.');
    }

    const user = await fetchProfile(data.session.user.id);
    if (user.role !== 'admin') {
      await supabase.auth.signOut();
      throw new Error('Tu cuenta no tiene permisos de administrador.');
    }

    useAuthStore.getState().setUser(user);
    return user;
  },

  async logout(): Promise<void> {
    if (!USE_MOCKS) {
      await supabase.auth.signOut();
    }
    useAuthStore.getState().setUser(null);
  },

  /** Restaura la sesión al bootear la app y mantiene el store sincronizado con Supabase. */
  async initSession(): Promise<void> {
    if (USE_MOCKS) return;

    const { data } = await supabase.auth.getSession();
    if (data.session) {
      try {
        useAuthStore.getState().setUser(await fetchProfile(data.session.user.id));
      } catch {
        useAuthStore.getState().setUser(null);
      }
    } else {
      useAuthStore.getState().setUser(null);
    }

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id)
          .then((user) => useAuthStore.getState().setUser(user))
          .catch(() => useAuthStore.getState().setUser(null));
      } else {
        useAuthStore.getState().setUser(null);
      }
    });
  },
};
