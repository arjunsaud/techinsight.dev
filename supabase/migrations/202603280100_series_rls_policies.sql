-- Migration: Add Admin RLS Policies for Series Feature
-- Description: Grant full access to series and post_series for admins and superadmins.

-- 1. Policies for 'series' table
DROP POLICY IF EXISTS "Allow public read access for published series" ON series;
CREATE POLICY "Allow public read access for published series" ON series
  FOR SELECT USING (status = 'published' OR public.is_admin());

CREATE POLICY "Admins manage series" ON series
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2. Policies for 'post_series' table
DROP POLICY IF EXISTS "Allow public read access for post_series" ON post_series;
CREATE POLICY "Allow public read access for post_series" ON post_series
  FOR SELECT USING (true);

CREATE POLICY "Admins manage post_series" ON post_series
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());
