-- Add SEO metadata columns to blogs table
ALTER TABLE public.blogs 
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS keywords TEXT;

-- Index for SEO searches if needed
CREATE INDEX IF NOT EXISTS idx_blogs_seo_title ON public.blogs(seo_title) WHERE seo_title IS NOT NULL;
