// ---------- Enums / union types ----------

export type CourseCategory =
  | 'Ingeniería'
  | 'Gestión'
  | 'Tecnología'
  | 'Habilidades Blandas'
  | 'Finanzas';

export type CourseModality = 'Virtual' | 'Presencial' | 'Híbrido';

export type CourseLevel = 'Básico' | 'Intermedio' | 'Avanzado';

export type CourseStatus = 'published' | 'draft' | 'review';

export type UserRole = 'admin' | 'student';

// ---------- Plana docente ----------

export interface Instructor {
  id: string;
  name: string;
  title: string;
  bio: string;
  photoUrl: string;
}

// ---------- Sílabo ----------

export interface SyllabusModule {
  id: string;
  title: string;
  topics: string[];
}

// ---------- Curso ----------

export interface Course {
  id: string;
  slug: string;
  title: string;
  category: CourseCategory;
  modality: CourseModality;
  level: CourseLevel;
  shortDescription: string;
  description: string;
  price: number;
  originalPrice: number | null;
  imageUrl: string;
  academicHours: number;
  certification: string;
  rating: number;
  enrolledCount: number;
  moodleCourseId: number | null; //TODO(backend): confirmar contrato — integración Moodle Fase 6
  syllabusPdfUrl: string;
  status: CourseStatus;
  graduateProfile: string[];
  syllabus: SyllabusModule[];
  instructors: Instructor[];
  benefits: string[];
  updatedAt: string;
  createdAt: string;
}

// ---------- Usuario ----------

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}

// ---------- Lead / Contacto ----------

export interface ContactLead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  courseInterest: string | null;
  message: string;
  createdAt: string;
}

// ---------- Ventas (transaccional) ----------

export interface Sale {
  id: string;
  courseId: string;
  courseName: string;
  userId: string;
  amount: number;
  date: string; // ISO datetime, ej. "2024-10-24T14:30:00Z"
  status: 'completed' | 'pending' | 'refunded';
}

// ---------- Media / Videos ----------

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number; // en segundos
  category?: string;
  createdAt: string;
}

// ---------- Reporte de ventas (admin) ----------

export interface SalesKpis {
  totalSales: number;
  totalRevenue: number;
  conversionRate: number;
  salesDeltaPct: number;
  revenueDeltaPct: number;
  conversionDeltaPct: number;
}

export interface SalesTrendPoint {
  label: string;
  revenue: number;
}

export interface CourseSalesBreakdown {
  courseId: string;
  courseName: string;
  salesCount: number;
  revenue: number;
  lastTransaction: string; // ISO datetime, mismo formato que Sale.date
}

export interface SalesReport {
  kpis: SalesKpis;
  trend: SalesTrendPoint[];
  breakdown: CourseSalesBreakdown[];
}

// ---------- Resumen del dashboard (admin) ----------

export interface DashboardSummary {
  publishedCourses: number;
  publishedCoursesDeltaPct: number;
  draftCourses: number;
  draftCoursesDeltaPct: number;
  monthlySales: number;
  monthlySalesDeltaPct: number;
  registeredUsers: number;
  registeredUsersDeltaPct: number;
  recentActivity: DashboardActivityItem[];
}

export interface DashboardActivityItem {
  id: string;
  courseTitle: string;
  action: 'created' | 'updated';
  author: string;
  date: string; // ISO datetime, mismo formato que Sale.date
}

// ---------- Respuesta de autenticación ----------

export interface AuthResponse {
  user: User;
  token: string;
}

// ---------- Wrappers de respuesta de API ----------

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}
