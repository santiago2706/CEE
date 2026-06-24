import { create } from 'zustand';
import type { User } from '@cee/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
}

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

/**
 * isLoading arranca en true en modo real porque ProtectedRoute necesita esperar
 * a que se resuelva la sesión de Supabase + el perfil antes de decidir si deja
 * pasar al backoffice. En modo mock no hay nada que esperar.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: !USE_MOCKS,
  setUser: (user) => set({ user, isAuthenticated: Boolean(user), isLoading: false }),
}));
