# CyberSafe — CLAUDE.md

## 1. Project Overview
**CyberSafe** (Plateforme Nationale de Cybersécurité) is a cybersecurity evaluation and awareness platform designed for the Moroccan educational environment. It provides interactive scenarios (tracks) to teach students about digital safety while allowing teachers to track progress and manage classes.

- **Primary Audience**: Students (Learners) and Teachers (Trainers).
- **Languages**: Fully bilingual (French and Arabic) with RTL support.
- **Key Feature**: Offline resilience for environments with unstable connectivity.

## 2. Tech Stack
- **Frontend**: React 19 (TypeScript)
- **Routing**: TanStack Router (File-based)
- **State/Data Fetching**: TanStack Query (React Query)
- **Database/Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Local Database**: Dexie.js (IndexedDB wrapper for offline sync)
- **Styling**: Tailwind CSS v4, Lucide Icons
- **UI Components**: Radix UI (shadcn/ui patterns)
- **Forms/Validation**: React Hook Form + Zod
- **Build/Runtime**: Vite, Bun
- Deployment: Any SPA-hosting platform (Netlify, Vercel, Firebase, etc.)

## 3. Architecture
- **Routing**: Defined in `src/routes/`. Uses TanStack Router's `__root.tsx` and layout routes (e.g., `_authenticated.tsx`).
- **Data Flow**: Components -> Custom Hooks (`src/hooks`) -> API Layer (`src/lib/supabase/api.ts`) -> Supabase/Dexie.
- **Contexts**:
  - `LanguageContext`: Manages i18n and RTL/LTR switching.
  - `StudentContext`: Manages temporary student session/identity.
  - `OfflineSyncProvider`: Tracks online status and manages data synchronization between local Dexie and remote Supabase.
- **Offline Logic**: Uses a queue system (`src/lib/offline/queue.ts`) to buffer requests when offline.

## 4. Database Schema
### Core Tables (Supabase `public` schema)
- **translations**: `key` (PK), `fr`, `ar` (Global UI strings).
- **categories**: `id` (PK), `teacher_id` (FK), `name` (JSON: fr/ar), `color_code`.
- **classes**: `id` (PK), `teacher_id` (FK), `name`, `access_code` (Unique 6-char code), `created_at`.
- **scenarios**: `id` (PK), `teacher_id` (FK, nullable), `category_id` (FK), `title` (JSON), `description` (JSON), `questions` (JSON), `created_at`.
- **students**: `id` (PK), `class_id` (FK), `massar_code`, `name_fr`, `name_ar`.
- **results**: `id` (PK), `student_id` (FK), `class_id` (FK), `scenario_id` (FK), `score`, `max_score`, `mistakes` (text[]), `created_at`.
- **tutorials**: `id` (PK), `teacher_id` (FK), `category_id` (FK), `title` (JSON), `content` (JSON).
- **class_categories**: Junction table linking classes to active categories.
- **class_scenario_status**: Tracks visibility of specific scenarios for specific classes.

## 5. Coding Standards
- **Naming**: PascalCase for components (`AppSidebar.tsx`), camelCase for hooks (`useAuth.ts`) and variables.
- **Components**: Functional components with Tailwind CSS. Prefer composition over inheritance.
- **Styling**: Utility-first with Tailwind. Complex UI uses Radix UI primitives.
- **Types**: Strict TypeScript. Data from Supabase is typed using `database.types.ts`.
- **Hooks**: Business logic and side effects (data fetching, analytics) MUST be moved to custom hooks.
- **i18n**: Never hardcode strings. Use the `useLang` hook and the `translations` system.

## 6. Key Hooks & Services
### Hooks (`src/hooks/`)
- `useAuth`: Teacher authentication (sign in/up/out).
- `useGameData`: Logic for fetching scenarios and saving results.
- `useAnalytics`: Teacher-side logic for viewing student performance.
- `use-i18n`: General translation utility.
- `useStudentHistory`: Fetches past results for a specific student.

### Services (`src/lib/`)
- `supabase/api.ts`: Centralized service for all Supabase database and auth calls.
- `offline/db.ts`: Dexie database schema for local storage.
- `offline/OfflineSyncProvider.tsx`: Global provider for online/offline state.

## 7. Current State
- **Implemented**:
  - Multi-language engine (FR/AR).
  - Teacher dashboard (Class management, Analytics).
  - Student portal (Access via Code Massar).
  - Game/Scenario engine with result tracking.
  - Offline mode with Dexie synchronization.
- **In Progress / Incomplete**:
  - Detailed Tutorial engine (tutorial table exists but UI is minimal).
  - Advanced scenario builder for teachers.

## 8. Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 9. Dev Commands
- **Install**: `bun install`
- **Development**: `bun dev`
- **Build**: `bun build`
- **Preview**: `bun preview`
- **Lint**: `bun lint`
- **Format**: `bun format`
