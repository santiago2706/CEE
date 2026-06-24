import type { ApiResponse, Course, Instructor, Paginated } from '@cee/types';
import { API_ENDPOINTS } from '@/constants/api.constants';
import { mockCourses } from '@/mocks';
import { supabase } from '@/lib/supabase';
import { api } from '@/services/api';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

interface InstructorRow {
  id: string;
  name: string;
  title: string;
  bio: string;
  photo_url: string;
}

interface CourseRow {
  id: string;
  slug: string;
  title: string;
  category: Course['category'];
  modality: Course['modality'];
  level: Course['level'];
  short_description: string;
  description: string;
  price: number;
  original_price: number | null;
  image_url: string;
  academic_hours: number;
  certification: string;
  rating: number;
  enrolled_count: number;
  moodle_course_id: number | null;
  syllabus_pdf_url: string | null;
  status: Course['status'];
  graduate_profile: string[];
  benefits: string[];
  syllabus: Course['syllabus'];
  created_at: string;
  updated_at: string;
  course_instructors?: { instructors: InstructorRow }[];
}

function formatInstructor(row: InstructorRow): Instructor {
  return { id: row.id, name: row.name, title: row.title, bio: row.bio, photoUrl: row.photo_url };
}

function formatCourse(row: CourseRow): Course {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    modality: row.modality,
    level: row.level,
    shortDescription: row.short_description,
    description: row.description,
    price: Number(row.price),
    originalPrice: row.original_price != null ? Number(row.original_price) : null,
    imageUrl: row.image_url,
    academicHours: row.academic_hours,
    certification: row.certification,
    rating: Number(row.rating),
    enrolledCount: row.enrolled_count,
    moodleCourseId: row.moodle_course_id,
    syllabusPdfUrl: row.syllabus_pdf_url ?? '',
    status: row.status,
    graduateProfile: row.graduate_profile ?? [],
    benefits: row.benefits ?? [],
    syllabus: row.syllabus ?? [],
    instructors: (row.course_instructors ?? []).map((ci) => formatInstructor(ci.instructors)),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const COURSE_SELECT = '*, course_instructors(instructors(*))';

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

    const page = Number(params?.page ?? 1);
    const pageSize = Number(params?.pageSize ?? 12);
    const start = (page - 1) * pageSize;

    let query = supabase
      .from('courses')
      .select(COURSE_SELECT, { count: 'exact' })
      .eq('status', 'published');

    if (params?.category) query = query.eq('category', String(params.category));
    if (params?.modality) query = query.eq('modality', String(params.modality));
    if (params?.search) {
      const q = String(params.search);
      query = query.or(`title.ilike.%${q}%,short_description.ilike.%${q}%`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(start, start + pageSize - 1);

    if (error) {
      throw new Error('No se pudieron cargar los cursos.');
    }

    return {
      data: (data ?? []).map((row) => formatCourse(row as unknown as CourseRow)),
      page,
      pageSize,
      total: count ?? 0,
    };
  },

  async getBySlug(slug: string): Promise<ApiResponse<Course>> {
    if (USE_MOCKS) {
      const found = mockCourses.find((c) => c.slug === slug);
      if (!found) throw new Error(`Curso no encontrado: ${slug}`);
      return delay({ data: found });
    }

    const { data, error } = await supabase
      .from('courses')
      .select(COURSE_SELECT)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error || !data) throw new Error(`Curso no encontrado: ${slug}`);
    return { data: formatCourse(data as unknown as CourseRow) };
  },

  async getById(id: string): Promise<ApiResponse<Course>> {
    if (USE_MOCKS) {
      const found = mockCourses.find((c) => c.id === id);
      if (!found) throw new Error(`Curso no encontrado: ${id}`);
      return delay({ data: found });
    }

    const { data, error } = await supabase
      .from('courses')
      .select(COURSE_SELECT)
      .eq('id', id)
      .eq('status', 'published')
      .single();

    if (error || !data) throw new Error(`Curso no encontrado: ${id}`);
    return { data: formatCourse(data as unknown as CourseRow) };
  },

  // Gestión (crear/editar/borrar) vive en apps/admin; aquí se mantiene el
  // cliente legacy por si en el futuro hace falta un endpoint propio de web.
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
