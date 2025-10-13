# Disable Email Verification

## Quick Steps

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/binubvbgxangshfguxba

2. Navigate to **Authentication** → **Settings** (in the left sidebar)

3. Scroll down to **Email Auth** section

4. Find **"Enable email confirmations"** toggle

5. **Turn it OFF** (disable it)

6. Click **Save** at the bottom

## What This Does

- ✅ Users can sign up and use the app immediately
- ✅ No need to check email for verification
- ✅ Faster onboarding experience
- ❌ Less secure (anyone can use any email)

## Alternative: Auto-confirm in Code

If you want to keep it enabled in Supabase but auto-confirm for development, update the signup:

```typescript
const { data, error } = await supabase.auth.signUp({ 
  email, 
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
    data: {
      username,
      full_name: fullName,
    }
  }
});
```

## For Production

Consider keeping email verification enabled for:
- Security
- Valid email addresses
- Spam prevention
- User verification

## Testing

After disabling:
1. Go to `/auth/signup`
2. Create account
3. Should be logged in immediately
4. No email verification needed

Done! ✅
