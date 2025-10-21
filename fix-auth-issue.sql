-- Fix Auth and Profiles Setup
-- Run this in Supabase SQL Editor

-- First, check if profiles table exists and has correct structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add organization_id column if missing (might be needed)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Make employee_id nullable for testing (it gets set after signup)
ALTER TABLE public.profiles ALTER COLUMN employee_id DROP NOT NULL;

-- Make department nullable for testing (it gets set after signup)
ALTER TABLE public.profiles ALTER COLUMN department DROP NOT NULL;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Allow users to insert their own profile after signup
CREATE POLICY "Allow users to insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow anon to insert profiles (for signup process)
CREATE POLICY "Allow anon to insert profiles during signup"
ON public.profiles FOR INSERT
TO anon
WITH CHECK (true);

-- Allow users to view their own profile
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "Allow users to view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "Allow users to update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Check current policies on profiles
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

