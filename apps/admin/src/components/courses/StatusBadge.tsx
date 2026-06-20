import type { CourseStatus } from '@cee/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<CourseStatus, { label: string; className: string }> = {
  published: { label: 'Publicado', className: 'border-emerald-200 bg-emerald-100 text-emerald-800 hover:bg-emerald-100' },
  draft: { label: 'Borrador', className: 'border-neutral-200 bg-neutral-100 text-neutral-700 hover:bg-neutral-100' },
  review: { label: 'En Revisión', className: 'border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-100' },
};

interface StatusBadgeProps {
  status: CourseStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return <Badge className={cn(config.className)}>{config.label}</Badge>;
}
