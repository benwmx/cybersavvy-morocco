## Cyber-Safety Platform — Build Plan

Built on the existing **TanStack Start** scaffold (file-based routing, no `react-router-dom`). All logic stays client-side; loaders just render components. Supabase calls are abstracted behind a thin client so you can drop in real credentials later — until then a mock layer backs everything with seeded data so the full UX is testable.

### 1. Foundation

- **i18n / RTL** — `src/lib/i18n/`
  - `LanguageContext` with `fr` / `ar`, persisted to `localStorage`.
  - Effect updates `document.documentElement.lang` and `dir`.
  - `useT()` hook reads from a single `translations.ts` dictionary.
  - All layouts use `ltr:`/`rtl:` Tailwind variants; chevrons use `rtl:rotate-180`.
- **Provider tree** wired in `__root.tsx`: `QueryClientProvider` → `LanguageProvider` → `OfflineSyncProvider` → `<Outlet />`. Browser APIs guarded by `useEffect`.
- **Design tokens** — extend `src/styles.css` with a friendly education palette (primary blue, accent emerald, warning amber, destructive red) in oklch, plus `--gradient-hero` and `--shadow-card`. No hardcoded colors.

### 2. Offline-first sync — `src/lib/offline/`

- `db.ts` — Dexie schema with `offline_queue { id++, payload, createdAt }`.
- `queue.ts` — `enqueueResult(payload)`, `flushQueue()`.
- `useOfflineSync()` — registers `window.addEventListener('online', flushQueue)` once; also flushes on mount if online.
- `saveResult(payload)`: if `navigator.onLine` → Supabase insert; on failure or offline → enqueue. Toast feedback either way.

### 3. Supabase layer — `src/lib/supabase/`

- `client.ts` — `createClient` reading `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`. If env missing, exports a **mock adapter** backed by seeded in-memory + `localStorage` store so the app is fully usable now.
- `api.ts` — typed helpers: `verifyClassCode`, `createClass`, `listMyClasses`, `listResultsForTeacher`, `insertResult`. Each delegates to real client or mock based on env presence.
- Drop in real creds later → zero component changes.

### 4. Routes (TanStack file-based)

- `src/routes/index.tsx` — **Landing**: hero with bilingual headline, language switcher in navbar, two CTA cards (Student / Teacher) → `/login`.
- `src/routes/login.tsx` — **Access Portal**: tabbed dual-role layout.
  - Student tab: class code + name → verify → navigate to `/game` (student session in `sessionStorage`).
  - Teacher tab: email/password with sign-up / sign-in toggle.
- `src/routes/_authenticated.tsx` — guard layout: checks teacher session; redirects to `/login` otherwise. Renders `<SidebarProvider>` + `<AppSidebar>` + `<Outlet />`.
- `src/routes/_authenticated/dashboard.tsx` — **Class Hub**: create-class form (auto 6-char code via `nanoid`), copyable code chips, list of classes.
- `src/routes/_authenticated/analytics.tsx` — **Analytics Room**: Recharts bar chart (avg score per scenario) + "Target Gaps / Lacunes à cibler" panel ranking most frequent `mistakes` items.
- `src/routes/game.tsx` — **Scenario Lobby**: 6 track cards with lucide icons.
- `src/routes/game.$trackId.tsx` — **Arena**: question card with media placeholder; click answer → lock + flip reveal (correct/incorrect) + "Why this matters" card; progress bar; trophy summary at end → `saveResult` (offline-aware).

### 5. Content — `src/content/scenarios.ts`

Local export. Each track has `id`, bilingual `title`/`description`, lucide icon name, and 3–5 questions: `{ id, prompt_fr, prompt_ar, choices_fr[], choices_ar[], correctIndex, explanation_fr, explanation_ar }`. I'll author reasonable placeholder content for all 6 tracks.

### 6. Components

`LanguageSwitcher`, `Navbar`, `AppSidebar` (shadcn sidebar with collapse), `ScenarioCard`, `QuestionCard`, `FeedbackReveal`, `TrophySummary`, `MediaPlaceholder`.

### Technical notes

- **No `react-router-dom`** — TanStack `Link` / `useNavigate` everywhere.
- All `localStorage` / `navigator.onLine` / Dexie access inside `useEffect` or handlers (SSR-safe).
- TanStack Query for class lists and results; invalidated after mutations and after `online` flush.
- One hero image generated for landing (`src/assets/`). Track icons: lucide (`Fish`, `KeyRound`, `Users`, `MessageSquareWarning`, `Lock`, `Bug`).
- When ready: add `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` and create the two tables with the spec'd RLS — app switches off the mock automatically.

### Out of scope (this pass)

- Real Supabase project + RLS SQL (you'll connect later).
- Real media assets inside scenarios (placeholders only).
- Email verification / password reset flows.
