import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL y SUPABASE_KEY son obligatorios.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// ---------- Tipos (columnas relevantes para el bot) ----------

export interface CourseRow {
  id: string;
  title: string;
  category: string;
  modality: string;
  level: string;
  price: number;
  academic_hours: number;
  status: string;
  syllabus_pdf_url: string | null;
}

export interface SaleRow {
  id: string;
  course_id: string;
  course_name: string;
  user_id: string;
  amount: number;
  status: string;
}

// ---------- Consultas ----------

const COURSE_COLS =
  'id, title, category, modality, level, price, academic_hours, status, syllabus_pdf_url';

/** Retorna todos los cursos publicados. */
export async function getCourses(): Promise<CourseRow[]> {
  const { data, error } = await supabase
    .from('courses')
    .select(COURSE_COLS)
    .eq('status', 'published')
    .order('title', { ascending: true });

  if (error) throw new Error(`getCourses: ${error.message}`);
  return (data ?? []) as CourseRow[];
}

/** Busca cursos cuyo título contenga la cadena dada (insensible a mayúsculas). */
export async function getCourseByTitle(title: string): Promise<CourseRow[]> {
  const { data, error } = await supabase
    .from('courses')
    .select(COURSE_COLS)
    .eq('status', 'published')
    .ilike('title', `%${title}%`);

  if (error) throw new Error(`getCourseByTitle: ${error.message}`);
  return (data ?? []) as CourseRow[];
}

/** Retorna las ventas de un usuario específico. */
export async function getSalesByUser(userId: string): Promise<SaleRow[]> {
  const { data, error } = await supabase
    .from('sales')
    .select('id, course_id, course_name, user_id, amount, status')
    .eq('user_id', userId)
    .order('id', { ascending: false });

  if (error) throw new Error(`getSalesByUser: ${error.message}`);
  return (data ?? []) as SaleRow[];
}

// ---------- Formateadores para el contexto de la IA ----------

export function formatCoursesForContext(courses: CourseRow[]): string {
  if (!courses.length) return 'No hay cursos publicados en este momento.';

  return courses
    .map((c) =>
      [
        `• ${c.title}`,
        `  Categoría: ${c.category} | Modalidad: ${c.modality} | Nivel: ${c.level}`,
        `  Precio: S/ ${c.price} | Horas académicas: ${c.academic_hours}h`,
        c.syllabus_pdf_url ? `  Sílabo: ${c.syllabus_pdf_url}` : null,
      ]
        .filter(Boolean)
        .join('\n'),
    )
    .join('\n\n');
}

export function formatSalesForContext(sales: SaleRow[]): string {
  if (!sales.length) return 'No se encontraron ventas para este usuario.';

  return sales
    .map((s) => `• ${s.course_name} — S/ ${s.amount} (${s.status})`)
    .join('\n');
}
