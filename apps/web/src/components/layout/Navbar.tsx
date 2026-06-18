import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, UserCircle } from 'lucide-react';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { navigationLinks } from '@/config/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to={ROUTES.HOME} className="text-xl font-bold text-cee-red">
          CEE-FIIS
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navigationLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                cn(
                  'text-sm font-medium text-muted-foreground transition hover:text-cee-red',
                  isActive && 'text-cee-red',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to={isAuthenticated ? ROUTES.ADMIN : ROUTES.LOGIN}
            className="hidden items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-secondary md:flex"
          >
            <UserCircle className="h-4 w-4" />
            {isAuthenticated ? 'Mi cuenta' : 'Iniciar sesion'}
          </Link>

          <button
            type="button"
            className="rounded-md p-2 text-muted-foreground hover:bg-secondary md:hidden"
            aria-label="Abrir menu"
            onClick={() => setIsOpen((value) => !value)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {isOpen ? <MobileMenu onClose={() => setIsOpen(false)} /> : null}
    </header>
  );
}
