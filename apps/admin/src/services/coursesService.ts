import type { ApiResponse, Course, CourseCategory, CourseModality, CourseStatus } from '@cee/types';
import { mockAdminCourses } from '@/mocks/courses';
import { slugify } from '@/lib/utils';

const delay = <T>(value: T, ms = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

// Fase 5: panel admin trabaja 100% sobre mocks (sin backend real hasta Fase 6).
// Las mutaciones se aplican sobre este array en memoria; persisten mientras
// dure la sesión de la pestaña, no hay almacenamiento real.
let courses: Course[] = [...mockAdminCourses];

/**
 * Forma de datos que recoge CourseFormPage. No vive en @cee/types porque es
 * un input de formulario (subset de Course), no un contrato de respuesta de
 * backend — a diferencia de DashboardSummary/SalesReport.
 */
export interface CourseFormInput {
  title: string;
  description: string;
  price: number;
  category: CourseCategory;
  modality: CourseModality;
  moodleCourseId: number;
  status: CourseStatus;
  syllabusFileName: string | null;
}

function buildCourseFromInput(input: CourseFormInput, existing?: Course): Course {
  const now = new Date().toISOString();
  const slug = existing?.slug ?? slugify(input.title);

  return {
    id: existing?.id ?? `c-${Date.now()}`,
    slug,
    title: input.title,
    category: input.category,
    modality: input.modality,
    level: existing?.level ?? 'Básico',
    shortDescription: existing?.shortDescription ?? input.description.slice(0, 120),
    description: input.description,
    price: input.price,
    originalPrice: existing?.originalPrice ?? null,
    imageUrl: existing?.imageUrl ?? '',
    academicHours: existing?.academicHours ?? 0,
    certification: existing?.certification ?? 'Certificación CEE-FIIS',
    rating: existing?.rating ?? 0,
    enrolledCount: existing?.enrolledCount ?? 0,
    moodleCourseId: input.moodleCourseId,
    syllabusPdfUrl: input.syllabusFileName
      ? `/syllabi/${slug}.pdf`
      : existing?.syllabusPdfUrl ?? '',
    status: input.status,
    graduateProfile: existing?.graduateProfile ?? [],
    syllabus: existing?.syllabus ?? [],
    instructors: existing?.instructors ?? [],
    benefits: existing?.benefits ?? [],
    updatedAt: now,
    createdAt: existing?.createdAt ?? now,
  };
}

export const coursesService = {
  async getCourses(): Promise<ApiResponse<Course[]>> {
    return delay({ data: courses });
  },

  async getCourseById(id: string): Promise<ApiResponse<Course>> {
    const found = courses.find((c) => c.id === id);
    if (!found) {
      throw new Error(`Curso no encontrado: ${id}`);
    }
    return delay({ data: found });
  },

  async createCourse(input: CourseFormInput): Promise<ApiResponse<Course>> {
    const created = buildCourseFromInput(input);
    courses = [created, ...courses];
    return delay({ data: created });
  },

  async updateCourse(id: string, input: CourseFormInput): Promise<ApiResponse<Course>> {
    const existing = courses.find((c) => c.id === id);
    if (!existing) {
      throw new Error(`Curso no encontrado: ${id}`);
    }
    const updated = buildCourseFromInput(input, existing);
    courses = courses.map((c) => (c.id === id ? updated : c));
    return delay({ data: updated });
  },

  async updateCourseStatus(id: string, status: CourseStatus): Promise<ApiResponse<Course>> {
    const existing = courses.find((c) => c.id === id);
    if (!existing) {
      throw new Error(`Curso no encontrado: ${id}`);
    }
    const updated: Course = { ...existing, status, updatedAt: new Date().toISOString() };
    courses = courses.map((c) => (c.id === id ? updated : c));
    return delay({ data: updated });
  },

  async deleteCourse(id: string): Promise<ApiResponse<void>> {
    courses = courses.filter((c) => c.id !== id);
    return delay({ data: undefined as void });
  },
};
