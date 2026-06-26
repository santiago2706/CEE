import { CheckCircle2 } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

interface LandingStudentProfileProps {
  graduateProfile: string[];
}

const PREREQUISITES = [
  'Formación técnica o universitaria en áreas afines al programa.',
  'Interés genuino por aplicar lo aprendido en un entorno profesional real.',
  'Disponibilidad para participar en las sesiones y actividades prácticas.',
];

/** "Perfil del egresado" (de course.graduateProfile) + requisitos genéricos reutilizables. */
export function LandingStudentProfile({ graduateProfile }: LandingStudentProfileProps) {
  return (
    <div>
      <SectionHeading
        eyebrow="¿Es para ti?"
        title="Perfil del egresado"
        description="Al concluir el programa, te integrarás a un perfil profesional con alta demanda en el mercado."
      />

      {graduateProfile.length > 0 && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {graduateProfile.map((profile, index) => (
            <div
              key={profile}
              className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-4"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cee-red text-sm font-bold text-white">
                {index + 1}
              </div>
              <p className="pt-1 text-sm text-foreground">{profile}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-cee-red/20 bg-cee-red/5 p-5 sm:p-6">
        <h3 className="text-base font-bold text-foreground">Requisitos previos</h3>
        <ul className="mt-3 space-y-2.5">
          {PREREQUISITES.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cee-red" />
              <span className="text-sm text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
