import type { SyllabusModule } from '@cee/types';
import { Sparkles } from 'lucide-react';
import { SyllabusAccordion } from '@/components/course/SyllabusAccordion';
import { SectionHeading } from './SectionHeading';

interface LandingSyllabusProps {
  modules: SyllabusModule[];
}

/** Plan de estudios (reutiliza SyllabusAccordion) + banner de proyecto integrador genérico. */
export function LandingSyllabus({ modules }: LandingSyllabusProps) {
  return (
    <div>
      <SectionHeading
        eyebrow="Plan de estudios"
        title="Contenido del programa"
        description="Metodología Learning by Doing: cada sesión combina fundamentos conceptuales con la resolución de casos y proyectos aplicados."
      />

      {modules.length > 0 && (
        <div className="mt-6">
          <SyllabusAccordion modules={modules} />
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-xl bg-gradient-to-br from-cee-red-900 via-cee-red-700 to-cee-ink p-6 text-white shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold">Proyecto integrador final</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-white/85">
              Aplicarás todo lo aprendido en un proyecto final con un caso real del sector, el
              mismo tipo de entregable que una empresa esperaría de un profesional senior.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
