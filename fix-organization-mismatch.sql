-- Fix Organization Mismatch - Activity Logs Empty Issue
-- The test account and admin are in different organizations!

-- Step 1: Check current organizations
SELECT 
  'Organizations' as table_name,
  id,
  name,
  primary_contact_email,
  created_at
FROM organizations
ORDER BY created_at DESC;

-- Step 2: Check admin and test account organizations
SELECT 
  'Admin vs Test Account Organizations' as info,
  p.email,
  p.first_name,
  p.last_name,
  p.role,
  p.organization_id,
  o.name as org_name
FROM profiles p
LEFT JOIN organizations o ON p.organization_id = o.id
WHERE p.email IN ('gokulnity@gmail.com', 'testuser@gensentinel.test')
ORDER BY p.created_at;

-- Step 3: Check activity logs by organization
SELECT 
  'Activity Logs by Organization' as info,
  al.organization_id,
  o.name as org_name,
  COUNT(*) as activity_count
FROM activity_logs al
LEFT JOIN organizations o ON al.organization_id = o.id
GROUP BY al.organization_id, o.name
ORDER BY activity_count DESC;

-- ============================================
-- SOLUTION: Move test account to admin's organization
-- ============================================

-- Step 4: Get admin's organization ID
DO $$
DECLARE
  admin_org_id UUID;
  test_org_id UUID;
BEGIN
  -- Get admin's organization
  SELECT organization_id INTO admin_org_id
  FROM profiles
  WHERE email = 'gokulnity@gmail.com';
  
  -- Get test account's organization
  SELECT organization_id INTO test_org_id
  FROM profiles
  WHERE email = 'testuser@gensentinel.test';
  
  RAISE NOTICE 'Admin org: %, Test org: %', admin_org_id, test_org_id;
  
  -- Move test account to admin's organization
  UPDATE profiles
  SET organization_id = admin_org_id
  WHERE email = 'testuser@gensentinel.test';
  
  -- Move all test account activities to admin's organization
  UPDATE activity_logs
  SET organization_id = admin_org_id
  WHERE organization_id = test_org_id;
  
  -- Move all ML predictions
  UPDATE ml_threat_predictions
  SET organization_id = admin_org_id
  WHERE profile_id IN (
    SELECT id FROM profiles WHERE email = 'testuser@gensentinel.test'
  );
  
  -- Move all threat detections
  UPDATE threat_detections
  SET organization_id = admin_org_id
  WHERE user_id IN (
    SELECT id FROM profiles WHERE email = 'testuser@gensentinel.test'
  );
  
  RAISE NOTICE 'Successfully moved test account and activities to admin organization';
END $$;

-- Step 5: Verify the fix
SELECT 
  'Verification - All in Same Org Now' as status,
  p.email,
  p.organization_id,
  o.name as org_name,
  (SELECT COUNT(*) FROM activity_logs WHERE organization_id = p.organization_id) as activities_in_org
FROM profiles p
LEFT JOIN organizations o ON p.organization_id = o.id
WHERE p.email IN ('gokulnity@gmail.com', 'testuser@gensentinel.test');

-- Step 6: Verify admin can now see activity logs
SELECT 
  'Activity Logs Now Visible to Admin' as info,
  al.activity_type,
  al.description,
  al.created_at,
  p.email as user_email,
  p.first_name,
  p.last_name
FROM activity_logs al
INNER JOIN profiles p ON al.user_id = p.id
WHERE al.organization_id = (
  SELECT organization_id FROM profiles WHERE email = 'gokulnity@gmail.com'
)
ORDER BY al.created_at DESC
LIMIT 10;

-- ============================================
-- ALTERNATIVE: If you want to test with separate organizations
-- ============================================

-- Option B: Make admin see ALL organizations (Super Admin)
-- Uncomment these lines if you want admin to see everything:

-- UPDATE profiles
-- SET role = 'admin'
-- WHERE email = 'gokulnity@gmail.com';

-- -- Then modify RLS policy to allow super admins to see all orgs
-- DROP POLICY IF EXISTS "activity_logs_select_access" ON public.activity_logs;
-- CREATE POLICY "activity_logs_select_access"
-- ON public.activity_logs FOR SELECT
-- USING (
--   -- Super admin sees everything
--   EXISTS (
--     SELECT 1 FROM profiles 
--     WHERE user_id = auth.uid() 
--     AND email = 'gokulnity@gmail.com'  -- Your admin email
--   )
--   OR
--   -- Regular users see their organization only
--   organization_id IN (
--     SELECT organization_id FROM profiles WHERE user_id = auth.uid()
--   )
-- );

-- ============================================
-- Summary
-- ============================================
SELECT 
  '✅ Fix Applied' as status,
  'Test account moved to admin organization' as action,
  'Admin can now see all test activities' as result;

