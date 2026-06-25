import { Award, Users, Lightbulb, Target } from 'lucide-react';
import { ValueCard } from '@/components/about/ValueCard';
import { StatsCounter } from '@/components/shared/StatsCounter';
import { InstitutionalLogos } from '@/components/shared/InstitutionalLogos';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const VALUES = [
  {
    icon: Award,
    title: 'Excelencia',
    description:
      'Comprometidos con la más alta calidad en educación ejecutiva y desarrollo profesional',
  },
  {
    icon: Users,
    title: 'Comunidad',
    description:
      'Fomentamos una red de profesionales que comparten experiencias y conocimientos',
  },
  {
    icon: Lightbulb,
    title: 'Innovación',
    description:
      'Adaptamos constantemente nuestros programas a las tendencias del mercado global',
  },
  {
    icon: Target,
    title: 'Impacto',
    description: 'Generamos líderes que transforman sus organizaciones y comunidades',
  },
];

export default function AboutPage() {
  const statsGridRef = useScrollReveal<HTMLDivElement>({ selector: ':scope > *' });
  const valuesGridRef = useScrollReveal<HTMLDivElement>({ selector: ':scope > *' });

  return (
    <>
      <section className="border-b-4 border-cee-gray bg-gradient-to-br from-cee-red-900 via-cee-red-700 to-cee-ink text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <h1 className="text-4xl leading-tight sm:text-5xl">
            Centro de Especialización Ejecutiva
          </h1>
          <p className="mt-3 text-xl font-semibold italic text-white/95 sm:text-2xl">
            "Impulsa tu carrera, lidera tu futuro"
          </p>
          <p className="mt-4 text-lg text-white/90">
            Formando líderes y profesionales a través de educación ejecutiva de primer nivel desde
            1999, en alianza con la Universidad Nacional de Ingeniería (UNI) y la Facultad de
            Ingeniería Industrial y de Sistemas (FIIS)
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
          <div>
            <h2 className="text-3xl">Misión</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Formar profesionales ejecutivos de excelencia a través de programas innovadores que
              integren teoría y práctica, fomentando el desarrollo integral del talento y su
              impacto en la transformación de organizaciones
            </p>

            <h3 className="mt-8 text-2xl">Visión</h3>
            <p className="mt-4 text-lg text-muted-foreground">
              Ser el referente de educación ejecutiva en América Latina, reconocido por la calidad
              de sus programas, la excelencia de sus docentes y el impacto de sus egresados en la
              comunidad empresarial global
            </p>
          </div>

          <div
            className="relative overflow-hidden rounded-lg shadow-lg [clip-path:polygon(0_0,100%_0,100%_92%,92%_100%,0_100%)]"
            style={{ aspectRatio: '4 / 3' }}
          >
            <img
              src="https://acreditacion.uni.edu.pe/wp-content/uploads/2025/10/250926-FIEE-2-720x340.jpg"
              alt="Aula del CEE"
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-[rgba(104,34,34,0.35)]" />
          </div>
        </div>
      </section>

      <section className="bg-muted py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl">Historia del CEE</h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-lg text-muted-foreground">
            Desde 1999, el Centro de Especialización Ejecutiva ha sido pionero en la formación de
            profesionales de alto nivel. Nacido como una iniciativa de la Facultad de Ingeniería
            Industrial y de Sistemas de la Universidad Nacional de Ingeniería, el CEE ha
            evolucionado para convertirse en un ícono de educación ejecutiva en el país
          </p>

          <StatsCounter ref={statsGridRef} className="mt-12" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl">Nuestros Valores</h2>
        <p className="mx-auto mt-4 max-w-3xl text-center text-lg text-muted-foreground">
          Los principios que guían nuestro trabajo y definen nuestra identidad
        </p>
        <div ref={valuesGridRef} className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value) => (
            <ValueCard key={value.title} {...value} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 pb-24 text-center sm:px-6 sm:pb-24 lg:px-8">
        <h2 className="text-3xl">Respaldo institucional</h2>
        <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
          El CEE opera con el respaldo de la Universidad Nacional de Ingeniería y sus instancias
          académicas
        </p>
        <div className="mt-10 flex justify-center">
          <InstitutionalLogos />
        </div>
      </section>
    </>
  );
}
