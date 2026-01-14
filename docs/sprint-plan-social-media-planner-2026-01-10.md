# Sprint Plan: Social Media Planner

**Date:** 2026-01-10
**Scrum Master:** Sami
**Project Level:** 2
**Total Stories:** 32
**Total Points:** 98
**Planned Sprints:** 20+ sprints (Phase 1 MVP: 12 sprints)

---

## Executive Summary

Ce plan de sprint définit l'implémentation complète de Social Media Planner, un outil web intelligent pour la création et planification de contenu pour LinkedIn et Instagram. Le plan est organisé en 3 phases principales avec un focus initial sur le MVP (Must Have features).

**Key Metrics:**
- Total Stories: 32
- Total Points: 98 points
- Team Capacity: 4-5 points par sprint
- Sprint Length: 1 semaine
- MVP Target: 12 sprints (~3 mois)
- Full Product: 20+ sprints (~5 mois)

---

## Team Capacity

| Paramètre | Valeur |
|-----------|--------|
| Team Size | 1 développeur (Sami) |
| Sprint Length | 1 semaine |
| Hours/Week | 10-15h (moyenne 12h) |
| Experience Level | Débutant avec assistance IA |
| Points/Sprint | 4-5 points |
| Hours/Point | ~3 heures |

**Velocity Target:** 4 points/sprint (conservateur pour commencer)

---

## Story Inventory

### EPIC-001: Authentification & Gestion Utilisateur

**Priority:** Must Have (MVP)
**Total Points:** 13 points
**Stories:** 4

---

#### STORY-001: Configuration Supabase Auth

**Epic:** EPIC-001 - Authentification
**Priority:** Must Have
**Points:** 3

**User Story:**
As a developer
I want to configure Supabase Auth for the project
So that I have a secure authentication foundation

**Acceptance Criteria:**
- [ ] Supabase project created and configured
- [ ] Environment variables set up (.env.local)
- [ ] Supabase client configured in /lib/supabase.ts
- [ ] Auth middleware configured for protected routes
- [ ] RLS policies created for users table

**Technical Notes:**
- Install @supabase/supabase-js, @supabase/auth-helpers-nextjs
- Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
- Create users table with sync trigger from auth.users
- Enable RLS on all tables

**Dependencies:** None (infrastructure story)

---

#### STORY-002: Page d'inscription utilisateur

**Epic:** EPIC-001 - Authentification
**Priority:** Must Have
**Points:** 3

**User Story:**
As a new user
I want to create an account with email and password
So that I can access the application securely

**Acceptance Criteria:**
- [ ] Page /register avec formulaire (email, password, confirm password)
- [ ] Validation email format (RFC 5322)
- [ ] Validation password (minimum 8 caractères)
- [ ] Message d'erreur si email déjà utilisé
- [ ] Redirection vers /login après inscription réussie
- [ ] UI responsive avec Tailwind CSS

**Technical Notes:**
- Create /app/(auth)/register/page.tsx
- Use react-hook-form + zod for validation
- Call supabase.auth.signUp()
- Show loading state during submission

**Dependencies:** STORY-001

**FR Covered:** FR-001

---

#### STORY-003: Page de connexion utilisateur

**Epic:** EPIC-001 - Authentification
**Priority:** Must Have
**Points:** 3

**User Story:**
As a returning user
I want to log in with my credentials
So that I can access my content quickly

**Acceptance Criteria:**
- [ ] Page /login avec formulaire (email, password)
- [ ] Message d'erreur clair si identifiants incorrects
- [ ] Session persistante (cookie JWT)
- [ ] Redirection vers /dashboard après connexion
- [ ] Lien vers /register pour nouveaux utilisateurs
- [ ] Option "Se souvenir de moi" (optionnel)

**Technical Notes:**
- Create /app/(auth)/login/page.tsx
- Call supabase.auth.signInWithPassword()
- Store session in cookie (handled by auth-helpers)
- Middleware redirects authenticated users away from /login

**Dependencies:** STORY-001

**FR Covered:** FR-001

---

#### STORY-004: Dashboard et déconnexion

**Epic:** EPIC-001 - Authentification
**Priority:** Must Have
**Points:** 4

**User Story:**
As a logged-in user
I want to see my dashboard and be able to logout
So that I can start using the app and securely exit

**Acceptance Criteria:**
- [ ] Page /dashboard avec layout principal
- [ ] Header avec nom utilisateur et bouton déconnexion
- [ ] Déconnexion fonctionnelle (supprime session)
- [ ] Redirection vers /login après déconnexion
- [ ] Protection route: redirect si non authentifié
- [ ] Sidebar navigation (placeholder pour futures pages)

**Technical Notes:**
- Create /app/(app)/layout.tsx with protected layout
- Create /app/(app)/dashboard/page.tsx
- Implement useAuth() hook with user context
- Call supabase.auth.signOut() for logout

**Dependencies:** STORY-002, STORY-003

**FR Covered:** FR-001

---

### EPIC-002: Génération de Contenu par IA

**Priority:** Must Have (MVP)
**Total Points:** 31 points
**Stories:** 8

---

#### STORY-005: Configuration OpenAI API

**Epic:** EPIC-002 - Génération IA
**Priority:** Must Have
**Points:** 2

**User Story:**
As a developer
I want to configure OpenAI API integration
So that I can generate content with GPT-4

**Acceptance Criteria:**
- [ ] OpenAI SDK installed (openai package)
- [ ] API key stored in environment variable
- [ ] OpenAI client configured in /lib/ai/openai.ts
- [ ] Error handling for API failures
- [ ] Timeout configuration (30s max)

**Technical Notes:**
- npm install openai
- Create OPENAI_API_KEY in .env.local
- Configure client with retry logic
- Add fallback error messages in French

**Dependencies:** None

---

#### STORY-006: Système de prompts IA

**Epic:** EPIC-002 - Génération IA
**Priority:** Must Have
**Points:** 3

**User Story:**
As a developer
I want a prompt template system
So that AI generates contextually relevant content

**Acceptance Criteria:**
- [ ] Prompt templates for idea generation
- [ ] Prompt templates for LinkedIn posts
- [ ] Prompt templates for Instagram captions
- [ ] Context injection (IntegrIA, Suisse romande, tech)
- [ ] JSON structured output format
- [ ] Prompt versioning system

**Technical Notes:**
- Create /lib/ai/prompts.ts with templates
- Use system prompts for context
- Define JSON schemas for outputs
- Include French language instructions

**Dependencies:** STORY-005

---

#### STORY-007: API génération d'idées

**Epic:** EPIC-002 - Génération IA
**Priority:** Must Have
**Points:** 5

**User Story:**
As a content creator
I want to generate 10-15 content ideas
So that I never run out of inspiration

**Acceptance Criteria:**
- [ ] POST /api/ai/generate-ideas endpoint
- [ ] Génère 10-15 idées contextualisées
- [ ] Chaque idée: titre, description, plateforme suggérée
- [ ] Temps de génération < 30 secondes
- [ ] Logging dans ai_generations table
- [ ] Rate limiting (100 générations/mois)

**Technical Notes:**
- Create /app/api/ai/generate-ideas/route.ts
- Use GPT-4 Turbo with JSON response format
- Store generation in database for tracking
- Return quota info in response meta

**Dependencies:** STORY-005, STORY-006

**FR Covered:** FR-002

---

#### STORY-008: Interface génération d'idées

**Epic:** EPIC-002 - Génération IA
**Priority:** Must Have
**Points:** 5

**User Story:**
As a content creator
I want a visual interface to generate and view ideas
So that I can easily start my content creation workflow

**Acceptance Criteria:**
- [ ] Page /generate avec bouton "Générer des idées"
- [ ] Affichage des 10-15 idées en cards
- [ ] Chaque idée: titre, description, badge plateforme
- [ ] Indicateur de chargement pendant génération
- [ ] Bouton régénérer si insatisfait
- [ ] Affichage du quota restant

**Technical Notes:**
- Create /app/(app)/generate/page.tsx
- Use React Query for API calls
- Skeleton loading states
- Store ideas in local state (not DB yet)

**Dependencies:** STORY-007

**FR Covered:** FR-002

---

#### STORY-009: Sélection d'idées

**Epic:** EPIC-002 - Génération IA
**Priority:** Must Have
**Points:** 3

**User Story:**
As a content creator
I want to select 5-6 ideas from the suggestions
So that I can generate posts for the best ones

**Acceptance Criteria:**
- [ ] Checkboxes pour sélectionner les idées
- [ ] Compteur d'idées sélectionnées
- [ ] Maximum 15 idées sélectionnables
- [ ] Bouton "Créer les posts" activé si ≥1 sélection
- [ ] Idées sélectionnées visuellement distinctes
- [ ] Possibilité de désélectionner

**Technical Notes:**
- Add selection state to generate page
- Use Zustand for selection management
- Visual feedback with Tailwind (border, background)

**Dependencies:** STORY-008

**FR Covered:** FR-003

---

#### STORY-010: API génération post LinkedIn

**Epic:** EPIC-002 - Génération IA
**Priority:** Must Have
**Points:** 5

**User Story:**
As a content creator
I want to generate LinkedIn posts automatically
So that I save time on writing professional content

**Acceptance Criteria:**
- [ ] POST /api/ai/generate-post endpoint
- [ ] Génère post LinkedIn (150-300 mots)
- [ ] Ton professionnel aligné IntegrIA
- [ ] Structure: accroche, contenu, CTA
- [ ] Génération < 15 secondes
- [ ] Création automatique du post (status: draft)

**Technical Notes:**
- Create /app/api/ai/generate-post/route.ts
- Platform-specific prompts
- Save to posts table with ai_generated=true
- Return post object with ID

**Dependencies:** STORY-006, STORY-007

**FR Covered:** FR-004

---

#### STORY-011: API génération caption Instagram

**Epic:** EPIC-002 - Génération IA
**Priority:** Must Have
**Points:** 5

**User Story:**
As a content creator
I want to generate Instagram captions with hashtags
So that my posts are optimized for the platform

**Acceptance Criteria:**
- [ ] Support platform="instagram" dans generate-post
- [ ] Caption 80-150 mots, ton léger
- [ ] 5-10 hashtags pertinents (Suisse romande)
- [ ] Call-to-action engageant
- [ ] Génération < 15 secondes
- [ ] Hashtags stockés séparément

**Technical Notes:**
- Extend /api/ai/generate-post for Instagram
- Different prompt template for Instagram
- Parse hashtags into array field
- Emoji-friendly content

**Dependencies:** STORY-010

**FR Covered:** FR-005

---

#### STORY-012: Workflow génération batch

**Epic:** EPIC-002 - Génération IA
**Priority:** Must Have
**Points:** 3

**User Story:**
As a content creator
I want to generate posts for all selected ideas at once
So that I can create a week's content efficiently

**Acceptance Criteria:**
- [ ] Bouton génère posts pour toutes les idées sélectionnées
- [ ] Génération LinkedIn + Instagram pour chaque idée
- [ ] Progress bar pendant génération batch
- [ ] Affichage progressif des posts créés
- [ ] Redirection vers liste des posts à la fin
- [ ] Gestion erreurs partielles (continue si 1 échoue)

**Technical Notes:**
- Sequential API calls (not parallel to avoid rate limits)
- Update UI after each generation
- Store all posts then redirect
- Error toast for failed generations

**Dependencies:** STORY-009, STORY-010, STORY-011

**FR Covered:** FR-002, FR-003, FR-004, FR-005

---

### EPIC-003: Gestion & Édition de Contenu

**Priority:** Must Have (MVP)
**Total Points:** 22 points
**Stories:** 6

---

#### STORY-013: Modèle de données posts

**Epic:** EPIC-003 - Gestion Contenu
**Priority:** Must Have
**Points:** 3

**User Story:**
As a developer
I want the posts data model implemented
So that I can store and retrieve user content

**Acceptance Criteria:**
- [ ] Posts table créée (Prisma migration)
- [ ] Types TypeScript pour Post
- [ ] CRUD functions dans /lib/content/posts.ts
- [ ] RLS policies pour isolation utilisateur
- [ ] Index sur user_id, status, created_at

**Technical Notes:**
- Run prisma migrate for posts table
- Create Post type from Prisma schema
- Implement getPosts, getPost, createPost, updatePost, deletePost
- Test RLS with different user tokens

**Dependencies:** STORY-001

---

#### STORY-014: Liste des posts (brouillons)

**Epic:** EPIC-003 - Gestion Contenu
**Priority:** Must Have
**Points:** 4

**User Story:**
As a user
I want to see all my saved posts
So that I can manage my content library

**Acceptance Criteria:**
- [ ] Page /posts avec liste de tous les posts
- [ ] Affichage: preview content, plateforme, statut, date
- [ ] Filtres par statut (draft, scheduled, published)
- [ ] Filtres par plateforme (LinkedIn, Instagram)
- [ ] Pagination (20 posts par page)
- [ ] Recherche texte dans le contenu

**Technical Notes:**
- Create /app/(app)/posts/page.tsx
- Use React Query with filters
- Cursor-based pagination
- Debounced search input

**Dependencies:** STORY-013

**FR Covered:** FR-009

---

#### STORY-015: Éditeur de post

**Epic:** EPIC-003 - Gestion Contenu
**Priority:** Must Have
**Points:** 5

**User Story:**
As a user
I want to edit my posts easily
So that I can adjust AI-generated content to my voice

**Acceptance Criteria:**
- [ ] Page /posts/[id]/edit avec éditeur
- [ ] Textarea avec compteur de caractères
- [ ] Undo/redo fonctionnel (Ctrl+Z, Ctrl+Y)
- [ ] Bouton sauvegarder
- [ ] Feedback visuel "Enregistré"
- [ ] Édition des hashtags (Instagram)

**Technical Notes:**
- Create /app/(app)/posts/[id]/edit/page.tsx
- Use controlled textarea with useState
- Implement undo stack with useReducer
- PATCH /api/content/posts/[id] on save

**Dependencies:** STORY-013, STORY-014

**FR Covered:** FR-007

---

#### STORY-016: Sauvegarde automatique

**Epic:** EPIC-003 - Gestion Contenu
**Priority:** Must Have
**Points:** 3

**User Story:**
As a user
I want my work saved automatically
So that I never lose content

**Acceptance Criteria:**
- [ ] Auto-save toutes les 30 secondes si modifications
- [ ] Debounce pour éviter saves excessifs
- [ ] Indicateur visuel "Sauvegarde en cours..." / "Enregistré à HH:MM"
- [ ] Pas de perte si fermeture navigateur accidentelle
- [ ] Gestion conflits (optimistic locking)

**Technical Notes:**
- Use useDebounce hook (30s delay)
- Track dirty state
- Show last saved timestamp
- Include updated_at in PATCH request for conflict detection

**Dependencies:** STORY-015

**FR Covered:** FR-009, NFR-003

---

#### STORY-017: Prévisualisation de post

**Epic:** EPIC-003 - Gestion Contenu
**Priority:** Must Have
**Points:** 4

**User Story:**
As a user
I want to preview posts as they'll appear on LinkedIn/Instagram
So that I can ensure quality before publishing

**Acceptance Criteria:**
- [ ] Toggle édition/prévisualisation
- [ ] Preview LinkedIn (style professionnel, police système)
- [ ] Preview Instagram (style mobile, emojis, hashtags)
- [ ] Affichage image si associée
- [ ] Responsive preview

**Technical Notes:**
- Create PostPreview component
- Platform-specific styling
- Mock LinkedIn/Instagram card UI
- Toggle state in editor page

**Dependencies:** STORY-015

**FR Covered:** FR-008

---

#### STORY-018: Copie rapide pour publication manuelle

**Epic:** EPIC-003 - Gestion Contenu
**Priority:** Must Have
**Points:** 3

**User Story:**
As a user
I want to copy content quickly for manual publishing
So that I can post to LinkedIn/Instagram immediately

**Acceptance Criteria:**
- [ ] Bouton "Copier pour LinkedIn" avec icône
- [ ] Bouton "Copier pour Instagram" avec icône
- [ ] Toast notification "Copié!" après clic
- [ ] Formatage préservé (line breaks, emojis)
- [ ] Hashtags inclus pour Instagram
- [ ] Instructions post-copie (optionnel)

**Technical Notes:**
- Use navigator.clipboard.writeText()
- Different formatting per platform
- Add toast with react-hot-toast
- Track copy event for analytics (future)

**Dependencies:** STORY-015

**FR Covered:** FR-010

---

### EPIC-004: Calendrier Éditorial

**Priority:** Should Have (Post-MVP)
**Total Points:** 15 points
**Stories:** 4

---

#### STORY-019: Vue calendrier mensuel

**Epic:** EPIC-004 - Calendrier
**Priority:** Should Have
**Points:** 5

**User Story:**
As a content strategist
I want to see my content on a calendar
So that I can visualize my publishing schedule

**Acceptance Criteria:**
- [ ] Page /calendar avec grille mensuelle (7x5)
- [ ] Affichage posts par date
- [ ] Navigation mois précédent/suivant
- [ ] Badges par plateforme (LinkedIn bleu, Instagram rose)
- [ ] Indicateurs statut (draft gris, scheduled vert, published bleu)
- [ ] Clic sur date → voir détails posts

**Technical Notes:**
- Create /app/(app)/calendar/page.tsx
- Use react-big-calendar or custom grid
- GET /api/calendar/posts?month=YYYY-MM
- Group posts by date

**Dependencies:** STORY-014

**FR Covered:** FR-011

---

#### STORY-020: Planification de posts

**Epic:** EPIC-004 - Calendrier
**Priority:** Should Have
**Points:** 4

**User Story:**
As a content strategist
I want to schedule posts for specific dates
So that I maintain consistent publishing

**Acceptance Criteria:**
- [ ] DatePicker dans l'éditeur de post
- [ ] TimePicker pour heure de publication
- [ ] Statut passe de draft → scheduled
- [ ] Confirmation visuelle de la planification
- [ ] Modification de date possible
- [ ] Warning si créneau déjà occupé

**Technical Notes:**
- Add date/time picker to edit page
- PATCH /api/calendar/posts/[id]/schedule
- Validate scheduled_at > now
- Update post status to 'scheduled'

**Dependencies:** STORY-015, STORY-019

**FR Covered:** FR-012

---

#### STORY-021: API calendrier

**Epic:** EPIC-004 - Calendrier
**Priority:** Should Have
**Points:** 3

**User Story:**
As a developer
I want calendar-specific API endpoints
So that calendar features work efficiently

**Acceptance Criteria:**
- [ ] GET /api/calendar/posts?month=YYYY-MM
- [ ] Retourne posts groupés par date
- [ ] Inclut metadata (count par statut, plateforme)
- [ ] Performance <500ms pour mois complet
- [ ] Cache-friendly response

**Technical Notes:**
- Create /app/api/calendar/posts/route.ts
- Efficient query with date range
- Group by scheduled_at or created_at
- Return summary statistics

**Dependencies:** STORY-013

---

#### STORY-022: Drag & Drop calendrier

**Epic:** EPIC-004 - Calendrier
**Priority:** Could Have
**Points:** 3

**User Story:**
As a content strategist
I want to drag posts between dates
So that I can quickly reorganize my calendar

**Acceptance Criteria:**
- [ ] Drag & drop posts entre dates
- [ ] Mise à jour automatique scheduled_at
- [ ] Feedback visuel pendant drag (ghost element)
- [ ] Undo rapide après drop (toast avec "Annuler")
- [ ] Desktop uniquement (pas mobile)

**Technical Notes:**
- Use @dnd-kit or react-dnd
- Optimistic update on drop
- PATCH scheduled_at on drop
- Ghost element with reduced opacity

**Dependencies:** STORY-019, STORY-020

**FR Covered:** FR-013

---

### EPIC-005: Templates & Bibliothèque Médias

**Priority:** Should Have (Post-MVP)
**Total Points:** 15 points
**Stories:** 5

---

#### STORY-023: Modèle de données templates

**Epic:** EPIC-005 - Templates & Médias
**Priority:** Should Have
**Points:** 2

**User Story:**
As a developer
I want templates data model implemented
So that users can save and reuse content patterns

**Acceptance Criteria:**
- [ ] Templates table créée (Prisma migration)
- [ ] Types TypeScript pour Template
- [ ] CRUD functions dans /lib/templates/
- [ ] RLS policies pour isolation utilisateur
- [ ] Categories enum (conseil, actualité, etc.)

**Technical Notes:**
- Add templates table to schema.prisma
- Run migration
- Create template-related types
- Similar RLS pattern as posts

**Dependencies:** STORY-001

---

#### STORY-024: Sauvegarder comme template

**Epic:** EPIC-005 - Templates & Médias
**Priority:** Should Have
**Points:** 3

**User Story:**
As a content creator
I want to save successful posts as templates
So that I can reuse proven formats

**Acceptance Criteria:**
- [ ] Option "Sauvegarder comme template" dans éditeur
- [ ] Modal: nom, description, catégorie
- [ ] Identification des variables {{var}} dans le contenu
- [ ] Confirmation de création
- [ ] Redirection vers liste templates

**Technical Notes:**
- Add save template button to edit page
- Modal with form (react-hook-form)
- POST /api/templates
- Extract variables with regex /\{\{(\w+)\}\}/g

**Dependencies:** STORY-015, STORY-023

**FR Covered:** FR-014

---

#### STORY-025: Liste et utilisation templates

**Epic:** EPIC-005 - Templates & Médias
**Priority:** Should Have
**Points:** 4

**User Story:**
As a content creator
I want to create posts from templates
So that I speed up recurring content creation

**Acceptance Criteria:**
- [ ] Page /templates avec liste templates
- [ ] Filtres par catégorie et plateforme
- [ ] Bouton "Utiliser" sur chaque template
- [ ] Modal pour remplir les variables
- [ ] Création nouveau post depuis template
- [ ] Compteur d'utilisations

**Technical Notes:**
- Create /app/(app)/templates/page.tsx
- POST /api/templates/[id]/use
- Variable substitution in content
- Increment usage_count
- Create post with template_id reference

**Dependencies:** STORY-023, STORY-024

**FR Covered:** FR-015

---

#### STORY-026: Upload de médias

**Epic:** EPIC-005 - Templates & Médias
**Priority:** Should Have
**Points:** 4

**User Story:**
As a content creator
I want to upload images
So that I can add visuals to my posts

**Acceptance Criteria:**
- [ ] Upload via drag & drop ou file picker
- [ ] Formats supportés: PNG, JPG, JPEG, WebP
- [ ] Taille max: 10MB
- [ ] Compression automatique si >2MB
- [ ] Preview avant confirmation
- [ ] Progress bar pendant upload

**Technical Notes:**
- Create /app/api/media/upload/route.ts
- Use react-dropzone for UI
- Upload to Supabase Storage
- Compress with sharp on server
- Store metadata in media table

**Dependencies:** STORY-001

**FR Covered:** FR-016

---

#### STORY-027: Bibliothèque médias

**Epic:** EPIC-005 - Templates & Médias
**Priority:** Should Have
**Points:** 2

**User Story:**
As a content creator
I want to browse and manage my uploaded media
So that I can organize my visual assets

**Acceptance Criteria:**
- [ ] Page /media avec grille d'images
- [ ] Filtres par tags
- [ ] Recherche par nom
- [ ] Suppression avec confirmation
- [ ] Association média → post depuis l'éditeur

**Technical Notes:**
- Create /app/(app)/media/page.tsx
- GET /api/media with pagination
- DELETE /api/media/[id]
- Media picker modal for post editor

**Dependencies:** STORY-026

**FR Covered:** FR-016

---

### EPIC-006: Publication Automatique

**Priority:** Could Have (Phase 3)
**Total Points:** 18 points
**Stories:** 5

---

#### STORY-028: OAuth LinkedIn

**Epic:** EPIC-006 - Publication Auto
**Priority:** Could Have
**Points:** 5

**User Story:**
As a user
I want to connect my LinkedIn account
So that posts can be published automatically

**Acceptance Criteria:**
- [ ] Bouton "Connecter LinkedIn" dans settings
- [ ] OAuth flow complet (authorization code)
- [ ] Stockage sécurisé des tokens (chiffrés)
- [ ] Affichage profil connecté
- [ ] Option de déconnexion
- [ ] Refresh token automatique

**Technical Notes:**
- Create /api/social/linkedin/auth endpoints
- OAuth 2.0 authorization code flow
- Store in social_connections table (encrypted)
- Automatic token refresh before expiry

**Dependencies:** STORY-001

**FR Covered:** FR-017

---

#### STORY-029: Publication LinkedIn

**Epic:** EPIC-006 - Publication Auto
**Priority:** Could Have
**Points:** 5

**User Story:**
As a user
I want posts published automatically to LinkedIn
So that I don't have to do it manually

**Acceptance Criteria:**
- [ ] POST /api/social/linkedin/publish endpoint
- [ ] Publication via LinkedIn API v2
- [ ] Support texte + image
- [ ] Mise à jour statut → published
- [ ] Gestion erreurs avec retry (3x)
- [ ] Notification si échec permanent

**Technical Notes:**
- Use LinkedIn ugcPosts API
- Handle rate limits (100/day)
- Retry with exponential backoff
- Update post status and published_at

**Dependencies:** STORY-028

**FR Covered:** FR-017

---

#### STORY-030: OAuth Instagram

**Epic:** EPIC-006 - Publication Auto
**Priority:** Could Have
**Points:** 4

**User Story:**
As a user
I want to connect my Instagram Business account
So that posts can be published automatically

**Acceptance Criteria:**
- [ ] Bouton "Connecter Instagram" dans settings
- [ ] OAuth via Facebook Graph API
- [ ] Requirement: Instagram Business Account
- [ ] Stockage sécurisé des tokens
- [ ] Affichage compte connecté
- [ ] Instructions setup compte Business

**Technical Notes:**
- Instagram Graph API via Facebook
- Requires Facebook Page + Instagram Business
- Store tokens encrypted
- Show setup guide if not Business account

**Dependencies:** STORY-001

**FR Covered:** FR-018

---

#### STORY-031: Publication Instagram

**Epic:** EPIC-006 - Publication Auto
**Priority:** Could Have
**Points:** 4

**User Story:**
As a user
I want posts published automatically to Instagram
So that I maintain my presence without manual work

**Acceptance Criteria:**
- [ ] POST /api/social/instagram/publish endpoint
- [ ] Publication via Instagram Graph API
- [ ] Image obligatoire (Instagram requirement)
- [ ] Support caption + hashtags
- [ ] Mise à jour statut → published
- [ ] Gestion erreurs avec retry

**Technical Notes:**
- Two-step: create container → publish
- Image URL must be publicly accessible
- Handle rate limits (25/day)
- Update post status and published_at

**Dependencies:** STORY-026, STORY-030

**FR Covered:** FR-018

---

#### STORY-032: Cron job publication planifiée

**Epic:** EPIC-006 - Publication Auto
**Priority:** Could Have
**Points:** 3

**User Story:**
As a user
I want scheduled posts to publish automatically
So that I can set it and forget it

**Acceptance Criteria:**
- [ ] Cron job toutes les 5 minutes
- [ ] Fetch posts scheduled_at <= NOW()
- [ ] Publication LinkedIn ou Instagram selon plateforme
- [ ] Retry automatique si échec
- [ ] Email notification si échec permanent
- [ ] Logs de publication accessibles

**Technical Notes:**
- Vercel Cron Jobs (/api/cron/publish-scheduled)
- Secure with CRON_SECRET
- Queue posts and process sequentially
- Use Resend for failure notifications

**Dependencies:** STORY-029, STORY-031

**FR Covered:** FR-017, FR-018

---

## Sprint Allocation

### Phase 1 - MVP Core (Sprints 1-12)

**Epics:** EPIC-001, EPIC-002, EPIC-003
**Total Points:** 66 points
**Goal:** Outil fonctionnel pour générer et gérer du contenu

---

### Sprint 1 (Semaine 1) - 4/4 points

**Goal:** Fondation authentification

**Stories:**
| ID | Titre | Points | Priorité |
|----|-------|--------|----------|
| STORY-001 | Configuration Supabase Auth | 3 | Must Have |
| STORY-005 | Configuration OpenAI API | 1* | Must Have |

*Note: STORY-005 réduit à 1 point car juste l'installation et config de base

**Total:** 4 points

**Deliverables:**
- Projet Supabase configuré
- Auth middleware fonctionnel
- OpenAI client prêt

**Risks:**
- Configuration Supabase peut prendre plus de temps si problèmes

---

### Sprint 2 (Semaine 2) - 4/4 points

**Goal:** Inscription et connexion utilisateur

**Stories:**
| ID | Titre | Points | Priorité |
|----|-------|--------|----------|
| STORY-002 | Page d'inscription | 3 | Must Have |
| STORY-005 | Configuration OpenAI (suite) | 1 | Must Have |

**Total:** 4 points

**Deliverables:**
- Page /register fonctionnelle
- OpenAI fully configured

---

### Sprint 3 (Semaine 3) - 4/4 points

**Goal:** Authentification complète

**Stories:**
| ID | Titre | Points | Priorité |
|----|-------|--------|----------|
| STORY-003 | Page de connexion | 3 | Must Have |
| STORY-006 | Système de prompts IA (début) | 1 | Must Have |

**Total:** 4 points

**Deliverables:**
- Page /login fonctionnelle
- Début templates de prompts

---

### Sprint 4 (Semaine 4) - 4/4 points

**Goal:** Dashboard et prompts IA

**Stories:**
| ID | Titre | Points | Priorité |
|----|-------|--------|----------|
| STORY-004 | Dashboard et déconnexion | 4 | Must Have |

**Total:** 4 points

**Deliverables:**
- Dashboard avec navigation
- Déconnexion fonctionnelle
- Layout principal

---

### Sprint 5 (Semaine 5) - 4/4 points

**Goal:** Prompts et API génération idées

**Stories:**
| ID | Titre | Points | Priorité |
|----|-------|--------|----------|
| STORY-006 | Système de prompts (suite) | 2 | Must Have |
| STORY-013 | Modèle de données posts | 2* | Must Have |

*Avancé pour préparer stockage

**Total:** 4 points

**Deliverables:**
- Prompts complets LinkedIn + Instagram
- Table posts créée

---

### Sprint 6 (Semaine 6) - 5/4 points

**Goal:** API génération d'idées

**Stories:**
| ID | Titre | Points | Priorité |
|----|-------|--------|----------|
| STORY-007 | API génération d'idées | 5 | Must Have |

**Total:** 5 points (légèrement au-dessus)

**Deliverables:**
- Endpoint génération idées fonctionnel
- Rate limiting implémenté

---

### Sprint 7 (Semaine 7) - 5/4 points

**Goal:** Interface génération idées

**Stories:**
| ID | Titre | Points | Priorité |
|----|-------|--------|----------|
| STORY-008 | Interface génération d'idées | 5 | Must Have |

**Total:** 5 points

**Deliverables:**
- Page /generate complète
- Affichage des idées

---

### Sprint 8 (Semaine 8) - 4/4 points

**Goal:** Sélection et génération posts

**Stories:**
| ID | Titre | Points | Priorité |
|----|-------|--------|----------|
| STORY-009 | Sélection d'idées | 3 | Must Have |
| STORY-013 | Modèle données posts (suite) | 1 | Must Have |

**Total:** 4 points

**Deliverables:**
- Sélection multi-idées
- Posts table finalisée

---

### Sprint 9 (Semaine 9) - 5/4 points

**Goal:** Génération posts LinkedIn

**Stories:**
| ID | Titre | Points | Priorité |
|----|-------|--------|----------|
| STORY-010 | API génération post LinkedIn | 5 | Must Have |

**Total:** 5 points

**Deliverables:**
- Génération posts LinkedIn fonctionnelle

---

### Sprint 10 (Semaine 10) - 5/4 points

**Goal:** Génération Instagram + Batch

**Stories:**
| ID | Titre | Points | Priorité |
|----|-------|--------|----------|
| STORY-011 | API génération caption Instagram | 5 | Must Have |

**Total:** 5 points

**Deliverables:**
- Génération captions Instagram

---

### Sprint 11 (Semaine 11) - 4/4 points

**Goal:** Workflow batch et liste posts

**Stories:**
| ID | Titre | Points | Priorité |
|----|-------|--------|----------|
| STORY-012 | Workflow génération batch | 3 | Must Have |
| STORY-014 | Liste des posts (début) | 1 | Must Have |

**Total:** 4 points

**Deliverables:**
- Génération batch complète
- Début liste posts

---

### Sprint 12 (Semaine 12) - 4/4 points

**Goal:** Liste posts complète

**Stories:**
| ID | Titre | Points | Priorité |
|----|-------|--------|----------|
| STORY-014 | Liste des posts (fin) | 3 | Must Have |
| STORY-015 | Éditeur de post (début) | 1 | Must Have |

**Total:** 4 points

**Deliverables:**
- Page /posts complète
- Début éditeur

---

### Sprint 13 (Semaine 13) - 5/4 points

**Goal:** Éditeur de post

**Stories:**
| ID | Titre | Points | Priorité |
|----|-------|--------|----------|
| STORY-015 | Éditeur de post (fin) | 4 | Must Have |

**Total:** 4 points

**Deliverables:**
- Éditeur de post complet

---

### Sprint 14 (Semaine 14) - 4/4 points

**Goal:** Auto-save et preview

**Stories:**
| ID | Titre | Points | Priorité |
|----|-------|--------|----------|
| STORY-016 | Sauvegarde automatique | 3 | Must Have |
| STORY-017 | Prévisualisation (début) | 1 | Must Have |

**Total:** 4 points

**Deliverables:**
- Auto-save fonctionnel

---

### Sprint 15 (Semaine 15) - 4/4 points

**Goal:** Preview et copie

**Stories:**
| ID | Titre | Points | Priorité |
|----|-------|--------|----------|
| STORY-017 | Prévisualisation (fin) | 3 | Must Have |
| STORY-018 | Copie rapide | 3 | Must Have |

**Total:** 6 points (répartir si nécessaire)

**Milestone: MVP COMPLETE**

**Deliverables:**
- Preview LinkedIn/Instagram
- Copie clipboard fonctionnelle
- **MVP utilisable!**

---

### Phase 2 - Calendrier & Templates (Sprints 16-22)

**Epics:** EPIC-004, EPIC-005
**Total Points:** 30 points

---

### Sprint 16-17: Vue calendrier (8 points)
- STORY-019: Vue calendrier mensuel (5)
- STORY-021: API calendrier (3)

### Sprint 18-19: Planification (7 points)
- STORY-020: Planification de posts (4)
- STORY-022: Drag & Drop (3)

### Sprint 20-21: Templates (9 points)
- STORY-023: Modèle données templates (2)
- STORY-024: Sauvegarder comme template (3)
- STORY-025: Liste et utilisation templates (4)

### Sprint 22: Médias (6 points)
- STORY-026: Upload de médias (4)
- STORY-027: Bibliothèque médias (2)

---

### Phase 3 - Publication Auto (Sprints 23-28)

**Epic:** EPIC-006
**Total Points:** 18 points

---

### Sprint 23-24: LinkedIn Auto (10 points)
- STORY-028: OAuth LinkedIn (5)
- STORY-029: Publication LinkedIn (5)

### Sprint 25-26: Instagram Auto (8 points)
- STORY-030: OAuth Instagram (4)
- STORY-031: Publication Instagram (4)

### Sprint 27-28: Cron & Finition (3 points)
- STORY-032: Cron job publication (3)

---

## Epic Traceability

| Epic ID | Epic Name | Stories | Total Points | Sprints |
|---------|-----------|---------|--------------|---------|
| EPIC-001 | Authentification | STORY-001 to 004 | 13 | 1-4 |
| EPIC-002 | Génération IA | STORY-005 to 012 | 31 | 2-11 |
| EPIC-003 | Gestion Contenu | STORY-013 to 018 | 22 | 5-15 |
| EPIC-004 | Calendrier | STORY-019 to 022 | 15 | 16-19 |
| EPIC-005 | Templates & Médias | STORY-023 to 027 | 15 | 20-22 |
| EPIC-006 | Publication Auto | STORY-028 to 032 | 18 | 23-28 |

---

## Functional Requirements Coverage

| FR ID | FR Name | Story | Sprint |
|-------|---------|-------|--------|
| FR-001 | Authentification Email/Password | STORY-002, 003, 004 | 2-4 |
| FR-002 | Génération d'Idées IA | STORY-007, 008 | 6-7 |
| FR-003 | Sélection d'Idées | STORY-009 | 8 |
| FR-004 | Génération Post LinkedIn | STORY-010 | 9 |
| FR-005 | Génération Caption Instagram | STORY-011 | 10 |
| FR-006 | Génération Multiple (3 versions) | (Future enhancement) | TBD |
| FR-007 | Édition de Post | STORY-015 | 12-13 |
| FR-008 | Prévisualisation de Post | STORY-017 | 14-15 |
| FR-009 | Sauvegarde de Brouillons | STORY-014, 016 | 12, 14 |
| FR-010 | Copie Rapide Publication | STORY-018 | 15 |
| FR-011 | Vue Calendrier Mensuel | STORY-019 | 16-17 |
| FR-012 | Planification de Posts | STORY-020 | 18-19 |
| FR-013 | Drag & Drop Posts | STORY-022 | 19 |
| FR-014 | Création de Templates | STORY-024 | 20-21 |
| FR-015 | Utilisation de Templates | STORY-025 | 21 |
| FR-016 | Bibliothèque de Médias | STORY-026, 027 | 22 |
| FR-017 | Publication Auto LinkedIn | STORY-028, 029 | 23-24 |
| FR-018 | Publication Auto Instagram | STORY-030, 031 | 25-26 |
| FR-019 | Notation de Posts | (Future enhancement) | TBD |

---

## Risks and Mitigation

**High:**
1. **OpenAI API Quality** - Le contenu généré peut ne pas être assez bon
   - *Mitigation:* Itérer sur les prompts, tests intensifs, ajustements basés sur feedback

2. **Temps de développement dépassé** - Complexité sous-estimée
   - *Mitigation:* Buffer de 20% prévu, réduction scope si nécessaire

**Medium:**
3. **Rate limits OpenAI** - Coûts ou blocages inattendus
   - *Mitigation:* Monitoring quotas, fallback Claude si nécessaire

4. **APIs sociales complexes** - LinkedIn/Instagram peuvent être difficiles
   - *Mitigation:* Phase 3 optionnelle, fallback copie manuelle toujours disponible

**Low:**
5. **Supabase free tier limits** - Dépassement de quotas
   - *Mitigation:* Monitoring usage, upgrade si nécessaire

---

## Definition of Done

Pour qu'une story soit considérée comme complète:

- [ ] Code implémenté et fonctionnel
- [ ] Tests manuels passés
- [ ] Code TypeScript sans erreurs (tsc --noEmit)
- [ ] Linting passé (npm run lint)
- [ ] UI responsive testée (desktop + mobile)
- [ ] Acceptance criteria validés
- [ ] Code commité et pushé
- [ ] Déployé sur preview Vercel

---

## Next Steps

**Immediate:** Commencer Sprint 1

1. Run `/dev-story STORY-001` pour implémenter la configuration Supabase Auth
2. Ou `/create-story STORY-001` pour créer un document de story détaillé

**Sprint Cadence:**
- Sprint length: 1 semaine
- Planning: Lundi matin
- Review: Vendredi après-midi
- Rétrospective: Vendredi (optionnel, 15 min)

---

**This plan was created using BMAD Method v6 - Phase 4 (Implementation Planning)**

*To continue: Run `/workflow-status` to see your progress and next recommended workflow.*
