import { type FormEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { CeeEvent } from '@cee/types';
import { Calendar, CheckCircle, Clock, MapPin } from 'lucide-react';
import { eventsPublicService } from '@/services/events.service';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const longFmt = new Intl.DateTimeFormat('es-PE', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Registration form ────────────────────────────────────────────────────────

interface FormValues {
  firstName: string;
  lastNamePaternal: string;
  lastNameMaternal: string;
  email: string;
  phone: string;
  isWorking: '' | 'yes' | 'no';
  wantsCertificate: boolean;
}

interface FormErrors {
  firstName?: string;
  lastNamePaternal?: string;
  email?: string;
  phone?: string;
  isWorking?: string;
}

const INITIAL: FormValues = {
  firstName: '', lastNamePaternal: '', lastNameMaternal: '',
  email: '', phone: '', isWorking: '', wantsCertificate: false,
};

function validate(v: FormValues): FormErrors {
  const e: FormErrors = {};
  if (!v.firstName.trim())        e.firstName        = 'El nombre es requerido.';
  if (!v.lastNamePaternal.trim()) e.lastNamePaternal  = 'El apellido paterno es requerido.';
  if (!v.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))
    e.email = 'Ingresa un correo electrónico válido.';
  if (!/^\d{9}$/.test(v.phone.trim()))
    e.phone = 'El celular debe tener 9 dígitos.';
  if (!v.isWorking)
    e.isWorking = 'Indica si actualmente trabajas.';
  return e;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent]       = useState<CeeEvent | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [values, setValues]     = useState<FormValues>(INITIAL);
  const [errors, setErrors]     = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]   = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    eventsPublicService.getEventBySlug(slug)
      .then((res) => setEvent(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleChange = (field: keyof FormValues, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!event) return;

    const ve = validate(values);
    setErrors(ve);
    if (Object.keys(ve).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await eventsPublicService.registerAttendee({
        eventId:           event.id,
        firstName:         values.firstName.trim(),
        lastNamePaternal:  values.lastNamePaternal.trim(),
        lastNameMaternal:  values.lastNameMaternal.trim(),
        email:             values.email.trim().toLowerCase(),
        phone:             values.phone.trim(),
        isWorking:         values.isWorking === 'yes',
        wantsCertificate:  event.hasCertificate && values.wantsCertificate,
        source:            'web',
      });
      setSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo completar la inscripción.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading / error states ──────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-gray-500">Cargando evento...</p>
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Evento no encontrado</h1>
        <p className="text-sm text-gray-500">El evento que buscas no existe o ya no está disponible.</p>
      </div>
    );
  }

  const dateLabel  = capitalize(longFmt.format(new Date(`${event.eventDate}T00:00:00`)));
  const certLabel  = event.certificatePrice && event.certificatePrice > 0
    ? `S/ ${event.certificatePrice}`
    : 'Incluido sin costo adicional';

  const inputCls = (hasError: boolean) =>
    `w-full rounded-lg border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 ` +
    `focus:outline-none focus:ring-2 transition-colors duration-150 ` +
    (hasError
      ? 'border-rose-400 focus:ring-rose-200'
      : 'border-gray-300 focus:border-cee-red focus:ring-cee-red/20');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero ── */}
      {event.flyerUrl ? (
        <div className="relative h-64 w-full overflow-hidden bg-gray-900 sm:h-80">
          <img src={event.flyerUrl} alt={event.title} className="h-full w-full object-cover opacity-70" />
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-6 sm:p-10">
            <h1 className="text-2xl font-bold text-white sm:text-4xl">{event.title}</h1>
          </div>
        </div>
      ) : (
        <div className="flex h-56 items-end bg-gradient-to-br from-cee-red to-cee-red-dark px-6 pb-8 sm:px-10 sm:pb-10">
          <h1 className="text-2xl font-bold text-white sm:text-4xl">{event.title}</h1>
        </div>
      )}

      {/* ── Content ── */}
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {/* Meta */}
        <ul className="mb-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
          <li className="flex items-center gap-2"><Calendar className="h-4 w-4 text-cee-red" />{dateLabel}</li>
          <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-cee-red" />{event.startTime} – {event.endTime}</li>
          <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-cee-red" />{event.location}</li>
        </ul>

        {/* Description */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Sobre el evento</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{event.description}</p>
        </div>

        {/* Certificate info */}
        {event.hasCertificate && (
          <div className="mb-8 flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-5">
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Certificado de participación</p>
              <p className="text-sm text-amber-700">{certLabel}</p>
            </div>
          </div>
        )}

        {/* Registration form */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-gray-900">Confirmar inscripción</h2>

          {success ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <CheckCircle className="h-14 w-14 text-emerald-500" />
              <h3 className="text-xl font-bold text-gray-900">¡Inscripción confirmada!</h3>
              <p className="text-sm text-gray-600">
                Te esperamos el <span className="font-medium text-cee-red">{dateLabel}</span> en {event.location}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="grid gap-4">
              {/* Row 1 */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium text-gray-700">
                    Nombres <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="Ej. María José"
                    value={values.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className={inputCls(Boolean(errors.firstName))}
                  />
                  {errors.firstName && <p className="mt-1 text-xs text-rose-500">{errors.firstName}</p>}
                </div>
                <div>
                  <label htmlFor="lastNameP" className="mb-1.5 block text-sm font-medium text-gray-700">
                    Apellido Paterno <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="lastNameP"
                    type="text"
                    placeholder="Ej. Quispe"
                    value={values.lastNamePaternal}
                    onChange={(e) => handleChange('lastNamePaternal', e.target.value)}
                    className={inputCls(Boolean(errors.lastNamePaternal))}
                  />
                  {errors.lastNamePaternal && <p className="mt-1 text-xs text-rose-500">{errors.lastNamePaternal}</p>}
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="lastNameM" className="mb-1.5 block text-sm font-medium text-gray-700">
                    Apellido Materno
                  </label>
                  <input
                    id="lastNameM"
                    type="text"
                    placeholder="Opcional"
                    value={values.lastNameMaternal}
                    onChange={(e) => handleChange('lastNameMaternal', e.target.value)}
                    className={inputCls(false)}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-gray-700">
                    Celular <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="9XXXXXXXX"
                    maxLength={9}
                    value={values.phone}
                    onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 9))}
                    className={inputCls(Boolean(errors.phone))}
                  />
                  {errors.phone && <p className="mt-1 text-xs text-rose-500">{errors.phone}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Correo electrónico <span className="text-rose-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="nombre@correo.com"
                  value={values.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={inputCls(Boolean(errors.email))}
                />
                {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
              </div>

              {/* Is working */}
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  ¿Actualmente estás trabajando? <span className="text-rose-500">*</span>
                </p>
                <div className="flex gap-6">
                  {(['yes', 'no'] as const).map((val) => (
                    <label key={val} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                      <input
                        type="radio"
                        name="isWorking"
                        value={val}
                        checked={values.isWorking === val}
                        onChange={() => handleChange('isWorking', val)}
                        className="accent-cee-red"
                      />
                      {val === 'yes' ? 'Sí' : 'No'}
                    </label>
                  ))}
                </div>
                {errors.isWorking && <p className="mt-1 text-xs text-rose-500">{errors.isWorking}</p>}
              </div>

              {/* Certificate checkbox */}
              {event.hasCertificate && (
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-amber-100 bg-amber-50 p-4">
                  <input
                    type="checkbox"
                    checked={values.wantsCertificate}
                    onChange={(e) => handleChange('wantsCertificate', e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-cee-red"
                  />
                  <span className="text-sm text-amber-800">
                    Deseo obtener el certificado de participación ({certLabel})
                  </span>
                </label>
              )}

              {submitError && (
                <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600">{submitError}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full rounded-lg bg-cee-red py-3 text-sm font-semibold text-white transition-colors hover:bg-cee-red-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? 'Registrando...' : 'Confirmar inscripción'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
