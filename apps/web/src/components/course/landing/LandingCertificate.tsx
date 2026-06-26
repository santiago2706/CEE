import type { Course } from '@cee/types';
import { Award } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

interface LandingCertificateProps {
  course: Course;
}

const APPROVAL_REQUIREMENTS = [
  'Aprobar con la calificación mínima establecida por el programa.',
  'Cumplir con la asistencia mínima a las sesiones sincrónicas.',
  'Completar satisfactoriamente el proyecto integrador final.',
];

/** "La recompensa": certificado (de course.certification/academicHours) + requisitos de aprobación. */
export function LandingCertificate({ course }: LandingCertificateProps) {
  return (
    <div>
      <SectionHeading eyebrow="La recompensa" title="El respaldo de un certificado CEE-FIIS" />

      <div className="mt-6 grid items-center gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-gradient-to-br from-muted/60 to-card p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cee-red-700 to-cee-ink shadow-lg">
            <Award className="h-8 w-8 text-white" />
          </div>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-cee-red/70">
            Centro de Extensión
          </p>
          <p className="mt-1 text-xs font-bold text-foreground/80">
            Facultad de Ingeniería Industrial y de Sistemas
          </p>
          <div className="mx-auto my-3 h-px w-16 bg-cee-red/30" />
          <p className="text-base font-extrabold leading-tight text-foreground">{course.title}</p>
          <div className="mx-auto my-3 h-px w-16 bg-cee-red/30" />
          <p className="text-xs font-semibold text-muted-foreground">
            {course.academicHours} horas académicas
          </p>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">{course.certification}</p>
        </div>

        <div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            El Centro de Extensión de la FIIS-UNI es una institución de formación continua con
            amplia trayectoria. Un certificado CEE-FIIS es una señal clara de que fuiste formado
            bajo estándares académicos rigurosos por profesionales activos en la industria.
          </p>

          <div className="mt-6 rounded-xl border border-border bg-muted/40 p-5">
            <p className="text-sm font-bold text-foreground">Requisitos de aprobación</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {APPROVAL_REQUIREMENTS.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="font-bold text-cee-red">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
