-- Simple Fix for Admin Organization Issue
-- Step-by-step approach with verification at each step

-- Step 1: Check current state
SELECT '=== CURRENT STATE ===' as step;

SELECT 
  'Current Profiles' as info,
  email,
  organization_id,
  (SELECT name FROM organizations WHERE id = organization_id) as org_name
FROM profiles
WHERE email IN ('gokulnity@gmail.com', 'testuser@gensentinel.test');

SELECT 
  'Current Activities by Org' as info,
  organization_id,
  COUNT(*) as count
FROM activity_logs
GROUP BY organization_id;

-- Step 2: Create GenSentinel organization (if not exists)
SELECT '=== STEP 2: CREATE ORGANIZATION ===' as step;

INSERT INTO organizations (
  name,
  industry,
  company_size,
  primary_contact_email,
  primary_contact_name,
  is_active
) VALUES (
  'GenSentinel',
  'Cybersecurity',
  'Enterprise',
  'gokulnity@gmail.com',
  'Gokula Krishnan R C',
  true
)
ON CONFLICT (name) DO NOTHING;

SELECT 
  'GenSentinel Org Created/Found' as info,
  id,
  name,
  primary_contact_email
FROM organizations
WHERE name = 'GenSentinel';

-- Step 3: Get the GenSentinel org ID
DO $$
DECLARE
  v_gensentinel_org_id UUID;
  v_admin_email TEXT := 'gokulnity@gmail.com';
  v_test_email TEXT := 'testuser@gensentinel.test';
BEGIN
  -- Get GenSentinel org ID
  SELECT id INTO v_gensentinel_org_id
  FROM organizations
  WHERE name = 'GenSentinel';
  
  IF v_gensentinel_org_id IS NULL THEN
    RAISE EXCEPTION 'GenSentinel organization not found!';
  END IF;
  
  RAISE NOTICE 'GenSentinel Org ID: %', v_gensentinel_org_id;
  
  -- Step 4: Update admin profile
  UPDATE profiles
  SET organization_id = v_gensentinel_org_id
  WHERE email = v_admin_email;
  
  RAISE NOTICE '✅ Updated admin organization';
  
  -- Step 5: Update test profile
  UPDATE profiles
  SET organization_id = v_gensentinel_org_id
  WHERE email = v_test_email;
  
  RAISE NOTICE '✅ Updated test account organization';
  
  -- Step 6: Update ALL activity logs to GenSentinel
  -- (NULL activities + any other org activities)
  UPDATE activity_logs
  SET organization_id = v_gensentinel_org_id
  WHERE organization_id IS NULL 
     OR organization_id != v_gensentinel_org_id;
  
  RAISE NOTICE '✅ Updated activity logs';
  
  -- Step 7: Update threat detections (if column exists)
  BEGIN
    EXECUTE format('
      UPDATE threat_detections
      SET organization_id = %L
      WHERE organization_id IS NULL 
         OR organization_id != %L
    ', v_gensentinel_org_id, v_gensentinel_org_id);
    
    RAISE NOTICE '✅ Updated threat detections';
  EXCEPTION
    WHEN undefined_column THEN
      RAISE NOTICE '⚠️ threat_detections has no organization_id column';
  END;
  
END $$;

-- Step 8: Verify the fix
SELECT '=== VERIFICATION ===' as step;

-- Check profiles are in same org
SELECT 
  'Profiles After Fix' as info,
  email,
  organization_id,
  (SELECT name FROM organizations WHERE id = organization_id) as org_name,
  role
FROM profiles
WHERE email IN ('gokulnity@gmail.com', 'testuser@gensentinel.test');

-- Check activity logs
SELECT 
  'Activity Logs After Fix' as info,
  organization_id,
  (SELECT name FROM organizations WHERE id = organization_id) as org_name,
  COUNT(*) as activity_count
FROM activity_logs
GROUP BY organization_id, (SELECT name FROM organizations WHERE id = organization_id);

-- Check what admin can see
SELECT 
  'Activities Admin Can See' as info,
  COUNT(*) as total_activities
FROM activity_logs al
WHERE al.organization_id = (
  SELECT organization_id 
  FROM profiles 
  WHERE email = 'gokulnity@gmail.com'
);

-- Show recent activities
SELECT 
  'Recent Activities (Last 10)' as info,
  al.activity_type,
  al.description,
  al.created_at,
  p.email
FROM activity_logs al
LEFT JOIN profiles p ON al.user_id = p.id
WHERE al.organization_id = (
  SELECT organization_id 
  FROM profiles 
  WHERE email = 'gokulnity@gmail.com'
)
ORDER BY al.created_at DESC
LIMIT 10;

-- Final success message
SELECT 
  '✅ FIX COMPLETE' as status,
  'Admin and test account in same organization' as result,
  'Refresh admin dashboard to see activity logs' as action;

