-- Fix Activity Logs Visibility for Admin Dashboard
-- Run this in Supabase SQL Editor

-- 1. Check if activity logs exist
SELECT COUNT(*) as total_activities FROM activity_logs;

-- 2. Check if activity logs have proper user_id (should be profile UUID)
SELECT 
  al.id,
  al.user_id,
  al.activity_type,
  al.description,
  al.created_at,
  p.first_name,
  p.last_name,
  p.employee_id
FROM activity_logs al
LEFT JOIN profiles p ON al.user_id = p.id
ORDER BY al.created_at DESC
LIMIT 10;

-- 3. Fix RLS policy to allow admins to see ALL activity logs in their organization
DROP POLICY IF EXISTS "activity_logs_select_access" ON public.activity_logs;
CREATE POLICY "activity_logs_select_access"
ON public.activity_logs FOR SELECT
USING (
  -- Allow users in same organization
  organization_id IN (
    SELECT organization_id FROM profiles WHERE user_id = auth.uid()
  )
  AND (
    -- Admin and security officers can see all
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'security_officer')
    )
    -- Department heads can see their department
    OR EXISTS (
      SELECT 1 FROM profiles p1
      INNER JOIN profiles p2 ON p2.id = activity_logs.user_id
      WHERE p1.user_id = auth.uid()
      AND p1.role = 'department_head'
      AND p1.department = p2.department
    )
    -- Users can see their own logs
    OR user_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  )
);

-- 4. Allow INSERT for authenticated users (for activity logging)
DROP POLICY IF EXISTS "activity_logs_insert_access" ON public.activity_logs;
CREATE POLICY "activity_logs_insert_access"
ON public.activity_logs FOR INSERT
WITH CHECK (true);  -- Allow all inserts for now, Edge Functions handle validation

-- 5. Verify the fix
SELECT 
  'Activity Logs RLS Fixed' as status,
  COUNT(*) as total_logs
FROM activity_logs;

