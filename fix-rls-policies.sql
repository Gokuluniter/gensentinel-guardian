-- Fix RLS Policies for Testing
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New Query

-- Allow authenticated users to insert organizations
DROP POLICY IF EXISTS "Allow authenticated users to create organizations" ON public.organizations;
CREATE POLICY "Allow authenticated users to create organizations"
ON public.organizations FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to view all organizations (for testing)
DROP POLICY IF EXISTS "Allow authenticated users to view organizations" ON public.organizations;
CREATE POLICY "Allow authenticated users to view organizations"
ON public.organizations FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to update organizations (for testing)
DROP POLICY IF EXISTS "Allow authenticated users to update organizations" ON public.organizations;
CREATE POLICY "Allow authenticated users to update organizations"
ON public.organizations FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Also allow anon users to create organizations for signup (important for test script!)
DROP POLICY IF EXISTS "Allow anon users to create organizations" ON public.organizations;
CREATE POLICY "Allow anon users to create organizations"
ON public.organizations FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anon users to view organizations (for checking if exists)
DROP POLICY IF EXISTS "Allow anon users to view organizations" ON public.organizations;
CREATE POLICY "Allow anon users to view organizations"
ON public.organizations FOR SELECT
TO anon
USING (true);

-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'organizations'
ORDER BY policyname;

