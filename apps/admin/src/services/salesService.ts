import type { ApiResponse, CourseSalesBreakdown, SalesKpis, SalesReport, SalesTrendPoint } from '@cee/types';
import { mockSalesReports } from '@/mocks/sales';
import { supabase } from '@/lib/supabase';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

/**
 * Filtro de rango de fechas del selector de Ventas. No vive en @cee/types
 * porque es un parámetro de UI (qué ventana mostrar), no un contrato de
 * respuesta de backend — mismo criterio que CourseFormInput en coursesService.
 */
export type SalesDateRange = 'week' | 'month' | 'quarter';

interface SaleRow {
  id: string;
  course_id: string;
  course_name: string;
  amount: number;
  status: 'completed' | 'pending' | 'refunded';
  created_at: string;
}

// "quarter" en este dashboard muestra 6 meses de tendencia (criterio heredado de los mocks).
const RANGE_LENGTH_DAYS: Record<SalesDateRange, number> = { week: 7, month: 28, quarter: 182 };
const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function pct(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return ((curr - prev) / prev) * 100;
}

function buildTrend(range: SalesDateRange, rows: SaleRow[], start: Date, end: Date): SalesTrendPoint[] {
  const completed = rows.filter((r) => r.status === 'completed');

  if (range === 'week') {
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      const revenue = completed
        .filter((r) => isSameDay(new Date(r.created_at), day))
        .reduce((acc, r) => acc + Number(r.amount), 0);
      return { label: WEEKDAY_LABELS[day.getDay()], revenue };
    });
  }

  if (range === 'month') {
    return Array.from({ length: 4 }, (_, i) => {
      const weekStart = new Date(start);
      weekStart.setDate(start.getDate() + i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      const revenue = completed
        .filter((r) => {
          const d = new Date(r.created_at);
          return d >= weekStart && d < weekEnd;
        })
        .reduce((acc, r) => acc + Number(r.amount), 0);
      return { label: `Sem ${i + 1}`, revenue };
    });
  }

  return Array.from({ length: 6 }, (_, i) => {
    const monthDate = new Date(end.getFullYear(), end.getMonth() - (5 - i), 1);
    const revenue = completed
      .filter((r) => {
        const d = new Date(r.created_at);
        return d.getFullYear() === monthDate.getFullYear() && d.getMonth() === monthDate.getMonth();
      })
      .reduce((acc, r) => acc + Number(r.amount), 0);
    return { label: MONTH_LABELS[monthDate.getMonth()], revenue };
  });
}

function buildBreakdown(rows: SaleRow[]): CourseSalesBreakdown[] {
  const map = new Map<string, CourseSalesBreakdown>();

  for (const row of rows.filter((r) => r.status === 'completed')) {
    const existing = map.get(row.course_id);
    if (existing) {
      existing.salesCount += 1;
      existing.revenue += Number(row.amount);
      if (row.created_at > existing.lastTransaction) existing.lastTransaction = row.created_at;
    } else {
      map.set(row.course_id, {
        courseId: row.course_id,
        courseName: row.course_name,
        salesCount: 1,
        revenue: Number(row.amount),
        lastTransaction: row.created_at,
      });
    }
  }

  return Array.from(map.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

export const salesService = {
  async getSalesReport(range: SalesDateRange = 'month'): Promise<ApiResponse<SalesReport>> {
    if (USE_MOCKS) {
      return delay({ data: mockSalesReports[range] });
    }

    const lengthDays = RANGE_LENGTH_DAYS[range];
    const now = new Date();
    const currentStart = new Date(now);
    currentStart.setDate(currentStart.getDate() - (lengthDays - 1));
    currentStart.setHours(0, 0, 0, 0);
    const previousStart = new Date(currentStart);
    previousStart.setDate(previousStart.getDate() - lengthDays);

    const { data, error } = await supabase
      .from('sales')
      .select('id, course_id, course_name, amount, status, created_at')
      .gte('created_at', previousStart.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error('No se pudo cargar el reporte de ventas.');
    }

    const rows = (data ?? []) as SaleRow[];
    const current = rows.filter((r) => new Date(r.created_at) >= currentStart);
    const previous = rows.filter((r) => new Date(r.created_at) < currentStart);

    const completedAmount = (list: SaleRow[]) =>
      list.filter((r) => r.status === 'completed').reduce((acc, r) => acc + Number(r.amount), 0);
    const completedCount = (list: SaleRow[]) => list.filter((r) => r.status === 'completed').length;
    const conversion = (list: SaleRow[]) => {
      const attempts = list.length;
      return attempts > 0 ? (completedCount(list) / attempts) * 100 : 0;
    };

    const totalSales = completedCount(current);
    const totalRevenue = completedAmount(current);
    const conversionRate = conversion(current);

    const kpis: SalesKpis = {
      totalSales,
      totalRevenue,
      conversionRate: Number(conversionRate.toFixed(1)),
      salesDeltaPct: Number(pct(totalSales, completedCount(previous)).toFixed(1)),
      revenueDeltaPct: Number(pct(totalRevenue, completedAmount(previous)).toFixed(1)),
      conversionDeltaPct: Number((conversionRate - conversion(previous)).toFixed(1)),
    };

    return {
      data: {
        kpis,
        trend: buildTrend(range, current, currentStart, now),
        breakdown: buildBreakdown(current),
      },
    };
  },
};
