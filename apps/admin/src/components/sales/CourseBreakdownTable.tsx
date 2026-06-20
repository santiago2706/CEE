import type { CourseSalesBreakdown } from '@cee/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatPrice } from '@/lib/utils';

const dateFormatter = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short' });

interface CourseBreakdownTableProps {
  data: CourseSalesBreakdown[];
}

export function CourseBreakdownTable({ data }: CourseBreakdownTableProps) {
  const sorted = [...data].sort((a, b) => b.revenue - a.revenue);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Curso</TableHead>
          <TableHead>Ventas</TableHead>
          <TableHead>Ingresos</TableHead>
          <TableHead>Última venta</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((item) => (
          <TableRow key={item.courseId}>
            <TableCell className="font-medium">{item.courseName}</TableCell>
            <TableCell>{item.salesCount}</TableCell>
            <TableCell>{formatPrice(item.revenue)}</TableCell>
            <TableCell>{dateFormatter.format(new Date(item.lastTransaction))}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
