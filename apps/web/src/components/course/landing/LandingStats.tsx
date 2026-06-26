import type { Course } from '@cee/types';
import { LandingStat } from './LandingStat';
import { SectionHeading } from './SectionHeading';

interface LandingStatsProps {
  course: Course;
}

/**
 * Banda de indicadores de respaldo del CEE-FIIS. Combina un dato real del curso
 * (inscritos) con métricas institucionales genéricas y reutilizables.
 */
export function LandingStats({ course }: LandingStatsProps) {
  const stats = [
    { value: '+25', label: 'Años de experiencia formando profesionales' },
    {
      value: `${Math.max(course.enrolledCount, 0).toLocaleString('es-PE')}+`,
      label: 'Profesionales inscritos en este programa',
    },
    { value: '98%', label: 'Satisfacción de nuestros egresados' },
    { value: '+100', label: 'Docentes con experiencia en la industria' },
  ];

  return (
    <div>
      <SectionHeading
        eyebrow="Respaldo institucional"
        title="Una formación con trayectoria comprobada"
      />
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <LandingStat key={stat.label} value={stat.value} label={stat.label} />
        ))}
      </div>
    </div>
  );
}
