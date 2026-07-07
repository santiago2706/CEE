import Groq from 'groq-sdk';
import { ApiError, requireEnv } from './errors';

// Construcción perezosa (ver _lib/supabase.ts para el motivo): así el error de
// env var faltante cae dentro del try/catch del handler, no en el cold start.
let client: Groq | undefined;

function getGroq(): Groq {
  if (!client) {
    client = new Groq({ apiKey: requireEnv('GROQ_API_KEY') });
  }
  return client;
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface DashboardSummaryKpis {
  totalRevenue: number;
  revenueDeltaPct: number;
  publishedCourses: number;
  publishedCoursesDeltaPct: number;
  contactLeads: number;
  leadsDeltaPct: number;
  completedSales: number;
  salesDeltaPct: number;
}

export interface DashboardSummaryCategoryPoint {
  category: string;
  count: number;
}

export interface DashboardSummaryRequest {
  from: string;
  to: string;
  kpis: DashboardSummaryKpis;
  coursesByCategory: DashboardSummaryCategoryPoint[];
}

// ─── Prompt ───────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Eres un asistente que redacta resúmenes ejecutivos breves para la secretaria \
del Centro de Especialización Ejecutiva (CEE-FIIS, UNI). Con las métricas del panel \
administrativo que recibas, escribe un resumen de 2 a 3 frases en español, en tono \
profesional y directo, sin jerga técnica. Los montos de dinero ya vienen formateados \
con el prefijo "S/" (soles peruanos, nunca dólares) — cópialos tal cual, no los \
reformatees ni les cambies el símbolo. No menciones nombres de modelos de IA ni \
detalles técnicos de cómo se generó el resumen. No inventes cifras que no estén en \
los datos proporcionados. Si la lista de "alertas" no está vacía, menciona esas \
caídas con tono de alerta, anteponiendo el emoji ⚠️.`;

const ANOMALY_THRESHOLD_PCT = -50;

const DELTA_FIELDS: { key: keyof DashboardSummaryKpis; label: string }[] = [
  { key: 'revenueDeltaPct',          label: 'Total de ventas' },
  { key: 'publishedCoursesDeltaPct', label: 'Cursos publicados' },
  { key: 'leadsDeltaPct',            label: 'Leads de contacto' },
  { key: 'salesDeltaPct',            label: 'Ventas completadas' },
];

function detectAnomalies(kpis: DashboardSummaryKpis): string[] {
  return DELTA_FIELDS
    .filter(({ key }) => kpis[key] < ANOMALY_THRESHOLD_PCT)
    .map(({ key, label }) => `${label} cayó ${kpis[key]}% vs. el mes anterior`);
}

// ─── Caché por rango de fechas + día ──────────────────────────────────────────
// Máximo 1 llamada a Groq por combinación (from, to, día calendario): evita
// regenerar el mismo resumen en cada carga de página durante el mismo día.
const CACHE_MAX_ENTRIES = 50;
const summaryCache = new Map<string, string>();

function cacheKey(from: string, to: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return `${from}_${to}_${today}`;
}

function setCached(key: string, summary: string): void {
  if (!summaryCache.has(key) && summaryCache.size >= CACHE_MAX_ENTRIES) {
    const oldestKey = summaryCache.keys().next().value;
    if (oldestKey !== undefined) summaryCache.delete(oldestKey);
  }
  summaryCache.set(key, summary);
}

// ─── Servicio ─────────────────────────────────────────────────────────────────

export async function getDashboardSummary(req: DashboardSummaryRequest): Promise<string> {
  const key = cacheKey(req.from, req.to);
  const cached = summaryCache.get(key);
  if (cached) return cached;

  const anomalies = detectAnomalies(req.kpis);
  const { kpis, coursesByCategory } = req;

  const categoryLines = coursesByCategory.length
    ? coursesByCategory.map((c) => `- ${c.category}: ${c.count}`).join('\n')
    : '- (sin cursos publicados en el período)';

  const userContent = `Período: ${req.from} a ${req.to}

Métricas del panel:
- Total de ventas: S/ ${kpis.totalRevenue.toLocaleString('es-PE')} (${kpis.revenueDeltaPct}% vs. mes anterior)
- Cursos publicados: ${kpis.publishedCourses} (${kpis.publishedCoursesDeltaPct}% vs. mes anterior)
- Leads de contacto: ${kpis.contactLeads} (${kpis.leadsDeltaPct}% vs. mes anterior)
- Ventas completadas: ${kpis.completedSales} (${kpis.salesDeltaPct}% vs. mes anterior)

Distribución de cursos por categoría:
${categoryLines}

Alertas detectadas (caídas mayores al 50% vs. mes anterior): ${anomalies.length ? anomalies.join('; ') : 'ninguna'}`;

  let response;
  try {
    response = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
      max_tokens: 200,
      temperature: 0.4,
    });
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('groq_api_error', err instanceof Error ? err.message : 'Error al llamar a la API de Groq.');
  }

  const raw = response.choices[0]?.message?.content?.trim() || 'No se pudo generar el resumen en este momento.';
  // Salvaguarda determinística: el modelo insiste en usar "$" pese a la
  // instrucción del prompt (los montos ya llegan formateados en soles).
  const summary = raw.replace(/\$\s?/g, 'S/ ');
  setCached(key, summary);
  return summary;
}
