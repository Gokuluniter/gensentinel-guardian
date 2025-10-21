-- Diagnostic Script - Check Database State
-- Run this FIRST to understand what's happening

-- 1. Check all profiles
SELECT 
  '=== ALL PROFILES ===' as section,
  email,
  first_name,
  last_name,
  role,
  organization_id,
  (SELECT name FROM organizations WHERE id = organization_id) as org_name,
  security_score,
  is_active
FROM profiles
ORDER BY created_at DESC
LIMIT 20;

-- 2. Check all organizations
SELECT 
  '=== ALL ORGANIZATIONS ===' as section,
  id,
  name,
  primary_contact_email,
  created_at
FROM organizations
ORDER BY created_at DESC;

-- 3. Check activity logs by organization
SELECT 
  '=== ACTIVITY LOGS BY ORGANIZATION ===' as section,
  COALESCE((SELECT name FROM organizations WHERE id = organization_id), 'NULL') as org_name,
  organization_id,
  COUNT(*) as activity_count,
  MIN(created_at) as first_activity,
  MAX(created_at) as last_activity
FROM activity_logs
GROUP BY organization_id
ORDER BY activity_count DESC;

-- 4. Check activity logs by user
SELECT 
  '=== ACTIVITY LOGS BY USER ===' as section,
  p.email,
  p.organization_id as user_org_id,
  al.organization_id as activity_org_id,
  COUNT(*) as activity_count
FROM activity_logs al
LEFT JOIN profiles p ON al.user_id = p.id
GROUP BY p.email, p.organization_id, al.organization_id
ORDER BY activity_count DESC;

-- 5. Check if admin can query activity logs
SELECT 
  '=== WHAT ADMIN CAN SEE ===' as section,
  COUNT(*) as total_count
FROM activity_logs
WHERE organization_id = (
  SELECT organization_id FROM profiles WHERE email = 'gokulnity@gmail.com'
);

-- 6. Check RLS policies
SELECT 
  '=== RLS POLICIES ON ACTIVITY_LOGS ===' as section,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'activity_logs';

-- 7. Check if there are any activities at all
SELECT 
  '=== TOTAL ACTIVITIES ===' as section,
  COUNT(*) as total_activities,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT organization_id) as unique_orgs
FROM activity_logs;

-- 8. Sample of recent activities
SELECT 
  '=== RECENT ACTIVITIES (ANY ORG) ===' as section,
  al.id,
  al.activity_type,
  al.organization_id,
  p.email as user_email,
  al.created_at
FROM activity_logs al
LEFT JOIN profiles p ON al.user_id = p.id
ORDER BY al.created_at DESC
LIMIT 10;

