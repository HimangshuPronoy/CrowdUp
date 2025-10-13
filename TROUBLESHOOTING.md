# Troubleshooting Guide

## "supabaseKey is required" Error

This error means the environment variables aren't being loaded. Follow these steps:

### 1. Stop the Dev Server
Press `Ctrl+C` in your terminal to stop the running dev server.

### 2. Verify .env.local File
Make sure `.env.local` exists in the root directory (same level as `package.json`):

```bash
ls -la .env.local
```

The file should contain:
```env
NEXT_PUBLIC_SUPABASE_URL=https://binubvbgxangshfguxba.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Restart the Dev Server
```bash
npm run dev
```

**Important**: Next.js only loads environment variables when the dev server starts. Any changes to `.env.local` require a restart.

### 4. Clear Next.js Cache (if still not working)
```bash
rm -rf .next
npm run dev
```

## Other Common Issues

### Build Errors
If you see build errors, try:
```bash
rm -rf .next
rm -rf node_modules
npm install
npm run dev
```

### Database Connection Issues
- Verify your Supabase project is active
- Check that the URL and keys are correct
- Test the connection in Supabase dashboard

### Authentication Not Working
- Make sure you ran the `supabase-schema.sql` script
- Check that the `profiles` table exists
- Verify RLS policies are enabled

### Posts Not Showing
- Ensure the database schema is set up
- Check that sample companies were created
- Look for errors in browser console

## Environment Variables Checklist

✅ `.env.local` file exists in root directory  
✅ File contains all three variables  
✅ No extra spaces or quotes around values  
✅ Dev server was restarted after creating/editing the file  

## Still Having Issues?

1. Check browser console for detailed error messages
2. Check terminal for server-side errors
3. Verify Supabase dashboard shows your project is active
4. Try accessing Supabase directly: https://supabase.com/dashboard/project/binubvbgxangshfguxba
