# CrowdUp - Implementation Roadmap

## 🎯 Overview

This roadmap provides step-by-step instructions to transform CrowdUp from its current state into a production-ready, scalable application.

---

## 📅 Phase 1: Critical Security Fixes (Week 1)

### Day 1-2: Authentication Migration

**Goal:** Replace client-side auth with Supabase Auth

**Steps:**

1. **Install Supabase Auth dependencies**
```bash
npm install @supabase/auth-helpers-nextjs @supabase/auth-ui-react
```

2. **Update Supabase client configuration**
```typescript
// lib/supabase.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createClientComponentClient()
```

3. **Create server-side Supabase client**
```typescript
// lib/supabase-server.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createClient = () => {
  return createServerComponentClient({ cookies })
}
```

4. **Update auth functions**
```typescript
// lib/auth.ts
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${location.origin}/auth/callback`,
    }
  })
  return { data, error }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
```

5. **Update middleware for auth protection**
```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  // Protected routes
  const protectedPaths = ['/create', '/settings', '/messages']
  const isProtectedPath = protectedPaths.some(path => 
    req.nextUrl.pathname.startsWith(path)
  )
  
  if (isProtectedPath && !session) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }
  
  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

6. **Create auth callback route**
```typescript
// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(requestUrl.origin)
}
```

7. **Update all components using auth**
- Replace `getCurrentUser()` calls
- Remove localStorage usage
- Use Supabase Auth hooks

**Testing:**
- Sign up new user
- Sign in existing user
- Sign out
- Access protected routes
- Verify session persistence

---

### Day 3: Enable Row Level Security

**Goal:** Secure database with RLS policies

**Steps:**

1. **Enable RLS on all tables**
```sql
-- Run in Supabase SQL Editor
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
```

2. **Create RLS policies**
```sql
-- Users policies
CREATE POLICY "Users can view all profiles" 
  ON users FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
  ON users FOR UPDATE USING (auth.uid() = id);

-- Posts policies
CREATE POLICY "Anyone can view posts" 
  ON posts FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" 
  ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" 
  ON posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" 
  ON posts FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Anyone can view comments" 
  ON comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" 
  ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" 
  ON comments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" 
  ON comments FOR DELETE USING (auth.uid() = user_id);

-- Votes policies
CREATE POLICY "Anyone can view votes" 
  ON votes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" 
  ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes" 
  ON votes FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes" 
  ON votes FOR DELETE USING (auth.uid() = user_id);

-- Apps policies
CREATE POLICY "Anyone can view apps" 
  ON apps FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create apps" 
  ON apps FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own apps" 
  ON apps FOR UPDATE USING (auth.uid() = user_id);

-- Messages policies (private)
CREATE POLICY "Users can view their own messages" 
  ON messages FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant1_id = auth.uid() 
           OR conversations.participant2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations" 
  ON messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant1_id = auth.uid() 
           OR conversations.participant2_id = auth.uid())
    )
  );
```

**Testing:**
- Try to update another user's post (should fail)
- Try to delete another user's comment (should fail)
- Verify own data can be modified

---

### Day 4-5: Input Validation & Error Handling

**Goal:** Add comprehensive validation and error tracking

**Steps:**

1. **Install dependencies**
```bash
npm install zod isomorphic-dompurify
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

2. **Create validation schemas**
```typescript
// lib/validators/auth.ts
import { z } from 'zod'

export const signUpSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  display_name: z.string()
    .min(1, 'Display name is required')
    .max(50, 'Display name must be less than 50 characters')
})

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

// lib/validators/posts.ts
export const createPostSchema = z.object({
  type: z.enum(['Bug Report', 'Feature Request', 'Complaint']),
  company: z.string().min(1, 'Company is required').max(100),
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
})
```

3. **Create error handling utilities**
```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message)
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(401, message)
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(403, message)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`)
  }
}
```

4. **Create error boundary**
```typescript
// components/ErrorBoundary.tsx
'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
```

5. **Update API routes with validation**
```typescript
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createPostSchema } from '@/lib/validators/posts'
import { getCurrentUser } from '@/lib/auth'
import * as Sentry from '@sentry/nextjs'

export async function POST(request: NextRequest) {
  try {
    // Authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse and validate
    const body = await request.json()
    const validatedData = createPostSchema.parse(body)

    // Sanitize HTML content
    const sanitizedDescription = DOMPurify.sanitize(validatedData.description)

    // Create post
    const { data, error } = await supabase
      .from('posts')
      .insert({
        ...validatedData,
        description: sanitizedDescription,
        user_id: user.id
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    Sentry.captureException(error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Testing:**
- Submit invalid forms (should show validation errors)
- Try XSS attacks (should be sanitized)
- Trigger errors (should be logged to Sentry)

---

## 📅 Phase 2: Architecture & Performance (Weeks 2-4)

### Week 2: API Layer & Service Architecture

**Goal:** Separate concerns and create maintainable architecture

**Steps:**

1. **Create service layer**
```typescript
// lib/services/posts.service.ts
export class PostsService {
  async getPosts(options: GetPostsOptions) {
    // Business logic
    // Caching
    // Error handling
  }

  async createPost(data: CreatePostData, userId: string) {
    // Validation
    // Authorization
    // Database operation
  }

  async updatePost(postId: string, data: UpdatePostData, userId: string) {
    // Check ownership
    // Update
  }

  async deletePost(postId: string, userId: string) {
    // Check ownership
    // Delete
  }
}
```

2. **Create repository layer**
```typescript
// lib/repositories/posts.repository.ts
export class PostsRepository {
  async findAll(filters: PostFilters) {
    return await supabase
      .from('posts')
      .select('*, users(*), comments(count)')
      .match(filters)
  }

  async findById(id: string) {
    return await supabase
      .from('posts')
      .select('*, users(*), comments(*)')
      .eq('id', id)
      .single()
  }

  async create(data: CreatePostData) {
    return await supabase
      .from('posts')
      .insert(data)
      .select()
      .single()
  }
}
```

3. **Update API routes to use services**
```typescript
// app/api/posts/route.ts
import { PostsService } from '@/lib/services/posts.service'

const postsService = new PostsService()

export async function GET(request: NextRequest) {
  const posts = await postsService.getPosts({
    sortBy: 'featured',
    limit: 20
  })
  return NextResponse.json({ posts })
}
```

---

### Week 3: Caching & Database Optimization

**Goal:** Improve performance with caching and optimized queries

**Steps:**

1. **Setup Redis**
```bash
# Sign up for Upstash Redis (free tier)
# Add to .env.local
UPSTASH_REDIS_URL=your_url
UPSTASH_REDIS_TOKEN=your_token
```

2. **Install dependencies**
```bash
npm install @upstash/redis @tanstack/react-query
```

3. **Create caching utility**
```typescript
// lib/cache.ts
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
})

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  // Try cache first
  const cached = await redis.get<T>(key)
  if (cached) return cached

  // Fetch and cache
  const data = await fetcher()
  await redis.setex(key, ttl, JSON.stringify(data))
  return data
}

export async function invalidateCache(pattern: string) {
  const keys = await redis.keys(pattern)
  if (keys.length > 0) {
    await redis.del(...keys)
  }
}
```

4. **Add database indexes**
```sql
-- Run in Supabase SQL Editor
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_type_votes 
  ON posts(type, votes DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_company_created 
  ON posts(company, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_featured 
  ON posts(created_at DESC, votes DESC) WHERE votes > 0;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_post_created 
  ON comments(post_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_votes_user_post 
  ON votes(user_id, post_id);
```

5. **Setup React Query**
```typescript
// app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        cacheTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

---

### Week 4: Monitoring & Rate Limiting

**Goal:** Add production monitoring and protection

**Steps:**

1. **Setup monitoring**
```bash
npm install @vercel/analytics @vercel/speed-insights posthog-js
```

2. **Configure Sentry (already done in Phase 1)**

3. **Add Vercel Analytics**
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

4. **Setup PostHog**
```typescript
// lib/analytics.ts
import posthog from 'posthog-js'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: 'https://app.posthog.com',
  })
}

export { posthog }
```

5. **Implement rate limiting**
```bash
npm install @upstash/ratelimit
```

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
})

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
})

// middleware.ts
export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return new Response('Too Many Requests', { status: 429 })
  }

  return NextResponse.next()
}
```

---

## 📅 Phase 3: Testing & Optimization (Month 2)

### Testing Setup

1. **Install testing dependencies**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @playwright/test
```

2. **Configure Vitest**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
})
```

3. **Write unit tests**
```typescript
// lib/algorithm.test.ts
import { describe, it, expect } from 'vitest'
import { calculatePostScore } from './algorithm'

describe('Algorithm', () => {
  it('should rank newer posts higher', () => {
    // Test implementation
  })
})
```

4. **Setup Playwright**
```bash
npx playwright install
```

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test('user can sign up', async ({ page }) => {
  await page.goto('/auth/signup')
  // Test implementation
})
```

---

## 📅 Phase 4: Advanced Features (Month 3)

### Notification System

1. **Create notifications table**
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

2. **Implement real-time notifications**
3. **Add email notifications with Resend**
4. **Create notification UI**

### Advanced Search

1. **Setup Meilisearch**
2. **Index posts and users**
3. **Implement search UI**
4. **Add filters and facets**

---

## ✅ Success Metrics

### Phase 1 Complete:
- ✅ Secure authentication
- ✅ RLS enabled
- ✅ Input validation
- ✅ Error tracking

### Phase 2 Complete:
- ✅ API layer implemented
- ✅ Caching working
- ✅ Database optimized
- ✅ Monitoring active

### Phase 3 Complete:
- ✅ 80%+ test coverage
- ✅ Bundle size reduced 50%
- ✅ Rate limiting active

### Phase 4 Complete:
- ✅ Notifications working
- ✅ Advanced search
- ✅ CI/CD pipeline

---

## 📞 Support

For questions or issues during implementation:
1. Check documentation links in IMPROVEMENT_ANALYSIS.md
2. Review Supabase docs
3. Check Next.js documentation
4. Review error logs in Sentry

**Last Updated:** November 23, 2024
