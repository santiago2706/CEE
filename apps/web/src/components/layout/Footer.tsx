import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { BrochureDownloadButton } from '@/components/shared/BrochureDownloadButton';
import { navigationLinks } from '@/config/navigation';
import { CONTACT_INFO } from '@/constants/contact.constants';
import { ROUTES } from '@/constants/routes';
import { useConsentStore } from '@/store/consentStore';

const socialLinks = [
  { label: 'Facebook', href: 'https://facebook.com', icon: Facebook },
  { label: 'Instagram', href: 'https://instagram.com', icon: Instagram },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin },
  { label: 'YouTube', href: 'https://youtube.com', icon: Youtube },
];

export function Footer() {
  const reopenConsent = useConsentStore((s) => s.reopen);

  return (
    <footer className="bg-gradient-to-b from-cee-red to-cee-red-dark text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-12 lg:px-8">
        <div className="md:col-span-4">
          <p className="logo-wordmark text-lg font-bold">Centro de Especialización Ejecutiva</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/75">
            Formando líderes y profesionales a través de educación ejecutiva de primer nivel,
            respaldada por la FIIS-UNI.
          </p>

          <div className="mt-6 flex gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="rounded-full border border-white/25 p-2 text-white/80 transition-all hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-cee-red"
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>

          <BrochureDownloadButton
            variant="outline"
            className="mt-6 border-white/40 text-white hover:border-white hover:bg-white hover:text-cee-red"
          />
        </div>

        <div className="md:col-span-2 md:col-start-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/60">
            Enlaces rápidos
          </h3>
          <nav className="mt-4 grid gap-2.5 text-sm">
            {navigationLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-white/80 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="md:col-span-4 md:col-start-9">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/60">
            Contacto
          </h3>
          <div className="mt-4 grid gap-3 text-sm text-white/80">
            <a
              href={`mailto:${CONTACT_INFO.email}`}
              className="flex items-start gap-2.5 transition-colors hover:text-white"
            >
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
              {CONTACT_INFO.email}
            </a>
            <a
              href={CONTACT_INFO.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-2.5 transition-colors hover:text-white"
            >
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
              {CONTACT_INFO.phone}
            </a>
            <p className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
              {CONTACT_INFO.address}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            &copy; {new Date().getFullYear()} Centro de Especialización Ejecutiva. Todos los
            derechos reservados.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link to={ROUTES.PRIVACY} className="transition-colors hover:text-white">
              Política de Privacidad
            </Link>
            <Link to={ROUTES.TERMS} className="transition-colors hover:text-white">
              Términos y Condiciones
            </Link>
            <Link to={ROUTES.COOKIES} className="transition-colors hover:text-white">
              Política de Cookies
            </Link>
            <button
              type="button"
              onClick={reopenConsent}
              className="text-inherit text-left transition-colors hover:text-white"
            >
              Preferencias de cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
