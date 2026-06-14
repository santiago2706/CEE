import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ROUTES } from '@/constants/routes';
import { ProtectedRoute } from '@/router/ProtectedRoute';

const HomePage = lazy(() => import('@/pages/home/HomePage'));
const CatalogPage = lazy(() => import('@/pages/catalog/CatalogPage'));
const CoursePage = lazy(() => import('@/pages/course/CoursePage'));
const AboutPage = lazy(() => import('@/pages/about/AboutPage'));
const MultimediaPage = lazy(() => import('@/pages/multimedia/MultimediaPage'));
const ContactPage = lazy(() => import('@/pages/contact/ContactPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage'));
const CoursesAdminPage = lazy(() => import('@/pages/admin/CoursesAdminPage'));
const SalesPage = lazy(() => import('@/pages/admin/SalesPage'));

function withSuspense(element: JSX.Element) {
  return <Suspense fallback={<div className="p-8">Cargando...</div>}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: ROUTES.HOME, element: withSuspense(<HomePage />) },
      { path: ROUTES.CATALOG, element: withSuspense(<CatalogPage />) },
      { path: ROUTES.COURSE, element: withSuspense(<CoursePage />) },
      { path: ROUTES.ABOUT, element: withSuspense(<AboutPage />) },
      { path: ROUTES.MULTIMEDIA, element: withSuspense(<MultimediaPage />) },
      { path: ROUTES.CONTACT, element: withSuspense(<ContactPage />) },
      { path: ROUTES.LOGIN, element: withSuspense(<LoginPage />) },
      { path: ROUTES.REGISTER, element: withSuspense(<RegisterPage />) },
      {
        element: <ProtectedRoute requiredRole="admin" />,
        children: [
          { path: ROUTES.ADMIN, element: withSuspense(<DashboardPage />) },
          { path: ROUTES.ADMIN_COURSES, element: withSuspense(<CoursesAdminPage />) },
          { path: ROUTES.ADMIN_SALES, element: withSuspense(<SalesPage />) },
        ],
      },
    ],
  },
]);
