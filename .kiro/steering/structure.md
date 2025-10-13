## Project Structure

### Directory Organization

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Home page (feed)
│   ├── globals.css        # Global styles
│   ├── [feature]/         # Feature-based routes
│   │   └── page.tsx       # Route page component
│   └── [feature]/[id]/    # Dynamic routes
│       └── page.tsx       # Dynamic page component
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── [Component].tsx   # Custom components (PascalCase)
├── lib/                  # Utility functions
│   ├── utils.ts         # cn() helper and utilities
│   └── hooks/           # Custom React hooks
├── hooks/               # Additional hooks
└── visual-edits/        # Visual editing tools
```

### Routing Patterns

- **Static routes**: `/create`, `/search`, `/messages`, `/settings`, `/trending`
- **Dynamic routes**: `/post/[id]`, `/profile/[username]`, `/company/[id]`
- All pages use `"use client"` directive for client-side interactivity

### Component Conventions

- **Client components**: Use `"use client"` directive at top of file
- **Naming**: PascalCase for component files (e.g., `PostCard.tsx`, `Header.tsx`)
- **UI components**: Located in `src/components/ui/` (shadcn/ui managed)
- **Custom components**: Located in `src/components/` root
- **Props interfaces**: Defined inline with component, named `[Component]Props`

### Styling Patterns

- Use `cn()` utility from `@/lib/utils` for conditional classes
- Tailwind classes for all styling
- Color scheme: Orange primary (#FF6B35 / orange-500), gray neutrals
- Consistent spacing: `gap-2`, `gap-4`, `gap-6` for layouts
- Transitions: `transition-all` with hover effects (`hover:scale-105`, `hover:shadow-lg`)
- Rounded corners: `rounded-lg`, `rounded-2xl`, `rounded-full` for buttons/avatars

### State Management

- React `useState` for local component state
- Next.js `useRouter` and `usePathname` for navigation
- No global state management library (yet)

### Import Patterns

- Use `@/` path alias for all imports from `src/`
- Import UI components from `@/components/ui/[component]`
- Import utilities from `@/lib/utils`
