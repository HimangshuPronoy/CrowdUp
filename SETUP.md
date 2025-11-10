# CrowdUp Setup Guide

## Prerequisites

- Node.js 18+ or Bun
- A Supabase account (free tier works)

## Setup Steps

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned

### 2. Set Up Database

1. In your Supabase project dashboard, go to the SQL Editor
2. Copy the contents of `supabase-schema.sql` from this project
3. Paste and run the SQL in the Supabase SQL Editor
4. This will create all necessary tables, indexes, and security policies

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Get your Supabase credentials:
   - Go to Project Settings > API
   - Copy the Project URL
   - Copy the `anon` public key

3. Update `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

### 4. Install Dependencies

```bash
npm install
# or
bun install
```

### 5. Run Development Server

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## First Steps

1. Navigate to `/auth/signup` to create an account
2. Sign in with your credentials
3. Create your first post
4. Start voting and engaging with content!

## Features

- ✅ Custom authentication (username/email + password)
- ✅ Create posts (Bug Reports, Feature Requests, Complaints)
- ✅ Upvote/downvote system
- ✅ User profiles
- ✅ Settings page
- ✅ Real-time data from Supabase

## Troubleshooting

### "Invalid credentials" error
- Make sure you've run the SQL schema in Supabase
- Check that your environment variables are correct

### Posts not showing
- Verify the database tables were created successfully
- Check browser console for any errors

### Authentication issues
- Clear localStorage and try again
- Note: RLS (Row Level Security) is disabled by default since we're using custom auth

## Important Notes

### Row Level Security (RLS)
This project uses **custom authentication** (not Supabase Auth), so Row Level Security is **disabled by default** in the SQL schema. This means:
- All authenticated operations are handled client-side
- Database tables are accessible with the anon key
- For production, consider migrating to Supabase Auth or implementing server-side API routes

### Security Considerations
- Passwords are hashed with bcryptjs before storage
- Auth state is stored in localStorage (client-side)
- For production apps, consider:
  - Server-side session management
  - HTTP-only cookies
  - Supabase Auth integration
  - API routes for sensitive operations
