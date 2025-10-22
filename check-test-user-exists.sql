-- Check if test user profile still exists
SELECT 
    id,
    email,
    first_name,
    last_name,
    employee_id,
    security_score,
    organization_id,
    created_at
FROM profiles
WHERE email = 'testuser@gensentinel.test';

-- Check activities count
SELECT COUNT(*) as activity_count
FROM activity_logs
WHERE user_id IN (
    SELECT id FROM profiles WHERE email = 'testuser@gensentinel.test'
);

-- Check threats count
SELECT COUNT(*) as threat_count
FROM threat_detections
WHERE user_id IN (
    SELECT id FROM profiles WHERE email = 'testuser@gensentinel.test'
);

-- Check ML predictions count
SELECT COUNT(*) as ml_prediction_count
FROM ml_threat_predictions
WHERE profile_id IN (
    SELECT id FROM profiles WHERE email = 'testuser@gensentinel.test'
);

