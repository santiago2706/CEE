import { Link } from 'react-router-dom';
import { BrochureDownloadButton } from '@/components/shared/BrochureDownloadButton';
import { ROUTES } from '@/constants/routes';

export function AboutSection() {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-cee-red">Nosotros</p>
        <h2 className="mt-1 text-2xl sm:text-3xl">Impulsa tu carrera, lidera tu futuro</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          El Centro de Especialización Ejecutiva nace de la Facultad de Ingeniería Industrial y de
          Sistemas de la Universidad Nacional de Ingeniería para formar profesionales capaces de
          liderar la transformación de sus organizaciones, integrando teoría y práctica en cada
          programa.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to={ROUTES.ABOUT}
            className="inline-block rounded-md border-2 border-cee-red px-5 py-2.5 text-sm font-semibold text-cee-red transition-colors duration-200 hover:bg-cee-red hover:text-white"
          >
            Conocer más sobre el CEE
          </Link>
          <BrochureDownloadButton variant="solid" />
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-lg shadow-lg [clip-path:polygon(0_0,100%_0,100%_92%,92%_100%,0_100%)]"
        style={{ aspectRatio: '4 / 3' }}
      >
        <img
          src="https://acreditacion.uni.edu.pe/wp-content/uploads/2025/10/250926-FIEE-2-720x340.jpg"
          alt="Instalaciones de la FIIS-UNI"
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-[rgba(104,34,34,0.35)]" />
      </div>
    </div>
  );
}
