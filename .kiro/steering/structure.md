# Project Structure

## Directory Organization

```
src/
├── app/                    # Next.js App Router pages
│   ├── company/[id]/      # Dynamic company pages
│   ├── create/            # Post creation page
│   ├── messages/          # Messaging interface
│   ├── post/[id]/         # Individual post pages
│   ├── profile/[username]/ # User profile pages
│   ├── search/            # Search functionality
│   ├── settings/          # User settings
│   ├── trending/          # Trending posts
│   ├── layout.tsx         # Root layout with error reporting
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── Header.tsx        # Main navigation header
│   ├── PostCard.tsx      # Post display component
│   ├── PodiumView.tsx    # Top 3 posts ranking
│   ├── Sidebar.tsx       # Sidebar navigation
│   └── SidePanel.tsx     # Side panel component
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and helpers
│   ├── hooks/           # Additional hooks
│   └── utils.ts         # Tailwind merge utilities
└── visual-edits/        # Visual editing tools
```

## Conventions

### Routing
- Use Next.js App Router with file-based routing
- Dynamic routes use `[param]` syntax
- All pages are Server Components by default, use `"use client"` directive when needed

### Components
- UI components from shadcn/ui live in `src/components/ui/`
- Custom components in `src/components/`
- Use TypeScript for all components
- Prefer named exports for components

### Styling
- Use Tailwind utility classes
- Gradient accent: `from-yellow-400 to-orange-500`
- Rounded corners: prefer `rounded-xl` and `rounded-2xl`
- Use `cn()` utility from `@/lib/utils` for conditional classes

### State Management
- Client-side state with React hooks
- Use `"use client"` directive for interactive components
- Form handling with React Hook Form + Zod

### Type Safety
- Strict TypeScript enabled
- Define prop types inline or as separate interfaces
- Use `as const` for literal types where appropriate
