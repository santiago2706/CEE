import type { ApiResponse, Certificate, CertificateStatus } from '@cee/types';
import { mockCertificates } from '@/mocks/certificates.mock';
import { supabase } from '@/lib/supabase';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 350): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

export interface CertificateFormInput {
  studentName: string;
  courseId: string;
  courseName: string;
  issuedAt: string;   // ISO date "YYYY-MM-DD"
  notes?: string | null;
}

// In-memory cache for mock mode
let certsCache: Certificate[] = [...mockCertificates];

// ── Helpers ──────────────────────────────────────────────────────────────────

function nextCertNumber(certs: Certificate[]): string {
  const year = new Date().getFullYear();
  const max = certs.reduce((m, c) => {
    const parts = c.certificateNumber.split('-');
    const n = parseInt(parts[2] ?? '0', 10);
    return Math.max(m, n);
  }, 0);
  return `CEE-${year}-${String(max + 1).padStart(4, '0')}`;
}

interface CertRow {
  id: string;
  certificate_number: string;
  student_name: string;
  course_id: string | null;
  course_name: string;
  issued_at: string;
  status: CertificateStatus;
  signed_document_url: string | null;
  signature_provider: 'manual' | 'digital';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function rowToCert(row: CertRow): Certificate {
  return {
    id: row.id,
    certificateNumber: row.certificate_number,
    studentName: row.student_name,
    courseId: row.course_id ?? '',
    courseName: row.course_name,
    issuedAt: row.issued_at,
    status: row.status,
    signedDocumentUrl: row.signed_document_url,
    signatureProvider: row.signature_provider,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── Service ───────────────────────────────────────────────────────────────────

export const certificatesService = {
  async getCertificates(): Promise<ApiResponse<Certificate[]>> {
    if (USE_MOCKS) {
      const sorted = [...certsCache].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
      return delay({ data: sorted });
    }

    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('issued_at', { ascending: false });

    if (error) throw new Error('No se pudieron cargar los certificados.');
    return { data: (data ?? []).map((r) => rowToCert(r as CertRow)) };
  },

  async createCertificate(input: CertificateFormInput): Promise<ApiResponse<Certificate>> {
    if (USE_MOCKS) {
      const now = new Date().toISOString();
      const certNumber = nextCertNumber(certsCache);
      const newCert: Certificate = {
        id: `cert-${Date.now()}`,
        certificateNumber: certNumber,
        studentName: input.studentName,
        courseId: input.courseId,
        courseName: input.courseName,
        issuedAt: input.issuedAt,
        status: 'draft',
        signedDocumentUrl: null,
        signatureProvider: 'manual',
        notes: input.notes ?? null,
        createdAt: now,
        updatedAt: now,
      };
      certsCache = [newCert, ...certsCache];
      return delay({ data: newCert });
    }

    // Real mode: get current max to build the next cert number
    const { data: existing } = await supabase
      .from('certificates')
      .select('certificate_number')
      .order('certificate_number', { ascending: false })
      .limit(1);

    const tempCerts: Certificate[] = (existing ?? []).map((r) => ({
      certificateNumber: (r as { certificate_number: string }).certificate_number,
    } as Certificate));

    const certNumber = nextCertNumber(tempCerts);

    const { data, error } = await supabase
      .from('certificates')
      .insert({
        certificate_number: certNumber,
        student_name: input.studentName,
        course_id: input.courseId || null,
        course_name: input.courseName,
        issued_at: input.issuedAt,
        status: 'draft',
        signature_provider: 'manual',
        notes: input.notes ?? null,
      })
      .select('*')
      .single();

    if (error || !data) throw new Error('No se pudo crear el certificado.');
    return { data: rowToCert(data as CertRow) };
  },

  async updateStatus(id: string, status: CertificateStatus): Promise<ApiResponse<Certificate>> {
    if (USE_MOCKS) {
      const idx = certsCache.findIndex((c) => c.id === id);
      if (idx === -1) throw new Error(`Certificado no encontrado: ${id}`);
      const now = new Date().toISOString();
      certsCache[idx] = { ...certsCache[idx], status, updatedAt: now };
      return delay({ data: certsCache[idx] });
    }

    const { data, error } = await supabase
      .from('certificates')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) throw new Error('No se pudo actualizar el estado.');
    return { data: rowToCert(data as CertRow) };
  },

  async revoke(id: string): Promise<ApiResponse<Certificate>> {
    return certificatesService.updateStatus(id, 'revoked');
  },
};
