# CyberSafe — Full Project Context

## Your Task

You are tasked with writing the **complete academic report (Projet de Fin d'Études / PFE)** for the CyberSafe platform described in this document. The report must be written in **French**, in a formal academic tone appropriate for an end-of-study project in computer science.

The report must include:

1. **Page de garde** (title page)
2. **Remerciements**
3. **Résumé** (French) + **Abstract** (English) + **ملخص** (Arabic)
4. **Table des matières**
5. **Liste des figures et des tableaux**
6. **Introduction générale**
7. **Chapitre 1 — Contexte et problématique** : présentation de l'organisme d'accueil, problématique, objectifs du projet
8. **Chapitre 2 — Analyse des besoins** : acteurs, cas d'utilisation (avec diagrammes UML), besoins fonctionnels et non-fonctionnels
9. **Chapitre 3 — Conception** : architecture globale, diagrammes UML (classes, séquences, composants, ERD/diagramme de base de données), choix technologiques justifiés
10. **Chapitre 4 — Réalisation** : description des interfaces principales, fonctionnalités implémentées, captures d'écran décrites textuellement
11. **Conclusion générale et perspectives**
12. **Bibliographie / Webographie**
13. **Annexes** (si nécessaire)

For every UML diagram requested, generate it using **PlantUML syntax** inside a code block so it can be rendered directly. Required diagrams:
- Diagramme de cas d'utilisation (par acteur)
- Diagramme de classes
- Diagrammes de séquence (au moins 3 flux principaux)
- Diagramme de composants (architecture frontend/backend)
- Diagramme entité-association (ERD de la base de données)

The pedagogical approach of the platform is **scenario-based interactive learning with immediate feedback** — not gamification. Make sure this is reflected accurately throughout the report.

All technical context needed to write this report is provided below. Do not ask for additional information — generate the full report from what is here.

---

> **Technical context document** — every table, actor, relationship, flow, and architectural decision of the CyberSafe platform is described in the sections below.

---

## 1. Project Overview

**CyberSafe** (Plateforme Nationale de Cybersécurité) is a bilingual (French / Arabic, with RTL support) cybersecurity awareness and evaluation platform designed for the Moroccan educational system. It lets teachers create cybersecurity awareness scenarios (interactive quizzes with media), assign them to classes, and track student performance. Students play through scenarios on any device, including offline.

### Primary Goals
- Teach digital safety through interactive quiz-based scenarios
- Enable teachers to manage classes and monitor progress
- Support unreliable connectivity (IndexedDB offline cache + sync queue)
- Fully bilingual FR/AR with admin-controlled translations

---

## 2. Actors

| Actor | Description | Auth mechanism |
|---|---|---|
| **Admin** | Platform super-user (one account, `is_admin: true` in Supabase `app_metadata`). Manages global content, all teachers, all classes. Never has demo data. | Supabase email/password auth |
| **Teacher** | Registered educator. Manages own classes, students, and can fork/customize global scenarios. Views analytics for own students. | Supabase email/password auth |
| **Student** | Pupil enrolled in a class. Identified by class access code + Massar code (no password). Plays assigned scenarios. | Temporary session stored in `localStorage` (no Supabase auth) |
| **Guest** | Anonymous visitor. Can play a curated set of public scenarios without any account. Results stored locally only. | `localStorage` flag `cs.guest` |

---

## 3. Use Cases

### 3.1 Admin Use Cases
- UC-A1: Sign in / sign out
- UC-A2: View platform statistics (total teachers, classes, students, results, avg score)
- UC-A3: List all registered teachers (with class count, student count)
- UC-A4: List all classes across all teachers
- UC-A5: Manage global categories (create, edit name/color, delete)
- UC-A6: Manage global scenarios (create, edit title/description/image/video, delete)
- UC-A7: Manage questions inside a scenario (add, edit prompt/choices/explanation/media, delete)
- UC-A8: Upload cover image or video for a scenario
- UC-A9: Upload image or video for an individual question
- UC-A10: Manage UI translations (view all keys, override FR and AR wording, save to Supabase)
- UC-A11: Manage admin settings (change password, change email)

### 3.2 Teacher Use Cases
- UC-T1: Sign up (first name, last name, email, password)
- UC-T2: Sign in / sign out
- UC-T3: Update profile (first name, last name)
- UC-T4: Change password / email
- UC-T5: Create a class (generates a 6-character alphanumeric access code)
- UC-T6: Delete a class
- UC-T7: View students in a class
- UC-T8: Add a student manually (name FR, name AR, Massar code)
- UC-T9: Remove a student
- UC-T10: Assign / unassign global scenarios to a class (toggle visibility)
- UC-T11: Fork a global category into a private customizable copy
- UC-T12: Reset a forked category to its global default
- UC-T13: View analytics dashboard (scores per class, per scenario, per student)
- UC-T14: View student history (list of results with score, mistakes, date)
- UC-T15: View tutorials (reference material — read-only for now)

### 3.3 Student Use Cases
- UC-S1: Enter class access code to identify their class
- UC-S2: Enter Massar code to identify themselves within the class
- UC-S3: View list of scenarios assigned to their class
- UC-S4: Play a scenario (answer questions one by one, see immediate feedback)
- UC-S5: View their score and review mistakes at the end of a scenario
- UC-S6: Play offline (scenarios cached in IndexedDB, result queued for sync)
- UC-S7: View personal result history

### 3.4 Guest Use Cases
- UC-G1: Start guest mode (no account required)
- UC-G2: Play public scenarios
- UC-G3: View local result history (stored in `localStorage`, not sent to server)

---

## 4. Database Schema

### 4.1 Platform: Supabase (PostgreSQL), schema `public`

All tables have Row Level Security (RLS) enabled.

---

#### Table: `auth.users` (managed by Supabase Auth)
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Auto-generated |
| `email` | text | Unique |
| `created_at` | timestamptz | Auto |
| `raw_user_meta_data` | jsonb | Contains `first_name`, `last_name` |
| `raw_app_meta_data` | jsonb | Contains `is_admin: true` for the admin user |

---

#### Table: `public.profiles`
Stores teacher display names, auto-created by trigger on `auth.users` insert.

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid PK | FK → `auth.users(id)` ON DELETE CASCADE |
| `first_name` | text | NOT NULL DEFAULT '' |
| `last_name` | text | NOT NULL DEFAULT '' |
| `updated_at` | timestamptz | NOT NULL DEFAULT now() |

**RLS:**
- SELECT: `auth.uid() = id` (own profile only)
- UPDATE: `auth.uid() = id` (own profile only)

**Trigger:** `on_auth_user_created` → calls `handle_new_user()` AFTER INSERT on `auth.users` to auto-insert a profile row.

---

#### Table: `public.categories`
Groups scenarios by topic (e.g., "Phishing", "Privacy"). Can be global (admin-owned) or private (teacher fork).

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid PK | Default gen_random_uuid() |
| `teacher_id` | uuid | FK → `auth.users(id)`, NULL = global/admin-owned |
| `name` | jsonb | Bilingual: `{"fr": "...", "ar": "..."}` |
| `color_code` | text | Hex color for UI (e.g., `#3B82F6`) |
| `source_category_id` | uuid | FK → `categories(id)` ON DELETE SET NULL; set when forked from a global category |

**RLS:**
- SELECT: `teacher_id IS NULL` (global, visible to everyone) OR `teacher_id = auth.uid()` (private fork, visible only to creator)
- INSERT: `auth.uid() IS NOT NULL AND auth.uid() = teacher_id`
- UPDATE: `auth.uid() = teacher_id`
- DELETE: `auth.uid() = teacher_id`

---

#### Table: `public.scenarios`
A scenario is a named quiz (track) with questions, assigned to categories.

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid PK | Default gen_random_uuid() |
| `teacher_id` | uuid | FK → `auth.users(id)`, NULL = global/admin-owned |
| `category_id` | uuid | FK → `categories(id)` |
| `title` | jsonb | Bilingual: `{"fr": "...", "ar": "..."}` |
| `description` | jsonb | Bilingual: `{"fr": "...", "ar": "..."}` |
| `questions` | jsonb | Array of Question objects (see structure below) |
| `icon` | text | Optional icon name (legacy) |
| `color` | text | Optional hex color (legacy) |
| `image_url` | text | Cover image or video URL (from Supabase Storage or external) |
| `is_public` | boolean | NOT NULL DEFAULT false; true = visible to all students |
| `created_at` | timestamptz | Default now() |

**Question JSON structure** (each element in `questions` array):
```json
{
  "id": "q1",
  "prompt": { "fr": "...", "ar": "..." },
  "choices": { "fr": ["A", "B", "C"], "ar": ["أ", "ب", "ج"] },
  "correctIndex": 0,
  "explanation": { "fr": "...", "ar": "..." },
  "media_url": "https://..." // optional image or video URL
}
```

**RLS:**
- SELECT (public): `is_public = true`
- SELECT (own): `auth.uid() IS NOT NULL AND auth.uid() = teacher_id`
- SELECT (class): teacher owns a class that has this scenario in `class_scenario_status`
- INSERT: `auth.uid() IS NOT NULL AND auth.uid() = teacher_id`
- UPDATE: `auth.uid() IS NOT NULL AND teacher_id = auth.uid()` *(migration 005 final state — migration 004 briefly allowed editing global scenarios too, but 005 reverted to own-only)*
- DELETE: `auth.uid() = teacher_id`

---

#### Table: `public.tutorials`
Reference articles / learning materials (currently seeded, UI is read-only).

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid PK | Default gen_random_uuid() |
| `teacher_id` | uuid | FK → `auth.users(id)`, NULL = global |
| `category_id` | uuid | FK → `categories(id)` |
| `title` | jsonb | Bilingual |
| `content` | jsonb | Bilingual rich content |
| `image_url` | text | Optional cover image/video URL |
| `created_at` | timestamptz | Default now() |

---

#### Table: `public.classes`
A class belongs to one teacher and contains students.

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid PK | Default gen_random_uuid() |
| `teacher_id` | uuid | NOT NULL FK → `auth.users(id)` |
| `name` | text | NOT NULL |
| `access_code` | text | NOT NULL UNIQUE; 6-char alphanumeric code used by students to join |
| `created_at` | timestamptz | Default now() |

**RLS:**
- SELECT/INSERT/UPDATE/DELETE: `teacher_id = auth.uid()`

---

#### Table: `public.students`
A student belongs to exactly one class. Authentication is code-only (no Supabase auth).

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid PK | Default gen_random_uuid() |
| `class_id` | uuid | NOT NULL FK → `classes(id)` ON DELETE CASCADE |
| `massar_code` | text | NOT NULL; national student ID (e.g., `G-MBO-01`) |
| `name_fr` | text | NOT NULL; student full name in French |
| `name_ar` | text | NOT NULL; student full name in Arabic |

**RLS:**
- SELECT: teacher owns the class (`classes.teacher_id = auth.uid()`) OR anon (needed for student login via `verifyStudent`)
- INSERT/UPDATE/DELETE: teacher owns the class

---

#### Table: `public.class_scenario_status`
Junction table controlling which scenarios are visible to which class (visibility toggle).

| Column | Type | Constraints |
|---|---|---|
| `class_id` | uuid | PK (composite), FK → `classes(id)` ON DELETE CASCADE |
| `scenario_id` | uuid | PK (composite), FK → `scenarios(id)` ON DELETE CASCADE |
| `is_visible` | boolean | NOT NULL DEFAULT true |

**RLS:**
- SELECT/INSERT/UPDATE/DELETE: teacher owns the class

---

#### Table: `public.class_categories` ⚠️ (legacy / unused)
Junction table linking classes to categories. Present in the TypeScript type definitions (`database.types.ts`) and presumably created in the initial Supabase project schema, but **not referenced anywhere in the current source code or numbered migrations**. No RLS policies defined in migrations. Included here for completeness.

| Column | Type | Constraints |
|---|---|---|
| `class_id` | uuid | PK (composite), FK → `classes(id)` |
| `category_id` | uuid | PK (composite), FK → `categories(id)` |

---

#### Table: `public.results`
Records a single student's attempt at a scenario.

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid PK | Default gen_random_uuid() |
| `student_id` | uuid | NOT NULL FK → `students(id)` ON DELETE CASCADE |
| `class_id` | uuid | NOT NULL FK → `classes(id)` ON DELETE CASCADE |
| `scenario_id` | uuid | NOT NULL FK → `scenarios(id)` ON DELETE CASCADE |
| `score` | integer | NOT NULL; number of correct answers |
| `max_score` | integer | NOT NULL; total number of questions |
| `mistakes` | text[] | Array of question IDs where the student chose wrong |
| `created_at` | timestamptz | Default now() |

**RLS:**
- INSERT: anon allowed (students insert their own results, no Supabase auth)
- SELECT: teacher owns the class

---

#### Table: `public.translations`
Stores admin overrides for UI string keys. Defaults live in frontend source.

| Column | Type | Constraints |
|---|---|---|
| `key` | text PK | Translation key matching keys in `src/lib/i18n/translations.ts` |
| `fr` | text | French override |
| `ar` | text | Arabic override |

**RLS:** Public read, admin-only write (enforced via SECURITY DEFINER RPC).

---

### 4.2 Storage: Supabase Storage bucket `cybersafe-media`

| Property | Value |
|---|---|
| Bucket name | `cybersafe-media` |
| Public | Yes (anyone can read via URL) |
| Max file size | 10 MB |
| Allowed MIME types | `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `video/mp4`, `video/webm`, `application/pdf` |

**Path convention:**
- `{user_id}/scenarios/{uuid}.{ext}` — scenario cover uploaded by admin
- `{user_id}/questions/{uuid}.{ext}` — question media uploaded by admin

**RLS on `storage.objects`:**
- SELECT: public (anyone)
- INSERT: authenticated only
- UPDATE: `owner_id = auth.uid()::text`
- DELETE: `owner_id = auth.uid()::text`

---

### 4.3 Database Functions (RPC)

All functions are `SECURITY DEFINER` with `SET search_path = public`.

| Function | Access | Description |
|---|---|---|
| `get_class_visible_scenarios(p_class_id uuid)` | anon + authenticated | Returns all `scenarios` rows visible to a class (via `class_scenario_status`). Used by students (no auth). |
| `admin_list_users()` | authenticated (admin only) | Returns all `auth.users` joined with `profiles`, `classes`, `students`. Includes `class_count`, `student_count`. |
| `admin_get_stats()` | authenticated (admin only) | Returns platform-wide aggregate: `total_teachers` (= `COUNT(DISTINCT teacher_id) FROM classes` — teachers with zero classes are NOT counted), `total_classes`, `total_students`, `total_results`, `avg_score_percent`. |
| `admin_list_classes()` | authenticated (admin only) | Returns all classes with `teacher_email`, `student_count`, `scenario_count`. |
| `admin_list_global_categories()` | authenticated (admin only) | Returns all categories where `teacher_id IS NULL`. |
| `admin_list_global_scenarios(p_category_id uuid DEFAULT NULL)` | authenticated (admin only) | Returns all global scenarios, optionally filtered by category. |
| `admin_save_category(p_id uuid, p_name jsonb, p_color_code text)` | authenticated (admin only) | Upserts a global category. Returns the UUID. |
| `admin_delete_category(p_id uuid)` | authenticated (admin only) | Deletes a global category. |
| `admin_save_scenario(p_id uuid, p_category_id uuid, p_title jsonb, p_description jsonb, p_questions jsonb, p_image_url text DEFAULT NULL)` | authenticated (admin only) | Upserts a global scenario (with optional cover media URL). Returns the UUID. |
| `admin_update_scenario_questions(p_id uuid, p_questions jsonb)` | authenticated (admin only) | Updates only the `questions` field of a scenario. |
| `handle_new_user()` | trigger (internal) | Fires AFTER INSERT on `auth.users`; inserts a `profiles` row. |

**Admin guard pattern used in all admin RPCs:**
```sql
SELECT COALESCE((raw_app_meta_data->>'is_admin')::boolean, false)
INTO _is_admin FROM auth.users WHERE id = auth.uid();
IF NOT _is_admin THEN RAISE EXCEPTION 'Access denied: admin only'; END IF;
```

---

## 5. Entity Relationship Diagram (textual)

```
auth.users (Supabase managed)
  │ 1
  │─── profiles (1:1, auto-created by trigger)
  │
  │ 1
  ├─── classes (1:N, teacher_id)
  │      │ 1
  │      ├─── students (1:N, class_id)
  │      │      │ 1
  │      │      └─── results (1:N, student_id)
  │      │
  │      └─── class_scenario_status (N:M junction with scenarios)
  │
  │ 1
  └─── categories (1:N, teacher_id; NULL = global)
         │ 1
         └─── scenarios (1:N, category_id)
                │ (also reachable via class_scenario_status)
                └─── results (1:N, scenario_id)

categories ──self-ref──► categories (source_category_id, fork relationship)

class_categories (legacy, unused): Class >──< Category  [exists in DB types, no code references it]

storage.objects (cybersafe-media bucket)
  Referenced by: scenarios.image_url, tutorials.image_url, questions[*].media_url
```

---

## 6. Frontend Architecture

### 6.1 Tech Stack
- **React 19** with TypeScript (strict mode)
- **TanStack Router** (file-based routing, `src/routes/`)
- **TanStack Query** (server state, caching, mutations)
- **Supabase JS** (auth, database, storage client)
- **Dexie.js** (IndexedDB wrapper for offline cache)
- **Tailwind CSS v4** (utility-first styling)
- **Radix UI / shadcn** (accessible UI primitives)
- **React Hook Form + Zod** (forms and validation)
- **Vite + Bun** (build tooling)

### 6.2 Route Tree

```
/ (index.tsx) — Landing / login redirect
├── /login — Teacher sign in / sign up
├── /game — Student game lobby (lists assigned scenarios)
│   └── /game/$trackId — Active scenario player
├── /guest — Guest mode lobby
├── /_authenticated — Protected layout (requires teacher session)
│   ├── /dashboard — Teacher overview
│   ├── /classes — Manage classes
│   ├── /students — Manage students (add / remove per class)
│   ├── /quizzes — Assign scenarios to classes
│   ├── /analytics — View student performance
│   ├── /tutorials — Tutorial reference (read-only stub)
│   └── /settings — Profile & account settings
└── /admin — Separate protected layout (requires is_admin in app_metadata)
    ├── /admin/overview — Platform stats
    ├── /admin/users — All teachers list
    ├── /admin/classes — All classes list
    ├── /admin/content — Category/Scenario/Question editor (3-column)
    ├── /admin/translations — UI string overrides
    └── /admin/settings — Admin account settings
```

### 6.3 React Component Hierarchy (key components)

```
App (providers: OfflineSyncProvider, StudentProvider, LanguageProvider, QueryClientProvider)
├── Navbar — top navigation, online/offline badge, language toggle
├── AppSidebar — teacher sidebar navigation
├── ScenarioVisuals — per-question static visual mock-ups (phishing email, fake login, etc.)
│     Falls back to: uploaded image_url or generic placeholder
├── ImageUpload — file picker with preview; uploads to cybersafe-media bucket
│     Used in: ScenarioDialog (cover), QuestionsEditor (per-question media)
└── UI primitives (shadcn): Button, Card, Dialog, Input, Label, Badge, etc.
```

### 6.4 State & Context

| Context | Provider | Exposes | Used for |
|---|---|---|---|
| `LanguageContext` | `LanguageProvider` | `lang`, `setLang`, `t(key)` | i18n: translate UI strings; pick FR or AR |
| `StudentContext` | `StudentProvider` | `student`, `login()`, `logout()` | Temporary student session in localStorage |
| `OfflineSyncContext` | `OfflineSyncProvider` | `online`, `syncing` | Network status; drives sync logic |

### 6.5 Key Hooks

| Hook | File | Purpose |
|---|---|---|
| `useAuth` | `src/hooks/useAuth.ts` | Teacher sign in/up/out, session management |
| `useGameData` | `src/hooks/useGameData.ts` | Fetch scenarios for active player, save results |
| `useAnalytics` | `src/hooks/useAnalytics.ts` | Fetch and aggregate student results for teacher |
| `useStudentHistory` | `src/hooks/useStudentHistory.ts` | Past results for a specific student |
| `useI18n` | `src/hooks/use-i18n.ts` | Translate bilingual JSON fields (`{fr, ar}`) |
| `useLang` | `src/lib/i18n/LanguageContext.tsx` | Global language + `t("key")` for UI strings |

### 6.6 API Layer (`src/lib/supabase/api.ts`)

Single `api` object groups all Supabase calls by domain:

| Domain | Key methods |
|---|---|
| Auth | `signUp`, `signIn`, `signOut`, `getSession`, `updatePassword`, `updateEmail`, `updateProfile` |
| Classes | `listMyClasses`, `createClass`, `deleteClass`, `verifyClassCode` |
| Students | `listStudentsInClass`, `addStudent`, `removeStudent`, `verifyStudent` |
| Categories | `listCategories`, `createCategory`, `updateCategory`, `deleteCategory`, `forkCategory`, `resetCategoryToDefault` |
| Scenarios | `listScenarios`, `listVisibleScenarios`, `getScenario`, `createScenario`, `updateScenario`, `deleteScenario` |
| Class-Scenario | `getClassScenarioStatus`, `setScenarioVisibility` |
| Results | `insertResult`, `listResultsForStudent`, `listResultsWithStudents` |
| Translations | `listTranslations`, `upsertTranslation`, `deleteTranslation` |
| Admin | `adminGetStats`, `adminListUsers`, `adminListAllClasses`, `adminListGlobalCategories`, `adminListGlobalScenarios`, `adminSaveCategory`, `adminDeleteCategory`, `adminSaveScenario`, `adminUpdateScenarioQuestions` |
| Storage | `uploadMedia(userId, folder, file)`, `getMediaUrl(path)`, `deleteMedia(path)` |

---

## 7. Offline Sync Architecture

### 7.1 Local Database (Dexie / IndexedDB)

| Dexie store | Primary key | Indexed fields | Contents |
|---|---|---|---|
| `offline_queue` | `++id` | `createdAt` | Pending `results` rows waiting to be synced to Supabase |
| `scenarios` | `id` | `teacher_id`, `category_id`, `is_public` | Mirror of Supabase `scenarios` for offline play |
| `categories` | `id` | `teacher_id` | Mirror of Supabase `categories` |
| `class_scenario_status` | `[class_id+scenario_id]` | `class_id`, `scenario_id` | Visibility config for a student's class |
| `translations` | `key` | — | UI string overrides from Supabase |

### 7.2 Sync flows

**On app load / coming online:**
1. `syncPublicScenarios()` — fetches all `is_public = true` scenarios from Supabase → writes to Dexie
2. `syncTranslations()` — fetches all rows from `translations` → writes to Dexie
3. `flushQueue()` — sends all queued results in `offline_queue` to Supabase, then clears them

**On teacher login:**
- `syncPrivateScenarios(userId)` — fetches teacher's own scenarios → writes to Dexie

**On teacher logout:**
- `scrubPrivateData()` — removes private scenarios from Dexie

**On student login:**
- `syncClassScenarios(classId)` — calls `get_class_visible_scenarios(classId)` RPC → writes scenarios + `class_scenario_status` rows to Dexie

**On student completes a scenario:**
- If online: `api.insertResult(payload)` directly to Supabase
- If offline: payload pushed to `offline_queue` in Dexie; synced on next connectivity

### 7.3 Game data flow (student plays a scenario)

```
Student enters code → verifyClassCode() → verifyStudent()
  → StudentContext.login(details) → syncClassScenarios(classId)
  → /game lobby: reads Dexie.class_scenario_status + Dexie.scenarios
  → /game/$trackId: reads Dexie.scenarios OR Supabase fallback
  → Student answers questions
  → Score calculated client-side
  → online? api.insertResult() : offline_queue.add(payload)
  → Show score + mistakes screen
```

---

## 8. i18n System

- **Source of truth:** `src/lib/i18n/translations.ts` — a TypeScript object with all keys in both `fr` and `ar`.
- **Admin overrides:** Stored in Supabase `translations` table. Admin can change any wording from `/admin/translations`.
- **Runtime resolution:** `useLang()` hook returns `t(key)` which checks Dexie `translations` first, falls back to the TS default.
- **Bilingual content fields** (scenario titles, category names, student names): stored as `{fr: "...", ar: "..."}` JSON; rendered via `useI18n().translate(field)` which picks the right side based on current `lang`.
- **RTL:** Applied via `dir` attribute on container elements when `lang === "ar"`.

---

## 9. Key Design Decisions

| Decision | Reason |
|---|---|
| Students have no Supabase auth account | Simplifies onboarding in school contexts; Massar code is sufficient identity within a class |
| Results insertable by anon | Students (no auth token) must be able to save results; RLS allows anon INSERT on `results` |
| Admin RPCs use SECURITY DEFINER | RLS blocks direct table writes for `teacher_id IS NULL` rows; SECURITY DEFINER bypasses RLS after checking `is_admin` in `app_metadata` |
| Category fork model | Teachers can customise global content without affecting other classes; `source_category_id` tracks the original |
| Offline queue rather than retry | Network is unreliable in Moroccan schools; results are never lost even if connectivity drops mid-quiz |
| `image_url` stores full public URL | Usable directly in `<img>` / `<video>` anywhere without an extra API call; bucket is public |

---

## 10. Class Diagram Entities (for UML)

```
[User / Teacher]
  - id: UUID
  - email: string
  - firstName: string
  - lastName: string
  - isAdmin: boolean
  + signIn()
  + signOut()
  + updateProfile()
  + createClass()
  + deleteClass()
  + addStudent()
  + removeStudent()
  + forkCategory()
  + setScenarioVisibility()
  + viewAnalytics()

[Admin] extends [User / Teacher]
  + listAllTeachers()
  + listAllClasses()
  + getPlatformStats()
  + saveGlobalCategory()
  + saveGlobalScenario()
  + overrideTranslation()

[Student]
  - id: UUID
  - classId: UUID
  - massarCode: string
  - nameFr: string
  - nameAr: string
  + login(classCode, massarCode)
  + logout()
  + playScenario()
  + submitResult()

[Guest]
  + playPublicScenario()
  + viewLocalHistory()

[Class]
  - id: UUID
  - teacherId: UUID
  - name: string
  - accessCode: string (6-char unique)
  - createdAt: datetime

[Category]
  - id: UUID
  - teacherId: UUID | null
  - nameFr: string
  - nameAr: string
  - colorCode: string
  - sourceCategoryId: UUID | null  «self-reference, fork»

[Scenario]
  - id: UUID
  - teacherId: UUID | null
  - categoryId: UUID
  - titleFr: string
  - titleAr: string
  - descriptionFr: string
  - descriptionAr: string
  - questions: Question[]
  - imageUrl: string | null
  - isPublic: boolean
  - createdAt: datetime

[Question]
  - id: string
  - promptFr: string
  - promptAr: string
  - choicesFr: string[]
  - choicesAr: string[]
  - correctIndex: integer
  - explanationFr: string
  - explanationAr: string
  - mediaUrl: string | null   «image or video»

[ClassScenarioStatus]
  - classId: UUID
  - scenarioId: UUID
  - isVisible: boolean

[Result]
  - id: UUID
  - studentId: UUID
  - classId: UUID
  - scenarioId: UUID
  - score: integer
  - maxScore: integer
  - mistakes: string[]
  - createdAt: datetime

[Tutorial]
  - id: UUID
  - teacherId: UUID | null
  - categoryId: UUID
  - titleFr: string
  - titleAr: string
  - content: JSON
  - imageUrl: string | null

[Translation]
  - key: string (PK)
  - fr: string
  - ar: string

[StorageObject]  «cybersafe-media bucket»
  - path: string   «{userId}/scenarios/{uuid}.ext or {userId}/questions/{uuid}.ext»
  - publicUrl: string
  - ownerId: UUID
  - mimeType: string

Relationships:
  User 1 ──< Class (teacher owns many classes)
  Class 1 ──< Student (class has many students)
  Student 1 ──< Result
  Class >──< Scenario  via ClassScenarioStatus (many-to-many with visibility flag)
  Category 1 ──< Scenario
  Category 1 ──< Tutorial
  Category 0..1 ──< Category (self: source fork)
  Scenario 1 ──< Result
  Scenario contains Question[] (embedded JSON, not a separate table)
  Question 0..1 ──> StorageObject (mediaUrl)
  Scenario 0..1 ──> StorageObject (imageUrl)
  Tutorial 0..1 ──> StorageObject (imageUrl)
```

---

## 11. Sequence Diagrams (key flows)

### Flow 1: Student login and offline scenario load
```
Student → App: enter class access code
App → Supabase: verifyClassCode(code)
Supabase → App: ClassRow
App → Student: enter Massar code
App → Supabase: verifyStudent(classId, massarCode)
Supabase → App: StudentRow
App → StudentContext: login(studentDetails)
StudentContext → Supabase: get_class_visible_scenarios(classId) RPC
Supabase → StudentContext: ScenarioRow[]
StudentContext → Dexie: write scenarios + class_scenario_status
App → Dexie: read class_scenario_status (filtered is_visible=true)
Dexie → App: visible scenario IDs
App → Dexie: read scenarios by IDs
Dexie → App: ScenarioRow[]
App → Student: show game lobby
```

### Flow 2: Student completes a scenario (online)
```
Student → App: answer all questions
App: calculate score + mistakes (client-side)
App → Supabase: insertResult({ student_id, class_id, scenario_id, score, max_score, mistakes })
Supabase → App: ResultRow
App → Student: show score screen
```

### Flow 3: Student completes a scenario (offline)
```
Student → App: answer all questions
App: calculate score + mistakes (client-side)
App → Dexie (offline_queue): add({ payload: { student_id, class_id, ... } })
App → Student: show score screen (with "saved offline" toast)
--- later, device reconnects ---
OfflineSyncProvider (online event) → flushQueue()
flushQueue() → Dexie: read offline_queue entries
flushQueue() → Supabase: insertResult(payload) for each entry
Supabase → flushQueue(): ResultRow
flushQueue() → Dexie: delete synced entries
```

### Flow 4: Admin saves a scenario with cover image
```
Admin → /admin/content: open ScenarioDialog
Admin → ImageUpload: select image/video file
ImageUpload → Supabase Storage: upload to cybersafe-media/{userId}/scenarios/{uuid}.ext
Supabase Storage → ImageUpload: storage path
ImageUpload → api: getMediaUrl(path) → publicUrl
ImageUpload → ScenarioDialog: onChange(publicUrl)
Admin → ScenarioDialog: click Save
ScenarioDialog → api: adminSaveScenario(id, categoryId, title, desc, questions, imageUrl)
api → Supabase: RPC admin_save_scenario(...)
Supabase: INSERT or UPDATE scenarios SET image_url = imageUrl
Supabase → api: scenario UUID
api → App: invalidate query + show success toast
```

### Flow 5: Teacher forks a category
```
Teacher → /quizzes: click Fork on a global category
App → api: forkCategory(globalCategoryId)
api → Supabase: SELECT * FROM categories WHERE id = globalCategoryId
Supabase → api: CategoryRow (global)
api → Supabase: INSERT INTO categories (teacher_id=me, name, color, source_category_id=globalId)
Supabase → api: new CategoryRow (fork)
api → Supabase: SELECT * FROM scenarios WHERE category_id = globalId AND teacher_id IS NULL
Supabase → api: ScenarioRow[] (global copies)
api → Supabase: INSERT INTO scenarios (teacher_id=me, category_id=fork.id, ...) for each
Supabase → api: done
App → Teacher: show private fork in category list
```

---

## 12. Deployment Notes

- SPA hosted on any static host (Netlify, Vercel, Firebase Hosting)
- Backend is fully managed by Supabase (no custom server)
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Migrations applied via Supabase dashboard SQL editor (numbered `001` → `018`)
- PWA enabled (service worker generated by vite-plugin-pwa, precaches build assets)
