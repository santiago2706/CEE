import { DollarSign, Percent, ShoppingBag } from 'lucide-react';
import { CourseBreakdownTable } from '@/components/sales/CourseBreakdownTable';
import { SalesTrendChart } from '@/components/sales/SalesTrendChart';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { Card, CardContent } from '@/components/ui/card';
import { useSales } from '@/hooks/useSales';
import { formatPrice } from '@/lib/utils';
import type { SalesDateRange } from '@/services/salesService';

const RANGE_OPTIONS: { value: SalesDateRange; label: string }[] = [
  { value: 'week', label: 'Última semana' },
  { value: 'month', label: 'Último mes' },
  { value: 'quarter', label: 'Último trimestre' },
];

export default function SalesPage() {
  const { report, isLoading, range, setRange } = useSales();

  return (
    <section className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Ventas</h1>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as SalesDateRange)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          {RANGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading || !report ? (
        <p className="text-muted-foreground">Cargando reporte de ventas...</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryCard
              icon={ShoppingBag}
              label="Total Ventas"
              value={report.kpis.totalSales}
              trend={report.kpis.salesDeltaPct}
            />
            <SummaryCard
              icon={DollarSign}
              label="Ingresos"
              value={formatPrice(report.kpis.totalRevenue)}
              trend={report.kpis.revenueDeltaPct}
            />
            <SummaryCard
              icon={Percent}
              label="Tasa de Conversión"
              value={`${report.kpis.conversionRate}%`}
              trend={report.kpis.conversionDeltaPct}
            />
          </div>

          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold">Tendencia de ventas</h2>
              <div className="mt-4">
                <SalesTrendChart data={report.trend} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold">Desglose por curso</h2>
              <div className="mt-4">
                <CourseBreakdownTable data={report.breakdown} />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </section>
  );
}
