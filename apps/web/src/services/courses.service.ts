import type { ApiResponse, Course, Paginated } from '@cee/types';
import { API_ENDPOINTS } from '@/constants/api.constants';
import { mockCourses } from '@/mocks';
import { api } from '@/services/api';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

export const coursesService = {
  async getAll(params?: Record<string, string | number | boolean>): Promise<Paginated<Course>> {
    if (USE_MOCKS) {
      let results = [...mockCourses];
      if (params?.category) {
        results = results.filter((c) => c.category === params.category);
      }
      if (params?.modality) {
        results = results.filter((c) => c.modality === params.modality);
      }
      if (params?.search) {
        const q = String(params.search).toLowerCase();
        results = results.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.shortDescription.toLowerCase().includes(q),
        );
      }
      const page = Number(params?.page ?? 1);
      const pageSize = Number(params?.pageSize ?? 12);
      const start = (page - 1) * pageSize;
      return delay({
        data: results.slice(start, start + pageSize),
        page,
        pageSize,
        total: results.length,
      });
    }
    const response = await api.get<Paginated<Course>>(API_ENDPOINTS.COURSES, { params });
    return response.data;
  },

  async getBySlug(slug: string): Promise<ApiResponse<Course>> {
    if (USE_MOCKS) {
      const found = mockCourses.find((c) => c.slug === slug);
      if (!found) throw new Error(`Curso no encontrado: ${slug}`);
      return delay({ data: found });
    }
    const response = await api.get<ApiResponse<Course>>(`${API_ENDPOINTS.COURSES}/${slug}`);
    return response.data;
  },

  async getById(id: string): Promise<ApiResponse<Course>> {
    if (USE_MOCKS) {
      const found = mockCourses.find((c) => c.id === id);
      if (!found) throw new Error(`Curso no encontrado: ${id}`);
      return delay({ data: found });
    }
    const response = await api.get<ApiResponse<Course>>(`${API_ENDPOINTS.COURSES}/${id}`);
    return response.data;
  },

  async create(data: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Course>> {
    if (USE_MOCKS) {
      const now = new Date().toISOString();
      return delay({ data: { ...data, id: `mock-${Date.now()}`, createdAt: now, updatedAt: now } });
    }
    const response = await api.post<ApiResponse<Course>>(API_ENDPOINTS.COURSES, data);
    return response.data;
  },

  async update(id: string, data: Partial<Course>): Promise<ApiResponse<Course>> {
    if (USE_MOCKS) {
      const existing = mockCourses.find((c) => c.id === id);
      if (!existing) throw new Error(`Curso no encontrado: ${id}`);
      return delay({ data: { ...existing, ...data, updatedAt: new Date().toISOString() } });
    }
    const response = await api.patch<ApiResponse<Course>>(`${API_ENDPOINTS.COURSES}/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    if (USE_MOCKS) {
      return delay({ data: undefined as void });
    }
    const response = await api.delete<ApiResponse<void>>(`${API_ENDPOINTS.COURSES}/${id}`);
    return response.data;
  },
};
