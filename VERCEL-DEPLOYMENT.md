# Vercel Deployment Guide

## Environment Variables Setup

### Required Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://binubvbgxangshfguxba.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Steps:

1. Go to your Vercel project
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Your Supabase URL
   - Environment: Production, Preview, Development (all)
   - Click **Save**

4. Repeat for:
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

5. **Redeploy** your project

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/HimangshuPronoy/CrowdUp)

## Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Redeploy
vercel --prod
```

## Troubleshooting

### "Missing Supabase environment variables"
- Add environment variables in Vercel dashboard
- Make sure they're set for all environments
- Redeploy after adding

### Build fails with dependency errors
- `.npmrc` file should be committed
- Contains `legacy-peer-deps=true`
- Resolves peer dependency conflicts

### Database connection fails
- Verify Supabase URL is correct
- Check anon key is valid
- Ensure RLS policies are set up

## Post-Deployment Checklist

- [ ] Environment variables added
- [ ] Database schema run in Supabase
- [ ] Auth trigger set up
- [ ] Storage bucket created (for images)
- [ ] Email verification disabled (optional)
- [ ] Test signup/login
- [ ] Test post creation
- [ ] Test image upload

## Production Optimizations

### Caching
- Static pages cached automatically
- API routes use Vercel Edge Cache
- Images optimized with Next.js Image

### Performance
- Turbopack for fast builds
- Edge runtime for API routes
- Incremental Static Regeneration

### Monitoring
- Vercel Analytics enabled
- Error tracking with Sentry (optional)
- Performance monitoring

## Custom Domain

1. Go to Vercel → Settings → Domains
2. Add your domain
3. Update DNS records
4. Wait for SSL certificate

## Done!

Your CrowdUp instance is now live! 🚀
