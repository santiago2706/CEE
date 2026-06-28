import type {
  ApiResponse,
  Certificate,
  EventRegistration,
  Sale,
  Student,
  StudentSource,
} from '@cee/types';
import { mockStudents } from '@/mocks/students.mock';
import { supabase } from '@/lib/supabase';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 350): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StudentFormInput {
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
  birthDate?: string | null;
  gender?: 'M' | 'F' | 'otro' | null;
  source: StudentSource;
  notes?: string | null;
  moodleUserId?: number | null;
}

export interface StudentFilters {
  search?: string;
  source?: StudentSource | 'all';
  isWorking?: boolean | 'all';
}

export interface StudentHistory {
  sales: Sale[];
  certificates: Certificate[];
  eventRegistrations: EventRegistration[];
}

// ─── In-memory cache ──────────────────────────────────────────────────────────

let studentsCache: Student[] = [...mockStudents];

// ─── Supabase row mapper ──────────────────────────────────────────────────────

interface StudentRow {
  id: string;
  dni: string;
  first_name: string;
  last_name_paterno: string;
  last_name_materno: string;
  email: string | null;
  phone: string;
  is_working: boolean;
  company: string | null;
  profession: string | null;
  address: string | null;
  district: string | null;
  city: string | null;
  birth_date: string | null;
  gender: 'M' | 'F' | 'otro' | null;
  source: StudentSource;
  notes: string | null;
  moodle_user_id: number | null;
  created_at: string;
  updated_at: string;
}

function rowToStudent(row: StudentRow): Student {
  return {
    id:              row.id,
    dni:             row.dni,
    firstName:       row.first_name,
    lastNamePaterno: row.last_name_paterno,
    lastNameMaterno: row.last_name_materno,
    email:           row.email,
    phone:           row.phone,
    isWorking:       row.is_working,
    company:         row.company,
    profession:      row.profession,
    address:         row.address,
    district:        row.district,
    city:            row.city,
    birthDate:       row.birth_date,
    gender:          row.gender,
    source:          row.source,
    notes:           row.notes,
    moodleUserId:    row.moodle_user_id,
    createdAt:       row.created_at,
    updatedAt:       row.updated_at,
  };
}

function inputToRow(input: StudentFormInput) {
  return {
    dni:              input.dni,
    first_name:       input.firstName,
    last_name_paterno: input.lastNamePaterno,
    last_name_materno: input.lastNameMaterno,
    email:            input.email ?? null,
    phone:            input.phone,
    is_working:       input.isWorking,
    company:          input.company ?? null,
    profession:       input.profession ?? null,
    address:          input.address ?? null,
    district:         input.district ?? null,
    city:             input.city ?? null,
    birth_date:       input.birthDate ?? null,
    gender:           input.gender ?? null,
    source:           input.source,
    notes:            input.notes ?? null,
    moodle_user_id:   input.moodleUserId ?? null,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const studentsService = {
  async getStudents(filters: StudentFilters = {}): Promise<ApiResponse<Student[]>> {
    if (USE_MOCKS) {
      const { search = '', source = 'all', isWorking = 'all' } = filters;
      const q = search.trim().toLowerCase();
      const filtered = studentsCache.filter((s) => {
        const fullName = `${s.firstName} ${s.lastNamePaterno} ${s.lastNameMaterno}`.toLowerCase();
        const matchSearch = !q || fullName.includes(q) || s.dni.includes(q) || (s.email ?? '').toLowerCase().includes(q);
        const matchSource = source === 'all' || s.source === source;
        const matchWorking = isWorking === 'all' || s.isWorking === isWorking;
        return matchSearch && matchSource && matchWorking;
      });
      return delay({ data: [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
    }

    let query = supabase.from('students').select('*').order('created_at', { ascending: false });
    if (filters.search) {
      const q = `%${filters.search}%`;
      query = query.or(`first_name.ilike.${q},last_name_paterno.ilike.${q},last_name_materno.ilike.${q},dni.ilike.${q},email.ilike.${q}`);
    }
    if (filters.source && filters.source !== 'all') query = query.eq('source', filters.source);
    if (filters.isWorking !== undefined && filters.isWorking !== 'all')
      query = query.eq('is_working', filters.isWorking);

    const { data, error } = await query;
    if (error) throw new Error('No se pudieron cargar los alumnos.');
    return { data: (data ?? []).map((r) => rowToStudent(r as StudentRow)) };
  },

  async getStudentById(id: string): Promise<ApiResponse<Student>> {
    if (USE_MOCKS) {
      const found = studentsCache.find((s) => s.id === id);
      if (!found) throw new Error(`Alumno no encontrado: ${id}`);
      return delay({ data: found });
    }
    const { data, error } = await supabase.from('students').select('*').eq('id', id).single();
    if (error || !data) throw new Error(`Alumno no encontrado: ${id}`);
    return { data: rowToStudent(data as StudentRow) };
  },

  async getStudentHistory(id: string): Promise<ApiResponse<StudentHistory>> {
    if (USE_MOCKS) {
      // In mock mode, no sales/certificates have student_id linked yet — returns empty arrays
      return delay({ data: { sales: [], certificates: [], eventRegistrations: [] } });
    }
    const [salesRes, certsRes, regsRes] = await Promise.all([
      supabase.from('sales').select('*').eq('student_id', id).order('created_at', { ascending: false }),
      supabase.from('certificates').select('*').eq('student_id', id).order('created_at', { ascending: false }),
      supabase.from('event_registrations').select('*, events(title, event_date)').eq('student_id', id).order('created_at', { ascending: false }),
    ]);
    return {
      data: {
        sales:              (salesRes.data ?? []) as Sale[],
        certificates:       (certsRes.data ?? []) as Certificate[],
        eventRegistrations: (regsRes.data ?? []) as EventRegistration[],
      },
    };
  },

  async createStudent(input: StudentFormInput): Promise<ApiResponse<Student>> {
    if (USE_MOCKS) {
      const now = new Date().toISOString();
      const newStudent: Student = {
        id: `stu-${Date.now()}`, ...input,
        email:      input.email ?? null,
        company:    input.company ?? null,
        profession: input.profession ?? null,
        address:    input.address ?? null,
        district:   input.district ?? null,
        city:       input.city ?? 'Lima',
        birthDate:  input.birthDate ?? null,
        gender:     input.gender ?? null,
        notes:      input.notes ?? null,
        moodleUserId: input.moodleUserId ?? null,
        createdAt: now, updatedAt: now,
      };
      studentsCache = [newStudent, ...studentsCache];
      return delay({ data: newStudent });
    }
    const { data, error } = await supabase
      .from('students')
      .insert(inputToRow(input))
      .select('*')
      .single();
    if (error || !data) throw new Error('No se pudo crear el alumno.');
    return { data: rowToStudent(data as StudentRow) };
  },

  async updateStudent(id: string, input: StudentFormInput): Promise<ApiResponse<Student>> {
    if (USE_MOCKS) {
      const idx = studentsCache.findIndex((s) => s.id === id);
      if (idx === -1) throw new Error(`Alumno no encontrado: ${id}`);
      const updated: Student = {
        ...studentsCache[idx], ...input,
        email:      input.email ?? null,
        company:    input.company ?? null,
        profession: input.profession ?? null,
        address:    input.address ?? null,
        district:   input.district ?? null,
        city:       input.city ?? 'Lima',
        birthDate:  input.birthDate ?? null,
        gender:     input.gender ?? null,
        notes:      input.notes ?? null,
        moodleUserId: input.moodleUserId ?? null,
        updatedAt: new Date().toISOString(),
      };
      studentsCache[idx] = updated;
      return delay({ data: updated });
    }
    const { data, error } = await supabase
      .from('students')
      .update({ ...inputToRow(input), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();
    if (error || !data) throw new Error('No se pudo actualizar el alumno.');
    return { data: rowToStudent(data as StudentRow) };
  },

  async deleteStudent(id: string): Promise<ApiResponse<void>> {
    if (USE_MOCKS) {
      studentsCache = studentsCache.filter((s) => s.id !== id);
      return delay({ data: undefined as void });
    }
    // Real mode: check for associated sales first
    const { count } = await supabase
      .from('sales')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', id);
    if ((count ?? 0) > 0) {
      throw new Error('No se puede eliminar un alumno con ventas registradas.');
    }
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) throw new Error('No se pudo eliminar el alumno.');
    return { data: undefined as void };
  },
};
