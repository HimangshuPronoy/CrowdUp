# CrowdUp Setup Guide

## Quick Start

### 1. Database Setup

1. Go to your Supabase project: https://supabase.com/dashboard/project/binubvbgxangshfguxba

2. Navigate to **SQL Editor** in the left sidebar

3. Click **New Query**

4. Copy and paste the entire contents of `supabase-schema.sql` into the editor

5. Click **Run** to execute the SQL script

6. **Important**: Run `supabase-auth-trigger.sql` to set up automatic profile creation

This will create:
- All necessary tables (profiles, companies, posts, votes, comments, follows)
- Row Level Security (RLS) policies
- Database triggers for vote/comment counts
- Automatic profile creation on signup
- Sample companies (Instagram, WhatsApp, Spotify, Discord, Netflix, Twitter)

### 2. Environment Variables

Your `.env.local` file is already configured with:
```env
NEXT_PUBLIC_SUPABASE_URL=https://binubvbgxangshfguxba.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## First Steps

### Create Your Account

1. Click **Sign Up** in the header
2. Fill in your details:
   - Full Name
   - Username (unique)
   - Email
   - Password (min 6 characters)
3. Check your email for verification (if email confirmation is enabled in Supabase)

### Create Your First Post

1. Click the **+** button in the header or go to `/create`
2. Select:
   - Post Type (Bug Report, Feature Request, or Complaint)
   - Company (from the dropdown)
   - Title
   - Description
3. Click **Publish Post**

### Explore Features

- **Home** (`/`) - View all posts with filtering and sorting
- **Trending** (`/trending`) - See trending companies and topics
- **Search** (`/search`) - Find companies with real-time search
- **Bookmarks** (`/bookmarks`) - View your saved posts
- **Activity** (`/activity`) - See who's interacting with your posts
- **Profile** - View your posts, karma, and activity
- **Settings** - Update your profile information

## Supabase Configuration

### Disable Email Confirmation (Recommended for Development)

1. Go to **Authentication** > **Settings** in Supabase
2. Under **Email Auth**, find **"Enable email confirmations"**
3. **Turn it OFF** (disable it)
4. Click **Save**

This allows users to sign up and use the app immediately without email verification.

For production, you may want to enable this for security.

### Authentication Providers (Optional)

You can add OAuth providers:
1. Go to **Authentication** > **Providers**
2. Enable providers like Google, GitHub, etc.
3. Add credentials from each provider

## Troubleshooting

### "User not found" after signup

- Check if email confirmation is required in Supabase
- Verify the email and click the confirmation link
- Or disable email confirmation in Supabase settings

### Posts not showing

- Ensure you ran the `supabase-schema.sql` script
- Check that sample companies were created
- Verify RLS policies are enabled

### Voting not working

- Make sure you're signed in
- Check browser console for errors
- Verify the votes table and triggers were created

### Images/Avatars not showing

- Avatar images are currently using initials
- Profile picture upload is marked as "Coming Soon"

## Database Tables Overview

### profiles
- Extends Supabase auth.users
- Stores username, full_name, bio, avatar_url, karma

### companies
- Pre-populated with sample companies
- Each has name, slug, color, description

### posts
- User-created feedback
- Links to user (profiles) and company
- Tracks votes_count and comments_count

### votes
- User votes on posts (up/down)
- Unique constraint: one vote per user per post
- Triggers update post vote counts and user karma

### comments
- User comments on posts
- Triggers update post comment counts

### follows
- Users following companies
- Unique constraint: one follow per user per company

### bookmarks (NEW)
- Users can save posts for later
- Unique constraint: one bookmark per user per post

### notifications (NEW)
- Track user activity and interactions
- Types: vote, comment, follow, mention

## Next Steps

1. Customize the company list in Supabase
2. Add more companies via SQL or Supabase dashboard
3. Invite users to test the platform
4. Monitor usage in Supabase dashboard
5. Set up email templates for notifications

## Support

For issues or questions:
- Check the Supabase logs in the dashboard
- Review browser console for client-side errors
- Verify environment variables are set correctly
