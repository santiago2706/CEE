import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCourses } from '@/hooks/useCourses';
import { useToast } from '@/hooks/useToast';
import { certificatesService, type CertificateFormInput } from '@/services/certificatesService';

interface FormValues {
  studentName: string;
  courseId: string;
  issuedAt: string;
  notes: string;
}

interface FormErrors {
  studentName?: string;
  courseId?: string;
  issuedAt?: string;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function validate(v: FormValues): FormErrors {
  const e: FormErrors = {};
  if (!v.studentName.trim()) e.studentName = 'El nombre del alumno es requerido.';
  if (!v.courseId)           e.courseId    = 'Selecciona un curso.';
  if (!v.issuedAt)           e.issuedAt    = 'La fecha de emisión es requerida.';
  return e;
}

export default function CertificateFormPage() {
  const navigate       = useNavigate();
  const [params]       = useSearchParams();
  const { success, error } = useToast();
  const { courses }    = useCourses();

  const preAlumno = params.get('alumno') ?? '';
  const preCurso  = params.get('curso')  ?? '';

  const [values, setValues] = useState<FormValues>({
    studentName: preAlumno,
    courseId:    preCurso,
    issuedAt:    todayISO(),
    notes:       '',
  });
  const [errors, setErrors]         = useState<FormErrors>({});
  const [isSubmitting, setSubmitting] = useState(false);

  // If the pre-filled courseId isn't in the loaded courses yet, wait for them
  // (no-op: the select will just show the right option once courses load)
  useEffect(() => {
    if (preCurso && !values.courseId) {
      setValues((prev) => ({ ...prev, courseId: preCurso }));
    }
  }, [preCurso]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange =
    (field: keyof FormValues) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const ve = validate(values);
    setErrors(ve);
    if (Object.keys(ve).length > 0) return;

    setSubmitting(true);
    try {
      const selectedCourse = courses.find((c) => c.id === values.courseId);
      const input: CertificateFormInput = {
        studentName: values.studentName.trim(),
        courseId:    values.courseId,
        courseName:  selectedCourse?.title ?? values.courseId,
        issuedAt:    values.issuedAt,
        notes:       values.notes.trim() || null,
      };
      await certificatesService.createCertificate(input);
      success('Certificado creado', 'El certificado se creó en estado Borrador.');
      navigate('/certificados');
    } catch (err) {
      error('No se pudo crear', err instanceof Error ? err.message : 'Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Emitir certificado</h1>
        <p className="mt-0.5 text-sm text-[#A9A9A9]">
          Se creará en estado <span className="font-medium text-gray-700">Borrador</span> — luego cambia el estado para firmarlo.
        </p>
      </div>

      <form className="grid max-w-2xl gap-5" onSubmit={handleSubmit} noValidate>
        {/* Alumno */}
        <div className="grid gap-1.5">
          <Label htmlFor="studentName">Nombre del alumno</Label>
          <Input
            id="studentName"
            placeholder="Ej. Ana Quispe Flores"
            value={values.studentName}
            onChange={handleChange('studentName')}
            aria-invalid={Boolean(errors.studentName)}
          />
          {errors.studentName && (
            <p className="text-sm text-destructive">{errors.studentName}</p>
          )}
        </div>

        {/* Curso */}
        <div className="grid gap-1.5">
          <Label htmlFor="courseId">Curso</Label>
          <select
            id="courseId"
            value={values.courseId}
            onChange={handleChange('courseId')}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:border-[#682222] focus:outline-none focus:ring-1 focus:ring-[#682222]/40"
            aria-invalid={Boolean(errors.courseId)}
          >
            <option value="">Selecciona un curso...</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          {errors.courseId && (
            <p className="text-sm text-destructive">{errors.courseId}</p>
          )}
        </div>

        {/* Fecha de emisión */}
        <div className="grid gap-1.5">
          <Label htmlFor="issuedAt">Fecha de emisión</Label>
          <Input
            id="issuedAt"
            type="date"
            value={values.issuedAt}
            max={todayISO()}
            onChange={handleChange('issuedAt')}
            aria-invalid={Boolean(errors.issuedAt)}
          />
          {errors.issuedAt && (
            <p className="text-sm text-destructive">{errors.issuedAt}</p>
          )}
        </div>

        {/* Notas */}
        <div className="grid gap-1.5">
          <Label htmlFor="notes">Notas (opcional)</Label>
          <Textarea
            id="notes"
            placeholder="Observaciones, mención especial, etc."
            value={values.notes}
            onChange={handleChange('notes')}
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#682222] text-white hover:bg-[#4F1A1A]"
          >
            {isSubmitting ? 'Creando...' : 'Crear certificado'}
          </Button>
          <Button asChild type="button" variant="outline">
            <Link to="/certificados">Cancelar</Link>
          </Button>
        </div>
      </form>
    </section>
  );
}
