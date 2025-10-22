-- Create a fresh test account with unique email in the same organization as admin
-- This will be a completely new test user that can be used for testing

DO $$
DECLARE
    admin_org_id UUID;
    test_user_auth_id UUID;
    new_profile_id UUID;
    test_email TEXT := 'testuser001@gensentinel.test';
    test_employee_id TEXT := 'TEST001';
BEGIN
    -- Step 1: Get the admin's organization
    SELECT organization_id INTO admin_org_id
    FROM profiles
    WHERE email = 'gokulunity@gmail.com'
    LIMIT 1;
    
    IF admin_org_id IS NULL THEN
        RAISE EXCEPTION 'Admin organization not found! Please check if gokulunity@gmail.com exists.';
    END IF;
    
    RAISE NOTICE 'Found admin organization: %', admin_org_id;
    
    -- Step 2: Check if test user already exists in auth.users
    SELECT id INTO test_user_auth_id
    FROM auth.users
    WHERE email = test_email;
    
    IF test_user_auth_id IS NULL THEN
        RAISE NOTICE 'Auth user does not exist. You need to create it first!';
        RAISE NOTICE 'Go to your app and sign up with:';
        RAISE NOTICE '  Email: %', test_email;
        RAISE NOTICE '  Password: TestUser001@123';
        RAISE NOTICE 'Then run this script again.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found auth user: %', test_user_auth_id;
    
    -- Step 3: Check if profile already exists
    SELECT id INTO new_profile_id
    FROM profiles
    WHERE email = test_email;
    
    IF new_profile_id IS NOT NULL THEN
        RAISE NOTICE 'Profile already exists, updating...';
        
        -- Update existing profile
        UPDATE profiles
        SET
            first_name = 'Test',
            last_name = 'User 001',
            employee_id = test_employee_id,
            department = 'it',
            organization_id = admin_org_id,
            role = 'user',
            security_score = 100,
            is_active = true
        WHERE id = new_profile_id;
        
        RAISE NOTICE 'Updated existing profile: %', new_profile_id;
    ELSE
        -- Create new profile
        INSERT INTO profiles (
            user_id,
            email,
            first_name,
            last_name,
            employee_id,
            department,
            organization_id,
            role,
            security_score,
            is_active
        ) VALUES (
            test_user_auth_id,
            test_email,
            'Test',
            'User 001',
            test_employee_id,
            'it',
            admin_org_id,
            'user',
            100,
            true
        )
        RETURNING id INTO new_profile_id;
        
        RAISE NOTICE 'Created new profile: %', new_profile_id;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ Test account is ready!';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '📧 Email: %', test_email;
    RAISE NOTICE '🔑 Password: TestUser001@123';
    RAISE NOTICE '🆔 Employee ID: %', test_employee_id;
    RAISE NOTICE '🏢 Organization: Same as admin (%)' , admin_org_id;
    RAISE NOTICE '👤 Profile ID: %', new_profile_id;
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Next Steps:';
    RAISE NOTICE '1. If auth user does not exist, go to your app and sign up';
    RAISE NOTICE '2. Login with the credentials above';
    RAISE NOTICE '3. Use test-threat-detection.html to perform test activities';
    RAISE NOTICE '';
    
END $$;

-- Verify the account
SELECT 
    p.id as profile_id,
    p.email,
    p.first_name,
    p.last_name,
    p.employee_id,
    p.department,
    p.role,
    p.security_score,
    p.organization_id,
    o.name as organization_name
FROM profiles p
LEFT JOIN organizations o ON p.organization_id = o.id
WHERE p.email = 'testuser001@gensentinel.test';

