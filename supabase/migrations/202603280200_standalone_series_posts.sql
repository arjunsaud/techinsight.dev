-- Migration: Add standalone series_posts table
-- Description: Create a table specifically for articles within a series, decoupled from the main articles table.

-- 1. Create series_posts table
CREATE TABLE IF NOT EXISTS series_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  series_order INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(series_id, slug)
);

-- 2. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_series_posts_series_id ON series_posts(series_id);
CREATE INDEX IF NOT EXISTS idx_series_posts_status ON series_posts(status);
CREATE INDEX IF NOT EXISTS idx_series_posts_order ON series_posts(series_id, series_order);

-- 3. Enable RLS
ALTER TABLE series_posts ENABLE ROW LEVEL SECURITY;

-- 4. Public SELECT policies
CREATE POLICY "Allow public read access for published series_posts" ON series_posts
  FOR SELECT USING (status = 'published' OR (public.is_admin()));

-- 5. Admin management policies
CREATE POLICY "Admins manage series_posts" ON series_posts
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 6. Trigger for updated_at
CREATE TRIGGER update_series_posts_updated_at
    BEFORE UPDATE ON series_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
