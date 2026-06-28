-- Tabla de certificados emitidos por el CEE.
-- course_id es nullable para permitir certificados creados antes de que el
-- curso tenga un registro en Supabase (migración incremental).

CREATE TABLE public.certificates (
  id                   uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  certificate_number   text UNIQUE NOT NULL,
  student_name         text NOT NULL,
  course_id            uuid REFERENCES public.courses(id) ON DELETE RESTRICT,
  course_name          text NOT NULL,
  issued_at            date NOT NULL,
  status               text NOT NULL DEFAULT 'draft'
                         CHECK (status IN ('draft', 'pending_signature', 'signed', 'revoked')),
  signed_document_url  text,
  signature_provider   text NOT NULL DEFAULT 'manual'
                         CHECK (signature_provider IN ('manual', 'digital')),
  notes                text,
  created_at           timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at           timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.handle_certificates_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language plpgsql security definer set search_path = public;

CREATE OR REPLACE TRIGGER certificates_updated_at
  BEFORE UPDATE ON public.certificates
  FOR EACH ROW EXECUTE PROCEDURE public.handle_certificates_updated_at();

DROP POLICY IF EXISTS "certificates_select_admin" ON public.certificates;
CREATE POLICY "certificates_select_admin" ON public.certificates
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "certificates_insert_admin" ON public.certificates;
CREATE POLICY "certificates_insert_admin" ON public.certificates
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "certificates_update_admin" ON public.certificates;
CREATE POLICY "certificates_update_admin" ON public.certificates
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "certificates_delete_admin" ON public.certificates;
CREATE POLICY "certificates_delete_admin" ON public.certificates
  FOR DELETE USING (public.is_admin());
