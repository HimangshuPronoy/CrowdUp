# CrowdUp - Production Deployment Guide

## 🚀 Complete Production Deployment Checklist

---

## 1. 🔐 Security Hardening

### Environment Variables
```bash
# .env.production
NODE_ENV=production

# Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Redis/Caching
UPSTASH_REDIS_URL=your_redis_url
UPSTASH_REDIS_TOKEN=your_redis_token

# Monitoring
SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key

# Email
RESEND_API_KEY=your_resend_key

# Search
MEILISEARCH_HOST=your_meilisearch_host
MEILISEARCH_API_KEY=your_api_key

# Rate Limiting
RATE_LIMIT_ENABLED=true
```

### Security Headers
```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
]

const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}
```

---

## 2. 📦 Build Optimization

### Next.js Configuration
```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Production optimizations
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  
  // Image optimization
  images: {
    domains: ['your-cdn.com'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  // Bundle analyzer (development only)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer'))({
          enabled: true,
        })
      )
      return config
    },
  }),

  // Remove console logs in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Experimental features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
}

export default nextConfig
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:e2e": "playwright test",
    "analyze": "ANALYZE=true npm run build",
    "db:migrate": "node scripts/migrate.js",
    "db:seed": "node scripts/seed.js"
  }
}
```

---

## 3. 🗄️ Database Setup

### Migration Script
```typescript
// scripts/migrate.ts
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function runMigrations() {
  const migrationsDir = path.join(__dirname, '../supabase_migrations')
  const files = fs.readdirSync(migrationsDir).sort()

  for (const file of files) {
    if (!file.endsWith('.sql')) continue

    console.log(`Running migration: ${file}`)
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8')

    const { error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      console.error(`Migration failed: ${file}`, error)
      process.exit(1)
    }

    console.log(`✓ Completed: ${file}`)
  }

  console.log('All migrations completed successfully!')
}

runMigrations()
```

### Database Backup
```bash
#!/bin/bash
# scripts/backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_$DATE.sql"

# Backup using Supabase CLI
supabase db dump > $BACKUP_FILE

# Upload to S3 or cloud storage
aws s3 cp $BACKUP_FILE s3://your-bucket/backups/

echo "Backup completed: $BACKUP_FILE"
```

---

## 4. 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Run tests
        run: npm run test
      
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run security audit
        run: npm audit --production
      
      - name: Check for vulnerabilities
        run: npm audit --audit-level=high

  e2e:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e

  deploy:
    runs-on: ubuntu-latest
    needs: [test, security, e2e]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 5. 📊 Monitoring Setup

### Sentry Configuration
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Performance monitoring
  tracesSampleRate: 1.0,
  
  // Session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ['localhost', /^https:\/\/crowdup\.com/],
    }),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Filter sensitive data
  beforeSend(event, hint) {
    // Remove sensitive information
    if (event.request) {
      delete event.request.cookies
      delete event.request.headers
    }
    return event
  },
})
```

### Health Check Endpoint
```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { redis } from '@/lib/redis'

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {
      database: false,
      redis: false,
      api: true,
    }
  }

  try {
    // Check database
    const { error: dbError } = await supabase
      .from('users')
      .select('id')
      .limit(1)
    checks.checks.database = !dbError

    // Check Redis
    await redis.ping()
    checks.checks.redis = true

  } catch (error) {
    checks.status = 'unhealthy'
  }

  const allHealthy = Object.values(checks.checks).every(v => v === true)
  
  return NextResponse.json(checks, {
    status: allHealthy ? 200 : 503
  })
}
```

---

## 6. 🌐 CDN & Caching

### Vercel Configuration
```json
// vercel.json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=60, stale-while-revalidate"
        }
      ]
    },
    {
      "source": "/(.*).jpg",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ],
  "redirects": [
    {
      "source": "/home",
      "destination": "/",
      "permanent": true
    }
  ]
}
```

### Cloudflare Setup
```javascript
// cloudflare-worker.js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const cache = caches.default
  let response = await cache.match(request)

  if (!response) {
    response = await fetch(request)
    
    // Cache static assets
    if (request.url.includes('/static/')) {
      const headers = new Headers(response.headers)
      headers.set('Cache-Control', 'public, max-age=31536000')
      response = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      })
      event.waitUntil(cache.put(request, response.clone()))
    }
  }

  return response
}
```

---

## 7. 🔍 SEO Optimization

### Metadata Configuration
```typescript
// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'CrowdUp - Social Feedback Platform',
    template: '%s | CrowdUp'
  },
  description: 'Share and vote on bug reports, feature requests, and feedback for your favorite apps and companies.',
  keywords: ['feedback', 'bug reports', 'feature requests', 'social platform'],
  authors: [{ name: 'CrowdUp Team' }],
  creator: 'CrowdUp',
  publisher: 'CrowdUp',
  
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://crowdup.com',
    siteName: 'CrowdUp',
    title: 'CrowdUp - Social Feedback Platform',
    description: 'Share and vote on feedback for your favorite apps',
    images: [
      {
        url: 'https://crowdup.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CrowdUp'
      }
    ]
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'CrowdUp - Social Feedback Platform',
    description: 'Share and vote on feedback for your favorite apps',
    images: ['https://crowdup.com/twitter-image.png'],
    creator: '@crowdup'
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  verification: {
    google: 'your-google-verification-code',
  },
}
```

### Sitemap Generation
```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://crowdup.com'

  // Get all posts
  const { data: posts } = await supabase
    .from('posts')
    .select('id, updated_at')
    .order('updated_at', { ascending: false })

  const postUrls = posts?.map((post) => ({
    url: `${baseUrl}/post/${post.id}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  })) || []

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${baseUrl}/trending`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    ...postUrls,
  ]
}
```

---

## 8. 📱 PWA Configuration

### Manifest
```json
// public/manifest.json
{
  "name": "CrowdUp",
  "short_name": "CrowdUp",
  "description": "Social Feedback Platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#f97316",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### Service Worker
```javascript
// public/sw.js
const CACHE_NAME = 'crowdup-v1'
const urlsToCache = [
  '/',
  '/offline',
  '/manifest.json'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => caches.match('/offline'))
  )
})
```

---

## 9. 🔄 Backup & Recovery

### Automated Backups
```bash
#!/bin/bash
# scripts/automated-backup.sh

# Database backup
supabase db dump > "backups/db_$(date +%Y%m%d).sql"

# Upload to S3
aws s3 sync backups/ s3://crowdup-backups/

# Keep only last 30 days
find backups/ -type f -mtime +30 -delete

# Verify backup
if [ $? -eq 0 ]; then
  echo "Backup successful"
else
  echo "Backup failed" | mail -s "Backup Alert" admin@crowdup.com
fi
```

### Disaster Recovery Plan
```markdown
## Recovery Steps

1. **Database Restore**
   ```bash
   supabase db restore backups/db_latest.sql
   ```

2. **Verify Data Integrity**
   ```sql
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM posts;
   ```

3. **Redeploy Application**
   ```bash
   vercel --prod
   ```

4. **Run Health Checks**
   ```bash
   curl https://crowdup.com/api/health
   ```

5. **Notify Users**
   - Send status update email
   - Post on status page
```

---

## 10. 📋 Pre-Launch Checklist

### Security
- [ ] All environment variables secured
- [ ] RLS enabled on all tables
- [ ] Rate limiting configured
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Input validation on all forms
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented

### Performance
- [ ] Database indexes added
- [ ] Caching configured
- [ ] Images optimized
- [ ] Bundle size < 200KB
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals passing

### Monitoring
- [ ] Sentry configured
- [ ] Analytics setup
- [ ] Error tracking active
- [ ] Health checks running
- [ ] Uptime monitoring
- [ ] Performance monitoring

### Testing
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Load testing completed
- [ ] Security audit passed

### Documentation
- [ ] API documentation
- [ ] User guide
- [ ] Admin guide
- [ ] Deployment guide
- [ ] Troubleshooting guide

### Legal
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Cookie policy
- [ ] GDPR compliance
- [ ] Data retention policy

---

## 🚀 Launch Day Checklist

1. **Final Testing** (2 hours before)
   - Run all tests
   - Check all integrations
   - Verify backups

2. **Deploy** (1 hour before)
   - Deploy to production
   - Run migrations
   - Verify deployment

3. **Monitor** (First 24 hours)
   - Watch error rates
   - Monitor performance
   - Check user feedback

4. **Post-Launch**
   - Send announcement
   - Monitor metrics
   - Fix critical issues

---

**Estimated Timeline:**
- Security setup: 1 day
- CI/CD pipeline: 1 day
- Monitoring: 1 day
- Testing: 2 days
- Documentation: 1 day
- **Total: 6 days to production-ready**

**Last Updated:** November 23, 2024
