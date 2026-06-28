import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { StudentGender, StudentSource } from '@cee/types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';
import { studentsService, type StudentFormInput } from '@/services/studentsService';

interface FormValues {
  dni: string;
  firstName: string;
  lastNamePaterno: string;
  lastNameMaterno: string;
  birthDate: string;
  gender: StudentGender | '';
  email: string;
  phone: string;
  district: string;
  city: string;
  isWorking: boolean;
  company: string;
  profession: string;
  source: StudentSource;
  moodleUserId: string;
  notes: string;
}

interface FormErrors {
  dni?: string;
  firstName?: string;
  lastNamePaterno?: string;
  lastNameMaterno?: string;
  phone?: string;
}

const INITIAL: FormValues = {
  dni: '', firstName: '', lastNamePaterno: '', lastNameMaterno: '',
  birthDate: '', gender: '', email: '', phone: '',
  district: '', city: 'Lima', isWorking: false, company: '',
  profession: '', source: 'web', moodleUserId: '', notes: '',
};

function validate(v: FormValues): FormErrors {
  const e: FormErrors = {};
  if (!/^\d{8}$/.test(v.dni.trim()))  e.dni             = 'El DNI debe tener exactamente 8 dígitos.';
  if (!v.firstName.trim())            e.firstName        = 'El nombre es requerido.';
  if (!v.lastNamePaterno.trim())      e.lastNamePaterno  = 'El apellido paterno es requerido.';
  if (!v.lastNameMaterno.trim())      e.lastNameMaterno  = 'El apellido materno es requerido.';
  if (!v.phone.trim())                e.phone            = 'El celular es requerido.';
  return e;
}

const selectCls = 'h-10 rounded-md border border-input bg-background px-3 text-sm focus:border-[#682222] focus:outline-none focus:ring-1 focus:ring-[#682222]/40';

export default function StudentFormPage() {
  const { id }      = useParams<{ id: string }>();
  const isEdit      = Boolean(id);
  const navigate    = useNavigate();
  const { success, error } = useToast();

  const [values, setValues]       = useState<FormValues>(INITIAL);
  const [errors, setErrors]       = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setSubmitting] = useState(false);
  const [moodleOpen, setMoodleOpen]   = useState(false);

  useEffect(() => {
    if (!isEdit || !id) return;
    let mounted = true;
    studentsService.getStudentById(id)
      .then(({ data: s }) => {
        if (!mounted) return;
        setValues({
          dni:            s.dni,
          firstName:      s.firstName,
          lastNamePaterno: s.lastNamePaterno,
          lastNameMaterno: s.lastNameMaterno,
          birthDate:      s.birthDate ?? '',
          gender:         s.gender ?? '',
          email:          s.email ?? '',
          phone:          s.phone,
          district:       s.district ?? '',
          city:           s.city ?? 'Lima',
          isWorking:      s.isWorking,
          company:        s.company ?? '',
          profession:     s.profession ?? '',
          source:         s.source,
          moodleUserId:   s.moodleUserId != null ? String(s.moodleUserId) : '',
          notes:          s.notes ?? '',
        });
        if (s.moodleUserId != null) setMoodleOpen(true);
      })
      .catch(() => error('Error', 'No se pudo cargar el alumno.'))
      .finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, [id, isEdit]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (field: keyof FormValues) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setValues((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const ve = validate(values);
    setErrors(ve);
    if (Object.keys(ve).length > 0) return;

    setSubmitting(true);
    try {
      const input: StudentFormInput = {
        dni:            values.dni.trim(),
        firstName:      values.firstName.trim(),
        lastNamePaterno: values.lastNamePaterno.trim(),
        lastNameMaterno: values.lastNameMaterno.trim(),
        birthDate:      values.birthDate || null,
        gender:         (values.gender as StudentGender) || null,
        email:          values.email.trim() || null,
        phone:          values.phone.trim(),
        district:       values.district.trim() || null,
        city:           values.city.trim() || 'Lima',
        isWorking:      values.isWorking,
        company:        values.isWorking && values.company.trim() ? values.company.trim() : null,
        profession:     values.profession.trim() || null,
        source:         values.source,
        moodleUserId:   values.moodleUserId ? Number(values.moodleUserId) : null,
        notes:          values.notes.trim() || null,
      };
      if (isEdit && id) {
        await studentsService.updateStudent(id, input);
        success('Alumno actualizado', 'Los datos se guardaron correctamente.');
      } else {
        await studentsService.createStudent(input);
        success('Alumno registrado', 'El alumno fue creado correctamente.');
      }
      navigate('/alumnos');
    } catch (err) {
      error('No se pudo guardar', err instanceof Error ? err.message : 'Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <p className="text-sm text-[#A9A9A9]">Cargando datos del alumno...</p>;

  const sectionTitle = (text: string) => (
    <h2 className="text-sm font-semibold uppercase tracking-wider text-[#682222]">{text}</h2>
  );

  return (
    <section className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Editar alumno' : 'Nuevo alumno'}</h1>
        <p className="mt-0.5 text-sm text-[#A9A9A9]">Completa los datos del alumno del CEE.</p>
      </div>

      <form className="grid max-w-2xl gap-8" onSubmit={handleSubmit} noValidate>

        {/* ── Datos personales ── */}
        <fieldset className="grid gap-5 rounded-xl border border-gray-200 p-5">
          <legend className="px-1">{sectionTitle('Datos personales')}</legend>

          <div className="grid gap-1.5">
            <Label htmlFor="dni">DNI <span className="text-rose-500">*</span></Label>
            <Input id="dni" maxLength={8} placeholder="12345678" value={values.dni} onChange={set('dni')} aria-invalid={Boolean(errors.dni)} />
            {errors.dni && <p className="text-sm text-destructive">{errors.dni}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="firstName">Nombres <span className="text-rose-500">*</span></Label>
              <Input id="firstName" value={values.firstName} onChange={set('firstName')} aria-invalid={Boolean(errors.firstName)} />
              {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="lastNamePaterno">Apellido Paterno <span className="text-rose-500">*</span></Label>
              <Input id="lastNamePaterno" value={values.lastNamePaterno} onChange={set('lastNamePaterno')} aria-invalid={Boolean(errors.lastNamePaterno)} />
              {errors.lastNamePaterno && <p className="text-sm text-destructive">{errors.lastNamePaterno}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="lastNameMaterno">Apellido Materno <span className="text-rose-500">*</span></Label>
              <Input id="lastNameMaterno" value={values.lastNameMaterno} onChange={set('lastNameMaterno')} aria-invalid={Boolean(errors.lastNameMaterno)} />
              {errors.lastNameMaterno && <p className="text-sm text-destructive">{errors.lastNameMaterno}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="birthDate">Fecha de nacimiento</Label>
              <Input id="birthDate" type="date" value={values.birthDate} onChange={set('birthDate')} />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="gender">Género</Label>
            <select id="gender" value={values.gender} onChange={set('gender')} className={selectCls}>
              <option value="">Sin especificar</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </fieldset>

        {/* ── Contacto y ubicación ── */}
        <fieldset className="grid gap-5 rounded-xl border border-gray-200 p-5">
          <legend className="px-1">{sectionTitle('Contacto y ubicación')}</legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="phone">Celular <span className="text-rose-500">*</span></Label>
              <Input id="phone" type="tel" placeholder="9XXXXXXXX" value={values.phone} onChange={set('phone')} aria-invalid={Boolean(errors.phone)} />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" placeholder="nombre@correo.com" value={values.email} onChange={set('email')} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="district">Distrito</Label>
              <Input id="district" placeholder="Ej. Miraflores" value={values.district} onChange={set('district')} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="city">Ciudad</Label>
              <Input id="city" placeholder="Lima" value={values.city} onChange={set('city')} />
            </div>
          </div>
        </fieldset>

        {/* ── Información profesional ── */}
        <fieldset className="grid gap-5 rounded-xl border border-gray-200 p-5">
          <legend className="px-1">{sectionTitle('Información profesional')}</legend>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={values.isWorking}
              onChange={(e) => setValues((p) => ({ ...p, isWorking: e.target.checked, company: '' }))}
              className="h-4 w-4 rounded accent-[#682222]"
            />
            <span className="text-sm font-medium text-gray-900">¿Actualmente está trabajando?</span>
          </label>

          {values.isWorking && (
            <div className="grid gap-1.5">
              <Label htmlFor="company">Empresa</Label>
              <Input id="company" placeholder="Nombre de la empresa" value={values.company} onChange={set('company')} />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="profession">Profesión / Carrera</Label>
              <Input id="profession" placeholder="Ej. Ingeniero Industrial" value={values.profession} onChange={set('profession')} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="source">Fuente de captación</Label>
              <select id="source" value={values.source} onChange={set('source')} className={selectCls}>
                <option value="web">Web</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="manual">Manual</option>
                <option value="referido">Referido</option>
              </select>
            </div>
          </div>
        </fieldset>

        {/* ── Integración Moodle (colapsable) ── */}
        <fieldset className="rounded-xl border border-gray-200">
          <button
            type="button"
            className="flex w-full items-center justify-between px-5 py-4 text-left"
            onClick={() => setMoodleOpen((p) => !p)}
          >
            <span className="text-sm font-semibold uppercase tracking-wider text-[#682222]">
              Integración Moodle LMS
            </span>
            {moodleOpen
              ? <ChevronUp className="h-4 w-4 text-[#A9A9A9]" />
              : <ChevronDown className="h-4 w-4 text-[#A9A9A9]" />}
          </button>
          {moodleOpen && (
            <div className="grid gap-4 border-t border-gray-100 px-5 pb-5 pt-4">
              <div className="grid gap-1.5">
                <Label htmlFor="moodleUserId">Moodle User ID</Label>
                <Input
                  id="moodleUserId"
                  type="number"
                  placeholder="Dejar vacío por ahora"
                  value={values.moodleUserId}
                  onChange={set('moodleUserId')}
                />
              </div>
              <p className="rounded-lg bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-700">
                Este campo se usará cuando se integre el sistema con Moodle LMS. Una vez configurada
                la integración, el ID aquí permitirá sincronizar automáticamente las inscripciones
                del CEE con los accesos en la plataforma e-learning. <strong>Dejar vacío por ahora.</strong>
              </p>
            </div>
          )}
        </fieldset>

        {/* ── Notas ── */}
        <div className="grid gap-1.5">
          <Label htmlFor="notes">Notas de la secretaria (opcional)</Label>
          <Textarea id="notes" rows={3} placeholder="Observaciones, preferencias, historial especial..." value={values.notes} onChange={set('notes')} />
        </div>

        {/* ── Acciones ── */}
        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting} className="bg-[#682222] text-white hover:bg-[#4F1A1A]">
            {isSubmitting ? 'Guardando...' : (isEdit ? 'Guardar cambios' : 'Registrar alumno')}
          </Button>
          <Button asChild type="button" variant="outline">
            <Link to="/alumnos">Cancelar</Link>
          </Button>
        </div>
      </form>
    </section>
  );
}
