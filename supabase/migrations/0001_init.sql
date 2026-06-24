-- ============================================================
-- CEE-FIIS — Fase 6: esquema inicial de Supabase
-- Tablas + triggers + RLS + bucket de Storage para sílabos PDF
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 1. PROFILES (sincronizado con auth.users)
-- ------------------------------------------------------------
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null,
  role text not null default 'student' check (role in ('admin', 'student')),
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Usuario Nuevo'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    coalesce(new.raw_user_meta_data->>'avatarUrl', '')
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper: evita recursión de RLS al consultar el propio rol dentro de policies
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable set search_path = public;

create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin());

-- ------------------------------------------------------------
-- 2. INSTRUCTORES
-- ------------------------------------------------------------
create table public.instructors (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  title text not null,
  bio text not null,
  photo_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.instructors enable row level security;

create policy "instructors_select_public" on public.instructors
  for select using (true);
create policy "instructors_admin_insert" on public.instructors
  for insert with check (public.is_admin());
create policy "instructors_admin_update" on public.instructors
  for update using (public.is_admin());
create policy "instructors_admin_delete" on public.instructors
  for delete using (public.is_admin());

-- ------------------------------------------------------------
-- 3. CURSOS
-- ------------------------------------------------------------
create table public.courses (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  category text not null check (category in ('Ingeniería', 'Gestión', 'Tecnología', 'Habilidades Blandas', 'Finanzas')),
  modality text not null check (modality in ('Virtual', 'Presencial', 'Híbrido')),
  level text not null check (level in ('Básico', 'Intermedio', 'Avanzado')),
  short_description text not null,
  description text not null,
  price numeric(10,2) not null,
  original_price numeric(10,2),
  image_url text not null,
  academic_hours int not null,
  certification text not null,
  rating numeric(3,2) default 5.0 not null,
  enrolled_count int default 0 not null,
  moodle_course_id int,
  syllabus_pdf_url text,
  status text not null default 'draft' check (status in ('published', 'draft', 'review')),
  graduate_profile text[] default '{}'::text[] not null,
  benefits text[] default '{}'::text[] not null,
  syllabus jsonb default '[]'::jsonb not null,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.courses enable row level security;

-- Mantiene created_by / updated_by / updated_at automáticamente
create or replace function public.handle_course_audit()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := auth.uid();
    new.updated_by := auth.uid();
  else
    new.updated_by := auth.uid();
    new.updated_at := timezone('utc'::text, now());
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create or replace trigger courses_audit
  before insert or update on public.courses
  for each row execute procedure public.handle_course_audit();

create policy "courses_select_published_or_admin" on public.courses
  for select using (status = 'published' or public.is_admin());
create policy "courses_admin_insert" on public.courses
  for insert with check (public.is_admin());
create policy "courses_admin_update" on public.courses
  for update using (public.is_admin());
create policy "courses_admin_delete" on public.courses
  for delete using (public.is_admin());

-- ------------------------------------------------------------
-- 4. TABLA INTERMEDIA CURSOS - INSTRUCTORES (N a N)
-- ------------------------------------------------------------
create table public.course_instructors (
  course_id uuid references public.courses(id) on delete cascade,
  instructor_id uuid references public.instructors(id) on delete cascade,
  primary key (course_id, instructor_id)
);

alter table public.course_instructors enable row level security;

create policy "course_instructors_select_public" on public.course_instructors
  for select using (true);
create policy "course_instructors_admin_insert" on public.course_instructors
  for insert with check (public.is_admin());
create policy "course_instructors_admin_delete" on public.course_instructors
  for delete using (public.is_admin());

-- ------------------------------------------------------------
-- 5. VENTAS / TRANSACCIONES
-- ------------------------------------------------------------
create table public.sales (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses(id) on delete restrict,
  course_name text not null,
  user_id uuid references public.profiles(id) on delete restrict,
  amount numeric(10,2) not null,
  status text not null default 'pending' check (status in ('completed', 'pending', 'refunded')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.sales enable row level security;

create policy "sales_select_own_or_admin" on public.sales
  for select using (auth.uid() = user_id or public.is_admin());
create policy "sales_insert_own_or_admin" on public.sales
  for insert with check (auth.uid() = user_id or public.is_admin());
create policy "sales_admin_update" on public.sales
  for update using (public.is_admin());
create policy "sales_admin_delete" on public.sales
  for delete using (public.is_admin());

-- ------------------------------------------------------------
-- 6. LEADS / CONTACTOS
-- ------------------------------------------------------------
create table public.contact_leads (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  course_interest text,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.contact_leads enable row level security;

create policy "contact_leads_insert_public" on public.contact_leads
  for insert with check (true);
create policy "contact_leads_select_admin" on public.contact_leads
  for select using (public.is_admin());
create policy "contact_leads_admin_update" on public.contact_leads
  for update using (public.is_admin());
create policy "contact_leads_admin_delete" on public.contact_leads
  for delete using (public.is_admin());

-- ------------------------------------------------------------
-- 7. VIDEOS (MULTIMEDIA)
-- ------------------------------------------------------------
create table public.videos (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  thumbnail_url text not null,
  video_url text not null,
  duration int not null,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.videos enable row level security;

create policy "videos_select_public" on public.videos
  for select using (true);
create policy "videos_admin_insert" on public.videos
  for insert with check (public.is_admin());
create policy "videos_admin_update" on public.videos
  for update using (public.is_admin());
create policy "videos_admin_delete" on public.videos
  for delete using (public.is_admin());

-- ------------------------------------------------------------
-- 8. STORAGE — bucket de sílabos PDF
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('syllabus-pdfs', 'syllabus-pdfs', true)
on conflict (id) do nothing;

create policy "syllabus_pdfs_read_public" on storage.objects
  for select using (bucket_id = 'syllabus-pdfs');
create policy "syllabus_pdfs_admin_insert" on storage.objects
  for insert with check (bucket_id = 'syllabus-pdfs' and public.is_admin());
create policy "syllabus_pdfs_admin_update" on storage.objects
  for update using (bucket_id = 'syllabus-pdfs' and public.is_admin());
create policy "syllabus_pdfs_admin_delete" on storage.objects
  for delete using (bucket_id = 'syllabus-pdfs' and public.is_admin());
