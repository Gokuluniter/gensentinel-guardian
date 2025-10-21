-- FIX ADMIN ORGANIZATION - SINGLE BLOCK VERSION
-- Copy this entire file, paste in Supabase SQL Editor, SELECT ALL (Ctrl+A), then click Run

DO $$
DECLARE
  v_gensentinel_org_id UUID;
  v_admin_email TEXT := 'gokulnity@gmail.com';
  v_test_email TEXT := 'testuser@gensentinel.test';
  v_admin_org UUID;
  v_test_org UUID;
  v_activity_count INT;
BEGIN
  RAISE NOTICE '=== STARTING FIX ===';
  
  -- Step 1: Show current state
  RAISE NOTICE 'Current admin org: %', (SELECT organization_id FROM profiles WHERE email = v_admin_email);
  RAISE NOTICE 'Current test org: %', (SELECT organization_id FROM profiles WHERE email = v_test_email);
  RAISE NOTICE 'Total activities: %', (SELECT COUNT(*) FROM activity_logs);
  
  -- Step 2: Get or create GenSentinel organization
  SELECT id INTO v_gensentinel_org_id
  FROM organizations
  WHERE name = 'GenSentinel'
  LIMIT 1;
  
  -- If doesn't exist, create it
  IF v_gensentinel_org_id IS NULL THEN
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
      v_admin_email,
      'Gokula Krishnan R C',
      true
    )
    RETURNING id INTO v_gensentinel_org_id;
  END IF;
  
  RAISE NOTICE '✅ GenSentinel Org ID: %', v_gensentinel_org_id;
  
  -- Step 3: Get current org IDs before update
  SELECT organization_id INTO v_admin_org FROM profiles WHERE email = v_admin_email;
  SELECT organization_id INTO v_test_org FROM profiles WHERE email = v_test_email;
  
  -- Step 4: Update admin profile
  UPDATE profiles
  SET organization_id = v_gensentinel_org_id
  WHERE email = v_admin_email;
  
  RAISE NOTICE '✅ Updated admin (%)', v_admin_email;
  
  -- Step 5: Update test profile
  UPDATE profiles
  SET organization_id = v_gensentinel_org_id
  WHERE email = v_test_email;
  
  RAISE NOTICE '✅ Updated test account (%)', v_test_email;
  
  -- Step 6: Update ALL activity logs to GenSentinel
  UPDATE activity_logs
  SET organization_id = v_gensentinel_org_id;
  
  GET DIAGNOSTICS v_activity_count = ROW_COUNT;
  RAISE NOTICE '✅ Updated % activity logs to GenSentinel', v_activity_count;
  
  -- Step 7: Update threat detections (if column exists)
  BEGIN
    UPDATE threat_detections
    SET organization_id = v_gensentinel_org_id;
    
    GET DIAGNOSTICS v_activity_count = ROW_COUNT;
    RAISE NOTICE '✅ Updated % threat detections', v_activity_count;
  EXCEPTION
    WHEN undefined_column THEN
      RAISE NOTICE '⚠️ threat_detections has no organization_id column';
  END;
  
  -- Step 8: Verification
  RAISE NOTICE '';
  RAISE NOTICE '=== VERIFICATION ===';
  RAISE NOTICE 'Admin org: %', (SELECT organization_id FROM profiles WHERE email = v_admin_email);
  RAISE NOTICE 'Test org: %', (SELECT organization_id FROM profiles WHERE email = v_test_email);
  RAISE NOTICE 'Activities in GenSentinel: %', (SELECT COUNT(*) FROM activity_logs WHERE organization_id = v_gensentinel_org_id);
  RAISE NOTICE 'Admin can see: %', (
    SELECT COUNT(*) 
    FROM activity_logs 
    WHERE organization_id = (SELECT organization_id FROM profiles WHERE email = v_admin_email)
  );
  
  RAISE NOTICE '';
  RAISE NOTICE '🎉 FIX COMPLETE!';
  RAISE NOTICE 'Refresh your admin dashboard (Ctrl+Shift+R)';
  RAISE NOTICE 'Go to Activity Logs - you should see all activities now!';
  
END $$;

-- Final verification query (this will show in results)
SELECT 
  '✅ SUCCESS' as status,
  p.email,
  p.organization_id,
  o.name as org_name,
  (SELECT COUNT(*) FROM activity_logs WHERE organization_id = p.organization_id) as activities_visible
FROM profiles p
LEFT JOIN organizations o ON p.organization_id = o.id
WHERE p.email IN ('gokulnity@gmail.com', 'testuser@gensentinel.test')
ORDER BY p.role DESC;

