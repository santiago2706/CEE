import { create } from 'zustand';
import type { User } from '@cee/types';

const TOKEN_KEY = 'cee_token';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

/**
 * Único punto del repo autorizado a tocar localStorage (regla de docs/CLAUDE.md).
 * El cliente de Supabase (src/lib/supabase.ts) recibe este adaptador para que su
 * persistencia de sesión pase también por aquí, bajo la misma clave `cee_token`.
 */
export const authStorageAdapter = {
  getItem: (key: string) => window.localStorage.getItem(key),
  setItem: (key: string, value: string) => window.localStorage.setItem(key, value),
  removeItem: (key: string) => window.localStorage.removeItem(key),
};

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string, remember?: boolean) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const getInitialMockToken = () => {
  if (!USE_MOCKS || typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY) ?? window.sessionStorage.getItem(TOKEN_KEY);
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: getInitialMockToken(),
  isAuthenticated: Boolean(getInitialMockToken()),
  isLoading: !USE_MOCKS,

  setAuth: (user, token, remember = true) => {
    window.localStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(TOKEN_KEY);

    if (remember) {
      window.localStorage.setItem(TOKEN_KEY, token);
    } else {
      window.sessionStorage.setItem(TOKEN_KEY, token);
    }

    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  setUser: (user) => set({ user, token: null, isAuthenticated: Boolean(user), isLoading: false }),

  logout: () => {
    window.localStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(TOKEN_KEY);
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },
}));
