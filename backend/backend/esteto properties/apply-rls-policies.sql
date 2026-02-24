-- ============================================
-- ESTATO ADMIN PANEL - RLS POLICIES
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Create the is_admin() helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Enable RLS on core tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing conflicting policies (safe to run multiple times)
DROP POLICY IF EXISTS "Users readable for admin panel" ON public.users;
DROP POLICY IF EXISTS "Properties readable for admin panel" ON public.properties;
DROP POLICY IF EXISTS "All properties readable for admin" ON public.properties;

-- Step 4: Create public read policies for admin panel
-- Users: allow anon to read all users for admin user management
CREATE POLICY "Users readable for admin panel" ON public.users 
  FOR SELECT USING (true);

-- Properties: allow anon to read ALL properties (not just active) for admin
CREATE POLICY "All properties readable for admin" ON public.properties 
  FOR SELECT USING (true);
