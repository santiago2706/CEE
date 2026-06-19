import type { Video } from '@cee/types';
import { mockVideos } from '@/mocks';
import { api } from '@/services/api';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

export const mediaService = {
  async getVideos(): Promise<Video[]> {
    if (USE_MOCKS) {
      return delay([...mockVideos]);
    }
    const response = await api.get<Video[]>('/media/videos');
    return response.data;
  },

  async getVideoById(id: string): Promise<Video> {
    if (USE_MOCKS) {
      const found = mockVideos.find((v) => v.id === id);
      if (!found) throw new Error(`Video no encontrado: ${id}`);
      return delay(found);
    }
    const response = await api.get<Video>(`/media/videos/${id}`);
    return response.data;
  },
};