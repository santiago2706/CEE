import type { ApiResponse, Course, PaginatedResponse } from '@cee/types';
import { API_ENDPOINTS } from '@/constants/api.constants';
import { api } from '@/services/api';

export const coursesService = {
  async getAll(params?: Record<string, string | number | boolean>) {
    const response = await api.get<PaginatedResponse<Course>>(
      API_ENDPOINTS.COURSES,
      { params },
    );
    return response.data;
  },

  async getBySlug(slug: string) {
    const response = await api.get<ApiResponse<Course>>(
      `${API_ENDPOINTS.COURSES}/${slug}`,
    );
    return response.data;
  },

  async create(data: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) {
    const response = await api.post<ApiResponse<Course>>(
      API_ENDPOINTS.COURSES,
      data,
    );
    return response.data;
  },

  async update(id: string, data: Partial<Course>) {
    const response = await api.patch<ApiResponse<Course>>(
      `${API_ENDPOINTS.COURSES}/${id}`,
      data,
    );
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete<ApiResponse<void>>(
      `${API_ENDPOINTS.COURSES}/${id}`,
    );
    return response.data;
  },
};
