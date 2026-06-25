/**
 * Implementación de herramientas (tools) que el LLM puede invocar.
 * Cada función consulta la base de datos de Supabase y devuelve resultados formateados.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

const DIA_MAP: Record<string, string> = {
  L: "Lunes",
  M: "Martes",
  X: "Miércoles",
  J: "Jueves",
  V: "Viernes",
  S: "Sábado",
  D: "Domingo",
};

function horaTexto(hora: number): string {
  return `${String(hora).padStart(2, "0")}:00`;
}

export async function executeTool(name: string, args: Record<string, unknown>): Promise<ToolResult> {
  switch (name) {
    case "get_segmentos":
      return getSegmentos();
    case "buscar_cursos":
      return buscarCursos(args.query as string, args.segmento as string | undefined);
    case "detalle_curso":
      return detalleCurso(args.curso_id as number);
    case "temario_curso":
      return temarioCurso(args.curso_id as number);
    case "horarios_curso":
      return horariosCurso(args.curso_id as number);
    case "prerrequisitos_curso":
      return prerrequisitosCurso(args.curso_id as number);
    case "servicios_curso":
      return serviciosCurso(args.curso_id as number);
    default:
      return { success: false, error: `Herramienta desconocida: ${name}` };
  }
}

async function getSegmentos(): Promise<ToolResult> {
  const { data, error } = await supabase
    .from("catalogo_segmento_curso")
    .select("segmento_curso, nombre_segmento")
    .order("segmento_curso");

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

async function buscarCursos(query: string, segmento?: string): Promise<ToolResult> {
  let q = supabase
    .from("catalogo_curso")
    .select("cod_tipo_curso, nombre_curso, descripcion_curso, segmento_curso, catalogo_segmento_curso!inner(nombre_segmento)");

  if (segmento) {
    q = q.eq("catalogo_segmento_curso.nombre_segmento", segmento);
  }

  const searchTerm = `%${query}%`;
  q = q.or(`nombre_curso.ilike.${searchTerm},descripcion_curso.ilike.${searchTerm}`);

  const { data, error } = await q.limit(10);

  if (error) return { success: false, error: error.message };

  const formatted = (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.cod_tipo_curso,
    nombre: r.nombre_curso,
    descripcion: r.descripcion_curso,
    segmento: (r.catalogo_segmento_curso as { nombre_segmento: string })?.nombre_segmento ?? "",
  }));

  return { success: true, data: formatted };
}

async function detalleCurso(cursoId: number): Promise<ToolResult> {
  const { data: curso, error: cursoErr } = await supabase
    .from("catalogo_curso")
    .select("cod_tipo_curso, nombre_curso, descripcion_curso, segmento_curso, catalogo_segmento_curso!inner(nombre_segmento)")
    .eq("cod_tipo_curso", cursoId)
    .single();

  if (cursoErr) return { success: false, error: "Curso no encontrado" };

  const { data: servicios } = await supabase
    .from("catalogo_maestro_servicio")
    .select("cod_tipo_servicio, descripcion_servicio, tarifa_curso, total_inscripciones, estado_capacitacion")
    .eq("tipo_curso", cursoId);

  const r = curso as Record<string, unknown>;
  const segmento = (r.catalogo_segmento_curso as { nombre_segmento: string })?.nombre_segmento ?? "";

  return {
    success: true,
    data: {
      id: r.cod_tipo_curso,
      nombre: r.nombre_curso,
      descripcion: r.descripcion_curso,
      segmento,
      servicios: (servicios ?? []).map((s: Record<string, unknown>) => ({
        nombre: s.descripcion_servicio,
        precio: Number(s.tarifa_curso),
        inscripciones: s.total_inscripciones,
        estado: s.estado_capacitacion === "A" ? "Disponible" : "No disponible",
      })),
    },
  };
}

async function temarioCurso(cursoId: number): Promise<ToolResult> {
  const { data, error } = await supabase
    .from("relacion_silabus_x_curso")
    .select("secuencia_logica, catalogo_tema!inner(cod_tema, nombre_tema, descripcion_tema, duracion_tema)")
    .eq("cod_tipo_curso", cursoId)
    .order("secuencia_logica");

  if (error) return { success: false, error: error.message };

  const formatted = (data ?? []).map((r: Record<string, unknown>) => {
    const tema = r.catalogo_tema as Record<string, unknown>;
    return {
      secuencia: r.secuencia_logica,
      tema: tema.nombre_tema,
      descripcion: tema.descripcion_tema,
      duracion_min: tema.duracion_tema,
    };
  });

  return { success: true, data: formatted };
}

async function horariosCurso(cursoId: number): Promise<ToolResult> {
  const { data: servicios, error: svcErr } = await supabase
    .from("catalogo_maestro_servicio")
    .select("tipo_horario")
    .eq("tipo_curso", cursoId);

  if (svcErr) return { success: false, error: svcErr.message };

  const horariosIds = [...new Set((servicios ?? []).map((s: Record<string, unknown>) => s.tipo_horario))];
  if (!horariosIds.length) return { success: true, data: [] };

  const { data: horarios, error: horErr } = await supabase
    .from("catalogo_horario_semanal")
    .select("tipo_horario, descripcion_horario")
    .in("tipo_horario", horariosIds);

  if (horErr) return { success: false, error: horErr.message };

  const result = [];
  for (const h of horarios ?? []) {
    const hor = h as Record<string, unknown>;
    const { data: detalles } = await supabase
      .from("detalle_horario")
      .select("dia_semana, hora")
      .eq("tipo_horario", hor.tipo_horario)
      .order("hora");

    let resumen = `${hor.descripcion_horario}`;
    if (detalles?.length) {
      const porDia = new Map<string, number[]>();
      for (const d of detalles as Record<string, unknown>[]) {
        const dia = d.dia_semana as string;
        if (!porDia.has(dia)) porDia.set(dia, []);
        porDia.get(dia)!.push(d.hora as number);
      }
      const lineas = [];
      for (const [dia, horas] of porDia) {
        const dias = DIA_MAP[dia] ?? dia;
        lineas.push(`${dias}: ${horas.map(horaTexto).join(", ")}`);
      }
      resumen += `\n  ${lineas.join("\n  ")}`;
    }
    result.push(resumen);
  }

  return { success: true, data: result };
}

async function prerrequisitosCurso(cursoId: number): Promise<ToolResult> {
  const { data, error } = await supabase
    .from("relacion_pre_requisito")
    .select("cod_curso_previo, catalogo_curso!relacion_pre_requisito_cod_curso_previo_fkey(nombre_curso)")
    .eq("cod_curso", cursoId);

  if (error) return { success: false, error: error.message };

  const formatted = (data ?? []).map((r: Record<string, unknown>) => {
    const curso = r.catalogo_curso as { nombre_curso: string };
    return curso.nombre_curso;
  });

  return { success: true, data: formatted };
}

async function serviciosCurso(cursoId: number): Promise<ToolResult> {
  const { data, error } = await supabase
    .from("catalogo_maestro_servicio")
    .select("cod_tipo_servicio, descripcion_servicio, tarifa_curso, total_inscripciones, total_veces_completado, estado_capacitacion, tipo_horario, catalogo_horario_semanal!inner(descripcion_horario)")
    .eq("tipo_curso", cursoId);

  if (error) return { success: false, error: error.message };

  const formatted = (data ?? []).map((s: Record<string, unknown>) => {
    const horario = s.catalogo_horario_semanal as { descripcion_horario: string };
    return {
      id: s.cod_tipo_servicio,
      nombre: s.descripcion_servicio,
      precio: Number(s.tarifa_curso),
      inscripciones: s.total_inscripciones,
      completados: s.total_veces_completado,
      estado: s.estado_capacitacion === "A" ? "Disponible" : "No disponible",
      horario: horario?.descripcion_horario ?? "",
    };
  });

  return { success: true, data: formatted };
}
