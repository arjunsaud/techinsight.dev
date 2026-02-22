# Vitafy Admin Blog Platform

A Next.js + Supabase starter implementation based on the provided SRS (v1.1,
20-Feb-2026).

## Stack

- Next.js (SSR/App Router)
- TailwindCSS + shadcn-style UI primitives
- Supabase Auth + PostgreSQL + Edge Functions
- Hono (routing layer inside Supabase Edge Functions)
- React Query for API state
- React Hook Form + Zod for forms
- Editor.js for block-based blog editor
- R2 integration entrypoint for blog image uploads

## Quick Start

1. Install dependencies:

```bash
pnpm install
```

2. Configure environment:

```bash
cp .env.example .env.local
```

3. Run SQL migrations in Supabase SQL editor:

- `supabase/migrations/202602201300_initial_schema.sql`
- `supabase/migrations/202602201510_r2_settings_table.sql`
- `supabase/migrations/202602201620_admin_login_username_rpc.sql`
- `supabase/migrations/202602201730_superadmin_role.sql`
- `supabase/migrations/202602202359_superadmin_seed.sql`
- `supabase/migrations/202602210110_backfill_public_users.sql`
- `supabase/migrations/202602210220_users_to_superadmins.sql`
- `supabase/migrations/202602210235_backfill_superadmin_profile.sql`
- `supabase/migrations/202602210240_fix_handle_auth_user_created_email_fallback.sql`

Or with CLI:

```bash
supabase db push
```

4. Deploy edge functions:

```bash
supabase functions deploy api
```

5. Start dev server:

```bash
pnpm dev
```

## Key Directories

- `app/`: Next.js app routes (public, auth, admin)
- `components/`: UI + compound components
- `hooks/`: React Query hooks
- `services/`: Edge Function HTTP clients
- `lib/`: shared helpers (Supabase, utils, data access)
- `supabase/migrations/`: SQL migrations
- `supabase/functions/`: Edge Function handlers
  - Single function entrypoint: `api/index.ts`
  - Modular MVC under `api/`: `blog/`, `comment/`, `admin/`
- `docs/`: architecture + requirement mapping

## Default Bootstrap Account

Seeded by migration `202602202359_superadmin_seed.sql`:

- username: `superadmin`
- email: `superadmin@vitafy.local`
- password: `SuperAdmin@12345`

Login uses `email + password`.

Change these values before any non-local environment.

## Notes

- R2 settings are loaded from `public.app_settings` (`R2_ACCOUNT_ID`,
  `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL`).
- Hono routes follow Supabase function-prefix routing (e.g.
  `/api/blog/:idOrSlug`, `/api/comment/:commentId`).
- `api/blog/upload-url` currently returns an upload draft (`objectKey`,
  `publicUrl`) and is designed to be extended with presigned PUT support for R2.
- Role checks are enforced in both RLS and Edge Function handlers.
