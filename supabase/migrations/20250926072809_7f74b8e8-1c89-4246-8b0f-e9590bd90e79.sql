-- Update Gokula Krishnan R C to admin with full privileges
UPDATE public.profiles 
SET 
  role = 'admin',
  security_clearance = 4,
  first_name = 'Gokula',
  last_name = 'Krishnan R C',
  position = 'System Administrator',
  updated_at = now()
WHERE email = 'gokulunity@gmail.com';

-- Verify the update
SELECT id, first_name, last_name, email, role, department, security_clearance, employee_id, position
FROM public.profiles 
WHERE email = 'gokulunity@gmail.com';