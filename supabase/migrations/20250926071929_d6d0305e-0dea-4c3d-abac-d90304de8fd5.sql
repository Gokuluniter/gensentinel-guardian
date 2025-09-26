-- Fix RLS policies by dropping all existing policies first and recreating them

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

-- Create security definer functions to get current user info safely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_current_user_department()
RETURNS department AS $$
  SELECT department FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_current_user_security_clearance()
RETURNS integer AS $$
  SELECT security_clearance FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_current_user_profile_id()
RETURNS uuid AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- Recreate profiles table policies
CREATE POLICY "profiles_select_own" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "profiles_update_own" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "profiles_select_admin" 
ON public.profiles FOR SELECT 
USING (public.get_current_user_role() IN ('admin', 'security_officer'));

CREATE POLICY "profiles_update_admin" 
ON public.profiles FOR UPDATE 
USING (
  (auth.uid() = user_id) OR 
  (public.get_current_user_role() IN ('admin', 'security_officer'))
);

CREATE POLICY "profiles_insert_admin" 
ON public.profiles FOR INSERT 
WITH CHECK (public.get_current_user_role() IN ('admin', 'security_officer'));

CREATE POLICY "profiles_delete_admin" 
ON public.profiles FOR DELETE 
USING (public.get_current_user_role() IN ('admin', 'security_officer'));

-- Update documents policies
DROP POLICY IF EXISTS "Users can view documents they have access to" ON public.documents;
CREATE POLICY "documents_select_access" 
ON public.documents FOR SELECT 
USING (
  -- Admins and security officers see everything
  (public.get_current_user_role() IN ('admin', 'security_officer')) OR
  -- Regular users see documents from their department with appropriate security clearance
  (
    department = public.get_current_user_department() AND 
    security_level <= public.get_current_user_security_clearance()
  )
);

-- Update projects policies
DROP POLICY IF EXISTS "Users can view projects in their department" ON public.projects;
CREATE POLICY "projects_select_access" 
ON public.projects FOR SELECT 
USING (
  -- Admins and security officers see everything
  (public.get_current_user_role() IN ('admin', 'security_officer')) OR
  -- Department heads see all projects in their department
  (
    public.get_current_user_role() = 'department_head' AND 
    department = public.get_current_user_department()
  ) OR
  -- Regular users see projects they're assigned to (manager)
  (manager_id = public.get_current_user_profile_id())
);

-- Update activity logs policies
DROP POLICY IF EXISTS "Users can view their own activity logs" ON public.activity_logs;
CREATE POLICY "activity_logs_select_access" 
ON public.activity_logs FOR SELECT 
USING (
  -- Security officers and admins see all logs
  (public.get_current_user_role() IN ('admin', 'security_officer')) OR
  -- Department heads see logs from their department users
  (
    public.get_current_user_role() = 'department_head' AND
    user_id IN (
      SELECT id FROM public.profiles 
      WHERE department = public.get_current_user_department()
    )
  ) OR
  -- Users see their own logs
  (user_id = public.get_current_user_profile_id())
);