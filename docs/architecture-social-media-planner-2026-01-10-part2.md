# System Architecture: Social Media Planner
## PART 2 - Data & API Architecture

**Date:** 2026-01-10
**Architect:** Sami
**Version:** 1.0
**Project Type:** web-app
**Project Level:** 2
**Status:** Draft

---

## Document Overview

This document (Part 2 of 4) defines the data architecture and API design for Social Media Planner. It provides the complete database schema, data model, data flows, API endpoints specification, and external integrations.

**Related Documents:**
- Architecture Part 1: Overview & System Design
- Architecture Part 3: Non-Functional Requirements (NFR)
- Architecture Part 4: Deployment & Operations
- PRD: `docs/prd-social-media-planner-2026-01-06.md`

---

## Data Architecture

### Data Model Overview

L'application utilise **7 entités principales** dans une base de données PostgreSQL relationnelle normalisée (3NF).

**Entity Relationship Diagram:**

```
┌──────────────┐
│    users     │
│──────────────│
│ id (PK)      │──┐
│ email        │  │
│ created_at   │  │
│ updated_at   │  │
└──────────────┘  │
                  │
                  │ 1:N
                  │
    ┌─────────────┴───────────────┬────────────────────┬──────────────┐
    │                             │                    │              │
    │                             │                    │              │
┌───┴──────────┐         ┌────────┴───────┐   ┌───────┴──────┐  ┌──┴────────────┐
│    posts     │         │   templates    │   │    media     │  │ ai_generations│
│──────────────│         │────────────────│   │──────────────│  │───────────────│
│ id (PK)      │         │ id (PK)        │   │ id (PK)      │  │ id (PK)       │
│ user_id (FK) │──┐      │ user_id (FK)   │   │ user_id (FK) │  │ user_id (FK)  │
│ platform     │  │      │ name           │   │ type         │  │ prompt        │
│ content      │  │      │ category       │   │ url          │  │ response      │
│ status       │  │      │ content        │   │ size         │  │ tokens_used   │
│ scheduled_at │  │      │ variables      │   │ created_at   │  │ created_at    │
│ published_at │  │      │ created_at     │   └──────────────┘  └───────────────┘
│ created_at   │  │      └────────────────┘
│ updated_at   │  │
└──────────────┘  │
                  │ N:M
                  │
             ┌────┴──────────┐
             │  posts_media  │ (join table)
             │───────────────│
             │ post_id (FK)  │
             │ media_id (FK) │
             └───────────────┘
```

---

### Entity Definitions

#### Entity 1: users

**Purpose:** Comptes utilisateurs de l'application

**Attributes:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Identifiant unique utilisateur |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email utilisateur (login) |
| `created_at` | TIMESTAMP | DEFAULT NOW(), NOT NULL | Date création compte |
| `updated_at` | TIMESTAMP | DEFAULT NOW(), NOT NULL | Date dernière mise à jour |

**Notes:**
- Password hash **NON stocké ici** - géré par Supabase Auth dans sa propre table `auth.users`
- `users` table est synchronisée avec `auth.users` via trigger
- Row-Level Security (RLS) activé: users ne voient que leurs propres données

**Relationships:**
- 1:N avec `posts` (un user a plusieurs posts)
- 1:N avec `templates` (un user a plusieurs templates)
- 1:N avec `media` (un user a plusieurs médias)
- 1:N avec `ai_generations` (un user a plusieurs générations IA)

---

#### Entity 2: posts

**Purpose:** Posts LinkedIn/Instagram créés par les utilisateurs

**Attributes:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Identifiant unique post |
| `user_id` | UUID | FOREIGN KEY → users(id), NOT NULL | Propriétaire du post |
| `platform` | ENUM | CHECK IN ('linkedin', 'instagram', 'both'), NOT NULL | Plateforme cible |
| `content` | TEXT | NOT NULL | Contenu texte du post |
| `hashtags` | TEXT[] | DEFAULT '{}' | Hashtags (Instagram surtout) |
| `status` | ENUM | CHECK IN ('draft', 'scheduled', 'published', 'failed'), DEFAULT 'draft' | Statut publication |
| `idea_source` | TEXT | NULLABLE | Idée originale ayant généré ce post |
| `ai_generated` | BOOLEAN | DEFAULT FALSE | Post généré par IA ou manuel |
| `rating` | INTEGER | CHECK (rating >= 1 AND rating <= 5), NULLABLE | Note qualité (1-5 étoiles) |
| `scheduled_at` | TIMESTAMP | NULLABLE | Date/heure planifiée pour publication |
| `published_at` | TIMESTAMP | NULLABLE | Date/heure réelle de publication |
| `error_message` | TEXT | NULLABLE | Message d'erreur si publication échouée |
| `template_id` | UUID | FOREIGN KEY → templates(id), NULLABLE | Template utilisé (si applicable) |
| `metadata` | JSONB | DEFAULT '{}' | Métadonnées flexibles (analytics, etc.) |
| `created_at` | TIMESTAMP | DEFAULT NOW(), NOT NULL | Date création brouillon |
| `updated_at` | TIMESTAMP | DEFAULT NOW(), NOT NULL | Date dernière modification |

**Indexes:**
```sql
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_scheduled_at ON posts(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX idx_posts_platform ON posts(platform);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
```

**Relationships:**
- N:1 avec `users` (plusieurs posts par user)
- N:M avec `media` via `posts_media` (un post peut avoir plusieurs médias)
- N:1 avec `templates` (optionnel, si créé depuis template)

**Business Rules:**
- `status = 'scheduled'` → `scheduled_at` doit être renseigné et futur
- `status = 'published'` → `published_at` doit être renseigné
- `status = 'failed'` → `error_message` doit être renseigné
- `platform = 'instagram'` → au moins 1 média requis (Instagram exige image/vidéo)

---

#### Entity 3: templates

**Purpose:** Templates réutilisables de posts pour contenus récurrents

**Attributes:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Identifiant unique template |
| `user_id` | UUID | FOREIGN KEY → users(id), NOT NULL | Propriétaire du template |
| `name` | VARCHAR(100) | NOT NULL | Nom du template (ex: "Conseil du lundi") |
| `description` | TEXT | NULLABLE | Description du template |
| `category` | ENUM | CHECK IN ('conseil', 'actualite', 'temoignage', 'etude_cas', 'promo', 'autre') | Catégorie template |
| `platform` | ENUM | CHECK IN ('linkedin', 'instagram', 'both'), NOT NULL | Plateforme cible |
| `content` | TEXT | NOT NULL | Contenu template avec variables {{var}} |
| `hashtags` | TEXT[] | DEFAULT '{}' | Hashtags par défaut |
| `variables` | JSONB | DEFAULT '{}' | Variables définies (ex: {"topic": "", "date": ""}) |
| `usage_count` | INTEGER | DEFAULT 0 | Nombre d'utilisations du template |
| `created_at` | TIMESTAMP | DEFAULT NOW(), NOT NULL | Date création template |
| `updated_at` | TIMESTAMP | DEFAULT NOW(), NOT NULL | Date dernière modification |

**Indexes:**
```sql
CREATE INDEX idx_templates_user_id ON templates(user_id);
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_platform ON templates(platform);
```

**Relationships:**
- N:1 avec `users`
- 1:N avec `posts` (un template peut générer plusieurs posts)

**Template Variables Example:**
```
Content: "🎯 Conseil du {{day_name}} : {{topic}}\n\n{{content}}\n\n#{{hashtag1}} #{{hashtag2}}"
Variables: {"day_name": "lundi", "topic": "", "content": "", "hashtag1": "", "hashtag2": ""}
```

---

#### Entity 4: media

**Purpose:** Bibliothèque médias (images, vidéos) uploadés par utilisateurs

**Attributes:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Identifiant unique média |
| `user_id` | UUID | FOREIGN KEY → users(id), NOT NULL | Propriétaire du média |
| `type` | ENUM | CHECK IN ('image', 'video'), NOT NULL | Type de média |
| `filename` | VARCHAR(255) | NOT NULL | Nom original fichier |
| `storage_path` | TEXT | UNIQUE, NOT NULL | Chemin dans Supabase Storage |
| `url` | TEXT | NOT NULL | URL publique signée (CDN) |
| `mime_type` | VARCHAR(100) | NOT NULL | Type MIME (image/jpeg, video/mp4, etc.) |
| `size_bytes` | BIGINT | NOT NULL | Taille fichier en bytes |
| `width` | INTEGER | NULLABLE | Largeur en pixels (images/vidéos) |
| `height` | INTEGER | NULLABLE | Hauteur en pixels (images/vidéos) |
| `duration` | INTEGER | NULLABLE | Durée en secondes (vidéos uniquement) |
| `tags` | TEXT[] | DEFAULT '{}' | Tags pour recherche/organisation |
| `alt_text` | TEXT | NULLABLE | Texte alternatif (accessibilité) |
| `created_at` | TIMESTAMP | DEFAULT NOW(), NOT NULL | Date upload |
| `updated_at` | TIMESTAMP | DEFAULT NOW(), NOT NULL | Date dernière modification |

**Indexes:**
```sql
CREATE INDEX idx_media_user_id ON media(user_id);
CREATE INDEX idx_media_type ON media(type);
CREATE INDEX idx_media_tags ON media USING GIN(tags);
CREATE INDEX idx_media_created_at ON media(created_at DESC);
```

**Relationships:**
- N:1 avec `users`
- N:M avec `posts` via `posts_media`

**Storage Strategy:**
- Files stockés dans Supabase Storage bucket `media`
- Path format: `users/{user_id}/posts/{media_id}.{ext}`
- Signed URLs générées avec expiration 7 jours
- CDN edge caching activé

**Size Limits:**
- Images: max 10MB, formats: PNG, JPG, JPEG, WebP
- Vidéos: max 100MB, formats: MP4, MOV (Phase 2+)

---

#### Entity 5: posts_media (Join Table)

**Purpose:** Association many-to-many entre posts et media

**Attributes:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `post_id` | UUID | FOREIGN KEY → posts(id) ON DELETE CASCADE | Post associé |
| `media_id` | UUID | FOREIGN KEY → media(id) ON DELETE RESTRICT | Média associé |
| `order` | INTEGER | NOT NULL, DEFAULT 0 | Ordre d'affichage (pour carrousels futurs) |
| `created_at` | TIMESTAMP | DEFAULT NOW(), NOT NULL | Date association |

**Primary Key:** Composite `(post_id, media_id)`

**Indexes:**
```sql
CREATE INDEX idx_posts_media_post_id ON posts_media(post_id);
CREATE INDEX idx_posts_media_media_id ON posts_media(media_id);
```

**Business Rules:**
- DELETE post → CASCADE delete associations (média reste)
- DELETE média → RESTRICT si utilisé dans un post (prévention perte données)
- Un post peut avoir 0-10 médias (limite future carrousels)

---

#### Entity 6: ai_generations

**Purpose:** Historique des générations IA pour analytics et rate limiting

**Attributes:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Identifiant unique génération |
| `user_id` | UUID | FOREIGN KEY → users(id), NOT NULL | Utilisateur ayant fait la génération |
| `type` | ENUM | CHECK IN ('ideas', 'post_linkedin', 'post_instagram', 'variants'), NOT NULL | Type de génération |
| `model` | VARCHAR(50) | NOT NULL | Modèle IA utilisé (gpt-4-turbo, claude-3.5-sonnet) |
| `prompt` | TEXT | NOT NULL | Prompt envoyé à l'IA |
| `response` | TEXT | NOT NULL | Réponse IA (peut être JSON) |
| `tokens_used` | INTEGER | NOT NULL | Nombre tokens utilisés |
| `duration_ms` | INTEGER | NOT NULL | Durée génération en millisecondes |
| `success` | BOOLEAN | DEFAULT TRUE | Génération réussie ou erreur |
| `error_message` | TEXT | NULLABLE | Message d'erreur si échec |
| `created_at` | TIMESTAMP | DEFAULT NOW(), NOT NULL | Date/heure génération |

**Indexes:**
```sql
CREATE INDEX idx_ai_gen_user_id ON ai_generations(user_id);
CREATE INDEX idx_ai_gen_type ON ai_generations(type);
CREATE INDEX idx_ai_gen_created_at ON ai_generations(created_at DESC);
CREATE INDEX idx_ai_gen_user_month ON ai_generations(user_id, DATE_TRUNC('month', created_at));
```

**Relationships:**
- N:1 avec `users`

**Rate Limiting Usage:**
```sql
-- Vérifier quota mensuel utilisateur (100 générations idées/mois)
SELECT COUNT(*)
FROM ai_generations
WHERE user_id = $1
  AND type = 'ideas'
  AND created_at >= DATE_TRUNC('month', NOW());
```

**Cost Tracking:**
```sql
-- Calculer coûts mensuels (approximatif)
SELECT
  user_id,
  SUM(tokens_used * 0.00001) AS estimated_cost_usd
FROM ai_generations
WHERE created_at >= DATE_TRUNC('month', NOW())
GROUP BY user_id;
```

---

#### Entity 7: social_connections (Phase 3)

**Purpose:** OAuth tokens pour LinkedIn/Instagram (publication automatique)

**Attributes:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Identifiant unique connexion |
| `user_id` | UUID | FOREIGN KEY → users(id), NOT NULL | Utilisateur propriétaire |
| `platform` | ENUM | CHECK IN ('linkedin', 'instagram'), NOT NULL | Plateforme connectée |
| `access_token` | TEXT | NOT NULL, ENCRYPTED | Token d'accès OAuth (chiffré) |
| `refresh_token` | TEXT | NULLABLE, ENCRYPTED | Token refresh OAuth (chiffré) |
| `expires_at` | TIMESTAMP | NOT NULL | Date expiration access_token |
| `profile_id` | VARCHAR(255) | NOT NULL | ID profil sur la plateforme |
| `profile_name` | VARCHAR(255) | NULLABLE | Nom profil (pour affichage) |
| `scopes` | TEXT[] | DEFAULT '{}' | Scopes OAuth autorisés |
| `is_active` | BOOLEAN | DEFAULT TRUE | Connexion active ou révoquée |
| `last_used_at` | TIMESTAMP | NULLABLE | Dernière utilisation pour publication |
| `created_at` | TIMESTAMP | DEFAULT NOW(), NOT NULL | Date connexion initiale |
| `updated_at` | TIMESTAMP | DEFAULT NOW(), NOT NULL | Date dernière mise à jour |

**Indexes:**
```sql
CREATE INDEX idx_social_conn_user_id ON social_connections(user_id);
CREATE INDEX idx_social_conn_platform ON social_connections(platform);
CREATE UNIQUE INDEX idx_social_conn_user_platform ON social_connections(user_id, platform) WHERE is_active = TRUE;
```

**Security:**
- **Encryption:** Tokens chiffrés at-rest avec Supabase Vault (AES-256)
- **Unique constraint:** Un seul compte actif par plateforme par user
- **Token refresh:** Refresh automatique 1h avant expiration

---

### Database Schema (PostgreSQL DDL)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable encryption (Supabase Vault)
CREATE EXTENSION IF NOT EXISTS "pgsodium";

-- Users table (synced with Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Trigger to sync with auth.users
CREATE OR REPLACE FUNCTION sync_user_from_auth()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION sync_user_from_auth();

-- Posts table
CREATE TYPE post_platform AS ENUM ('linkedin', 'instagram', 'both');
CREATE TYPE post_status AS ENUM ('draft', 'scheduled', 'published', 'failed');

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform post_platform NOT NULL,
  content TEXT NOT NULL,
  hashtags TEXT[] DEFAULT '{}',
  status post_status DEFAULT 'draft' NOT NULL,
  idea_source TEXT,
  ai_generated BOOLEAN DEFAULT FALSE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  scheduled_at TIMESTAMP,
  published_at TIMESTAMP,
  error_message TEXT,
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,

  CONSTRAINT scheduled_posts_have_date CHECK (
    status != 'scheduled' OR scheduled_at IS NOT NULL
  ),
  CONSTRAINT published_posts_have_date CHECK (
    status != 'published' OR published_at IS NOT NULL
  )
);

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_scheduled_at ON posts(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX idx_posts_platform ON posts(platform);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- Templates table
CREATE TYPE template_category AS ENUM ('conseil', 'actualite', 'temoignage', 'etude_cas', 'promo', 'autre');

CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category template_category NOT NULL,
  platform post_platform NOT NULL,
  content TEXT NOT NULL,
  hashtags TEXT[] DEFAULT '{}',
  variables JSONB DEFAULT '{}',
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_templates_user_id ON templates(user_id);
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_platform ON templates(platform);

-- Media table
CREATE TYPE media_type AS ENUM ('image', 'video');

CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type media_type NOT NULL,
  filename VARCHAR(255) NOT NULL,
  storage_path TEXT UNIQUE NOT NULL,
  url TEXT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes BIGINT NOT NULL,
  width INTEGER,
  height INTEGER,
  duration INTEGER, -- seconds (for videos)
  tags TEXT[] DEFAULT '{}',
  alt_text TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_media_user_id ON media(user_id);
CREATE INDEX idx_media_type ON media(type);
CREATE INDEX idx_media_tags ON media USING GIN(tags);
CREATE INDEX idx_media_created_at ON media(created_at DESC);

-- Posts-Media join table (many-to-many)
CREATE TABLE posts_media (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES media(id) ON DELETE RESTRICT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  PRIMARY KEY (post_id, media_id)
);

CREATE INDEX idx_posts_media_post_id ON posts_media(post_id);
CREATE INDEX idx_posts_media_media_id ON posts_media(media_id);

-- AI Generations table
CREATE TYPE generation_type AS ENUM ('ideas', 'post_linkedin', 'post_instagram', 'variants');

CREATE TABLE ai_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type generation_type NOT NULL,
  model VARCHAR(50) NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  tokens_used INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_ai_gen_user_id ON ai_generations(user_id);
CREATE INDEX idx_ai_gen_type ON ai_generations(type);
CREATE INDEX idx_ai_gen_created_at ON ai_generations(created_at DESC);
CREATE INDEX idx_ai_gen_user_month ON ai_generations(user_id, DATE_TRUNC('month', created_at));

-- Social Connections table (Phase 3)
CREATE TYPE social_platform AS ENUM ('linkedin', 'instagram');

CREATE TABLE social_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform social_platform NOT NULL,
  access_token TEXT NOT NULL, -- Will be encrypted with pgsodium
  refresh_token TEXT, -- Will be encrypted
  expires_at TIMESTAMP NOT NULL,
  profile_id VARCHAR(255) NOT NULL,
  profile_name VARCHAR(255),
  scopes TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_social_conn_user_id ON social_connections(user_id);
CREATE INDEX idx_social_conn_platform ON social_connections(platform);
CREATE UNIQUE INDEX idx_social_conn_user_platform
  ON social_connections(user_id, platform)
  WHERE is_active = TRUE;

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Posts policies
CREATE POLICY "Users can view own posts"
  ON posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);

-- Similar policies for templates, media, ai_generations, social_connections
-- (pattern répété pour chaque table avec user_id)

-- Automatic updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_updated_at
  BEFORE UPDATE ON media
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_connections_updated_at
  BEFORE UPDATE ON social_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

### Data Flow Architecture

#### Read Path (Query Flow)

```
1. User Request
   └─> Next.js Frontend

2. Authentication Check
   ├─> Supabase Auth validates JWT
   └─> Extract user_id from token

3. Database Query
   ├─> Prisma ORM constructs query
   ├─> RLS automatically filters by user_id
   └─> PostgreSQL executes query with indexes

4. Response
   ├─> Data returned to API route
   ├─> Transform/serialize data
   └─> Return JSON to frontend

5. Caching (Phase 2+)
   ├─> Check Redis cache first
   ├─> If hit: return cached data
   └─> If miss: query DB + cache result
```

**Performance Optimizations:**
- **Indexes:** All foreign keys + frequently queried columns indexed
- **Pagination:** Cursor-based pagination (keyset) pour listes longues
- **Select fields:** Prisma select only needed fields (pas de SELECT *)
- **Connection pooling:** Supabase manages connection pool (max 100 connections)

**Example Query (Liste posts avec pagination):**
```typescript
// API Route: GET /api/content/posts?cursor=uuid&limit=20
const posts = await prisma.post.findMany({
  where: { user_id: session.user.id },
  take: 20,
  skip: cursor ? 1 : 0,
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { created_at: 'desc' },
  include: {
    media: true, // Join with media
    template: { select: { name: true } } // Partial join
  }
});
```

#### Write Path (Mutation Flow)

```
1. User Action (Create/Update/Delete)
   └─> Next.js Frontend

2. Optimistic Update (UX)
   ├─> Update local state immediately
   └─> Show loading indicator

3. API Call
   ├─> POST/PATCH/DELETE to API route
   └─> Include CSRF token

4. Authentication & Authorization
   ├─> Validate JWT token
   └─> Verify user_id ownership

5. Validation
   ├─> Validate input schema (Zod)
   └─> Business rules validation

6. Database Write
   ├─> Prisma transaction if multiple writes
   ├─> RLS enforces user_id
   └─> PostgreSQL commits transaction

7. Post-Write Actions
   ├─> Invalidate cache (if caching enabled)
   ├─> Trigger webhooks (Phase 3)
   └─> Update analytics

8. Response
   ├─> Return updated data
   └─> Frontend reconciles optimistic update
```

**Auto-save Flow (special case):**
```
1. User types in editor
   └─> Debounced (30s delay)

2. Auto-save triggered
   ├─> PATCH /api/content/posts/[id]
   └─> payload: { content, updated_at }

3. Database Update
   ├─> UPDATE posts SET content = $1 WHERE id = $2 AND user_id = $3
   └─> Check updated_at for conflicts (optimistic locking)

4. Conflict Resolution
   ├─> If updated_at mismatch: return 409 Conflict
   └─> Frontend shows "Content updated elsewhere" warning
```

---

## API Architecture

### API Design Principles

**Style:** **REST-like** avec conventions modernes

**Versioning:** URL path versioning `/api/v1/*`
- MVP: pas de versioning (`/api/*` = implicit v1)
- v2+: `/api/v2/*` si breaking changes

**Authentication:** **JWT Bearer tokens** (Supabase Auth)
```http
Authorization: Bearer <jwt_token>
```

**Response Format:** **JSON** standard
```json
{
  "data": { ... },      // Payload
  "meta": { ... },      // Metadata (pagination, etc.)
  "error": null         // null if success
}
```

**Error Format:** **RFC 7807 Problem Details**
```json
{
  "error": {
    "type": "validation_error",
    "title": "Validation Failed",
    "status": 400,
    "detail": "Content field is required",
    "instance": "/api/content/posts",
    "errors": [
      { "field": "content", "message": "Required" }
    ]
  }
}
```

**HTTP Status Codes:**
- `200 OK` - Succès GET/PATCH
- `201 Created` - Succès POST (création)
- `204 No Content` - Succès DELETE
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Auth required
- `403 Forbidden` - Auth OK mais accès refusé
- `404 Not Found` - Ressource inexistante
- `409 Conflict` - Conflit (ex: optimistic locking)
- `422 Unprocessable Entity` - Business rule violation
- `429 Too Many Requests` - Rate limit dépassé
- `500 Internal Server Error` - Erreur serveur
- `503 Service Unavailable` - Service temporairement down

**Rate Limiting:**
- **Per user:** 100 requests/minute/user
- **Per endpoint AI:** 10 requests/minute/user (génération IA)
- **Global:** 1000 requests/minute (protection DDoS)
- **Headers:**
  ```http
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 87
  X-RateLimit-Reset: 1641234567
  ```

---

### API Endpoints Specification

#### Authentication Endpoints

**Base Path:** `/api/auth`

##### POST /api/auth/register
**Description:** Inscription nouvel utilisateur

**Request:**
```json
{
  "email": "sami@integria.ch",
  "password": "SecurePass123!"
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "sami@integria.ch",
      "created_at": "2026-01-10T10:00:00Z"
    },
    "session": {
      "access_token": "jwt...",
      "refresh_token": "jwt...",
      "expires_at": "2026-01-17T10:00:00Z"
    }
  }
}
```

**Errors:**
- `400` - Email invalide ou password trop faible
- `409` - Email déjà utilisé

---

##### POST /api/auth/login
**Description:** Connexion utilisateur

**Request:**
```json
{
  "email": "sami@integria.ch",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK` (même format que register)

**Errors:**
- `401` - Identifiants incorrects
- `400` - Email ou password manquant

---

##### POST /api/auth/logout
**Description:** Déconnexion (invalide JWT token)

**Request:** Aucun body

**Response:** `204 No Content`

---

##### POST /api/auth/reset-password
**Description:** Réinitialisation mot de passe (envoi email)

**Request:**
```json
{
  "email": "sami@integria.ch"
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "message": "Password reset email sent"
  }
}
```

---

#### Content Endpoints

**Base Path:** `/api/content`

##### GET /api/content/posts
**Description:** Liste des posts de l'utilisateur avec filtres et pagination

**Query Parameters:**
- `status` (optional): `draft|scheduled|published|failed`
- `platform` (optional): `linkedin|instagram|both`
- `cursor` (optional): UUID du dernier post (pagination keyset)
- `limit` (optional): Nombre résultats (default: 20, max: 100)
- `search` (optional): Recherche texte dans content

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "platform": "linkedin",
      "content": "Post content...",
      "status": "draft",
      "ai_generated": true,
      "rating": 4,
      "scheduled_at": null,
      "created_at": "2026-01-10T10:00:00Z",
      "updated_at": "2026-01-10T11:00:00Z",
      "media": [
        {
          "id": "uuid",
          "url": "https://...",
          "type": "image"
        }
      ]
    }
  ],
  "meta": {
    "total": 150,
    "has_more": true,
    "next_cursor": "uuid"
  }
}
```

---

##### GET /api/content/posts/:id
**Description:** Détail d'un post spécifique

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "platform": "linkedin",
    "content": "Post content...",
    "hashtags": ["IntegrIA", "Tech", "SuisseRomande"],
    "status": "draft",
    "idea_source": "Original idea text...",
    "ai_generated": true,
    "rating": null,
    "scheduled_at": null,
    "published_at": null,
    "template_id": null,
    "metadata": {},
    "created_at": "2026-01-10T10:00:00Z",
    "updated_at": "2026-01-10T11:00:00Z",
    "media": [],
    "template": null
  }
}
```

**Errors:**
- `404` - Post non trouvé
- `403` - Post appartient à un autre user

---

##### POST /api/content/posts
**Description:** Créer nouveau post (draft)

**Request:**
```json
{
  "platform": "linkedin",
  "content": "Mon nouveau post...",
  "hashtags": ["IntegrIA", "Tech"],
  "idea_source": "Idée originale...",
  "ai_generated": true,
  "media_ids": ["uuid1", "uuid2"]
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "status": "draft",
    // ... full post object
  }
}
```

**Errors:**
- `400` - Validation error (content manquant, platform invalide)
- `422` - Instagram sans media (business rule)

---

##### PATCH /api/content/posts/:id
**Description:** Mettre à jour post existant

**Request:** (partial update)
```json
{
  "content": "Contenu modifié...",
  "rating": 5
}
```

**Response:** `200 OK` (full post object)

**Optimistic Locking:**
```json
// Request with version check
{
  "content": "...",
  "updated_at": "2026-01-10T11:00:00Z" // Version actuelle
}
```
→ Si `updated_at` ne match pas DB: `409 Conflict`

---

##### DELETE /api/content/posts/:id
**Description:** Supprimer post

**Response:** `204 No Content`

**Errors:**
- `404` - Post non trouvé
- `403` - Pas propriétaire
- `422` - Impossible de supprimer post publié (business rule)

---

##### POST /api/content/posts/:id/rate
**Description:** Noter qualité d'un post généré par IA

**Request:**
```json
{
  "rating": 4 // 1-5
}
```

**Response:** `200 OK`

---

#### AI Generation Endpoints

**Base Path:** `/api/ai`

##### POST /api/ai/generate-ideas
**Description:** Générer 10-15 idées de contenu contextualisées

**Rate Limit:** 100 générations/mois/user (NFR-008)

**Request:**
```json
{
  "context": "accompagnement tech entrepreneurs",
  "themes": ["productivité", "IA", "digital"],
  "count": 15
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "ideas": [
      {
        "id": "temp-1",
        "title": "5 outils IA pour gagner 10h/semaine",
        "description": "Présenter les meilleurs outils IA pour automatiser les tâches répétitives...",
        "target_platform": "linkedin",
        "estimated_engagement": "high"
      },
      // ... 14 autres idées
    ],
    "generation_id": "uuid", // ID dans ai_generations table
    "tokens_used": 1500,
    "duration_ms": 8500
  },
  "meta": {
    "quota_used": 45,
    "quota_remaining": 55,
    "quota_resets_at": "2026-02-01T00:00:00Z"
  }
}
```

**Errors:**
- `429` - Quota mensuel dépassé
- `503` - API OpenAI indisponible (retry after 30s)

---

##### POST /api/ai/generate-post
**Description:** Générer post LinkedIn ou Instagram depuis une idée

**Request:**
```json
{
  "idea": {
    "title": "5 outils IA...",
    "description": "..."
  },
  "platform": "linkedin", // or "instagram"
  "tone": "professional", // optional: "professional"|"casual"|"inspirational"
  "length": "medium" // optional: "short"|"medium"|"long"
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "content": "🎯 5 outils IA qui vont transformer votre productivité...\n\n...",
    "hashtags": ["ProductivitéIA", "IntegrIA", "TechSuisse"],
    "character_count": 245,
    "generation_id": "uuid",
    "tokens_used": 800,
    "duration_ms": 12000
  }
}
```

---

##### POST /api/ai/generate-variants
**Description:** Générer 3 versions différentes d'un même post

**Request:**
```json
{
  "post_id": "uuid", // existing post
  "variations": ["shorter", "more_casual", "with_cta"]
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "variants": [
      {
        "id": "variant-1",
        "content": "Version 1...",
        "variation_type": "shorter"
      },
      {
        "id": "variant-2",
        "content": "Version 2...",
        "variation_type": "more_casual"
      },
      {
        "id": "variant-3",
        "content": "Version 3...",
        "variation_type": "with_cta"
      }
    ],
    "generation_id": "uuid"
  }
}
```

---

#### Calendar Endpoints

**Base Path:** `/api/calendar`

##### GET /api/calendar/posts
**Description:** Posts pour un mois donné (vue calendrier)

**Query Parameters:**
- `month`: YYYY-MM (required)

**Response:** `200 OK`
```json
{
  "data": {
    "2026-01-15": [
      {
        "id": "uuid",
        "platform": "linkedin",
        "content_preview": "Premier post...",
        "status": "scheduled",
        "scheduled_at": "2026-01-15T10:00:00Z",
        "media_count": 1
      }
    ],
    "2026-01-16": [ /* ... */ ]
  },
  "meta": {
    "month": "2026-01",
    "total_posts": 32,
    "by_status": {
      "draft": 10,
      "scheduled": 20,
      "published": 2
    }
  }
}
```

---

##### PATCH /api/calendar/posts/:id/schedule
**Description:** Planifier un post (assigner date/heure)

**Request:**
```json
{
  "scheduled_at": "2026-01-20T14:00:00Z"
}
```

**Response:** `200 OK` (post object with updated status and scheduled_at)

**Business Rules:**
- Status passe de `draft` → `scheduled`
- `scheduled_at` doit être future
- Warning si créneau déjà occupé (pas bloquant)

---

#### Media Endpoints

**Base Path:** `/api/media`

##### POST /api/media/upload
**Description:** Upload image ou vidéo

**Request:** `multipart/form-data`
```
POST /api/media/upload
Content-Type: multipart/form-data

file: [binary]
tags: ["branding", "product"] (optional)
alt_text: "Description image" (optional)
```

**Response:** `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "type": "image",
    "filename": "photo.jpg",
    "url": "https://cdn.supabase.co/...",
    "size_bytes": 245600,
    "width": 1920,
    "height": 1080,
    "tags": ["branding"],
    "created_at": "2026-01-10T10:00:00Z"
  }
}
```

**Errors:**
- `400` - Fichier manquant ou format invalide
- `413` - Fichier trop grand (>10MB)
- `507` - Quota stockage dépassé (5GB/user)

---

##### GET /api/media
**Description:** Liste médias avec pagination

**Query Parameters:**
- `type` (optional): `image|video`
- `tags` (optional): Filtre par tags (comma-separated)
- `cursor`, `limit`

**Response:** `200 OK` (similar to posts list)

---

##### DELETE /api/media/:id
**Description:** Supprimer média

**Response:** `204 No Content`

**Errors:**
- `422` - Média utilisé dans un post (RESTRICT constraint)

---

#### Template Endpoints

**Base Path:** `/api/templates`

##### GET /api/templates
**Description:** Liste templates utilisateur

**Query Parameters:**
- `category` (optional)
- `platform` (optional)

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Conseil du lundi",
      "category": "conseil",
      "platform": "linkedin",
      "content": "🎯 Conseil du {{day_name}}: {{topic}}...",
      "variables": {"day_name": "lundi", "topic": ""},
      "usage_count": 15,
      "created_at": "2026-01-05T10:00:00Z"
    }
  ]
}
```

---

##### POST /api/templates
**Description:** Créer template depuis un post existant

**Request:**
```json
{
  "post_id": "uuid", // Post source
  "name": "Mon template",
  "category": "conseil",
  "variables": {"topic": "", "hashtag": ""}
}
```

**Response:** `201 Created`

---

##### POST /api/templates/:id/use
**Description:** Créer nouveau post depuis template

**Request:**
```json
{
  "variables": {
    "topic": "productivité",
    "hashtag": "ProductivitéIA"
  }
}
```

**Response:** `201 Created` (nouveau post object)

**Process:**
1. Fetch template
2. Remplacer variables dans content
3. Créer nouveau post (status: draft)
4. Incrémenter template.usage_count

---

#### Social Publishing Endpoints (Phase 3)

**Base Path:** `/api/social`

##### POST /api/social/linkedin/auth
**Description:** Initier OAuth LinkedIn

**Response:** `200 OK`
```json
{
  "data": {
    "authorization_url": "https://www.linkedin.com/oauth/v2/authorization?..."
  }
}
```

User redirected → consent → callback

---

##### POST /api/social/linkedin/callback
**Description:** OAuth callback handler

**Query Parameters:**
- `code`: Authorization code
- `state`: CSRF protection

**Response:** `200 OK`
```json
{
  "data": {
    "connected": true,
    "profile": {
      "id": "linkedin-id",
      "name": "Sami"
    }
  }
}
```

Stores encrypted tokens in `social_connections` table

---

##### POST /api/social/linkedin/publish
**Description:** Publier immédiatement sur LinkedIn

**Request:**
```json
{
  "post_id": "uuid"
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "published": true,
    "linkedin_post_id": "urn:li:share:123456",
    "published_at": "2026-01-10T10:00:00Z"
  }
}
```

**Errors:**
- `503` - LinkedIn API down (retry)
- `401` - Token expiré (refresh needed)
- `422` - Content violates LinkedIn policies

---

##### POST /api/social/cron/publish-scheduled
**Description:** Cron job endpoint (appelé toutes les 5 min par Vercel Cron)

**Authentication:** Cron secret token

**Process:**
1. Fetch posts WHERE status='scheduled' AND scheduled_at <= NOW()
2. For each post:
   - Call LinkedIn/Instagram API
   - If success: status → 'published', published_at = NOW()
   - If failure: retry 3x with exponential backoff
   - If still fail: status → 'failed', error_message, send email notification

---

## External Integrations

### Integration 1: OpenAI API

**Purpose:** Génération contenu IA (idées, posts LinkedIn, Instagram)

**API Version:** v1 (Chat Completions)

**Endpoint:** `https://api.openai.com/v1/chat/completions`

**Authentication:**
```http
Authorization: Bearer sk-...
```

**Request Example:**
```json
{
  "model": "gpt-4-turbo",
  "messages": [
    {
      "role": "system",
      "content": "Tu es un expert en content marketing pour LinkedIn..."
    },
    {
      "role": "user",
      "content": "Génère 15 idées de posts sur l'IA pour entrepreneurs..."
    }
  ],
  "temperature": 0.7,
  "max_tokens": 2000,
  "response_format": { "type": "json_object" }
}
```

**Rate Limits:**
- Tier 1: 500 RPM, 30K TPM
- Tier 2: 5K RPM, 300K TPM

**Error Handling:**
- `429 Too Many Requests` → Retry with exponential backoff (1s, 2s, 4s)
- `500 Server Error` → Fallback to Claude API
- `503 Service Unavailable` → Retry after 30s

**Cost Management:**
- Track tokens per user in `ai_generations` table
- Alert if monthly cost > $10/user
- Hard limit: 100 generations ideas/mois/user

---

### Integration 2: LinkedIn API v2

**Purpose:** Publication automatique posts LinkedIn (Phase 3)

**Endpoint:** `https://api.linkedin.com/v2/ugcPosts`

**Authentication:** OAuth 2.0 (Authorization Code Flow)

**Scopes Required:**
- `r_liteprofile` - Lire profil user
- `w_member_social` - Publier au nom du user

**OAuth Flow:**
1. User → `/api/social/linkedin/auth`
2. Redirect → LinkedIn authorization page
3. User consents
4. Callback → `/api/social/linkedin/callback?code=...`
5. Exchange code for tokens
6. Store encrypted tokens in DB

**Publish Request Example:**
```http
POST https://api.linkedin.com/v2/ugcPosts
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "author": "urn:li:person:{person_id}",
  "lifecycleState": "PUBLISHED",
  "specificContent": {
    "com.linkedin.ugc.ShareContent": {
      "shareCommentary": {
        "text": "Post content here..."
      },
      "shareMediaCategory": "NONE"
    }
  },
  "visibility": {
    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
  }
}
```

**Rate Limits:**
- 100 posts/day/user
- 500 API calls/day/app

**Error Handling:**
- `401 Unauthorized` → Refresh access token
- `429 Rate Limit` → Queue et retry après 1h
- `400 Bad Request` → Log error, notify user (content policy violation)

---

### Integration 3: Instagram Graph API

**Purpose:** Publication automatique posts Instagram (Phase 3)

**Endpoint:** `https://graph.facebook.com/v18.0/{ig-user-id}/media`

**Requirements:**
- Instagram Business Account
- Facebook Page liée au compte Instagram
- Facebook App avec Instagram permissions

**Authentication:** OAuth 2.0 (similar to Facebook)

**Scopes Required:**
- `instagram_basic`
- `instagram_content_publish`
- `pages_read_engagement`

**Publish Flow (2-step):**
1. **Create Container:**
```http
POST https://graph.facebook.com/v18.0/{ig-user-id}/media
?image_url={image_url}
&caption={caption}
&access_token={token}
```

Response: `{"id": "container_id"}`

2. **Publish Container:**
```http
POST https://graph.facebook.com/v18.0/{ig-user-id}/media_publish
?creation_id={container_id}
&access_token={token}
```

Response: `{"id": "media_id"}`

**Rate Limits:**
- 25 posts/day/user
- 200 API calls/hour/user

**Constraints:**
- **Image required** (Instagram = visual platform)
- Caption max 2200 characters
- Max 30 hashtags

---

### Integration 4: Supabase Services

**Purpose:** Auth, Database, Storage backend

**Services Used:**
1. **Supabase Auth** - JWT authentication
2. **Supabase Database** - PostgreSQL with RLS
3. **Supabase Storage** - Object storage for media

**Authentication Flow:**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
});

// Get session
const { data: { session } } = await supabase.auth.getSession();
const jwt = session?.access_token; // Use for API calls
```

**Storage Usage:**
```typescript
// Upload file
const { data, error } = await supabase.storage
  .from('media')
  .upload(`users/${userId}/posts/${mediaId}.jpg`, file);

// Get signed URL (7 days expiration)
const { data: signedUrl } = await supabase.storage
  .from('media')
  .createSignedUrl(`users/${userId}/posts/${mediaId}.jpg`, 604800);
```

---

## Data Migration Strategy

**Initial Setup (Development):**
```bash
# Run migrations
npx prisma migrate dev --name init

# Seed database (optional)
npx prisma db seed
```

**Production Deployment:**
```bash
# Run migrations on Supabase
npx prisma migrate deploy
```

**Rollback Strategy:**
- Migrations sont versionnées (Prisma migration history)
- Rollback manuel si nécessaire: `prisma migrate resolve --rolled-back {migration}`
- Backup automatique quotidien Supabase (7 jours retention)

---

## Data Backup & Recovery

**Backup Strategy:**
- **Automatic:** Supabase daily backups (7 days retention on free tier)
- **Manual:** Export via `pg_dump` si besoin backup longue durée
- **Critical data:** Posts + Templates + Media metadata

**Recovery Time Objective (RTO):** <4 hours

**Recovery Point Objective (RPO):** <24 hours (daily backups)

**Disaster Recovery:**
1. Restore latest Supabase backup
2. Verify data integrity
3. Re-deploy application (Vercel rollback si nécessaire)
4. Notify users si perte de données

---

**Document Status:** ✅ Part 2 Complete

**Last Updated:** 2026-01-10
