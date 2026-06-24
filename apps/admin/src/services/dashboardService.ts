import type { ApiResponse, DashboardActivityItem, DashboardSummary } from '@cee/types';
import { mockDashboardSummary } from '@/mocks/dashboard';
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

export const dashboardService = {
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
