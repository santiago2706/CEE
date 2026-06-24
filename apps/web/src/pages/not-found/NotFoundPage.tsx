import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export default function NotFoundPage() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-32 text-center sm:px-6 lg:px-8">
      <p className="text-6xl font-bold text-cee-red">404</p>
      <h1 className="mt-4 text-2xl">Página no encontrada</h1>
      <p className="mt-3 text-muted-foreground">
        La dirección que buscas no existe o fue movida.
      </p>
      <Link
        to={ROUTES.HOME}
        className="mt-8 rounded-md bg-cee-red px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Volver al inicio
      </Link>
    </section>
  );
}
