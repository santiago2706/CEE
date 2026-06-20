import type { SalesTrendPoint } from '@cee/types';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatPrice } from '@/lib/utils';

interface SalesTrendChartProps {
  data: SalesTrendPoint[];
}

export function SalesTrendChart({ data }: SalesTrendChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" width={70} />
          <Tooltip
            formatter={(value) => formatPrice(Number(value))}
            contentStyle={{ borderRadius: 8, borderColor: 'hsl(var(--border))' }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#8B1A1A"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
