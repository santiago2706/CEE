import { Link } from 'react-router-dom';
import { BookOpen, Download, GraduationCap, Mail } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { BROCHURE_FILENAME, BROCHURE_URL } from '@/constants/brochure.constants';
import { ROUTES } from '@/constants/routes';

interface SideAction {
  label: string;
  icon: typeof BookOpen;
  href: string;
  isDownload?: boolean;
}

const ACTIONS: SideAction[] = [
  { label: 'Cursos', icon: BookOpen, href: ROUTES.CATALOG },
  { label: 'Programas', icon: GraduationCap, href: '#programas' },
  { label: 'Brochure', icon: Download, href: BROCHURE_URL, isDownload: true },
  { label: 'Contacto', icon: Mail, href: ROUTES.CONTACT },
];

interface ActionLinkProps {
  action: SideAction;
  className: string;
  children: React.ReactNode;
}

function ActionLink({ action, className, children }: ActionLinkProps) {
  const handleClick = () => {
    if (action.isDownload) {
      trackEvent('brochure_download', { file: BROCHURE_FILENAME, source: 'home_side_actions' });
    }
  };

  if (action.isDownload) {
    return (
      <a
        href={action.href}
        download={BROCHURE_FILENAME}
        target="_blank"
        rel="noreferrer"
        onClick={handleClick}
        aria-label={action.label}
        className={className}
      >
        {children}
      </a>
    );
  }

  if (action.href.startsWith('#')) {
    return (
      <a href={action.href} aria-label={action.label} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link to={action.href} aria-label={action.label} className={className}>
      {children}
    </Link>
  );
}

const DESKTOP_BUTTON_CLASS =
  'flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-cee-red text-white shadow-md transition-all hover:-translate-x-0.5 hover:bg-cee-red-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cee-red lg:h-12 lg:w-12';

const MOBILE_BUTTON_CLASS =
  'flex flex-col items-center gap-1 rounded-md px-3 py-1.5 text-[11px] font-medium text-white/85 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

/** Acciones principales de la Home a los costados (Tarea 10): columna fija en desktop, barra inferior en móvil. */
export function HomeSideActions() {
  return (
    <>
      <nav
        aria-label="Acciones principales"
        className="fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 lg:flex"
      >
        {ACTIONS.map((action) => (
          <span key={action.label} className="group relative">
            <ActionLink action={action} className={DESKTOP_BUTTON_CLASS}>
              <action.icon className="h-5 w-5" />
            </ActionLink>
            <span className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-foreground/90 px-2 py-1 text-xs text-background opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              {action.label}
            </span>
          </span>
        ))}
      </nav>

      <nav
        aria-label="Acciones principales"
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-white/10 bg-cee-ink/90 px-2 py-2 backdrop-blur-sm lg:hidden"
      >
        {ACTIONS.map((action) => (
          <ActionLink key={action.label} action={action} className={MOBILE_BUTTON_CLASS}>
            <action.icon className="h-5 w-5" />
            {action.label}
          </ActionLink>
        ))}
      </nav>
    </>
  );
}
