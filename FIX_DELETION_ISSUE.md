# Fix: Test Account Deletion Not Working

## Problem
When deleting a test account via `test-threat-detection.html`, the data still appears in the admin dashboard. The test user's profile and activities are not being removed from the database.

## Root Cause
The `anon` key used by the test script doesn't have sufficient permissions to DELETE records due to Row Level Security (RLS) policies in Supabase.

## Solution

### Step 1: Create Database Function
Run the following SQL script in your **Supabase SQL Editor**:

```sql
-- File: create-delete-test-user-function.sql
```

This creates a `SECURITY DEFINER` function that:
- Bypasses RLS policies
- Deletes all related data in the correct order
- Returns a detailed report of what was deleted

### Step 2: How It Works

The updated `test-threat-detection.html` now:
1. **First tries** direct deletion (existing method)
2. **If that fails**, falls back to using the database function
3. **Returns detailed counts** of deleted records

### Step 3: Test the Fix

1. **Run the SQL script** in Supabase:
   - Open Supabase Dashboard
   - Go to SQL Editor
   - Copy and paste `create-delete-test-user-function.sql`
   - Click "Run"

2. **Open `test-threat-detection.html`** in your browser

3. **Click "Delete Test Account"**

4. **Check the logs** - you should see:
   ```
   ✅ Test account completely deleted!
   ✅ Deleted X activities
   ✅ Deleted X ML predictions
   ✅ Deleted X threats
   ✅ Deleted X notifications
   ✅ Profile deleted
   ```

5. **Refresh your admin dashboard** - the test user should be gone!

## Verification

To verify the deletion worked, run this in Supabase SQL Editor:

```sql
-- File: check-test-user-exists.sql
```

All queries should return **0 rows** or **0 count** if deletion was successful.

## Alternative: Manual Deletion via SQL

If the test script still doesn't work, you can manually delete the test user:

```sql
-- Run this in Supabase SQL Editor
SELECT delete_test_user_completely('testuser@gensentinel.test');
```

This will return a JSON object showing what was deleted.

## Why This Works

1. **SECURITY DEFINER**: The function runs with the privileges of the user who created it (usually the database owner), bypassing RLS
2. **Proper Order**: Deletes child records before parent records to avoid foreign key violations
3. **Detailed Logging**: Returns counts so you know exactly what was removed
4. **Accessible**: Grants permission to both `authenticated` and `anon` users

## After Deletion

Remember:
- The **auth user** still exists in Supabase Auth (you'll need to delete it manually from the dashboard if you want)
- You can **create a new test account** with the same email - it will reuse the existing auth user
- Always **refresh your browser** after deletion to see updated admin dashboard

## Troubleshooting

**If you still see the test user:**
1. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Check Supabase → Table Editor → profiles - is the test user still there?
4. If yes, run the SQL function manually (see "Alternative" above)

**If the function doesn't exist:**
- You forgot to run `create-delete-test-user-function.sql`
- Go back to Step 1 and run it in Supabase SQL Editor

