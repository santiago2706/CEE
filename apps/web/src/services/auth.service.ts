import type { ApiResponse, User } from '@cee/types';
import { API_ENDPOINTS } from '@/constants/api.constants';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

interface AuthPayload {
  user: User;
  token: string;
}

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post<ApiResponse<AuthPayload>>(
      `${API_ENDPOINTS.AUTH}/login`,
      { email, password },
    );
    useAuthStore.getState().setAuth(response.data.data.user, response.data.data.token);
    return response.data;
  },

  async register(email: string, password: string, fullName: string) {
    const response = await api.post<ApiResponse<AuthPayload>>(
      `${API_ENDPOINTS.AUTH}/register`,
      { email, password, fullName },
    );
    useAuthStore.getState().setAuth(response.data.data.user, response.data.data.token);
    return response.data;
  },

  async me() {
    const response = await api.get<ApiResponse<User>>(`${API_ENDPOINTS.AUTH}/me`);
    return response.data;
  },

  logout() {
    useAuthStore.getState().logout();
  },
};
