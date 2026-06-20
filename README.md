# Y-MaD - Young for Madagascar Development

Plateforme de gestion des offres d'emploi et de gestion associative pour Y-MaD Madagascar.

## 🚀 Technologies

| Catégorie | Technologies |
|-----------|--------------|
| Frontend | Next.js 14, TypeScript, TailwindCSS, React Quill |
| Backend | NestJS, PostgreSQL, TypeORM |
| Auth | JWT, Bcrypt, Refresh Token |
| Upload | Multer, Stockage local |
| Styling | TailwindCSS, Lucide Icons |

## 📋 Fonctionnalités

### 🔐 Authentification
- ✅ 5 rôles (super_admin, admin, candidate, visitor, user)
- ✅ Inscription / Connexion sécurisée
- ✅ JWT Token avec Refresh Token
- ✅ Gestion des sessions
- ✅ Protection des routes

### 💼 Module Emploi
- ✅ Offres d'emploi (CRUD complet)
- ✅ Publication / Dépublier une offre
- ✅ Types de contrats (CDI, CDD, Stage, Freelance, Alternance, Temporaire)
- ✅ Candidatures avec CV et lettre de motivation
- ✅ Upload de fichiers (CV, photo, lettre)
- ✅ Statistiques des offres
- ✅ Filtres par type, lieu, expérience

### 📰 Blog
- ✅ Articles bilingues (Français / Malgache)
- ✅ Publication / Dépublier
- ✅ Catégories et tags
- ✅ Vues et statistiques

### 📁 Projets
- ✅ Gestion des projets associatifs
- ✅ Objectifs, partenaires
- ✅ Localisation et statut
- ✅ Photos et médias

### 🖼️ Gestion des Pages
- ✅ Fonds d'écran dynamiques par page
- ✅ Contenu personnalisé
- ✅ Overlay et positions configurables

### 📊 Dashboard Admin
- ✅ Statistiques globales
- ✅ Gestion des utilisateurs
- ✅ Gestion des offres
- ✅ Gestion des candidatures
- ✅ Gestion des projets et blog
- ✅ Rapports et exports

### 🔄 Upload de Fichiers
- ✅ CV (PDF)
- ✅ Photos de profil (JPG, PNG, WEBP)
- ✅ Lettres de motivation
- ✅ Images pour offres et projets

### 🌍 Multilingue
- ✅ Français
- ✅ Malgache
- ✅ Traduction dynamique

## 🔑 Comptes par défaut

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Super Admin | admin@ymad.mg | admin123 |
| Admin | admin@ymad.org | admin123 |

## 📁 Structure du Projet

### Backend (NestJS)
\\\
backend/
├── src/
│   ├── modules/
│   │   ├── auth/          # Authentification JWT
│   │   ├── jobs/          # Offres et candidatures
│   │   ├── projects/      # Gestion des projets
│   │   ├── blog/          # Articles du blog
│   │   ├── upload/        # Upload de fichiers
│   │   ├── pages/         # Pages et fonds d'écran
│   │   └── contact/       # Messages de contact
│   ├── entities/          # Entités TypeORM
│   └── config/            # Configuration
├── uploads/               # Fichiers uploadés
└── .env.example
\\\

### Frontend (Next.js)
\\\
frontend/
├── src/
│   ├── app/
│   │   ├── (public)/      # Pages publiques
│   │   │   ├── home/      # Page d'accueil
│   │   │   ├── jobs/      # Offres d'emploi
│   │   │   ├── projects/  # Projets
│   │   │   └── blog/      # Articles
│   │   ├── (auth)/        # Pages d'authentification
│   │   └── (dashboard)/   # Admin dashboard
│   ├── components/        # Composants réutilisables
│   ├── contexts/          # Contextes (Auth, Language, Theme)
│   └── services/          # Services API
├── public/
│   └── images/
└── .env.example
\\\

### Base de données
\\\
database/
└── database-schema.sql    # Schéma complet PostgreSQL
\\\

## 🌐 Routes API Principales

### 🔓 Routes Publiques
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /api/jobs/offers/public | Liste des offres publiées |
| GET | /api/jobs/offers/public/:id | Détail d'une offre |
| POST | /api/jobs/applications | Postuler à une offre |
| GET | /api/projects/public | Liste des projets |
| GET | /api/blog/public | Articles du blog |
| GET | /api/pages/backgrounds/:page | Fonds d'écran d'une page |

### 🔒 Routes Protégées (Admin)
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | /api/auth/login | Connexion |
| POST | /api/auth/register | Inscription |
| GET | /api/auth/profile | Profil utilisateur |
| POST | /api/jobs/offers | Créer une offre |
| PATCH | /api/jobs/offers/:id | Modifier une offre |
| DELETE | /api/jobs/offers/:id | Supprimer une offre |
| GET | /api/jobs/applications | Liste des candidatures |
| PATCH | /api/jobs/applications/:id/status | Modifier statut candidature |
| POST | /api/projects | Créer un projet |
| POST | /api/blog | Créer un article |
| POST | /api/upload/single | Upload de fichier |

## 🛠️ Installation

### Prérequis
- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Backend
\\\ash
cd backend
npm install
cp .env.example .env
# Configurer les variables d'environnement
npm run start:dev
\\\

### Frontend
\\\ash
cd frontend
npm install
cp .env.example .env.local
# Configurer les variables d'environnement
npm run dev
\\\

### Base de données
\\\ash
# Créer la base de données
psql -U postgres -c "CREATE DATABASE ymad_db;"

# Importer le schéma
psql -U postgres -d ymad_db < database/database-schema.sql
\\\

## 🎨 Interface

### Page d'accueil
- Hero avec fond d'écran dynamique
- Statistiques de l'association
- Offres d'emploi récentes
- Projets en cours
- Derniers articles du blog
- Newsletter

### Dashboard Admin
- Vue d'ensemble des statistiques
- Gestion des offres (création, modification, suppression)
- Gestion des candidatures
- Gestion des projets
- Gestion du blog
- Gestion des utilisateurs
- Configuration des pages

## 🔒 Sécurité

- ✅ JWT avec refresh token
- ✅ Bcrypt pour le hash des mots de passe
- ✅ Protection CSRF
- ✅ Validation des données (class-validator)
- ✅ Rate limiting
- ✅ CORS configuré

## 🌍 À propos de Y-MaD

**Y-MaD (Young for Madagascar Development)** est une association qui œuvre pour :
- 🇲🇬 La jeunesse malgache
- 🌱 Le développement durable
- 💼 L'insertion professionnelle
- 📚 La formation et l'éducation
- 🌿 La protection de l'environnement
- 💡 L'innovation sociale

## 📄 Licence

MIT

## 👨‍💻 Auteur

Étudiant en DTS Informatique - Promo 2025

## 🔗 Liens

- **GitHub**: https://github.com/freedomzafitsara/ong-madagascar
- **Site**: https://ymad.mg (à venir)

---
Dernière mise à jour: 20/06/2026 23:54:29
