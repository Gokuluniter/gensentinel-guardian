-- SIMPLE FIX: Assign admin to same org as test account
-- This will make admin see all test activities immediately

DO $$
DECLARE
  v_test_org_id UUID;
  v_activities_count INT;
BEGIN
  -- Get test account's organization ID
  SELECT organization_id INTO v_test_org_id
  FROM profiles
  WHERE email = 'testuser@gensentinel.test';
  
  RAISE NOTICE 'Test account org ID: %', v_test_org_id;
  
  IF v_test_org_id IS NULL THEN
    RAISE EXCEPTION 'Test account not found or has no organization!';
  END IF;
  
  -- Assign admin to same organization
  UPDATE profiles
  SET organization_id = v_test_org_id
  WHERE email = 'gokulunity@gmail.com';
  
  RAISE NOTICE '✅ Admin assigned to same org as test account';
  
  -- Check how many activities admin can now see
  SELECT COUNT(*) INTO v_activities_count
  FROM activity_logs
  WHERE organization_id = v_test_org_id;
  
  RAISE NOTICE '✅ Admin can now see % activities', v_activities_count;
  RAISE NOTICE '';
  RAISE NOTICE '🎉 SUCCESS! Refresh your admin dashboard now!';
  
END $$;

-- Verify both accounts are in same org
SELECT 
  '✅ VERIFICATION' as status,
  email,
  organization_id,
  (SELECT name FROM organizations WHERE id = organization_id) as org_name,
  role,
  (SELECT COUNT(*) FROM activity_logs WHERE organization_id = p.organization_id) as can_see_activities
FROM profiles p
WHERE email IN ('gokulunity@gmail.com', 'testuser@gensentinel.test')
ORDER BY role DESC;

