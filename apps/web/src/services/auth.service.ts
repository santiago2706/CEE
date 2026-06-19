import type { ApiResponse, AuthResponse } from '@cee/types';
import { API_ENDPOINTS } from '@/constants/api.constants';
import { mockUsers } from '@/mocks';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

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
    const response = await api.post<ApiResponse<AuthResponse>>(
      `${API_ENDPOINTS.AUTH}/login`,
      { email, password },
    );
    useAuthStore.getState().setAuth(response.data.data.user, response.data.data.token, remember);
    return response.data;
  },

  async register(name: string, email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    if (USE_MOCKS) {
      if (!name.trim() || !email.trim() || !password.trim()) {
        throw new Error('Todos los campos son requeridos.');
      }
      const user = {
        id: `mock-user-${Date.now()}`,
        name,
        email,
        role: 'student' as const,
        avatarUrl: `https://picsum.photos/seed/user-new/200/200`,
      };
      const token = `mock-token-${user.id}`;
      useAuthStore.getState().setAuth(user, token);
      return delay({ data: { user, token } });
    }
    const response = await api.post<ApiResponse<AuthResponse>>(
      `${API_ENDPOINTS.AUTH}/register`,
      { name, email, password },
    );
    useAuthStore.getState().setAuth(response.data.data.user, response.data.data.token);
    return response.data;
  },

  async me(): Promise<ApiResponse<AuthResponse['user']>> {
    if (USE_MOCKS) {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('No autenticado.');
      return delay({ data: user });
    }
    const response = await api.get<ApiResponse<AuthResponse['user']>>(
      `${API_ENDPOINTS.AUTH}/me`,
    );
    return response.data;
  },

  logout(): void {
    useAuthStore.getState().logout();
  },
};
