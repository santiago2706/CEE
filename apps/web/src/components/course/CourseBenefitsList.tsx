import { Check } from 'lucide-react';

interface CourseBenefitsListProps {
  items: string[];
}

export function CourseBenefitsList({ items }: CourseBenefitsListProps) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-6">
      <h2 className="text-xl font-semibold">Lo que aprenderás</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-cee-red" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
