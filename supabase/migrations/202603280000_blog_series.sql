-- Migration: Add Series Feature
-- Description: Create series and post_series tables for grouping posts into structured sequences.

-- 1. Create series table
CREATE TABLE IF NOT EXISTS series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_image TEXT,
  status TEXT CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create post_series junction table (Multi-Series support)
CREATE TABLE IF NOT EXISTS post_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  series_id UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  series_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, series_id)
);

-- 3. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_post_series_series_id ON post_series(series_id);
CREATE INDEX IF NOT EXISTS idx_post_series_post_id ON post_series(post_id);
CREATE INDEX IF NOT EXISTS idx_post_series_order ON post_series(series_order);

-- 4. Enable RLS (Assuming existing tables use RLS)
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_series ENABLE ROW LEVEL SECURITY;

-- 5. Public SELECT policies
CREATE POLICY "Allow public read access for published series" ON series
  FOR SELECT USING (status = 'published');

CREATE POLICY "Allow public read access for post_series" ON post_series
  FOR SELECT USING (true);

-- 6. Trigger for updated_at on series
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_series_updated_at
    BEFORE UPDATE ON series
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
