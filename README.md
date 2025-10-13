# CrowdUp - Community Feedback Platform

A modern community feedback platform built with Next.js 15, React 19, and Supabase where users can share bug reports, feature requests, and complaints about various companies and apps.

## Features

### Core Features
- 🔐 **Authentication** - Sign up/sign in with Supabase Auth
- 📝 **Posts** - Create bug reports, feature requests, and complaints
- 👍 **Voting System** - Upvote/downvote posts with real-time updates
- 💬 **Comments** - Engage in discussions on posts
- 🏢 **Companies** - Browse and follow companies
- 🔥 **Trending** - Discover popular feedback

### Enhanced Features
- 🔖 **Bookmarks** - Save posts for later reading
- 🎯 **Advanced Filtering** - Filter by post type and sort by popularity/recency
- ⭐ **Karma System** - Earn reputation points from upvotes
- 📊 **Activity Feed** - Track interactions with your posts
- 🔍 **Smart Search** - Find companies with real-time filtering
- 👤 **Rich Profiles** - View user stats, karma, and post history
- 🎨 **Modern UI** - Smooth animations and responsive design

## Tech Stack

- **Framework**: Next.js 15.3.5 with App Router
- **UI**: React 19, Tailwind CSS 4, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd crowdup
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. Set up the database:
- Go to your Supabase project dashboard
- Navigate to the SQL Editor
- Run the SQL script from `supabase-schema.sql` to create all tables, policies, and sample data

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

The app uses the following main tables:
- `profiles` - User profiles (extends Supabase auth.users)
- `companies` - Companies/apps that can receive feedback
- `posts` - User-submitted feedback posts
- `votes` - Upvotes/downvotes on posts
- `comments` - Comments on posts
- `follows` - Users following companies

All tables have Row Level Security (RLS) enabled for secure data access.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── company/[id]/      # Company detail pages
│   ├── post/[id]/         # Post detail pages
│   ├── profile/[username]/ # User profile pages
│   ├── create/            # Create post page
│   ├── search/            # Search page
│   ├── trending/          # Trending page
│   └── settings/          # Settings page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── *.tsx             # Custom components
├── contexts/             # React contexts (Auth)
├── lib/                  # Utilities
│   └── supabase/         # Supabase client setup
└── types/                # TypeScript types
```

## Available Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
