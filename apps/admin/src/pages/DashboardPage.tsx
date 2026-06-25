import { useState, useEffect, useCallback } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { BookOpen, CheckCircle, DollarSign, TrendingDown, TrendingUp, Users } from 'lucide-react';
import type { DashboardMetrics } from '@cee/types';
import { dashboardService } from '@/services/dashboardService';
import { cn, formatPrice } from '@/lib/utils';

// ─── constants ───────────────────────────────────────────────────────────────

const PIE_COLORS = ['#682222', '#8C3A3A', '#C97070', '#A9A9A9', '#4F1A1A'];

const saleDateFmt = new Intl.DateTimeFormat('es-PE', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

// ─── helpers ────────────────────────────────────────────────────────────────

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

function isoFirstOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

// ─── KPI card ───────────────────────────────────────────────────────────────

interface KpiCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  deltaPct: number;
  iconBg: string;
}

function KpiCard({ icon: Icon, label, value, deltaPct, iconBg }: KpiCardProps) {
  const positive = deltaPct >= 0;
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white p-5 shadow-sm border-l-[4px] border-l-[#682222]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#A9A9A9]">{label}</p>
        <span
          className="flex h-10 w-10 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: iconBg }}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </span>
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight text-black">{value}</p>
        <p className={cn('mt-1.5 flex items-center gap-1 text-xs font-medium', positive ? 'text-emerald-600' : 'text-rose-500')}>
          {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {positive ? '+' : ''}{deltaPct}% vs. mes anterior
        </p>
      </div>
    </div>
  );
}

// ─── status badge ────────────────────────────────────────────────────────────

const SALE_STATUS_CONFIG = {
  completed: { label: 'Completado',  cls: 'bg-emerald-50 text-emerald-700' },
  pending:   { label: 'Pendiente',   cls: 'bg-amber-50 text-amber-700' },
  refunded:  { label: 'Reembolsado', cls: 'bg-rose-50 text-rose-600' },
} as const;

function SaleStatusBadge({ status }: { status: 'completed' | 'pending' | 'refunded' }) {
  const { label, cls } = SALE_STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', cls)}>
      {label}
    </span>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [from, setFrom] = useState(isoFirstOfMonth());
  const [to, setTo]     = useState(isoToday());
  const [applied, setApplied] = useState({ from: isoFirstOfMonth(), to: isoToday() });
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  const load = useCallback(async (f: string, t: string) => {
    setLoading(true);
    setError(false);
    try {
      const res = await dashboardService.getMetrics(f, t);
      setMetrics(res.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(applied.from, applied.to); }, [applied, load]);

  const totalCourses = metrics?.coursesByCategory.reduce((s, c) => s + c.count, 0) ?? 0;

  return (
    <section className="grid gap-6">

      {/* ── Page title ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard CEE-FIIS</h1>
        <p className="mt-0.5 text-sm text-[#A9A9A9]">Panel de control y métricas generales</p>
      </div>

      {/* ── Filtro de fecha ── */}
      <div className="rounded-xl bg-white shadow-sm" style={{ borderBottom: '3px solid #682222' }}>
        <div className="flex flex-wrap items-center gap-3 px-5 py-4">
          <span className="text-sm font-semibold text-gray-700">Filtrar por fecha</span>
          <div className="h-4 w-px bg-gray-200" />
          <label className="flex items-center gap-2 text-sm text-gray-600">
            Desde
            <input
              type="date"
              value={from}
              max={to}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm text-gray-900 focus:border-[#682222] focus:outline-none focus:ring-1 focus:ring-[#682222]/40"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            Hasta
            <input
              type="date"
              value={to}
              min={from}
              max={isoToday()}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm text-gray-900 focus:border-[#682222] focus:outline-none focus:ring-1 focus:ring-[#682222]/40"
            />
          </label>
          <button
            type="button"
            onClick={() => setApplied({ from, to })}
            className="rounded-lg bg-[#682222] px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#4F1A1A] focus:outline-none focus:ring-2 focus:ring-[#682222]/40"
          >
            Aplicar
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex h-72 items-center justify-center rounded-xl bg-white shadow-sm">
          <p className="text-sm text-[#A9A9A9]">Cargando datos...</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex h-72 items-center justify-center rounded-xl border border-rose-100 bg-rose-50">
          <p className="text-sm text-rose-600">No se pudieron cargar los datos. Intenta nuevamente.</p>
        </div>
      )}

      {!loading && !error && metrics && (
        <>
          {/* ── KPI cards — íconos con colores distintos ── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              icon={DollarSign}
              label="Total Ventas"
              value={`S/ ${metrics.kpis.totalRevenue.toLocaleString('es-PE')}`}
              deltaPct={metrics.kpis.revenueDeltaPct}
              iconBg="#682222"
            />
            <KpiCard
              icon={BookOpen}
              label="Cursos Publicados"
              value={String(metrics.kpis.publishedCourses)}
              deltaPct={metrics.kpis.publishedCoursesDeltaPct}
              iconBg="#1a5c2a"
            />
            <KpiCard
              icon={Users}
              label="Leads de Contacto"
              value={String(metrics.kpis.contactLeads)}
              deltaPct={metrics.kpis.leadsDeltaPct}
              iconBg="#1a3a5c"
            />
            <KpiCard
              icon={CheckCircle}
              label="Ventas Completadas"
              value={String(metrics.kpis.completedSales)}
              deltaPct={metrics.kpis.salesDeltaPct}
              iconBg="#3d1a5c"
            />
          </div>

          {/* ── Gráficos ── */}
          <div className="grid gap-4 lg:grid-cols-3">

            {/* Barras + línea de tendencia */}
            <div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
              <p className="mb-5 text-sm font-semibold text-gray-900">Ingresos mensuales (S/)</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={metrics.monthlyRevenue} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <YAxis
                      axisLine={false} tickLine={false} width={54}
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      tickFormatter={(v: number) => v >= 1000 ? `S/${(v / 1000).toFixed(0)}k` : `S/${v}`}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(104,34,34,0.07)' }}
                      contentStyle={{
                        backgroundColor: '#682222',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 12,
                        boxShadow: '0 4px 16px rgba(104,34,34,0.35)',
                      }}
                      labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(v: unknown) => [`S/ ${Number(v).toLocaleString('es-PE')}`, 'Ingresos']}
                    />
                    <Bar dataKey="revenue" fill="#682222" radius={[4, 4, 0, 0]} maxBarSize={44} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#C97070"
                      strokeWidth={2}
                      dot={{ fill: '#fff', stroke: '#C97070', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 4, fill: '#682222' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Dona — con total en el centro y leyenda con % */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="mb-5 text-sm font-semibold text-gray-900">Distribución por categoría</p>
              <div className="relative h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.coursesByCategory}
                      dataKey="count"
                      nameKey="category"
                      cx="50%" cy="38%"
                      outerRadius={62} innerRadius={34}
                      paddingAngle={2}
                    >
                      {metrics.coursesByCategory.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                      formatter={(v: unknown, n: unknown) => [Number(v), String(n)]}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={7}
                      wrapperStyle={{ fontSize: 10, paddingTop: 6 }}
                      formatter={(v: string) => {
                        const item = metrics.coursesByCategory.find((c) => c.category === v);
                        const pct = item && totalCourses > 0
                          ? Math.round((item.count / totalCourses) * 100)
                          : 0;
                        return (
                          <span style={{ color: '#6b7280' }}>
                            {v} <strong style={{ color: '#374151' }}>{pct}%</strong>
                          </span>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Total centrado */}
                <div
                  className="pointer-events-none absolute inset-x-0 flex flex-col items-center"
                  style={{ top: '38%', transform: 'translateY(-50%)' }}
                >
                  <span className="text-[20px] font-bold leading-none text-gray-900">{totalCourses}</span>
                  <span className="mt-0.5 text-[10px] leading-none text-gray-400">cursos</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Tabla últimas ventas — con avatar del curso ── */}
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <p className="text-sm font-semibold text-gray-900">Últimas ventas</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#682222] text-left">
                    {['', 'Curso', 'Monto', 'Estado', 'Fecha'].map((h, i) => (
                      <th key={i} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white first:w-12">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metrics.recentSales.map((sale, idx) => (
                    <tr
                      key={sale.id}
                      className={cn(
                        'border-b border-gray-100 last:border-0 transition-colors hover:bg-[#f5eded]',
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#f9f9f9]',
                      )}
                    >
                      {/* Inicial del curso */}
                      <td className="px-4 py-3">
                        <span
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white"
                          style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                        >
                          {sale.courseName.charAt(0).toUpperCase()}
                        </span>
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3 font-medium text-gray-900">
                        {sale.courseName}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#682222]">
                        {formatPrice(sale.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <SaleStatusBadge status={sale.status} />
                      </td>
                      <td className="px-4 py-3 text-[#A9A9A9]">
                        {saleDateFmt.format(new Date(sale.date))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
