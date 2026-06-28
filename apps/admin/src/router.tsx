import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import { PageLoader } from '@/components/PageLoader';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const CoursesListPage = lazy(() => import('@/pages/CoursesListPage'));
const CourseFormPage = lazy(() => import('@/pages/CourseFormPage'));
const BenefitsListPage = lazy(() => import('@/pages/BenefitsListPage'));
const BenefitFormPage = lazy(() => import('@/pages/BenefitFormPage'));
const SalesPage = lazy(() => import('@/pages/SalesPage'));
const SaleFormPage = lazy(() => import('@/pages/SaleFormPage'));
const EventsPage = lazy(() => import('@/pages/events/EventsPage'));
const EventFormPage = lazy(() => import('@/pages/events/EventFormPage'));
const EventRegistrationsPage = lazy(() => import('@/pages/events/EventRegistrationsPage'));
const CertificatesPage = lazy(() => import('@/pages/CertificatesPage'));
const CertificateFormPage = lazy(() => import('@/pages/CertificateFormPage'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));
const SecretariaChat = lazy(() => import('@/pages/SecretariaChat'));
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
          { path: '/eventos', element: withSuspense(<EventsPage />) },
          { path: '/eventos/nuevo', element: withSuspense(<EventFormPage />) },
          { path: '/eventos/:id/editar', element: withSuspense(<EventFormPage />) },
          { path: '/eventos/:id/inscritos', element: withSuspense(<EventRegistrationsPage />) },
          { path: '/beneficios', element: withSuspense(<BenefitsListPage />) },
          { path: '/beneficios/nuevo', element: withSuspense(<BenefitFormPage />) },
          { path: '/beneficios/:id/editar', element: withSuspense(<BenefitFormPage />) },
          { path: '/ventas', element: withSuspense(<SalesPage />) },
          { path: '/ventas/nueva', element: withSuspense(<SaleFormPage />) },
          { path: '/certificados', element: withSuspense(<CertificatesPage />) },
          { path: '/certificados/nuevo', element: withSuspense(<CertificateFormPage />) },
          { path: '/notificaciones', element: withSuspense(<NotificationsPage />) },
          { path: '/asistente', element: withSuspense(<SecretariaChat />) },
        ],
      },
    ],
  },
]);
