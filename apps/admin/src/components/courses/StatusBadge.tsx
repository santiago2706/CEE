import type { CourseStatus } from '@cee/types';
import { Badge } from '@/components/ui/badge';
import { COURSE_STATUS_LABELS } from '@/constants/courseStatus';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<CourseStatus, string> = {
  published: 'border-emerald-200 bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
  draft: 'border-neutral-200 bg-neutral-100 text-neutral-700 hover:bg-neutral-100',
  review: 'border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-100',
};

interface StatusBadgeProps {
  status: CourseStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge className={cn(STATUS_STYLES[status])}>{COURSE_STATUS_LABELS[status]}</Badge>;
}
