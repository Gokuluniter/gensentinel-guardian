-- Clean up the duplicate test user profile and all its data
-- This will delete the OLD profile (EMP99999) and keep the NEW one

DO $$
DECLARE
    old_profile_id UUID := '645da4e7-1178-42d8-8729-af6022cb9d4f'; -- The old profile with EMP99999
BEGIN
    RAISE NOTICE 'Starting cleanup of old duplicate profile...';
    
    -- 1. Delete threat detections first (references activity_logs)
    DELETE FROM threat_detections WHERE user_id = old_profile_id;
    RAISE NOTICE 'Deleted threat_detections';
    
    -- 2. Delete ML predictions (references activity_logs)
    DELETE FROM ml_threat_predictions WHERE profile_id = old_profile_id;
    RAISE NOTICE 'Deleted ml_threat_predictions';
    
    -- 3. Delete activity logs
    DELETE FROM activity_logs WHERE user_id = old_profile_id;
    RAISE NOTICE 'Deleted activity_logs';
    
    -- 4. Delete security notifications
    DELETE FROM security_notifications WHERE profile_id = old_profile_id;
    RAISE NOTICE 'Deleted security_notifications';
    
    -- 5. Delete security score history
    DELETE FROM security_score_history WHERE profile_id = old_profile_id;
    RAISE NOTICE 'Deleted security_score_history';
    
    -- 6. Finally delete the old profile
    DELETE FROM profiles WHERE id = old_profile_id;
    RAISE NOTICE 'Deleted old profile';
    
    RAISE NOTICE '✅ Cleanup complete! Only one profile remains.';
END $$;

-- Verify: Should show only ONE profile now
SELECT 
    id,
    email,
    employee_id,
    first_name,
    last_name,
    department,
    security_score,
    organization_id
FROM profiles 
WHERE email = 'testuser@gensentinel.test';

