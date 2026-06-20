import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { PageLoader } from '@/components/shared/PageLoader';
import { ROUTES } from '@/constants/routes';

const HomePage = lazy(() => import('@/pages/home/HomePage'));
const CatalogPage = lazy(() => import('@/pages/catalog/CatalogPage'));
const CoursePage = lazy(() => import('@/pages/course/CoursePage'));
const AboutPage = lazy(() => import('@/pages/about/AboutPage'));
const MultimediaPage = lazy(() => import('@/pages/multimedia/MultimediaPage'));
const ContactPage = lazy(() => import('@/pages/contact/ContactPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const NotFoundPage = lazy(() => import('@/pages/not-found/NotFoundPage'));

function withSuspense(element: JSX.Element) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>;
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
      { path: '*', element: withSuspense(<NotFoundPage />) },
    ],
  },
]);
