import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { CertificateStatus } from '@cee/types';
import { utils as xlsxUtils, writeFile as xlsxWriteFile } from 'xlsx';
import { Download, ExternalLink, MoreHorizontal, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/shared/Pagination';
import { useCertificates } from '@/hooks/useCertificates';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

// ─── Status display ───────────────────────────────────────────────────────────

const CERT_STATUS_CONFIG: Record<CertificateStatus, { label: string; cls: string }> = {
  draft:             { label: 'Borrador',          cls: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200' },
  pending_signature: { label: 'Pendiente de Firma', cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  signed:            { label: 'Firmado',            cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  revoked:           { label: 'Anulado',            cls: 'bg-rose-50 text-rose-500 ring-1 ring-rose-200' },
};

const CHANGEABLE_STATUSES: CertificateStatus[] = ['draft', 'pending_signature', 'signed'];

function CertStatusChip({ status }: { status: CertificateStatus }) {
  const { label, cls } = CERT_STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', cls)}>
      {label}
    </span>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SELECT_CLS =
  'h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 ' +
  'focus:border-[#682222] focus:outline-none focus:ring-1 focus:ring-[#682222]/40';

const issuedFmt = new Intl.DateTimeFormat('es-PE', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CertificatesPage() {
  const {
    isLoading, certs, filteredCerts, paginatedItems, uniqueCourses,
    search,       setSearch,
    courseFilter, setCourseFilter,
    statusFilter, setStatusFilter,
    page, totalPages, goNext, goPrev, hasNext, hasPrev,
    changeStatus, revoke,
  } = useCertificates();

  const { success } = useToast();

  const handleChangeStatus = async (id: string, status: CertificateStatus) => {
    await changeStatus(id, status);
    success('Estado actualizado', 'El certificado se actualizó correctamente.');
  };

  const handleRevoke = async (id: string) => {
    await revoke(id);
    success('Certificado anulado', 'El certificado fue anulado.');
  };

  const handleExportExcel = () => {
    const today = new Date().toISOString().slice(0, 10);
    const rows = certs.map((c) => ({
      'Nº Certificado': c.certificateNumber,
      'Alumno':         c.studentName,
      'Curso':          c.courseName,
      'Fecha Emisión':  c.issuedAt,
      'Estado':         CERT_STATUS_CONFIG[c.status].label,
      'Firmado por':    c.signatureProvider === 'manual' ? 'Manual' : 'Digital',
    }));
    const ws = xlsxUtils.json_to_sheet(rows);
    const wb = xlsxUtils.book_new();
    xlsxUtils.book_append_sheet(wb, ws, 'Certificados');
    xlsxWriteFile(wb, `certificados-cee-${today}.xlsx`);
  };

  const foundLabel = useMemo(() => {
    const n = filteredCerts.length;
    return `${n} certificado${n !== 1 ? 's' : ''} encontrado${n !== 1 ? 's' : ''}`;
  }, [filteredCerts.length]);

  return (
    <section className="grid gap-6">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificados</h1>
          <p className="mt-0.5 text-sm text-[#A9A9A9]">Gestiona los certificados emitidos por el CEE</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            disabled={isLoading || certs.length === 0}
            className="h-9 gap-2 border-gray-200 text-sm hover:border-[#682222] hover:text-[#682222]"
          >
            <Download className="h-4 w-4" />
            Exportar Excel
          </Button>
          <Link
            to="/certificados/nuevo"
            className="flex items-center gap-2 rounded-lg bg-[#682222] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#4F1A1A] focus:outline-none focus:ring-2 focus:ring-[#682222]/40"
          >
            <Plus className="h-4 w-4" />
            Emitir certificado
          </Link>
        </div>
      </div>

      {/* ── Filtros ── */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
        <Input
          placeholder="Buscar por alumno o Nº certificado..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs border-gray-200 focus:border-[#682222] focus:ring-[#682222]/20"
        />

        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className={SELECT_CLS}
        >
          <option value="all">Todos los cursos</option>
          {uniqueCourses.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as CertificateStatus | 'all')}
          className={SELECT_CLS}
        >
          <option value="all">Todos los estados</option>
          {(Object.keys(CERT_STATUS_CONFIG) as CertificateStatus[]).map((s) => (
            <option key={s} value={s}>{CERT_STATUS_CONFIG[s].label}</option>
          ))}
        </select>

        <span className="ml-auto text-xs text-[#A9A9A9]">{foundLabel}</span>
      </div>

      {/* ── Tabla / Estado ── */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-xl bg-white shadow-sm">
          <p className="text-sm text-[#A9A9A9]">Cargando certificados...</p>
        </div>
      ) : filteredCerts.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl bg-white shadow-sm">
          <p className="text-sm font-medium text-gray-500">No se encontraron certificados</p>
          <p className="text-xs text-[#A9A9A9]">Prueba con otros filtros o emite un nuevo certificado.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] table-fixed text-sm">
              <colgroup>
                <col style={{ width: '14%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '28%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '12%' }} />
              </colgroup>
              <thead>
                <tr className="bg-[#682222] text-left">
                  {['Nº Certificado', 'Alumno', 'Curso', 'Fecha Emisión', 'Estado', 'Acciones'].map((h) => (
                    <th
                      key={h}
                      className={cn(
                        'px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white',
                        h === 'Acciones' && 'text-right',
                      )}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((cert, idx) => (
                  <tr
                    key={cert.id}
                    className={cn(
                      'border-b border-gray-100 last:border-0 transition-colors duration-150 hover:bg-[#fdf6f6]',
                      idx % 2 === 0 ? 'bg-white' : 'bg-[#f9f9f9]',
                    )}
                  >
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-[#682222]">
                      {cert.certificateNumber}
                    </td>
                    <td className="truncate px-5 py-3.5 font-medium text-gray-900" title={cert.studentName}>
                      {cert.studentName}
                    </td>
                    <td className="truncate px-5 py-3.5 text-gray-600" title={cert.courseName}>
                      {cert.courseName}
                    </td>
                    <td className="px-5 py-3.5 text-[#A9A9A9]">
                      {issuedFmt.format(new Date(`${cert.issuedAt}T00:00:00`))}
                    </td>
                    <td className="px-5 py-3.5">
                      <CertStatusChip status={cert.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        {/* PDF download — only if signed */}
                        {cert.signedDocumentUrl && (
                          <a
                            href={cert.signedDocumentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Ver / Descargar PDF"
                            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-[#682222]/10 hover:text-[#682222]"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}

                        {/* Actions dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-[#682222]/10"
                              aria-label="Acciones del certificado"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {CHANGEABLE_STATUSES.map((s) => (
                              <DropdownMenuItem
                                key={s}
                                disabled={s === cert.status || cert.status === 'revoked'}
                                onClick={() => handleChangeStatus(cert.id, s)}
                              >
                                Cambiar a {CERT_STATUS_CONFIG[s].label}
                              </DropdownMenuItem>
                            ))}
                            {cert.status !== 'revoked' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-rose-600 focus:text-rose-600"
                                  onClick={() => handleRevoke(cert.id)}
                                >
                                  Anular certificado
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
