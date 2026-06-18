# CyberSafe: Plateforme Nationale de Cybersécurité

CyberSafe is a cybersecurity awareness platform for Moroccan schools. Students work through interactive scenarios to learn about digital safety; teachers get a dashboard to manage classes, assign content, and track progress. All content is cached locally and syncs when connectivity is restored, which matters a lot in classrooms where the internet drops out regularly.

**Live:** [cybersafemorocco.netlify.app](https://cybersafemorocco.netlify.app)

## Background

Cybersecurity education in Morocco is still catching up. Most schools don't have a structured way to teach students about phishing, password hygiene, social engineering, or safe browsing. The tools that do exist are usually in English only, require constant internet, or aren't built for a classroom.

CyberSafe was made for this context specifically. It follows the Moroccan GENIE curriculum, runs in French and Arabic with proper RTL support, and works reliably in schools where sessions get interrupted by connectivity issues.

## Who it's for

Three types of users:

- Students: work through cybersecurity scenarios at their own pace, answer questions, and get immediate feedback
- Teachers: create and manage classes, assign scenario categories, monitor progress, and see where students are struggling
- Admins: manage all platform content and control every UI string through a translations editor, so wording can be changed without touching code

## Features

### Learning

- Scenarios covering phishing, passwords, social engineering, malware, and safe browsing
- Each scenario has a cover, questions with media (images or video), and a score tracked per attempt
- Students can replay scenarios to improve their score
- Guest mode for quick demos without an account

### Teacher tools

- Class management: create classes, add students one by one or via bulk CSV import
- Assign scenario categories to specific classes
- Analytics: per-student and per-scenario scores, attempt counts, and a chart of average performance across the class
- Pedagogical recommendations based on class performance data, generated via the Gemini API (teachers paste their own API key in settings)

### Admin

- Content management: add, edit, or delete categories, scenarios, and questions
- Per-question media upload (images and video)
- Translations editor: override any UI string from the dashboard without a redeploy

### Infrastructure

- Offline-first: all scenario data is cached in IndexedDB via Dexie.js. Students can complete exercises without internet; results sync to Supabase when connectivity is restored
- Full RTL layout for Arabic
- RLS on all Supabase tables: teachers only see their own classes and students

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 19 (TypeScript) |
| Routing | TanStack Router (file-based) |
| Data fetching | TanStack Query |
| Backend | Supabase (PostgreSQL, Auth, RLS) |
| Local storage | Dexie.js (IndexedDB, offline sync) |
| Styling | Tailwind CSS v4, Radix UI |
| Forms | React Hook Form + Zod |
| Build | Vite + Bun |

## Getting started

### Prerequisites

- [Bun](https://bun.sh) installed
- A Supabase project

### Setup

```bash
git clone https://github.com/benwmx/cybersavvy-morocco.git
cd cybersavvy-morocco
bun install
cp .env.example .env
```

Add your Supabase credentials to `.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running locally

```bash
bun dev
```

Other commands:

```bash
bun build     # production build
bun preview   # preview the build
bun lint
bun format
```

## Project structure

```
src/
├── routes/          # TanStack Router file-based routes
├── hooks/           # custom hooks (auth, data fetching, analytics)
├── lib/
│   ├── supabase/    # API layer and database types
│   ├── offline/     # Dexie schema, sync queue, offline provider
│   ├── i18n/        # translations and language context
│   └── content/     # static scenario seed data
└── components/      # shared UI components
```

## Database

The backend is Supabase (PostgreSQL with RLS on all tables). Core tables: `categories`, `scenarios`, `students`, `classes`, `results`, `translations`, `tutorials`, with `class_categories` and `class_scenario_status` as junction tables.

Scenarios and categories use a fork model. Global content is managed by admins; teachers can fork categories into private copies they can customize without affecting the shared content.

## Internationalization

All UI strings go through `useLang()`, nothing hardcoded. Defaults (French + Arabic) are in `src/lib/i18n/translations.ts`. Admins can override any string from the translations page in the dashboard, and changes sync to Supabase and get picked up on the next render without a redeploy.

`lang` is only used directly when selecting which bilingual field to display (e.g. `title.fr` vs `title.ar`) and for setting `dir` attributes.

## License

[MIT](LICENSE)
