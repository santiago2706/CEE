import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: SectionHeadingProps) {
  const isCenter = align === 'center';

  return (
    <div className={cn(isCenter && 'text-center', className)}>
      {eyebrow && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cee-red">
          {eyebrow}
        </p>
      )}
      <h2 className={cn('text-xl font-bold tracking-tight sm:text-2xl', eyebrow && 'mt-1.5')}>
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'mt-2 text-sm text-muted-foreground',
            isCenter ? 'mx-auto max-w-2xl' : 'max-w-2xl',
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
