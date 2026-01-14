# System Architecture: Social Media Planner
## PART 1 - Architecture Overview & System Design

**Date:** 2026-01-10
**Architect:** Sami
**Version:** 1.0
**Project Type:** web-app
**Project Level:** 2
**Status:** Draft

---

## Document Overview

This document (Part 1 of 4) defines the high-level system architecture for Social Media Planner. It provides the architectural overview, system design, component structure, and technology stack justification.

**Related Documents:**
- Product Requirements Document: `docs/prd-social-media-planner-2026-01-06.md`
- Product Brief: `docs/product-brief-social-media-planner-2026-01-06.md`
- Architecture Part 2: Data & API Architecture
- Architecture Part 3: Non-Functional Requirements (NFR)
- Architecture Part 4: Deployment & Operations

---

## Executive Summary

Social Media Planner est une application web intelligente permettant de générer, éditer, planifier et publier du contenu pour LinkedIn et Instagram avec l'assistance de l'IA. Cette architecture définit une solution **Modular Monolith** basée sur Next.js, optimisée pour un développeur débutant avec budget minimal, tout en supportant 1-5 utilisateurs simultanés et en garantissant sécurité, performance et scalabilité.

**Architectural Highlights:**
- **Pattern:** Modular Monolith avec Next.js 14 (App Router)
- **Stack:** React + TypeScript + Tailwind CSS + Supabase + Vercel
- **Deployment:** Serverless (Vercel) avec tiers gratuits pour MVP
- **Scalability:** Horizontal scaling automatique via Vercel Edge Functions
- **Security:** Supabase Auth + Row Level Security + HTTPS obligatoire
- **Performance:** <3s chargement initial, <15s génération IA, caching Redis

**Key Design Principles:**
1. **Simplicity First** - Architecture simple adaptée à un développeur solo débutant
2. **Modern & Proven** - Stack moderne avec forte communauté et documentation
3. **Cost-Efficient** - Tiers gratuits suffisants pour 6 mois d'usage (budget minimal)
4. **Scalable from Day 1** - Peut scale de 1 à 100+ utilisateurs sans refactoring majeur
5. **Security by Design** - Sécurité intégrée dès la conception (Auth, HTTPS, RLS)

---

## Architectural Drivers

Ces exigences non-fonctionnelles influencent fortement les décisions architecturales :

### Driver 1: Performance & Expérience Utilisateur
**NFR-001, NFR-002, NFR-003**
- **Exigence:** Chargement pages <3s, génération IA <30s, sauvegarde <2s
- **Impact Architectural:**
  - Frontend optimisé avec code splitting et lazy loading
  - Génération IA asynchrone avec indicateurs de progression
  - Sauvegarde automatique optimiste (UI update immédiat, sync background)
- **Solution:** Next.js optimisations natives + React Server Components + caching

### Driver 2: Sécurité & Protection des Données
**NFR-004, NFR-005, NFR-006**
- **Exigence:** Auth sécurisée, isolation données, protection tokens API
- **Impact Architectural:**
  - Authentication layer avec Supabase Auth (JWT + bcrypt)
  - Row-Level Security dans PostgreSQL pour isolation données
  - Variables d'environnement pour secrets (jamais en code source)
  - HTTPS obligatoire (TLS 1.3)
- **Solution:** Supabase Auth + RLS + Vercel Environment Variables

### Driver 3: Capacité Initiale & Budget Minimal
**NFR-007, NFR-008**
- **Exigence:** Support 1-5 utilisateurs, 500 posts/user, tiers gratuits suffisants
- **Impact Architectural:**
  - Sélection de services avec tiers gratuits généreux
  - Architecture serverless pour coûts à l'usage (pas de serveur idle)
  - Rate limiting IA pour maîtrise des coûts
- **Solution:** Vercel (Hobby tier) + Supabase (Free tier) + OpenAI/Claude (pay-per-use)

### Driver 4: Fiabilité & Disponibilité
**NFR-009, NFR-010, NFR-011**
- **Exigence:** Uptime >99%, gestion erreurs gracieuse, retry automatique
- **Impact Architectural:**
  - Hébergement multi-région via Vercel Edge Network
  - Error boundaries React pour isolation des erreurs
  - Retry logic avec exponential backoff pour APIs externes
- **Solution:** Vercel infrastructure + defensive programming + monitoring

### Driver 5: Facilité de Développement & Maintenance
**NFR-014, NFR-015, NFR-016**
- **Exigence:** Courbe d'apprentissage minimale, code maintenable, documentation
- **Impact Architectural:**
  - Stack TypeScript pour typage et auto-complétion
  - Structure de code feature-based claire et logique
  - Convention over configuration (Next.js defaults)
- **Solution:** Next.js + TypeScript + ESLint + clear folder structure

---

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │   React Frontend (Next.js App Router)                     │  │
│  │   - UI Components (Tailwind CSS)                          │  │
│  │   - State Management (React Context + Zustand)            │  │
│  │   - Client-side Routing                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │   Next.js API Routes + Server Actions                     │  │
│  │   ┌────────────────┐  ┌────────────────┐                 │  │
│  │   │ Auth Module    │  │ Content Module │                 │  │
│  │   │ - Login        │  │ - AI Generation│                 │  │
│  │   │ - Register     │  │ - Post CRUD    │                 │  │
│  │   │ - Session Mgmt │  │ - Templates    │                 │  │
│  │   └────────────────┘  └────────────────┘                 │  │
│  │   ┌────────────────┐  ┌────────────────┐                 │  │
│  │   │ Calendar Module│  │ Media Module   │                 │  │
│  │   │ - Planning     │  │ - Upload       │                 │  │
│  │   │ - Scheduling   │  │ - Storage      │                 │  │
│  │   └────────────────┘  └────────────────┘                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      INTEGRATION LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ AI Service   │  │ Social APIs  │  │ Cron Jobs    │         │
│  │ - OpenAI     │  │ - LinkedIn   │  │ - Scheduled  │         │
│  │ - Anthropic  │  │ - Instagram  │  │   Publishing │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │   Supabase Backend                                        │  │
│  │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │   │ PostgreSQL   │  │ Auth Service │  │ Storage      │  │  │
│  │   │ - Users      │  │ - JWT Tokens │  │ - Images     │  │  │
│  │   │ - Posts      │  │ - Sessions   │  │ - Videos     │  │  │
│  │   │ - Templates  │  │ - RLS        │  │              │  │  │
│  │   │ - Media      │  │              │  │              │  │  │
│  │   └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Architecture Diagram - Component Interactions

```
┌─────────────┐
│   Browser   │
│  (Chrome,   │
│  Firefox,   │
│   Safari)   │
└──────┬──────┘
       │ HTTPS
       ↓
┌──────────────────────────────────────────────────────┐
│            Vercel Edge Network (CDN)                 │
│  - Static Assets Caching                             │
│  - HTTPS Termination                                 │
│  - DDoS Protection                                   │
└──────┬───────────────────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────────────────┐
│         Next.js Application (Vercel Serverless)      │
│                                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │  Frontend (React Server Components + CSR)   │    │
│  │  - Dashboard                                 │    │
│  │  - Content Generator                         │    │
│  │  - Post Editor                               │    │
│  │  - Calendar View                             │    │
│  │  - Media Library                             │    │
│  └─────────────────────────────────────────────┘    │
│                       ↕                               │
│  ┌─────────────────────────────────────────────┐    │
│  │  Backend (API Routes + Server Actions)      │    │
│  │  - /api/auth/*                               │    │
│  │  - /api/content/*                            │    │
│  │  - /api/ai/*                                 │    │
│  │  - /api/calendar/*                           │    │
│  │  - /api/media/*                              │    │
│  └─────────────────────────────────────────────┘    │
└──────┬───────────────────────┬───────────────────────┘
       │                       │
       │                       └────────────────┐
       ↓                                        ↓
┌──────────────────┐              ┌────────────────────────┐
│  Supabase        │              │  External APIs         │
│  - PostgreSQL DB │              │  ┌──────────────────┐  │
│  - Auth Service  │              │  │ OpenAI/Anthropic │  │
│  - Storage       │              │  │ (AI Generation)  │  │
│  - Row-Level     │              │  └──────────────────┘  │
│    Security      │              │  ┌──────────────────┐  │
└──────────────────┘              │  │ LinkedIn API     │  │
                                   │  │ (v2)             │  │
                                   │  └──────────────────┘  │
                                   │  ┌──────────────────┐  │
                                   │  │ Instagram Graph  │  │
                                   │  │ API              │  │
                                   │  └──────────────────┘  │
                                   └────────────────────────┘
```

### Architectural Pattern

**Pattern:** **Modular Monolith** avec Next.js 14 (App Router)

**Rationale:**

Un **Modular Monolith** est le pattern optimal pour ce projet Level 2 car :

1. **Simplicité de Développement**
   - Un seul codebase à gérer (pas de coordination microservices)
   - Développement et debugging plus rapides
   - Idéal pour un développeur solo débutant
   - Déploiement simplifié (un seul build/deploy)

2. **Performance**
   - Pas de latence réseau inter-services
   - Transactions cohérentes sans distributed transactions
   - Optimisations Next.js natives (Server Components, streaming)

3. **Structure Modulaire**
   - Code organisé en modules/features clairs (Auth, Content, Calendar, Media)
   - Boundaries logiques bien définies
   - Facilite la maintenance et l'évolution
   - Peut être "splitté" en microservices plus tard si nécessaire (migration path)

4. **Scalabilité Suffisante**
   - Vercel scale automatiquement les fonctions serverless
   - Support 1-5 utilisateurs MVP, peut aller jusqu'à 100+ utilisateurs sans problème
   - Coût proportionnel à l'usage (serverless)

5. **Cost-Effective**
   - Un seul hébergement Vercel (vs multiples services microservices)
   - Tier gratuit Vercel largement suffisant pour MVP
   - Pas de complexité orchestration (Kubernetes, service mesh, etc.)

**Trade-offs Acceptés:**
- ✗ **Perte:** Moins de flexibilité pour scaling indépendant des modules
  - **Acceptable car:** Tous les modules ont des besoins de scale similaires pour notre cas d'usage
- ✗ **Perte:** Un bug dans un module peut affecter tout le système
  - **Acceptable car:** Error boundaries React isolent les erreurs + monitoring
- ✗ **Perte:** Déploiement monolithique (tout redéploye à chaque changement)
  - **Acceptable car:** Build Next.js rapide (<2 min), déploiements Vercel instant

**Alternatives Considérées et Rejetées:**

| Pattern | Raison du Rejet |
|---------|-----------------|
| **Microservices** | Trop complexe pour Level 2, overhead infrastructure, distributed transactions difficiles, overkill pour 1-5 users |
| **Layered Monolith (MVC)** | Moins moderne, structure moins claire que feature-based modules, moins adapté à React/Next.js |
| **Serverless Functions Only** | Gestion d'état difficile, cold starts, code duplication entre functions, moins cohérent |

---

## Technology Stack

### Frontend Stack

**Choice:** **React 18 + Next.js 14 (App Router) + TypeScript + Tailwind CSS**

**Rationale:**

**React 18**
- **Avantage:** Framework frontend le plus populaire, écosystème massif, documentation excellente
- **Justification NFR:** NFR-014 (courbe d'apprentissage minimale) - énorme communauté, tutoriels partout
- **Justification NFR:** NFR-001 (performance) - React Server Components pour chargement optimisé
- **Alternative considérée:** Vue.js - rejeté car moins de ressources pour débutants dans notre contexte

**Next.js 14 (App Router)**
- **Avantage:** Framework full-stack React, SSR/SSG/ISR natif, API routes intégrées, optimisations automatiques
- **Justification NFR:** NFR-001 (performance <3s) - optimisations natives (code splitting, image optimization, font optimization)
- **Justification NFR:** NFR-015 (qualité code) - conventions claires, structure opinionated
- **Justification NFR:** NFR-007 (tier gratuit) - déploiement Vercel optimisé pour Next.js
- **Features clés utilisées:**
  - **App Router:** Routing moderne basé sur filesystem
  - **React Server Components:** Rendu serveur pour performance
  - **API Routes:** Backend intégré (pas besoin d'un serveur séparé)
  - **Server Actions:** Mutations serveur simplifiées
  - **Image Optimization:** Optimisation automatique des images
- **Alternative considérée:** Create React App - rejeté car pas de SSR, pas d'API routes, moins performant

**TypeScript 5.x**
- **Avantage:** Typage statique, auto-complétion IDE, détection erreurs compile-time
- **Justification NFR:** NFR-015 (qualité code) - typage strict = moins de bugs runtime
- **Justification NFR:** NFR-014 (courbe apprentissage) - intellisense aide le développeur débutant
- **Justification NFR:** NFR-010 (gestion erreurs) - catch errors avant runtime
- **Configuration:** `strict: true` activé pour typage maximum
- **Alternative considérée:** JavaScript - rejeté car trop error-prone pour projet de cette taille

**Tailwind CSS 3.x**
- **Avantage:** Utility-first CSS, pas de CSS custom à écrire, responsive natif, bundle optimisé
- **Justification NFR:** NFR-012 (responsive) - responsive utilities natives (sm:, md:, lg:)
- **Justification NFR:** NFR-001 (performance) - purge CSS automatique, bundle minimal
- **Justification NFR:** NFR-015 (qualité code) - styling cohérent, pas de CSS spaghetti
- **Plugins utilisés:** @tailwindcss/forms, @tailwindcss/typography
- **Alternative considérée:** CSS Modules ou Styled Components - rejetés car plus verbeux, moins performants

**State Management:** **React Context + Zustand (lightweight)**
- **React Context:** Pour données globales simples (user auth, theme)
- **Zustand:** Pour état client complexe (post editor, calendar state)
- **Rationale:** Simplicité > Redux (trop verbeux pour notre scale)
- **Justification NFR:** NFR-015 (maintenabilité) - moins de boilerplate que Redux

**UI Component Library:** **Headless UI + Radix UI** (accessible components)
- **Avantage:** Composants accessibles headless, styling avec Tailwind
- **Justification NFR:** NFR-013 (accessibilité) - composants WCAG compliant natifs
- **Composants clés:** Dialog, Dropdown, Tabs, DatePicker

---

### Backend Stack

**Choice:** **Next.js 14 API Routes + Server Actions**

**Rationale:**

**Next.js API Routes**
- **Avantage:** Backend intégré dans Next.js, pas de serveur Node.js séparé à gérer
- **Justification NFR:** NFR-015 (simplicité) - un seul projet, un seul déploiement
- **Justification NFR:** NFR-007 (tier gratuit) - serverless Vercel = coûts à l'usage
- **Structure:**
  ```
  /app/api/
    /auth/           # Authentication endpoints
    /content/        # Content generation & CRUD
    /ai/             # AI generation endpoints
    /calendar/       # Calendar & scheduling
    /media/          # Media upload & management
    /social/         # LinkedIn/Instagram integrations
  ```
- **Alternative considérée:** Express.js séparé - rejeté car overhead infrastructure, double déploiement

**Server Actions (Next.js 14)**
- **Avantage:** Mutations serveur simplifiées, pas besoin d'API route pour chaque action
- **Justification NFR:** NFR-015 (code quality) - moins de boilerplate, co-location logique
- **Use cases:** Sauvegarder brouillon, mettre à jour post, uploader image
- **Exemple:**
  ```typescript
  'use server'
  export async function saveDraft(formData: FormData) {
    // Server-side logic avec accès direct DB
  }
  ```

**Authentication:** **Supabase Auth** (intégré)
- **Avantage:** Auth géré, JWT tokens, sessions, pas à implémenter from scratch
- **Justification NFR:** NFR-004 (auth sécurisée) - bcrypt par défaut, PBKDF2, tokens sécurisés
- **Features:** Email/password, session management, password reset
- **Alternative considérée:** NextAuth.js - rejeté car Supabase Auth plus intégré avec Supabase DB

**Business Logic:** **TypeScript modules** (feature-based)
- **Structure:**
  ```
  /lib/
    /ai/             # AI generation logic
    /content/        # Content business logic
    /calendar/       # Calendar & scheduling logic
    /media/          # Media processing
    /social/         # Social API integrations
    /utils/          # Shared utilities
  ```

---

### Database Stack

**Choice:** **Supabase (PostgreSQL 15) + Supabase Storage**

**Rationale:**

**Supabase PostgreSQL**
- **Avantage:** PostgreSQL géré, tier gratuit généreux (500MB DB, 50K users), auth intégré, storage intégré
- **Justification NFR:** NFR-007 (tier gratuit) - 500MB DB suffisant pour 5 users × 500 posts = 2500 posts
- **Justification NFR:** NFR-005 (protection données) - Row-Level Security (RLS) natif PostgreSQL
- **Justification NFR:** NFR-009 (disponibilité) - backups automatiques, multi-AZ
- **Features utilisées:**
  - **Row-Level Security (RLS):** Isolation données par user_id automatique
  - **Realtime subscriptions:** Synchronisation temps réel (si besoin futur)
  - **Automatic backups:** Sauvegardes quotidiennes automatiques
  - **Connection pooling:** Gestion optimale des connexions

**Supabase Storage**
- **Avantage:** Object storage intégré, 1GB gratuit, CDN natif
- **Justification NFR:** NFR-007 (stockage 5GB/user) - 1GB gratuit suffisant pour MVP
- **Use case:** Upload images/vidéos pour posts Instagram
- **Features:** Signed URLs (accès sécurisé), policies (qui peut upload/download)

**ORM/Query Builder:** **Prisma ORM**
- **Avantage:** Type-safe database client, migrations automatiques, excellent DX
- **Justification NFR:** NFR-015 (code quality) - queries type-safe, auto-complétion
- **Justification NFR:** NFR-010 (error handling) - validation automatique types
- **Alternative considérée:** Supabase JS client direct - utilisé en complément pour Auth/Storage

**Schema Design Philosophy:**
- **Normalisé (3NF)** pour cohérence données et éviter redondance
- **Indexes** sur foreign keys et champs de recherche fréquents
- **UUID** pour primary keys (sécurité, scalabilité)
- **Timestamps** automatiques (created_at, updated_at)

**Caching Layer:** **Redis (Upstash)** - optionnel, Phase 2+
- **Use case:** Cache résultats AI generation, sessions, rate limiting
- **Justification NFR:** NFR-002 (performance IA <30s) - cache idées générées
- **Tier gratuit:** Upstash Redis 10K requests/day gratuit

---

### Infrastructure Stack

**Choice:** **Vercel (Serverless) + Supabase (Backend-as-a-Service)**

**Rationale:**

**Vercel (Hosting & Deployment)**
- **Avantage:** Optimisé pour Next.js, déploiement en un clic, serverless auto-scaling, CDN global
- **Justification NFR:** NFR-009 (uptime >99%) - infrastructure multi-région, SLA 99.99%
- **Justification NFR:** NFR-001 (performance) - Edge Network, caching automatique
- **Justification NFR:** NFR-007 (tier gratuit) - Hobby tier gratuit: 100GB bandwidth, unlimited sites
- **Features clés:**
  - **Automatic HTTPS:** TLS 1.3 par défaut
  - **Edge Functions:** Serverless functions proche des users (low latency)
  - **Preview Deployments:** URL preview pour chaque PR/commit
  - **Analytics:** Web Vitals tracking natif
  - **Environment Variables:** Gestion sécurisée des secrets

**Deployment Model:** **Serverless Functions**
- **API Routes → Vercel Serverless Functions** (auto-scaling)
- **Pages → Static Generation + ISR** (Incremental Static Regeneration)
- **Avantage:** Pay-per-use, scale à zéro quand pas d'usage, scale automatique sous charge
- **Cold start:** <500ms (acceptable pour notre use case)

**CDN:** **Vercel Edge Network**
- **Global:** 70+ edge locations worldwide
- **Caching:** Static assets cachés automatiquement
- **Justification NFR:** NFR-001 (temps chargement <3s) - assets servis depuis edge proche user

**Alternative considérée et rejetée:**
- **AWS (EC2 + RDS):** Trop complexe à gérer, coût fixe (serveur tourne 24/7), overkill
- **Heroku:** Plus cher que Vercel, moins optimisé pour Next.js
- **DigitalOcean:** Nécessite gestion serveur, pas serverless, complexité infrastructure

---

### Third-Party Services

**AI Generation:** **OpenAI GPT-4 Turbo** (primary) + **Anthropic Claude 3.5 Sonnet** (fallback)

**Rationale:**
- **OpenAI GPT-4 Turbo:**
  - **Avantage:** Meilleure qualité de contenu, excellent pour français, contexte 128K tokens
  - **Justification NFR:** NFR-002 (génération <30s) - GPT-4 Turbo plus rapide que GPT-4
  - **Pricing:** $0.01/1K input tokens, $0.03/1K output tokens
  - **Estimation coût MVP:** ~50 générations/mois × ~500 tokens = $1-2/mois
  - **Features utilisées:** Chat Completions API, structured outputs, function calling

- **Anthropic Claude 3.5 Sonnet (fallback):**
  - **Avantage:** Alternative si OpenAI down/rate limited, excellent français aussi
  - **Use case:** Failover automatique si OpenAI error 429/500
  - **Pricing:** Similar à GPT-4

**API Strategy:**
- **Prompts optimisés:** Templates de prompts spécifiques LinkedIn vs Instagram
- **Context injection:** Contexte IntegrIA, Suisse romande, secteur tech injecté
- **Streaming:** Réponse streamée pour feedback progressif user
- **Rate limiting:** Max 100 générations/mois/user (NFR-008)

**Social Media APIs:**

**LinkedIn API v2**
- **Use case:** Publication automatique posts LinkedIn (FR-017, Phase 3)
- **Endpoint:** `POST /v2/ugcPosts` pour publier
- **Auth:** OAuth 2.0 (r_liteprofile, w_member_social scopes)
- **Limits:** 100 posts/day/user (largement suffisant)
- **Status:** Phase 3 (Could Have), fallback copie manuelle en Phase 1

**Instagram Graph API (Meta)**
- **Use case:** Publication automatique posts Instagram (FR-018, Phase 3)
- **Requirement:** Instagram Business Account lié à Facebook Page
- **Endpoint:** `POST /{ig-user-id}/media` puis publish
- **Auth:** OAuth 2.0 (instagram_basic, instagram_content_publish)
- **Limits:** 25 posts/day/user
- **Status:** Phase 3 (Could Have), fallback copie manuelle en Phase 1

**Email Service:** **Resend** (or SendGrid fallback)
- **Use case:** Password reset, notifications publication échec
- **Justification:** API simple, tier gratuit 3K emails/mois, excellent DX
- **Alternative:** SendGrid (100 emails/day gratuit)

**Monitoring & Logging:** **Vercel Analytics + Sentry**
- **Vercel Analytics:** Web Vitals, traffic, gratuit avec Vercel
- **Sentry:** Error tracking, crash reporting, 5K events/mois gratuit
- **Justification NFR:** NFR-010 (gestion erreurs) - logs centralisés, alerting

---

### Development & Deployment Tools

**Version Control:** **Git + GitHub**
- **Repository:** `github.com/IntegrIA/social-media-planner`
- **Branching:** Git Flow simplifié (main, develop, feature/*)
- **Commits:** Conventional Commits (feat, fix, docs, etc.)

**CI/CD:** **GitHub Actions + Vercel**
- **Pipeline:**
  ```
  Push to branch → GitHub Actions
    ↓
  1. Install dependencies (npm ci)
  2. Run linter (ESLint)
  3. Run type check (tsc --noEmit)
  4. Run tests (Jest + React Testing Library)
  5. Build (next build)
    ↓
  If success → Auto-deploy to Vercel
    - feature/* → Preview deployment
    - develop → Staging deployment
    - main → Production deployment
  ```
- **Duration:** <5 minutes total
- **Justification NFR:** NFR-015 (qualité code) - checks automatiques avant deploy

**Testing Framework:**
- **Unit Tests:** Jest + React Testing Library
- **E2E Tests:** Playwright (Phase 2+)
- **Coverage Target:** 80%+ (NFR-015)

**Code Quality Tools:**
- **ESLint:** Linting JavaScript/TypeScript
- **Prettier:** Code formatting automatique
- **Husky:** Pre-commit hooks (lint, type-check)
- **TypeScript:** Type checking strict

**IDE:** **VS Code** (recommandé)
- **Extensions:** ESLint, Prettier, TypeScript, Tailwind CSS IntelliSense
- **Justification:** Excellent support TypeScript + React, gratuit, extensible

**Package Manager:** **npm** (défaut Next.js)
- **Alternative:** pnpm ou yarn - non critique, npm suffisant

---

## System Components

L'application est structurée en **6 composants principaux** organisés en modules feature-based :

### Component 1: Authentication Module

**Purpose:** Gestion complète de l'authentification et autorisation utilisateurs

**Responsibilities:**
- Inscription utilisateur (email + password)
- Connexion / déconnexion
- Gestion sessions (JWT tokens)
- Réinitialisation mot de passe
- Protection routes (middleware)
- Validation email (optionnel Phase 2)

**Interfaces:**
- **Frontend:** `/login`, `/register`, `/reset-password` pages
- **API:**
  - `POST /api/auth/register` - Inscription
  - `POST /api/auth/login` - Connexion
  - `POST /api/auth/logout` - Déconnexion
  - `POST /api/auth/reset-password` - Reset password
- **Internal:** `useAuth()` React hook, `getSession()` server utility

**Dependencies:**
- **External:** Supabase Auth API
- **Internal:** Database (users table)
- **Libraries:** @supabase/auth-helpers-nextjs

**Technology:**
- Supabase Auth (backend)
- React Context (frontend state)
- JWT tokens (session)
- bcrypt (password hashing)

**Functional Requirements Addressed:**
- **FR-001:** Authentification Email/Mot de passe

**Non-Functional Requirements Addressed:**
- **NFR-004:** Authentification Sécurisée (bcrypt, JWT, HTTPS)
- **NFR-005:** Protection des Données (isolation par user_id)

**File Structure:**
```
/app/
  /(auth)/
    /login/
    /register/
    /reset-password/
  /api/auth/
/lib/
  /auth/
    auth.ts          # Auth utilities
    middleware.ts    # Route protection
/components/
  /auth/
    LoginForm.tsx
    RegisterForm.tsx
```

---

### Component 2: Content Generation Module (AI)

**Purpose:** Génération intelligente d'idées de contenu et de posts avec IA

**Responsibilities:**
- Génération de 10-15 idées de contenu contextualisées
- Génération de posts LinkedIn (150-300 mots, ton professionnel)
- Génération de captions Instagram (80-150 mots, hashtags, ton léger)
- Génération multiple (3 versions d'un même post)
- Gestion des prompts et contexte (IntegrIA, Suisse romande, tech)
- Rate limiting (100 générations/mois/user)
- Caching résultats pour éviter régénérations identiques

**Interfaces:**
- **Frontend:** `/generate` page (wizard multi-étapes)
- **API:**
  - `POST /api/ai/generate-ideas` - Génère 10-15 idées
  - `POST /api/ai/generate-post` - Génère post LinkedIn/Instagram
  - `POST /api/ai/generate-variants` - Génère 3 versions
- **Internal:** `generateContent()`, `generateIdeas()` functions

**Dependencies:**
- **External:** OpenAI API (GPT-4 Turbo), Anthropic Claude (fallback)
- **Internal:** User session (rate limiting), Database (historique générations)
- **Libraries:** openai, @anthropic-ai/sdk

**Technology:**
- OpenAI Chat Completions API
- Streaming responses (SSE)
- Prompt engineering (system prompts optimisés)
- Redis caching (Phase 2+)

**Functional Requirements Addressed:**
- **FR-002:** Génération d'Idées de Contenu par IA
- **FR-004:** Génération de Post LinkedIn
- **FR-005:** Génération de Caption Instagram
- **FR-006:** Génération Multiple (3 versions)

**Non-Functional Requirements Addressed:**
- **NFR-002:** Temps de Génération IA (<30s idées, <15s post)
- **NFR-006:** Sécurité des APIs Tierces (API keys en env variables)
- **NFR-008:** Limites de Génération IA (quota tracking)
- **NFR-018:** APIs Externes (timeout, retry, error handling)

**File Structure:**
```
/app/
  /generate/
    page.tsx         # Generation wizard
  /api/ai/
    /generate-ideas/
    /generate-post/
/lib/
  /ai/
    openai.ts        # OpenAI client
    prompts.ts       # Prompt templates
    rate-limiter.ts  # Quota management
```

**Key Algorithms:**
- **Prompt Template:**
  ```
  System: Tu es un expert en content marketing pour LinkedIn/Instagram...
  Context: IntegrIA, accompagnement tech entrepreneurs, Suisse romande...
  Task: Génère [X] idées de contenu sur [thème]...
  Format: JSON avec structure {...}
  ```

---

### Component 3: Content Management Module

**Purpose:** Gestion complète du cycle de vie des posts (CRUD, édition, brouillons)

**Responsibilities:**
- Création, lecture, mise à jour, suppression posts
- Sauvegarde automatique brouillons (toutes les 30s)
- Édition de posts avec preview temps réel
- Sélection d'idées générées (multi-select)
- Notation qualité posts (1-5 étoiles)
- Copie rapide pour publication manuelle (clipboard)
- Gestion statuts (draft, scheduled, published)
- Recherche et filtrage posts

**Interfaces:**
- **Frontend:** `/posts`, `/posts/[id]/edit`, `/posts/new`
- **API:**
  - `GET /api/content/posts` - Liste posts (pagination, filtres)
  - `GET /api/content/posts/[id]` - Détail post
  - `POST /api/content/posts` - Créer post
  - `PATCH /api/content/posts/[id]` - Mettre à jour post
  - `DELETE /api/content/posts/[id]` - Supprimer post
  - `POST /api/content/posts/[id]/rate` - Noter post
- **Server Actions:** `saveDraft()`, `autoSave()`

**Dependencies:**
- **External:** Supabase Database
- **Internal:** Auth Module (user_id), Media Module (images)
- **Libraries:** Prisma ORM, react-textarea-autosize

**Technology:**
- Prisma ORM (database queries)
- Optimistic UI updates (instant feedback)
- Debounced auto-save (30s)
- Rich text editor (Tiptap or Lexical - Phase 2)

**Functional Requirements Addressed:**
- **FR-003:** Sélection d'Idées
- **FR-007:** Édition de Post
- **FR-008:** Prévisualisation de Post
- **FR-009:** Sauvegarde de Brouillons
- **FR-010:** Copie Rapide pour Publication Manuelle
- **FR-019:** Notation de Posts Générés

**Non-Functional Requirements Addressed:**
- **NFR-003:** Sauvegarde Automatique (<2s, toutes les 30s)
- **NFR-010:** Gestion des Erreurs (retry, feedback)
- **NFR-014:** Courbe d'Apprentissage (UI intuitive)

**File Structure:**
```
/app/
  /posts/
    page.tsx              # Liste posts
    /[id]/
      /edit/
        page.tsx          # Éditeur post
  /api/content/
/lib/
  /content/
    posts.ts              # Business logic
    auto-save.ts          # Auto-save debounced
/components/
  /posts/
    PostEditor.tsx
    PostPreview.tsx
    PostList.tsx
```

**State Management:**
- **Zustand store:** Post editor state (contenu, changes, isSaving)
- **Optimistic updates:** UI mise à jour immédiatement, sync background

---

### Component 4: Calendar & Scheduling Module

**Purpose:** Planification temporelle du contenu et vue calendrier

**Responsibilities:**
- Affichage calendrier mensuel (grille 7×5)
- Planification posts (date + heure)
- Drag & drop pour réorganiser posts (Phase 2)
- Navigation entre mois (précédent/suivant)
- Indicateurs visuels (statut, plateforme)
- Détection conflits (plusieurs posts même créneau)
- Export calendrier (iCal format - Phase 2)

**Interfaces:**
- **Frontend:** `/calendar` page
- **API:**
  - `GET /api/calendar/posts?month=2026-02` - Posts du mois
  - `PATCH /api/calendar/posts/[id]/schedule` - Planifier post
  - `POST /api/calendar/posts/[id]/move` - Déplacer post (drag & drop)

**Dependencies:**
- **External:** Supabase Database
- **Internal:** Content Module (posts)
- **Libraries:** react-big-calendar, date-fns

**Technology:**
- react-big-calendar (UI calendrier)
- date-fns (manipulation dates)
- React DnD (drag & drop - Phase 2)

**Functional Requirements Addressed:**
- **FR-011:** Vue Calendrier Mensuel
- **FR-012:** Planification de Posts
- **FR-013:** Drag & Drop de Posts (Phase 2)

**Non-Functional Requirements Addressed:**
- **NFR-001:** Temps de Chargement (<1s navigation entre mois)
- **NFR-012:** Interface Responsive (calendrier adapté mobile)

**File Structure:**
```
/app/
  /calendar/
    page.tsx              # Vue calendrier
  /api/calendar/
/lib/
  /calendar/
    scheduling.ts         # Logique planning
    date-utils.ts         # Utilitaires dates
/components/
  /calendar/
    CalendarView.tsx
    PostCard.tsx
    DatePicker.tsx
```

---

### Component 5: Media Library Module

**Purpose:** Gestion des assets visuels (images, vidéos) pour accompagner les posts

**Responsibilities:**
- Upload images/vidéos (PNG, JPG, MP4)
- Stockage sécurisé avec Supabase Storage
- Compression images automatique
- Organisation par tags/catégories
- Recherche médias par nom ou tag
- Association média → post
- Prévisualisation avant association
- Suppression médias
- Gestion quotas (5GB/user)

**Interfaces:**
- **Frontend:** `/media` page (grille médias)
- **API:**
  - `POST /api/media/upload` - Upload média
  - `GET /api/media` - Liste médias (pagination)
  - `DELETE /api/media/[id]` - Supprimer média
  - `PATCH /api/media/[id]` - Mettre à jour tags

**Dependencies:**
- **External:** Supabase Storage
- **Internal:** Content Module (association post-média)
- **Libraries:** react-dropzone, sharp (compression)

**Technology:**
- Supabase Storage (object storage)
- Sharp (image compression/resizing)
- react-dropzone (drag & drop upload)
- Signed URLs (accès sécurisé)

**Functional Requirements Addressed:**
- **FR-016:** Bibliothèque de Médias

**Non-Functional Requirements Addressed:**
- **NFR-007:** Capacité Utilisateur (5GB stockage/user)
- **NFR-005:** Protection Données (storage policies par user)

**File Structure:**
```
/app/
  /media/
    page.tsx              # Bibliothèque médias
  /api/media/
/lib/
  /media/
    storage.ts            # Supabase Storage client
    compression.ts        # Image compression
/components/
  /media/
    MediaGrid.tsx
    MediaUploader.tsx
    MediaPreview.tsx
```

**Storage Structure (Supabase):**
```
/users/
  /{user_id}/
    /posts/
      /image-123.jpg
      /video-456.mp4
```

---

### Component 6: Templates Module

**Purpose:** Création et réutilisation de templates de posts pour contenus récurrents

**Responsibilities:**
- Sauvegarder post comme template
- Catégorisation templates (conseil, actualité, témoignage, etc.)
- Utilisation template pour créer nouveau post
- Édition/suppression templates
- Variables dans templates (ex: {{date}}, {{topic}})
- Prévisualisation templates

**Interfaces:**
- **Frontend:** `/templates` page (liste templates)
- **API:**
  - `GET /api/templates` - Liste templates
  - `POST /api/templates` - Créer template depuis post
  - `POST /api/templates/[id]/use` - Créer post depuis template
  - `DELETE /api/templates/[id]` - Supprimer template

**Dependencies:**
- **External:** Supabase Database
- **Internal:** Content Module (création posts)

**Technology:**
- Template variables (simple string replacement)
- Categories/tags (enum in DB)

**Functional Requirements Addressed:**
- **FR-014:** Création de Templates
- **FR-015:** Utilisation de Templates

**Non-Functional Requirements Addressed:**
- **NFR-014:** Courbe d'Apprentissage (réutilisation simple)

**File Structure:**
```
/app/
  /templates/
    page.tsx              # Liste templates
  /api/templates/
/lib/
  /templates/
    template-engine.ts    # Variable substitution
/components/
  /templates/
    TemplateCard.tsx
    TemplateEditor.tsx
```

---

### Component 7: Social Publishing Module (Phase 3)

**Purpose:** Publication automatique sur LinkedIn et Instagram

**Responsibilities:**
- Publication automatique LinkedIn selon planification
- Publication automatique Instagram selon planification
- Gestion OAuth tokens (refresh, expiration)
- Retry automatique si échec (3 tentatives, exponential backoff)
- Logs publication (succès/échec avec raison)
- Notifications email si échec
- Fallback export manuel

**Interfaces:**
- **API:**
  - `POST /api/social/linkedin/publish` - Publier LinkedIn
  - `POST /api/social/instagram/publish` - Publier Instagram
  - `POST /api/social/linkedin/auth` - OAuth LinkedIn
  - `POST /api/social/instagram/auth` - OAuth Instagram
- **Cron Jobs:** Vérification posts à publier toutes les 5 minutes

**Dependencies:**
- **External:** LinkedIn API v2, Instagram Graph API, Vercel Cron Jobs
- **Internal:** Content Module, Calendar Module

**Technology:**
- Vercel Cron Jobs (scheduled tasks)
- OAuth 2.0 (authorization code flow)
- Retry logic avec exponential backoff

**Functional Requirements Addressed:**
- **FR-017:** Publication Automatique LinkedIn (Phase 3)
- **FR-018:** Publication Automatique Instagram (Phase 3)

**Non-Functional Requirements Addressed:**
- **NFR-011:** Fiabilité de Publication (>98% success rate)
- **NFR-006:** Sécurité APIs Tierces (tokens chiffrés)

**File Structure:**
```
/app/
  /api/social/
    /linkedin/
    /instagram/
    /cron/
      /publish-scheduled/  # Cron job endpoint
/lib/
  /social/
    linkedin.ts
    instagram.ts
    retry.ts
```

**Status:** Phase 3 (Could Have), pas dans MVP

---

## Component Interaction Flow

### Flow 1: Content Creation (Main Workflow)

```
1. User Login
   ├─> Auth Module validates credentials
   └─> Session established (JWT token)

2. Generate Ideas
   ├─> Content Generation Module
   ├─> Call OpenAI API (GPT-4 Turbo)
   └─> Return 10-15 ideas

3. Select Ideas (5-6)
   ├─> User selects via UI
   └─> Content Management Module stores selection

4. Generate Posts
   ├─> Content Generation Module
   ├─> For each idea: Call OpenAI API (LinkedIn + Instagram)
   └─> Return 10-12 posts

5. Edit Posts
   ├─> Content Management Module
   ├─> Auto-save every 30s
   └─> Store drafts in Database

6. Schedule Posts (optional)
   ├─> Calendar Module
   └─> Update scheduled_at in Database

7. Publish Manually (MVP)
   ├─> Copy to clipboard
   └─> User publishes manually on platforms

OR

7. Publish Automatically (Phase 3)
   ├─> Social Publishing Module
   ├─> Cron job picks up scheduled posts
   ├─> Call LinkedIn/Instagram APIs
   └─> Update status to 'published'
```

### Flow 2: Template Usage

```
1. Select Template
   ├─> Templates Module
   └─> Fetch template from Database

2. Create Post from Template
   ├─> Template variables substituted
   └─> New post created in Content Module

3. Edit & Customize
   ├─> User adjusts content
   └─> Auto-save as draft

4. Schedule/Publish
   └─> Same as Flow 1 steps 6-7
```

---

## Technology Evaluation Summary

| Category | Chosen Technology | Score (1-10) | Rationale |
|----------|------------------|--------------|-----------|
| **Frontend** | Next.js 14 + React 18 | 9/10 | Excellent DX, performance, ecosystem |
| **Language** | TypeScript | 9/10 | Type safety, maintainability |
| **Styling** | Tailwind CSS | 8/10 | Rapid development, consistency |
| **Backend** | Next.js API Routes | 8/10 | Integrated, serverless, simple |
| **Database** | Supabase PostgreSQL | 9/10 | Generous free tier, RLS, backups |
| **Auth** | Supabase Auth | 8/10 | Integrated, secure, easy setup |
| **Hosting** | Vercel | 9/10 | Optimized for Next.js, great DX |
| **AI** | OpenAI GPT-4 Turbo | 8/10 | Best content quality, french support |
| **Storage** | Supabase Storage | 7/10 | Integrated, CDN, sufficient free tier |

**Overall Stack Score:** 8.5/10 - Excellent balance of simplicity, performance, cost, and scalability for a Level 2 project.

---

## Next Steps

This completes **Part 1 - Architecture Overview & System Design**.

**Proceed to:**
- **Part 2:** Data & API Architecture
- **Part 3:** Non-Functional Requirements (NFR)
- **Part 4:** Deployment & Operations

---

**Document Status:** ✅ Part 1 Complete

**Last Updated:** 2026-01-10
