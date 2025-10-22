-- Fix the old testuser@gensentinel.test account and put it in admin's organization
-- Use the existing auth user that already has the password TestUser@123

DO $$
DECLARE
    admin_org_id UUID;
    test_auth_user_id UUID;
    old_profile_1 UUID := '645da4e7-1178-42d8-8729-af6022cb9d4f'; -- EMP99999
    old_profile_2 UUID := '9eca9dac-00a6-43fd-bf23-a8c4aa8aea27'; -- TEST1761089322534
    keep_profile_id UUID;
BEGIN
    -- Step 1: Get admin's organization
    SELECT organization_id INTO admin_org_id
    FROM profiles
    WHERE email = 'gokulunity@gmail.com'
    LIMIT 1;
    
    IF admin_org_id IS NULL THEN
        RAISE EXCEPTION 'Admin organization not found!';
    END IF;
    
    RAISE NOTICE 'Admin organization: %', admin_org_id;
    
    -- Step 2: Get the auth user for testuser@gensentinel.test
    SELECT id INTO test_auth_user_id
    FROM auth.users
    WHERE email = 'testuser@gensentinel.test'
    LIMIT 1;
    
    IF test_auth_user_id IS NULL THEN
        RAISE EXCEPTION 'Auth user not found!';
    END IF;
    
    RAISE NOTICE 'Auth user: %', test_auth_user_id;
    
    -- Step 3: Delete data from FIRST old profile (EMP99999)
    RAISE NOTICE 'Cleaning up first old profile...';
    DELETE FROM threat_detections WHERE user_id = old_profile_1;
    DELETE FROM ml_threat_predictions WHERE profile_id = old_profile_1;
    DELETE FROM activity_logs WHERE user_id = old_profile_1;
    DELETE FROM security_notifications WHERE profile_id = old_profile_1;
    DELETE FROM security_score_history WHERE profile_id = old_profile_1;
    DELETE FROM profiles WHERE id = old_profile_1;
    RAISE NOTICE '✅ First old profile deleted';
    
    -- Step 4: Keep the second profile but update it
    RAISE NOTICE 'Updating second profile to be in admin organization...';
    UPDATE profiles
    SET
        employee_id = 'TEST001',
        organization_id = admin_org_id,
        security_score = 100,
        first_name = 'Test',
        last_name = 'User'
    WHERE id = old_profile_2;
    
    keep_profile_id := old_profile_2;
    
    RAISE NOTICE '✅ Profile updated: %', keep_profile_id;
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '✅ Test account is ready!';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '📧 Email: testuser@gensentinel.test';
    RAISE NOTICE '🔑 Password: TestUser@123';
    RAISE NOTICE '🆔 Employee ID: TEST001';
    RAISE NOTICE '🏢 Organization: Same as admin';
    RAISE NOTICE '👤 Profile ID: %', keep_profile_id;
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    
END $$;

-- Verify
SELECT 
    p.id,
    p.email,
    p.employee_id,
    p.first_name,
    p.last_name,
    p.security_score,
    p.organization_id,
    o.name as org_name
FROM profiles p
LEFT JOIN organizations o ON p.organization_id = o.id
WHERE p.email = 'testuser@gensentinel.test';

