-- Fix existing profiles that have default "user" values
-- This updates profiles to use data from auth.users metadata

UPDATE profiles p
SET 
  username = COALESCE(
    (SELECT raw_user_meta_data->>'username' FROM auth.users WHERE id = p.id),
    split_part((SELECT email FROM auth.users WHERE id = p.id), '@', 1)
  ),
  full_name = COALESCE(
    (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = p.id),
    ''
  )
WHERE username = 'user' OR full_name IS NULL OR full_name = '';

-- Verify the fix
SELECT 
  p.id,
  p.username,
  p.full_name,
  u.email,
  u.raw_user_meta_data
FROM profiles p
JOIN auth.users u ON u.id = p.id;
