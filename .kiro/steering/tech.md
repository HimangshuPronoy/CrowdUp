## Tech Stack

### Core Framework
- **Next.js 15.3.5** with App Router (React 19)
- **TypeScript** with strict mode enabled
- **Turbopack** for fast development builds

### UI & Styling
- **Tailwind CSS 4** with PostCSS
- **shadcn/ui** components (New York style variant)
- **Radix UI** primitives for accessible components
- **Framer Motion** for animations
- **Lucide React** for icons

### Key Libraries
- **React Hook Form** with Zod validation for forms
- **Better Auth** for authentication
- **Drizzle ORM** with LibSQL client for database
- **date-fns** for date formatting
- **Sonner** for toast notifications

### Development Tools
- Path alias: `@/*` maps to `./src/*`
- ESLint with Next.js config
- Component library configured via `components.json`

## Common Commands

```bash
# Development
npm run dev          # Start dev server with Turbopack

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## Build Configuration

- TypeScript errors ignored during builds (`ignoreBuildErrors: true`)
- ESLint errors ignored during builds (`ignoreDuringBuilds: true`)
- Remote images allowed from all domains
- Custom Turbopack loader for component tagging in visual edits mode
