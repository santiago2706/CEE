import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { PageLoader } from '@/components/shared/PageLoader';
import { ROUTES } from '@/constants/routes';

const HomePage = lazy(() => import('@/pages/home/HomePage'));
const CatalogPage = lazy(() => import('@/pages/catalog/CatalogPage'));
const CoursePage = lazy(() => import('@/pages/course/CoursePage'));
const AboutPage = lazy(() => import('@/pages/about/AboutPage'));
const BlogPage = lazy(() => import('@/pages/blog/BlogPage'));
const BlogPostPage = lazy(() => import('@/pages/blog/BlogPostPage'));
const MultimediaPage = lazy(() => import('@/pages/multimedia/MultimediaPage'));
const ProfessorsPage = lazy(() => import('@/pages/professors/ProfessorsPage'));
const TeacherProfilePage = lazy(() => import('@/pages/teachers/TeacherProfilePage'));
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'));
const ContactPage = lazy(() => import('@/pages/contact/ContactPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const PrivacyPolicyPage = lazy(() => import('@/pages/legal/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('@/pages/legal/TermsPage'));
const CookiePolicyPage = lazy(() => import('@/pages/legal/CookiePolicyPage'));
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
      { path: ROUTES.BLOG, element: withSuspense(<BlogPage />) },
      { path: ROUTES.BLOG_POST, element: withSuspense(<BlogPostPage />) },
      { path: ROUTES.MULTIMEDIA, element: withSuspense(<MultimediaPage />) },
      { path: ROUTES.PROFESSORS, element: withSuspense(<ProfessorsPage />) },
      { path: ROUTES.TEACHER_PROFILE, element: withSuspense(<TeacherProfilePage />) },
      { path: ROUTES.PROFILE, element: withSuspense(<ProfilePage />) },
      { path: ROUTES.CONTACT, element: withSuspense(<ContactPage />) },
      { path: ROUTES.LOGIN, element: withSuspense(<LoginPage />) },
      { path: ROUTES.REGISTER, element: withSuspense(<RegisterPage />) },
      { path: ROUTES.PRIVACY, element: withSuspense(<PrivacyPolicyPage />) },
      { path: ROUTES.TERMS, element: withSuspense(<TermsPage />) },
      { path: ROUTES.COOKIES, element: withSuspense(<CookiePolicyPage />) },
      { path: '*', element: withSuspense(<NotFoundPage />) },
    ],
  },
]);
