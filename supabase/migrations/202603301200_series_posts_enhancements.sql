-- Migration: Add category, tags, and featured support to series_posts
-- Description: Align series_posts schema with articles for consistent features

-- 1. Add category_id column to series_posts
ALTER TABLE series_posts 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- 2. Add is_featured column to series_posts
ALTER TABLE series_posts 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- 3. Create series_post_tags junction table
CREATE TABLE IF NOT EXISTS series_post_tags (
  series_post_id UUID NOT NULL REFERENCES series_posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (series_post_id, tag_id)
);

-- 4. Add indexes
CREATE INDEX IF NOT EXISTS idx_series_posts_category_id ON series_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_series_posts_is_featured ON series_posts(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_series_post_tags_post_id ON series_post_tags(series_post_id);
CREATE INDEX IF NOT EXISTS idx_series_post_tags_tag_id ON series_post_tags(tag_id);

-- 5. Enable RLS on series_post_tags
ALTER TABLE series_post_tags ENABLE ROW LEVEL SECURITY;

-- 6. Public SELECT policy for series_post_tags
CREATE POLICY "Allow public read access for series_post_tags" ON series_post_tags
  FOR SELECT USING (true);

-- 7. Admin management policy for series_post_tags
CREATE POLICY "Admins manage series_post_tags" ON series_post_tags
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());
