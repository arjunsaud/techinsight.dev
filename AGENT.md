# TechInsight — AI Agent Guide

> **Note to AI Agents**: This file provides a comprehensive overview of the project's architecture, conventions, and guidelines. Read this before initiating any changes to ensure consistency and adherence to established patterns.

---

## 🚀 Project Overview

**TechInsight** is a full-stack, admin-managed article and blog-series platform.

- **Primary Goal**: Provide a polished reading experience for technical articles with powerful admin tooling for content management.
- **Key Modules**: Auth (Supabase Auth), Admin Dashboard, Article Management, Blog Series, Comments, Categories & Tags, Image Upload (Cloudinary).

### Technical Stack

- **Framework**: Next.js (App Router, latest — Turbopack dev server)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3
- **State Management**: TanStack React Query (server cache) — no Zustand
- **Forms**: React Hook Form + Zod (`@hookform/resolvers`)
- **Auth**: Supabase Auth (email/password, session cookies via `@supabase/ssr`)
- **Database**: Supabase (PostgreSQL + RLS)
- **API Layer**: Supabase Edge Functions (Deno, single `api` function)
- **Rich Text Editor**: BlockNote (`@blocknote/react`)
- **Image Hosting**: Cloudinary (signed uploads via Edge Function)
- **UI Primitives**: Custom components (shadcn/ui-inspired) + Radix UI
- **Theming**: `next-themes` (light/dark, system default)
- **Notifications**: Sonner (toast)
- **Icons**: Lucide React
- **Package Manager**: pnpm

---

## 📂 Project Structure

```
techinsight.dev/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Auth route group (login, register)
│   ├── (public)/                     # Public routes
│   │   ├── [slug]/                   # Individual article page
│   │   ├── articles/                 # Articles listing
│   │   ├── categories/               # Filter by category
│   │   ├── tags/                     # Filter by tag
│   │   ├── featured/                 # Featured articles
│   │   ├── series/                   # Blog series listing & detail
│   │   ├── about/                    # About page
│   │   ├── terms/                    # Terms & conditions
│   │   ├── layout.tsx                # Public layout (header + sidebar)
│   │   └── page.tsx                  # Homepage
│   ├── admin/                        # Admin panel
│   │   ├── login/                    # Admin login page
│   │   ├── forgot-password/          # Password recovery
│   │   ├── reset-password/           # Password reset
│   │   └── (protected)/              # Auth-guarded admin routes
│   │       ├── dashboard/            # Admin dashboard
│   │       ├── articles/             # CRUD articles
│   │       ├── series/               # CRUD blog series
│   │       ├── categories/           # Manage categories
│   │       ├── tags/                 # Manage tags
│   │       ├── comments/             # Moderate comments
│   │       ├── users/                # User management
│   │       ├── settings/             # Site settings
│   │       └── layout.tsx            # Admin shell (sidebar + header)
│   ├── api/upload/                   # Next.js API route for file uploads
│   ├── globals.css                   # Global styles + Tailwind
│   ├── layout.tsx                    # Root layout (fonts, providers)
│   ├── providers.tsx                 # Client providers (QueryClient, Theme, Toaster)
│   ├── not-found.tsx                 # 404 page
│   ├── robots.ts                     # robots.txt generation
│   └── sitemap.ts                    # sitemap.xml generation
├── components/
│   ├── ui/                           # Base UI primitives (Button, Card, Input, Modal, Table, etc.)
│   ├── article/                      # Article-related components (cards, lists, editors, admin CRUD)
│   ├── comments/                     # Comment system components
│   ├── series/                       # Series-related components
│   ├── auth/                         # Login/register forms
│   ├── admin/                        # Admin-specific components
│   ├── settings/                     # Settings components
│   └── layout/                       # Layout components (headers, sidebars, theme toggle)
├── hooks/                            # Custom React hooks (TanStack Query wrappers)
│   ├── use-articles.ts               # useArticles, useArticle
│   ├── use-comments.ts               # useComments
│   └── use-admin-dashboard.ts        # useAdminDashboard
├── lib/
│   ├── supabase/                     # Supabase client setup
│   │   ├── client.ts                 # Browser client (createBrowserClient)
│   │   ├── server.ts                 # Server client (createServerClient)
│   │   └── guards.ts                 # Auth guards (requireSession, requireAdmin, requireSuperAdmin)
│   ├── query/
│   │   └── query-client.ts           # TanStack Query client factory
│   ├── constants/
│   │   └── common.constants.ts       # Shared constants (CACHE_TTL)
│   ├── env.ts                        # Environment variable loader (getPublicEnv)
│   ├── actions.ts                    # Server Actions (revalidateArticle, revalidateGlobal)
│   ├── server-data.ts                # Server-side data fetchers with caching (ISR via revalidate tags)
│   └── utils.ts                      # Utility helpers (cn, etc.)
├── services/                         # API service layer — all HTTP calls go through here
│   ├── http.ts                       # HTTP client (apiFetch) — wraps fetch with Supabase auth headers
│   ├── article-service.ts            # Article CRUD operations
│   ├── admin-service.ts              # Admin endpoints (dashboard, users, categories, tags)
│   ├── auth-service.ts               # Auth operations
│   ├── comment-service.ts            # Comment operations
│   ├── series-service.ts             # Series CRUD operations
│   └── settings-service.ts           # Settings operations
├── types/
│   ├── api.ts                        # API request/response types (PaginatedResponse, filter inputs, etc.)
│   └── domain.ts                     # Domain entities (Article, Category, Tag, Series, Comment, AppUser, etc.)
├── supabase/
│   ├── config.toml                   # Supabase local config
│   ├── functions/api/                # Deno Edge Function (single "api" function routing all endpoints)
│   └── migrations/                   # SQL migrations (schema, RLS policies, RPCs)
├── middleware.ts                     # Edge middleware (session refresh, admin route protection)
├── next.config.mjs                   # Next.js configuration
├── tailwind.config.ts                # Tailwind theme tokens
├── tsconfig.json                     # TypeScript config
└── package.json                      # Dependencies and scripts
```

---

## 🛠 Key Conventions

### 1. Routing & Pages

- **Route Groups**: Use `(public)` for reader-facing pages and `(auth)` for login/register. Admin pages live under `admin/`.
- **Server vs Client**: Default to Server Components. Use `'use client'` only when interaction, browser APIs, or React hooks are needed.
- **Thin Pages**: Pages should only extract params and delegate to a component that does the real work.

### 2. Component & Code Structure

- **Feature folders**: Group components by domain (`article/`, `series/`, `comments/`, `admin/`, `auth/`).
- **Colocation**: Keep hooks, types, and sub-components close to the components that use them. Move to `hooks/` or `components/ui/` only if reused across features.
- **Naming**: Use `kebab-case` for component files (e.g., `article-card.tsx`, `admin-articles-list.tsx`).

#### 🏗️ How to Build a New Feature (Workflow)

1. **Define Types**: Add domain types to `types/domain.ts` and API input/response types to `types/api.ts`.
2. **Add Service**: Implement data fetching in `services/[feature]-service.ts` using `apiFetch`.
3. **Add Server-side Data Fetcher** (if public): Create a function in `lib/server-data.ts` with `revalidate` tags.
4. **Create Hook** (if client-side): Add a TanStack Query hook in `hooks/`.
5. **Create Components**: Build UI in `components/[feature]/`.
6. **Server Action** (if performing mutations): Add to `lib/actions.ts` using `revalidatePath`/`revalidateTag`.
7. **Route/Page**: Implement the page in `app/(public)/...` or `app/admin/(protected)/...`.

### 3. Data Fetching & API Patterns

- **Single HTTP Client**: All API calls go through `services/http.ts → apiFetch()`. Never call `fetch()` directly.
- **Supabase Edge Function**: The backend is a single Deno Edge Function (`supabase/functions/api/`) that routes all endpoints. API paths are relative (e.g., `"article"`, `"admin/dashboard"`).
- **Server-side Caching**: Use `lib/server-data.ts` for public data — functions wrap services with `{ next: { revalidate: CACHE_TTL, tags: [...] } }` for ISR.
- **Client-side Caching**: Use TanStack React Query hooks in `hooks/` for admin pages and interactive UIs.
- **Revalidation**: After mutations, call `revalidatePath()` or `revalidateTag()` inside Server Actions (`lib/actions.ts`).
- **Avoid Waterfalls**: Use `Promise.all()` for independent fetches in Server Components.

### 4. Authentication & Authorization

- **Supabase Auth**: Email/password authentication via `@supabase/ssr` (cookie-based sessions).
- **Middleware**: `middleware.ts` runs at the edge — refreshes sessions and redirects unauthenticated users from `/admin/*` to `/admin/login`.
- **Auth Guards** (`lib/supabase/guards.ts`):
  - `requireSession()` — ensures any authenticated user
  - `requireAdmin()` — ensures `admin` or `superadmin` role (checks `superadmins` table)
  - `requireSuperAdmin()` — ensures `superadmin` role only
- **Protected Admin Routes**: All pages under `app/admin/(protected)/` must call an auth guard at the top of the page component.
- **Service-level Auth**: Pass `accessToken` from the guard's returned session to service functions for authenticated API calls.

### 5. State Management

- **No Zustand**: This project uses TanStack React Query exclusively for server state. There are no client-side stores.
- **Query Keys**: Use descriptive, structured keys like `["articles", filters]`, `["admin-dashboard"]`.
- **Hooks Pattern**: Wrap `useQuery` calls in custom hooks in `hooks/` directory.

### 6. Forms & Validation

- **Zod**: Used for form validation via `@hookform/resolvers`.
- **React Hook Form**: Used for all form state management in admin panel (article editor, category/tag managers, etc.).

### 7. Performance & React Hooks

- **Avoid `useEffect`**: Before adding a `useEffect`, check if the logic can be handled in an **event handler** or during **rendering** (e.g., `useMemo` or derived state).
- **Derived State**: Don't sync props to state. Calculate values from props or existing state during render.
- **Memoization**: Use `useMemo` and `useCallback` strategically for heavy computations or preventing unnecessary re-renders.
- **State Locality**: Keep state as close as possible to where it's used.

### 8. Styling

- **Tailwind CSS v3**: Use utility classes. Avoid custom CSS in `globals.css` unless absolutely necessary.
- **Responsive Design**: Mobile-first approach is mandatory.
- **Dark Mode**: Supported via `next-themes` (class strategy). Use `dark:` Tailwind variants.
- **`cn()` Utility**: Use the `cn()` function from `lib/utils.ts` (clsx + tailwind-merge) for conditional class merging.

---

## 🧬 Codebase Architecture — How It All Connects

### The Data Flow Pipeline

> **Supabase Edge Function → `apiFetch()` (services/http.ts) → Service Layer → Server-side Data Fetcher (lib/server-data.ts) / TanStack Query Hook → Page / Component**

| Layer                  | File Location              | Purpose                                                                         | Key Rule                                                                                             |
| ---------------------- | -------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **HTTP Client**        | `services/http.ts`         | `apiFetch<T>()` wrapper — auth headers, JSON, error handling, query params      | Never call `fetch()` directly — always use `apiFetch()`                                              |
| **Types**              | `types/domain.ts`          | Domain entities (`Article`, `Series`, `AppUser`, etc.)                          | Every entity must have a typed interface                                                             |
| **Types**              | `types/api.ts`             | API contracts (`PaginatedResponse<T>`, input types)                             | Every API response must be typed with generic `apiFetch<T>`                                          |
| **Services**           | `services/*.ts`            | Data-fetching functions that call `apiFetch()`                                  | All API calls reside here; accept `accessToken` for auth'd endpoints                                 |
| **Server Data**        | `lib/server-data.ts`       | Cached server-side data fetchers for public pages                               | Use `{ next: { revalidate: CACHE_TTL, tags: [...] } }` for ISR                                      |
| **Hooks**              | `hooks/*.ts`               | TanStack Query hooks wrapping services for client components                    | Use structured query keys; enable only when deps are present                                         |
| **Server Actions**     | `lib/actions.ts`           | Server-side revalidation after mutations                                        | Call `revalidatePath()` / `revalidateTag()` — never throw to client                                  |
| **Auth Guards**        | `lib/supabase/guards.ts`   | Auth enforcement for admin pages                                                | `requireAdmin()` returns a `session` — use `session.access_token` for service calls                  |
| **Supabase Clients**   | `lib/supabase/client.ts`   | Browser-side Supabase client                                                    | Use for client-side auth operations only                                                             |
| **Supabase Clients**   | `lib/supabase/server.ts`   | Server-side Supabase client (cookie-based)                                      | Used in guards and middleware                                                                        |
| **Edge Function**      | `supabase/functions/api/`  | Single Deno function handling all API endpoints                                 | All backend logic lives here — routing, RLS, business rules                                          |
| **Middleware**          | `middleware.ts`            | Session refresh, admin route protection                                         | Runs at the edge on every request matching the pattern                                               |
| **Pages**              | `app/**/page.tsx`          | Thin route entry points                                                         | Extract params, call auth guards, delegate rendering to components                                   |

### How Each Layer Connects (Example: "Articles" feature)

1. **The Edge Function** handles `GET /api/article`, `GET /api/article/:slug`, `POST /api/article`, etc.
2. **Service functions** in `services/article-service.ts` call `apiFetch<PaginatedResponse<Article>>("article", { query: ... })`
3. **Server-side data fetcher** `lib/server-data.ts → getPublishedArticles()` wraps the service with ISR revalidation tags
4. **The public page** at `app/(public)/page.tsx` calls `getPublishedArticles()` and renders `<ArticleList />`
5. **Admin pages** at `app/admin/(protected)/articles/` call `requireAdmin()` first, then use `articleService` directly with `accessToken`
6. **Client-side hooks** like `useArticles()` in `hooks/use-articles.ts` wrap `articleService.listPublished()` with `useQuery` for interactive filtering

### Key Patterns to Follow

#### Auth Guard → Service Pattern (Admin Pages)

```tsx
// app/admin/(protected)/articles/page.tsx
import { requireAdmin } from "@/lib/supabase/guards";
import { articleService } from "@/services/article-service";

export default async function ArticlesPage() {
  const session = await requireAdmin();
  const articles = await articleService.listAdmin({}, session.access_token);
  return <AdminArticlesList articles={articles} accessToken={session.access_token} />;
}
```

#### Server-side Data Fetching (Public Pages)

```tsx
// app/(public)/page.tsx
import { getPublishedArticles, getCategories, getTags } from "@/lib/server-data";

export default async function HomePage() {
  const [articles, categories, tags] = await Promise.all([
    getPublishedArticles(),
    getCategories(),
    getTags(),
  ]);
  return <HomeContent articles={articles} categories={categories} tags={tags} />;
}
```

#### TanStack Query Hook Pattern (Client Components)

```tsx
// hooks/use-articles.ts
export function useArticles(filters: ArticleFilterInput) {
  return useQuery({
    queryKey: ["articles", filters],
    queryFn: () => articleService.listPublished(filters),
  });
}
```

---

## 🚫 Anti-Patterns — What NOT to Do

### ❌ Unnecessary `useEffect`

| Scenario                                   | ❌ Wrong Approach                                                                 | ✅ Correct Approach                                                  |
| ------------------------------------------ | --------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Displaying a prop value                    | Create state with `useState`, then sync it with `useEffect(() => setState(prop))` | Use the prop directly in JSX — no state needed                       |
| Fetching data on mount                     | `useEffect` + `fetch` + `setState` inside a Client Component                      | Make it a Server Component and `await` the service function directly |
| Filtering/sorting a list when props change | `useEffect` that watches deps and calls `setFilteredList(...)`                    | Use `useMemo` to compute the filtered list during render             |
| Resetting form when a modal opens          | `useEffect` watching `isOpen` to call `form.reset()`                              | Call `form.reset()` in the event handler that opens the modal        |
| Updating document title                    | `useEffect(() => { document.title = ... })`                                       | Use Next.js `metadata` export or `generateMetadata` in `page.tsx`    |

**The rule**: Before writing `useEffect`, ask — _"Can this run in an event handler, during render, or on the server?"_. If yes, don't use `useEffect`.

### ❌ Unnecessary API Calls

| Scenario                                  | ❌ Wrong Approach                                   | ✅ Correct Approach                                                                  |
| ----------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Two sibling components need the same data | Each component fetches independently → 2 API calls  | Fetch once in the shared parent and pass data as props                               |
| Same data needed on multiple public pages | Duplicate service calls on each page                | Use `lib/server-data.ts` with revalidation tags — Next.js deduplicates within render |
| Re-fetching after a mutation              | Client-side polling or `router.refresh()` in a loop | Use `revalidatePath()` or `revalidateTag()` inside Server Actions                   |
| Fetching data only to pass to one child   | Parent fetches, transforms, passes subset to child  | If only one child needs it, let the child fetch directly                             |

### ❌ Bloated Client Components

| Scenario                                         | ❌ Wrong Approach                                              | ✅ Correct Approach                                                                                |
| ------------------------------------------------ | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Page with 500 lines of static content + 1 button | Mark the entire page `'use client'`                            | Keep the page as a Server Component. Extract only the button into a small `'use client'` component |
| Passing server data to a Client Component        | Fetch in Server Component, serialize entire response to client | Only pass the minimal fields the Client Component actually needs as props                          |
| Using `useRouter` just for navigation            | Make component client-side to use `router.push()`              | Use `<Link href="...">` which works in Server Components                                           |

### ❌ Other Common Mistakes

| Mistake                                                      | Why It's Wrong                                              | What to Do Instead                                               |
| ------------------------------------------------------------ | ----------------------------------------------------------- | ---------------------------------------------------------------- |
| Calling `fetch()` directly in a component                    | Bypasses auth header injection and base URL                 | Use `apiFetch()` from `services/http.ts`                          |
| Hardcoding API paths like `"/functions/v1/api/article"`      | Scattered strings are hard to refactor and error-prone      | Use service methods in `services/` that encapsulate paths         |
| Creating new state for values computable from existing state | Extra renders, stale values, sync bugs                      | Compute derived values inline or with `useMemo`                  |
| Using `any` type                                             | Defeats TypeScript's safety                                 | Define proper types in `types/` or inline                        |
| Adding a new npm package without checking `package.json`     | May duplicate functionality already available               | Search `package.json` and existing `lib/` utils first            |
| Skipping auth guards in admin pages                          | Allows unauthenticated access to admin features             | Always call `requireAdmin()` or `requireSuperAdmin()` at top     |
| Throwing errors from Server Actions to the client            | Client receives an unhelpful "Server Error"                 | Catch exceptions and return `{ error: "User-friendly message" }` |

---

## 🤖 Agent Roles & Constraints

1. **Safety First**: Never delete large directories without confirmation.
2. **Context Awareness**: Always check `package.json` for existing libraries before suggesting new ones.
3. **Consistency**: Follow the existing naming conventions and file structures strictly.
4. **Documentation**: Update this file or relevant `README.md` files if architectural changes are made.
5. **No Placeholders**: Do not use `lorem ipsum` or placeholder images in production-ready components.
6. **Server-First**: Default to Server Components. Only add `'use client'` when the component requires interactivity, browser APIs, or hooks.
7. **No Redundant Fetches**: Use `lib/server-data.ts` for public pages with ISR tags. Use TanStack Query for client-side caching.
8. **No `useEffect` for Derivable State**: If the value can be calculated from props, existing state, or during render — do that instead.
9. **Auth Guard Every Admin Page**: Every page under `app/admin/(protected)/` must begin with `await requireAdmin()` or `await requireSuperAdmin()`.
10. **Service Layer Only**: All `apiFetch()` calls must live in `services/`. Components and pages never call `apiFetch()` directly.

---

## 💻 Development Commands

```bash
# Install dependencies
pnpm install

# Start development server (Turbopack)
pnpm dev

# Start development server (Webpack)
pnpm dev:webpack

# Build for production
pnpm build

# Run linting
pnpm lint

# Type-check
pnpm typecheck

# Deploy Supabase migrations
pnpm supabase:migrations:deploy

# Deploy Supabase Edge Functions
pnpm supabase:functions:deploy

# Deploy both
pnpm supabase:deploy
```

---

## 🔐 Environment Variables

See `.env.example` for the required variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous/public key.
- `NEXT_PUBLIC_APP_URL`: Base URL for the application (defaults to `http://localhost:3000`).

---

## 📝 Important Files Summary

| File                         | Responsibility                                                  |
| ---------------------------- | --------------------------------------------------------------- |
| `middleware.ts`              | Edge middleware — session refresh, admin route protection        |
| `app/providers.tsx`          | Client providers (React Query, Theme, Toaster)                  |
| `app/layout.tsx`             | Root layout — fonts (Geist), metadata, providers wrapper        |
| `lib/supabase/guards.ts`    | Auth guard functions (`requireAdmin`, `requireSuperAdmin`)      |
| `lib/supabase/server.ts`    | Server-side Supabase client                                     |
| `lib/supabase/client.ts`    | Browser-side Supabase client                                    |
| `lib/server-data.ts`        | Cached server-side data fetchers with ISR tags                  |
| `lib/actions.ts`            | Server Actions for cache revalidation                           |
| `lib/env.ts`                | Environment variable loader (`getPublicEnv`)                    |
| `lib/utils.ts`              | Utility helpers (`cn`, etc.)                                    |
| `services/http.ts`          | HTTP client (`apiFetch`) — all API calls go through here        |
| `services/article-service.ts` | Article CRUD operations                                       |
| `services/admin-service.ts` | Admin endpoints (dashboard, users, categories, tags)            |
| `services/series-service.ts`| Series CRUD operations                                          |
| `types/domain.ts`           | Domain entities (Article, Series, Category, Tag, Comment, etc.) |
| `types/api.ts`              | API contracts (PaginatedResponse, input types)                  |
| `supabase/functions/api/`   | Single Deno Edge Function handling all API routing              |
| `tailwind.config.ts`        | Tailwind theme tokens and design system                         |

---

> Generated by Antigravity AI Agent. Use this as the authoritative reference for all feature development.
