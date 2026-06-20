import type { CourseStatus } from '@cee/types';

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  published: 'Publicado',
  draft: 'Borrador',
  review: 'En Revisión',
};

export const COURSE_STATUS_OPTIONS: { value: CourseStatus; label: string }[] = [
  { value: 'published', label: COURSE_STATUS_LABELS.published },
  { value: 'draft', label: COURSE_STATUS_LABELS.draft },
  { value: 'review', label: COURSE_STATUS_LABELS.review },
];
