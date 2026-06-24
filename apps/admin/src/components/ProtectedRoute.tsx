import { Navigate, Outlet } from 'react-router-dom';
import { PageLoader } from '@/components/PageLoader';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  requiredRole?: 'admin';
}

export function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/acceso-denegado" replace />;
  }

  return <Outlet />;
}
