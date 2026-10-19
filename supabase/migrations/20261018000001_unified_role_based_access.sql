-- ==============================================================================
-- SWISS BEAUTY PARLOUR — UNIFIED ROLE-BASED ACCESS & CUSTOMER PORTAL
-- Migration Version: 20261018000001
-- ==============================================================================

-- 1. Extend appointments table with user_id and customer_email links
alter table public.appointments
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists customer_email text;

create index if not exists idx_appointments_user_id on public.appointments (user_id);
create index if not exists idx_appointments_customer_email on public.appointments (customer_email);

-- 2. Customer Profiles Table (stores client name and phone upon registration)
create table if not exists public.customer_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) >= 2),
  phone text not null check (char_length(trim(phone)) >= 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customer_profiles enable row level security;

-- Customer profile RLS: Customers can view and update their own profile
create policy "Customers can view own profile"
  on public.customer_profiles
  for select
  to authenticated
  using (auth.uid() = id or public.is_admin());

create policy "Customers can insert own profile"
  on public.customer_profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Customers can update own profile"
  on public.customer_profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 3. Helper function: get_user_role() (SECURITY DEFINER with strict search_path)
create or replace function public.get_user_role()
returns text
language sql
security definer
set search_path = public
as $$
  select case
    when exists (select 1 from public.admin_users where user_id = auth.uid()) then 'admin'
    when auth.uid() is not null then 'customer'
    else 'anonymous'
  end;
$$;

-- 4. Customer RLS Policies on appointments

-- Drop any previous select policy to cleanly replace with unified policy
drop policy if exists "Only authorized admins can view appointments" on public.appointments;
drop policy if exists "Customers and admins can view appointments" on public.appointments;

-- Allow Admins to see all appointments, and Customers to view their own appointments
create policy "Customers and admins can view appointments"
  on public.appointments
  for select
  to authenticated
  using (
    public.is_admin()
    or auth.uid() = user_id
    or (customer_email is not null and customer_email = (auth.jwt() ->> 'email'))
  );

-- Customers can cancel their own pending appointment request
create policy "Customers can cancel their own pending appointments"
  on public.appointments
  for update
  to authenticated
  using (
    (auth.uid() = user_id or (customer_email is not null and customer_email = (auth.jwt() ->> 'email')))
    and status = 'pending'
  )
  with check (
    status = 'cancelled'
  );
