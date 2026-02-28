-- Rename tables
ALTER TABLE IF EXISTS public.blogs RENAME TO articles;
ALTER TABLE IF EXISTS public.blog_tags RENAME TO article_tags;

-- Rename sequences (if they exist and are standard named)
-- Note: UUID columns usually don't have sequences, but if they do, rename them

-- Rename constraints
DO $$
BEGIN
    -- For articles
    EXECUTE 'ALTER TABLE public.articles RENAME CONSTRAINT blogs_pkey TO articles_pkey';
    EXECUTE 'ALTER TABLE public.articles RENAME CONSTRAINT blogs_category_id_fkey TO articles_category_id_fkey';
    EXECUTE 'ALTER TABLE public.articles RENAME CONSTRAINT blogs_author_id_fkey TO articles_author_id_fkey';
    EXECUTE 'ALTER TABLE public.articles RENAME CONSTRAINT blogs_status_check TO articles_status_check';
    
    -- For article_tags
    EXECUTE 'ALTER TABLE public.article_tags RENAME CONSTRAINT blog_tags_pkey TO article_tags_pkey';
    EXECUTE 'ALTER TABLE public.article_tags RENAME CONSTRAINT blog_tags_blog_id_fkey TO article_tags_article_id_fkey';
    EXECUTE 'ALTER TABLE public.article_tags RENAME CONSTRAINT blog_tags_tag_id_fkey TO article_tags_tag_id_fkey';
    
    -- For comments referencing articles
    EXECUTE 'ALTER TABLE public.comments RENAME CONSTRAINT comments_blog_id_fkey TO comments_article_id_fkey';
EXCEPTION
    WHEN undefined_object THEN
        -- It's okay if constraints don't match standard names perfectly, ignore.
        NULL;
END $$;

-- Rename foreign key columns if they were named blog_id
-- We have to check if the column actually exists before renaming to avoid errors
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='article_tags' AND column_name='blog_id') THEN
        ALTER TABLE public.article_tags RENAME COLUMN blog_id TO article_id;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comments' AND column_name='blog_id') THEN
        ALTER TABLE public.comments RENAME COLUMN blog_id TO article_id;
    END IF;
END $$;


-- Rename indexes
ALTER INDEX IF EXISTS idx_blogs_status_published_at RENAME TO idx_articles_status_published_at;
ALTER INDEX IF EXISTS idx_blogs_category RENAME TO idx_articles_category;
ALTER INDEX IF EXISTS idx_comments_blog RENAME TO idx_comments_article;

-- Rename triggers
ALTER TRIGGER trg_blogs_updated_at ON public.articles RENAME TO trg_articles_updated_at;

-- Recreate policies for articles (Drop old ones with old names, recreate with new names)
-- Articles
DROP POLICY IF EXISTS "Published blogs public read" ON public.articles;
DROP POLICY IF EXISTS "Admins manage blogs" ON public.articles;
DROP POLICY IF EXISTS "Published articles public read" ON public.articles;
DROP POLICY IF EXISTS "Admins manage articles" ON public.articles;

CREATE POLICY "Published articles public read" ON public.articles
    FOR SELECT USING (status = 'published' OR public.is_admin());

CREATE POLICY "Admins manage articles" ON public.articles
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Article Tags
DROP POLICY IF EXISTS "Blog tags public read" ON public.article_tags;
DROP POLICY IF EXISTS "Admins manage blog tags" ON public.article_tags;
DROP POLICY IF EXISTS "Article tags public read" ON public.article_tags;
DROP POLICY IF EXISTS "Admins manage article tags" ON public.article_tags;

CREATE POLICY "Article tags public read" ON public.article_tags
    FOR SELECT USING (true);

CREATE POLICY "Admins manage article tags" ON public.article_tags
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
