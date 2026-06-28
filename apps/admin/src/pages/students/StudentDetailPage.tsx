import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Certificate, EventRegistration, Sale, Student, StudentSource } from '@cee/types';
import { Award, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { studentsService } from '@/services/studentsService';
import { cn, formatPrice } from '@/lib/utils';

// ─── Source badge ─────────────────────────────────────────────────────────────

const SOURCE_LABEL: Record<StudentSource, string> = {
  web: 'Web', whatsapp: 'WhatsApp', manual: 'Manual', referido: 'Referido',
};
const SOURCE_CLS: Record<StudentSource, string> = {
  web:      'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  whatsapp: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  manual:   'bg-gray-100 text-gray-500 ring-1 ring-gray-200',
  referido: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
};

// ─── Status chips ─────────────────────────────────────────────────────────────

const SALE_STATUS: Record<string, string> = {
  completed: 'Completado', pending: 'Pendiente', refunded: 'Reembolsado',
};
const CERT_STATUS: Record<string, string> = {
  draft: 'Borrador', pending_signature: 'Pendiente de Firma', signed: 'Firmado', revoked: 'Anulado',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const dateFmt  = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
const dtFmt    = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'profile',      label: 'Perfil' },
  { key: 'courses',      label: 'Historial de cursos' },
  { key: 'certificates', label: 'Certificados' },
  { key: 'events',       label: 'Eventos' },
] as const;

type TabKey = typeof TABS[number]['key'];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { error } = useToast();

  const [student,  setStudent]  = useState<Student | null>(null);
  const [sales,    setSales]    = useState<Sale[]>([]);
  const [certs,    setCerts]    = useState<Certificate[]>([]);
  const [evRegs,   setEvRegs]   = useState<EventRegistration[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [activeTab, setTab]     = useState<TabKey>('profile');

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [stuRes, histRes] = await Promise.all([
        studentsService.getStudentById(id),
        studentsService.getStudentHistory(id),
      ]);
      setStudent(stuRes.data);
      setSales(histRes.data.sales);
      setCerts(histRes.data.certificates);
      setEvRegs(histRes.data.eventRegistrations);
    } catch {
      error('Error', 'No se pudo cargar el alumno.');
    } finally {
      setLoading(false);
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { void load(); }, [load]);

  if (isLoading) return (
    <div className="flex h-48 items-center justify-center rounded-xl bg-white shadow-sm">
      <p className="text-sm text-[#A9A9A9]">Cargando perfil del alumno...</p>
    </div>
  );

  if (!student) return <p className="text-sm text-destructive">No se encontró el alumno.</p>;

  const fullName = `${student.firstName} ${student.lastNamePaterno} ${student.lastNameMaterno}`;
  const totalGastado = sales.filter(s => s.status === 'completed').reduce((acc, s) => acc + s.amount, 0);

  return (
    <section className="grid gap-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs text-[#A9A9A9]">
            <Link to="/alumnos" className="hover:text-[#682222]">Alumnos</Link> / {fullName}
          </p>
          <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
          <p className="mt-0.5 font-mono text-sm text-[#682222]">DNI: {student.dni}</p>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-2 border-gray-200 hover:border-[#682222] hover:text-[#682222]">
          <Link to={`/alumnos/${student.id}/editar`}>
            <Pencil className="h-4 w-4" /> Editar
          </Link>
        </Button>
      </div>

      {/* ── Tabs ── */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        {/* Tab bar */}
        <div className="flex border-b border-gray-100">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setTab(tab.key)}
              className={cn(
                'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                activeTab === tab.key
                  ? 'border-b-2 border-[#682222] text-[#682222]'
                  : 'text-gray-500 hover:text-gray-900',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab: Perfil ── */}
        {activeTab === 'profile' && (
          <div className="grid gap-6 p-6 sm:grid-cols-2">
            <Section title="Datos personales">
              <Row label="DNI"            value={student.dni} mono />
              <Row label="Fecha de nac."  value={student.birthDate ? dateFmt.format(new Date(`${student.birthDate}T00:00:00`)) : '—'} />
              <Row label="Género"         value={student.gender === 'M' ? 'Masculino' : student.gender === 'F' ? 'Femenino' : student.gender ?? '—'} />
            </Section>

            <Section title="Contacto">
              <Row label="Email"    value={student.email ?? '—'} />
              <Row label="Celular"  value={student.phone} />
              <Row label="Distrito" value={student.district ?? '—'} />
              <Row label="Ciudad"   value={student.city ?? '—'} />
            </Section>

            <Section title="Información profesional">
              <Row label="¿Trabaja?"  value={student.isWorking ? 'Sí' : 'No'} />
              {student.isWorking && <Row label="Empresa" value={student.company ?? '—'} />}
              <Row label="Profesión" value={student.profession ?? '—'} />
              <div className="flex justify-between border-b border-gray-50 py-1.5">
                <span className="text-xs text-[#A9A9A9]">Fuente</span>
                <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', SOURCE_CLS[student.source])}>
                  {SOURCE_LABEL[student.source]}
                </span>
              </div>
            </Section>

            <Section title="Integración Moodle LMS">
              <Row label="Moodle User ID" value={student.moodleUserId != null ? String(student.moodleUserId) : '—'} mono />
              {student.moodleUserId == null && (
                <p className="text-[11px] text-[#A9A9A9]">Sin configurar — se completará cuando se active la integración con Moodle.</p>
              )}
            </Section>

            {student.notes && (
              <div className="sm:col-span-2">
                <Section title="Notas de secretaria">
                  <p className="text-sm leading-relaxed text-gray-700">{student.notes}</p>
                </Section>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Historial de cursos ── */}
        {activeTab === 'courses' && (
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">{sales.length} inscripción{sales.length !== 1 ? 'es' : ''}</p>
              <Button asChild variant="outline" size="sm" className="gap-1.5 border-gray-200 text-xs hover:border-[#682222] hover:text-[#682222]">
                <Link to={`/ventas/nueva?student_id=${student.id}`}>+ Nueva inscripción</Link>
              </Button>
            </div>
            {sales.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#A9A9A9]">No hay inscripciones registradas.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#682222] text-left text-xs text-white">
                    {['Curso', 'Monto', 'Estado', 'Fecha'].map((h) => (
                      <th key={h} className="px-4 py-2.5 font-semibold uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sales.map((s) => (
                    <tr key={s.id} className="border-b border-gray-100 hover:bg-[#fdf6f6]">
                      <td className="px-4 py-3 font-medium text-gray-900">{s.courseName}</td>
                      <td className="px-4 py-3 font-semibold text-[#682222]">{formatPrice(s.amount)}</td>
                      <td className="px-4 py-3 text-gray-600">{SALE_STATUS[s.status] ?? s.status}</td>
                      <td className="px-4 py-3 text-[#A9A9A9]">{dtFmt.format(new Date(s.date))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {totalGastado > 0 && (
              <p className="mt-4 text-right text-sm font-semibold text-gray-700">
                Total invertido: <span className="text-[#682222]">{formatPrice(totalGastado)}</span>
              </p>
            )}
          </div>
        )}

        {/* ── Tab: Certificados ── */}
        {activeTab === 'certificates' && (
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">{certs.length} certificado{certs.length !== 1 ? 's' : ''}</p>
              <Button asChild variant="outline" size="sm" className="gap-1.5 border-gray-200 text-xs hover:border-[#682222] hover:text-[#682222]">
                <Link to={`/certificados/nuevo?student_id=${student.id}`}>
                  <Award className="h-3.5 w-3.5" /> Emitir certificado
                </Link>
              </Button>
            </div>
            {certs.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#A9A9A9]">No hay certificados emitidos.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#682222] text-left text-xs text-white">
                    {['Nº Certificado', 'Curso', 'Fecha emisión', 'Estado'].map((h) => (
                      <th key={h} className="px-4 py-2.5 font-semibold uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {certs.map((c) => (
                    <tr key={c.id} className="border-b border-gray-100 hover:bg-[#fdf6f6]">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-[#682222]">{c.certificateNumber}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{c.courseName}</td>
                      <td className="px-4 py-3 text-[#A9A9A9]">{dateFmt.format(new Date(`${c.issuedAt}T00:00:00`))}</td>
                      <td className="px-4 py-3 text-gray-600">{CERT_STATUS[c.status] ?? c.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Tab: Eventos ── */}
        {activeTab === 'events' && (
          <div className="p-6">
            <p className="mb-4 text-sm font-medium text-gray-700">{evRegs.length} evento{evRegs.length !== 1 ? 's' : ''} asistidos</p>
            {evRegs.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#A9A9A9]">No hay eventos registrados.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#682222] text-left text-xs text-white">
                    {['Evento', '¿Quiere certificado?', 'Fuente', 'Fecha inscripción'].map((h) => (
                      <th key={h} className="px-4 py-2.5 font-semibold uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {evRegs.map((r) => (
                    <tr key={r.id} className="border-b border-gray-100 hover:bg-[#fdf6f6]">
                      <td className="px-4 py-3 font-medium text-gray-900">{r.eventId}</td>
                      <td className="px-4 py-3">{r.wantsCertificate ? <span className="text-emerald-600">Sí</span> : <span className="text-gray-400">No</span>}</td>
                      <td className="px-4 py-3 text-gray-600">{SOURCE_LABEL[r.source] ?? r.source}</td>
                      <td className="px-4 py-3 text-[#A9A9A9]">{dtFmt.format(new Date(r.createdAt))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#A9A9A9]">{title}</p>
      <div className="rounded-lg border border-gray-100 p-4">{children}</div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between border-b border-gray-50 py-1.5 last:border-0">
      <span className="text-xs text-[#A9A9A9]">{label}</span>
      <span className={cn('text-sm text-gray-900', mono && 'font-mono text-xs')}>{value}</span>
    </div>
  );
}
