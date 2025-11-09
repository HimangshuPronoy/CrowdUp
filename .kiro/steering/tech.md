# Tech Stack

## Framework & Core
- **Next.js 15.3.5** with App Router (RSC enabled)
- **React 19** with TypeScript
- **Turbopack** for fast development builds

## Styling & UI
- **Tailwind CSS 4** with CSS variables
- **shadcn/ui** components (New York style)
- **Radix UI** primitives for accessible components
- **Framer Motion** for animations
- **Lucide React** for icons

## Database & Auth
- **Drizzle ORM** with LibSQL client
- **Better Auth** for authentication
- **bcrypt** for password hashing

## Additional Libraries
- **React Hook Form** with Zod validation
- **date-fns** for date handling
- **Sonner** for toast notifications
- **Recharts** for data visualization

## Path Aliases
- `@/*` maps to `./src/*`
- Component imports use `@/components`
- Utils use `@/lib/utils`

## Common Commands

```bash
# Development (with Turbopack)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint
```

## Build Configuration
- TypeScript errors ignored during builds (`ignoreBuildErrors: true`)
- ESLint errors ignored during builds (`ignoreDuringBuilds: true`)
- Remote images allowed from all domains
- Custom Turbopack loader for visual edits component tagging
