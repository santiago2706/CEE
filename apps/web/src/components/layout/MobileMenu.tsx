import { Link } from 'react-router-dom';
import { navigationLinks } from '@/config/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';

interface MobileMenuProps {
  onClose: () => void;
}

export function MobileMenu({ onClose }: MobileMenuProps) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="border-t bg-background px-4 py-4 md:hidden">
      <nav className="flex flex-col gap-3">
        {navigationLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="rounded-md px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-cee-red"
            onClick={onClose}
          >
            {link.label}
          </Link>
        ))}
        <Link
          to={isAuthenticated ? ROUTES.ADMIN : ROUTES.LOGIN}
          className="rounded-md bg-cee-red px-3 py-2 text-center text-sm font-semibold text-white"
          onClick={onClose}
        >
          {isAuthenticated ? 'Mi cuenta' : 'Iniciar sesion'}
        </Link>
      </nav>
    </div>
  );
}
