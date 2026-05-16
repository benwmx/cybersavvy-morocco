## Goal

Guarantee every page in the app runs as client-only React — no SSR pass touches `window`, `localStorage`, `sessionStorage`, `IndexedDB`, or `navigator`. The app still ships through TanStack Start (Vite + Cloudflare worker), but the server side only emits the HTML shell and hands off to client rendering.

## What's actually at risk today

A quick audit of browser-API usage:

| File | API | Currently safe on server? |
|---|---|---|
| `src/lib/i18n/LanguageContext.tsx` | `localStorage`, `document` | ✓ inside `useEffect` |
| `src/lib/offline/OfflineSyncProvider.tsx` | `navigator.onLine`, `window.addEventListener` | ✓ inside `useEffect` |
| `src/lib/offline/db.ts` | Dexie / IndexedDB | ✓ guarded by `typeof window` |
| `src/routes/game.tsx`, `game.$trackId.tsx` | `sessionStorage` | ✓ inside `useEffect` |
| `src/routes/_authenticated.tsx` | `api.getSession()` in `beforeLoad` | ✓ guarded by `typeof window` |
| **`src/lib/supabase/api.ts`** | **`seed()` runs at module bottom and calls `localStorage`** | ✗ — touches storage during SSR import |
| `src/routes/_authenticated/dashboard.tsx` | `navigator.clipboard` | ✓ inside handler |

So the code is mostly disciplined, but (a) `api.ts` seeds at import time, and (b) SSR is still rendering the React tree on every request — which means any future regression silently re-introduces the same class of bug. The user explicitly wants 100% client-side; the right fix is to take SSR off the critical path globally.

## Plan

### 1. Disable SSR globally on the root route

In `src/routes/__root.tsx`, set `ssr: false` on the route options:

```ts
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  ssr: false,
  // ...rest unchanged
});
```

This propagates to every child route. The server still serves `index.html` with the script tag (and head metadata), but React renders entirely on the client. No `useEffect`s, no providers, no Dexie/localStorage code runs server-side.

### 2. Remove the module-level seed in `src/lib/supabase/api.ts`

Move the `seed()` call out of module scope and into the functions that actually need it (`verifyClassCode`, `listMyClasses`, `listResultsForTeacher`). This makes the module safe to import even if some path ever does evaluate server-side.

```ts
// remove the trailing `seed();`
async verifyClassCode(code) { seed(); /* existing body */ }
async listMyClasses() { seed(); /* existing body */ }
async listResultsForTeacher() { seed(); /* existing body */ }
```

`seed()` is already idempotent (it no-ops if classes exist).

### 3. Light hygiene pass on the route guard

`src/routes/_authenticated.tsx`'s `beforeLoad` already early-returns on the server. With `ssr: false` it never runs server-side anyway, but leave the guard in place — it's defensive and free.

### 4. Verification

After the changes:
- Reload `/` — landing renders normally.
- Reload `/dashboard` while logged-out — should redirect to `/login` (now happens after hydration, fine).
- Reload `/game/phishing` after joining DEMO01 — questions render.
- Check the preview console — no `window is not defined`, `localStorage is not defined`, or `HTTPError` 500s.
- View-source on any page — you'll see the head + a mostly-empty `<body>` with the script bundle, confirming SSR is off.

## Out of scope

- Tearing out the SSR error wrapper in `src/server.ts` — it's still useful as a safety net for static-asset / build-init failures.
- Converting the project to a pure-Vite SPA (would mean dropping TanStack Start entirely). `ssr: false` gives you 100% client rendering without that disruption.
