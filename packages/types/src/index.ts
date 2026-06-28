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

// ---------- Profesores (menú "Profesores" del Navbar + perfil completo) ----------

export interface TeacherUpcomingEvent {
  id: string;
  title: string;
  date: string; // ISO date
}

/**
 * Superset de `Instructor` con los campos que necesita el perfil público del
 * docente (slug + próximos eventos/clases). Estructuralmente compatible con
 * `Instructor`, por lo que se reutiliza `TeacherCard` (Detalle de curso) tal cual.
 * //TODO(backend): confirmar contrato — campos `slug`/`upcomingEvents` (O4, plan de mejoras).
 */
export interface Teacher extends Instructor {
  slug: string;
  upcomingEvents: TeacherUpcomingEvent[];
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
  startDate: string; // ISO date, fecha de inicio del curso, ej. "2026-07-15"
  academicHours: number;
  certification: string;
  rating: number;
  enrolledCount: number;
  moodleCourseId: number | null; //TODO(backend): confirmar contrato — integración Moodle Fase 6
  durationWeeks?: number | null;
  scheduleDescription?: string | null;
  maxStudents?: number | null;
  minStudents?: number | null;      // mínimo de alumnos para que el curso se lleve a cabo
  alertDaysBefore?: number | null;  // cuántos días antes alertar si hay bajo cupo
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

// ---------- Configuración del sistema ----------

export interface Setting {
  key: string;
  value: string;
  description?: string;
  updatedAt?: string;
}

// ---------- Perfil de usuario (admin) ----------

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
  avatarUrl?: string | null;
}

// ---------- Beneficios y descuentos (perfil del estudiante) ----------

export type BenefitCategory = 'descuento' | 'acceso' | 'servicio';

export interface Benefit {
  id: string;
  title: string;
  description: string;
  discountLabel: string; // ej. "15% OFF", "Acceso gratuito"
  category: BenefitCategory;
  code: string | null;
  validUntil: string | null; // ISO date
  isActive: boolean;
  createdAt: string;
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
  company?: string | null;
  position?: string | null;
  source?: string | null;
  createdAt: string;
}

// ---------- Alumnos ----------

export type StudentSource = 'web' | 'whatsapp' | 'manual' | 'referido';
export type StudentGender = 'M' | 'F' | 'otro';

export interface Student {
  id: string;
  dni: string;
  firstName: string;
  lastNamePaterno: string;
  lastNameMaterno: string;
  email?: string | null;
  phone: string;
  isWorking: boolean;
  company?: string | null;
  profession?: string | null;
  address?: string | null;
  district?: string | null;
  city?: string | null;
  birthDate?: string | null; // ISO date "YYYY-MM-DD"
  gender?: StudentGender | null;
  source: StudentSource;
  notes?: string | null;
  /**
   * ID del usuario en Moodle LMS. Se usará en la integración futura con Moodle
   * para sincronizar automáticamente las inscripciones del CEE con los accesos
   * en la plataforma e-learning. Dejar en null hasta que se configure la integración.
   */
  moodleUserId?: number | null;
  createdAt: string;
  updatedAt: string;
}

// ---------- Ventas (transaccional) ----------

export interface Sale {
  id: string;
  courseId: string;
  courseName: string;
  userId: string;
  studentId?: string | null;
  studentName?: string | null;
  amount: number;
  date: string; // ISO datetime, ej. "2024-10-24T14:30:00Z"
  status: 'completed' | 'pending' | 'refunded';
  notes?: string | null;
  updatedAt?: string;
}

// ---------- Certificados ----------

export type CertificateStatus = 'draft' | 'pending_signature' | 'signed' | 'revoked';

export type SignatureProvider = 'manual' | 'digital';

export interface Certificate {
  id: string;
  certificateNumber: string; // ej. "CEE-2026-0001"
  studentId?: string | null;
  studentName: string;
  courseId: string;
  courseName: string;
  issuedAt: string;          // ISO date, ej. "2026-06-01"
  status: CertificateStatus;
  signedDocumentUrl?: string | null;
  signatureProvider: SignatureProvider;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---------- Notificaciones (admin) ----------

export type NotificationType = 'low_enrollment' | 'new_lead' | 'event' | 'course_confirmed';

/**
 * Notificación interna para el panel de administración.
 * Usa "AdminNotification" para no colisionar con el global DOM `Notification`.
 */
export interface AdminNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  courseId?: string | null;
  isRead: boolean;
  createdAt: string;
}

// ---------- Eventos ----------

export type EventStatus = 'draft' | 'published' | 'cancelled';

export type EventRegistrationSource = 'web' | 'whatsapp' | 'manual';

/**
 * Evento presencial/virtual organizado por el CEE.
 * Usa "CeeEvent" para no colisionar con el tipo global DOM `Event`.
 */
export interface CeeEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  eventDate: string;    // ISO date "2026-07-01"
  startTime: string;    // "15:00"
  endTime: string;      // "19:00"
  location: string;
  capacity: number;
  hasCertificate: boolean;
  certificatePrice?: number | null;
  status: EventStatus;
  flyerUrl?: string | null;
  registeredCount?: number; // derivado del conteo de inscripciones
  createdAt: string;
  updatedAt: string;
}

export interface EventRegistrationInput {
  eventId: string;
  firstName: string;
  lastNamePaternal: string;
  lastNameMaternal: string;
  email: string;
  phone: string;
  isWorking: boolean;
  wantsCertificate: boolean;
  source: EventRegistrationSource;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  studentId?: string | null;
  firstName: string;
  lastNamePaternal: string;
  lastNameMaternal: string;
  email: string;
  phone: string;
  isWorking: boolean;
  wantsCertificate: boolean;
  certificatePaid: boolean;
  source: EventRegistrationSource;
  createdAt: string;
}

// ---------- Blog ----------

export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  date: string; // ISO date, ej. "2026-06-10"
  slug: string;
}

// ---------- Eventos (Home slider) ----------

export interface EventSlide {
  id: string;
  title: string;
  date: string; // ISO date, ej. "2026-08-15"
  imageUrl: string;
  ctaLabel: string;
  ctaHref: string;
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

// ---------- Dashboard Metrics (nuevo dashboard) ----------

export interface DashboardKpis {
  totalRevenue: number;
  revenueDeltaPct: number;
  publishedCourses: number;
  publishedCoursesDeltaPct: number;
  contactLeads: number;
  leadsDeltaPct: number;
  completedSales: number;
  salesDeltaPct: number;
}

export interface DashboardCategoryPoint {
  category: string;
  count: number;
}

export interface DashboardSaleItem {
  id: string;
  courseName: string;
  amount: number;
  status: 'completed' | 'pending' | 'refunded';
  date: string;
}

export interface DashboardMetrics {
  kpis: DashboardKpis;
  monthlyRevenue: SalesTrendPoint[];
  coursesByCategory: DashboardCategoryPoint[];
  recentSales: DashboardSaleItem[];
}
