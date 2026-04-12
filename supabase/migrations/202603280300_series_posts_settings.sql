-- Migration: Add SEO and TOC settings to series_posts
-- Description: Expand series_posts to support SEO metadata and Table of Contents toggle.

-- 1. Add columns to series_posts table
ALTER TABLE public.series_posts 
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS keywords TEXT,
ADD COLUMN IF NOT EXISTS show_toc BOOLEAN DEFAULT FALSE;

-- 2. Add index for SEO searches
CREATE INDEX IF NOT EXISTS idx_series_posts_seo_title ON public.series_posts(seo_title) WHERE seo_title IS NOT NULL;
