# System Architecture: Social Media Planner
## PART 3 - Non-Functional Requirements (NFR) Coverage

**Date:** 2026-01-10
**Architect:** Sami
**Version:** 1.0
**Project Type:** web-app
**Project Level:** 2
**Status:** Draft

---

## Document Overview

This document (Part 3 of 4) provides comprehensive coverage of all Non-Functional Requirements (NFR) from the PRD. It details security architecture, scalability & performance strategies, reliability & availability design, and systematic solutions for each of the 18 NFRs.

**Related Documents:**
- Architecture Part 1: Overview & System Design
- Architecture Part 2: Data & API Architecture
- Architecture Part 4: Deployment & Operations
- PRD: `docs/prd-social-media-planner-2026-01-06.md`

---

## Security Architecture

### Authentication Design

**Technology Stack:**
- **Primary:** Supabase Auth (JWT-based)
- **Password Hashing:** bcrypt (cost factor 10) ou Argon2id
- **Session Management:** JWT tokens avec refresh tokens
- **Transport Security:** HTTPS obligatoire (TLS 1.3)

**Authentication Flow:**

```
1. User Registration
   ├─> Frontend: Email + Password validation
   ├─> API: POST /api/auth/register
   ├─> Supabase Auth: Create user in auth.users
   │   ├─> Hash password with bcrypt (10 rounds)
   │   ├─> Generate UUID user_id
   │   └─> Trigger: Insert into public.users table
   ├─> Generate JWT access_token (expires: 1h)
   ├─> Generate refresh_token (expires: 7 days)
   └─> Return tokens + user object

2. User Login
   ├─> Frontend: Email + Password
   ├─> API: POST /api/auth/login
   ├─> Supabase Auth: Verify credentials
   │   ├─> Fetch user by email
   │   ├─> Compare password hash (bcrypt.compare)
   │   └─> If match: generate tokens
   ├─> Return access_token + refresh_token
   └─> Frontend: Store tokens (httpOnly cookies)

3. Authenticated Request
   ├─> Frontend: Include JWT in Authorization header
   ├─> API Middleware: Verify JWT signature
   │   ├─> Decode JWT (Supabase verifies with secret)
   │   ├─> Check expiration (exp claim)
   │   ├─> Extract user_id from sub claim
   │   └─> Attach to request context
   ├─> RLS: Automatically filters DB queries by user_id
   └─> API: Process request with user context

4. Token Refresh
   ├─> Access token expired (401 Unauthorized)
   ├─> Frontend: POST /api/auth/refresh with refresh_token
   ├─> Supabase Auth: Validate refresh_token
   │   ├─> Check if not revoked
   │   ├─> Check expiration
   │   └─> Generate new access_token
   ├─> Return new access_token
   └─> Frontend: Retry original request

5. Logout
   ├─> Frontend: POST /api/auth/logout
   ├─> API: Revoke refresh_token (blacklist in DB)
   ├─> Clear cookies
   └─> Redirect to /login
```

**JWT Token Structure:**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user_id_uuid",
    "email": "user@example.com",
    "aud": "authenticated",
    "role": "authenticated",
    "iat": 1641234567,
    "exp": 1641238167
  },
  "signature": "..." // HMAC SHA-256
}
```

**Password Policy:**
- Minimum 8 caractères
- Au moins 1 majuscule
- Au moins 1 minuscule
- Au moins 1 chiffre
- Caractères spéciaux recommandés
- Validation frontend + backend

**Session Security:**
- **Access Token Lifetime:** 1 heure (court pour sécurité)
- **Refresh Token Lifetime:** 7 jours (persistent login)
- **Token Storage:** httpOnly cookies (pas localStorage = XSS protection)
- **CSRF Protection:** SameSite=Strict + CSRF tokens pour mutations
- **Token Rotation:** Refresh token rotate à chaque refresh

**Password Reset Flow:**
```
1. User: Request reset
   ├─> POST /api/auth/reset-password {email}
   └─> Supabase: Generate secure reset token (256-bit random)

2. Email Sent
   ├─> Resend API: Send email with reset link
   └─> Link: https://app.com/reset-password?token=...

3. User: Click link
   ├─> Frontend: Validate token with API
   └─> Show new password form

4. User: Submit new password
   ├─> POST /api/auth/reset-password/confirm
   ├─> Validate token (not expired, not used)
   ├─> Hash new password
   ├─> Update auth.users
   └─> Invalidate all existing sessions (force re-login)
```

**Multi-Factor Authentication (Phase 2+):**
- TOTP (Time-based One-Time Password)
- Backup codes
- SMS fallback (optionnel)

---

### Authorization Design

**Model:** **Attribute-Based Access Control (ABAC)** simplifié

**Access Control Layers:**

**Layer 1: Row-Level Security (RLS) - Database Level**

Supabase PostgreSQL RLS policies enforce data isolation:

```sql
-- Example: Posts table RLS policy
CREATE POLICY "Users can only access own posts"
  ON posts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**Effect:**
- Users can ONLY see/modify their own data
- Impossible d'accéder aux posts d'autres users même si ID connu
- Enforced au niveau database (pas contournable par code applicatif)

**RLS Policies Applied to All Tables:**
- `users` - Own profile only
- `posts` - Own posts only
- `templates` - Own templates only
- `media` - Own media only
- `ai_generations` - Own generations only
- `social_connections` - Own connections only

**Layer 2: API Authorization - Application Level**

API routes vérifient ownership avant actions sensibles:

```typescript
// Example: Delete post endpoint
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  // 1. Extract user from JWT (middleware)
  const session = await getSession(req);
  if (!session) return new Response('Unauthorized', { status: 401 });

  const userId = session.user.id;

  // 2. Fetch post with RLS (automatic filtering by user_id)
  const post = await prisma.post.findUnique({
    where: { id: params.id }
    // RLS ensures: AND user_id = userId
  });

  if (!post) {
    // Either doesn't exist OR belongs to another user
    return new Response('Not found', { status: 404 });
  }

  // 3. Business rule: Can't delete published posts
  if (post.status === 'published') {
    return new Response('Cannot delete published post', { status: 422 });
  }

  // 4. Delete (RLS ensures only own posts deleted)
  await prisma.post.delete({
    where: { id: params.id }
  });

  return new Response(null, { status: 204 });
}
```

**Authorization Matrix:**

| Resource | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| Own Posts | ✓ | ✓ | ✓ | ✓ (if draft/scheduled) |
| Other Users' Posts | ✗ | ✗ | ✗ | ✗ |
| Own Templates | ✓ | ✓ | ✓ | ✓ |
| Other Users' Templates | ✗ | ✗ | ✗ | ✗ |
| Own Media | ✓ | ✓ | ✓ | ✓ (if not used in posts) |
| Other Users' Media | ✗ | ✗ | ✗ | ✗ |
| Own Profile | N/A | ✓ | ✓ (email, metadata) | ✗ |
| Other Users' Profiles | N/A | ✗ | ✗ | ✗ |

**Future: Role-Based Access Control (RBAC) - Phase 3+**

Si collaboration multi-users ajoutée:
- **Roles:** Admin, Editor, Viewer
- **Admin:** Full access (all CRUD)
- **Editor:** Create/edit drafts, cannot publish
- **Viewer:** Read-only access

Implémentation:
```sql
-- Add role column to users table
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'owner';

-- RLS policy adjusted
CREATE POLICY "Users with editor role can view team posts"
  ON posts FOR SELECT
  USING (
    auth.uid() = user_id OR
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'editor')
  );
```

**API Rate Limiting (Authorization aspect):**
- Limite requests par user (100/min)
- Limite générations IA par user (100/mois idées, 200/mois posts)
- Headers X-RateLimit-* pour transparence

---

### Data Encryption

**Encryption At Rest:**

**Database Encryption:**
- **PostgreSQL:** Transparent Data Encryption (TDE) activé par Supabase
- **Algorithm:** AES-256-CBC
- **Scope:** Toutes les tables, indexes, backups
- **Key Management:** Supabase gère les clés (rotation automatique)

**Sensitive Fields Encryption (Layer 2):**

OAuth tokens dans `social_connections` table nécessitent encryption supplémentaire:

```sql
-- Using Supabase Vault (pgsodium extension)
CREATE EXTENSION IF NOT EXISTS pgsodium;

-- Encrypt access_token before storing
INSERT INTO social_connections (
  user_id,
  platform,
  access_token,
  ...
) VALUES (
  $1,
  $2,
  pgsodium.crypto_secretbox_new($3::bytea, (SELECT key FROM vault.secrets WHERE name = 'social_tokens_key')),
  ...
);

-- Decrypt when retrieving
SELECT
  id,
  platform,
  pgsodium.crypto_secretbox_open(access_token, (SELECT key FROM vault.secrets WHERE name = 'social_tokens_key')) AS access_token_decrypted
FROM social_connections
WHERE user_id = $1;
```

**Secrets in Vault:**
- OAuth tokens (LinkedIn, Instagram, Facebook)
- API keys tierces (OpenAI, Anthropic)
- Encryption keys

**File Storage Encryption (Supabase Storage):**
- Files uploaded to Supabase Storage bucket `media`
- Server-side encryption enabled (AES-256)
- Signed URLs avec expiration (7 jours) pour accès sécurisé
- Object-level access control (RLS policies on storage)

**Encryption In Transit:**

**HTTPS Everywhere:**
- **TLS 1.3** obligatoire (minimum TLS 1.2)
- **Certificate:** Let's Encrypt auto-renew via Vercel
- **HSTS:** HTTP Strict Transport Security header enabled
  ```http
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  ```
- **Redirect:** HTTP → HTTPS automatique (Vercel config)

**API Calls to External Services:**
- OpenAI API: HTTPS uniquement
- LinkedIn API: HTTPS uniquement
- Instagram API: HTTPS uniquement
- Supabase API: HTTPS uniquement

**WebSocket (si real-time ajouté Phase 2+):**
- WSS (WebSocket Secure) over TLS

**Certificate Pinning (Mobile app future):**
- Si application mobile créée, pin Vercel certificate

---

### Security Best Practices

**1. Input Validation & Sanitization**

**Frontend Validation (First Line):**
```typescript
// Example: Post creation form
import { z } from 'zod';

const postSchema = z.object({
  platform: z.enum(['linkedin', 'instagram', 'both']),
  content: z.string()
    .min(10, 'Content too short')
    .max(5000, 'Content too long')
    .trim(),
  hashtags: z.array(z.string().regex(/^[a-zA-Z0-9]+$/))
    .max(30, 'Max 30 hashtags'),
  scheduled_at: z.string().datetime().optional()
});

// Validate before API call
const result = postSchema.safeParse(formData);
if (!result.success) {
  // Show validation errors
}
```

**Backend Validation (Critical):**
```typescript
// API Route: POST /api/content/posts
export async function POST(req: Request) {
  const body = await req.json();

  // Validate with same schema
  const result = postSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { error: { type: 'validation_error', details: result.error } },
      { status: 400 }
    );
  }

  // Sanitize HTML (prevent XSS)
  const sanitizedContent = DOMPurify.sanitize(result.data.content);

  // Business logic...
}
```

**2. SQL Injection Prevention**

**Prisma ORM = Parameterized Queries:**
```typescript
// SAFE - Prisma uses parameterized queries
const posts = await prisma.post.findMany({
  where: {
    user_id: userId, // Automatically escaped
    content: { contains: searchTerm } // Automatically escaped
  }
});

// NEVER do this (raw SQL injection vulnerable):
// await prisma.$executeRaw`SELECT * FROM posts WHERE content LIKE '%${searchTerm}%'`;

// If raw SQL needed, use parameterized:
await prisma.$executeRaw`SELECT * FROM posts WHERE content LIKE ${`%${searchTerm}%`}`;
```

**RLS as Additional Defense:**
- Even if SQL injection réussie, RLS limite accès aux données du user

**3. Cross-Site Scripting (XSS) Prevention**

**Content Security Policy (CSP) Headers:**
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https://*.supabase.co;
      font-src 'self' data:;
      connect-src 'self' https://*.supabase.co https://api.openai.com;
      frame-ancestors 'none';
    `.replace(/\s{2,}/g, ' ').trim()
  }
];
```

**React Auto-Escaping:**
- React escape automatiquement les variables dans JSX
```tsx
// SAFE - React escapes automatically
<div>{post.content}</div>

// DANGEROUS - dangerouslySetInnerHTML
// Only use with sanitized content
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} />
```

**DOMPurify for User-Generated Content:**
```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize before saving to DB
const sanitized = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
  ALLOWED_ATTR: ['href']
});
```

**4. Cross-Site Request Forgery (CSRF) Prevention**

**SameSite Cookies:**
```typescript
// Set auth cookies with SameSite=Strict
const cookieOptions = {
  httpOnly: true,
  secure: true, // HTTPS only
  sameSite: 'strict' as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/'
};

cookies().set('auth_token', token, cookieOptions);
```

**CSRF Tokens for State-Changing Operations:**
```typescript
// Generate CSRF token on page load
const csrfToken = crypto.randomBytes(32).toString('hex');
cookies().set('csrf_token', csrfToken, { httpOnly: true });

// Include in forms
<form>
  <input type="hidden" name="csrf_token" value={csrfToken} />
</form>

// Verify on POST/PATCH/DELETE
export async function POST(req: Request) {
  const formData = await req.formData();
  const submittedToken = formData.get('csrf_token');
  const cookieToken = cookies().get('csrf_token')?.value;

  if (submittedToken !== cookieToken) {
    return new Response('Invalid CSRF token', { status: 403 });
  }

  // Process request...
}
```

**5. Clickjacking Prevention**

**X-Frame-Options Header:**
```typescript
// Prevent embedding in iframes
{
  key: 'X-Frame-Options',
  value: 'DENY'
}
```

**6. Rate Limiting & DDoS Protection**

**Vercel Edge Network:**
- Automatic DDoS protection
- Geo-blocking if needed

**Application-Level Rate Limiting:**
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 req/min
  analytics: true
});

export async function middleware(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const { success, limit, remaining, reset } = await ratelimit.limit(ip);

  if (!success) {
    return new Response('Rate limit exceeded', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString()
      }
    });
  }

  return NextResponse.next();
}
```

**AI Generation Rate Limiting:**
```typescript
// Check monthly quota before AI generation
const genCount = await prisma.ai_generation.count({
  where: {
    user_id: userId,
    type: 'ideas',
    created_at: { gte: startOfMonth(new Date()) }
  }
});

if (genCount >= 100) {
  return Response.json({
    error: {
      type: 'quota_exceeded',
      message: 'Monthly quota of 100 idea generations exceeded',
      quota_resets_at: startOfMonth(addMonths(new Date(), 1))
    }
  }, { status: 429 });
}
```

**7. Secure File Upload**

**Validation:**
```typescript
export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  // Validate file type (MIME + extension)
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return Response.json({ error: 'Invalid file type' }, { status: 400 });
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return Response.json({ error: 'File too large' }, { status: 413 });
  }

  // Validate file content (magic bytes)
  const buffer = await file.arrayBuffer();
  const magicBytes = new Uint8Array(buffer.slice(0, 4));
  // Check JPEG: FF D8 FF or PNG: 89 50 4E 47
  const isValidImage = validateMagicBytes(magicBytes);
  if (!isValidImage) {
    return Response.json({ error: 'Invalid file content' }, { status: 400 });
  }

  // Generate secure filename (UUID + extension)
  const ext = path.extname(file.name);
  const filename = `${crypto.randomUUID()}${ext}`;

  // Upload to Supabase Storage with RLS
  const { data, error } = await supabase.storage
    .from('media')
    .upload(`users/${userId}/posts/${filename}`, buffer, {
      contentType: file.type,
      cacheControl: '3600'
    });

  // ...
}
```

**8. Secrets Management**

**Environment Variables (Vercel):**
```bash
# .env.local (development)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx... # Server-only, never expose to client

OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx

# Production: Set in Vercel dashboard (Environment Variables)
```

**Never Commit Secrets:**
```gitignore
# .gitignore
.env
.env.local
.env.production
*.key
*.pem
```

**Rotate Secrets Regularly:**
- API keys: Rotation tous les 90 jours
- Database passwords: Rotation tous les 180 jours (Supabase gère)
- JWT secret: Ne jamais changer (invaliderait toutes sessions)

**9. Logging & Monitoring (Security Events)**

**Log Security Events:**
```typescript
// Example: Failed login attempts
await prisma.security_event.create({
  data: {
    type: 'failed_login',
    user_email: email,
    ip_address: req.headers.get('x-forwarded-for'),
    user_agent: req.headers.get('user-agent'),
    metadata: { reason: 'invalid_password' }
  }
});

// Alert if 5 failed attempts in 10 minutes
const failedAttempts = await prisma.security_event.count({
  where: {
    type: 'failed_login',
    user_email: email,
    created_at: { gte: subMinutes(new Date(), 10) }
  }
});

if (failedAttempts >= 5) {
  // Lock account temporarily + send alert email
}
```

**Sentry for Security Errors:**
- Track authentication failures
- Track authorization violations
- Track suspicious activity patterns

**10. Dependency Security**

**Automated Vulnerability Scanning:**
```bash
# GitHub Dependabot enabled (automatic PRs for vulnerable deps)

# Manual check
npm audit

# Fix vulnerabilities
npm audit fix
```

**Keep Dependencies Updated:**
- Review updates weekly
- Security patches applied immediately
- Major version updates: test thoroughly before deploy

---

## Scalability & Performance Strategy

### Scaling Strategy

**Current Architecture Scalability:**

**Serverless Auto-Scaling (Vercel):**
```
Request Load:        10 req/s  →  100 req/s  →  1000 req/s
Vercel Functions:    1 instance → 10 instances → 100 instances
Auto-scaling:        Automatic, < 1 second spin-up
Cost:                Pay-per-invocation (no idle cost)
```

**Horizontal Scaling:**
- **Application Layer:** Vercel functions scale horizontally automatiquement
- **Database Layer:** Supabase PostgreSQL connection pooling (max 100 connections)
- **Storage Layer:** Supabase Storage scale automatiquement (CDN edge caching)

**Vertical Scaling (Future if needed):**
- **Database:** Upgrade Supabase tier (Pro: 4 GB RAM, 2 CPU cores → 8 GB, 4 cores)
- **Not needed for MVP** (4 users) or Phase 2 (10-20 users)

**Database Scaling Strategies:**

**Read Replicas (Phase 3+ if >100 users):**
```
Primary DB (Write)  ←────── Write queries (POST, PATCH, DELETE)
     │
     ├─ Replica 1 (Read) ←─── Read queries (GET) - 50%
     └─ Replica 2 (Read) ←─── Read queries (GET) - 50%
```

Implementation:
```typescript
// Prisma with read replicas
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL // Write
    }
  }
});

const prismaReplica = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_READ_REPLICA_URL // Read
    }
  }
});

// Use replica for GET requests
export async function GET(req: Request) {
  const posts = await prismaReplica.post.findMany({...});
  // ...
}

// Use primary for mutations
export async function POST(req: Request) {
  const post = await prisma.post.create({...});
  // ...
}
```

**Sharding (Not needed, but strategy if >10K users):**
- Shard by `user_id` (geographic or hash-based)
- Each shard = independent database
- Route queries to correct shard based on user_id

**Connection Pooling:**
- Supabase manage connection pool (PgBouncer)
- Max 100 concurrent connections (free tier)
- Connection reuse évite overhead TCP handshake

**Load Balancing:**

**Vercel Edge Network (Built-in):**
```
User (Paris)  ───→  Vercel Edge (Paris)  ───→  Function (eu-west-1)
User (Genève) ───→  Vercel Edge (Zürich) ───→  Function (eu-west-1)
User (Lausanne)───→  Vercel Edge (Genève) ───→  Function (eu-west-1)
```

- **70+ Edge locations** worldwide
- **Smart routing:** Request routed to nearest edge
- **Static assets:** Served from edge (no function invocation)
- **Dynamic content:** Edge forwards to serverless function

**Algorithm:** Round-robin + least-connections (Vercel handles)

**Health Checks:**
- Vercel monitors function health
- Unhealthy instances removed from rotation
- Auto-restart failed functions

---

### Performance Optimization

**Frontend Optimizations:**

**1. Code Splitting & Lazy Loading:**
```typescript
// Route-based code splitting (Next.js automatic)
// Each page = separate bundle

// Component lazy loading
import dynamic from 'next/dynamic';

const PostEditor = dynamic(() => import('@/components/PostEditor'), {
  loading: () => <Skeleton />,
  ssr: false // Client-side only (rich editor)
});

// Reduce initial bundle size by 300KB
```

**2. Image Optimization (Next.js Image):**
```tsx
import Image from 'next/image';

<Image
  src={media.url}
  alt={media.alt_text}
  width={800}
  height={600}
  loading="lazy" // Lazy load images
  placeholder="blur" // Blur placeholder while loading
  quality={85} // Compress to 85% (good balance)
/>
```

Benefits:
- Automatic WebP/AVIF format (50% smaller)
- Responsive images (srcset)
- Lazy loading below fold
- Blur-up effect

**3. Font Optimization:**
```typescript
// next.config.js
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Prevent FOIT (Flash of Invisible Text)
  preload: true
});

// Fonts self-hosted by Next.js (no external request)
```

**4. Bundle Size Optimization:**
```bash
# Analyze bundle
npm run build
npx @next/bundle-analyzer

# Remove unused dependencies
npm prune

# Tree-shaking (automatic with ESM)
```

Target: Initial bundle < 200KB (gzipped)

**Backend Optimizations:**

**1. Database Query Optimization:**

**N+1 Query Problem:**
```typescript
// BAD - N+1 queries (1 + N)
const posts = await prisma.post.findMany({ where: { user_id } });
for (const post of posts) {
  post.media = await prisma.media.findMany({ where: { post_id: post.id } });
}

// GOOD - 1 query with join
const posts = await prisma.post.findMany({
  where: { user_id },
  include: { media: true } // JOIN in single query
});
```

**Select Only Needed Fields:**
```typescript
// BAD - Select all columns (*)
const posts = await prisma.post.findMany({ where: { user_id } });

// GOOD - Select only needed fields
const posts = await prisma.post.findMany({
  where: { user_id },
  select: {
    id: true,
    content: true,
    created_at: true,
    media: { select: { url: true, type: true } }
  }
});
// Reduce data transfer by 70%
```

**Database Indexes:**
```sql
-- Indexes created in schema (Part 2)
CREATE INDEX idx_posts_user_id ON posts(user_id); -- Foreign key
CREATE INDEX idx_posts_status ON posts(status); -- Filter by status
CREATE INDEX idx_posts_scheduled_at ON posts(scheduled_at) WHERE scheduled_at IS NOT NULL; -- Partial index
CREATE INDEX idx_posts_created_at ON posts(created_at DESC); -- Sorting

-- Query performance: O(log n) with index vs O(n) without
```

**Query Plan Analysis:**
```sql
-- Analyze slow queries
EXPLAIN ANALYZE
SELECT * FROM posts
WHERE user_id = 'uuid'
  AND status = 'scheduled'
ORDER BY scheduled_at ASC;

-- Ensure "Index Scan" (good) not "Seq Scan" (bad)
```

**2. API Response Compression:**
```typescript
// next.config.js
module.exports = {
  compress: true // Gzip responses (reduce size by 70%)
};

// Vercel automatically applies Brotli compression (even better)
```

**3. Pagination (Cursor-based):**
```typescript
// BAD - Offset pagination (slow for large offsets)
const posts = await prisma.post.findMany({
  skip: 1000, // Scans 1000 rows then throws away
  take: 20
});

// GOOD - Cursor pagination (constant time)
const posts = await prisma.post.findMany({
  take: 20,
  skip: cursor ? 1 : 0,
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { created_at: 'desc' }
});

// Next cursor
const nextCursor = posts.length === 20 ? posts[19].id : null;
```

**4. Database Connection Pooling:**
```typescript
// Prisma connection pool (managed)
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // Connection pool config
  log: ['query', 'error', 'warn'],
});

// Supabase PgBouncer manages connections
// Pool size: 100 connections (free tier)
```

---

### Caching Strategy

**Caching Layers:**

```
┌─────────────────────────────────────────────────────┐
│  Layer 1: Browser Cache (Cache-Control headers)    │
│  - Static assets: 1 year                            │
│  - API responses: No cache (dynamic)                │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  Layer 2: CDN Cache (Vercel Edge Network)          │
│  - Static pages: 1 hour (revalidate)               │
│  - Images: 1 year (immutable)                       │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  Layer 3: Application Cache (Redis - Phase 2)      │
│  - AI generation results: 24 hours                  │
│  - User sessions: 1 hour                            │
│  - Rate limit counters: 1 minute                    │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  Layer 4: Database (PostgreSQL)                     │
│  - Source of truth                                  │
└─────────────────────────────────────────────────────┘
```

**Layer 1: Browser Cache**

```typescript
// Static assets (images, fonts, CSS, JS)
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable' // 1 year
          }
        ]
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate' // Never cache API responses
          }
        ]
      }
    ];
  }
};
```

**Layer 2: CDN Cache (Vercel Edge)**

**Static Pages (ISR - Incremental Static Regeneration):**
```typescript
// app/posts/page.tsx
export const revalidate = 3600; // Revalidate every 1 hour

export default async function PostsPage() {
  const posts = await prisma.post.findMany({...});
  return <PostsList posts={posts} />;
}

// Flow:
// 1. First request: Generate page, cache on edge for 1h
// 2. Subsequent requests (< 1h): Serve from edge (instant)
// 3. After 1h: Serve stale, regenerate in background, cache new version
```

**On-Demand Revalidation:**
```typescript
// API route: Revalidate cache after post update
import { revalidatePath } from 'next/cache';

export async function PATCH(req: Request) {
  // Update post in DB
  await prisma.post.update({...});

  // Invalidate cache
  revalidatePath('/posts');
  revalidatePath('/calendar');

  return Response.json({ success: true });
}
```

**Layer 3: Application Cache (Redis - Upstash)**

**Setup (Phase 2):**
```typescript
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv(); // UPSTASH_REDIS_REST_URL

// Cache AI generation results (avoid re-generating identical requests)
export async function generateIdeas(prompt: string) {
  const cacheKey = `ai:ideas:${hashPrompt(prompt)}`;

  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached as string);
  }

  // Generate
  const ideas = await openai.chat.completions.create({...});

  // Cache for 24h
  await redis.set(cacheKey, JSON.stringify(ideas), { ex: 86400 });

  return ideas;
}
```

**Cache Invalidation Strategies:**
1. **Time-based (TTL):** Auto-expire after X seconds
2. **Event-based:** Invalidate on update/delete
3. **Manual:** Clear cache on demand (admin action)

**What to Cache:**
- ✓ AI generation results (expensive, deterministic)
- ✓ User sessions (reduce DB queries)
- ✓ Rate limit counters (fast access)
- ✓ Aggregated stats (counts, analytics)
- ✗ User-specific content (privacy concern)
- ✗ Real-time data (calendar, drafts)

**Cache Hit Ratio Target:** >80%

---

### Performance Monitoring

**Web Vitals (Frontend):**

**Core Web Vitals:**
- **LCP (Largest Contentful Paint):** <2.5s (good)
- **FID (First Input Delay):** <100ms (good)
- **CLS (Cumulative Layout Shift):** <0.1 (good)

**Vercel Analytics (Built-in):**
```typescript
// Auto-tracked by Vercel
// View in Vercel dashboard: Analytics → Web Vitals
```

**Custom Performance Tracking:**
```typescript
// Track AI generation time
export async function generatePost(idea: string) {
  const startTime = performance.now();

  const result = await openai.chat.completions.create({...});

  const duration = performance.now() - startTime;

  // Log to database
  await prisma.ai_generation.create({
    data: {
      duration_ms: Math.round(duration),
      // ...
    }
  });

  // Alert if > 30s (NFR-002 violation)
  if (duration > 30000) {
    await sendAlert('AI generation timeout', { duration });
  }

  return result;
}
```

**Database Performance:**
```typescript
// Prisma query logging
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' }
  ]
});

prisma.$on('query', (e) => {
  // Log slow queries (> 1s)
  if (e.duration > 1000) {
    console.warn('Slow query detected:', {
      query: e.query,
      duration: e.duration,
      params: e.params
    });
  }
});
```

**Performance Budget:**
- Initial page load: <3s (NFR-001)
- AI idea generation: <30s (NFR-002)
- AI post generation: <15s (NFR-002)
- Auto-save: <2s (NFR-003)
- API response (typical): <500ms
- Database query (typical): <100ms

---

## Reliability & Availability

### High Availability Design

**Target Uptime:** >99% (NFR-009) = max 7h downtime/mois

**Infrastructure Availability:**

**Vercel (Application Layer):**
- **SLA:** 99.99% uptime
- **Multi-region:** Edge functions deployed to multiple regions
- **Automatic failover:** If one region down, traffic routed to another
- **Health checks:** Every 60s, unhealthy instances removed

**Supabase (Database Layer):**
- **SLA:** 99.9% uptime (free tier), 99.95% (pro tier)
- **Multi-AZ deployment:** Database replicated across availability zones
- **Automatic failover:** If primary DB down, promote replica (<30s)
- **Connection pooling:** PgBouncer prevents connection exhaustion

**Architecture Redundancy:**

```
┌────────────────────────────────────────────────────┐
│                User Request                        │
└────────────────┬───────────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────────┐
│         Vercel Edge Network (Global CDN)           │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│   │ Edge 1  │  │ Edge 2  │  │ Edge 3  │  (70+)   │
│   │ (Paris) │  │ (Zürich)│  │ (London)│          │
│   └────┬────┘  └────┬────┘  └────┬────┘          │
└────────┼────────────┼────────────┼────────────────┘
         │            │            │
         └────────────┴────────────┘
                      │
                      ↓ (Smart routing)
┌────────────────────────────────────────────────────┐
│        Vercel Functions (Serverless)               │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│   │ Function │  │ Function │  │ Function │ (Auto) │
│   │ Instance │  │ Instance │  │ Instance │ (Scale)│
│   │    #1    │  │    #2    │  │    #3    │       │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘       │
└────────┼─────────────┼─────────────┼──────────────┘
         │             │             │
         └─────────────┴─────────────┘
                       │
                       ↓
┌────────────────────────────────────────────────────┐
│         Supabase PostgreSQL (Multi-AZ)             │
│   ┌──────────────┐       ┌──────────────┐         │
│   │  Primary DB  │◄─────►│  Replica DB  │         │
│   │   (Zone A)   │  Sync │   (Zone B)   │         │
│   └──────────────┘       └──────────────┘         │
│   (Automatic failover if primary down)             │
└────────────────────────────────────────────────────┘
```

**Single Points of Failure (SPOF) Analysis:**

| Component | SPOF? | Mitigation |
|-----------|-------|------------|
| Vercel Edge | ❌ No | 70+ edge locations, automatic routing |
| Vercel Functions | ❌ No | Auto-scale, multiple instances |
| Supabase DB | ❌ No | Multi-AZ, automatic failover |
| Supabase Storage | ❌ No | Replicated across AZs |
| OpenAI API | ⚠️ Yes | Fallback to Claude API |
| LinkedIn API | ⚠️ Yes | Degrade gracefully, manual publish |
| Instagram API | ⚠️ Yes | Degrade gracefully, manual publish |

**Circuit Breaker Pattern (External APIs):**

```typescript
class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      // Circuit open, check if should retry
      if (Date.now() - this.lastFailureTime > 60000) { // 1 min
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      // Success, reset
      this.failureCount = 0;
      this.state = 'CLOSED';
      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.failureCount >= 3) {
        this.state = 'OPEN'; // Trip circuit after 3 failures
      }

      throw error;
    }
  }
}

// Usage
const openAICircuitBreaker = new CircuitBreaker();

export async function generateWithAI(prompt: string) {
  try {
    return await openAICircuitBreaker.call(() =>
      openai.chat.completions.create({...})
    );
  } catch (error) {
    // Fallback to Claude
    return await claudeAPI.messages.create({...});
  }
}
```

---

### Disaster Recovery

**Recovery Objectives:**
- **RTO (Recovery Time Objective):** <4 hours
- **RPO (Recovery Point Objective):** <24 hours

**Disaster Scenarios & Recovery Plans:**

**Scenario 1: Database Corruption/Loss**

**Detection:**
- Supabase alerts via email/webhook
- Application errors (connection refused)

**Recovery:**
1. Verify incident (check Supabase dashboard)
2. Contact Supabase support
3. Restore from latest automatic backup (daily)
4. Data loss: max 24h (RPO)
5. Application back online in 2-4h (RTO)

**Prevention:**
- Daily automatic backups (Supabase)
- Manual export critical data weekly (pg_dump)
- Store backups in separate location (S3)

**Scenario 2: Vercel Deployment Failure**

**Detection:**
- Build fails in CI/CD
- Application returns 500 errors
- Vercel alerts

**Recovery:**
1. Rollback to previous deployment (Vercel dashboard, 1-click)
2. Application back online in < 5 minutes
3. Fix issue in development, redeploy

**Prevention:**
- Staging environment for testing
- Automated tests in CI/CD
- Gradual rollout (canary deployment)

**Scenario 3: Accidental Data Deletion (User Error)**

**Example:** User deletes 100 posts accidentally

**Recovery:**
1. User contacts support
2. Admin accesses database backup
3. Restore deleted rows from backup
4. Merge with current database state

**Prevention:**
- Soft deletes (add `deleted_at` column instead of DELETE)
- Confirmation dialogs for bulk deletes
- Undo functionality (7-day window)

**Scenario 4: Security Breach (Data Leak)**

**Detection:**
- Suspicious login attempts
- Sentry alerts for auth violations
- User reports unauthorized access

**Recovery:**
1. Immediate lockdown: disable affected accounts
2. Investigate: review logs, identify breach vector
3. Rotate secrets: API keys, database credentials
4. Force password resets for all users
5. Notify affected users (RGPD compliance)
6. Post-mortem: document incident, improve security

**Prevention:**
- MFA for accounts (Phase 2)
- Regular security audits
- Penetration testing (annual)

---

### Backup Strategy

**Automated Backups (Supabase):**
- **Frequency:** Daily (3 AM UTC)
- **Retention:** 7 days (free tier), 30 days (pro tier)
- **Scope:** Full database dump (all tables, indexes, sequences)
- **Format:** pg_dump SQL format
- **Storage:** Supabase managed storage (encrypted)

**Manual Backups (Critical Data):**
```bash
# Weekly manual backup (run as cron job)
pg_dump $DATABASE_URL \
  --table=posts \
  --table=templates \
  --table=users \
  --format=custom \
  --file=backup-$(date +%Y%m%d).dump

# Upload to S3
aws s3 cp backup-*.dump s3://integria-backups/social-media-planner/
```

**Backup Testing:**
- **Monthly:** Restore backup to staging environment, verify integrity
- **Annually:** Full disaster recovery simulation

**Media Files Backup:**
- Supabase Storage replicated across multiple AZs (automatic)
- No additional backup needed (built-in redundancy)

**Restore Procedures:**
```bash
# Restore from Supabase backup
# 1. Supabase dashboard → Database → Backups → Restore

# Restore from manual backup
pg_restore --clean --if-exists \
  --dbname=$DATABASE_URL \
  backup-20260110.dump
```

---

### Monitoring & Alerting

**Monitoring Stack:**
1. **Vercel Analytics** - Web Vitals, traffic, errors
2. **Sentry** - Error tracking, crash reporting
3. **Uptime Robot** (free tier) - Uptime monitoring
4. **Prisma Studio** - Database inspection

**Metrics Tracked:**

**Application Metrics:**
- Request rate (req/s)
- Response time (p50, p95, p99)
- Error rate (%)
- Success rate (%)
- AI generation time (ms)
- Auto-save latency (ms)

**Infrastructure Metrics:**
- Function invocations (count)
- Function execution time (ms)
- Function cold starts (count)
- Database connections (count)
- Database query time (ms)
- Storage usage (GB)

**Business Metrics:**
- Daily active users (DAU)
- Posts created per day
- AI generations per day
- Quota usage per user
- Publication success rate (%)

**Alerting Rules:**

| Condition | Threshold | Action | Priority |
|-----------|-----------|--------|----------|
| Error rate > X% | 5% | Email + Slack | High |
| Response time p95 > X | 5s | Email | Medium |
| AI generation > X | 45s | Email | Medium |
| Database connections > X | 90 | Email | High |
| Uptime < X% | 99% | SMS + Email | Critical |
| Quota exceeded | 100% | User notification | Low |
| Disk usage > X% | 80% | Email | Medium |
| Failed login attempts > X | 10/hour | Email | High |

**Alerting Channels:**
- **Email:** sami@integria.ch
- **Slack:** #alerts channel (Phase 2)
- **SMS:** Twilio for critical alerts (Phase 2)

**On-Call Rotation:**
- MVP: Sami only
- Phase 2+: Rotate among 3 employees

**Incident Response Playbook:**
```
1. Incident Detected (alert received)
   ↓
2. Acknowledge (30 min SLA)
   ↓
3. Assess Severity
   ├─ Critical: Immediate response, all hands
   ├─ High: Response within 1h
   └─ Medium/Low: Response next business day
   ↓
4. Mitigate
   ├─ Rollback deployment
   ├─ Disable feature
   └─ Scale resources
   ↓
5. Resolve (fix root cause)
   ↓
6. Post-Mortem (document incident, action items)
```

**Status Page (Phase 2):**
- Public status page (status.integria.ch)
- Display uptime, incidents, maintenance windows
- Subscribe to updates via email/RSS

---

## Systematic NFR Coverage

Pour chaque NFR du PRD, voici la couverture architecturale détaillée.

### NFR-001: Temps de Chargement des Pages

**Requirement:** Chargement initial <3s (First Contentful Paint), chargement complet <5s sur 4G, navigation entre pages <1s, Score Lighthouse Performance >80

**Architecture Solution:**
1. **Next.js Optimizations:**
   - Code splitting automatique (chaque page = bundle séparé)
   - React Server Components (réduisent JS client)
   - Image optimization (WebP, lazy loading, responsive)
   - Font optimization (self-hosted, display swap)

2. **Vercel Edge Network:**
   - Static assets servis depuis CDN edge (70+ locations)
   - Cache-Control headers (assets immutable, 1 an)
   - Brotli compression (réduction 70% taille)

3. **ISR (Incremental Static Regeneration):**
   - Pages statiques générées et cachées sur edge
   - Revalidation automatique après 1h
   - Instant loading pour utilisateurs (servi depuis edge)

4. **Performance Budget:**
   - Initial bundle: <200KB (gzipped)
   - Lazy load: Images below fold, rich editor
   - Defer non-critical JS

**Implementation Notes:**
- Configurer `next.config.js` avec optimizations activées
- Utiliser `next/image` pour toutes les images
- Analyser bundle avec `@next/bundle-analyzer` mensuellement
- Lazy load PostEditor component (300KB économisés)

**Validation:**
- Lighthouse CI dans GitHub Actions (score >80 required)
- Vercel Analytics: LCP <2.5s (good)
- Test sur connexion 4G throttled (Chrome DevTools)

---

### NFR-002: Temps de Génération IA

**Requirement:** Génération idées <30s, génération post <15s, indication visuelle progression, possibilité annuler

**Architecture Solution:**
1. **OpenAI GPT-4 Turbo:**
   - Modèle rapide (2x plus rapide que GPT-4)
   - Streaming responses (affichage progressif)
   - Timeout 45s (fallback Claude si timeout)

2. **Streaming UI:**
   ```typescript
   // Server-sent events for progress
   const stream = await openai.chat.completions.create({
     model: 'gpt-4-turbo',
     messages: [...],
     stream: true
   });

   for await (const chunk of stream) {
     // Send progress to client
     res.write(`data: ${JSON.stringify(chunk)}\n\n`);
   }
   ```

3. **Caching (Phase 2):**
   - Cache résultats génération identiques (Redis)
   - Hash du prompt = cache key
   - TTL 24h

4. **Abort Controller:**
   ```typescript
   const controller = new AbortController();
   const response = await fetch('/api/ai/generate', {
     signal: controller.signal
   });

   // Cancel button
   <button onClick={() => controller.abort()}>Cancel</button>
   ```

**Implementation Notes:**
- Configurer timeout OpenAI à 45s (max)
- Fallback Claude si OpenAI >30s ou error
- Afficher spinner + pourcentage estimé
- Log durée génération dans `ai_generations` table

**Validation:**
- Mesurer p95 durée génération (doit être <30s idées, <15s posts)
- Alert si p95 >threshold
- Test stress: 100 générations simultanées

---

### NFR-003: Sauvegarde Automatique

**Requirement:** Sauvegarde toutes les 30s, <2s latence, feedback visuel, pas de perte données si fermeture navigateur

**Architecture Solution:**
1. **Debounced Auto-Save:**
   ```typescript
   // Zustand store
   const usePostEditorStore = create((set) => ({
     content: '',
     isSaving: false,
     lastSaved: null,

     updateContent: debounce(async (content) => {
       set({ isSaving: true });

       await fetch('/api/content/posts/${id}', {
         method: 'PATCH',
         body: JSON.stringify({ content })
       });

       set({ isSaving: false, lastSaved: new Date() });
     }, 30000) // 30s debounce
   }));
   ```

2. **Optimistic UI:**
   - Update local state immediately (instant feedback)
   - Sync to server in background
   - Reconcile if server responds with conflict

3. **beforeunload Handler:**
   ```typescript
   useEffect(() => {
     const handler = (e: BeforeUnloadEvent) => {
       if (hasUnsavedChanges) {
         e.preventDefault();
         e.returnValue = 'You have unsaved changes';
       }
     };
     window.addEventListener('beforeunload', handler);
     return () => window.removeEventListener('beforeunload', handler);
   }, [hasUnsavedChanges]);
   ```

4. **Optimistic Locking:**
   ```typescript
   // Include updated_at version
   await prisma.post.update({
     where: {
       id: postId,
       updated_at: clientVersion // Must match
     },
     data: { content }
   });
   // If updated_at mismatch: 409 Conflict
   ```

**Implementation Notes:**
- Afficher "Saving..." puis "Saved at HH:MM:SS"
- Si conflit: afficher modal "Content updated elsewhere"
- Test: fermer onglet pendant édition, réouvrir, vérifier données

**Validation:**
- Mesurer latence auto-save (p95 <2s)
- Test: éditer post, fermer tab, réouvrir, vérifier contenu
- Test: 2 onglets ouverts, éditer dans les 2, vérifier conflit

---

### NFR-004: Authentification Sécurisée

**Requirement:** Passwords hashés (bcrypt/argon2, rounds >=10), HTTPS obligatoire, JWT secure, expiration session 7j inactivité, protection CSRF

**Architecture Solution:**
Déjà couvert dans Security Architecture > Authentication Design.

**Key Points:**
- Supabase Auth: bcrypt cost factor 10
- HTTPS: TLS 1.3 via Vercel (auto)
- JWT: HS256, expiration 1h (access), 7j (refresh)
- CSRF: SameSite=Strict cookies + CSRF tokens
- Session expiration: refresh_token expires après 7j

**Validation:**
- Audit: Vérifier password hash dans DB (bcrypt format)
- Test: Connexion HTTPS forcée (HTTP redirect)
- Test: JWT expiration (attendre 1h, requête fail)
- Pentest: Tentatives CSRF doivent échouer

---

### NFR-005: Protection des Données Utilisateur

**Requirement:** Isolation données par user (RLS), pas d'accès cross-user, backups quotidiens, RGPD (droit à l'oubli, export), chiffrement at rest

**Architecture Solution:**
1. **Row-Level Security:** (déjà couvert)
2. **Backups:** Daily automatic (Supabase)
3. **RGPD Compliance:**
   ```typescript
   // Export user data (GDPR Article 20)
   export async function GET(req: Request) {
     const userId = getSession(req).user.id;

     const userData = {
       profile: await prisma.user.findUnique({ where: { id: userId } }),
       posts: await prisma.post.findMany({ where: { user_id: userId } }),
       templates: await prisma.template.findMany({ where: { user_id: userId } }),
       media: await prisma.media.findMany({ where: { user_id: userId } })
     };

     return Response.json(userData);
   }

   // Delete user data (GDPR Article 17 - Right to be forgotten)
   export async function DELETE(req: Request) {
     const userId = getSession(req).user.id;

     await prisma.$transaction([
       prisma.post.deleteMany({ where: { user_id: userId } }),
       prisma.template.deleteMany({ where: { user_id: userId } }),
       prisma.media.deleteMany({ where: { user_id: userId } }),
       prisma.ai_generation.deleteMany({ where: { user_id: userId } }),
       prisma.user.delete({ where: { id: userId } })
     ]);

     return Response.json({ success: true });
   }
   ```

**Validation:**
- Test: User A ne peut pas accéder posts User B (même avec ID connu)
- Test: Export données contient toutes données user
- Test: Delete account supprime toutes données

---

### NFR-006: Sécurité des APIs Tierces

**Requirement:** Clés API en env variables, OAuth tokens chiffrés, rotation secrets possible, logs accès APIs, rate limiting

**Architecture Solution:**
Déjà couvert dans Security Architecture > Data Encryption.

**Key Points:**
- API keys: Vercel Environment Variables (never in code)
- OAuth tokens: Encrypted with pgsodium (AES-256)
- Rotation: Update env vars in Vercel dashboard (redeploy)
- Logs: Track in `ai_generations` table
- Rate limiting: 100 req/min/user, 10 req/min AI

**Validation:**
- Audit: Grep codebase for hardcoded keys (must be 0)
- Test: Rotate OpenAI key, verify app still works
- Test: Rate limit triggered after 100 req/min

---

### NFR-007: Capacité Utilisateur Initiale

**Requirement:** Support 1-5 users simultanés, 500 posts/user, 5GB médias/user, 10K+ DB records, tiers gratuits 6 mois

**Architecture Solution:**
1. **Serverless Scaling:**
   - Vercel functions auto-scale (1→100 instances)
   - 1-5 users = minimal load (1-2 instances suffisants)

2. **Database Capacity:**
   - Supabase free tier: 500MB database
   - Estimation: 5 users × 500 posts × 5KB/post = 12.5MB
   - 10K records = ~50MB
   - **Largement suffisant**

3. **Storage Capacity:**
   - Supabase free tier: 1GB storage
   - Requirement: 5GB/user (max 25GB pour 5 users)
   - **Insuffisant free tier**
   - **Solution:** Upgrade Supabase Pro ($25/mois) après MVP si >1GB

4. **Cost Projection:**
   - Vercel Hobby: $0/mois (suffisant)
   - Supabase Free: $0/mois (6 mois), puis Pro $25/mois
   - OpenAI: ~$10/mois (100 gen/mois × 5 users)
   - **Total:** $0-35/mois

**Validation:**
- Load test: Simulate 5 concurrent users
- Monitor storage usage (alert à 80%)
- Track costs monthly

---

### NFR-008: Limites de Génération IA

**Requirement:** 100 sessions idées/mois/user, 200 posts/mois/user, affichage quota, message si dépassé, upgrade futur

**Architecture Solution:**
```typescript
// Check quota before generation
export async function POST(req: Request) {
  const userId = getSession(req).user.id;

  const ideasCount = await prisma.ai_generation.count({
    where: {
      user_id: userId,
      type: 'ideas',
      created_at: { gte: startOfMonth(new Date()) }
    }
  });

  if (ideasCount >= 100) {
    return Response.json({
      error: {
        type: 'quota_exceeded',
        message: 'Monthly quota of 100 idea generations exceeded',
        quota: {
          limit: 100,
          used: ideasCount,
          resets_at: startOfMonth(addMonths(new Date(), 1))
        }
      }
    }, { status: 429 });
  }

  // Proceed with generation...
}

// Display quota in UI
export async function GET(req: Request) {
  const userId = getSession(req).user.id;

  const [ideasUsed, postsUsed] = await Promise.all([
    prisma.ai_generation.count({
      where: { user_id: userId, type: 'ideas', created_at: { gte: startOfMonth() } }
    }),
    prisma.ai_generation.count({
      where: { user_id: userId, type: { in: ['post_linkedin', 'post_instagram'] }, created_at: { gte: startOfMonth() } }
    })
  ]);

  return Response.json({
    ideas: { limit: 100, used: ideasUsed, remaining: 100 - ideasUsed },
    posts: { limit: 200, used: postsUsed, remaining: 200 - postsUsed },
    resets_at: startOfMonth(addMonths(new Date(), 1))
  });
}
```

**Implementation Notes:**
- Afficher quota dans dashboard (ex: "45/100 ideas used")
- Progress bar visuel
- Email notification à 80% et 100%

**Validation:**
- Test: Générer 100 idées, vérifier 101ème bloquée
- Test: Nouveau mois, vérifier quota reset

---

### NFR-009: Disponibilité du Service

**Requirement:** Uptime >99% (max 7h downtime/mois), hébergement fiable SLA, monitoring 5min, page statut si down, notifications >10min

**Architecture Solution:**
Déjà couvert dans Reliability & Availability.

**Key Points:**
- Vercel SLA: 99.99% (dépasse requirement)
- Supabase SLA: 99.9%
- Uptime Robot: Checks every 5min
- Status page: status.integria.ch (Phase 2)
- Notifications: Email + SMS si down >10min

**Validation:**
- Calcul uptime mensuel: (total_time - downtime) / total_time × 100
- Review incidents mensuellement

---

### NFR-010: Gestion des Erreurs

**Requirement:** Messages clairs en français, retry 3× avec backoff, fallback manuel si auto fail, logs serveur, dégradation gracieuse

**Architecture Solution:**
```typescript
// Retry logic with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (4xx)
      if (error.status >= 400 && error.status < 500) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Usage
export async function publishToLinkedIn(postId: string) {
  try {
    return await retryWithBackoff(() =>
      linkedinAPI.publish({...})
    );
  } catch (error) {
    // Log error
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: 'failed',
        error_message: 'Failed to publish after 3 attempts. Please try manual publish.'
      }
    });

    // Send notification
    await sendEmail({
      to: user.email,
      subject: 'Publication LinkedIn échouée',
      body: `Votre post n'a pas pu être publié automatiquement. Vous pouvez le publier manuellement en copiant le contenu.`
    });

    // Fallback: Show copy button in UI
    return { success: false, manual_action_required: true };
  }
}
```

**Error Messages (User-Friendly):**
```typescript
const errorMessages = {
  'QUOTA_EXCEEDED': 'Vous avez atteint votre quota mensuel de générations IA. Il se réinitialisera le 1er du mois prochain.',
  'GENERATION_TIMEOUT': 'La génération a pris trop de temps. Veuillez réessayer.',
  'INVALID_CONTENT': 'Le contenu ne respecte pas les règles de LinkedIn. Veuillez le modifier.',
  'NETWORK_ERROR': 'Problème de connexion. Vérifiez votre internet et réessayez.'
};
```

**Validation:**
- Test: Simuler erreur API externe, vérifier retry 3×
- Test: Simuler échec publication, vérifier fallback manuel disponible
- Review logs: Vérifier stack traces enregistrées

---

### NFR-011: Fiabilité de Publication

**Requirement:** >98% success rate, notification si échec, retry 1h pendant 24h, export manuel dernier recours, dashboard suivi

**Architecture Solution:**
```typescript
// Cron job: Every hour, retry failed publications
export async function GET(req: Request) {
  const failedPosts = await prisma.post.findMany({
    where: {
      status: 'failed',
      scheduled_at: { lte: new Date() },
      created_at: { gte: subDays(new Date(), 1) } // Only retry within 24h
    }
  });

  for (const post of failedPosts) {
    try {
      await publishToLinkedIn(post.id);

      await prisma.post.update({
        where: { id: post.id },
        data: { status: 'published', published_at: new Date() }
      });
    } catch (error) {
      // Will retry next hour
      console.error(`Retry failed for post ${post.id}:`, error);
    }
  }
}

// Publication success rate dashboard
export async function GET(req: Request) {
  const [total, successful, failed] = await Promise.all([
    prisma.post.count({ where: { status: { in: ['published', 'failed'] } } }),
    prisma.post.count({ where: { status: 'published' } }),
    prisma.post.count({ where: { status: 'failed' } })
  ]);

  const successRate = (successful / total) * 100;

  return Response.json({
    total,
    successful,
    failed,
    success_rate: successRate.toFixed(2)
  });
}
```

**Validation:**
- Calcul mensuel: success_rate >= 98%
- Alert si success_rate < 98%
- Test: Simuler échec, vérifier retry après 1h

---

### NFR-012: Interface Responsive

**Requirement:** Desktop optimal (1920×1080 à 1280×720), Tablet utilisable (768px+), Mobile lecture/édition (375px+), menu hamburger mobile, tests multi-browsers

**Architecture Solution:**
**Tailwind CSS Responsive Utilities:**
```tsx
<div className="
  grid grid-cols-1        {/* Mobile: 1 column */}
  md:grid-cols-2          {/* Tablet: 2 columns */}
  lg:grid-cols-3          {/* Desktop: 3 columns */}
  gap-4                   {/* Spacing */}
">
  <PostCard />
</div>

<nav className="
  hidden                  {/* Hidden on mobile */}
  md:flex                 {/* Visible on tablet+ */}
  items-center
  gap-4
">
  <NavLinks />
</nav>

<button className="
  md:hidden               {/* Only visible on mobile */}
  p-2
">
  <MenuIcon />            {/* Hamburger menu */}
</button>
```

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1023px
- Desktop: ≥ 1024px

**Testing:**
```bash
# Playwright responsive tests
test('Mobile layout', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/posts');
  await expect(page.locator('[data-testid="hamburger-menu"]')).toBeVisible();
});

test('Desktop layout', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/posts');
  await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
});
```

**Validation:**
- Test manuel: Chrome DevTools responsive mode
- Test multi-devices: iPhone, iPad, Desktop
- Test browsers: Chrome, Firefox, Safari

---

### NFR-013: Accessibilité

**Requirement:** Contraste WCAG AA (4.5:1), navigation clavier, labels formulaires, lecteurs d'écran (aria-labels), taille police 14px+

**Architecture Solution:**
```tsx
// Color contrast (Tailwind config)
// text-gray-900 on bg-white = 21:1 (exceeds 4.5:1)
<p className="text-gray-900 bg-white">High contrast text</p>

// Keyboard navigation
<button
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  tabIndex={0}
  aria-label="Generate ideas"
>
  Generate
</button>

// Form labels
<label htmlFor="content" className="sr-only">
  Post content
</label>
<textarea
  id="content"
  name="content"
  aria-describedby="content-help"
/>
<span id="content-help" className="text-sm">
  Enter your post content here
</span>

// ARIA landmarks
<nav aria-label="Main navigation">
  <ul role="list">
    <li role="listitem">...</li>
  </ul>
</nav>

<main aria-label="Main content">
  {children}
</main>

// Focus indicators
<button className="
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500
  focus:ring-offset-2
">
  Click me
</button>
```

**Validation:**
- Lighthouse accessibility score >90
- axe DevTools: 0 violations
- Screen reader test: NVDA/JAWS
- Keyboard-only navigation test

---

### NFR-014: Courbe d'Apprentissage

**Requirement:** Workflow compréhensible sans doc, tooltips actions complexes, onboarding <2min (skippable), français, terminologie claire

**Architecture Solution:**
```tsx
// Onboarding tour (react-joyride)
import Joyride from 'react-joyride';

const steps = [
  {
    target: '[data-tour="generate-ideas"]',
    content: 'Commencez ici pour générer des idées de contenu avec l\'IA.',
    disableBeacon: true
  },
  {
    target: '[data-tour="select-ideas"]',
    content: 'Sélectionnez 5-6 idées qui vous intéressent.'
  },
  {
    target: '[data-tour="generate-posts"]',
    content: 'L\'IA créera automatiquement des posts LinkedIn et Instagram.'
  }
];

<Joyride
  steps={steps}
  run={isFirstTime}
  continuous
  showSkipButton
  locale={{
    back: 'Précédent',
    next: 'Suivant',
    skip: 'Passer',
    close: 'Fermer'
  }}
/>

// Tooltips (Radix UI)
<Tooltip.Root>
  <Tooltip.Trigger>
    <HelpIcon />
  </Tooltip.Trigger>
  <Tooltip.Content>
    Cette action génère 3 versions différentes du post
  </Tooltip.Content>
</Tooltip.Root>

// Contextual help
<div className="bg-blue-50 border-l-4 border-blue-400 p-4">
  <p className="text-sm">
    💡 <strong>Conseil :</strong> Sélectionnez 5-6 idées pour optimiser votre temps.
  </p>
</div>
```

**Terminologie Claire:**
- ❌ "Endpoint", "API", "Token" → ✅ "Publier", "Planifier", "Brouillon"
- ❌ "Instance", "Deploy", "Build" → ✅ "Application", "Mettre à jour", "Créer"

**Validation:**
- User testing: 3 nouveaux users, mesurer temps première génération
- Task: "Créer votre premier post" doit être complété en <10min sans aide
- Feedback users: clarté interface (score >4/5)

---

### NFR-015: Qualité du Code

**Requirement:** TypeScript strict, composants réutilisables, structure claire, code IA validé, ESLint/Prettier

**Architecture Solution:**
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}

// ESLint config
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn'
  }
};

// Prettier config
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100
}

// Husky pre-commit hook
#!/bin/sh
npm run lint
npm run type-check
npm run test
```

**Project Structure:**
```
src/
├── app/                  # Next.js App Router
│   ├── (auth)/
│   ├── posts/
│   ├── calendar/
│   └── api/
├── components/           # React components
│   ├── ui/              # Reusable UI (Button, Input, etc.)
│   ├── posts/           # Post-specific
│   └── calendar/
├── lib/                  # Business logic
│   ├── ai/
│   ├── content/
│   └── utils/
├── hooks/                # Custom React hooks
├── types/                # TypeScript types
└── prisma/               # Prisma schema
```

**Validation:**
- CI/CD: Lint + type-check must pass
- Code review: Peer review (ou IA review)
- Complexity: Cyclomatic complexity <10 per function

---

### NFR-016: Documentation Technique

**Requirement:** README setup, .env.example, architecture 1-2 pages, comments logique complexe, guide déploiement

**Architecture Solution:**

**README.md:**
```markdown
# Social Media Planner

## Setup

1. Clone repo
git clone https://github.com/integria/social-media-planner

2. Install dependencies
npm install

3. Configure environment variables
cp .env.example .env.local
# Edit .env.local with your keys

4. Setup database
npx prisma migrate dev

5. Run development server
npm run dev

## Tech Stack
- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase
- Prisma ORM

## Deployment
See docs/deployment.md
```

**.env.example:**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
SUPABASE_SERVICE_ROLE_KEY=your_key_here

# OpenAI
OPENAI_API_KEY=sk-xxx

# Anthropic
ANTHROPIC_API_KEY=sk-ant-xxx
```

**Code Comments (Only for Complex Logic):**
```typescript
// GOOD - Complex business logic explained
/**
 * Generates 3 variants of a post with different tones.
 * Uses parallel API calls to optimize latency.
 * Implements circuit breaker to fallback to single generation if 2/3 fail.
 */
export async function generateVariants(post: Post): Promise<Variant[]> {
  // ...
}

// BAD - Obvious comment (unnecessary)
// Set user ID to session user ID
const userId = session.user.id;
```

**Validation:**
- New developer: Can setup project in <15min following README
- .env.example up-to-date (check monthly)
- Architecture docs generated (these 4 parts)

---

### NFR-017: Support Navigateurs

**Requirement:** Chrome/Edge/Firefox/Safari (2 dernières versions), message si navigateur non supporté, pas IE

**Architecture Solution:**
```typescript
// next.config.js
module.exports = {
  // Browserslist config
  target: 'browserslist',
};

// package.json
{
  "browserslist": [
    "last 2 Chrome versions",
    "last 2 Firefox versions",
    "last 2 Safari versions",
    "last 2 Edge versions"
  ]
}

// Browser detection (unsupported browser page)
export default function UnsupportedBrowser() {
  const isUnsupported = detectUnsupportedBrowser();

  if (isUnsupported) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1>Navigateur non supporté</h1>
          <p>
            Veuillez utiliser une version récente de Chrome, Firefox, Safari ou Edge.
          </p>
        </div>
      </div>
    );
  }

  return <App />;
}

function detectUnsupportedBrowser(): boolean {
  // Detect IE
  const isIE = /MSIE|Trident/.test(navigator.userAgent);
  return isIE;
}
```

**Testing:**
```bash
# Playwright cross-browser tests
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit  # Safari
```

**Validation:**
- Manual testing: Latest Chrome, Firefox, Safari, Edge
- Automated: Playwright cross-browser CI
- BrowserStack: Test on real devices (optional)

---

### NFR-018: APIs Externes

**Requirement:** APIs officielles, respect rate limits, versioning documenté, fallback si indisponible, timeout 30s

**Architecture Solution:**
Déjà couvert dans External Integrations (Part 2).

**Key Points:**
- OpenAI API v1 (officielle)
- LinkedIn API v2 (officielle)
- Instagram Graph API v18.0 (officielle)
- Rate limits: Tracked et respectés (Upstash rate limiter)
- Versioning: Documenté dans code + upgrade path planned
- Fallback: OpenAI → Claude, Social APIs → Manual publish
- Timeout: 30s pour génération IA, 10s pour social APIs

**Validation:**
- Test: Simuler API down, vérifier fallback
- Test: Timeout après 30s, vérifier error graceful
- Monitor: Rate limit headers (X-RateLimit-*)

---

## NFR Coverage Summary

| NFR | Name | Priority | Covered? | Solution Summary |
|-----|------|----------|----------|------------------|
| NFR-001 | Temps Chargement Pages | Must Have | ✅ | Next.js optimizations + Vercel Edge CDN |
| NFR-002 | Temps Génération IA | Must Have | ✅ | GPT-4 Turbo + Streaming + Caching |
| NFR-003 | Sauvegarde Automatique | Must Have | ✅ | Debounced auto-save + Optimistic UI |
| NFR-004 | Authentification Sécurisée | Must Have | ✅ | Supabase Auth + bcrypt + JWT |
| NFR-005 | Protection Données | Must Have | ✅ | RLS + Backups + RGPD compliance |
| NFR-006 | Sécurité APIs | Must Have | ✅ | Env vars + Token encryption + Rate limiting |
| NFR-007 | Capacité Initiale | Must Have | ✅ | Serverless scaling + 500MB DB |
| NFR-008 | Limites Génération IA | Should Have | ✅ | Quota tracking + Dashboard display |
| NFR-009 | Disponibilité | Must Have | ✅ | Vercel SLA 99.99% + Monitoring |
| NFR-010 | Gestion Erreurs | Must Have | ✅ | Retry logic + User-friendly messages |
| NFR-011 | Fiabilité Publication | Should Have | ✅ | >98% success rate + Retry 24h |
| NFR-012 | Interface Responsive | Must Have | ✅ | Tailwind responsive utilities |
| NFR-013 | Accessibilité | Should Have | ✅ | WCAG AA + Keyboard nav + ARIA |
| NFR-014 | Courbe Apprentissage | Must Have | ✅ | Onboarding + Tooltips + French UI |
| NFR-015 | Qualité Code | Should Have | ✅ | TypeScript strict + ESLint + Structure |
| NFR-016 | Documentation | Should Have | ✅ | README + .env.example + Architecture docs |
| NFR-017 | Support Navigateurs | Must Have | ✅ | Chrome/Firefox/Safari/Edge last 2 versions |
| NFR-018 | APIs Externes | Must Have | ✅ | Official APIs + Timeout + Fallback |

**Coverage:** 18/18 NFRs = **100%** ✅

---

**Document Status:** ✅ Part 3 Complete

**Last Updated:** 2026-01-10
