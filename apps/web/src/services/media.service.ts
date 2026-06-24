import type { Video } from '@cee/types';
import { mockVideos } from '@/mocks';
import { supabase } from '@/lib/supabase';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

interface VideoRow {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  duration: number;
  category: string | null;
  created_at: string;
}

function formatVideo(row: VideoRow): Video {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    thumbnailUrl: row.thumbnail_url,
    videoUrl: row.video_url,
    duration: row.duration,
    category: row.category ?? undefined,
    createdAt: row.created_at,
  };
}

export const mediaService = {
  async getVideos(): Promise<Video[]> {
    if (USE_MOCKS) {
      return delay([...mockVideos]);
    }

    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error('No se pudieron cargar los videos.');
    return (data ?? []).map((row) => formatVideo(row as VideoRow));
  },

  async getVideoById(id: string): Promise<Video> {
    if (USE_MOCKS) {
      const found = mockVideos.find((v) => v.id === id);
      if (!found) throw new Error(`Video no encontrado: ${id}`);
      return delay(found);
    }

    const { data, error } = await supabase.from('videos').select('*').eq('id', id).single();
    if (error || !data) throw new Error(`Video no encontrado: ${id}`);
    return formatVideo(data as VideoRow);
  },
};
