import { useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { CourseSidebar } from '@/components/course/CourseSidebar';
import { SyllabusAccordion } from '@/components/course/SyllabusAccordion';
import { TeacherCard } from '@/components/course/TeacherCard';
import { ROUTES } from '@/constants/routes';
import { useCourseDetail } from '@/hooks/useCourseDetail';
import { CATEGORY_GRADIENTS } from '@/constants/category-gradients';

export default function CoursePage() {
  const { slug } = useParams<{ slug: string }>();
  const { course, isLoading, error } = useCourseDetail(slug);

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-muted-foreground">Cargando curso...</p>
      </section>
    );
  }

  if (error || !course) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Curso no encontrado</h1>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: 'Inicio', path: ROUTES.HOME },
          { label: 'Programas', path: ROUTES.CATALOG },
          { label: course.title },
        ]}
      />

      <div
        className="mt-6 w-full overflow-hidden rounded-lg bg-cover bg-center"
        style={{ aspectRatio: '16 / 9', backgroundImage: CATEGORY_GRADIENTS[course.category] }}
      >
        <img
          src={course.imageUrl}
          alt={course.title}
          className="h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          <div>
            <Badge className="mb-3">{course.category}</Badge>
            <h1 className="text-3xl sm:text-4xl">{course.title}</h1>
            <p className="mt-4 text-muted-foreground">{course.description}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Perfil del egresado</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              {course.graduateProfile.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Sílabo</h2>
            <div className="mt-3">
              <SyllabusAccordion modules={course.syllabus} />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Plana docente</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {course.instructors.map((instructor) => (
                <TeacherCard key={instructor.id} instructor={instructor} />
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <CourseSidebar course={course} />
        </div>
      </div>
    </section>
  );
}
