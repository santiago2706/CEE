interface InstitutionalLogosProps {
  variant?: 'mono' | 'color';
  className?: string;
}

const BACKERS = ['UNI', 'FIIS', 'CCAT'];

/**
 * Placeholder de logos de respaldo institucional (co-branding CEE+UNI).
 * Reemplazar por los SVG oficiales cuando el CEE/UNI los entregue (ver REBRANDING.md, Parte 6).
 */
export function InstitutionalLogos({ variant = 'color', className }: InstitutionalLogosProps) {
  return (
    <div className={`flex flex-wrap items-center gap-4 sm:gap-6 ${className ?? ''}`}>
      {BACKERS.map((name) => (
        <span
          key={name}
          className={
            variant === 'mono'
              ? 'flex h-10 items-center rounded-md border border-white/30 px-4 text-sm font-semibold tracking-wide text-white/80'
              : 'flex h-10 items-center rounded-md border border-border px-4 text-sm font-semibold tracking-wide text-muted-foreground'
          }
        >
          {name}
        </span>
      ))}
    </div>
  );
}
