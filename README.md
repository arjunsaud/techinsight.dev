# Vitafy Admin Article Platform

A Next.js + Supabase starter implementation based on the provided SRS (v1.1,
20-Feb-2026).

## Stack

- Next.js (SSR/App Router)
- TailwindCSS + shadcn-style UI primitives
- Supabase Auth + PostgreSQL + Edge Functions
- Hono (routing layer inside Supabase Edge Functions)
- React Query for API state
- React Hook Form + Zod for forms
- BlockNote (React) for block-based article editor
- R2 integration entrypoint for article image uploads

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

- `supabase/migrations/202603301200_initial_schema.sql`

Or with CLI:

```bash
npx supabase db push
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
  - Modular MVC under `api/`: `article/`, `comment/`, `admin/`
- `docs/`: architecture + requirement mapping

## Default Bootstrap Account & Seeding

You can seed your local or production database using the provided npm script. Pass your preferred email, password, and username as arguments:

```bash
npm run db:seed:prod <email> <password> <username>
```

Example:

```bash
npm run db:seed:prod superadmin@vitafy.local SuperAdmin@12345 superadmin
```

## Production Deployment

To deploy the backend to production:

1. **Link your Supabase project:**

   ```bash
   npx supabase link --project-ref <your-project-ref>
   ```

2. **Push migrations to the remote database:**

   ```bash
   npx supabase db push
   ```

3. **Deploy Edge Functions:**

   ```bash
   npx supabase functions deploy api
   ```

4. **Run the Seed Script (if setting up for the first time):**

   ```bash
   npm run db:seed:prod <email> <password> <username>
   ```

5. **Deploy Next.js to Vercel:**
   ```bash
   npx vercel --prod
   ```

## Notes

- R2 settings are loaded from `public.app_settings` (`R2_ACCOUNT_ID`,
  `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL`).
- Hono routes follow Supabase function-prefix routing (e.g.
  `/api/article/:idOrSlug`, `/api/comment/:commentId`).
- `api/article/upload-url` currently returns an upload draft (`objectKey`,
  `publicUrl`) and is designed to be extended with presigned PUT support for R2.
- Role checks are enforced in both RLS and Edge Function handlers.
