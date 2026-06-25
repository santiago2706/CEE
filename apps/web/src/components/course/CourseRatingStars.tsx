import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseRatingStarsProps {
  rating: number;
  className?: string;
}

/** Estrellas de calificación estilo marketplace (Udemy), en paleta de marca. */
export function CourseRatingStars({ rating, className }: CourseRatingStarsProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)} aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i + 1 <= Math.round(rating);
        return (
          <Star
            key={i}
            className={cn('h-4 w-4', filled ? 'fill-amber-500 text-amber-500' : 'text-border')}
          />
        );
      })}
    </div>
  );
}
