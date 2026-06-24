import { useCountUp } from '@/hooks/useCountUp';

interface StatCounterProps {
  value: string;
}

export function StatCounter({ value }: StatCounterProps) {
  const ref = useCountUp(value);
  return (
    <p ref={ref} className="text-4xl font-bold text-cee-red">
      0
    </p>
  );
}
