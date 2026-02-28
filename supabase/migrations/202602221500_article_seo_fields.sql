-- Add SEO metadata columns to articles table
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS keywords TEXT;

-- Index for SEO searches if needed
CREATE INDEX IF NOT EXISTS idx_articles_seo_title ON public.articles(seo_title) WHERE seo_title IS NOT NULL;
