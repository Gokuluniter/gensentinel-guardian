# Test Admin Dashboard - Quick Guide

## Prerequisites

1. ✅ Run `fix-activity-logs-visibility.sql` in Supabase SQL Editor
2. ✅ Edge Function `ingest-activity` is deployed (already done)
3. ✅ Test account exists with some activities

## Test Steps

### Test 1: Activity Logs Visibility

1. **Open main application** (not test script)
2. **Login as admin**:
   - You can create an admin account or promote test account to admin:
   ```sql
   -- Run in Supabase SQL Editor to make test account admin
   UPDATE profiles 
   SET role = 'admin'
   WHERE email = 'testuser@gensentinel.test';
   ```
3. **Navigate to "Activity Logs" page**
4. **Expected**: You should see all activities created via test script
5. **If empty**: 
   - Check browser console for errors
   - Verify RLS policies were applied (run SQL script again)
   - Check if activities exist: `SELECT COUNT(*) FROM activity_logs;`

---

### Test 2: Audit Trail

1. **Still logged in as admin**
2. **Navigate to "Audit Trail" page**
3. **Expected**: Same activities with user details (name, department, employee ID)
4. **Features to test**:
   - Search by user name
   - Filter by activity type
   - Export audit logs

---

### Test 3: Account Blocking

**Part A: Lower the security score**

1. **Open test-threat-detection.html**
2. **Login to test account**
3. **Current score**: Should be displayed (e.g., 34)
4. **Perform critical threats**:
   - Click "Data Exfiltration" → Score drops ~23 points
   - If score still > 30, click "Unauthorized Config" → drops more
   - Repeat until score < 30

**Part B: Verify account is blocked**

5. **Check the profile**:
   ```sql
   SELECT 
     email,
     security_score,
     is_active,
     last_score_update
   FROM profiles
   WHERE email = 'testuser@gensentinel.test';
   ```
6. **Expected**: 
   - `security_score` < 30
   - `is_active` = false

**Part C: Try to use blocked account**

7. **In main app**: Try to login with blocked account
8. **Expected**: Login should fail or show "Account blocked" message
9. **Check notifications**:
   ```sql
   SELECT 
     title,
     message,
     severity,
     created_at
   FROM security_notifications
   WHERE profile_id IN (
     SELECT id FROM profiles WHERE email = 'testuser@gensentinel.test'
   )
   ORDER BY created_at DESC
   LIMIT 5;
   ```
10. **Expected**: See "🚨 Account Blocked" notification

---

### Test 4: XAI Explanations

**Prerequisites**: Set `LOVABLE_API_KEY` in Supabase Edge Function Secrets

1. **Perform a threat activity** (any suspicious or critical)
2. **Check threat_detections table**:
   ```sql
   SELECT 
     threat_type,
     threat_level,
     description,
     ai_explanation,
     risk_score,
     created_at
   FROM threat_detections
   ORDER BY created_at DESC
   LIMIT 10;
   ```
3. **Expected**: `ai_explanation` column contains detailed explanation like:
   ```
   "This alert was triggered because the system detected a data export 
   operation involving 1371MB of data from an unusual location (Beijing).
   
   Why this is risky:
   - Large data volume suggests potential data exfiltration
   - Access from new/unusual IP address
   - Operation during off-hours
   
   Recommended actions:
   1. Verify this was a legitimate business activity
   2. Contact your IT security team if you didn't perform this action
   3. Change your password immediately if account was compromised
   
   If this was your legitimate work activity, please report it to 
   reduce false positives in the future."
   ```

4. **If ai_explanation is generic**: 
   - XAI API call might have failed (check logs)
   - Fallback explanation is being used (still works, just less detailed)
   - To enable full XAI, set `LOVABLE_API_KEY` environment variable

---

### Test 5: Security Dashboard

1. **In main app (as admin)**
2. **Navigate to "Security Center" or "Dashboard"**
3. **Expected to see**:
   - Total activities count
   - Active threats count
   - Recent threat detections
   - Security score trends
   - ML prediction statistics

---

## Verification Checklist

- [ ] Activity Logs show all activities from test script
- [ ] Audit Trail shows activity details with user info
- [ ] Account is blocked when security score < 30
- [ ] `is_active` flag is set to false for blocked accounts
- [ ] Blocked account notification is created
- [ ] Threat detections have AI explanations
- [ ] Admin can see all users' activities
- [ ] Search and filter work in Activity Logs
- [ ] Export functionality works

---

## Quick SQL Queries for Verification

```sql
-- Check activity logs count
SELECT COUNT(*) as total_activities FROM activity_logs;

-- Check recent activities with user details
SELECT 
  al.activity_type,
  al.description,
  al.created_at,
  p.email,
  p.first_name,
  p.last_name,
  p.security_score
FROM activity_logs al
LEFT JOIN profiles p ON al.user_id = p.id
ORDER BY al.created_at DESC
LIMIT 10;

-- Check blocked accounts
SELECT 
  email,
  security_score,
  is_active,
  last_score_update
FROM profiles
WHERE is_active = false;

-- Check threat detections with XAI
SELECT 
  threat_level,
  threat_type,
  ai_explanation,
  risk_score,
  created_at
FROM threat_detections
ORDER BY created_at DESC
LIMIT 5;

-- Check security notifications
SELECT 
  title,
  message,
  severity,
  is_read,
  created_at
FROM security_notifications
ORDER BY created_at DESC
LIMIT 10;

-- Check ML predictions
SELECT 
  threat_probability,
  threat_level,
  supervised_prediction,
  anomaly_score,
  sequence_anomaly_score,
  created_at
FROM ml_threat_predictions
ORDER BY created_at DESC
LIMIT 5;
```

---

## Troubleshooting

### "Activity Logs still empty"
1. Run the SQL script: `fix-activity-logs-visibility.sql`
2. Check if you're logged in as admin
3. Verify activities exist: `SELECT COUNT(*) FROM activity_logs;`
4. Check browser console for RLS errors

### "Account not blocking"
1. Verify score < 30: `SELECT security_score, is_active FROM profiles WHERE email = 'testuser@gensentinel.test';`
2. Check Edge Function logs for errors
3. Make sure Edge Function is deployed (already done)

### "No XAI explanations"
1. XAI still works without API key (uses fallback)
2. For detailed explanations, set `LOVABLE_API_KEY`
3. Check `ai_explanation` column - should have some text even without API key

---

## Success Criteria

✅ **All 4 issues fixed**:
1. Activity Logs visible in admin dashboard
2. Audit Trail showing all activities
3. Account blocking working (score < 30)
4. XAI generating explanations (or fallback)

🎉 **System is fully functional!**

