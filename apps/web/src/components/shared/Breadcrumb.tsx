import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  variant?: 'light' | 'dark';
}

export function Breadcrumb({ items, variant = 'light' }: BreadcrumbProps) {
  const isDark = variant === 'dark';

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-1 text-sm', isDark ? 'text-white/70' : 'text-muted-foreground')}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <Fragment key={item.label}>
            {item.path && !isLast ? (
              <Link to={item.path} className={cn('hover:text-cee-red', isDark && 'hover:text-white')}>
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  isLast && 'font-medium',
                  isLast && (isDark ? 'text-white' : 'text-foreground'),
                )}
              >
                {item.label}
              </span>
            )}
            {!isLast ? <ChevronRight className="h-4 w-4" /> : null}
          </Fragment>
        );
      })}
    </nav>
  );
}
