-- ==============================================================================
-- SWISS BEAUTY PARLOUR — APPOINTMENT DATABASE SCHEMA & ROW LEVEL SECURITY
-- Migration Version: 20261018000000
-- ==============================================================================

-- 1. Create appointments table
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(trim(customer_name)) >= 2),
  phone text not null check (char_length(trim(phone)) >= 10),
  service text not null check (char_length(trim(service)) >= 2),
  appointment_date date not null,
  appointment_time text not null check (char_length(trim(appointment_time)) >= 2),
  notes text default '',
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

-- 2. Indexes for fast dashboard filtering & sorting
create index if not exists idx_appointments_created_at on public.appointments (created_at desc);
create index if not exists idx_appointments_date on public.appointments (appointment_date desc);
create index if not exists idx_appointments_status on public.appointments (status);

-- 3. Dedicated Admin Users Table (Prevents any standard registered user from gaining admin privileges)
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

-- 4. Enable Row Level Security (RLS) on both tables
alter table public.appointments enable row level security;
alter table public.admin_users enable row level security;

-- 5. Helper function: is_admin() (SECURITY DEFINER with strict search_path)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid()
  );
$$;

-- 6. RLS Policies for admin_users
-- Admins can only view their own admin verification record
create policy "Admins can view own admin profile"
  on public.admin_users
  for select
  to authenticated
  using (auth.uid() = user_id);

-- 7. RLS Policies for appointments

-- POLICY 1: Public (Anonymous & Authenticated) may INSERT appointment requests ONLY
-- Strict validation ensures status is always 'pending' upon creation.
create policy "Allow public to submit appointments"
  on public.appointments
  for insert
  to anon, authenticated
  with check (
    char_length(trim(customer_name)) >= 2
    and char_length(trim(phone)) >= 10
    and char_length(trim(service)) >= 2
    and appointment_date is not null
    and char_length(trim(appointment_time)) >= 2
    and (status = 'pending')
  );

-- POLICY 2: Only verified admins can SELECT (read/search) appointments
create policy "Only authorized admins can view appointments"
  on public.appointments
  for select
  to authenticated
  using (public.is_admin());

-- POLICY 3: Only verified admins can UPDATE appointment status or details
create policy "Only authorized admins can update appointments"
  on public.appointments
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- POLICY 4: Only verified admins can DELETE appointment records
create policy "Only authorized admins can delete appointments"
  on public.appointments
  for delete
  to authenticated
  using (public.is_admin());

-- ==============================================================================
-- OWNER ONBOARDING HELPER (Run by owner in Supabase SQL Editor once account is created)
-- ==============================================================================
-- To grant admin access to an account created in Authentication -> Users:
--
-- INSERT INTO public.admin_users (user_id, email)
-- SELECT id, email FROM auth.users WHERE email = 'YOUR_EMAIL@HERE.COM'
-- ON CONFLICT (user_id) DO NOTHING;
-- ==============================================================================
