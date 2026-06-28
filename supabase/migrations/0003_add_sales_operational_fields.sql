-- Adds student_name (denormalized for display without JOIN),
-- notes (optional secretaria notes), and updated_at (status change tracking).

ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS student_name text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS notes        text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS updated_at   timestamp with time zone
    DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Auto-update updated_at on any row change
CREATE OR REPLACE FUNCTION public.handle_sales_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language plpgsql security definer set search_path = public;

CREATE OR REPLACE TRIGGER sales_updated_at
  BEFORE UPDATE ON public.sales
  FOR EACH ROW EXECUTE PROCEDURE public.handle_sales_updated_at();

-- Allow admin to update status and notes
DROP POLICY IF EXISTS "sales_admin_update_status" ON public.sales;
CREATE POLICY "sales_admin_update_status" ON public.sales
  FOR UPDATE USING (public.is_admin());
