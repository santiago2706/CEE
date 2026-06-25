import type {
  ApiResponse,
  DashboardActivityItem,
  DashboardCategoryPoint,
  DashboardMetrics,
  DashboardSaleItem,
  DashboardSummary,
  SalesTrendPoint,
} from '@cee/types';
import { mockDashboardMetrics, mockDashboardSummary } from '@/mocks/dashboard';
import { supabase } from '@/lib/supabase';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

function pct(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Number((((curr - prev) / prev) * 100).toFixed(1));
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

interface CourseActivityRow {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

async function countCourses(status: string, gte?: string, lt?: string): Promise<number> {
  let query = supabase.from('courses').select('id', { count: 'exact', head: true }).eq('status', status);
  if (gte) query = query.gte('created_at', gte);
  if (lt) query = query.lt('created_at', lt);
  const { count } = await query;
  return count ?? 0;
}

async function countRows(table: 'profiles' | 'sales', gte?: string, lt?: string, status?: string): Promise<number> {
  let query = supabase.from(table).select('id', { count: 'exact', head: true });
  if (status) query = query.eq('status', status);
  if (gte) query = query.gte('created_at', gte);
  if (lt) query = query.lt('created_at', lt);
  const { count } = await query;
  return count ?? 0;
}

async function buildRecentActivity(): Promise<DashboardActivityItem[]> {
  const { data: recentCourses } = await supabase
    .from('courses')
    .select('id, title, created_at, updated_at, created_by, updated_by')
    .order('updated_at', { ascending: false })
    .limit(5);

  const rows = (recentCourses ?? []) as CourseActivityRow[];
  const actorIds = Array.from(
    new Set(rows.flatMap((r) => [r.created_by, r.updated_by]).filter((id): id is string => Boolean(id))),
  );

  const { data: actors } = actorIds.length
    ? await supabase.from('profiles').select('id, name').in('id', actorIds)
    : { data: [] as { id: string; name: string }[] };

  const nameById = new Map((actors ?? []).map((a) => [a.id, a.name]));

  return rows.map((row) => {
    const isUpdate = row.updated_at !== row.created_at;
    const actorId = isUpdate ? row.updated_by : row.created_by;
    return {
      id: row.id,
      courseTitle: row.title,
      action: isUpdate ? 'updated' : 'created',
      author: (actorId && nameById.get(actorId)) || 'CEE-FIIS',
      date: isUpdate ? row.updated_at : row.created_at,
    };
  });
}

const MONTHS_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'] as const;

interface SaleRow { id: string; amount: number; status: string; created_at: string; course_name?: string | null }

export const dashboardService = {
  async getMetrics(from?: string, to?: string): Promise<ApiResponse<DashboardMetrics>> {
    if (USE_MOCKS) return delay({ data: mockDashboardMetrics });

    const now = new Date();
    const rangeFrom = from ? new Date(from).toISOString()            : startOfMonth(now).toISOString();
    const rangeTo   = to   ? new Date(to + 'T23:59:59').toISOString() : now.toISOString();

    // Previous period for delta %
    const duration = new Date(rangeTo).getTime() - new Date(rangeFrom).getTime();
    const prevFrom = new Date(new Date(rangeFrom).getTime() - duration).toISOString();

    // ── Parallel queries ──────────────────────────────────────────────────────
    const [salesRes, prevSalesRes, leadsRes, prevLeadsRes, coursesRes, trendRes, recentRes] =
      await Promise.all([
        // Sales in range (completed)
        supabase.from('sales').select('id, amount, status, created_at, course_name')
          .eq('status', 'completed').gte('created_at', rangeFrom).lte('created_at', rangeTo),

        // Sales in prev period (completed) — for delta
        supabase.from('sales').select('id, amount, status, created_at')
          .eq('status', 'completed').gte('created_at', prevFrom).lt('created_at', rangeFrom),

        // Leads in range
        supabase.from('contact_leads').select('id', { count: 'exact', head: true })
          .gte('created_at', rangeFrom).lte('created_at', rangeTo),

        // Leads in prev period
        supabase.from('contact_leads').select('id', { count: 'exact', head: true })
          .gte('created_at', prevFrom).lt('created_at', rangeFrom),

        // Published courses (not date-filtered)
        supabase.from('courses').select('category').eq('status', 'published'),

        // Monthly revenue trend — last 6 months
        supabase.from('sales').select('amount, created_at').eq('status', 'completed')
          .gte('created_at', (() => { const d = new Date(); d.setMonth(d.getMonth() - 5); d.setDate(1); return d.toISOString(); })()),

        // Recent 5 sales (any status, newest first)
        supabase.from('sales').select('id, amount, status, created_at, course_name')
          .order('created_at', { ascending: false }).limit(5),
      ]);

    const sales     = (salesRes.data     ?? []) as SaleRow[];
    const prevSales = (prevSalesRes.data ?? []) as SaleRow[];

    const totalRevenue   = sales.reduce((s, r) => s + (r.amount ?? 0), 0);
    const prevRevenue    = prevSales.reduce((s, r) => s + (r.amount ?? 0), 0);
    const completedSales = sales.length;
    const prevSalesCount = prevSales.length;

    const contactLeads = leadsRes.count   ?? 0;
    const prevLeads    = prevLeadsRes.count ?? 0;

    // Published courses + category breakdown
    const publishedCourses = (coursesRes.data ?? []).length;
    const catMap: Record<string, number> = {};
    (coursesRes.data ?? []).forEach((c: { category: string }) => {
      catMap[c.category] = (catMap[c.category] ?? 0) + 1;
    });
    const coursesByCategory: DashboardCategoryPoint[] = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ category, count }));

    // Monthly revenue trend (aggregate by month label)
    const monthMap: Record<string, number> = {};
    ((trendRes.data ?? []) as { amount: number; created_at: string }[]).forEach((r) => {
      const label = MONTHS_ES[new Date(r.created_at).getMonth()];
      monthMap[label] = (monthMap[label] ?? 0) + r.amount;
    });
    const monthlyRevenue: SalesTrendPoint[] = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
      const label = MONTHS_ES[d.getMonth()];
      return { label, revenue: monthMap[label] ?? 0 };
    });

    // Recent sales for table
    const recentSales: DashboardSaleItem[] = ((recentRes.data ?? []) as SaleRow[]).map((r) => ({
      id: r.id,
      courseName: r.course_name ?? 'Sin nombre',
      amount: r.amount,
      status: r.status as 'completed' | 'pending' | 'refunded',
      date: r.created_at,
    }));

    return {
      data: {
        kpis: {
          totalRevenue,
          revenueDeltaPct:          pct(totalRevenue,   prevRevenue),
          publishedCourses,
          publishedCoursesDeltaPct: 0,
          contactLeads,
          leadsDeltaPct:            pct(contactLeads,   prevLeads),
          completedSales,
          salesDeltaPct:            pct(completedSales, prevSalesCount),
        },
        monthlyRevenue,
        coursesByCategory,
        recentSales,
      },
    };
  },

  async getSummary(): Promise<ApiResponse<DashboardSummary>> {
    if (USE_MOCKS) {
      return delay({ data: mockDashboardSummary });
    }

    const now = new Date();
    const thisMonthStart = startOfMonth(now).toISOString();
    const lastMonthStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1)).toISOString();

    const [
      publishedCourses,
      publishedThisMonth,
      publishedLastMonth,
      draftCourses,
      draftThisMonth,
      draftLastMonth,
      registeredUsers,
      usersThisMonth,
      usersLastMonth,
      monthlySales,
      lastMonthSales,
      recentActivity,
    ] = await Promise.all([
      countCourses('published'),
      countCourses('published', thisMonthStart),
      countCourses('published', lastMonthStart, thisMonthStart),
      countCourses('draft'),
      countCourses('draft', thisMonthStart),
      countCourses('draft', lastMonthStart, thisMonthStart),
      countRows('profiles'),
      countRows('profiles', thisMonthStart),
      countRows('profiles', lastMonthStart, thisMonthStart),
      countRows('sales', thisMonthStart, undefined, 'completed'),
      countRows('sales', lastMonthStart, thisMonthStart, 'completed'),
      buildRecentActivity(),
    ]);

    return {
      data: {
        publishedCourses,
        publishedCoursesDeltaPct: pct(publishedThisMonth, publishedLastMonth),
        draftCourses,
        draftCoursesDeltaPct: pct(draftThisMonth, draftLastMonth),
        monthlySales,
        monthlySalesDeltaPct: pct(monthlySales, lastMonthSales),
        registeredUsers,
        registeredUsersDeltaPct: pct(usersThisMonth, usersLastMonth),
        recentActivity,
      },
    };
  },
};
