import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

const links = [
  { href: ROUTES.HOME, label: 'Inicio' },
  { href: ROUTES.CATALOG, label: 'Programas' },
  { href: ROUTES.MULTIMEDIA, label: 'Multimedia' },
  { href: ROUTES.ABOUT, label: 'Nosotros' },
  { href: ROUTES.CONTACT, label: 'Contacto' },
];

export function Footer() {
  return (
    <footer className="bg-neutral-950 text-neutral-100">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="text-lg font-bold">CEE-FIIS</p>
          <p className="mt-3 text-sm text-neutral-400">
            Centro de Especializacion Ejecutiva.
          </p>
        </div>
        <nav className="grid gap-2 text-sm">
          {links.map((link) => (
            <Link key={link.href} to={link.href} className="text-neutral-300 hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="text-sm text-neutral-400">
          <p>contacto@cee-fiis.edu.pe</p>
          <p className="mt-6">
            &copy; {new Date().getFullYear()} CEE-FIIS. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
