-- IMMEDIATE FIX: Run this in Supabase SQL Editor NOW

-- This will fix ALL profiles that have 'user' as username
UPDATE profiles 
SET 
  username = split_part((SELECT email FROM auth.users WHERE id = profiles.id), '@', 1),
  full_name = COALESCE(full_name, split_part((SELECT email FROM auth.users WHERE id = profiles.id), '@', 1))
WHERE username = 'user' OR full_name IS NULL OR full_name = '';

-- Verify the fix worked
SELECT 
  p.username,
  p.full_name,
  u.email
FROM profiles p
JOIN auth.users u ON u.id = p.id;
