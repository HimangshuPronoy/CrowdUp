# Fix: RLS Policy Error on Signup

## Problem
Getting error: "new row violates row-level security policy for table 'profiles'"

## Solution

### Option 1: Use Database Trigger (Recommended)

Run this SQL in Supabase SQL Editor:

```sql
-- Copy and paste the entire contents of:
supabase-auth-trigger.sql
```

This creates a database trigger that automatically creates profiles when users sign up.

**Benefits:**
- ✅ More reliable
- ✅ Works even if client-side fails
- ✅ No RLS issues
- ✅ Cleaner code

### Option 2: Temporary Fix (Quick)

If you need a quick fix, temporarily disable RLS on profiles table:

```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

**Warning:** This is NOT recommended for production! Only use for testing.

### Option 3: Update RLS Policy

Update the INSERT policy to be more permissive:

```sql
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = id OR 
    auth.role() = 'service_role' OR
    auth.role() = 'authenticated'
  );
```

## How It Works

### Database Trigger Approach (Recommended)

1. User signs up via `supabase.auth.signUp()`
2. Supabase creates user in `auth.users` table
3. Database trigger fires automatically
4. Trigger creates profile in `profiles` table
5. User metadata (username, full_name) is stored

### Flow:
```
User Signup
    ↓
Auth User Created
    ↓
Trigger Fires (SECURITY DEFINER)
    ↓
Profile Created Automatically
    ↓
Success!
```

## Verification

After running the trigger SQL, test signup:

1. Go to `/auth/signup`
2. Fill in the form
3. Click "Sign Up"
4. Check Supabase dashboard:
   - **Authentication** > **Users** - Should see new user
   - **Table Editor** > **profiles** - Should see new profile

## Why This Happens

The RLS error occurs because:

1. During signup, the auth session isn't fully established
2. Client tries to insert profile immediately
3. RLS policy checks `auth.uid() = id`
4. Auth context might not be available yet
5. Insert fails

## The Fix

Using `SECURITY DEFINER` in the trigger:
- Runs with elevated privileges
- Bypasses RLS checks
- Guaranteed to work
- Happens server-side

## Code Changes

The `AuthContext.tsx` has been updated to:
- Pass metadata during signup
- Remove manual profile insertion
- Let trigger handle it automatically

```typescript
const signUp = async (email: string, password: string, username: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: {
        username,
        full_name: fullName,
      }
    }
  });
  
  if (error) throw error;
  // Profile created automatically by trigger!
};
```

## Testing

1. **Clear existing data** (if testing):
   ```sql
   DELETE FROM profiles;
   DELETE FROM auth.users;
   ```

2. **Run the trigger SQL**:
   ```sql
   -- Run supabase-auth-trigger.sql
   ```

3. **Test signup**:
   - Create new account
   - Should work without errors
   - Profile should appear in database

4. **Verify**:
   ```sql
   SELECT * FROM profiles;
   ```

## Troubleshooting

### Still getting RLS error?

1. **Check if trigger exists**:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

2. **Check if function exists**:
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
   ```

3. **Check RLS policies**:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```

### Trigger not firing?

1. Make sure you ran the SQL in the correct database
2. Check Supabase logs for errors
3. Verify the trigger is on `auth.users` table
4. Ensure function has `SECURITY DEFINER`

### Profile not created?

1. Check if username is unique
2. Look for errors in Supabase logs
3. Verify metadata is being passed
4. Check if trigger function has errors

## Alternative: Manual Profile Creation

If you prefer manual control, keep the original code but add retry logic:

```typescript
const signUp = async (email: string, password: string, username: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  if (data.user) {
    // Retry logic
    let retries = 3;
    while (retries > 0) {
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username,
            full_name: fullName,
          });

        if (!profileError) break;
        if (retries === 1) throw profileError;
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        retries--;
      } catch (err) {
        if (retries === 1) throw err;
        retries--;
      }
    }
  }
};
```

## Best Practice

✅ **Use the database trigger approach**
- Most reliable
- Server-side execution
- No client-side timing issues
- Cleaner code
- Production-ready

## Summary

1. Run `supabase-auth-trigger.sql`
2. Restart your app
3. Test signup
4. Verify profile creation
5. Done! ✅
