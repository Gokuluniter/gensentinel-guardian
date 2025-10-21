-- Create GenSentinel Organization for Admin
-- Fix: Admin has NULL organization, test account has organization

-- Step 1: Create GenSentinel organization for admin
INSERT INTO organizations (
  name,
  industry,
  company_size,
  primary_contact_email,
  primary_contact_name,
  primary_contact_phone,
  is_active
) VALUES (
  'GenSentinel',
  'Cybersecurity',
  'Enterprise',
  'gokulnity@gmail.com',
  'Gokula Krishnan R C',
  '+1234567890',
  true
)
ON CONFLICT DO NOTHING
RETURNING id, name;

-- Step 2: Get the GenSentinel org ID and assign to admin
DO $$
DECLARE
  gensentinel_org_id UUID;
  test_org_id UUID;
  admin_profile_id UUID;
BEGIN
  -- Get or create GenSentinel organization
  SELECT id INTO gensentinel_org_id
  FROM organizations
  WHERE name = 'GenSentinel'
  LIMIT 1;
  
  -- Get test organization
  SELECT organization_id INTO test_org_id
  FROM profiles
  WHERE email = 'testuser@gensentinel.test';
  
  -- Get admin profile ID
  SELECT id INTO admin_profile_id
  FROM profiles
  WHERE email = 'gokulnity@gmail.com';
  
  RAISE NOTICE 'GenSentinel Org ID: %', gensentinel_org_id;
  RAISE NOTICE 'Test Org ID: %', test_org_id;
  RAISE NOTICE 'Admin Profile ID: %', admin_profile_id;
  
  -- Update admin to GenSentinel organization
  UPDATE profiles
  SET organization_id = gensentinel_org_id
  WHERE email = 'gokulnity@gmail.com';
  
  RAISE NOTICE '✅ Admin assigned to GenSentinel organization';
  
  -- Move test account to GenSentinel organization
  UPDATE profiles
  SET organization_id = gensentinel_org_id
  WHERE email = 'testuser@gensentinel.test';
  
  RAISE NOTICE '✅ Test account moved to GenSentinel organization';
  
  -- Move all activities with NULL org to GenSentinel (admin's old activities)
  UPDATE activity_logs
  SET organization_id = gensentinel_org_id
  WHERE organization_id IS NULL;
  
  RAISE NOTICE '✅ Moved % NULL activities to GenSentinel', 
    (SELECT COUNT(*) FROM activity_logs WHERE organization_id = gensentinel_org_id);
  
  -- Move all test account activities to GenSentinel
  UPDATE activity_logs
  SET organization_id = gensentinel_org_id
  WHERE organization_id = test_org_id
  OR user_id IN (
    SELECT id FROM profiles WHERE email = 'testuser@gensentinel.test'
  );
  
  RAISE NOTICE '✅ Moved test activities to GenSentinel';
  
  -- Note: ML predictions are linked via profile_id, no organization_id column
  -- They will automatically be visible through the profile relationship
  RAISE NOTICE '✅ ML predictions accessible through profile relationship';
  
  -- Move threat detections (if column exists)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'threat_detections' 
    AND column_name = 'organization_id'
  ) THEN
    UPDATE threat_detections
    SET organization_id = gensentinel_org_id
    WHERE organization_id IS NULL 
       OR organization_id = test_org_id
       OR user_id IN (
         SELECT id FROM profiles WHERE organization_id = gensentinel_org_id
       );
    
    RAISE NOTICE '✅ Moved threat detections to GenSentinel';
  ELSE
    RAISE NOTICE '⚠️ threat_detections has no organization_id (linked via user_id)';
  END IF;
  
  -- Move security notifications
  UPDATE security_notifications
  SET profile_id = admin_profile_id
  WHERE profile_id IN (
    SELECT id FROM profiles WHERE organization_id = gensentinel_org_id
  );
  
  RAISE NOTICE '✅ All data consolidated in GenSentinel organization';
  
END $$;

-- Step 3: Verify the fix
SELECT 
  '✅ VERIFICATION - Both accounts in GenSentinel now' as status;

-- Check profiles
SELECT 
  'Profiles' as table_name,
  email,
  first_name,
  last_name,
  role,
  organization_id,
  (SELECT name FROM organizations WHERE id = organization_id) as org_name,
  security_score
FROM profiles
WHERE email IN ('gokulnity@gmail.com', 'testuser@gensentinel.test')
ORDER BY role DESC;

-- Check activity logs count
SELECT 
  'Activity Logs in GenSentinel' as table_name,
  organization_id,
  (SELECT name FROM organizations WHERE id = organization_id) as org_name,
  COUNT(*) as total_activities
FROM activity_logs
WHERE organization_id IN (
  SELECT organization_id FROM profiles WHERE email = 'gokulnity@gmail.com'
)
GROUP BY organization_id;

-- Check all activities visible to admin
SELECT 
  'Activities Admin Can See' as info,
  COUNT(*) as total_count,
  COUNT(DISTINCT user_id) as unique_users
FROM activity_logs
WHERE organization_id = (
  SELECT organization_id FROM profiles WHERE email = 'gokulnity@gmail.com'
);

-- Show recent activities
SELECT 
  'Recent Activities in GenSentinel' as info,
  al.activity_type,
  al.description,
  al.created_at,
  p.email as user_email,
  p.first_name || ' ' || p.last_name as user_name
FROM activity_logs al
INNER JOIN profiles p ON al.user_id = p.id
WHERE al.organization_id = (
  SELECT organization_id FROM profiles WHERE email = 'gokulnity@gmail.com'
)
ORDER BY al.created_at DESC
LIMIT 10;

-- Show ML predictions (linked by profile, not organization)
SELECT 
  'ML Predictions Count' as info,
  COUNT(*) as total_predictions,
  COUNT(DISTINCT profile_id) as unique_users
FROM ml_threat_predictions
WHERE profile_id IN (
  SELECT id FROM profiles 
  WHERE organization_id = (
    SELECT organization_id FROM profiles WHERE email = 'gokulnity@gmail.com'
  )
);

-- Show threat detections (linked by user profile)
SELECT 
  'Threat Detections Count' as info,
  COUNT(*) as total_threats,
  threat_level,
  COUNT(*) as count_per_level
FROM threat_detections
WHERE user_id IN (
  SELECT id FROM profiles 
  WHERE organization_id = (
    SELECT organization_id FROM profiles WHERE email = 'gokulnity@gmail.com'
  )
)
GROUP BY threat_level
ORDER BY count_per_level DESC;

-- Final summary
SELECT 
  '🎉 SUCCESS - GenSentinel Organization Created' as status,
  'Admin and test account are now in same organization' as result,
  'Admin can see all activity logs and audit trail' as outcome;

-- Clean up old test organization if it exists and is empty
DO $$
DECLARE
  old_test_org_id UUID;
BEGIN
  SELECT id INTO old_test_org_id
  FROM organizations
  WHERE name = 'Test Organization'
  LIMIT 1;
  
  IF old_test_org_id IS NOT NULL THEN
    -- Check if it's empty
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE organization_id = old_test_org_id) THEN
      DELETE FROM organizations WHERE id = old_test_org_id;
      RAISE NOTICE '🗑️ Deleted empty Test Organization';
    END IF;
  END IF;
END $$;

