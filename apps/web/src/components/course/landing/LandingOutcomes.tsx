import { SectionHeading } from './SectionHeading';

interface LandingOutcomesProps {
  items: string[];
}

/** "Lo que lograrás" — derivado de course.benefits. */
export function LandingOutcomes({ items }: LandingOutcomesProps) {
  if (items.length === 0) return null;

  return (
    <div>
      <SectionHeading
        eyebrow="Lo que lograrás"
        title="Al finalizar este programa serás capaz de:"
      />
      <div className="mt-6 space-y-3">
        {items.map((item, index) => (
          <div
            key={item}
            className="flex items-start gap-3 rounded-lg border-l-4 border-cee-red bg-gradient-to-r from-cee-red/5 to-transparent p-4"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cee-red text-sm font-bold text-white shadow-sm">
              {index + 1}
            </div>
            <p className="pt-1 text-sm font-medium text-foreground">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
