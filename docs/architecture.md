# Architecture

## Frontend

- App Router route groups:
  - `app/(public)` for user-facing SSR pages
  - `app/(auth)` for login/register pages
  - `app/admin` for protected admin management views
- Reusable compound components:
  - Article: `ArticleCard`, `ArticleList`, `HashnodeStudio`, `AdminArticlesList`,
    `AdminCategoriesManager`, `AdminTagsManager`
  - Comment: `CommentList`, `CommentForm`
- Data layer:
  - SSR reads via server Supabase client in `lib/server-data.ts`
  - Client mutations/queries via Edge Functions and React Query (`services/*`,
    `hooks/*`)

## Backend

- Supabase Edge Functions:
  - `api`: single deployed function containing modular MVC handlers for:
    article CRUD/taxonomy/upload, comments, and admin auth/dashboard/users
- Routing and HTTP layer:
  - One Hono app (`supabase/functions/api/app.ts`) with central CORS and
    error handling
  - Route modules (`api/*/routes/*.routes.ts`) map endpoints to controllers
  - Routes are prefixed with function name (`api`) per Supabase routing docs
    (for example `/api/article/:idOrSlug`)
- MVC module layout inside `supabase/functions/api`:
  - `routes` -> request routing
  - `controllers` -> request validation + auth orchestration
  - `models` -> Supabase query/data logic
- Shared function modules:
  - `shared/auth.ts` for JWT + role checks
  - `shared/client.ts` for anon client + access-token bound clients
  - `shared/hono.ts` for common Hono app setup

## Data Model

- `superadmins`: profile + role mapping for auth users (`superadmin`, `admin`, `user`)
- `articles`: article content with status and category
- `categories`, `tags`, `article_tags`
- `comments`: nested comments with `parent_id`
- `app_settings`: key/value runtime configuration (includes R2 keys/URLs)

## Security

- RLS enabled on all domain tables
- Public read on published content/taxonomy
- Admin-only CRUD where required
- Admin dashboard access requires authenticated admin role
- Comment creation restricted to authenticated users
- Server and edge handlers apply role checks on protected endpoints
- Edge functions run with anon key + request JWT (no service role key
  dependency)
