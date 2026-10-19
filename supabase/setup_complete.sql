-- ==============================================================================
-- SWISS BEAUTY PARLOUR — COMPLETE DATABASE SETUP (RUN IN SUPABASE SQL EDITOR)
-- Project: https://wovgareiqeipezehktzv.supabase.co
-- ==============================================================================

-- 1. Create Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL CHECK (char_length(trim(customer_name)) >= 2),
  phone text NOT NULL CHECK (char_length(trim(phone)) >= 10),
  service text NOT NULL CHECK (char_length(trim(service)) >= 2),
  appointment_date date NOT NULL,
  appointment_time text NOT NULL CHECK (char_length(trim(appointment_time)) >= 2),
  notes text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email text
);

-- Indexes for lightning-fast queries and filters
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON public.appointments (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments (appointment_date DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments (status);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments (user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_email ON public.appointments (customer_email);

-- 2. Dedicated Admin Users Table (Prevents standard registered users from accessing admin features)
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Customer Profiles Table (Stores client details upon self-registration)
CREATE TABLE IF NOT EXISTS public.customer_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL CHECK (char_length(trim(full_name)) >= 2),
  phone text NOT NULL CHECK (char_length(trim(phone)) >= 10),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Helper Functions (SECURITY DEFINER with strict search_path)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()) THEN 'admin'
    WHEN auth.uid() IS NOT NULL THEN 'customer'
    ELSE 'anonymous'
  END;
$$;

-- 6. RLS Policies for admin_users
DROP POLICY IF EXISTS "Admins can view own admin profile" ON public.admin_users;
CREATE POLICY "Admins can view own admin profile"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 7. RLS Policies for customer_profiles
DROP POLICY IF EXISTS "Customers can view own profile" ON public.customer_profiles;
CREATE POLICY "Customers can view own profile"
  ON public.customer_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Customers can insert own profile" ON public.customer_profiles;
CREATE POLICY "Customers can insert own profile"
  ON public.customer_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Customers can update own profile" ON public.customer_profiles;
CREATE POLICY "Customers can update own profile"
  ON public.customer_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 8. RLS Policies for appointments

-- Allow public and authenticated clients to insert appointments (always starting as pending)
DROP POLICY IF EXISTS "Allow public to submit appointments" ON public.appointments;
CREATE POLICY "Allow public to submit appointments"
  ON public.appointments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(trim(customer_name)) >= 2
    AND char_length(trim(phone)) >= 10
    AND char_length(trim(service)) >= 2
    AND appointment_date IS NOT NULL
    AND char_length(trim(appointment_time)) >= 2
    AND (status = 'pending')
  );

-- Admins can view all appointments; Customers can view only their own bookings
DROP POLICY IF EXISTS "Only authorized admins can view appointments" ON public.appointments;
DROP POLICY IF EXISTS "Customers and admins can view appointments" ON public.appointments;
CREATE POLICY "Customers and admins can view appointments"
  ON public.appointments
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR auth.uid() = user_id
    OR (customer_email IS NOT NULL AND customer_email = (auth.jwt() ->> 'email'))
  );

-- Admins can update any appointment status or details
DROP POLICY IF EXISTS "Only authorized admins can update appointments" ON public.appointments;
CREATE POLICY "Only authorized admins can update appointments"
  ON public.appointments
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Customers can cancel their own pending appointments
DROP POLICY IF EXISTS "Customers can cancel their own pending appointments" ON public.appointments;
CREATE POLICY "Customers can cancel their own pending appointments"
  ON public.appointments
  FOR UPDATE
  TO authenticated
  USING (
    (auth.uid() = user_id OR (customer_email IS NOT NULL AND customer_email = (auth.jwt() ->> 'email')))
    AND status = 'pending'
  )
  WITH CHECK (
    status = 'cancelled'
  );

-- Only verified admins can delete appointments
DROP POLICY IF EXISTS "Only authorized admins can delete appointments" ON public.appointments;
CREATE POLICY "Only authorized admins can delete appointments"
  ON public.appointments
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ==============================================================================
-- OWNER ACCOUNT SETUP INSTRUCTION:
-- Once you register/sign up your owner email via the unified login page (/login),
-- run this command with your email to grant full Admin privileges:
--
-- INSERT INTO public.admin_users (user_id, email)
-- SELECT id, email FROM auth.users WHERE email = 'YOUR_EMAIL@EXAMPLE.COM'
-- ON CONFLICT (user_id) DO NOTHING;
-- ==============================================================================
