import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin } from 'lucide-react';
import { navigationLinks } from '@/config/navigation';
import { CONTACT_INFO } from '@/constants/contact.constants';

const socialLinks = [
  { label: 'Facebook', href: 'https://facebook.com', icon: Facebook },
  { label: 'Instagram', href: 'https://instagram.com', icon: Instagram },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin },
];

export function Footer() {
  return (
    <footer className="bg-cee-red text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-1">
          <p className="text-lg font-bold">Centro de Especialización Ejecutiva</p>
          <p className="mt-3 text-sm text-white/80">
            Formando líderes y profesionales a través de educación ejecutiva de primer nivel.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">
            Enlaces rápidos
          </h3>
          <nav className="mt-4 grid gap-2 text-sm">
            {navigationLinks.map((link) => (
              <Link key={link.path} to={link.path} className="text-white/80 hover:text-white">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">
            Contacto
          </h3>
          <div className="mt-4 grid gap-2 text-sm text-white/80">
            <p>{CONTACT_INFO.email}</p>
            <p>{CONTACT_INFO.phone}</p>
            <p>{CONTACT_INFO.address}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">
            Síguenos
          </h3>
          <div className="mt-4 flex gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="rounded-full border border-white/30 p-2 transition hover:bg-white/10"
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            &copy; {new Date().getFullYear()} Centro de Especialización Ejecutiva. Todos los
            derechos reservados.
          </p>
          <div className="flex gap-4">
            <Link to="#" className="hover:text-white">
              Política de Privacidad
            </Link>
            <Link to="#" className="hover:text-white">
              Términos de Servicio
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
