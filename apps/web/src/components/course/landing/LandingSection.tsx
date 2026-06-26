import type { ReactNode } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

interface LandingSectionProps {
  id?: string;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
  /** Cuando es true no aplica el reveal de scroll (útil para contenedores que ya animan a sus hijos). */
  disableReveal?: boolean;
}

/**
 * Envoltura de sección de la landing con animación sutil de entrada
 * (fade + slide). Respeta prefers-reduced-motion mediante useScrollReveal.
 */
export function LandingSection({
  id,
  className,
  ariaLabel,
  children,
  disableReveal = false,
}: LandingSectionProps) {
  const revealRef = useScrollReveal<HTMLElement>();

  return (
    <section
      ref={disableReveal ? undefined : revealRef}
      id={id}
      aria-label={ariaLabel}
      className={cn('scroll-mt-20', className)}
    >
      {children}
    </section>
  );
}
