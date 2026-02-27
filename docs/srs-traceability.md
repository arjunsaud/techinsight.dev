# SRS Traceability

## Authentication

- User login/register via Supabase Auth: `components/auth/login-form.tsx`,
  `components/auth/register-form.tsx`
- Admin email/password login: `components/auth/admin-login-form.tsx`,
  `supabase/functions/api/index.ts` (`/api/admin/login`)
- Role guards: `lib/supabase/guards.ts`, SQL functions `public.is_admin()` and
  `public.is_superadmin()`

## Blog Management

- Admin CRUD API (Hono + MVC): `supabase/functions/api/app.ts`,
  `supabase/functions/api/blog/routes/blog.routes.ts`,
  `supabase/functions/api/blog/controllers/blog.controller.ts`,
  `supabase/functions/api/blog/models/blog.model.ts`
- Route parameter usage: `GET/PATCH/DELETE /api/blog/:idOrSlug`
- Admin UI: `app/admin/(protected)/blogs/page.tsx`,
  `app/admin/(protected)/blogs/all/page.tsx`,
  `components/blog/studio/hashnode-studio.tsx`,
  `components/blog/admin-blogs-list.tsx`
- Rich content (Editor.js): `components/blog/editor.tsx`

## Category & Tag Management

- API: `blog` routes `/api/blog/categories`, `/api/blog/categories/:categoryId`,
  `/api/blog/tags`, `/api/blog/tags/:tagId`
- Admin pages: `app/admin/(protected)/categories/page.tsx`,
  `app/admin/(protected)/tags/page.tsx`

## Comments

- User comment posting: `components/comments/comment-form.tsx`,
  `/api/comment` POST (`supabase/functions/api/comment/routes/comment.routes.ts`)
- Nested rendering: `components/comments/comment-list.tsx`
- Admin deletion endpoint: `DELETE /api/comment/:commentId`

## Admin Dashboard

- Stats API (admin protected): `admin` route `/api/admin/dashboard`
  (`supabase/functions/api/admin/routes/admin.routes.ts`)
- Dashboard UI (admin protected): `app/admin/dashboard/page.tsx`

## SEO + SSR

- Blog list and detail routes are server rendered: `app/(public)/blogs/*`
- Detail metadata generation: `app/(public)/blogs/[slug]/page.tsx`

## Storage (R2)

- Upload draft endpoint: `blog` route `/api/blog/upload-url`
- DB-backed R2 configuration table: `public.app_settings`
  (`supabase/migrations/202602201510_r2_settings_table.sql`)
- Next API proxy: `app/api/upload/route.ts`

## Database and Migrations

- Initial migration + RLS: `supabase/migrations/202602201300_initial_schema.sql`
- Superadmin role migration: `supabase/migrations/202602201730_superadmin_role.sql`
- Superadmin promotion migration (for existing auth user):
  `supabase/migrations/202602202359_superadmin_seed.sql`
- Auth/profile backfill migration:
  `supabase/migrations/202602210110_backfill_public_users.sql`
- Users table rename migration:
  `supabase/migrations/202602210220_users_to_superadmins.sql`
- Superadmin profile retry backfill:
  `supabase/migrations/202602210235_backfill_superadmin_profile.sql`
