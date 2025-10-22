-- Check if testuser001 auth user exists and show details
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users
WHERE email = 'testuser001@gensentinel.test';

-- If no results above, the user doesn't exist and you need to sign up manually.
-- If results show, but you get "invalid password", the password is different.

-- Check profiles for this email
SELECT 
    id,
    email,
    employee_id,
    organization_id
FROM profiles
WHERE email = 'testuser001@gensentinel.test';

