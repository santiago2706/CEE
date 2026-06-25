/**
 * Servicio de datos del chatbot — consulta la tabla courses de Supabase.
 */

import { supabasePublic } from '@/lib/supabase-anon';
import type {
  MockCurso,
  MockSegmento,
  MockTema,
  MockSilaboCurso,
  MockHorarioSemanal,
  MockDetalleHorario,
  MockServicio,
  MockPrerrequisito,
} from '@/types/chatbot.types';
import { mockCatalogo } from '@/mocks/data/chatbot.mock';

const HAS_SUPABASE = Boolean(import.meta.env.VITE_SUPABASE_URL);

async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!HAS_SUPABASE) return fallback;
  try {
    return await fn();
  } catch (err) {
    console.warn('[Ceci DB] Fallback a mock:', err instanceof Error ? err.message : err);
    return fallback;
  }
}

interface CourseRow {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  short_description: string;
  price: number;
  academic_hours: number;
  enrolled_count: number;
  status: string;
  modality: string;
  level: string;
  syllabus_pdf_url: string;
  syllabus: { id: string; title: string; topics: string[] }[];
}

export const chatbotData = {
  async getSegmentos(): Promise<MockSegmento[]> {
    return safeQuery(async () => {
      const { data, error } = await supabasePublic
        .from('courses')
        .select('category')
        .eq('status', 'published');

      if (error || !data?.length) return mockCatalogo.segmentos;

      const cats = [...new Set((data as { category: string }[]).map(r => r.category))].sort();
      return cats.map((cat, i) => ({
        segmento_curso: i + 1,
        nombre_segmento: cat,
      }));
    }, mockCatalogo.segmentos);
  },

  async getCursos(): Promise<MockCurso[]> {
    return safeQuery(async () => {
      const { data, error } = await supabasePublic
        .from('courses')
        .select('id, slug, title, category, description, short_description, price, academic_hours, enrolled_count, status, modality, level, syllabus_pdf_url, syllabus')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error || !data?.length) return mockCatalogo.cursos;

      // Ids de segmento consistentes con getSegmentos()
      const cats = [...new Set((data as CourseRow[]).map(r => r.category))].sort();
      const segIdByCat = new Map<string, number>();
      cats.forEach((cat, i) => segIdByCat.set(cat, i + 1));

      return (data as CourseRow[]).map((r, idx) => ({
        cod_tipo_curso: idx + 1,
        nombre_curso: r.title,
        descripcion_curso: r.description || r.short_description || '',
        segmento_curso: segIdByCat.get(r.category) ?? 1,
        slug: r.slug,
        modality: r.modality,
        level: r.level,
        academic_hours: r.academic_hours,
        short_description: r.short_description,
        syllabus_pdf_url: r.syllabus_pdf_url || '',
      }));
    }, mockCatalogo.cursos);
  },

  async getTemas(): Promise<MockTema[]> {
    return safeQuery(async () => {
      const { data, error } = await supabasePublic
        .from('courses')
        .select('id, syllabus')
        .eq('status', 'published');

      if (error || !data) return mockCatalogo.temas;

      const temas: MockTema[] = [];
      let temaId = 1;

      for (const curso of data as { id: string; syllabus: { id: string; title: string; topics: string[] }[] }[]) {
        if (!curso.syllabus?.length) continue;
        for (const modulo of curso.syllabus) {
          for (const topic of modulo.topics) {
            temas.push({ cod_tema: temaId++, nombre_tema: topic, descripcion_tema: modulo.title, duracion_tema: 90 });
          }
        }
      }
      return temas.length > 0 ? temas : mockCatalogo.temas;
    }, mockCatalogo.temas);
  },

  async getSilaboCursos(): Promise<MockSilaboCurso[]> {
    return safeQuery(async () => {
      const { data, error } = await supabasePublic
        .from('courses')
        .select('id, syllabus')
        .eq('status', 'published');

      if (error || !data) return mockCatalogo.silaboCursos;

      const relaciones: MockSilaboCurso[] = [];
      let temaId = 1;

      for (const [cursoIdx] of (data as { id: string; syllabus: { title: string; topics: string[] }[] }[]).entries()) {
        const curso = (data as { id: string; syllabus: { title: string; topics: string[] }[] }[])[cursoIdx];
        if (!curso.syllabus?.length) continue;
        for (const [modIdx, modulo] of curso.syllabus.entries()) {
          for (let t = 0; t < modulo.topics.length; t++) {
            relaciones.push({ cod_tipo_curso: cursoIdx + 1, cod_tema: temaId++, secuencia_logica: modIdx * 10 + t + 1 });
          }
        }
      }
      return relaciones.length > 0 ? relaciones : mockCatalogo.silaboCursos;
    }, mockCatalogo.silaboCursos);
  },

  async getServicios(): Promise<MockServicio[]> {
    return safeQuery(async () => {
      const { data, error } = await supabasePublic
        .from('courses')
        .select('title, price, enrolled_count, status')
        .eq('status', 'published');

      if (error || !data) return mockCatalogo.servicios;

      return (data as { title: string; price: number; enrolled_count: number }[]).map((r, i) => ({
        cod_tipo_servicio: i + 1,
        descripcion_servicio: r.title,
        tarifa_curso: r.price,
        total_inscripciones: r.enrolled_count,
        total_veces_completado: Math.floor(r.enrolled_count * 0.8),
        estado_capacitacion: 'A' as const,
        tipo_curso: i + 1,
        tipo_horario: 1,
      }));
    }, mockCatalogo.servicios);
  },

  async getPrerrequisitos(): Promise<MockPrerrequisito[]> { return mockCatalogo.prerrequisitos; },
  async getHorariosSemanales(): Promise<MockHorarioSemanal[]> { return mockCatalogo.horariosSemanales; },
  async getDetalleHorarios(): Promise<MockDetalleHorario[]> { return mockCatalogo.detalleHorarios; },

  async cargarCatalogo(): Promise<typeof mockCatalogo> {
    const [segmentosDb, cursosCrudos, temas, silaboCursos, serviciosDb] =
      await Promise.all([
        this.getSegmentos(),
        this.getCursos(),
        this.getTemas(),
        this.getSilaboCursos(),
        this.getServicios(),
      ]);

    // Reconciliar: obtener el mapeo real title→category desde DB
    let catData: { title: string; category: string }[] | null = null;
    try {
      const { data } = await supabasePublic
        .from('courses')
        .select('title, category')
        .eq('status', 'published');
      catData = data;
    } catch { /* si falla, seguimos con los datos sin reconciliar */ }

    if (catData) {
      const titleToCategory = new Map<string, string>();
      for (const r of catData) {
        titleToCategory.set(r.title, r.category);
      }

      const cursos = cursosCrudos.map((c) => {
        const cat = titleToCategory.get(c.nombre_curso);
        if (!cat) return c;
        const segId = segmentosDb.find((s) => s.nombre_segmento === cat)?.segmento_curso;
        return segId ? { ...c, segmento_curso: segId } : c;
      });

      return {
        segmentos: segmentosDb, cursos, temas, silaboCursos, servicios: serviciosDb,
        prerrequisitos: mockCatalogo.prerrequisitos,
        horariosSemanales: mockCatalogo.horariosSemanales,
        detalleHorarios: mockCatalogo.detalleHorarios,
      };
    }

    return {
      segmentos: segmentosDb, cursos: cursosCrudos, temas, silaboCursos, servicios: serviciosDb,
      prerrequisitos: mockCatalogo.prerrequisitos,
      horariosSemanales: mockCatalogo.horariosSemanales,
      detalleHorarios: mockCatalogo.detalleHorarios,
    };
  },
};
