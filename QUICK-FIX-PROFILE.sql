-- QUICK FIX: Update your profile manually
-- Replace 'your-email@example.com' with your actual email

-- Step 1: Find your user ID
SELECT id, email, raw_user_meta_data FROM auth.users WHERE email = 'your-email@example.com';

-- Step 2: Update your profile (replace the ID with yours from step 1)
UPDATE profiles 
SET 
  username = 'your-desired-username',  -- Change this
  full_name = 'Your Full Name',        -- Change this
  bio = 'Your bio here'                -- Optional
WHERE id = 'your-user-id-from-step-1';  -- Replace with your actual ID

-- Step 3: Verify the update
SELECT * FROM profiles WHERE id = 'your-user-id-from-step-1';

-- OR: Update all profiles with 'user' username to use email prefix
UPDATE profiles p
SET 
  username = split_part((SELECT email FROM auth.users WHERE id = p.id), '@', 1),
  full_name = COALESCE(
    (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = p.id),
    split_part((SELECT email FROM auth.users WHERE id = p.id), '@', 1)
  )
WHERE username = 'user';

-- Verify all profiles
SELECT 
  p.id,
  p.username,
  p.full_name,
  p.bio,
  u.email
FROM profiles p
JOIN auth.users u ON u.id = p.id;
