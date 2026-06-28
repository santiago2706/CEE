import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCourses } from '@/hooks/useCourses';
import { useToast } from '@/hooks/useToast';
import { salesRecordsService, type SaleFormInput } from '@/services/salesRecordsService';
import { studentsService } from '@/services/studentsService';

interface FormValues {
  studentName: string;
  courseId: string;
  amount: string;
  status: 'pending' | 'completed';
  notes: string;
}

interface FormErrors {
  studentName?: string;
  courseId?: string;
  amount?: string;
}

const INITIAL: FormValues = {
  studentName: '',
  courseId: '',
  amount: '',
  status: 'pending',
  notes: '',
};

function validate(v: FormValues): FormErrors {
  const e: FormErrors = {};
  if (!v.studentName.trim()) {
    e.studentName = 'El nombre del alumno es requerido.';
  }
  if (!v.courseId) {
    e.courseId = 'Selecciona un curso.';
  }
  const amount = Number(v.amount);
  if (!v.amount.trim() || Number.isNaN(amount) || amount <= 0) {
    e.amount = 'Ingresa un monto numérico mayor a 0.';
  }
  return e;
}

export default function SaleFormPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { success, error } = useToast();
  const { courses } = useCourses();

  const [values, setValues]       = useState<FormValues>(INITIAL);

  // Pre-fill from ?student_id if present
  useEffect(() => {
    const studentId = params.get('student_id');
    if (!studentId) return;
    studentsService.getStudentById(studentId).then(({ data: s }) => {
      setValues((prev) => ({
        ...prev,
        studentName: `${s.firstName} ${s.lastNamePaterno} ${s.lastNameMaterno}`.trim(),
      }));
    }).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [errors, setErrors]       = useState<FormErrors>({});
  const [isSubmitting, setSubmitting] = useState(false);

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
      const input: SaleFormInput = {
        studentName: values.studentName.trim(),
        courseId: values.courseId,
        courseName: selectedCourse?.title ?? values.courseId,
        amount: Number(values.amount),
        status: values.status,
        notes: values.notes.trim() || null,
      };
      await salesRecordsService.createSale(input);
      success('Inscripción registrada', 'La venta se registró correctamente.');
      navigate('/ventas');
    } catch (err) {
      error('No se pudo registrar', err instanceof Error ? err.message : 'Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Registrar inscripción</h1>
        <p className="mt-0.5 text-sm text-[#A9A9A9]">Registra una inscripción manualmente</p>
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

        {/* Monto + Estado */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="amount">Monto (S/)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="199.00"
              value={values.amount}
              onChange={handleChange('amount')}
              aria-invalid={Boolean(errors.amount)}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount}</p>
            )}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="status">Estado</Label>
            <select
              id="status"
              value={values.status}
              onChange={handleChange('status')}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:border-[#682222] focus:outline-none focus:ring-1 focus:ring-[#682222]/40"
            >
              <option value="pending">Pendiente</option>
              <option value="completed">Completado</option>
            </select>
          </div>
        </div>

        {/* Notas */}
        <div className="grid gap-1.5">
          <Label htmlFor="notes">Notas (opcional)</Label>
          <Textarea
            id="notes"
            placeholder="Método de pago, observaciones, etc."
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
            {isSubmitting ? 'Registrando...' : 'Registrar inscripción'}
          </Button>
          <Button asChild type="button" variant="outline">
            <Link to="/ventas">Cancelar</Link>
          </Button>
        </div>
      </form>
    </section>
  );
}
