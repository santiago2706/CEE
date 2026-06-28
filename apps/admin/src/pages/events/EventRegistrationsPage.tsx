import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { CeeEvent, EventRegistration } from '@cee/types';
import { utils as xlsxUtils, writeFile as xlsxWriteFile } from 'xlsx';
import { ArrowLeft, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/shared/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { eventsService } from '@/services/eventsService';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 20;

const SOURCE_LABEL: Record<string, string> = {
  web: 'Web', whatsapp: 'WhatsApp', manual: 'Manual',
};

const dateFmt = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
const regDateFmt = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

function fullName(r: EventRegistration) {
  return [r.firstName, r.lastNamePaternal, r.lastNameMaternal].filter(Boolean).join(' ');
}

function bool(v: boolean) {
  return v
    ? <span className="text-emerald-600 font-medium">Sí</span>
    : <span className="text-gray-400">No</span>;
}

export default function EventRegistrationsPage() {
  const { id } = useParams<{ id: string }>();
  const { success, error } = useToast();

  const [event, setEvent]         = useState<CeeEvent | null>(null);
  const [regs, setRegs]           = useState<EventRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [evRes, regRes] = await Promise.all([
        eventsService.getEventById(id),
        eventsService.getRegistrations(id),
      ]);
      setEvent(evRes.data);
      setRegs(regRes.data);
    } catch {
      error('Error', 'No se pudieron cargar los inscritos.');
    } finally {
      setIsLoading(false);
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { void load(); }, [load]);

  const { page, totalPages, paginatedItems, goNext, goPrev, hasNext, hasPrev } =
    usePagination(regs, PAGE_SIZE);

  const handleMarkPaid = async (registrationId: string) => {
    try {
      const res = await eventsService.markCertificatePaid(registrationId);
      setRegs((prev) => prev.map((r) => (r.id === registrationId ? res.data : r)));
      success('Certificado pagado', 'El pago del certificado fue registrado.');
    } catch {
      error('Error', 'No se pudo actualizar el pago.');
    }
  };

  const handleExportExcel = () => {
    if (!event) return;
    const today = new Date().toISOString().slice(0, 10);
    const rows = regs.map((r, i) => ({
      'Nº':                    i + 1,
      'Nombres':               r.firstName,
      'Apellido Paterno':      r.lastNamePaternal,
      'Apellido Materno':      r.lastNameMaternal,
      'Email':                 r.email,
      'Celular':               r.phone,
      '¿Trabaja?':             r.isWorking ? 'Sí' : 'No',
      '¿Quiere certificado?':  r.wantsCertificate ? 'Sí' : 'No',
      'Certificado pagado':    r.certificatePaid ? 'Sí' : 'No',
      'Fuente':                SOURCE_LABEL[r.source] ?? r.source,
      'Fecha inscripción':     regDateFmt.format(new Date(r.createdAt)),
    }));
    const ws = xlsxUtils.json_to_sheet(rows);
    const wb = xlsxUtils.book_new();
    xlsxUtils.book_append_sheet(wb, ws, 'Inscritos');
    xlsxWriteFile(wb, `inscritos-${event.slug || event.id}-${today}.xlsx`);
  };

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl bg-white shadow-sm">
        <p className="text-sm text-[#A9A9A9]">Cargando inscritos...</p>
      </div>
    );
  }

  if (!event) {
    return <p className="text-sm text-destructive">No se encontró el evento.</p>;
  }

  return (
    <section className="grid gap-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            to="/eventos"
            className="mb-2 flex items-center gap-1.5 text-xs text-[#A9A9A9] hover:text-[#682222]"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Volver a Eventos
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
          <p className="mt-0.5 text-sm text-[#A9A9A9]">
            {dateFmt.format(new Date(`${event.eventDate}T00:00:00`))} · {event.startTime}–{event.endTime} · {event.location}
          </p>
          <p className="mt-1 text-sm font-medium text-gray-700">
            <span className="text-[#682222]">{regs.length}</span>
            <span className="text-gray-400"> / {event.capacity} inscritos</span>
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportExcel}
          disabled={regs.length === 0}
          className="h-9 gap-2 border-gray-200 text-sm hover:border-[#682222] hover:text-[#682222]"
        >
          <Download className="h-4 w-4" />
          Exportar Excel
        </Button>
      </div>

      {/* ── Tabla ── */}
      {regs.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl bg-white shadow-sm">
          <p className="text-sm font-medium text-gray-500">Aún no hay inscritos</p>
          <p className="text-xs text-[#A9A9A9]">Los registros aparecerán aquí cuando alguien se inscriba.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-sm">
              <thead>
                <tr className="bg-[#682222] text-left">
                  {['#', 'Nombre completo', 'Email', 'Celular', '¿Trabaja?', '¿Cert.?', 'Pagado', 'Fuente', 'Fecha inscripción', 'Acciones'].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((reg, idx) => (
                  <tr
                    key={reg.id}
                    className={cn(
                      'border-b border-gray-100 last:border-0 transition-colors duration-150 hover:bg-[#fdf6f6]',
                      idx % 2 === 0 ? 'bg-white' : 'bg-[#f9f9f9]',
                    )}
                  >
                    <td className="px-4 py-3 text-[#A9A9A9]">
                      {(page - 1) * PAGE_SIZE + idx + 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{fullName(reg)}</td>
                    <td className="px-4 py-3 text-gray-600">{reg.email}</td>
                    <td className="px-4 py-3 text-gray-600">{reg.phone}</td>
                    <td className="px-4 py-3">{bool(reg.isWorking)}</td>
                    <td className="px-4 py-3">{bool(reg.wantsCertificate)}</td>
                    <td className="px-4 py-3">{bool(reg.certificatePaid)}</td>
                    <td className="px-4 py-3 text-[#A9A9A9]">{SOURCE_LABEL[reg.source] ?? reg.source}</td>
                    <td className="px-4 py-3 text-[#A9A9A9]">
                      {regDateFmt.format(new Date(reg.createdAt))}
                    </td>
                    <td className="px-4 py-3">
                      {reg.wantsCertificate && !reg.certificatePaid && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 border-emerald-200 text-[11px] text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50"
                          onClick={() => handleMarkPaid(reg.id)}
                        >
                          Marcar pagado
                        </Button>
                      )}
                      {reg.certificatePaid && (
                        <span className="text-[11px] font-medium text-emerald-600">✓ Pagado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            hasNext={hasNext}
            hasPrev={hasPrev}
            onNext={goNext}
            onPrev={goPrev}
          />
        </div>
      )}
    </section>
  );
}
