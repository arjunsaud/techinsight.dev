ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS likes_count integer DEFAULT 0;

ALTER TABLE public.series_posts ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0;
ALTER TABLE public.series_posts ADD COLUMN IF NOT EXISTS likes_count integer DEFAULT 0;
