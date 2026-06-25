import type { Teacher } from '@cee/types';
import { mockTeachers } from '@/mocks';
import { supabase } from '@/lib/supabase';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 300): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

interface TeacherRow {
  id: string;
  slug: string;
  name: string;
  title: string;
  bio: string;
  photo_url: string;
  upcoming_events: Teacher['upcomingEvents'];
}

function formatTeacher(row: TeacherRow): Teacher {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    title: row.title,
    bio: row.bio,
    photoUrl: row.photo_url,
    upcomingEvents: row.upcoming_events ?? [],
  };
}

export const teachersService = {
  async getAll(): Promise<Teacher[]> {
    if (USE_MOCKS) {
      return delay([...mockTeachers]);
    }

    const { data, error } = await supabase.from('teachers').select('*').order('name');
    if (error) throw new Error('No se pudieron cargar los profesores.');
    return (data ?? []).map((row) => formatTeacher(row as TeacherRow));
  },

  async getBySlug(slug: string): Promise<Teacher> {
    if (USE_MOCKS) {
      const found = mockTeachers.find((teacher) => teacher.slug === slug);
      if (!found) throw new Error(`Profesor no encontrado: ${slug}`);
      return delay(found);
    }

    const { data, error } = await supabase.from('teachers').select('*').eq('slug', slug).single();
    if (error || !data) throw new Error(`Profesor no encontrado: ${slug}`);
    return formatTeacher(data as TeacherRow);
  },
};
