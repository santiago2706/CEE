export type CourseCategory =
  | 'ingenieria'
  | 'gestion'
  | 'tecnologia'
  | 'finanzas'
  | 'habilidades-blandas';

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: CourseCategory;
  modality: 'virtual' | 'presencial' | 'hibrido';
  hours: number;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  syllabusUrl?: string;
  instructor?: string;
  enrolledCount?: number;
  status: 'published' | 'draft' | 'review';
  moodleCourseId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'student' | 'admin';
  createdAt: string;
}

export interface ContactForm {
  fullName: string;
  email: string;
  phone?: string;
  message: string;
  courseInterest?: string;
}

export interface Sale {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  status: 'completed' | 'pending' | 'refunded';
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
