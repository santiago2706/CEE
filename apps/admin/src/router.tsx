import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import { PageLoader } from '@/components/PageLoader';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const CoursesListPage = lazy(() => import('@/pages/CoursesListPage'));
const CourseFormPage = lazy(() => import('@/pages/CourseFormPage'));
const SalesPage = lazy(() => import('@/pages/SalesPage'));
const AccessDeniedPage = lazy(() => import('@/pages/AccessDeniedPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));

function withSuspense(element: JSX.Element) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  { path: '/login', element: withSuspense(<LoginPage />) },
  { path: '/acceso-denegado', element: withSuspense(<AccessDeniedPage />) },
  {
    element: <ProtectedRoute requiredRole="admin" />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/', element: withSuspense(<DashboardPage />) },
          { path: '/cursos', element: withSuspense(<CoursesListPage />) },
          { path: '/cursos/nuevo', element: withSuspense(<CourseFormPage />) },
          { path: '/cursos/:id/editar', element: withSuspense(<CourseFormPage />) },
          { path: '/ventas', element: withSuspense(<SalesPage />) },
        ],
      },
    ],
  },
]);
