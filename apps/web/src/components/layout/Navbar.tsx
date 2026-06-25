import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { TeachersMenu } from '@/components/layout/TeachersMenu';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { navigationLinks } from '@/config/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { authService } from '@/services/auth.service';
import { cn, getInitials } from '@/lib/utils';
import logoMark from '@/assets/icons/logo2.svg';
import uniLogo from '@/assets/icons/uni-logo.png';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { success } = useToast();

  const handleLogout = () => {
    authService.logout();
    success('Sesión cerrada', 'Vuelve pronto.');
    navigate(ROUTES.HOME);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to={ROUTES.HOME} className="flex items-center gap-3">
          <img src={logoMark} alt="CEE-FIIS" className="h-10 w-auto" />
          <span className="hidden h-8 w-px bg-border sm:block" aria-hidden="true" />
          <img
            src={uniLogo}
            alt="Universidad Nacional de Ingeniería"
            className="hidden h-8 w-auto object-contain sm:block"
          />
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
          <TeachersMenu />

          <Button asChild variant="outline" size="sm" className="hidden gap-2 md:inline-flex">
            <Link to={isAuthenticated ? ROUTES.HOME : ROUTES.LOGIN}>
              {isAuthenticated && user ? (
                <Avatar src={user.avatarUrl} alt={user.name} fallback={getInitials(user.name)} className="h-5 w-5" />
              ) : null}
              {isAuthenticated ? 'Mi Perfil' : 'Iniciar sesion'}
            </Link>
          </Button>

          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex"
              aria-label="Cerrar sesión"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Abrir menu"
            onClick={() => setIsOpen((value) => !value)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <MobileMenu open={isOpen} onClose={() => setIsOpen(false)} />
    </header>
  );
}
