# 🏢 RH Manager — Socle Frontend Next.js

Plateforme complète de gestion des ressources humaines, construite avec **Next.js 14**, **TypeScript** et **Tailwind CSS**.

---

## 🏗️ Architecture du projet

```
src/
├── app/                         # App Router Next.js 14
│   ├── layout.tsx               # Layout racine (toasts, fonts)
│   ├── page.tsx                 # Redirection → /dashboard
│   ├── globals.css              # Styles globaux + variables CSS
│   ├── auth/
│   │   └── login/page.tsx       # Page de connexion
│   ├── dashboard/page.tsx       # Tableau de bord principal
│   ├── employes/page.tsx        # Liste et gestion des employés
│   ├── conges/page.tsx          # Demandes de congés + workflow
│   ├── contrats/page.tsx        # Gestion des contrats
│   ├── notifications/           # Centre de notifications
│   └── rapports/page.tsx        # Rapports et graphiques
│
├── components/
│   ├── ui/index.tsx             # Composants UI (Badge, Button, Input, Card…)
│   ├── layout/
│   │   ├── Sidebar.tsx          # Navigation latérale (collapsible)
│   │   ├── Topbar.tsx           # Barre supérieure
│   │   └── DashboardLayout.tsx  # Wrapper layout principal
│   ├── dashboard/
│   │   └── StatsCards.tsx       # Cards statistiques + actions rapides
│   └── notifications/
│       └── NotificationPanel.tsx # Panneau slide-over notifications
│
├── hooks/
│   └── useAuth.ts               # Hook d'authentification (login, logout, can, is)
│
├── lib/
│   ├── api.ts                   # Client Axios avec interceptors JWT
│   ├── utils.ts                 # Helpers (cn, formatDate, labels, variants…)
│   └── services/
│       ├── auth.service.ts      # Service authentification
│       ├── employe.service.ts   # CRUD employés
│       ├── conge.service.ts     # CRUD congés + workflow
│       └── index.ts             # Contrat, notification, rapport services
│
├── store/
│   ├── auth.store.ts            # Zustand — utilisateur + permissions
│   └── ui.store.ts              # Zustand — sidebar, notifications
│
├── types/
│   └── index.ts                 # Types TypeScript globaux
│
└── middleware.ts                # Protection des routes (auth)
```

---

## 🚀 Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Variables d'environnement
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# 3. Lancer en développement
npm run dev
```

---

## 🎨 Thème & Design System

### Couleurs (Tailwind)
| Palette     | Usage                                     |
|-------------|-------------------------------------------|
| `primary-*` | Bleu principal (actions, liens, accents)  |
| `navy-*`    | Bleu marine foncé (sidebar, headers)      |
| `success-*` | Vert (statuts actifs, approuvés)          |
| `warning-*` | Ambre (en attente, alertes)               |
| `danger-*`  | Rouge (refus, erreurs, suppressions)      |

### Composants UI (`src/components/ui/index.tsx`)
- **Badge** — variantes : `blue | green | yellow | red | gray | indigo`
- **Button** — variantes : `primary | secondary | outline | ghost | danger`
- **Input** — avec label, error, icon gauche/droite
- **Select** — select natif stylisé
- **Textarea** — textarea avec label et error
- **Card / CardHeader / CardTitle** — conteneur de contenu
- **Avatar** — initiales ou image, plusieurs tailles
- **Skeleton** — placeholder de chargement
- **EmptyState** — état vide avec icon + action

---

## 🔐 Authentification & Sécurité

### Flux d'authentification
1. **Login** (`/auth/login`) → appel API → stockage token Zustand (persist localStorage)
2. **Middleware** (`src/middleware.ts`) → vérifie le cookie sur chaque requête
3. **Interceptor Axios** → injecte le JWT Bearer sur chaque requête API
4. **401 Handler** → déconnexion automatique et redirection login

### Contrôle d'accès (RBAC)
```typescript
// Rôles disponibles
type UserRole = "ADMIN" | "RH" | "MANAGER" | "EMPLOYE";

// Dans un composant
const { can, is } = useAuth();

can("employes:write")       // permission granulaire
is("ADMIN")                 // rôle exact
is(["ADMIN", "RH"])         // multi-rôles
```

### Permissions disponibles
```
employes:read | employes:write | employes:delete
conges:read | conges:write | conges:approve_n1 | conges:approve_n2 | conges:approve_n3
contrats:read | contrats:write
rapports:read | rapports:export
notifications:manage | admin:full
```

---

## 📅 Workflow Congés (3 niveaux)

```
Employé soumet → EN_ATTENTE_N1 (Manager)
                    ↓ Approuvé
               EN_ATTENTE_N2 (RH)
                    ↓ Approuvé
               EN_ATTENTE_N3 (Direction)
                    ↓ Approuvé
               APPROUVE_N3 ✓ (Définitif)

  À tout niveau → REFUSE_Nx (terminé)
```

Chaque étape peut inclure un commentaire et une date de décision.
Le composant `WorkflowProgress` (dans `conges/page.tsx`) affiche visuellement l'avancement.

---

## 📊 Modules implémentés

| Module         | Fonctionnalités                                                   |
|----------------|-------------------------------------------------------------------|
| **Auth**       | Login, logout, persist, RBAC, middleware, interceptors            |
| **Dashboard**  | Stats KPI, graphiques bar/pie, actions rapides, congés récents    |
| **Employés**   | Liste paginée, recherche, filtres statut/contrat, CRUD            |
| **Congés**     | Liste avec workflow 3 niveaux, filtres, résumé par statut         |
| **Contrats**   | Liste, alertes expiration, téléchargement, résiliation            |
| **Notifications** | Panneau slide-over, marquage lu/non-lu, badges                 |
| **Rapports**   | 4 graphiques (line, bar, pie), KPI, export PDF/Excel              |

---

## 🔌 Connexion au backend

Modifier `NEXT_PUBLIC_API_URL` dans `.env.local`.

Tous les services dans `src/lib/services/` sont prêts pour une vraie API REST :
- `authService.login()`, `authService.logout()`…
- `employeService.getAll()`, `.create()`, `.update()`…
- `congeService.approuverN1/N2/N3()`…
- `contratService.signer()`, `.resilier()`…

Les données mockées dans les pages sont à remplacer par les appels de service.

---

## 📦 Dépendances clés

| Package               | Usage                              |
|-----------------------|------------------------------------|
| `next` 14             | Framework React SSR/SSG/App Router |
| `typescript`          | Typage statique                    |
| `tailwindcss`         | Styling utilitaire                 |
| `zustand`             | État global (auth, UI)             |
| `react-hook-form`     | Formulaires performants            |
| `zod`                 | Validation de schémas              |
| `axios`               | Client HTTP avec interceptors      |
| `recharts`            | Graphiques (bar, line, pie…)       |
| `lucide-react`        | Icônes cohérentes                  |
| `date-fns`            | Manipulation de dates              |
| `react-hot-toast`     | Notifications toast                |

---

## 📋 Prochaines étapes suggérées

- [ ] Pages de détail employé (`/employes/[id]`)
- [ ] Formulaires de création/édition (employé, congé, contrat)
- [ ] Page détail congé avec actions d'approbation workflow
- [ ] Page notifications complète
- [ ] Gestion des départements et postes
- [ ] Profil utilisateur & changement de mot de passe
- [ ] Thème sombre (dark mode)
- [ ] Tests unitaires (Jest + Testing Library)
- [ ] Internationalisation (i18n)
