-- Fix the test user profile issue
-- This will find the auth user and create/update their profile properly

DO $$
DECLARE
    test_auth_user_id UUID;
    test_org_id UUID;
    existing_profile_id UUID;
BEGIN
    -- Find the auth user ID for testuser@gensentinel.test
    SELECT id INTO test_auth_user_id
    FROM auth.users
    WHERE email = 'testuser@gensentinel.test'
    LIMIT 1;
    
    IF test_auth_user_id IS NULL THEN
        RAISE NOTICE 'Auth user not found. Please create the account first.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found auth user: %', test_auth_user_id;
    
    -- Find or create organization
    SELECT id INTO test_org_id
    FROM organizations
    WHERE name = 'Test Organization'
    LIMIT 1;
    
    IF test_org_id IS NULL THEN
        -- Create test organization
        INSERT INTO organizations (
            name,
            company_size,
            primary_contact_name,
            primary_contact_email,
            primary_contact_phone
        ) VALUES (
            'Test Organization',
            '50-200',
            'Test Admin',
            'testuser@gensentinel.test',
            '+1-555-0100'
        )
        RETURNING id INTO test_org_id;
        
        RAISE NOTICE 'Created test organization: %', test_org_id;
    ELSE
        RAISE NOTICE 'Found existing organization: %', test_org_id;
    END IF;
    
    -- Check if profile exists
    SELECT id INTO existing_profile_id
    FROM profiles
    WHERE user_id = test_auth_user_id
    LIMIT 1;
    
    IF existing_profile_id IS NOT NULL THEN
        -- Update existing profile
        UPDATE profiles
        SET
            email = 'testuser@gensentinel.test',
            first_name = 'Test',
            last_name = 'User',
            employee_id = 'TEST' || EXTRACT(EPOCH FROM NOW())::BIGINT || FLOOR(RANDOM() * 1000)::TEXT,
            department = 'hr',
            organization_id = test_org_id,
            role = 'user',
            security_score = 100,
            is_active = true
        WHERE id = existing_profile_id;
        
        RAISE NOTICE 'Updated existing profile: %', existing_profile_id;
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
            test_auth_user_id,
            'testuser@gensentinel.test',
            'Test',
            'User',
            'TEST' || EXTRACT(EPOCH FROM NOW())::BIGINT || FLOOR(RANDOM() * 1000)::TEXT,
            'hr',
            test_org_id,
            'user',
            100,
            true
        )
        RETURNING id INTO existing_profile_id;
        
        RAISE NOTICE 'Created new profile: %', existing_profile_id;
    END IF;
    
    RAISE NOTICE '✅ Test account is ready!';
    RAISE NOTICE 'Email: testuser@gensentinel.test';
    RAISE NOTICE 'Password: TestUser@123';
    RAISE NOTICE 'Profile ID: %', existing_profile_id;
    RAISE NOTICE 'Organization ID: %', test_org_id;
    
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
WHERE p.email = 'testuser@gensentinel.test';

