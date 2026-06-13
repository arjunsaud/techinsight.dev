SET check_function_bodies = false;

CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE OR REPLACE FUNCTION "public"."handle_auth_user_created"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_email text;
begin
  v_email := coalesce(new.email, new.raw_user_meta_data ->> 'email');

  if v_email is null then
    raise exception 'Unable to resolve email for auth user %', new.id;
  end if;

  insert into public.superadmins (id, username, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(v_email, '@', 1)),
    v_email,
    case
      when coalesce(new.raw_user_meta_data ->> 'role', 'user') in ('superadmin', 'admin', 'user')
        then coalesce(new.raw_user_meta_data ->> 'role', 'user')
      else 'user'
    end
  )
  on conflict (id) do update
    set username = excluded.username,
        email = excluded.email,
        role = excluded.role;

  return new;
end;
$$;

CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.superadmins s
    where s.id = auth.uid() and s.role in ('superadmin', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION "public"."is_superadmin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.superadmins s
    where s.id = auth.uid() and s.role = 'superadmin'
  );
$$;

CREATE OR REPLACE FUNCTION "public"."reorder_series_posts"("p_post_ids" "uuid"[]) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Validate that the user is an admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can reorder posts';
  END IF;

  -- Update the order of each post in the array
  FOR i IN 1..cardinality(p_post_ids) LOOP
    UPDATE public.series_posts
    SET series_order = i - 1
    WHERE id = p_post_ids[i];
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."resolve_admin_email_by_username"("input_username" "text") RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select s.email
  from public.superadmins s
  where lower(s.username) = lower(input_username)
    and s.role in ('admin', 'superadmin')
  limit 1;
$$;

CREATE OR REPLACE FUNCTION "public"."set_app_settings_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS "public"."app_settings" (
    "key" "text" NOT NULL,
    "value" "text" NOT NULL,
    "is_secret" boolean DEFAULT false NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."article_tags" (
    "article_id" "uuid" NOT NULL,
    "tag_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."articles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "content" "text" NOT NULL,
    "excerpt" "text",
    "category_id" "uuid",
    "featured_image_url" "text",
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "author_id" "uuid" NOT NULL,
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "seo_title" "text",
    "meta_description" "text",
    "keywords" "text",
    "show_toc" boolean DEFAULT false,
    "is_featured" boolean DEFAULT false,
    CONSTRAINT "articles_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text"])))
);

CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "description" "text",
    "color" "text"
);

CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "article_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "parent_id" "uuid",
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."post_series" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "series_id" "uuid" NOT NULL,
    "series_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);

CREATE TABLE IF NOT EXISTS "public"."series" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "cover_image" "text",
    "status" "text" DEFAULT 'draft'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "series_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text"])))
);

CREATE TABLE IF NOT EXISTS "public"."series_post_tags" (
    "series_post_id" "uuid" NOT NULL,
    "tag_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);

CREATE TABLE IF NOT EXISTS "public"."series_posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "series_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "content" "text" NOT NULL,
    "excerpt" "text",
    "featured_image_url" "text",
    "series_order" integer DEFAULT 0 NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "seo_title" "text",
    "meta_description" "text",
    "keywords" "text",
    "show_toc" boolean DEFAULT false,
    "category_id" "uuid",
    "is_featured" boolean DEFAULT false,
    CONSTRAINT "series_posts_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text"])))
);

CREATE TABLE IF NOT EXISTS "public"."superadmins" (
    "id" "uuid" NOT NULL,
    "username" "text",
    "email" "text" NOT NULL,
    "password_hash" "text",
    "role" "text" DEFAULT 'user'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "superadmins_role_check" CHECK (("role" = ANY (ARRAY['superadmin'::"text", 'admin'::"text", 'user'::"text"])))
);

CREATE TABLE IF NOT EXISTS "public"."tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."app_settings"
    ADD CONSTRAINT "app_settings_pkey" PRIMARY KEY ("key");

ALTER TABLE ONLY "public"."article_tags"
    ADD CONSTRAINT "article_tags_pkey" PRIMARY KEY ("article_id", "tag_id");

ALTER TABLE ONLY "public"."articles"
    ADD CONSTRAINT "articles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."articles"
    ADD CONSTRAINT "articles_slug_key" UNIQUE ("slug");

ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_name_key" UNIQUE ("name");

ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_slug_key" UNIQUE ("slug");

ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."post_series"
    ADD CONSTRAINT "post_series_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."post_series"
    ADD CONSTRAINT "post_series_post_id_series_id_key" UNIQUE ("post_id", "series_id");

ALTER TABLE ONLY "public"."series"
    ADD CONSTRAINT "series_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."series_post_tags"
    ADD CONSTRAINT "series_post_tags_pkey" PRIMARY KEY ("series_post_id", "tag_id");

ALTER TABLE ONLY "public"."series_posts"
    ADD CONSTRAINT "series_posts_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."series_posts"
    ADD CONSTRAINT "series_posts_series_id_slug_key" UNIQUE ("series_id", "slug");

ALTER TABLE ONLY "public"."series"
    ADD CONSTRAINT "series_slug_key" UNIQUE ("slug");

ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_name_key" UNIQUE ("name");

ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_slug_key" UNIQUE ("slug");

ALTER TABLE ONLY "public"."superadmins"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");

ALTER TABLE ONLY "public"."superadmins"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."superadmins"
    ADD CONSTRAINT "users_username_key" UNIQUE ("username");

CREATE INDEX "idx_articles_category" ON "public"."articles" USING "btree" ("category_id");

CREATE INDEX "idx_articles_seo_title" ON "public"."articles" USING "btree" ("seo_title") WHERE ("seo_title" IS NOT NULL);

CREATE INDEX "idx_articles_status_published_at" ON "public"."articles" USING "btree" ("status", "published_at" DESC);

CREATE INDEX "idx_comments_article" ON "public"."comments" USING "btree" ("article_id", "created_at");

CREATE INDEX "idx_comments_parent" ON "public"."comments" USING "btree" ("parent_id");

CREATE INDEX "idx_post_series_order" ON "public"."post_series" USING "btree" ("series_order");

CREATE INDEX "idx_post_series_post_id" ON "public"."post_series" USING "btree" ("post_id");

CREATE INDEX "idx_post_series_series_id" ON "public"."post_series" USING "btree" ("series_id");

CREATE INDEX "idx_series_post_tags_post_id" ON "public"."series_post_tags" USING "btree" ("series_post_id");

CREATE INDEX "idx_series_post_tags_tag_id" ON "public"."series_post_tags" USING "btree" ("tag_id");

CREATE INDEX "idx_series_posts_category_id" ON "public"."series_posts" USING "btree" ("category_id");

CREATE INDEX "idx_series_posts_is_featured" ON "public"."series_posts" USING "btree" ("is_featured") WHERE ("is_featured" = true);

CREATE INDEX "idx_series_posts_order" ON "public"."series_posts" USING "btree" ("series_id", "series_order");

CREATE INDEX "idx_series_posts_seo_title" ON "public"."series_posts" USING "btree" ("seo_title") WHERE ("seo_title" IS NOT NULL);

CREATE INDEX "idx_series_posts_series_id" ON "public"."series_posts" USING "btree" ("series_id");

CREATE INDEX "idx_series_posts_status" ON "public"."series_posts" USING "btree" ("status");

CREATE OR REPLACE TRIGGER "trg_app_settings_updated_at" BEFORE UPDATE ON "public"."app_settings" FOR EACH ROW EXECUTE FUNCTION "public"."set_app_settings_updated_at"();

CREATE OR REPLACE TRIGGER "trg_articles_updated_at" BEFORE UPDATE ON "public"."articles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

CREATE OR REPLACE TRIGGER "update_series_posts_updated_at" BEFORE UPDATE ON "public"."series_posts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE OR REPLACE TRIGGER "update_series_updated_at" BEFORE UPDATE ON "public"."series" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

ALTER TABLE ONLY "public"."article_tags"
    ADD CONSTRAINT "article_tags_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."article_tags"
    ADD CONSTRAINT "article_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."articles"
    ADD CONSTRAINT "articles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."superadmins"("id") ON DELETE RESTRICT;

ALTER TABLE ONLY "public"."articles"
    ADD CONSTRAINT "articles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."comments"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."superadmins"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."post_series"
    ADD CONSTRAINT "post_series_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."articles"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."post_series"
    ADD CONSTRAINT "post_series_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."series_post_tags"
    ADD CONSTRAINT "series_post_tags_series_post_id_fkey" FOREIGN KEY ("series_post_id") REFERENCES "public"."series_posts"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."series_post_tags"
    ADD CONSTRAINT "series_post_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."series_posts"
    ADD CONSTRAINT "series_posts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."series_posts"
    ADD CONSTRAINT "series_posts_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."superadmins"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

CREATE POLICY "Admins can manage users" ON "public"."superadmins" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());

CREATE POLICY "Admins delete comments" ON "public"."comments" FOR DELETE USING ("public"."is_admin"());

CREATE POLICY "Admins manage app settings" ON "public"."app_settings" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());

CREATE POLICY "Admins manage article tags" ON "public"."article_tags" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());

CREATE POLICY "Admins manage articles" ON "public"."articles" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());

CREATE POLICY "Admins manage categories" ON "public"."categories" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());

CREATE POLICY "Admins manage post_series" ON "public"."post_series" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());

CREATE POLICY "Admins manage series" ON "public"."series" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());

CREATE POLICY "Admins manage series_post_tags" ON "public"."series_post_tags" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());

CREATE POLICY "Admins manage series_posts" ON "public"."series_posts" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());

CREATE POLICY "Admins manage tags" ON "public"."tags" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());

CREATE POLICY "Allow public read access for post_series" ON "public"."post_series" FOR SELECT USING (true);

CREATE POLICY "Allow public read access for published series" ON "public"."series" FOR SELECT USING ((("status" = 'published'::"text") OR "public"."is_admin"()));

CREATE POLICY "Allow public read access for published series_posts" ON "public"."series_posts" FOR SELECT USING ((("status" = 'published'::"text") OR "public"."is_admin"()));

CREATE POLICY "Allow public read access for series_post_tags" ON "public"."series_post_tags" FOR SELECT USING (true);

CREATE POLICY "Article tags public read" ON "public"."article_tags" FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON "public"."comments" FOR INSERT WITH CHECK ((("auth"."uid"() = "user_id") AND (EXISTS ( SELECT 1
   FROM "public"."articles" "b"
  WHERE (("b"."id" = "comments"."article_id") AND ("b"."status" = 'published'::"text"))))));

CREATE POLICY "Categories public read" ON "public"."categories" FOR SELECT USING (true);

CREATE POLICY "Comments public read" ON "public"."comments" FOR SELECT USING (true);

CREATE POLICY "Published articles public read" ON "public"."articles" FOR SELECT USING ((("status" = 'published'::"text") OR "public"."is_admin"()));

CREATE POLICY "Tags public read" ON "public"."tags" FOR SELECT USING (true);

CREATE POLICY "Users can view users" ON "public"."superadmins" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));

ALTER TABLE "public"."app_settings" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."article_tags" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."articles" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."post_series" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."series" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."series_post_tags" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."series_posts" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."superadmins" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."tags" ENABLE ROW LEVEL SECURITY;

--
-- Dumped schema changes for auth and storage
--

CREATE OR REPLACE TRIGGER "on_auth_user_created" AFTER INSERT ON "auth"."users" FOR EACH ROW EXECUTE FUNCTION "public"."handle_auth_user_created"();

ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS likes_count integer DEFAULT 0;

ALTER TABLE public.series_posts ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0;
ALTER TABLE public.series_posts ADD COLUMN IF NOT EXISTS likes_count integer DEFAULT 0;
