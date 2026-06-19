import type { LucideIcon } from 'lucide-react';

interface ValueCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function ValueCard({ icon: Icon, title, description }: ValueCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 text-center transition hover:shadow-lg">
      <div className="mb-4 flex justify-center">
        <div className="rounded-full bg-cee-red/10 p-3">
          <Icon className="h-6 w-6 text-cee-red" />
        </div>
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}