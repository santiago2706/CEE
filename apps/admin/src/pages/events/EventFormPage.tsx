import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { EventStatus } from '@cee/types';
import { Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';
import { eventsService, type EventFormInput } from '@/services/eventsService';

const STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: 'draft',     label: 'Borrador' },
  { value: 'published', label: 'Publicado' },
  { value: 'cancelled', label: 'Cancelado' },
];

interface FormValues {
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: string;
  hasCertificate: boolean;
  certificatePrice: string;
  status: EventStatus;
  flyerUrl: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  capacity?: string;
}

const INITIAL: FormValues = {
  title: '', description: '', eventDate: '', startTime: '', endTime: '',
  location: '', capacity: '', hasCertificate: false, certificatePrice: '', status: 'draft', flyerUrl: '',
};

function validate(v: FormValues): FormErrors {
  const e: FormErrors = {};
  if (v.title.trim().length < 3)        e.title       = 'El título debe tener al menos 3 caracteres.';
  if (v.description.trim().length < 10) e.description = 'La descripción debe tener al menos 10 caracteres.';
  if (!v.eventDate)                     e.eventDate   = 'La fecha del evento es requerida.';
  if (!v.startTime)                     e.startTime   = 'La hora de inicio es requerida.';
  if (!v.endTime)                       e.endTime     = 'La hora de fin es requerida.';
  if (!v.location.trim())               e.location    = 'El lugar es requerido.';
  const cap = Number(v.capacity);
  if (!v.capacity.trim() || isNaN(cap) || cap < 1) e.capacity = 'Ingresa una capacidad válida (> 0).';
  return e;
}

export default function EventFormPage() {
  const { id }      = useParams<{ id: string }>();
  const isEdit      = Boolean(id);
  const navigate    = useNavigate();
  const { success, error } = useToast();
  const flyerRef    = useRef<HTMLInputElement>(null);

  const [values, setValues]         = useState<FormValues>(INITIAL);
  const [errors, setErrors]         = useState<FormErrors>({});
  const [flyerFileName, setFlyerFileName] = useState<string | null>(null);
  const [flyerFile, setFlyerFile]   = useState<File | null>(null);
  const [isLoading, setIsLoading]   = useState(isEdit);
  const [isSubmitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit || !id) return;
    let mounted = true;
    eventsService.getEventById(id)
      .then((res) => {
        if (!mounted) return;
        const ev = res.data;
        setValues({
          title:            ev.title,
          description:      ev.description,
          eventDate:        ev.eventDate,
          startTime:        ev.startTime,
          endTime:          ev.endTime,
          location:         ev.location,
          capacity:         String(ev.capacity),
          hasCertificate:   ev.hasCertificate,
          certificatePrice: ev.certificatePrice != null ? String(ev.certificatePrice) : '',
          status:           ev.status,
          flyerUrl:         ev.flyerUrl ?? '',
        });
      })
      .catch(() => error('Error', 'No se pudo cargar el evento.'))
      .finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, [id, isEdit]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange =
    (field: keyof FormValues) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleFlyerChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      error('Archivo inválido', 'Solo se permiten imágenes (JPG, PNG, WEBP).');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      error('Archivo muy grande', 'El flyer no debe superar 5 MB.');
      e.target.value = '';
      return;
    }
    setFlyerFileName(file.name);
    setFlyerFile(file);
  };

  const removeFlyerFile = () => {
    setFlyerFileName(null);
    setFlyerFile(null);
    if (flyerRef.current) flyerRef.current.value = '';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const ve = validate(values);
    setErrors(ve);
    if (Object.keys(ve).length > 0) return;

    setSubmitting(true);
    try {
      const input: EventFormInput = {
        title:            values.title.trim(),
        description:      values.description.trim(),
        eventDate:        values.eventDate,
        startTime:        values.startTime,
        endTime:          values.endTime,
        location:         values.location.trim(),
        capacity:         Number(values.capacity),
        hasCertificate:   values.hasCertificate,
        certificatePrice: values.hasCertificate && values.certificatePrice
          ? Number(values.certificatePrice)
          : null,
        status:  values.status,
        flyerUrl: flyerFile
          ? flyerFile.name   // mock mode — real mode would upload
          : (values.flyerUrl.trim() || null),
        flyerFile: flyerFile,
      };

      if (isEdit && id) {
        await eventsService.updateEvent(id, input);
        success('Evento actualizado', 'Los cambios se guardaron correctamente.');
      } else {
        await eventsService.createEvent(input);
        success('Evento creado', 'El evento se creó correctamente.');
      }
      navigate('/eventos');
    } catch (err) {
      error('No se pudo guardar', err instanceof Error ? err.message : 'Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <p className="text-sm text-[#A9A9A9]">Cargando evento...</p>;

  return (
    <section className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Editar evento' : 'Nuevo evento'}</h1>
        <p className="mt-0.5 text-sm text-[#A9A9A9]">
          {isEdit ? 'Modifica los datos del evento.' : 'Completa los datos para crear el evento.'}
        </p>
      </div>

      <form className="grid max-w-2xl gap-5" onSubmit={handleSubmit} noValidate>
        {/* Título */}
        <div className="grid gap-1.5">
          <Label htmlFor="title">Título del evento</Label>
          <Input id="title" value={values.title} onChange={handleChange('title')} aria-invalid={Boolean(errors.title)} />
          {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
        </div>

        {/* Descripción */}
        <div className="grid gap-1.5">
          <Label htmlFor="description">Descripción</Label>
          <Textarea id="description" rows={4} value={values.description} onChange={handleChange('description')} aria-invalid={Boolean(errors.description)} />
          {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
        </div>

        {/* Fecha + Horas */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-1.5">
            <Label htmlFor="eventDate">Fecha</Label>
            <Input id="eventDate" type="date" value={values.eventDate} onChange={handleChange('eventDate')} aria-invalid={Boolean(errors.eventDate)} />
            {errors.eventDate && <p className="text-sm text-destructive">{errors.eventDate}</p>}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="startTime">Hora inicio</Label>
            <Input id="startTime" type="time" value={values.startTime} onChange={handleChange('startTime')} aria-invalid={Boolean(errors.startTime)} />
            {errors.startTime && <p className="text-sm text-destructive">{errors.startTime}</p>}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="endTime">Hora fin</Label>
            <Input id="endTime" type="time" value={values.endTime} onChange={handleChange('endTime')} aria-invalid={Boolean(errors.endTime)} />
            {errors.endTime && <p className="text-sm text-destructive">{errors.endTime}</p>}
          </div>
        </div>

        {/* Lugar + Capacidad */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="location">Lugar</Label>
            <Input id="location" placeholder="Ej. Auditorio FIIS UNI" value={values.location} onChange={handleChange('location')} aria-invalid={Boolean(errors.location)} />
            {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="capacity">Capacidad</Label>
            <Input id="capacity" type="number" min="1" value={values.capacity} onChange={handleChange('capacity')} aria-invalid={Boolean(errors.capacity)} />
            {errors.capacity && <p className="text-sm text-destructive">{errors.capacity}</p>}
          </div>
        </div>

        {/* Certificado */}
        <div className="grid gap-3 rounded-lg border border-gray-200 p-4">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={values.hasCertificate}
              onChange={(e) => setValues((prev) => ({ ...prev, hasCertificate: e.target.checked, certificatePrice: '' }))}
              className="h-4 w-4 rounded accent-[#682222]"
            />
            <span className="text-sm font-medium text-gray-900">¿Incluye certificado de participación?</span>
          </label>
          {values.hasCertificate && (
            <div className="grid gap-1.5">
              <Label htmlFor="certPrice">Precio del certificado (S/)</Label>
              <Input
                id="certPrice"
                type="number"
                min="0"
                step="0.50"
                placeholder="0.00 = gratuito"
                value={values.certificatePrice}
                onChange={handleChange('certificatePrice')}
                className="max-w-[180px]"
              />
            </div>
          )}
        </div>

        {/* Estado */}
        <div className="grid gap-1.5">
          <Label htmlFor="status">Estado</Label>
          <select
            id="status"
            value={values.status}
            onChange={handleChange('status')}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:border-[#682222] focus:outline-none focus:ring-1 focus:ring-[#682222]/40"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Flyer */}
        <div className="grid gap-1.5">
          <Label>Flyer del evento (imagen)</Label>
          <input
            ref={flyerRef}
            type="file"
            accept="image/*"
            onChange={handleFlyerChange}
            className="text-sm text-gray-600"
          />
          {flyerFileName && (
            <div className="flex items-center gap-2 text-sm text-[#A9A9A9]">
              <Paperclip className="h-4 w-4" />
              <span>{flyerFileName}</span>
              <button type="button" onClick={removeFlyerFile} className="text-destructive hover:underline">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {!flyerFileName && (
            <div className="grid gap-1.5">
              <Label htmlFor="flyerUrl" className="text-xs text-[#A9A9A9]">
                O pega una URL de imagen
              </Label>
              <Input
                id="flyerUrl"
                placeholder="https://..."
                value={values.flyerUrl}
                onChange={handleChange('flyerUrl')}
                className="text-sm"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#682222] text-white hover:bg-[#4F1A1A]"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar evento'}
          </Button>
          <Button asChild type="button" variant="outline">
            <Link to="/eventos">Cancelar</Link>
          </Button>
        </div>
      </form>
    </section>
  );
}
