import type { ApiResponse, AuthResponse, User } from '@cee/types';
import { mockUsers } from '@/mocks';
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
  async login(email: string, password: string, remember = true): Promise<ApiResponse<AuthResponse>> {
    if (USE_MOCKS) {
      if (!password.trim()) throw new Error('La contraseña no puede estar vacía.');
      const user = mockUsers.find((u) => u.email === email);
      if (!user) throw new Error('Credenciales inválidas.');
      const token = `mock-token-${user.id}`;
      useAuthStore.getState().setAuth(user, token, remember);
      return delay({ data: { user, token } });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      throw new Error('Credenciales inválidas.');
    }
    const user = await fetchProfile(data.session.user.id);
    useAuthStore.getState().setUser(user);
    return { data: { user, token: data.session.access_token } };
  },

  async register(name: string, email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    if (USE_MOCKS) {
      if (!name.trim() || !email.trim() || !password.trim()) {
        throw new Error('Todos los campos son requeridos.');
      }
      const user: User = {
        id: `mock-user-${Date.now()}`,
        name,
        email,
        role: 'student',
        avatarUrl: `https://picsum.photos/seed/user-new/200/200`,
      };
      const token = `mock-token-${user.id}`;
      useAuthStore.getState().setAuth(user, token);
      return delay({ data: { user, token } });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role: 'student' } },
    });
    if (error || !data.user) {
      throw new Error(error?.message ?? 'No se pudo completar el registro.');
    }

    const user = await fetchProfile(data.user.id);
    if (data.session) {
      useAuthStore.getState().setUser(user);
    }
    return { data: { user, token: data.session?.access_token ?? '' } };
  },

  async me(): Promise<ApiResponse<User>> {
    if (USE_MOCKS) {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('No autenticado.');
      return delay({ data: user });
    }

    const { data } = await supabase.auth.getSession();
    if (!data.session) throw new Error('No autenticado.');
    const user = await fetchProfile(data.session.user.id);
    return { data: user };
  },

  async logout(): Promise<void> {
    if (!USE_MOCKS) {
      await supabase.auth.signOut();
    }
    useAuthStore.getState().logout();
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
