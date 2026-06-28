import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  onNext: () => void;
  onPrev: () => void;
}

export function Pagination({ page, totalPages, hasNext, hasPrev, onNext, onPrev }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-5 py-3">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrev}
        disabled={!hasPrev}
        className="h-8 gap-1 border-gray-200 text-xs hover:border-[#682222] hover:text-[#682222] disabled:opacity-40"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Anterior
      </Button>
      <span className="min-w-[90px] text-center text-xs text-[#A9A9A9]">
        Página {page} de {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={!hasNext}
        className="h-8 gap-1 border-gray-200 text-xs hover:border-[#682222] hover:text-[#682222] disabled:opacity-40"
      >
        Siguiente
        <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
