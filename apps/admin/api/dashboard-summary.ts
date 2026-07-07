import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  getDashboardSummary,
  type DashboardSummaryKpis,
  type DashboardSummaryCategoryPoint,
} from './_lib/dashboardSummaryService';
import { ApiError } from './_lib/errors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido.' });
    return;
  }

  const { from, to, kpis, coursesByCategory } = req.body as {
    from?: string;
    to?: string;
    kpis?: DashboardSummaryKpis;
    coursesByCategory?: DashboardSummaryCategoryPoint[];
  };

  if (!from || !to || !kpis) {
    res.status(400).json({ error: 'Los campos "from", "to" y "kpis" son requeridos.' });
    return;
  }

  try {
    const summary = await getDashboardSummary({ from, to, kpis, coursesByCategory: coursesByCategory ?? [] });
    res.status(200).json({ summary });
  } catch (err) {
    console.error('[api/dashboard-summary] Error al generar el resumen:', err);
    const code = err instanceof ApiError ? err.code : 'unknown_error';
    const message = err instanceof ApiError ? err.message : 'No se pudo generar el resumen.';
    res.status(500).json({ error: message, code });
  }
}
