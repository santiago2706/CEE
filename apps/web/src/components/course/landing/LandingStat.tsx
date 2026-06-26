import { useCountUp } from '@/hooks/useCountUp';

interface LandingStatProps {
  value: string;
  label: string;
}

/** Métrica individual con contador animado (respeta prefers-reduced-motion vía useCountUp). */
export function LandingStat({ value, label }: LandingStatProps) {
  const counterRef = useCountUp(value);

  return (
    <div className="rounded-xl border border-border bg-card p-5 text-center shadow-sm">
      <p ref={counterRef} className="text-3xl font-extrabold text-cee-red">
        {value}
      </p>
      <p className="mt-1.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
