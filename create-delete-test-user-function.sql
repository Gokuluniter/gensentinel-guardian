-- Create a function to completely delete a test user and all their data
-- This bypasses RLS and ensures complete cleanup

CREATE OR REPLACE FUNCTION delete_test_user_completely(user_email TEXT)
RETURNS JSON AS $$
DECLARE
    target_profile_id UUID;
    target_user_id UUID;
    activities_deleted INT;
    predictions_deleted INT;
    threats_deleted INT;
    notifications_deleted INT;
    score_history_deleted INT;
    result JSON;
BEGIN
    -- Find the profile
    SELECT id, user_id INTO target_profile_id, target_user_id
    FROM profiles
    WHERE email = user_email
    LIMIT 1;
    
    IF target_profile_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Profile not found'
        );
    END IF;
    
    -- Delete all related data (CASCADE manually)
    
    -- 1. Delete activity logs
    DELETE FROM activity_logs WHERE user_id = target_profile_id;
    GET DIAGNOSTICS activities_deleted = ROW_COUNT;
    
    -- 2. Delete ML predictions
    DELETE FROM ml_threat_predictions WHERE profile_id = target_profile_id;
    GET DIAGNOSTICS predictions_deleted = ROW_COUNT;
    
    -- 3. Delete threat detections
    DELETE FROM threat_detections WHERE user_id = target_profile_id;
    GET DIAGNOSTICS threats_deleted = ROW_COUNT;
    
    -- 4. Delete security notifications
    DELETE FROM security_notifications WHERE profile_id = target_profile_id;
    GET DIAGNOSTICS notifications_deleted = ROW_COUNT;
    
    -- 5. Delete security score history
    DELETE FROM security_score_history WHERE profile_id = target_profile_id;
    GET DIAGNOSTICS score_history_deleted = ROW_COUNT;
    
    -- 6. Finally delete the profile
    DELETE FROM profiles WHERE id = target_profile_id;
    
    -- Build result
    result := json_build_object(
        'success', true,
        'message', 'Test user completely deleted',
        'profile_id', target_profile_id,
        'user_id', target_user_id,
        'deleted_counts', json_build_object(
            'activities', activities_deleted,
            'ml_predictions', predictions_deleted,
            'threats', threats_deleted,
            'notifications', notifications_deleted,
            'score_history', score_history_deleted
        )
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION delete_test_user_completely(TEXT) TO authenticated, anon;

-- Test the function (optional - comment out if you want to keep test user)
-- SELECT delete_test_user_completely('testuser@gensentinel.test');

