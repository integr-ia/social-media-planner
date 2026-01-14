# Product Requirements Document: Social Media Planner

**Date:** 2026-01-06
**Author:** Sami
**Version:** 1.0
**Project Type:** web-app
**Project Level:** 2
**Status:** Draft

---

## Document Overview

This Product Requirements Document (PRD) defines the functional and non-functional requirements for Social Media Planner. It serves as the source of truth for what will be built and provides traceability from requirements through implementation.

**Related Documents:**
- Product Brief: docs/product-brief-social-media-planner-2026-01-06.md

---

## Executive Summary

Social Media Planner est un outil web intelligent conçu pour centraliser et automatiser la création de contenu pour les réseaux sociaux. Destiné initialement à Sami, fondateur d'IntegrIA, et potentiellement à 3 employés futurs, cet outil permet de générer des idées de contenu assistées par IA, de créer des posts optimisés pour Instagram et LinkedIn, et de planifier stratégiquement le contenu à court, moyen et long terme. Dans un contexte de lancement d'activité en Suisse romande, cet outil est critique pour développer la visibilité et l'acquisition client en minimisant le temps consacré à la création de contenu tout en maximisant la qualité et la régularité des publications.

**Proposition de Valeur:**
"Transformez 5 heures de création de contenu par semaine en 30 minutes, en générant automatiquement des idées pertinentes et du contenu de qualité professionnelle pour Instagram et LinkedIn."

---

## Product Goals

### Business Objectives

**Objectifs SMART (6 mois):**

1. **Production de Contenu**
   - Publier 2 posts Instagram + 2 posts LinkedIn par semaine (8 posts/semaine, 32+ posts/mois)
   - Maintenir ce rythme de manière constante sur 6 mois (février - juillet 2026)

2. **Génération de Leads**
   - Obtenir 5 leads qualifiés par mois via LinkedIn
   - 30 leads qualifiés cumulés sur 6 mois
   - Définition lead qualifié: Entrepreneur/PME en Suisse romande manifestant un intérêt concret pour les services IntegrIA

3. **Croissance de l'Audience**
   - Instagram: 100-200 followers en 6 mois (partant de 0)
   - LinkedIn: 100-200 followers/connexions en 6 mois
   - Minimum 15-30 nouveaux followers par mois et par plateforme

4. **Efficacité Opérationnelle**
   - Réduire le temps de création de contenu à moins de 2 heures par semaine
   - Gain: 60-75% de temps économisé vs baseline de 5-8 heures/semaine

### Success Metrics

| Métrique | Baseline | Cible 3 mois | Cible 6 mois |
|----------|----------|--------------|--------------|
| Posts/semaine | 0 | 8 | 8 |
| Leads LinkedIn/mois | 0 | 3-4 | 5+ |
| Followers Instagram | 0 | 50-100 | 100-200 |
| Followers LinkedIn | Variable | +50-100 | +100-200 |
| Temps création/semaine | N/A | <3h | <2h |
| Taux engagement Instagram | N/A | 2-3% | 4-5% |
| Taux engagement LinkedIn | N/A | 3-4% | 5-7% |

**Critères de Succès Qualitatifs:**
- **"10-to-5 Rule"**: Génération de 10-15 idées, validation de 5-6, workflow complet < 30 minutes
- **"80/20 Rule"**: Maximum 20% d'édition nécessaire sur le contenu généré
- **"Zero Error Tolerance"**: Taux de réussite publication > 98%
- **"Visible Growth"**: Croissance mensuelle constante de l'audience

---

## Functional Requirements

Functional Requirements (FRs) define **what** the system does - specific features and behaviors.

Each requirement includes:
- **ID**: Unique identifier (FR-001, FR-002, etc.)
- **Priority**: Must Have / Should Have / Could Have (MoSCoW)
- **Description**: What the system should do
- **Acceptance Criteria**: How to verify it's complete

---

### FR-001: Authentification Email/Mot de passe

**Priority:** Must Have

**Description:**
L'utilisateur peut créer un compte et se connecter avec email et mot de passe pour accéder à l'application de manière sécurisée.

**Acceptance Criteria:**
- [ ] Création de compte avec email valide
- [ ] Connexion avec identifiants valides
- [ ] Mot de passe sécurisé (minimum 8 caractères)
- [ ] Session persistante (utilisateur reste connecté)
- [ ] Déconnexion possible
- [ ] Message d'erreur clair si identifiants incorrects

**Dependencies:** Aucune

---

### FR-002: Génération d'Idées de Contenu par IA

**Priority:** Must Have

**Description:**
Le système génère 10-15 idées de contenu contextualisées au secteur technologique, à l'accompagnement entrepreneurial et à la Suisse romande, basées sur les tendances actuelles et les services IntegrIA.

**Acceptance Criteria:**
- [ ] Génération de 10-15 suggestions par session
- [ ] Idées contextualisées (IntegrIA, entrepreneurs, tech, Suisse romande)
- [ ] Affichage clair des idées avec descriptions courtes
- [ ] Possibilité de régénérer si insatisfait des suggestions
- [ ] Temps de génération < 30 secondes
- [ ] Indication visuelle de progression pendant génération

**Dependencies:** Aucune

---

### FR-003: Sélection d'Idées

**Priority:** Must Have

**Description:**
L'utilisateur peut sélectionner 5-6 idées parmi les suggestions générées pour créer du contenu.

**Acceptance Criteria:**
- [ ] Interface de sélection multi-choix (checkboxes ou boutons)
- [ ] Minimum 1 idée sélectionnable, maximum 15 idées
- [ ] Idées sélectionnées sauvegardées automatiquement
- [ ] Affichage visuel des idées sélectionnées vs non sélectionnées
- [ ] Possibilité de désélectionner une idée
- [ ] Bouton "Continuer" pour passer à la génération de posts

**Dependencies:** FR-002

---

### FR-004: Génération de Post LinkedIn

**Priority:** Must Have

**Description:**
Le système génère automatiquement un post LinkedIn professionnel pour chaque idée sélectionnée, avec un ton adapté à la plateforme et aligné avec la marque IntegrIA.

**Acceptance Criteria:**
- [ ] Génération de texte professionnel adapté à LinkedIn
- [ ] Ton aligné avec IntegrIA (expert tech accessible, focus gain de temps pour entrepreneurs)
- [ ] Longueur appropriée (150-300 mots)
- [ ] Structure claire: accroche, contenu informatif, call-to-action
- [ ] Formatage adapté (paragraphes, émojis occasionnels)
- [ ] Génération en < 15 secondes par post

**Dependencies:** FR-003

---

### FR-005: Génération de Caption Instagram

**Priority:** Must Have

**Description:**
Le système génère automatiquement une caption Instagram engageante pour chaque idée sélectionnée, avec un ton plus léger, des hashtags pertinents et un call-to-action clair.

**Acceptance Criteria:**
- [ ] Génération de texte engageant adapté à Instagram
- [ ] Ton plus léger et accessible que LinkedIn
- [ ] Longueur appropriée (80-150 mots)
- [ ] Suggestions de hashtags pertinents (5-10) ciblés Suisse romande
- [ ] Call-to-action clair
- [ ] Génération en < 15 secondes par caption

**Dependencies:** FR-003

---

### FR-006: Génération Multiple (3 versions)

**Priority:** Should Have

**Description:**
Le système peut générer 3 versions différentes d'un même post pour permettre à l'utilisateur de choisir la meilleure ou de combiner les meilleures parties.

**Acceptance Criteria:**
- [ ] Option "Générer 3 versions" disponible
- [ ] Affichage côte à côte ou en tabs des 3 versions
- [ ] Possibilité de sélectionner la version préférée
- [ ] Indication visuelle de la version sélectionnée
- [ ] Temps de génération < 45 secondes pour les 3 versions

**Dependencies:** FR-004 ou FR-005

---

### FR-007: Édition de Post

**Priority:** Must Have

**Description:**
L'utilisateur peut éditer manuellement le contenu généré par l'IA pour l'ajuster à ses besoins spécifiques.

**Acceptance Criteria:**
- [ ] Éditeur de texte simple et intuitif (textarea enrichi)
- [ ] Sauvegarde automatique des modifications toutes les 30 secondes
- [ ] Compteur de caractères visible
- [ ] Possibilité d'annuler/rétablir (undo/redo)
- [ ] Formatage basique préservé
- [ ] Feedback visuel de sauvegarde ("Enregistré...")

**Dependencies:** FR-004 ou FR-005

---

### FR-008: Prévisualisation de Post

**Priority:** Must Have

**Description:**
L'utilisateur peut prévisualiser le post tel qu'il apparaîtra sur LinkedIn ou Instagram avant publication.

**Acceptance Criteria:**
- [ ] Vue prévisualisation LinkedIn (format professionnel, police système)
- [ ] Vue prévisualisation Instagram (format mobile, style Instagram)
- [ ] Affichage des hashtags formatés correctement
- [ ] Affichage de l'image associée si présente
- [ ] Toggle entre vue édition et vue prévisualisation

**Dependencies:** FR-007

---

### FR-009: Sauvegarde de Brouillons

**Priority:** Must Have

**Description:**
Les posts créés sont sauvegardés automatiquement comme brouillons pour éviter toute perte de données et permettre de reprendre le travail plus tard.

**Acceptance Criteria:**
- [ ] Sauvegarde automatique toutes les 30 secondes
- [ ] Liste des brouillons accessible depuis le dashboard
- [ ] Affichage des métadonnées (date création, plateforme, statut)
- [ ] Possibilité de supprimer des brouillons
- [ ] Statuts clairs: brouillon, planifié, publié
- [ ] Recherche/filtrage des brouillons

**Dependencies:** FR-007

---

### FR-010: Copie Rapide pour Publication Manuelle

**Priority:** Must Have

**Description:**
L'utilisateur peut copier rapidement le contenu dans le presse-papier pour publication manuelle sur LinkedIn ou Instagram, avec formatage préservé.

**Acceptance Criteria:**
- [ ] Bouton "Copier pour LinkedIn" avec icône
- [ ] Bouton "Copier pour Instagram" avec icône
- [ ] Feedback visuel de copie réussie (toast notification "Copié!")
- [ ] Formatage préservé lors de la copie
- [ ] Hashtags inclus pour Instagram
- [ ] Instructions claires pour publication manuelle

**Dependencies:** FR-007

---

### FR-011: Vue Calendrier Mensuel

**Priority:** Should Have

**Description:**
Affichage d'un calendrier mensuel visuel pour visualiser et organiser le contenu planifié sur plusieurs semaines.

**Acceptance Criteria:**
- [ ] Vue calendrier par mois (grille 7x5)
- [ ] Affichage des posts par date avec miniature
- [ ] Navigation entre les mois (flèches précédent/suivant)
- [ ] Indicateurs visuels par plateforme (badge LinkedIn/Instagram)
- [ ] Indicateurs de statut (brouillon, planifié, publié)
- [ ] Responsive (desktop prioritaire)

**Dependencies:** FR-009

---

### FR-012: Planification de Posts

**Priority:** Should Have

**Description:**
L'utilisateur peut assigner une date et une heure de publication à un post pour organiser son calendrier éditorial.

**Acceptance Criteria:**
- [ ] Sélection de date via calendrier (datepicker)
- [ ] Sélection d'heure (timepicker)
- [ ] Confirmation visuelle de la planification
- [ ] Modification de la planification possible
- [ ] Affichage de la date/heure planifiée sur le post
- [ ] Validation si créneau déjà occupé (warning)

**Dependencies:** FR-009

---

### FR-013: Drag & Drop de Posts

**Priority:** Could Have

**Description:**
L'utilisateur peut déplacer des posts par glisser-déposer sur le calendrier pour réorganiser rapidement la planification.

**Acceptance Criteria:**
- [ ] Drag & drop fonctionnel sur desktop
- [ ] Mise à jour automatique de la date lors du drop
- [ ] Feedback visuel pendant le déplacement (ghost element)
- [ ] Confirmation de la nouvelle position (ou undo rapide)
- [ ] Gestion des collisions (plusieurs posts même jour)

**Dependencies:** FR-011, FR-012

---

### FR-014: Création de Templates

**Priority:** Should Have

**Description:**
L'utilisateur peut sauvegarder un post comme template réutilisable pour accélérer la création de contenus récurrents.

**Acceptance Criteria:**
- [ ] Option "Sauvegarder comme template" sur un post
- [ ] Champs: nom du template, description, catégorie
- [ ] Catégorisation des templates (conseil, étude de cas, actualité, témoignage, etc.)
- [ ] Liste des templates accessible depuis menu principal
- [ ] Possibilité d'éditer ou supprimer un template

**Dependencies:** FR-007

---

### FR-015: Utilisation de Templates

**Priority:** Should Have

**Description:**
L'utilisateur peut créer un nouveau post basé sur un template existant pour gagner du temps sur les contenus récurrents.

**Acceptance Criteria:**
- [ ] Sélection d'un template depuis la bibliothèque
- [ ] Pré-remplissage automatique du contenu
- [ ] Possibilité d'éditer le contenu avant sauvegarde
- [ ] Template original non modifié
- [ ] Indication visuelle "Créé depuis template [Nom]"

**Dependencies:** FR-014

---

### FR-016: Bibliothèque de Médias

**Priority:** Should Have

**Description:**
L'utilisateur peut uploader, organiser et réutiliser des images et vidéos pour accompagner les posts.

**Acceptance Criteria:**
- [ ] Upload d'images (PNG, JPG, JPEG, max 10MB)
- [ ] Affichage en grille des médias uploadés
- [ ] Organisation par tags/catégories
- [ ] Recherche d'images par nom ou tag
- [ ] Association facile image-post (drag & drop ou sélection)
- [ ] Prévisualisation avant association
- [ ] Suppression de médias possible

**Dependencies:** Aucune

---

### FR-017: Publication Automatique LinkedIn

**Priority:** Could Have

**Description:**
Le système publie automatiquement sur LinkedIn à la date et heure planifiée, sans intervention manuelle de l'utilisateur.

**Acceptance Criteria:**
- [ ] Connexion OAuth LinkedIn fonctionnelle
- [ ] Publication automatique selon planification (date + heure exacte)
- [ ] Gestion des erreurs avec notification par email
- [ ] Retry automatique en cas d'échec temporaire (3 tentatives)
- [ ] Confirmation de publication réussie (statut mis à jour)
- [ ] Logs de publication accessibles

**Dependencies:** FR-012

---

### FR-018: Publication Automatique Instagram

**Priority:** Could Have

**Description:**
Le système publie automatiquement sur Instagram à la date et heure planifiée (nécessite compte Business Instagram).

**Acceptance Criteria:**
- [ ] Connexion API Instagram (Graph API) fonctionnelle
- [ ] Publication automatique selon planification
- [ ] Gestion des erreurs avec notification
- [ ] Support images obligatoires (Instagram exige une image)
- [ ] Retry automatique en cas d'échec temporaire
- [ ] Confirmation de publication réussie

**Dependencies:** FR-012, FR-016

---

### FR-019: Notation de Posts Générés

**Priority:** Should Have

**Description:**
L'utilisateur peut noter la qualité du contenu généré par IA (1-5 étoiles) pour améliorer progressivement la génération future.

**Acceptance Criteria:**
- [ ] Interface de notation simple (5 étoiles cliquables)
- [ ] Sauvegarde des notes dans la base de données
- [ ] Affichage de la note moyenne par type de contenu
- [ ] Feedback collecté pour amélioration future des prompts IA
- [ ] Option de commentaire textuel (optionnel)

**Dependencies:** FR-004 ou FR-005

---

## Functional Requirements Summary

**Total Functional Requirements:** 19

**By Priority:**
- **Must Have (MVP):** 10 FRs (FR-001 à FR-010)
- **Should Have (Post-MVP):** 7 FRs (FR-006, FR-011, FR-012, FR-014, FR-015, FR-016, FR-019)
- **Could Have (Future):** 3 FRs (FR-013, FR-017, FR-018)

**By Feature Area:**
- Authentification & Utilisateur: 1 FR
- Génération IA: 5 FRs
- Gestion & Édition: 4 FRs
- Calendrier: 3 FRs
- Templates & Médias: 3 FRs
- Publication Auto: 2 FRs
- Feedback: 1 FR

---

## Non-Functional Requirements

Non-Functional Requirements (NFRs) define **how** the system performs - quality attributes and constraints.

---

### NFR-001: Temps de Chargement des Pages

**Priority:** Must Have

**Description:**
Les pages principales de l'application doivent se charger rapidement pour une expérience utilisateur fluide et professionnelle.

**Acceptance Criteria:**
- [ ] Temps de chargement initial < 3 secondes (First Contentful Paint)
- [ ] Temps de chargement complet < 5 secondes sur connexion 4G
- [ ] Navigation entre pages < 1 seconde
- [ ] Score Lighthouse Performance > 80

**Rationale:**
Expérience utilisateur critique pour adoption quotidienne. Un outil lent serait abandonné au profit de la création manuelle.

---

### NFR-002: Temps de Génération IA

**Priority:** Must Have

**Description:**
Les générations de contenu par IA doivent être suffisamment rapides pour ne pas bloquer l'utilisateur et maintenir le workflow fluide.

**Acceptance Criteria:**
- [ ] Génération d'idées (10-15 suggestions) < 30 secondes
- [ ] Génération d'un post < 15 secondes
- [ ] Indication visuelle de progression pendant génération (spinner + pourcentage)
- [ ] Possibilité d'annuler une génération en cours

**Rationale:**
Le workflow "10-to-5 Rule" doit rester sous 30 minutes total. Des générations trop lentes rendraient l'outil inutile.

---

### NFR-003: Sauvegarde Automatique

**Priority:** Must Have

**Description:**
Les modifications doivent être sauvegardées rapidement et automatiquement pour éviter la perte de données en cas de fermeture de navigateur.

**Acceptance Criteria:**
- [ ] Sauvegarde automatique toutes les 30 secondes
- [ ] Temps de sauvegarde < 2 secondes
- [ ] Feedback visuel de sauvegarde ("Enregistré à [heure]")
- [ ] Pas de perte de données en cas de fermeture navigateur

**Rationale:**
Prévenir la perte de travail est critique pour l'adoption. L'utilisateur ne doit jamais perdre de contenu créé.

---

### NFR-004: Authentification Sécurisée

**Priority:** Must Have

**Description:**
Les données d'authentification doivent être protégées selon les standards modernes de sécurité web.

**Acceptance Criteria:**
- [ ] Mots de passe hashés avec bcrypt ou argon2 (salt rounds >= 10)
- [ ] HTTPS obligatoire en production (certificat SSL valide)
- [ ] Sessions avec tokens sécurisés (JWT ou équivalent)
- [ ] Expiration de session après 7 jours d'inactivité
- [ ] Protection CSRF sur les endpoints sensibles

**Rationale:**
Protection des comptes utilisateurs et conformité aux standards web modernes. Données sensibles (posts, stratégie de contenu) doivent être protégées.

---

### NFR-005: Protection des Données Utilisateur

**Priority:** Must Have

**Description:**
Les données des utilisateurs doivent être protégées, isolées et conformes aux réglementations de protection des données.

**Acceptance Criteria:**
- [ ] Isolation des données par utilisateur (row-level security dans la base de données)
- [ ] Pas d'accès cross-utilisateur possible
- [ ] Sauvegardes automatiques quotidiennes de la base de données
- [ ] Conformité RGPD basique: droit à l'oubli (suppression compte), export des données
- [ ] Chiffrement des données sensibles au repos

**Rationale:**
Confidentialité des contenus créés (stratégie de contenu = avantage compétitif) et conformité légale RGPD en Suisse/Europe.

---

### NFR-006: Sécurité des APIs Tierces

**Priority:** Must Have

**Description:**
Les clés API et tokens d'authentification pour les services tiers (IA, LinkedIn, Instagram) doivent être stockés de manière sécurisée.

**Acceptance Criteria:**
- [ ] Clés API en variables d'environnement (non commitées dans le code source)
- [ ] Tokens OAuth chiffrés dans la base de données
- [ ] Rotation des secrets possible sans redéploiement
- [ ] Logs d'accès aux APIs sensibles pour audit
- [ ] Rate limiting pour prévenir abus

**Rationale:**
Protection des accès aux comptes LinkedIn/Instagram des utilisateurs. Fuite de tokens = compromission des comptes sociaux.

---

### NFR-007: Capacité Utilisateur Initiale

**Priority:** Must Have

**Description:**
Le système doit supporter le nombre prévu d'utilisateurs initiaux avec les tiers gratuits des services cloud.

**Acceptance Criteria:**
- [ ] Support de 1-5 utilisateurs actifs simultanés sans dégradation
- [ ] Stockage pour 500+ posts par utilisateur
- [ ] Stockage médias jusqu'à 5GB par utilisateur
- [ ] Base de données capable de gérer 10,000+ enregistrements
- [ ] Tiers gratuits suffisants (Vercel, Supabase, etc.) pour 6 mois d'usage

**Rationale:**
Sami + 3 employés futurs = 4 utilisateurs max. Budget minimal nécessite utilisation de tiers gratuits. 500 posts = 1 an de contenu à 8 posts/semaine.

---

### NFR-008: Limites de Génération IA

**Priority:** Should Have

**Description:**
Le système doit gérer les quotas et limites des APIs IA pour contrôler les coûts et rester dans le budget minimal.

**Acceptance Criteria:**
- [ ] Limite de 100 sessions de génération d'idées par mois par utilisateur
- [ ] Limite de 200 générations de posts par mois par utilisateur
- [ ] Affichage du quota restant visible pour l'utilisateur
- [ ] Message clair et actionnable si quota atteint
- [ ] Possibilité d'augmenter le quota (upgrade futur)

**Rationale:**
Contrainte budget minimal, maîtrise des coûts APIs IA. 100 sessions d'idées + 200 posts = largement suffisant pour 8 posts/semaine (32/mois).

---

### NFR-009: Disponibilité du Service

**Priority:** Must Have

**Description:**
L'application doit être accessible de manière fiable pour un usage quotidien/hebdomadaire sans interruption majeure.

**Acceptance Criteria:**
- [ ] Uptime > 99% (maximum 7 heures de downtime par mois)
- [ ] Hébergement sur plateforme fiable (Vercel/Netlify avec SLA)
- [ ] Monitoring de base (uptime checks toutes les 5 minutes)
- [ ] Page de statut accessible si service indisponible
- [ ] Notifications automatiques si service down > 10 minutes

**Rationale:**
Outil de travail quotidien/hebdomadaire. Indisponibilité = blocage de la création de contenu = objectif de régularité non atteint.

---

### NFR-010: Gestion des Erreurs

**Priority:** Must Have

**Description:**
Les erreurs doivent être gérées gracieusement sans bloquer l'utilisateur, avec des messages clairs et actionnables.

**Acceptance Criteria:**
- [ ] Messages d'erreur clairs et en français (pas de stack traces techniques)
- [ ] Retry automatique pour erreurs temporaires (3 tentatives avec backoff exponentiel)
- [ ] Fallback manuel si publication auto échoue (export ou copie manuelle)
- [ ] Logs d'erreurs côté serveur pour debugging
- [ ] Erreurs non bloquantes quand possible (dégradation gracieuse)

**Rationale:**
Critère "Zero Error Tolerance" du Product Brief. Utilisateur débutant = besoin de messages clairs, pas de jargon technique.

---

### NFR-011: Fiabilité de Publication

**Priority:** Should Have (si feature publication auto implémentée)

**Description:**
La publication automatique doit être hautement fiable pour garantir la régularité de la présence sur les réseaux sociaux.

**Acceptance Criteria:**
- [ ] Taux de réussite > 98% des publications planifiées
- [ ] Notification par email si publication échoue (avec raison)
- [ ] Retry automatique toutes les heures pendant 24h si échec
- [ ] Export manuel possible en dernier recours
- [ ] Dashboard de suivi des publications (réussies, échouées, en attente)

**Rationale:**
Feature critique si implémentée. Publication manquée = trou dans le calendrier éditorial = impact direct sur les objectifs business (8 posts/semaine).

---

### NFR-012: Interface Responsive

**Priority:** Must Have

**Description:**
L'application doit être utilisable sur différentes tailles d'écran, avec une expérience optimale sur desktop et acceptable sur mobile.

**Acceptance Criteria:**
- [ ] Desktop (1920x1080 à 1280x720): expérience optimale, toutes les features accessibles
- [ ] Tablet (768px+): utilisable, layout adapté, features principales accessibles
- [ ] Mobile (375px+): lecture et édition basique possibles
- [ ] Navigation mobile simplifiée (menu hamburger)
- [ ] Tests sur Chrome, Firefox, Safari (mobile et desktop)

**Rationale:**
Desktop prioritaire (travail de bureau) mais mobilité occasionnelle utile (consulter brouillons, éditions rapides en déplacement).

---

### NFR-013: Accessibilité

**Priority:** Should Have

**Description:**
L'application doit respecter les principes d'accessibilité de base pour être utilisable par le plus grand nombre.

**Acceptance Criteria:**
- [ ] Contraste texte/fond suffisant (WCAG AA minimum, ratio 4.5:1)
- [ ] Navigation au clavier possible (tab, enter, espace)
- [ ] Labels clairs et explicites sur tous les formulaires
- [ ] Support des lecteurs d'écran pour actions principales (aria-labels)
- [ ] Taille de police lisible (minimum 14px corps de texte)

**Rationale:**
Bonne pratique web moderne. Élargit l'adoption future et améliore l'expérience pour tous les utilisateurs.

---

### NFR-014: Courbe d'Apprentissage

**Priority:** Must Have

**Description:**
L'interface doit être intuitive pour un utilisateur débutant, avec une prise en main rapide et sans formation nécessaire.

**Acceptance Criteria:**
- [ ] Workflow principal (générer idées → créer posts → planifier) compréhensible sans documentation
- [ ] Tooltips et aide contextuelle sur actions complexes
- [ ] Onboarding interactif lors de la première connexion (< 2 minutes, skippable)
- [ ] Interface en français (langue maternelle de l'utilisateur principal)
- [ ] Terminologie claire et non technique

**Rationale:**
Utilisateur principal débutant en création de contenu et débutant technique. Adoption critique = interface doit être évidente.

---

### NFR-015: Qualité du Code

**Priority:** Should Have

**Description:**
Le code doit être maintenable malgré les compétences débutantes du développeur, pour faciliter évolution et correction de bugs.

**Acceptance Criteria:**
- [ ] Code TypeScript avec typage strict activé
- [ ] Composants React réutilisables et modulaires
- [ ] Structure de dossiers claire et logique (feature-based ou layer-based)
- [ ] Code généré par IA validé et testé avant commit
- [ ] ESLint/Prettier configurés pour cohérence

**Rationale:**
Maintenance future, ajout de fonctionnalités, correction de bugs. Développeur solo = besoin de code organisé pour s'y retrouver après plusieurs semaines.

---

### NFR-016: Documentation Technique

**Priority:** Should Have

**Description:**
Documentation minimale mais suffisante pour faciliter la maintenance, le debugging et l'onboarding d'employés futurs.

**Acceptance Criteria:**
- [ ] README avec instructions de setup (npm install, env variables, npm run dev)
- [ ] Variables d'environnement documentées (.env.example)
- [ ] Architecture globale décrite (1-2 pages: stack, composants principaux, flux de données)
- [ ] Commentaires dans le code pour logique complexe uniquement
- [ ] Guide de déploiement (Vercel)

**Rationale:**
Faciliter reprise du projet après pause (développement par itérations). Onboarding des 3 employés futurs.

---

### NFR-017: Support Navigateurs

**Priority:** Must Have

**Description:**
L'application doit fonctionner correctement sur les navigateurs modernes les plus utilisés.

**Acceptance Criteria:**
- [ ] Chrome/Edge (dernières 2 versions): support complet et tests réguliers
- [ ] Firefox (dernières 2 versions): support complet
- [ ] Safari (dernières 2 versions): support complet
- [ ] Détection et message si navigateur non supporté (IE, anciens navigateurs)
- [ ] Pas de support requis pour navigateurs obsolètes

**Rationale:**
Compatibilité maximale sans effort excessif. 95%+ des utilisateurs utilisent ces navigateurs modernes.

---

### NFR-018: APIs Externes

**Priority:** Must Have

**Description:**
L'intégration avec les APIs tierces doit respecter leurs standards, limites et bonnes pratiques.

**Acceptance Criteria:**
- [ ] Utilisation des APIs officielles (OpenAI/Claude, LinkedIn API, Instagram Graph API)
- [ ] Gestion des rate limits (respect des quotas, attente si limite atteinte)
- [ ] Versioning des APIs documenté (quelle version utilisée)
- [ ] Fallback si API indisponible (message clair à l'utilisateur + possibilité de retry)
- [ ] Timeout sur les appels API (30 secondes max)

**Rationale:**
Fonctionnalités core dépendantes d'APIs tierces. Mauvaise gestion = app inutilisable ou suspension de compte API.

---

## Non-Functional Requirements Summary

**Total Non-Functional Requirements:** 18

**By Priority:**
- **Must Have (MVP):** 13 NFRs (NFR-001 à NFR-010, NFR-012, NFR-014, NFR-017, NFR-018)
- **Should Have (Post-MVP):** 5 NFRs (NFR-008, NFR-011, NFR-013, NFR-015, NFR-016)

**By Category:**
- Performance: 3 NFRs
- Sécurité: 3 NFRs
- Scalabilité: 2 NFRs
- Fiabilité & Disponibilité: 3 NFRs
- Utilisabilité: 3 NFRs
- Maintenabilité: 2 NFRs
- Compatibilité: 2 NFRs

---

## Epics

Epics are logical groupings of related functionality that will be broken down into user stories during sprint planning (Phase 4).

Each epic maps to multiple functional requirements and will generate 2-10 stories.

---

### EPIC-001: Authentification & Gestion Utilisateur

**Description:**
Permettre aux utilisateurs de créer un compte, se connecter de manière sécurisée et gérer leur profil. Cette epic établit la base pour l'accès personnalisé à l'application et l'isolation des données utilisateur.

**Functional Requirements:**
- FR-001: Authentification Email/Mot de passe

**Non-Functional Requirements:**
- NFR-004: Authentification Sécurisée
- NFR-005: Protection des Données Utilisateur

**Story Count Estimate:** 3-5 stories

**Priority:** Must Have (MVP - Phase 1)

**Business Value:**
Sécurise l'accès à l'application et permet la gestion multi-utilisateurs future (Sami + 3 employés). Fondation nécessaire pour toutes les autres fonctionnalités. Isolation des données = chaque utilisateur a son propre espace de travail.

**Success Criteria:**
- Utilisateur peut créer un compte en < 2 minutes
- Authentification sécurisée selon standards modernes
- Données utilisateurs isolées et protégées

---

### EPIC-002: Génération de Contenu par IA

**Description:**
Cœur de l'application - génération intelligente d'idées de contenu et création automatique de posts optimisés pour LinkedIn et Instagram. Cette epic transforme le processus de création de contenu de plusieurs heures en quelques minutes.

**Functional Requirements:**
- FR-002: Génération d'Idées de Contenu par IA
- FR-003: Sélection d'Idées
- FR-004: Génération de Post LinkedIn
- FR-005: Génération de Caption Instagram
- FR-006: Génération Multiple (3 versions)
- FR-019: Notation de Posts Générés

**Non-Functional Requirements:**
- NFR-002: Temps de Génération IA
- NFR-006: Sécurité des APIs Tierces
- NFR-008: Limites de Génération IA
- NFR-018: APIs Externes

**Story Count Estimate:** 8-10 stories

**Priority:** Must Have (MVP - Phase 1)

**Business Value:**
**Valeur principale du produit** - permet d'atteindre l'objectif de 70-80% de temps économisé (de 5-6h à 1-1.5h par semaine). Génère des idées contextualisées au secteur tech et à la Suisse romande, et du contenu de qualité professionnelle avec intervention humaine minimale. Implémente le workflow critique "10-to-5 Rule" (10-15 idées → 5-6 sélectionnées → posts générés en < 30 min).

**Success Criteria:**
- Qualité du contenu: 80% utilisable avec < 20% d'édition (règle 80/20)
- Pertinence des idées: 40-60% des idées générées sont sélectionnées
- Performance: workflow complet < 30 minutes pour 8 posts
- Satisfaction: note moyenne > 4/5 sur la qualité des posts générés

---

### EPIC-003: Gestion & Édition de Contenu

**Description:**
Outils pour éditer, prévisualiser, sauvegarder et exporter le contenu généré. Cette epic donne le contrôle final à l'utilisateur sur le contenu avant publication, assurant la qualité et l'alignement avec la marque IntegrIA.

**Functional Requirements:**
- FR-007: Édition de Post
- FR-008: Prévisualisation de Post
- FR-009: Sauvegarde de Brouillons
- FR-010: Copie Rapide pour Publication Manuelle

**Non-Functional Requirements:**
- NFR-003: Sauvegarde Automatique
- NFR-010: Gestion des Erreurs
- NFR-014: Courbe d'Apprentissage

**Story Count Estimate:** 5-7 stories

**Priority:** Must Have (MVP - Phase 1)

**Business Value:**
Assure la qualité du contenu (règle "80/20" - maximum 20% d'édition nécessaire). Prévient la perte de travail grâce à la sauvegarde automatique. Permet une publication manuelle efficace en attendant l'automatisation (Phase 2). **Critical pour l'adoption utilisateur** - sans édition fluide, l'outil serait frustrant à utiliser.

**Success Criteria:**
- Édition intuitive, pas de formation nécessaire
- Zero perte de données (sauvegarde auto)
- Copie manuelle fonctionnelle pour publication (fallback avant publication auto)
- Prévisualisation fidèle au rendu final sur les plateformes

---

### EPIC-004: Calendrier Éditorial

**Description:**
Système de planification visuelle permettant d'organiser le contenu à moyen et long terme (1-3 mois). Cette epic aide à maintenir une stratégie de contenu cohérente et régulière.

**Functional Requirements:**
- FR-011: Vue Calendrier Mensuel
- FR-012: Planification de Posts
- FR-013: Drag & Drop de Posts

**Non-Functional Requirements:**
- NFR-001: Temps de Chargement des Pages
- NFR-012: Interface Responsive

**Story Count Estimate:** 4-6 stories

**Priority:** Should Have (Post-MVP - Itération 1, Mars 2026)

**Business Value:**
Permet d'atteindre l'objectif de **8 posts/semaine** de manière organisée et anticipée. Facilite la vision stratégique du contenu sur plusieurs semaines. Support pour planification 4 semaines en avance comme mentionné dans le Product Brief (batch de 4 semaines en 2h). Régularité = clé de la croissance d'audience.

**Success Criteria:**
- Vision claire du contenu planifié sur 4 semaines minimum
- Réorganisation rapide par drag & drop
- Identification visuelle immédiate des "trous" dans le calendrier

---

### EPIC-005: Templates & Bibliothèque Médias

**Description:**
Système de templates réutilisables et bibliothèque centralisée pour gérer les assets visuels (images, vidéos). Cette epic accélère la création de contenu récurrent et maintient la cohérence visuelle de la marque.

**Functional Requirements:**
- FR-014: Création de Templates
- FR-015: Utilisation de Templates
- FR-016: Bibliothèque de Médias

**Non-Functional Requirements:**
- NFR-007: Capacité Utilisateur Initiale (stockage médias 5GB)

**Story Count Estimate:** 4-6 stories

**Priority:** Should Have (Post-MVP - Itération 2, Avril 2026)

**Business Value:**
**Gain de temps supplémentaire** sur contenus récurrents (conseils hebdomadaires, formats standards comme "Conseil du lundi", "Tech du vendredi"). Cohérence de marque IntegrIA à travers tous les posts (même structure, même ton). Réutilisation des assets visuels existants sans devoir les rechercher à chaque fois.

**Success Criteria:**
- Bibliothèque de 5-10 templates réutilisables après 2 mois
- Médias organisés et facilement retrouvables
- Création de post depuis template en < 5 minutes

---

### EPIC-006: Publication Automatique

**Description:**
Automatisation complète de la publication sur LinkedIn et Instagram selon la planification définie. Cette epic élimine l'étape manuelle de publication et garantit la régularité parfaite des posts.

**Functional Requirements:**
- FR-017: Publication Automatique LinkedIn
- FR-018: Publication Automatique Instagram

**Non-Functional Requirements:**
- NFR-011: Fiabilité de Publication

**Story Count Estimate:** 6-8 stories

**Priority:** Could Have (Post-MVP - Itération 3, Mai 2026)

**Business Value:**
Complète l'automatisation du workflow (passe de 60-70% de gain de temps à **80-90%**). Assure la **régularité parfaite** des publications (posts publiés à l'heure exacte planifiée, même si Sami est occupé ou en déplacement). Élimine le risque d'oubli de publication. **ATTENTION:** Complexité technique élevée identifiée comme risque majeur dans le Product Brief (RISQUE 2).

**Success Criteria:**
- Taux de réussite > 98% des publications planifiées
- Zero intervention manuelle nécessaire
- Notifications claires si échec avec fallback manuel

**Risk Mitigation:**
- PoC préalable avant intégration complète
- LinkedIn d'abord (API plus simple), Instagram ensuite
- Plan de contingence: maintenir export manuel fonctionnel

---

## Epics Summary

**Total Epics:** 6

| Epic ID | Epic Name | Priority | Phase | FRs | NFRs | Story Est. |
|---------|-----------|----------|-------|-----|------|------------|
| EPIC-001 | Authentification & Gestion Utilisateur | Must Have | MVP | 1 | 2 | 3-5 |
| EPIC-002 | Génération de Contenu par IA | Must Have | MVP | 6 | 4 | 8-10 |
| EPIC-003 | Gestion & Édition de Contenu | Must Have | MVP | 4 | 3 | 5-7 |
| EPIC-004 | Calendrier Éditorial | Should Have | v1.1 | 3 | 2 | 4-6 |
| EPIC-005 | Templates & Bibliothèque Médias | Should Have | v1.2 | 3 | 1 | 4-6 |
| EPIC-006 | Publication Automatique | Could Have | v2 | 2 | 1 | 6-8 |

**Total Story Estimate:** 30-42 stories

**MVP Epics (Phase 1):** 3 epics → 16-22 stories
**Post-MVP Epics:** 3 epics → 14-20 stories

---

## User Stories (High-Level)

User stories follow the format: "As a [user type], I want [goal] so that [benefit]."

These are preliminary high-level stories to illustrate the user perspective. **Detailed user stories will be created in Phase 4 (Sprint Planning)** using the `/sprint-planning` workflow, where each epic will be broken down into 2-10 actionable stories with acceptance criteria, story points, and technical tasks.

### High-Level Stories by Epic

**EPIC-001: Authentification**
- As a new user, I want to create an account so that I can access the application securely
- As a returning user, I want to log in quickly so that I can start creating content
- As a user, I want my data to be secure so that my content strategy remains confidential

**EPIC-002: Génération IA**
- As a content creator, I want to generate 10-15 relevant content ideas so that I never run out of inspiration
- As a content creator, I want to generate LinkedIn posts automatically so that I save time on writing
- As a content creator, I want to generate Instagram captions with hashtags so that my posts are optimized
- As a content creator, I want to rate generated content so that the AI improves over time

**EPIC-003: Gestion de Contenu**
- As a user, I want to edit AI-generated content easily so that I can adjust it to my voice
- As a user, I want to preview posts before publishing so that I can ensure quality
- As a user, I want my work saved automatically so that I never lose content
- As a user, I want to copy content quickly for manual publishing so that I can post immediately

**EPIC-004: Calendrier**
- As a content strategist, I want to see my content on a calendar so that I can visualize my publishing schedule
- As a content strategist, I want to plan posts in advance so that I maintain consistency
- As a content strategist, I want to reorganize my calendar easily so that I can adapt to changes

**EPIC-005: Templates & Médias**
- As a content creator, I want to save successful posts as templates so that I can reuse proven formats
- As a content creator, I want to organize my images so that I can quickly find the right visual
- As a content creator, I want to create posts from templates so that I speed up recurring content

**EPIC-006: Publication Auto**
- As a busy entrepreneur, I want posts to publish automatically so that I don't have to remember to do it manually
- As a user, I want to be notified if publication fails so that I can take manual action

---

## User Personas

### Persona 1: Sami - Fondateur/CEO IntegrIA

**Demographics:**
- Rôle: Fondateur et CEO d'IntegrIA
- Localisation: Suisse romande
- Entreprise: IntegrIA (accompagnement tech pour entrepreneurs)
- Phase: Lancement d'activité

**Profil Utilisateur:**
- **Niveau technique:** Débutant en développement, en apprentissage de la création de contenu via IA
- **Niveau création de contenu:** Débutant, découverte des outils digitaux
- **Fréquence d'usage prévue:** Quotidien à hebdomadaire (1-2 sessions par semaine)
- **Environnement:** Desktop (bureau), occasionnellement mobile

**Responsabilités:**
- Créateur unique de contenu actuellement
- Responsable de tout le processus: idéation, création visuelle, rédaction, publication
- Gestion de tous les aspects de l'entreprise (pas de temps pour marketing)

**Besoins Principaux:**
1. **Gagner du temps** - Réduire drastiquement le temps de création de contenu de 5-8h à < 2h par semaine
2. **Avoir des idées pertinentes** - Accéder à un flux constant d'idées adaptées au secteur tech et à la Suisse romande
3. **Créer du contenu de qualité** - Produire des posts professionnels alignés avec IntegrIA sans être expert en copywriting
4. **Maintenir la régularité** - Publier 8 posts/semaine de manière constante pour atteindre les objectifs business

**Pain Points:**
- Manque de temps critique (entrepreneur solo)
- Difficulté à générer des idées fraîches régulièrement
- Pas d'expertise en création de contenu ou copywriting
- Risque d'incohérence dans le ton et le message
- Pression de résultats (visibilité = acquisition clients = survie de l'entreprise)

**Goals & Motivations:**
- Lancer IntegrIA avec succès en Suisse romande
- Acquérir 5 leads qualifiés/mois via le contenu digital
- Démontrer son expertise tech par l'exemple (utiliser les bons outils)
- Construire une présence digitale crédible rapidement

**Comportement Attendu:**
- Utilisation en batch: créer 4 semaines de contenu en une session de 2h
- Édition minimale du contenu généré (< 20%)
- Publication manuelle initialement, puis automatique quand disponible
- Feedback actif pour améliorer la qualité IA

**Quote:**
> "Je vends du gain de temps aux entrepreneurs, mais je n'ai pas le temps de créer mon propre contenu. J'ai besoin d'un outil qui fait le gros du travail pour moi."

---

### Persona 2: Employés Futurs (3 personnes) - Contributeurs de Contenu

**Demographics:**
- Rôle: Community managers / Assistants marketing (à recruter)
- Nombre: 3 personnes
- Timeframe: 6-12 mois après lancement

**Profil Utilisateur:**
- **Niveau technique:** Variable (débutant à intermédiaire)
- **Niveau création de contenu:** Intermédiaire (expérience en social media)
- **Fréquence d'usage prévue:** Hebdomadaire
- **Environnement:** Desktop et mobile

**Responsabilités:**
- Contribuer à la création de contenu en support de Sami
- Gérer les interactions sur les réseaux sociaux
- Suivre les performances et ajuster la stratégie

**Besoins Principaux:**
1. **Outil facile à utiliser** - Interface intuitive nécessitant peu de formation
2. **Collaboration efficace** - Travailler avec Sami sans friction
3. **Autonomie** - Créer du contenu sans validation constante

**Pain Points:**
- Courbe d'apprentissage d'un nouvel outil
- Besoin de comprendre la voix de la marque IntegrIA
- Coordination avec Sami (CEO occupé)

**Goals & Motivations:**
- Contribuer au succès d'IntegrIA
- Développer leurs compétences en content marketing
- Travailler efficacement avec des outils modernes

**Comportement Attendu:**
- Utilisation régulière pour création et planification
- Utilisation des templates pour cohérence
- Collaboration via le calendrier partagé

---

## User Flows

### User Flow 1: Création de Contenu Hebdomadaire (Workflow Principal)

**Persona:** Sami
**Fréquence:** Hebdomadaire
**Durée cible:** < 30 minutes
**Objectif:** Créer et planifier 8 posts (2 LinkedIn + 2 Instagram, répété 2 fois par semaine)

**Steps:**

1. **Login**
   - Utilisateur se connecte à l'application
   - Redirection vers Dashboard

2. **Génération d'Idées**
   - Clic sur "Générer des idées"
   - IA génère 10-15 idées contextualisées (secteur tech, Suisse romande, tendances actuelles)
   - Affichage des idées avec descriptions courtes
   - [Temps: 30 secondes]

3. **Sélection d'Idées**
   - Utilisateur parcourt les suggestions
   - Sélection de 5-6 idées pertinentes (checkboxes)
   - Clic sur "Créer les posts"
   - [Temps: 3-5 minutes]

4. **Génération de Posts**
   - IA génère automatiquement:
     - 1 post LinkedIn par idée
     - 1 caption Instagram par idée
   - Affichage progressif des posts générés
   - [Temps: 1-2 minutes pour 6 posts]

5. **Revue et Édition**
   - Pour chaque post:
     - Lecture rapide du contenu
     - Édition mineure si nécessaire (< 20% du texte)
     - Prévisualisation du rendu final
     - Notation de la qualité (étoiles)
   - [Temps: 10-15 minutes pour 6 posts]

6. **Planification (si calendrier disponible)**
   - Glisser-déposer les posts sur le calendrier
   - Assignation de dates/heures
   - [Temps: 3-5 minutes]

7. **Publication**
   - **MVP (Phase 1):** Copie manuelle pour publication
     - Clic "Copier pour LinkedIn" pour chaque post LinkedIn
     - Clic "Copier pour Instagram" pour chaque caption Instagram
     - Publication manuelle sur les plateformes
   - **Post-MVP (Phase 2):** Publication automatique selon planification
   - [Temps: 5-10 minutes en manuel, 0 en auto]

**Success Criteria:**
- Workflow complet en < 30 minutes
- Minimum 5 posts créés et prêts à publier
- Qualité perçue: > 4/5 étoiles
- Utilisateur satisfait et prêt à répéter hebdomadairement

---

### User Flow 2: Planification de Contenu Mensuel (Batch)

**Persona:** Sami
**Fréquence:** Mensuelle
**Durée cible:** 2 heures
**Objectif:** Planifier 4 semaines de contenu (32 posts) en une session

**Steps:**

1. **Login & Préparation**
   - Connexion à l'application
   - Navigation vers générateur d'idées
   - [Temps: 1 minute]

2. **Génération d'Idées en Batch**
   - Génération d'idées multiple (3-4 sessions)
   - Sélection de 16 idées au total (pour 32 posts = 16 LinkedIn + 16 Instagram)
   - [Temps: 20-30 minutes]

3. **Génération de Posts en Batch**
   - IA génère les 32 posts (16 LinkedIn + 16 Instagram)
   - [Temps: 5-10 minutes]

4. **Revue et Édition Rapide**
   - Revue rapide de tous les posts
   - Édition des posts nécessitant ajustements
   - Notation pour feedback IA
   - [Temps: 60-70 minutes]

5. **Planification sur Calendrier**
   - Vue calendrier mensuel
   - Répartition des posts sur 4 semaines
   - 2 LinkedIn + 2 Instagram par semaine, répartis sur plusieurs jours
   - Drag & drop pour optimiser la distribution
   - [Temps: 15-20 minutes]

6. **Validation Finale**
   - Vérification de la cohérence globale
   - Ajustements si nécessaire
   - Sauvegarde automatique
   - [Temps: 5-10 minutes]

**Success Criteria:**
- 4 semaines de contenu planifiées en 2h maximum
- Calendrier équilibré et cohérent
- Contenu de qualité homogène
- Utilisateur confiant pour les 4 semaines à venir

---

### User Flow 3: Utilisation de Template pour Contenu Récurrent

**Persona:** Sami
**Fréquence:** Hebdomadaire
**Durée cible:** < 10 minutes
**Objectif:** Créer un post récurrent (ex: "Conseil du lundi") à partir d'un template

**Steps:**

1. **Navigation vers Templates**
   - Clic sur "Bibliothèque de Templates"
   - Sélection du template "Conseil du lundi"

2. **Création depuis Template**
   - Template pré-remplit le contenu
   - Utilisateur modifie les sections variables (le conseil spécifique)
   - L'IA peut suggérer des variations

3. **Association de Média**
   - Sélection d'une image depuis la bibliothèque
   - Ou upload d'une nouvelle image

4. **Prévisualisation et Ajustements**
   - Vérification du rendu final
   - Ajustements mineurs si nécessaire

5. **Planification ou Publication**
   - Assignation de date/heure
   - Ou copie pour publication immédiate

**Success Criteria:**
- Création en < 10 minutes
- Cohérence avec les posts précédents du même type
- Économie de temps significative vs création from scratch

---

## Dependencies

### Internal Dependencies

**Aucune dépendance interne identifiée pour le MVP.**

Ce projet est une nouvelle application standalone. Il n'y a pas d'intégration avec d'autres systèmes internes IntegrIA existants car l'entreprise est en phase de lancement.

**Dépendances internes futures (post-lancement IntegrIA):**
- CRM futur (pour tracker leads générés via les posts)
- Site web IntegrIA (liens vers articles de blog depuis les posts)

---

### External Dependencies

1. **API d'Intelligence Artificielle**
   - **Services considérés:** OpenAI GPT-4, Anthropic Claude, Google Gemini Pro
   - **Usage:** Génération d'idées de contenu et création de posts
   - **Criticité:** **CRITIQUE** - Core feature, application inutilisable sans IA
   - **Risque:** Changements de pricing, rate limits, qualité insuffisante
   - **Mitigation:** Tests préalables pour valider la qualité, monitoring des quotas, budget alloué

2. **LinkedIn API**
   - **Service:** LinkedIn Marketing API / LinkedIn Share API
   - **Usage:** Publication automatique de posts sur LinkedIn
   - **Criticité:** MOYENNE - Feature Could Have (Phase 2), fallback manuel disponible
   - **Risque:** Complexité technique, changements d'API, restrictions
   - **Mitigation:** PoC avant intégration complète, documentation officielle, fallback export manuel

3. **Instagram Graph API**
   - **Service:** Facebook/Meta Instagram Graph API
   - **Usage:** Publication automatique de posts sur Instagram
   - **Criticité:** MOYENNE - Feature Could Have (Phase 2), fallback manuel disponible
   - **Risque:** Compte Business requis, complexité OAuth, changements d'API
   - **Mitigation:** Tests préalables, compte Business Instagram configuré, fallback export manuel

4. **Hébergement & Infrastructure**
   - **Services:** Vercel (frontend) ou Netlify
   - **Usage:** Déploiement et hébergement de l'application
   - **Criticité:** **CRITIQUE** - Application doit être accessible
   - **Risque:** Downtime, limitations tier gratuit
   - **Mitigation:** Plateforme fiable avec SLA, monitoring uptime, plan de scalabilité

5. **Base de Données**
   - **Services:** Supabase ou Firebase
   - **Usage:** Stockage des utilisateurs, posts, brouillons, médias
   - **Criticité:** **CRITIQUE** - Données de l'application
   - **Risque:** Limitations tier gratuit, perte de données
   - **Mitigation:** Sauvegardes automatiques quotidiennes, monitoring des quotas

6. **Authentification**
   - **Services:** Supabase Auth ou Firebase Auth
   - **Usage:** Gestion des utilisateurs et sessions
   - **Criticité:** **CRITIQUE** - Sécurité de l'application
   - **Risque:** Faille de sécurité, changements d'API
   - **Mitigation:** Utilisation des SDKs officiels, bonnes pratiques de sécurité

7. **Stockage de Médias**
   - **Services:** Supabase Storage, Firebase Storage, ou Cloudinary
   - **Usage:** Stockage des images et vidéos uploadées
   - **Criticité:** MOYENNE - Feature Should Have
   - **Risque:** Limitations de stockage (5GB), coûts si dépassement
   - **Mitigation:** Compression d'images, limitations d'upload, monitoring de l'usage

---

## Assumptions

### Hypothèses Techniques

1. **Qualité du Code Généré par IA**
   - **Hypothèse:** Claude Code, GPT-4 et autres outils d'IA peuvent générer du code de qualité production avec supervision humaine minimale
   - **Impact si fausse:** Code instable, bugs fréquents, besoin de refactoring majeur, retards significatifs
   - **Validation:** Tests continus, code review IA, prototypage rapide des features critiques

2. **Accessibilité et Stabilité des APIs**
   - **Hypothèse:** Les APIs Instagram et LinkedIn resteront accessibles, stables et gratuites/abordables pour un usage initial faible (< 100 posts/mois)
   - **Impact si fausse:** Impossibilité de publier automatiquement, feature de publication auto bloquée
   - **Validation:** Recherche documentation officielle, tests des APIs en phase de prototypage, PoC avant intégration complète

3. **Suffisance des Tiers Gratuits**
   - **Hypothèse:** Les tiers gratuits (Vercel, OpenAI, Supabase) suffiront pour les 6 premiers mois avec usage limité (4 utilisateurs, < 50 posts/mois)
   - **Impact si fausse:** Surcoûts imprévus, blocage de service, nécessité d'upgrade payant
   - **Validation:** Monitoring mensuel de l'usage, alertes sur quotas, documentation des limites

4. **Compatibilité de la Stack Technologique**
   - **Hypothèse:** React + TypeScript + Tailwind CSS est une stack adaptée et suffisante pour construire toutes les fonctionnalités requises
   - **Impact si fausse:** Besoin de changer de stack en cours de route, perte de temps considérable
   - **Validation:** Proof of concepts pour chaque feature critique, validation architecture avant développement

---

### Hypothèses Produit

5. **Qualité du Contenu Généré par IA**
   - **Hypothèse:** Les modèles d'IA (GPT-4, Claude) peuvent générer du contenu de qualité suffisante pour publication avec édition minimale (< 20% de modifications)
   - **Impact si fausse:** **CRITIQUE** - Outil inutile, perte de temps vs création manuelle, abandon du projet
   - **Validation:** Tests intensifs avec prompts optimisés, comparaison avec contenu manuel, ajustements itératifs
   - **Note:** C'est le RISQUE #1 identifié dans le Product Brief

6. **Pertinence des Idées IA**
   - **Hypothèse:** L'IA peut suggérer des idées pertinentes et alignées avec le positionnement IntegrIA et les besoins des entrepreneurs en Suisse romande
   - **Impact si fausse:** Idées génériques non pertinentes, nécessitant brainstorming manuel complet, perte de valeur
   - **Validation:** Prompts hyper-détaillés avec contexte complet (IntegrIA, Suisse romande, secteur tech), feedback itératif, tests avec Sami

7. **Adoption Utilisateur (Sami)**
   - **Hypothèse:** Sami adoptera l'outil dans son workflow hebdomadaire et l'utilisera de manière continue (pas d'abandon après 2-3 semaines)
   - **Impact si fausse:** **CRITIQUE** - Outil créé mais non utilisé, échec complet du projet
   - **Validation:** UX simple et intuitive, onboarding fluide, valeur immédiate perçue dès la première utilisation, feedback continu

---

### Hypothèses Business

8. **Efficacité du Contenu pour Génération de Leads**
   - **Hypothèse:** Publier 8 posts/semaine de qualité sur LinkedIn et Instagram générera de l'engagement et des leads qualifiés en Suisse romande
   - **Impact si fausse:** Effort sans retour, démotivation, remise en question de la stratégie marketing
   - **Validation:** Analytics après 1 mois, ajustement de la stratégie de contenu basé sur les performances, tests A/B

9. **Timeline Agressive Réalisable**
   - **Hypothèse:** Un MVP fonctionnel et utilisable peut être développé en 5-6 semaines avec 10-15h/semaine par un développeur débutant assisté par IA
   - **Impact si fausse:** Retards importants, frustration, burnout, retard sur le lancement d'IntegrIA
   - **Validation:** Découpage strict en milestones, réduction de scope aggressive si nécessaire, buffer time prévu

10. **Connexion Internet Stable**
    - **Hypothèse:** L'utilisateur aura toujours accès à internet pour utiliser l'outil (web-based, pas de mode offline)
    - **Impact si fausse:** Impossibilité d'utiliser l'outil en déplacement ou avec connexion instable
    - **Validation:** Mode offline simple (brouillons locaux) en v2 si besoin identifié après usage réel

11. **Modèle Bootstrap Sans Financement Externe**
    - **Hypothèse:** Le projet peut être réalisé avec budget minimal (< 100€/mois) sans financement externe
    - **Impact si fausse:** Besoin de lever des fonds ou d'arrêter le développement
    - **Validation:** Utilisation exclusive de tiers gratuits initialement, monitoring strict des coûts

---

## Out of Scope

Fonctionnalités explicitement **exclues du MVP (Version 1)** et des prochaines itérations à court terme:

### Plateformes Non Supportées

- ❌ **YouTube** (prévu pour v2/v3 post-MVP)
- ❌ **Facebook** (hors scope court/moyen terme)
- ❌ **TikTok** (hors scope court/moyen terme)
- ❌ **Twitter/X** (hors scope court/moyen terme)
- ❌ **Pinterest** (hors scope court/moyen terme)
- ❌ **Application mobile native** iOS/Android (web responsive uniquement)

---

### Fonctionnalités Collaboration & Workflow

- ❌ **Workflow d'approbation multi-niveaux** (brouillon → révision → validation)
- ❌ **Gestion multi-utilisateurs avec rôles et permissions** (admin, éditeur, viewer)
- ❌ **Système de commentaires et feedback collaboratif** sur les posts
- ❌ **Historique de versions et comparaison** (qui a modifié quoi et quand)
- ❌ **Notifications internes** (notifications à l'équipe sur actions)

---

### Analytics & Reporting Avancés

- ❌ **Tableaux de bord analytics détaillés** (impressions, reach, engagement détaillé)
- ❌ **Tracking des performances par post** (clics, conversions, ROI)
- ❌ **Rapports automatiques hebdomadaires/mensuels** (PDF exports)
- ❌ **Recommandations basées sur les performances** (IA suggère meilleurs horaires, types de posts)
- ❌ **Comparaison de performances** (posts A vs posts B)
- ❌ **Attribution de leads** (quel post a généré quel lead)

---

### Fonctionnalités Avancées IA & Médias

- ❌ **Génération de vidéos par IA** (scripts, montage automatique)
- ❌ **Génération d'images/visuels par IA** (DALL-E, Midjourney, Stable Diffusion)
- ❌ **Génération de carrousels LinkedIn/Instagram** automatiques
- ❌ **A/B testing de contenu** (tester 2 versions et choisir la meilleure)
- ❌ **Fine-tuning de modèles IA sur la marque IntegrIA** (entraînement personnalisé)
- ❌ **Analyse de sentiment et optimisation du ton** automatique
- ❌ **Génération de calendrier éditorial complet automatique** (IA planifie thèmes mensuels)

---

### Intégrations & Automatisations

- ❌ **Intégration CRM** (HubSpot, Salesforce, Pipedrive)
- ❌ **API publique** pour intégrations tierces
- ❌ **Automatisation des réponses aux commentaires** (IA répond automatiquement)
- ❌ **Webhook pour événements** (notification externe quand post publié)
- ❌ **Intégration avec outils de design** (Canva, Figma)
- ❌ **Intégration calendrier externe** (Google Calendar, Outlook) en v1

---

### Internationalisation & Localisation

- ❌ **Support multilingue** (français, allemand, italien, anglais)
- ❌ **Adaptation culturelle automatique** du contenu par région
- ❌ **Traduction automatique** des posts

---

### Fonctionnalités Monétisation

- ❌ **Plans tarifaires multiples** (free, pro, enterprise)
- ❌ **Système de paiement** (Stripe, PayPal)
- ❌ **Quotas dynamiques** selon l'abonnement
- ❌ **Marketplace de templates** (achat/vente de templates)

---

### Autres Exclusions

- ❌ **Mode offline complet** (brouillons hors connexion)
- ❌ **Application desktop** (Electron)
- ❌ **Extension navigateur** (Chrome, Firefox)
- ❌ **Thème sombre/clair** (un seul thème en v1)
- ❌ **Personnalisation avancée de l'interface** (drag & drop de composants UI)

---

### Note sur l'Évolution Future

Ces fonctionnalités peuvent être reconsidérées pour les versions futures (v2, v3, v4+) en fonction de:
- Feedback utilisateur post-lancement
- Adoption et usage réel
- Budget disponible
- Ressources (équipe élargie)
- Évolution des besoins business

**Priorités post-lancement:**
1. Phase 2 (Mars-Avril 2026): Calendrier, Templates, Médias
2. Phase 3 (Mai-Juillet 2026): Publication automatique
3. Phase 4+ (H2 2026): Analytics basiques, collaboration multi-users

---

## Open Questions

Questions non résolues nécessitant investigation ou décision avant/pendant le développement:

### Questions Techniques

1. **Quel modèle d'IA utiliser?**
   - **Question:** OpenAI GPT-4, Anthropic Claude, ou Google Gemini Pro pour la génération de contenu?
   - **Impact:** Qualité du contenu, coûts mensuels, latence
   - **Action:** Tests comparatifs de qualité avant développement (semaine 1)
   - **Critères de décision:** Qualité > Coût > Latence

2. **Stack technique exacte?**
   - **Question:** Next.js ou Create React App? Supabase ou Firebase?
   - **Impact:** Vitesse de développement, scalabilité, coûts
   - **Action:** Décision en semaine 1 basée sur documentation et facilité pour débutant
   - **Critères:** Facilité d'apprentissage > Documentation > Communauté

3. **Approche APIs LinkedIn/Instagram?**
   - **Question:** APIs officielles directement ou via service tiers (Buffer, Zapier)?
   - **Impact:** Complexité technique, coûts, fiabilité
   - **Action:** PoC avec APIs officielles d'abord, pivot vers tiers si trop complexe
   - **Deadline:** Décision en Phase 3 (semaine 13)

---

### Questions Produit

4. **Fréquence de régénération IA?**
   - **Question:** Combien de fois un utilisateur peut régénérer des idées/posts par jour/semaine?
   - **Impact:** Coûts API, satisfaction utilisateur
   - **Action:** Commencer sans limite stricte, monitorer l'usage, ajuster si nécessaire
   - **Suivi:** Revue mensuelle des coûts

5. **Formats de posts supportés?**
   - **Question:** Seulement posts texte+image, ou aussi carrousels, vidéos, sondages?
   - **Impact:** Complexité, délai de développement
   - **Action:** MVP = texte + image simple uniquement, autres formats en v2+
   - **Status:** **RÉSOLU** - texte + image uniquement en v1

6. **Niveau de personnalisation des prompts IA?**
   - **Question:** L'utilisateur peut-il ajuster les prompts IA ou c'est entièrement automatique?
   - **Impact:** Flexibilité vs complexité, courbe d'apprentissage
   - **Action:** v1 = prompts automatiques, v2 = paramètres avancés optionnels
   - **Status:** **RÉSOLU** - automatique en v1

---

### Questions Business

7. **Modèle de pricing futur?**
   - **Question:** Outil restera gratuit pour Sami uniquement, ou sera commercialisé?
   - **Impact:** Architecture multi-tenant, features de monétisation
   - **Action:** v1 = usage interne uniquement, décision commercialisation après validation (6 mois)
   - **Deadline:** Décision en juillet 2026

8. **Métriques de succès précises?**
   - **Question:** Comment mesurer exactement la qualité du contenu et l'engagement?
   - **Impact:** Priorisation des features analytics
   - **Action:** Définir KPIs précis après 1 mois d'usage réel
   - **Deadline:** Mars 2026

---

### Questions Légales & Conformité

9. **Conformité RGPD complète?**
   - **Question:** Niveau de conformité RGPD requis pour v1 (usage interne)?
   - **Impact:** Développement features RGPD (export données, consentement, etc.)
   - **Action:** v1 = conformité basique (droit à l'oubli, sécurité données), conformité complète si commercialisation
   - **Status:** **RÉSOLU** - basique en v1

10. **Conditions d'utilisation des APIs sociales?**
    - **Question:** Restrictions légales LinkedIn/Instagram sur publication automatique?
    - **Impact:** Faisabilité feature publication auto, risque de suspension de compte
    - **Action:** Revue complète des Terms of Service avant développement feature publication
    - **Deadline:** Avant début Phase 3 (avril 2026)

---

### Questions à Résoudre Post-Lancement

11. **Stratégie de contenu optimale?**
    - **Question:** Quels types de posts génèrent le plus d'engagement en Suisse romande?
    - **Action:** Analyse après 2-3 mois de publications
    - **Deadline:** Avril-Mai 2026

12. **Horaires de publication optimaux?**
    - **Question:** Quand publier pour maximiser l'engagement (jour, heure)?
    - **Action:** Tests et analytics après 1-2 mois
    - **Deadline:** Mars-Avril 2026

---

## Approval & Sign-off

### Stakeholders

#### Parties Prenantes Clés

**1. Sami - Fondateur/CEO IntegrIA**
- **Rôle:** Product Owner, décideur final, utilisateur principal
- **Responsabilité:** Validation des requirements, feedback sur l'UX, tests utilisateur
- **Niveau d'influence:** **ÉLEVÉ** (décisions finales, priorités, budget, timeline)
- **Engagement:** Actif tout au long du projet

**2. Employés Futurs (3 personnes)**
- **Rôle:** Utilisateurs futurs (6-12 mois)
- **Responsabilité:** Feedback pour features collaboration future
- **Niveau d'influence:** MOYEN (besoins futurs à anticiper)
- **Engagement:** Consultation pour v2+

**3. Clients Cibles - Entrepreneurs & PME Suisse Romande**
- **Rôle:** Audience du contenu généré, clients potentiels IntegrIA
- **Responsabilité:** Engagement avec le contenu, génération de leads
- **Niveau d'influence:** INDIRECT (via métriques d'engagement)
- **Engagement:** Via les réseaux sociaux (likes, commentaires, messages)

---

### Approval Status

**PRD Version 1.0 - 2026-01-06**

- [✓] Product Owner (Sami) - Validation des requirements
- [ ] Engineering Lead (N/A - développement solo avec IA)
- [ ] Design Lead (N/A - design intégré au développement)
- [ ] QA Lead (N/A - tests intégrés au développement)

**Status:** **DRAFT - En attente de validation finale par Sami**

**Next Steps:**
1. Review du PRD par Sami
2. Ajustements si nécessaire
3. Approbation finale
4. Passage à Phase 3: Architecture (`/architecture`)

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-06 | Product Manager (BMAD Agent) | Initial PRD - 19 FRs, 18 NFRs, 6 Epics |

---

## Next Steps

### Phase 3: Architecture Design

**Run `/architecture` to create system architecture based on these requirements.**

L'architecture devra adresser:
- **Tous les Functional Requirements (19 FRs)** - comment chaque FR sera implémenté techniquement
- **Tous les Non-Functional Requirements (18 NFRs)** - comment les objectifs de performance, sécurité, scalabilité seront atteints
- **Stack technique décisions** - React/Next.js, TypeScript, Tailwind, Supabase/Firebase, Vercel
- **Data models** - schéma de base de données (users, posts, ideas, media, templates, calendar)
- **API architecture** - intégrations IA (OpenAI/Claude), APIs sociales (LinkedIn, Instagram)
- **System components** - frontend, backend, workers/cron jobs pour publication auto
- **Security architecture** - authentification, authorization, protection des données
- **Deployment strategy** - CI/CD, environnements (dev, staging, prod)

**Priorités Architecture:**
1. Validation de la faisabilité technique des FRs Must Have
2. Sélection stack optimale pour développeur débutant
3. Architecture scalable (4 utilisateurs → 10+ utilisateurs à terme)
4. Sécurité dès la conception

---

### Phase 4: Sprint Planning

**Après l'architecture, run `/sprint-planning` pour:**
- Décomposer les 6 epics en 30-42 user stories détaillées
- Estimer la complexité (story points)
- Planifier les sprints/itérations
- Définir la Definition of Done
- Commencer l'implémentation

---

**This document was created using BMAD Method v6 - Phase 2 (Planning)**

*To continue: Run `/workflow-status` to see your progress and next recommended workflow.*

---

## Appendix A: Requirements Traceability Matrix

| Epic ID | Epic Name | Functional Requirements | Non-Functional Requirements | Story Est. | Priority |
|---------|-----------|-------------------------|----------------------------|------------|----------|
| EPIC-001 | Authentification & Gestion Utilisateur | FR-001 | NFR-004, NFR-005 | 3-5 | Must Have |
| EPIC-002 | Génération de Contenu par IA | FR-002, FR-003, FR-004, FR-005, FR-006, FR-019 | NFR-002, NFR-006, NFR-008, NFR-018 | 8-10 | Must Have |
| EPIC-003 | Gestion & Édition de Contenu | FR-007, FR-008, FR-009, FR-010 | NFR-003, NFR-010, NFR-014 | 5-7 | Must Have |
| EPIC-004 | Calendrier Éditorial | FR-011, FR-012, FR-013 | NFR-001, NFR-012 | 4-6 | Should Have |
| EPIC-005 | Templates & Bibliothèque Médias | FR-014, FR-015, FR-016 | NFR-007 | 4-6 | Should Have |
| EPIC-006 | Publication Automatique | FR-017, FR-018 | NFR-011 | 6-8 | Could Have |

**Totals:**
- **6 Epics**
- **19 Functional Requirements**
- **18 Non-Functional Requirements** (plusieurs NFRs sont transversales)
- **30-42 User Stories** (estimation)

**Traceability:**
- Chaque FR est assigné à exactement 1 Epic
- Chaque Epic couvre 1-6 FRs
- Chaque Epic adresse 1-4 NFRs clés
- 100% des FRs sont tracés aux Epics

---

## Appendix B: Prioritization Details

### Functional Requirements Prioritization

**Must Have (MVP - Phase 1):** 10 FRs
- FR-001: Authentification Email/Mot de passe
- FR-002: Génération d'Idées de Contenu par IA
- FR-003: Sélection d'Idées
- FR-004: Génération de Post LinkedIn
- FR-005: Génération de Caption Instagram
- FR-007: Édition de Post
- FR-008: Prévisualisation de Post
- FR-009: Sauvegarde de Brouillons
- FR-010: Copie Rapide pour Publication Manuelle

**Rationale Must Have:** Ces FRs constituent le workflow core "10-to-5 Rule" et permettent de livrer la valeur principale (gain de 70-80% de temps sur création de contenu). MVP utilisable sans les autres FRs.

**Should Have (Post-MVP):** 7 FRs
- FR-006: Génération Multiple (3 versions)
- FR-011: Vue Calendrier Mensuel
- FR-012: Planification de Posts
- FR-014: Création de Templates
- FR-015: Utilisation de Templates
- FR-016: Bibliothèque de Médias
- FR-019: Notation de Posts Générés

**Rationale Should Have:** Améliorent significativement l'expérience utilisateur et l'efficacité, mais workarounds existent (planning manuel dans un document externe, pas de templates).

**Could Have (Future):** 3 FRs
- FR-013: Drag & Drop de Posts
- FR-017: Publication Automatique LinkedIn
- FR-018: Publication Automatique Instagram

**Rationale Could Have:** Nice-to-have mais non essentiels. Complexité technique élevée pour publication auto (RISQUE #2), peut être reporté sans impact critique.

---

### Non-Functional Requirements Prioritization

**Must Have (MVP):** 13 NFRs
- Performance: NFR-001, NFR-002, NFR-003
- Sécurité: NFR-004, NFR-005, NFR-006
- Scalabilité: NFR-007
- Fiabilité: NFR-009, NFR-010
- Utilisabilité: NFR-012, NFR-014
- Compatibilité: NFR-017, NFR-018

**Rationale Must Have:** Sans ces NFRs, l'application serait inutilisable (performance), non sécurisée (risque légal), ou non adoptée (UX).

**Should Have (Post-MVP):** 5 NFRs
- NFR-008: Limites de Génération IA (important pour coûts mais non bloquant au lancement)
- NFR-011: Fiabilité de Publication (seulement si feature publication auto implémentée)
- NFR-013: Accessibilité (bonne pratique mais pas bloquant pour Sami)
- NFR-015: Qualité du Code (important pour maintenance mais MVP peut être "imparfait")
- NFR-016: Documentation Technique (utile mais développable progressivement)

---

### Epic Prioritization & Delivery Strategy

**Phase 1 - MVP Core (Semaines 1-5):** EPIC-001, EPIC-002, EPIC-003
- **Objectif:** Outil fonctionnel pour générer et gérer du contenu
- **Story estimate:** 16-22 stories
- **Business value:** 70-80% de la valeur totale
- **Delivery date:** 15 février 2026

**Phase 2 - Planification (Semaines 7-9):** EPIC-004
- **Objectif:** Organisation temporelle du contenu
- **Story estimate:** 4-6 stories
- **Business value:** +10% (meilleure organisation)
- **Delivery date:** Mars 2026

**Phase 3 - Efficacité (Semaines 10-13):** EPIC-005
- **Objectif:** Accélération via réutilisation
- **Story estimate:** 4-6 stories
- **Business value:** +5% (gain de temps sur récurrent)
- **Delivery date:** Avril 2026

**Phase 4 - Automatisation (Semaines 14-18):** EPIC-006
- **Objectif:** Publication sans intervention manuelle
- **Story estimate:** 6-8 stories
- **Business value:** +5% (automatisation complète)
- **Delivery date:** Mai 2026
- **Risk:** Complexité technique élevée, peut être reporté

---

### MoSCoW Summary

| Priority | FRs | NFRs | Epics | % Total Value |
|----------|-----|------|-------|---------------|
| Must Have | 10 (53%) | 13 (72%) | 3 (50%) | 80% |
| Should Have | 7 (37%) | 5 (28%) | 2 (33%) | 15% |
| Could Have | 3 (16%) | 0 (0%) | 1 (17%) | 5% |
| Won't Have | 0 | 0 | 0 | 0% |

**Decision Criteria:**
- **Must Have:** Projet échoue sans, valeur core, bloquant pour utilisateurs
- **Should Have:** Importante mais workaround possible, amélioration significative
- **Could Have:** Nice-to-have, faible impact si reporté, complexité élevée

---

**End of PRD**
