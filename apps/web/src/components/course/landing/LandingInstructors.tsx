import type { Instructor } from '@cee/types';
import { TeacherCard } from '@/components/course/TeacherCard';
import { SectionHeading } from './SectionHeading';

interface LandingInstructorsProps {
  instructors: Instructor[];
}

/** "Plana docente" (reutiliza TeacherCard). */
export function LandingInstructors({ instructors }: LandingInstructorsProps) {
  if (instructors.length === 0) return null;

  return (
    <div>
      <SectionHeading
        eyebrow="Autoridad y respaldo"
        title="Aprende de profesionales activos en la industria"
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {instructors.map((instructor) => (
          <TeacherCard key={instructor.id} instructor={instructor} />
        ))}
      </div>
    </div>
  );
}
