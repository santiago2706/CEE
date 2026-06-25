import { Link } from 'react-router-dom';
import { X, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

export function MemberPromo() {
  const { user, isAuthenticated, isLoading, isMemberPromoDismissed, dismissMemberPromo } =
    useAuth();

  if (isLoading) return null;
  if (!isAuthenticated || !user) return null;
  if (user.role === 'admin') return null;
  if (isMemberPromoDismissed) return null;

  return (
    <div className="relative bg-cee-red text-white">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 text-sm sm:px-6 lg:px-8">
        <Sparkles className="h-4 w-4 shrink-0 text-white/90" />
        <p className="flex-1">
          <span className="font-semibold">¡Beneficio exclusivo para ti, {user.name.split(' ')[0]}!</span>{' '}
          15% de descuento en tu próxima especialización con el código{' '}
          <span className="font-semibold">CEE-MIEMBRO</span>.{' '}
          <Link to={ROUTES.CATALOG} className="underline hover:no-underline">
            Ver programas
          </Link>
        </p>
        <button
          type="button"
          onClick={dismissMemberPromo}
          aria-label="Cerrar promoción"
          className="shrink-0 rounded-md p-1 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
