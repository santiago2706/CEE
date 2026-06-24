import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { CourseCategory, CourseModality, CourseStatus } from '@cee/types';
import { Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { COURSE_STATUS_OPTIONS } from '@/constants/courseStatus';
import { useToast } from '@/hooks/useToast';
import { coursesService, type CourseFormInput } from '@/services/coursesService';

const CATEGORY_OPTIONS: CourseCategory[] = [
  'Ingeniería',
  'Gestión',
  'Tecnología',
  'Habilidades Blandas',
  'Finanzas',
];

const MODALITY_OPTIONS: CourseModality[] = ['Presencial', 'Virtual', 'Híbrido'];

const MAX_FILE_SIZE_MB = 10;

interface FormValues {
  title: string;
  description: string;
  price: string;
  category: CourseCategory | '';
  modality: CourseModality;
  moodleCourseId: string;
  status: CourseStatus;
}

const INITIAL_VALUES: FormValues = {
  title: '',
  description: '',
  price: '',
  category: '',
  modality: 'Virtual',
  moodleCourseId: '',
  status: 'draft',
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

function fileNameFromUrl(url: string) {
  return url.split('/').pop() ?? url;
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (values.title.trim().length < 3) {
    errors.title = 'El nombre debe tener al menos 3 caracteres.';
  }
  if (values.description.trim().length < 10) {
    errors.description = 'La descripción debe tener al menos 10 caracteres.';
  }
  const price = Number(values.price);
  if (!values.price.trim() || Number.isNaN(price) || price <= 0) {
    errors.price = 'Ingresa un precio numérico mayor a 0.';
  }
  if (!values.category) {
    errors.category = 'Selecciona una categoría.';
  }
  const moodleId = Number(values.moodleCourseId.trim());
  if (!values.moodleCourseId.trim() || Number.isNaN(moodleId)) {
    errors.moodleCourseId = 'Ingresa un Moodle Course ID numérico válido.';
  }

  return errors;
}

export default function CourseFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { success, error } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [syllabusFileName, setSyllabusFileName] = useState<string | null>(null);
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(isEditMode);
  const [loadError, setLoadError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditMode || !id) {
      return;
    }

    let isMounted = true;
    coursesService
      .getCourseById(id)
      .then((response) => {
        if (!isMounted) return;
        const course = response.data;
        setValues({
          title: course.title,
          description: course.description,
          price: String(course.price),
          category: course.category,
          modality: course.modality,
          moodleCourseId: course.moodleCourseId != null ? String(course.moodleCourseId) : '',
          status: course.status,
        });
        setSyllabusFileName(course.syllabusPdfUrl ? fileNameFromUrl(course.syllabusPdfUrl) : null);
      })
      .catch(() => {
        if (isMounted) setLoadError(true);
      })
      .finally(() => {
        if (isMounted) setIsLoadingCourse(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, isEditMode]);

  const handleChange = (field: keyof FormValues) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      error('Archivo inválido', 'Solo se permiten archivos PDF.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      error('Archivo muy grande', `El sílabo no debe superar los ${MAX_FILE_SIZE_MB}MB.`);
      e.target.value = '';
      return;
    }

    setSyllabusFileName(file.name);
    setSyllabusFile(file);
  };

  const handleRemoveFile = () => {
    setSyllabusFileName(null);
    setSyllabusFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const input: CourseFormInput = {
        title: values.title.trim(),
        description: values.description.trim(),
        price: Number(values.price),
        category: values.category as CourseCategory,
        modality: values.modality,
        moodleCourseId: Number(values.moodleCourseId.trim()),
        status: values.status,
        syllabusFileName,
        syllabusFile,
      };

      if (isEditMode && id) {
        await coursesService.updateCourse(id, input);
      } else {
        await coursesService.createCourse(input);
      }

      success('Curso guardado', 'El curso se guardó correctamente.');
      navigate('/cursos');
    } catch (err) {
      error('No se pudo guardar el curso', err instanceof Error ? err.message : 'Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingCourse) {
    return <p className="text-muted-foreground">Cargando curso...</p>;
  }

  if (loadError) {
    return <p className="text-destructive">No se pudo cargar el curso.</p>;
  }

  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-bold">{isEditMode ? 'Editar curso' : 'Registrar curso'}</h1>

      <form className="grid max-w-2xl gap-5" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-1.5">
          <Label htmlFor="title">Nombre del curso</Label>
          <Input
            id="title"
            value={values.title}
            onChange={handleChange('title')}
            aria-invalid={Boolean(errors.title)}
          />
          {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={values.description}
            onChange={handleChange('description')}
            aria-invalid={Boolean(errors.description)}
          />
          {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="price">Precio (S/)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={values.price}
              onChange={handleChange('price')}
              aria-invalid={Boolean(errors.price)}
            />
            {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="moodleCourseId">Moodle Course ID</Label>
            <Input
              id="moodleCourseId"
              value={values.moodleCourseId}
              onChange={handleChange('moodleCourseId')}
              aria-invalid={Boolean(errors.moodleCourseId)}
            />
            {errors.moodleCourseId && (
              <p className="text-sm text-destructive">{errors.moodleCourseId}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-1.5">
            <Label htmlFor="category">Categoría</Label>
            <select
              id="category"
              value={values.category}
              onChange={handleChange('category')}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              aria-invalid={Boolean(errors.category)}
            >
              <option value="">Selecciona...</option>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="modality">Modalidad</Label>
            <select
              id="modality"
              value={values.modality}
              onChange={handleChange('modality')}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {MODALITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="status">Estado</Label>
            <select
              id="status"
              value={values.status}
              onChange={handleChange('status')}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {COURSE_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="syllabus">Sílabo (PDF)</Label>
          <input
            ref={fileInputRef}
            id="syllabus"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="text-sm"
          />
          {syllabusFileName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Paperclip className="h-4 w-4" />
              <span>{syllabusFileName}</span>
              <button
                type="button"
                onClick={handleRemoveFile}
                aria-label="Quitar archivo"
                className="text-destructive hover:underline"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar curso'}
          </Button>
          <Button asChild type="button" variant="outline">
            <Link to="/cursos">Cancelar</Link>
          </Button>
        </div>
      </form>
    </section>
  );
}
